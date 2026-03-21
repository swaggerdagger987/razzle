/* Razzle — shared utilities */

/* ===== Theme Toggle (Espresso Dark Mode) ===== */
(function initTheme() {
  try {
    var saved = localStorage.getItem("razzle_theme");
    if (saved === "dark") document.documentElement.setAttribute("data-theme", "dark");
  } catch (e) {}
})();

function toggleTheme() {
  var html = document.documentElement;
  var isDark = html.getAttribute("data-theme") === "dark";
  if (isDark) {
    html.removeAttribute("data-theme");
    try { localStorage.setItem("razzle_theme", "light"); } catch (e) {}
  } else {
    html.setAttribute("data-theme", "dark");
    try { localStorage.setItem("razzle_theme", "dark"); } catch (e) {}
  }
}

function _injectThemeToggle() {
  var nav = document.querySelector(".topnav");
  if (!nav || document.querySelector(".theme-toggle")) return;
  var btn = document.createElement("button");
  btn.className = "theme-toggle";
  btn.setAttribute("aria-label", "Toggle dark mode");
  btn.title = "Toggle dark mode";
  var isDark = document.documentElement.getAttribute("data-theme") === "dark";
  btn.textContent = isDark ? "\u2600" : "\u263D";
  btn.addEventListener("click", function() {
    toggleTheme();
    var nowDark = document.documentElement.getAttribute("data-theme") === "dark";
    btn.textContent = nowDark ? "\u2600" : "\u263D";
  });
  nav.appendChild(btn);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", _injectThemeToggle);
} else {
  _injectThemeToggle();
}

/* ===== Canvas Theme Helper (dark mode palette for canvas draws) ===== */
function getCanvasTheme() {
  var isDark = document.documentElement.getAttribute("data-theme") === "dark";
  return {
    bg: isDark ? "#2d1f14" : "#ede0cf",
    bgWarm: isDark ? "#3b2821" : "#e5d5c3",
    bgCard: isDark ? "#4a3728" : "#f7efe5",
    ink: isDark ? "#ede0cf" : "#2d1f14",
    inkMedium: isDark ? "#c4b5a5" : "#5c4a3d",
    inkLight: isDark ? "#8a7565" : "#8a7565",
    inkFaint: isDark ? "#5c4a3d" : "#c4b5a5",
    white: isDark ? "#ede0cf" : "#fff",
    gridLine: isDark ? "rgba(237,224,207,0.12)" : "rgba(45,31,20,0.12)",
    subtitleAlpha: isDark ? "rgba(237,224,207,0.5)" : "rgba(45,31,20,0.5)",
    isDark: isDark
  };
}

/* ===== Mobile Hamburger Menu ===== */

