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

/** Returns true if user is on Pro or Elite plan. */
function isPaidUser() {
  var p = getUserPlan();
  return p === "pro" || p === "elite";
}

/** Returns true if user is on Elite plan. */
function isEliteUser_global() {
  return getUserPlan() === "elite";
}

/**
 * Get the allowed season range for the current user.
 * Free: current season + 2 prior (3 total).
 * Pro/Elite: all seasons from 2015.
 */
function getAllowedSeasons(allSeasons) {
  if (isPaidUser()) return allSeasons;
  // Free: latest 3 seasons only
  var sorted = allSeasons.slice().sort(function(a, b) { return b - a; });
  return sorted.slice(0, 3);
}

/**
 * Check if a feature is gated for the current user.
 * Returns { allowed: bool, limit: number|null, message: string }
 */
function checkFeatureGate(feature, currentCount) {
  var plan = getUserPlan();
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
        ? "Free plan limit (" + limit + "). Upgrade to Pro for unlimited."
        : "Plan limit reached (" + limit + ")."
    };
  }
  return { allowed: true, limit: limit, message: "" };
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
  if (!resp.ok) throw new Error(`API ${resp.status}: ${resp.statusText}`);
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
    return '<img class="player-headshot" src="' + escapeAttr(url) + '" alt="" width="' + size + '" height="' + size + '" loading="lazy" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'flex\';">' +
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

  // Clean URL
  var cleanUrl = window.location.pathname + window.location.hash;
  window.history.replaceState({}, "", cleanUrl);

  // Show upgrade toast
  if (typeof _showToast === "function") {
    _showToast("processing your subscription...");
  }

  var token = localStorage.getItem("razzle_token");
  if (!token) return;

  var attempts = 0;
  var maxAttempts = 10;
  var pollInterval = 2000;

  function pollForPlanChange() {
    attempts++;
    fetch(API_BASE + "/api/auth/me", {
      headers: { "Authorization": "Bearer " + token }
    }).then(function(r) { return r.json(); }).then(function(data) {
      if (data.user && data.user.plan !== "free") {
        // Plan updated — save and dispatch event
        localStorage.setItem("razzle_user", JSON.stringify(data.user));
        updateAuthUI(data.user);
        window.dispatchEvent(new CustomEvent("razzle-plan-changed", { detail: data.user }));
        if (typeof _showToast === "function") {
          _showToast("welcome to Razzle " + data.user.plan.charAt(0).toUpperCase() + data.user.plan.slice(1) + ".");
        }
      } else if (attempts < maxAttempts) {
        setTimeout(pollForPlanChange, pollInterval);
      } else {
        // Give up — webhook may be delayed
        if (typeof _showToast === "function") {
          _showToast("subscription processing. features will unlock shortly.");
        }
      }
    }).catch(function() {
      if (attempts < maxAttempts) setTimeout(pollForPlanChange, pollInterval);
    });
  }

  setTimeout(pollForPlanChange, 1000);
}

