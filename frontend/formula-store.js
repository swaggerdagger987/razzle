/* Razzle — Formula Store (API-backed) */

// Store state
const storeState = {
  formulas: [],        // Formulas from API
  search: "",
  posFilter: "ALL",
  sortBy: "popular",   // popular, rating, newest
  userRatings: {},      // { formulaId: rating } — localStorage cache
  installed: [],        // store IDs of installed formulas
  loading: false
};

// ---------------------------------------------------------------------------
// Init + Open/Close
// ---------------------------------------------------------------------------

function loadStoreLocalState() {
  try { storeState.userRatings = JSON.parse(localStorage.getItem("razzle_store_ratings") || "{}"); } catch (e) { storeState.userRatings = {}; }
  try { storeState.installed = JSON.parse(localStorage.getItem("razzle_store_installed") || "[]"); } catch (e) { storeState.installed = []; }
}

async function fetchStoreFormulas() {
  storeState.loading = true;
  renderFormulaStore();

  const params = new URLSearchParams();
  if (storeState.posFilter !== "ALL") params.set("position", storeState.posFilter);
  params.set("sort", storeState.sortBy);
  if (storeState.search) params.set("search", storeState.search);
  params.set("limit", "100");

  try {
    const resp = await fetch(`/api/formulas/store?${params}`);
    if (!resp.ok) throw new Error("store fetch failed: " + resp.status);
    const data = await resp.json();
    storeState.formulas = (data.formulas || []).map(f => ({
      id: f.id,
      name: f.name,
      description: f.description,
      positions: f.position_tags || [],
      creator: f.creator_name || "anonymous",
      createdAt: f.created_at || "",
      avgRating: Number(f.avg_rating) || 0,
      ratingCount: Number(f.rating_count) || 0
    }));
  } catch (e) {
    console.error("Formula store fetch failed:", e);
    storeState.formulas = [];
  }
  storeState.loading = false;
  renderFormulaStore();
}

async function openFormulaStore() {
  loadStoreLocalState();
  document.getElementById("storeOverlay").classList.add("open");
  storeState.search = "";
  storeState.posFilter = "ALL";
  storeState.sortBy = "popular";
  await fetchStoreFormulas();
}

function closeFormulaStore(e) {
  if (e && e.target !== e.currentTarget) return;
  document.getElementById("storeOverlay").classList.remove("open");
}

// ---------------------------------------------------------------------------
// Filters + Sort (re-fetch from API)
// ---------------------------------------------------------------------------

let _storeSearchTimer = null;
function setStoreSearch(val) {
  storeState.search = val.toLowerCase();
  clearTimeout(_storeSearchTimer);
  _storeSearchTimer = setTimeout(() => fetchStoreFormulas(), 300);
}

function setStorePosFilter(pos) {
  storeState.posFilter = pos;
  fetchStoreFormulas();
}

function setStoreSort(sortBy) {
  storeState.sortBy = sortBy;
  fetchStoreFormulas();
}

// ---------------------------------------------------------------------------
// Stars rendering
// ---------------------------------------------------------------------------

function renderStars(rating, size = 14) {
  let html = "";
  const full = Math.floor(rating);
  const half = rating - full >= 0.3;
  for (let i = 0; i < 5; i++) {
    if (i < full) html += `<span style="color:var(--yellow); font-size:${size}px;">&#9733;</span>`;
    else if (i === full && half) html += `<span style="color:var(--yellow); font-size:${size}px;">&#9733;</span>`;
    else html += `<span style="color:var(--ink-light); font-size:${size}px;">&#9734;</span>`;
  }
  return html;
}

function renderClickableStars(formulaId, currentRating, size = 18) {
  let html = "";
  const safeId = parseInt(formulaId) || 0;
  const safeRating = Math.round(currentRating) || 0;
  for (let i = 1; i <= 5; i++) {
    const filled = i <= safeRating;
    html += `<span
      style="color:${filled ? "var(--yellow)" : "var(--ink-faint)"}; font-size:${size}px; cursor:pointer;"
      onclick="rateFormula(${safeId}, ${i})"
      onmouseenter="previewStars(this, ${i})"
      onmouseleave="resetStars(this, ${safeRating})"
    >&#9733;</span>`;
  }
  return html;
}

