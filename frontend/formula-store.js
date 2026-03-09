/* Razzle — Formula Store */

// Seed formulas — pre-built community formulas that ship with the store
const SEED_FORMULAS = [
  {
    id: "seed_ppr_workhorse",
    name: "PPR Workhorse",
    creator: "Razzle Labs",
    description: "Identifies high-volume PPR assets. Weights receptions and targets heavily alongside rushing volume.",
    positions: ["RB", "WR"],
    components: [
      { stat: "receptions", weight: 30 },
      { stat: "targets", weight: 25 },
      { stat: "rushing_yards", weight: 20 },
      { stat: "receiving_yards", weight: 15 },
      { stat: "rushing_tds", weight: 10 }
    ],
    installs: 847,
    ratings: [5, 5, 4, 5, 4, 5, 5, 4, 5, 5],
    reviews: [
      { author: "dynasty_gm_42", rating: 5, text: "Best RB screener filter I've found." },
      { author: "ff_nerd_2026", rating: 4, text: "Solid for finding PPR backs. Would add catch rate." }
    ],
    createdAt: "2026-02-15"
  },
  {
    id: "seed_alpha_wr",
    name: "Alpha WR Score",
    creator: "Razzle Labs",
    description: "Finds true WR1 alphas. Combines target share, air yards, and touchdown upside.",
    positions: ["WR"],
    components: [
      { stat: "targets", weight: 25 },
      { stat: "receiving_yards", weight: 25 },
      { stat: "receiving_tds", weight: 20 },
      { stat: "receptions", weight: 15 },
      { stat: "receiving_fumbles_lost", weight: -5 },
      { stat: "receiving_yards_after_catch", weight: 10 }
    ],
    installs: 1203,
    ratings: [5, 5, 5, 4, 5, 5, 4, 5, 5, 5, 4, 5],
    reviews: [
      { author: "wr_factory", rating: 5, text: "Nailed it. This is how you find WR1s." },
      { author: "trade_shark", rating: 5, text: "Use this before every trade. Essential." }
    ],
    createdAt: "2026-02-10"
  },
  {
    id: "seed_qb_dual_threat",
    name: "Dual Threat QB",
    creator: "Razzle Labs",
    description: "Scores QBs who contribute with both arm and legs. Rushing floor matters in fantasy.",
    positions: ["QB"],
    components: [
      { stat: "passing_yards", weight: 25 },
      { stat: "passing_tds", weight: 20 },
      { stat: "rushing_yards", weight: 25 },
      { stat: "rushing_tds", weight: 15 },
      { stat: "interceptions", weight: -15 }
    ],
    installs: 634,
    ratings: [5, 4, 4, 5, 3, 5, 4, 4],
    reviews: [
      { author: "lamar_stan", rating: 5, text: "Finally a QB formula that respects rushing." }
    ],
    createdAt: "2026-02-20"
  },
  {
    id: "seed_bellcow",
    name: "Bellcow Index",
    creator: "Razzle Labs",
    description: "Pure rushing workload. Identifies true three-down backs with volume and TD upside.",
    positions: ["RB"],
    components: [
      { stat: "rushing_yards", weight: 30 },
      { stat: "carries", weight: 25 },
      { stat: "rushing_tds", weight: 20 },
      { stat: "rushing_first_downs", weight: 15 },
      { stat: "rushing_fumbles_lost", weight: -10 }
    ],
    installs: 521,
    ratings: [4, 5, 5, 4, 4, 5, 5],
    reviews: [
      { author: "smash_mouth", rating: 5, text: "Old school. Love it." }
    ],
    createdAt: "2026-02-18"
  },
  {
    id: "seed_td_machine",
    name: "TD Machine",
    creator: "Razzle Labs",
    description: "Pure touchdown upside across all scoring methods. Boom-or-bust by design.",
    positions: ["QB", "RB", "WR", "TE"],
    components: [
      { stat: "passing_tds", weight: 30 },
      { stat: "rushing_tds", weight: 35 },
      { stat: "receiving_tds", weight: 35 }
    ],
    installs: 412,
    ratings: [4, 3, 5, 4, 4, 5],
    reviews: [
      { author: "redzone_only", rating: 5, text: "Perfect for standard leagues. TDs are king." },
      { author: "ppr_purist", rating: 3, text: "Too TD-dependent for PPR but fun to sort by." }
    ],
    createdAt: "2026-03-01"
  },
  {
    id: "seed_target_hog",
    name: "Target Hog",
    creator: "Razzle Labs",
    description: "Volume is king in PPR. Finds players commanding the highest target share on their team.",
    positions: ["WR", "TE", "RB"],
    components: [
      { stat: "targets", weight: 35 },
      { stat: "receptions", weight: 30 },
      { stat: "receiving_yards", weight: 20 },
      { stat: "receiving_first_downs", weight: 15 }
    ],
    installs: 389,
    ratings: [5, 4, 5, 5, 4, 5, 4],
    reviews: [
      { author: "ppr_king", rating: 5, text: "This is the way. Volume over efficiency every time." }
    ],
    createdAt: "2026-02-25"
  },
  {
    id: "seed_te_premium",
    name: "TE Premium",
    creator: "Razzle Labs",
    description: "Identifies the rare TEs who actually produce. Receiving volume + TD upside weighted for TE scarcity.",
    positions: ["TE"],
    components: [
      { stat: "receptions", weight: 30 },
      { stat: "receiving_yards", weight: 25 },
      { stat: "targets", weight: 20 },
      { stat: "receiving_tds", weight: 25 }
    ],
    installs: 298,
    ratings: [5, 5, 4, 5, 5],
    reviews: [
      { author: "te_whisperer", rating: 5, text: "Kelce and Andrews at the top. Checks out." }
    ],
    createdAt: "2026-02-28"
  },
  {
    id: "seed_dynasty_value",
    name: "Dynasty Value Score",
    creator: "Razzle Labs",
    description: "Long-term dynasty asset evaluation. Balances current production with age-adjusted upside.",
    positions: ["QB", "RB", "WR", "TE"],
    components: [
      { stat: "fantasy_points_ppr", weight: 35 },
      { stat: "receiving_yards", weight: 20 },
      { stat: "rushing_yards", weight: 15 },
      { stat: "passing_yards", weight: 15 },
      { stat: "receptions", weight: 15 }
    ],
    installs: 756,
    ratings: [5, 4, 5, 5, 4, 5, 4, 5, 5],
    reviews: [
      { author: "dynasty_or_die", rating: 5, text: "My go-to for evaluating dynasty trades." },
      { author: "rebuild_szn", rating: 4, text: "Good baseline. I tweak the weights for my league." }
    ],
    createdAt: "2026-02-12"
  },
  {
    id: "seed_yac_monster",
    name: "YAC Monster",
    creator: "Razzle Labs",
    description: "Explosive playmakers who create after the catch. The fun players to own.",
    positions: ["WR", "RB", "TE"],
    components: [
      { stat: "receiving_yards_after_catch", weight: 40 },
      { stat: "receiving_yards", weight: 25 },
      { stat: "receptions", weight: 20 },
      { stat: "receiving_tds", weight: 15 }
    ],
    installs: 334,
    ratings: [5, 5, 4, 5, 4],
    reviews: [
      { author: "yac_king", rating: 5, text: "Deebo and AJ Brown at the top. Perfect." }
    ],
    createdAt: "2026-03-02"
  },
  {
    id: "seed_pocket_passer",
    name: "Pocket Passer",
    creator: "Razzle Labs",
    description: "Traditional pocket QB evaluation. Pure passing efficiency and volume.",
    positions: ["QB"],
    components: [
      { stat: "passing_yards", weight: 30 },
      { stat: "passing_tds", weight: 30 },
      { stat: "completions", weight: 15 },
      { stat: "interceptions", weight: -25 }
    ],
    installs: 267,
    ratings: [4, 4, 5, 4, 5],
    reviews: [
      { author: "old_school_gm", rating: 5, text: "Clean way to rank traditional QBs." }
    ],
    createdAt: "2026-03-03"
  }
];

