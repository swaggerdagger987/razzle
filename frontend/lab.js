/* Razzle — The Lab (screener logic) */

// ─── Prospect column definitions ────────────────────────────────
const PROSPECT_COLUMNS = {
  draft_round:   { label: "Rd",       group: "Draft",     decimals: 0 },
  draft_pick:    { label: "Pick",     group: "Draft",     decimals: 0 },
  draft_team:    { label: "Team",     group: "Draft",     decimals: null, isText: true },
  height_display:{ label: "HT",       group: "Measurables", decimals: null, isText: true },
  weight:        { label: "WT",       group: "Measurables", decimals: 0 },
  forty:         { label: "40-Yd",    group: "Athletic",  decimals: 2 },
  bench:         { label: "Bench",    group: "Athletic",  decimals: 0 },
  vertical:      { label: "Vert",     group: "Athletic",  decimals: 1 },
  broad_jump:    { label: "Broad",    group: "Athletic",  decimals: 0 },
  cone:          { label: "3-Cone",   group: "Athletic",  decimals: 2 },
  shuttle:       { label: "Shuttle",  group: "Athletic",  decimals: 2 },
  nfl_games:     { label: "NFL GP",   group: "NFL Career", decimals: 0 },
  career_av:     { label: "CAV",      group: "NFL Career", decimals: 0 },
  nfl_pass_yards:{ label: "Pass Yds", group: "NFL Career", decimals: 0 },
  nfl_pass_tds:  { label: "Pass TD",  group: "NFL Career", decimals: 0 },
  nfl_rush_yards:{ label: "Rush Yds", group: "NFL Career", decimals: 0 },
  nfl_rush_tds:  { label: "Rush TD",  group: "NFL Career", decimals: 0 },
  nfl_rec_yards: { label: "Rec Yds",  group: "NFL Career", decimals: 0 },
  nfl_rec_tds:   { label: "Rec TD",   group: "NFL Career", decimals: 0 },
  nfl_receptions:{ label: "REC",      group: "NFL Career", decimals: 0 },
};

const PROSPECT_PRESETS = {
  combine: {
    label: "Combine",
    columns: ["draft_round", "draft_pick", "draft_team", "height_display", "weight",
              "forty", "bench", "vertical", "broad_jump", "cone", "shuttle"],
  },
  athletic: {
    label: "Athletic",
    columns: ["forty", "vertical", "broad_jump", "cone", "shuttle", "bench",
              "height_display", "weight"],
  },
  draft_capital: {
    label: "Draft Capital",
    columns: ["draft_round", "draft_pick", "draft_team", "height_display", "weight",
              "forty", "nfl_games", "career_av"],
  },
  nfl_production: {
    label: "NFL Production",
    columns: ["draft_round", "draft_pick", "nfl_games", "career_av",
              "nfl_pass_yards", "nfl_pass_tds", "nfl_rush_yards", "nfl_rush_tds",
              "nfl_rec_yards", "nfl_rec_tds"],
  },
};

// ─── Column definitions ─────────────────────────────────────────
const COLUMNS = {
  // Core fantasy
  fantasy_points_ppr:  { label: "PPR",     group: "Fantasy", decimals: 1 },
  ppg:                 { label: "PPG",      group: "Fantasy", decimals: 1 },
  fantasy_points_std:  { label: "Standard", group: "Fantasy", decimals: 1 },
  games:               { label: "GP",       group: "Fantasy", decimals: 0 },
  seasons:             { label: "Seasons",  group: "Fantasy", decimals: 0 },

  // Passing
  passing_yards:       { label: "Pass Yds",   group: "Passing", decimals: 0 },
  passing_tds:         { label: "Pass TD",    group: "Passing", decimals: 0 },
  completions:         { label: "CMP",        group: "Passing", decimals: 0 },
  attempts:            { label: "ATT",        group: "Passing", decimals: 0 },
  interceptions:       { label: "INT",        group: "Passing", decimals: 0 },
  passing_air_yards:   { label: "Air Yds",    group: "Passing", decimals: 0 },

  // Rushing
  rushing_yards:       { label: "Rush Yds",  group: "Rushing", decimals: 0 },
  rushing_tds:         { label: "Rush TD",   group: "Rushing", decimals: 0 },
  carries:             { label: "CAR",       group: "Rushing", decimals: 0 },

  // Receiving
  receiving_yards:     { label: "Rec Yds",   group: "Receiving", decimals: 0 },
  receiving_tds:       { label: "Rec TD",    group: "Receiving", decimals: 0 },
  receptions:          { label: "REC",       group: "Receiving", decimals: 0 },
  targets:             { label: "TGT",       group: "Receiving", decimals: 0 },
  receiving_air_yards: { label: "Rec Air",   group: "Receiving", decimals: 0 },
  receiving_yards_after_catch: { label: "YAC", group: "Receiving", decimals: 0 },

  // Totals
  touchdowns:          { label: "TD",        group: "Totals", decimals: 0 },
  turnovers:           { label: "TO",        group: "Totals", decimals: 0 },

  // Efficiency (derived from aggregates — sort only, no SQL filter)
  yards_per_carry:     { label: "Y/CAR",    group: "Efficiency", decimals: 1, derived: true },
  yards_per_rec:       { label: "Y/REC",    group: "Efficiency", decimals: 1, derived: true },
  yards_per_target:    { label: "Y/TGT",    group: "Efficiency", decimals: 1, derived: true },
  catch_rate:          { label: "Catch%",   group: "Efficiency", decimals: 1, derived: true },
  comp_pct:            { label: "CMP%",     group: "Efficiency", decimals: 1, derived: true },
  yards_per_att:       { label: "Y/ATT",    group: "Efficiency", decimals: 1, derived: true },

  // Per-game averages (derived — sort only)
  rec_per_game:        { label: "REC/G",    group: "Per Game", decimals: 1, derived: true },
  targets_per_game:    { label: "TGT/G",    group: "Per Game", decimals: 1, derived: true },
  rush_ypg:            { label: "RuYPG",    group: "Per Game", decimals: 1, derived: true },
  rec_ypg:             { label: "ReYPG",    group: "Per Game", decimals: 1, derived: true },
  pass_ypg:            { label: "PaYPG",    group: "Per Game", decimals: 1, derived: true },

  // Advanced (from nflverse rate stats — sort only)
  target_share:        { label: "TGT%",     group: "Advanced", decimals: 1, pct: true, derived: true },
  air_yards_share:     { label: "AirYd%",   group: "Advanced", decimals: 1, pct: true, derived: true },
  wopr:                { label: "WOPR",     group: "Advanced", decimals: 3, derived: true },
  racr:                { label: "RACR",     group: "Advanced", decimals: 2, derived: true },
  passing_epa:         { label: "Pass EPA", group: "Advanced", decimals: 1, derived: true },
  receiving_epa:       { label: "Rec EPA",  group: "Advanced", decimals: 1, derived: true },
  rushing_epa:         { label: "Rush EPA", group: "Advanced", decimals: 1, derived: true },
  dakota:              { label: "DAKOTA",   group: "Advanced", decimals: 3, derived: true },

  // Breakout detection
  breakout_pct:        { label: "BRK%",    group: "Breakout", decimals: 1, derived: true },
};

// ─── Presets ─────────────────────────────────────────────────────
const PRESETS = {
  ppr: {
    label: "PPR",
    columns: ["fantasy_points_ppr", "ppg", "games", "passing_yards", "passing_tds",
              "rushing_yards", "rushing_tds", "receptions", "receiving_yards", "receiving_tds",
              "targets", "touchdowns"],
  },
  passing: {
    label: "Passing",
    columns: ["fantasy_points_ppr", "ppg", "games", "passing_yards", "passing_tds",
              "completions", "attempts", "interceptions", "passing_air_yards", "rushing_yards", "rushing_tds"],
  },
  rushing: {
    label: "Rushing",
    columns: ["fantasy_points_ppr", "ppg", "games", "rushing_yards", "rushing_tds",
              "carries", "receiving_yards", "receptions", "targets", "touchdowns"],
  },
  receiving: {
    label: "Receiving",
    columns: ["fantasy_points_ppr", "ppg", "games", "receiving_yards", "receiving_tds",
              "receptions", "targets", "receiving_air_yards", "receiving_yards_after_catch", "touchdowns"],
  },
  dynasty: {
    label: "Dynasty",
    columns: ["fantasy_points_ppr", "ppg", "games", "seasons", "breakout_pct", "receiving_yards", "receiving_tds",
              "receptions", "targets", "rushing_yards", "rushing_tds", "touchdowns"],
  },
  efficiency: {
    label: "Efficiency",
    columns: ["fantasy_points_ppr", "ppg", "games", "yards_per_carry", "yards_per_rec",
              "yards_per_target", "catch_rate", "comp_pct", "yards_per_att", "target_share"],
  },
  advanced: {
    label: "Advanced",
    columns: ["fantasy_points_ppr", "ppg", "games", "target_share", "air_yards_share",
              "wopr", "racr", "receiving_epa", "passing_epa", "rushing_epa"],
  },
};

// ─── State ───────────────────────────────────────────────────────
const state = {
  universe: "nfl", // "nfl" or "prospects"
  position: "ALL",
  search: "",
  season: 0,
  relevance: "fantasy",
  sortKey: "fantasy_points_ppr",
  sortDir: "desc",
  limit: 100,
  offset: 0,
  filters: [],
  visibleColumns: [...PRESETS.ppr.columns],
  items: [],
  totalCount: 0,
  seasons: [],
  selectedPlayers: [], // for compare/charts [{player_id, full_name, position, team}]
  formulas: [], // user custom formulas [{name, components: [{stat, weight}]}]
  // Prospect-specific state
  draftYear: 0,
  draftYears: [],
  prospectColumns: [...PROSPECT_PRESETS.combine.columns],
};

// ─── Init ────────────────────────────────────────────────────────
(async function init() {
  loadStateFromURL();

  // Load both NFL and prospect options in parallel
  try {
    const [nflOpts, prospectOpts] = await Promise.all([
      apiFetch("/api/filter-options"),
      apiFetch("/api/prospect-options").catch(() => ({ years: [], schools: [], positions: [] })),
    ]);

    state.seasons = nflOpts.seasons || [2024];
    if (!state.season && state.season !== "career") state.season = state.seasons[0] || 2024;

    state.draftYears = prospectOpts.years || [2025];
    if (!state.draftYear) state.draftYear = state.draftYears[0] || 2025;

    populateSeasonSelect();
    populateFilterStatSelect();
  } catch (e) {
    console.error("Failed to load filter options:", e);
    state.season = 2024;
  }

  applyUniverseUI();
  renderColumnPicker();
  renderPresets();
  await fetchAndRender();

  // Search debounce
  let searchTimer;
  document.getElementById("searchInput").addEventListener("input", (e) => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      state.search = e.target.value.trim();
      state.offset = 0;
      fetchAndRender();
    }, 300);
  });

  document.getElementById("searchInput").value = state.search;
})();

// ─── Data fetching ───────────────────────────────────────────────
async function fetchAndRender() {
  if (state.universe === "prospects") {
    return fetchAndRenderProspects();
  }
  return fetchAndRenderNFL();
}

