/* Razzle — The Lab (screener logic) */

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
};

// ─── Init ────────────────────────────────────────────────────────
(async function init() {
  loadStateFromURL();

  try {
    const opts = await apiFetch("/api/filter-options");
    state.seasons = opts.seasons || [2024];
    if (!state.season) state.season = state.seasons[0] || 2024;
    populateSeasonSelect();
    populateFilterStatSelect(opts.stat_keys);
  } catch (e) {
    console.error("Failed to load filter options:", e);
    state.season = 2024;
  }

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
  const loading = document.getElementById("loadingMsg");
  const tbody = document.getElementById("tableBody");
  loading.style.display = "block";
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

// ─── Table rendering ─────────────────────────────────────────────
function renderTable() {
  renderTableHead();
  renderTableBody();
}

function renderTableHead() {
  const thead = document.getElementById("tableHead");
  let html = '<tr><th class="col-player" onclick="sortBy(\'full_name\')">Player';
  if (state.sortKey === "full_name") {
    html += state.sortDir === "asc" ? " ▲" : " ▼";
  }
  html += "</th>";

  for (const key of state.visibleColumns) {
    const col = COLUMNS[key];
    if (!col) continue;
    const cls = state.sortKey === key ? `sort-${state.sortDir}` : "";
    html += `<th class="${cls}" onclick="sortBy('${key}')">${col.label}</th>`;
  }

  html += "</tr>";
  thead.innerHTML = html;
}

function renderTableBody() {
  const tbody = document.getElementById("tableBody");
  if (!state.items.length) {
    tbody.innerHTML = '<tr><td colspan="99" style="text-align:center; padding:40px; font-family: var(--font-hand); font-size: 22px; color: var(--ink-light);">no players match these filters</td></tr>';
    return;
  }

  let html = "";
  for (const player of state.items) {
    const pos = (player.position || "").toUpperCase();
    html += '<tr>';
    html += `<td class="col-player"><div class="player-name-cell">`;
    html += `<span class="pos-badge ${posClass(pos)}">${pos}</span>`;
    html += `<span>${player.full_name}</span>`;
    html += `<span class="team-label">${player.team || ""}</span>`;
    html += `</div></td>`;

    for (const key of state.visibleColumns) {
      const col = COLUMNS[key];
      if (!col) continue;
      const val = player[key];
      html += `<td>${formatStat(val, col.decimals)}</td>`;
    }
    html += "</tr>";
  }
  tbody.innerHTML = html;
}

// ─── Sort ────────────────────────────────────────────────────────
function sortBy(key) {
  if (state.sortKey === key) {
    state.sortDir = state.sortDir === "desc" ? "asc" : "desc";
  } else {
    state.sortKey = key;
    state.sortDir = key === "full_name" ? "asc" : "desc";
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
  sel.innerHTML = state.seasons.map(s =>
    `<option value="${s}" ${s === state.season ? "selected" : ""}>${s}</option>`
  ).join("");
  sel.addEventListener("change", (e) => {
    state.season = parseInt(e.target.value);
    state.offset = 0;
    fetchAndRender();
  });
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
  el.innerHTML = `<strong>${state.totalCount}</strong> players`;
}

// ─── Filters ─────────────────────────────────────────────────────
function populateFilterStatSelect(statKeys) {
  const sel = document.getElementById("filterStat");
  // Use our COLUMNS definition for the select
  const keys = Object.keys(COLUMNS);
  sel.innerHTML = keys.map(k => {
    const col = COLUMNS[k];
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
  const groups = {};
  for (const [key, col] of Object.entries(COLUMNS)) {
    if (!groups[col.group]) groups[col.group] = [];
    groups[col.group].push({ key, ...col });
  }

  let html = "";
  for (const [groupName, cols] of Object.entries(groups)) {
    html += `<div class="column-group">`;
    html += `<div class="column-group-title">${groupName}</div>`;
    for (const col of cols) {
      const checked = state.visibleColumns.includes(col.key) ? "checked" : "";
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
  if (checked && !state.visibleColumns.includes(key)) {
    // Insert in COLUMNS order
    const allKeys = Object.keys(COLUMNS);
    const idx = allKeys.indexOf(key);
    let insertAt = state.visibleColumns.length;
    for (let i = 0; i < state.visibleColumns.length; i++) {
      if (allKeys.indexOf(state.visibleColumns[i]) > idx) {
        insertAt = i;
        break;
      }
    }
    state.visibleColumns.splice(insertAt, 0, key);
  } else if (!checked) {
    state.visibleColumns = state.visibleColumns.filter(k => k !== key);
  }
}

function renderPresets() {
  const container = document.getElementById("presetBar");
  container.innerHTML = Object.entries(PRESETS).map(([key, preset]) =>
    `<button class="btn-chunky" onclick="applyPreset('${key}')">${preset.label}</button>`
  ).join("");
}

function applyPreset(key) {
  const preset = PRESETS[key];
  if (!preset) return;
  state.visibleColumns = [...preset.columns];
  renderColumnPicker();
  renderTable();
  saveStateToURL();
}

// ─── URL state ───────────────────────────────────────────────────
function saveStateToURL() {
  const params = new URLSearchParams();
  if (state.position !== "ALL") params.set("pos", state.position);
  if (state.search) params.set("q", state.search);
  if (state.season) params.set("season", state.season);
  if (state.relevance !== "fantasy") params.set("rel", state.relevance);
  if (state.sortKey !== "fantasy_points_ppr") params.set("sort", state.sortKey);
  if (state.sortDir !== "desc") params.set("dir", state.sortDir);
  if (state.offset > 0) params.set("offset", state.offset);
  if (state.filters.length) params.set("filters", JSON.stringify(state.filters));

  // Only save columns if not default PPR preset
  const defaultCols = PRESETS.ppr.columns.join(",");
  const currentCols = state.visibleColumns.join(",");
  if (currentCols !== defaultCols) params.set("cols", currentCols);

  const qs = params.toString();
  const newURL = window.location.pathname + (qs ? "?" + qs : "");
  history.replaceState(null, "", newURL);
}

function loadStateFromURL() {
  const params = new URLSearchParams(window.location.search);
  if (params.has("pos")) state.position = params.get("pos");
  if (params.has("q")) state.search = params.get("q");
  if (params.has("season")) state.season = parseInt(params.get("season"));
  if (params.has("rel")) state.relevance = params.get("rel");
  if (params.has("sort")) state.sortKey = params.get("sort");
  if (params.has("dir")) state.sortDir = params.get("dir");
  if (params.has("offset")) state.offset = parseInt(params.get("offset"));
  if (params.has("cols")) state.visibleColumns = params.get("cols").split(",");
  if (params.has("filters")) {
    try { state.filters = JSON.parse(params.get("filters")); } catch (e) {}
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