// Store state
const storeState = {
  formulas: [],        // All formulas (seed + user-published)
  search: "",
  posFilter: "ALL",
  sortBy: "popular",   // popular, rating, newest
  userRatings: {},      // { formulaId: rating }
  userReviews: {},      // { formulaId: { rating, text } }
  installed: []         // IDs of installed formulas
};

function initFormulaStore() {
  // Load user-published formulas
  const userPublished = JSON.parse(localStorage.getItem("razzle_store_published") || "[]");
  const userRatings = JSON.parse(localStorage.getItem("razzle_store_ratings") || "{}");
  const userReviews = JSON.parse(localStorage.getItem("razzle_store_reviews") || "{}");
  const installed = JSON.parse(localStorage.getItem("razzle_store_installed") || "[]");

  storeState.formulas = [...SEED_FORMULAS, ...userPublished];
  storeState.userRatings = userRatings;
  storeState.userReviews = userReviews;
  storeState.installed = installed;
}

function openFormulaStore() {
  initFormulaStore();
  document.getElementById("storeOverlay").classList.add("open");
  renderFormulaStore();
}

function closeFormulaStore(e) {
  if (e && e.target !== e.currentTarget) return;
  document.getElementById("storeOverlay").classList.remove("open");
}

function setStoreSearch(val) {
  storeState.search = val.toLowerCase();
  renderFormulaStore();
}