async function fetchAndRenderNFL() {
  const loading = document.getElementById("loadingMsg");
  const tbody = document.getElementById("tableBody");
  loading.style.display = "block";
  loading.textContent = "pulling film...";
  tbody.innerHTML = "";

  const positions = state.position === "ALL"
    ? (state.relevance === "fantasy" ? ["QB", "RB", "WR", "TE"] : [])
    : [state.position];

  const body = {
    search: state.search,
    positions: positions,
    season: state.season,
    sort_key: state.sortKey,
    sort_direction: state.sortDir,
    limit: state.limit,
    offset: state.offset,
    filters: state.filters,
    relevance: state.relevance,
  };

  try {
    const data = await apiFetch("/api/screener/query", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    state.items = data.items || [];
    state.totalCount = data.count || 0;
    state.season = data.season || state.season;

    computeFormulaValues();
    loading.style.display = "none";
    renderTable();
    renderPagination();
    updateResultCount();
    saveStateToURL();
  } catch (e) {
    loading.textContent = "fumbled the data fetch...";
    console.error(e);
  }
}

async function fetchAndRenderProspects() {
  const loading = document.getElementById("loadingMsg");
  const tbody = document.getElementById("tableBody");
  loading.style.display = "block";
  loading.textContent = "scouting prospects...";
  tbody.innerHTML = "";

  const positions = state.position === "ALL" ? "" : state.position;

  const params = new URLSearchParams({
    draft_year: state.draftYear,
    positions: positions,
    search: state.search,
    sort: state.sortKey,
    order: state.sortDir,
    limit: state.limit,
    offset: state.offset,
  });

  try {
    const data = await apiFetch(`/api/prospects?${params}`);

    state.items = data.items || [];
    state.totalCount = data.count || 0;
    state.draftYear = data.draft_year || state.draftYear;

    loading.style.display = "none";
    renderTable();
    renderPagination();
    updateResultCount();
    saveStateToURL();
  } catch (e) {
    loading.textContent = "fumbled the prospect fetch...";
    console.error(e);
  }
}

// ─── Table rendering ─────────────────────────────────────────────
function renderTable() {
  if (state.universe === "prospects") {
    renderProspectTable();
  } else {
    renderNFLTable();
  }
}

function getActiveColumns() {
  return state.universe === "prospects" ? state.prospectColumns : state.visibleColumns;
}

function getColumnDef(key) {
  if (state.universe === "prospects") return PROSPECT_COLUMNS[key];
  return COLUMNS[key];
}

function renderNFLTable() {
  renderTableHead();
  renderTableBody();
}

function renderTableHead() {
  const thead = document.getElementById("tableHead");
  const cols = getActiveColumns();

  const nameKey = state.universe === "prospects" ? "player_name" : "full_name";
  let html = '<tr><th style="width:30px; text-align:center; padding:8px 6px;">&#9734;</th>';
  html += `<th class="col-player" onclick="sortBy('${nameKey}')">Player`;
  if (state.sortKey === "full_name" || state.sortKey === "player_name") {
    html += state.sortDir === "asc" ? " &#9650;" : " &#9660;";
  }
  html += "</th>";

  for (const key of cols) {
    const col = getColumnDef(key);
    if (!col) continue;
    const cls = state.sortKey === key ? `sort-${state.sortDir}` : "";
    html += `<th class="${cls}" onclick="sortBy('${key}')">${col.label}</th>`;
  }

  html += "</tr>";
  thead.innerHTML = html;
}

function renderTableBody() {
  const tbody = document.getElementById("tableBody");
  const cols = getActiveColumns();
  const emptyMsg = state.universe === "prospects"
    ? "no prospects match these filters"
    : "no players match these filters";

  if (!state.items.length) {
    tbody.innerHTML = `<tr><td colspan="99" style="text-align:center; padding:40px; font-family: var(--font-hand); font-size: 22px; color: var(--ink-light);">${emptyMsg}</td></tr>`;
    return;
  }

  let html = "";
  for (const player of state.items) {
    const pos = (player.position || "").toUpperCase();
    const playKey = player.player_id || player.player_name;
    const selected = state.selectedPlayers.some(p => p.player_id === playKey);
    html += '<tr>';
    html += `<td style="text-align:center; padding:7px 6px;">
      <input type="checkbox" ${selected ? "checked" : ""} onchange="togglePlayerSelect('${player.player_id || player.player_name}', this.checked)"
        style="accent-color:${state.universe === 'prospects' ? 'var(--pos-qb)' : 'var(--orange)'}; width:15px; height:15px; cursor:pointer;">
    </td>`;

    if (state.universe === "prospects") {
      const pName = (player.player_name || "").replace(/'/g, "\\'");
      const pPos = (player.position || "").toUpperCase();
      const pYear = player.draft_year || state.season;
      html += `<td class="col-player"><div class="player-name-cell">`;
      html += `<span class="pos-badge ${posClass(pos)}">${pos}</span>`;
      html += `<a href="#" onclick="openProspectProfile('${pName}', '${pPos}', ${pYear}); return false;" style="color:var(--ink); text-decoration:none; border-bottom:1px dashed var(--pos-qb);">${player.player_name || ""}</a>`;
      html += `<span class="school-label">${player.school || ""}</span>`;
      html += `</div></td>`;
    } else {
      const pid = player.player_id || "";
      html += `<td class="col-player"><div class="player-name-cell">`;
      html += `<span class="pos-badge ${posClass(pos)}">${pos}</span>`;
      html += `<a href="#" onclick="openPlayerProfile('${pid}'); return false;" style="color:var(--ink); text-decoration:none; border-bottom:1px dashed var(--ink-faint);">${player.full_name}</a>`;
      html += `<span class="team-label">${player.team || ""}</span>`;
      html += `</div></td>`;
    }

    for (const key of cols) {
      const col = getColumnDef(key);
      if (!col) continue;
      let val = player[key];
      if (col.isText) {
        html += `<td>${val || "—"}</td>`;
      } else if (key === "breakout_pct" && val != null && val >= 50) {
        html += `<td><span style="background:var(--green); color:white; padding:1px 6px; border-radius:10px; border:2px solid var(--ink); font-size:11px; font-weight:700;">+${val.toFixed(0)}%</span></td>`;
      } else if (col.pct && val != null) {
        // Rate stats come as decimals (0.32 = 32%), display as percentage
        html += `<td>${(val * 100).toFixed(col.decimals)}%</td>`;
      } else {
        html += `<td>${formatStat(val, col.decimals)}</td>`;
      }
    }
    html += "</tr>";
  }
  tbody.innerHTML = html;
}

function renderProspectTable() {
  renderTableHead();
  renderTableBody();
}

// ─── Universe toggle ─────────────────────────────────────────────
function setUniverse(u) {
  if (state.universe === u) return;
  state.universe = u;
  state.offset = 0;
  state.search = "";
  state.filters = [];
  state.selectedPlayers = [];
  document.getElementById("searchInput").value = "";

  if (u === "prospects") {
    state.sortKey = "draft_pick";
    state.sortDir = "asc";
  } else {
    state.sortKey = "fantasy_points_ppr";
    state.sortDir = "desc";
  }

  applyUniverseUI();
  populateSeasonSelect();
  populateFilterStatSelect();
  renderColumnPicker();
  renderPresets();
  renderActiveFilters();
  fetchAndRender();
}

function applyUniverseUI() {
  const isProspect = state.universe === "prospects";

  // Toggle body class for blue accent
  document.body.classList.toggle("prospect-mode", isProspect);

  // Toggle buttons
  document.getElementById("universeNFL").classList.toggle("active", !isProspect);
  document.getElementById("universeProspects").classList.toggle("active", isProspect);

  // Search placeholder
  document.getElementById("searchInput").placeholder = isProspect
    ? "search prospects..." : "search players...";

  // Hide formula button in prospect mode (formulas are NFL-specific)
  const formulaBtn = document.getElementById("formulaBtn");
  if (formulaBtn) formulaBtn.style.display = isProspect ? "none" : "";

  // Hide relevance toggle in prospect mode
  document.getElementById("relevanceToggle").style.display = isProspect ? "none" : "";

  // Hide filter bar in prospect mode (prospect filtering is via sort/position)
  document.getElementById("filterBar").style.display = isProspect ? "none" : "";

  // Data source label
  const ds = document.getElementById("dataSource");
  if (ds) ds.textContent = isProspect ? "powered by nflverse combine + draft data" : "powered by nflverse";

  // Page title
  document.title = isProspect ? "Prospect Lab — Razzle" : "The Lab — Razzle";

  // Show Tiers and Big Board buttons only in prospect mode
  const tiersBtn = document.getElementById("tiersBtn");
  if (tiersBtn) tiersBtn.style.display = isProspect ? "" : "none";
  const bigBoardBtn = document.getElementById("bigBoardBtn");
  if (bigBoardBtn) bigBoardBtn.style.display = isProspect ? "" : "none";
}

// ─── Sort ────────────────────────────────────────────────────────
function sortBy(key) {
  // Normalize player name sort key per universe
  if (key === "full_name" && state.universe === "prospects") key = "player_name";
  if (key === "player_name" && state.universe === "nfl") key = "full_name";

  if (state.sortKey === key) {
    state.sortDir = state.sortDir === "desc" ? "asc" : "desc";
  } else {
    state.sortKey = key;
    // Text fields and draft pick default to asc
    state.sortDir = (key === "full_name" || key === "player_name" || key === "draft_pick") ? "asc" : "desc";
  }
  state.offset = 0;
  fetchAndRender();
}

// ─── Position toggle ─────────────────────────────────────────────
function togglePosition(pos) {
  state.position = pos;
  state.offset = 0;

  document.querySelectorAll(".chip[data-pos]").forEach(chip => {
    chip.classList.toggle("active", chip.dataset.pos === pos);
  });

  fetchAndRender();
}

// ─── Relevance toggle ───────────────────────────────────────────
function toggleRelevance() {
  state.relevance = state.relevance === "fantasy" ? "all" : "fantasy";
  const btn = document.getElementById("relevanceToggle");
  btn.textContent = state.relevance === "fantasy" ? "Fantasy Only" : "All Players";
  btn.classList.toggle("active", state.relevance === "all");
  state.offset = 0;
  fetchAndRender();
}

// ─── Season select ───────────────────────────────────────────────
function populateSeasonSelect() {
  const sel = document.getElementById("seasonSelect");

  if (state.universe === "prospects") {
    sel.innerHTML = state.draftYears.map(y =>
      `<option value="${y}" ${y === state.draftYear ? "selected" : ""}>${y} Draft</option>`
    ).join("");
    sel.onchange = (e) => {
      state.draftYear = parseInt(e.target.value);
      state.offset = 0;
      fetchAndRender();
    };
  } else {
    let html = `<option value="career" ${state.season === "career" ? "selected" : ""}>Career</option>`;
    html += state.seasons.map(s =>
      `<option value="${s}" ${s === state.season ? "selected" : ""}>${s}</option>`
    ).join("");
    sel.innerHTML = html;
    sel.onchange = (e) => {
      state.season = e.target.value === "career" ? "career" : parseInt(e.target.value);
      state.offset = 0;
      fetchAndRender();
    };
  }
}

// ─── Pagination ──────────────────────────────────────────────────
function renderPagination() {
  const page = Math.floor(state.offset / state.limit) + 1;
  const totalPages = Math.ceil(state.totalCount / state.limit) || 1;
  document.getElementById("pageInfo").textContent = `${page} / ${totalPages}`;
  document.getElementById("prevBtn").disabled = state.offset === 0;
  document.getElementById("nextBtn").disabled = state.offset + state.limit >= state.totalCount;
}

function prevPage() {
  state.offset = Math.max(0, state.offset - state.limit);
  fetchAndRender();
}

function nextPage() {
  state.offset += state.limit;
  fetchAndRender();
}

function updateResultCount() {
  const el = document.getElementById("resultCount");
  const label = state.universe === "prospects" ? "prospects" : "players";
  el.innerHTML = `<strong>${state.totalCount}</strong> ${label}`;
}

// ─── Filters ─────────────────────────────────────────────────────
function populateFilterStatSelect() {
  const sel = document.getElementById("filterStat");
  const colDefs = state.universe === "prospects" ? PROSPECT_COLUMNS : COLUMNS;
  const keys = Object.keys(colDefs).filter(k => !colDefs[k].isText && !colDefs[k].derived);
  sel.innerHTML = keys.map(k => {
    const col = colDefs[k];
    return `<option value="${k}">${col.label} (${k})</option>`;
  }).join("");
}

function openFilterModal() {
  document.getElementById("filterModalOverlay").classList.add("open");
  document.getElementById("filterValue").value = "";
  document.getElementById("filterValue").focus();
}

function closeFilterModal(e) {
  if (e && e.target !== e.currentTarget) return;
  document.getElementById("filterModalOverlay").classList.remove("open");
}

function addFilter() {
  const key = document.getElementById("filterStat").value;
  const op = document.getElementById("filterOp").value;
  const value = parseFloat(document.getElementById("filterValue").value);
  if (isNaN(value)) return;

  state.filters.push({ key, op, value });
  state.offset = 0;
  closeFilterModal();
  renderActiveFilters();
  fetchAndRender();
}

function removeFilter(idx) {
  state.filters.splice(idx, 1);
  state.offset = 0;
  renderActiveFilters();
  fetchAndRender();
}

function renderActiveFilters() {
  const container = document.getElementById("activeFilters");
  const opLabels = { gte: "≥", lte: "≤", gt: ">", lt: "<", eq: "=" };
  container.innerHTML = state.filters.map((f, i) => {
    const col = COLUMNS[f.key];
    const label = col ? col.label : f.key;
    return `<span class="filter-tag">${label} ${opLabels[f.op] || f.op} ${f.value} <span class="remove" onclick="removeFilter(${i})">×</span></span>`;
  }).join(" ");
}

// ─── Column picker ───────────────────────────────────────────────
function openColumnPicker() {
  document.getElementById("columnPickerOverlay").classList.add("open");
}

function closeColumnPicker(e) {
  if (e && e.target !== e.currentTarget) return;
  document.getElementById("columnPickerOverlay").classList.remove("open");
  renderTable();
  saveStateToURL();
}

function renderColumnPicker() {
  const container = document.getElementById("columnGroups");
  const colDefs = state.universe === "prospects" ? PROSPECT_COLUMNS : COLUMNS;
  const activeCols = getActiveColumns();

  const groups = {};
  for (const [key, col] of Object.entries(colDefs)) {
    if (!groups[col.group]) groups[col.group] = [];
    groups[col.group].push({ key, ...col });
  }

  let html = "";
  for (const [groupName, cols] of Object.entries(groups)) {
    html += `<div class="column-group">`;
    html += `<div class="column-group-title">${groupName}</div>`;
    for (const col of cols) {
      const checked = activeCols.includes(col.key) ? "checked" : "";
      html += `<label class="column-option">
        <input type="checkbox" value="${col.key}" ${checked} onchange="toggleColumn('${col.key}', this.checked)">
        ${col.label}
      </label>`;
    }
    html += `</div>`;
  }
  container.innerHTML = html;
}

function toggleColumn(key, checked) {
  const colArray = state.universe === "prospects" ? "prospectColumns" : "visibleColumns";
  const colDefs = state.universe === "prospects" ? PROSPECT_COLUMNS : COLUMNS;

  if (checked && !state[colArray].includes(key)) {
    const allKeys = Object.keys(colDefs);
    const idx = allKeys.indexOf(key);
    let insertAt = state[colArray].length;
    for (let i = 0; i < state[colArray].length; i++) {
      if (allKeys.indexOf(state[colArray][i]) > idx) {
        insertAt = i;
        break;
      }
    }
    state[colArray].splice(insertAt, 0, key);
  } else if (!checked) {
    state[colArray] = state[colArray].filter(k => k !== key);
  }
}

function renderPresets() {
  const container = document.getElementById("presetBar");
  const presets = state.universe === "prospects" ? PROSPECT_PRESETS : PRESETS;
  container.innerHTML = Object.entries(presets).map(([key, preset]) =>
    `<button class="btn-chunky" onclick="applyPreset('${key}')">${preset.label}</button>`
  ).join("");
}

function applyPreset(key) {
  const presets = state.universe === "prospects" ? PROSPECT_PRESETS : PRESETS;
  const preset = presets[key];
  if (!preset) return;

  if (state.universe === "prospects") {
    state.prospectColumns = [...preset.columns];
  } else {
    state.visibleColumns = [...preset.columns];
  }
  renderColumnPicker();
  renderTable();
  saveStateToURL();
}

// ─── URL state ───────────────────────────────────────────────────
function saveStateToURL() {
  const params = new URLSearchParams();

  if (state.universe !== "nfl") params.set("u", state.universe);
  if (state.position !== "ALL") params.set("pos", state.position);
  if (state.search) params.set("q", state.search);
  if (state.sortDir !== "desc") params.set("dir", state.sortDir);
  if (state.offset > 0) params.set("offset", state.offset);
  if (state.filters.length) params.set("filters", JSON.stringify(state.filters));

  if (state.universe === "prospects") {
    if (state.draftYear) params.set("draft_year", state.draftYear);
    if (state.sortKey !== "draft_pick") params.set("sort", state.sortKey);
    const defaultCols = PROSPECT_PRESETS.combine.columns.join(",");
    const currentCols = state.prospectColumns.join(",");
    if (currentCols !== defaultCols) params.set("cols", currentCols);
  } else {
    if (state.season) params.set("season", state.season);
    if (state.relevance !== "fantasy") params.set("rel", state.relevance);
    if (state.sortKey !== "fantasy_points_ppr") params.set("sort", state.sortKey);
    const defaultCols = PRESETS.ppr.columns.join(",");
    const currentCols = state.visibleColumns.join(",");
    if (currentCols !== defaultCols) params.set("cols", currentCols);
  }

  const qs = params.toString();
  const newURL = window.location.pathname + (qs ? "?" + qs : "");
  history.replaceState(null, "", newURL);
}

function loadStateFromURL() {
  const params = new URLSearchParams(window.location.search);

  if (params.has("u")) state.universe = params.get("u");
  if (params.has("pos")) state.position = params.get("pos");
  if (params.has("q")) state.search = params.get("q");
  if (params.has("sort")) state.sortKey = params.get("sort");
  if (params.has("dir")) state.sortDir = params.get("dir");
  if (params.has("offset")) state.offset = parseInt(params.get("offset"));
  if (params.has("filters")) {
    try { state.filters = JSON.parse(params.get("filters")); } catch (e) {}
  }

  if (state.universe === "prospects") {
    if (params.has("draft_year")) state.draftYear = parseInt(params.get("draft_year"));
    if (!params.has("sort")) state.sortKey = "draft_pick";
    if (!params.has("dir")) state.sortDir = "asc";
    if (params.has("cols")) state.prospectColumns = params.get("cols").split(",");
  } else {
    if (params.has("season")) {
      const sv = params.get("season");
      state.season = sv === "career" ? "career" : parseInt(sv);
    }
    if (params.has("rel")) state.relevance = params.get("rel");
    if (params.has("cols")) state.visibleColumns = params.get("cols").split(",");
  }

  // Sync UI
  document.querySelectorAll(".chip[data-pos]").forEach(chip => {
    chip.classList.toggle("active", chip.dataset.pos === state.position);
  });

  if (state.relevance === "all") {
    const btn = document.getElementById("relevanceToggle");
    btn.textContent = "All Players";
    btn.classList.add("active");
  }

  renderActiveFilters();
}

function copyShareURL() {
  saveStateToURL();
  navigator.clipboard.writeText(window.location.href).then(() => {
    const btn = event.target;
    const orig = btn.textContent;
    btn.textContent = "Copied.";
    setTimeout(() => btn.textContent = orig, 1500);
  });
}

// ─── Player selection (for compare/charts) ───────────────────────
function togglePlayerSelect(playerId, checked) {
  if (checked) {
    if (state.selectedPlayers.length >= 5) return; // max 5
    if (state.universe === "prospects") {
      const player = state.items.find(p => (p.player_id || p.player_name) === playerId);
      if (player && !state.selectedPlayers.some(p => p.player_id === playerId)) {
        state.selectedPlayers.push({
          player_id: playerId,
          full_name: player.player_name,
          player_name: player.player_name,
          position: player.position,
          team: player.draft_team || player.school || "",
        });
      }
    } else {
      const player = state.items.find(p => p.player_id === playerId);
      if (player && !state.selectedPlayers.some(p => p.player_id === playerId)) {
        state.selectedPlayers.push({
          player_id: player.player_id,
          full_name: player.full_name,
          position: player.position,
          team: player.team,
        });
      }
    }
  } else {
    state.selectedPlayers = state.selectedPlayers.filter(p => p.player_id !== playerId);
  }
  updateSelectionUI();
}

function updateSelectionUI() {
  const count = state.selectedPlayers.length;
  const resultEl = document.getElementById("resultCount");
  if (count > 0) {
    resultEl.innerHTML = `<strong>${state.totalCount}</strong> players &nbsp;|&nbsp; <strong>${count}</strong> selected
      <button class="btn-primary" style="margin-left:8px; padding:3px 10px; font-size:11px;" onclick="openCompare()">Compare</button>`;
  } else {
    updateResultCount();
  }
  // Persist Lab context for War Room agent bridge
  saveLabContext();
}

function saveLabContext() {
  try {
    const KEY_STATS = [
      "fantasy_points_ppr", "ppg", "games", "receptions", "targets", "receiving_yards",
      "receiving_tds", "rushing_attempts", "rushing_yards", "rushing_tds",
      "passing_yards", "passing_tds", "interceptions", "completions", "attempts",
      "target_share", "wopr", "yards_per_carry", "yards_per_rec", "catch_rate"
    ];
    const players = state.selectedPlayers.map(sp => {
      const full = state.items.find(p => p.player_id === sp.player_id);
      if (!full) return sp;
      const stats = {};
      for (const k of KEY_STATS) {
        if (full[k] != null) stats[k] = full[k];
      }
      // Include formula scores
      for (const f of state.formulas) {
        const fk = "formula_" + f.name.toLowerCase().replace(/[^a-z0-9]/g, "_");
        if (full[fk] != null) stats[fk] = full[fk];
      }
      return { ...sp, stats };
    });
    const ctx = {
      players,
      season: state.season || "latest",
      universe: state.universe,
      preset: getCurrentPresetName(),
      filters: state.filters.slice(0, 5),
      formulas: state.formulas.map(f => ({ name: f.name, components: f.components })),
      updatedAt: Date.now(),
    };
    localStorage.setItem("razzle_lab_context", JSON.stringify(ctx));
  } catch (e) { /* ignore storage errors */ }
}

function getCurrentPresetName() {
  const presets = state.universe === "prospects" ? PROSPECT_PRESETS : PRESETS;
  for (const [name, preset] of Object.entries(presets)) {
    const cols = state.universe === "prospects" ? state.prospectColumns : state.visibleColumns;
    if (JSON.stringify(preset.columns) === JSON.stringify(cols)) return preset.label;
  }
  return "Custom";
}

// ─── Formula columns integration ─────────────────────────────────
function loadFormulas() {
  try {
    state.formulas = JSON.parse(localStorage.getItem("razzle_formulas") || "[]");
  } catch (e) {
    state.formulas = [];
  }
  // Register formula columns
  for (const formula of state.formulas) {
    const key = `formula_${formula.name.toLowerCase().replace(/[^a-z0-9]/g, "_")}`;
    COLUMNS[key] = { label: formula.name, group: "Formulas", decimals: 1 };
  }
}

function computeFormulaValues() {
  // After fetching items, compute formula values for each player
  for (const formula of state.formulas) {
    const key = `formula_${formula.name.toLowerCase().replace(/[^a-z0-9]/g, "_")}`;
    for (const player of state.items) {
      let score = 0;
      let totalWeight = 0;
      for (const comp of formula.components) {
        const val = player[comp.stat];
        if (val !== null && val !== undefined) {
          score += (val * comp.weight) / 100;
          totalWeight += Math.abs(comp.weight);
        }
      }
      player[key] = totalWeight > 0 ? Math.round(score * 10) / 10 : null;
    }
  }
}

// Load formulas on startup
loadFormulas();

// ─── Image export ────────────────────────────────────────────────
function exportImage() {
  const table = document.getElementById("screenerTable");
  const rows = table.querySelectorAll("tr");
  if (!rows.length) return;

  // Determine dimensions from visible data
  const visibleCols = state.visibleColumns.filter(k => COLUMNS[k]);
  const colCount = visibleCols.length + 1; // +1 for player name
  const rowCount = Math.min(state.items.length, 25); // cap at 25 rows for export

  const colW = 100;
  const playerColW = 200;
  const rowH = 28;
  const headerH = 36;
  const padX = 20;
  const padY = 20;
  const watermarkH = 40;

  const W = padX * 2 + playerColW + colCount * colW;
  const H = padY * 2 + headerH + rowCount * rowH + watermarkH;

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");

  // Background
  ctx.fillStyle = "#ede0cf";
  ctx.fillRect(0, 0, W, H);

  // Header row
  ctx.fillStyle = "#e5d5c3";
  ctx.fillRect(padX, padY, W - padX * 2, headerH);
  ctx.strokeStyle = "#1a1a2e";
  ctx.lineWidth = 2;
  ctx.strokeRect(padX, padY, W - padX * 2, headerH);

  ctx.font = "bold 11px 'Space Mono', monospace";
  ctx.fillStyle = "#1a1a2e";
  ctx.textAlign = "left";
  ctx.fillText("PLAYER", padX + 8, padY + headerH / 2 + 4);

  ctx.textAlign = "right";
  for (let i = 0; i < visibleCols.length; i++) {
    const col = COLUMNS[visibleCols[i]];
    const x = padX + playerColW + i * colW + colW - 8;
    ctx.fillText(col.label.toUpperCase(), x, padY + headerH / 2 + 4);
  }

  // Data rows
  const posColors = { QB: "#5b7fff", RB: "#2ec4b6", WR: "#d97757", TE: "#8b5cf6" };
  for (let r = 0; r < rowCount; r++) {
    const player = state.items[r];
    const y = padY + headerH + r * rowH;

    // Alternate row bg
    if (r % 2 === 0) {
      ctx.fillStyle = "#f7efe5";
      ctx.fillRect(padX, y, W - padX * 2, rowH);
    }

    // Row border
    ctx.strokeStyle = "#c5c5d0";
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(padX, y + rowH);
    ctx.lineTo(W - padX, y + rowH);
    ctx.stroke();

    // Position badge
    const pos = (player.position || "").toUpperCase();
    const badgeColor = posColors[pos] || "#8a8a9e";
    ctx.fillStyle = badgeColor;
    ctx.fillRect(padX + 6, y + 6, 26, 16);
    ctx.strokeStyle = "#1a1a2e";
    ctx.lineWidth = 1;
    ctx.strokeRect(padX + 6, y + 6, 26, 16);
    ctx.font = "bold 9px 'Space Mono', monospace";
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.fillText(pos, padX + 19, y + 18);

    // Player name
    ctx.font = "bold 12px sans-serif";
    ctx.fillStyle = "#1a1a2e";
    ctx.textAlign = "left";
    const displayName = player.full_name.length > 20
      ? player.full_name.substring(0, 18) + "..."
      : player.full_name;
    ctx.fillText(displayName, padX + 38, y + 18);

    // Team
    ctx.font = "10px 'Space Mono', monospace";
    ctx.fillStyle = "#8a8a9e";
    ctx.fillText(player.team || "", padX + playerColW - 30, y + 18);

    // Stats
    ctx.font = "12px 'Space Mono', monospace";
    ctx.fillStyle = "#1a1a2e";
    ctx.textAlign = "right";
    for (let i = 0; i < visibleCols.length; i++) {
      const col = COLUMNS[visibleCols[i]];
      const val = player[visibleCols[i]];
      const x = padX + playerColW + i * colW + colW - 8;
      ctx.fillText(formatStat(val, col.decimals), x, y + 18);
    }
  }

  // Table border
  ctx.strokeStyle = "#1a1a2e";
  ctx.lineWidth = 3;
  ctx.strokeRect(padX, padY, W - padX * 2, headerH + rowCount * rowH);

  // Player column divider
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(padX + playerColW, padY);
  ctx.lineTo(padX + playerColW, padY + headerH + rowCount * rowH);
  ctx.stroke();

  // Watermark
  const wmY = H - watermarkH / 2;
  ctx.font = "bold 16px sans-serif";
  ctx.fillStyle = "#1a1a2e";
  ctx.globalAlpha = 0.3;
  ctx.textAlign = "center";
  ctx.fillText("built different — razzle.lol", W / 2, wmY);
  ctx.globalAlpha = 1.0;

  // Razzle logo mark
  ctx.font = "20px serif";
  ctx.fillText("🐯", W / 2 - 140, wmY + 2);

  // Download
  const link = document.createElement("a");
  link.download = `razzle-lab-${state.season === "career" ? "career" : state.season}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
}

// ─── Player Profile Modal ──────────────────────────────────────────

async function openPlayerProfile(playerId) {
  if (!playerId) return;
  const overlay = document.getElementById("profileOverlay");
  const content = document.getElementById("profileContent");
  overlay.classList.add("open");
  content.innerHTML = `<div style="text-align:center; padding:40px; font-family:var(--font-hand); font-size:22px; color:var(--ink-light);">pulling film...</div>`;

  try {
    const data = await apiFetch(`/api/players/${playerId}/profile`);
    renderProfile(data, content);
  } catch (err) {
    content.innerHTML = `<div style="text-align:center; padding:40px; font-family:var(--font-hand); font-size:22px; color:var(--red);">fumbled the data fetch... ${err.message}</div>`;
  }
}

function closeProfile(e) {
  if (e && e.target !== e.currentTarget) return;
  document.getElementById("profileOverlay").classList.remove("open");
}

function renderProfile(data, container) {
  const { player, seasons, career, combine } = data;
  if (!player || !player.full_name) {
    container.innerHTML = `<div style="text-align:center; padding:40px; font-family:var(--font-hand); font-size:22px; color:var(--ink-light);">player not found on the film</div>`;
    return;
  }

  const pos = (player.position || "").toUpperCase();
  const posColors = { QB: "var(--pos-qb)", RB: "var(--pos-rb)", WR: "var(--pos-wr)", TE: "var(--pos-te)" };
  const posColor = posColors[pos] || "var(--ink)";

  const headlines = getHeadlineStats(pos, career);

  // Detect breakout from seasons data
  let breakoutInfo = null;
  if (seasons && seasons.length >= 2) {
    const sorted = [...seasons].sort((a, b) => a.season - b.season);
    for (let i = 1; i < sorted.length; i++) {
      const prev = sorted[i - 1].fantasy_points_ppr || 0;
      const curr = sorted[i].fantasy_points_ppr || 0;
      if (prev > 20) {
        const pct = ((curr - prev) / prev) * 100;
        if (pct >= 50 && (!breakoutInfo || pct > breakoutInfo.pct)) {
          breakoutInfo = { pct: Math.round(pct), season: sorted[i].season };
        }
      }
    }
  }

  let html = "";

  // Header
  html += `<div class="profile-header">`;
  html += `<span class="profile-pos-badge" style="background:${posColor};">${pos}</span>`;
  html += `<div>`;
  html += `<div class="profile-name">${player.full_name}</div>`;
  html += `<div class="profile-meta">${player.team || "FA"} · Age ${player.age || "?"} · ${player.college || ""}</div>`;
  if (breakoutInfo) {
    html += `<span class="breakout-badge">BREAKOUT +${breakoutInfo.pct}% (${breakoutInfo.season})</span>`;
  }
  html += `</div>`;
  html += `<button class="btn-primary" onclick="exportProfileImage()" style="margin-left:auto; font-size:11px; padding:6px 14px;">Export PNG</button>`;
  html += `</div>`;

  // Career headline stats bar
  html += `<div class="profile-stats-bar">`;
  for (const h of headlines) {
    html += `<div class="profile-stat-box">`;
    html += `<div class="profile-stat-value">${h.value}</div>`;
    html += `<div class="profile-stat-label">${h.label}</div>`;
    html += `</div>`;
  }
  html += `</div>`;

  // Season-by-season table
  if (seasons && seasons.length > 0) {
    const seasonCols = getSeasonColumns(pos);
    html += `<div class="profile-section-title">Season Log</div>`;
    html += `<table class="profile-season-table"><thead><tr>`;
    html += `<th>Year</th>`;
    for (const c of seasonCols) html += `<th>${c.label}</th>`;
    html += `</tr></thead><tbody>`;

    for (const s of seasons) {
      html += `<tr><td>${s.season}</td>`;
      for (const c of seasonCols) {
        html += `<td>${c.fmt(s[c.key])}</td>`;
      }
      html += `</tr>`;
    }

    // Career totals row
    if (career && career.games) {
      html += `<tr><td>Career</td>`;
      for (const c of seasonCols) {
        html += `<td>${c.fmt(career[c.key])}</td>`;
      }
      html += `</tr>`;
    }

    html += `</tbody></table>`;
  }

  // Combine / draft data
  if (combine) {
    html += `<div class="profile-section-title">Combine & Draft</div>`;
    html += `<div class="profile-combine">`;

    const combineFields = [
      { key: "draft_round", label: "Round", fmt: v => v ? `Rd ${v}` : "UDFA" },
      { key: "draft_overall", label: "Pick", fmt: v => v ? `#${v}` : "—" },
      { key: "height_display", label: "Height", fmt: v => v || "—" },
      { key: "weight", label: "Weight", fmt: v => v ? `${v} lbs` : "—" },
      { key: "forty", label: "40-Yard", fmt: v => v ? v.toFixed(2) + "s" : "—" },
      { key: "bench", label: "Bench", fmt: v => v ? `${v} reps` : "—" },
      { key: "vertical", label: "Vertical", fmt: v => v ? v.toFixed(1) + '"' : "—" },
      { key: "broad_jump", label: "Broad", fmt: v => v ? v + '"' : "—" },
      { key: "cone", label: "3-Cone", fmt: v => v ? v.toFixed(2) + "s" : "—" },
      { key: "shuttle", label: "Shuttle", fmt: v => v ? v.toFixed(2) + "s" : "—" },
    ];

    for (const f of combineFields) {
      const val = combine[f.key];
      const display = f.fmt(val);
      if (display === "—") continue;
      html += `<div class="profile-combine-item">`;
      html += `<div class="profile-combine-value">${display}</div>`;
      html += `<div class="profile-combine-label">${f.label}</div>`;
      html += `</div>`;
    }
    html += `</div>`;
  }

  // Career arc chart
  if (seasons && seasons.length > 1) {
    html += `<div class="profile-section-title">Career Arc</div>`;
    html += `<div class="profile-chart-wrap">`;
    html += `<canvas id="profileArcCanvas" width="720" height="240" style="border:2px solid var(--ink); border-radius:8px; background:var(--bg); width:100%;"></canvas>`;
    html += `</div>`;
  }

  container.innerHTML = html;

  // Draw career arc chart after DOM update
  if (seasons && seasons.length > 1) {
    requestAnimationFrame(() => drawProfileArc(seasons, pos));
  }
}