function _injectHamburgerMenu() {
  var nav = document.querySelector(".topnav");
  if (!nav || document.querySelector(".hamburger-toggle")) return;

  // Create hamburger toggle button
  var btn = document.createElement("button");
  btn.className = "hamburger-toggle";
  btn.setAttribute("aria-label", "Open navigation menu");
  btn.setAttribute("aria-expanded", "false");
  btn.textContent = "\uD83D\uDC3E"; // 🐾
  var logo = nav.querySelector(".logo");
  nav.insertBefore(btn, logo ? logo.nextSibling : nav.firstChild);

  // Create overlay backdrop
  var overlay = document.createElement("div");
  overlay.className = "mobile-nav-overlay";
  document.body.appendChild(overlay);

  // Create slide-out panel
  var panel = document.createElement("div");
  panel.className = "mobile-nav-panel";

  // Determine current page for active link
  var path = window.location.pathname;
  function isActive(href) {
    if (href === "/") return path === "/" || path === "/index.html";
    return path === href;
  }

  var links = [
    { href: "/", label: "Home" },
    { href: "/lab.html", label: "Screener" },
    { href: "/league-intel.html", label: "Bureau" },
    { href: "/agents.html", label: "Situation Room" },
    { href: "/pricing.html", label: "Pricing" }
  ];

  var panelHTML = '<div class="mobile-nav-header">' +
    '<div class="logo-mark" style="width:32px;height:32px;font-size:18px;">\uD83D\uDC2F</div>' +
    '<div class="logo-text">Razzle<span class="accent">.lol</span></div>' +
    '<button class="mobile-nav-close" aria-label="Close navigation menu">\u2715</button>' +
  '</div>' +
  '<div class="mobile-nav-links">';

  for (var i = 0; i < links.length; i++) {
    var cls = isActive(links[i].href) ? ' mobile-nav-active' : '';
    panelHTML += '<a href="' + links[i].href + '" class="mobile-nav-link' + cls + '">' + links[i].label + '</a>';
  }

  panelHTML += '</div>' +
  '<div class="mobile-nav-footer">' +
    '<div class="mobile-nav-actions" id="mobile-nav-actions"></div>' +
  '</div>';

  panel.innerHTML = panelHTML;
  document.body.appendChild(panel);

  // Inject theme toggle into mobile panel footer
  var actions = panel.querySelector("#mobile-nav-actions");
  var themeBtn = document.createElement("button");
  themeBtn.className = "btn-chunky btn-sm mobile-nav-theme";
  var isDark = document.documentElement.getAttribute("data-theme") === "dark";
  themeBtn.textContent = isDark ? "\u2600 Light Mode" : "\u263D Dark Mode";
  themeBtn.addEventListener("click", function() {
    toggleTheme();
    var nowDark = document.documentElement.getAttribute("data-theme") === "dark";
    themeBtn.textContent = nowDark ? "\u2600 Light Mode" : "\u263D Dark Mode";
    // Sync the desktop toggle
    var desktopToggle = document.querySelector(".topnav > .theme-toggle");
    if (desktopToggle) desktopToggle.textContent = nowDark ? "\u2600" : "\u263D";
  });
  actions.appendChild(themeBtn);

  // Sign in placeholder — will be updated by auth
  var signInBtn = document.createElement("a");
  signInBtn.href = "#";
  signInBtn.className = "btn-chunky btn-sm mobile-nav-signin";
  signInBtn.id = "mobileNavSignIn";
  signInBtn.textContent = "Sign In";
  signInBtn.addEventListener("click", function(e) {
    e.preventDefault();
    _closeMobileNav();
    openAuthModal();
  });
  actions.appendChild(signInBtn);

  function _openMobileNav() {
    panel.classList.add("open");
    overlay.classList.add("open");
    btn.setAttribute("aria-expanded", "true");
    // Update sign-in state
    _updateMobileAuthState();
  }

  function _closeMobileNav() {
    panel.classList.remove("open");
    overlay.classList.remove("open");
    btn.setAttribute("aria-expanded", "false");
  }

  btn.addEventListener("click", function() {
    if (panel.classList.contains("open")) {
      _closeMobileNav();
    } else {
      _openMobileNav();
    }
  });

  overlay.addEventListener("click", _closeMobileNav);

  panel.querySelector(".mobile-nav-close").addEventListener("click", _closeMobileNav);

  // Close on Escape
  document.addEventListener("keydown", function(e) {
    if (e.key === "Escape" && panel.classList.contains("open")) {
      _closeMobileNav();
    }
  });

  // Close when clicking a nav link
  var navLinks = panel.querySelectorAll(".mobile-nav-link");
  for (var j = 0; j < navLinks.length; j++) {
    navLinks[j].addEventListener("click", _closeMobileNav);
  }

  // Expose for auth updates
  window._updateMobileAuthState = _updateMobileAuthState;

  function _updateMobileAuthState() {
    var mobileSignIn = document.getElementById("mobileNavSignIn");
    if (!mobileSignIn) return;
    try {
      var user = JSON.parse(localStorage.getItem("razzle_user") || "null");
      if (user && user.email) {
        mobileSignIn.textContent = "Sign Out";
        mobileSignIn.onclick = function(e) {
          e.preventDefault();
          _closeMobileNav();
          signOut();
          window.location.reload();
        };
      } else {
        mobileSignIn.textContent = "Sign In";
        mobileSignIn.onclick = function(e) {
          e.preventDefault();
          _closeMobileNav();
          openAuthModal();
        };
      }
    } catch(e) {
      // localStorage parse failed — keep as Sign In
    }
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", _injectHamburgerMenu);
} else {
  _injectHamburgerMenu();
}

/* ===== Nav Dropdown Close Handler (module-level to avoid listener leaks) ===== */
var _dropdownCloseHandler = function(e) {
    var dd = document.querySelector(".nav-user-dropdown");
    if (dd && !dd.contains(e.target)) dd.classList.remove("open");
};

/* ===== Tier Gating Helpers ===== */

/**
 * Get the current user's plan: "free", "pro", or "elite".
 * Returns "free" if not logged in.
 */
function getUserPlan() {
  try {
    var u = JSON.parse(localStorage.getItem("razzle_user") || "null");
    return (u && u.plan) ? u.plan : "free";
  } catch (e) { return "free"; }
}

/** Returns true if user is on Pro or Elite plan (includes lifetime and trial). */
function isPaidUser() {
  var p = getUserPlan();
  return p === "pro" || p === "elite" || p === "pro_lifetime" || p === "elite_lifetime";
}

/** Returns true if user is on Elite plan (includes lifetime). */
function isEliteUser_global() {
  var p = getUserPlan();
  return p === "elite" || p === "elite_lifetime";
}

/**
 * Get the allowed season range for the current user.
 * All seasons are free for everyone — the data is the billboard.
 */
function getAllowedSeasons(allSeasons) {
  return allSeasons;
}

/**
 * Check if a feature is gated for the current user.
 * Returns { allowed: bool, limit: number|null, message: string }
 */
function checkFeatureGate(feature, currentCount) {
  var plan = getUserPlan().replace("_lifetime", "");
  var gates = {
    formulas: { free: 3, pro: Infinity, elite: Infinity },
    filters: { free: 3, pro: Infinity, elite: Infinity },
    compare: { free: 2, pro: 4, elite: 4 },
  };
  var gate = gates[feature];
  if (!gate) return { allowed: true, limit: null, message: "" };
  var limit = gate[plan] || gate.free;
  if (currentCount >= limit) {
    return {
      allowed: false,
      limit: limit,
      message: plan === "free"
        ? "Screener limit (" + limit + "). <a href='/pricing.html' style='color:var(--orange);text-decoration:underline;'>Subscribe to Pro</a> for unlimited."
        : "Plan limit reached (" + limit + ")."
    };
  }
  return { allowed: true, limit: limit, message: "" };
}

/**
 * Refresh all tier-gated UI elements. Called after plan changes (checkout return, login).
 */
function refreshPlanGating() {
  // Re-populate season selector
  if (typeof populateSeasonSelect === "function") populateSeasonSelect();

  // Re-render formula builder (update limit display)
  if (typeof renderSavedFormulas === "function") renderSavedFormulas();

  // Re-render column picker
  if (typeof renderColumnPicker === "function") renderColumnPicker();

  // Update query limit badge in Situation Room
  if (typeof updateQueryLimitBadge === "function") updateQueryLimitBadge();
  if (typeof syncQuotaFromServer === "function") syncQuotaFromServer();

  // Refresh Formula Store gating (if store overlay is open)
  if (typeof renderFormulaStore === "function") renderFormulaStore();

  // Update watchlist sync badge
  if (typeof syncWatchlistFromCloud === "function") syncWatchlistFromCloud();

  // Update nav auth UI to show new plan badge
  if (typeof checkAuth === "function") checkAuth();
}

/* ===== Tier-Aware CTA Helpers ===== */

/**
 * Get user tier info for CTA personalization.
 * Returns { plan, isTrial, isPaid, isElite, isExpiredTrial, daysLeft }
 */
function getUserTierInfo() {
  var u = null;
  try { u = JSON.parse(localStorage.getItem("razzle_user") || "null"); } catch(e) {}
  if (!u) return { plan: "none", isTrial: false, isPaid: false, isElite: false, isExpiredTrial: false, daysLeft: 0, loggedIn: false };
  var plan = u.plan || "free";
  var isTrial = !!(u.trial_active && u.plan_source === "trial");
  var isPaid = plan === "pro" || plan === "elite" || plan === "pro_lifetime" || plan === "elite_lifetime";
  var isElite = plan === "elite" || plan === "elite_lifetime";
  var isExpiredTrial = !!(u.plan_source === "trial" && !u.trial_active);
  var daysLeft = u.trial_days_remaining || 0;
  return { plan: plan, isTrial: isTrial, isPaid: isPaid, isElite: isElite, isExpiredTrial: isExpiredTrial, daysLeft: daysLeft, loggedIn: true };
}

/**
 * Get appropriate CTA text for a Pro upgrade button based on user tier.
 */
function getProCtaText() {
  var t = getUserTierInfo();
  if (!t.loggedIn) return "Sign Up Free";
  if (t.isExpiredTrial) return "Your trial ended. Subscribe to Pro";
  if (t.isTrial) return "Subscribe to keep Pro";
  if (t.isElite) return "Current Plan (Elite)";
  if (t.isPaid) return "Current Plan";
  return "Subscribe to Pro";
}

/**
 * Get appropriate CTA text for an Elite upgrade button based on user tier.
 */
function getEliteCtaText() {
  var t = getUserTierInfo();
  if (!t.loggedIn) return "Sign Up Free";
  if (t.isExpiredTrial) return "Your trial ended. Subscribe to Elite";
  if (t.isTrial) return "Subscribe to Elite";
  if (t.isElite) return "Current Plan";
  if (t.isPaid) return "Upgrade to Elite";
  return "Subscribe to Elite";
}

/**
 * Get trial status text (returns empty string if not relevant).
 */
function getTrialStatusText() {
  var t = getUserTierInfo();
  if (t.isTrial) return "You're on Pro (" + t.daysLeft + " day" + (t.daysLeft !== 1 ? "s" : "") + " left). Subscribe to keep Pro.";
  if (t.isExpiredTrial) return "Your trial ended. Subscribe to keep Pro.";
  return "";
}

/* ===== Brand Voice — Shared Vocabulary ===== */

var RAZZLE_ERRORS = [
  "fumbled the data fetch. Razzle's chasing it down \u2014 try again in a sec",
  "film room went dark. check your connection and give it another shot",
  "something went sideways. Razzle knocked the server off the table. refresh and we'll pretend it didn't happen",
  "interception on that request. the defense got to us first \u2014 retry?",
  "delay of game on the server. they're getting their act together \u2014 try refreshing",
  "connection dropped mid-play. Razzle's running it back \u2014 try again"
];

var RAZZLE_EMPTY = [
  "nobody home for this filter. everyone's got a down year",
  "the film room's empty. try loosening those filters",
  "zero matches \u2014 either your standards are elite or your filter's too tight",
  "Razzle checked everywhere. nothing matches. we're as surprised as you are",
  "clean pocket, no receivers open. try different filters",
  "the scouting report came back blank. adjust and try again"
];

var RAZZLE_LOADING = [
  "pulling film...",
  "checking the tape...",
  "running the numbers...",
  "consulting the analytics department...",
  "cross-referencing the scouting reports...",
  "Razzle's reviewing game tape...",
  "scanning the waiver wire...",
  "breaking down the all-22...",
  "crunching the combine data...",
  "studying the matchup charts...",
  "reviewing snap counts...",
  "calculating trade values...",
  "processing the depth chart...",
  "scouting the next breakout...",
  "analyzing target shares..."
];

function razzleError() { return RAZZLE_ERRORS[Math.floor(Math.random() * RAZZLE_ERRORS.length)]; }
function razzleEmpty() { return RAZZLE_EMPTY[Math.floor(Math.random() * RAZZLE_EMPTY.length)]; }
function razzleLoading() { return RAZZLE_LOADING[Math.floor(Math.random() * RAZZLE_LOADING.length)]; }

/* ===== Rarity Watermark — Random Character on Screenshots ===== */
var _wmAgentIcons = [
  "/assets/agents/razzle.svg", "/assets/agents/dolphin.svg",
  "/assets/agents/hawkeye.svg", "/assets/agents/bones.svg",
  "/assets/agents/octo.svg", "/assets/agents/atlas.svg"
];
var _wmImgCache = {};
(function() {
  for (var i = 0; i < _wmAgentIcons.length; i++) {
    var img = new Image();
    img.src = _wmAgentIcons[i];
    _wmImgCache[_wmAgentIcons[i]] = img;
  }
})();

function drawRazzleWatermark(ctx, canvas, opts) {
  opts = opts || {};
  var isDark = opts.isDark || (document.documentElement.dataset && document.documentElement.dataset.theme === "dark");
  var wmAlpha = isDark ? "rgba(237, 224, 207, 0.25)" : "rgba(45, 31, 20, 0.25)";
  var pick = _wmAgentIcons[Math.floor(Math.random() * _wmAgentIcons.length)];
  var img = _wmImgCache[pick];
  if (img && img.complete && img.naturalWidth > 0) {
    var sz = 32;
    ctx.globalAlpha = isDark ? 0.3 : 0.2;
    ctx.drawImage(img, canvas.width - 180, canvas.height - sz - 16, sz, sz);
    ctx.globalAlpha = 1.0;
  }
  ctx.fillStyle = wmAlpha;
  ctx.textAlign = "right";
  ctx.font = "600 28px Caveat, cursive";
  ctx.fillText("razzle.lol", canvas.width - 20, canvas.height - 30);
  if (opts.url) {
    var u = opts.url.replace(/^https?:\/\//, "");
    if (u.length > 60) u = u.substring(0, 57) + "...";
    ctx.font = '400 16px "Space Mono", monospace';
    ctx.fillText(u, canvas.width - 20, canvas.height - 12);
  }
}

/**
 * Show a toast notification. Available on all pages (defined in app.js).
 */
function _showToast(msg, type, duration, link) {
  var existing = document.querySelector('.razzle-toast');
  if (existing) existing.remove();
  var toast = document.createElement('div');
  toast.className = 'razzle-toast';
  if (type === 'warning') toast.style.borderColor = 'var(--orange)';
  if (type === 'error') toast.style.borderColor = 'var(--red)';
  toast.textContent = msg;
  if (link && link.href && link.text) {
    toast.appendChild(document.createTextNode(' '));
    var a = document.createElement('a');
    a.href = link.href;
    a.textContent = link.text;
    a.style.cssText = 'color:var(--orange);text-decoration:underline;';
    toast.appendChild(a);
  }
  document.body.appendChild(toast);
  setTimeout(function() { toast.classList.add('razzle-toast-show'); }, 10);
  setTimeout(function() {
    toast.classList.remove('razzle-toast-show');
    setTimeout(function() { toast.remove(); }, 300);
  }, duration || 2500);
}

function escapeHtml(str) {
  if (!str) return "";
  var d = document.createElement("div");
  d.textContent = String(str);
  return d.innerHTML;
}

function escapeAttr(str) {
  if (!str) return "";
  return String(str).replace(/&/g, "&amp;").replace(/'/g, "&#39;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** Escape a string for use inside a JavaScript string literal (e.g. inline onclick handlers). */
function escapeJS(str) {
  if (!str) return "";
  return String(str).replace(/\\/g, "\\\\").replace(/'/g, "\\'").replace(/"/g, '\\"').replace(/\n/g, "\\n").replace(/\r/g, "\\r");
}

const API_BASE = window.location.origin;

function getAuthHeaders() {
  try {
    const token = localStorage.getItem("razzle_token");
    return token ? { "Authorization": "Bearer " + token } : {};
  } catch(e) { return {}; }
}

async function apiFetch(path, options = {}) {
  const url = API_BASE + path;
  // Auto-include auth headers
  const authHeaders = getAuthHeaders();
  options.headers = Object.assign({}, authHeaders, options.headers || {});
  const resp = await fetch(url, options);
  if (resp.status === 401) {
    localStorage.removeItem("razzle_token");
    localStorage.removeItem("razzle_user");
    if (typeof openAuthModal === "function") openAuthModal();
    throw new Error("session expired. sign in again.");
  }
  if (!resp.ok) throw new Error("the server fumbled. try again in a sec.");
  try {
    return await resp.json();
  } catch (e) {
    throw new Error('Server returned non-JSON response');
  }
}

function formatStat(val, decimals = 1) {
  if (val === null || val === undefined) return "—";
  return Number(val).toFixed(decimals);
}

function posClass(pos) {
  return (pos || "").toLowerCase();
}

// Position color map for headshot fallback initials
var POS_COLOR_MAP = { QB: "#5b7fff", RB: "#2ec4b6", WR: "#d97757", TE: "#8b5cf6" };

function playerHeadshot(player, pos) {
  var url = player.headshot_url;
  var size = 28;
  var initials = ((player.full_name || player.player_name || "").split(" ").map(function(w) { return w[0] || ""; }).join("").substring(0, 2)).toUpperCase();
  var bgColor = POS_COLOR_MAP[pos] || "#8a7565";
  if (url) {
    var altText = escapeAttr((player.full_name || player.player_name || "") + " headshot");
    return '<img class="player-headshot" src="' + escapeAttr(url) + '" alt="' + altText + '" width="' + size + '" height="' + size + '" loading="lazy" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'flex\';">' +
           '<span class="player-headshot-fallback" style="display:none;background:' + bgColor + ';">' + escapeHtml(initials) + '</span>';
  }
  return '<span class="player-headshot-fallback" style="background:' + bgColor + ';">' + escapeHtml(initials) + '</span>';
}

function computeClientDVS(ppg, age, position) {
  if (!ppg || !age) return null;
  var prodScore = Math.min(100, ppg * 4);
  // Age curves must match live_data.py _DVS_AGE_CURVES exactly
  var curves = {
    QB:  { rise_start: 21, peak_start: 26, peak_end: 30, fall_end: 40 },
    RB:  { rise_start: 20, peak_start: 22, peak_end: 25, fall_end: 30 },
    WR:  { rise_start: 21, peak_start: 24, peak_end: 28, fall_end: 33 },
    TE:  { rise_start: 22, peak_start: 25, peak_end: 29, fall_end: 34 },
  };
  var c = curves[position] || curves.WR;
  var mult;
  if (age < c.rise_start) {
    mult = 0.7; // very young = still high upside
  } else if (age <= c.peak_start) {
    // Ramp up to peak
    var span = c.peak_start - c.rise_start;
    mult = 0.7 + 0.3 * ((age - c.rise_start) / Math.max(span, 1));
  } else if (age <= c.peak_end) {
    mult = 1.0; // peak years
  } else if (age >= c.fall_end) {
    mult = 0.1; // past prime
  } else {
    // Decline phase
    var dspan = c.fall_end - c.peak_end;
    mult = Math.max(0.1, 1.0 - 0.9 * ((age - c.peak_end) / Math.max(dspan, 1)));
  }
  mult = Math.max(0.1, Math.min(1.0, mult));
  return Math.round(prodScore * mult * 10) / 10;
}

/* ===== AUTH UI ===== */

function initAuth() {
  _injectAuthModal();
  _injectNavAuthButton();
  document.addEventListener("click", _dropdownCloseHandler);
  checkAuth();
  _detectCheckoutReturn();
}

/**
 * Detect Stripe checkout return (?session_id= in URL).
 * Poll for plan upgrade, then dispatch 'razzle-plan-changed' event.
 */
function _detectCheckoutReturn() {
  var params = new URLSearchParams(window.location.search);
  var sessionId = params.get("session_id");
  if (!sessionId) return;
  window._checkoutInProgress = true;

  // Clean URL — only remove session_id, preserve other params
  var cleanParams = new URLSearchParams(window.location.search);
  cleanParams.delete("session_id");
  var remaining = cleanParams.toString();
  var cleanUrl = window.location.pathname + (remaining ? "?" + remaining : "") + window.location.hash;
  window.history.replaceState({}, "", cleanUrl);

  // Show upgrade toast
  if (typeof _showToast === "function") {
    _showToast("processing your subscription...");
  }

  var token = localStorage.getItem("razzle_token");
  if (!token) return;

  // Stash pre-checkout plan state to detect real changes (not just trial)
  var prePlan = "";
  var prePlanSource = "";
  try {
    var preUser = JSON.parse(localStorage.getItem("razzle_user") || "{}");
    prePlan = preUser.plan || "free";
    prePlanSource = preUser.plan_source || "";
  } catch (e) {}

  var attempts = 0;
  var maxAttempts = 10;
  var pollInterval = 2000;

  function pollForPlanChange() {
    attempts++;
    fetch(API_BASE + "/api/auth/me", {
      headers: { "Authorization": "Bearer " + token }
    }).then(function(r) { if (!r.ok) throw new Error("poll failed"); return r.json(); }).then(function(data) {
      // Detect real plan change: plan upgraded OR plan_source changed from trial to stripe
      var planChanged = data.user && data.user.plan !== "free" && (
        data.user.plan !== prePlan ||
        (prePlanSource === "trial" && data.user.plan_source !== "trial")
      );
      if (planChanged) {
        // Plan updated — save and dispatch event
        localStorage.setItem("razzle_user", JSON.stringify(data.user));
        updateAuthUI(data.user);
        window.dispatchEvent(new CustomEvent("razzle-plan-changed", { detail: data.user }));
        _showWelcomeModal(data.user);
      } else if (attempts < maxAttempts) {
        setTimeout(pollForPlanChange, pollInterval);
      } else {
        // Give up after 10 polls — show clear error with next steps
        if (typeof _showToast === "function") {
          _showToast("still processing. if your plan doesn't activate within a few minutes, try refreshing the page or contact us.", "warning", 10000);
        }
      }
    }).catch(function() {
      if (attempts < maxAttempts) {
        setTimeout(pollForPlanChange, pollInterval);
      } else {
        if (typeof _showToast === "function") {
          _showToast("couldn't confirm your subscription. try refreshing the page. if the issue persists, your payment was received and we'll sort it out — reach out via the About page.", "error", 10000);
        }
      }
    });
  }

  setTimeout(pollForPlanChange, 1000);
}

function _showWelcomeModal(user) {
  // Only show once per checkout session
  if (sessionStorage.getItem("razzle_welcome_shown")) return;
  sessionStorage.setItem("razzle_welcome_shown", "1");

  var plan = (user.plan || "pro").replace("_lifetime", "");
  var isElite = plan.indexOf("elite") !== -1;
  var planLabel = isElite ? "Elite" : "Pro";
  var interval = user.billing_interval || "year";
  var price = isElite
    ? (interval === "year" ? "$149.99/year" : "$19.99/month")
    : (interval === "year" ? "$79.99/year" : "$9.99/month");

  var features = isElite
    ? [
        "All 60+ analytical panels",
        "Full Bureau deep-dive + league intelligence",
        "Situation Room with AI key included",
        "Unlimited formulas + cloud sync",
        "CSV export on every table",
      ]
    : [
        "All 60+ analytical panels",
        "Full Bureau deep-dive + league intelligence",
        "Situation Room (bring your own AI key)",
        "Unlimited formulas + cloud sync",
        "CSV export on every table",
      ];

  var overlay = document.createElement("div");
  var overlayBg = document.documentElement.getAttribute("data-theme") === "dark" ? "rgba(0,0,0,0.6)" : "rgba(45,31,20,0.6)";
  overlay.style.cssText = "position:fixed;inset:0;background:" + overlayBg + ";z-index:10000;display:flex;align-items:center;justify-content:center;padding:20px;";
  overlay.onclick = function(e) { if (e.target === overlay) overlay.remove(); };

  var featureHTML = features.map(function(f) {
    return '<li style="padding:4px 0;font-family:var(--font-mono);font-size:13px;color:var(--ink);">' + escapeHtml(f) + '</li>';
  }).join("");

  overlay.innerHTML =
    '<div style="background:var(--bg);border:3px solid var(--ink);border-radius:12px;box-shadow:6px 6px 0 var(--ink);max-width:480px;width:100%;padding:32px;text-align:center;position:relative;">' +
      '<div style="font-size:48px;margin-bottom:8px;">🐯</div>' +
      '<h2 style="font-family:var(--font-display);font-size:28px;color:var(--ink);margin:0 0 4px;">welcome to the film room.</h2>' +
      '<p style="font-family:var(--font-hand);font-size:18px;color:var(--ink-light);margin:0 0 16px;">you just made the tiger very happy</p>' +
      '<div style="display:inline-block;background:var(--orange);color:#fff;font-family:var(--font-mono);font-size:12px;font-weight:700;padding:4px 12px;border-radius:20px;border:2px solid var(--ink);margin-bottom:20px;">' +
        escapeHtml(planLabel) + ' — ' + escapeHtml(price) +
      '</div>' +
      '<ul style="list-style:none;padding:0;margin:0 0 24px;text-align:left;">' +
        featureHTML +
      '</ul>' +
      '<div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">' +
        '<a href="/league-intel.html" style="font-family:var(--font-mono);font-size:13px;font-weight:700;padding:10px 20px;background:var(--orange);color:#fff;border:2px solid var(--ink);border-radius:8px;box-shadow:4px 4px 0 var(--ink);text-decoration:none;cursor:pointer;">Open the Bureau</a>' +
        '<a href="/lab.html" style="font-family:var(--font-mono);font-size:13px;font-weight:700;padding:10px 20px;background:var(--bg-warm);color:var(--ink);border:2px solid var(--ink);border-radius:8px;box-shadow:4px 4px 0 var(--ink);text-decoration:none;cursor:pointer;">Back to the Screener</a>' +
      '</div>' +
      '<button onclick="this.closest(\'div\').parentElement.remove();" style="position:absolute;top:12px;right:12px;background:none;border:none;font-size:20px;color:var(--ink-light);cursor:pointer;font-family:var(--font-mono);">&times;</button>' +
    '</div>';

  document.body.appendChild(overlay);

  // CSS confetti burst
  var style = document.createElement("style");
  style.textContent = "@keyframes welcome-confetti{0%{opacity:1;transform:translateY(0) rotate(0deg);}100%{opacity:0;transform:translateY(-200px) rotate(720deg);}}";
  document.head.appendChild(style);
  var colors = ["var(--orange)", "var(--pos-qb)", "var(--pos-rb)", "var(--pos-te)", "var(--green)"];
  for (var ci = 0; ci < 20; ci++) {
    var dot = document.createElement("div");
    dot.style.cssText = "position:fixed;width:" + (6 + Math.random() * 8) + "px;height:" + (6 + Math.random() * 8) + "px;background:" + colors[ci % colors.length] + ";border-radius:" + (Math.random() > 0.5 ? "50%" : "2px") + ";left:" + (10 + Math.random() * 80) + "%;top:" + (40 + Math.random() * 30) + "%;z-index:10001;pointer-events:none;animation:welcome-confetti " + (0.8 + Math.random() * 1.2) + "s ease-out forwards;animation-delay:" + (Math.random() * 0.3) + "s;";
    document.body.appendChild(dot);
    setTimeout((function(d) { return function() { d.remove(); }; })(dot), 2500);
  }
}

function _injectAuthModal() {
  if (document.getElementById("authModal")) return;
  var modal = document.createElement("div");
  modal.id = "authModal";
  modal.className = "auth-modal-overlay";
  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-modal", "true");
  modal.setAttribute("aria-labelledby", "auth-modal-title");
  modal.style.display = "none";
  modal.innerHTML =
    '<div class="auth-modal">' +
      '<button class="auth-modal-close" onclick="closeAuthModal()" aria-label="Close sign-in dialog">&times;</button>' +
      '<h2 id="auth-modal-title" class="sr-only">Sign In or Register</h2>' +
      '<div class="auth-tabs">' +
        '<button class="auth-tab active" data-tab="login" onclick="switchAuthTab(\'login\')">Sign In</button>' +
        '<button class="auth-tab" data-tab="register" onclick="switchAuthTab(\'register\')">Register</button>' +
      '</div>' +
      '<form id="authLoginForm" class="auth-form" onsubmit="handleLogin(event)">' +
        '<input type="email" id="authLoginEmail" placeholder="Email" required autocomplete="email" aria-label="Email address">' +
        '<input type="password" id="authLoginPassword" placeholder="Password" required autocomplete="current-password" aria-label="Password">' +
        '<div id="authLoginError" class="auth-error"></div>' +
        '<button type="submit" class="btn-chunky btn-primary auth-submit">Sign In</button>' +
      '</form>' +
      '<form id="authRegisterForm" class="auth-form" style="display:none" onsubmit="handleRegister(event)">' +
        '<input type="email" id="authRegisterEmail" placeholder="Email" required autocomplete="email" aria-label="Email address">' +
        '<input type="password" id="authRegisterPassword" placeholder="Password (8+ chars)" required minlength="8" autocomplete="new-password" aria-label="Password (8 characters minimum)">' +
        '<input type="password" id="authRegisterConfirm" placeholder="Confirm password" required minlength="8" autocomplete="new-password" aria-label="Confirm password">' +
        '<div id="authRegisterError" class="auth-error"></div>' +
        '<button type="submit" class="btn-chunky btn-primary auth-submit">Create Account</button>' +
      '</form>' +
    '</div>';
  modal.addEventListener("click", function(e) {
    if (e.target === modal) closeAuthModal();
  });
  document.body.appendChild(modal);
}

function _injectNavAuthButton() {
  // New nav structure: use #nav-auth container
  var authContainer = document.getElementById("nav-auth");
  if (authContainer) {
    // nav-auth already has Sign In button from HTML; just add navAuthItem span for dynamic updates
    var span = document.createElement("span");
    span.id = "navAuthItem";
    // Replace the static Sign In link
    var existingBtn = authContainer.querySelector(".btn-chunky.btn-sm");
    if (existingBtn) {
      existingBtn.setAttribute("onclick", "openAuthModal(); return false;");
      existingBtn.id = "navSignIn";
      span.appendChild(existingBtn);
    } else {
      span.innerHTML = '<a href="#" onclick="openAuthModal(); return false;" id="navSignIn" class="btn-chunky btn-sm">Sign In</a>';
    }
    authContainer.appendChild(span);
    return;
  }
  // Fallback for old nav structure
  var nav = document.querySelector(".topnav .nav-links");
  if (!nav) return;
  var li = document.createElement("li");
  li.id = "navAuthItem";
  li.innerHTML = '<a href="#" onclick="openAuthModal(); return false;" id="navSignIn">Sign In</a>';
  nav.appendChild(li);
}

var _authModalTrigger = null;

function openAuthModal() {
  var m = document.getElementById("authModal");
  if (m) {
    _authModalTrigger = document.activeElement;
    m.style.display = "flex";
    switchAuthTab("login");
    clearAuthErrors();
    // Focus first input
    var firstInput = m.querySelector("input");
    if (firstInput) setTimeout(function() { firstInput.focus(); }, 50);
  }
}

function closeAuthModal() {
  var m = document.getElementById("authModal");
  if (m) m.style.display = "none";
  // Return focus to trigger element
  if (_authModalTrigger && _authModalTrigger.focus) {
    _authModalTrigger.focus();
    _authModalTrigger = null;
  }
}

// Focus trap and Escape for auth modal
document.addEventListener("keydown", function(e) {
  var m = document.getElementById("authModal");
  if (!m || m.style.display === "none") return;
  if (e.key === "Escape") { closeAuthModal(); return; }
  if (e.key === "Tab") {
    var focusable = m.querySelectorAll('button, input, [tabindex]:not([tabindex="-1"])');
    if (focusable.length === 0) return;
    var first = focusable[0];
    var last = focusable[focusable.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) { e.preventDefault(); last.focus(); }
    } else {
      if (document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  }
});

function switchAuthTab(tab) {
  var tabs = document.querySelectorAll(".auth-tab");
  tabs.forEach(function(t) { t.classList.toggle("active", t.dataset.tab === tab); });
  document.getElementById("authLoginForm").style.display = tab === "login" ? "" : "none";
  document.getElementById("authRegisterForm").style.display = tab === "register" ? "" : "none";
  clearAuthErrors();
}

function clearAuthErrors() {
  var el = document.getElementById("authLoginError");
  if (el) el.textContent = "";
  el = document.getElementById("authRegisterError");
  if (el) el.textContent = "";
}

async function handleLogin(e) {
  e.preventDefault();
  var btn = e.target.querySelector('button[type="submit"]');
  var origText = btn ? btn.textContent : "";
  if (btn) { btn.disabled = true; btn.textContent = "signing in..."; }
  var email = document.getElementById("authLoginEmail").value.trim();
  var password = document.getElementById("authLoginPassword").value;
  var errEl = document.getElementById("authLoginError");
  errEl.textContent = "";
  try {
    var resp = await fetch(API_BASE + "/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email, password: password })
    });
    if (!resp.ok) { try { var d = await resp.json(); errEl.textContent = d.error || d.detail || "fumbled the login. check your credentials."; } catch(_) { errEl.textContent = "fumbled the login. try again."; } return; }
    var data = await resp.json();
    localStorage.setItem("razzle_token", data.token);
    localStorage.setItem("razzle_user", JSON.stringify(data.user));
    if (!data.user.sleeper_username) { showSleeperPrompt(); } else { closeAuthModal(); }
    updateAuthUI(data.user);
    migrateLocalFormulas();
    _resumePendingCheckout();
  } catch (err) {
    errEl.textContent = "network fumble. try again.";
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = origText; }
  }
}

async function handleRegister(e) {
  e.preventDefault();
  var btn = e.target.querySelector('button[type="submit"]');
  var origText = btn ? btn.textContent : "";
  if (btn) { btn.disabled = true; btn.textContent = "creating account..."; }
  var email = document.getElementById("authRegisterEmail").value.trim();
  var password = document.getElementById("authRegisterPassword").value;
  var confirm = document.getElementById("authRegisterConfirm").value;
  var errEl = document.getElementById("authRegisterError");
  errEl.textContent = "";
  if (password !== confirm) { errEl.textContent = "Passwords don't match"; if (btn) { btn.disabled = false; btn.textContent = origText; } return; }
  if (password.length < 8) { errEl.textContent = "Password must be at least 8 characters"; if (btn) { btn.disabled = false; btn.textContent = origText; } return; }
  if (!/[a-zA-Z]/.test(password)) { errEl.textContent = "Password must contain at least one letter"; if (btn) { btn.disabled = false; btn.textContent = origText; } return; }
  if (!/[0-9]/.test(password)) { errEl.textContent = "Password must contain at least one number"; if (btn) { btn.disabled = false; btn.textContent = origText; } return; }
  try {
    var resp = await fetch(API_BASE + "/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email, password: password })
    });
    if (!resp.ok) { try { var d = await resp.json(); errEl.textContent = d.error || d.detail || "couldn't get you signed up. try again."; } catch(_) { errEl.textContent = "couldn't get you signed up. try again."; } return; }
    var data = await resp.json();
    localStorage.setItem("razzle_token", data.token);
    localStorage.setItem("razzle_user", JSON.stringify(data.user));
    if (!data.user.sleeper_username) { showSleeperPrompt(); } else { closeAuthModal(); }
    updateAuthUI(data.user);
    migrateLocalFormulas();
    _resumePendingCheckout();
  } catch (err) {
    errEl.textContent = "network fumble. try again.";
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = origText; }
  }
}

function _resumePendingCheckout() {
  try {
    var pending = sessionStorage.getItem("razzle_pending_checkout");
    if (pending) {
      sessionStorage.removeItem("razzle_pending_checkout");
      setTimeout(function() { startCheckout(pending); }, 500);
    }
  } catch(_) {}
}

function signOut() {
  localStorage.removeItem("razzle_token");
  localStorage.removeItem("razzle_user");
  localStorage.removeItem("razzle_formulas");
  localStorage.removeItem("razzle_last_state");
  localStorage.removeItem("razzle_recent_players");
  localStorage.removeItem("razzle_league_context");
  localStorage.removeItem("razzle_prefill_scenario");
  localStorage.removeItem("razzle_query_count");
  localStorage.removeItem("razzle_store_ratings");
  localStorage.removeItem("razzle_store_installed");
  localStorage.removeItem("razzle_store_reviews");
  localStorage.removeItem("razzle_store_my_published");
  localStorage.removeItem("razzle_store_username");
  localStorage.removeItem("razzle_agent_config");
  localStorage.removeItem("razzle_sleeper_user");
  localStorage.removeItem("razzle_sleeper_user_id");
  localStorage.removeItem("razzle_watchlist");
  localStorage.removeItem("razzle_player_tags");
  localStorage.removeItem("razzle_player_notes");
  updateAuthUI(null);
}

async function checkAuth() {
  var token = localStorage.getItem("razzle_token");
  if (!token) { updateAuthUI(null); return; }
  try {
    var resp = await fetch(API_BASE + "/api/auth/me", {
      headers: { "Authorization": "Bearer " + token }
    });
    if (!resp.ok) {
      localStorage.removeItem("razzle_token");
      localStorage.removeItem("razzle_user");
      updateAuthUI(null);
      return;
    }
    var data = await resp.json();
    localStorage.setItem("razzle_user", JSON.stringify(data.user));
    updateAuthUI(data.user);
  } catch (e) {
    // Network error — keep cached user if any
    var cached = localStorage.getItem("razzle_user");
    if (cached) {
      try { updateAuthUI(JSON.parse(cached)); } catch (_) { updateAuthUI(null); }
    } else {
      updateAuthUI(null);
    }
  }
}

function updateAuthUI(user) {
  var item = document.getElementById("navAuthItem");
  if (!item) return;
  if (user) {
    var displayName = user.sleeper_username
      ? escapeHtml(user.sleeper_username)
      : escapeHtml(user.email ? user.email.split("@")[0] : "user");
    var isPaid = user.plan === "pro" || user.plan === "elite" || user.plan === "pro_lifetime" || user.plan === "elite_lifetime";
    var isTrial = user.trial_active && user.plan_source === "trial";
    var badge;
    if (user.plan === "elite" || user.plan === "elite_lifetime") {
      badge = '<span class="nav-plan-badge nav-plan-elite">Elite' + (user.plan === "elite_lifetime" ? ' ∞' : '') + '</span>';
    } else if (isTrial) {
      var daysLeft = user.trial_days_remaining || 0;
      badge = '<span class="nav-plan-badge nav-plan-trial">Trial ' + daysLeft + 'd</span>';
    } else if (user.plan === "pro" || user.plan === "pro_lifetime") {
      badge = '<span class="nav-plan-badge nav-plan-pro">Pro' + (user.plan === "pro_lifetime" ? ' ∞' : '') + '</span>';
    } else {
      badge = '<span class="nav-plan-badge nav-plan-free">Free</span>';
    }

    // Dropdown menu items
    var dropdownItems = '';
    if (isTrial) {
      dropdownItems += '<div class="nav-dropdown-item" style="font-size:10px; color:var(--orange); cursor:default;">Pro trial: ' + (user.trial_days_remaining || 0) + ' days remaining</div>';
    }
    if (user.sleeper_username) {
      dropdownItems += '<div class="nav-dropdown-item" style="font-size:10px; color:var(--ink-light); cursor:default;">sleeper: ' + escapeHtml(user.sleeper_username) + '</div>';
    }
    if (isPaid && !isTrial) {
      dropdownItems += '<a href="#" onclick="openManageSubscription(); return false;" class="nav-dropdown-item">Manage Subscription</a>';
    } else if (isTrial) {
      dropdownItems += '<a href="/pricing.html" class="nav-dropdown-item" style="color:var(--orange);">Keep Pro — Subscribe</a>';
    } else if (user.plan_source === "trial" && !user.trial_active) {
      dropdownItems += '<a href="/pricing.html" class="nav-dropdown-item" style="color:var(--orange);">Your trial ended — Subscribe</a>';
    } else {
      dropdownItems += '<a href="/pricing.html" class="nav-dropdown-item" style="color:var(--orange);">Subscribe to Pro</a>';
    }
    dropdownItems += '<div class="nav-dropdown-divider"></div>';
    dropdownItems += '<a href="#" onclick="signOut(); return false;" class="nav-dropdown-item nav-dropdown-signout">Sign Out</a>';

    item.innerHTML =
      '<div class="nav-user-dropdown">' +
        '<button class="nav-user-trigger" onclick="this.parentElement.classList.toggle(\'open\')">' +
          badge +
          '<span class="nav-user-name">' + displayName + '</span>' +
          '<span class="nav-user-caret">&#9662;</span>' +
        '</button>' +
        '<div class="nav-dropdown-menu">' +
          '<div class="nav-dropdown-header">' + escapeHtml(user.email) + '</div>' +
          dropdownItems +
        '</div>' +
      '</div>';

    // Trial expiry warning — show once per session when <= 2 days remaining
    if (isTrial && (user.trial_days_remaining || 0) <= 2 && !sessionStorage.getItem("razzle_trial_warn") && !window._checkoutInProgress) {
      sessionStorage.setItem("razzle_trial_warn", "1");
      setTimeout(function() {
        var days = user.trial_days_remaining || 0;
        var msg = days === 0
          ? "your Pro trial expires today. subscribe to keep your access."
          : "your Pro trial expires in " + days + " day" + (days !== 1 ? "s" : "") + ". subscribe to keep your access.";
        _showToast(msg, "warning", 10000);
      }, 3000);
    }
  } else {
    item.innerHTML = '<a href="#" onclick="openAuthModal(); return false;" id="navSignIn" class="btn-chunky btn-sm">Sign In</a>';
  }
  // Notify lock icons and tier-gated UI to re-evaluate
  window.dispatchEvent(new CustomEvent("razzle-plan-changed", { detail: user }));
}

var _checkoutInProgress = false;
async function startCheckout(interval) {
  if (_checkoutInProgress) return;
  var token = localStorage.getItem("razzle_token");
  if (!token) {
    try { sessionStorage.setItem("razzle_pending_checkout", interval || "year"); } catch(_) {}
    openAuthModal();
    return;
  }

  // Disable the triggering button and show loading
  _checkoutInProgress = true;
  var btn = document.activeElement;
  var origText = "";
  if (btn && (btn.tagName === "BUTTON" || btn.tagName === "A")) {
    origText = btn.textContent;
    btn.textContent = "processing...";
    btn.disabled = true;
    btn.style.opacity = "0.6";
  }

  // Check for promo code input on page
  var promoInput = document.getElementById("promoCodeInput");
  var promoCode = promoInput ? promoInput.value.trim() : "";

  try {
    var body = { interval: interval || "year" };
    if (promoCode) body.promo_code = promoCode;

    var resp = await fetch(API_BASE + "/api/billing/create-checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": "Bearer " + token },
      body: JSON.stringify(body)
    });
    if (!resp.ok) {
      _showToast("checkout hit a wall. try again or ping support.", "error");
      return;
    }
    var data = await resp.json();
    if (data.checkout_url) {
      window.location.href = data.checkout_url;
      return; // Don't reset — navigating away
    } else {
      _showToast(data.error || "checkout got stuffed at the line. give it another shot.", "error");
    }
  } catch (e) {
    _showToast("network fumble. try again.", "error");
  } finally {
    _checkoutInProgress = false;
    if (btn && origText) {
      btn.textContent = origText;
      btn.disabled = false;
      btn.style.opacity = "";
    }
  }
}