function setStorePosFilter(pos) {
  storeState.posFilter = pos;
  renderFormulaStore();
}

function setStoreSort(sortBy) {
  storeState.sortBy = sortBy;
  renderFormulaStore();
}

function getAvgRating(formula) {
  const allRatings = [...(formula.ratings || [])];
  // Add user review rating if exists
  const userReview = storeState.userReviews[formula.id];
  if (userReview) allRatings.push(userReview.rating);
  // Add standalone user rating if exists and no review
  else if (storeState.userRatings[formula.id]) allRatings.push(storeState.userRatings[formula.id]);
  if (!allRatings.length) return 0;
  return allRatings.reduce((a, b) => a + b, 0) / allRatings.length;
}

function getRatingCount(formula) {
  let count = (formula.ratings || []).length + (formula.reviews || []).length;
  if (storeState.userRatings[formula.id] || storeState.userReviews[formula.id]) count++;
  // Avoid double-counting: ratings array already includes review ratings in seed data
  // Seed formulas have separate ratings array and reviews array
  // For seed, total = ratings.length (includes all)
  count = (formula.ratings || []).length;
  if (storeState.userRatings[formula.id] || storeState.userReviews[formula.id]) count++;
  return count;
}

function getFilteredFormulas() {
  let formulas = [...storeState.formulas];

  // Search filter
  if (storeState.search) {
    formulas = formulas.filter(f =>
      f.name.toLowerCase().includes(storeState.search) ||
      f.description.toLowerCase().includes(storeState.search) ||
      f.creator.toLowerCase().includes(storeState.search)
    );
  }

  // Position filter
  if (storeState.posFilter !== "ALL") {
    formulas = formulas.filter(f => f.positions.includes(storeState.posFilter));
  }

  // Sort
  switch (storeState.sortBy) {
    case "popular":
      formulas.sort((a, b) => (b.installs || 0) - (a.installs || 0));
      break;
    case "rating":
      formulas.sort((a, b) => getAvgRating(b) - getAvgRating(a));
      break;
    case "newest":
      formulas.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
      break;
  }

  return formulas;
}

function renderStars(rating, size = 14) {
  let html = "";
  const full = Math.floor(rating);
  const half = rating - full >= 0.3;
  for (let i = 0; i < 5; i++) {
    if (i < full) html += `<span style="color:var(--yellow); font-size:${size}px;">&#9733;</span>`;
    else if (i === full && half) html += `<span style="color:var(--yellow); font-size:${size}px;">&#9733;</span>`;
    else html += `<span style="color:var(--ink-faint); font-size:${size}px;">&#9734;</span>`;
  }
  return html;
}