function _injectAuthModal() {
  if (document.getElementById("authModal")) return;
  var modal = document.createElement("div");
  modal.id = "authModal";
  modal.className = "auth-modal-overlay";
  modal.style.display = "none";
  modal.innerHTML =
    '<div class="auth-modal">' +
      '<button class="auth-modal-close" onclick="closeAuthModal()">&times;</button>' +
      '<div class="auth-tabs">' +
        '<button class="auth-tab active" data-tab="login" onclick="switchAuthTab(\'login\')">Sign In</button>' +
        '<button class="auth-tab" data-tab="register" onclick="switchAuthTab(\'register\')">Register</button>' +
      '</div>' +
      '<form id="authLoginForm" class="auth-form" onsubmit="handleLogin(event)">' +
        '<input type="email" id="authLoginEmail" placeholder="Email" required autocomplete="email">' +
        '<input type="password" id="authLoginPassword" placeholder="Password" required autocomplete="current-password">' +
        '<div id="authLoginError" class="auth-error"></div>' +
        '<button type="submit" class="btn-chunky btn-primary auth-submit">Sign In</button>' +
      '</form>' +
      '<form id="authRegisterForm" class="auth-form" style="display:none" onsubmit="handleRegister(event)">' +
        '<input type="email" id="authRegisterEmail" placeholder="Email" required autocomplete="email">' +
        '<input type="password" id="authRegisterPassword" placeholder="Password (8+ chars)" required minlength="8" autocomplete="new-password">' +
        '<input type="password" id="authRegisterConfirm" placeholder="Confirm password" required minlength="8" autocomplete="new-password">' +
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

function openAuthModal() {
  var m = document.getElementById("authModal");
  if (m) {
    m.style.display = "flex";
    switchAuthTab("login");
    clearAuthErrors();
  }
}

function closeAuthModal() {
  var m = document.getElementById("authModal");
  if (m) m.style.display = "none";
}

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
    var data = await resp.json();
    if (!resp.ok) { errEl.textContent = data.error || data.detail || "Login failed"; return; }
    localStorage.setItem("razzle_token", data.token);
    localStorage.setItem("razzle_user", JSON.stringify(data.user));
    if (!data.user.sleeper_username) { showSleeperPrompt(); } else { closeAuthModal(); }
    updateAuthUI(data.user);
    migrateLocalFormulas();
  } catch (err) {
    errEl.textContent = "network fumble. try again.";
  }
}

async function handleRegister(e) {
  e.preventDefault();
  var email = document.getElementById("authRegisterEmail").value.trim();
  var password = document.getElementById("authRegisterPassword").value;
  var confirm = document.getElementById("authRegisterConfirm").value;
  var errEl = document.getElementById("authRegisterError");
  errEl.textContent = "";
  if (password !== confirm) { errEl.textContent = "Passwords don't match"; return; }
  if (password.length < 8) { errEl.textContent = "Password must be 8+ characters"; return; }
  try {
    var resp = await fetch(API_BASE + "/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email, password: password })
    });
    var data = await resp.json();
    if (!resp.ok) { errEl.textContent = data.error || data.detail || "Registration failed"; return; }
    localStorage.setItem("razzle_token", data.token);
    localStorage.setItem("razzle_user", JSON.stringify(data.user));
    if (!data.user.sleeper_username) { showSleeperPrompt(); } else { closeAuthModal(); }
    updateAuthUI(data.user);
    migrateLocalFormulas();
  } catch (err) {
    errEl.textContent = "network fumble. try again.";
  }
}

function signOut() {
  localStorage.removeItem("razzle_token");
  localStorage.removeItem("razzle_user");
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
      : escapeHtml(user.email.split("@")[0]);
    var isPaid = user.plan === "pro" || user.plan === "elite";
    var badge;
    if (user.plan === "elite") {
      badge = '<span class="nav-plan-badge nav-plan-elite">Elite</span>';
    } else if (user.plan === "pro") {
      badge = '<span class="nav-plan-badge nav-plan-pro">Pro</span>';
    } else {
      badge = '<span class="nav-plan-badge nav-plan-free">Free</span>';
    }

    // Dropdown menu items
    var dropdownItems = '';
    if (user.sleeper_username) {
      dropdownItems += '<div class="nav-dropdown-item" style="font-size:10px; color:var(--ink-light); cursor:default;">sleeper: ' + escapeHtml(user.sleeper_username) + '</div>';
    }
    if (isPaid) {
      dropdownItems += '<a href="#" onclick="openManageSubscription(); return false;" class="nav-dropdown-item">Manage Subscription</a>';
    } else {
      dropdownItems += '<a href="/agents.html#pricing" class="nav-dropdown-item" style="color:var(--orange);">Upgrade to Pro</a>';
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

    // Close dropdown on outside click
    document.addEventListener("click", function _closeDropdown(e) {
      var dd = item.querySelector(".nav-user-dropdown");
      if (dd && !dd.contains(e.target)) dd.classList.remove("open");
    });
  } else {
    item.innerHTML = '<a href="#" onclick="openAuthModal(); return false;" id="navSignIn" class="btn-chunky btn-sm">Sign In</a>';
  }
}