async function validatePromoCode() {
  var input = document.getElementById("promoCodeInput");
  var feedback = document.getElementById("promoCodeFeedback");
  if (!input || !feedback) return;
  var code = input.value.trim();
  if (!code) { feedback.textContent = ""; return; }

  try {
    var resp = await fetch(API_BASE + "/api/billing/validate-promo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: code })
    });
    if (!resp.ok) {
      feedback.textContent = "couldn't verify that one. try again.";
      feedback.style.color = "var(--red, #e63946)";
      return;
    }
    var data = await resp.json();
    if (data.valid) {
      feedback.textContent = (data.percent_off || 0) + "% off applied";
      feedback.style.color = "var(--green, #2ec4b6)";
      input.style.borderColor = "var(--green, #2ec4b6)";
    } else {
      feedback.textContent = data.error || "Invalid code";
      feedback.style.color = "var(--red, #e63946)";
      input.style.borderColor = "var(--red, #e63946)";
    }
  } catch (e) {
    feedback.textContent = "couldn\u0027t verify that one";
    feedback.style.color = "var(--ink-light)";
  }
}

async function openManageSubscription() {
  var token = localStorage.getItem("razzle_token");
  if (!token) {
    if (typeof openAuthModal === "function") openAuthModal();
    return;
  }
  try {
    var resp = await fetch(API_BASE + "/api/billing/status", {
      headers: { "Authorization": "Bearer " + token }
    });
    if (!resp.ok) {
      if (typeof _showToast === "function") _showToast("couldn't pull your subscription info. try again.", "error"); else _showToast("couldn't pull your subscription info. try again.", "error");
      return;
    }
    var data = await resp.json();
    if (data.portal_url) {
      window.location.href = data.portal_url;
    } else {
      if (typeof _showToast === "function") _showToast("subscription management isn't available right now.", "error"); else _showToast("subscription management isn't available right now.", "error");
    }
  } catch (e) {
    if (typeof _showToast === "function") _showToast("connection fumbled. try again.", "error"); else _showToast("connection fumbled. try again.", "error");
  }
}

