/* Razzle — The Lab (screener logic) */

// ─── HTML sanitization ──────────────────────────────────────────
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
  // College production (from cfb_player_season_stats cross-reference)
  college_games:      { label: "CFB GP",     group: "College", decimals: 0 },
  college_total_yards:{ label: "CFB Yds",    group: "College", decimals: 0 },
  college_total_tds:  { label: "CFB TD",     group: "College", decimals: 0 },
  college_pass_yards: { label: "CFB PaYds",  group: "College", decimals: 0 },
  college_pass_tds:   { label: "CFB PaTD",   group: "College", decimals: 0 },
  college_cmp_pct:    { label: "CFB CMP%",   group: "College", decimals: 1 },
  college_rush_yards: { label: "CFB RuYds",  group: "College", decimals: 0 },
  college_rush_tds:   { label: "CFB RuTD",   group: "College", decimals: 0 },
  college_ypc:        { label: "CFB YPC",    group: "College", decimals: 1 },
  college_rec_yards:  { label: "CFB ReYds",  group: "College", decimals: 0 },
  college_rec_tds:    { label: "CFB ReTD",   group: "College", decimals: 0 },
  college_receptions: { label: "CFB REC",    group: "College", decimals: 0 },
  college_ypr:        { label: "CFB Y/R",    group: "College", decimals: 1 },
  college_ypg:        { label: "CFB YPG",    group: "College", decimals: 1 },
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
  college_production: {
    label: "College Production",
    columns: ["draft_round", "draft_pick", "college_games",
              "college_total_yards", "college_total_tds",
              "college_pass_yards", "college_pass_tds", "college_cmp_pct",
              "college_rush_yards", "college_rush_tds", "college_ypc",
              "college_rec_yards", "college_rec_tds", "college_ypr", "college_ypg"],
  },
};

// ─── College column definitions ─────────────────────────────────
const COLLEGE_COLUMNS = {
  // Production
  games:           { label: "GP",       group: "Production", decimals: 0 },
  pass_yards:      { label: "Pass Yds", group: "Production", decimals: 0 },
  pass_tds:        { label: "Pass TD",  group: "Production", decimals: 0 },
  rush_yards:      { label: "Rush Yds", group: "Production", decimals: 0 },
  rush_tds:        { label: "Rush TD",  group: "Production", decimals: 0 },
  rec_yards:       { label: "Rec Yds",  group: "Production", decimals: 0 },
  rec_tds:         { label: "Rec TD",   group: "Production", decimals: 0 },
  total_yards:     { label: "Total Yds",group: "Production", decimals: 0 },
  total_tds:       { label: "Total TD", group: "Production", decimals: 0 },

  // Usage
  pass_attempts:   { label: "ATT",      group: "Usage", decimals: 0 },
  completions:     { label: "CMP",      group: "Usage", decimals: 0 },
  carries:         { label: "CAR",      group: "Usage", decimals: 0 },
  receptions:      { label: "REC",      group: "Usage", decimals: 0 },
  targets:         { label: "TGT",      group: "Usage", decimals: 0 },
  ints_thrown:      { label: "INT",      group: "Usage", decimals: 0 },
  fumbles:         { label: "FUM",      group: "Usage", decimals: 0 },

  // Efficiency (derived)
  completion_pct:  { label: "CMP%",     group: "Efficiency", decimals: 1, derived: true },
  yards_per_carry: { label: "Y/CAR",    group: "Efficiency", decimals: 1, derived: true },
  yards_per_rec:   { label: "Y/REC",    group: "Efficiency", decimals: 1, derived: true },
  yards_per_target:{ label: "Y/TGT",    group: "Efficiency", decimals: 1, derived: true },
  catch_rate:      { label: "Catch%",   group: "Efficiency", decimals: 1, derived: true },
  yards_per_att:   { label: "Y/ATT",    group: "Efficiency", decimals: 1, derived: true },

  // Per Game (derived)
  total_ypg:       { label: "YPG",      group: "Per Game", decimals: 1, derived: true },
  pass_ypg:        { label: "PaYPG",    group: "Per Game", decimals: 1, derived: true },
  rush_ypg:        { label: "RuYPG",    group: "Per Game", decimals: 1, derived: true },
  rec_ypg:         { label: "ReYPG",    group: "Per Game", decimals: 1, derived: true },
  tds_per_game:    { label: "TD/G",     group: "Per Game", decimals: 1, derived: true },
};

const COLLEGE_PRESETS = {
  production: {
    label: "Production",
    columns: ["games", "pass_yards", "pass_tds", "rush_yards", "rush_tds",
              "rec_yards", "rec_tds", "total_yards", "total_tds"],
  },
  efficiency: {
    label: "Efficiency",
    columns: ["games", "completion_pct", "yards_per_carry", "yards_per_rec",
              "yards_per_target", "catch_rate", "yards_per_att", "total_ypg", "tds_per_game"],
  },
  draft_profile: {
    label: "Draft Profile",
    columns: ["games", "total_yards", "total_tds", "pass_yards", "pass_tds",
              "rush_yards", "rush_tds", "rec_yards", "rec_tds", "ints_thrown", "fumbles"],
  },
};

// ─── Column definitions ─────────────────────────────────────────
const COLUMNS = {
  // Positional rank (virtual, computed client-side)
  pos_rank:            { label: "Pos Rank", group: "Fantasy", decimals: 0, isText: true, derived: true },

  // Core fantasy
  fantasy_points_ppr:  { label: "PPR",     group: "Fantasy", decimals: 1 },
  ppg:                 { label: "PPG",      group: "Fantasy", decimals: 1 },
  fantasy_points_std:  { label: "Standard", group: "Fantasy", decimals: 1 },
  fantasy_points_half_ppr: { label: "Half-PPR", group: "Fantasy", decimals: 1 },
  half_ppr_ppg:        { label: "HPPR/G",   group: "Fantasy", decimals: 1, derived: true },
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
  cpoe:                { label: "CPOE",     group: "Advanced", decimals: 1, derived: true },
  epa_per_play:        { label: "EPA/Play", group: "Advanced", decimals: 3, derived: true },

  // Breakout detection
  breakout_pct:        { label: "BRK%",    group: "Breakout", decimals: 1, derived: true },

  // Dynasty value
  dynasty_value:       { label: "DVS",     group: "Dynasty", decimals: 1, derived: true },
  age:                 { label: "Age",     group: "Dynasty", decimals: 0 },
};

