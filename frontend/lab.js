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
    columns: ["fantasy_points_ppr", "ppg", "games", "receiving_yards", "receiving_tds",
              "receptions", "targets", "rushing_yards", "rushing_tds", "touchdowns"],
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
    if (!state.season) state.season = state.seasons[0] || 2024;

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
    const selected = state.selectedPlayers.some(p => p.player_id === player.player_id);
    html += '<tr>';
    html += `<td style="text-align:center; padding:7px 6px;">
      <input type="checkbox" ${selected ? "checked" : ""} onchange="togglePlayerSelect('${player.player_id || player.player_name}', this.checked)"
        style="accent-color:${state.universe === 'prospects' ? 'var(--pos-qb)' : 'var(--orange)'}; width:15px; height:15px; cursor:pointer;">
    </td>`;

    if (state.universe === "prospects") {
      html += `<td class="col-player"><div class="player-name-cell">`;
      html += `<span class="pos-badge ${posClass(pos)}">${pos}</span>`;
      html += `<span>${player.player_name || ""}</span>`;
      html += `<span class="school-label">${player.school || ""}</span>`;
      html += `</div></td>`;
    } else {
      html += `<td class="col-player"><div class="player-name-cell">`;
      html += `<span class="pos-badge ${posClass(pos)}">${pos}</span>`;
      html += `<span>${player.full_name}</span>`;
      html += `<span class="team-label">${player.team || ""}</span>`;
      html += `</div></td>`;
    }

    for (const key of cols) {
      const col = getColumnDef(key);
      if (!col) continue;
      const val = player[key];
      if (col.isText) {
        html += `<td>${val || "—"}</td>`;
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
    sel.innerHTML = state.seasons.map(s =>
      `<option value="${s}" ${s === state.season ? "selected" : ""}>${s}</option>`
    ).join("");
    sel.onchange = (e) => {
      state.season = parseInt(e.target.value);
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
  const keys = Object.keys(colDefs).filter(k => !colDefs[k].isText);
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
    if (params.has("season")) state.season = parseInt(params.get("season"));
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
    const player = state.items.find(p => p.player_id === playerId);
    if (player && !state.selectedPlayers.some(p => p.player_id === playerId)) {
      state.selectedPlayers.push({
        player_id: player.player_id,
        full_name: player.full_name,
        position: player.position,
        team: player.team,
      });
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
  link.download = `razzle-lab-${state.season}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
}