function showSleeperPrompt() {
  var modal = document.getElementById("authModal");
  if (!modal) return;
  var inner = modal.querySelector(".auth-modal");
  if (!inner) return;

  // Check if user has an active trial (just registered)
  var user = null;
  try { user = JSON.parse(localStorage.getItem("razzle_user") || "null"); } catch(e) {}
  var isTrial = user && user.trial_active && user.plan_source === "trial";
  var trialDays = (user && user.trial_days_remaining) || 7;

  var trialBanner = "";
  if (isTrial) {
    trialBanner =
      '<div style="background:var(--orange); color:white; padding:10px 16px; border-radius:8px; border:2px solid var(--ink); margin-bottom:16px; text-align:center;">' +
        '<div style="font-family:var(--font-mono); font-size:14px;">Pro Trial Active</div>' +
        '<div style="font-family:var(--font-hand); font-size:14px; margin-top:2px;">' + trialDays + ' days of Pro access — no credit card needed</div>' +
      '</div>';
  }

  inner.innerHTML =
    '<button class="auth-modal-close" onclick="closeAuthModal()">&times;</button>' +
    trialBanner +
    '<div style="text-align:center; margin-bottom:16px;">' +
      '<div style="font-size:40px;">&#x1F42F;</div>' +
      '<h3 style="font-family:var(--font-display); font-size:18px; margin-top:8px;">Connect Your Sleeper</h3>' +
      '<p style="font-family:var(--font-hand); font-size:16px; color:var(--ink-medium); margin-top:4px;">' +
        (isTrial ? 'connect Sleeper to unlock league-contextualized AI agents' : 'link your Sleeper username for league context') +
      '</p>' +
    '</div>' +
    '<form onsubmit="handleSleeperLink(event)" style="display:flex; flex-direction:column; gap:10px;">' +
      '<input type="text" id="sleeperLinkInput" placeholder="Sleeper username" style="font-family:var(--font-mono); font-size:14px; padding:10px 14px; border:2px solid var(--ink); border-radius:8px; background:var(--bg-card);">' +
      '<div style="font-family:var(--font-mono); font-size:10px; color:var(--ink-light); padding:4px 0;">this will permanently link your Sleeper account to your Razzle account</div>' +
      '<div id="sleeperLinkError" style="font-family:var(--font-mono); font-size:12px; color:var(--red); min-height:16px;"></div>' +
      '<button type="submit" class="btn-chunky btn-primary auth-submit">Connect</button>' +
      '<a href="#" onclick="showWelcomeState(); return false;" style="text-align:center; font-family:var(--font-mono); font-size:12px; color:var(--ink-light);">skip for now</a>' +
    '</form>';
}

