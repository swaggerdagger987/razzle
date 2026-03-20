/**
 * Razzle Browse — Browser Automation for QA + Ship Agents
 *
 * Commands:
 *   load, text, click, count, visible, screenshot, snap, visual, full, script, errors
 *   baseline    — save golden screenshots for regression comparison
 *   diff        — compare current page against golden baseline
 *   cleanup     — delete screenshots older than 24 hours
 *
 * Environment:
 *   RAZZLE_URL=http://localhost:8000   (default, dev)
 *   RAZZLE_URL=https://razzle.lol      (prod — set this to test live)
 *
 * Session persistence:
 *   --profile flag saves cookies/localStorage between runs.
 *   node browse.js --profile load "lab.html"   ← persists auth across calls
 *
 * Both agents use this: QA for finding, Ship for verifying fixes.
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE_URL = process.env.RAZZLE_URL || 'http://localhost:8000';
const QA_DIR = path.join(__dirname);
const SCREENSHOTS_DIR = path.join(QA_DIR, 'screenshots');
const BASELINES_DIR = path.join(QA_DIR, 'baselines');
const PROFILE_DIR = path.join(QA_DIR, '.browser-profile');

// Ensure directories exist
for (const dir of [SCREENSHOTS_DIR, BASELINES_DIR]) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

async function main() {
    let argv = process.argv.slice(2);

    // Parse --profile flag
    const useProfile = argv.includes('--profile');
    argv = argv.filter(a => a !== '--profile');

    const [command, ...args] = argv;

    if (!command) {
        console.log('Usage: node browse.js [--profile] <command> [args]');
        console.log('Commands: load, text, click, count, visible, screenshot, snap, visual, full, script, errors, baseline, diff, cleanup');
        console.log('Env: RAZZLE_URL (default: http://localhost:8000)');
        process.exit(1);
    }

    // Launch browser with optional persistent profile (for auth/cookies)
    const launchOpts = { headless: true };
    let context;
    let browser;

    if (useProfile) {
        // Persistent context — cookies, localStorage, auth survive across runs
        if (!fs.existsSync(PROFILE_DIR)) fs.mkdirSync(PROFILE_DIR, { recursive: true });
        browser = await chromium.launch(launchOpts);
        context = await browser.newContext({
            viewport: { width: 1280, height: 800 },
            userAgent: 'RazzleQA/1.0',
            storageState: fs.existsSync(path.join(PROFILE_DIR, 'state.json'))
                ? path.join(PROFILE_DIR, 'state.json')
                : undefined,
        });
    } else {
        browser = await chromium.launch(launchOpts);
        context = await browser.newContext({
            viewport: { width: 1280, height: 800 },
            userAgent: 'RazzleQA/1.0',
        });
    }

    const page = await context.newPage();

    // Capture console errors
    const consoleErrors = [];
    const pageErrors = [];
    page.on('console', msg => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    page.on('pageerror', err => pageErrors.push(err.message));

    // Helper: resolve URL
    const resolveUrl = (u) => {
        if (!u) return BASE_URL;
        return u.startsWith('http') ? u : `${BASE_URL}/${u.replace(/^\//, '')}`;
    };

    // Helper: generate slug from URL
    const urlSlug = (u) => {
        return u.replace(/https?:\/\//, '').replace(/[^a-z0-9]/gi, '-').replace(/-+/g, '-').slice(0, 40);
    };

    // Helper: screenshot path
    const shotPath = (name) => path.join(SCREENSHOTS_DIR, name);
    const baselinePath = (name) => path.join(BASELINES_DIR, name);

    try {
        switch (command) {

            case 'load': {
                const resp = await page.goto(resolveUrl(args[0]), { waitUntil: 'domcontentloaded', timeout: 15000 });
                console.log(`STATUS: ${resp.status()}`);
                console.log(`URL: ${page.url()}`);
                console.log(`TITLE: ${await page.title()}`);
                await page.waitForTimeout(2000);
                if (consoleErrors.length > 0) {
                    console.log(`JS_ERRORS: ${consoleErrors.length}`);
                    consoleErrors.forEach(e => console.log(`  ERROR: ${e.substring(0, 200)}`));
                }
                break;
            }

            case 'text': {
                const selector = args[0];
                if (!selector) { console.log('ERROR: need a selector'); break; }
                if (page.url() === 'about:blank') {
                    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 15000 });
                    await page.waitForTimeout(2000);
                }
                const el = await page.$(selector);
                if (el) {
                    const text = await el.textContent();
                    console.log(`TEXT: ${text.trim().substring(0, 2000)}`);
                } else {
                    console.log(`NOT_FOUND: ${selector}`);
                }
                break;
            }

            case 'click': {
                const selector = args[0];
                if (!selector) { console.log('ERROR: need a selector'); break; }
                const el = await page.$(selector);
                if (el) {
                    await el.click();
                    await page.waitForTimeout(1000);
                    console.log(`CLICKED: ${selector}`);
                } else {
                    console.log(`NOT_FOUND: ${selector}`);
                }
                break;
            }

            case 'count': {
                const selector = args[0];
                if (!selector) { console.log('ERROR: need a selector'); break; }
                if (page.url() === 'about:blank') {
                    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 15000 });
                    await page.waitForTimeout(2000);
                }
                const elements = await page.$$(selector);
                console.log(`COUNT: ${elements.length} elements matching "${selector}"`);
                break;
            }

            case 'visible': {
                const selector = args[0];
                if (!selector) { console.log('ERROR: need a selector'); break; }
                const el = await page.$(selector);
                if (el) {
                    const isVisible = await el.isVisible();
                    console.log(`VISIBLE: ${isVisible} (${selector})`);
                } else {
                    console.log(`NOT_FOUND: ${selector}`);
                }
                break;
            }

            case 'screenshot': {
                const filename = args[0] || 'screenshot.png';
                const fp = shotPath(filename);
                await page.screenshot({ path: fp, fullPage: false });
                console.log(`SCREENSHOT: ${fp}`);
                break;
            }

            case 'snap': {
                // Two screenshots for animation detection
                const prefix = args[0] || 'snap';
                const delayMs = parseInt(args[1]) || 500;
                const url = args[2];

                if (page.url() === 'about:blank' || url) {
                    await page.goto(resolveUrl(url), { waitUntil: 'domcontentloaded', timeout: 15000 });
                    await page.waitForTimeout(3000);
                }

                const p1 = shotPath(`${prefix}-1.png`);
                const p2 = shotPath(`${prefix}-2.png`);
                await page.screenshot({ path: p1, fullPage: false });
                await page.waitForTimeout(delayMs);
                await page.screenshot({ path: p2, fullPage: false });
                console.log(`SNAP_1: ${p1}`);
                console.log(`SNAP_2: ${p2} (${delayMs}ms later)`);
                console.log(`COMPARE: Read both PNGs to check for blinking/flickering`);
                break;
            }

            case 'visual': {
                const url = resolveUrl(args[0]);
                const slug = urlSlug(url);

                console.log(`=== VISUAL AUDIT: ${url} ===`);

                const resp = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
                console.log(`STATUS: ${resp.status()}`);
                await page.waitForTimeout(3000);

                // Default state
                const defaultShot = shotPath(`${slug}-default.png`);
                await page.screenshot({ path: defaultShot, fullPage: false });
                console.log(`SCREENSHOT_DEFAULT: ${defaultShot}`);

                // Full page
                const fullShot = shotPath(`${slug}-full.png`);
                await page.screenshot({ path: fullShot, fullPage: true });
                console.log(`SCREENSHOT_FULL: ${fullShot}`);

                // Dark mode
                const dmToggle = await page.$('[class*="dark"], [class*="theme"], button[aria-label*="dark" i], button[aria-label*="theme" i], #dark-mode, .theme-toggle');
                if (dmToggle) {
                    await dmToggle.click();
                    await page.waitForTimeout(1000);
                    const darkShot = shotPath(`${slug}-dark.png`);
                    await page.screenshot({ path: darkShot, fullPage: false });
                    console.log(`SCREENSHOT_DARK: ${darkShot}`);
                    await dmToggle.click();
                    await page.waitForTimeout(500);
                }

                // Animation detection
                const a1 = shotPath(`${slug}-anim1.png`);
                const a2 = shotPath(`${slug}-anim2.png`);
                await page.screenshot({ path: a1, fullPage: false });
                await page.waitForTimeout(500);
                await page.screenshot({ path: a2, fullPage: false });
                console.log(`ANIMATION: ${a1} and ${a2}`);

                // JS errors
                console.log(`JS_ERRORS: ${consoleErrors.length}`);
                consoleErrors.forEach(e => console.log(`  ERROR: ${e.substring(0, 200)}`));

                // Element summary
                const checks = [
                    ['buttons', 'button'], ['links', 'a[href]'], ['inputs', 'input'],
                    ['player_rows', 'tr.player-row, [data-player], .player-row'],
                    ['empty_panels', '.empty, [class*="empty"], .no-data'],
                    ['loading_states', '.loading, [class*="loading"], [class*="spinner"]'],
                    ['error_states', '.error, [class*="error"]:not(script)'],
                ];
                console.log('ELEMENTS:');
                for (const [name, sel] of checks) {
                    const c = (await page.$$(sel)).length;
                    if (c > 0) console.log(`  ${name}: ${c}`);
                }

                console.log(`=== END VISUAL AUDIT ===`);
                break;
            }

            case 'full': {
                const url = resolveUrl(args[0]);
                console.log(`=== FULL AUDIT: ${url} ===`);
                const resp = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
                console.log(`STATUS: ${resp.status()}`);
                console.log(`TITLE: ${await page.title()}`);
                await page.waitForTimeout(3000);

                console.log(`JS_ERRORS: ${consoleErrors.length}`);
                consoleErrors.forEach(e => console.log(`  ERROR: ${e.substring(0, 200)}`));
                console.log(`PAGE_CRASHES: ${pageErrors.length}`);
                pageErrors.forEach(e => console.log(`  CRASH: ${e.substring(0, 200)}`));

                const checks = [
                    ['links', 'a[href]'], ['buttons', 'button'], ['inputs', 'input'],
                    ['images', 'img'], ['tables', 'table'], ['table_rows', 'tr'],
                    ['scripts', 'script[src]'],
                    ['player_rows', 'tr.player-row, [data-player], .player-row'],
                    ['sidebar_items', '.sidebar a, .sidebar-item, [class*="sidebar"] a'],
                    ['modals', '.modal, [class*="modal"], [role="dialog"]'],
                    ['loading_indicators', '.loading, [class*="loading"], [class*="spinner"]'],
                ];
                console.log('ELEMENTS:');
                for (const [name, sel] of checks) {
                    const c = (await page.$$(sel)).length;
                    if (c > 0) console.log(`  ${name}: ${c}`);
                }

                const brokenImages = await page.evaluate(() =>
                    Array.from(document.querySelectorAll('img'))
                        .filter(img => !img.complete || img.naturalWidth === 0)
                        .map(img => img.src).slice(0, 5)
                );
                if (brokenImages.length > 0) {
                    console.log(`BROKEN_IMAGES: ${brokenImages.length}`);
                    brokenImages.forEach(src => console.log(`  ${src}`));
                }

                const bodyText = await page.evaluate(() =>
                    document.body?.innerText?.substring(0, 500) || '(empty body)'
                );
                console.log(`BODY_PREVIEW: ${bodyText.substring(0, 300).replace(/\n/g, ' | ')}`);
                console.log(`=== END AUDIT ===`);
                break;
            }

            // ---------------------------------------------------------------
            // BASELINE — save golden screenshots for regression comparison
            // Usage: node browse.js baseline "lab.html"
            //        node browse.js baseline  (saves all key pages)
            // ---------------------------------------------------------------
            case 'baseline': {
                const pages = args.length > 0
                    ? [args[0]]
                    : ['', 'lab.html', 'league-intel.html', 'agents.html', 'pricing.html', 'about.html'];

                console.log(`=== SAVING BASELINES ===`);
                console.log(`Target: ${BASE_URL}`);

                for (const pg of pages) {
                    const url = resolveUrl(pg);
                    const slug = urlSlug(url);

                    try {
                        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
                        await page.waitForTimeout(3000);

                        const bp = baselinePath(`${slug}.png`);
                        await page.screenshot({ path: bp, fullPage: false });
                        console.log(`BASELINE: ${bp}`);
                    } catch (e) {
                        console.log(`FAILED: ${url} — ${e.message}`);
                    }
                }

                console.log(`=== BASELINES SAVED ===`);
                console.log(`These are the "known good" state. Use 'diff' to compare against them.`);
                break;
            }

            // ---------------------------------------------------------------
            // DIFF — compare current page against baseline
            // Usage: node browse.js diff "lab.html"
            // Takes a fresh screenshot and reports size difference vs baseline.
            // Agent then reads both images to visually compare.
            // ---------------------------------------------------------------
            case 'diff': {
                const pg = args[0] || '';
                const url = resolveUrl(pg);
                const slug = urlSlug(url);
                const bp = baselinePath(`${slug}.png`);

                if (!fs.existsSync(bp)) {
                    console.log(`NO_BASELINE: ${bp} — run 'baseline' first for this page`);
                    break;
                }

                await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
                await page.waitForTimeout(3000);

                const currentPath = shotPath(`diff-${slug}-current.png`);
                await page.screenshot({ path: currentPath, fullPage: false });

                // Size comparison as a rough proxy for visual change
                const baselineSize = fs.statSync(bp).size;
                const currentSize = fs.statSync(currentPath).size;
                const sizeDelta = Math.abs(currentSize - baselineSize);
                const pctChange = ((sizeDelta / baselineSize) * 100).toFixed(1);

                console.log(`BASELINE: ${bp} (${(baselineSize / 1024).toFixed(1)}KB)`);
                console.log(`CURRENT:  ${currentPath} (${(currentSize / 1024).toFixed(1)}KB)`);
                console.log(`DELTA: ${pctChange}% size change`);

                if (parseFloat(pctChange) > 15) {
                    console.log(`WARNING: >15% size change — likely significant visual difference`);
                    console.log(`RECOMMENDATION: Read both PNGs to compare visually`);
                } else if (parseFloat(pctChange) > 5) {
                    console.log(`NOTE: Minor visual change detected (${pctChange}%)`);
                } else {
                    console.log(`OK: Visually stable (<5% change)`);
                }

                console.log(`\nTo compare: Read ${bp} and ${currentPath} with Read tool`);
                break;
            }

            // ---------------------------------------------------------------
            // CLEANUP — delete screenshots older than 24 hours
            // ---------------------------------------------------------------
            case 'cleanup': {
                const maxAge = 24 * 60 * 60 * 1000; // 24 hours
                const now = Date.now();
                let deleted = 0;

                for (const file of fs.readdirSync(SCREENSHOTS_DIR)) {
                    const fp = path.join(SCREENSHOTS_DIR, file);
                    const stat = fs.statSync(fp);
                    if (now - stat.mtimeMs > maxAge) {
                        fs.unlinkSync(fp);
                        deleted++;
                    }
                }

                console.log(`CLEANUP: deleted ${deleted} screenshots older than 24h`);
                console.log(`Baselines preserved in: ${BASELINES_DIR}`);
                break;
            }

            case 'errors': {
                if (page.url() === 'about:blank') {
                    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 15000 });
                    await page.waitForTimeout(3000);
                }
                console.log(`CONSOLE_ERRORS: ${consoleErrors.length}`);
                consoleErrors.forEach(e => console.log(`  ${e.substring(0, 200)}`));
                console.log(`PAGE_ERRORS: ${pageErrors.length}`);
                pageErrors.forEach(e => console.log(`  ${e.substring(0, 200)}`));
                break;
            }

            case 'script': {
                const scriptJson = args[0];
                if (!scriptJson) { console.log('ERROR: need JSON array of actions'); break; }

                let actions;
                try { actions = JSON.parse(scriptJson); }
                catch (e) { console.log(`ERROR: invalid JSON: ${e.message}`); break; }

                for (let i = 0; i < actions.length; i++) {
                    const act = actions[i];
                    console.log(`STEP ${i + 1}: ${act.action} ${act.selector || act.url || act.ms || ''}`);

                    switch (act.action) {
                        case 'load': {
                            const r = await page.goto(resolveUrl(act.url), { waitUntil: 'domcontentloaded', timeout: 15000 });
                            console.log(`  STATUS: ${r.status()}`);
                            await page.waitForTimeout(2000);
                            break;
                        }
                        case 'click': {
                            const el = await page.$(act.selector);
                            if (el) { await el.click(); console.log(`  CLICKED`); }
                            else console.log(`  NOT_FOUND: ${act.selector}`);
                            await page.waitForTimeout(act.wait || 500);
                            break;
                        }
                        case 'type': {
                            const el = await page.$(act.selector);
                            if (el) { await el.fill(act.text); console.log(`  TYPED: ${act.text}`); }
                            else console.log(`  NOT_FOUND: ${act.selector}`);
                            break;
                        }
                        case 'wait':
                            await page.waitForTimeout(act.ms || 1000);
                            console.log(`  WAITED ${act.ms || 1000}ms`);
                            break;
                        case 'count': {
                            const els = await page.$$(act.selector);
                            console.log(`  COUNT: ${els.length}`);
                            break;
                        }
                        case 'text': {
                            const el = await page.$(act.selector);
                            if (el) console.log(`  TEXT: ${(await el.textContent()).trim().substring(0, 500)}`);
                            else console.log(`  NOT_FOUND: ${act.selector}`);
                            break;
                        }
                        case 'visible': {
                            const el = await page.$(act.selector);
                            if (el) console.log(`  VISIBLE: ${await el.isVisible()}`);
                            else console.log(`  NOT_FOUND: ${act.selector}`);
                            break;
                        }
                        case 'screenshot': {
                            const fn = act.filename || `step-${i + 1}.png`;
                            await page.screenshot({ path: shotPath(fn) });
                            console.log(`  SAVED: ${shotPath(fn)}`);
                            break;
                        }
                        case 'errors':
                            console.log(`  JS_ERRORS: ${consoleErrors.length}`);
                            consoleErrors.forEach(e => console.log(`    ${e.substring(0, 150)}`));
                            break;
                        default:
                            console.log(`  UNKNOWN: ${act.action}`);
                    }
                }
                break;
            }

            default:
                console.log(`Unknown command: ${command}`);
                console.log('Commands: load, text, click, count, visible, screenshot, snap, visual, full, script, errors, baseline, diff, cleanup');
        }
    } catch (e) {
        console.log(`FATAL: ${e.message}`);
    } finally {
        // Save profile state if using persistent sessions
        if (useProfile) {
            const statePath = path.join(PROFILE_DIR, 'state.json');
            await context.storageState({ path: statePath });
            console.log(`PROFILE: session saved to ${statePath}`);
        }
        await browser.close();
    }
}

main();