function getHeadlineStats(pos, career) {
  if (!career || !career.games) return [];
  const fmt0 = v => v != null ? Math.round(v).toLocaleString() : "—";
  const fmt1 = v => v != null ? v.toFixed(1) : "—";

  const common = [
    { label: "PPR Total", value: fmt1(career.fantasy_points_ppr) },
    { label: "Games", value: fmt0(career.games) },
    { label: "Seasons", value: fmt0(career.seasons) },
  ];

  if (pos === "QB") {
    return [...common,
      { label: "Pass Yds", value: fmt0(career.passing_yards) },
      { label: "Pass TD", value: fmt0(career.passing_tds) },
      { label: "Rush Yds", value: fmt0(career.rushing_yards) },
    ];
  } else if (pos === "RB") {
    return [...common,
      { label: "Rush Yds", value: fmt0(career.rushing_yards) },
      { label: "Rush TD", value: fmt0(career.rushing_tds) },
      { label: "Rec Yds", value: fmt0(career.receiving_yards) },
    ];
  } else {
    return [...common,
      { label: "Rec Yds", value: fmt0(career.receiving_yards) },
      { label: "Rec TD", value: fmt0(career.receiving_tds) },
      { label: "Receptions", value: fmt0(career.receptions) },
    ];
  }
}

