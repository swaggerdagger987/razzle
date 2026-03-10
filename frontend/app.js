/* Razzle — shared utilities */

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
  const token = localStorage.getItem("razzle_token");
  return token ? { "Authorization": "Bearer " + token } : {};
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
  var bgColor = POS_COLOR_MAP[pos] || "#8a8a9e";
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
    var isPro = user.plan === "pro";
    var badge = isPro
      ? '<span class="nav-plan-badge nav-plan-pro">Pro</span>'
      : '<span class="nav-plan-badge nav-plan-free">Free</span>';
    var manageLink = isPro
      ? '<a href="#" onclick="openManageSubscription(); return false;" class="nav-signout">Manage</a>'
      : '';
    item.innerHTML =
      '<span class="nav-user">' +
        badge +
        '<span class="nav-user-name">' + displayName + '</span>' +
        manageLink +
        '<a href="#" onclick="signOut(); return false;" class="nav-signout">Sign Out</a>' +
      '</span>';
  } else {
    item.innerHTML = '<a href="#" onclick="openAuthModal(); return false;" id="navSignIn">Sign In</a>';
  }
}

async function startCheckout(interval) {
  var token = localStorage.getItem("razzle_token");
  if (!token) { openAuthModal(); return; }
  try {
    var resp = await fetch(API_BASE + "/api/billing/create-checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": "Bearer " + token },
      body: JSON.stringify({ interval: interval || "year" })
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

// Auto-init auth on DOM ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initAuth);
} else {
  initAuth();
}