function showWelcomeState() {
  var modal = document.getElementById("authModal");
  if (!modal) return;
  var inner = modal.querySelector(".auth-modal");
  if (!inner) return;

  var user = null;
  try { user = JSON.parse(localStorage.getItem("razzle_user") || "null"); } catch(e) {}
  var isTrial = user && user.trial_active && user.plan_source === "trial";
  var hasSleeper = user && user.sleeper_username;

  inner.innerHTML =
    '<button class="auth-modal-close" onclick="closeAuthModal()">&times;</button>' +
    '<div style="text-align:center; padding:8px 0;">' +
      '<div style="font-size:48px;">&#x1F42F;</div>' +
      '<h3 style="font-family:var(--font-display); font-size:20px; margin-top:8px;">Welcome to Razzle</h3>' +
      (isTrial
        ? '<p style="font-family:var(--font-hand); font-size:16px; color:var(--orange); margin-top:4px;">your 7-day Pro trial is running</p>'
        : '<p style="font-family:var(--font-hand); font-size:16px; color:var(--ink-medium); margin-top:4px;">you\'re all set</p>'
      ) +
      '<div style="display:flex; flex-direction:column; gap:10px; margin-top:20px;">' +
        '<a href="/agents.html" class="btn-chunky btn-primary" style="text-decoration:none; text-align:center; font-size:13px;" onclick="closeAuthModal();">' +
          (hasSleeper ? 'Enter the Situation Room' : 'Tour the Situation Room') +
        '</a>' +
        '<a href="/lab.html" class="btn-chunky" style="text-decoration:none; text-align:center; font-size:13px; background:var(--bg-card);" onclick="closeAuthModal();">' +
          'Explore the Screener' +
        '</a>' +
      '</div>' +
      (!hasSleeper
        ? '<p style="font-family:var(--font-mono); font-size:11px; color:var(--ink-light); margin-top:16px;">tip: connect your Sleeper username in Settings for league-contextualized agents</p>'
        : ''
      ) +
    '</div>';
}