function getSeasonColumns(pos) {
  const fmt0 = v => v != null ? Math.round(v) : "—";
  const fmt1 = v => v != null ? Number(v).toFixed(1) : "—";
  const fmtPct = v => v != null ? Number(v).toFixed(1) + "%" : "—";

  const base = [
    { key: "games", label: "GP", fmt: fmt0 },
    { key: "fantasy_points_ppr", label: "PPR", fmt: fmt1 },
  ];

  if (pos === "QB") {
    return [...base,
      { key: "completions", label: "CMP", fmt: fmt0 },
      { key: "attempts", label: "ATT", fmt: fmt0 },
      { key: "passing_yards", label: "Pass Yds", fmt: fmt0 },
      { key: "passing_tds", label: "Pass TD", fmt: fmt0 },
      { key: "comp_pct", label: "CMP%", fmt: fmtPct },
      { key: "rushing_yards", label: "Rush Yds", fmt: fmt0 },
      { key: "rushing_tds", label: "Rush TD", fmt: fmt0 },
      { key: "turnovers", label: "TO", fmt: fmt0 },
    ];
  } else if (pos === "RB") {
    return [...base,
      { key: "carries", label: "CAR", fmt: fmt0 },
      { key: "rushing_yards", label: "Rush Yds", fmt: fmt0 },
      { key: "rushing_tds", label: "Rush TD", fmt: fmt0 },
      { key: "yards_per_carry", label: "Y/CAR", fmt: fmt1 },
      { key: "targets", label: "TGT", fmt: fmt0 },
      { key: "receptions", label: "REC", fmt: fmt0 },
      { key: "receiving_yards", label: "Rec Yds", fmt: fmt0 },
      { key: "receiving_tds", label: "Rec TD", fmt: fmt0 },
    ];
  } else {
    return [...base,
      { key: "targets", label: "TGT", fmt: fmt0 },
      { key: "receptions", label: "REC", fmt: fmt0 },
      { key: "receiving_yards", label: "Rec Yds", fmt: fmt0 },
      { key: "receiving_tds", label: "Rec TD", fmt: fmt0 },
      { key: "yards_per_rec", label: "Y/REC", fmt: fmt1 },
      { key: "catch_rate", label: "Catch%", fmt: fmtPct },
      { key: "receiving_yards_after_catch", label: "YAC", fmt: fmt0 },
    ];
  }
}