function renderClickableStars(formulaId, currentRating, size = 18) {
  let html = "";
  for (let i = 1; i <= 5; i++) {
    const filled = i <= currentRating;
    html += `<span
      style="color:${filled ? "var(--yellow)" : "var(--ink-faint)"}; font-size:${size}px; cursor:pointer;"
      onclick="rateFormula('${formulaId}', ${i})"
      onmouseenter="previewStars(this, ${i})"
      onmouseleave="resetStars(this, ${currentRating})"
    >&#9733;</span>`;
  }
  return html;
}

function previewStars(el, rating) {
  const container = el.parentElement;
  const stars = container.querySelectorAll("span");
  stars.forEach((s, i) => {
    s.style.color = i < rating ? "var(--yellow)" : "var(--ink-faint)";
  });
}

function resetStars(el, rating) {
  const container = el.parentElement;
  const stars = container.querySelectorAll("span");
  stars.forEach((s, i) => {
    s.style.color = i < rating ? "var(--yellow)" : "var(--ink-faint)";
  });
}

function rateFormula(formulaId, rating) {
  storeState.userRatings[formulaId] = rating;
  localStorage.setItem("razzle_store_ratings", JSON.stringify(storeState.userRatings));
  renderFormulaStore();
}

function installFormula(formulaId) {
  const formula = storeState.formulas.find(f => f.id === formulaId);
  if (!formula) return;

  // Add to installed list
  if (!storeState.installed.includes(formulaId)) {
    storeState.installed.push(formulaId);
    localStorage.setItem("razzle_store_installed", JSON.stringify(storeState.installed));
  }

  // Add to user's formulas (same format as formula builder)
  const existing = state.formulas.find(f => f.name === formula.name);
  if (!existing) {
    state.formulas.push({
      name: formula.name,
      components: formula.components.map(c => ({ stat: c.stat, weight: c.weight })),
      fromStore: true,
      storeId: formulaId
    });
    localStorage.setItem("razzle_formulas", JSON.stringify(state.formulas));

    // Register column
    const key = `formula_${formula.name.toLowerCase().replace(/[^a-z0-9]/g, "_")}`;
    COLUMNS[key] = { label: formula.name, group: "Formulas", decimals: 1 };
    if (!state.visibleColumns.includes(key)) {
      state.visibleColumns.push(key);
    }
    computeFormulaValues();
    renderTable();
    renderColumnPicker();
  }

  renderFormulaStore();
}

function uninstallFormula(formulaId) {
  const formula = storeState.formulas.find(f => f.id === formulaId);
  if (!formula) return;

  storeState.installed = storeState.installed.filter(id => id !== formulaId);
  localStorage.setItem("razzle_store_installed", JSON.stringify(storeState.installed));

  // Remove from user formulas
  state.formulas = state.formulas.filter(f => f.name !== formula.name);
  localStorage.setItem("razzle_formulas", JSON.stringify(state.formulas));

  const key = `formula_${formula.name.toLowerCase().replace(/[^a-z0-9]/g, "_")}`;
  delete COLUMNS[key];
  state.visibleColumns = state.visibleColumns.filter(k => k !== key);
  renderTable();
  renderColumnPicker();
  renderFormulaStore();
}