async function handleSleeperLink(e) {
  e.preventDefault();
  var username = document.getElementById("sleeperLinkInput").value.trim();
  var errEl = document.getElementById("sleeperLinkError");
  if (!username) { errEl.textContent = "need a Sleeper username"; return; }
  errEl.textContent = "";
  try {
    var token = localStorage.getItem("razzle_token");
    if (!token) { errEl.textContent = "sign in first to link your Sleeper account."; return; }
    var resp = await fetch(API_BASE + "/api/auth/link-sleeper", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": "Bearer " + token },
      body: JSON.stringify({ sleeper_username: username })
    });
    var data = await resp.json();
    if (!resp.ok) {
      if (data.locked_username) {
        errEl.textContent = data.error || "This account is already linked to " + data.locked_username;
      } else {
        errEl.textContent = data.error || "Invalid username";
      }
      return;
    }
    localStorage.setItem("razzle_user", JSON.stringify(data.user));
    localStorage.setItem("razzle_sleeper_user", username);
    updateAuthUI(data.user);
    showWelcomeState();
  } catch (err) {
    errEl.textContent = "Connection error";
  }
}

async function linkSleeperToAccount(username) {
  var token = localStorage.getItem("razzle_token");
  if (!token) return;
  try {
    var resp = await fetch(API_BASE + "/api/auth/link-sleeper", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": "Bearer " + token },
      body: JSON.stringify({ sleeper_username: username })
    });
    if (resp.ok) {
      var data = await resp.json();
      localStorage.setItem("razzle_user", JSON.stringify(data.user));
      updateAuthUI(data.user);
    }
  } catch (e) { /* silent fail */ }
}

function migrateLocalFormulas() {
  var token = localStorage.getItem("razzle_token");
  if (!token) return;
  try {
    var local = JSON.parse(localStorage.getItem("razzle_formulas") || "[]");
    if (!local.length) return;
    var formulas = local.map(function(f) {
      return { name: f.name, weights: JSON.stringify(f.components || []) };
    });
    fetch(API_BASE + "/api/user/formulas/import", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": "Bearer " + token },
      body: JSON.stringify({ formulas: formulas })
    }).then(function(r) {
      if (r.ok) localStorage.removeItem("razzle_formulas");
    }).catch(function() {});
  } catch (e) { /* ignore */ }
}

/* ========== Command Palette (Ctrl+K Quick Search) ========== */
var _cmdPaletteEl = null;
var _cmdInputEl = null;
var _cmdResultsEl = null;
var _cmdActiveIdx = -1;
var _cmdItems = [];
var _cmdDebounce = null;

function initCommandPalette() {
  // Inject palette HTML into body
  var html = '<div class="cmd-palette-backdrop" id="cmdPalette">' +
    '<div class="cmd-palette">' +
      '<div class="cmd-palette-label">quick search</div>' +
      '<div class="cmd-palette-input-wrap">' +
        '<input class="cmd-palette-input" id="cmdInput" type="text" placeholder="Search players... (Ctrl+K)" autocomplete="off" />' +
      '</div>' +
      '<div class="cmd-palette-results" id="cmdResults"></div>' +
      '<div class="cmd-palette-hint">' +
        '<span><kbd>&uarr;</kbd><kbd>&darr;</kbd> navigate</span>' +
        '<span><kbd>Enter</kbd> open</span>' +
        '<span><kbd>Esc</kbd> close</span>' +
      '</div>' +
    '</div>' +
  '</div>';
  document.body.insertAdjacentHTML("beforeend", html);

  _cmdPaletteEl = document.getElementById("cmdPalette");
  _cmdInputEl = document.getElementById("cmdInput");
  _cmdResultsEl = document.getElementById("cmdResults");

  // Close on backdrop click
  _cmdPaletteEl.addEventListener("click", function(e) {
    if (e.target === _cmdPaletteEl) closeCmdPalette();
  });

  // Input handler with debounce
  _cmdInputEl.addEventListener("input", function() {
    clearTimeout(_cmdDebounce);
    var q = _cmdInputEl.value.trim();
    if (!q) {
      renderRecentlyViewed();
      return;
    }
    _cmdResultsEl.innerHTML = '<div class="cmd-palette-status">' + razzleLoading() + '</div>';
    _cmdDebounce = setTimeout(function() { cmdSearch(q); }, 300);
  });

  // Keyboard nav inside input
  _cmdInputEl.addEventListener("keydown", function(e) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      cmdNavigate(1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      cmdNavigate(-1);
    } else if (e.key === "Enter") {
      e.preventDefault();
      cmdSelect();
    } else if (e.key === "Escape") {
      closeCmdPalette();
    }
  });

  // Global Ctrl+K / Cmd+K
  document.addEventListener("keydown", function(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === "k") {
      e.preventDefault();
      if (_cmdPaletteEl.classList.contains("open")) {
        closeCmdPalette();
      } else {
        openCmdPalette();
      }
    }
    if (e.key === "Escape" && _cmdPaletteEl.classList.contains("open")) {
      closeCmdPalette();
    }
  });
}

function openCmdPalette() {
  _cmdPaletteEl.classList.add("open");
  _cmdInputEl.value = "";
  _cmdActiveIdx = -1;
  renderRecentlyViewed();
  setTimeout(function() { _cmdInputEl.focus(); }, 50);
}

function closeCmdPalette() {
  _cmdPaletteEl.classList.remove("open");
  _cmdInputEl.value = "";
  _cmdResultsEl.innerHTML = "";
  _cmdActiveIdx = -1;
  _cmdItems = [];
}