function drawProfileArc(seasons, pos) {
  const canvas = document.getElementById("profileArcCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const W = canvas.width;
  const H = canvas.height;
  const pad = { top: 20, right: 30, bottom: 35, left: 55 };
  const plotW = W - pad.left - pad.right;
  const plotH = H - pad.top - pad.bottom;

  const posHex = { QB: "#5b7fff", RB: "#2ec4b6", WR: "#d97757", TE: "#8b5cf6" };
  const lineColor = posHex[pos] || "#d97757";

  ctx.clearRect(0, 0, W, H);

  const values = seasons.map(s => s.fantasy_points_ppr || 0);
  const labels = seasons.map(s => String(s.season));
  const maxVal = Math.max(...values, 1);

  // Y-axis gridlines
  ctx.strokeStyle = "#c5c5d0";
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);
  const yTicks = 4;
  for (let i = 0; i <= yTicks; i++) {
    const y = pad.top + plotH - (i / yTicks) * plotH;
    ctx.beginPath();
    ctx.moveTo(pad.left, y);
    ctx.lineTo(W - pad.right, y);
    ctx.stroke();

    ctx.fillStyle = "#8a8a9e";
    ctx.font = "11px 'Space Mono', monospace";
    ctx.textAlign = "right";
    ctx.fillText(Math.round((i / yTicks) * maxVal), pad.left - 8, y + 4);
  }
  ctx.setLineDash([]);

  // X-axis labels
  ctx.fillStyle = "#8a8a9e";
  ctx.font = "11px 'Space Mono', monospace";
  ctx.textAlign = "center";
  for (let i = 0; i < labels.length; i++) {
    const x = pad.left + (labels.length === 1 ? plotW / 2 : (i / (labels.length - 1)) * plotW);
    ctx.fillText(labels[i], x, H - pad.bottom + 18);
  }

  if (labels.length === 1) {
    // Single season — just a dot
    const x = pad.left + plotW / 2;
    const y = pad.top + plotH - (values[0] / maxVal) * plotH;
    ctx.beginPath();
    ctx.arc(x, y, 6, 0, Math.PI * 2);
    ctx.fillStyle = lineColor;
    ctx.fill();
    ctx.strokeStyle = "#1a1a2e";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = "#1a1a2e";
    ctx.font = "bold 11px 'Space Mono', monospace";
    ctx.fillText(Math.round(values[0]), x, y - 14);
    return;
  }

  // Filled area
  ctx.beginPath();
  for (let i = 0; i < values.length; i++) {
    const x = pad.left + (i / (values.length - 1)) * plotW;
    const y = pad.top + plotH - (values[i] / maxVal) * plotH;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.lineTo(pad.left + plotW, pad.top + plotH);
  ctx.lineTo(pad.left, pad.top + plotH);
  ctx.closePath();
  ctx.fillStyle = lineColor;
  ctx.globalAlpha = 0.15;
  ctx.fill();
  ctx.globalAlpha = 1.0;

  // Line
  ctx.beginPath();
  ctx.strokeStyle = lineColor;
  ctx.lineWidth = 3;
  for (let i = 0; i < values.length; i++) {
    const x = pad.left + (i / (values.length - 1)) * plotW;
    const y = pad.top + plotH - (values[i] / maxVal) * plotH;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  // Data points + labels
  for (let i = 0; i < values.length; i++) {
    const x = pad.left + (i / (values.length - 1)) * plotW;
    const y = pad.top + plotH - (values[i] / maxVal) * plotH;
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fillStyle = lineColor;
    ctx.fill();
    ctx.strokeStyle = "#1a1a2e";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = "#1a1a2e";
    ctx.font = "bold 11px 'Space Mono', monospace";
    ctx.textAlign = "center";
    ctx.fillText(Math.round(values[i]), x, y - 12);
  }

  // Y-axis label
  ctx.save();
  ctx.translate(14, pad.top + plotH / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillStyle = "#8a8a9e";
  ctx.font = "10px 'Space Mono', monospace";
  ctx.textAlign = "center";
  ctx.fillText("PPR Points", 0, 0);
  ctx.restore();
}

// ─── Profile Image Export ──────────────────────────────────────────

function exportProfileImage() {
  const content = document.getElementById("profileContent");
  if (!content) return;

  const nameEl = content.querySelector(".profile-name");
  const metaEl = content.querySelector(".profile-meta");
  const badgeEl = content.querySelector(".profile-pos-badge");
  if (!nameEl) return;

  const name = nameEl.textContent;
  const meta = metaEl ? metaEl.textContent : "";
  const pos = badgeEl ? badgeEl.textContent.trim() : "";

  // Stat boxes
  const statBoxes = content.querySelectorAll(".profile-stat-box");
  const stats = [];
  statBoxes.forEach(box => {
    const val = box.querySelector(".profile-stat-value")?.textContent || "";
    const label = box.querySelector(".profile-stat-label")?.textContent || "";
    stats.push({ val, label });
  });

  // Season table
  const seasonTable = content.querySelector(".profile-season-table");
  const headers = [];
  const rows = [];
  if (seasonTable) {
    seasonTable.querySelectorAll("thead th").forEach(th => headers.push(th.textContent));
    seasonTable.querySelectorAll("tbody tr").forEach(tr => {
      const cells = [];
      tr.querySelectorAll("td").forEach(td => cells.push(td.textContent));
      rows.push(cells);
    });
  }

  const padX = 30, padY = 30;
  const headerH = 80, statsBarH = 70;
  const tableHeaderH = 28, tableRowH = 24;
  const tableH = rows.length > 0 ? tableHeaderH + rows.length * tableRowH : 0;
  const watermarkH = 40;
  const W = 800;
  const H = padY + headerH + statsBarH + 20 + tableH + watermarkH + padY;

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");

  // Background
  ctx.fillStyle = "#f7efe5";
  ctx.fillRect(0, 0, W, H);

  const posColors = { QB: "#5b7fff", RB: "#2ec4b6", WR: "#d97757", TE: "#8b5cf6" };
  const pColor = posColors[pos] || "#1a1a2e";

  // Position badge
  ctx.fillStyle = pColor;
  ctx.fillRect(padX, padY, 50, 36);
  ctx.strokeStyle = "#1a1a2e";
  ctx.lineWidth = 2;
  ctx.strokeRect(padX, padY, 50, 36);
  ctx.fillStyle = "#fff";
  ctx.font = "bold 16px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(pos, padX + 25, padY + 24);

  // Name + meta
  ctx.textAlign = "left";
  ctx.fillStyle = "#1a1a2e";
  ctx.font = "bold 28px sans-serif";
  ctx.fillText(name, padX + 64, padY + 28);
  ctx.fillStyle = "#8a8a9e";
  ctx.font = "12px monospace";
  ctx.fillText(meta, padX + 64, padY + 48);

  // Stats bar
  const sbY = padY + headerH;
  const sbW = (W - padX * 2) / Math.max(stats.length, 1);
  ctx.strokeStyle = "#1a1a2e";
  ctx.lineWidth = 3;
  ctx.strokeRect(padX, sbY, W - padX * 2, statsBarH);

  for (let i = 0; i < stats.length; i++) {
    const x = padX + i * sbW;
    if (i > 0) {
      ctx.strokeStyle = "#c5c5d0";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, sbY);
      ctx.lineTo(x, sbY + statsBarH);
      ctx.stroke();
    }
    ctx.fillStyle = "#1a1a2e";
    ctx.font = "bold 22px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(stats[i].val, x + sbW / 2, sbY + 32);
    ctx.fillStyle = "#8a8a9e";
    ctx.font = "10px monospace";
    ctx.fillText(stats[i].label.toUpperCase(), x + sbW / 2, sbY + 52);
  }

  // Season table
  if (rows.length > 0) {
    const tY = sbY + statsBarH + 20;
    const colW = (W - padX * 2) / headers.length;

    ctx.fillStyle = "#e5d5c3";
    ctx.fillRect(padX, tY, W - padX * 2, tableHeaderH);
    ctx.strokeStyle = "#1a1a2e";
    ctx.lineWidth = 3;
    ctx.strokeRect(padX, tY, W - padX * 2, tableHeaderH);

    ctx.fillStyle = "#1a1a2e";
    ctx.font = "bold 10px monospace";
    for (let i = 0; i < headers.length; i++) {
      ctx.textAlign = i === 0 ? "left" : "right";
      const x = i === 0 ? padX + 8 : padX + (i + 1) * colW - 8;
      ctx.fillText(headers[i], x, tY + 18);
    }

    for (let r = 0; r < rows.length; r++) {
      const rY = tY + tableHeaderH + r * tableRowH;
      const isCareer = r === rows.length - 1;
      if (isCareer) {
        ctx.fillStyle = "#e5d5c3";
        ctx.fillRect(padX, rY, W - padX * 2, tableRowH);
      }
      ctx.strokeStyle = "#c5c5d0";
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(padX, rY + tableRowH);
      ctx.lineTo(W - padX, rY + tableRowH);
      ctx.stroke();

      ctx.fillStyle = "#1a1a2e";
      ctx.font = isCareer ? "bold 11px monospace" : "11px monospace";
      for (let c = 0; c < rows[r].length; c++) {
        ctx.textAlign = c === 0 ? "left" : "right";
        const x = c === 0 ? padX + 8 : padX + (c + 1) * colW - 8;
        ctx.fillText(rows[r][c], x, rY + 16);
      }
    }

    ctx.strokeStyle = "#1a1a2e";
    ctx.lineWidth = 3;
    ctx.strokeRect(padX, tY, W - padX * 2, tableHeaderH + rows.length * tableRowH);
  }

  // Watermark
  const wmY = H - watermarkH / 2;
  ctx.font = "bold 16px sans-serif";
  ctx.fillStyle = "#1a1a2e";
  ctx.globalAlpha = 0.3;
  ctx.textAlign = "center";
  ctx.fillText("built different — razzle.lol", W / 2, wmY);
  ctx.globalAlpha = 1.0;

  const safeName = name.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase();
  const link = document.createElement("a");
  link.download = `razzle-profile-${safeName}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
}


// ─── Prospect Profile ──────────────────────────────────────────────

async function openProspectProfile(name, position, draftYear) {
  if (!name) return;
  const overlay = document.getElementById("profileOverlay");
  const content = document.getElementById("profileContent");
  overlay.classList.add("open");
  content.innerHTML = `<div style="text-align:center; padding:40px; font-family:var(--font-hand); font-size:22px; color:var(--ink-light);">scouting the prospect...</div>`;

  try {
    const params = new URLSearchParams({ name, position, draft_year: draftYear });
    const [data, compsData] = await Promise.all([
      apiFetch(`/api/prospect-profile?${params}`),
      apiFetch(`/api/prospect-comps?${params}`).catch(() => ({ comps: [] })),
    ]);
    renderProspectProfile(data, content, compsData);
  } catch (err) {
    content.innerHTML = `<div style="text-align:center; padding:40px; font-family:var(--font-hand); font-size:22px; color:var(--red);">fumbled the prospect data... ${err.message}</div>`;
  }
}

function renderProspectProfile(data, container, compsData) {
  const { prospect, percentiles } = data;
  if (!prospect || !prospect.player_name) {
    container.innerHTML = `<div style="text-align:center; padding:40px; font-family:var(--font-hand); font-size:22px; color:var(--ink-light);">prospect not found on the board</div>`;
    return;
  }

  const pos = (prospect.position || "").toUpperCase();
  const posColor = "var(--pos-qb)"; // Blue accent for all prospects per design guide

  let html = "";

  // Header with blue prospect accent
  html += `<div class="profile-header" style="border-top: 6px solid ${posColor};">`;
  html += `<span class="profile-pos-badge" style="background:${posColor};">${pos}</span>`;
  html += `<div>`;
  html += `<div class="profile-name">${prospect.player_name}</div>`;
  html += `<div class="profile-meta">`;
  html += prospect.school || "";
  if (prospect.draft_team) html += ` · ${prospect.draft_team}`;
  if (prospect.draft_round && prospect.draft_pick) {
    html += ` · Rd ${prospect.draft_round}, Pick #${prospect.draft_pick}`;
  } else {
    html += ` · ${prospect.draft_year} Draft Class`;
  }
  html += `</div>`;
  html += `<span class="prospect-badge">PROSPECT</span>`;
  html += `</div>`;
  html += `<button class="btn-primary" onclick="exportProspectImage()" style="margin-left:auto; font-size:11px; padding:6px 14px;">Export PNG</button>`;
  html += `</div>`;

  // Measurables bar
  const measurables = [];
  if (prospect.height_display) measurables.push({ label: "Height", value: prospect.height_display });
  if (prospect.weight) measurables.push({ label: "Weight", value: `${prospect.weight} lbs` });
  if (prospect.draft_round) measurables.push({ label: "Draft", value: `Rd ${prospect.draft_round}, #${prospect.draft_pick}` });
  if (prospect.draft_team) measurables.push({ label: "Team", value: prospect.draft_team });

  if (measurables.length) {
    html += `<div class="profile-stats-bar">`;
    for (const m of measurables) {
      html += `<div class="profile-stat-box">`;
      html += `<div class="profile-stat-value">${m.value}</div>`;
      html += `<div class="profile-stat-label">${m.label}</div>`;
      html += `</div>`;
    }
    html += `</div>`;
  }

  // Athletic testing with percentile bars
  const combineMetrics = [
    { key: "forty", label: "40-Yard Dash", fmt: v => v ? v.toFixed(2) + "s" : null, unit: "s" },
    { key: "bench", label: "Bench Press", fmt: v => v ? `${v} reps` : null, unit: "reps" },
    { key: "vertical", label: "Vertical Jump", fmt: v => v ? v.toFixed(1) + '"' : null, unit: '"' },
    { key: "broad_jump", label: "Broad Jump", fmt: v => v ? v + '"' : null, unit: '"' },
    { key: "cone", label: "3-Cone Drill", fmt: v => v ? v.toFixed(2) + "s" : null, unit: "s" },
    { key: "shuttle", label: "20-Yd Shuttle", fmt: v => v ? v.toFixed(2) + "s" : null, unit: "s" },
  ];

  const hasAnyMetric = combineMetrics.some(m => prospect[m.key] != null);
  if (hasAnyMetric) {
    html += `<div class="profile-section-title">Athletic Testing</div>`;
    html += `<div class="prospect-combine-grid">`;

    for (const m of combineMetrics) {
      const val = prospect[m.key];
      const pct = percentiles[m.key];
      const display = m.fmt(val);
      if (!display) continue;

      const pctColor = pct != null ? getPercentileColor(pct) : "var(--ink-faint)";
      const pctLabel = pct != null ? `${Math.round(pct)}th` : "—";
      const barWidth = pct != null ? Math.max(pct, 3) : 0;

      html += `<div class="prospect-metric-row">`;
      html += `<div class="prospect-metric-label">${m.label}</div>`;
      html += `<div class="prospect-metric-value">${display}</div>`;
      html += `<div class="prospect-metric-bar-wrap">`;
      html += `<div class="prospect-metric-bar" style="width:${barWidth}%; background:${pctColor};"></div>`;
      html += `</div>`;
      html += `<div class="prospect-metric-pct" style="color:${pctColor};">${pctLabel}</div>`;
      html += `</div>`;
    }

    html += `</div>`;
  }

  // Spider chart canvas for combine percentiles
  const hasSpiderData = combineMetrics.some(m => percentiles[m.key] != null);
  if (hasSpiderData) {
    html += `<div class="profile-section-title">Athletic Profile</div>`;
    html += `<div class="profile-chart-wrap" style="text-align:center;">`;
    html += `<canvas id="prospectSpiderCanvas" width="400" height="360" style="border:2px solid var(--ink); border-radius:8px; background:var(--bg); max-width:100%;"></canvas>`;
    html += `</div>`;
  }

  // NFL Career stats (if drafted and has played)
  const hasNFL = prospect.nfl_games && prospect.nfl_games > 0;
  if (hasNFL) {
    html += `<div class="profile-section-title">NFL Career</div>`;
    html += `<div class="profile-stats-bar">`;

    const nflStats = [];
    nflStats.push({ label: "Games", value: prospect.nfl_games });
    if (prospect.career_av) nflStats.push({ label: "Career AV", value: prospect.career_av });
    if (prospect.nfl_pass_yards) nflStats.push({ label: "Pass Yds", value: Math.round(prospect.nfl_pass_yards).toLocaleString() });
    if (prospect.nfl_pass_tds) nflStats.push({ label: "Pass TD", value: prospect.nfl_pass_tds });
    if (prospect.nfl_rush_yards) nflStats.push({ label: "Rush Yds", value: Math.round(prospect.nfl_rush_yards).toLocaleString() });
    if (prospect.nfl_rush_tds) nflStats.push({ label: "Rush TD", value: prospect.nfl_rush_tds });
    if (prospect.nfl_rec_yards) nflStats.push({ label: "Rec Yds", value: Math.round(prospect.nfl_rec_yards).toLocaleString() });
    if (prospect.nfl_rec_tds) nflStats.push({ label: "Rec TD", value: prospect.nfl_rec_tds });
    if (prospect.nfl_receptions) nflStats.push({ label: "Receptions", value: prospect.nfl_receptions });
    if (prospect.allpro) nflStats.push({ label: "All-Pro", value: prospect.allpro });
    if (prospect.probowls) nflStats.push({ label: "Pro Bowl", value: prospect.probowls });

    for (const s of nflStats) {
      html += `<div class="profile-stat-box">`;
      html += `<div class="profile-stat-value">${s.value}</div>`;
      html += `<div class="profile-stat-label">${s.label}</div>`;
      html += `</div>`;
    }
    html += `</div>`;
  }

  // NFL Athletic Comps section
  const comps = (compsData && compsData.comps) ? compsData.comps.slice(0, 3) : [];
  if (comps.length > 0) {
    html += `<div class="profile-section-title">NFL Athletic Comps</div>`;
    html += `<div style="font-family:var(--font-hand); font-size:16px; color:var(--ink-light); margin:-6px 0 10px 0;">closest combine profiles at ${pos}</div>`;
    html += `<div class="prospect-comps-grid">`;

    for (const comp of comps) {
      const simPct = Math.round(comp.similarity);
      const simColor = simPct >= 85 ? "#22a06b" : simPct >= 70 ? "#2ec4b6" : simPct >= 55 ? "#ffc857" : "#e87422";

      // Career headline stat based on position
      let headline = "";
      if (pos === "QB" && comp.nfl_pass_yards) {
        headline = `${Math.round(comp.nfl_pass_yards).toLocaleString()} pass yds`;
      } else if (pos === "RB" && comp.nfl_rush_yards) {
        headline = `${Math.round(comp.nfl_rush_yards).toLocaleString()} rush yds`;
      } else if ((pos === "WR" || pos === "TE") && comp.nfl_rec_yards) {
        headline = `${Math.round(comp.nfl_rec_yards).toLocaleString()} rec yds`;
      } else if (comp.career_av) {
        headline = `${comp.career_av} career AV`;
      }

      const draftInfo = comp.draft_round && comp.draft_pick
        ? `Rd ${comp.draft_round}, #${comp.draft_pick}`
        : `${comp.draft_year} class`;

      html += `<div class="prospect-comp-card">`;
      html += `<div class="prospect-comp-sim" style="background:${simColor};">${simPct}%</div>`;
      html += `<div class="prospect-comp-info">`;
      html += `<div class="prospect-comp-name">${comp.player_name}</div>`;
      html += `<div class="prospect-comp-meta">${comp.draft_year}`;
      if (comp.draft_team) html += ` · ${comp.draft_team}`;
      html += ` · ${draftInfo}</div>`;
      if (comp.nfl_games) {
        html += `<div class="prospect-comp-stats">`;
        html += `<span>${comp.nfl_games} games</span>`;
        if (headline) html += `<span> · ${headline}</span>`;
        if (comp.allpro) html += `<span> · ${comp.allpro}× All-Pro</span>`;
        html += `</div>`;
      } else {
        html += `<div class="prospect-comp-stats" style="color:var(--ink-light);">no NFL stats yet</div>`;
      }
      html += `</div>`;
      html += `</div>`;
    }

    html += `</div>`;
  }

  container.innerHTML = html;

  // Draw spider chart after DOM update
  if (hasSpiderData) {
    requestAnimationFrame(() => drawProspectSpider(prospect, percentiles, combineMetrics));
  }
}

function getPercentileColor(pct) {
  // Red (0) → Yellow (50) → Green (100)
  if (pct <= 20) return "#e63946";
  if (pct <= 40) return "#e87422";
  if (pct <= 60) return "#ffc857";
  if (pct <= 80) return "#2ec4b6";
  return "#22a06b";
}

function drawProspectSpider(prospect, percentiles, metrics) {
  const canvas = document.getElementById("prospectSpiderCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const W = canvas.width;
  const H = canvas.height;
  const cx = W / 2;
  const cy = H / 2 + 10;
  const R = Math.min(W, H) / 2 - 60;

  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = "#ede0cf";
  ctx.fillRect(0, 0, W, H);

  // Filter to metrics that have data
  const activeMetrics = metrics.filter(m => percentiles[m.key] != null);
  if (activeMetrics.length < 3) return;

  const n = activeMetrics.length;
  const angleStep = (Math.PI * 2) / n;
  const startAngle = -Math.PI / 2;

  // Draw grid rings
  const rings = [20, 40, 60, 80, 100];
  for (const ring of rings) {
    ctx.beginPath();
    for (let i = 0; i <= n; i++) {
      const angle = startAngle + i * angleStep;
      const r = (ring / 100) * R;
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.strokeStyle = ring === 50 ? "rgba(26,26,46,0.2)" : "rgba(26,26,46,0.08)";
    ctx.lineWidth = ring === 50 ? 1.5 : 1;
    ctx.stroke();
  }

  // Draw axis lines
  for (let i = 0; i < n; i++) {
    const angle = startAngle + i * angleStep;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + R * Math.cos(angle), cy + R * Math.sin(angle));
    ctx.strokeStyle = "rgba(26,26,46,0.1)";
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // Draw data polygon
  ctx.beginPath();
  for (let i = 0; i <= n; i++) {
    const idx = i % n;
    const angle = startAngle + idx * angleStep;
    const pct = percentiles[activeMetrics[idx].key] || 0;
    const r = (pct / 100) * R;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fillStyle = "rgba(91, 127, 255, 0.25)";
  ctx.fill();
  ctx.strokeStyle = "#5b7fff";
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Draw data points
  for (let i = 0; i < n; i++) {
    const angle = startAngle + i * angleStep;
    const pct = percentiles[activeMetrics[i].key] || 0;
    const r = (pct / 100) * R;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);

    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fillStyle = "#5b7fff";
    ctx.fill();
    ctx.strokeStyle = "#1a1a2e";
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  // Draw labels
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  for (let i = 0; i < n; i++) {
    const angle = startAngle + i * angleStep;
    const labelR = R + 35;
    const x = cx + labelR * Math.cos(angle);
    const y = cy + labelR * Math.sin(angle);

    const pct = percentiles[activeMetrics[i].key];
    const pctColor = getPercentileColor(pct);

    // Metric name
    ctx.font = "bold 11px 'Space Mono', monospace";
    ctx.fillStyle = "#1a1a2e";
    ctx.fillText(activeMetrics[i].label.replace(" Drill", "").replace(" Dash", "").replace(" Press", "").replace(" Jump", ""), x, y - 8);

    // Percentile value
    ctx.font = "bold 12px 'Space Mono', monospace";
    ctx.fillStyle = pctColor;
    ctx.fillText(`${Math.round(pct)}th`, x, y + 8);
  }

  // Title
  ctx.font = "18px 'Caveat', cursive";
  ctx.fillStyle = "rgba(26,26,46,0.5)";
  ctx.textAlign = "center";
  ctx.fillText(`${prospect.player_name} — ${prospect.position} Athletic Profile`, cx, 20);
}

function exportProspectImage() {
  const content = document.getElementById("profileContent");
  if (!content) return;
  const prospect = content.querySelector(".profile-name");
  const name = prospect ? prospect.textContent : "prospect";

  // Create canvas for export
  const canvas = document.createElement("canvas");
  const W = 800;
  const padX = 30;
  const padY = 30;

  // Gather info from DOM
  const header = content.querySelector(".profile-header");
  const statsBar = content.querySelector(".profile-stats-bar");
  const combineGrid = content.querySelector(".prospect-combine-grid");
  const spiderCanvas = document.getElementById("prospectSpiderCanvas");

  let H = padY * 2 + 80; // header
  if (statsBar) H += 80;
  if (combineGrid) H += combineGrid.children.length * 36 + 50;
  if (spiderCanvas) H += 380;
  H += 40; // watermark

  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");

  // Background
  ctx.fillStyle = "#ede0cf";
  ctx.fillRect(0, 0, W, H);

  let y = padY;

  // Header
  const posText = content.querySelector(".profile-pos-badge")?.textContent || "";
  const metaText = content.querySelector(".profile-meta")?.textContent || "";
  ctx.fillStyle = "#5b7fff";
  ctx.fillRect(padX, y, W - padX * 2, 6);
  y += 14;

  ctx.font = "bold 24px sans-serif";
  ctx.fillStyle = "#1a1a2e";
  ctx.textAlign = "left";
  ctx.fillText(`${posText}  ${name}`, padX + 8, y + 24);

  ctx.font = "14px sans-serif";
  ctx.fillStyle = "#4a4a5e";
  ctx.fillText(metaText, padX + 8, y + 46);
  y += 70;

  // Stats bar
  if (statsBar) {
    const boxes = statsBar.querySelectorAll(".profile-stat-box");
    const boxW = (W - padX * 2) / boxes.length;
    boxes.forEach((box, i) => {
      const val = box.querySelector(".profile-stat-value")?.textContent || "";
      const lbl = box.querySelector(".profile-stat-label")?.textContent || "";
      const bx = padX + i * boxW;
      ctx.font = "bold 20px sans-serif";
      ctx.fillStyle = "#1a1a2e";
      ctx.textAlign = "center";
      ctx.fillText(val, bx + boxW / 2, y + 24);
      ctx.font = "11px sans-serif";
      ctx.fillStyle = "#8a8a9e";
      ctx.fillText(lbl, bx + boxW / 2, y + 42);
    });
    y += 60;
  }

  // Combine metrics with bars
  if (combineGrid) {
    ctx.font = "bold 13px sans-serif";
    ctx.fillStyle = "#1a1a2e";
    ctx.textAlign = "left";
    ctx.fillText("Athletic Testing", padX + 8, y + 16);
    y += 30;

    const rows = combineGrid.querySelectorAll(".prospect-metric-row");
    rows.forEach(row => {
      const label = row.querySelector(".prospect-metric-label")?.textContent || "";
      const value = row.querySelector(".prospect-metric-value")?.textContent || "";
      const pctText = row.querySelector(".prospect-metric-pct")?.textContent || "";
      const bar = row.querySelector(".prospect-metric-bar");
      const barWidth = bar ? parseFloat(bar.style.width) || 0 : 0;
      const barColor = bar ? bar.style.background : "#ccc";

      ctx.font = "12px sans-serif";
      ctx.fillStyle = "#1a1a2e";
      ctx.textAlign = "left";
      ctx.fillText(label, padX + 8, y + 12);

      ctx.font = "bold 12px monospace";
      ctx.textAlign = "right";
      ctx.fillText(value, padX + 200, y + 12);

      // Bar
      const barStartX = padX + 210;
      const barMaxW = W - padX * 2 - 280;
      ctx.fillStyle = "rgba(26,26,46,0.06)";
      ctx.fillRect(barStartX, y + 2, barMaxW, 14);
      ctx.fillStyle = barColor;
      ctx.fillRect(barStartX, y + 2, (barWidth / 100) * barMaxW, 14);

      ctx.font = "bold 11px monospace";
      ctx.fillStyle = barColor;
      ctx.textAlign = "right";
      ctx.fillText(pctText, W - padX - 8, y + 14);

      y += 32;
    });
    y += 10;
  }

  // Spider chart
  if (spiderCanvas) {
    ctx.drawImage(spiderCanvas, (W - 400) / 2, y, 400, 360);
    y += 370;
  }

  // Watermark
  ctx.font = "bold 16px sans-serif";
  ctx.fillStyle = "#1a1a2e";
  ctx.globalAlpha = 0.3;
  ctx.textAlign = "center";
  ctx.fillText("built different — razzle.lol", W / 2, y + 10);
  ctx.globalAlpha = 1.0;

  const safeName = name.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase();
  const link = document.createElement("a");
  link.download = `razzle-prospect-${safeName}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
}


// ─── Prospect Tier View ──────────────────────────────────────────

let currentTierPosition = "";

function openTierView() {
  document.getElementById("tierOverlay").classList.add("open");
  const btnsEl = document.getElementById("tierPositionBtns");
  const positions = ["QB", "RB", "WR", "TE"];
  btnsEl.innerHTML = positions.map(pos => {
    const posColor = { QB: "var(--pos-qb)", RB: "var(--pos-rb)", WR: "var(--pos-wr)", TE: "var(--pos-te)" }[pos];
    return `<button class="btn-chunky tier-pos-btn" data-pos="${pos}" onclick="loadTierData('${pos}')" style="font-size:11px; padding:4px 12px; border-color:${posColor};">${pos}</button>`;
  }).join("");

  // Auto-load first position or current filter
  const defaultPos = state.position || "WR";
  loadTierData(defaultPos);
}

function closeTierView(e) {
  if (e && e.target !== e.currentTarget) return;
  document.getElementById("tierOverlay").classList.remove("open");
}

async function loadTierData(position) {
  currentTierPosition = position;
  const contentEl = document.getElementById("tierContent");
  contentEl.innerHTML = `<div style="text-align:center; padding:40px; font-family:var(--font-hand); font-size:22px; color:var(--ink-light);">grading the ${position} prospects...</div>`;

  // Highlight active button
  document.querySelectorAll(".tier-pos-btn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.pos === position);
  });

  try {
    const data = await apiFetch(`/api/prospect-tiers?position=${position}&draft_year=${state.season}`);
    renderTierView(data, contentEl);
  } catch (err) {
    contentEl.innerHTML = `<div style="text-align:center; padding:40px; font-family:var(--font-hand); font-size:22px; color:var(--red);">fumbled the tier data... ${err.message}</div>`;
  }
}

function renderTierView(data, container) {
  const tierDefs = [
    { key: "elite", label: "Elite", color: "#22a06b", desc: "80th+ percentile avg" },
    { key: "above_avg", label: "Above Average", color: "#2ec4b6", desc: "60th-80th percentile" },
    { key: "average", label: "Average", color: "#ffc857", desc: "40th-60th percentile" },
    { key: "below_avg", label: "Below Average", color: "#e87422", desc: "below 40th percentile" },
    { key: "no_data", label: "No Combine Data", color: "#8a8a9e", desc: "did not test" },
  ];

  let html = `<div style="font-family:var(--font-hand); font-size:16px; color:var(--ink-light); margin-bottom:16px;">${data.draft_year} ${data.position} prospects — grouped by average combine percentile</div>`;

  let hasAnyProspects = false;

  for (const td of tierDefs) {
    const prospects = data.tiers[td.key] || [];
    if (prospects.length === 0) continue;
    hasAnyProspects = true;

    html += `<div class="tier-group">`;
    html += `<div class="tier-badge" style="background:${td.color};">${td.label}</div>`;
    html += `<span style="font-family:var(--font-mono); font-size:10px; color:var(--ink-light); margin-left:8px;">${td.desc}</span>`;
    html += `<div class="tier-grid">`;

    for (const p of prospects) {
      const avgPct = p.avg_percentile != null ? Math.round(p.avg_percentile) : null;
      const pctColor = avgPct != null ? getPercentileColor(avgPct) : "var(--ink-faint)";

      // Key metrics summary
      let metricsStr = "";
      if (p.forty) metricsStr += `40: ${p.forty.toFixed(2)}s`;
      if (p.vertical) metricsStr += (metricsStr ? " · " : "") + `Vert: ${p.vertical.toFixed(1)}"`;
      if (p.broad_jump) metricsStr += (metricsStr ? " · " : "") + `Broad: ${p.broad_jump}"`;

      const draftInfo = p.draft_round && p.draft_pick ? `Rd ${p.draft_round}, #${p.draft_pick}` : "";

      html += `<div class="tier-card">`;
      html += `<div style="display:flex; align-items:flex-start; gap:10px;">`;
      html += `<div style="flex:1;">`;
      html += `<div class="tier-card-name">${p.player_name}</div>`;
      html += `<div class="tier-card-meta">${p.school || ""}${draftInfo ? " · " + draftInfo : ""}</div>`;
      html += `</div>`;
      if (avgPct != null) {
        html += `<div class="tier-card-pct" style="color:${pctColor};">${avgPct}<span style="font-size:11px;">th</span></div>`;
      }
      html += `</div>`;
      if (metricsStr) {
        html += `<div class="tier-card-metrics">${metricsStr}</div>`;
      }
      html += `</div>`;
    }

    html += `</div></div>`;
  }

  if (!hasAnyProspects) {
    html += `<div style="text-align:center; padding:40px; font-family:var(--font-hand); font-size:22px; color:var(--ink-light);">no ${data.position} prospects found for ${data.draft_year}</div>`;
  }

  container.innerHTML = html;
}

function exportTierImage() {
  const contentEl = document.getElementById("tierContent");
  if (!contentEl) return;

  const canvas = document.createElement("canvas");
  const W = 900;
  const padX = 30;
  const padY = 30;

  // Estimate height from tier groups
  const tierGroups = contentEl.querySelectorAll(".tier-group");
  let H = padY * 2 + 60; // header + subheader
  tierGroups.forEach(g => {
    const cards = g.querySelectorAll(".tier-card");
    const rows = Math.ceil(cards.length / 3);
    H += 50 + rows * 80; // badge + cards
  });
  H += 40; // watermark

  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");

  // Background
  ctx.fillStyle = "#ede0cf";
  ctx.fillRect(0, 0, W, H);

  let y = padY;

  // Title
  ctx.font = "bold 24px sans-serif";
  ctx.fillStyle = "#1a1a2e";
  ctx.textAlign = "center";
  ctx.fillText(`${state.season} ${currentTierPosition} Athletic Tiers`, W / 2, y + 24);
  y += 40;

  ctx.font = "16px 'Caveat', cursive";
  ctx.fillStyle = "#8a8a9e";
  ctx.fillText("grouped by avg combine percentile — razzle.lol", W / 2, y + 14);
  y += 30;

  // Draw each tier group
  const tierColors = { elite: "#22a06b", above_avg: "#2ec4b6", average: "#ffc857", below_avg: "#e87422", no_data: "#8a8a9e" };
  const tierLabels = { elite: "ELITE", above_avg: "ABOVE AVG", average: "AVERAGE", below_avg: "BELOW AVG", no_data: "NO DATA" };

  tierGroups.forEach(g => {
    const badge = g.querySelector(".tier-badge");
    const cards = g.querySelectorAll(".tier-card");
    if (!badge || cards.length === 0) return;

    const badgeText = badge.textContent.toUpperCase();
    const badgeColor = badge.style.background || "#8a8a9e";

    // Draw badge
    ctx.save();
    ctx.translate(padX + 60, y + 14);
    ctx.rotate(-0.03);
    const tw = ctx.measureText(badgeText).width + 28;
    ctx.fillStyle = badgeColor;
    ctx.beginPath();
    ctx.roundRect(-tw / 2, -12, tw, 24, 12);
    ctx.fill();
    ctx.strokeStyle = "#1a1a2e";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = "white";
    ctx.font = "bold 12px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(badgeText, 0, 4);
    ctx.restore();

    y += 34;

    // Draw cards in rows of 3
    const cardW = (W - padX * 2 - 20) / 3;
    cards.forEach((card, i) => {
      const col = i % 3;
      const row = Math.floor(i / 3);
      const cx = padX + col * (cardW + 10);
      const cy = y + row * 72;

      const name = card.querySelector(".tier-card-name")?.textContent || "";
      const meta = card.querySelector(".tier-card-meta")?.textContent || "";
      const pctEl = card.querySelector(".tier-card-pct");
      const metrics = card.querySelector(".tier-card-metrics")?.textContent || "";

      // Card background
      ctx.fillStyle = "#f7efe5";
      ctx.strokeStyle = "#1a1a2e";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(cx, cy, cardW, 64, 8);
      ctx.fill();
      ctx.stroke();

      // Name
      ctx.font = "bold 14px sans-serif";
      ctx.fillStyle = "#1a1a2e";
      ctx.textAlign = "left";
      ctx.fillText(name.substring(0, 22), cx + 8, cy + 18);

      // Meta
      ctx.font = "10px monospace";
      ctx.fillStyle = "#8a8a9e";
      ctx.fillText(meta.substring(0, 35), cx + 8, cy + 32);

      // Metrics
      ctx.font = "9px monospace";
      ctx.fillStyle = "#4a4a5e";
      ctx.fillText(metrics.substring(0, 45), cx + 8, cy + 48);

      // Percentile
      if (pctEl) {
        const pctText = pctEl.textContent;
        const pctColor = pctEl.style.color;
        ctx.font = "bold 18px sans-serif";
        ctx.fillStyle = pctColor;
        ctx.textAlign = "right";
        ctx.fillText(pctText, cx + cardW - 8, cy + 24);
        ctx.textAlign = "left";
      }
    });

    const rows = Math.ceil(cards.length / 3);
    y += rows * 72 + 10;
  });

  // Watermark
  ctx.font = "bold 16px sans-serif";
  ctx.fillStyle = "#1a1a2e";
  ctx.globalAlpha = 0.3;
  ctx.textAlign = "center";
  ctx.fillText("built different — razzle.lol", W / 2, y + 10);
  ctx.globalAlpha = 1.0;

  const link = document.createElement("a");
  link.download = `razzle-tiers-${currentTierPosition}-${state.season}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
}

// ─── Big Board ────────────────────────────────────────────────────
let currentBBPosition = "ALL";
let currentBBData = null;

function openBigBoard() {
  document.getElementById("bigBoardOverlay").classList.add("open");
  const btnsEl = document.getElementById("bbPositionBtns");
  const positions = ["ALL", "QB", "RB", "WR", "TE"];
  btnsEl.innerHTML = positions.map(pos => {
    const posColor = { ALL: "var(--orange)", QB: "var(--pos-qb)", RB: "var(--pos-rb)", WR: "var(--pos-wr)", TE: "var(--pos-te)" }[pos];
    return `<button class="btn-chunky bb-pos-btn" data-pos="${pos}" onclick="loadBigBoard('${pos}')" style="font-size:11px; padding:4px 12px; border-color:${posColor};">${pos}</button>`;
  }).join("");

  const defaultPos = state.position || "ALL";
  loadBigBoard(defaultPos);
}

function closeBigBoard(e) {
  if (e && e.target !== e.currentTarget) return;
  document.getElementById("bigBoardOverlay").classList.remove("open");
}

async function loadBigBoard(position) {
  currentBBPosition = position;
  const contentEl = document.getElementById("bbContent");
  contentEl.innerHTML = `<div style="text-align:center; padding:40px; font-family:var(--font-hand); font-size:22px; color:var(--ink-light);">scouting the ${position === "ALL" ? "" : position + " "}board...</div>`;

  document.querySelectorAll(".bb-pos-btn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.pos === position);
  });

  try {
    const posParam = position === "ALL" ? "" : position;
    const data = await apiFetch(`/api/prospect-scores?position=${posParam}&draft_year=${state.season}`);
    currentBBData = data;
    renderBigBoard(data, contentEl);
  } catch (err) {
    contentEl.innerHTML = `<div style="text-align:center; padding:40px; font-family:var(--font-hand); font-size:22px; color:var(--red);">fumbled the big board... ${err.message}</div>`;
  }
}

function getRPSTierDef(rps) {
  if (rps >= 85) return { key: "elite", label: "Elite", color: "#22a06b" };
  if (rps >= 70) return { key: "premium", label: "Premium", color: "#2ec4b6" };
  if (rps >= 55) return { key: "solid", label: "Solid", color: "#ffc857" };
  return { key: "flier", label: "Flier", color: "#e87422" };
}

function renderBigBoard(data, container) {
  const prospects = data.prospects || [];
  if (prospects.length === 0) {
    container.innerHTML = `<div style="text-align:center; padding:40px; font-family:var(--font-hand); font-size:22px; color:var(--ink-light);">no prospects found for ${data.draft_year} ${data.position}</div>`;
    return;
  }

  const posColors = { QB: "var(--pos-qb)", RB: "var(--pos-rb)", WR: "var(--pos-wr)", TE: "var(--pos-te)" };

  // Group by tier
  const tiers = { elite: [], premium: [], solid: [], flier: [] };
  for (const p of prospects) {
    const td = getRPSTierDef(p.rps);
    tiers[td.key].push(p);
  }

  const tierDefs = [
    { key: "elite", label: "Elite", color: "#22a06b", desc: "RPS 85+" },
    { key: "premium", label: "Premium", color: "#2ec4b6", desc: "RPS 70-85" },
    { key: "solid", label: "Solid", color: "#ffc857", desc: "RPS 55-70" },
    { key: "flier", label: "Flier", color: "#e87422", desc: "RPS below 55" },
  ];

  let html = `<div style="font-family:var(--font-hand); font-size:16px; color:var(--ink-light); margin-bottom:16px;">${data.draft_year} ${data.position} Big Board — ranked by Razzle Prospect Score</div>`;

  for (const td of tierDefs) {
    const tierProspects = tiers[td.key];
    if (tierProspects.length === 0) continue;

    html += `<div class="bb-tier-group">`;
    html += `<div class="tier-badge" style="background:${td.color}; transform:rotate(-2deg);">${td.label}</div>`;
    html += `<span style="font-family:var(--font-mono); font-size:10px; color:var(--ink-light); margin-left:8px;">${td.desc}</span>`;
    html += `<div class="bb-tier-list">`;

    for (const p of tierProspects) {
      const posColor = posColors[p.position] || "var(--orange)";
      const rpsPct = Math.min(100, p.rps);
      const draftInfo = p.draft_round && p.draft_pick ? `Rd ${p.draft_round}, #${p.draft_pick}` : "UDFA";
      const athStr = p.athletic_avg != null ? `${Math.round(p.athletic_avg)}th` : "—";

      let metricsStr = "";
      if (p.forty) metricsStr += `40: ${p.forty.toFixed(2)}`;
      if (p.vertical) metricsStr += (metricsStr ? " · " : "") + `Vert: ${p.vertical.toFixed(1)}"`;
      if (p.broad_jump) metricsStr += (metricsStr ? " · " : "") + `Broad: ${p.broad_jump}"`;

      html += `<div class="bb-card">`;
      html += `<div class="bb-card-rank" style="border-color:${posColor};">${p.rank}</div>`;
      html += `<div class="bb-card-body">`;
      html += `<div class="bb-card-header">`;
      html += `<span class="bb-card-name">${p.player_name}</span>`;
      html += `<span class="bb-card-pos" style="background:${posColor};">${p.position}</span>`;
      html += `</div>`;
      html += `<div class="bb-card-meta">${p.school || ""} · ${draftInfo}</div>`;
      html += `<div class="bb-card-rps-row">`;
      html += `<div class="bb-card-rps-bar"><div class="bb-card-rps-fill" style="width:${rpsPct}%; background:${td.color};"></div></div>`;
      html += `<span class="bb-card-rps-val">${p.rps.toFixed(1)}</span>`;
      html += `</div>`;
      html += `<div class="bb-card-stats">`;
      html += `<span>Ath: ${athStr}</span>`;
      html += `<span>DC: ${Math.round(p.draft_capital_score)}</span>`;
      if (metricsStr) html += `<span>${metricsStr}</span>`;
      html += `</div>`;
      html += `</div></div>`;
    }

    html += `</div></div>`;
  }

  container.innerHTML = html;
}