function renderFormulaStore() {
  const formulas = getFilteredFormulas();
  const container = document.getElementById("storeContent");

  // Position filter chips
  const positions = ["ALL", "QB", "RB", "WR", "TE"];
  const posChips = positions.map(p => {
    const active = storeState.posFilter === p;
    const posDataAttr = `data-pos="${p}"`;
    return `<span class="chip${active ? " active" : ""}" ${posDataAttr} onclick="setStorePosFilter('${p}')">${p}</span>`;
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
  if (!formulas.length) {
    cardsHtml = `<div style="text-align:center; padding:40px; grid-column:1/-1;">
      <p style="font-family:var(--font-hand); font-size:22px; color:var(--ink-light);">no formulas match your filters</p>
    </div>`;
  } else {
    cardsHtml = formulas.map(f => renderFormulaCard(f)).join("");
  }

  container.innerHTML = `
    <div class="store-controls">
      <div class="store-search-row">
        <input type="text" class="input-chunky" placeholder="search formulas..."
          value="${storeState.search}" oninput="setStoreSearch(this.value)"
          style="flex:1; max-width:300px;">
        <div style="display:flex; gap:4px;">${posChips}</div>
      </div>
      <div class="store-sort-row">
        <span style="font-family:var(--font-display); font-size:11px; text-transform:uppercase; color:var(--ink-light); letter-spacing:1px;">Sort by</span>
        ${sortBtns}
        <span style="font-family:var(--font-mono); font-size:11px; color:var(--ink-light); margin-left:auto;">${formulas.length} formula${formulas.length !== 1 ? "s" : ""}</span>
      </div>
    </div>
    <div class="store-grid">
      ${cardsHtml}
    </div>
  `;
}

// --- Publishing Flow ---

function isFormulaPublished(name) {
  const published = JSON.parse(localStorage.getItem("razzle_store_published") || "[]");
  return published.some(f => f.name === name);
}

function openPublishFlow(formulaName) {
  const formula = state.formulas.find(f => f.name === formulaName);
  if (!formula) return;

  // Close formula builder, open publish modal
  document.getElementById("formulaOverlay").classList.remove("open");

  const overlay = document.getElementById("publishOverlay");
  overlay.classList.add("open");

  // Populate publish form
  document.getElementById("publishName").value = formula.name;
  document.getElementById("publishDescription").value = "";
  document.getElementById("publishCreator").value = localStorage.getItem("razzle_store_username") || "";

  // Reset position checkboxes
  document.querySelectorAll(".publish-pos-check").forEach(cb => cb.checked = false);

  // Store which formula we're publishing
  overlay.dataset.formulaName = formula.name;
}

function closePublishFlow(e) {
  if (e && e.target !== e.currentTarget) return;
  document.getElementById("publishOverlay").classList.remove("open");
}

function submitPublish() {
  const overlay = document.getElementById("publishOverlay");
  const formulaName = overlay.dataset.formulaName;
  const formula = state.formulas.find(f => f.name === formulaName);
  if (!formula) return;

  const name = document.getElementById("publishName").value.trim();
  const description = document.getElementById("publishDescription").value.trim();
  const creator = document.getElementById("publishCreator").value.trim();

  if (!name || !description || !creator) {
    if (!name) document.getElementById("publishName").style.borderColor = "var(--red)";
    if (!description) document.getElementById("publishDescription").style.borderColor = "var(--red)";
    if (!creator) document.getElementById("publishCreator").style.borderColor = "var(--red)";
    return;
  }

  // Get selected positions
  const positions = [];
  document.querySelectorAll(".publish-pos-check:checked").forEach(cb => {
    positions.push(cb.value);
  });
  if (!positions.length) positions.push("QB", "RB", "WR", "TE"); // Default: all positions

  // Save creator name for future
  localStorage.setItem("razzle_store_username", creator);

  // Create published formula
  const id = "user_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8);
  const published = {
    id,
    name,
    creator,
    description,
    positions,
    components: formula.components.map(c => ({ stat: c.stat, weight: c.weight })),
    installs: 0,
    ratings: [],
    reviews: [],
    createdAt: new Date().toISOString().split("T")[0]
  };

  // Save to localStorage
  const allPublished = JSON.parse(localStorage.getItem("razzle_store_published") || "[]");
  // Remove existing with same name
  const filtered = allPublished.filter(f => f.name !== name);
  filtered.push(published);
  localStorage.setItem("razzle_store_published", JSON.stringify(filtered));

  // Close publish flow
  closePublishFlow();

  // Re-render saved formulas to show "Published" badge
  renderSavedFormulas();
}

function renderFormulaCard(formula) {
  const avgRating = getAvgRating(formula);
  const ratingCount = getRatingCount(formula);
  const isInstalled = storeState.installed.includes(formula.id);
  const userRating = storeState.userRatings[formula.id] || 0;

  // Position tags
  const posTags = formula.positions.map(p => {
    const colors = { QB: "var(--pos-qb)", RB: "var(--pos-rb)", WR: "var(--pos-wr)", TE: "var(--pos-te)" };
    return `<span style="font-family:var(--font-display); font-size:9px; font-weight:700; padding:1px 6px; border-radius:4px; border:1.5px solid var(--ink); background:${colors[p] || "var(--ink-light)"}; color:white; text-transform:uppercase;">${p}</span>`;
  }).join(" ");

  // Component preview (stat names only, no weights — creator IP protected)
  const statNames = formula.components
    .filter(c => c.weight > 0)
    .map(c => {
      const col = typeof COLUMNS !== "undefined" && COLUMNS[c.stat];
      return col ? col.label : c.stat.replace(/_/g, " ");
    })
    .slice(0, 4);
  const statsPreview = statNames.join(" + ") + (formula.components.filter(c => c.weight > 0).length > 4 ? " ..." : "");

  // Reviews preview
  const allReviews = [...(formula.reviews || [])];
  const userReview = storeState.userReviews[formula.id];
  if (userReview) allReviews.unshift({ author: "you", ...userReview });
  const topReview = allReviews[0];

  return `
    <div class="store-card">
      <div class="store-card-header">
        <div style="flex:1; min-width:0;">
          <div style="font-family:var(--font-display); font-size:16px; line-height:1.2; margin-bottom:4px;">${formula.name}</div>
          <div style="font-family:var(--font-mono); font-size:10px; color:var(--ink-light);">by ${formula.creator}</div>
        </div>
        <div style="display:flex; gap:3px; flex-shrink:0;">${posTags}</div>
      </div>
      <p style="font-family:var(--font-mono); font-size:12px; color:var(--ink-medium); margin:10px 0; line-height:1.4;">${formula.description}</p>
      <div style="font-family:var(--font-hand); font-size:15px; color:var(--ink-light); margin-bottom:10px; padding:6px 8px; background:var(--bg); border-radius:6px; border:1px dashed var(--ink-faint);">
        blends: ${statsPreview}
      </div>
      <div class="store-card-footer">
        <div style="display:flex; align-items:center; gap:6px;">
          ${renderStars(avgRating)}
          <span style="font-family:var(--font-mono); font-size:10px; color:var(--ink-light);">${avgRating.toFixed(1)} (${ratingCount})</span>
        </div>
        <div style="font-family:var(--font-mono); font-size:10px; color:var(--ink-light);">
          ${formula.installs || 0} installs
        </div>
      </div>
      ${topReview ? `
        <div style="margin-top:8px; padding-top:8px; border-top:1px dashed var(--ink-faint);">
          <div style="font-family:var(--font-mono); font-size:11px; color:var(--ink-medium); line-height:1.3;">
            "${topReview.text}" <span style="color:var(--ink-light);">— ${topReview.author}</span>
          </div>
        </div>
      ` : ""}
      <div style="margin-top:10px; padding-top:10px; border-top:2px dashed var(--ink-faint); display:flex; align-items:center; justify-content:space-between;">
        <div style="display:flex; align-items:center; gap:4px;">
          <span style="font-family:var(--font-mono); font-size:10px; color:var(--ink-light);">rate:</span>
          ${renderClickableStars(formula.id, userRating, 16)}
        </div>
        ${isInstalled
          ? `<button class="btn-chunky" style="font-size:11px; padding:4px 10px; background:var(--green-light); border-color:var(--green);" onclick="uninstallFormula('${formula.id}')">Installed</button>`
          : `<button class="btn-primary" style="font-size:11px; padding:4px 10px;" onclick="installFormula('${formula.id}')">Install</button>`
        }
      </div>
    </div>
  `;
}