async function cmdSearch(query) {
  try {
    var data = await apiFetch("/api/players/quick-search?q=" + encodeURIComponent(query) + "&limit=8");
    _cmdItems = data || [];
    _cmdActiveIdx = _cmdItems.length > 0 ? 0 : -1;
    renderCmdResults(_cmdItems, "Results");
  } catch (e) {
    _cmdResultsEl.innerHTML = '<div class="cmd-palette-status">fumbled the search... try again.</div>';
    _cmdItems = [];
    _cmdActiveIdx = -1;
  }
}

function renderCmdResults(items, sectionLabel) {
  if (!items.length) {
    _cmdResultsEl.innerHTML = '<div class="cmd-palette-status">' + razzleEmpty() + '</div>';
    return;
  }
  var html = '<div class="cmd-palette-section">' + escapeHtml(sectionLabel) + '</div>';
  items.forEach(function(p, i) {
    var pos = (p.position || "").toUpperCase();
    var posLc = pos.toLowerCase();
    var team = p.team || "FA";
    var ppg = p.ppg != null ? Number(p.ppg).toFixed(1) : "—";
    var activeClass = i === _cmdActiveIdx ? " active" : "";
    html += '<div class="cmd-palette-item' + activeClass + '" data-idx="' + i + '">' +
      playerHeadshot(p, pos) +
      '<span class="cmd-palette-pos ' + posLc + '">' + escapeHtml(pos) + '</span>' +
      '<div class="cmd-palette-item-info">' +
        '<div class="cmd-palette-item-name">' + escapeHtml(p.full_name || p.player_name || "") + '</div>' +
        '<div class="cmd-palette-item-meta">' + escapeHtml(team) + '</div>' +
      '</div>' +
      '<div class="cmd-palette-item-ppg">' + ppg + ' ppg</div>' +
    '</div>';
  });
  _cmdResultsEl.innerHTML = html;

  // Click handlers
  var els = _cmdResultsEl.querySelectorAll(".cmd-palette-item");
  els.forEach(function(el) {
    el.addEventListener("click", function() {
      _cmdActiveIdx = parseInt(el.dataset.idx);
      cmdSelect();
    });
    el.addEventListener("mouseenter", function() {
      _cmdActiveIdx = parseInt(el.dataset.idx);
      updateCmdActive();
    });
  });
}

function cmdNavigate(dir) {
  if (!_cmdItems.length) return;
  _cmdActiveIdx += dir;
  if (_cmdActiveIdx < 0) _cmdActiveIdx = _cmdItems.length - 1;
  if (_cmdActiveIdx >= _cmdItems.length) _cmdActiveIdx = 0;
  updateCmdActive();
}

function updateCmdActive() {
  var els = _cmdResultsEl.querySelectorAll(".cmd-palette-item");
  els.forEach(function(el, i) {
    el.classList.toggle("active", i === _cmdActiveIdx);
  });
  // Scroll active into view
  if (els[_cmdActiveIdx]) {
    els[_cmdActiveIdx].scrollIntoView({ block: "nearest" });
  }
}

function cmdSelect() {
  if (_cmdActiveIdx < 0 || _cmdActiveIdx >= _cmdItems.length) return;
  var player = _cmdItems[_cmdActiveIdx];
  addToRecentlyViewed(player);
  closeCmdPalette();
  openPlayerPopup(player.player_id);
}

/* Recently Viewed — stored in localStorage */
function getRecentlyViewed() {
  try {
    return JSON.parse(localStorage.getItem("razzle_recent_players") || "[]");
  } catch (e) { return []; }
}

function addToRecentlyViewed(player) {
  var recent = getRecentlyViewed();
  // Remove if already in list
  recent = recent.filter(function(p) { return p.player_id !== player.player_id; });
  // Prepend
  recent.unshift({
    player_id: player.player_id,
    full_name: player.full_name || player.player_name,
    position: player.position,
    team: player.team,
    headshot_url: player.headshot_url,
    ppg: player.ppg
  });
  // Cap at 8
  if (recent.length > 8) recent = recent.slice(0, 8);
  try { localStorage.setItem("razzle_recent_players", JSON.stringify(recent)); } catch (e) {}
}

function renderRecentlyViewed() {
  var recent = getRecentlyViewed();
  _cmdItems = recent;
  _cmdActiveIdx = recent.length > 0 ? 0 : -1;
  if (!recent.length) {
    _cmdResultsEl.innerHTML = '<div class="cmd-palette-status">start typing to search players</div>';
    return;
  }
  renderCmdResults(recent, "Recently Viewed");
}

// Init palette on DOM ready
function _initPalette() {
  initCommandPalette();
}
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", _initPalette);
} else {
  _initPalette();
}

// Auto-init auth on DOM ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initAuth);
} else {
  initAuth();
}

// Listen for plan changes (after checkout or login) to refresh gated features
window.addEventListener("razzle-plan-changed", function(e) {
  var user = e.detail;
  if (!user) return;

  // Re-populate season selector if on Lab page
  if (typeof populateSeasonSelect === "function") populateSeasonSelect();

  // Re-render formula builder (remove limit)
  if (typeof renderSavedFormulas === "function") renderSavedFormulas();

  // Re-render column picker (no change needed, but ensures consistency)
  if (typeof renderColumnPicker === "function") renderColumnPicker();

  // Trigger cloud sync now that user is paid
  if (typeof syncFormulasFromCloud === "function") syncFormulasFromCloud();
  if (typeof syncSavedViewsFromCloud === "function") syncSavedViewsFromCloud();
  if (typeof syncWatchlistFromCloud === "function") syncWatchlistFromCloud();

  // Update Situation Room gating (hide upsell, enable full features)
  if (typeof refreshPlanGating === "function") refreshPlanGating();

  // Hide ads for paid users (plan just changed)
  var adSlots = document.querySelectorAll(".razzle-ad-slot");
  for (var i = 0; i < adSlots.length; i++) adSlots[i].style.display = "none";
});

/* ===== AdSense Scaffolding (free-tier only) ===== */
(function initAds() {
  // Only show ads to free users
  if (isPaidUser()) return;

  // Skip ads on Situation Room and Pricing pages
  var path = location.pathname;
  if (path === "/agents.html" || path === "/pricing.html") return;

  // AdSense publisher ID — set when account is approved
  var ADSENSE_PUB_ID = ""; // e.g., "ca-pub-XXXXXXXXXX"
  if (!ADSENSE_PUB_ID) return; // No ads until publisher ID is configured

  // Load AdSense script
  var script = document.createElement("script");
  script.async = true;
  script.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=" + ADSENSE_PUB_ID;
  script.crossOrigin = "anonymous";
  document.head.appendChild(script);

  // Insert ad slot before the footer (tasteful placement)
  var footer = document.querySelector(".site-footer");
  if (footer) {
    var adDiv = document.createElement("div");
    adDiv.className = "razzle-ad-slot";
    adDiv.style.cssText = "max-width:900px; margin:24px auto 0; padding:0 24px; text-align:center;";
    adDiv.innerHTML =
      '<ins class="adsbygoogle" style="display:block" data-ad-client="' + ADSENSE_PUB_ID + '" ' +
      'data-ad-slot="" data-ad-format="auto" data-full-width-responsive="true"></ins>';
    footer.parentNode.insertBefore(adDiv, footer);
    try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch (e) {}
  }
})();

// Console welcome
(function() {
  var tiger = [
    "  /\\_/\\  ",
    " ( o.o ) ",
    "  > ^ <  ",
    " /|   |\\ ",
    "(_|   |_)",
  ].join("\n");
  console.log("%c" + tiger, "font-family:monospace; color:#d97757; font-size:14px;");
  console.log("%crazzle.lol%c — the fantasy football research lab", "color:#d97757; font-weight:bold; font-size:16px;", "color:#2d1f14; font-size:13px;");

  window.razzle = {
    help: function() { console.log("razzle.tiger() — print the tiger\nrazzle.stats() — page stats\nrazzle.version — current version"); },
    tiger: function() { console.log("%c" + tiger, "font-family:monospace; color:#d97757; font-size:14px;"); },
    stats: function() { console.log("page: " + location.pathname + "\nscripts: " + document.scripts.length + "\nstylesheets: " + document.styleSheets.length); },
    version: "1.0.0"
  };
})();

// Konami Code Easter egg
(function() {
  var _konamiSeq = [38,38,40,40,37,39,37,39,66,65];
  var _konamiIdx = 0;
  document.addEventListener("keydown", function(e) {
    if (e.keyCode === _konamiSeq[_konamiIdx]) {
      _konamiIdx++;
      if (_konamiIdx === _konamiSeq.length) {
        _konamiIdx = 0;
        _triggerKonami();
      }
    } else {
      _konamiIdx = 0;
    }
  });

  function _triggerKonami() {
    // Confetti burst
    for (var i = 0; i < 50; i++) {
      var c = document.createElement("div");
      c.style.cssText = "position:fixed;width:8px;height:8px;border-radius:50%;z-index:99999;pointer-events:none;";
      c.style.background = ["#d97757","#5b7fff","#2ec4b6","#8b5cf6","#ffc857"][i % 5];
      c.style.left = Math.random() * 100 + "vw";
      c.style.top = "-10px";
      document.body.appendChild(c);
      var dur = 1000 + Math.random() * 2000;
      c.animate([
        { transform: "translateY(0) rotate(0deg)", opacity: 1 },
        { transform: "translateY(" + (80 + Math.random() * 40) + "vh) rotate(" + (Math.random() * 720) + "deg)", opacity: 0 }
      ], { duration: dur, easing: "ease-out" });
      setTimeout(function(el) { el.remove(); }, dur, c);
    }
    // Spin the tiger
    var logo = document.querySelector(".logo-mark");
    if (logo) {
      logo.style.transition = "transform 1s ease";
      logo.style.transform = "rotate(360deg)";
      setTimeout(function() { logo.style.transform = ""; }, 1200);
    }
    if (typeof _showToast === "function") _showToast("you found the Konami code. Razzle approves.", "warning", 3000);
  }
})();