function exportBigBoardImage() {
  if (!currentBBData || !currentBBData.prospects || currentBBData.prospects.length === 0) return;

  const prospects = currentBBData.prospects;
  const canvas = document.createElement("canvas");
  const W = 800;
  const padX = 24;
  const padY = 24;
  const rowH = 44;
  const tierHeaderH = 40;

  // Group by tier
  const tiers = { elite: [], premium: [], solid: [], flier: [] };
  for (const p of prospects) {
    const td = getRPSTierDef(p.rps);
    tiers[td.key].push(p);
  }
  const tierDefs = [
    { key: "elite", label: "ELITE", color: "#22a06b" },
    { key: "premium", label: "PREMIUM", color: "#2ec4b6" },
    { key: "solid", label: "SOLID", color: "#ffc857" },
    { key: "flier", label: "FLIER", color: "#e87422" },
  ];

  // Calculate height
  let H = padY * 2 + 70; // header + subheader
  for (const td of tierDefs) {
    if (tiers[td.key].length > 0) {
      H += tierHeaderH + tiers[td.key].length * rowH + 12;
    }
  }
  H += 30; // watermark

  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");

  // Background
  ctx.fillStyle = "#ede0cf";
  ctx.fillRect(0, 0, W, H);

  let y = padY;

  // Title
  ctx.font = "bold 26px sans-serif";
  ctx.fillStyle = "#1a1a2e";
  ctx.textAlign = "center";
  ctx.fillText(`Razzle Big Board — ${currentBBData.position} ${currentBBData.draft_year}`, W / 2, y + 26);
  y += 42;

  ctx.font = "16px 'Caveat', cursive";
  ctx.fillStyle = "#8a8a9e";
  ctx.fillText("ranked by Razzle Prospect Score (RPS)", W / 2, y + 14);
  y += 28;

  const posColors = { QB: "#5b7fff", RB: "#2ec4b6", WR: "#d97757", TE: "#8b5cf6" };
  const barW = 120;
  const barH = 10;

  for (const td of tierDefs) {
    const tierProspects = tiers[td.key];
    if (tierProspects.length === 0) continue;

    // Tier badge
    ctx.save();
    ctx.translate(padX + 50, y + 16);
    ctx.rotate(-0.03);
    const label = td.label;
    const tw = ctx.measureText(label).width + 28;
    ctx.fillStyle = td.color;
    ctx.beginPath();
    ctx.roundRect(-tw / 2, -12, tw, 24, 12);
    ctx.fill();
    ctx.strokeStyle = "#1a1a2e";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = "white";
    ctx.font = "bold 12px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(label, 0, 4);
    ctx.restore();
    y += tierHeaderH;

    // Prospect rows
    for (const p of tierProspects) {
      const rowY = y;
      const posColor = posColors[p.position] || "#d97757";

      // Row bg
      ctx.fillStyle = p.rank % 2 === 0 ? "#f7efe5" : "#f0e4d4";
      ctx.fillRect(padX, rowY, W - padX * 2, rowH - 2);
      ctx.strokeStyle = "#1a1a2e";
      ctx.lineWidth = 1;
      ctx.strokeRect(padX, rowY, W - padX * 2, rowH - 2);

      // Rank
      ctx.font = "bold 16px sans-serif";
      ctx.fillStyle = posColor;
      ctx.textAlign = "center";
      ctx.fillText(`${p.rank}`, padX + 22, rowY + 27);

      // Name
      ctx.font = "bold 14px sans-serif";
      ctx.fillStyle = "#1a1a2e";
      ctx.textAlign = "left";
      ctx.fillText(p.player_name.substring(0, 22), padX + 44, rowY + 18);

      // Meta
      ctx.font = "10px monospace";
      ctx.fillStyle = "#8a8a9e";
      const draftInfo = p.draft_round && p.draft_pick ? `Rd ${p.draft_round} #${p.draft_pick}` : "UDFA";
      ctx.fillText(`${p.school || ""} · ${draftInfo}`, padX + 44, rowY + 34);

      // Position chip
      ctx.fillStyle = posColor;
      const chipX = padX + 280;
      ctx.beginPath();
      ctx.roundRect(chipX, rowY + 10, 30, 20, 10);
      ctx.fill();
      ctx.font = "bold 10px sans-serif";
      ctx.fillStyle = "white";
      ctx.textAlign = "center";
      ctx.fillText(p.position, chipX + 15, rowY + 24);

      // RPS bar
      const barX = padX + 330;
      ctx.fillStyle = "#e5d5c3";
      ctx.beginPath();
      ctx.roundRect(barX, rowY + 16, barW, barH, 5);
      ctx.fill();
      const fillW = Math.min(barW, (p.rps / 100) * barW);
      ctx.fillStyle = td.color;
      ctx.beginPath();
      ctx.roundRect(barX, rowY + 16, fillW, barH, 5);
      ctx.fill();

      // RPS value
      ctx.font = "bold 14px monospace";
      ctx.fillStyle = "#1a1a2e";
      ctx.textAlign = "left";
      ctx.fillText(p.rps.toFixed(1), barX + barW + 8, rowY + 27);

      // Key metrics
      ctx.font = "10px monospace";
      ctx.fillStyle = "#4a4a5e";
      ctx.textAlign = "right";
      let metricStr = "";
      if (p.forty) metricStr += `40: ${p.forty.toFixed(2)}`;
      if (p.athletic_avg != null) metricStr += (metricStr ? "  " : "") + `Ath: ${Math.round(p.athletic_avg)}th`;
      ctx.fillText(metricStr, W - padX - 4, rowY + 27);

      y += rowH;
    }
    y += 12;
  }

  // Watermark
  ctx.font = "bold 14px sans-serif";
  ctx.fillStyle = "#1a1a2e";
  ctx.globalAlpha = 0.3;
  ctx.textAlign = "center";
  ctx.fillText("built different — razzle.lol", W / 2, y + 8);
  ctx.globalAlpha = 1.0;

  const link = document.createElement("a");
  link.download = `razzle-bigboard-${currentBBData.position.toLowerCase()}-${currentBBData.draft_year}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
}