// ─── Presets ─────────────────────────────────────────────────────
const PRESETS = {
  ppr: {
    label: "PPR",
    columns: ["pos_rank", "fantasy_points_ppr", "ppg", "games", "passing_yards", "passing_tds",
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
    columns: ["dynasty_value", "age", "fantasy_points_ppr", "ppg", "games", "seasons", "breakout_pct",
              "receiving_yards", "receiving_tds", "rushing_yards", "rushing_tds", "touchdowns"],
  },
  dynasty_rankings: {
    label: "Dynasty Rankings",
    columns: ["dynasty_value", "age", "ppg", "games", "fantasy_points_ppr",
              "passing_yards", "rushing_yards", "receiving_yards", "touchdowns"],
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
  teams: [],    // selected team abbreviations for team filter
  minGP: 0,     // minimum games played filter
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
  // College-specific state
  collegeSeason: 0,
  collegeSeasons: [],
  collegeColumns: [...COLLEGE_PRESETS.production.columns],
};

// ─── Init ────────────────────────────────────────────────────────
(async function init() {
  loadStateFromURL();

  // Load NFL, prospect, and college options in parallel
  try {
    const [nflOpts, prospectOpts, collegeOpts] = await Promise.all([
      apiFetch("/api/filter-options"),
      apiFetch("/api/prospect-options").catch(() => ({ years: [], schools: [], positions: [] })),
      apiFetch("/api/college/filter-options").catch(() => ({ seasons: [], teams: [], conferences: [], positions: [] })),
    ]);

    state.seasons = nflOpts.seasons || [2024];
    if (!state.season && state.season !== "career") state.season = state.seasons[0] || 2024;

    state.draftYears = prospectOpts.years || [2025];
    if (!state.draftYear) state.draftYear = state.draftYears[0] || 2025;

    state.collegeSeasons = collegeOpts.seasons || [2024];
    if (!state.collegeSeason) state.collegeSeason = state.collegeSeasons[0] || 2024;

    populateSeasonSelect();
    populateFilterStatSelect();
    populateTeamFilter();
  } catch (e) {
    console.error("Failed to load filter options:", e);
    state.season = 2024;
  }

  // Sync team/minGP UI from URL state
  renderTeamChips();
  if (state.minGP > 0) {
    const inp = document.getElementById("minGPInput");
    if (inp) inp.value = state.minGP;
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
  if (state.universe === "college") {
    return fetchAndRenderCollege();
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
    teams: state.teams,
    min_gp: state.minGP,
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
    computePosRanks();
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

async function fetchAndRenderCollege() {
  const loading = document.getElementById("loadingMsg");
  const tbody = document.getElementById("tableBody");
  loading.style.display = "block";
  loading.textContent = "pulling college film...";
  tbody.innerHTML = "";

  const positions = state.position === "ALL" ? "" : state.position;

  const params = new URLSearchParams({
    season: state.collegeSeason,
    positions: positions,
    search: state.search,
    sort: state.sortKey,
    order: state.sortDir,
    limit: state.limit,
    offset: state.offset,
  });

  try {
    const data = await apiFetch(`/api/college/players?${params}`);

    state.items = data.items || [];
    state.totalCount = data.count || 0;
    state.collegeSeason = data.season || state.collegeSeason;

    loading.style.display = "none";
    renderTable();
    renderPagination();
    updateResultCount();
    saveStateToURL();
  } catch (e) {
    loading.textContent = "fumbled the college data fetch...";
    console.error(e);
  }
}

// ─── Table rendering ─────────────────────────────────────────────
function renderTable() {
  if (state.universe === "prospects") {
    renderProspectTable();
  } else if (state.universe === "college") {
    renderCollegeTable();
  } else {
    renderNFLTable();
  }
}

function renderCollegeTable() {
  renderTableHead();
  renderTableBody();
}

function getActiveColumns() {
  if (state.universe === "prospects") return state.prospectColumns;
  if (state.universe === "college") return state.collegeColumns;
  return state.visibleColumns;
}

function getColumnDef(key) {
  if (state.universe === "prospects") return PROSPECT_COLUMNS[key];
  if (state.universe === "college") return COLLEGE_COLUMNS[key];
  return COLUMNS[key];
}

function renderNFLTable() {
  renderTableHead();
  renderTableBody();
}

function renderTableHead() {
  const thead = document.getElementById("tableHead");
  const cols = getActiveColumns();

  const nameKey = (state.universe === "prospects" || state.universe === "college") ? "player_name" : "full_name";
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
    : state.universe === "college"
    ? "no college players match these filters"
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
      <input type="checkbox" ${selected ? "checked" : ""} onchange="togglePlayerSelect('${escapeAttr(player.player_id || player.player_name)}', this.checked)"
        style="accent-color:${(state.universe === 'prospects' || state.universe === 'college') ? 'var(--pos-qb)' : 'var(--orange)'}; width:15px; height:15px; cursor:pointer;">
    </td>`;

    if (state.universe === "college") {
      const cid = escapeAttr(player.player_id || "");
      html += `<td class="col-player"><div class="player-name-cell">`;
      html += `<span class="pos-badge ${posClass(pos)}">${escapeHtml(pos)}</span>`;
      html += `<a href="#" onclick="openCollegeProfile('${cid}'); return false;" style="color:var(--ink); text-decoration:none; border-bottom:1px dashed var(--pos-qb);">${escapeHtml(player.player_name)}</a>`;
      html += `<span class="team-label">${escapeHtml(player.team)}</span>`;
      if (player.conference) html += `<span class="school-label" style="font-size:10px; color:var(--ink-light);">${escapeHtml(player.conference)}</span>`;
      html += `</div></td>`;
    } else if (state.universe === "prospects") {
      const pName = escapeAttr(player.player_name || "");
      const pPos = (player.position || "").toUpperCase();
      const pYear = player.draft_year || state.season;
      html += `<td class="col-player"><div class="player-name-cell">`;
      html += `<span class="pos-badge ${posClass(pos)}">${escapeHtml(pos)}</span>`;
      html += `<a href="#" onclick="openProspectProfile('${pName}', '${escapeAttr(pPos)}', ${pYear}); return false;" style="color:var(--ink); text-decoration:none; border-bottom:1px dashed var(--pos-qb);">${escapeHtml(player.player_name)}</a>`;
      html += `<span class="school-label">${escapeHtml(player.school)}</span>`;
      html += `</div></td>`;
    } else {
      const pid = escapeAttr(player.player_id || "");
      html += `<td class="col-player"><div class="player-name-cell">`;
      html += `<span class="pos-badge ${posClass(pos)}">${escapeHtml(pos)}</span>`;
      html += `<a href="#" onclick="openPlayerProfile('${pid}'); return false;" style="color:var(--ink); text-decoration:none; border-bottom:1px dashed var(--ink-faint);">${escapeHtml(player.full_name)}</a>`;
      html += `<span class="team-label">${escapeHtml(player.team)}</span>`;
      html += `</div></td>`;
    }

    for (const key of cols) {
      const col = getColumnDef(key);
      if (!col) continue;
      let val = player[key];
      // Show dash for non-applicable stats (e.g., WR passing stats)
      if (state.universe === "nfl" && isNonApplicableStat(pos, key, val)) {
        html += `<td style="color:var(--ink-faint);">—</td>`;
      } else if (col.isText) {
        html += `<td>${val ? escapeHtml(val) : "—"}</td>`;
      } else if (key === "dynasty_value" && val != null) {
        const dvsColor = val >= 85 ? "var(--green)" : val >= 70 ? "var(--pos-qb)" : val >= 55 ? "var(--orange)" : "var(--ink-light)";
        const dvsTier = val >= 85 ? "Elite" : val >= 70 ? "Star" : val >= 55 ? "Starter" : "";
        html += `<td><span style="background:${dvsColor}; color:white; padding:1px 8px; border-radius:10px; border:2px solid var(--ink); font-size:11px; font-weight:700; white-space:nowrap;">${val.toFixed(1)}${dvsTier ? " " + dvsTier : ""}</span></td>`;
      } else if (key === "age" && val != null) {
        html += `<td style="font-weight:600;">${Math.round(val)}</td>`;
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
  } else if (u === "college") {
    state.sortKey = "total_yards";
    state.sortDir = "desc";
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
  const isCollege = state.universe === "college";
  const isNFL = state.universe === "nfl";

  // Toggle body class for blue accent (college and prospect modes use blue)
  document.body.classList.toggle("prospect-mode", isProspect || isCollege);

  // Toggle buttons
  document.getElementById("universeNFL").classList.toggle("active", isNFL);
  document.getElementById("universeProspects").classList.toggle("active", isProspect);
  document.getElementById("universeCollege").classList.toggle("active", isCollege);

  // Search placeholder
  document.getElementById("searchInput").placeholder = isProspect
    ? "search prospects..." : isCollege ? "search college players..." : "search players...";

  // Hide formula button in non-NFL modes
  const formulaBtn = document.getElementById("formulaBtn");
  if (formulaBtn) formulaBtn.style.display = isNFL ? "" : "none";

  // Hide relevance toggle in non-NFL modes
  document.getElementById("relevanceToggle").style.display = isNFL ? "" : "none";

  // Hide filter bar in non-NFL modes
  document.getElementById("filterBar").style.display = isNFL ? "" : "none";

  // Data source label
  const ds = document.getElementById("dataSource");
  if (ds) {
    if (isCollege) ds.textContent = "powered by sportsdataverse cfbfastR data";
    else if (isProspect) ds.textContent = "powered by nflverse combine + draft data";
    else ds.textContent = "powered by nflverse";
  }

  // Page title
  if (isCollege) document.title = "College Lab — Razzle";
  else if (isProspect) document.title = "Prospect Lab — Razzle";
  else document.title = "The Lab — Razzle";

  // Show Tiers and Big Board buttons only in prospect mode
  const tiersBtn = document.getElementById("tiersBtn");
  if (tiersBtn) tiersBtn.style.display = isProspect ? "" : "none";
  const bigBoardBtn = document.getElementById("bigBoardBtn");
  if (bigBoardBtn) bigBoardBtn.style.display = isProspect ? "" : "none";
  const classAnalyticsBtn = document.getElementById("classAnalyticsBtn");
  if (classAnalyticsBtn) classAnalyticsBtn.style.display = isProspect ? "" : "none";

  // Show Export Rankings and Trade Values only in NFL mode
  const exportRankingsBtn = document.getElementById("exportRankingsBtn");
  if (exportRankingsBtn) exportRankingsBtn.style.display = (state.universe === "nfl") ? "" : "none";
  const tradeValuesBtn = document.getElementById("tradeValuesBtn");
  if (tradeValuesBtn) tradeValuesBtn.style.display = (state.universe === "nfl") ? "" : "none";
  const agingCurvesBtn = document.getElementById("agingCurvesBtn");
  if (agingCurvesBtn) agingCurvesBtn.style.display = (state.universe === "nfl") ? "" : "none";
  const heatMapBtn = document.getElementById("heatMapBtn");
  if (heatMapBtn) heatMapBtn.style.display = (state.universe === "nfl") ? "" : "none";
}

// ─── Sort ────────────────────────────────────────────────────────
function sortBy(key) {
  // Normalize player name sort key per universe
  if (key === "full_name" && (state.universe === "prospects" || state.universe === "college")) key = "player_name";
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
  } else if (state.universe === "college") {
    sel.innerHTML = state.collegeSeasons.map(s =>
      `<option value="${s}" ${s === state.collegeSeason ? "selected" : ""}>${s}</option>`
    ).join("");
    sel.onchange = (e) => {
      state.collegeSeason = parseInt(e.target.value);
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
  const label = state.universe === "prospects" ? "prospects" : state.universe === "college" ? "college players" : "players";
  el.innerHTML = `<strong>${state.totalCount}</strong> ${label}`;
}

// ─── Filters ─────────────────────────────────────────────────────
function populateFilterStatSelect() {
  const sel = document.getElementById("filterStat");
  const colDefs = state.universe === "prospects" ? PROSPECT_COLUMNS : state.universe === "college" ? COLLEGE_COLUMNS : COLUMNS;
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
  let html = "";

  // Min GP pill (team chips shown inline next to dropdown)
  if (state.minGP > 0) {
    html += `<span class="filter-tag" style="background:var(--bg-sand);">GP ≥ ${state.minGP} <span class="remove" onclick="clearMinGP()">×</span></span> `;
  }

  // Stat filters
  html += state.filters.map((f, i) => {
    const col = COLUMNS[f.key];
    const label = col ? col.label : f.key;
    return `<span class="filter-tag">${label} ${opLabels[f.op] || f.op} ${f.value} <span class="remove" onclick="removeFilter(${i})">×</span></span>`;
  }).join(" ");

  container.innerHTML = html;
}

function clearTeamFilter() {
  state.teams = [];
  state.offset = 0;
  const sel = document.getElementById("teamFilter");
  if (sel) sel.value = "";
  renderActiveFilters();
  renderTeamChips();
  fetchAndRender();
}

function clearMinGP() {
  state.minGP = 0;
  state.offset = 0;
  const inp = document.getElementById("minGPInput");
  if (inp) inp.value = "";
  renderActiveFilters();
  fetchAndRender();
}

// ─── Team filter ──────────────────────────────────────────────────
const NFL_TEAMS = [
  "ARI","ATL","BAL","BUF","CAR","CHI","CIN","CLE","DAL","DEN",
  "DET","GB","HOU","IND","JAX","KC","LA","LAC","LV","MIA",
  "MIN","NE","NO","NYG","NYJ","PHI","PIT","SEA","SF","TB","TEN","WAS"
];

function populateTeamFilter() {
  const sel = document.getElementById("teamFilter");
  if (!sel) return;
  sel.innerHTML = '<option value="">+ Team</option>' +
    NFL_TEAMS.map(t => `<option value="${t}">${t}</option>`).join("");
}

function addTeamFromSelect(sel) {
  const team = sel.value;
  if (!team || state.teams.includes(team)) {
    sel.value = "";
    return;
  }
  state.teams.push(team);
  state.offset = 0;
  sel.value = "";
  renderTeamChips();
  renderActiveFilters();
  fetchAndRender();
}

function removeTeam(team) {
  state.teams = state.teams.filter(t => t !== team);
  state.offset = 0;
  renderTeamChips();
  renderActiveFilters();
  fetchAndRender();
}

function renderTeamChips() {
  const container = document.getElementById("teamChips");
  if (!container) return;
  container.innerHTML = state.teams.map(t =>
    `<span class="team-chip">${t} <span class="remove" onclick="removeTeam('${t}')">×</span></span>`
  ).join("");
}

function setMinGP(val) {
  const v = parseInt(val) || 0;
  state.minGP = v > 0 ? v : 0;
  state.offset = 0;
  renderActiveFilters();
  fetchAndRender();
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
  const colDefs = state.universe === "prospects" ? PROSPECT_COLUMNS : state.universe === "college" ? COLLEGE_COLUMNS : COLUMNS;
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
  const colArray = state.universe === "prospects" ? "prospectColumns" : state.universe === "college" ? "collegeColumns" : "visibleColumns";
  const colDefs = state.universe === "prospects" ? PROSPECT_COLUMNS : state.universe === "college" ? COLLEGE_COLUMNS : COLUMNS;

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
  const presets = state.universe === "prospects" ? PROSPECT_PRESETS : state.universe === "college" ? COLLEGE_PRESETS : PRESETS;
  container.innerHTML = Object.entries(presets).map(([key, preset]) =>
    `<button class="btn-chunky" onclick="applyPreset('${key}')">${preset.label}</button>`
  ).join("");
}

function applyPreset(key) {
  const presets = state.universe === "prospects" ? PROSPECT_PRESETS : state.universe === "college" ? COLLEGE_PRESETS : PRESETS;
  const preset = presets[key];
  if (!preset) return;

  if (state.universe === "prospects") {
    state.prospectColumns = [...preset.columns];
  } else if (state.universe === "college") {
    state.collegeColumns = [...preset.columns];
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
  if (state.teams.length) params.set("teams", state.teams.join(","));
  if (state.minGP > 0) params.set("min_gp", state.minGP);

  if (state.universe === "prospects") {
    if (state.draftYear) params.set("draft_year", state.draftYear);
    if (state.sortKey !== "draft_pick") params.set("sort", state.sortKey);
    const defaultCols = PROSPECT_PRESETS.combine.columns.join(",");
    const currentCols = state.prospectColumns.join(",");
    if (currentCols !== defaultCols) params.set("cols", currentCols);
  } else if (state.universe === "college") {
    if (state.collegeSeason) params.set("season", state.collegeSeason);
    if (state.sortKey !== "total_yards") params.set("sort", state.sortKey);
    const defaultCols = COLLEGE_PRESETS.production.columns.join(",");
    const currentCols = state.collegeColumns.join(",");
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
  if (params.has("teams")) {
    state.teams = params.get("teams").split(",").filter(t => t);
  }
  if (params.has("min_gp")) {
    state.minGP = parseInt(params.get("min_gp")) || 0;
  }

  if (state.universe === "prospects") {
    if (params.has("draft_year")) state.draftYear = parseInt(params.get("draft_year"));
    if (!params.has("sort")) state.sortKey = "draft_pick";
    if (!params.has("dir")) state.sortDir = "asc";
    if (params.has("cols")) state.prospectColumns = params.get("cols").split(",");
  } else if (state.universe === "college") {
    if (params.has("season")) state.collegeSeason = parseInt(params.get("season"));
    if (!params.has("sort")) state.sortKey = "total_yards";
    if (!params.has("dir")) state.sortDir = "desc";
    if (params.has("cols")) state.collegeColumns = params.get("cols").split(",");
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

function openShareModal() {
  saveStateToURL();
  document.getElementById("shareOverlay").classList.add("open");
  document.getElementById("shareURLInput").value = window.location.href;
  document.getElementById("redditTitleInput").value = generateRedditTitle();
}

function closeShareModal(e) {
  if (e && e.target !== e.currentTarget) return;
  document.getElementById("shareOverlay").classList.remove("open");
}

function copyShareURLFromModal() {
  const input = document.getElementById("shareURLInput");
  navigator.clipboard.writeText(input.value).then(() => {
    const btn = document.getElementById("shareURLCopyBtn");
    btn.textContent = "Copied.";
    setTimeout(() => btn.textContent = "Copy URL", 1500);
  });
}

function copyRedditTitle() {
  const input = document.getElementById("redditTitleInput");
  navigator.clipboard.writeText(input.value).then(() => {
    const btn = document.getElementById("redditTitleCopyBtn");
    btn.textContent = "Copied.";
    setTimeout(() => btn.textContent = "Copy", 1500);
  });
}

function generateRedditTitle() {
  const preset = getCurrentPresetName();
  const season = state.season === "career" ? "Career" : (state.season || "2024");
  const posFilter = state.position ? state.position.toUpperCase() : "";

  if (state.universe === "prospects") {
    const year = state.season || "2025";
    if (posFilter) return `${year} ${posFilter} Prospect Class — ${preset} View | Razzle`;
    return `${year} Draft Prospect ${preset} Rankings | Razzle`;
  }

  if (state.universe === "college") {
    if (posFilter) return `College ${posFilter} ${preset} Stats (${season}) | Razzle`;
    return `College Football ${preset} Stats (${season}) | Razzle`;
  }

  // NFL
  if (preset === "Dynasty Rankings" || preset === "Dynasty") {
    if (posFilter) return `Dynasty ${posFilter} Rankings by DVS (${season}) | Razzle`;
    return `Dynasty Rankings — Top Players by DVS (${season}) | Razzle`;
  }
  if (posFilter) return `${season} ${posFilter} ${preset} Stats — Fantasy Football | Razzle`;
  return `${season} Fantasy Football ${preset} Stats | Razzle`;
}

// ─── Saved Views ─────────────────────────────────────────────────

function openSavedViews() {
  document.getElementById("savedViewsOverlay").classList.add("open");
  renderSavedViewsList();
}

function closeSavedViews(e) {
  if (e && e.target !== e.currentTarget) return;
  document.getElementById("savedViewsOverlay").classList.remove("open");
}

function getSavedViews() {
  try { return JSON.parse(localStorage.getItem("razzle_saved_views") || "[]"); }
  catch (e) { return []; }
}

function saveCurrentView() {
  const nameInput = document.getElementById("saveViewName");
  const name = nameInput.value.trim();
  if (!name) { nameInput.style.borderColor = "var(--red)"; setTimeout(() => nameInput.style.borderColor = "", 1500); return; }

  const view = {
    id: Date.now().toString(36),
    name,
    createdAt: new Date().toISOString(),
    universe: state.universe,
    position: state.position,
    search: state.search,
    season: state.universe === "college" ? state.collegeSeason : state.universe === "prospects" ? state.draftYear : state.season,
    relevance: state.relevance,
    sortKey: state.sortKey,
    sortDir: state.sortDir,
    filters: [...state.filters],
    columns: state.universe === "prospects" ? [...state.prospectColumns] : state.universe === "college" ? [...state.collegeColumns] : [...state.visibleColumns],
  };

  const views = getSavedViews();
  views.unshift(view);
  localStorage.setItem("razzle_saved_views", JSON.stringify(views));

  nameInput.value = "";
  renderSavedViewsList();
}

function loadSavedView(id) {
  const views = getSavedViews();
  const view = views.find(v => v.id === id);
  if (!view) return;

  // Apply state
  state.universe = view.universe || "nfl";
  state.position = view.position || "ALL";
  state.search = view.search || "";
  state.sortKey = view.sortKey || "fantasy_points_ppr";
  state.sortDir = view.sortDir || "desc";
  state.filters = view.filters ? [...view.filters] : [];
  state.relevance = view.relevance || "fantasy";

  if (view.universe === "prospects") {
    if (view.season) state.draftYear = view.season;
    state.prospectColumns = view.columns ? [...view.columns] : [...PROSPECT_PRESETS.combine.columns];
  } else if (view.universe === "college") {
    if (view.season) state.collegeSeason = view.season;
    state.collegeColumns = view.columns ? [...view.columns] : [...COLLEGE_PRESETS.production.columns];
  } else {
    if (view.season !== undefined) state.season = view.season;
    state.visibleColumns = view.columns ? [...view.columns] : [...PRESETS.ppr.columns];
  }

  // Sync UI controls
  document.querySelectorAll(".chip[data-pos]").forEach(chip => {
    chip.classList.toggle("active", chip.dataset.pos === state.position);
  });
  document.getElementById("searchInput").value = state.search;
  const relBtn = document.getElementById("relevanceToggle");
  relBtn.textContent = state.relevance === "all" ? "All Players" : "Fantasy Only";
  relBtn.classList.toggle("active", state.relevance === "all");
  applyUniverseUI();
  populateSeasonSelect();
  populateFilterStatSelect();
  renderActiveFilters();
  saveStateToURL();

  state.offset = 0;
  closeSavedViews();
  fetchData();
}

function deleteSavedView(id) {
  const views = getSavedViews().filter(v => v.id !== id);
  localStorage.setItem("razzle_saved_views", JSON.stringify(views));
  renderSavedViewsList();
}

function renderSavedViewsList() {
  const container = document.getElementById("savedViewsList");
  const views = getSavedViews();

  if (!views.length) {
    container.innerHTML = '<p style="font-family:var(--font-hand); font-size:18px; color:var(--ink-light); text-align:center; padding:24px 0;">no saved views yet. build something worth saving.</p>';
    return;
  }

  const universeBadge = (u) => {
    const colors = { nfl: "var(--orange)", prospects: "var(--blue)", college: "var(--blue)" };
    const labels = { nfl: "NFL", prospects: "PROSP", college: "CFB" };
    return `<span style="font-family:var(--font-mono); font-size:10px; font-weight:700; padding:2px 6px; border:2px solid ${colors[u] || "var(--ink)"}; border-radius:4px; color:${colors[u] || "var(--ink)"}; text-transform:uppercase;">${labels[u] || u}</span>`;
  };

  const posBadge = (pos) => {
    if (!pos || pos === "ALL") return "";
    const colors = { QB: "var(--pos-qb)", RB: "var(--pos-rb)", WR: "var(--pos-wr)", TE: "var(--pos-te)" };
    return ` <span style="font-family:var(--font-mono); font-size:10px; font-weight:700; padding:2px 6px; border:2px solid ${colors[pos] || "var(--ink)"}; border-radius:4px; color:${colors[pos] || "var(--ink)"};">${pos}</span>`;
  };

  container.innerHTML = views.map(v => {
    const date = new Date(v.createdAt);
    const dateStr = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const filterCount = (v.filters && v.filters.length) ? ` <span style="font-family:var(--font-mono); font-size:10px; color:var(--ink-light);">${v.filters.length} filter${v.filters.length > 1 ? "s" : ""}</span>` : "";

    return `<div style="display:flex; align-items:center; gap:10px; padding:10px 12px; border:2px solid var(--ink); border-radius:8px; margin-bottom:8px; background:var(--bg); cursor:pointer; transition:transform 0.1s, box-shadow 0.1s;" onmouseenter="this.style.transform='translate(-2px,-2px)';this.style.boxShadow='4px 4px 0 var(--ink)'" onmouseleave="this.style.transform='';this.style.boxShadow=''">
      <div style="flex:1; min-width:0;" onclick="loadSavedView('${v.id}')">
        <div style="font-family:var(--font-display); font-size:14px; font-weight:600; margin-bottom:4px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${v.name}</div>
        <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;">${universeBadge(v.universe)}${posBadge(v.position)}${filterCount}<span style="font-family:var(--font-mono); font-size:10px; color:var(--ink-light);">${dateStr}</span></div>
      </div>
      <button onclick="event.stopPropagation(); deleteSavedView('${v.id}')" style="background:none; border:2px solid var(--ink-faint); border-radius:6px; padding:4px 8px; cursor:pointer; font-family:var(--font-mono); font-size:11px; color:var(--ink-light);" title="Delete view">✕</button>
    </div>`;
  }).join("");
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

// ─── Non-applicable stats per position (show "—" instead of 0) ──
// If a player has 0 in a stat that's not primary for their position, show dash.
// Only applies to counting stats — derived/rate stats handled by null.
const NON_PRIMARY_STATS = {
  QB: new Set(["receptions", "receiving_yards", "receiving_tds", "targets",
               "receiving_air_yards", "receiving_yards_after_catch"]),
  RB: new Set(["passing_yards", "passing_tds", "completions", "attempts",
               "interceptions", "passing_air_yards"]),
  WR: new Set(["passing_yards", "passing_tds", "completions", "attempts",
               "interceptions", "passing_air_yards"]),
  TE: new Set(["passing_yards", "passing_tds", "completions", "attempts",
               "interceptions", "passing_air_yards"]),
};

function isNonApplicableStat(pos, statKey, value) {
  const nonPrimary = NON_PRIMARY_STATS[pos];
  if (!nonPrimary) return false;
  // Only show dash if value is 0 or null AND stat is non-primary for position
  return nonPrimary.has(statKey) && (value === 0 || value === null || value === undefined);
}

// ─── Positional rank computation ─────────────────────────────────
function computePosRanks() {
  // Group players by position, sort within each group by current sort key
  const byPos = {};
  for (const player of state.items) {
    const pos = (player.position || "").toUpperCase();
    if (!byPos[pos]) byPos[pos] = [];
    byPos[pos].push(player);
  }
  // Sort each group by the current sort key
  const key = state.sortKey;
  const desc = state.sortDir === "desc";
  for (const pos of Object.keys(byPos)) {
    byPos[pos].sort((a, b) => {
      const av = a[key] ?? 0, bv = b[key] ?? 0;
      return desc ? bv - av : av - bv;
    });
    byPos[pos].forEach((p, i) => {
      p.pos_rank = `${pos}${i + 1}`;
    });
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

// ─── CSV Export ───────────────────────────────────────────────────

function exportCSV() {
  if (!state.items.length) return;

  // Determine column definitions and visible columns based on universe
  let colDefs, visCols;
  if (state.universe === "prospects") {
    colDefs = PROSPECT_COLUMNS;
    visCols = state.prospectColumns;
  } else if (state.universe === "college") {
    colDefs = COLLEGE_COLUMNS;
    visCols = state.collegeColumns;
  } else {
    colDefs = COLUMNS;
    visCols = state.visibleColumns;
  }

  // Filter to valid columns
  visCols = visCols.filter(k => colDefs[k]);

  // Build CSV content
  const lines = [];

  // Branding header comment
  lines.push("# razzle.lol — Fantasy Football Bloomberg Terminal");
  lines.push("# " + state.universe.toUpperCase() + " | " + state.position + " | " +
    (state.universe === "college" ? state.collegeSeason :
     state.universe === "prospects" ? state.draftYear : state.season));

  // Header row
  const nameCol = state.universe === "prospects" ? "Player" : "Player";
  const headers = [nameCol, "POS", "Team", ...visCols.map(k => colDefs[k].label)];
  lines.push(headers.map(csvEscape).join(","));

  // Data rows
  for (const player of state.items) {
    const name = player.player_name || player.full_name || player.name || "";
    const pos = player.position || "";
    const team = player.team || player.school || player.draft_team || "";
    const vals = visCols.map(k => {
      const v = player[k];
      if (v == null || v === "") return "";
      return v;
    });
    lines.push([name, pos, team, ...vals].map(csvEscape).join(","));
  }

  // Download
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const season = state.universe === "college" ? state.collegeSeason :
                 state.universe === "prospects" ? state.draftYear : state.season;
  link.download = `razzle-${state.universe}-${state.position.toLowerCase()}-${season}.csv`;
  link.href = URL.createObjectURL(blob);
  link.click();
  URL.revokeObjectURL(link.href);
}

function csvEscape(val) {
  const s = String(val == null ? "" : val);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

// ─── Rankings Export ───────────────────────────────────────────────

const _rankState = { position: "ALL", count: 10, sortBy: "dynasty_value" };

function openRankingsExport() {
  document.getElementById("rankingsExportOverlay").classList.add("open");

  // Position buttons
  const posDiv = document.getElementById("rankPosButtons");
  posDiv.innerHTML = "";
  for (const pos of ["ALL", "QB", "RB", "WR", "TE"]) {
    const active = pos === _rankState.position;
    const btn = document.createElement("button");
    btn.className = active ? "btn-primary" : "btn-chunky";
    btn.textContent = pos;
    btn.style.cssText = "font-size:11px; padding:4px 12px;";
    btn.onclick = () => { _rankState.position = pos; openRankingsExport(); };
    posDiv.appendChild(btn);
  }

  // Count buttons
  const countDiv = document.getElementById("rankCountButtons");
  countDiv.innerHTML = "";
  for (const n of [10, 15, 20, 25]) {
    const active = n === _rankState.count;
    const btn = document.createElement("button");
    btn.className = active ? "btn-primary" : "btn-chunky";
    btn.textContent = "Top " + n;
    btn.style.cssText = "font-size:11px; padding:4px 12px;";
    btn.onclick = () => { _rankState.count = n; openRankingsExport(); };
    countDiv.appendChild(btn);
  }

  // Sort buttons
  const sortDiv = document.getElementById("rankSortButtons");
  sortDiv.innerHTML = "";
  for (const s of [{ key: "dynasty_value", label: "DVS" }, { key: "fantasy_points_ppr", label: "PPR" }]) {
    const active = s.key === _rankState.sortBy;
    const btn = document.createElement("button");
    btn.className = active ? "btn-primary" : "btn-chunky";
    btn.textContent = s.label;
    btn.style.cssText = "font-size:11px; padding:4px 12px;";
    btn.onclick = () => { _rankState.sortBy = s.key; openRankingsExport(); };
    sortDiv.appendChild(btn);
  }

  // Preview text
  const sortLabel = _rankState.sortBy === "dynasty_value" ? "DVS" : "PPR";
  const posLabel = _rankState.position === "ALL" ? "Players" : _rankState.position + "s";
  document.getElementById("rankingsPreview").textContent =
    `"Razzle Dynasty Top ${_rankState.count} ${posLabel} by ${sortLabel}"`;
}

function closeRankingsExport(e) {
  if (e && e.target !== e.currentTarget) return;
  document.getElementById("rankingsExportOverlay").classList.remove("open");
}

async function generateRankingsExport() {
  const pos = _rankState.position;
  const count = _rankState.count;
  const sortKey = _rankState.sortBy;
  const sortLabel = sortKey === "dynasty_value" ? "DVS" : "PPR";
  const posLabel = pos === "ALL" ? "Players" : pos + "s";

  // Fetch data from API
  const params = new URLSearchParams({
    sort: sortKey === "dynasty_value" ? "ppg" : sortKey,
    order: "desc",
    limit: String(count),
    season: state.season === "career" ? "career" : String(state.season || 0),
  });
  if (pos !== "ALL") params.set("position", pos);

  try {
    const data = await apiFetch(`/api/players?${params}`);
    const players = data.items || [];
    if (!players.length) return;

    // If sorting by DVS, compute and re-sort client-side
    if (sortKey === "dynasty_value") {
      for (const p of players) {
        p._dvs = computeClientDVS(p.ppg, p.age, p.position);
      }
      players.sort((a, b) => (b._dvs || 0) - (a._dvs || 0));
    }

    renderRankingsPNG(players.slice(0, count), posLabel, sortLabel);
    closeRankingsExport();
  } catch (err) {
    console.error("Rankings export failed:", err);
  }
}

function renderRankingsPNG(players, posLabel, sortLabel) {
  const posColors = { QB: "#5b7fff", RB: "#2ec4b6", WR: "#d97757", TE: "#8b5cf6" };
  const padX = 30, padY = 30;
  const W = 800;
  const titleH = 50;
  const rowH = 36;
  const watermarkH = 40;
  const H = padY + titleH + 10 + players.length * rowH + 10 + watermarkH + padY;

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");

  // Background
  ctx.fillStyle = "#f7efe5";
  ctx.fillRect(0, 0, W, H);

  // Title
  ctx.font = "bold 24px sans-serif";
  ctx.fillStyle = "#1a1a2e";
  ctx.textAlign = "center";
  ctx.fillText(`Razzle Dynasty Top ${players.length} ${posLabel}`, W / 2, padY + 28);

  // Subtitle (sort + season)
  ctx.font = "14px 'Caveat', cursive";
  ctx.fillStyle = "rgba(26,26,46,0.5)";
  const seasonText = state.season === "career" ? "career" : state.season || "2024";
  ctx.fillText(`ranked by ${sortLabel} — ${seasonText} season`, W / 2, padY + 46);

  // Content area
  const listY = padY + titleH + 10;
  const listH = players.length * rowH;
  const listW = W - padX * 2;

  // Outer border
  ctx.strokeStyle = "#1a1a2e";
  ctx.lineWidth = 3;
  ctx.strokeRect(padX, listY, listW, listH);

  // Player rows
  players.forEach((p, i) => {
    const y = listY + i * rowH;
    const pColor = posColors[p.position] || "#1a1a2e";

    // Alternating bg
    if (i % 2 === 0) {
      ctx.fillStyle = "rgba(229,213,195,0.3)";
      ctx.fillRect(padX + 1.5, y, listW - 3, rowH);
    }

    // Row divider
    if (i > 0) {
      ctx.strokeStyle = "#c5c5d0";
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(padX, y);
      ctx.lineTo(padX + listW, y);
      ctx.stroke();
    }

    // Rank badge (position-colored circle)
    const rankX = padX + 24;
    const rankCY = y + rowH / 2;
    ctx.beginPath();
    ctx.arc(rankX, rankCY, 13, 0, Math.PI * 2);
    ctx.fillStyle = pColor;
    ctx.fill();
    ctx.strokeStyle = "#1a1a2e";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = "#fff";
    ctx.font = "bold 12px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(String(i + 1), rankX, rankCY + 4);

    // Position badge
    const posBadgeX = padX + 48;
    ctx.fillStyle = pColor;
    ctx.fillRect(posBadgeX, y + 8, 30, 20);
    ctx.strokeStyle = "#1a1a2e";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(posBadgeX, y + 8, 30, 20);
    ctx.fillStyle = "#fff";
    ctx.font = "bold 9px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(p.position, posBadgeX + 15, y + 22);

    // Player name
    ctx.textAlign = "left";
    ctx.fillStyle = "#1a1a2e";
    ctx.font = "bold 14px sans-serif";
    ctx.fillText(p.full_name || p.player_name, padX + 88, y + 23);

    // Team
    ctx.fillStyle = "#8a8a9e";
    ctx.font = "11px monospace";
    ctx.fillText(p.team || "FA", padX + 320, y + 23);

    // Age
    if (p.age) {
      ctx.fillStyle = "#8a8a9e";
      ctx.font = "11px monospace";
      ctx.fillText("Age " + p.age, padX + 380, y + 23);
    }

    // DVS badge
    const dvs = p._dvs != null ? p._dvs : computeClientDVS(p.ppg, p.age, p.position);
    if (dvs != null) {
      const dvsColor = dvs >= 85 ? "#2ec4b6" : dvs >= 70 ? "#5b7fff" : dvs >= 55 ? "#d97757" : "#8a8a9e";
      const badgeX = padX + 450;
      ctx.fillStyle = dvsColor + "30";
      ctx.fillRect(badgeX, y + 7, 70, 22);
      ctx.strokeStyle = dvsColor;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(badgeX, y + 7, 70, 22);
      ctx.fillStyle = dvsColor;
      ctx.font = "bold 11px monospace";
      ctx.textAlign = "center";
      ctx.fillText("DVS " + dvs.toFixed(1), badgeX + 35, y + 22);
    }

    // Key stat (PPG)
    if (p.ppg != null) {
      ctx.fillStyle = "#1a1a2e";
      ctx.font = "bold 13px monospace";
      ctx.textAlign = "right";
      ctx.fillText(p.ppg.toFixed(1) + " PPG", padX + listW - 16, y + 23);
    }
  });

  // Watermark
  ctx.font = "16px 'Caveat', cursive";
  ctx.fillStyle = "rgba(217, 119, 87, 0.5)";
  ctx.textAlign = "right";
  ctx.fillText("built different — razzle.lol", W - 20, H - 16);

  // Download
  const posFile = posLabel.toLowerCase().replace(/\s+/g, "-");
  const link = document.createElement("a");
  link.download = `razzle-rankings-${posFile}-top${players.length}.png`;
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

async function openCollegeProfile(playerId) {
  if (!playerId) return;
  const overlay = document.getElementById("profileOverlay");
  const content = document.getElementById("profileContent");
  overlay.classList.add("open");
  content.innerHTML = `<div style="text-align:center; padding:40px; font-family:var(--font-hand); font-size:22px; color:var(--ink-light);">scouting the college tape...</div>`;

  try {
    const data = await apiFetch(`/api/college/player-profile/${encodeURIComponent(playerId)}`);
    renderCollegeProfile(data, content);
  } catch (err) {
    content.innerHTML = `<div style="text-align:center; padding:40px; font-family:var(--font-hand); font-size:22px; color:var(--red);">fumbled the college data fetch... ${err.message}</div>`;
  }
}

function renderCollegeProfile(data, container) {
  const { player, seasons, career, combine, draft } = data;
  if (!player || !player.player_name) {
    container.innerHTML = `<div style="text-align:center; padding:40px; font-family:var(--font-hand); font-size:22px; color:var(--ink-light);">player not found on the film</div>`;
    return;
  }

  const pos = (player.position || "").toUpperCase();
  const posColors = { QB: "var(--pos-qb)", RB: "var(--pos-rb)", WR: "var(--pos-wr)", TE: "var(--pos-te)" };
  const posColor = posColors[pos] || "var(--pos-qb)";

  let html = "";

  // Header (blue accent for college)
  html += `<div class="profile-header" style="border-left:6px solid var(--pos-qb);">`;
  html += `<span class="profile-pos-badge" style="background:${posColor};">${pos}</span>`;
  html += `<div>`;
  html += `<div class="profile-name">${player.player_name}</div>`;
  html += `<div class="profile-meta">${player.team || ""} · ${player.conference || ""} · ${player.seasons_played} season${player.seasons_played > 1 ? "s" : ""}</div>`;
  html += `<span style="display:inline-block; background:var(--pos-qb); color:white; font-family:var(--font-display); font-size:10px; padding:2px 8px; border:2px solid var(--ink); border-radius:4px; transform:rotate(-2deg);">COLLEGE</span>`;
  html += `</div>`;
  html += `</div>`;

  // Career headline stats
  const headlines = getCollegeHeadlines(pos, career);
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
    const seasonCols = getCollegeSeasonColumns(pos);
    html += `<div class="profile-section-title">College Season Log</div>`;
    html += `<table class="profile-season-table"><thead><tr>`;
    html += `<th>Year</th><th>Team</th>`;
    for (const c of seasonCols) html += `<th>${c.label}</th>`;
    html += `</tr></thead><tbody>`;

    for (const s of seasons) {
      html += `<tr><td>${s.season}</td><td>${s.team || ""}</td>`;
      for (const c of seasonCols) {
        html += `<td>${c.fmt(s[c.key])}</td>`;
      }
      html += `</tr>`;
    }

    // Career totals
    if (career && career.games) {
      html += `<tr style="font-weight:700; border-top:2px solid var(--ink);"><td>Career</td><td></td>`;
      for (const c of seasonCols) {
        html += `<td>${c.fmt(career[c.key])}</td>`;
      }
      html += `</tr>`;
    }
    html += `</tbody></table>`;
  }

  // Combine data
  if (combine) {
    html += `<div class="profile-section-title">Combine / Measurables</div>`;
    html += `<div class="profile-combine-grid">`;
    const metrics = [
      { key: "height_display", label: "Height" },
      { key: "weight", label: "Weight", suffix: " lbs" },
      { key: "forty", label: "40-Yard" },
      { key: "bench", label: "Bench" },
      { key: "vertical", label: "Vertical", suffix: '"' },
      { key: "broad_jump", label: "Broad", suffix: '"' },
      { key: "cone", label: "3-Cone" },
      { key: "shuttle", label: "Shuttle" },
    ];
    for (const m of metrics) {
      const val = combine[m.key];
      if (val != null) {
        html += `<div class="profile-combine-item"><span class="profile-combine-label">${m.label}</span><span class="profile-combine-value">${val}${m.suffix || ""}</span></div>`;
      }
    }
    if (combine.draft_round && combine.draft_pick) {
      html += `<div class="profile-combine-item"><span class="profile-combine-label">Draft</span><span class="profile-combine-value">Rd ${combine.draft_round} Pick ${combine.draft_pick}</span></div>`;
    }
    if (combine.draft_team) {
      html += `<div class="profile-combine-item"><span class="profile-combine-label">NFL Team</span><span class="profile-combine-value">${combine.draft_team}</span></div>`;
    }
    html += `</div>`;
  }

  // Draft / NFL career
  if (draft && draft.nfl_games) {
    html += `<div class="profile-section-title">NFL Career</div>`;
    html += `<div class="profile-combine-grid">`;
    const nflStats = [
      { key: "nfl_games", label: "Games" },
      { key: "career_av", label: "Career AV" },
      { key: "nfl_pass_yards", label: "Pass Yds" },
      { key: "nfl_pass_tds", label: "Pass TD" },
      { key: "nfl_rush_yards", label: "Rush Yds" },
      { key: "nfl_rush_tds", label: "Rush TD" },
      { key: "nfl_rec_yards", label: "Rec Yds" },
      { key: "nfl_rec_tds", label: "Rec TD" },
    ];
    for (const s of nflStats) {
      const val = draft[s.key];
      if (val != null && val > 0) {
        html += `<div class="profile-combine-item"><span class="profile-combine-label">${s.label}</span><span class="profile-combine-value">${val.toLocaleString()}</span></div>`;
      }
    }
    html += `</div>`;
  }

  container.innerHTML = html;
}

function getCollegeHeadlines(pos, career) {
  if (!career) return [];
  const f = (v) => v != null ? v.toLocaleString() : "—";
  if (pos === "QB") {
    return [
      { label: "Games", value: f(career.games) },
      { label: "Pass Yds", value: f(career.pass_yards) },
      { label: "Pass TD", value: f(career.pass_tds) },
      { label: "CMP%", value: career.completion_pct != null ? career.completion_pct + "%" : "—" },
      { label: "Rush Yds", value: f(career.rush_yards) },
      { label: "Total TD", value: f(career.total_tds) },
    ];
  }
  if (pos === "RB") {
    return [
      { label: "Games", value: f(career.games) },
      { label: "Rush Yds", value: f(career.rush_yards) },
      { label: "Rush TD", value: f(career.rush_tds) },
      { label: "Y/CAR", value: career.yards_per_carry != null ? String(career.yards_per_carry) : "—" },
      { label: "Rec Yds", value: f(career.rec_yards) },
      { label: "Total TD", value: f(career.total_tds) },
    ];
  }
  // WR / TE
  return [
    { label: "Games", value: f(career.games) },
    { label: "Rec Yds", value: f(career.rec_yards) },
    { label: "Rec TD", value: f(career.rec_tds) },
    { label: "Receptions", value: f(career.receptions) },
    { label: "Y/REC", value: career.yards_per_rec != null ? String(career.yards_per_rec) : "—" },
    { label: "Total TD", value: f(career.total_tds) },
  ];
}

function getCollegeSeasonColumns(pos) {
  const f0 = (v) => v != null ? v.toLocaleString() : "—";
  const f1 = (v) => v != null ? Number(v).toFixed(1) : "—";

  const common = [{ key: "games", label: "GP", fmt: f0 }];

  if (pos === "QB") {
    return [...common,
      { key: "pass_yards", label: "Pass Yds", fmt: f0 },
      { key: "pass_tds", label: "Pass TD", fmt: f0 },
      { key: "completions", label: "CMP", fmt: f0 },
      { key: "pass_attempts", label: "ATT", fmt: f0 },
      { key: "completion_pct", label: "CMP%", fmt: f1 },
      { key: "ints_thrown", label: "INT", fmt: f0 },
      { key: "rush_yards", label: "Rush Yds", fmt: f0 },
      { key: "rush_tds", label: "Rush TD", fmt: f0 },
    ];
  }
  if (pos === "RB") {
    return [...common,
      { key: "rush_yards", label: "Rush Yds", fmt: f0 },
      { key: "rush_tds", label: "Rush TD", fmt: f0 },
      { key: "carries", label: "CAR", fmt: f0 },
      { key: "yards_per_carry", label: "Y/CAR", fmt: f1 },
      { key: "rec_yards", label: "Rec Yds", fmt: f0 },
      { key: "receptions", label: "REC", fmt: f0 },
      { key: "rec_tds", label: "Rec TD", fmt: f0 },
      { key: "total_tds", label: "Total TD", fmt: f0 },
    ];
  }
  // WR / TE
  return [...common,
    { key: "rec_yards", label: "Rec Yds", fmt: f0 },
    { key: "rec_tds", label: "Rec TD", fmt: f0 },
    { key: "receptions", label: "REC", fmt: f0 },
    { key: "targets", label: "TGT", fmt: f0 },
    { key: "yards_per_rec", label: "Y/REC", fmt: f1 },
    { key: "catch_rate", label: "Catch%", fmt: f1 },
    { key: "rush_yards", label: "Rush Yds", fmt: f0 },
    { key: "total_tds", label: "Total TD", fmt: f0 },
  ];
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

  // RPS Score + Tier Badge (computed client-side from profile data)
  const rpsData = computeProspectRPS(prospect, percentiles);
  if (rpsData) {
    const tier = getRPSTierDef(rpsData.rps);
    html += `<div class="prospect-rps-section">`;
    html += `<div class="prospect-rps-header">`;
    html += `<div class="profile-section-title" style="margin-bottom:0;">Razzle Prospect Score</div>`;
    html += `<div class="tier-badge" style="background:${tier.color}; transform:rotate(-3deg); margin-left:10px;">${tier.label}</div>`;
    html += `</div>`;
    html += `<div class="prospect-rps-score-row">`;
    html += `<div class="prospect-rps-big">${rpsData.rps.toFixed(1)}</div>`;
    html += `<div class="prospect-rps-bar-wrap"><div class="prospect-rps-bar-fill" style="width:${Math.min(100, rpsData.rps)}%; background:${tier.color};"></div></div>`;
    html += `</div>`;
    html += `<div class="prospect-rps-breakdown">`;
    html += `<div class="prospect-rps-component"><span class="prospect-rps-comp-val">${rpsData.athleticAvg != null ? Math.round(rpsData.athleticAvg) : "—"}</span><span class="prospect-rps-comp-label">Athletic (60%)</span></div>`;
    html += `<div class="prospect-rps-component"><span class="prospect-rps-comp-val">${Math.round(rpsData.draftCapital)}</span><span class="prospect-rps-comp-label">Draft Cap (30%)</span></div>`;
    html += `<div class="prospect-rps-component"><span class="prospect-rps-comp-val">${Math.round(rpsData.sizeScore)}</span><span class="prospect-rps-comp-label">Size (10%)</span></div>`;
    html += `</div>`;
    html += `</div>`;
  }

  // ── College Production Section ──────────────────────────────────
  const college = data.college;
  if (college && college.seasons && college.seasons.length > 0) {
    const career = college.career;
    html += `<div class="profile-section-title" style="color:var(--blue);">College Production</div>`;

    // Headline stats bar (position-specific)
    html += `<div class="profile-stats-bar" style="border-color:var(--blue);">`;
    const collegeMeta = [];
    collegeMeta.push({ label: "Seasons", value: college.seasons_played });
    collegeMeta.push({ label: "Games", value: career.games || 0 });

    if (pos === "QB" || (career.pass_yards || 0) > 1000) {
      collegeMeta.push({ label: "Pass Yds", value: (career.pass_yards || 0).toLocaleString() });
      collegeMeta.push({ label: "Pass TD", value: career.pass_tds || 0 });
      if (career.completion_pct) collegeMeta.push({ label: "CMP%", value: career.completion_pct.toFixed(1) + "%" });
      if (career.ints_thrown) collegeMeta.push({ label: "INT", value: career.ints_thrown });
    }
    if (pos === "RB" || (career.rush_yards || 0) > 500) {
      collegeMeta.push({ label: "Rush Yds", value: (career.rush_yards || 0).toLocaleString() });
      collegeMeta.push({ label: "Rush TD", value: career.rush_tds || 0 });
      if (career.yards_per_carry) collegeMeta.push({ label: "YPC", value: career.yards_per_carry.toFixed(1) });
    }
    if (pos === "WR" || pos === "TE" || pos.includes("WR") || (career.rec_yards || 0) > 300) {
      collegeMeta.push({ label: "Rec Yds", value: (career.rec_yards || 0).toLocaleString() });
      collegeMeta.push({ label: "Rec TD", value: career.rec_tds || 0 });
      collegeMeta.push({ label: "Receptions", value: career.receptions || 0 });
      if (career.yards_per_rec) collegeMeta.push({ label: "Y/REC", value: career.yards_per_rec.toFixed(1) });
    }

    for (const m of collegeMeta) {
      html += `<div class="profile-stat-box"><div class="profile-stat-value">${m.value}</div><div class="profile-stat-label">${m.label}</div></div>`;
    }
    html += `</div>`;

    // Dominator rating badge (WR/TE)
    if (college.dominator_rating) {
      const domColor = college.dominator_rating >= 30 ? "#22a06b" : college.dominator_rating >= 20 ? "#2ec4b6" : "#ffc857";
      html += `<div style="display:flex; align-items:center; gap:8px; margin:8px 0 12px 0;">`;
      html += `<span class="tier-badge" style="background:${domColor}; transform:rotate(-2deg); font-size:11px;">${college.dominator_rating.toFixed(1)}% DOM</span>`;
      html += `<span style="font-family:var(--font-hand); font-size:15px; color:var(--ink-light);">peak dominator rating (team rec share)</span>`;
      html += `</div>`;
    }

    // Season log table
    html += `<div class="profile-season-table-wrap">`;
    html += `<table class="profile-season-table">`;
    html += `<thead><tr>`;
    html += `<th>Year</th><th>Team</th><th>G</th>`;
    // Show columns based on position
    const isQB = pos === "QB" || (career.pass_yards || 0) > 1000;
    const isRush = pos === "RB" || (career.rush_yards || 0) > 500;
    const isRec = pos === "WR" || pos === "TE" || pos.includes("WR") || (career.rec_yards || 0) > 300;
    if (isQB) html += `<th>CMP</th><th>ATT</th><th>PaYds</th><th>PaTD</th><th>INT</th><th>CMP%</th>`;
    if (isRush) html += `<th>CAR</th><th>RuYds</th><th>RuTD</th><th>YPC</th>`;
    if (isRec) html += `<th>REC</th><th>TGT</th><th>ReYds</th><th>ReTD</th><th>Y/R</th>`;
    html += `</tr></thead><tbody>`;

    for (const s of college.seasons) {
      html += `<tr>`;
      html += `<td style="font-weight:600;">${s.season}</td>`;
      html += `<td>${s.team || ""}</td>`;
      html += `<td>${s.games || 0}</td>`;
      if (isQB) {
        html += `<td>${s.completions || 0}</td><td>${s.pass_attempts || 0}</td>`;
        html += `<td>${(s.pass_yards || 0).toLocaleString()}</td><td>${s.pass_tds || 0}</td>`;
        html += `<td>${s.ints_thrown || 0}</td>`;
        html += `<td>${s.completion_pct ? s.completion_pct.toFixed(1) : "—"}</td>`;
      }
      if (isRush) {
        html += `<td>${s.carries || 0}</td><td>${(s.rush_yards || 0).toLocaleString()}</td>`;
        html += `<td>${s.rush_tds || 0}</td>`;
        html += `<td>${s.yards_per_carry ? s.yards_per_carry.toFixed(1) : "—"}</td>`;
      }
      if (isRec) {
        html += `<td>${s.receptions || 0}</td><td>${s.targets || 0}</td>`;
        html += `<td>${(s.rec_yards || 0).toLocaleString()}</td><td>${s.rec_tds || 0}</td>`;
        html += `<td>${s.yards_per_rec ? s.yards_per_rec.toFixed(1) : "—"}</td>`;
      }
      html += `</tr>`;
    }

    // Career totals row
    html += `<tr class="career-total-row">`;
    html += `<td style="font-weight:700;">Career</td><td></td><td>${career.games || 0}</td>`;
    if (isQB) {
      html += `<td>${career.completions || 0}</td><td>${career.pass_attempts || 0}</td>`;
      html += `<td>${(career.pass_yards || 0).toLocaleString()}</td><td>${career.pass_tds || 0}</td>`;
      html += `<td>${career.ints_thrown || 0}</td>`;
      html += `<td>${career.completion_pct ? career.completion_pct.toFixed(1) : "—"}</td>`;
    }
    if (isRush) {
      html += `<td>${career.carries || 0}</td><td>${(career.rush_yards || 0).toLocaleString()}</td>`;
      html += `<td>${career.rush_tds || 0}</td>`;
      html += `<td>${career.yards_per_carry ? career.yards_per_carry.toFixed(1) : "—"}</td>`;
    }
    if (isRec) {
      html += `<td>${career.receptions || 0}</td><td>${career.targets || 0}</td>`;
      html += `<td>${(career.rec_yards || 0).toLocaleString()}</td><td>${career.rec_tds || 0}</td>`;
      html += `<td>${career.yards_per_rec ? career.yards_per_rec.toFixed(1) : "—"}</td>`;
    }
    html += `</tr>`;
    html += `</tbody></table></div>`;

    // College production arc chart
    if (college.seasons.length >= 2) {
      html += `<div class="profile-chart-wrap" style="text-align:center; margin-top:10px;">`;
      html += `<canvas id="collegeArcCanvas" width="480" height="200" style="border:2px solid var(--ink); border-radius:8px; background:var(--bg); max-width:100%;"></canvas>`;
      html += `</div>`;
    }
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

  // Comp-based stat projections (weighted average of comp NFL careers)
  const compProjection = computeCompProjection(comps, pos);
  if (compProjection) {
    html += `<div class="profile-section-title">Comp-Based Projection</div>`;
    html += `<div style="font-family:var(--font-hand); font-size:16px; color:var(--ink-light); margin:-6px 0 12px 0;">based on athletic comp averages — not a guarantee</div>`;
    html += `<div class="prospect-projection-grid">`;
    for (const stat of compProjection.stats) {
      html += `<div class="prospect-proj-box">`;
      html += `<div class="prospect-proj-val">${stat.value}</div>`;
      html += `<div class="prospect-proj-label">${stat.label}</div>`;
      html += `</div>`;
    }
    html += `</div>`;
    if (compProjection.confidence) {
      const confColor = compProjection.confidence >= 75 ? "#22a06b" : compProjection.confidence >= 50 ? "#ffc857" : "#e87422";
      html += `<div class="prospect-proj-confidence">`;
      html += `<span style="font-family:var(--font-mono); font-size:11px; color:var(--ink-light);">Comp confidence:</span> `;
      html += `<span style="font-family:var(--font-display); font-size:14px; font-weight:700; color:${confColor};">${Math.round(compProjection.confidence)}%</span>`;
      html += `<span style="font-family:var(--font-mono); font-size:10px; color:var(--ink-light); margin-left:8px;">(${compProjection.compCount} comps with NFL data)</span>`;
      html += `</div>`;
    }
  }

  container.innerHTML = html;

  // Draw spider chart after DOM update
  if (hasSpiderData) {
    requestAnimationFrame(() => drawProspectSpider(prospect, percentiles, combineMetrics));
  }

  // Draw college production arc chart
  if (college && college.seasons && college.seasons.length >= 2) {
    requestAnimationFrame(() => drawCollegeArc(college, pos));
  }
}

function drawCollegeArc(college, pos) {
  const canvas = document.getElementById("collegeArcCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const W = canvas.width, H = canvas.height;
  const pad = { top: 30, right: 20, bottom: 30, left: 55 };
  const plotW = W - pad.left - pad.right;
  const plotH = H - pad.top - pad.bottom;

  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = "#ede0cf";
  ctx.fillRect(0, 0, W, H);

  const seasons = college.seasons;
  // Pick the primary stat based on position
  let statKey = "total_yards", statLabel = "Total Yards";
  if (pos === "QB") { statKey = "pass_yards"; statLabel = "Pass Yards"; }
  else if (pos === "RB") { statKey = "rush_yards"; statLabel = "Rush Yards"; }
  else if (pos === "WR" || pos === "TE" || pos.includes("WR")) { statKey = "rec_yards"; statLabel = "Rec Yards"; }

  const values = seasons.map(s => s[statKey] || 0);
  const labels = seasons.map(s => s.season);
  const maxVal = Math.max(...values, 1);

  // Title
  ctx.font = "bold 14px 'Caveat', cursive";
  ctx.fillStyle = "#5b7fff";
  ctx.textAlign = "center";
  ctx.fillText(`college ${statLabel.toLowerCase()} by season`, W / 2, 18);

  // Y-axis gridlines
  ctx.font = "10px 'Space Mono', monospace";
  ctx.fillStyle = "#8a8a9e";
  ctx.textAlign = "right";
  const gridSteps = 4;
  for (let i = 0; i <= gridSteps; i++) {
    const v = Math.round((maxVal / gridSteps) * i);
    const y = pad.top + plotH - (i / gridSteps) * plotH;
    ctx.beginPath();
    ctx.moveTo(pad.left, y);
    ctx.lineTo(W - pad.right, y);
    ctx.strokeStyle = "rgba(26,26,46,0.08)";
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillText(v.toLocaleString(), pad.left - 5, y + 3);
  }

  if (values.length < 2) return;
  const stepX = plotW / (values.length - 1);

  // Filled area
  ctx.beginPath();
  for (let i = 0; i < values.length; i++) {
    const x = pad.left + i * stepX;
    const y = pad.top + plotH - (values[i] / maxVal) * plotH;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.lineTo(pad.left + (values.length - 1) * stepX, pad.top + plotH);
  ctx.lineTo(pad.left, pad.top + plotH);
  ctx.closePath();
  ctx.fillStyle = "rgba(91,127,255,0.15)";
  ctx.fill();

  // Line
  ctx.beginPath();
  for (let i = 0; i < values.length; i++) {
    const x = pad.left + i * stepX;
    const y = pad.top + plotH - (values[i] / maxVal) * plotH;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.strokeStyle = "#5b7fff";
  ctx.lineWidth = 3;
  ctx.lineJoin = "round";
  ctx.stroke();

  // Data points + labels
  for (let i = 0; i < values.length; i++) {
    const x = pad.left + i * stepX;
    const y = pad.top + plotH - (values[i] / maxVal) * plotH;

    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fillStyle = "#5b7fff";
    ctx.fill();
    ctx.strokeStyle = "#1a1a2e";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Value label
    ctx.font = "bold 11px 'Space Mono', monospace";
    ctx.fillStyle = "#1a1a2e";
    ctx.textAlign = "center";
    ctx.fillText(values[i].toLocaleString(), x, y - 10);

    // Season label
    ctx.font = "11px 'Space Mono', monospace";
    ctx.fillStyle = "#4a4a5e";
    ctx.fillText(labels[i], x, pad.top + plotH + 18);
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
  const prospectEl = content.querySelector(".profile-name");
  const name = prospectEl ? prospectEl.textContent : "prospect";

  // Create canvas for export
  const canvas = document.createElement("canvas");
  const W = 800;
  const padX = 30;
  const padY = 30;

  // Gather info from DOM
  const statsBar = content.querySelector(".profile-stats-bar");
  const rpsSection = content.querySelector(".prospect-rps-section");
  const combineGrid = content.querySelector(".prospect-combine-grid");
  const spiderCanvas = document.getElementById("prospectSpiderCanvas");
  const compsGrid = content.querySelector(".prospect-comps-grid");
  const projGrid = content.querySelector(".prospect-projection-grid");

  // Calculate height
  let H = padY * 2 + 80; // header
  if (statsBar) H += 80;
  if (rpsSection) H += 120;
  if (combineGrid) H += combineGrid.children.length * 36 + 50;
  if (spiderCanvas) H += 380;
  if (compsGrid) H += compsGrid.children.length * 56 + 50;
  if (projGrid) H += 100;
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

  // RPS Score section
  if (rpsSection) {
    const rpsVal = rpsSection.querySelector(".prospect-rps-big")?.textContent || "";
    const tierBadge = rpsSection.querySelector(".tier-badge");
    const tierLabel = tierBadge?.textContent || "";
    const tierColor = tierBadge?.style.background || "#ffc857";
    const compBoxes = rpsSection.querySelectorAll(".prospect-rps-component");

    // Section border
    ctx.strokeStyle = "#1a1a2e";
    ctx.lineWidth = 3;
    ctx.strokeRect(padX, y, W - padX * 2, 100);
    ctx.fillStyle = "#f7efe5";
    ctx.fillRect(padX + 1, y + 1, W - padX * 2 - 2, 98);

    // Title
    ctx.font = "bold 13px sans-serif";
    ctx.fillStyle = "#1a1a2e";
    ctx.textAlign = "left";
    ctx.fillText("Razzle Prospect Score", padX + 14, y + 22);

    // Tier badge
    ctx.save();
    ctx.translate(padX + 210, y + 16);
    ctx.rotate(-3 * Math.PI / 180);
    ctx.fillStyle = tierColor;
    const badgeW = ctx.measureText(tierLabel).width + 16;
    ctx.fillRect(-badgeW / 2, -10, badgeW, 20);
    ctx.strokeStyle = "#1a1a2e";
    ctx.lineWidth = 2;
    ctx.strokeRect(-badgeW / 2, -10, badgeW, 20);
    ctx.font = "bold 11px sans-serif";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.fillText(tierLabel.toUpperCase(), 0, 4);
    ctx.restore();

    // RPS big number
    ctx.font = "bold 36px sans-serif";
    ctx.fillStyle = "#1a1a2e";
    ctx.textAlign = "left";
    ctx.fillText(rpsVal, padX + 14, y + 68);

    // RPS bar
    const rpsNum = parseFloat(rpsVal) || 0;
    const barX = padX + 80;
    const barW = W - padX * 2 - 100;
    ctx.fillStyle = "rgba(26,26,46,0.06)";
    ctx.fillRect(barX, y + 48, barW, 14);
    ctx.strokeStyle = "#1a1a2e";
    ctx.lineWidth = 2;
    ctx.strokeRect(barX, y + 48, barW, 14);
    ctx.fillStyle = tierColor;
    ctx.fillRect(barX + 1, y + 49, (Math.min(100, rpsNum) / 100) * (barW - 2), 12);

    // Component breakdown
    compBoxes.forEach((box, i) => {
      const cVal = box.querySelector(".prospect-rps-comp-val")?.textContent || "";
      const cLbl = box.querySelector(".prospect-rps-comp-label")?.textContent || "";
      const bx = padX + 14 + i * 140;
      ctx.font = "bold 14px sans-serif";
      ctx.fillStyle = "#1a1a2e";
      ctx.textAlign = "left";
      ctx.fillText(cVal, bx, y + 90);
      ctx.font = "10px sans-serif";
      ctx.fillStyle = "#8a8a9e";
      ctx.fillText(cLbl, bx + 30, y + 90);
    });

    y += 110;
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

  // Athletic comps
  if (compsGrid) {
    ctx.font = "bold 13px sans-serif";
    ctx.fillStyle = "#1a1a2e";
    ctx.textAlign = "left";
    ctx.fillText("NFL Athletic Comps", padX + 8, y + 16);
    y += 30;

    const cards = compsGrid.querySelectorAll(".prospect-comp-card");
    cards.forEach(card => {
      const simEl = card.querySelector(".prospect-comp-sim");
      const simText = simEl?.textContent || "";
      const simBg = simEl?.style.background || "#2ec4b6";
      const compName = card.querySelector(".prospect-comp-name")?.textContent || "";
      const compMeta = card.querySelector(".prospect-comp-meta")?.textContent || "";
      const compStats = card.querySelector(".prospect-comp-stats")?.textContent || "";

      // Card background
      ctx.fillStyle = "#f7efe5";
      ctx.fillRect(padX, y, W - padX * 2, 44);
      ctx.strokeStyle = "#1a1a2e";
      ctx.lineWidth = 2;
      ctx.strokeRect(padX, y, W - padX * 2, 44);

      // Similarity badge
      ctx.fillStyle = simBg;
      ctx.fillRect(padX + 8, y + 8, 44, 28);
      ctx.strokeRect(padX + 8, y + 8, 44, 28);
      ctx.font = "bold 14px sans-serif";
      ctx.fillStyle = "white";
      ctx.textAlign = "center";
      ctx.fillText(simText, padX + 30, y + 27);

      // Comp info
      ctx.textAlign = "left";
      ctx.font = "bold 14px sans-serif";
      ctx.fillStyle = "#1a1a2e";
      ctx.fillText(compName, padX + 62, y + 20);
      ctx.font = "10px monospace";
      ctx.fillStyle = "#8a8a9e";
      ctx.fillText(compMeta, padX + 62, y + 34);

      // Stats on right
      ctx.font = "10px monospace";
      ctx.fillStyle = "#4a4a5e";
      ctx.textAlign = "right";
      ctx.fillText(compStats, W - padX - 8, y + 27);

      y += 50;
    });
    y += 10;
  }

  // Comp-based projections
  if (projGrid) {
    ctx.font = "bold 13px sans-serif";
    ctx.fillStyle = "#1a1a2e";
    ctx.textAlign = "left";
    ctx.fillText("Comp-Based Projection", padX + 8, y + 16);
    y += 28;

    const boxes = projGrid.querySelectorAll(".prospect-proj-box");
    const boxW = Math.min(100, (W - padX * 2 - 10 * boxes.length) / boxes.length);
    boxes.forEach((box, i) => {
      const val = box.querySelector(".prospect-proj-val")?.textContent || "";
      const lbl = box.querySelector(".prospect-proj-label")?.textContent || "";
      const bx = padX + i * (boxW + 10);

      ctx.fillStyle = "#f7efe5";
      ctx.fillRect(bx, y, boxW, 50);
      ctx.strokeStyle = "#1a1a2e";
      ctx.lineWidth = 2;
      ctx.strokeRect(bx, y, boxW, 50);

      ctx.font = "bold 16px sans-serif";
      ctx.fillStyle = "#1a1a2e";
      ctx.textAlign = "center";
      ctx.fillText(val, bx + boxW / 2, y + 22);
      ctx.font = "9px sans-serif";
      ctx.fillStyle = "#8a8a9e";
      ctx.fillText(lbl, bx + boxW / 2, y + 40);
    });
    y += 60;
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

function computeProspectRPS(prospect, percentiles) {
  // Same formula as backend: athletic 60% + draft capital 30% + size 10%
  const metricKeys = ["forty", "bench", "vertical", "broad_jump", "cone", "shuttle"];
  const pcts = metricKeys.map(k => percentiles[k]).filter(v => v != null);
  const athleticAvg = pcts.length > 0 ? pcts.reduce((a, b) => a + b, 0) / pcts.length : null;

  // Draft capital score
  const pk = prospect.draft_pick;
  const rd = prospect.draft_round;
  let draftCapital = 20; // undrafted default
  if (rd && pk) {
    draftCapital = Math.min(100, Math.max(20, 100 - (pk - 1) * 0.314));
  }

  // Size score (weight percentile) — use weight percentile from profile data if available
  const sizeScore = percentiles.weight != null ? Math.min(100, percentiles.weight) : 50;

  // RPS composite
  let rps;
  if (athleticAvg != null) {
    rps = athleticAvg * 0.6 + draftCapital * 0.3 + sizeScore * 0.1;
  } else {
    rps = draftCapital * 0.5 + sizeScore * 0.2;
  }

  return { rps: Math.round(rps * 10) / 10, athleticAvg, draftCapital: Math.round(draftCapital * 10) / 10, sizeScore: Math.round(sizeScore * 10) / 10 };
}

function computeCompProjection(comps, pos) {
  // Weighted average of comp NFL careers, weighted by similarity %
  if (!comps || comps.length === 0) return null;

  const nflComps = comps.filter(c => c.nfl_games && c.nfl_games > 0);
  if (nflComps.length === 0) return null;

  // Compute weighted averages
  let totalWeight = 0;
  const sums = { games: 0, career_av: 0, pass_yards: 0, pass_tds: 0, rush_yards: 0, rush_tds: 0, rec_yards: 0, rec_tds: 0, receptions: 0 };

  for (const c of nflComps) {
    const w = (c.similarity || 50) / 100;
    totalWeight += w;
    sums.games += (c.nfl_games || 0) * w;
    sums.career_av += (c.career_av || 0) * w;
    sums.pass_yards += (c.nfl_pass_yards || 0) * w;
    sums.pass_tds += (c.nfl_pass_tds || 0) * w;
    sums.rush_yards += (c.nfl_rush_yards || 0) * w;
    sums.rush_tds += (c.nfl_rush_tds || 0) * w;
    sums.rec_yards += (c.nfl_rec_yards || 0) * w;
    sums.rec_tds += (c.nfl_rec_tds || 0) * w;
    sums.receptions += (c.nfl_receptions || 0) * w;
  }

  if (totalWeight === 0) return null;

  const avg = {};
  for (const k in sums) avg[k] = Math.round(sums[k] / totalWeight);

  // Build position-appropriate stat display
  const stats = [];
  stats.push({ label: "Games", value: avg.games.toLocaleString() });
  if (avg.career_av) stats.push({ label: "Career AV", value: avg.career_av.toLocaleString() });

  if (pos === "QB") {
    if (avg.pass_yards) stats.push({ label: "Pass Yds", value: avg.pass_yards.toLocaleString() });
    if (avg.pass_tds) stats.push({ label: "Pass TD", value: avg.pass_tds.toLocaleString() });
    if (avg.rush_yards) stats.push({ label: "Rush Yds", value: avg.rush_yards.toLocaleString() });
  } else if (pos === "RB") {
    if (avg.rush_yards) stats.push({ label: "Rush Yds", value: avg.rush_yards.toLocaleString() });
    if (avg.rush_tds) stats.push({ label: "Rush TD", value: avg.rush_tds.toLocaleString() });
    if (avg.rec_yards) stats.push({ label: "Rec Yds", value: avg.rec_yards.toLocaleString() });
    if (avg.receptions) stats.push({ label: "Receptions", value: avg.receptions.toLocaleString() });
  } else {
    // WR/TE
    if (avg.rec_yards) stats.push({ label: "Rec Yds", value: avg.rec_yards.toLocaleString() });
    if (avg.rec_tds) stats.push({ label: "Rec TD", value: avg.rec_tds.toLocaleString() });
    if (avg.receptions) stats.push({ label: "Receptions", value: avg.receptions.toLocaleString() });
  }

  // Confidence = average similarity of comps with NFL data
  const confidence = nflComps.reduce((s, c) => s + (c.similarity || 50), 0) / nflComps.length;

  return { stats, confidence, compCount: nflComps.length };
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


// ─── Class Analytics ─────────────────────────────────────────────
let currentCAPosition = "ALL";
let currentCAData = null;

function openClassAnalytics() {
  document.getElementById("classAnalyticsOverlay").classList.add("open");
  const btnsEl = document.getElementById("caPositionBtns");
  const positions = ["ALL", "QB", "RB", "WR", "TE"];
  btnsEl.innerHTML = positions.map(pos => {
    const posColor = { ALL: "var(--orange)", QB: "var(--pos-qb)", RB: "var(--pos-rb)", WR: "var(--pos-wr)", TE: "var(--pos-te)" }[pos];
    return `<button class="btn-chunky ca-pos-btn" data-pos="${pos}" onclick="loadClassAnalytics('${pos}')" style="font-size:11px; padding:4px 12px; border-color:${posColor};">${pos}</button>`;
  }).join("");

  const defaultPos = state.position || "ALL";
  loadClassAnalytics(defaultPos);
}

function closeClassAnalytics(e) {
  if (e && e.target !== e.currentTarget) return;
  document.getElementById("classAnalyticsOverlay").classList.remove("open");
}

async function loadClassAnalytics(position) {
  currentCAPosition = position;
  const contentEl = document.getElementById("caContent");
  contentEl.innerHTML = `<div style="text-align:center; padding:40px; font-family:var(--font-hand); font-size:22px; color:var(--ink-light);">analyzing ${position === "ALL" ? "all" : position} draft classes...</div>`;

  document.querySelectorAll(".ca-pos-btn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.pos === position);
  });

  try {
    const posParam = position === "ALL" ? "" : position;
    const data = await apiFetch(`/api/draft-class-analytics?position=${posParam}`);
    currentCAData = { ...data, filterPosition: position };
    renderClassAnalytics(data, contentEl);
  } catch (err) {
    contentEl.innerHTML = `<div style="text-align:center; padding:40px; font-family:var(--font-hand); font-size:22px; color:var(--red);">fumbled the analytics... ${err.message}</div>`;
  }
}

function renderClassAnalytics(data, container) {
  const classes = data.classes || [];
  if (classes.length === 0) {
    container.innerHTML = `<div style="text-align:center; padding:40px; font-family:var(--font-hand); font-size:22px; color:var(--ink-light);">no draft class data found</div>`;
    return;
  }

  const posLabel = data.position === "ALL" ? "All Positions" : data.position;
  const gradeColors = { A: "var(--green)", B: "var(--blue)", C: "var(--orange)", D: "var(--red)" };
  const tierColors = { elite: "#d97757", premium: "#5b7fff", solid: "#2ec4b6", flier: "#8b5cf6" };

  // Find max avg RPS for chart scaling
  const maxRPS = Math.max(...classes.map(c => c.avg_rps), 60);

  let html = `<div style="font-family:var(--font-hand); font-size:16px; color:var(--ink-light); margin-bottom:16px;">${posLabel} draft class comparison — year-over-year strength analysis</div>`;

  // Bar chart canvas
  html += `<div style="margin-bottom:24px;"><canvas id="caBarChart" width="900" height="280" style="width:100%; max-width:900px; border:2px solid var(--ink); border-radius:8px; box-shadow:3px 3px 0 var(--ink);"></canvas></div>`;

  // Class cards grid
  html += `<div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(260px, 1fr)); gap:16px;">`;

  for (const cls of classes) {
    const gradeColor = gradeColors[cls.grade] || "var(--ink-light)";
    const topName = cls.top_prospect ? cls.top_prospect.name : "N/A";
    const topRPS = cls.top_prospect ? cls.top_prospect.rps.toFixed(1) : "-";
    const totalElitePrem = cls.tiers.elite + cls.tiers.premium;

    html += `
      <div style="background:var(--bg-card); border:3px solid var(--ink); border-radius:10px; box-shadow:4px 4px 0 var(--ink); padding:16px; position:relative;">
        <!-- Grade badge -->
        <div style="position:absolute; top:-10px; right:12px; background:${gradeColor}; color:white; font-family:var(--font-display); font-size:18px; font-weight:700; padding:4px 12px; border:2px solid var(--ink); border-radius:6px; box-shadow:2px 2px 0 var(--ink); transform:rotate(3deg);">
          ${cls.grade}
        </div>

        <!-- Year heading -->
        <div style="font-family:var(--font-display); font-size:24px; font-weight:700; color:var(--ink); margin-bottom:8px;">${cls.year}</div>

        <!-- Stats row -->
        <div style="display:flex; gap:16px; margin-bottom:12px; font-family:var(--font-mono); font-size:13px;">
          <div><span style="color:var(--ink-light);">Prospects:</span> ${cls.count}</div>
          <div><span style="color:var(--ink-light);">Avg RPS:</span> <strong>${cls.avg_rps.toFixed(1)}</strong></div>
        </div>

        <!-- Tier distribution bar -->
        <div style="margin-bottom:10px;">
          <div style="font-family:var(--font-display); font-size:11px; text-transform:uppercase; color:var(--ink-light); margin-bottom:4px;">Tier Distribution</div>
          <div style="display:flex; height:20px; border:2px solid var(--ink); border-radius:4px; overflow:hidden;">
            ${cls.count > 0 ? ['elite','premium','solid','flier'].map(tier => {
              const pct = (cls.tiers[tier] / cls.count * 100);
              return pct > 0 ? `<div style="width:${pct}%; background:${tierColors[tier]}; display:flex; align-items:center; justify-content:center; font-family:var(--font-mono); font-size:10px; color:white; font-weight:700;">${cls.tiers[tier]}</div>` : '';
            }).join('') : '<div style="width:100%; background:var(--ink-faint);"></div>'}
          </div>
          <div style="display:flex; gap:8px; margin-top:4px; flex-wrap:wrap;">
            ${['elite','premium','solid','flier'].map(tier =>
              `<span style="font-family:var(--font-mono); font-size:10px; color:${tierColors[tier]}; font-weight:700;">${tier.charAt(0).toUpperCase() + tier.slice(1)}: ${cls.tiers[tier]}</span>`
            ).join('')}
          </div>
        </div>

        <!-- Top prospect -->
        <div style="border-top:2px dashed var(--ink-faint); padding-top:8px;">
          <div style="font-family:var(--font-display); font-size:11px; text-transform:uppercase; color:var(--ink-light); margin-bottom:2px;">Top Prospect</div>
          <div style="font-family:var(--font-display); font-size:14px; font-weight:700;">${topName}</div>
          <div style="font-family:var(--font-mono); font-size:12px; color:var(--ink-medium);">RPS: ${topRPS}</div>
        </div>
      </div>`;
  }

  html += `</div>`;
  container.innerHTML = html;

  // Draw bar chart
  requestAnimationFrame(() => drawClassAnalyticsChart(classes, maxRPS));
}

function drawClassAnalyticsChart(classes, maxRPS) {
  const canvas = document.getElementById("caBarChart");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const W = canvas.width;
  const H = canvas.height;
  const PAD_L = 50, PAD_R = 20, PAD_T = 30, PAD_B = 50;
  const chartW = W - PAD_L - PAD_R;
  const chartH = H - PAD_T - PAD_B;

  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = "#f7efe5";
  ctx.fillRect(0, 0, W, H);

  const barCount = classes.length;
  const barGap = 12;
  const barW = Math.min(80, (chartW - barGap * (barCount + 1)) / barCount);
  const totalBarsW = barCount * barW + (barCount - 1) * barGap;
  const startX = PAD_L + (chartW - totalBarsW) / 2;

  const gradeColors = { A: "#2ec4b6", B: "#5b7fff", C: "#d97757", D: "#e63946" };
  const scaleMax = Math.ceil(maxRPS / 10) * 10;

  // Y-axis gridlines + labels
  ctx.strokeStyle = "#c5c5d0";
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);
  for (let v = 0; v <= scaleMax; v += 10) {
    const y = PAD_T + chartH - (v / scaleMax) * chartH;
    ctx.beginPath();
    ctx.moveTo(PAD_L, y);
    ctx.lineTo(W - PAD_R, y);
    ctx.stroke();
    ctx.fillStyle = "#8a8a9e";
    ctx.font = "12px 'Space Mono', monospace";
    ctx.textAlign = "right";
    ctx.fillText(v.toString(), PAD_L - 8, y + 4);
  }
  ctx.setLineDash([]);

  // Y-axis label
  ctx.save();
  ctx.translate(14, PAD_T + chartH / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillStyle = "#4a4a5e";
  ctx.font = "bold 11px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("Avg RPS", 0, 0);
  ctx.restore();

  // Bars
  for (let i = 0; i < barCount; i++) {
    const cls = classes[i];
    const x = startX + i * (barW + barGap);
    const barH = (cls.avg_rps / scaleMax) * chartH;
    const y = PAD_T + chartH - barH;

    // Bar fill
    const color = gradeColors[cls.grade] || "#8a8a9e";
    ctx.fillStyle = color;
    ctx.fillRect(x, y, barW, barH);

    // Bar border
    ctx.strokeStyle = "#1a1a2e";
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, barW, barH);

    // Value on top
    ctx.fillStyle = "#1a1a2e";
    ctx.font = "bold 12px 'Space Mono', monospace";
    ctx.textAlign = "center";
    ctx.fillText(cls.avg_rps.toFixed(1), x + barW / 2, y - 8);

    // Grade badge on top
    const badgeW = 22, badgeH = 18;
    const bx = x + barW / 2 - badgeW / 2;
    const by = y - 28;
    ctx.fillStyle = color;
    ctx.fillRect(bx, by, badgeW, badgeH);
    ctx.strokeStyle = "#1a1a2e";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(bx, by, badgeW, badgeH);
    ctx.fillStyle = "white";
    ctx.font = "bold 11px sans-serif";
    ctx.fillText(cls.grade, x + barW / 2, by + 13);

    // Year label
    ctx.fillStyle = "#1a1a2e";
    ctx.font = "bold 14px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(cls.year.toString(), x + barW / 2, PAD_T + chartH + 20);

    // Count label
    ctx.fillStyle = "#8a8a9e";
    ctx.font = "11px 'Space Mono', monospace";
    ctx.fillText(`(${cls.count})`, x + barW / 2, PAD_T + chartH + 36);
  }

  // Title
  ctx.fillStyle = "#1a1a2e";
  ctx.font = "bold 14px sans-serif";
  ctx.textAlign = "left";
  const posLabel = currentCAData?.filterPosition === "ALL" ? "All Positions" : (currentCAData?.filterPosition || "ALL");
  ctx.fillText(`${posLabel} — Average RPS by Draft Class`, PAD_L, 18);
}

function exportClassAnalyticsImage() {
  if (!currentCAData || !currentCAData.classes) return;

  const classes = currentCAData.classes;
  const posLabel = currentCAData.filterPosition === "ALL" ? "All Positions" : currentCAData.filterPosition;
  const W = 800;
  const gradeColors = { A: "#2ec4b6", B: "#5b7fff", C: "#d97757", D: "#e63946" };
  const tierColors = { elite: "#d97757", premium: "#5b7fff", solid: "#2ec4b6", flier: "#8b5cf6" };

  // Calculate height: title + chart + cards
  const chartH = 240;
  const cardH = 120;
  const cardsPerRow = 3;
  const cardRows = Math.ceil(classes.length / cardsPerRow);
  const totalH = 60 + chartH + 30 + cardRows * (cardH + 16) + 40;

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = totalH;
  const ctx = canvas.getContext("2d");

  // Background
  ctx.fillStyle = "#f7efe5";
  ctx.fillRect(0, 0, W, totalH);

  // Title
  let y = 0;
  ctx.fillStyle = "#1a1a2e";
  ctx.font = "bold 24px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(`Razzle Draft Class Analytics — ${posLabel}`, W / 2, y + 32);
  ctx.font = "16px 'Caveat', cursive";
  ctx.fillStyle = "#8a8a9e";
  ctx.fillText("year-over-year class strength comparison", W / 2, y + 52);
  y += 60;

  // Bar chart
  const PAD_L = 50, PAD_R = 20;
  const chartAreaW = W - PAD_L - PAD_R;
  const barCount = classes.length;
  const barGap = 10;
  const barW = Math.min(70, (chartAreaW - barGap * (barCount + 1)) / barCount);
  const totalBarsW = barCount * barW + (barCount - 1) * barGap;
  const startX = PAD_L + (chartAreaW - totalBarsW) / 2;
  const scaleMax = Math.ceil(Math.max(...classes.map(c => c.avg_rps), 60) / 10) * 10;

  // Gridlines
  ctx.strokeStyle = "#c5c5d0";
  ctx.lineWidth = 1;
  ctx.setLineDash([3, 3]);
  for (let v = 0; v <= scaleMax; v += 10) {
    const gy = y + chartH - 40 - (v / scaleMax) * (chartH - 60);
    ctx.beginPath();
    ctx.moveTo(PAD_L, gy);
    ctx.lineTo(W - PAD_R, gy);
    ctx.stroke();
    ctx.fillStyle = "#8a8a9e";
    ctx.font = "11px monospace";
    ctx.textAlign = "right";
    ctx.fillText(v.toString(), PAD_L - 6, gy + 4);
  }
  ctx.setLineDash([]);

  // Bars
  for (let i = 0; i < barCount; i++) {
    const cls = classes[i];
    const x = startX + i * (barW + barGap);
    const bH = (cls.avg_rps / scaleMax) * (chartH - 60);
    const by = y + chartH - 40 - bH;

    const color = gradeColors[cls.grade] || "#8a8a9e";
    ctx.fillStyle = color;
    ctx.fillRect(x, by, barW, bH);
    ctx.strokeStyle = "#1a1a2e";
    ctx.lineWidth = 2;
    ctx.strokeRect(x, by, barW, bH);

    // Value
    ctx.fillStyle = "#1a1a2e";
    ctx.font = "bold 11px monospace";
    ctx.textAlign = "center";
    ctx.fillText(cls.avg_rps.toFixed(1), x + barW / 2, by - 6);

    // Grade
    const gw = 20, gh = 16;
    ctx.fillStyle = color;
    ctx.fillRect(x + barW / 2 - gw / 2, by - 24, gw, gh);
    ctx.strokeStyle = "#1a1a2e";
    ctx.lineWidth = 1;
    ctx.strokeRect(x + barW / 2 - gw / 2, by - 24, gw, gh);
    ctx.fillStyle = "white";
    ctx.font = "bold 10px sans-serif";
    ctx.fillText(cls.grade, x + barW / 2, by - 12);

    // Year
    ctx.fillStyle = "#1a1a2e";
    ctx.font = "bold 12px sans-serif";
    ctx.fillText(cls.year.toString(), x + barW / 2, y + chartH - 18);
  }

  y += chartH + 20;

  // Class cards
  const cardW = (W - 40 - (cardsPerRow - 1) * 12) / cardsPerRow;
  for (let i = 0; i < classes.length; i++) {
    const cls = classes[i];
    const col = i % cardsPerRow;
    const row = Math.floor(i / cardsPerRow);
    const cx = 20 + col * (cardW + 12);
    const cy = y + row * (cardH + 12);

    // Card bg
    ctx.fillStyle = "#f7efe5";
    ctx.fillRect(cx, cy, cardW, cardH);
    ctx.strokeStyle = "#1a1a2e";
    ctx.lineWidth = 2;
    ctx.strokeRect(cx, cy, cardW, cardH);

    // Shadow
    ctx.fillStyle = "#1a1a2e";
    ctx.fillRect(cx + 3, cy + 3, cardW, cardH);
    ctx.fillStyle = "#f7efe5";
    ctx.fillRect(cx, cy, cardW, cardH);
    ctx.strokeStyle = "#1a1a2e";
    ctx.lineWidth = 2;
    ctx.strokeRect(cx, cy, cardW, cardH);

    // Grade badge
    const color = gradeColors[cls.grade] || "#8a8a9e";
    ctx.fillStyle = color;
    const gbx = cx + cardW - 30, gby = cy + 6;
    ctx.fillRect(gbx, gby, 24, 20);
    ctx.strokeStyle = "#1a1a2e";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(gbx, gby, 24, 20);
    ctx.fillStyle = "white";
    ctx.font = "bold 13px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(cls.grade, gbx + 12, gby + 15);

    // Year
    ctx.textAlign = "left";
    ctx.fillStyle = "#1a1a2e";
    ctx.font = "bold 18px sans-serif";
    ctx.fillText(cls.year.toString(), cx + 10, cy + 24);

    // Stats
    ctx.font = "12px monospace";
    ctx.fillStyle = "#4a4a5e";
    ctx.fillText(`${cls.count} prospects  |  Avg RPS: ${cls.avg_rps.toFixed(1)}`, cx + 10, cy + 44);

    // Tier counts
    ctx.font = "11px monospace";
    const tierText = `E:${cls.tiers.elite} P:${cls.tiers.premium} S:${cls.tiers.solid} F:${cls.tiers.flier}`;
    ctx.fillText(tierText, cx + 10, cy + 62);

    // Top prospect
    if (cls.top_prospect) {
      ctx.font = "10px monospace";
      ctx.fillStyle = "#8a8a9e";
      ctx.fillText("Top:", cx + 10, cy + 82);
      ctx.fillStyle = "#1a1a2e";
      ctx.font = "bold 11px sans-serif";
      const name = cls.top_prospect.name.length > 22 ? cls.top_prospect.name.slice(0, 20) + "..." : cls.top_prospect.name;
      ctx.fillText(`${name} (${cls.top_prospect.rps.toFixed(1)})`, cx + 10, cy + 96);
    }

    // Tier bar at bottom
    const barY = cy + cardH - 12;
    const barTotalW = cardW - 20;
    let barX = cx + 10;
    if (cls.count > 0) {
      for (const tier of ["elite", "premium", "solid", "flier"]) {
        const pct = cls.tiers[tier] / cls.count;
        const segW = pct * barTotalW;
        if (segW > 0) {
          ctx.fillStyle = tierColors[tier];
          ctx.fillRect(barX, barY, segW, 8);
          barX += segW;
        }
      }
      ctx.strokeStyle = "#1a1a2e";
      ctx.lineWidth = 1;
      ctx.strokeRect(cx + 10, barY, barTotalW, 8);
    }
  }

  y += cardRows * (cardH + 12) + 10;

  // Watermark
  ctx.font = "bold 14px sans-serif";
  ctx.fillStyle = "#1a1a2e";
  ctx.globalAlpha = 0.3;
  ctx.textAlign = "center";
  ctx.fillText("built different — razzle.lol", W / 2, y + 8);
  ctx.globalAlpha = 1.0;

  const link = document.createElement("a");
  link.download = `razzle-class-analytics-${posLabel.toLowerCase().replace(/\s+/g, "-")}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
}

// ─── Trade Value Chart ──────────────────────────────────────────────

const _tvState = { position: "ALL", players: [], sideA: [], sideB: [] };

function openTradeValues() {
  document.getElementById("tradeValuesOverlay").classList.add("open");
  renderTVPositionBtns();
  loadTradeValues();
}

function closeTradeValues(e) {
  if (e && e.target !== e.currentTarget) return;
  document.getElementById("tradeValuesOverlay").classList.remove("open");
}

function renderTVPositionBtns() {
  const posColors = { ALL: "#1a1a2e", QB: "#5b7fff", RB: "#2ec4b6", WR: "#d97757", TE: "#8b5cf6" };
  const container = document.getElementById("tvPositionBtns");
  container.innerHTML = "";
  for (const pos of ["ALL", "QB", "RB", "WR", "TE"]) {
    const active = pos === _tvState.position;
    const btn = document.createElement("button");
    btn.className = active ? "btn-primary" : "btn-chunky";
    btn.textContent = pos;
    btn.style.cssText = "font-size:11px; padding:4px 12px;";
    if (!active && posColors[pos] !== "#1a1a2e") btn.style.borderColor = posColors[pos];
    btn.onclick = () => { _tvState.position = pos; renderTVPositionBtns(); renderTradeValueChart(); };
    container.appendChild(btn);
  }
}

async function loadTradeValues() {
  const content = document.getElementById("tvContent");
  content.innerHTML = '<div style="text-align:center; padding:40px; font-family:var(--font-hand); font-size:22px; color:var(--ink-light);">pulling trade film...</div>';

  try {
    const params = new URLSearchParams({
      sort: "ppg",
      order: "desc",
      limit: "200",
      season: state.season === "career" ? "career" : String(state.season || 0),
      relevant: "true",
    });
    const data = await apiFetch("/api/players?" + params);
    const players = data.items || [];

    // Compute DVS for each player
    for (const p of players) {
      p._dvs = computeClientDVS(p.ppg, p.age, p.position) || 0;
      p._tv = Math.round(p._dvs); // Trade value = rounded DVS (0-100 scale)
    }
    // Sort by trade value desc
    players.sort((a, b) => b._tv - a._tv);

    _tvState.players = players;
    renderTradeValueChart();
    document.getElementById("tvCalculator").style.display = "";
    setupTradeCalcSearch();
  } catch (err) {
    content.innerHTML = '<div style="text-align:center; padding:40px; font-family:var(--font-hand); font-size:22px; color:var(--orange);">fumbled the data fetch...</div>';
    console.error("Trade values load failed:", err);
  }
}

function renderTradeValueChart() {
  const posColors = { QB: "#5b7fff", RB: "#2ec4b6", WR: "#d97757", TE: "#8b5cf6" };
  const tiers = [
    { name: "Elite", min: 85, color: "#2ec4b6", badge: "ELITE" },
    { name: "Star", min: 70, color: "#5b7fff", badge: "STAR" },
    { name: "Starter", min: 55, color: "#d97757", badge: "STARTER" },
    { name: "Bench", min: 0, color: "#8a8a9e", badge: "BENCH" },
  ];

  let filtered = _tvState.players;
  if (_tvState.position !== "ALL") {
    filtered = filtered.filter(p => p.position === _tvState.position);
  }

  const content = document.getElementById("tvContent");
  let html = "";

  for (const tier of tiers) {
    const tierPlayers = filtered.filter(p => {
      if (tier.min === 85) return p._tv >= 85;
      if (tier.min === 70) return p._tv >= 70 && p._tv < 85;
      if (tier.min === 55) return p._tv >= 55 && p._tv < 70;
      return p._tv < 55;
    });

    if (!tierPlayers.length) continue;

    // Tier header with rotated sticker badge
    html += '<div style="margin-bottom:20px;">';
    html += '<div style="display:flex; align-items:center; gap:12px; margin-bottom:10px;">';
    html += '<span style="display:inline-block; font-family:var(--font-display); font-size:12px; text-transform:uppercase; letter-spacing:1px; color:#fff; background:' + tier.color + '; padding:4px 14px; border:2px solid var(--ink); border-radius:4px; transform:rotate(-2deg); box-shadow:2px 2px 0 var(--ink);">' + tier.badge + '</span>';
    html += '<span style="font-family:var(--font-hand); font-size:16px; color:var(--ink-light);">' + tierPlayers.length + ' player' + (tierPlayers.length !== 1 ? 's' : '') + '</span>';
    html += '</div>';

    // Player cards grid
    html += '<div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(200px, 1fr)); gap:8px;">';
    for (const p of tierPlayers) {
      const pc = posColors[p.position] || "#1a1a2e";
      const barWidth = Math.max(5, p._tv);
      html += '<div style="background:var(--bg-card); border:2px solid var(--ink); border-radius:8px; padding:8px 10px; box-shadow:2px 2px 0 var(--ink); display:flex; flex-direction:column; gap:4px; border-left:5px solid ' + pc + ';">';
      // Name + position
      html += '<div style="display:flex; align-items:center; gap:6px;">';
      html += '<span style="font-family:var(--font-display); font-size:13px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">' + escapeHtml(p.full_name) + '</span>';
      html += '<span style="font-family:var(--font-mono); font-size:9px; font-weight:bold; color:#fff; background:' + pc + '; padding:1px 5px; border-radius:3px; border:1px solid var(--ink);">' + escapeHtml(p.position) + '</span>';
      html += '</div>';
      // Team + Age
      html += '<div style="font-family:var(--font-mono); font-size:11px; color:var(--ink-light);">' + escapeHtml(p.team || "FA") + (p.age ? ' · Age ' + p.age : '') + '</div>';
      // Trade value bar
      html += '<div style="display:flex; align-items:center; gap:6px;">';
      html += '<div style="flex:1; height:8px; background:var(--bg-warm); border:1px solid var(--ink-faint); border-radius:4px; overflow:hidden;">';
      html += '<div style="width:' + barWidth + '%; height:100%; background:' + pc + '; border-radius:4px;"></div>';
      html += '</div>';
      html += '<span style="font-family:var(--font-mono); font-size:13px; font-weight:bold; min-width:28px; text-align:right;">' + p._tv + '</span>';
      html += '</div>';
      html += '</div>';
    }
    html += '</div></div>';
  }

  if (!html) {
    html = '<div style="text-align:center; padding:40px; font-family:var(--font-hand); font-size:22px; color:var(--ink-light);">no players found</div>';
  }

  content.innerHTML = html;
}

// ─── Trade Calculator ───────────────────────────────────────────────

function setupTradeCalcSearch() {
  setupTradeSearchInput("A");
  setupTradeSearchInput("B");
}

function setupTradeSearchInput(side) {
  const input = document.getElementById("tvSearch" + side);
  const autoDiv = document.getElementById("tvAuto" + side);
  let debounce = null;

  input.addEventListener("input", () => {
    clearTimeout(debounce);
    debounce = setTimeout(() => {
      const q = input.value.trim().toLowerCase();
      if (q.length < 2) { autoDiv.style.display = "none"; return; }
      const matches = _tvState.players.filter(p =>
        (p.full_name || "").toLowerCase().includes(q)
      ).slice(0, 8);
      if (!matches.length) { autoDiv.style.display = "none"; return; }
      const posColors = { QB: "#5b7fff", RB: "#2ec4b6", WR: "#d97757", TE: "#8b5cf6" };
      autoDiv.innerHTML = matches.map(p => {
        const pc = posColors[p.position] || "#1a1a2e";
        return '<div style="padding:6px 10px; cursor:pointer; display:flex; align-items:center; gap:6px; border-bottom:1px solid var(--ink-faint);" onmousedown="addToTradeSide(\'' + side + '\', \'' + escapeAttr(p.player_id || p.full_name) + '\')">'
          + '<span style="font-family:var(--font-mono); font-size:9px; font-weight:bold; color:#fff; background:' + pc + '; padding:1px 5px; border-radius:3px;">' + escapeHtml(p.position) + '</span>'
          + '<span style="font-family:var(--font-display); font-size:12px;">' + escapeHtml(p.full_name) + '</span>'
          + '<span style="font-family:var(--font-mono); font-size:11px; color:var(--ink-light); margin-left:auto;">' + p._tv + '</span>'
          + '</div>';
      }).join("");
      autoDiv.style.display = "";
    }, 150);
  });

  input.addEventListener("blur", () => {
    setTimeout(() => { autoDiv.style.display = "none"; }, 200);
  });
}

function addToTradeSide(side, playerId) {
  const arr = side === "A" ? _tvState.sideA : _tvState.sideB;
  const player = _tvState.players.find(p => (p.player_id || p.full_name) === playerId);
  if (!player || arr.find(p => (p.player_id || p.full_name) === playerId)) return;
  arr.push(player);
  document.getElementById("tvSearch" + side).value = "";
  document.getElementById("tvAuto" + side).style.display = "none";
  renderTradeSide(side);
  updateTradeBalance();
}

function removeFromTradeSide(side, idx) {
  const arr = side === "A" ? _tvState.sideA : _tvState.sideB;
  arr.splice(idx, 1);
  renderTradeSide(side);
  updateTradeBalance();
}

function clearTradeSide(side) {
  if (side === "A") _tvState.sideA = [];
  else _tvState.sideB = [];
  renderTradeSide(side);
  updateTradeBalance();
}

function renderTradeSide(side) {
  const posColors = { QB: "#5b7fff", RB: "#2ec4b6", WR: "#d97757", TE: "#8b5cf6" };
  const arr = side === "A" ? _tvState.sideA : _tvState.sideB;
  const container = document.getElementById("tvList" + side);
  const total = arr.reduce((s, p) => s + (p._tv || 0), 0);
  document.getElementById("tvTotal" + side).textContent = total;

  if (!arr.length) {
    container.innerHTML = '<div style="font-family:var(--font-hand); font-size:14px; color:var(--ink-faint); text-align:center; padding:8px;">add players above</div>';
    return;
  }

  container.innerHTML = arr.map((p, i) => {
    const pc = posColors[p.position] || "#1a1a2e";
    return '<div style="display:flex; align-items:center; gap:6px; padding:5px 8px; background:var(--bg-card); border:2px solid var(--ink); border-radius:6px; border-left:4px solid ' + pc + ';">'
      + '<span style="font-family:var(--font-mono); font-size:9px; font-weight:bold; color:#fff; background:' + pc + '; padding:1px 4px; border-radius:3px;">' + escapeHtml(p.position) + '</span>'
      + '<span style="font-family:var(--font-display); font-size:12px; flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">' + escapeHtml(p.full_name) + '</span>'
      + '<span style="font-family:var(--font-mono); font-size:12px; font-weight:bold;">' + p._tv + '</span>'
      + '<button onclick="removeFromTradeSide(\'' + side + '\', ' + i + ')" style="background:none; border:none; cursor:pointer; font-size:14px; color:var(--ink-light); padding:0 2px;">×</button>'
      + '</div>';
  }).join("");
}

function updateTradeBalance() {
  const totalA = _tvState.sideA.reduce((s, p) => s + (p._tv || 0), 0);
  const totalB = _tvState.sideB.reduce((s, p) => s + (p._tv || 0), 0);
  const badge = document.getElementById("tvBalanceBadge");

  if (!_tvState.sideA.length || !_tvState.sideB.length) {
    badge.textContent = "—";
    badge.style.background = "var(--bg-card)";
    badge.style.color = "var(--ink-light)";
    return;
  }

  const diff = totalA - totalB;
  const avg = (totalA + totalB) / 2;
  const pctDiff = avg > 0 ? Math.abs(diff) / avg * 100 : 0;

  if (pctDiff <= 10) {
    badge.textContent = "FAIR";
    badge.style.background = "#d9efec";
    badge.style.color = "#2ec4b6";
  } else {
    const sign = diff > 0 ? "A+" : "B+";
    badge.textContent = sign + Math.abs(diff);
    badge.style.background = "#f2d5d8";
    badge.style.color = "#e63946";
  }
}

// ─── Trade Value PNG Export ──────────────────────────────────────────

function exportTradeValuesPNG() {
  const posColors = { QB: "#5b7fff", RB: "#2ec4b6", WR: "#d97757", TE: "#8b5cf6" };
  const tiers = [
    { name: "Elite", min: 85, color: "#2ec4b6", badge: "ELITE" },
    { name: "Star", min: 70, color: "#5b7fff", badge: "STAR" },
    { name: "Starter", min: 55, color: "#d97757", badge: "STARTER" },
    { name: "Bench", min: 0, color: "#8a8a9e", badge: "BENCH" },
  ];

  let filtered = _tvState.players;
  if (_tvState.position !== "ALL") {
    filtered = filtered.filter(p => p.position === _tvState.position);
  }

  // Build tier groups
  const tierGroups = [];
  for (const tier of tiers) {
    const tierPlayers = filtered.filter(p => {
      if (tier.min === 85) return p._tv >= 85;
      if (tier.min === 70) return p._tv >= 70 && p._tv < 85;
      if (tier.min === 55) return p._tv >= 55 && p._tv < 70;
      return p._tv < 55;
    });
    if (tierPlayers.length) tierGroups.push({ tier, players: tierPlayers });
  }

  if (!tierGroups.length) return;

  const padX = 30, padY = 30;
  const W = 800;
  const titleH = 55;
  const tierHeaderH = 32;
  const rowH = 28;
  const tierGap = 16;
  const watermarkH = 40;

  // Calculate height
  let totalRows = 0;
  for (const g of tierGroups) totalRows += g.players.length;
  const H = padY + titleH + tierGroups.length * (tierHeaderH + tierGap) + totalRows * rowH + watermarkH + padY;

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");

  // Background
  ctx.fillStyle = "#f7efe5";
  ctx.fillRect(0, 0, W, H);

  // Title
  ctx.font = "bold 24px sans-serif";
  ctx.fillStyle = "#1a1a2e";
  ctx.textAlign = "center";
  const posLabel = _tvState.position === "ALL" ? "Dynasty" : _tvState.position;
  ctx.fillText("Razzle " + posLabel + " Trade Values", W / 2, padY + 26);

  // Subtitle
  ctx.font = "16px 'Caveat', cursive";
  ctx.fillStyle = "rgba(26,26,46,0.5)";
  const seasonText = state.season === "career" ? "career" : state.season || "2024";
  ctx.fillText("dynasty trade currency — " + seasonText + " season", W / 2, padY + 48);

  let y = padY + titleH;

  for (const g of tierGroups) {
    // Tier badge
    ctx.save();
    ctx.translate(padX + 40, y + tierHeaderH / 2);
    ctx.rotate(-0.04);
    ctx.fillStyle = g.tier.color;
    ctx.beginPath();
    const bw = 70, bh = 20;
    ctx.roundRect(-bw / 2, -bh / 2, bw, bh, 3);
    ctx.fill();
    ctx.strokeStyle = "#1a1a2e";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = "#fff";
    ctx.font = "bold 10px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(g.tier.badge, 0, 4);
    ctx.restore();

    // Player count
    ctx.font = "14px 'Caveat', cursive";
    ctx.fillStyle = "#8a8a9e";
    ctx.textAlign = "left";
    ctx.fillText(g.players.length + " player" + (g.players.length !== 1 ? "s" : ""), padX + 86, y + tierHeaderH / 2 + 5);

    y += tierHeaderH;

    // Player rows
    for (let i = 0; i < g.players.length; i++) {
      const p = g.players[i];
      const pc = posColors[p.position] || "#1a1a2e";
      const ry = y + i * rowH;

      // Alternating bg
      if (i % 2 === 0) {
        ctx.fillStyle = "rgba(229,213,195,0.25)";
        ctx.fillRect(padX, ry, W - padX * 2, rowH);
      }

      // Position badge
      ctx.fillStyle = pc;
      ctx.fillRect(padX + 8, ry + 6, 28, 16);
      ctx.strokeStyle = "#1a1a2e";
      ctx.lineWidth = 1;
      ctx.strokeRect(padX + 8, ry + 6, 28, 16);
      ctx.fillStyle = "#fff";
      ctx.font = "bold 8px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(p.position, padX + 22, ry + 17);

      // Name
      ctx.textAlign = "left";
      ctx.fillStyle = "#1a1a2e";
      ctx.font = "bold 12px sans-serif";
      ctx.fillText(p.full_name || "", padX + 44, ry + 18);

      // Team + age
      ctx.fillStyle = "#8a8a9e";
      ctx.font = "10px monospace";
      ctx.fillText((p.team || "FA") + (p.age ? "  Age " + p.age : ""), padX + 300, ry + 18);

      // Trade value bar
      const barX = padX + 430;
      const barW = 240;
      const barH = 10;
      const barY = ry + 9;
      ctx.fillStyle = "rgba(229,213,195,0.5)";
      ctx.fillRect(barX, barY, barW, barH);
      ctx.strokeStyle = "#c5c5d0";
      ctx.lineWidth = 0.5;
      ctx.strokeRect(barX, barY, barW, barH);
      const fillW = Math.max(2, (p._tv / 100) * barW);
      ctx.fillStyle = pc;
      ctx.fillRect(barX, barY, fillW, barH);

      // Trade value number
      ctx.fillStyle = "#1a1a2e";
      ctx.font = "bold 13px monospace";
      ctx.textAlign = "right";
      ctx.fillText(String(p._tv), W - padX - 8, ry + 18);
    }

    y += g.players.length * rowH + tierGap;
  }

  // Watermark
  ctx.font = "bold 14px sans-serif";
  ctx.fillStyle = "#1a1a2e";
  ctx.globalAlpha = 0.3;
  ctx.textAlign = "center";
  ctx.fillText("built different — razzle.lol", W / 2, y + 8);
  ctx.globalAlpha = 1.0;

  const link = document.createElement("a");
  link.download = "razzle-trade-values-" + _tvState.position.toLowerCase() + ".png";
  link.href = canvas.toDataURL("image/png");
  link.click();
}

// ─── Aging Curves ────────────────────────────────────────────────

const _acState = {
  position: "WR",
  data: null,
  enabledPlayers: {},  // name -> boolean
};

const _acPosColors = {
  QB: "#5b7fff",
  RB: "#2ec4b6",
  WR: "#d97757",
  TE: "#8b5cf6",
};

function openAgingCurves() {
  document.getElementById("agingCurvesOverlay").classList.add("open");
  renderACPositionBtns();
  loadAgingCurves();
}

function closeAgingCurves(e) {
  if (e && e.target !== e.currentTarget) return;
  document.getElementById("agingCurvesOverlay").classList.remove("open");
}

function renderACPositionBtns() {
  const container = document.getElementById("acPositionBtns");
  container.innerHTML = "";
  for (const pos of ["QB", "RB", "WR", "TE"]) {
    const active = pos === _acState.position;
    const btn = document.createElement("button");
    btn.className = active ? "btn-primary" : "btn-chunky";
    btn.textContent = pos;
    btn.style.cssText = "font-size:11px; padding:4px 12px;";
    if (!active) btn.style.borderColor = _acPosColors[pos];
    btn.onclick = () => { _acState.position = pos; _acState.enabledPlayers = {}; renderACPositionBtns(); loadAgingCurves(); };
    container.appendChild(btn);
  }
}

async function loadAgingCurves() {
  const canvas = document.getElementById("acCanvas");
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#ede0cf";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.font = "22px 'Caveat', cursive";
  ctx.fillStyle = "#8a8a9e";
  ctx.textAlign = "center";
  ctx.fillText("pulling aging film...", canvas.width / 2, canvas.height / 2);

  try {
    const resp = await apiFetch("/api/aging-curves?position=" + _acState.position);
    _acState.data = resp;

    // Enable top 3 players by default
    _acState.enabledPlayers = {};
    for (let i = 0; i < Math.min(3, resp.players.length); i++) {
      _acState.enabledPlayers[resp.players[i].name] = true;
    }

    renderAgingCurveChart();
    renderACLegend();
  } catch (err) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#ede0cf";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = "22px 'Caveat', cursive";
    ctx.fillStyle = "#d97757";
    ctx.textAlign = "center";
    ctx.fillText("fumbled the aging data...", canvas.width / 2, canvas.height / 2);
    console.error("Aging curves load failed:", err);
  }
}

function renderAgingCurveChart(targetCanvas) {
  const data = _acState.data;
  if (!data) return;

  const canvas = targetCanvas || document.getElementById("acCanvas");
  const ctx = canvas.getContext("2d");
  const W = canvas.width;
  const H = canvas.height;

  // Chart area
  const padL = 60, padR = 30, padT = 40, padB = 50;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;

  // Clear
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = "#ede0cf";
  ctx.fillRect(0, 0, W, H);

  const baseline = data.baseline;
  if (!baseline.length) return;

  // Compute ranges
  const ages = baseline.map(b => b.age);
  const minAge = Math.min(...ages);
  const maxAge = Math.max(...ages);

  // Include player data in max PPG
  let maxPPG = Math.max(...baseline.map(b => b.avg_ppg));
  for (const p of data.players) {
    if (_acState.enabledPlayers[p.name]) {
      for (const pt of p.points) {
        if (pt.ppg > maxPPG) maxPPG = pt.ppg;
      }
    }
  }
  maxPPG = Math.ceil(maxPPG / 5) * 5 + 5; // Round up with padding

  // Scale functions
  const xScale = (age) => padL + ((age - minAge) / (maxAge - minAge)) * chartW;
  const yScale = (ppg) => padT + chartH - (ppg / maxPPG) * chartH;

  // Grid lines
  ctx.strokeStyle = "#c5c5d0";
  ctx.lineWidth = 0.5;
  ctx.setLineDash([4, 4]);
  const ppgStep = maxPPG <= 20 ? 2 : 5;
  for (let ppg = 0; ppg <= maxPPG; ppg += ppgStep) {
    const y = yScale(ppg);
    ctx.beginPath();
    ctx.moveTo(padL, y);
    ctx.lineTo(W - padR, y);
    ctx.stroke();
  }
  ctx.setLineDash([]);

  // Y-axis labels
  ctx.fillStyle = "#4a4a5e";
  ctx.font = "11px 'Space Mono', monospace";
  ctx.textAlign = "right";
  for (let ppg = 0; ppg <= maxPPG; ppg += ppgStep) {
    ctx.fillText(String(ppg), padL - 8, yScale(ppg) + 4);
  }

  // X-axis labels
  ctx.textAlign = "center";
  for (let age = minAge; age <= maxAge; age++) {
    const x = xScale(age);
    ctx.fillText(String(age), x, H - padB + 20);
    // Tick
    ctx.beginPath();
    ctx.strokeStyle = "#c5c5d0";
    ctx.lineWidth = 1;
    ctx.moveTo(x, padT + chartH);
    ctx.lineTo(x, padT + chartH + 4);
    ctx.stroke();
  }

  // Axis labels
  ctx.font = "bold 12px 'Space Mono', monospace";
  ctx.fillStyle = "#1a1a2e";
  ctx.textAlign = "center";
  ctx.fillText("Age", padL + chartW / 2, H - 6);

  ctx.save();
  ctx.translate(16, padT + chartH / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText("PPG (PPR)", 0, 0);
  ctx.restore();

  // Draw individual player curves FIRST (behind baseline)
  const playerColors = [
    "#e87422", "#5b7fff", "#2ec4b6", "#8b5cf6", "#d44040",
    "#ffc857", "#e63946", "#1a1a2e", "#4a9e5c", "#c44daa",
  ];
  let colorIdx = 0;
  for (const p of data.players) {
    if (!_acState.enabledPlayers[p.name]) { colorIdx++; continue; }
    const pts = p.points.filter(pt => pt.age >= minAge && pt.age <= maxAge);
    if (pts.length < 2) { colorIdx++; continue; }

    const color = playerColors[colorIdx % playerColors.length];
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.globalAlpha = 0.7;
    ctx.setLineDash([6, 3]);
    ctx.beginPath();
    for (let i = 0; i < pts.length; i++) {
      const x = xScale(pts[i].age);
      const y = yScale(pts[i].ppg);
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // Data points
    for (const pt of pts) {
      const x = xScale(pt.age);
      const y = yScale(pt.ppg);
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
    }

    // Label at last point
    const last = pts[pts.length - 1];
    ctx.font = "bold 10px 'Space Mono', monospace";
    ctx.fillStyle = color;
    ctx.textAlign = "left";
    ctx.fillText(p.name.split(" ").pop(), xScale(last.age) + 6, yScale(last.ppg) + 3);

    ctx.globalAlpha = 1.0;
    colorIdx++;
  }

  // Draw baseline curve (thick, on top)
  const posColor = _acPosColors[_acState.position] || "#d97757";
  ctx.strokeStyle = posColor;
  ctx.lineWidth = 3.5;
  ctx.globalAlpha = 0.9;
  ctx.beginPath();
  for (let i = 0; i < baseline.length; i++) {
    const x = xScale(baseline[i].age);
    const y = yScale(baseline[i].avg_ppg);
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.globalAlpha = 1.0;

  // Baseline data points
  for (const b of baseline) {
    const x = xScale(b.age);
    const y = yScale(b.avg_ppg);
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fillStyle = posColor;
    ctx.fill();
    ctx.strokeStyle = "#1a1a2e";
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  // Baseline label
  ctx.font = "bold 13px 'Space Mono', monospace";
  ctx.fillStyle = posColor;
  ctx.textAlign = "left";
  const lastB = baseline[baseline.length - 1];
  ctx.fillText(_acState.position + " avg", xScale(lastB.age) + 8, yScale(lastB.avg_ppg) + 4);

  // Title
  ctx.font = "bold 18px 'Luckiest Guy', cursive";
  ctx.fillStyle = "#1a1a2e";
  ctx.textAlign = "left";
  ctx.fillText(_acState.position + " Aging Curve", padL, 24);

  // Subtitle annotation
  ctx.font = "16px 'Caveat', cursive";
  ctx.fillStyle = "#8a8a9e";
  ctx.textAlign = "right";
  ctx.fillText("avg PPG by age, 2020-2024", W - padR, 28);

  // Chart border
  ctx.strokeStyle = "#1a1a2e";
  ctx.lineWidth = 2;
  ctx.strokeRect(padL, padT, chartW, chartH);
}

function renderACLegend() {
  const data = _acState.data;
  if (!data) return;
  const container = document.getElementById("acLegend");

  const playerColors = [
    "#e87422", "#5b7fff", "#2ec4b6", "#8b5cf6", "#d44040",
    "#ffc857", "#e63946", "#1a1a2e", "#4a9e5c", "#c44daa",
  ];

  let html = '<div style="font-family:var(--font-display); font-size:11px; text-transform:uppercase; letter-spacing:1px; color:var(--ink-light); margin-right:8px; padding-top:6px;">Players</div>';
  data.players.forEach((p, i) => {
    const color = playerColors[i % playerColors.length];
    const enabled = _acState.enabledPlayers[p.name];
    const opacity = enabled ? "1" : "0.4";
    const border = enabled ? "2px solid " + color : "2px solid var(--ink-faint)";
    html += '<button onclick="toggleACPlayer(\'' + escapeAttr(p.name) + '\')" style="'
      + 'display:inline-flex; align-items:center; gap:6px; padding:4px 10px; border-radius:20px;'
      + 'border:' + border + '; background:' + (enabled ? color + '15' : 'transparent') + ';'
      + 'cursor:pointer; opacity:' + opacity + '; font-family:var(--font-mono); font-size:11px;'
      + 'transition:all 0.15s;">'
      + '<span style="width:10px; height:10px; border-radius:50%; background:' + color + '; display:inline-block;"></span>'
      + escapeHtml(p.name) + ' <span style="color:var(--ink-light);">' + p.career_ppg + '</span>'
      + '</button>';
  });
  container.innerHTML = html;
}

function toggleACPlayer(name) {
  _acState.enabledPlayers[name] = !_acState.enabledPlayers[name];
  renderAgingCurveChart();
  renderACLegend();
}

function exportAgingCurvesPNG() {
  const data = _acState.data;
  if (!data) return;

  const W = 800;
  const H = 520;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");

  // Render chart to export canvas
  // Temporarily adjust canvas size reference
  const origCanvas = document.getElementById("acCanvas");
  const origW = origCanvas.width;
  const origH = origCanvas.height;

  canvas.width = W;
  canvas.height = H;
  renderAgingCurveChart(canvas);

  // Watermark
  ctx.font = "bold 14px sans-serif";
  ctx.fillStyle = "#1a1a2e";
  ctx.globalAlpha = 0.3;
  ctx.textAlign = "center";
  ctx.fillText("built different — razzle.lol", W / 2, H - 10);
  ctx.globalAlpha = 1.0;

  const link = document.createElement("a");
  link.download = "razzle-aging-curves-" + _acState.position.toLowerCase() + ".png";
  link.href = canvas.toDataURL("image/png");
  link.click();
}


// ===== HEAT MAP =====
const _hmPosColors = { QB: "#5b7fff", RB: "#2ec4b6", WR: "#d97757", TE: "#8b5cf6" };
const _hmState = { position: "WR", group: "production", data: null };

function openHeatMap() {
  document.getElementById("heatMapOverlay").classList.add("open");
  renderHMPositionBtns();
  renderHMGroupBtns();
  loadHeatMap();
}

function closeHeatMap(e) {
  if (e && e.target !== e.currentTarget) return;
  document.getElementById("heatMapOverlay").classList.remove("open");
}

function renderHMPositionBtns() {
  const container = document.getElementById("hmPositionBtns");
  container.innerHTML = "";
  for (const pos of ["QB", "RB", "WR", "TE"]) {
    const active = pos === _hmState.position;
    const btn = document.createElement("button");
    btn.className = active ? "btn-primary" : "btn-chunky";
    btn.textContent = pos;
    btn.style.cssText = "font-size:11px; padding:4px 12px;";
    if (!active) btn.style.borderColor = _hmPosColors[pos];
    btn.onclick = () => { _hmState.position = pos; renderHMPositionBtns(); loadHeatMap(); };
    container.appendChild(btn);
  }
}

function renderHMGroupBtns() {
  const container = document.getElementById("hmGroupBtns");
  container.innerHTML = "";
  const groups = [
    { key: "production", label: "Production" },
    { key: "efficiency", label: "Efficiency" },
    { key: "usage", label: "Usage" },
  ];
  for (const g of groups) {
    const active = g.key === _hmState.group;
    const btn = document.createElement("button");
    btn.className = active ? "btn-primary" : "btn-chunky";
    btn.textContent = g.label;
    btn.style.cssText = "font-size:11px; padding:4px 12px;";
    btn.onclick = () => { _hmState.group = g.key; renderHMGroupBtns(); loadHeatMap(); };
    container.appendChild(btn);
  }
}

function heatColor(pct) {
  // red (#e63946) at 0, yellow (#ffc857) at 50, green (#2ec4b6) at 100
  if (pct == null) return "#c5c5d0";
  pct = Math.max(0, Math.min(100, pct));
  let r, g, b;
  if (pct <= 50) {
    const t = pct / 50;
    r = Math.round(230 + (255 - 230) * t);
    g = Math.round(57 + (200 - 57) * t);
    b = Math.round(70 + (87 - 70) * t);
  } else {
    const t = (pct - 50) / 50;
    r = Math.round(255 - (255 - 46) * t);
    g = Math.round(200 + (196 - 200) * t);
    b = Math.round(87 + (182 - 87) * t);
  }
  return "rgb(" + r + "," + g + "," + b + ")";
}

function textColorForBg(pct) {
  // Dark text on light cells, light text on very saturated cells
  if (pct == null) return "#8a8a9e";
  return "#1a1a2e";
}

async function loadHeatMap() {
  const canvas = document.getElementById("hmCanvas");
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#ede0cf";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.font = "22px 'Caveat', cursive";
  ctx.fillStyle = "#8a8a9e";
  ctx.textAlign = "center";
  ctx.fillText("pulling positional film...", canvas.width / 2, canvas.height / 2);

  try {
    const url = "/api/heatmap?position=" + _hmState.position + "&group=" + _hmState.group;
    const resp = await apiFetch(url);
    _hmState.data = resp;
    renderHeatMapChart();
  } catch (err) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#ede0cf";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = "22px 'Caveat', cursive";
    ctx.fillStyle = "#d97757";
    ctx.textAlign = "center";
    ctx.fillText("fumbled the heat map data...", canvas.width / 2, canvas.height / 2);
    console.error("Heat map load failed:", err);
  }
}

function renderHeatMapChart(targetCanvas) {
  const data = _hmState.data;
  if (!data || !data.players || data.players.length === 0) return;

  const players = data.players;
  const statKeys = data.stat_keys;
  const statLabels = data.stat_labels;
  const numPlayers = players.length;
  const numStats = statKeys.length;

  // Layout constants
  const nameColW = 160;  // player name column width
  const cellW = 100;     // stat cell width
  const cellH = 28;      // row height
  const headerH = 70;    // rotated header area
  const titleH = 50;     // title area
  const padL = 16;
  const padR = 16;
  const padB = 16;

  const totalW = padL + nameColW + numStats * cellW + padR;
  const totalH = titleH + headerH + numPlayers * cellH + padB;

  const canvas = targetCanvas || document.getElementById("hmCanvas");
  canvas.width = totalW;
  canvas.height = totalH;
  const ctx = canvas.getContext("2d");

  // Background
  ctx.fillStyle = "#ede0cf";
  ctx.fillRect(0, 0, totalW, totalH);

  // Title
  ctx.font = "bold 22px 'Luckiest Guy', cursive";
  ctx.fillStyle = "#1a1a2e";
  ctx.textAlign = "left";
  ctx.fillText(_hmState.position + " Heat Map", padL, 30);

  // Subtitle
  ctx.font = "18px 'Caveat', cursive";
  ctx.fillStyle = "#8a8a9e";
  const groupLabel = _hmState.group.charAt(0).toUpperCase() + _hmState.group.slice(1);
  ctx.fillText(groupLabel + " — percentile ranks within position", padL + 280, 32);

  // Chart border
  const chartX = padL;
  const chartY = titleH;
  const chartW = nameColW + numStats * cellW;
  const chartH = headerH + numPlayers * cellH;
  ctx.strokeStyle = "#1a1a2e";
  ctx.lineWidth = 2;
  ctx.strokeRect(chartX, chartY, chartW, chartH);

  // Column headers (rotated stat labels)
  ctx.save();
  ctx.font = "bold 11px 'Space Mono', monospace";
  ctx.fillStyle = "#1a1a2e";
  ctx.textAlign = "left";
  for (let c = 0; c < numStats; c++) {
    const x = padL + nameColW + c * cellW + cellW / 2;
    const y = titleH + headerH - 8;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(-Math.PI / 4);
    ctx.fillText(statLabels[statKeys[c]] || statKeys[c], 0, 0);
    ctx.restore();
  }
  ctx.restore();

  // Header separator
  ctx.strokeStyle = "#1a1a2e";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(chartX, titleH + headerH);
  ctx.lineTo(chartX + chartW, titleH + headerH);
  ctx.stroke();

  // Name column header
  ctx.font = "bold 11px 'Space Mono', monospace";
  ctx.fillStyle = "#4a4a5e";
  ctx.textAlign = "left";
  ctx.fillText("PLAYER", padL + 8, titleH + headerH - 8);

  // Rows
  const posColor = _hmPosColors[_hmState.position] || "#d97757";
  for (let r = 0; r < numPlayers; r++) {
    const player = players[r];
    const rowY = titleH + headerH + r * cellH;

    // Alternating row bg
    if (r % 2 === 0) {
      ctx.fillStyle = "rgba(0,0,0,0.03)";
      ctx.fillRect(padL, rowY, chartW, cellH);
    }

    // Player name + team
    ctx.font = "bold 12px 'Space Mono', monospace";
    ctx.fillStyle = "#1a1a2e";
    ctx.textAlign = "left";
    const displayName = player.name.length > 16 ? player.name.substring(0, 15) + "." : player.name;
    ctx.fillText(displayName, padL + 8, rowY + 18);

    // Team badge
    ctx.font = "bold 9px 'Space Mono', monospace";
    ctx.fillStyle = posColor;
    const nameW = ctx.measureText(displayName).width;
    ctx.fillText(player.team, padL + 12 + nameW + 4, rowY + 18);

    // Stat cells
    for (let c = 0; c < numStats; c++) {
      const stat = player.stats[statKeys[c]];
      const cellX = padL + nameColW + c * cellW;
      const pct = stat ? stat.percentile : null;
      const val = stat ? stat.value : null;

      // Cell fill
      ctx.fillStyle = heatColor(pct);
      ctx.fillRect(cellX + 1, rowY + 1, cellW - 2, cellH - 2);

      // Cell border
      ctx.strokeStyle = "rgba(26,26,46,0.12)";
      ctx.lineWidth = 1;
      ctx.strokeRect(cellX, rowY, cellW, cellH);

      // Value text
      if (val != null) {
        ctx.font = "bold 11px 'Space Mono', monospace";
        ctx.fillStyle = textColorForBg(pct);
        ctx.textAlign = "center";
        // Format: show percentile value with sensible rounding
        let display;
        if (val >= 1000) display = Math.round(val).toLocaleString();
        else if (val >= 100) display = Math.round(val).toString();
        else if (Number.isInteger(val)) display = val.toString();
        else display = val.toFixed(1);
        ctx.fillText(display, cellX + cellW / 2, rowY + 18);
      } else {
        ctx.font = "11px 'Space Mono', monospace";
        ctx.fillStyle = "#8a8a9e";
        ctx.textAlign = "center";
        ctx.fillText("—", cellX + cellW / 2, rowY + 18);
      }
    }

    // Row separator
    ctx.strokeStyle = "rgba(26,26,46,0.08)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padL, rowY + cellH);
    ctx.lineTo(padL + chartW, rowY + cellH);
    ctx.stroke();
  }

  // Name column separator
  ctx.strokeStyle = "#1a1a2e";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(padL + nameColW, titleH);
  ctx.lineTo(padL + nameColW, titleH + chartH);
  ctx.stroke();

  ctx.textAlign = "left";
}

function exportHeatMapPNG() {
  if (!_hmState.data) return;

  const canvas = document.createElement("canvas");
  renderHeatMapChart(canvas);

  const ctx = canvas.getContext("2d");
  const W = canvas.width;
  const H = canvas.height;

  // Watermark
  ctx.font = "bold 14px sans-serif";
  ctx.fillStyle = "#1a1a2e";
  ctx.globalAlpha = 0.3;
  ctx.textAlign = "center";
  ctx.fillText("built different — razzle.lol", W / 2, H - 4);
  ctx.globalAlpha = 1.0;

  const link = document.createElement("a");
  link.download = "razzle-heatmap-" + _hmState.position.toLowerCase() + "-" + _hmState.group + ".png";
  link.href = canvas.toDataURL("image/png");
  link.click();
}
