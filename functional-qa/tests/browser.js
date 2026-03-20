/**
 * Razzle Browser Tests — Real Clicking, Real Seeing
 *
 * This is what turns fake code-reading into real functional testing.
 * Uses Playwright to load the actual site, click actual buttons,
 * and verify what actually happens on screen.
 *
 * Run: node functional-qa/tests/browser.js
 * Requires: npm install playwright && npx playwright install chromium
 *
 * Each test is a binary pass/fail — the val_bpb of UI testing.
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE_URL = process.env.RAZZLE_URL || 'http://localhost:8000';
const RESULTS_FILE = path.join(__dirname, '..', 'results.tsv');
const TIMEOUT = 15000;

const results = [];

function log(name, passed, detail, severity = 'OK', file = '-', line = '-', fn = '-') {
    results.push({ name, passed, detail, severity, file, line, fn });
    const icon = passed ? '+' : 'X';
    const sev = passed ? '' : ` [${severity}]`;
    console.log(`  [${icon}] ${name}: ${detail}${sev}`);
}

// ---------------------------------------------------------------------------
// TESTS — each one loads a real page and checks real things
// ---------------------------------------------------------------------------

async function testLandingLoads(page) {
    try {
        const resp = await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: TIMEOUT });
        if (resp.status() === 200) {
            const title = await page.title();
            log('landing_loads', true, `Landing page loads (${title})`);
        } else {
            log('landing_loads', false, `HTTP ${resp.status()}`, 'P1', 'frontend/index.html');
        }
    } catch (e) {
        log('landing_loads', false, `Failed to load: ${e.message}`, 'P0', 'frontend/index.html');
    }
}

async function testLabLoads(page) {
    try {
        const resp = await page.goto(`${BASE_URL}/lab.html`, { waitUntil: 'domcontentloaded', timeout: TIMEOUT });
        if (resp.status() !== 200) {
            log('lab_loads', false, `HTTP ${resp.status()}`, 'P0', 'frontend/lab.html');
            return;
        }
        // Wait for the screener table to populate
        await page.waitForTimeout(3000);
        const rows = await page.$$('tr, .player-row, [data-player]');
        if (rows.length > 0) {
            log('lab_loads', true, `Lab loads with ${rows.length} player rows`);
        } else {
            // Check if there's a loading indicator still showing
            const loading = await page.$('.loading, [class*="loading"], [class*="spinner"]');
            if (loading) {
                log('lab_loads', false, 'Lab stuck in loading state after 3s', 'P1', 'frontend/lab.js', '-', 'fetchPlayers');
            } else {
                log('lab_loads', false, 'Lab loaded but no player rows visible', 'P1', 'frontend/lab.js');
            }
        }
    } catch (e) {
        log('lab_loads', false, `Failed: ${e.message}`, 'P0', 'frontend/lab.html');
    }
}

async function testDarkModeToggle(page) {
    try {
        await page.goto(`${BASE_URL}/lab.html`, { waitUntil: 'domcontentloaded', timeout: TIMEOUT });
        await page.waitForTimeout(1000);

        // Find dark mode toggle
        const toggle = await page.$('[class*="dark"], [class*="theme"], [id*="dark"], [id*="theme"], button[aria-label*="dark" i], button[aria-label*="theme" i]');
        if (!toggle) {
            log('dark_mode_toggle', false, 'No dark mode toggle found', 'P2', 'frontend/app.js', '-', 'toggleDarkMode');
            return;
        }

        const bgBefore = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
        await toggle.click();
        await page.waitForTimeout(500);
        const bgAfter = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);

        if (bgBefore !== bgAfter) {
            log('dark_mode_toggle', true, `Background changed: ${bgBefore} → ${bgAfter}`);
        } else {
            log('dark_mode_toggle', false, 'Background unchanged after toggle click', 'P1', 'frontend/app.js', '-', 'toggleDarkMode');
        }
    } catch (e) {
        log('dark_mode_toggle', false, `Error: ${e.message}`, 'P2', 'frontend/app.js');
    }
}

async function testSidebarNavigation(page) {
    try {
        await page.goto(`${BASE_URL}/lab.html`, { waitUntil: 'domcontentloaded', timeout: TIMEOUT });
        await page.waitForTimeout(2000);

        // Find sidebar items
        const sidebarItems = await page.$$('.sidebar a, .sidebar-item, .sidebar li a, [class*="sidebar"] a');
        if (sidebarItems.length === 0) {
            log('sidebar_nav', false, 'No sidebar items found', 'P1', 'frontend/lab.html');
            return;
        }

        let clickable = 0;
        let dead = 0;
        for (let i = 0; i < Math.min(sidebarItems.length, 5); i++) {
            try {
                const text = await sidebarItems[i].textContent();
                await sidebarItems[i].click();
                await page.waitForTimeout(500);
                clickable++;
            } catch {
                dead++;
            }
        }

        if (dead === 0) {
            log('sidebar_nav', true, `${clickable} sidebar items clicked successfully`);
        } else {
            log('sidebar_nav', false, `${dead}/${clickable + dead} sidebar items failed to click`, 'P1', 'frontend/lab.html');
        }
    } catch (e) {
        log('sidebar_nav', false, `Error: ${e.message}`, 'P1', 'frontend/lab.html');
    }
}

async function testSearchInput(page) {
    try {
        await page.goto(`${BASE_URL}/lab.html`, { waitUntil: 'domcontentloaded', timeout: TIMEOUT });
        await page.waitForTimeout(2000);

        // Find search input
        const search = await page.$('input[type="search"], input[type="text"][placeholder*="search" i], input[placeholder*="player" i], #search, .search-input');
        if (!search) {
            log('search_input', false, 'No search input found', 'P2', 'frontend/lab.html');
            return;
        }

        await search.fill('Mahomes');
        await page.waitForTimeout(1000);

        // Check if results filtered
        const pageContent = await page.content();
        if (pageContent.toLowerCase().includes('mahomes')) {
            log('search_input', true, 'Search for "Mahomes" shows results containing Mahomes');
        } else {
            log('search_input', false, 'Search for "Mahomes" shows no matching results', 'P1',
                'frontend/lab.js', '-', 'handleSearch');
        }
    } catch (e) {
        log('search_input', false, `Error: ${e.message}`, 'P1', 'frontend/lab.js');
    }
}

async function testNoConsoleErrors(page) {
    const errors = [];
    page.on('console', msg => {
        if (msg.type() === 'error') errors.push(msg.text());
    });
    page.on('pageerror', err => errors.push(err.message));

    try {
        await page.goto(`${BASE_URL}/lab.html`, { waitUntil: 'domcontentloaded', timeout: TIMEOUT });
        await page.waitForTimeout(3000);

        if (errors.length === 0) {
            log('no_console_errors', true, 'No JS console errors on Lab load');
        } else {
            const unique = [...new Set(errors)];
            log('no_console_errors', false,
                `${unique.length} JS error(s): ${unique[0].substring(0, 100)}`,
                'P1', 'frontend/lab.js');
        }
    } catch (e) {
        log('no_console_errors', false, `Page load failed: ${e.message}`, 'P0');
    }
}

async function testModalCloses(page) {
    try {
        await page.goto(`${BASE_URL}/lab.html`, { waitUntil: 'domcontentloaded', timeout: TIMEOUT });
        await page.waitForTimeout(2000);

        // Try to find and open a modal (filter, column picker, etc.)
        const modalTrigger = await page.$('button[class*="filter"], button[class*="column"], [data-modal], .add-filter, #add-filter');
        if (!modalTrigger) {
            log('modal_closes', true, 'No modal trigger found to test (skip)');
            return;
        }

        await modalTrigger.click();
        await page.waitForTimeout(500);

        // Check if a modal appeared
        const modal = await page.$('.modal, [class*="modal"], [role="dialog"], .overlay');
        if (!modal) {
            log('modal_closes', true, 'No modal appeared (might be inline UI)');
            return;
        }

        // Try to close with Escape
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);

        const modalAfter = await page.$('.modal:visible, [class*="modal"]:visible, [role="dialog"]:visible');
        // Check if modal is still in DOM but hidden
        const stillVisible = modalAfter ? await modalAfter.isVisible().catch(() => false) : false;

        if (!stillVisible) {
            log('modal_closes', true, 'Modal closes on Escape key');
        } else {
            log('modal_closes', false, 'Modal does NOT close on Escape', 'P2',
                'frontend/lab.js', '-', 'modal');
        }
    } catch (e) {
        log('modal_closes', false, `Error: ${e.message}`, 'P2');
    }
}

async function testPricingPage(page) {
    try {
        const resp = await page.goto(`${BASE_URL}/pricing.html`, { waitUntil: 'domcontentloaded', timeout: TIMEOUT });
        if (resp.status() !== 200) {
            log('pricing_loads', false, `HTTP ${resp.status()}`, 'P1', 'frontend/pricing.html');
            return;
        }

        // Check for pricing tiers
        const content = await page.content();
        const hasPro = content.toLowerCase().includes('pro');
        const hasPrice = /\$\d+/.test(content);
        const hasCta = await page.$('a[href*="stripe"], a[href*="checkout"], button[class*="cta"], .cta, [class*="subscribe"]');

        if (hasPro && hasPrice) {
            log('pricing_loads', true, `Pricing page shows plans with prices${hasCta ? ' and CTAs' : ''}`);
        } else {
            log('pricing_loads', false,
                `Missing: ${hasPro ? '' : 'plan names '}${hasPrice ? '' : 'prices '}`,
                'P1', 'frontend/pricing.html');
        }
    } catch (e) {
        log('pricing_loads', false, `Error: ${e.message}`, 'P1', 'frontend/pricing.html');
    }
}


// ---------------------------------------------------------------------------
// Runner
// ---------------------------------------------------------------------------

async function main() {
    console.log(`=== Razzle Browser Tests — ${new Date().toISOString().slice(0, 16)} ===`);
    console.log(`Target: ${BASE_URL}`);
    console.log();

    let browser;
    try {
        browser = await chromium.launch({ headless: true });
    } catch (e) {
        console.error('Failed to launch browser. Run: npm install playwright && npx playwright install chromium');
        process.exit(1);
    }

    const context = await browser.newContext({
        viewport: { width: 1280, height: 800 },
        userAgent: 'RazzleQA/1.0',
    });

    const page = await context.newPage();

    // Run all tests sequentially (they share the page)
    const tests = [
        testLandingLoads,
        testLabLoads,
        testNoConsoleErrors,
        testSearchInput,
        testSidebarNavigation,
        testDarkModeToggle,
        testModalCloses,
        testPricingPage,
    ];

    for (const testFn of tests) {
        await testFn(page);
    }

    await browser.close();

    // Summary
    const passed = results.filter(r => r.passed).length;
    const failed = results.filter(r => !r.passed).length;
    console.log();
    console.log(`Results: ${passed}/${results.length} passed, ${failed} failed`);

    // Append to results.tsv
    const header = 'flow\tseverity\tfile\tline\tfunction\tstatus\tdescription\n';
    const headerNeeded = !fs.existsSync(RESULTS_FILE);
    const rows = results.map(r => {
        const status = r.passed ? 'pass' : 'ticket';
        const desc = `browser:${r.name} — ${r.detail}`.replace(/\t/g, ' ').replace(/\n/g, ' ');
        return `browser\t${r.severity}\t${r.file}\t${r.line}\t${r.fn}\t${status}\t${desc}`;
    }).join('\n') + '\n';

    fs.appendFileSync(RESULTS_FILE, (headerNeeded ? header : '') + rows);

    process.exit(failed > 0 ? 1 : 0);
}

main().catch(e => {
    console.error('Fatal:', e);
    process.exit(1);
});