// Randomized footer taglines
(function() {
  var taglines = [
    "built different. literally.",
    "your league. their weaknesses.",
    "where the film doesn't lie.",
    "fantasy football, but make it cinema.",
    "the waiver wire whisperer.",
    "data > vibes (but vibes help).",
    "pulling film since 2025.",
    "Razzle never sleeps. your opponents do."
  ];
  var footer = document.querySelector(".site-footer .footer-tagline, .site-footer [data-tagline]");
  if (!footer) {
    // Try to find a copyright line
    var footerEls = document.querySelectorAll(".site-footer div, .site-footer p");
    for (var i = 0; i < footerEls.length; i++) {
      if (footerEls[i].textContent.indexOf("razzle") > -1 || footerEls[i].textContent.indexOf("Razzle") > -1) {
        var tag = document.createElement("div");
        tag.style.cssText = "font-family:var(--font-hand);font-size:14px;color:var(--ink-light);margin-top:4px;";
        tag.textContent = taglines[Math.floor(Math.random() * taglines.length)];
        footerEls[i].parentNode.insertBefore(tag, footerEls[i].nextSibling);
        break;
      }
    }
  } else {
    footer.textContent = taglines[Math.floor(Math.random() * taglines.length)];
  }
})();

/* ===== Universal Player Popup ===== */

/**
 * Open a player profile popup from any page. On the Lab, uses the existing
 * profileOverlay modal. On other pages, creates a lightweight overlay or
 * navigates to /player/{id}.
 */
function openPlayerPopup(playerId) {
  if (!playerId) return;
  // If lab's openPlayerProfile exists (on lab.html), use it
  if (typeof openPlayerProfile === "function") {
    openPlayerProfile(playerId);
    return;
  }
  // Otherwise, create a lightweight popup overlay
  var overlay = document.getElementById("razzlePlayerPopup");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.id = "razzlePlayerPopup";
    var popupBg = document.documentElement.getAttribute("data-theme") === "dark" ? "rgba(0,0,0,0.5)" : "rgba(45,31,20,0.5)";
    overlay.style.cssText = "position:fixed;inset:0;background:" + popupBg + ";z-index:9999;display:flex;align-items:center;justify-content:center;padding:24px;";
    overlay.innerHTML =
      '<div style="background:var(--bg-card);border:3px solid var(--ink);border-radius:12px;box-shadow:6px 6px 0 var(--ink);max-width:600px;width:100%;max-height:80vh;overflow-y:auto;padding:24px;position:relative;">' +
        '<button onclick="closePlayerPopup()" style="position:absolute;top:8px;right:12px;font-size:24px;background:none;border:none;cursor:pointer;color:var(--ink);font-family:var(--font-display);">&times;</button>' +
        '<div id="razzlePlayerPopupContent"></div>' +
      '</div>';
    overlay.addEventListener("click", function(e) {
      if (e.target === overlay) closePlayerPopup();
    });
    document.body.appendChild(overlay);
  }
  overlay.style.display = "flex";
  var content = document.getElementById("razzlePlayerPopupContent");
  content.innerHTML = '<div style="text-align:center;padding:40px;font-family:var(--font-hand);font-size:20px;color:var(--ink-light);">' + razzleLoading() + '</div>';

  apiFetch("/api/players/" + encodeURIComponent(playerId) + "/profile").then(function(data) {
    if (!data || !data.player || !data.player.full_name) {
      content.innerHTML = '<div style="text-align:center;padding:32px;font-family:var(--font-hand);font-size:18px;color:var(--ink-light);">player not found on the film</div>';
      return;
    }
    var p = data.player;
    var pos = (p.position || "").toUpperCase();
    var posColorMap = { QB: "var(--pos-qb)", RB: "var(--pos-rb)", WR: "var(--pos-wr)", TE: "var(--pos-te)" };
    var posColor = posColorMap[pos] || "var(--orange)";
    var html = "";
    // Header
    html += '<div style="display:flex;align-items:center;gap:12px;border-left:6px solid ' + posColor + ';padding-left:12px;margin-bottom:16px;">';
    if (p.headshot_url) {
      html += '<img src="' + escapeAttr(p.headshot_url) + '" alt="" style="width:56px;height:56px;border-radius:50%;border:2px solid var(--ink);object-fit:cover;" onerror="this.style.display=\'none\'">';
    }
    html += '<div>';
    html += '<div style="font-family:var(--font-display);font-size:22px;">' + escapeHtml(p.full_name) + '</div>';
    html += '<div style="font-family:var(--font-mono);font-size:12px;color:var(--ink-medium);">' + escapeHtml(pos) + ' · ' + escapeHtml(p.team || "FA") + (p.age ? ' · Age ' + p.age : '') + '</div>';
    html += '</div></div>';
    // Key stats
    var stats = data.seasons && data.seasons.length ? data.seasons[data.seasons.length - 1] : null;
    if (stats) {
      html += '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(80px,1fr));gap:8px;margin-bottom:16px;">';
      var keys = [
        { k: "games", l: "GP" }, { k: "fantasy_points_ppr", l: "PPR" },
        { k: "targets", l: "TGT" }, { k: "receptions", l: "REC" },
        { k: "receiving_yards", l: "REC YD" }, { k: "rushing_yards", l: "RUSH YD" },
        { k: "passing_yards", l: "PASS YD" }, { k: "total_tds", l: "TD" },
      ];
      for (var i = 0; i < keys.length; i++) {
        var val = stats[keys[i].k];
        if (val != null && val !== 0) {
          html += '<div style="background:var(--bg-warm);border:2px solid var(--ink-faint);border-radius:8px;padding:8px;text-align:center;">';
          html += '<div style="font-family:var(--font-mono);font-size:16px;font-weight:700;">' + formatStat(val, 0) + '</div>';
          html += '<div style="font-family:var(--font-mono);font-size:9px;color:var(--ink-light);text-transform:uppercase;">' + keys[i].l + '</div>';
          html += '</div>';
        }
      }
      html += '</div>';
    }
    // Link to full profile
    html += '<div style="text-align:center;margin-top:12px;">';
    html += '<a href="/player/' + encodeURIComponent(playerId) + '" style="font-family:var(--font-mono);font-size:12px;color:var(--orange);">view full profile &rarr;</a>';
    html += '</div>';
    content.innerHTML = html;
  }).catch(function(err) {
    content.innerHTML = '<div style="text-align:center;padding:32px;font-family:var(--font-hand);font-size:18px;color:var(--red);">' + razzleError() + '</div>';
  });
}

function closePlayerPopup() {
  var overlay = document.getElementById("razzlePlayerPopup");
  if (overlay) overlay.style.display = "none";
}

// Close on Escape
document.addEventListener("keydown", function(e) {
  if (e.key === "Escape") closePlayerPopup();
});

/* ===== Re-check auth on tab re-focus (after 5 min away) ===== */
(function() {
  var _lastCheck = Date.now();
  document.addEventListener("visibilitychange", function() {
    if (!document.hidden && Date.now() - _lastCheck > 300000) {
      _lastCheck = Date.now();
      if (typeof checkAuth === "function") checkAuth();
    }
  });
})();

/* ===== Ambient Character Peek — ~1/7 page loads ===== */
(function() {
  try { if (localStorage.getItem("razzle_no_peek") === "1") return; } catch(e) {}
  if (Math.random() > (1 / 7)) return;

  // Page → character mapping
  var pagePeek = {
    "/lab.html": { icon: "/assets/agents/hawkeye.svg", name: "Hawkeye" },
    "/league-intel.html": { icon: "/assets/agents/bones.svg", name: "Bones" },
    "/agents.html": { icon: "/assets/agents/razzle.svg", name: "Razzle" },
    "/": { icon: "/assets/agents/razzle.svg", name: "Razzle" },
    "/index.html": { icon: "/assets/agents/razzle.svg", name: "Razzle" },
    "/pricing.html": { icon: "/assets/agents/razzle.svg", name: "Razzle" },
  };
  var path = location.pathname;
  var agent = pagePeek[path];
  if (!agent) {
    // Fallback: rotate through all agents
    var allAgents = [
      { icon: "/assets/agents/razzle.svg", name: "Razzle" },
      { icon: "/assets/agents/dolphin.svg", name: "Dr. Dolphin" },
      { icon: "/assets/agents/hawkeye.svg", name: "Hawkeye" },
      { icon: "/assets/agents/bones.svg", name: "Bones" },
      { icon: "/assets/agents/octo.svg", name: "Octo" },
      { icon: "/assets/agents/atlas.svg", name: "Atlas" },
    ];
    agent = allAgents[Math.floor(Math.random() * allAgents.length)];
  }

  var peek = document.createElement("div");
  peek.className = "agent-peek";
  peek.innerHTML = '<img src="' + escapeAttr(agent.icon) + '" alt="' + escapeAttr(agent.name) + '" width="48" height="48">';
  peek.title = agent.name + " is watching";
  peek.setAttribute("aria-label", agent.name + " character peek — click to dismiss");
  peek.setAttribute("role", "button");
  peek.tabIndex = 0;

  // Style
  var s = peek.style;
  s.position = "fixed";
  s.right = "-48px";
  s.bottom = "20%";
  s.width = "48px";
  s.height = "48px";
  s.cursor = "pointer";
  s.zIndex = "999";
  s.opacity = "0";
  s.transition = "right 0.6s ease-out, opacity 0.6s ease-out";
  s.pointerEvents = "auto";

  // Dismiss on click
  peek.addEventListener("click", function() {
    s.right = "-48px";
    s.opacity = "0";
    setTimeout(function() { if (peek.parentNode) peek.parentNode.removeChild(peek); }, 600);
  });
  peek.addEventListener("keydown", function(e) {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); peek.click(); }
  });

  document.body.appendChild(peek);
  // Slide in after a delay
  setTimeout(function() {
    s.right = "-16px";  // Only partially visible (peeking)
    s.opacity = "0.7";
  }, 2000);
})();