function previewStars(el, rating) {
  const stars = el.parentElement.querySelectorAll("span");
  stars.forEach((s, i) => { s.style.color = i < rating ? "var(--yellow)" : "var(--ink-faint)"; });
}

function resetStars(el, rating) {
  const stars = el.parentElement.querySelectorAll("span");
  stars.forEach((s, i) => { s.style.color = i < rating ? "var(--yellow)" : "var(--ink-faint)"; });
}

// ---------------------------------------------------------------------------
// Rate formula (API call)
// ---------------------------------------------------------------------------

var _ratingInProgress = {};
async function rateFormula(formulaId, rating) {
  if (!_isStorePaidUser()) {
    showStoreToast("upgrade to Pro to rate formulas");
    return;
  }
  if (_ratingInProgress[formulaId]) return;
  _ratingInProgress[formulaId] = true;
  // Optimistic update
  storeState.userRatings[formulaId] = rating;
  try { localStorage.setItem("razzle_store_ratings", JSON.stringify(storeState.userRatings)); } catch (e) {}
  renderFormulaStore();

  try {
    const resp = await fetch(`/api/formulas/${formulaId}/rate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating })
    });
    if (!resp.ok) {
      showStoreToast("fumbled the rating... try again.");
      return;
    }
    const data = await resp.json();
    if (data.status === "ok") {
      // Refresh to get updated avg
      await fetchStoreFormulas();
    }
  } catch (e) {
    console.error("Rate formula failed:", e);
  } finally {
    _ratingInProgress[formulaId] = false;
  }
}

async function submitReview(formulaId) {
  const input = document.getElementById("review_" + formulaId);
  if (!input) return;
  const text = input.value.trim();
  if (!text) return;

  const rating = storeState.userRatings[formulaId] || 5;

  try {
    const resp = await fetch(`/api/formulas/${formulaId}/rate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating, review: text })
    });
    if (!resp.ok) { showStoreToast("fumbled the review... try again."); return; }
    const data = await resp.json();
    if (data.status === "ok") {
      // Mark review submitted in localStorage so we don't show input again
      let reviews = {};
      try { reviews = JSON.parse(localStorage.getItem("razzle_store_reviews") || "{}"); } catch (e) { reviews = {}; }
      reviews[formulaId] = { rating, text };
      try { localStorage.setItem("razzle_store_reviews", JSON.stringify(reviews)); } catch (e) {}
      await fetchStoreFormulas();
    }
  } catch (e) {
    console.error("Submit review failed:", e);
  }
}

// ---------------------------------------------------------------------------
// Install formula (fetch detail from API, add to localStorage)
// ---------------------------------------------------------------------------

async function installFormula(formulaId) {
  if (!_isStorePaidUser()) {
    showStoreToast("upgrade to Pro to import formulas");
    if (typeof openAuthModal === "function") openAuthModal();
    return;
  }
  try {
    const resp = await fetch(`/api/formulas/${formulaId}`);
    if (!resp.ok) {
      showStoreToast("couldn't pull that formula... try again.");
      return;
    }
    const formula = await resp.json();
    if (formula.status === "not_found") return;

    // Add to installed list
    if (!storeState.installed.includes(formulaId)) {
      storeState.installed.push(formulaId);
      try { localStorage.setItem("razzle_store_installed", JSON.stringify(storeState.installed)); } catch (e) {}
    }

    // Convert stat_weights to components format
    const components = Object.entries(formula.stat_weights || {}).map(([stat, weight]) => ({
      stat,
      weight: typeof weight === "number" ? weight : parseFloat(weight) || 0
    }));

    // Add to user's formulas if not already there
    const existing = state.formulas.find(f => f.name === formula.name);
    if (!existing) {
      state.formulas.push({
        name: formula.name,
        components,
        fromStore: true,
        storeId: formulaId
      });
      try { localStorage.setItem("razzle_formulas", JSON.stringify(state.formulas)); } catch (e) {}

      // Register column
      const key = `formula_${formula.name.toLowerCase().replace(/[^a-z0-9]/g, "_")}`;
      if (typeof COLUMNS !== "undefined") {
        COLUMNS[key] = { label: escapeHtml(formula.name), group: "Formulas", decimals: 1 };
        if (!state.visibleColumns.includes(key)) {
          state.visibleColumns.push(key);
        }
      }
      if (typeof computeFormulaValues === "function") computeFormulaValues();
      if (typeof renderTable === "function") renderTable();
      if (typeof renderColumnPicker === "function") renderColumnPicker();
    }

    // Toast
    showStoreToast("formula imported.");
    renderFormulaStore();
  } catch (e) {
    console.error("Install formula failed:", e);
    showStoreToast("fumbled the import. try again.");
  }
}