async function startCheckout(interval) {
  var token = localStorage.getItem("razzle_token");
  if (!token) { openAuthModal(); return; }

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
    var data = await resp.json();
    if (data.checkout_url) {
      window.location.href = data.checkout_url;
    } else {
      alert(data.error || "Could not start checkout");
    }
  } catch (e) {
    alert("network fumble. try again.");
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
    feedback.textContent = "Could not validate";
    feedback.style.color = "var(--ink-light)";
  }
}

async function openManageSubscription() {
  var token = localStorage.getItem("razzle_token");
  if (!token) return;
  try {
    var resp = await fetch(API_BASE + "/api/billing/status", {
      headers: { "Authorization": "Bearer " + token }
    });
    var data = await resp.json();
    if (data.portal_url) {
      window.location.href = data.portal_url;
    } else {
      alert("Subscription management not available");
    }
  } catch (e) {
    alert("Connection error");
  }
}

function showSleeperPrompt() {
  var modal = document.getElementById("authModal");
  if (!modal) return;
  var inner = modal.querySelector(".auth-modal");
  if (!inner) return;
  inner.innerHTML =
    '<button class="auth-modal-close" onclick="closeAuthModal()">&times;</button>' +
    '<div style="text-align:center; margin-bottom:16px;">' +
      '<div style="font-size:40px;">🐯</div>' +
      '<h3 style="font-family:var(--font-display); font-size:18px; margin-top:8px;">Connect Your Sleeper</h3>' +
      '<p style="font-family:var(--font-hand); font-size:16px; color:var(--ink-medium); margin-top:4px;">link your Sleeper username for league context</p>' +
    '</div>' +
    '<form onsubmit="handleSleeperLink(event)" style="display:flex; flex-direction:column; gap:10px;">' +
      '<input type="text" id="sleeperLinkInput" placeholder="Sleeper username" style="font-family:var(--font-mono); font-size:14px; padding:10px 14px; border:2px solid var(--ink); border-radius:8px; background:white;">' +
      '<div id="sleeperLinkError" style="font-family:var(--font-mono); font-size:12px; color:var(--red); min-height:16px;"></div>' +
      '<button type="submit" class="btn-chunky btn-primary auth-submit">Connect</button>' +
      '<a href="#" onclick="closeAuthModal(); return false;" style="text-align:center; font-family:var(--font-mono); font-size:12px; color:var(--ink-light);">skip for now</a>' +
    '</form>';
}

async function handleSleeperLink(e) {
  e.preventDefault();
  var username = document.getElementById("sleeperLinkInput").value.trim();
  var errEl = document.getElementById("sleeperLinkError");
  if (!username) { errEl.textContent = "Enter a username"; return; }
  errEl.textContent = "";
  try {
    var token = localStorage.getItem("razzle_token");
    var resp = await fetch(API_BASE + "/api/auth/link-sleeper", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": "Bearer " + token },
      body: JSON.stringify({ sleeper_username: username })
    });
    var data = await resp.json();
    if (!resp.ok) { errEl.textContent = data.error || "Invalid username"; return; }
    localStorage.setItem("razzle_user", JSON.stringify(data.user));
    localStorage.setItem("razzle_sleeper_user", username);
    updateAuthUI(data.user);
    closeAuthModal();
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
    _cmdResultsEl.innerHTML = '<div class="cmd-palette-status">pulling film...</div>';
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
    _cmdResultsEl.innerHTML = '<div class="cmd-palette-status">search failed</div>';
    _cmdItems = [];
    _cmdActiveIdx = -1;
  }
}

function renderCmdResults(items, sectionLabel) {
  if (!items.length) {
    _cmdResultsEl.innerHTML = '<div class="cmd-palette-status">no players found</div>';
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
  window.location.href = "/player/" + encodeURIComponent(player.player_id);
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
  localStorage.setItem("razzle_recent_players", JSON.stringify(recent));
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

  // Re-populate season selector if on Lab page (unlock all seasons)
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
});