function uninstallFormula(formulaId) {
  const formula = storeState.formulas.find(f => f.id === formulaId);
  if (!formula) return;

  storeState.installed = storeState.installed.filter(id => id !== formulaId);
  try { localStorage.setItem("razzle_store_installed", JSON.stringify(storeState.installed)); } catch (e) {}

  // Remove from user formulas
  state.formulas = state.formulas.filter(f => f.name !== formula.name);
  try { localStorage.setItem("razzle_formulas", JSON.stringify(state.formulas)); } catch (e) {}

  const key = `formula_${formula.name.toLowerCase().replace(/[^a-z0-9]/g, "_")}`;
  if (typeof COLUMNS !== "undefined") delete COLUMNS[key];
  state.visibleColumns = state.visibleColumns.filter(k => k !== key);
  if (typeof renderTable === "function") renderTable();
  if (typeof renderColumnPicker === "function") renderColumnPicker();
  renderFormulaStore();
}

function showStoreToast(msg) {
  let toast = document.getElementById("storeToast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "storeToast";
    toast.style.cssText = `
      position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
      background: var(--ink); color: var(--bg); padding: 10px 24px;
      border-radius: 8px; font-family: var(--font-mono); font-size: 14px;
      z-index: 10000; box-shadow: 4px 4px 0 var(--ink);
      transition: opacity 0.3s; pointer-events: none;
    `;
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.style.opacity = "1";
  setTimeout(() => { toast.style.opacity = "0"; }, 2500);
}

// ---------------------------------------------------------------------------
// Publishing Flow (API-backed)
// ---------------------------------------------------------------------------

function isFormulaPublished(name) {
  // Check localStorage cache of published names
  let published = [];
  try { published = JSON.parse(localStorage.getItem("razzle_store_my_published") || "[]"); } catch (e) {}
  return published.includes(name);
}

function openPublishFlow(formulaName) {
  if (!_isStorePaidUser()) {
    showStoreToast("upgrade to Pro to publish formulas");
    if (typeof openAuthModal === "function") openAuthModal();
    return;
  }
  const formula = state.formulas.find(f => f.name === formulaName);
  if (!formula) return;

  // Close formula builder, open publish modal
  const formulaOverlay = document.getElementById("formulaOverlay");
  if (formulaOverlay) formulaOverlay.classList.remove("open");

  const overlay = document.getElementById("publishOverlay");
  if (!overlay) return;
  overlay.classList.add("open");

  // Populate publish form
  var pubName = document.getElementById("publishName");
  var pubDesc = document.getElementById("publishDescription");
  var pubCreator = document.getElementById("publishCreator");
  if (pubName) pubName.value = formula.name;
  if (pubDesc) pubDesc.value = "";
  if (pubCreator) pubCreator.value = localStorage.getItem("razzle_store_username") || "";

  // Reset position checkboxes
  document.querySelectorAll(".publish-pos-check").forEach(cb => cb.checked = false);

  // Store which formula we're publishing
  overlay.dataset.formulaName = formula.name;
}

function closePublishFlow(e) {
  if (e && e.target !== e.currentTarget) return;
  document.getElementById("publishOverlay").classList.remove("open");
}

async function submitPublish() {
  var publishBtn = document.querySelector('.publish-submit-btn');
  if (publishBtn && publishBtn.disabled) return;
  if (publishBtn) { publishBtn.disabled = true; publishBtn.textContent = 'publishing...'; }

  const overlay = document.getElementById("publishOverlay");
  const formulaName = overlay.dataset.formulaName;
  const formula = state.formulas.find(f => f.name === formulaName);
  if (!formula) { if (publishBtn) { publishBtn.disabled = false; publishBtn.textContent = 'Publish'; } return; }

  const name = document.getElementById("publishName").value.trim();
  const description = document.getElementById("publishDescription").value.trim();
  const creator = document.getElementById("publishCreator").value.trim();

  // Clear previous validation state
  ["publishName","publishDescription","publishCreator"].forEach(function(id) {
    var el = document.getElementById(id);
    if (el) { el.removeAttribute("aria-invalid"); el.style.borderColor = ""; }
  });
  var publishErr = document.getElementById("publishError");
  if (publishErr) publishErr.textContent = "";

  if (!name || !description || !creator) {
    var missing = [];
    if (!name) { missing.push("formula name"); document.getElementById("publishName").setAttribute("aria-invalid","true"); }
    if (!description) { missing.push("description"); document.getElementById("publishDescription").setAttribute("aria-invalid","true"); }
    if (!creator) { missing.push("your name"); document.getElementById("publishCreator").setAttribute("aria-invalid","true"); }
    if (publishErr) publishErr.textContent = "missing: " + missing.join(", ");
    return;
  }

  // Get selected positions
  const positions = [];
  document.querySelectorAll(".publish-pos-check:checked").forEach(cb => {
    positions.push(cb.value);
  });
  if (!positions.length) positions.push("QB", "RB", "WR", "TE");

  // Save creator name for future
  try { localStorage.setItem("razzle_store_username", creator); } catch (e) {}

  // Check duplicate
  if (isFormulaPublished(name)) {
    showStoreToast("already published this formula.");
    closePublishFlow();
    return;
  }

  // Convert components to stat_weights object
  const stat_weights = {};
  (formula.components || []).forEach(c => {
    stat_weights[c.stat] = c.weight;
  });

  try {
    var authHeaders = typeof getAuthHeaders === "function" ? getAuthHeaders() : {};
    const resp = await fetch("/api/formulas/publish", {
      method: "POST",
      headers: Object.assign({ "Content-Type": "application/json" }, authHeaders),
      body: JSON.stringify({
        name,
        description,
        position_tags: positions,
        stat_weights,
        creator_name: creator
      })
    });
    if (resp.status === 401) {
      showStoreToast("Sign in to publish formulas");
      if (typeof openAuthModal === "function") openAuthModal();
      return;
    }
    if (!resp.ok) {
      try { var errData = await resp.json(); showStoreToast(errData.message || "couldn't publish. try again."); }
      catch(_) { showStoreToast("couldn't publish. try again."); }
      return;
    }
    const data = await resp.json();
    if (data.status === "ok") {
      // Track locally
      let myPublished = [];
      try { myPublished = JSON.parse(localStorage.getItem("razzle_store_my_published") || "[]"); } catch (e) {}
      if (!myPublished.includes(name)) myPublished.push(name);
      try { localStorage.setItem("razzle_store_my_published", JSON.stringify(myPublished)); } catch (e) {}

      closePublishFlow();
      showStoreToast("published to the Formula Store.");

      // Re-render saved formulas to show "Published" badge
      if (typeof renderSavedFormulas === "function") renderSavedFormulas();
    } else {
      showStoreToast(data.message || "couldn't publish. Razzle's on it.");
    }
  } catch (e) {
    console.error("Publish failed:", e);
    showStoreToast("couldn't publish. Razzle's on it.");
  } finally {
    if (publishBtn) { publishBtn.disabled = false; publishBtn.textContent = 'Publish'; }
  }
}

// ---------------------------------------------------------------------------
// Render
// ---------------------------------------------------------------------------

function renderFormulaStore() {
  const container = document.getElementById("storeContent");
  if (!container) return;

  const formulas = storeState.formulas;
  let userReviews = {};
  try { userReviews = JSON.parse(localStorage.getItem("razzle_store_reviews") || "{}"); } catch (e) {}

  // Position filter chips
  const positions = ["ALL", "QB", "RB", "WR", "TE"];
  const posChips = positions.map(p => {
    const active = storeState.posFilter === p;
    return `<span class="chip${active ? " active" : ""}" data-pos="${p}" onclick="setStorePosFilter('${p}')">${p}</span>`;
  }).join("");

  // Sort buttons
  const sorts = [
    { key: "popular", label: "Popular" },
    { key: "rating", label: "Top Rated" },
    { key: "newest", label: "Newest" }
  ];
  const sortBtns = sorts.map(s =>
    `<button class="btn-chunky${storeState.sortBy === s.key ? " active" : ""}" onclick="setStoreSort('${s.key}')">${s.label}</button>`
  ).join("");

  // Formula cards
  let cardsHtml = "";
  if (storeState.loading) {
    cardsHtml = `<div style="text-align:center; padding:40px; grid-column:1/-1;">
      <p style="font-family:var(--font-hand); font-size:20px; color:var(--ink-light);">pulling formulas...</p>
    </div>`;
  } else if (!formulas.length) {
    cardsHtml = `<div style="text-align:center; padding:40px; grid-column:1/-1;">
      <p style="font-family:var(--font-hand); font-size:20px; color:var(--ink-light);">no formulas match your filters</p>
    </div>`;
  } else {
    cardsHtml = formulas.map(f => renderFormulaCard(f, userReviews)).join("");
  }

  container.innerHTML = `
    <div class="store-controls">
      <div class="store-search-row">
        <input type="search" class="input-chunky" placeholder="search formulas..."
          value="${escapeAttr(storeState.search)}" oninput="setStoreSearch(this.value)"
          autocomplete="off" style="flex:1; max-width:300px;">
        <div style="display:flex; gap:4px;">${posChips}</div>
      </div>
      <div class="store-sort-row">
        <span style="font-family:var(--font-mono); font-size:11px; text-transform:uppercase; color:var(--ink-light); letter-spacing:1px;">Sort by</span>
        ${sortBtns}
        <span style="font-family:var(--font-mono); font-size:11px; color:var(--ink-light); margin-left:auto;">${formulas.length} formula${formulas.length !== 1 ? "s" : ""}</span>
      </div>
    </div>
    <div class="store-grid">
      ${cardsHtml}
    </div>
  `;
}

function _isStorePaidUser() {
  // Check if user has Pro or Elite plan
  if (typeof isPaidUser === "function") return isPaidUser();
  try {
    var user = JSON.parse(localStorage.getItem("razzle_user") || "{}");
    return user.plan === "pro" || user.plan === "elite" || user.plan === "pro_lifetime" || user.plan === "elite_lifetime";
  } catch (e) { return false; }
}

function renderFormulaCard(formula, userReviews) {
  const isInstalled = storeState.installed.includes(formula.id);
  const userRating = storeState.userRatings[formula.id] || 0;
  const existingUserReview = (userReviews || {})[formula.id] || null;
  const paid = _isStorePaidUser();

  // Position tags
  const validPositions = ["QB", "RB", "WR", "TE"];
  const posTags = (formula.positions || []).filter(p => validPositions.includes(p)).map(p => {
    const colors = { QB: "var(--pos-qb)", RB: "var(--pos-rb)", WR: "var(--pos-wr)", TE: "var(--pos-te)" };
    return `<span style="font-family:var(--font-mono); font-size:11px; font-weight:700; padding:1px 6px; border-radius:8px; border:2px solid var(--ink); background:${colors[p]}; color:var(--text-on-accent); text-transform:uppercase;">${escapeHtml(p)}</span>`;
  }).join(" ");

  // Free user: description is partially blurred, actions are gated
  const descriptionHtml = paid
    ? `<p style="font-family:var(--font-mono); font-size:12px; color:var(--ink-medium); margin:10px 0; line-height:1.4;">${escapeHtml(formula.description)}</p>`
    : `<p style="font-family:var(--font-mono); font-size:12px; color:var(--ink-medium); margin:10px 0; line-height:1.4; position:relative;">
        <span style="filter:blur(3px); user-select:none; pointer-events:none;" aria-hidden="true">${escapeHtml(formula.description)}</span>
        <span class="sr-only">Formula description hidden — upgrade to Pro to view</span>
       </p>`;

  // Actions section: full for paid, upgrade CTA for free
  let actionsHtml = "";
  if (paid) {
    actionsHtml = `
      <div style="margin-top:10px; padding-top:10px; border-top:2px dashed var(--ink-faint);">
        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:6px;">
          <div style="display:flex; align-items:center; gap:4px;">
            <span style="font-family:var(--font-mono); font-size:11px; color:var(--ink-light);">rate:</span>
            ${renderClickableStars(formula.id, userRating, 16)}
          </div>
          ${isInstalled
            ? `<button class="btn-chunky" style="font-size:11px; padding:4px 10px; background:var(--green-light); border-color:var(--green);" onclick="uninstallFormula(${parseInt(formula.id) || 0})">Installed</button>`
            : `<button class="btn-primary" style="font-size:11px; padding:4px 10px;" onclick="installFormula(${parseInt(formula.id) || 0})">Import</button>`
          }
        </div>
        ${userRating > 0 && !existingUserReview ? `
          <div style="display:flex; gap:4px; align-items:center;">
            <input type="text" class="input-chunky" placeholder="leave a short review..."
              style="flex:1; font-size:11px; padding:4px 8px;"
              id="review_${parseInt(formula.id) || 0}"
              onkeydown="if(event.key==='Enter') submitReview(${parseInt(formula.id) || 0})">
            <button class="btn-chunky" style="font-size:11px; padding:3px 8px;" onclick="submitReview(${parseInt(formula.id) || 0})">Post</button>
          </div>
        ` : ""}
        ${existingUserReview ? `
          <div style="font-family:var(--font-mono); font-size:11px; color:var(--ink-medium); margin-top:4px;">
            your review: "${escapeHtml(existingUserReview.text)}"
          </div>
        ` : ""}
      </div>`;
  } else {
    actionsHtml = `
      <div style="margin-top:10px; padding-top:10px; border-top:2px dashed var(--ink-faint); text-align:center;">
        <div style="font-family:var(--font-hand); font-size:14px; color:var(--ink-light); margin-bottom:6px;">
          import, rate, and review with Pro
        </div>
        <button class="btn-primary" style="font-size:11px; padding:5px 14px;" onclick="if(typeof openAuthModal==='function') openAuthModal(); else window.location.href='/pricing.html';">
          Unlock with Pro
        </button>
      </div>`;
  }

  return `
    <div class="store-card">
      <div class="store-card-header">
        <div style="flex:1; min-width:0;">
          <div style="font-family:var(--font-display); font-size:16px; line-height:1.2; margin-bottom:4px;">${escapeHtml(formula.name)}</div>
          <div style="font-family:var(--font-mono); font-size:11px; color:var(--ink-light);">by ${escapeHtml(formula.creator)}</div>
        </div>
        <div style="display:flex; gap:3px; flex-shrink:0;">${posTags}</div>
      </div>
      ${descriptionHtml}
      <div class="store-card-footer">
        <div style="display:flex; align-items:center; gap:6px;">
          ${renderStars(formula.avgRating || 0)}
          <span style="font-family:var(--font-mono); font-size:11px; color:var(--ink-light);">${(formula.avgRating || 0).toFixed(1)} (${formula.ratingCount || 0})</span>
        </div>
      </div>
      ${actionsHtml}
    </div>
  `;
}
