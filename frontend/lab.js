/* Razzle — The Lab (screener logic) */
// escapeHtml and escapeAttr are in app.js (shared)

// ─── Panel Actions (CSV export, Share URL) ─────────────────────

function exportPanelCSV(panelName) {
  // Pro+ gating
  if (typeof isPaidUser === "function" && !isPaidUser()) {
    _showToast('CSV export requires Pro.', 'warning', null, {href: '/pricing.html', text: 'upgrade now'});
    return;
  }
  var panel = document.getElementById('panel-' + panelName);
  if (!panel) return;
  var table = panel.querySelector('.lab-panel-content table');
  if (!table) {
    _showToast('nothing on the tape to export');
    return;
  }
  var rows = [];
  // Extract headers
  var thEls = table.querySelectorAll('thead th');
  if (thEls.length) {
    var headers = [];
    thEls.forEach(function(th) { headers.push(_csvCell(th.textContent.trim())); });
    rows.push(headers.join(','));
  }
  // Extract body rows
  table.querySelectorAll('tbody tr').forEach(function(tr) {
    var cells = [];
    tr.querySelectorAll('td').forEach(function(td) { cells.push(_csvCell(td.textContent.trim())); });
    if (cells.length) rows.push(cells.join(','));
  });
  if (rows.length <= 1) {
    _showToast('no film to export — run a query first');
    return;
  }
  var csv = rows.join('\n');
  var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  var date = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = 'razzle_' + panelName + '_' + date + '.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  _showToast('CSV exported');
}

function _csvCell(val) {
  if (!val) return '""';
  val = val.replace(/"/g, '""');
  if (val.indexOf(',') !== -1 || val.indexOf('"') !== -1 || val.indexOf('\n') !== -1) {
    return '"' + val + '"';
  }
  return val;
}

var _html2canvasLoading = false;
var _html2canvasRetries = 0;
function _loadHtml2Canvas(cb) {
  if (typeof html2canvas !== 'undefined') { cb(); return; }
  if (_html2canvasLoading) {
    if (++_html2canvasRetries > 25) { _html2canvasLoading = false; _html2canvasRetries = 0; _showToast(razzleError()); return; }
    setTimeout(function() { _loadHtml2Canvas(cb); }, 200);
    return;
  }
  _html2canvasLoading = true;
  _html2canvasRetries = 0;
  var s = document.createElement('script');
  s.src = 'https://html2canvas.hertzen.com/dist/html2canvas.min.js';
  s.onload = function() { _html2canvasLoading = false; cb(); };
  s.onerror = function() { _html2canvasLoading = false; _showToast(razzleError()); };
  document.head.appendChild(s);
}

function screenshotPanel(panelName) {
  var panel = document.getElementById('panel-' + panelName);
  if (!panel) return;
  var content = panel.querySelector('.lab-panel-content');
  if (!content) return;
  _showToast('capturing...');
  _loadHtml2Canvas(function() {
  var _t = getCanvasTheme();
  html2canvas(content, {
    backgroundColor: _t.bg,
    scale: 2,
    useCORS: true,
    logging: false
  }).then(function(canvas) {
    // Add watermark with random character + shareable URL
    var ctx = canvas.getContext('2d');
    try { if (typeof saveStateToURL === 'function') saveStateToURL(); } catch(e) {}
    if (typeof drawRazzleWatermark === 'function') {
      drawRazzleWatermark(ctx, canvas, { url: window.location.href, isDark: _t.isDark });
    } else {
      var wmAlpha = _t.isDark ? 'rgba(237, 224, 207, 0.25)' : 'rgba(45, 31, 20, 0.25)';
      ctx.fillStyle = wmAlpha;
      ctx.textAlign = 'right';
      ctx.font = '600 28px Caveat, cursive';
      ctx.fillText('razzle.lol', canvas.width - 20, canvas.height - 30);
    }
    // Download
    var link = document.createElement('a');
    var date = new Date().toISOString().slice(0, 10);
    link.download = 'razzle_' + panelName + '_' + date + '.png';
    link.href = canvas.toDataURL('image/png');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    _showToast('screenshot saved');
  }).catch(function() {
    _showToast('fumbled the screenshot — try again');
  });
  }); // end _loadHtml2Canvas callback
}

function toggleMethodology(methodId) {
  var el = document.getElementById(methodId);
  if (!el) return;
  el.style.display = el.style.display === 'none' ? 'block' : 'none';
}

function sharePanelURL(panelName) {
  var params = new URLSearchParams(window.location.search);
  params.set('panel', panelName);
  if (state.universe && state.universe !== 'nfl') params.set('universe', state.universe);
  if (state.universe === 'college' && state.collegeView === 'prospects') params.set('cv', 'prospects');
  if (state.season) params.set('season', state.season);
  if (state.position) params.set('pos', state.position);
  var url = window.location.origin + window.location.pathname + '?' + params.toString();
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(url).then(function() {
      _showToast('link copied — share it on Reddit');
    }).catch(function() {
      _fallbackCopy(url);
    });
  } else {
    _fallbackCopy(url);
  }
}

function _fallbackCopy(text) {
  var ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.left = '-9999px';
  document.body.appendChild(ta);
  ta.select();
  try { document.execCommand('copy'); _showToast('link copied — share it on Reddit'); }
  catch (e) { _showToast('fumbled the copy — try again'); }
  document.body.removeChild(ta);
}



var _skeletonHTML = '';
function _resetLoadingSkeleton(el) {
  if (!_skeletonHTML) _skeletonHTML = el.innerHTML;
  if (!el.querySelector('.skeleton-table')) el.innerHTML = _skeletonHTML;
  // Agent-voiced loading text
  var lt = el.querySelector('#loadingText');
  if (lt && typeof getLoadingText === 'function') {
    lt.textContent = getLoadingText('screener');
  }
}
function _highlightSearch(escaped) {
  if (!state.search) return escaped;
  var q = escapeHtml(state.search);
  var re = new RegExp('(' + q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi');
  return escaped.replace(re, '<mark class="search-hl">$1</mark>');
}

// ─── Watchlist (localStorage, cached in memory) ────────────────
let _watchlistCache = null;
var _watchlistSet = new Set();
var _selectedSet = new Set();

function _rebuildWatchlistSet() {
  _watchlistSet.clear();
  var list = getWatchlist();
  for (var i = 0; i < list.length; i++) _watchlistSet.add(list[i].player_id);
}

function _rebuildSelectedSet() {
  _selectedSet.clear();
  for (var i = 0; i < state.selectedPlayers.length; i++) _selectedSet.add(state.selectedPlayers[i].player_id);
}

function getWatchlist() {
  if (_watchlistCache !== null) return _watchlistCache;
  try { _watchlistCache = JSON.parse(localStorage.getItem("razzle_watchlist")) || []; }
  catch { _watchlistCache = []; }
  _rebuildWatchlistSet();
  return _watchlistCache;
}

function saveWatchlist(list) {
  _watchlistCache = list;
  _rebuildWatchlistSet();
  try { localStorage.setItem("razzle_watchlist", JSON.stringify(list)); } catch(e) {}
  updateWatchlistBadge();
  // Push to cloud for Pro+ users (silent, non-blocking)
  if (typeof _pushWatchlistAfterChange === "function") _pushWatchlistAfterChange();
}

function isOnWatchlist(playerId) {
  return _watchlistSet.has(playerId);
}

function toggleWatchlistPlayer(playerId, name, position, team, universe) {
  var list = getWatchlist();
  var idx = list.findIndex(function(p) { return p.player_id === playerId; });
  if (idx >= 0) {
    list.splice(idx, 1);
  } else {
    list.push({
      player_id: playerId,
      name: name,
      position: (position || "").toUpperCase(),
      team: team || "",
      universe: universe || state.universe,
      tier: 0,
      added_at: Date.now()
    });
  }
  saveWatchlist(list);
  renderTable();
}

function setWatchlistTier(playerId, tier) {
  var list = getWatchlist();
  var p = list.find(function(p) { return p.player_id === playerId; });
  if (p) { p.tier = parseInt(tier) || 0; saveWatchlist(list); }
}

function removeFromWatchlist(playerId) {
  var list = getWatchlist().filter(function(p) { return p.player_id !== playerId; });
  saveWatchlist(list);
}

// ─── Watchlist Cloud Sync (Pro+ users) ──────────────────────────
function syncWatchlistFromCloud() {
  var token = localStorage.getItem("razzle_token");
  if (!token) {
    _showWatchlistSyncHint(false);
    return;
  }

  var base = typeof API_BASE !== "undefined" ? API_BASE : "";
  fetch(base + "/api/user/watchlist", {
    headers: { "Authorization": "Bearer " + token }
  }).then(function(r) {
    if (r.status === 403) {
      // Free user — show upgrade hint
      _showWatchlistSyncHint(false);
      return null;
    }
    if (!r.ok) return null;
    return r.json();
  }).then(function(data) {
    if (!data || !data.watchlist) return;

    var serverList = data.watchlist;
    var localList = getWatchlist();

    // Merge: union by player_id, server wins on conflict
    var merged = {};
    for (var i = 0; i < localList.length; i++) {
      merged[localList[i].player_id] = localList[i];
    }
    for (var j = 0; j < serverList.length; j++) {
      var sp = serverList[j];
      merged[sp.player_id] = {
        player_id: sp.player_id,
        name: sp.player_name || (merged[sp.player_id] || {}).name || "",
        position: sp.position || "",
        team: sp.team || "",
        universe: sp.universe || "nfl",
        tier: (merged[sp.player_id] || {}).tier || 0,
        added_at: (merged[sp.player_id] || {}).added_at || Date.now()
      };
    }

    var mergedList = [];
    for (var pid in merged) {
      mergedList.push(merged[pid]);
    }

    // Save locally
    _watchlistCache = mergedList;
    _rebuildWatchlistSet();
    try { localStorage.setItem("razzle_watchlist", JSON.stringify(mergedList)); } catch(e) {}
    updateWatchlistBadge();

    // Push merged list back to server
    _pushWatchlistToServer(token, base, mergedList);

    // Refresh table if showing watchlist stars
    if (typeof renderTable === "function") renderTable();

    _showWatchlistSyncHint(true);
  }).catch(function() {
    _showWatchlistSyncHint(true);
  });
}

function _pushWatchlistToServer(token, base, list) {
  if (!list || !list.length) return;
  var payload = list.map(function(p) {
    return {
      player_id: p.player_id,
      player_name: p.name || "",
      position: p.position || "",
      team: p.team || "",
      universe: p.universe || "nfl"
    };
  });
  fetch(base + "/api/user/watchlist/sync", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": "Bearer " + token },
    body: JSON.stringify({ players: payload })
  }).catch(function() {});
}

function _pushWatchlistAfterChange() {
  var token = localStorage.getItem("razzle_token");
  if (!token) return;
  var base = typeof API_BASE !== "undefined" ? API_BASE : "";
  _pushWatchlistToServer(token, base, getWatchlist());
}

function _showWatchlistSyncHint(isPaid) {
  var btn = document.getElementById("watchlistBtn");
  if (!btn) return;
  var existing = document.getElementById("watchlistCloudBadge");
  if (existing) existing.remove();
  var badge = document.createElement("span");
  badge.id = "watchlistCloudBadge";
  badge.style.cssText = "font-family:var(--font-mono); font-size:8px; margin-left:6px; padding:1px 5px; border-radius:3px; vertical-align:middle;";
  if (isPaid) {
    badge.style.color = "var(--pos-qb)";
    badge.style.border = "2px solid var(--pos-qb)";
    badge.textContent = "synced";
  } else {
    badge.style.color = "var(--ink-light)";
    badge.style.border = "2px dashed var(--ink-faint)";
    badge.textContent = "local only";
  }
  btn.appendChild(badge);
}

function updateWatchlistBadge() {
  var btn = document.getElementById("watchlistBtn");
  if (!btn) return;
  var count = getWatchlist().length;
  btn.textContent = count > 0 ? "Watchlist (" + count + ")" : "Watchlist";
}

// ─── Player Tags (localStorage, cached in memory) ──────────────
const TAG_OPTIONS = {
  BUY:    { label: "BUY",    color: "var(--green)",  bg: "var(--green-light)" },
  SELL:   { label: "SELL",   color: "var(--red)",    bg: "var(--red-light)" },
  WATCH:  { label: "WATCH",  color: "var(--yellow)", bg: "var(--yellow-light)" },
  TARGET: { label: "TARGET", color: "var(--blue)",   bg: "var(--blue-light)" },
  AVOID:  { label: "AVOID",  color: "var(--purple)", bg: "var(--purple-light)" },
};

let _playerTagsCache = null;

function getPlayerTags() {
  if (_playerTagsCache !== null) return _playerTagsCache;
  try { _playerTagsCache = JSON.parse(localStorage.getItem("razzle_player_tags")) || {}; }
  catch(e) { _playerTagsCache = {}; }
  return _playerTagsCache;
}

function savePlayerTags(tags) {
  _playerTagsCache = tags;
  try { localStorage.setItem("razzle_player_tags", JSON.stringify(tags)); } catch(e) {}
  updateTagFilterBadge();
}

function getPlayerTag(playerId) {
  return getPlayerTags()[playerId] || null;
}

function setPlayerTag(playerId, tagName) {
  const tags = getPlayerTags();
  if (tagName && TAG_OPTIONS[tagName]) {
    tags[playerId] = tagName;
  } else {
    delete tags[playerId];
  }
  savePlayerTags(tags);
}

function clearAllTags() {
  savePlayerTags({});
  hideTagPicker();
  renderTable();
  _showToast("all tags cleared");
}

function getTaggedCount() {
  return Object.keys(getPlayerTags()).length;
}

function updateTagFilterBadge() {
  const btn = document.getElementById("tagFilterBtn");
  if (!btn) return;
  const count = getTaggedCount();
  const active = state.tagFilter;
  btn.textContent = active ? "Tagged (" + count + ")" : (count > 0 ? "Tags (" + count + ")" : "Tags");
  btn.style.background = active ? "var(--orange)" : "";
  btn.style.color = active ? "var(--bg-card)" : "";
}

// Tag picker popup
let _tagPickerVisible = false;

function showTagPicker(playerId, anchorEl) {
  let picker = document.getElementById("tagPicker");
  if (!picker) {
    picker = document.createElement("div");
    picker.id = "tagPicker";
    picker.className = "tag-picker";
    document.body.appendChild(picker);
  }

  const currentTag = getPlayerTag(playerId);
  let html = '<div class="tag-picker-title">Tag Player</div>';
  for (const [key, opt] of Object.entries(TAG_OPTIONS)) {
    const isActive = currentTag === key;
    html += `<button class="tag-picker-option${isActive ? " active" : ""}" `
      + `style="--tag-color:${opt.color}; --tag-bg:${opt.bg};" `
      + `onclick="onTagSelect('${escapeJS(playerId)}', '${isActive ? "" : key}')">`
      + `<span class="tag-picker-dot" style="background:${opt.color};"></span>`
      + `${opt.label}</button>`;
  }
  if (currentTag) {
    html += `<button class="tag-picker-option tag-picker-clear" onclick="onTagSelect('${escapeJS(playerId)}', '')">Remove Tag</button>`;
  }
  picker.innerHTML = html;

  // Position near anchor
  const rect = anchorEl.getBoundingClientRect();
  let top = rect.bottom + 4;
  let left = rect.left;
  picker.style.display = "block";
  const pw = picker.offsetWidth || 140;
  const ph = picker.offsetHeight || 200;
  if (left + pw > window.innerWidth - 12) left = window.innerWidth - pw - 12;
  if (left < 12) left = 12;
  if (top + ph > window.innerHeight - 12) top = rect.top - ph - 4;
  picker.style.top = top + "px";
  picker.style.left = left + "px";
  _tagPickerVisible = true;

  // Close on outside click (once)
  setTimeout(function() {
    document.addEventListener("click", _closeTagPickerOutside, { once: true });
  }, 0);
}

function _closeTagPickerOutside(e) {
  const picker = document.getElementById("tagPicker");
  if (picker && !picker.contains(e.target)) {
    hideTagPicker();
  } else if (picker) {
    // Re-attach if clicked inside
    document.addEventListener("click", _closeTagPickerOutside, { once: true });
  }
}

function hideTagPicker() {
  const picker = document.getElementById("tagPicker");
  if (picker) picker.style.display = "none";
  _tagPickerVisible = false;
}

function onTagSelect(playerId, tagName) {
  setPlayerTag(playerId, tagName);
  hideTagPicker();
  renderTable();
}

function toggleTagFilter() {
  state.tagFilter = !state.tagFilter;
  updateTagFilterBadge();
  fetchAndRender();
}

function buildTagChip(playerId) {
  const tag = getPlayerTag(playerId);
  if (!tag || !TAG_OPTIONS[tag]) return "";
  const opt = TAG_OPTIONS[tag];
  return ` <span class="player-tag-chip" style="background:${opt.bg}; color:${opt.color}; border-color:${opt.color};">${opt.label}</span>`;
}

// ─── Player Notes (localStorage, cached in memory) ─────────────
let _playerNotesCache = null;

function getPlayerNotes() {
  if (_playerNotesCache !== null) return _playerNotesCache;
  try { _playerNotesCache = JSON.parse(localStorage.getItem("razzle_player_notes")) || {}; }
  catch(e) { _playerNotesCache = {}; }
  return _playerNotesCache;
}

function savePlayerNotes(notes) {
  _playerNotesCache = notes;
  try { localStorage.setItem("razzle_player_notes", JSON.stringify(notes)); } catch(e) {}
}

function getPlayerNote(playerId) {
  return getPlayerNotes()[playerId] || "";
}

function setPlayerNote(playerId, text) {
  const notes = getPlayerNotes();
  const trimmed = (text || "").trim().substring(0, 140);
  if (trimmed) {
    notes[playerId] = trimmed;
  } else {
    delete notes[playerId];
  }
  savePlayerNotes(notes);
}

let _noteEditorVisible = false;
let _noteEditorPlayerId = null;

function showNoteEditor(playerId, anchorEl) {
  hideNoteEditor();
  _noteEditorPlayerId = playerId;
  _noteEditorVisible = true;

  const existing = getPlayerNote(playerId);
  const player = state.items.find(p => p.player_id === playerId);
  const name = player ? escapeHtml(player.full_name) : escapeHtml(playerId);

  let editor = document.getElementById("noteEditor");
  if (!editor) {
    editor = document.createElement("div");
    editor.id = "noteEditor";
    editor.className = "note-editor-popup";
    document.body.appendChild(editor);
  }

  editor.innerHTML = `<div class="note-editor-title">${escapeHtml(name)}</div>`
    + `<textarea class="note-editor-input" id="noteEditorInput" maxlength="140" placeholder="Add a note... (140 chars)">${escapeHtml(existing)}</textarea>`
    + `<div class="note-editor-footer">`
    + `<span class="note-editor-count" id="noteCharCount">${existing.length}/140</span>`
    + `<div style="display:flex; gap:6px;">`
    + `<button class="btn-chunky note-editor-clear" onclick="clearPlayerNote('${escapeJS(playerId)}')" style="font-size:10px; padding:3px 8px; ${existing ? '' : 'display:none;'}">Clear</button>`
    + `<button class="btn-primary note-editor-save" onclick="saveNoteFromEditor()" style="font-size:10px; padding:3px 10px;">Save</button>`
    + `</div></div>`;

  // Position near anchor
  const rect = anchorEl.getBoundingClientRect();
  editor.style.display = "block";
  editor.style.top = (rect.bottom + 6) + "px";
  editor.style.left = Math.max(12, Math.min(rect.left, window.innerWidth - 280)) + "px";

  // Focus and char count
  const input = document.getElementById("noteEditorInput");
  input.focus();
  input.selectionStart = input.selectionEnd = input.value.length;
  input.addEventListener("input", function() {
    const ct = document.getElementById("noteCharCount");
    if (ct) ct.textContent = this.value.length + "/140";
  });
  input.addEventListener("keydown", function(e) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); saveNoteFromEditor(); }
    if (e.key === "Escape") { e.stopPropagation(); hideNoteEditor(); }
  });

  // Close on outside click (delayed to avoid immediate close)
  setTimeout(function() {
    document.addEventListener("click", _closeNoteEditorOutside, { once: true });
  }, 50);
}

function _closeNoteEditorOutside(e) {
  const editor = document.getElementById("noteEditor");
  if (editor && !editor.contains(e.target)) {
    hideNoteEditor();
  } else if (editor) {
    document.addEventListener("click", _closeNoteEditorOutside, { once: true });
  }
}

function hideNoteEditor() {
  const editor = document.getElementById("noteEditor");
  if (editor) editor.style.display = "none";
  _noteEditorVisible = false;
  _noteEditorPlayerId = null;
}

function saveNoteFromEditor() {
  const input = document.getElementById("noteEditorInput");
  if (!input || !_noteEditorPlayerId) return;
  setPlayerNote(_noteEditorPlayerId, input.value);
  hideNoteEditor();
  renderTable();
}

function clearPlayerNote(playerId) {
  setPlayerNote(playerId, "");
  hideNoteEditor();
  renderTable();
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
  pass_ypg:        { label: "Pass Yds/G", group: "Per Game", decimals: 1, derived: true },
  rush_ypg:        { label: "Rush Yds/G", group: "Per Game", decimals: 1, derived: true },
  rec_ypg:         { label: "Rec Yds/G",  group: "Per Game", decimals: 1, derived: true },
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
  pos_rank:            { label: "Pos Rank", tip: "Positional Rank — rank within position by current sort", group: "Fantasy", decimals: 0, isText: true, derived: true },

  // Core fantasy
  fantasy_points_ppr:  { label: "PPR",     tip: "PPR points — the scoring format fantasy lives and dies by", group: "Fantasy", decimals: 1 },
  ppg:                 { label: "PPG",      tip: "PPR points per game. The great equalizer.", group: "Fantasy", decimals: 1 },
  fantasy_points_std:  { label: "Standard", tip: "Standard Fantasy Points — non-PPR scoring total", group: "Fantasy", decimals: 1 },
  fantasy_points_half_ppr: { label: "Half-PPR", tip: "Half-PPR Fantasy Points — 0.5 PPR scoring total", group: "Fantasy", decimals: 1 },
  half_ppr_ppg:        { label: "HPPR/G",   tip: "Half-PPR Per Game — half-PPR points per game", group: "Fantasy", decimals: 1, derived: true },
  ppfd:                { label: "PPFD",     tip: "Points Per First Down — PPR + 1pt per first down (rushing + receiving + passing)", group: "Fantasy", decimals: 1, derived: true },
  ppfd_per_game:       { label: "PPFD/G",   tip: "PPFD Per Game — points per first down scoring per game", group: "Fantasy", decimals: 1, derived: true },
  games:               { label: "GP",       tip: "Games Played", group: "Fantasy", decimals: 0 },
  seasons:             { label: "Seasons",  tip: "Number of NFL seasons with stats", group: "Fantasy", decimals: 0 },

  // Passing
  passing_yards:       { label: "Pass Yds",   tip: "Passing Yards — total passing yards", group: "Passing", decimals: 0 },
  passing_tds:         { label: "Pass TD",    tip: "Passing Touchdowns", group: "Passing", decimals: 0 },
  completions:         { label: "CMP",        tip: "Completions — completed passes", group: "Passing", decimals: 0 },
  attempts:            { label: "ATT",        tip: "Pass Attempts", group: "Passing", decimals: 0 },
  interceptions:       { label: "INT",        tip: "Interceptions Thrown", group: "Passing", decimals: 0 },
  passing_air_yards:   { label: "Air Yds",    tip: "Passing Air Yards — intended yards through the air", group: "Passing", decimals: 0 },
  passing_first_downs: { label: "Pass 1st",   tip: "Passing First Downs", group: "Passing", decimals: 0 },
  sacks_taken:         { label: "Sacks",      tip: "Sacks Taken — times sacked", group: "Passing", decimals: 0 },
  sack_yards_lost:     { label: "Sack Yds",   tip: "Sack Yards Lost", group: "Passing", decimals: 0 },

  // Rushing
  rushing_yards:       { label: "Rush Yds",  tip: "Rushing Yards — total rushing yards", group: "Rushing", decimals: 0 },
  rushing_tds:         { label: "Rush TD",   tip: "Rushing Touchdowns", group: "Rushing", decimals: 0 },
  carries:             { label: "CAR",       tip: "Carries — rushing attempts", group: "Rushing", decimals: 0 },
  rushing_first_downs: { label: "Rush 1st",  tip: "Rushing First Downs", group: "Rushing", decimals: 0 },

  // Receiving
  receiving_yards:     { label: "Rec Yds",   tip: "Receiving Yards — total receiving yards", group: "Receiving", decimals: 0 },
  receiving_tds:       { label: "Rec TD",    tip: "Receiving Touchdowns", group: "Receiving", decimals: 0 },
  receptions:          { label: "REC",       tip: "Receptions — total catches", group: "Receiving", decimals: 0 },
  targets:             { label: "TGT",       tip: "Targets — times targeted by a pass", group: "Receiving", decimals: 0 },
  receiving_air_yards: { label: "Rec Air",   tip: "Receiving Air Yards — intended air yards on targets", group: "Receiving", decimals: 0 },
  receiving_yards_after_catch: { label: "YAC", tip: "Yards After Catch — yards gained after reception", group: "Receiving", decimals: 0 },
  receiving_first_downs: { label: "Rec 1st", tip: "Receiving First Downs", group: "Receiving", decimals: 0 },
  adot:                { label: "aDOT",      tip: "How deep the average target is. High = field stretcher. Low = underneath guy.", group: "Receiving", decimals: 1, derived: true },

  // Totals
  touchdowns:          { label: "TD",        tip: "Total Touchdowns — all scoring TDs", group: "Totals", decimals: 0 },
  turnovers:           { label: "TO",        tip: "Turnovers — interceptions + fumbles lost", group: "Totals", decimals: 0 },
  fumbles:             { label: "FUM",       tip: "Total Fumbles", group: "Totals", decimals: 0 },
  fumbles_lost:        { label: "FUM Lost",  tip: "Fumbles Lost — fumbles recovered by opponent", group: "Totals", decimals: 0 },

  // Efficiency (derived from aggregates — sort only, no SQL filter)
  yards_per_carry:     { label: "Y/CAR",    tip: "Yards per carry. Simple but tells you a lot.", group: "Efficiency", decimals: 1, derived: true },
  yards_per_rec:       { label: "Y/REC",    tip: "Yards Per Reception — receiving yards / receptions", group: "Efficiency", decimals: 1, derived: true },
  yards_per_target:    { label: "Y/TGT",    tip: "Yards Per Target — receiving yards / targets", group: "Efficiency", decimals: 1, derived: true },
  catch_rate:          { label: "Catch%",   tip: "How often he catches what's thrown his way.", group: "Efficiency", decimals: 1, derived: true },
  comp_pct:            { label: "CMP%",     tip: "Completion Percentage — completions / attempts", group: "Efficiency", decimals: 1, derived: true },
  yards_per_att:       { label: "Y/ATT",    tip: "Yards Per Attempt — passing yards / attempts", group: "Efficiency", decimals: 1, derived: true },
  passer_rating:       { label: "Rating",   tip: "The NFL's official QB formula. 158.3 is perfect. Good luck.", group: "Efficiency", decimals: 1, derived: true },
  ay_per_att:          { label: "AY/A",     tip: "Adjusted Yards Per Attempt — (pass yds + 20\u00d7TD - 45\u00d7INT) / ATT", group: "Efficiency", decimals: 1, derived: true },
  td_rate:             { label: "TD%",      tip: "TD Rate — touchdowns / (carries + targets) as percentage", group: "Efficiency", decimals: 1, derived: true },
  fumble_rate:         { label: "FUM%",     tip: "Fumble Rate — fumbles lost / (carries + receptions) as percentage", group: "Efficiency", decimals: 1, derived: true },
  snap_share:          { label: "Snap%",    tip: "How much time he spends on the field. More snaps = more opportunity.", group: "Efficiency", decimals: 1, derived: true },
  yprr:                { label: "YPRR*",    tip: "Yards earned per route run. The best efficiency stat for receivers. (*estimated from snap counts)", group: "Efficiency", decimals: 2, derived: true },

  // Per-game averages (derived — sort only)
  rec_per_game:        { label: "REC/G",    tip: "Receptions Per Game", group: "Per Game", decimals: 1, derived: true },
  targets_per_game:    { label: "TGT/G",    tip: "Targets Per Game", group: "Per Game", decimals: 1, derived: true },
  rush_ypg:            { label: "Rush Yds/G", tip: "Rushing Yards Per Game", group: "Per Game", decimals: 1, derived: true },
  rec_ypg:             { label: "Rec Yds/G",  tip: "Receiving Yards Per Game", group: "Per Game", decimals: 1, derived: true },
  pass_ypg:            { label: "Pass Yds/G", tip: "Passing Yards Per Game", group: "Per Game", decimals: 1, derived: true },
  wopr_per_game:       { label: "WOPR/G",    tip: "WOPR Per Game — weighted opportunity rating per game played", group: "Per Game", decimals: 3, derived: true },

  // Advanced (from nflverse rate stats — sort only)
  target_share:        { label: "TGT%",     tip: "What slice of the team's targets this player eats.", group: "Advanced", decimals: 1, pct: true, derived: true },
  air_yards_share:     { label: "AirYd%",   tip: "Share of the team's air yards. How much of the passing game flows through him.", group: "Advanced", decimals: 1, pct: true, derived: true },
  wopr:                { label: "WOPR",     tip: "How much of the passing game runs through this player. The volume king stat.", group: "Advanced", decimals: 3, derived: true },
  racr:                { label: "RACR",     tip: "Yards gained per air yard thrown his way. Efficiency in the air.", group: "Advanced", decimals: 2, derived: true },
  passing_epa:         { label: "Pass EPA", tip: "Passing EPA — expected points added per game (passing)", group: "Advanced", decimals: 1, derived: true },
  receiving_epa:       { label: "Rec EPA",  tip: "Receiving EPA — expected points added per game (receiving)", group: "Advanced", decimals: 1, derived: true },
  rushing_epa:         { label: "Rush EPA", tip: "Rushing EPA — expected points added per game (rushing)", group: "Advanced", decimals: 1, derived: true },
  dakota:              { label: "DAKOTA",   tip: "EPA + completion magic combined. The nerd stat for QB evaluation.", group: "Advanced", decimals: 3, derived: true },
  cpoe:                { label: "CPOE",     tip: "How much better (or worse) than expected this QB completes passes.", group: "Advanced", decimals: 1, derived: true },
  epa_per_play:        { label: "EPA/Play", tip: "Points added per play. The ultimate efficiency number.", group: "Advanced", decimals: 3, derived: true },

  // Breakout detection
  breakout_pct:        { label: "BRK%",    tip: "Biggest single-year leap in PPR points. Late bloomers show up here.", group: "Breakout", decimals: 1, derived: true },

  // Play-by-play derived (from player_season_pbp)
  pass_success_rate:   { label: "Pass Succ%", tip: "How often passing plays gain expected value. The efficient passer check.", group: "Advanced", decimals: 3, derived: true },
  rush_success_rate:   { label: "Rush Succ%", tip: "How often rush plays gain expected value. Quality over quantity.", group: "Advanced", decimals: 3, derived: true },
  avg_score_differential: { label: "Game Script", tip: "Average game script. Positive = playing with the lead. Affects play calling.", group: "Advanced", decimals: 1, derived: true },
  garbage_time_pct:    { label: "Garb%",    tip: "Plays in blowouts. High = stat padding. Buyer beware.", group: "Advanced", decimals: 3, derived: true },
  scramble_attempts:   { label: "Scram Att", tip: "Scramble Attempts — QB scramble plays (classified as runs)", group: "Passing", decimals: 0, derived: true },
  scramble_yards:      { label: "Scram Yds", tip: "Scramble Yards — yards gained on QB scrambles", group: "Passing", decimals: 0, derived: true },
  scramble_tds:        { label: "Scram TD",  tip: "Scramble Touchdowns", group: "Passing", decimals: 0, derived: true },
  gl_carries:          { label: "GL Carries", tip: "Carries inside the 5. The money zone for RBs.", group: "Rushing", decimals: 0, derived: true },
  gl_targets:          { label: "GL Targets", tip: "Targets inside the 5. Red zone trust.", group: "Receiving", decimals: 0, derived: true },
  gl_tds:              { label: "GL TD",     tip: "TDs inside the 5. Cashing in where it counts.", group: "Rushing", decimals: 0, derived: true },
  intended_air_yards_per_target: { label: "IAY/TGT", tip: "How deep they're throwing to him on all targets. The real aDOT.", group: "Receiving", decimals: 1, derived: true },
  drop_rate:           { label: "Drop%",    tip: "Estimated drops per target. Stone hands or reliable? (*estimated)", group: "Receiving", decimals: 3, derived: true },
  return_yards:        { label: "Ret Yds",  tip: "Return Yards — kickoff + punt return yards", group: "General", decimals: 0, derived: true },
  return_tds:          { label: "Ret TD",   tip: "Return Touchdowns — kickoff + punt return TDs", group: "General", decimals: 0, derived: true },
  two_point_conversions: { label: "2PT",    tip: "Two-Point Conversions — successful two-point conversion plays", group: "General", decimals: 0, derived: true },
  bye_week:            { label: "Bye",      tip: "Bye Week — team's bye week number", group: "General", decimals: 0, derived: true },
  games_missed:        { label: "Missed",   tip: "Games Missed — weeks with Out/IR/Doubtful designation", group: "General", decimals: 0, derived: true },

  // Team shares (derived from team aggregates — sort only)
  dominator_rating:    { label: "DOM",     tip: "How much of the offense he owns. High = alpha receiver.", group: "Dynasty", decimals: 1, pct: true, derived: true },
  rush_share:          { label: "Rush%",   tip: "What percentage of the team's carries he gets. Bellcow indicator.", group: "Efficiency", decimals: 1, derived: true },

  // Dynasty value
  dynasty_value:       { label: "DVS",     tip: "Dynasty value adjusted for age. Higher = more valuable for your future.", group: "Dynasty", decimals: 1, derived: true },
  age:                 { label: "Age",     tip: "Player age (current)", group: "Dynasty", decimals: 0 },

  // Sparkline trend
  trend:               { label: "Trend",   tip: "Weekly fantasy points trend — sparkline showing scoring arc across the season", group: "Fantasy", decimals: 0, derived: true, isSparkline: true },

  // Player notes
  notes:               { label: "Notes",   tip: "Your personal notes on this player — click to edit", group: "Notes", decimals: null, isText: true, derived: true, isNotes: true },
};

// ─── Tier lock mapping (visual only, does not block access) ──────
// Pro features: full historical data, career mode, roster grading, cloud sync
// Elite features: exclusive advanced metrics, Situation Room AI
const PRO_LOCKED_COLUMNS = new Set([
  "seasons", "breakout_pct", "dominator_rating", "rush_share",
  "snap_share", "yprr", "games_missed",
]);
const ELITE_LOCKED_COLUMNS = new Set([
  "dakota", "cpoe", "epa_per_play", "pass_success_rate", "rush_success_rate",
  "garbage_time_pct", "avg_score_differential", "drop_rate",
]);

function _getTierLockClass(key) {
  if (ELITE_LOCKED_COLUMNS.has(key)) return "elite-locked";
  if (PRO_LOCKED_COLUMNS.has(key)) return "pro-locked";
  return "";
}

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
              "completions", "attempts", "interceptions", "passer_rating", "ay_per_att",
              "passing_air_yards", "scramble_attempts", "scramble_yards"],
  },
  rushing: {
    label: "Rushing",
    columns: ["fantasy_points_ppr", "ppg", "games", "rushing_yards", "rushing_tds",
              "carries", "gl_carries", "gl_tds", "rush_success_rate",
              "receiving_yards", "receptions", "targets"],
  },
  receiving: {
    label: "Receiving",
    columns: ["fantasy_points_ppr", "ppg", "games", "receiving_yards", "receiving_tds",
              "receptions", "targets", "receiving_air_yards", "receiving_yards_after_catch",
              "intended_air_yards_per_target", "drop_rate"],
  },
  dynasty: {
    label: "Dynasty",
    columns: ["dynasty_value", "age", "trend", "fantasy_points_ppr", "ppg", "games", "seasons", "breakout_pct",
              "dominator_rating", "receiving_yards", "receiving_tds", "rushing_yards", "rushing_tds", "touchdowns"],
  },
  dynasty_rankings: {
    label: "Dynasty Rankings",
    columns: ["dynasty_value", "age", "ppg", "games", "fantasy_points_ppr",
              "passing_yards", "rushing_yards", "receiving_yards", "touchdowns"],
  },
  efficiency: {
    label: "Efficiency",
    columns: ["fantasy_points_ppr", "ppg", "games", "yards_per_carry", "yards_per_rec",
              "yards_per_target", "catch_rate", "comp_pct", "yards_per_att", "passer_rating",
              "ay_per_att", "td_rate", "fumble_rate", "yprr", "target_share"],
  },
  advanced: {
    label: "Advanced",
    columns: ["fantasy_points_ppr", "ppg", "games", "pass_success_rate", "rush_success_rate",
              "avg_score_differential", "garbage_time_pct", "target_share", "wopr",
              "receiving_epa", "passing_epa", "rushing_epa"],
  },
};

// ─── State ───────────────────────────────────────────────────────
const state = {
  universe: (function() {
    try {
      var u = localStorage.getItem('razzle_universe');
      if (u === 'prospects') return 'college'; // legacy: merged into college
      return u;
    } catch(e) { return null; }
  })() || "nfl", // "nfl" or "college"
  position: "ALL",
  search: "",
  season: 0,
  week: 0, // 0 = all weeks (season aggregate), 1-18 = specific week
  availableWeeks: [], // populated from /api/available-weeks
  relevance: "fantasy",
  sortKey: "fantasy_points_ppr",
  sortDir: "desc",
  sortKey2: "",
  sortDir2: "desc",
  limit: 25,
  offset: 0,
  filters: [],
  teams: [],    // selected team abbreviations for team filter
  minGP: 0,     // minimum games played filter
  visibleColumns: [...PRESETS.ppr.columns],
  items: [],
  totalCount: 0,
  seasons: [],
  selectedPlayers: [], // for compare/charts [{player_id, full_name, position, team}]
  heatColors: false, // percentile heat coloring toggle
  percentileMode: (function() { try { return localStorage.getItem("razzle_percentile_mode") === "1"; } catch(e) { return false; } })(), // show percentile values instead of raw
  dataBars: (function() { try { return localStorage.getItem("razzle_data_bars") === "1"; } catch(e) { return false; } })(), // inline data bars toggle
  leaderBadges: (function() { try { return localStorage.getItem("razzle_leader_badges") === "1"; } catch(e) { return false; } })(), // stat leader dot indicators
  density: (function() { try { return localStorage.getItem("razzle_density") === "1"; } catch(e) { return false; } })(), // compact density mode
  tierBreaks: (function() { try { return localStorage.getItem("razzle_tier_breaks") === "1"; } catch(e) { return false; } })(), // tier break dividers
  groupHeaders: (function() { try { return localStorage.getItem("razzle_group_headers") !== "0"; } catch(e) { return true; } })(), // column group headers (on by default)
  summaryBar: (function() { try { return localStorage.getItem("razzle_summary_bar") === "1"; } catch(e) { return false; } })(), // stats summary bar (off by default)
  tagFilter: false, // show only tagged players
  diffMode: false, // pin comparison diff mode: show deltas from first pinned player
  pinnedPlayers: (function() {
    try { return JSON.parse(localStorage.getItem('razzle_pinned_players')) || []; }
    catch(e) { return []; }
  })(), // pinned player IDs for sticky comparison rows
  columnWidths: (function() { try { return JSON.parse(localStorage.getItem('razzle_col_widths')) || {}; } catch(e) { return {}; } })(), // user-resized column widths {key: px}
  formulas: [], // user custom formulas [{name, components: [{stat, weight}]}]
  // College-specific state (includes prospect sub-view)
  collegeView: (function() {
    try {
      var u = localStorage.getItem('razzle_universe');
      if (u === 'prospects') return 'prospects'; // legacy migration
      return localStorage.getItem('razzle_college_view') || 'stats';
    } catch(e) { return 'stats'; }
  })(), // "stats" or "prospects"
  draftYear: 0,
  draftYears: [],
  prospectColumns: [...PROSPECT_PRESETS.combine.columns],
  collegeSeason: 0,
  collegeSeasons: [],
  collegeColumns: [...COLLEGE_PRESETS.production.columns],
};

// Helper: is the user viewing prospect data (within college universe)?
function isProspectView() {
  return state.universe === "college" && state.collegeView === "prospects";
}

// ─── Undo / Redo History ──────────────────────────────────────────
const _history = { stack: [], index: -1, maxSize: 30, _skipNext: false };

function _captureState() {
  return JSON.stringify({
    position: state.position, season: state.season, universe: state.universe,
    relevance: state.relevance, search: state.search, week: state.week,
    sortKey: state.sortKey, sortDir: state.sortDir,
    sortKey2: state.sortKey2, sortDir2: state.sortDir2,
    filters: state.filters, teams: state.teams, minGP: state.minGP,
    visibleColumns: state.visibleColumns,
    collegeView: state.collegeView, draftYear: state.draftYear,
    collegeSeason: state.collegeSeason,
    collegeColumns: state.collegeColumns,
    prospectColumns: state.prospectColumns,
  });
}

function _pushHistory() {
  if (_history._skipNext) { _history._skipNext = false; return; }
  const snap = _captureState();
  // Don't push if identical to current
  if (_history.index >= 0 && _history.stack[_history.index] === snap) return;
  // Truncate any redo entries ahead of current index
  _history.stack = _history.stack.slice(0, _history.index + 1);
  _history.stack.push(snap);
  if (_history.stack.length > _history.maxSize) _history.stack.shift();
  _history.index = _history.stack.length - 1;
  _syncUndoRedoButtons();
}

function _restoreState(snap) {
  var s; try { s = JSON.parse(snap); } catch(e) { return; }
  if (!s) return;
  state.position = s.position; state.season = s.season; state.universe = s.universe;
  state.relevance = s.relevance; state.search = s.search; state.week = s.week || 0;
  state.sortKey = s.sortKey; state.sortDir = s.sortDir;
  state.sortKey2 = s.sortKey2 || ""; state.sortDir2 = s.sortDir2 || "desc";
  state.filters = s.filters || []; state.teams = s.teams || []; state.minGP = s.minGP || 0;
  state.visibleColumns = s.visibleColumns || [];
  state.collegeView = s.collegeView || "stats";
  state.draftYear = s.draftYear || 0; state.collegeSeason = s.collegeSeason || 0;
  state.collegeColumns = s.collegeColumns || [];
  state.prospectColumns = s.prospectColumns || [];
  state.offset = 0;
  // Sync UI controls
  const searchInput = document.getElementById("searchInput");
  if (searchInput) searchInput.value = state.search || "";
  renderTeamChips();
  const minGPInput = document.getElementById("minGPInput");
  if (minGPInput) minGPInput.value = state.minGP || "";
  renderActiveFilters();
  populateFilterStatSelect();
}

function undoState() {
  if (_history.index <= 0) return;
  _history.index--;
  _history._skipNext = true;
  _restoreState(_history.stack[_history.index]);
  _syncUndoRedoButtons();
  fetchAndRender();
  const left = _history.index;
  _showToast("undo" + (left > 0 ? " (" + left + " left)" : ""));
}

function redoState() {
  if (_history.index >= _history.stack.length - 1) return;
  _history.index++;
  _history._skipNext = true;
  _restoreState(_history.stack[_history.index]);
  _syncUndoRedoButtons();
  fetchAndRender();
  _showToast("redo");
}

function _syncUndoRedoButtons() {
  const undoBtn = document.getElementById("undoBtn");
  const redoBtn = document.getElementById("redoBtn");
  if (undoBtn) undoBtn.disabled = _history.index <= 0;
  if (redoBtn) redoBtn.disabled = _history.index >= _history.stack.length - 1;
}

// ─── Init ────────────────────────────────────────────────────────
(async function init() {
  // Load formulas BEFORE URL state so formula columns exist when visibleColumns are restored
  loadFormulas();
  loadCustomScoringColumns();
  loadStateFromURL();

  // Dynamic year fallbacks (shared by try + catch)
  const _curYear = new Date().getFullYear();
  const _nflYear = new Date().getMonth() >= 8 ? _curYear : _curYear - 1;

  // Load NFL, prospect, and college options in parallel
  try {
    const [nflOpts, prospectOpts, collegeOpts] = await Promise.all([
      apiFetch("/api/filter-options").catch(function(err) {
        console.error("Failed to load NFL filter options:", err);
        var labContent = document.getElementById("labContent") || document.querySelector(".lab-main");
        if (labContent) {
          labContent.innerHTML = '<div style="text-align:center;padding:40px;font-family:var(--font-mono);color:var(--orange);font-size:15px;border:3px solid var(--ink);background:var(--bg-card);border-radius:8px;margin:24px;">' + razzleError() + '</div>';
        }
        return { seasons: [], teams: [], positions: [] };
      }),
      apiFetch("/api/prospect-options").catch(() => ({ years: [], schools: [], positions: [] })),
      apiFetch("/api/college/filter-options").catch(() => ({ seasons: [], teams: [], conferences: [], positions: [] })),
    ]);

    state.seasons = nflOpts.seasons || [_nflYear];
    if (!state.season && state.season !== "career") state.season = state.seasons[0] || _nflYear;

    if (state.seasons.length === 0) {
      _showToast("no seasons loaded yet — film room might still be warming up");
    }

    state.draftYears = prospectOpts.years || [_curYear];
    if (!state.draftYear) state.draftYear = state.draftYears[0] || _curYear;

    state.collegeSeasons = collegeOpts.seasons || [_nflYear];
    if (!state.collegeSeason) state.collegeSeason = state.collegeSeasons[0] || _nflYear;

    populateSeasonSelect();
    populateWeekSelect();
    populateFilterStatSelect();
    populateTeamFilter();
  } catch (e) {
    console.error("Failed to load filter options:", e);
    state.season = _nflYear;
  }

  // Sync team/minGP UI from URL state
  renderTeamChips();
  if (state.minGP > 0) {
    const inp = document.getElementById("minGPInput");
    if (inp) inp.value = state.minGP;
  }

  // First-visit hint: single onboarding toast (merged, works with URL params)
  var hasVisited = (function() { try { return localStorage.getItem("razzle_lab_visited"); } catch(e) { return "1"; } })();
  if (!hasVisited) {
    try { localStorage.setItem("razzle_lab_visited", "1"); localStorage.setItem("razzle_shortcuts_shown", "1"); } catch(e) {}
    setTimeout(function() {
      var toast = document.createElement("div");
      toast.className = "razzle-onboarding-toast";
      toast.innerHTML = 'Filter by position above, explore panels in the sidebar \u2014 press <kbd>?</kbd> for shortcuts';
      toast.onclick = function() { toast.classList.remove("razzle-onboarding-show"); setTimeout(function() { toast.remove(); }, 300); };
      document.body.appendChild(toast);
      setTimeout(function() { toast.classList.add("razzle-onboarding-show"); }, 10);
      setTimeout(function() { toast.classList.remove("razzle-onboarding-show"); setTimeout(function() { toast.remove(); }, 300); }, 8000);
    }, 1500);
    // Lab nudge tooltip — show after first-visit toast
    var nudgeShown = (function() { try { return localStorage.getItem("razzle_lab_nudge_shown"); } catch(e) { return "1"; } })();
    if (!nudgeShown) {
      setTimeout(function() {
        var nudge = document.createElement("div");
        nudge.style.cssText = "position:fixed;bottom:80px;right:20px;background:var(--bg-card);border:3px solid var(--ink);border-radius:12px;padding:12px 16px;font-family:var(--font-hand);font-size:16px;color:var(--ink);box-shadow:4px 4px 0 var(--ink);z-index:100;transform:rotate(-1deg);cursor:pointer;max-width:260px;";
        nudge.innerHTML = 'try sorting by <strong style="color:var(--orange);">Target Share</strong> — the usage trend is where the value hides';
        nudge.onclick = function() {
          nudge.remove();
          localStorage.setItem("razzle_lab_nudge_shown", "1");
          if (typeof sortBy === "function") sortBy("target_share");
        };
        document.body.appendChild(nudge);
        setTimeout(function() { if (nudge.parentNode) nudge.remove(); }, 12000);
        localStorage.setItem("razzle_lab_nudge_shown", "1");
      }, 5000);
    }
  }

  applyUniverseUI();
  renderColumnPicker();
  renderPresets();
  populatePresetSelect();
  populateSavedViewSelect();
  updateWatchlistBadge();
  updateTagFilterBadge();
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
// ─── Screener query cache (LRU, 5 entries, 5-min TTL) ───────────
var _queryCache = [];  // [{key, data, ts}]
var _QUERY_CACHE_MAX = 5;
var _QUERY_CACHE_TTL = 300000; // 5 minutes

function _queryCacheGet(key) {
  var now = Date.now();
  for (var i = 0; i < _queryCache.length; i++) {
    if (_queryCache[i].key === key) {
      if (now - _queryCache[i].ts > _QUERY_CACHE_TTL) {
        _queryCache.splice(i, 1);
        return null;
      }
      // Move to end (most recently used)
      var entry = _queryCache.splice(i, 1)[0];
      _queryCache.push(entry);
      return entry.data;
    }
  }
  return null;
}

function _queryCachePut(key, data) {
  // Remove existing entry with same key
  for (var i = 0; i < _queryCache.length; i++) {
    if (_queryCache[i].key === key) { _queryCache.splice(i, 1); break; }
  }
  _queryCache.push({ key: key, data: data, ts: Date.now() });
  if (_queryCache.length > _QUERY_CACHE_MAX) _queryCache.shift();
}

function _queryCacheClear() {
  _queryCache = [];
}

// ─── Request deduplication ────────────────────────────────────────
let _fetchController = null;
let _fetchId = 0;

async function fetchAndRender() {
  _pushHistory();
  if (_fetchController) _fetchController.abort();
  _fetchController = new AbortController();
  const myId = ++_fetchId;
  const signal = _fetchController.signal;

  if (isProspectView()) {
    return fetchAndRenderProspects(signal, myId);
  }
  if (state.universe === "college") {
    return fetchAndRenderCollege(signal, myId);
  }
  return fetchAndRenderNFL(signal, myId);
}

async function fetchAndRenderNFL(signal, myId) {
  const loading = document.getElementById("loadingMsg");
  const tbody = document.getElementById("tableBody");
  if (!loading || !tbody) return;
  loading.style.display = "block";
  _resetLoadingSkeleton(loading);

  const positions = state.position === "ALL"
    ? (state.relevance === "fantasy" ? ["QB", "RB", "WR", "TE"] : [])
    : [state.position];

  // When tagFilter is active, fetch ALL matching players so client-side
  // tag filtering + pagination is consistent (no empty pages or wrong counts)
  const useTagFilter = state.tagFilter;
  const body = {
    search: state.search,
    positions: positions,
    season: state.season,
    week: state.week || 0,
    sort_key: state.sortKey,
    sort_direction: state.sortDir,
    limit: useTagFilter ? 1000 : state.limit,
    offset: useTagFilter ? 0 : state.offset,
    filters: state.filters,
    relevance: state.relevance,
    teams: state.teams,
    min_gp: state.minGP,
  };

  try {
    const bodyJson = JSON.stringify(body);
    const cacheKey = bodyJson;
    var data = _queryCacheGet(cacheKey);

    if (!data) {
      const fetchOpts = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: bodyJson,
      };
      if (signal) fetchOpts.signal = signal;
      data = await apiFetch("/api/screener/query", fetchOpts);
      _queryCachePut(cacheKey, data);
    }

    if (myId !== _fetchId) return; // stale response

    // Clear table only after successful fetch — preserves previous data on error
    tbody.innerHTML = "";

    // Deep-clone items to prevent mutations from corrupting the cache
    state.items = (data.items || []).map(function(p) { return Object.assign({}, p); });
    state.totalCount = data.count || 0;
    state.season = data.season || state.season;

    computeFormulaValues();
    computeCustomScoringValues();
    computePosRanks();
    // Apply tag filter (client-side) then paginate locally
    if (useTagFilter) {
      const tags = getPlayerTags();
      const allTagged = state.items.filter(p => tags[p.player_id]);
      state.totalCount = allTagged.length;
      state.items = allTagged.slice(state.offset, state.offset + state.limit);
    }
    applySecondarySort();
    _lastFetchTime = Date.now();
    loading.style.display = "none";
    renderTable();
    renderPagination();
    updateResultCount();
    saveStateToURL();
  } catch (e) {
    if (e.name === 'AbortError') return;
    loading.style.display = "none";
    _showToast(typeof getErrorText === 'function' ? getErrorText('screener') : 'fumbled the data fetch... try again');
    // Keep previous table data visible — don't clear tbody
    renderTable();
    updateResultCount();
  }
}

async function fetchAndRenderProspects(signal, myId) {
  const loading = document.getElementById("loadingMsg");
  const tbody = document.getElementById("tableBody");
  if (!loading || !tbody) return;
  loading.style.display = "block";
  _resetLoadingSkeleton(loading);

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
    const fetchOpts = {};
    if (signal) fetchOpts.signal = signal;
    const data = await apiFetch(`/api/prospects?${params}`, fetchOpts);

    if (myId !== _fetchId) return; // stale response

    tbody.innerHTML = "";
    state.items = data.items || [];
    state.totalCount = data.count || 0;
    state.draftYear = data.draft_year || state.draftYear;

    applySecondarySort();
    _lastFetchTime = Date.now();
    loading.style.display = "none";
    renderTable();
    renderPagination();
    updateResultCount();
    saveStateToURL();
  } catch (e) {
    if (e.name === 'AbortError') return;
    loading.style.display = "none";
    _showToast(typeof getErrorText === 'function' ? getErrorText('screener') : 'fumbled the prospect fetch... try again');
    renderTable();
    updateResultCount();
  }
}

async function fetchAndRenderCollege(signal, myId) {
  const loading = document.getElementById("loadingMsg");
  const tbody = document.getElementById("tableBody");
  if (!loading || !tbody) return;
  loading.style.display = "block";
  _resetLoadingSkeleton(loading);

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
    const fetchOpts = {};
    if (signal) fetchOpts.signal = signal;
    const data = await apiFetch(`/api/college/players?${params}`, fetchOpts);

    if (myId !== _fetchId) return; // stale response

    tbody.innerHTML = "";
    state.items = data.items || [];
    state.totalCount = data.count || 0;
    state.collegeSeason = data.season || state.collegeSeason;

    applySecondarySort();
    _lastFetchTime = Date.now();
    loading.style.display = "none";
    renderTable();
    renderPagination();
    updateResultCount();
    saveStateToURL();
  } catch (e) {
    if (e.name === 'AbortError') return;
    loading.style.display = "none";
    _showToast(typeof getErrorText === 'function' ? getErrorText('screener') : 'fumbled the college data fetch... try again');
    renderTable();
    updateResultCount();
  }
}

// ─── Table rendering ─────────────────────────────────────────────
function renderTable() {
  if (isProspectView()) {
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
  renderSummaryBar();
}

function getActiveColumns() {
  if (isProspectView()) return state.prospectColumns;
  if (state.universe === "college") return state.collegeColumns;
  return state.visibleColumns;
}

function getColumnDef(key) {
  if (isProspectView()) return PROSPECT_COLUMNS[key];
  if (state.universe === "college") return COLLEGE_COLUMNS[key];
  return COLUMNS[key];
}

function renderNFLTable() {
  renderTableHead();
  renderTableBody();
  renderPinnedRows();
  renderSummaryBar();
  // Load sparklines async (non-blocking)
  if (getActiveColumns().includes("trend")) {
    loadScreenerSparklines();
  }
}

function buildGroupHeaderRow(cols) {
  if (!state.groupHeaders) return "";
  // Build consecutive group spans from visible columns
  const groups = [];
  let lastGroup = null;
  for (const key of cols) {
    const col = getColumnDef(key);
    if (!col) continue;
    const g = col.group || "Other";
    if (g === lastGroup) {
      groups[groups.length - 1].span++;
    } else {
      groups.push({ name: g, span: 1 });
      lastGroup = g;
    }
  }
  // Only show if 2+ distinct groups
  const uniqueGroups = new Set(groups.map(g => g.name));
  if (uniqueGroups.size < 2) return "";
  // Utility columns: star + checkbox + (pin if NFL) + rank = 3 or 4, plus Player column
  const utilCols = state.universe === "nfl" ? 4 : 3;
  let html = '<tr class="group-header-row">';
  html += `<th class="group-cell-player" colspan="${utilCols + 1}"></th>`;
  let first = true;
  for (const g of groups) {
    const sepCls = first ? "" : " group-sep";
    html += `<th colspan="${g.span}" class="${sepCls}" style="cursor:pointer;" onclick="toggleColumnGroup('${escapeJS(g.name)}')" title="Click to toggle all ${escapeHtml(g.name)} columns">${escapeHtml(g.name)}</th>`;
    first = false;
  }
  html += '<th style="width:32px;"></th>'; // spacer for "+" column
  html += "</tr>";
  return html;
}

function renderTableHead() {
  const thead = document.getElementById("tableHead");
  const cols = getActiveColumns();

  const nameKey = (isProspectView() || state.universe === "college") ? "player_name" : "full_name";

  // Group header row
  let html = buildGroupHeaderRow(cols);

  const allSelected = state.items.length > 0 && state.items.every(p => state.selectedPlayers.some(s => s.player_id === (p.player_id || p.player_name)));
  html += '<tr><th scope="col" class="col-star" style="width:28px; text-align:center; padding:8px 4px;" title="Watchlist">&#9733;</th>';
  html += `<th scope="col" class="col-select" style="width:30px; text-align:center; padding:8px 6px;" title="Select all / none"><input type="checkbox" ${allSelected ? "checked" : ""} onchange="toggleSelectAll(this.checked)" style="accent-color:var(--orange); width:15px; height:15px; cursor:pointer;"></th>`;
  if (state.universe === "nfl") {
    const pinCount = state.pinnedPlayers.length;
    const pinTitle = pinCount > 0 ? `${pinCount} pinned — click to clear` : "Pin players to top";
    html += `<th scope="col" class="col-pin" style="width:28px; text-align:center; padding:8px 2px; cursor:${pinCount ? 'pointer' : 'default'}; font-size:12px;" title="${pinTitle}"${pinCount ? ' onclick="clearAllPins()"' : ''}><span class="pin-icon${pinCount ? ' pin-active' : ''}"></span>${pinCount ? '<span style="font-size:9px; color:var(--orange); font-weight:700;"> ' + pinCount + '</span>' : ''}</th>`;
  }
  html += '<th scope="col" class="col-rank" title="Overall rank by current sort">#</th>';
  html += `<th scope="col" class="col-player" onclick="sortBy('${nameKey}', event)">Player`;
  if (state.sortKey === "full_name" || state.sortKey === "player_name") {
    html += state.sortDir === "asc" ? " &#9650;" : " &#9660;";
  } else if (state.sortKey2 === "full_name" || state.sortKey2 === "player_name") {
    html += ' <span style="opacity:0.4; font-size:10px;">' + (state.sortDir2 === "asc" ? "&#9650;" : "&#9660;") + "2</span>";
  }
  html += "</th>";

  for (const key of cols) {
    const col = getColumnDef(key);
    if (!col) continue;
    const sortCls = state.sortKey === key ? `sort-${state.sortDir}` : state.sortKey2 === key ? `sort2-${state.sortDir2}` : "";
    const lockCls = _getTierLockClass(key);
    const cls = [sortCls, lockCls].filter(Boolean).join(" ");
    const tierLabel = lockCls === "elite-locked" ? " [Elite]" : lockCls === "pro-locked" ? " [Pro]" : "";
    // Build tooltip with optional column stats + agent attribution
    let tipText = col.tip || col.label;
    if (tierLabel) tipText += tierLabel;
    var colAgent = typeof getColumnAgent === 'function' ? getColumnAgent(key) : null;
    if (colAgent) tipText += '\n' + colAgent.name + ' \u2014 ' + colAgent.role;
    if (!col.isText && !col.isSparkline && !col.isNotes && state.items.length > 0) {
      const vals = [];
      for (const p of state.items) { const v = parseFloat(p[key]); if (!isNaN(v)) vals.push(v); }
      if (vals.length > 0) {
        const dec = col.decimals != null ? col.decimals : 1;
        const mn = vals.reduce((a, b) => a < b ? a : b, vals[0]).toFixed(dec);
        const mx = vals.reduce((a, b) => a > b ? a : b, vals[0]).toFixed(dec);
        const av = (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(dec);
        tipText += `\nMin: ${mn}  Avg: ${av}  Max: ${mx}  (${vals.length} players)`;
      }
    }
    const tip = ` title="${escapeAttr(tipText)}"`;
    let extra = "";
    if (key === "dynasty_value") {
      extra = ` <span class="dvs-info" onclick="event.stopPropagation(); toggleDVSInfo()" title="Click for DVS methodology" style="cursor:help; font-size:10px; opacity:0.6;">&#9432;</span>`;
    }
    // Filter indicator dot
    var filterInfo = _getColumnFilterInfo(key);
    if (filterInfo) {
      extra += ` <span class="col-filter-dot" title="Filtered: ${escapeAttr(filterInfo)}">&#9679;</span>`;
    }
    var cw = state.columnWidths[key];
    var cwStyle = cw ? `width:${cw}px; min-width:${cw}px; max-width:${cw}px;` : "";
    var dragAttr = ' draggable="true" ondragstart="_colDragStart(event)" ondragover="_colDragOver(event)" ondrop="_colDrop(event)" ondragend="_colDragEnd(event)"';
    if (col.isSparkline) {
      html += `<th scope="col"${tip} data-col="${key}"${dragAttr} style="${cwStyle || 'width:80px;'} text-align:center;">${col.label}<div class="col-resize-handle" data-col="${key}"></div></th>`;
    } else if (col.isNotes) {
      html += `<th scope="col"${tip} data-col="${key}"${dragAttr} style="${cwStyle || 'width:120px; min-width:80px;'}">${col.label}<div class="col-resize-handle" data-col="${key}"></div></th>`;
    } else {
      html += `<th scope="col" class="${cls}"${tip} data-col="${key}"${dragAttr} style="${cwStyle}" tabindex="0" onclick="sortBy('${key}', event)" ondblclick="openFilterForColumn('${key}')" onkeydown="if(event.key==='Enter'){sortBy('${key}');event.preventDefault();}">${col.label}${extra}<div class="col-resize-handle" data-col="${key}"></div></th>`;
    }
  }

  // Quick add column button
  html += `<th style="width:32px; text-align:center; padding:4px; cursor:pointer; font-size:16px; color:var(--ink-light); border-bottom:3px solid var(--ink);" onclick="openColumnPicker()" title="Add/remove columns (C)">+</th>`;

  html += "</tr>";
  thead.innerHTML = html;
  _initColResizeHandles();
}

// ─── Column drag resize ──────────────────────────────────────────
var _colResize = { active: false, key: null, startX: 0, startW: 0 };

function _initColResizeHandles() {
  var handles = document.querySelectorAll(".col-resize-handle");
  for (var i = 0; i < handles.length; i++) {
    handles[i].removeEventListener("mousedown", _onColResizeStart);
    handles[i].removeEventListener("dblclick", _onColResizeReset);
    handles[i].addEventListener("mousedown", _onColResizeStart);
    handles[i].addEventListener("dblclick", _onColResizeReset);
  }
}

function _onColResizeReset(e) {
  e.preventDefault();
  e.stopPropagation();
  var key = e.target.dataset.col;
  delete state.columnWidths[key];
  var ths = document.querySelectorAll('th[data-col="' + key + '"]');
  for (var i = 0; i < ths.length; i++) {
    ths[i].style.width = "";
    ths[i].style.minWidth = "";
    ths[i].style.maxWidth = "";
  }
  try { localStorage.setItem("razzle_col_widths", JSON.stringify(state.columnWidths)); } catch(e) {}
}

function _onColResizeStart(e) {
  e.preventDefault();
  e.stopPropagation();
  var key = e.target.dataset.col;
  var th = e.target.parentElement;
  _colResize.active = true;
  _colResize.key = key;
  _colResize.startX = e.clientX;
  _colResize.startW = th.offsetWidth;
  document.addEventListener("mousemove", _onColResizeMove);
  document.addEventListener("mouseup", _onColResizeEnd);
  document.body.style.cursor = "col-resize";
  document.body.style.userSelect = "none";
}

function _onColResizeMove(e) {
  if (!_colResize.active) return;
  var delta = e.clientX - _colResize.startX;
  var newW = Math.max(40, _colResize.startW + delta);
  state.columnWidths[_colResize.key] = newW;
  // Apply to all cells in this column
  var ths = document.querySelectorAll('th[data-col="' + _colResize.key + '"]');
  for (var i = 0; i < ths.length; i++) {
    ths[i].style.width = newW + "px";
    ths[i].style.minWidth = newW + "px";
    ths[i].style.maxWidth = newW + "px";
  }
}

function _onColResizeEnd() {
  if (!_colResize.active) return;
  _colResize.active = false;
  document.removeEventListener("mousemove", _onColResizeMove);
  document.removeEventListener("mouseup", _onColResizeEnd);
  document.body.style.cursor = "";
  document.body.style.userSelect = "";
  try { localStorage.setItem("razzle_col_widths", JSON.stringify(state.columnWidths)); } catch(e) {}
}

// ─── Column drag reorder ─────────────────────────────────────────
var _colDragKey = null;

function _colDragStart(e) {
  // Don't start drag from resize handle
  if (e.target.classList.contains("col-resize-handle")) { e.preventDefault(); return; }
  var th = e.target.closest("th[data-col]");
  if (!th) return;
  _colDragKey = th.dataset.col;
  e.dataTransfer.effectAllowed = "move";
  e.dataTransfer.setData("text/plain", _colDragKey);
  th.classList.add("col-dragging");
}

function _colDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = "move";
  var th = e.target.closest("th[data-col]");
  if (th && th.dataset.col !== _colDragKey) {
    // Remove previous drop targets
    var prev = document.querySelectorAll(".col-drag-over");
    for (var i = 0; i < prev.length; i++) prev[i].classList.remove("col-drag-over");
    th.classList.add("col-drag-over");
  }
}

function _colDrop(e) {
  e.preventDefault();
  var th = e.target.closest("th[data-col]");
  if (!th || !_colDragKey || th.dataset.col === _colDragKey) return;
  var targetKey = th.dataset.col;
  var cols = _getActiveColumnArray();
  var fromIdx = cols.indexOf(_colDragKey);
  var toIdx = cols.indexOf(targetKey);
  if (fromIdx === -1 || toIdx === -1) return;
  cols.splice(fromIdx, 1);
  cols.splice(toIdx, 0, _colDragKey);
  _setActiveColumnArray(cols);
  renderTableHead();
  renderTableBody();
  saveStateToURL();
}

function _colDragEnd(e) {
  _colDragKey = null;
  var els = document.querySelectorAll(".col-dragging, .col-drag-over");
  for (var i = 0; i < els.length; i++) els[i].classList.remove("col-dragging", "col-drag-over");
}

function _getActiveColumnArray() {
  if (isProspectView()) return state.prospectColumns;
  if (state.universe === "college") return state.collegeColumns;
  return state.visibleColumns;
}

function _setActiveColumnArray(arr) {
  if (isProspectView()) { state.prospectColumns = arr; return; }
  if (state.universe === "college") { state.collegeColumns = arr; return; }
  state.visibleColumns = arr;
}

// ─── Virtual scrolling ──────────────────────────────────────────
function getVScrollRowHeight() { return state.density ? 26 : 36; }
const VSCROLL_BUFFER = 20;
let _vscrollRows = [];   // Sparse array: lazily-built HTML strings per row
let _vscrollRAF = null;  // requestAnimationFrame handle
let _vscrollBound = false;
let _vscrollRenderCtx = null; // Cached render context for lazy row building

function buildRowHTML(player, cols, heatOn, pctData, rowIdx, barsOn, pctMode, leaderRanks, colDefMap) {
  const pos = (player.position || "").toUpperCase();
  const playKey = player.player_id || player.player_name;
  const selected = _selectedSet.has(playKey);
  const starred = isOnWatchlist(playKey);
  const pName = escapeAttr(player.full_name || player.player_name || "");
  const pTeam = escapeAttr(player.team || player.school || "");
  const posStripeColor = pos === "QB" ? "var(--pos-qb)" : pos === "RB" ? "var(--pos-rb)" : pos === "WR" ? "var(--pos-wr)" : pos === "TE" ? "var(--pos-te)" : "var(--ink-faint)";
  const zebraBg = (rowIdx != null && rowIdx % 2 === 1) ? " background:var(--zebra-stripe, rgba(45,31,20,0.025));" : "";
  let html = '<tr tabindex="0" data-player-id="' + escapeAttr(playKey) + '" style="height:' + getVScrollRowHeight() + 'px; border-left:3px solid ' + posStripeColor + ';' + zebraBg + '">';
  html += `<td class="col-star" data-pid="${escapeAttr(playKey)}" data-pname="${escapeAttr(player.full_name || player.player_name || '')}" data-pos="${escapeAttr(pos)}" data-team="${escapeAttr(player.team || player.school || '')}" data-universe="${escapeAttr(state.universe)}" style="text-align:center; padding:7px 4px; cursor:pointer; font-size:16px;" title="${starred ? 'Remove from watchlist' : 'Add to watchlist'}">${starred ? '<span style="color:var(--orange);">&#9733;</span>' : '<span style="color:var(--ink-faint);">&#9734;</span>'}</td>`;
  html += `<td class="col-select" style="text-align:center; padding:7px 6px;">
    <input type="checkbox" ${selected ? "checked" : ""} onchange="togglePlayerSelect('${escapeJS(player.player_id || player.player_name)}', this.checked)"
      style="accent-color:${state.universe === 'college' ? 'var(--pos-qb)' : 'var(--orange)'}; width:15px; height:15px; cursor:pointer;">
  </td>`;

  // Pin icon (NFL only)
  if (state.universe === "nfl") {
    const pinned = isPlayerPinned(playKey);
    html += `<td class="pin-cell col-pin" style="text-align:center; padding:7px 2px; cursor:pointer;" onclick="event.stopPropagation(); togglePinPlayer('${escapeJS(playKey)}')" title="${pinned ? 'Unpin player' : 'Pin to top'}"><span class="pin-icon ${pinned ? 'pin-active' : 'pin-faint'}"></span></td>`;
  }

  // Rank column (with expand arrow for NFL — skip on pinned rows where rowIdx is null)
  const rank = (rowIdx != null) ? (state.offset + rowIdx + 1) : "";
  if (state.universe === "nfl" && player.player_id && rowIdx != null) {
    html += `<td class="col-rank" style="cursor:pointer;" onclick="event.stopPropagation(); toggleRowExpand('${escapeJS(player.player_id)}', this)" title="Click to expand weekly stats"><span class="row-expand-arrow" style="font-size:8px; margin-right:2px;">&#9654;</span>${rank}</td>`;
  } else {
    html += `<td class="col-rank">${rank}</td>`;
  }

  if (state.universe === "college") {
    const cid = escapeJS(player.player_id || "");
    html += `<td class="col-player"><div class="player-name-cell">`;
    html += playerHeadshot(player, pos);
    html += `<span class="pos-badge ${posClass(pos)}">${escapeHtml(pos)}</span>`;
    html += `<a href="#" onclick="openCollegeProfile('${cid}'); return false;" style="color:var(--ink); text-decoration:none; border-bottom:2px dashed var(--pos-qb);">${_highlightSearch(escapeHtml(player.player_name))}</a>`;
    html += `<span class="team-label">${escapeHtml(player.team)}</span>`;
    if (player.conference) html += `<span class="school-label" style="font-size:10px; color:var(--ink-light);">${escapeHtml(player.conference)}</span>`;
    html += `</div></td>`;
  } else if (isProspectView()) {
    const pn = escapeAttr(player.player_name || "");
    const pPos = (player.position || "").toUpperCase();
    const pYear = player.draft_year || state.season;
    html += `<td class="col-player"><div class="player-name-cell">`;
    html += playerHeadshot(player, pos);
    html += `<span class="pos-badge ${posClass(pos)}">${escapeHtml(pos)}</span>`;
    html += `<a href="#" class="prospect-link" data-name="${pn}" data-pos="${escapeAttr(pPos)}" data-year="${pYear}" style="color:var(--ink); text-decoration:none; border-bottom:2px dashed var(--pos-qb);">${_highlightSearch(escapeHtml(player.player_name))}</a>`;
    html += `<span class="school-label">${escapeHtml(player.school)}</span>`;
    html += `</div></td>`;
  } else {
    const pid = escapeAttr(player.player_id || "");
    const pidJS = escapeJS(player.player_id || "");
    html += `<td class="col-player"><div class="player-name-cell">`;
    html += playerHeadshot(player, pos);
    html += `<span class="pos-badge ${posClass(pos)}">${escapeHtml(pos)}</span>`;
    html += `<a href="/player/${encodeURIComponent(pid)}" onclick="event.preventDefault(); openPlayerProfile('${pidJS}');" onmouseenter="onPlayerNameEnter('${pidJS}', this)" onmouseleave="onPlayerNameLeave()" style="color:var(--ink); text-decoration:none; border-bottom:2px dashed var(--ink-faint);">${_highlightSearch(escapeHtml(player.full_name))}</a>`;
    html += buildTagChip(pid);
    html += `<span class="tag-icon" onclick="event.stopPropagation(); showTagPicker('${pidJS}', this)" title="Tag player">&#9679;</span>`;
    html += `<span class="team-label">${escapeHtml(player.team)}</span>`;
    if (player.age) {
      var ageVal = Math.floor(player.age);
      var ageCls = ageVal <= 24 ? "age-young" : ageVal <= 27 ? "age-prime" : ageVal <= 29 ? "age-aging" : "age-vet";
      html += `<span class="age-badge ${ageCls}" title="Age ${ageVal}">${ageVal}</span>`;
    }
    html += `</div></td>`;
  }

  const heatPcts = heatOn ? (pctData[playKey] || {}) : null;
  const pctPcts = pctMode ? (pctData[playKey] || {}) : null;
  const diffBaseline = _getDiffBaseline(); // cached per row, not per cell

  for (const key of cols) {
    const col = colDefMap ? colDefMap.get(key) : getColumnDef(key);
    if (!col) continue;
    let val = player[key];
    // Sparkline column: render placeholder cell for async fill
    if (col.isSparkline) {
      const sid = player.player_id || player.player_name || "";
      html += `<td class="sparkline-cell" data-sparkline-pid="${escapeAttr(sid)}"><span class="sparkline-placeholder"></span></td>`;
      continue;
    }
    // Notes column: inline editable
    if (col.isNotes) {
      const pid = player.player_id || player.player_name || "";
      const note = getPlayerNote(pid);
      if (note) {
        html += `<td class="notes-cell has-note" onclick="event.stopPropagation(); showNoteEditor('${escapeJS(pid)}', this)" title="${escapeAttr(note)}"><span class="note-text">${escapeHtml(note)}</span></td>`;
      } else {
        html += `<td class="notes-cell" onclick="event.stopPropagation(); showNoteEditor('${escapeJS(pid)}', this)" title="Click to add note"><span class="note-pencil">&#9998;</span></td>`;
      }
      continue;
    }
    // Diff mode: show delta from baseline instead of raw value
    if (diffBaseline && playKey !== diffBaseline.player_id && !col.isText) {
      const diffHtml = _formatDiffCell(val, diffBaseline[key], col, key);
      if (diffHtml !== null) {
        html += '<td>' + diffHtml + '</td>';
        continue;
      }
      // null means non-numeric — fall through to normal render
    }

    // Leader dot for top 3 values in this column
    const ldrRank = leaderRanks && leaderRanks[key] ? (leaderRanks[key][playKey] || 0) : 0;
    const ldrDot = ldrRank ? getLeaderDot(ldrRank) : "";

    const hBg = heatPcts && heatPcts[key] != null ? getHeatColor(heatPcts[key]) : "";
    const isSortCol = key === state.sortKey;
    const isSort2Col = key === state.sortKey2;
    const sc = isSortCol && !hBg && !barsOn ? "sort-col" : isSort2Col && !hBg && !barsOn ? "sort2-col" : "";
    // Data bar gradient (takes precedence over heat bg when active)
    let cellStyle = "";
    if (barsOn && val != null && typeof val === "number") {
      const bw = getBarWidth(key, val);
      if (bw > 0) {
        const barColor = INVERSE_STATS.has(key) ? "rgba(230,57,70,0.13)" : "rgba(217,119,87,0.18)";
        cellStyle = `background:linear-gradient(90deg, ${barColor} ${bw}%, transparent ${bw}%);`;
      }
    } else if (hBg) {
      cellStyle = `background:${hBg};`;
    }
    const hStyle = cellStyle ? ` style="${cellStyle}"` : "";
    const scAttr = sc ? ` class="${sc}"` : "";
    if ((isProspectView() || state.universe === "college") && !col.isText && (val === 0 || val === null || val === undefined)) {
      html += `<td${scAttr} style="color:var(--ink-faint);">\u2014</td>`;
      continue;
    }
    if (state.universe === "nfl" && isNonApplicableStat(pos, key, val)) {
      html += `<td${scAttr} style="color:var(--ink-faint);">—</td>`;
    } else if (state.universe === "nfl" && !col.isText && !col.pct && !col.isRate && (val === 0 || val === null || val === undefined) && key !== "age" && key !== "games") {
      html += `<td${scAttr} style="color:var(--ink-faint);">—</td>`;
    } else if (col.isText) {
      html += `<td${scAttr}>${val ? escapeHtml(val) : "—"}</td>`;
    } else if (pctPcts && pctPcts[key] != null && key !== "age" && key !== "games" && key !== "dynasty_value") {
      // Percentile display mode: show position percentile instead of raw value
      const pv = Math.round(pctPcts[key]);
      const pctColor = pv >= 90 ? "var(--green)" : pv >= 75 ? "var(--pos-qb)" : pv <= 10 ? "var(--red)" : pv <= 25 ? "var(--ink-light)" : "";
      const pctFw = pv >= 75 || pv <= 25 ? "font-weight:700;" : "";
      const pctSty = (pctColor || pctFw) ? ` style="${pctColor ? "color:" + pctColor + ";" : ""}${pctFw}"` : "";
      html += `<td${scAttr}${hStyle}><span class="pctl-val"${pctSty} title="${formatStat(val, col.decimals != null ? col.decimals : 1)}">${pv}<sup style="font-size:8px; opacity:0.6;">%</sup></span></td>`;
    } else if (key === "dynasty_value" && typeof val === "number") {
      const dvsColor = val >= 85 ? "var(--green)" : val >= 70 ? "var(--pos-qb)" : val >= 55 ? "var(--orange)" : "var(--ink-light)";
      const dvsTier = val >= 85 ? "Elite" : val >= 70 ? "Star" : val >= 55 ? "Starter" : "";
      html += `<td${scAttr}${hStyle}>${ldrDot}<span style="background:${dvsColor}; color:var(--text-on-accent); padding:1px 8px; border-radius:var(--radius-sm); border:2px solid var(--ink); font-size:11px; font-weight:700; white-space:nowrap;">${val.toFixed(1)}${dvsTier ? " " + dvsTier : ""}</span></td>`;
    } else if (key === "age" && val != null) {
      html += `<td${scAttr} style="font-weight:600;">${ldrDot}${Math.round(val)}</td>`;
    } else if (key === "breakout_pct" && typeof val === "number" && val >= 50) {
      html += `<td${scAttr}${hStyle}>${ldrDot}<span style="background:var(--green); color:var(--text-on-accent); padding:1px 6px; border-radius:var(--radius-sm); border:2px solid var(--ink); font-size:11px; font-weight:700;">+${val.toFixed(0)}%</span></td>`;
    } else if (col.pct && val != null) {
      html += `<td${scAttr}${hStyle}>${ldrDot}${(val * 100).toFixed(col.decimals)}%</td>`;
    } else {
      html += `<td${scAttr}${hStyle}>${ldrDot}${formatStat(val, col.decimals)}</td>`;
    }
  }
  html += '<td style="width:32px;"></td>'; // spacer for "+" column
  html += "</tr>";
  return html;
}

function renderVisibleRows() {
  const tbody = document.getElementById("tableBody");
  const wrap = document.querySelector(".table-wrap");
  if (!wrap || !tbody || !_vscrollRows.length) return;

  const totalRows = _vscrollRows.length;
  const scrollTop = wrap.scrollTop;
  const viewHeight = wrap.clientHeight;
  const colCount = getActiveColumns().length + 5 + (state.universe === "nfl" ? 1 : 0); // +star +checkbox +rank +player (+pin if NFL) (+add column btn)

  // Calculate visible range with buffer
  const startRow = Math.max(0, Math.floor(scrollTop / getVScrollRowHeight()) - VSCROLL_BUFFER);
  const endRow = Math.min(totalRows, Math.ceil((scrollTop + viewHeight) / getVScrollRowHeight()) + VSCROLL_BUFFER);

  // Lazy build: only construct HTML for rows about to become visible
  if (_vscrollRenderCtx) {
    var ctx = _vscrollRenderCtx;
    // Build 10 extra rows above/below the visible+buffer range for smoother scrolling
    var lazyStart = Math.max(0, startRow - 10);
    var lazyEnd = Math.min(totalRows, endRow + 10);
    for (var li = lazyStart; li < lazyEnd; li++) {
      if (_vscrollRows[li] === undefined && state.items[li]) {
        _vscrollRows[li] = buildRowHTML(state.items[li], ctx.cols, ctx.heatOn, ctx.pctData, li, ctx.barsOn, ctx.pctMode, ctx.leaderRanks, ctx.colDefMap);
      }
    }
  }

  // Build HTML with spacer rows
  const topHeight = startRow * getVScrollRowHeight();
  const bottomHeight = (totalRows - endRow) * getVScrollRowHeight();

  let html = "";
  if (topHeight > 0) {
    html += '<tr style="height:' + topHeight + 'px;"><td colspan="' + colCount + '"></td></tr>';
  }
  for (let i = startRow; i < endRow; i++) {
    html += _vscrollRows[i] || '';
  }
  if (bottomHeight > 0) {
    html += '<tr style="height:' + bottomHeight + 'px;"><td colspan="' + colCount + '"></td></tr>';
  }
  tbody.innerHTML = html;
  // Re-inject sparklines for newly visible rows
  if (getActiveColumns().includes("trend") && Object.keys(_sparklineCache).length > 1) {
    injectSparklines();
  }
}

function onTableScroll() {
  if (_vscrollRAF) return;
  _vscrollRAF = requestAnimationFrame(function() {
    _vscrollRAF = null;
    renderVisibleRows();
    // Header shadow + scroll-to-top toggle
    var wrap = document.querySelector(".table-wrap");
    if (!wrap) return;
    var scrolled = wrap.scrollTop > 0;
    var thead = document.getElementById("tableHead");
    if (thead) thead.classList.toggle("thead-shadow", scrolled);
    var btn = document.getElementById("scrollTopBtn");
    if (btn) btn.style.display = wrap.scrollTop > 200 ? "" : "none";
  });
}

function renderTableBody() {
  _expandedRows = {};
  const tbody = document.getElementById("tableBody");
  const cols = getActiveColumns();
  const emptyMsg = typeof getEmptyText === 'function' ? getEmptyText('screener') : razzleEmpty();

  if (!state.items.length) {
    _vscrollRows = [];
    _vscrollRenderCtx = null;
    var hasFilters = state.filters.length > 0 || state.search || state.teams.length > 0 || state.minGP > 0;
    var hint = hasFilters
      ? 'try loosening your filters or <a href="#" onclick="resetAllFilters(); return false;" style="color:var(--orange); text-decoration:underline; cursor:pointer;">reset all filters</a>'
      : 'try a different position or season';
    tbody.innerHTML = `<tr><td colspan="99" style="text-align:center; padding:50px 20px;">
      <div style="font-size:36px; margin-bottom:8px;">🐅</div>
      <div style="font-family:var(--font-hand); font-size:24px; color:var(--ink-medium); margin-bottom:6px;">${emptyMsg}</div>
      <div style="font-family:var(--font-mono); font-size:12px; color:var(--ink-light);">${hint}</div>
    </td></tr>`;
    return;
  }

  // Rebuild lookup sets for O(1) checks in buildRowHTML
  _rebuildSelectedSet();
  _rebuildWatchlistSet();

  // Pre-compute render context (shared across all rows)
  const heatOn = state.heatColors;
  const pctMode = state.percentileMode;
  const pctData = (heatOn || pctMode) ? computePercentiles() : {};
  const barsOn = state.dataBars;
  if (barsOn) computeBarMaxes();
  const leadersOn = state.leaderBadges && !state.percentileMode;
  const leaderRanks = leadersOn ? computeLeaderRanks() : {};

  // Task 5: Cache column definitions for all active columns
  var colDefMap = new Map();
  for (var ci = 0; ci < cols.length; ci++) {
    var cd = getColumnDef(cols[ci]);
    if (cd) colDefMap.set(cols[ci], cd);
  }

  // Task 1: Lazy virtual scroll — sparse array, build rows on demand
  var totalItems = state.items.length;
  _vscrollRows = new Array(totalItems);
  _vscrollRenderCtx = { cols: cols, heatOn: heatOn, pctData: pctData, barsOn: barsOn, pctMode: pctMode, leaderRanks: leaderRanks, colDefMap: colDefMap };

  // If tier breaks enabled, pre-build ALL rows (tier breaks change indices)
  if (state.tierBreaks && state.universe === "nfl") {
    for (var ti = 0; ti < totalItems; ti++) {
      _vscrollRows[ti] = buildRowHTML(state.items[ti], cols, heatOn, pctData, ti, barsOn, pctMode, leaderRanks, colDefMap);
    }
    _vscrollRows = insertTierBreakRows(_vscrollRows, cols);
    _vscrollRenderCtx = null; // disable lazy building when tier breaks active
  }

  // Bind scroll handler once
  if (!_vscrollBound) {
    const wrap = document.querySelector(".table-wrap");
    if (wrap) {
      wrap.addEventListener("scroll", onTableScroll, { passive: true });
      _vscrollBound = true;
    }
  }

  // Render visible rows (builds lazily for non-tier-break mode)
  renderVisibleRows();
}

// ─── Sparkline loading (async, non-blocking) ──────────────────
let _sparklineCache = {};  // pid -> [pts...]
let _sparklineAbort = null;

function loadScreenerSparklines() {
  // Collect player IDs from current items
  const ids = state.items
    .map(p => p.player_id)
    .filter(Boolean)
    .slice(0, 200);
  if (!ids.length) return;

  // Cancel previous in-flight request
  if (_sparklineAbort) _sparklineAbort.abort();
  _sparklineAbort = new AbortController();

  // Check which IDs are already cached for this season
  const season = state.season || 0;
  const cacheKey = `${season}`;
  if (_sparklineCache._season !== cacheKey) {
    _sparklineCache = { _season: cacheKey };
  }
  const needed = ids.filter(id => !(id in _sparklineCache));

  if (!needed.length) {
    // All cached, just inject
    injectSparklines();
    return;
  }

  fetch(API_BASE + "/api/screener/sparklines", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ player_ids: needed, season: season || 0 }),
    signal: _sparklineAbort.signal,
  })
    .then(r => r.ok ? r.json() : Promise.reject(new Error("sparkline fetch failed")))
    .then(data => {
      const sp = data.sparklines || {};
      for (const pid in sp) _sparklineCache[pid] = sp[pid];
      injectSparklines();
    })
    .catch(err => {
      if (err.name !== "AbortError") {
        // Silent fail — sparklines are cosmetic
      }
    });
}

function injectSparklines() {
  const cells = document.querySelectorAll(".sparkline-cell[data-sparkline-pid]");
  for (const cell of cells) {
    const pid = cell.getAttribute("data-sparkline-pid");
    const pts = _sparklineCache[pid];
    if (!pts || !pts.length) {
      cell.innerHTML = '<span style="color:var(--ink-faint); font-size:10px;">—</span>';
      continue;
    }
    cell.innerHTML = buildSparklineSVG(pts);
  }
}

function buildSparklineSVG(pts) {
  if (!pts || !pts.length) return '';
  const w = 72, h = 22, pad = 2;
  const max = Math.max(...pts, 1);
  const min = Math.min(...pts, 0);
  const range = max - min || 1;
  const step = (w - pad * 2) / Math.max(pts.length - 1, 1);

  const points = pts.map((v, i) => {
    const x = pad + i * step;
    const y = pad + (1 - (v - min) / range) * (h - pad * 2);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");

  // Trend: compare average of last 4 weeks vs first 4 weeks
  const last4 = pts.slice(-4);
  const first4 = pts.slice(0, 4);
  const avgLast = last4.length ? last4.reduce((a, b) => a + b, 0) / last4.length : 0;
  const avgFirst = first4.length ? first4.reduce((a, b) => a + b, 0) / first4.length : 0;
  const color = avgLast >= avgFirst ? "var(--green)" : "var(--orange)";

  // End dot
  const lastX = (pad + (pts.length - 1) * step).toFixed(1);
  const lastY = (pad + (1 - (pts[pts.length - 1] - min) / range) * (h - pad * 2)).toFixed(1);

  return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" style="display:block;">` +
    `<polyline points="${points}" fill="none" stroke="${color}" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round"/>` +
    `<circle cx="${lastX}" cy="${lastY}" r="2" fill="${color}"/>` +
    `</svg>`;
}

// ─── Player Hover Card ─────────────────────────────────────────
let _hoverTimer = null;
let _hoverCardVisible = false;

function showHoverCard(playerId, anchorEl) {
  const card = document.getElementById("playerHoverCard");
  if (!card) return;

  // Find player in state.items
  const player = state.items.find(p => p.player_id === playerId);
  if (!player) return;

  const pos = (player.position || "").toUpperCase();
  const posColors = { QB: "var(--pos-qb)", RB: "var(--pos-rb)", WR: "var(--pos-wr)", TE: "var(--pos-te)" };
  const posColor = posColors[pos] || "var(--ink)";

  // Build card HTML
  let html = '<div class="hover-card-header">';
  if (player.headshot_url) {
    html += `<img class="hover-card-headshot" src="${escapeAttr(player.headshot_url)}" alt="${escapeAttr(player.full_name || '')}" onerror="this.style.display='none';">`;
  }
  html += '<div>';
  html += `<div class="hover-card-name">${escapeHtml(player.full_name || "")}${buildTagChip(playerId)}</div>`;
  html += `<div class="hover-card-meta">`;
  html += `<span class="pos-badge ${posClass(pos)}" style="font-size:9px; padding:1px 5px;">${escapeHtml(pos)}</span> `;
  html += `${escapeHtml(player.team || "FA")}`;
  if (player.age) html += ` · ${Math.floor(player.age)}y`;
  if (player.games) html += ` · ${player.games}gp`;
  html += `</div></div></div>`;

  // Stats row
  const ppg = player.ppg != null ? Number(player.ppg).toFixed(1) : "—";
  const fpts = player.fantasy_points_ppr != null ? Number(player.fantasy_points_ppr).toFixed(0) : "—";
  const dvs = player.dynasty_value != null ? Number(player.dynasty_value).toFixed(1) : "—";
  html += '<div class="hover-card-stats">';
  html += `<div class="hover-card-stat"><div class="hover-card-stat-value">${ppg}</div><div class="hover-card-stat-label">PPG</div></div>`;
  html += `<div class="hover-card-stat"><div class="hover-card-stat-value">${fpts}</div><div class="hover-card-stat-label">FPTS</div></div>`;
  html += `<div class="hover-card-stat"><div class="hover-card-stat-value" style="color:${posColor}">${dvs}</div><div class="hover-card-stat-label">DVS</div></div>`;
  html += '</div>';

  // Sparkline (from cache)
  const pts = _sparklineCache[playerId];
  if (pts && pts.length > 1) {
    html += '<div class="hover-card-sparkline">' + buildSparklineSVG(pts) + '</div>';
  }

  // Player note
  const hoverNote = getPlayerNote(playerId);
  if (hoverNote) {
    html += `<div class="hover-card-note"><span class="hover-card-note-icon">&#9998;</span> ${escapeHtml(hoverNote)}</div>`;
  }

  card.innerHTML = html;
  card.className = "hover-card" + (pos ? " pos-stripe-" + pos.toLowerCase() : "");

  // Position card near anchor
  const rect = anchorEl.getBoundingClientRect();
  let top = rect.bottom + 8;
  let left = rect.left;

  // Clamp to viewport
  const cw = card.offsetWidth || 260;
  const ch = card.offsetHeight || 160;
  if (left + cw > window.innerWidth - 12) left = window.innerWidth - cw - 12;
  if (left < 12) left = 12;
  if (top + ch > window.innerHeight - 12) top = rect.top - ch - 8;

  card.style.top = top + "px";
  card.style.left = left + "px";
  card.style.display = "block";
  // Trigger reflow then add visible class for animation
  card.offsetHeight;
  card.classList.add("visible");
  _hoverCardVisible = true;
}

function hideHoverCard() {
  clearTimeout(_hoverTimer);
  _hoverTimer = null;
  const card = document.getElementById("playerHoverCard");
  if (card) {
    card.classList.remove("visible");
    card.style.display = "none";
  }
  _hoverCardVisible = false;
}

function onPlayerNameEnter(playerId, el) {
  clearTimeout(_hoverTimer);
  _hoverTimer = setTimeout(function() {
    showHoverCard(playerId, el);
  }, 300);
}

function onPlayerNameLeave() {
  clearTimeout(_hoverTimer);
  // Small delay so user can move cursor to the hover card itself
  _hoverTimer = setTimeout(function() {
    if (_hoverCardVisible) hideHoverCard();
  }, 150);
}

function renderProspectTable() {
  renderTableHead();
  renderTableBody();
  renderSummaryBar();
}

// ─── Table keyboard navigation ──────────────────────────────────
(function() {
  var table = document.getElementById("screenerTable");
  if (!table) return;

  table.addEventListener("keydown", function(e) {
    var focused = document.activeElement;
    if (!focused || focused.tagName !== "TR") return;

    var tbody = document.getElementById("tableBody");
    if (!tbody) return;
    var rows = Array.from(tbody.querySelectorAll("tr[tabindex]"));
    var idx = rows.indexOf(focused);

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        if (idx < rows.length - 1) rows[idx + 1].focus();
        break;
      case "ArrowUp":
        e.preventDefault();
        if (idx > 0) rows[idx - 1].focus();
        else if (idx === 0) {
          // Focus first header
          var headers = table.querySelectorAll("th[tabindex]");
          if (headers.length) headers[0].focus();
        }
        break;
      case "Enter":
        e.preventDefault();
        // Click the player name link in this row
        var link = focused.querySelector("a[onclick]");
        if (link) link.click();
        break;
      case "Home":
        e.preventDefault();
        if (rows.length) rows[0].focus();
        break;
      case "End":
        e.preventDefault();
        if (rows.length) rows[rows.length - 1].focus();
        break;
    }
  });
})();

// ─── Row highlight on click ──────────────────────────────────────
(function() {
  var tbody = document.getElementById("tableBody");
  if (!tbody) return;
  tbody.addEventListener("click", function(e) {
    // Skip clicks on interactive elements
    var tag = e.target.tagName;
    if (tag === "A" || tag === "INPUT" || tag === "BUTTON" || tag === "SELECT") return;
    if (e.target.closest("a, input, button, .pin-cell, .col-star, .tag-picker-popup, .note-editor-popup")) return;
    var tr = e.target.closest("tr");
    if (!tr) return;
    tr.classList.toggle("row-highlighted");
  });

  // Prospect profile links — delegated to avoid escapeAttr-in-onclick issues
  tbody.addEventListener("click", function(e) {
    var link = e.target.closest(".prospect-link");
    if (!link) return;
    e.preventDefault();
    openProspectProfile(link.dataset.name, link.dataset.pos, parseInt(link.dataset.year));
  });

  // Watchlist star — delegated to avoid escapeAttr-in-onclick issues (FUNC-045)
  tbody.addEventListener("click", function(e) {
    var star = e.target.closest(".col-star[data-pid]");
    if (!star) return;
    e.stopPropagation();
    toggleWatchlistPlayer(star.dataset.pid, star.dataset.pname, star.dataset.pos, star.dataset.team, star.dataset.universe);
  });

  // Double-click stat cell → filter creation (handled on table element below).
  // Copy is available via right-click context menu.
})();

// ─── Row expand (weekly breakdown) ───────────────────────────────
var _expandedRows = {};  // playerId → true

async function toggleRowExpand(playerId, tdEl) {
  var tr = tdEl.closest("tr");
  if (!tr) return;
  var existing = tr.nextElementSibling;
  if (existing && existing.classList.contains("expand-row")) {
    existing.remove();
    delete _expandedRows[playerId];
    var arrow = tdEl.querySelector(".row-expand-arrow");
    if (arrow) arrow.innerHTML = "&#9654;";
    return;
  }
  // Expand: fetch weekly data
  var arrow = tdEl.querySelector(".row-expand-arrow");
  if (arrow) arrow.innerHTML = "&#9660;";
  _expandedRows[playerId] = true;
  var expandTr = document.createElement("tr");
  expandTr.className = "expand-row";
  var cols = getActiveColumns();
  var totalCols = cols.length + (state.universe === "nfl" ? 5 : 4) + 1; // star, select, [pin], rank, player + add-col btn
  expandTr.innerHTML = '<td colspan="' + totalCols + '" style="padding:0; background:var(--bg-warm, rgba(45,31,20,0.04));"><div class="expand-content" style="padding:8px 12px 8px 130px; font-family:var(--font-mono); font-size:11px; color:var(--ink-medium);">pulling weekly film...</div></td>';
  tr.after(expandTr);

  try {
    var season = state.season === "career" ? 0 : (state.season || 0);
    var data = await apiFetch("/api/players/" + encodeURIComponent(playerId) + "/weeks?season=" + season);
    if (!_expandedRows[playerId]) return; // collapsed before response
    var weeks = data.weeks || data || [];
    if (!Array.isArray(weeks) || weeks.length === 0) {
      expandTr.querySelector(".expand-content").textContent = "no weekly data available";
      return;
    }
    // Build mini table
    var html = '<table style="width:100%; border-collapse:collapse; font-family:var(--font-mono); font-size:11px;">';
    html += '<tr style="border-bottom:1px solid var(--ink-faint);">';
    html += '<th style="padding:3px 6px; text-align:left; font-size:10px; color:var(--ink-light);">Wk</th>';
    html += '<th style="padding:3px 6px; text-align:left; font-size:10px; color:var(--ink-light);">Opp</th>';
    html += '<th style="padding:3px 6px; text-align:right; font-size:10px; color:var(--ink-light);">FPts</th>';
    html += '<th style="padding:3px 6px; text-align:right; font-size:10px; color:var(--ink-light);">Pass</th>';
    html += '<th style="padding:3px 6px; text-align:right; font-size:10px; color:var(--ink-light);">PTD</th>';
    html += '<th style="padding:3px 6px; text-align:right; font-size:10px; color:var(--ink-light);">Rush</th>';
    html += '<th style="padding:3px 6px; text-align:right; font-size:10px; color:var(--ink-light);">RTD</th>';
    html += '<th style="padding:3px 6px; text-align:right; font-size:10px; color:var(--ink-light);">Rec</th>';
    html += '<th style="padding:3px 6px; text-align:right; font-size:10px; color:var(--ink-light);">RecYd</th>';
    html += '<th style="padding:3px 6px; text-align:right; font-size:10px; color:var(--ink-light);">RcTD</th>';
    html += '<th style="padding:3px 6px; text-align:right; font-size:10px; color:var(--ink-light);">Tgt</th>';
    html += '</tr>';
    for (var w of weeks) {
      var fpts = parseFloat(w.fantasy_points_ppr || w.fantasy_points || 0).toFixed(1);
      var fptsColor = fpts >= 20 ? 'color:var(--green); font-weight:700;' : fpts < 5 ? 'color:var(--red);' : '';
      html += '<tr style="border-bottom:1px solid var(--ink-faint);">';
      var _n = function(v) { var n = parseInt(v); return isNaN(n) ? 0 : n; };
      html += '<td style="padding:2px 6px;">' + escapeHtml(String(w.week || "")) + '</td>';
      html += '<td style="padding:2px 6px;">' + escapeHtml(w.opponent || w.recent_team || "") + '</td>';
      html += '<td style="padding:2px 6px; text-align:right; ' + fptsColor + '">' + fpts + '</td>';
      html += '<td style="padding:2px 6px; text-align:right;">' + _n(w.passing_yards) + '</td>';
      html += '<td style="padding:2px 6px; text-align:right;">' + _n(w.passing_tds) + '</td>';
      html += '<td style="padding:2px 6px; text-align:right;">' + _n(w.rushing_yards) + '</td>';
      html += '<td style="padding:2px 6px; text-align:right;">' + _n(w.rushing_tds) + '</td>';
      html += '<td style="padding:2px 6px; text-align:right;">' + _n(w.receptions) + '</td>';
      html += '<td style="padding:2px 6px; text-align:right;">' + _n(w.receiving_yards) + '</td>';
      html += '<td style="padding:2px 6px; text-align:right;">' + _n(w.receiving_tds) + '</td>';
      html += '<td style="padding:2px 6px; text-align:right;">' + _n(w.targets) + '</td>';
      html += '</tr>';
    }
    html += '</table>';
    expandTr.querySelector(".expand-content").innerHTML = html;
  } catch (err) {
    console.error("Weekly expand error:", err);
    if (_expandedRows[playerId]) {
      expandTr.querySelector(".expand-content").textContent = razzleError();
    }
  }
}

// ─── Context menu ────────────────────────────────────────────────
var _ctxMenuData = null; // Stores {playerId, pName, pos, team} for current menu

function hideContextMenu() {
  var menu = document.getElementById("screenerContextMenu");
  if (menu) menu.remove();
  _ctxMenuData = null;
}

function _ctxMenuAction(action) {
  if (!_ctxMenuData) return;
  var d = _ctxMenuData;
  switch (action) {
    case "profile": openPlayerProfile(d.playerId); break;
    case "compare": togglePlayerSelect(d.playerId, !state.selectedPlayers.some(function(p) { return p.player_id === d.playerId; })); break;
    case "watchlist": toggleWatchlistPlayer(d.playerId, d.pName, d.pos, d.team, state.universe); break;
    case "pin": togglePinPlayer(d.playerId); break;
    case "highlight":
      var r = document.querySelector('tr[data-player-id="' + CSS.escape(d.playerId) + '"]');
      if (r) r.classList.toggle("row-highlighted");
      break;
    case "clear-highlights":
      document.querySelectorAll(".row-highlighted").forEach(function(el) { el.classList.remove("row-highlighted"); });
      _showToast("highlights cleared");
      break;
    case "copy":
      try { navigator.clipboard.writeText(d.pName).then(function() { _showToast("copied to clipboard"); }).catch(function() { _showToast("fumbled the copy — try again"); }); }
      catch(e) { _showToast("fumbled the copy — try again"); }
      break;
  }
  hideContextMenu();
}

(function() {
  var table = document.getElementById("screenerTable");
  if (!table) return;

  document.addEventListener("click", hideContextMenu);
  document.addEventListener("contextmenu", function(e) {
    if (!e.target.closest("#screenerTable tbody") && !e.target.closest("#screenerTable thead")) hideContextMenu();
  });

  // Double-click stat cell to create filter from value
  table.addEventListener("dblclick", function(e) {
    var td = e.target.closest("tbody td");
    if (!td) return;
    // Skip utility columns (star, checkbox, pin, rank, player, notes, sparkline)
    if (td.classList.contains("col-star") || td.classList.contains("col-select") ||
        td.classList.contains("col-pin") || td.classList.contains("col-rank") ||
        td.classList.contains("col-player") || td.classList.contains("notes-cell") ||
        td.classList.contains("sparkline-cell") || td.classList.contains("pin-cell")) return;
    var tr = td.closest("tr");
    if (!tr) return;
    // Find the column index (skip frozen utility cols)
    var allTds = Array.from(tr.querySelectorAll("td"));
    var tdIdx = allTds.indexOf(td);
    var cols = getActiveColumns();
    // Utility cols: star + checkbox + (pin if NFL) + rank + player = 4 or 5
    var utilCount = state.universe === "nfl" ? 5 : 4;
    var colIdx = tdIdx - utilCount;
    if (colIdx < 0 || colIdx >= cols.length) return;
    var colKey = cols[colIdx];
    var col = getColumnDef(colKey);
    if (!col || col.isText || col.isSparkline || col.isNotes) return;
    // Get player data for this row
    var pid = tr.dataset.playerId;
    var player = state.items.find(function(p) { return (p.player_id || p.player_name) === pid; });
    if (!player) return;
    var val = parseFloat(player[colKey]);
    if (isNaN(val)) return;
    // Create filter: >= for normal stats, <= for inverse stats
    var op = INVERSE_STATS.has(colKey) ? "lte" : "gte";
    // Dedup: skip if exact filter already exists
    var dup = state.filters.some(function(f) { return f.key === colKey && f.op === op && f.value === val; });
    if (dup) { _showToast("filter already exists"); return; }
    // Check filter limit for free users
    if (typeof checkFeatureGate === "function") {
      var gate = checkFeatureGate("filters", state.filters.length);
      if (!gate.allowed) { _showToast(gate.message); return; }
    }
    state.filters.push({ key: colKey, op: op, value: val });
    state.offset = 0;
    renderActiveFilters();
    fetchAndRender();
    var opLabel = op === "gte" ? ">=" : "<=";
    var fmtVal = col.pct ? (val * 100).toFixed(col.decimals || 1) + "%" : val.toFixed(col.decimals != null ? col.decimals : 1);
    _showToast("filter added: " + col.label + " " + opLabel + " " + fmtVal);
  });

  // Column header right-click to hide column
  table.addEventListener("contextmenu", function(e) {
    var th = e.target.closest("thead th");
    if (th && th.hasAttribute("onclick")) {
      var onclickStr = th.getAttribute("onclick") || "";
      var m = onclickStr.match(/sortBy\('([^']+)'/);
      if (m) {
        e.preventDefault();
        hideContextMenu();
        var colKey = m[1];
        var col = getColumnDef(colKey);
        var colLabel = col ? col.label : colKey;
        var menu = document.createElement("div");
        menu.id = "screenerContextMenu";
        menu.className = "screener-context-menu";
        var isNumeric = (col && !col.isText && !col.isSparkline && !col.isNotes);
        var statsOption = isNumeric ?
          '<div class="ctx-sep"></div><div class="ctx-item" data-action="col-stats" data-col="' + escapeAttr(colKey) + '"><span class="ctx-icon">&#9776;</span>Column Stats</div>' : '';
        var quickFilterOpts = isNumeric ?
          '<div class="ctx-sep"></div>' +
          '<div class="ctx-item" data-action="qf-top10" data-col="' + escapeAttr(colKey) + '"><span class="ctx-icon">&#9650;</span>Top 10</div>' +
          '<div class="ctx-item" data-action="qf-top25" data-col="' + escapeAttr(colKey) + '"><span class="ctx-icon">&#9650;</span>Top 25</div>' +
          '<div class="ctx-item" data-action="qf-above" data-col="' + escapeAttr(colKey) + '"><span class="ctx-icon">&#9654;</span>Above Average</div>' +
          '<div class="ctx-item" data-action="qf-below" data-col="' + escapeAttr(colKey) + '"><span class="ctx-icon">&#9664;</span>Below Average</div>' : '';
        menu.innerHTML = '<div class="ctx-item" data-action="hide-col" data-col="' + escapeAttr(colKey) + '"><span class="ctx-icon">&#128584;</span>Hide "' + escapeHtml(colLabel) + '"</div>' +
          '<div class="ctx-item" data-action="sort-asc" data-col="' + escapeAttr(colKey) + '"><span class="ctx-icon">&#8593;</span>Sort Ascending</div>' +
          '<div class="ctx-item" data-action="sort-desc" data-col="' + escapeAttr(colKey) + '"><span class="ctx-icon">&#8595;</span>Sort Descending</div>' + quickFilterOpts + statsOption;
        menu.addEventListener("click", function(ev) {
          var item = ev.target.closest(".ctx-item");
          if (!item) return;
          var act = item.dataset.action;
          var ck = item.dataset.col;
          hideContextMenu();
          if (act === "hide-col") {
            toggleColumn(ck, false);
            _showToast("column hidden: " + (getColumnDef(ck) ? getColumnDef(ck).label : ck));
          } else if (act === "sort-asc") {
            state.sortKey = ck; state.sortDir = "asc"; state.sortKey2 = ""; state.sortDir2 = "desc"; state.offset = 0; fetchAndRender();
          } else if (act === "sort-desc") {
            state.sortKey = ck; state.sortDir = "desc"; state.sortKey2 = ""; state.sortDir2 = "desc"; state.offset = 0; fetchAndRender();
          } else if (act === "col-stats") {
            showColumnStatsPopover(ck, th);
          } else if (act === "qf-top10") {
            _applyQuickFilter(ck, "top10");
          } else if (act === "qf-top25") {
            _applyQuickFilter(ck, "top25");
          } else if (act === "qf-above") {
            _applyQuickFilter(ck, "above_avg");
          } else if (act === "qf-below") {
            _applyQuickFilter(ck, "below_avg");
          }
        });
        document.body.appendChild(menu);
        var x = e.clientX, y = e.clientY;
        var mw = menu.offsetWidth, mh = menu.offsetHeight;
        if (x + mw > window.innerWidth) x = window.innerWidth - mw - 8;
        if (y + mh > window.innerHeight) y = window.innerHeight - mh - 8;
        menu.style.left = x + "px"; menu.style.top = y + "px";
        return;
      }
    }

    var tr = e.target.closest("tbody tr");
    if (!tr) return;
    e.preventDefault();
    hideContextMenu();

    var playerId = tr.dataset.playerId;
    if (!playerId) return;

    var player = state.items.find(function(p) { return (p.player_id || p.player_name) === playerId; });
    if (!player) return;

    _ctxMenuData = {
      playerId: playerId,
      pName: player.full_name || player.player_name || "",
      pos: (player.position || "").toUpperCase(),
      team: player.team || player.school || ""
    };

    var menu = document.createElement("div");
    menu.id = "screenerContextMenu";
    menu.className = "screener-context-menu";

    var items = [];
    if (state.universe === "nfl") {
      items.push({ icon: "👤", label: "View Profile", action: "profile" });
    }
    var isSelected = state.selectedPlayers.some(function(p) { return p.player_id === playerId; });
    items.push({ icon: isSelected ? "☑" : "☐", label: isSelected ? "Remove from Compare" : "Add to Compare", action: "compare" });
    var starred = isOnWatchlist(playerId);
    items.push({ icon: starred ? "★" : "☆", label: starred ? "Remove from Watchlist" : "Add to Watchlist", action: "watchlist" });
    if (state.universe === "nfl") {
      var pinned = isPlayerPinned(playerId);
      items.push({ icon: "📌", label: pinned ? "Unpin Player" : "Pin to Top", action: "pin" });
    }
    items.push({ sep: true });
    items.push({ icon: "🖍", label: "Toggle Highlight", action: "highlight" });
    var hasHighlights = document.querySelectorAll(".row-highlighted").length > 0;
    if (hasHighlights) {
      items.push({ icon: "✕", label: "Clear All Highlights", action: "clear-highlights" });
    }
    items.push({ icon: "📋", label: "Copy Name", action: "copy" });

    var html = "";
    for (var i = 0; i < items.length; i++) {
      if (items[i].sep) {
        html += '<div class="ctx-sep"></div>';
      } else {
        html += '<div class="ctx-item" data-action="' + items[i].action + '"><span class="ctx-icon">' + items[i].icon + '</span>' + escapeHtml(items[i].label) + '</div>';
      }
    }
    menu.innerHTML = html;

    // Event delegation for menu items
    menu.addEventListener("click", function(ev) {
      var item = ev.target.closest(".ctx-item");
      if (item && item.dataset.action) _ctxMenuAction(item.dataset.action);
    });

    document.body.appendChild(menu);

    var x = e.clientX, y = e.clientY;
    var mw = menu.offsetWidth, mh = menu.offsetHeight;
    if (x + mw > window.innerWidth) x = window.innerWidth - mw - 8;
    if (y + mh > window.innerHeight) y = window.innerHeight - mh - 8;
    menu.style.left = x + "px";
    menu.style.top = y + "px";
  });
})();

// ─── Universe toggle ─────────────────────────────────────────────
function setUniverse(u) {
  // Map legacy "prospects" universe to college + prospects sub-view
  if (u === "prospects") {
    u = "college";
    state.collegeView = "prospects";
  }
  if (state.universe === u && u !== "college") return;
  state.universe = u;
  _queryCacheClear();
  try { localStorage.setItem('razzle_universe', u); } catch(e) {}
  state.offset = 0;
  state.search = "";
  state.filters = [];
  state.selectedPlayers = [];
  document.getElementById("searchInput").value = "";

  state.sortKey2 = "";
  state.sortDir2 = "desc";
  if (isProspectView()) {
    state.sortKey = "draft_pick";
    state.sortDir = "asc";
  } else if (u === "college") {
    state.sortKey = "total_yards";
    state.sortDir = "desc";
  } else {
    state.sortKey = "fantasy_points_ppr";
    state.sortDir = "desc";
  }

  state.week = 0;
  state.tagFilter = false;
  applyUniverseUI();

  // If currently on an NFL-only panel and switching to college (or vice versa), go to screener
  if (typeof window.switchPanel === 'function' && typeof window._currentPanelName === 'string') {
    var curPanel = window._currentPanelName;
    var NFL_ONLY = ['rankings','tiers','tradevalues','vorp','advantage','auction','cheatsheet','buysell','stocks','waivers','handcuffs','scarcity','snapefficiency','workload','dualthreat','targetpremium','drops','garbagetime','weekly','matchups','stacks','redzone','streaks','weeklyleaders','weeklymvp','playoffs','gamescript','pace','seasonpace','tdregression','airyards','dashboard','rosterbuilder','tradefinder','scoring','schedule','opportunity','targets','team','powerrankings','records','recap','awards','reportcard','fptsbreakdown','gamelog','archetypes','breakdown','comptable','strengths','career','career-compare'];
    var COLLEGE_ONLY = ['draftclass','prospects','percentiles','drafttracker'];
    if ((u === 'college' && NFL_ONLY.indexOf(curPanel) !== -1) ||
        (u === 'nfl' && COLLEGE_ONLY.indexOf(curPanel) !== -1)) {
      window.switchPanel('screener');
    }
  }

  populateSeasonSelect();
  populateWeekSelect();
  populateFilterStatSelect();
  renderColumnPicker();
  renderPresets();
  populatePresetSelect();
  renderActiveFilters();
  updateTagFilterBadge();
  fetchAndRender();

  // Invalidate cached panels so they re-fetch with new universe
  if (window._invalidatePanelCaches) window._invalidatePanelCaches();
}

function setCollegeView(view) {
  if (state.collegeView === view) return;
  state.collegeView = view;
  state.tagFilter = false;
  try { localStorage.setItem('razzle_college_view', view); } catch(e) {}
  state.offset = 0;
  state.search = "";
  state.filters = [];
  state.selectedPlayers = [];
  document.getElementById("searchInput").value = "";

  state.sortKey2 = "";
  state.sortDir2 = "desc";
  if (view === "prospects") {
    state.sortKey = "draft_pick";
    state.sortDir = "asc";
  } else {
    state.sortKey = "total_yards";
    state.sortDir = "desc";
  }

  applyUniverseUI();
  populateSeasonSelect();
  populateFilterStatSelect();
  renderColumnPicker();
  renderPresets();
  populatePresetSelect();
  renderActiveFilters();
  fetchAndRender();

  if (window._invalidatePanelCaches) window._invalidatePanelCaches();
}

function applyUniverseUI() {
  const prospectMode = isProspectView();
  const isCollege = state.universe === "college";
  const isNFL = state.universe === "nfl";

  // Toggle body classes for blue accent
  document.body.classList.toggle("prospect-mode", prospectMode);
  document.body.classList.toggle("college-mode", isCollege && !prospectMode);

  // Update universe bar label
  const uLabel = document.getElementById("universeLabel");
  if (uLabel) {
    uLabel.textContent = isCollege
      ? (prospectMode ? "college — draft prospects" : "college universe")
      : "NFL universe";
  }

  // Toggle universe buttons (only NFL and College now)
  var nflBtn = document.getElementById("universeNFL");
  var collegeBtn = document.getElementById("universeCollege");
  if (nflBtn) nflBtn.classList.toggle("active", isNFL);
  if (collegeBtn) collegeBtn.classList.toggle("active", isCollege);

  // Toggle college sub-view buttons
  const subToggle = document.getElementById("collegeSubToggle");
  if (subToggle) {
    subToggle.style.display = isCollege ? "flex" : "none";
    const statsBtn = document.getElementById("collegeViewStats");
    const prospectsBtn = document.getElementById("collegeViewProspects");
    if (statsBtn) statsBtn.classList.toggle("active", !prospectMode);
    if (prospectsBtn) prospectsBtn.classList.toggle("active", prospectMode);
  }

  // Search placeholder
  var searchInput = document.getElementById("searchInput");
  if (searchInput) searchInput.placeholder = prospectMode
    ? "search prospects..." : isCollege ? "search college players..." : "search players...";

  // Hide formula button in non-NFL modes
  const formulaBtn = document.getElementById("formulaBtn");
  if (formulaBtn) formulaBtn.style.display = isNFL ? "" : "none";

  // Hide relevance toggle in non-NFL modes
  var relToggle = document.getElementById("relevanceToggle");
  if (relToggle) relToggle.style.display = isNFL ? "" : "none";

  // Hide tag filter in non-NFL modes
  const tagFilterBtn = document.getElementById("tagFilterBtn");
  if (tagFilterBtn) tagFilterBtn.style.display = isNFL ? "" : "none";

  // Hide filter bar in non-NFL modes
  var filterBar = document.getElementById("filterBar");
  if (filterBar) filterBar.style.display = isNFL ? "" : "none";

  // Data source label
  const ds = document.getElementById("dataSource");
  if (ds) {
    if (isCollege) ds.textContent = "college stats — the screener is forever free";
    else if (prospectMode) ds.textContent = "draft prospects — the screener is forever free";
    else ds.textContent = "the screener is forever free";
  }

  // Page title
  if (isCollege) document.title = "College Screener — Razzle";
  else if (prospectMode) document.title = "Prospect Screener — Razzle";
  else document.title = "Screener — Razzle";

  // Show Tiers and Big Board buttons only in prospect mode
  const tiersBtn = document.getElementById("tiersBtn");
  if (tiersBtn) tiersBtn.style.display = prospectMode ? "" : "none";
  const bigBoardBtn = document.getElementById("bigBoardBtn");
  if (bigBoardBtn) bigBoardBtn.style.display = prospectMode ? "" : "none";
  const classAnalyticsBtn = document.getElementById("classAnalyticsBtn");
  if (classAnalyticsBtn) classAnalyticsBtn.style.display = prospectMode ? "" : "none";

  // Show Export Rankings and Trade Values only in NFL mode
  const exportRankingsBtn = document.getElementById("exportRankingsBtn");
  if (exportRankingsBtn) exportRankingsBtn.style.display = (state.universe === "nfl") ? "" : "none";
  const tradeValuesBtn = document.getElementById("tradeValuesBtn");
  if (tradeValuesBtn) tradeValuesBtn.style.display = (state.universe === "nfl") ? "" : "none";
  const agingCurvesBtn = document.getElementById("agingCurvesBtn");
  if (agingCurvesBtn) agingCurvesBtn.style.display = (state.universe === "nfl") ? "" : "none";
  const heatMapBtn = document.getElementById("heatMapBtn");
  if (heatMapBtn) heatMapBtn.style.display = (state.universe === "nfl") ? "" : "none";

  // Hide NFL-only sidebar items in college mode, college-only in NFL mode
  var NFL_ONLY_PANELS = [
    'rankings', 'tiers', 'tradevalues', 'vorp', 'advantage', 'auction',
    'cheatsheet', 'buysell', 'stocks', 'waivers', 'handcuffs', 'scarcity',
    'snapefficiency', 'workload', 'dualthreat', 'targetpremium', 'drops',
    'garbagetime', 'weekly', 'matchups', 'stacks', 'redzone', 'streaks',
    'weeklyleaders', 'weeklymvp', 'playoffs', 'gamescript',
    'pace', 'seasonpace', 'tdregression', 'airyards',
    'dashboard', 'rosterbuilder', 'tradefinder', 'scoring',
    'schedule', 'opportunity', 'targets', 'team', 'powerrankings',
    'records', 'recap', 'awards',
    'reportcard', 'fptsbreakdown', 'gamelog', 'archetypes',
    'breakdown', 'comptable', 'strengths', 'career', 'career-compare'
  ];
  var COLLEGE_ONLY_PANELS = [
    'draftclass', 'prospects', 'percentiles', 'drafttracker'
  ];
  document.querySelectorAll('.lab-sidebar-item[data-panel]').forEach(function(item) {
    var panel = item.getAttribute('data-panel');
    var hide = (isCollege && NFL_ONLY_PANELS.indexOf(panel) !== -1) ||
               (isNFL && COLLEGE_ONLY_PANELS.indexOf(panel) !== -1);
    item.classList.toggle('sidebar-nfl-only', hide);
  });

  // Hide category headers that have no visible items
  document.querySelectorAll('.lab-sidebar-category').forEach(function(cat) {
    if (cat.classList.contains('sidebar-cat-forever-free') || cat.classList.contains('sidebar-cat-pro-parent')) return;
    var next = cat.nextElementSibling;
    var hasVisible = false;
    while (next && !next.classList.contains('lab-sidebar-category')) {
      if (next.classList.contains('lab-sidebar-item') && !next.classList.contains('sidebar-nfl-only') && !next.classList.contains('search-hidden')) {
        hasVisible = true;
      }
      next = next.nextElementSibling;
    }
    cat.style.display = hasVisible ? '' : 'none';
  });
}

// ─── Sort ────────────────────────────────────────────────────────
function sortBy(key, e) {
  // Normalize player name sort key per universe
  if (key === "full_name" && (isProspectView() || state.universe === "college")) key = "player_name";
  if (key === "player_name" && state.universe === "nfl") key = "full_name";

  var isShift = e && e.shiftKey;

  if (isShift) {
    // Shift+click: set secondary sort (can't be same as primary)
    if (key === state.sortKey) return;
    if (state.sortKey2 === key) {
      state.sortDir2 = state.sortDir2 === "desc" ? "asc" : "desc";
    } else {
      state.sortKey2 = key;
      state.sortDir2 = (key === "full_name" || key === "player_name" || key === "draft_pick") ? "asc" : "desc";
    }
    // Secondary sort is client-side — re-sort current items and re-render
    applySecondarySort();
    renderTable();
    saveStateToURL();
    var col2 = getColumnDef(state.sortKey2);
    _showToast("secondary sort: " + (col2 ? col2.label : state.sortKey2) + " " + state.sortDir2);
    return;
  }

  // Regular click: primary sort (clears secondary)
  if (state.sortKey === key) {
    state.sortDir = state.sortDir === "desc" ? "asc" : "desc";
  } else {
    state.sortKey = key;
    // Text fields and draft pick default to asc
    state.sortDir = (key === "full_name" || key === "player_name" || key === "draft_pick") ? "asc" : "desc";
  }
  state.sortKey2 = "";
  state.sortDir2 = "desc";
  state.offset = 0;
  fetchAndRender();
}

function applySecondarySort() {
  if (!state.sortKey2 || !state.items.length) return;
  var key2 = state.sortKey2;
  var dir2 = state.sortDir2 === "asc" ? 1 : -1;
  var primary = state.sortKey;

  // Stable sort: only reorder items with equal primary sort values
  state.items.sort(function(a, b) {
    // Keep primary order for different primary values
    var pa = a[primary], pb = b[primary];
    if (pa == null) pa = -Infinity;
    if (pb == null) pb = -Infinity;
    var paf = parseFloat(pa), pbf = parseFloat(pb);
    if (!isNaN(paf) && !isNaN(pbf)) { pa = paf; pb = pbf; }
    if (pa !== pb) return 0; // preserve backend primary order

    // Tiebreaker: sort by secondary key
    var va = a[key2], vb = b[key2];
    if (va == null && vb == null) return 0;
    if (va == null) return 1;
    if (vb == null) return -1;
    var fa = parseFloat(va), fb = parseFloat(vb);
    if (!isNaN(fa) && !isNaN(fb)) return (fa - fb) * dir2;
    // String comparison
    return String(va).localeCompare(String(vb)) * dir2;
  });
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
let _seasonDebounce = null;

function populateSeasonSelect() {
  const sel = document.getElementById("seasonSelect");
  const allowed = typeof getAllowedSeasons === "function"
    ? getAllowedSeasons(state.seasons)
    : state.seasons;

  if (isProspectView()) {
    sel.innerHTML = state.draftYears.map(y =>
      `<option value="${y}" ${y === state.draftYear ? "selected" : ""}>${y} Draft</option>`
    ).join("");
    sel.onchange = (e) => {
      state.draftYear = parseInt(e.target.value) || state.draftYear;
      state.offset = 0;
      clearTimeout(_seasonDebounce);
      _seasonDebounce = setTimeout(() => fetchAndRender(), 200);
    };
  } else if (state.universe === "college") {
    sel.innerHTML = state.collegeSeasons.map(s =>
      `<option value="${s}" ${s === state.collegeSeason ? "selected" : ""}>${s}</option>`
    ).join("");
    sel.onchange = (e) => {
      state.collegeSeason = parseInt(e.target.value) || state.collegeSeason;
      state.offset = 0;
      clearTimeout(_seasonDebounce);
      _seasonDebounce = setTimeout(() => fetchAndRender(), 200);
    };
  } else {
    let html = `<option value="career" ${state.season === "career" ? "selected" : ""}>Career</option>`;
    html += state.seasons.map(s =>
      `<option value="${s}" ${s === state.season ? "selected" : ""}>${s}</option>`
    ).join("");
    sel.innerHTML = html;
    sel.onchange = (e) => {
      var val = e.target.value;
      state.season = val === "career" ? "career" : (parseInt(val, 10) || _nflYear);
      state.week = 0;
      state.offset = 0;
      clearTimeout(_seasonDebounce);
      _seasonDebounce = setTimeout(() => {
        fetchAndRender();
        populateWeekSelect();
      }, 200);
    };
  }
}

// ─── Week select ─────────────────────────────────────────────────
let _weekDebounce = null;
var _weekFetchController = null;

function populateWeekSelect() {
  const weekSel = document.getElementById("weekSelect");
  if (!weekSel) return;

  // Week selector only for NFL season mode (not career, not college/prospects)
  if (state.universe !== "nfl" || state.season === "career") {
    weekSel.style.display = "none";
    state.week = 0;
    _updateWeekAnnotation();
    return;
  }

  var season = state.season || 0;
  weekSel.style.display = "";

  // Abort any in-flight week fetch to prevent stale data on rapid season switch
  if (_weekFetchController) _weekFetchController.abort();
  _weekFetchController = new AbortController();

  fetch(window.location.origin + "/api/available-weeks?season=" + season, { signal: _weekFetchController.signal })
    .then(function(r) { return r.ok ? r.json() : { weeks: [] }; })
    .then(function(data) {
      state.availableWeeks = data.weeks || [];
      var html = '<option value="0">All Weeks</option>';
      html += state.availableWeeks.map(function(w) {
        return '<option value="' + w + '"' + (w === state.week ? ' selected' : '') + '>Week ' + w + '</option>';
      }).join("");
      weekSel.innerHTML = html;
      _updateWeekAnnotation();
    })
    .catch(function(e) {
      if (e && e.name === "AbortError") return;
      weekSel.innerHTML = '<option value="0">All Weeks</option>';
    });

  weekSel.onchange = function(e) {
    state.week = parseInt(e.target.value) || 0;
    state.offset = 0;
    clearTimeout(_weekDebounce);
    _weekDebounce = setTimeout(function() {
      fetchAndRender();
      _updateWeekAnnotation();
    }, 200);
  };
}

function _updateWeekAnnotation() {
  var existing = document.getElementById("weekAnnotation");
  if (existing) existing.remove();
  if (!state.week || state.week <= 0) return;
  var toolbar = document.querySelector(".toolbar");
  if (!toolbar) return;
  var anno = document.createElement("div");
  anno.id = "weekAnnotation";
  anno.style.cssText = "font-family:var(--font-hand);font-size:14px;color:var(--orange);transform:rotate(-1deg);padding:2px 8px;";
  anno.textContent = "showing Week " + state.week + ", " + (state.season || "") + " stats";
  toolbar.parentNode.insertBefore(anno, toolbar.nextSibling);
}

// ─── Pagination ──────────────────────────────────────────────────
function renderPagination() {
  const page = Math.floor(state.offset / state.limit) + 1;
  const totalPages = Math.ceil(state.totalCount / state.limit) || 1;
  var pageInfo = document.getElementById("pageInfo");
  var prevBtn = document.getElementById("prevBtn");
  var nextBtn = document.getElementById("nextBtn");
  if (pageInfo) pageInfo.textContent = `${page} / ${totalPages}`;
  if (prevBtn) prevBtn.disabled = state.offset === 0;
  if (nextBtn) nextBtn.disabled = state.offset + state.limit >= state.totalCount;
  const sel = document.getElementById("pageSizeSelect");
  if (sel) sel.value = String(state.limit);
  const pag = document.querySelector(".footer-bar .pagination");
  if (pag) pag.style.visibility = state.totalCount > 0 ? "" : "hidden";
}

function prevPage() {
  state.offset = Math.max(0, state.offset - state.limit);
  fetchAndRender().then(function() { requestAnimationFrame(_scrollTableTop); });
}

function nextPage() {
  state.offset += state.limit;
  fetchAndRender().then(function() { requestAnimationFrame(_scrollTableTop); });
}

function _scrollTableTop() {
  var wrap = document.querySelector(".table-wrap");
  if (wrap) wrap.scrollTo({ top: 0, behavior: "smooth" });
}

function changePageSize(val) {
  const size = parseInt(val);
  if (![25].includes(size)) return;
  state.limit = size;
  state.offset = 0;
  try { localStorage.setItem("razzle_page_size", String(size)); } catch(e) {}
  fetchAndRender();
}

function updateResultCount() {
  const el = document.getElementById("resultCount");
  const label = isProspectView() ? "prospects" : state.universe === "college" ? "college players" : "players";
  const from = state.offset + 1;
  const to = Math.min(state.offset + state.items.length, state.totalCount);
  const colDefs = isProspectView() ? PROSPECT_COLUMNS : state.universe === "college" ? COLLEGE_COLUMNS : COLUMNS;
  const sortCol = colDefs[state.sortKey];
  const sortLabel = sortCol ? sortCol.label : state.sortKey;
  const sortArrow = state.sortDir === "asc" ? "↑" : "↓";
  let sortText = `${sortLabel} ${sortArrow}`;
  if (state.sortKey2) {
    const sort2Col = colDefs[state.sortKey2];
    const sort2Label = sort2Col ? sort2Col.label : state.sortKey2;
    const sort2Arrow = state.sortDir2 === "asc" ? "↑" : "↓";
    sortText += `, ${sort2Label} ${sort2Arrow}`;
  }
  const seasonLabel = state.season === "career" ? "Career" : isProspectView() ? state.draftYear + " Draft" : state.universe === "college" ? state.collegeSeason : state.season;
  let parts = [];
  if (state.totalCount > 0) parts.push(`<strong>${from}-${to}</strong> of <strong>${state.totalCount}</strong> ${label}`);
  else parts.push(`<strong>0</strong> ${label}`);
  parts.push(sortText);
  if (seasonLabel) parts.push(String(seasonLabel));
  if (state.position !== "ALL") parts.push(state.position);

  // Position breakdown badges (only when ALL positions shown and items exist)
  if (state.position === "ALL" && state.items.length > 0) {
    var posCounts = {};
    for (var i = 0; i < state.items.length; i++) {
      var p = (state.items[i].position || "").toUpperCase();
      if (p) posCounts[p] = (posCounts[p] || 0) + 1;
    }
    var posColors = { QB: "var(--pos-qb)", RB: "var(--pos-rb)", WR: "var(--pos-wr)", TE: "var(--pos-te)" };
    var posOrder = ["QB", "RB", "WR", "TE"];
    var badges = [];
    for (var j = 0; j < posOrder.length; j++) {
      var pp = posOrder[j];
      if (posCounts[pp]) {
        badges.push('<span style="font-size:10px; font-weight:700; color:' + posColors[pp] + '; cursor:pointer; border-bottom:2px dashed ' + posColors[pp] + ';" onclick="togglePosition(\'' + pp + '\')" title="Filter to ' + pp + '">' + pp + ':' + posCounts[pp] + '</span>');
      }
    }
    if (badges.length) parts.push(badges.join(" "));
  }

  // Data freshness indicator
  if (_lastFetchTime) {
    var ago = Math.round((Date.now() - _lastFetchTime) / 1000);
    var agoText = ago < 5 ? "just now" : ago < 60 ? ago + "s ago" : Math.floor(ago / 60) + "m ago";
    parts.push('<span style="color:var(--ink-faint); font-size:10px;" title="Data fetched at ' + escapeAttr(new Date(_lastFetchTime).toLocaleTimeString()) + '">⏱ ' + agoText + '</span>');
  }

  el.innerHTML = parts.join(" · ");
}
var _lastFetchTime = 0;

// ─── Filters ─────────────────────────────────────────────────────
function populateFilterStatSelect() {
  const sel = document.getElementById("filterStat");
  const colDefs = isProspectView() ? PROSPECT_COLUMNS : state.universe === "college" ? COLLEGE_COLUMNS : COLUMNS;
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

function openFilterForColumn(key) {
  const sel = document.getElementById("filterStat");
  if (!sel) return;
  // Check if this key exists in the filter stat dropdown
  const opt = sel.querySelector('option[value="' + CSS.escape(key) + '"]');
  if (!opt) return; // not a filterable stat (text columns, sparklines, etc.)
  sel.value = key;
  openFilterModal();
}

function closeFilterModal(e) {
  if (e && e.target !== e.currentTarget) return;
  document.getElementById("filterModalOverlay").classList.remove("open");
}

function addFilter() {
  const key = document.getElementById("filterStat").value;
  const op = document.getElementById("filterOp").value;
  const value = parseFloat(document.getElementById("filterValue").value);
  if (isNaN(value)) { _showToast("need a number for that filter"); return; }

  // Check filter limit for free users (3 max)
  if (typeof checkFeatureGate === "function") {
    const gate = checkFeatureGate("filters", state.filters.length);
    if (!gate.allowed) {
      _showToast(gate.message);
      return;
    }
  }

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
    const col = getColumnDef(f.key);
    const label = col ? col.label : f.key;
    return `<span class="filter-tag">${escapeHtml(label)} ${opLabels[f.op] || escapeHtml(String(f.op))} ${escapeHtml(String(f.value))} <span class="remove" onclick="removeFilter(${i})">×</span></span>`;
  }).join(" ");

  // "Reset All" button when any filters, search, teams, or minGP are active
  const hasActive = state.filters.length > 0 || state.search || state.teams.length > 0 || state.minGP > 0 || state.tagFilter;
  if (hasActive) {
    html += ` <span class="filter-tag" style="background:var(--ink); color:var(--bg); cursor:pointer; font-weight:700;" onclick="resetAllFilters()" title="Clear all filters, search, and teams">Reset All ×</span>`;
  }

  container.innerHTML = html;

  // Update filter count badge on button
  var filterBtn = document.querySelector(".add-filter-btn");
  if (filterBtn) {
    var count = state.filters.length + (state.minGP > 0 ? 1 : 0) + state.teams.length + (state.tagFilter ? 1 : 0);
    var badge = filterBtn.querySelector(".filter-badge");
    // Show "2/3" for free users so they see their limit
    var badgeText = String(count);
    if (typeof checkFeatureGate === "function" && typeof getUserPlan === "function" && getUserPlan() === "free" && count > 0) {
      var gate = checkFeatureGate("filters", 0);
      if (gate.limit && gate.limit < Infinity) badgeText = count + "/" + gate.limit;
    }
    if (count > 0) {
      if (!badge) { badge = document.createElement("span"); badge.className = "filter-badge"; filterBtn.appendChild(badge); }
      badge.textContent = badgeText;
    } else if (badge) { badge.remove(); }
  }
}

// Get active filter descriptions for a column key
function _getColumnFilterInfo(colKey) {
  var opLabels = { gte: "\u2265", lte: "\u2264", gt: ">", lt: "<", eq: "=" };
  var matches = state.filters.filter(function(f) { return f.key === colKey; });
  if (!matches.length) return null;
  return matches.map(function(f) {
    var col = getColumnDef(f.key);
    var label = col ? col.label : f.key;
    return label + " " + (opLabels[f.op] || f.op) + " " + f.value;
  }).join(", ");
}

// Apply a quick-filter on a column (Top N, Above/Below Avg)
function _applyQuickFilter(colKey, mode) {
  var vals = [];
  for (var i = 0; i < state.items.length; i++) {
    var v = parseFloat(state.items[i][colKey]);
    if (!isNaN(v)) vals.push(v);
  }
  if (!vals.length) { _showToast("no film for that quick filter"); return; }
  vals.sort(function(a, b) { return b - a; });
  var col = getColumnDef(colKey);
  var label = col ? col.label : colKey;
  var threshold, op, desc;
  if (mode === "top10") {
    threshold = vals[Math.min(9, vals.length - 1)];
    op = "gte"; desc = "Top 10";
  } else if (mode === "top25") {
    threshold = vals[Math.min(24, vals.length - 1)];
    op = "gte"; desc = "Top 25";
  } else if (mode === "above_avg") {
    threshold = vals.reduce(function(a, b) { return a + b; }, 0) / vals.length;
    threshold = Math.round(threshold * 100) / 100;
    op = "gte"; desc = "Above Avg";
  } else if (mode === "below_avg") {
    threshold = vals.reduce(function(a, b) { return a + b; }, 0) / vals.length;
    threshold = Math.round(threshold * 100) / 100;
    op = "lte"; desc = "Below Avg";
  } else { return; }
  // Check for duplicate filter
  var dup = state.filters.some(function(f) { return f.key === colKey && f.op === op && f.value === threshold; });
  if (dup) { _showToast("filter already active"); return; }
  // Check filter limit for free users
  if (typeof checkFeatureGate === "function") {
    var gate = checkFeatureGate("filters", state.filters.length);
    if (!gate.allowed) { _showToast(gate.message); return; }
  }
  state.filters.push({ key: colKey, op: op, value: threshold });
  state.offset = 0;
  renderActiveFilters();
  fetchAndRender();
  var opSymbol = op === "lte" ? "\u2264" : "\u2265";
  _showToast("quick filter: " + label + " " + desc + " (" + opSymbol + " " + threshold + ")");
}

function resetAllFilters() {
  state.filters = [];
  state.search = "";
  state.teams = [];
  state.minGP = 0;
  state.tagFilter = false;
  state.offset = 0;

  // Reset UI controls
  document.getElementById("searchInput").value = "";
  var teamSel = document.getElementById("teamFilter");
  if (teamSel) teamSel.value = "";
  var gpInp = document.getElementById("minGPInput");
  if (gpInp) gpInp.value = "";
  var sfSel = document.getElementById("smartFilterSelect");
  if (sfSel) sfSel.value = "";
  var tagBtn = document.getElementById("tagFilterBtn");
  if (tagBtn) tagBtn.classList.remove("active");

  renderActiveFilters();
  renderTeamChips();
  fetchAndRender();
  _showToast("all filters cleared");
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
  "DET","GB","HOU","IND","JAX","KC","LAR","LAC","LV","MIA",
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
    `<span class="team-chip">${escapeHtml(t)} <span class="remove" onclick="removeTeam('${escapeJS(t)}')">×</span></span>`
  ).join("");
}

function setMinGP(val) {
  const v = parseInt(val) || 0;
  state.minGP = v > 0 ? v : 0;
  state.offset = 0;
  renderActiveFilters();
  fetchAndRender();
}

// ─── Tools dropdown ─────────────────────────────────────────────
function toggleToolsDropdown() {
  var dd = document.getElementById("toolsDropdown");
  var bd = document.getElementById("toolsDropdownBackdrop");
  var btn = document.getElementById("toolsDropdownBtn");
  if (!dd) return;
  var isOpen = dd.classList.contains("open");
  dd.classList.toggle("open", !isOpen);
  if (bd) bd.classList.toggle("open", !isOpen);
  if (btn) { btn.classList.toggle("active", !isOpen); btn.setAttribute("aria-expanded", String(!isOpen)); }
}

function closeToolsDropdown() {
  var dd = document.getElementById("toolsDropdown");
  var bd = document.getElementById("toolsDropdownBackdrop");
  var btn = document.getElementById("toolsDropdownBtn");
  if (dd) dd.classList.remove("open");
  if (bd) bd.classList.remove("open");
  if (btn) { btn.classList.remove("active"); btn.setAttribute("aria-expanded", "false"); }
}

// ─── Column picker ───────────────────────────────────────────────
function openColumnPicker() {
  document.getElementById("columnPickerOverlay").classList.add("open");
  const searchInput = document.getElementById("columnPickerSearch");
  if (searchInput) { searchInput.value = ""; filterColumnPicker(""); setTimeout(function() { searchInput.focus(); }, 50); }
}

function closeColumnPicker(e) {
  if (e && e.target !== e.currentTarget) return;
  document.getElementById("columnPickerOverlay").classList.remove("open");
  renderTable();
  saveStateToURL();
}

function renderColumnPicker() {
  const container = document.getElementById("columnGroups");
  const colDefs = isProspectView() ? PROSPECT_COLUMNS : state.universe === "college" ? COLLEGE_COLUMNS : COLUMNS;
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
      const lockCls = _getTierLockClass(col.key);
      html += `<label class="column-option${lockCls ? ' ' + lockCls : ''}">
        <input type="checkbox" value="${col.key}" ${checked} onchange="toggleColumn('${col.key}', this.checked)">
        ${col.label}
      </label>`;
    }
    html += `</div>`;
  }
  container.innerHTML = html;
}

function toggleColumnGroup(groupName) {
  const colDefs = isProspectView() ? PROSPECT_COLUMNS : state.universe === "college" ? COLLEGE_COLUMNS : COLUMNS;
  const colArray = isProspectView() ? "prospectColumns" : state.universe === "college" ? "collegeColumns" : "visibleColumns";
  // Find all columns in this group
  const groupCols = Object.entries(colDefs).filter(([k, c]) => c.group === groupName).map(([k]) => k);
  if (!groupCols.length) return;
  // Check if most are already visible
  const visibleCount = groupCols.filter(k => state[colArray].includes(k)).length;
  const shouldRemove = visibleCount > groupCols.length / 2;
  if (shouldRemove) {
    // Remove all group columns
    state[colArray] = state[colArray].filter(k => !groupCols.includes(k));
    _showToast(groupName + " columns hidden");
  } else {
    // Add all group columns in definition order
    const allKeys = Object.keys(colDefs);
    for (const key of groupCols) {
      if (!state[colArray].includes(key)) {
        const idx = allKeys.indexOf(key);
        let insertAt = state[colArray].length;
        for (let i = 0; i < state[colArray].length; i++) {
          if (allKeys.indexOf(state[colArray][i]) > idx) { insertAt = i; break; }
        }
        state[colArray].splice(insertAt, 0, key);
      }
    }
    _showToast(groupName + " columns shown");
  }
  renderTable();
  saveStateToURL();
}

function filterColumnPicker(query) {
  const q = (query || "").toLowerCase().trim();
  const labels = document.querySelectorAll("#columnGroups .column-option");
  const groups = document.querySelectorAll("#columnGroups .column-group");
  labels.forEach(function(label) {
    const text = label.textContent.toLowerCase();
    label.style.display = q && !text.includes(q) ? "none" : "";
  });
  // Hide empty groups
  groups.forEach(function(group) {
    const visible = group.querySelectorAll('.column-option:not([style*="display: none"])');
    group.style.display = visible.length === 0 ? "none" : "";
  });
}

// ─── Column Stats Popover ─────────────────────────────────────
function showColumnStatsPopover(colKey, anchorEl) {
  dismissColumnStatsPopover();
  var col = getColumnDef(colKey);
  if (!col || col.isText || col.isSparkline || col.isNotes) return;

  // Collect values from current items
  var vals = [];
  for (var i = 0; i < state.items.length; i++) {
    var v = parseFloat(state.items[i][colKey]);
    if (!isNaN(v)) vals.push(v);
  }
  if (vals.length < 2) { _showToast("not enough data for stats"); return; }

  vals.sort(function(a, b) { return a - b; });
  var n = vals.length;
  var sum = vals.reduce(function(a, b) { return a + b; }, 0);
  var mean = sum / n;
  var median = n % 2 === 0 ? (vals[n / 2 - 1] + vals[n / 2]) / 2 : vals[Math.floor(n / 2)];
  var min = vals[0];
  var max = vals[n - 1];
  var variance = vals.reduce(function(s, v) { return s + (v - mean) * (v - mean); }, 0) / n;
  var stddev = Math.sqrt(variance);
  var dec = col.decimals != null ? col.decimals : 1;
  var fmtPct = col.pct;

  function fmt(v) {
    if (fmtPct) return (v * 100).toFixed(dec) + "%";
    return v.toFixed(dec);
  }

  // Build 5-bar histogram
  var range = max - min;
  var buckets = [0, 0, 0, 0, 0];
  if (range > 0) {
    for (var j = 0; j < vals.length; j++) {
      var bi = Math.min(4, Math.floor(((vals[j] - min) / range) * 5));
      buckets[bi]++;
    }
  } else {
    buckets[2] = vals.length;
  }
  var maxBucket = Math.max.apply(null, buckets);
  var histHTML = '<div class="colstats-hist">';
  for (var b = 0; b < 5; b++) {
    var pct = maxBucket > 0 ? (buckets[b] / maxBucket * 100) : 0;
    histHTML += '<div class="colstats-bar" style="height:' + Math.max(2, pct) + '%" title="' + buckets[b] + ' players"></div>';
  }
  histHTML += '</div>';
  histHTML += '<div class="colstats-hist-labels"><span>' + fmt(min) + '</span><span>' + fmt(max) + '</span></div>';

  // Build popover
  var pop = document.createElement("div");
  pop.id = "colStatsPopover";
  pop.className = "colstats-popover";
  var posCtx = state.position !== "ALL" ? state.position : "All Positions";
  pop.innerHTML = '<div class="colstats-title">' + escapeHtml(col.label) + ' <span style="font-size:10px; color:var(--ink-light); font-weight:400;">(' + escapeHtml(posCtx) + ')</span></div>' +
    '<div class="colstats-grid">' +
    '<span class="colstats-label">Min</span><span class="colstats-val">' + fmt(min) + '</span>' +
    '<span class="colstats-label">Max</span><span class="colstats-val">' + fmt(max) + '</span>' +
    '<span class="colstats-label">Mean</span><span class="colstats-val">' + fmt(mean) + '</span>' +
    '<span class="colstats-label">Median</span><span class="colstats-val">' + fmt(median) + '</span>' +
    '<span class="colstats-label">Std Dev</span><span class="colstats-val">' + fmt(stddev) + '</span>' +
    '<span class="colstats-label">Count</span><span class="colstats-val">' + n + '</span>' +
    '</div>' +
    '<div class="colstats-hist-section"><div class="colstats-hist-title">Distribution</div>' + histHTML + '</div>';

  document.body.appendChild(pop);

  // Position below the header cell
  var rect = anchorEl.getBoundingClientRect();
  var pw = pop.offsetWidth;
  var ph = pop.offsetHeight;
  var left = rect.left + rect.width / 2 - pw / 2;
  var top = rect.bottom + 4;
  if (left + pw > window.innerWidth - 8) left = window.innerWidth - pw - 8;
  if (left < 8) left = 8;
  if (top + ph > window.innerHeight - 8) top = rect.top - ph - 4;
  pop.style.left = left + "px";
  pop.style.top = top + "px";

  // Dismiss on outside click, Escape, or scroll
  setTimeout(function() {
    document.addEventListener("click", _colStatsOutsideClick, true);
    document.addEventListener("keydown", _colStatsEscDismiss, true);
    var wrap = document.querySelector(".table-wrap");
    if (wrap) wrap.addEventListener("scroll", _colStatsScrollDismiss, { passive: true });
  }, 0);
}

function _colStatsOutsideClick(e) {
  var pop = document.getElementById("colStatsPopover");
  if (pop && !pop.contains(e.target)) {
    dismissColumnStatsPopover();
  }
}

function _colStatsEscDismiss(e) {
  if (e.key === "Escape") {
    e.stopPropagation();
    dismissColumnStatsPopover();
  }
}

function _colStatsScrollDismiss() {
  dismissColumnStatsPopover();
}

function dismissColumnStatsPopover() {
  var pop = document.getElementById("colStatsPopover");
  if (pop) pop.remove();
  document.removeEventListener("click", _colStatsOutsideClick, true);
  document.removeEventListener("keydown", _colStatsEscDismiss, true);
  var wrap = document.querySelector(".table-wrap");
  if (wrap) wrap.removeEventListener("scroll", _colStatsScrollDismiss);
}

// ─── Smart filter presets ──────────────────────────────────────
const SMART_FILTERS = {
  breakout: {
    label: "Breakout Candidates",
    filters: [
      { key: "age", op: "lte", value: 25 },
      { key: "snap_share", op: "gte", value: 50 },
    ],
    minGP: 6,
  },
  buylow: {
    label: "Buy Low Targets",
    filters: [
      { key: "ppg", op: "lte", value: 14 },
      { key: "yards_per_carry", op: "gte", value: 4 },
    ],
    minGP: 6,
  },
  studs: {
    label: "Veteran Studs",
    filters: [
      { key: "age", op: "gte", value: 26 },
      { key: "age", op: "lte", value: 30 },
      { key: "ppg", op: "gte", value: 15 },
    ],
  },
  rookies: {
    label: "Rookies",
    filters: [
      { key: "age", op: "lte", value: 23 },
    ],
  },
  workhorses: {
    label: "Workhorses",
    filters: [
      { key: "snap_share", op: "gte", value: 65 },
      { key: "targets_per_game", op: "gte", value: 4 },
    ],
    minGP: 6,
  },
  sleepers: {
    label: "Sleepers",
    filters: [
      { key: "ppg", op: "lte", value: 12 },
      { key: "snap_share", op: "gte", value: 40 },
    ],
    minGP: 4,
  },
};

function applySmartFilter(key) {
  if (!key) return;
  const preset = SMART_FILTERS[key];
  if (!preset) return;
  // Clear existing filters and apply preset
  state.filters = [...preset.filters];
  if (preset.minGP) {
    state.minGP = preset.minGP;
    const inp = document.getElementById("minGPInput");
    if (inp) inp.value = preset.minGP;
  }
  state.offset = 0;
  renderActiveFilters();
  fetchAndRender();
  _showToast("smart filter: " + preset.label);
}

function toggleColumn(key, checked) {
  const colArray = isProspectView() ? "prospectColumns" : state.universe === "college" ? "collegeColumns" : "visibleColumns";
  const colDefs = isProspectView() ? PROSPECT_COLUMNS : state.universe === "college" ? COLLEGE_COLUMNS : COLUMNS;

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
  const presets = isProspectView() ? PROSPECT_PRESETS : state.universe === "college" ? COLLEGE_PRESETS : PRESETS;
  container.innerHTML = Object.entries(presets).map(([key, preset]) =>
    `<button class="btn-chunky" onclick="applyPreset('${key}')">${preset.label}</button>`
  ).join("");
}

function applyPreset(key) {
  const presets = isProspectView() ? PROSPECT_PRESETS : state.universe === "college" ? COLLEGE_PRESETS : PRESETS;
  const preset = presets[key];
  if (!preset) return;

  if (isProspectView()) {
    state.prospectColumns = [...preset.columns];
  } else if (state.universe === "college") {
    state.collegeColumns = [...preset.columns];
  } else {
    state.visibleColumns = [...preset.columns];
  }
  renderColumnPicker();
  renderTable();
  saveStateToURL();
  _showToast("preset: " + preset.label);
}

function applyPresetFromToolbar(key) {
  if (!key) return;
  applyPreset(key);
  // Reset select to placeholder
  var sel = document.getElementById("presetSelect");
  if (sel) sel.value = "";
}

function populatePresetSelect() {
  var sel = document.getElementById("presetSelect");
  if (!sel) return;
  var presets = isProspectView() ? PROSPECT_PRESETS : state.universe === "college" ? COLLEGE_PRESETS : PRESETS;
  var html = '<option value="">Preset...</option>';
  for (var key in presets) {
    if (presets.hasOwnProperty(key)) {
      html += '<option value="' + key + '">' + presets[key].label + '</option>';
    }
  }
  sel.innerHTML = html;
}

// ─── Saved views (toolbar dropdown) ──────────────────────────────
function populateSavedViewSelect() {
  var sel = document.getElementById("savedViewSelect");
  if (!sel) return;
  var views = getSavedViews();
  var html = '<option value="">Saved Views...</option>';
  for (var i = 0; i < views.length; i++) {
    html += '<option value="' + escapeAttr(views[i].id || String(i)) + '">' + escapeHtml(views[i].name) + '</option>';
  }
  if (views.length > 0) {
    html += '<option value="__manage__">Manage views...</option>';
  }
  sel.innerHTML = html;
}

// ─── URL state ───────────────────────────────────────────────────
function saveStateToURL() {
  const params = new URLSearchParams();

  if (state.universe !== "nfl") params.set("u", state.universe);
  if (state.universe === "college" && state.collegeView === "prospects") params.set("cv", "prospects");
  if (state.position !== "ALL") params.set("pos", state.position);
  if (state.search) params.set("q", state.search);
  if (state.sortDir !== "desc") params.set("dir", state.sortDir);
  if (state.offset > 0) params.set("offset", state.offset);
  if (state.filters.length) params.set("filters", JSON.stringify(state.filters));
  if (state.teams.length) params.set("teams", state.teams.join(","));
  if (state.minGP > 0) params.set("min_gp", state.minGP);
  if (state.sortKey2) { params.set("sort2", state.sortKey2); if (state.sortDir2 !== "desc") params.set("dir2", state.sortDir2); }
  if (state.heatColors) params.set("heat", "1");
  if (state.percentileMode) params.set("pctl", "1");
  if (state.dataBars) params.set("bars", "1");
  if (state.leaderBadges) params.set("leaders", "1");
  if (state.tierBreaks) params.set("tiers", "1");
  if (state.density) params.set("dense", "1");
  if (!state.groupHeaders) params.set("groups", "0");
  if (state.summaryBar) params.set("summary", "1");
  if (state.tagFilter) params.set("tagged", "1");
  if (state.pinnedPlayers.length) params.set("pins", state.pinnedPlayers.join(","));
  if (state.diffMode) params.set("diff", "1");

  if (isProspectView()) {
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
    if (state.week > 0) params.set("week", state.week);
    if (state.relevance !== "fantasy") params.set("rel", state.relevance);
    if (state.sortKey !== "fantasy_points_ppr") params.set("sort", state.sortKey);
    const defaultCols = PRESETS.ppr.columns.join(",");
    const currentCols = state.visibleColumns.join(",");
    if (currentCols !== defaultCols) params.set("cols", currentCols);
  }

  const qs = params.toString();
  const newURL = window.location.pathname + (qs ? "?" + qs : "");
  history.replaceState(null, "", newURL);

  // Auto-save key state to localStorage for restore on next visit
  try {
    localStorage.setItem("razzle_last_state", JSON.stringify({
      universe: state.universe, collegeView: state.collegeView,
      position: state.position, sortKey: state.sortKey, sortDir: state.sortDir,
      season: state.season, week: state.week, collegeSeason: state.collegeSeason, draftYear: state.draftYear,
      relevance: state.relevance, limit: state.limit,
      visibleColumns: state.visibleColumns, collegeColumns: state.collegeColumns,
      prospectColumns: state.prospectColumns,
      filters: state.filters
    }));
  } catch(e) {}
}

function loadStateFromURL() {
  const params = new URLSearchParams(window.location.search);

  // If no URL params, try to restore last state from localStorage
  if (!params.toString()) {
    try {
      var saved = JSON.parse(localStorage.getItem("razzle_last_state"));
      if (saved) {
        if (saved.universe) state.universe = saved.universe;
        if (saved.collegeView) state.collegeView = saved.collegeView;
        if (saved.position) state.position = saved.position;
        // Validate sortKey against universe columns
        var _savedCols = (saved.universe === "college" && saved.collegeView === "prospects") ? PROSPECT_COLUMNS : (saved.universe === "college" ? COLLEGE_COLUMNS : COLUMNS);
        if (saved.sortKey && _savedCols[saved.sortKey]) state.sortKey = saved.sortKey;
        if (saved.sortDir) state.sortDir = saved.sortDir;
        if (saved.season) state.season = saved.season;
        // Only restore week for NFL universe
        if (saved.week && saved.universe !== "college") state.week = parseInt(saved.week) || 0;
        if (saved.collegeSeason) state.collegeSeason = saved.collegeSeason;
        if (saved.draftYear) state.draftYear = saved.draftYear;
        if (saved.relevance) state.relevance = saved.relevance;
        if (saved.limit) state.limit = saved.limit;
        if (saved.visibleColumns && saved.visibleColumns.length) state.visibleColumns = saved.visibleColumns.filter(function(k) { return COLUMNS[k]; });
        if (saved.collegeColumns && saved.collegeColumns.length) state.collegeColumns = saved.collegeColumns.filter(function(k) { return COLLEGE_COLUMNS[k]; });
        if (saved.prospectColumns && saved.prospectColumns.length) state.prospectColumns = saved.prospectColumns.filter(function(k) { return PROSPECT_COLUMNS[k]; });
        if (saved.filters && Array.isArray(saved.filters)) {
          state.filters = saved.filters.filter(function(f) {
            return f && typeof f.key === "string" && typeof f.op === "string" && !isNaN(parseFloat(f.value));
          }).map(function(f) { return { key: f.key, op: f.op, value: parseFloat(f.value) }; });
        }
      }
    } catch(e) {}
  }

  if (params.has("u")) {
    const uParam = params.get("u");
    if (uParam === "prospects") {
      state.universe = "college";
      state.collegeView = "prospects";
    } else if (uParam === "nfl" || uParam === "college") {
      state.universe = uParam;
    }
  }
  if (params.has("cv")) {
    const cv = params.get("cv");
    if (cv === "stats" || cv === "prospects") state.collegeView = cv;
  }
  if (params.has("pos")) {
    var posVal = params.get("pos").toUpperCase();
    if (["ALL","QB","RB","WR","TE","K","DEF","DL","LB","DB"].indexOf(posVal) !== -1) state.position = posVal;
  }
  if (params.has("q")) state.search = params.get("q");
  if (params.has("sort")) {
    var _sk = params.get("sort");
    if (COLUMNS[_sk] || COLLEGE_COLUMNS[_sk] || PROSPECT_COLUMNS[_sk]) state.sortKey = _sk;
  }
  if (params.has("dir")) { var dv = params.get("dir"); if (dv === "asc" || dv === "desc") state.sortDir = dv; }
  if (params.has("sort2")) {
    var _sk2 = params.get("sort2");
    if (_sk2 === "" || COLUMNS[_sk2] || COLLEGE_COLUMNS[_sk2] || PROSPECT_COLUMNS[_sk2]) state.sortKey2 = _sk2;
  }
  if (params.has("dir2")) { var d2v = params.get("dir2"); if (d2v === "asc" || d2v === "desc") state.sortDir2 = d2v; }
  if (params.has("offset")) state.offset = Math.max(0, parseInt(params.get("offset")) || 0);
  if (params.has("filters")) {
    try {
      var parsed = JSON.parse(params.get("filters"));
      // Validate: each filter must have string key, string op, numeric value
      state.filters = Array.isArray(parsed) ? parsed.filter(function(f) {
        return f && typeof f.key === "string" && typeof f.op === "string" && !isNaN(parseFloat(f.value));
      }).map(function(f) { return { key: f.key, op: f.op, value: parseFloat(f.value) }; }) : [];
    } catch (e) { state.filters = []; }
  }
  if (params.has("teams")) {
    state.teams = params.get("teams").split(",").filter(t => t);
  }
  if (params.has("min_gp")) {
    state.minGP = parseInt(params.get("min_gp")) || 0;
  }
  if (params.has("heat")) {
    state.heatColors = params.get("heat") === "1";
  } else {
    // Fall back to localStorage preference
    state.heatColors = (function() { try { return localStorage.getItem("razzle_heat_colors") === "1"; } catch(e) { return false; } })();
  }
  if (params.has("pctl")) {
    state.percentileMode = params.get("pctl") === "1";
  }
  if (params.has("bars")) {
    state.dataBars = params.get("bars") === "1";
  }
  if (params.has("leaders")) {
    state.leaderBadges = params.get("leaders") === "1";
  }
  if (params.has("tiers")) {
    state.tierBreaks = params.get("tiers") === "1";
  }
  if (params.has("dense")) {
    state.density = params.get("dense") === "1";
  }
  if (params.has("groups")) {
    state.groupHeaders = params.get("groups") !== "0";
  }
  if (params.has("summary")) {
    state.summaryBar = params.get("summary") === "1";
  }
  if (params.has("tagged")) {
    state.tagFilter = params.get("tagged") === "1";
  }
  if (params.has("pins")) {
    state.pinnedPlayers = params.get("pins").split(",").filter(Boolean);
    savePinnedPlayers();
  }
  if (params.get("diff") === "1" && state.pinnedPlayers.length >= 2) {
    state.diffMode = true;
  }
  // Smart filter from URL (e.g., ?sf=breakout)
  if (params.has("sf")) {
    var sfKey = params.get("sf");
    if (SMART_FILTERS[sfKey]) {
      var preset = SMART_FILTERS[sfKey];
      state.filters = [...preset.filters];
      if (preset.minGP) state.minGP = preset.minGP;
    }
  }

  if (isProspectView()) {
    if (params.has("draft_year")) state.draftYear = parseInt(params.get("draft_year")) || state.draftYear;
    if (!params.has("sort")) state.sortKey = "draft_pick";
    if (!params.has("dir")) state.sortDir = "asc";
    if (params.has("cols")) state.prospectColumns = params.get("cols").split(",").filter(function(k) { return PROSPECT_COLUMNS[k]; });
  } else if (state.universe === "college") {
    if (params.has("season")) state.collegeSeason = parseInt(params.get("season")) || state.collegeSeason;
    if (!params.has("sort")) state.sortKey = "total_yards";
    if (!params.has("dir")) state.sortDir = "desc";
    if (params.has("cols")) state.collegeColumns = params.get("cols").split(",").filter(function(k) { return COLLEGE_COLUMNS[k]; });
  } else {
    if (params.has("season")) {
      const sv = params.get("season");
      state.season = sv === "career" ? "career" : (parseInt(sv) || state.season);
    }
    if (params.has("week")) state.week = parseInt(params.get("week")) || 0;
    if (params.has("rel")) state.relevance = params.get("rel");
    if (params.has("cols")) state.visibleColumns = params.get("cols").split(",").filter(function(k) { return COLUMNS[k]; });
  }

  // Sync UI
  document.querySelectorAll(".chip[data-pos]").forEach(chip => {
    chip.classList.toggle("active", chip.dataset.pos === state.position);
  });

  if (state.relevance === "all") {
    const btn = document.getElementById("relevanceToggle");
    if (btn) { btn.textContent = "All Players"; btn.classList.add("active"); }
  }

  // Sync heat colors button — hide in non-NFL modes (sparse numeric data)
  const hcBtn = document.getElementById("heatColorsBtn");
  if (hcBtn) {
    const isNFL = state.universe === "nfl";
    hcBtn.style.display = isNFL ? "" : "none";
    if (state.heatColors && isNFL) {
      hcBtn.classList.add("active");
      hcBtn.style.borderColor = "var(--green)";
    } else {
      hcBtn.classList.remove("active");
      hcBtn.style.borderColor = "";
    }
  }

  // Sync percentile mode button
  const pmBtn = document.getElementById("percentileModeBtn");
  if (pmBtn) {
    const isNFL = state.universe === "nfl";
    pmBtn.style.display = isNFL ? "" : "none";
    if (state.percentileMode && isNFL) {
      pmBtn.classList.add("active");
      pmBtn.style.borderColor = "var(--pos-qb)";
    } else {
      pmBtn.classList.remove("active");
      pmBtn.style.borderColor = "";
    }
  }

  // Sync data bars button
  const dbBtn = document.getElementById("dataBarsBtn");
  if (dbBtn) {
    if (state.dataBars) {
      dbBtn.classList.add("active");
      dbBtn.style.borderColor = "var(--orange)";
    } else {
      dbBtn.classList.remove("active");
      dbBtn.style.borderColor = "";
    }
  }

  // Sync leader badges button
  const lbBtn = document.getElementById("leaderBadgesBtn");
  if (lbBtn) {
    if (state.leaderBadges) {
      lbBtn.classList.add("active");
      lbBtn.style.borderColor = "var(--yellow)";
    } else {
      lbBtn.classList.remove("active");
      lbBtn.style.borderColor = "";
    }
  }

  // Sync diff mode button — hide in non-NFL modes
  const dfBtn = document.getElementById("diffModeBtn");
  if (dfBtn) {
    const isNFL = state.universe === "nfl";
    dfBtn.style.display = isNFL ? "" : "none";
    if (state.diffMode && isNFL) {
      dfBtn.classList.add("active");
      dfBtn.style.borderColor = "var(--green)";
    } else {
      dfBtn.classList.remove("active");
      dfBtn.style.borderColor = "";
    }
  }
  // Render diff banner if active
  _renderDiffBanner();

  // Sync tier breaks button — hide in non-NFL modes
  const tbBtn = document.getElementById("tierBreaksBtn");
  if (tbBtn) {
    const isNFL = state.universe === "nfl";
    tbBtn.style.display = isNFL ? "" : "none";
    if (state.tierBreaks && isNFL) {
      tbBtn.classList.add("active");
      tbBtn.style.borderColor = "var(--orange)";
    } else {
      tbBtn.classList.remove("active");
      tbBtn.style.borderColor = "";
    }
  }

  // Sync density button
  const densBtn = document.getElementById("densityBtn");
  if (densBtn) {
    if (state.density) {
      densBtn.classList.add("active");
      densBtn.style.borderColor = "var(--blue)";
      document.body.classList.add("dense-mode");
    } else {
      densBtn.classList.remove("active");
      densBtn.style.borderColor = "";
      document.body.classList.remove("dense-mode");
    }
  }

  // Sync group headers button
  const grpBtn = document.getElementById("groupHeadersBtn");
  if (grpBtn) {
    if (state.groupHeaders) {
      grpBtn.classList.add("active");
      grpBtn.style.borderColor = "var(--blue)";
    } else {
      grpBtn.classList.remove("active");
      grpBtn.style.borderColor = "";
    }
  }

  // Sync summary bar button
  const sumBtn = document.getElementById("summaryBarBtn");
  if (sumBtn) {
    if (state.summaryBar) {
      sumBtn.classList.add("active");
      sumBtn.style.borderColor = "var(--blue)";
    } else {
      sumBtn.classList.remove("active");
      sumBtn.style.borderColor = "";
    }
  }

  // Sync smart filter dropdown — NFL only
  const sfSel = document.getElementById("smartFilterSelect");
  if (sfSel) sfSel.style.display = state.universe === "nfl" ? "" : "none";

  renderActiveFilters();
}

function openShareModal() {
  saveStateToURL();
  // If on a non-screener panel, include the panel parameter in the share URL
  var shareURL = window.location.href;
  if (typeof currentPanel !== 'undefined' && currentPanel && currentPanel !== 'screener') {
    var params = new URLSearchParams(window.location.search);
    params.set('panel', currentPanel);
    shareURL = window.location.origin + window.location.pathname + '?' + params.toString();
  }
  document.getElementById("shareOverlay").classList.add("open");
  document.getElementById("shareURLInput").value = shareURL;
  document.getElementById("redditTitleInput").value = generateRedditTitle();
}

function closeShareModal(e) {
  if (e && e.target !== e.currentTarget) return;
  document.getElementById("shareOverlay").classList.remove("open");
}

function copyShareURLFromModal() {
  const input = document.getElementById("shareURLInput");
  const btn = document.getElementById("shareURLCopyBtn");
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(input.value).then(() => {
      btn.textContent = "Copied.";
      setTimeout(() => btn.textContent = "Copy URL", 1500);
    }).catch(function() {
      input.select(); document.execCommand("copy");
      btn.textContent = "Copied.";
      setTimeout(() => btn.textContent = "Copy URL", 1500);
    });
  } else {
    input.select(); document.execCommand("copy");
    btn.textContent = "Copied.";
    setTimeout(() => btn.textContent = "Copy URL", 1500);
  }
}

function copyRedditTitle() {
  const input = document.getElementById("redditTitleInput");
  const btn = document.getElementById("redditTitleCopyBtn");
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(input.value).then(() => {
      btn.textContent = "Copied.";
      setTimeout(() => btn.textContent = "Copy", 1500);
    }).catch(function() {
      input.select(); document.execCommand("copy");
      btn.textContent = "Copied.";
      setTimeout(() => btn.textContent = "Copy", 1500);
    });
  } else {
    input.select(); document.execCommand("copy");
    btn.textContent = "Copied.";
    setTimeout(() => btn.textContent = "Copy", 1500);
  }
}

function generateRedditTitle() {
  const preset = getCurrentPresetName();
  const season = state.season === "career" ? "Career" : (state.season || "Latest");
  const posFilter = state.position ? state.position.toUpperCase() : "";

  if (isProspectView()) {
    const year = state.draftYear || new Date().getFullYear();
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
  const name = (nameInput.value || "").trim();
  if (!name) { nameInput.style.borderColor = "var(--red)"; setTimeout(() => nameInput.style.borderColor = "", 1500); return; }

  const views = getSavedViews();
  if (views.length >= 20) { _showToast("max 20 saved views"); return; }

  const view = {
    id: Date.now().toString(36),
    name: name.substring(0, 40),
    createdAt: new Date().toISOString(),
    universe: state.universe,
    collegeView: state.collegeView,
    position: state.position,
    search: state.search,
    season: isProspectView() ? state.draftYear : state.universe === "college" ? state.collegeSeason : state.season,
    relevance: state.relevance,
    sortKey: state.sortKey,
    sortDir: state.sortDir,
    sortKey2: state.sortKey2,
    sortDir2: state.sortDir2,
    heatColors: state.heatColors,
    percentileMode: state.percentileMode,
    dataBars: state.dataBars,
    leaderBadges: state.leaderBadges,
    density: state.density,
    columnWidths: state.columnWidths ? JSON.parse(JSON.stringify(state.columnWidths)) : {},
    filters: JSON.parse(JSON.stringify(state.filters)),
    columns: isProspectView() ? [...state.prospectColumns] : state.universe === "college" ? [...state.collegeColumns] : [...state.visibleColumns],
    week: state.week || 0,
    teams: state.teams ? [...state.teams] : [],
    minGP: state.minGP || 0,
    tierBreaks: !!state.tierBreaks,
    groupHeaders: !!state.groupHeaders,
    summaryBar: !!state.summaryBar,
    tagFilter: !!state.tagFilter,
  };

  views.unshift(view);
  try {
    localStorage.setItem("razzle_saved_views", JSON.stringify(views));
  } catch(e) {
    _showToast("couldn't save the view — storage might be full");
    return;
  }

  nameInput.value = "";
  populateSavedViewSelect();
  renderSavedViewsList();
  _pushViewsAfterChange();
  _showToast("view saved: " + name);
}

function loadSavedView(id) {
  if (id === "" || id === null) return;
  if (id === "__manage__") {
    openSavedViews();
    var sel = document.getElementById("savedViewSelect");
    if (sel) sel.value = "";
    return;
  }
  const views = getSavedViews();
  const view = views.find(v => v.id === id);
  if (!view) return;

  // Apply state (map legacy "prospects" universe to college + prospects sub-view)
  state.universe = (view.universe === "prospects") ? "college" : (view.universe || "nfl");
  state.collegeView = (view.universe === "prospects" || view.collegeView === "prospects") ? "prospects" : "stats";
  state.position = view.position || "ALL";
  state.search = view.search || "";
  // Validate sortKey against current universe columns
  var _colsForView = isProspectView() ? PROSPECT_COLUMNS : (state.universe === "college" ? COLLEGE_COLUMNS : COLUMNS);
  var _defaultSort = isProspectView() ? "draft_pick" : (state.universe === "college" ? "total_yards" : "fantasy_points_ppr");
  state.sortKey = (view.sortKey && _colsForView[view.sortKey]) ? view.sortKey : _defaultSort;
  state.sortDir = view.sortDir || "desc";
  state.sortKey2 = (view.sortKey2 && _colsForView[view.sortKey2]) ? view.sortKey2 : "";
  state.sortDir2 = view.sortDir2 || "desc";
  state.filters = view.filters ? [...view.filters] : [];
  state.relevance = view.relevance || "fantasy";

  // Visual state
  if (view.heatColors !== undefined) state.heatColors = view.heatColors;
  if (view.percentileMode !== undefined) state.percentileMode = view.percentileMode;
  if (view.dataBars !== undefined) state.dataBars = view.dataBars;
  if (view.leaderBadges !== undefined) state.leaderBadges = view.leaderBadges;
  if (view.density !== undefined) state.density = view.density;
  if (view.columnWidths) state.columnWidths = view.columnWidths;
  if (view.week !== undefined) state.week = view.week;
  if (view.teams) state.teams = [...view.teams];
  if (view.minGP !== undefined) state.minGP = view.minGP;
  if (view.tierBreaks !== undefined) state.tierBreaks = view.tierBreaks;
  if (view.groupHeaders !== undefined) state.groupHeaders = view.groupHeaders;
  if (view.summaryBar !== undefined) state.summaryBar = view.summaryBar;
  if (view.tagFilter !== undefined) state.tagFilter = view.tagFilter;

  // Legacy column arrays (old format) + new format — validate against universe
  if (view.columns) {
    if (isProspectView()) {
      if (view.season) state.draftYear = view.season;
      state.prospectColumns = view.columns.filter(function(k) { return PROSPECT_COLUMNS[k]; });
    } else if (state.universe === "college") {
      if (view.season) state.collegeSeason = view.season;
      state.collegeColumns = view.columns.filter(function(k) { return COLLEGE_COLUMNS[k]; });
    } else {
      if (view.season !== undefined) state.season = view.season;
      state.visibleColumns = view.columns.filter(function(k) { return COLUMNS[k]; });
    }
  } else {
    // Legacy format with separate column arrays
    if (view.visibleColumns) state.visibleColumns = view.visibleColumns.filter(k => COLUMNS[k]);
    if (view.collegeColumns) state.collegeColumns = view.collegeColumns.filter(k => COLLEGE_COLUMNS[k]);
    if (view.prospectColumns) state.prospectColumns = view.prospectColumns.filter(k => PROSPECT_COLUMNS[k]);
    if (view.season !== undefined) state.season = view.season;
    if (view.collegeSeason !== undefined) state.collegeSeason = view.collegeSeason;
    if (view.draftYear !== undefined) state.draftYear = view.draftYear;
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
  renderColumnPicker();
  renderPresets();
  populatePresetSelect();
  populateSavedViewSelect();
  renderActiveFilters();
  saveStateToURL();

  state.offset = 0;
  closeSavedViews();
  fetchAndRender();
  _showToast("loaded: " + view.name);
}

function deleteSavedView(id) {
  if (!confirm("Delete this saved view?")) return;
  const views = getSavedViews().filter(v => v.id !== id);
  try { localStorage.setItem("razzle_saved_views", JSON.stringify(views)); } catch(e) {}
  populateSavedViewSelect();
  renderSavedViewsList();
  _pushViewsAfterChange();
  _showToast("view deleted");
}

// ── Saved Views Cloud Sync (Pro+ feature) ────────────────────────

function syncSavedViewsFromCloud() {
  var token = localStorage.getItem("razzle_token");
  if (!token) return;
  if (typeof isPaidUser === "function" && !isPaidUser()) {
    _showViewsSyncHint(false);
    return;
  }

  var base = (typeof API_BASE !== "undefined" ? API_BASE : "");
  fetch(base + "/api/user/views", {
    headers: { "Authorization": "Bearer " + token }
  }).then(function(r) {
    if (!r.ok) throw new Error("fetch failed");
    return r.json();
  }).then(function(data) {
    var serverViews = (data.views || []);
    if (!serverViews.length) {
      // No server views — push local to server
      _pushAllViewsToServer(token, base);
      _showViewsSyncHint(true);
      return;
    }

    // Parse server views
    var parsedServer = [];
    for (var i = 0; i < serverViews.length; i++) {
      try {
        var vd = typeof serverViews[i].data === "string" ? JSON.parse(serverViews[i].data) : serverViews[i].data;
        parsedServer.push(vd);
      } catch (e) { /* skip malformed */ }
    }

    // Merge: server wins on name conflict
    var localViews = getSavedViews();
    var mergedMap = {};
    for (var li = 0; li < localViews.length; li++) {
      mergedMap[localViews[li].name || localViews[li].id] = localViews[li];
    }
    for (var si = 0; si < parsedServer.length; si++) {
      mergedMap[parsedServer[si].name || parsedServer[si].id] = parsedServer[si];
    }

    var merged = [];
    for (var key in mergedMap) {
      merged.push(mergedMap[key]);
    }

    // Sort by createdAt descending
    merged.sort(function(a, b) {
      return (b.createdAt || "").localeCompare(a.createdAt || "");
    });

    // Cap at 20
    merged = merged.slice(0, 20);

    // Update localStorage
    try { localStorage.setItem("razzle_saved_views", JSON.stringify(merged)); } catch(e) {}

    // Push merged back to server
    _pushAllViewsToServer(token, base);

    // Re-render
    populateSavedViewSelect();
    renderSavedViewsList();
    _showViewsSyncHint(true);
  }).catch(function() {
    _showViewsSyncHint(true);
  });
}

function _pushAllViewsToServer(token, base) {
  var views = getSavedViews();
  if (!views.length) return;
  fetch(base + "/api/user/views/sync", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": "Bearer " + token },
    body: JSON.stringify({ views: views })
  }).catch(function() {});
}

function _pushViewsAfterChange() {
  var token = localStorage.getItem("razzle_token");
  if (!token) return;
  if (typeof isPaidUser === "function" && !isPaidUser()) return;
  var base = (typeof API_BASE !== "undefined" ? API_BASE : "");
  _pushAllViewsToServer(token, base);
}

function _showViewsSyncHint(isPaid) {
  var container = document.getElementById("savedViewsList");
  if (!container) return;
  var existing = document.getElementById("viewsSyncBadge");
  if (existing) existing.remove();

  var badge = document.createElement("div");
  badge.id = "viewsSyncBadge";
  badge.style.cssText = "font-family:var(--font-mono); font-size:9px; margin-bottom:6px; display:inline-block; padding:2px 8px; border-radius:4px;";

  if (isPaid) {
    badge.style.color = "var(--pos-qb)";
    badge.style.border = "2px solid var(--pos-qb)";
    badge.textContent = "cloud-synced";
  } else {
    badge.style.color = "var(--ink-light)";
    badge.style.border = "2px dashed var(--ink-faint)";
    badge.innerHTML = '<a href="/pricing.html" style="color:var(--ink-light);text-decoration:underline;">upgrade to sync views across devices</a>';
    badge.style.cursor = "pointer";
  }
  container.insertBefore(badge, container.firstChild);
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
    const dateStr = isNaN(date.getTime()) ? "" : date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const filterCount = (v.filters && v.filters.length) ? ` <span style="font-family:var(--font-mono); font-size:10px; color:var(--ink-light);">${v.filters.length} filter${v.filters.length > 1 ? "s" : ""}</span>` : "";

    return `<div style="display:flex; align-items:center; gap:10px; padding:10px 12px; border:2px solid var(--ink); border-radius:8px; margin-bottom:8px; background:var(--bg); cursor:pointer; transition:transform 0.1s, box-shadow 0.1s;" onmouseenter="this.style.transform='translate(-2px,-2px)';this.style.boxShadow='4px 4px 0 var(--ink)'" onmouseleave="this.style.transform='';this.style.boxShadow=''">
      <div style="flex:1; min-width:0;" onclick="loadSavedView('${escapeJS(v.id)}')">
        <div style="font-family:var(--font-mono); font-size:14px; font-weight:600; margin-bottom:4px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${escapeHtml(v.name)}</div>
        <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;">${universeBadge(v.universe)}${posBadge(v.position)}${filterCount}<span style="font-family:var(--font-mono); font-size:10px; color:var(--ink-light);">${dateStr}</span></div>
      </div>
      <button onclick="event.stopPropagation(); deleteSavedView('${escapeJS(v.id)}')" style="background:none; border:2px solid var(--ink-faint); border-radius:6px; padding:4px 8px; cursor:pointer; font-family:var(--font-mono); font-size:11px; color:var(--ink-light);" title="Delete view">✕</button>
    </div>`;
  }).join("");
}

// ─── Pinned players (sticky comparison rows) ─────────────────────
var _pinnedDataCache = (function() {
  try { return JSON.parse(localStorage.getItem('razzle_pinned_cache')) || {}; }
  catch(e) { return {}; }
})(); // player_id -> player object (persisted across page loads)

function savePinnedPlayers() {
  try {
    localStorage.setItem('razzle_pinned_players', JSON.stringify(state.pinnedPlayers));
    localStorage.setItem('razzle_pinned_cache', JSON.stringify(_pinnedDataCache));
  } catch(e) {}
}

function isPlayerPinned(playerId) {
  return state.pinnedPlayers.includes(playerId);
}

function togglePinPlayer(playerId) {
  if (state.universe !== "nfl") return;
  if (isPlayerPinned(playerId)) {
    state.pinnedPlayers = state.pinnedPlayers.filter(id => id !== playerId);
    delete _pinnedDataCache[playerId];
    // Auto-disable diff mode if fewer than 2 pins
    if (state.diffMode && state.pinnedPlayers.length < 2) {
      state.diffMode = false;
      var dBtn = document.getElementById("diffModeBtn");
      if (dBtn) { dBtn.classList.remove("active"); dBtn.style.borderColor = ""; }
      _renderDiffBanner();
    }
  } else {
    if (state.pinnedPlayers.length >= 5) return; // max 5 pinned
    var p = state.items.find(function(x) { return x.player_id === playerId; });
    if (p) _pinnedDataCache[playerId] = p;
    state.pinnedPlayers.push(playerId);
  }
  savePinnedPlayers();
  renderPinnedRows();
  renderVisibleRows(); // re-render to update pin icons
  saveStateToURL();
}

function clearAllPins() {
  state.pinnedPlayers = [];
  _pinnedDataCache = {};
  // Auto-disable diff mode
  if (state.diffMode) {
    state.diffMode = false;
    var dBtn = document.getElementById("diffModeBtn");
    if (dBtn) { dBtn.classList.remove("active"); dBtn.style.borderColor = ""; }
    _renderDiffBanner();
  }
  savePinnedPlayers();
  renderPinnedRows();
  renderVisibleRows();
  saveStateToURL();
}

function bulkPinSelected() {
  if (state.universe !== "nfl") { _showToast("pins: nfl only"); return; }
  var added = 0;
  for (var i = 0; i < state.selectedPlayers.length; i++) {
    var pid = state.selectedPlayers[i].player_id;
    if (!pid || isPlayerPinned(pid)) continue;
    if (state.pinnedPlayers.length >= 5) { _showToast("max 5 pins — " + added + " added"); break; }
    _pinnedDataCache[pid] = state.selectedPlayers[i];
    state.pinnedPlayers.push(pid);
    added++;
  }
  if (added === 0) { _showToast("all selected already pinned"); return; }
  savePinnedPlayers();
  renderPinnedRows();
  renderVisibleRows();
  saveStateToURL();
  _showToast(added + " player" + (added > 1 ? "s" : "") + " pinned");
}

function renderPinnedRows() {
  const pinnedBody = document.getElementById("pinnedBody");
  if (!pinnedBody) return;

  // Only show pins in NFL mode
  if (state.universe !== "nfl" || !state.pinnedPlayers.length) {
    pinnedBody.innerHTML = "";
    pinnedBody.style.display = "none";
    return;
  }

  const cols = getActiveColumns();
  const heatOn = state.heatColors;
  const pctMode = state.percentileMode;
  const pctData = (heatOn || pctMode) ? computePercentiles() : {};
  const barsOn = state.dataBars;
  if (barsOn) computeBarMaxes();
  const leadersOn = state.leaderBadges && !state.percentileMode;
  const leaderRanks = leadersOn ? computeLeaderRanks() : {};
  let html = "";

  var cacheUpdated = false;
  for (const pid of state.pinnedPlayers) {
    const fromItems = state.items.find(p => p.player_id === pid);
    const player = fromItems || _pinnedDataCache[pid];
    if (!player) continue;
    if (fromItems && _pinnedDataCache[pid] !== fromItems) {
      _pinnedDataCache[pid] = fromItems;
      cacheUpdated = true;
    } else if (!_pinnedDataCache[pid]) {
      _pinnedDataCache[pid] = player;
      cacheUpdated = true;
    }
    html += buildRowHTML(player, cols, heatOn, pctData, null, barsOn, pctMode, leaderRanks);
  }

  if (!html) {
    pinnedBody.innerHTML = "";
    pinnedBody.style.display = "none";
    return;
  }

  // Add a separator row at end
  const colCount = cols.length + 5 + (state.universe === "nfl" ? 1 : 0); // +star +checkbox +rank +player (+pin if NFL) (+add column btn)
  html += `<tr class="pinned-separator"><td colspan="${colCount}"></td></tr>`;

  pinnedBody.innerHTML = html;
  pinnedBody.style.display = "";

  // Persist cache if updated
  if (cacheUpdated) {
    try { localStorage.setItem('razzle_pinned_cache', JSON.stringify(_pinnedDataCache)); } catch(e) {}
  }

  // Inject sparklines for pinned rows
  if (cols.includes("trend") && Object.keys(_sparklineCache).length > 1) {
    injectSparklines();
  }
}

// ─── Pin Comparison Diff Mode ─────────────────────────────────────
function toggleDiffMode() {
  if (state.universe !== "nfl") { _showToast("diff mode: nfl only"); return; }
  if (state.pinnedPlayers.length < 2) {
    _showToast("pin 2+ players to use diff mode");
    return;
  }
  state.diffMode = !state.diffMode;
  var btn = document.getElementById("diffModeBtn");
  if (btn) { btn.classList.toggle("active", state.diffMode); btn.style.borderColor = state.diffMode ? "var(--green)" : ""; }
  // Show/hide diff banner
  _renderDiffBanner();
  if (state.diffMode) {
    _showToast("diff mode: comparing vs " + _getDiffBaselineName());
  } else {
    _showToast("diff mode: off");
  }
  renderPinnedRows();
  renderVisibleRows();
}

function _getDiffBaselineName() {
  if (!state.pinnedPlayers.length) return "";
  var baseId = state.pinnedPlayers[0];
  var p = state.items.find(function(pl) { return pl.player_id === baseId; }) || _pinnedDataCache[baseId];
  return p ? (p.full_name || p.player_name || "baseline") : "baseline";
}

var _diffBaselineCache = null;
var _diffBaselineCacheKey = "";
function _getDiffBaseline() {
  if (!state.diffMode || state.pinnedPlayers.length < 2) return null;
  var baseId = state.pinnedPlayers[0];
  var cacheKey = baseId + ":" + state.items.length + ":" + state.season + ":" + (state.week || 0);
  if (_diffBaselineCacheKey === cacheKey && _diffBaselineCache) return _diffBaselineCache;
  _diffBaselineCache = state.items.find(function(pl) { return pl.player_id === baseId; }) || _pinnedDataCache[baseId] || null;
  _diffBaselineCacheKey = cacheKey;
  return _diffBaselineCache;
}

function _renderDiffBanner() {
  var existing = document.getElementById("diffModeBanner");
  if (existing) existing.remove();
  if (!state.diffMode) return;
  var baseline = _getDiffBaseline();
  if (!baseline) return;
  var wrap = document.querySelector(".table-wrap");
  if (!wrap) return;
  var banner = document.createElement("div");
  banner.id = "diffModeBanner";
  banner.className = "diff-mode-banner";
  banner.innerHTML = '<span class="diff-mode-label">DIFF MODE</span> comparing all rows vs <strong>' + escapeHtml(baseline.full_name || baseline.player_name || "Unknown") + '</strong> (first pin) <button onclick="toggleDiffMode()" style="margin-left:8px; cursor:pointer; background:var(--ink); color:var(--bg); border:2px solid var(--ink); border-radius:6px; padding:2px 10px; font-family:var(--font-mono); font-size:11px;">OFF</button>';
  wrap.parentNode.insertBefore(banner, wrap);
}

function _formatDiffCell(val, baseVal, col, key) {
  if (val == null || baseVal == null || typeof val !== "number" || typeof baseVal !== "number") return null;
  var delta = val - baseVal;
  if (delta === 0) return '<span style="color:var(--ink-light);">\u2014</span>';
  var inv = INVERSE_STATS.has(key);
  // For inverse stats, negative delta (fewer turnovers) is good
  var isGood = inv ? delta < 0 : delta > 0;
  var color = isGood ? "var(--green)" : "var(--red)";
  var sign = delta > 0 ? "+" : "";
  var formatted;
  if (col.pct) {
    formatted = sign + (delta * 100).toFixed(col.decimals != null ? col.decimals : 1) + "%";
  } else {
    formatted = sign + delta.toFixed(col.decimals != null ? col.decimals : 1);
  }
  return '<span style="color:' + color + '; font-weight:600;">' + formatted + '</span>';
}

// ─── Player selection (for compare/charts) ───────────────────────
function toggleSelectAll(checked) {
  if (checked) {
    // Select all visible players (up to compare limit)
    state.selectedPlayers = [];
    const max = Math.min(state.items.length, _getCompareLimit());
    for (let i = 0; i < max; i++) {
      const p = state.items[i];
      const pid = p.player_id || p.player_name;
      state.selectedPlayers.push({
        player_id: pid,
        full_name: p.full_name || p.player_name,
        player_name: p.player_name,
        position: p.position,
        team: p.team || p.school || "",
      });
    }
  } else {
    state.selectedPlayers = [];
  }
  updateSelectionUI();
  renderTable();
}

function _getCompareLimit() {
  // Free: 2 players, Pro/Elite: 4 players
  if (typeof isPaidUser === "function" && isPaidUser()) return 4;
  return 2;
}

function togglePlayerSelect(playerId, checked) {
  if (checked) {
    var maxPlayers = _getCompareLimit();
    if (state.selectedPlayers.length >= maxPlayers) {
      // Show upgrade nudge for free users
      if (maxPlayers <= 2) {
        if (typeof _showToast === "function") {
          _showToast("compare up to 4 players with Pro");
        }
      }
      return;
    }
    if (isProspectView()) {
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
  _rebuildSelectedSet();
  updateSelectionUI();
}

function updateSelectionUI() {
  const count = state.selectedPlayers.length;
  const bar = document.getElementById("bulkActionBar");
  if (bar) {
    if (count > 0) {
      bar.style.display = "";
      var posColors = { QB: "var(--pos-qb)", RB: "var(--pos-rb)", WR: "var(--pos-wr)", TE: "var(--pos-te)" };
      var posCounts = {};
      for (var i = 0; i < state.selectedPlayers.length; i++) {
        var pp = (state.selectedPlayers[i].position || "").toUpperCase();
        if (pp) posCounts[pp] = (posCounts[pp] || 0) + 1;
      }
      var posBadges = ["QB", "RB", "WR", "TE"].filter(function(p) { return posCounts[p]; }).map(function(p) {
        return '<span style="color:' + posColors[p] + '; font-weight:700; font-size:11px;">' + p + ':' + posCounts[p] + '</span>';
      }).join(" ");
      document.getElementById("bulkCount").innerHTML = count + " selected" + (posBadges ? ' <span style="margin-left:6px;">' + posBadges + '</span>' : "");
      var namesEl = document.getElementById("bulkNames");
      namesEl.textContent = state.selectedPlayers.map(p => p.full_name || p.player_name || "").join(", ");
      var cmpBtn = document.getElementById("bulkCompareBtn");
      if (cmpBtn) { cmpBtn.disabled = count < 2; cmpBtn.style.opacity = count < 2 ? "0.5" : "1"; }
      var pinBtn = document.getElementById("bulkPinBtn");
      if (pinBtn) { pinBtn.style.display = state.universe === "nfl" ? "" : "none"; }
      // Quick compare strip: show for exactly 2 selected players
      var strip = document.getElementById("quickCompareStrip");
      if (strip) {
        if (count === 2) {
          namesEl.style.display = "none";
          strip.style.display = "";
          renderQuickCompare(strip);
        } else {
          namesEl.style.display = "";
          strip.style.display = "none";
        }
      }
    } else {
      bar.style.display = "none";
    }
  }
  updateResultCount();
  // Persist Lab context for Situation Room agent bridge
  saveLabContext();
}

function renderQuickCompare(container) {
  var sp = state.selectedPlayers;
  if (sp.length !== 2) return;
  var a = state.items.find(function(p) { return p.player_id === sp[0].player_id; });
  var b = state.items.find(function(p) { return p.player_id === sp[1].player_id; });
  if (!a || !b) { container.innerHTML = ""; return; }

  // Key stats to compare (universe-aware)
  var stats = state.universe === "college" ? [
    { key: "total_yards", label: "Yds", dec: 0 },
    { key: "total_tds", label: "TD", dec: 0 },
    { key: "games", label: "GP", dec: 0 },
    { key: "rec_yards", label: "RecYd", dec: 0 },
    { key: "rush_yards", label: "RshYd", dec: 0 },
    { key: "receptions", label: "Rec", dec: 0 },
    { key: "carries", label: "Car", dec: 0 },
    { key: "pass_yards", label: "PassYd", dec: 0 },
  ] : [
    { key: "ppg", label: "PPG", dec: 1 },
    { key: "games", label: "GP", dec: 0 },
    { key: "fantasy_points_ppr", label: "FPts", dec: 0 },
    { key: "receiving_yards", label: "RecYd", dec: 0 },
    { key: "rushing_yards", label: "RshYd", dec: 0 },
    { key: "touchdowns", label: "TD", dec: 0 },
    { key: "targets", label: "Tgt", dec: 0 },
    { key: "receptions", label: "Rec", dec: 0 },
  ];

  var nameA = escapeHtml(a.full_name || a.player_name || "");
  var nameB = escapeHtml(b.full_name || b.player_name || "");
  var posA = (a.position || "").toUpperCase();
  var posB = (b.position || "").toUpperCase();
  var posColors = { QB: "var(--pos-qb)", RB: "var(--pos-rb)", WR: "var(--pos-wr)", TE: "var(--pos-te)" };

  var html = '<span style="font-weight:700; color:' + (posColors[posA] || "var(--ink)") + '; font-size:11px;">' + nameA + '</span>';
  html += ' <span style="color:var(--ink-light); font-size:10px;">vs</span> ';
  html += '<span style="font-weight:700; color:' + (posColors[posB] || "var(--ink)") + '; font-size:11px;">' + nameB + '</span>';
  html += ' <span style="color:var(--ink-faint);">|</span> ';

  for (var i = 0; i < stats.length; i++) {
    var s = stats[i];
    var va = parseFloat(a[s.key]);
    var vb = parseFloat(b[s.key]);
    if (isNaN(va) && isNaN(vb)) continue;
    va = isNaN(va) ? 0 : va;
    vb = isNaN(vb) ? 0 : vb;
    var winner = va > vb ? "a" : vb > va ? "b" : "";
    var colorA = winner === "a" ? "font-weight:700; color:var(--green);" : "";
    var colorB = winner === "b" ? "font-weight:700; color:var(--green);" : "";
    html += '<span style="font-size:10px; color:var(--ink-light); margin:0 2px;">' + s.label + '</span>';
    html += '<span style="font-size:11px; ' + colorA + '">' + va.toFixed(s.dec) + '</span>';
    html += '<span style="color:var(--ink-faint); font-size:9px;">/</span>';
    html += '<span style="font-size:11px; ' + colorB + '">' + vb.toFixed(s.dec) + '</span> ';
  }

  container.innerHTML = html;
}

function clearSelection() {
  state.selectedPlayers = [];
  updateSelectionUI();
  renderTable();
}

function saveLabContext() {
  try {
    const KEY_STATS = [
      "fantasy_points_ppr", "ppg", "games", "receptions", "targets", "receiving_yards",
      "receiving_tds", "carries", "rushing_yards", "rushing_tds",
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
  const presets = isProspectView() ? PROSPECT_PRESETS : state.universe === "college" ? COLLEGE_PRESETS : PRESETS;
  for (const [name, preset] of Object.entries(presets)) {
    const cols = isProspectView() ? state.prospectColumns : state.universe === "college" ? state.collegeColumns : state.visibleColumns;
    if (JSON.stringify(preset.columns) === JSON.stringify(cols)) return preset.label;
  }
  return "Custom";
}

// ─── Formula columns integration ─────────────────────────────────
const DEV_FORMULA_NAMES = new Set(["yerrr", "testing"]);

function loadFormulas() {
  try {
    const raw = JSON.parse(localStorage.getItem("razzle_formulas") || "[]");
    // Filter out dev/test formulas
    state.formulas = raw.filter(f => f && f.name && !DEV_FORMULA_NAMES.has(f.name.toLowerCase()));
    // Clean them from storage too
    if (state.formulas.length < raw.length) {
      localStorage.setItem("razzle_formulas", JSON.stringify(state.formulas));
    }
  } catch (e) {
    state.formulas = [];
  }
  // Register formula columns
  for (const formula of state.formulas) {
    const key = `formula_${formula.name.toLowerCase().replace(/[^a-z0-9]/g, "_")}`;
    COLUMNS[key] = { label: escapeHtml(formula.name), group: "Formulas", decimals: 1 };
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

// ─── Custom Scoring Builder ──────────────────────────────────────
const SCORING_STATS = [
  { key: "passing_yards", label: "Pass Yards", default: 0.04 },
  { key: "passing_tds", label: "Pass TDs", default: 4 },
  { key: "interceptions", label: "Interceptions", default: -2 },
  { key: "rushing_yards", label: "Rush Yards", default: 0.1 },
  { key: "rushing_tds", label: "Rush TDs", default: 6 },
  { key: "receptions", label: "Receptions", default: 1 },
  { key: "receiving_yards", label: "Rec Yards", default: 0.1 },
  { key: "receiving_tds", label: "Rec TDs", default: 6 },
  { key: "fumbles_lost", label: "Fumbles Lost", default: -2 },
  { key: "passing_2pt_conversions", label: "Pass 2PT", default: 2 },
  { key: "rushing_2pt_conversions", label: "Rush 2PT", default: 2 },
  { key: "receiving_2pt_conversions", label: "Rec 2PT", default: 2 },
];

function getCustomScoringConfigs() {
  try { return JSON.parse(localStorage.getItem("razzle_custom_scoring") || "[]"); }
  catch { return []; }
}

function saveCustomScoringConfigs(configs) {
  try { localStorage.setItem("razzle_custom_scoring", JSON.stringify(configs)); } catch(e) {}
}

function openCustomScoring() {
  const overlay = document.getElementById("customScoringOverlay");
  overlay.classList.add("open");
  renderScoringWeights();
  populateScoringSelect();
}

function closeCustomScoring(e) {
  if (e && e.target !== e.currentTarget) return;
  document.getElementById("customScoringOverlay").classList.remove("open");
}

function renderScoringWeights(weights) {
  const container = document.getElementById("customScoringWeights");
  container.innerHTML = SCORING_STATS.map(s => {
    const val = weights ? (weights[s.key] !== undefined ? weights[s.key] : 0) : s.default;
    return `<div style="display:flex; align-items:center; gap:8px; margin-bottom:6px;">
      <label style="flex:1; font-family:var(--font-mono); font-size:12px;">${s.label}</label>
      <input type="number" step="0.01" data-stat="${s.key}" value="${val}"
        style="width:70px; font-family:var(--font-mono); font-size:12px; padding:4px 6px;
               border:2px solid var(--ink); border-radius:4px; background:var(--bg); color:var(--ink); text-align:right;">
    </div>`;
  }).join("");
}

function populateScoringSelect() {
  const sel = document.getElementById("customScoringSelect");
  const configs = getCustomScoringConfigs();
  sel.innerHTML = '<option value="">Load saved...</option>' +
    configs.map((c, i) => `<option value="${i}">${escapeHtml(c.name)}</option>`).join("");
}

function loadCustomScoringConfig(idx) {
  if (idx === "") return;
  const configs = getCustomScoringConfigs();
  const config = configs[parseInt(idx)];
  if (!config) return;
  document.getElementById("customScoringName").value = config.name;
  renderScoringWeights(config.weights);
}

function saveCustomScoring() {
  const name = document.getElementById("customScoringName").value.trim();
  if (!name) { _showToast("give it a name first"); return; }

  const weights = {};
  document.querySelectorAll("#customScoringWeights input[data-stat]").forEach(el => {
    weights[el.dataset.stat] = parseFloat(el.value) || 0;
  });

  let configs = getCustomScoringConfigs();
  const existIdx = configs.findIndex(c => c.name === name);
  if (existIdx >= 0) {
    configs[existIdx].weights = weights;
  } else {
    if (configs.length >= 3) {
      _showToast("max 3 configs. delete one first.");
      return;
    }
    configs.push({ name, weights });
  }
  saveCustomScoringConfigs(configs);
  populateScoringSelect();

  // Register column + compute values + add to visible columns
  const colKey = `custom_${name.toLowerCase().replace(/[^a-z0-9]/g, "_")}`;
  COLUMNS[colKey] = { label: name, group: "Custom Scoring", decimals: 1, derived: true,
    tip: "Custom scoring: " + Object.entries(weights).filter(([,v]) => v !== 0).map(([k,v]) => `${v} × ${k.replace(/_/g, " ")}`).join(", ") };

  // Compute for current items
  computeCustomScoringValues();

  // Add to visible columns if not already there
  if (!state.visibleColumns.includes(colKey)) {
    state.visibleColumns.push(colKey);
  }

  renderColumnPicker();
  renderTable();
  saveStateToURL();
  closeCustomScoring();
}

function deleteCustomScoring() {
  const sel = document.getElementById("customScoringSelect");
  const idx = parseInt(sel.value);
  if (isNaN(idx)) { _showToast("pick a config to delete first."); return; }
  const configs = getCustomScoringConfigs();
  const config = configs[idx];
  if (!config) return;

  // Remove column from visible columns
  const colKey = `custom_${config.name.toLowerCase().replace(/[^a-z0-9]/g, "_")}`;
  state.visibleColumns = state.visibleColumns.filter(c => c !== colKey);
  delete COLUMNS[colKey];

  configs.splice(idx, 1);
  saveCustomScoringConfigs(configs);
  populateScoringSelect();
  document.getElementById("customScoringName").value = "";
  renderScoringWeights();
  renderColumnPicker();
  renderTable();
}

function computeCustomScoringValues() {
  const configs = getCustomScoringConfigs();
  for (const config of configs) {
    const colKey = `custom_${config.name.toLowerCase().replace(/[^a-z0-9]/g, "_")}`;
    for (const player of state.items) {
      let score = 0;
      for (const [stat, weight] of Object.entries(config.weights)) {
        const val = player[stat];
        if (val !== null && val !== undefined) {
          score += val * weight;
        }
      }
      player[colKey] = Math.round(score * 10) / 10;
    }
  }
}

function loadCustomScoringColumns() {
  // Called on init — register saved configs as columns
  const configs = getCustomScoringConfigs();
  for (const config of configs) {
    const colKey = `custom_${config.name.toLowerCase().replace(/[^a-z0-9]/g, "_")}`;
    COLUMNS[colKey] = { label: config.name, group: "Custom Scoring", decimals: 1, derived: true,
      tip: "Custom scoring: " + Object.entries(config.weights).filter(([,v]) => v !== 0).map(([k,v]) => `${v} × ${k.replace(/_/g, " ")}`).join(", ") };
  }
}

// ─── Non-applicable stats per position (show "—" instead of 0) ──
// If a player has 0 in a stat that's not primary for their position, show dash.
// Only applies to counting stats — derived/rate stats handled by null.
const NON_PRIMARY_STATS = {
  QB: new Set(["receptions", "receiving_yards", "receiving_tds", "targets",
               "receiving_air_yards", "receiving_yards_after_catch", "receiving_first_downs"]),
  RB: new Set(["passing_yards", "passing_tds", "completions", "attempts",
               "interceptions", "passing_air_yards", "passing_first_downs",
               "sacks_taken", "sack_yards_lost"]),
  WR: new Set(["passing_yards", "passing_tds", "completions", "attempts",
               "interceptions", "passing_air_yards", "passing_first_downs",
               "sacks_taken", "sack_yards_lost"]),
  TE: new Set(["passing_yards", "passing_tds", "completions", "attempts",
               "interceptions", "passing_air_yards", "passing_first_downs",
               "sacks_taken", "sack_yards_lost"]),
};

function isNonApplicableStat(pos, statKey, value) {
  const nonPrimary = NON_PRIMARY_STATS[pos];
  if (!nonPrimary) return false;
  // Only show dash if value is 0 or null AND stat is non-primary for position
  return nonPrimary.has(statKey) && (value === 0 || value === null || value === undefined);
}

// ─── Percentile heat coloring ────────────────────────────────────
// Stats where lower is better (inverted coloring: low = green, high = red)
const INVERSE_STATS = new Set([
  "interceptions", "turnovers", "fumbles", "fumbles_lost",
  "sacks_taken", "sack_yards_lost", "fumble_rate", "drop_rate",
  "garbage_time_pct", "games_missed",
]);

// Cache percentile data — recomputed when items change
let _percentileCache = null;
let _percentileCacheKey = "";

function computePercentiles() {
  const items = state.items;
  if (!items.length) return {};
  const cols = getActiveColumns();
  // Cache key: item count + first/last player IDs + active columns
  const cacheKey = items.length + "|" + (items[0].player_id || "") + "|" + (items[items.length - 1].player_id || "") + "|" + cols.join(",");
  if (_percentileCacheKey === cacheKey && _percentileCache) return _percentileCache;

  const result = {}; // player_id -> { col_key: percentile (0-100) }

  // Binary search: count of values < target in sorted array
  function countBelow(arr, val) {
    let lo = 0, hi = arr.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (arr[mid] < val) lo = mid + 1;
      else hi = mid;
    }
    return lo;
  }

  for (const key of cols) {
    const col = getColumnDef(key);
    if (!col || col.isText || key === "pos_rank" || key === "age") continue;

    // Group values by position for per-position percentiles
    const byPos = {};
    for (const p of items) {
      const pos = (p.position || "").toUpperCase();
      const val = p[key];
      if (val == null || val === "" || (typeof val !== "number")) continue;
      if (!byPos[pos]) byPos[pos] = [];
      byPos[pos].push(val);
    }

    // Sort each position group
    const inverted = INVERSE_STATS.has(key);
    for (const pos in byPos) {
      byPos[pos].sort(function(a, b) { return a - b; });
    }

    // Calculate percentile for each player using binary search
    for (const p of items) {
      const pos = (p.position || "").toUpperCase();
      const val = p[key];
      if (val == null || val === "" || (typeof val !== "number")) continue;
      const arr = byPos[pos];
      if (!arr || arr.length < 3) continue;

      const below = countBelow(arr, val);
      let pct = arr.length > 1 ? (below / (arr.length - 1)) * 100 : 50;
      if (inverted) pct = 100 - pct;

      const pid = p.player_id || p.player_name;
      if (!result[pid]) result[pid] = {};
      result[pid][key] = pct;
    }
  }

  _percentileCache = result;
  _percentileCacheKey = cacheKey;
  return result;
}

function getHeatColor(pct) {
  var isDark = document.documentElement.getAttribute("data-theme") === "dark";
  if (isDark) {
    // Higher opacity for dark espresso background
    if (pct >= 90) return "rgba(46, 196, 182, 0.35)";
    if (pct >= 75) return "rgba(46, 196, 182, 0.20)";
    if (pct >= 60) return "rgba(46, 196, 182, 0.10)";
    if (pct <= 10) return "rgba(230, 57, 70, 0.30)";
    if (pct <= 25) return "rgba(230, 57, 70, 0.18)";
    if (pct <= 40) return "rgba(230, 57, 70, 0.08)";
    return "";
  }
  // Warm-shifted colors for Anthropic sand background
  if (pct >= 90) return "rgba(46, 196, 182, 0.22)";  // elite green-tinted
  if (pct >= 75) return "rgba(46, 196, 182, 0.12)";  // good green
  if (pct >= 60) return "rgba(46, 196, 182, 0.05)";  // slight green
  if (pct <= 10) return "rgba(230, 57, 70, 0.18)";   // poor red-tinted
  if (pct <= 25) return "rgba(230, 57, 70, 0.10)";   // below avg red
  if (pct <= 40) return "rgba(230, 57, 70, 0.04)";   // slight red
  return "";  // neutral (40-60th percentile)
}

function toggleHeatColors() {
  state.heatColors = !state.heatColors;
  try { localStorage.setItem("razzle_heat_colors", state.heatColors ? "1" : "0"); } catch(e) {}
  const btn = document.getElementById("heatColorsBtn");
  if (btn) {
    btn.classList.toggle("active", state.heatColors);
    btn.style.borderColor = state.heatColors ? "var(--green)" : "";
  }
  _percentileCache = null; // force recompute
  renderTable();
  saveStateToURL();
}

function togglePercentileMode() {
  state.percentileMode = !state.percentileMode;
  try { localStorage.setItem("razzle_percentile_mode", state.percentileMode ? "1" : "0"); } catch(e) {}
  const btn = document.getElementById("percentileModeBtn");
  if (btn) {
    btn.classList.toggle("active", state.percentileMode);
    btn.style.borderColor = state.percentileMode ? "var(--pos-qb)" : "";
  }
  _percentileCache = null; // force recompute
  renderTable();
  saveStateToURL();
  _showToast(state.percentileMode ? "percentile mode on — values show position rank %" : "percentile mode off — raw values");
}

// ─── Inline data bars ────────────────────────────────────────────
let _barMaxCache = null;
let _barMaxCacheKey = "";

function computeBarMaxes() {
  const items = state.items;
  if (!items.length) return {};
  const cols = getActiveColumns();
  const cacheKey = items.length + "|" + (items[0].player_id || "") + "|" + (items[items.length - 1].player_id || "") + "|" + cols.join(",");
  if (_barMaxCacheKey === cacheKey && _barMaxCache) return _barMaxCache;

  const result = {}; // col_key -> { max, min }
  for (const key of cols) {
    const col = getColumnDef(key);
    if (!col || col.isText || col.isSparkline || col.isNotes || key === "pos_rank" || key === "age") continue;
    let max = -Infinity, min = Infinity;
    for (const p of items) {
      const v = p[key];
      if (v == null || v === "" || typeof v !== "number") continue;
      if (v > max) max = v;
      if (v < min) min = v;
    }
    if (max > min && max !== -Infinity) {
      result[key] = { max, min: Math.min(0, min) }; // anchor bars at 0
    }
  }
  _barMaxCache = result;
  _barMaxCacheKey = cacheKey;
  return result;
}

function getBarWidth(key, val) {
  if (val == null || typeof val !== "number") return 0;
  const bm = _barMaxCache && _barMaxCache[key];
  if (!bm) return 0;
  const range = bm.max - bm.min;
  if (range <= 0) return 0;
  const inverted = INVERSE_STATS.has(key);
  let pct;
  if (inverted) {
    pct = ((bm.max - val) / range) * 100;
  } else {
    pct = ((val - bm.min) / range) * 100;
  }
  return Math.max(0, Math.min(100, pct));
}

function toggleDataBars() {
  state.dataBars = !state.dataBars;
  try { localStorage.setItem("razzle_data_bars", state.dataBars ? "1" : "0"); } catch(e) {}
  const btn = document.getElementById("dataBarsBtn");
  if (btn) {
    btn.classList.toggle("active", state.dataBars);
    btn.style.borderColor = state.dataBars ? "var(--orange)" : "";
  }
  _barMaxCache = null;
  renderTable();
  saveStateToURL();
  _showToast(state.dataBars ? "data bars on" : "data bars off");
}

// ─── Stat leader indicators ─────────────────────────────────────
let _leaderRanksCache = null;
let _leaderRanksCacheKey = null;

function computeLeaderRanks() {
  // Cache key based on item count + first/last player IDs
  var items = state.items;
  if (!items.length) return {};
  var cacheKey = items.length + ":" + (items[0].player_id || "") + ":" + (items[items.length - 1].player_id || "") + ":" + state.sortKey + ":" + state.season;
  if (_leaderRanksCache && _leaderRanksCacheKey === cacheKey) return _leaderRanksCache;

  var cols = getActiveColumns();
  var ranks = {}; // { colKey: { playerId: rank (1,2,3) } }

  for (var c = 0; c < cols.length; c++) {
    var key = cols[c];
    var col = getColumnDef(key);
    if (!col || col.isText || col.isSparkline || col.isNotes || key === "age" || key === "games" || key === "seasons") continue;

    // Collect numeric values with player IDs
    var vals = [];
    for (var i = 0; i < items.length; i++) {
      var v = items[i][key];
      if (v != null && typeof v === "number" && v !== 0) {
        vals.push({ idx: i, pid: items[i].player_id || items[i].player_name || i, val: v });
      }
    }
    if (vals.length < 3) continue;

    // Sort: INVERSE_STATS ascending (lowest = best), others descending
    var inv = INVERSE_STATS.has(key);
    vals.sort(function(a, b) { return inv ? a.val - b.val : b.val - a.val; });

    var colRanks = {};
    // Assign top 3 — skip ties at boundary carefully
    for (var r = 0; r < Math.min(3, vals.length); r++) {
      colRanks[vals[r].pid] = r + 1;
    }
    ranks[key] = colRanks;
  }

  _leaderRanksCache = ranks;
  _leaderRanksCacheKey = cacheKey;
  return ranks;
}

function getLeaderDot(rank) {
  if (rank === 1) return '<span class="leader-dot leader-gold" title="1st">&#9679;</span>';
  if (rank === 2) return '<span class="leader-dot leader-silver" title="2nd">&#9679;</span>';
  if (rank === 3) return '<span class="leader-dot leader-bronze" title="3rd">&#9679;</span>';
  return "";
}

function toggleLeaderBadges() {
  state.leaderBadges = !state.leaderBadges;
  try { localStorage.setItem("razzle_leader_badges", state.leaderBadges ? "1" : "0"); } catch(e) {}
  var btn = document.getElementById("leaderBadgesBtn");
  if (btn) {
    btn.classList.toggle("active", state.leaderBadges);
    btn.style.borderColor = state.leaderBadges ? "var(--yellow)" : "";
  }
  _leaderRanksCache = null;
  renderTable();
  saveStateToURL();
  _showToast(state.leaderBadges ? "stat leaders on — gold/silver/bronze dots" : "stat leaders off");
}

function cycleVisualMode() {
  if (state.universe !== "nfl") { _showToast("visual modes: nfl only"); return; }
  // Cycle: off → heat → percentile → bars → leaders → off
  var h = state.heatColors, p = state.percentileMode, b = state.dataBars, l = state.leaderBadges;
  // Determine current mode and advance
  if (!h && !p && !b && !l) {
    // off → heat
    state.heatColors = true; state.percentileMode = false; state.dataBars = false; state.leaderBadges = false;
    _showToast("visual: heat colors");
  } else if (h && !p && !b && !l) {
    // heat → percentile
    state.heatColors = false; state.percentileMode = true; state.dataBars = false; state.leaderBadges = false;
    _showToast("visual: percentile mode");
  } else if (!h && p && !b && !l) {
    // percentile → bars
    state.heatColors = false; state.percentileMode = false; state.dataBars = true; state.leaderBadges = false;
    _showToast("visual: data bars");
  } else if (!h && !p && b && !l) {
    // bars → leaders
    state.heatColors = false; state.percentileMode = false; state.dataBars = false; state.leaderBadges = true;
    _showToast("visual: stat leaders");
  } else {
    // anything else → off
    state.heatColors = false; state.percentileMode = false; state.dataBars = false; state.leaderBadges = false;
    _showToast("visual: off");
  }
  // Sync buttons
  var hBtn = document.getElementById("heatColorsBtn");
  if (hBtn) { hBtn.classList.toggle("active", state.heatColors); hBtn.style.borderColor = state.heatColors ? "var(--green)" : ""; }
  var pBtn = document.getElementById("percentileModeBtn");
  if (pBtn) { pBtn.classList.toggle("active", state.percentileMode); pBtn.style.borderColor = state.percentileMode ? "var(--pos-qb)" : ""; }
  var bBtn = document.getElementById("dataBarsBtn");
  if (bBtn) { bBtn.classList.toggle("active", state.dataBars); bBtn.style.borderColor = state.dataBars ? "var(--orange)" : ""; }
  var lBtn = document.getElementById("leaderBadgesBtn");
  if (lBtn) { lBtn.classList.toggle("active", state.leaderBadges); lBtn.style.borderColor = state.leaderBadges ? "var(--yellow)" : ""; }
  // Persist
  try { localStorage.setItem("razzle_heat_colors", state.heatColors ? "1" : "0"); } catch(e) {}
  try { localStorage.setItem("razzle_percentile_mode", state.percentileMode ? "1" : "0"); } catch(e) {}
  try { localStorage.setItem("razzle_data_bars", state.dataBars ? "1" : "0"); } catch(e) {}
  try { localStorage.setItem("razzle_leader_badges", state.leaderBadges ? "1" : "0"); } catch(e) {}
  _percentileCache = null;
  _barMaxCache = null;
  _leaderRanksCache = null;
  renderTable();
  saveStateToURL();
}

// ─── Tier break dividers ─────────────────────────────────────────
const TIER_BREAK_SIZES = [5, 12, 24, 36]; // cumulative breakpoints: Tier 1 = top 5, Tier 2 = 6-12, etc.

function insertTierBreakRows(rows, cols) {
  if (!rows.length) return rows;
  const colCount = cols.length + 5 + (state.universe === "nfl" ? 1 : 0); // star + checkbox + rank + player + pin + add column btn
  const result = [];
  let tierIdx = 0;
  const tierLabels = ["Tier 1 — Elite", "Tier 2 — Starters", "Tier 3 — Flex", "Tier 4 — Bench", "Tier 5 — Deep"];

  for (let i = 0; i < rows.length; i++) {
    // Insert tier break before this row if we've hit a breakpoint
    if (tierIdx < TIER_BREAK_SIZES.length && i === TIER_BREAK_SIZES[tierIdx]) {
      const label = tierLabels[tierIdx + 1] || ("Tier " + (tierIdx + 2));
      result.push(buildTierBreakRow(label, colCount));
      tierIdx++;
    }
    result.push(rows[i]);
  }
  return result;
}

function buildTierBreakRow(label, colCount) {
  return `<tr class="tier-break-row" style="height:${getVScrollRowHeight()}px; background:var(--bg-warm); border-top:3px solid var(--orange); pointer-events:none;">
    <td colspan="${colCount}" style="padding:4px 16px; font-family:var(--font-hand); font-size:16px; color:var(--orange); letter-spacing:0.5px; border-left:4px solid var(--orange);">
      ${label}
    </td>
  </tr>`;
}

function toggleTierBreaks() {
  if (state.universe !== "nfl") return;
  state.tierBreaks = !state.tierBreaks;
  try { localStorage.setItem("razzle_tier_breaks", state.tierBreaks ? "1" : "0"); } catch(e) {}
  const btn = document.getElementById("tierBreaksBtn");
  if (btn) {
    btn.classList.toggle("active", state.tierBreaks);
    btn.style.borderColor = state.tierBreaks ? "var(--orange)" : "";
  }
  renderTable();
  saveStateToURL();
}

// ─── Data density toggle ─────────────────────────────────────────
function toggleDensity() {
  state.density = !state.density;
  try { localStorage.setItem("razzle_density", state.density ? "1" : "0"); } catch(e) {}
  const btn = document.getElementById("densityBtn");
  if (btn) {
    btn.classList.toggle("active", state.density);
    btn.style.borderColor = state.density ? "var(--blue)" : "";
  }
  document.body.classList.toggle("dense-mode", state.density);
  renderTable();
  saveStateToURL();
}

// ─── Column group headers toggle ─────────────────────────────────
function toggleGroupHeaders() {
  state.groupHeaders = !state.groupHeaders;
  try { localStorage.setItem("razzle_group_headers", state.groupHeaders ? "1" : "0"); } catch(e) {}
  const btn = document.getElementById("groupHeadersBtn");
  if (btn) {
    btn.classList.toggle("active", state.groupHeaders);
    btn.style.borderColor = state.groupHeaders ? "var(--blue)" : "";
  }
  renderTableHead();
  saveStateToURL();
}

// ─── Stats summary bar ───────────────────────────────────────────
function toggleSummaryBar() {
  state.summaryBar = !state.summaryBar;
  try { localStorage.setItem("razzle_summary_bar", state.summaryBar ? "1" : "0"); } catch(e) {}
  const btn = document.getElementById("summaryBarBtn");
  if (btn) {
    btn.classList.toggle("active", state.summaryBar);
    btn.style.borderColor = state.summaryBar ? "var(--blue)" : "";
  }
  renderSummaryBar();
  saveStateToURL();
}

function renderSummaryBar() {
  const tfoot = document.getElementById("tableFoot");
  if (!tfoot) return;
  if (!state.summaryBar || !state.items.length) {
    tfoot.style.display = "none";
    return;
  }
  tfoot.style.display = "";
  const cols = getActiveColumns();
  const items = state.items;
  const n = items.length;

  const utilCols = state.universe === "nfl" ? 4 : 3;
  let html = '<tr>';
  html += `<td class="col-player" colspan="${utilCols + 1}" style="font-family:var(--font-hand); font-size:13px;">${n} players</td>`;

  for (const key of cols) {
    const col = getColumnDef(key);
    if (!col || col.isText || col.isSparkline || col.isNotes) {
      html += '<td></td>';
      continue;
    }
    // Collect numeric values
    const vals = [];
    for (const p of items) {
      const v = parseFloat(p[key]);
      if (!isNaN(v)) vals.push(v);
    }
    if (!vals.length) {
      html += '<td></td>';
      continue;
    }
    const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
    const dec = col.decimals != null ? col.decimals : 1;
    html += `<td title="Average of ${n} displayed rows"><span class="summary-label">page avg</span><span class="summary-val">${avg.toFixed(dec)}</span></td>`;
  }
  html += '<td></td>'; // spacer for "+" column
  html += '</tr>';
  tfoot.innerHTML = html;
}

// ─── Positional rank computation ─────────────────────────────────
function toggleDVSInfo() {
  let el = document.getElementById("dvsInfoPopover");
  if (el) { el.remove(); return; }
  el = document.createElement("div");
  el.id = "dvsInfoPopover";
  el.style.cssText = "position:fixed; top:50%; left:50%; transform:translate(-50%,-50%); background:var(--bg-card); border:3px solid var(--ink); border-radius:12px; box-shadow:4px 4px 0 var(--ink); padding:20px 24px; max-width:400px; z-index:9999; font-family:var(--font-mono); font-size:13px; line-height:1.6;";
  el.innerHTML = `
    <h4 style="font-family:var(--font-display); margin:0 0 10px;">DVS Methodology</h4>
    <p><b>DVS = PPR/G &times; Age Curve Multiplier</b></p>
    <p>Age curves vary by position:</p>
    <ul style="margin:4px 0; padding-left:18px;">
      <li>QB: peak 26\u201330</li>
      <li>RB: peak 22\u201325</li>
      <li>WR: peak 24\u201328</li>
      <li>TE: peak 25\u201329</li>
    </ul>
    <p>Higher DVS = more dynasty value per game adjusted for age. Tiers: Elite (85+), Star (70+), Starter (55+).</p>
    <button class="btn-chunky" onclick="document.getElementById('dvsInfoPopover').remove()" style="margin-top:8px; font-size:11px;">Got it</button>
  `;
  document.body.appendChild(el);
}

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
      if (typeof av === "string" || typeof bv === "string")
        return String(av).localeCompare(String(bv)) * (desc ? -1 : 1);
      return desc ? bv - av : av - bv;
    });
    byPos[pos].forEach((p, i) => {
      p.pos_rank = `${pos}${i + 1}`;
    });
  }
}

// Formulas and custom scoring loaded in init() — cloud sync after page load
// Cloud sync formulas and saved views (Pro+ users — runs silently after page load)
if (typeof syncFormulasFromCloud === "function") {
  setTimeout(syncFormulasFromCloud, 1500);
}
setTimeout(function() {
  if (typeof syncSavedViewsFromCloud === "function") syncSavedViewsFromCloud();
}, 2000);
// Cloud sync watchlist (Pro+ users)
setTimeout(function() {
  if (typeof syncWatchlistFromCloud === "function") syncWatchlistFromCloud();
}, 2500);

// ─── Image export ────────────────────────────────────────────────
function exportImage() {
  const table = document.getElementById("screenerTable");
  if (!table) return;
  const rows = table.querySelectorAll("tr");
  if (!rows.length) return;

  // Determine dimensions from visible data
  const visibleCols = getActiveColumns().filter(k => getColumnDef(k));
  const rowCount = Math.min(state.items.length, 25); // cap at 25 rows for export

  const colW = 100;
  const rankColW = 36;
  const playerColW = 200;
  const rowH = 28;
  const headerH = 36;
  const titleH = 32;
  const padX = 20;
  const padY = 20;
  const watermarkH = 40;

  const tableW = rankColW + playerColW + visibleCols.length * colW;
  const W = padX * 2 + tableW;
  const H = padY * 2 + titleH + headerH + rowCount * rowH + watermarkH;

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  var t = getCanvasTheme();

  // Background
  ctx.fillStyle = t.bg;
  ctx.fillRect(0, 0, W, H);

  // Title bar with context
  const colDefs = isProspectView() ? PROSPECT_COLUMNS : state.universe === "college" ? COLLEGE_COLUMNS : COLUMNS;
  const sortCol = colDefs[state.sortKey];
  const sortLabel = sortCol ? sortCol.label : state.sortKey;
  const sortArrow = state.sortDir === "asc" ? "\u2191" : "\u2193";
  const seasonLabel = state.season === "career" ? "Career" : isProspectView() ? state.draftYear + " Draft" : state.universe === "college" ? state.collegeSeason : state.season;
  const posLabel = state.position !== "ALL" ? state.position : "All Positions";
  const modeLabel = isProspectView() ? "Prospects" : state.universe === "college" ? "College" : "NFL";
  const titleText = `${modeLabel} \u00B7 ${posLabel} \u00B7 ${seasonLabel} \u00B7 sorted by ${sortLabel} ${sortArrow}`;

  ctx.fillStyle = t.ink;
  ctx.fillRect(padX, padY, tableW, titleH);
  ctx.font = "bold 12px 'Space Mono', monospace";
  ctx.fillStyle = t.bg;
  ctx.textAlign = "left";
  ctx.fillText(titleText, padX + 10, padY + titleH / 2 + 4);

  // Find sort column index for highlight
  const sortColIdx = visibleCols.indexOf(state.sortKey);

  // Header row
  const hdrY = padY + titleH;
  ctx.fillStyle = t.bgWarm;
  ctx.fillRect(padX, hdrY, tableW, headerH);
  ctx.strokeStyle = t.ink;
  ctx.lineWidth = 2;
  ctx.strokeRect(padX, hdrY, tableW, headerH);

  // Sort column header highlight
  if (sortColIdx >= 0) {
    const sx = padX + rankColW + playerColW + sortColIdx * colW;
    ctx.fillStyle = "rgba(217, 119, 87, 0.15)";
    ctx.fillRect(sx, hdrY, colW, headerH);
  }

  ctx.font = "bold 10px 'Space Mono', monospace";
  ctx.fillStyle = t.inkLight;
  ctx.textAlign = "center";
  ctx.fillText("#", padX + rankColW / 2, hdrY + headerH / 2 + 4);

  ctx.font = "bold 11px 'Space Mono', monospace";
  ctx.fillStyle = t.ink;
  ctx.textAlign = "left";
  ctx.fillText("PLAYER", padX + rankColW + 8, hdrY + headerH / 2 + 4);

  ctx.textAlign = "right";
  for (let i = 0; i < visibleCols.length; i++) {
    const col = getColumnDef(visibleCols[i]);
    const x = padX + rankColW + playerColW + i * colW + colW - 8;
    let label = (col ? col.label : visibleCols[i]).toUpperCase();
    if (visibleCols[i] === state.sortKey) label += " " + sortArrow;
    ctx.fillText(label, x, hdrY + headerH / 2 + 4);
  }

  // Data rows
  const posColors = { QB: "#5b7fff", RB: "#2ec4b6", WR: "#d97757", TE: "#8b5cf6" };
  for (let r = 0; r < rowCount; r++) {
    const player = state.items[r];
    const y = hdrY + headerH + r * rowH;

    // Alternate row bg
    if (r % 2 === 0) {
      ctx.fillStyle = t.bgCard;
      ctx.fillRect(padX, y, tableW, rowH);
    }

    // Sort column highlight on data rows
    if (sortColIdx >= 0) {
      const sx = padX + rankColW + playerColW + sortColIdx * colW;
      ctx.fillStyle = "rgba(217, 119, 87, 0.06)";
      ctx.fillRect(sx, y, colW, rowH);
    }

    // Row border
    ctx.strokeStyle = t.inkFaint;
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(padX, y + rowH);
    ctx.lineTo(padX + tableW, y + rowH);
    ctx.stroke();

    // Rank number
    ctx.font = "10px 'Space Mono', monospace";
    ctx.fillStyle = t.inkLight;
    ctx.textAlign = "center";
    ctx.fillText(String(state.offset + r + 1), padX + rankColW / 2, y + 18);

    // Position badge
    const pos = (player.position || "").toUpperCase();
    const badgeColor = posColors[pos] || "#8a7565";
    ctx.fillStyle = badgeColor;
    const badgeX = padX + rankColW + 6;
    ctx.fillRect(badgeX, y + 6, 26, 16);
    ctx.strokeStyle = t.ink;
    ctx.lineWidth = 1;
    ctx.strokeRect(badgeX, y + 6, 26, 16);
    ctx.font = "bold 9px 'Space Mono', monospace";
    ctx.fillStyle = t.white;
    ctx.textAlign = "center";
    ctx.fillText(pos, badgeX + 13, y + 18);

    // Player name
    ctx.font = "bold 12px 'Space Mono', monospace";
    ctx.fillStyle = t.ink;
    ctx.textAlign = "left";
    const pName = player.full_name || player.player_name || "";
    const displayName = pName.length > 20
      ? pName.substring(0, 18) + "..."
      : pName;
    ctx.fillText(displayName, badgeX + 32, y + 18);

    // Team
    ctx.font = "10px 'Space Mono', monospace";
    ctx.fillStyle = t.inkLight;
    ctx.fillText(player.team || "", padX + rankColW + playerColW - 30, y + 18);

    // Stats
    ctx.font = "12px 'Space Mono', monospace";
    ctx.fillStyle = t.ink;
    ctx.textAlign = "right";
    for (let i = 0; i < visibleCols.length; i++) {
      const col = getColumnDef(visibleCols[i]);
      const val = player[visibleCols[i]];
      const x = padX + rankColW + playerColW + i * colW + colW - 8;
      ctx.fillText(formatStat(val, col ? col.decimals : 0), x, y + 18);
    }
  }

  // Table border
  ctx.strokeStyle = t.ink;
  ctx.lineWidth = 3;
  ctx.strokeRect(padX, hdrY, tableW, headerH + rowCount * rowH);

  // Rank column divider
  ctx.lineWidth = 1;
  ctx.strokeStyle = t.inkFaint;
  ctx.beginPath();
  ctx.moveTo(padX + rankColW, hdrY);
  ctx.lineTo(padX + rankColW, hdrY + headerH + rowCount * rowH);
  ctx.stroke();

  // Player column divider
  ctx.lineWidth = 2;
  ctx.strokeStyle = t.ink;
  ctx.beginPath();
  ctx.moveTo(padX + rankColW + playerColW, hdrY);
  ctx.lineTo(padX + rankColW + playerColW, hdrY + headerH + rowCount * rowH);
  ctx.stroke();

  // Watermark with shareable URL
  const wmY = H - watermarkH / 2;
  ctx.font = "bold 16px 'Luckiest Guy', cursive";
  ctx.fillStyle = t.ink;
  ctx.globalAlpha = 0.3;
  ctx.textAlign = "center";
  ctx.fillText("razzle.lol", W / 2, wmY - 8);
  try { if (typeof saveStateToURL === 'function') saveStateToURL(); } catch(e) {}
  let _wmUrl2 = window.location.href.replace(/^https?:\/\//, '');
  if (_wmUrl2.length > 60) _wmUrl2 = _wmUrl2.substring(0, 57) + '...';
  ctx.font = "11px 'Space Mono', monospace";
  ctx.fillText(_wmUrl2, W / 2, wmY + 8);
  ctx.globalAlpha = 1.0;

  // Download
  const link = document.createElement("a");
  link.download = `razzle-lab-${state.season === "career" ? "career" : state.season}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
}

// ─── CSV Export ───────────────────────────────────────────────────

function exportCSV() {
  if (!state.items.length) return;

  // Pro+ gating: CSV export requires Pro or Elite plan
  if (typeof isPaidUser === "function" && !isPaidUser()) {
    _showToast('CSV export requires Pro.', 'warning', null, {href: '/pricing.html', text: 'upgrade now'});
    return;
  }

  // Determine column definitions and visible columns based on universe
  let colDefs, visCols;
  if (isProspectView()) {
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
  lines.push("# razzle.lol — Fantasy Football Research Lab");
  lines.push("# " + state.universe.toUpperCase() + " | " + state.position + " | " +
    (state.universe === "college" ? state.collegeSeason :
     isProspectView() ? state.draftYear : state.season));

  // Header row
  const nameCol = "Player";
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
  const blob = new Blob(["\uFEFF" + lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const season = state.universe === "college" ? state.collegeSeason :
                 isProspectView() ? state.draftYear : state.season;
  const today = new Date().toISOString().slice(0, 10);
  link.download = `razzle-export-${state.position.toLowerCase()}-${season}-${today}.csv`;
  link.href = URL.createObjectURL(blob);
  link.click();
  URL.revokeObjectURL(link.href);
  _showToast(state.items.length + " rows exported as CSV");
}

function csvEscape(val) {
  const s = String(val == null ? "" : val);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

// ─── Copy Table to Clipboard (TSV for Excel/Sheets) ──────────────

function copyTableToClipboard() {
  if (!state.items.length) { _showToast("no film to copy — run a query first"); return; }

  let colDefs, visCols;
  if (isProspectView()) {
    colDefs = PROSPECT_COLUMNS;
    visCols = state.prospectColumns;
  } else if (state.universe === "college") {
    colDefs = COLLEGE_COLUMNS;
    visCols = state.collegeColumns;
  } else {
    colDefs = COLUMNS;
    visCols = state.visibleColumns;
  }
  visCols = visCols.filter(k => colDefs[k] && !colDefs[k].isSparkline && !colDefs[k].isNotes);

  const lines = [];
  // Header
  lines.push(["#", "Player", "POS", "Team", ...visCols.map(k => colDefs[k].label)].join("\t"));

  // Data rows
  for (let i = 0; i < state.items.length; i++) {
    const p = state.items[i];
    const name = p.full_name || p.player_name || "";
    const pos = p.position || "";
    const team = p.team || p.school || "";
    const rank = state.offset + i + 1;
    const vals = visCols.map(k => {
      const col = colDefs[k];
      const v = p[k];
      if (v == null || v === "") return "";
      if (col.pct) return ((v * 100).toFixed(col.decimals)) + "%";
      if (col.decimals != null) return Number(v).toFixed(col.decimals);
      return v;
    });
    lines.push([rank, name, pos, team, ...vals].join("\t"));
  }

  const tsv = lines.join("\n");
  function onCopySuccess() {
    var btn = document.getElementById("clipboardCopyBtn");
    if (btn) { btn.textContent = "copied."; setTimeout(function() { btn.textContent = "Copy to Clipboard"; }, 1500); }
    _showToast(state.items.length + " rows copied");
  }
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(tsv).then(onCopySuccess).catch(function() { _fallbackCopy(tsv); onCopySuccess(); });
  } else {
    _fallbackCopy(tsv);
    onCopySuccess();
  }
}

function copyTableAsReddit() {
  if (!state.items.length) { _showToast("no film to copy — run a query first"); return; }
  var colDefs, visCols;
  if (isProspectView()) { colDefs = PROSPECT_COLUMNS; visCols = state.prospectColumns; }
  else if (state.universe === "college") { colDefs = COLLEGE_COLUMNS; visCols = state.collegeColumns; }
  else { colDefs = COLUMNS; visCols = state.visibleColumns; }
  visCols = visCols.filter(function(k) { return colDefs[k] && !colDefs[k].isSparkline && !colDefs[k].isNotes; });

  var headers = ["#", "Player", "POS", "Team"].concat(visCols.map(function(k) { return colDefs[k].label; }));
  var sep = headers.map(function() { return "---"; });
  var lines = [headers.join(" | "), sep.join(" | ")];

  function escPipe(s) { return String(s).replace(/\|/g, "\\|"); }
  var max = Math.min(state.items.length, 50); // Reddit table cap
  for (var i = 0; i < max; i++) {
    var p = state.items[i];
    var name = escPipe(p.full_name || p.player_name || "");
    var pos = p.position || "";
    var team = escPipe(p.team || p.school || "");
    var rank = state.offset + i + 1;
    var vals = visCols.map(function(k) {
      var col = colDefs[k]; var v = p[k];
      if (v == null || v === "") return "";
      if (col.pct) return ((v * 100).toFixed(col.decimals)) + "%";
      if (col.decimals != null) return Number(v).toFixed(col.decimals);
      return escPipe(v);
    });
    lines.push([rank, name, pos, team].concat(vals).join(" | "));
  }

  var md = lines.join("\n");
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(md).then(function() { _showToast("reddit table copied (" + max + " rows)"); }).catch(function() { _fallbackCopy(md); _showToast("reddit table copied"); });
  } else {
    _fallbackCopy(md); _showToast("reddit table copied");
  }
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
  var t = getCanvasTheme();

  // Background
  ctx.fillStyle = t.bgCard;
  ctx.fillRect(0, 0, W, H);

  // Title
  ctx.font = "bold 24px 'Luckiest Guy', cursive";
  ctx.fillStyle = t.ink;
  ctx.textAlign = "center";
  ctx.fillText(`Razzle Dynasty Top ${players.length} ${posLabel}`, W / 2, padY + 28);

  // Subtitle (sort + season)
  ctx.font = "14px 'Caveat', cursive";
  ctx.fillStyle = t.subtitleAlpha;
  const seasonText = state.season === "career" ? "career" : state.season || "Latest";
  ctx.fillText(`ranked by ${sortLabel} — ${seasonText} season`, W / 2, padY + 46);

  // Content area
  const listY = padY + titleH + 10;
  const listH = players.length * rowH;
  const listW = W - padX * 2;

  // Outer border
  ctx.strokeStyle = t.ink;
  ctx.lineWidth = 3;
  ctx.strokeRect(padX, listY, listW, listH);

  // Player rows
  players.forEach((p, i) => {
    const y = listY + i * rowH;
    const pColor = posColors[p.position] || t.ink;

    // Alternating bg
    if (i % 2 === 0) {
      ctx.fillStyle = "rgba(229,213,195,0.3)";
      ctx.fillRect(padX + 1.5, y, listW - 3, rowH);
    }

    // Row divider
    if (i > 0) {
      ctx.strokeStyle = t.inkFaint;
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
    ctx.strokeStyle = t.ink;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = t.white;
    ctx.font = "bold 12px 'Space Mono', monospace";
    ctx.textAlign = "center";
    ctx.fillText(String(i + 1), rankX, rankCY + 4);

    // Position badge
    const posBadgeX = padX + 48;
    ctx.fillStyle = pColor;
    ctx.fillRect(posBadgeX, y + 8, 30, 20);
    ctx.strokeStyle = t.ink;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(posBadgeX, y + 8, 30, 20);
    ctx.fillStyle = t.white;
    ctx.font = "bold 9px 'Space Mono', monospace";
    ctx.textAlign = "center";
    ctx.fillText(p.position, posBadgeX + 15, y + 22);

    // Player name
    ctx.textAlign = "left";
    ctx.fillStyle = t.ink;
    ctx.font = "bold 14px 'Space Mono', monospace";
    ctx.fillText(p.full_name || p.player_name, padX + 88, y + 23);

    // Team
    ctx.fillStyle = t.inkLight;
    ctx.font = "11px 'Space Mono', monospace";
    ctx.fillText(p.team || "FA", padX + 320, y + 23);

    // Age
    if (p.age) {
      ctx.fillStyle = t.inkLight;
      ctx.font = "11px 'Space Mono', monospace";
      ctx.fillText("Age " + (p.age != null ? Math.round(p.age) : "—"), padX + 380, y + 23);
    }

    // DVS badge
    const dvs = p._dvs != null ? p._dvs : computeClientDVS(p.ppg, p.age, p.position);
    if (dvs != null) {
      const dvsColor = dvs >= 85 ? "#2ec4b6" : dvs >= 70 ? "#5b7fff" : dvs >= 55 ? "#d97757" : "#8a7565";
      const badgeX = padX + 450;
      ctx.fillStyle = dvsColor + "30";
      ctx.fillRect(badgeX, y + 7, 70, 22);
      ctx.strokeStyle = dvsColor;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(badgeX, y + 7, 70, 22);
      ctx.fillStyle = dvsColor;
      ctx.font = "bold 11px 'Space Mono', monospace";
      ctx.textAlign = "center";
      ctx.fillText("DVS " + dvs.toFixed(1), badgeX + 35, y + 22);
    }

    // Key stat (PPG)
    if (p.ppg != null) {
      ctx.fillStyle = t.ink;
      ctx.font = "bold 13px 'Space Mono', monospace";
      ctx.textAlign = "right";
      ctx.fillText(Number(p.ppg).toFixed(1) + " PPG", padX + listW - 16, y + 23);
    }
  });

  // Watermark
  ctx.font = "16px 'Caveat', cursive";
  ctx.fillStyle = "rgba(217, 119, 87, 0.5)";
  ctx.textAlign = "right";
  ctx.fillText("razzle.lol", W - 20, H - 16);

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
  hideHoverCard();
  const overlay = document.getElementById("profileOverlay");
  const content = document.getElementById("profileContent");
  overlay.classList.add("open");
  content.innerHTML = '<div style="text-align:center; padding:40px; font-family:var(--font-hand); font-size:22px; color:var(--ink-light);">' + razzleLoading() + '</div>';

  try {
    const data = await apiFetch(`/api/players/${encodeURIComponent(playerId)}/profile`);
    renderProfile(data, content);
  } catch (err) {
    content.innerHTML = `<div style="text-align:center; padding:40px; font-family:var(--font-hand); font-size:22px; color:var(--red);">fumbled the data fetch... try again in a sec.</div>`;
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
    content.innerHTML = `<div style="text-align:center; padding:40px; font-family:var(--font-hand); font-size:22px; color:var(--red);">fumbled the college data fetch... try again in a sec.</div>`;
  }
}

function renderCollegeProfile(data, container) {
  if (!data) { container.innerHTML = '<div style="text-align:center; padding:40px; font-family:var(--font-hand); font-size:22px; color:var(--ink-light);">player not found on the film</div>'; return; }
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
  html += `<div class="profile-name">${escapeHtml(player.player_name)}</div>`;
  html += `<div class="profile-meta">${escapeHtml(player.team || "")} · ${escapeHtml(player.conference || "")} · ${player.seasons_played || 0} season${(player.seasons_played || 0) !== 1 ? "s" : ""}</div>`;
  html += `<span style="display:inline-block; background:var(--pos-qb); color:var(--text-on-accent); font-family:var(--font-mono); font-size:10px; padding:2px 8px; border:2px solid var(--ink); border-radius:4px; transform:rotate(-2deg);">COLLEGE</span>`;
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
      html += `<tr><td>${s.season}</td><td>${escapeHtml(s.team || "")}</td>`;
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
      html += `<div class="profile-combine-item"><span class="profile-combine-label">NFL Team</span><span class="profile-combine-value">${escapeHtml(combine.draft_team)}</span></div>`;
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
  if (!data) { container.innerHTML = '<div style="text-align:center; padding:40px; font-family:var(--font-hand); font-size:22px; color:var(--ink-light);">player not found on the film</div>'; return; }
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
  html += `<div class="profile-header" style="border-top:4px solid ${posColor};">`;
  if (player.headshot_url) {
    html += `<img class="profile-headshot" src="${escapeAttr(player.headshot_url)}" alt="${escapeAttr(player.full_name || 'Player')} headshot" onerror="this.style.display='none';">`;
  }
  html += `<span class="profile-pos-badge" style="background:${posColor};">${pos}</span>`;
  html += `<div>`;
  html += `<div class="profile-name">${escapeHtml(player.full_name)}</div>`;
  const displayAge = player.age ? Math.floor(player.age) : "?";
  const seasonCount = seasons ? seasons.length : 0;
  const seasonLabel = seasonCount === 1 ? "Season" : "Seasons";
  const teamDisplay = player.team ? `<a href="/team/${encodeURIComponent(player.team)}" style="color:${posColor}; font-weight:700; text-decoration:none;" onmouseover="this.style.textDecoration='underline'" onmouseout="this.style.textDecoration='none'">${escapeHtml(player.team)}</a>` : `<span style="color:${posColor}; font-weight:700;">FA</span>`;
  html += `<div class="profile-meta">${teamDisplay} · Age ${displayAge} · ${escapeHtml(player.college || "")} · ${seasonCount} ${seasonLabel}</div>`;
  if (combine && combine.draft_round) {
    const draftPick = combine.draft_overall || combine.draft_pick;
    html += `<span style="display:inline-block; background:var(--ink); color:var(--bg); font-family:var(--font-mono); font-size:10px; padding:2px 8px; border:2px solid var(--ink); border-radius:4px; transform:rotate(-1deg); margin-right:6px;">Rd ${combine.draft_round}${draftPick ? " #" + draftPick : ""}${combine.draft_year ? " '" + String(combine.draft_year).slice(2) : ""}</span>`;
  }
  if (breakoutInfo) {
    html += `<span class="breakout-badge">BREAKOUT +${breakoutInfo.pct}% (${breakoutInfo.season})</span>`;
  }
  html += `</div>`;
  html += `<div style="margin-left:auto; display:flex; gap:8px; flex-wrap:wrap;">`;
  html += `<a href="/player/${encodeURIComponent(player.player_id)}" class="btn-chunky" style="font-size:11px; padding:6px 14px; text-decoration:none; display:inline-flex; align-items:center;">Full Profile</a>`;
  html += `<button class="btn-chunky" onclick="loadBoomBust('${escapeJS(player.player_id)}')" style="font-size:11px; padding:6px 14px; border-color:var(--green);">Boom/Bust</button>`;
  html += `<button class="btn-chunky" onclick="loadPlayerComps('${escapeJS(player.player_id)}')" style="font-size:11px; padding:6px 14px; border-color:var(--orange);">Find Comps</button>`;
  html += `<button class="btn-primary" onclick="exportProfileImage()" style="font-size:11px; padding:6px 14px;">Export PNG</button>`;
  html += `</div>`;
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

  // Dynasty Value Sparkline (loads async)
  html += `<div id="profile-dynasty-sparkline" style="margin-bottom:16px;"></div>`;

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
      html += `<tr style="font-weight:700; border-top:2px solid var(--ink);"><td>Career</td>`;
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
      { key: "draft_pick", label: "Pick", fmt: v => v ? `#${v}` : "—" },
      { key: "height_display", label: "Height", fmt: v => v || "—" },
      { key: "weight", label: "Weight", fmt: v => v ? `${v} lbs` : "—" },
      { key: "forty", label: "40-Yard", fmt: v => v ? Number(v).toFixed(2) + "s" : "—" },
      { key: "bench", label: "Bench", fmt: v => v ? `${v} reps` : "—" },
      { key: "vertical", label: "Vertical", fmt: v => v ? Number(v).toFixed(1) + '"' : "—" },
      { key: "broad_jump", label: "Broad", fmt: v => v ? v + '"' : "—" },
      { key: "cone", label: "3-Cone", fmt: v => v ? Number(v).toFixed(2) + "s" : "—" },
      { key: "shuttle", label: "Shuttle", fmt: v => v ? Number(v).toFixed(2) + "s" : "—" },
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
    html += `<canvas id="profileArcCanvas" width="720" height="240" role="img" aria-label="Career arc trend line chart" style="border:2px solid var(--ink); border-radius:8px; background:var(--bg); width:100%;"></canvas>`;
    html += `</div>`;
  }

  // Boom/Bust section placeholder
  html += `<div id="profileBoomBustSection"></div>`;

  // Comps section placeholder
  html += `<div id="profileCompsSection"></div>`;

  container.innerHTML = html;

  // Draw career arc chart after DOM update
  if (seasons && seasons.length > 1) {
    requestAnimationFrame(() => drawProfileArc(seasons, pos));
  }

  // Load dynasty value sparkline async
  if (player.player_id) {
    loadDynastySparkline(player.player_id, container);
  }
}

function loadDynastySparkline(playerId, container) {
  const el = container.querySelector('#profile-dynasty-sparkline');
  if (!el) return;
  fetch(`/api/dynasty-history?players=${encodeURIComponent(playerId)}`)
    .then(r => r.ok ? r.json() : null)
    .then(data => {
      if (!data || !data.players || !data.players.length) return;
      const p = data.players[0];
      const history = (p.history || []).filter(h => h !== null);
      if (history.length < 2) return;

      const seasons = data.seasons || [];
      const w = 280, h = 60, pad = 4;
      const vals = [];
      const labels = [];
      for (let i = 0; i < seasons.length; i++) {
        const entry = p.history[i];
        if (entry && entry.trade_value != null) {
          vals.push(entry.trade_value);
          labels.push({ season: seasons[i], tv: entry.trade_value, ppg: entry.ppg });
        }
      }
      if (vals.length < 2) return;

      const mn = Math.min(...vals), mx = Math.max(...vals);
      const rng = mx - mn || 1;
      const pts = vals.map((v, i) => {
        const x = pad + (i / (vals.length - 1)) * (w - 2 * pad);
        const y = pad + (1 - (v - mn) / rng) * (h - 2 * pad);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      });

      const trend = vals[vals.length - 1] - vals[0];
      const color = trend >= 0 ? 'var(--green)' : 'var(--orange)';
      const latest = labels[labels.length - 1];
      const first = labels[0];

      let sparkHtml = '<div class="profile-section-title">Dynasty Value Trend</div>';
      sparkHtml += '<div style="display:flex; align-items:center; gap:16px; flex-wrap:wrap;">';
      sparkHtml += `<svg width="${w}" height="${h}" style="border:2px solid var(--ink); border-radius:8px; background:var(--bg-card);">`;
      sparkHtml += `<polyline points="${pts.join(' ')}" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>`;
      // Dots at start and end
      const startPt = pts[0].split(','), endPt = pts[pts.length - 1].split(',');
      sparkHtml += `<circle cx="${startPt[0]}" cy="${startPt[1]}" r="3" fill="${color}"/>`;
      sparkHtml += `<circle cx="${endPt[0]}" cy="${endPt[1]}" r="3" fill="${color}"/>`;
      sparkHtml += '</svg>';
      sparkHtml += '<div style="font-family:var(--font-mono); font-size:12px;">';
      sparkHtml += `<div><span style="color:var(--ink-light)">${first.season}:</span> <strong>${first.tv.toFixed(1)}</strong></div>`;
      sparkHtml += `<div><span style="color:var(--ink-light)">${latest.season}:</span> <strong>${latest.tv.toFixed(1)}</strong></div>`;
      const delta = latest.tv - first.tv;
      const arrow = delta >= 0 ? '&#9650;' : '&#9660;';
      sparkHtml += `<div style="color:${color}; font-weight:700;">${arrow} ${delta >= 0 ? '+' : ''}${delta.toFixed(1)}</div>`;
      sparkHtml += '</div></div>';
      el.innerHTML = sparkHtml;
    })
    .catch(() => {});
}

function getHeadlineStats(pos, career) {
  if (!career || !career.games) return [];
  const fmt0 = v => v != null ? Math.round(v).toLocaleString() : "—";
  const fmt1 = v => v != null ? Number(v).toFixed(1) : "—";

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
      { key: "turnovers", label: "TO", fmt: fmt0 },
      { key: "comp_pct", label: "CMP%", fmt: fmtPct },
      { key: "sacks_taken", label: "Sacks", fmt: fmt0 },
      { key: "rushing_yards", label: "Rush Yds", fmt: fmt0 },
      { key: "rushing_tds", label: "Rush TD", fmt: fmt0 },
      { key: "cpoe", label: "CPOE", fmt: fmt1 },
    ];
  } else if (pos === "RB") {
    return [...base,
      { key: "carries", label: "CAR", fmt: fmt0 },
      { key: "rushing_yards", label: "Rush Yds", fmt: fmt0 },
      { key: "rushing_tds", label: "Rush TD", fmt: fmt0 },
      { key: "yards_per_carry", label: "Y/CAR", fmt: fmt1 },
      { key: "rushing_first_downs", label: "1st", fmt: fmt0 },
      { key: "fumbles", label: "FUM", fmt: fmt0 },
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
      { key: "adot", label: "aDOT", fmt: fmt1 },
      { key: "receiving_first_downs", label: "1st", fmt: fmt0 },
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

  var t = getCanvasTheme();
  ctx.clearRect(0, 0, W, H);

  const values = seasons.map(s => s.fantasy_points_ppr || 0);
  const labels = seasons.map(s => String(s.season));
  const maxVal = Math.max(...values, 1);

  // Y-axis gridlines
  ctx.strokeStyle = t.inkFaint;
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);
  const yTicks = 4;
  for (let i = 0; i <= yTicks; i++) {
    const y = pad.top + plotH - (i / yTicks) * plotH;
    ctx.beginPath();
    ctx.moveTo(pad.left, y);
    ctx.lineTo(W - pad.right, y);
    ctx.stroke();

    ctx.fillStyle = t.inkLight;
    ctx.font = "11px 'Space Mono', monospace";
    ctx.textAlign = "right";
    ctx.fillText(Math.round((i / yTicks) * maxVal), pad.left - 8, y + 4);
  }
  ctx.setLineDash([]);

  // X-axis labels
  ctx.fillStyle = t.inkLight;
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
    ctx.strokeStyle = t.ink;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = t.ink;
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
    ctx.strokeStyle = t.ink;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = t.ink;
    ctx.font = "bold 11px 'Space Mono', monospace";
    ctx.textAlign = "center";
    ctx.fillText(Math.round(values[i]), x, y - 12);
  }

  // Y-axis label
  ctx.save();
  ctx.translate(14, pad.top + plotH / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillStyle = t.inkLight;
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

  var t = getCanvasTheme();

  // Background
  ctx.fillStyle = t.bgCard;
  ctx.fillRect(0, 0, W, H);

  const posColors = { QB: "#5b7fff", RB: "#2ec4b6", WR: "#d97757", TE: "#8b5cf6" };
  const pColor = posColors[pos] || t.ink;

  // Position badge
  ctx.fillStyle = pColor;
  ctx.fillRect(padX, padY, 50, 36);
  ctx.strokeStyle = t.ink;
  ctx.lineWidth = 2;
  ctx.strokeRect(padX, padY, 50, 36);
  ctx.fillStyle = t.white;
  ctx.font = "bold 16px 'Luckiest Guy', cursive";
  ctx.textAlign = "center";
  ctx.fillText(pos, padX + 25, padY + 24);

  // Name + meta
  ctx.textAlign = "left";
  ctx.fillStyle = t.ink;
  ctx.font = "bold 28px 'Luckiest Guy', cursive";
  ctx.fillText(name, padX + 64, padY + 28);
  ctx.fillStyle = t.inkLight;
  ctx.font = "12px 'Space Mono', monospace";
  ctx.fillText(meta, padX + 64, padY + 48);

  // Stats bar
  const sbY = padY + headerH;
  const sbW = (W - padX * 2) / Math.max(stats.length, 1);
  ctx.strokeStyle = t.ink;
  ctx.lineWidth = 3;
  ctx.strokeRect(padX, sbY, W - padX * 2, statsBarH);

  for (let i = 0; i < stats.length; i++) {
    const x = padX + i * sbW;
    if (i > 0) {
      ctx.strokeStyle = t.inkFaint;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, sbY);
      ctx.lineTo(x, sbY + statsBarH);
      ctx.stroke();
    }
    ctx.fillStyle = t.ink;
    ctx.font = "bold 22px 'Luckiest Guy', cursive";
    ctx.textAlign = "center";
    ctx.fillText(stats[i].val, x + sbW / 2, sbY + 32);
    ctx.fillStyle = t.inkLight;
    ctx.font = "10px 'Space Mono', monospace";
    ctx.fillText(stats[i].label.toUpperCase(), x + sbW / 2, sbY + 52);
  }

  // Season table
  if (rows.length > 0) {
    const tY = sbY + statsBarH + 20;
    const colW = (W - padX * 2) / headers.length;

    ctx.fillStyle = t.bgWarm;
    ctx.fillRect(padX, tY, W - padX * 2, tableHeaderH);
    ctx.strokeStyle = t.ink;
    ctx.lineWidth = 3;
    ctx.strokeRect(padX, tY, W - padX * 2, tableHeaderH);

    ctx.fillStyle = t.ink;
    ctx.font = "bold 10px 'Space Mono', monospace";
    for (let i = 0; i < headers.length; i++) {
      ctx.textAlign = i === 0 ? "left" : "right";
      const x = i === 0 ? padX + 8 : padX + (i + 1) * colW - 8;
      ctx.fillText(headers[i], x, tY + 18);
    }

    for (let r = 0; r < rows.length; r++) {
      const rY = tY + tableHeaderH + r * tableRowH;
      const isCareer = r === rows.length - 1;
      if (isCareer) {
        ctx.fillStyle = t.bgWarm;
        ctx.fillRect(padX, rY, W - padX * 2, tableRowH);
      }
      ctx.strokeStyle = t.inkFaint;
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(padX, rY + tableRowH);
      ctx.lineTo(W - padX, rY + tableRowH);
      ctx.stroke();

      ctx.fillStyle = t.ink;
      ctx.font = isCareer ? "bold 11px 'Space Mono', monospace" : "11px 'Space Mono', monospace";
      for (let c = 0; c < rows[r].length; c++) {
        ctx.textAlign = c === 0 ? "left" : "right";
        const x = c === 0 ? padX + 8 : padX + (c + 1) * colW - 8;
        ctx.fillText(rows[r][c], x, rY + 16);
      }
    }

    ctx.strokeStyle = t.ink;
    ctx.lineWidth = 3;
    ctx.strokeRect(padX, tY, W - padX * 2, tableHeaderH + rows.length * tableRowH);
  }

  // Watermark
  const wmY = H - watermarkH / 2;
  ctx.font = "bold 16px 'Luckiest Guy', cursive";
  ctx.fillStyle = t.ink;
  ctx.globalAlpha = 0.3;
  ctx.textAlign = "center";
  ctx.fillText("razzle.lol", W / 2, wmY);
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
    content.innerHTML = `<div style="text-align:center; padding:40px; font-family:var(--font-hand); font-size:22px; color:var(--red);">fumbled the prospect data... try again in a sec.</div>`;
  }
}

function renderProspectProfile(data, container, compsData) {
  if (!data) { container.innerHTML = '<div style="text-align:center; padding:40px; font-family:var(--font-hand); font-size:22px; color:var(--ink-light);">prospect not found on the board</div>'; return; }
  const { prospect } = data;
  const percentiles = data.percentiles || {};
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
  html += `<div class="profile-name">${escapeHtml(prospect.player_name)}</div>`;
  html += `<div class="profile-meta">`;
  html += escapeHtml(prospect.school || "");
  if (prospect.draft_team) html += ` · ${escapeHtml(prospect.draft_team)}`;
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
    html += `<div class="prospect-rps-big">${(rpsData.rps || 0).toFixed(1)}</div>`;
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
    const career = college.career || {};
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
      const domColor = college.dominator_rating >= 30 ? "var(--green)" : college.dominator_rating >= 20 ? "var(--green)" : "var(--yellow)";
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
      html += `<td>${escapeHtml(s.team || "")}</td>`;
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
      html += `<canvas id="collegeArcCanvas" width="480" height="200" role="img" aria-label="College production arc trend line chart" style="border:2px solid var(--ink); border-radius:8px; background:var(--bg); max-width:100%;"></canvas>`;
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
    html += `<canvas id="prospectSpiderCanvas" width="400" height="360" role="img" aria-label="Athletic profile radar chart" style="border:2px solid var(--ink); border-radius:8px; background:var(--bg); max-width:100%;"></canvas>`;
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
      const simColor = simPct >= 85 ? "var(--green)" : simPct >= 70 ? "var(--green)" : simPct >= 55 ? "var(--yellow)" : "var(--orange)";

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
      html += `<div class="prospect-comp-name">${escapeHtml(comp.player_name)}</div>`;
      html += `<div class="prospect-comp-meta">${comp.draft_year}`;
      if (comp.draft_team) html += ` · ${escapeHtml(comp.draft_team)}`;
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
      const confColor = compProjection.confidence >= 75 ? "var(--green)" : compProjection.confidence >= 50 ? "var(--yellow)" : "var(--orange)";
      html += `<div class="prospect-proj-confidence">`;
      html += `<span style="font-family:var(--font-mono); font-size:11px; color:var(--ink-light);">Comp confidence:</span> `;
      html += `<span style="font-family:var(--font-mono); font-size:14px; font-weight:700; color:${confColor};">${Math.round(compProjection.confidence)}%</span>`;
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
  var t = getCanvasTheme();

  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = t.bg;
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
  ctx.fillStyle = t.inkLight;
  ctx.textAlign = "right";
  const gridSteps = 4;
  for (let i = 0; i <= gridSteps; i++) {
    const v = Math.round((maxVal / gridSteps) * i);
    const y = pad.top + plotH - (i / gridSteps) * plotH;
    ctx.beginPath();
    ctx.moveTo(pad.left, y);
    ctx.lineTo(W - pad.right, y);
    ctx.strokeStyle = t.gridLine;
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
    ctx.strokeStyle = t.ink;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Value label
    ctx.font = "bold 11px 'Space Mono', monospace";
    ctx.fillStyle = t.ink;
    ctx.textAlign = "center";
    ctx.fillText(values[i].toLocaleString(), x, y - 10);

    // Season label
    ctx.font = "11px 'Space Mono', monospace";
    ctx.fillStyle = t.inkMedium;
    ctx.fillText(labels[i], x, pad.top + plotH + 18);
  }
}

function getPercentileColor(pct) {
  // Red (0) → Yellow (50) → Green (100)
  if (pct <= 20) return "var(--red)";
  if (pct <= 40) return "var(--orange)";
  if (pct <= 60) return "var(--yellow)";
  if (pct <= 80) return "var(--green)";
  return "var(--green)";
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
  var t = getCanvasTheme();

  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = t.bg;
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
    ctx.strokeStyle = ring === 50 ? (t.isDark ? "rgba(237,224,207,0.2)" : "rgba(45,31,20,0.2)") : (t.isDark ? "rgba(237,224,207,0.08)" : "rgba(45,31,20,0.08)");
    ctx.lineWidth = ring === 50 ? 1.5 : 1;
    ctx.stroke();
  }

  // Draw axis lines
  for (let i = 0; i < n; i++) {
    const angle = startAngle + i * angleStep;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + R * Math.cos(angle), cy + R * Math.sin(angle));
    ctx.strokeStyle = t.isDark ? "rgba(237,224,207,0.1)" : "rgba(45,31,20,0.1)";
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
    ctx.strokeStyle = t.ink;
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
    ctx.fillStyle = t.ink;
    ctx.fillText(activeMetrics[i].label.replace(" Drill", "").replace(" Dash", "").replace(" Press", "").replace(" Jump", ""), x, y - 8);

    // Percentile value
    ctx.font = "bold 12px 'Space Mono', monospace";
    ctx.fillStyle = pctColor;
    ctx.fillText(`${Math.round(pct)}th`, x, y + 8);
  }

  // Title
  ctx.font = "18px 'Caveat', cursive";
  ctx.fillStyle = t.subtitleAlpha;
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
  var t = getCanvasTheme();

  // Background
  ctx.fillStyle = t.bg;
  ctx.fillRect(0, 0, W, H);

  let y = padY;

  // Header
  const posText = content.querySelector(".profile-pos-badge")?.textContent || "";
  const metaText = content.querySelector(".profile-meta")?.textContent || "";
  ctx.fillStyle = "#5b7fff";
  ctx.fillRect(padX, y, W - padX * 2, 6);
  y += 14;

  ctx.font = "bold 24px 'Luckiest Guy', cursive";
  ctx.fillStyle = t.ink;
  ctx.textAlign = "left";
  ctx.fillText(`${posText}  ${name}`, padX + 8, y + 24);

  ctx.font = "14px 'Space Mono', monospace";
  ctx.fillStyle = t.inkMedium;
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
      ctx.font = "bold 20px 'Luckiest Guy', cursive";
      ctx.fillStyle = t.ink;
      ctx.textAlign = "center";
      ctx.fillText(val, bx + boxW / 2, y + 24);
      ctx.font = "11px 'Space Mono', monospace";
      ctx.fillStyle = t.inkLight;
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
    ctx.strokeStyle = t.ink;
    ctx.lineWidth = 3;
    ctx.strokeRect(padX, y, W - padX * 2, 100);
    ctx.fillStyle = t.bgCard;
    ctx.fillRect(padX + 1, y + 1, W - padX * 2 - 2, 98);

    // Title
    ctx.font = "bold 13px 'Space Mono', monospace";
    ctx.fillStyle = t.ink;
    ctx.textAlign = "left";
    ctx.fillText("Razzle Prospect Score", padX + 14, y + 22);

    // Tier badge
    ctx.save();
    ctx.translate(padX + 210, y + 16);
    ctx.rotate(-3 * Math.PI / 180);
    ctx.fillStyle = tierColor;
    const badgeW = ctx.measureText(tierLabel).width + 16;
    ctx.fillRect(-badgeW / 2, -10, badgeW, 20);
    ctx.strokeStyle = t.ink;
    ctx.lineWidth = 2;
    ctx.strokeRect(-badgeW / 2, -10, badgeW, 20);
    ctx.font = "bold 11px 'Space Mono', monospace";
    ctx.fillStyle = t.white;
    ctx.textAlign = "center";
    ctx.fillText(tierLabel.toUpperCase(), 0, 4);
    ctx.restore();

    // RPS big number
    ctx.font = "bold 36px 'Luckiest Guy', cursive";
    ctx.fillStyle = t.ink;
    ctx.textAlign = "left";
    ctx.fillText(rpsVal, padX + 14, y + 68);

    // RPS bar
    const rpsNum = parseFloat(rpsVal) || 0;
    const barX = padX + 80;
    const barW = W - padX * 2 - 100;
    ctx.fillStyle = t.gridLine;
    ctx.fillRect(barX, y + 48, barW, 14);
    ctx.strokeStyle = t.ink;
    ctx.lineWidth = 2;
    ctx.strokeRect(barX, y + 48, barW, 14);
    ctx.fillStyle = tierColor;
    ctx.fillRect(barX + 1, y + 49, (Math.min(100, rpsNum) / 100) * (barW - 2), 12);

    // Component breakdown
    compBoxes.forEach((box, i) => {
      const cVal = box.querySelector(".prospect-rps-comp-val")?.textContent || "";
      const cLbl = box.querySelector(".prospect-rps-comp-label")?.textContent || "";
      const bx = padX + 14 + i * 140;
      ctx.font = "bold 14px 'Space Mono', monospace";
      ctx.fillStyle = t.ink;
      ctx.textAlign = "left";
      ctx.fillText(cVal, bx, y + 90);
      ctx.font = "10px 'Space Mono', monospace";
      ctx.fillStyle = t.inkLight;
      ctx.fillText(cLbl, bx + 30, y + 90);
    });

    y += 110;
  }

  // Combine metrics with bars
  if (combineGrid) {
    ctx.font = "bold 13px 'Space Mono', monospace";
    ctx.fillStyle = t.ink;
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
      const barColor = bar ? bar.style.background : "#c4b5a5";

      ctx.font = "12px 'Space Mono', monospace";
      ctx.fillStyle = t.ink;
      ctx.textAlign = "left";
      ctx.fillText(label, padX + 8, y + 12);

      ctx.font = "bold 12px 'Space Mono', monospace";
      ctx.textAlign = "right";
      ctx.fillText(value, padX + 200, y + 12);

      // Bar
      const barStartX = padX + 210;
      const barMaxW = W - padX * 2 - 280;
      ctx.fillStyle = t.gridLine;
      ctx.fillRect(barStartX, y + 2, barMaxW, 14);
      ctx.fillStyle = barColor;
      ctx.fillRect(barStartX, y + 2, (barWidth / 100) * barMaxW, 14);

      ctx.font = "bold 11px 'Space Mono', monospace";
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
    ctx.font = "bold 13px 'Space Mono', monospace";
    ctx.fillStyle = t.ink;
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
      ctx.fillStyle = t.bgCard;
      ctx.fillRect(padX, y, W - padX * 2, 44);
      ctx.strokeStyle = t.ink;
      ctx.lineWidth = 2;
      ctx.strokeRect(padX, y, W - padX * 2, 44);

      // Similarity badge
      ctx.fillStyle = simBg;
      ctx.fillRect(padX + 8, y + 8, 44, 28);
      ctx.strokeRect(padX + 8, y + 8, 44, 28);
      ctx.font = "bold 14px 'Space Mono', monospace";
      ctx.fillStyle = t.white;
      ctx.textAlign = "center";
      ctx.fillText(simText, padX + 30, y + 27);

      // Comp info
      ctx.textAlign = "left";
      ctx.font = "bold 14px 'Space Mono', monospace";
      ctx.fillStyle = t.ink;
      ctx.fillText(compName, padX + 62, y + 20);
      ctx.font = "10px 'Space Mono', monospace";
      ctx.fillStyle = t.inkLight;
      ctx.fillText(compMeta, padX + 62, y + 34);

      // Stats on right
      ctx.font = "10px 'Space Mono', monospace";
      ctx.fillStyle = t.inkMedium;
      ctx.textAlign = "right";
      ctx.fillText(compStats, W - padX - 8, y + 27);

      y += 50;
    });
    y += 10;
  }

  // Comp-based projections
  if (projGrid) {
    ctx.font = "bold 13px 'Space Mono', monospace";
    ctx.fillStyle = t.ink;
    ctx.textAlign = "left";
    ctx.fillText("Comp-Based Projection", padX + 8, y + 16);
    y += 28;

    const boxes = projGrid.querySelectorAll(".prospect-proj-box");
    const boxW = Math.min(100, (W - padX * 2 - 10 * boxes.length) / boxes.length);
    boxes.forEach((box, i) => {
      const val = box.querySelector(".prospect-proj-val")?.textContent || "";
      const lbl = box.querySelector(".prospect-proj-label")?.textContent || "";
      const bx = padX + i * (boxW + 10);

      ctx.fillStyle = t.bgCard;
      ctx.fillRect(bx, y, boxW, 50);
      ctx.strokeStyle = t.ink;
      ctx.lineWidth = 2;
      ctx.strokeRect(bx, y, boxW, 50);

      ctx.font = "bold 16px 'Luckiest Guy', cursive";
      ctx.fillStyle = t.ink;
      ctx.textAlign = "center";
      ctx.fillText(val, bx + boxW / 2, y + 22);
      ctx.font = "9px 'Space Mono', monospace";
      ctx.fillStyle = t.inkLight;
      ctx.fillText(lbl, bx + boxW / 2, y + 40);
    });
    y += 60;
  }

  // Watermark
  ctx.font = "bold 16px 'Luckiest Guy', cursive";
  ctx.fillStyle = t.ink;
  ctx.globalAlpha = 0.3;
  ctx.textAlign = "center";
  ctx.fillText("razzle.lol", W / 2, y + 10);
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
  contentEl.innerHTML = `<div style="text-align:center; padding:40px; font-family:var(--font-hand); font-size:22px; color:var(--ink-light);">grading the ${escapeHtml(position)} prospects...</div>`;

  // Highlight active button
  document.querySelectorAll(".tier-pos-btn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.pos === position);
  });

  try {
    const data = await apiFetch(`/api/prospect-tiers?position=${position}&draft_year=${state.draftYear || state.season}`);
    renderTierView(data, contentEl);
  } catch (err) {
    contentEl.innerHTML = `<div style="text-align:center; padding:40px; font-family:var(--font-hand); font-size:22px; color:var(--red);">fumbled the tier data... try again in a sec.</div>`;
  }
}

function renderTierView(data, container) {
  const tierDefs = [
    { key: "elite", label: "Elite", color: "var(--green)", desc: "80th+ percentile avg" },
    { key: "above_avg", label: "Above Average", color: "var(--green)", desc: "60th-80th percentile" },
    { key: "average", label: "Average", color: "var(--yellow)", desc: "40th-60th percentile" },
    { key: "below_avg", label: "Below Average", color: "var(--orange)", desc: "below 40th percentile" },
    { key: "no_data", label: "No Combine Data", color: "var(--ink-light)", desc: "did not test" },
  ];

  let html = `<div style="font-family:var(--font-hand); font-size:16px; color:var(--ink-light); margin-bottom:16px;">${escapeHtml(String(data.draft_year))} ${escapeHtml(data.position)} prospects — grouped by average combine percentile</div>`;

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
      html += `<div class="tier-card-name">${escapeHtml(p.player_name)}</div>`;
      html += `<div class="tier-card-meta">${escapeHtml(p.school || "")}${draftInfo ? " · " + draftInfo : ""}</div>`;
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
    html += `<div style="text-align:center; padding:40px; font-family:var(--font-hand); font-size:22px; color:var(--ink-light);">no ${escapeHtml(data.position)} prospects found for ${escapeHtml(String(data.draft_year))}</div>`;
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

  var t = getCanvasTheme();

  // Background
  ctx.fillStyle = t.bg;
  ctx.fillRect(0, 0, W, H);

  let y = padY;

  // Title
  ctx.font = "bold 24px 'Luckiest Guy', cursive";
  ctx.fillStyle = t.ink;
  ctx.textAlign = "center";
  ctx.fillText(`${state.season} ${currentTierPosition} Athletic Tiers`, W / 2, y + 24);
  y += 40;

  ctx.font = "16px 'Caveat', cursive";
  ctx.fillStyle = t.inkLight;
  ctx.fillText("grouped by avg combine percentile — razzle.lol", W / 2, y + 14);
  y += 30;

  // Draw each tier group
  const tierColors = { elite: "#2ec4b6", above_avg: "#2ec4b6", average: "#ffc857", below_avg: "#d97757", no_data: "#8a7565" };
  const tierLabels = { elite: "ELITE", above_avg: "ABOVE AVG", average: "AVERAGE", below_avg: "BELOW AVG", no_data: "NO DATA" };

  tierGroups.forEach(g => {
    const badge = g.querySelector(".tier-badge");
    const cards = g.querySelectorAll(".tier-card");
    if (!badge || cards.length === 0) return;

    const badgeText = badge.textContent.toUpperCase();
    const badgeColor = badge.style.background || "#8a7565";

    // Draw badge
    ctx.save();
    ctx.translate(padX + 60, y + 14);
    ctx.rotate(-0.03);
    const tw = ctx.measureText(badgeText).width + 28;
    ctx.fillStyle = badgeColor;
    ctx.beginPath();
    ctx.roundRect(-tw / 2, -12, tw, 24, 12);
    ctx.fill();
    ctx.strokeStyle = t.ink;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = t.white;
    ctx.font = "bold 12px 'Space Mono', monospace";
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
      ctx.fillStyle = t.bgCard;
      ctx.strokeStyle = t.ink;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(cx, cy, cardW, 64, 8);
      ctx.fill();
      ctx.stroke();

      // Name
      ctx.font = "bold 14px 'Space Mono', monospace";
      ctx.fillStyle = t.ink;
      ctx.textAlign = "left";
      ctx.fillText(name.substring(0, 22), cx + 8, cy + 18);

      // Meta
      ctx.font = "10px 'Space Mono', monospace";
      ctx.fillStyle = t.inkLight;
      ctx.fillText(meta.substring(0, 35), cx + 8, cy + 32);

      // Metrics
      ctx.font = "9px 'Space Mono', monospace";
      ctx.fillStyle = t.inkMedium;
      ctx.fillText(metrics.substring(0, 45), cx + 8, cy + 48);

      // Percentile
      if (pctEl) {
        const pctText = pctEl.textContent;
        const pctColor = pctEl.style.color;
        ctx.font = "bold 18px 'Luckiest Guy', cursive";
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
  ctx.font = "bold 16px 'Luckiest Guy', cursive";
  ctx.fillStyle = t.ink;
  ctx.globalAlpha = 0.3;
  ctx.textAlign = "center";
  ctx.fillText("razzle.lol", W / 2, y + 10);
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
  contentEl.innerHTML = `<div style="text-align:center; padding:40px; font-family:var(--font-hand); font-size:22px; color:var(--ink-light);">scouting the ${position === "ALL" ? "" : escapeHtml(position) + " "}board...</div>`;

  document.querySelectorAll(".bb-pos-btn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.pos === position);
  });

  try {
    const posParam = position === "ALL" ? "" : position;
    const data = await apiFetch(`/api/prospect-scores?position=${posParam}&draft_year=${state.draftYear || state.season}`);
    currentBBData = data;
    renderBigBoard(data, contentEl);
  } catch (err) {
    contentEl.innerHTML = `<div style="text-align:center; padding:40px; font-family:var(--font-hand); font-size:22px; color:var(--red);">fumbled the big board... try again in a sec.</div>`;
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
  if (rps >= 85) return { key: "elite", label: "Elite", color: "var(--green)" };
  if (rps >= 70) return { key: "premium", label: "Premium", color: "var(--green)" };
  if (rps >= 55) return { key: "solid", label: "Solid", color: "var(--yellow)" };
  return { key: "flier", label: "Flier", color: "var(--orange)" };
}

function renderBigBoard(data, container) {
  const prospects = data.prospects || [];
  if (prospects.length === 0) {
    container.innerHTML = `<div style="text-align:center; padding:40px; font-family:var(--font-hand); font-size:22px; color:var(--ink-light);">no prospects found for ${escapeHtml(String(data.draft_year))} ${escapeHtml(data.position)}</div>`;
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
    { key: "elite", label: "Elite", color: "var(--green)", desc: "RPS 85+" },
    { key: "premium", label: "Premium", color: "var(--green)", desc: "RPS 70-85" },
    { key: "solid", label: "Solid", color: "var(--yellow)", desc: "RPS 55-70" },
    { key: "flier", label: "Flier", color: "var(--orange)", desc: "RPS below 55" },
  ];

  let html = `<div style="font-family:var(--font-hand); font-size:16px; color:var(--ink-light); margin-bottom:16px;">${escapeHtml(String(data.draft_year))} ${escapeHtml(data.position)} Big Board — ranked by Razzle Prospect Score</div>`;

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
      html += `<span class="bb-card-name">${escapeHtml(p.player_name)}</span>`;
      html += `<span class="bb-card-pos" style="background:${posColor};">${escapeHtml(p.position)}</span>`;
      html += `</div>`;
      html += `<div class="bb-card-meta">${escapeHtml(p.school || "")} · ${draftInfo}</div>`;
      html += `<div class="bb-card-rps-row">`;
      html += `<div class="bb-card-rps-bar"><div class="bb-card-rps-fill" style="width:${rpsPct}%; background:${td.color};"></div></div>`;
      html += `<span class="bb-card-rps-val">${(p.rps || 0).toFixed(1)}</span>`;
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
    { key: "elite", label: "ELITE", color: "#2ec4b6" },
    { key: "premium", label: "PREMIUM", color: "#2ec4b6" },
    { key: "solid", label: "SOLID", color: "#ffc857" },
    { key: "flier", label: "FLIER", color: "#d97757" },
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

  var t = getCanvasTheme();

  // Background
  ctx.fillStyle = t.bg;
  ctx.fillRect(0, 0, W, H);

  let y = padY;

  // Title
  ctx.font = "bold 26px 'Luckiest Guy', cursive";
  ctx.fillStyle = t.ink;
  ctx.textAlign = "center";
  ctx.fillText(`Razzle Big Board — ${currentBBData.position} ${currentBBData.draft_year}`, W / 2, y + 26);
  y += 42;

  ctx.font = "16px 'Caveat', cursive";
  ctx.fillStyle = t.inkLight;
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
    ctx.strokeStyle = t.ink;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = t.white;
    ctx.font = "bold 12px 'Space Mono', monospace";
    ctx.textAlign = "center";
    ctx.fillText(label, 0, 4);
    ctx.restore();
    y += tierHeaderH;

    // Prospect rows
    for (const p of tierProspects) {
      const rowY = y;
      const posColor = posColors[p.position] || "#d97757";

      // Row bg
      ctx.fillStyle = p.rank % 2 === 0 ? t.bgCard : t.bgWarm;
      ctx.fillRect(padX, rowY, W - padX * 2, rowH - 2);
      ctx.strokeStyle = t.ink;
      ctx.lineWidth = 1;
      ctx.strokeRect(padX, rowY, W - padX * 2, rowH - 2);

      // Rank
      ctx.font = "bold 16px 'Luckiest Guy', cursive";
      ctx.fillStyle = posColor;
      ctx.textAlign = "center";
      ctx.fillText(`${p.rank}`, padX + 22, rowY + 27);

      // Name
      ctx.font = "bold 14px 'Space Mono', monospace";
      ctx.fillStyle = t.ink;
      ctx.textAlign = "left";
      ctx.fillText(p.player_name.substring(0, 22), padX + 44, rowY + 18);

      // Meta
      ctx.font = "10px 'Space Mono', monospace";
      ctx.fillStyle = t.inkLight;
      const draftInfo = p.draft_round && p.draft_pick ? `Rd ${p.draft_round} #${p.draft_pick}` : "UDFA";
      ctx.fillText(`${p.school || ""} · ${draftInfo}`, padX + 44, rowY + 34);

      // Position chip
      ctx.fillStyle = posColor;
      const chipX = padX + 280;
      ctx.beginPath();
      ctx.roundRect(chipX, rowY + 10, 30, 20, 10);
      ctx.fill();
      ctx.font = "bold 10px 'Space Mono', monospace";
      ctx.fillStyle = t.white;
      ctx.textAlign = "center";
      ctx.fillText(p.position, chipX + 15, rowY + 24);

      // RPS bar
      const barX = padX + 330;
      ctx.fillStyle = t.bgWarm;
      ctx.beginPath();
      ctx.roundRect(barX, rowY + 16, barW, barH, 5);
      ctx.fill();
      const fillW = Math.min(barW, (p.rps / 100) * barW);
      ctx.fillStyle = td.color;
      ctx.beginPath();
      ctx.roundRect(barX, rowY + 16, fillW, barH, 5);
      ctx.fill();

      // RPS value
      ctx.font = "bold 14px 'Space Mono', monospace";
      ctx.fillStyle = t.ink;
      ctx.textAlign = "left";
      ctx.fillText((p.rps || 0).toFixed(1), barX + barW + 8, rowY + 27);

      // Key metrics
      ctx.font = "10px 'Space Mono', monospace";
      ctx.fillStyle = t.inkMedium;
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
  ctx.font = "bold 14px 'Space Mono', monospace";
  ctx.fillStyle = t.ink;
  ctx.globalAlpha = 0.3;
  ctx.textAlign = "center";
  ctx.fillText("razzle.lol", W / 2, y + 8);
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
  contentEl.innerHTML = `<div style="text-align:center; padding:40px; font-family:var(--font-hand); font-size:22px; color:var(--ink-light);">analyzing ${position === "ALL" ? "all" : escapeHtml(position)} draft classes...</div>`;

  document.querySelectorAll(".ca-pos-btn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.pos === position);
  });

  try {
    const posParam = position === "ALL" ? "" : position;
    const data = await apiFetch(`/api/draft-class-analytics?position=${posParam}`);
    currentCAData = { ...data, filterPosition: position };
    renderClassAnalytics(data, contentEl);
  } catch (err) {
    contentEl.innerHTML = `<div style="text-align:center; padding:40px; font-family:var(--font-hand); font-size:22px; color:var(--red);">fumbled the analytics... try again in a sec.</div>`;
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
  html += `<div style="margin-bottom:24px;"><canvas id="caBarChart" width="900" height="280" role="img" aria-label="Draft class comparison bar chart" style="width:100%; max-width:900px; border:2px solid var(--ink); border-radius:8px; box-shadow:4px 4px 0 var(--ink);"></canvas></div>`;

  // Class cards grid
  html += `<div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(260px, 1fr)); gap:16px;">`;

  for (const cls of classes) {
    const gradeColor = gradeColors[cls.grade] || "var(--ink-light)";
    const topName = cls.top_prospect ? cls.top_prospect.name : "N/A";
    const topRPS = cls.top_prospect ? (cls.top_prospect.rps || 0).toFixed(1) : "-";
    const totalElitePrem = cls.tiers.elite + cls.tiers.premium;

    html += `
      <div style="background:var(--bg-card); border:3px solid var(--ink); border-radius:var(--radius-sm); box-shadow:4px 4px 0 var(--ink); padding:16px; position:relative;">
        <!-- Grade badge -->
        <div style="position:absolute; top:-10px; right:12px; background:${gradeColor}; color:var(--text-on-accent); font-family:var(--font-display); font-size:18px; font-weight:700; padding:4px 12px; border:2px solid var(--ink); border-radius:6px; box-shadow:2px 2px 0 var(--ink); transform:rotate(3deg);">
          ${cls.grade}
        </div>

        <!-- Year heading -->
        <div style="font-family:var(--font-display); font-size:24px; font-weight:700; color:var(--ink); margin-bottom:8px;">${cls.year}</div>

        <!-- Stats row -->
        <div style="display:flex; gap:16px; margin-bottom:12px; font-family:var(--font-mono); font-size:13px;">
          <div><span style="color:var(--ink-light);">Prospects:</span> ${cls.count}</div>
          <div><span style="color:var(--ink-light);">Avg RPS:</span> <strong>${(cls.avg_rps || 0).toFixed(1)}</strong></div>
        </div>

        <!-- Tier distribution bar -->
        <div style="margin-bottom:10px;">
          <div style="font-family:var(--font-mono); font-size:11px; text-transform:uppercase; color:var(--ink-light); margin-bottom:4px;">Tier Distribution</div>
          <div style="display:flex; height:20px; border:2px solid var(--ink); border-radius:4px; overflow:hidden;">
            ${cls.count > 0 ? ['elite','premium','solid','flier'].map(tier => {
              const pct = (cls.tiers[tier] / cls.count * 100);
              return pct > 0 ? `<div style="width:${pct}%; background:${tierColors[tier]}; display:flex; align-items:center; justify-content:center; font-family:var(--font-mono); font-size:10px; color:var(--text-on-accent); font-weight:700;">${cls.tiers[tier]}</div>` : '';
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
          <div style="font-family:var(--font-mono); font-size:11px; text-transform:uppercase; color:var(--ink-light); margin-bottom:2px;">Top Prospect</div>
          <div style="font-family:var(--font-mono); font-size:14px; font-weight:700;">${topName}</div>
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

  var t = getCanvasTheme();
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = t.bgCard;
  ctx.fillRect(0, 0, W, H);

  const barCount = classes.length;
  const barGap = 12;
  const barW = Math.min(80, (chartW - barGap * (barCount + 1)) / barCount);
  const totalBarsW = barCount * barW + (barCount - 1) * barGap;
  const startX = PAD_L + (chartW - totalBarsW) / 2;

  const gradeColors = { A: "#2ec4b6", B: "#5b7fff", C: "#d97757", D: "#e63946" };
  const scaleMax = Math.ceil(maxRPS / 10) * 10;

  // Y-axis gridlines + labels
  ctx.strokeStyle = t.inkFaint;
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);
  for (let v = 0; v <= scaleMax; v += 10) {
    const y = PAD_T + chartH - (v / scaleMax) * chartH;
    ctx.beginPath();
    ctx.moveTo(PAD_L, y);
    ctx.lineTo(W - PAD_R, y);
    ctx.stroke();
    ctx.fillStyle = t.inkLight;
    ctx.font = "12px 'Space Mono', monospace";
    ctx.textAlign = "right";
    ctx.fillText(v.toString(), PAD_L - 8, y + 4);
  }
  ctx.setLineDash([]);

  // Y-axis label
  ctx.save();
  ctx.translate(14, PAD_T + chartH / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillStyle = t.inkMedium;
  ctx.font = "bold 11px 'Space Mono', monospace";
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
    const color = gradeColors[cls.grade] || "#8a7565";
    ctx.fillStyle = color;
    ctx.fillRect(x, y, barW, barH);

    // Bar border
    ctx.strokeStyle = t.ink;
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, barW, barH);

    // Value on top
    ctx.fillStyle = t.ink;
    ctx.font = "bold 12px 'Space Mono', monospace";
    ctx.textAlign = "center";
    ctx.fillText((cls.avg_rps || 0).toFixed(1), x + barW / 2, y - 8);

    // Grade badge on top
    const badgeW = 22, badgeH = 18;
    const bx = x + barW / 2 - badgeW / 2;
    const by = y - 28;
    ctx.fillStyle = color;
    ctx.fillRect(bx, by, badgeW, badgeH);
    ctx.strokeStyle = t.ink;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(bx, by, badgeW, badgeH);
    ctx.fillStyle = t.white;
    ctx.font = "bold 11px 'Space Mono', monospace";
    ctx.fillText(cls.grade, x + barW / 2, by + 13);

    // Year label
    ctx.fillStyle = t.ink;
    ctx.font = "bold 14px 'Space Mono', monospace";
    ctx.textAlign = "center";
    ctx.fillText(cls.year.toString(), x + barW / 2, PAD_T + chartH + 20);

    // Count label
    ctx.fillStyle = t.inkLight;
    ctx.font = "11px 'Space Mono', monospace";
    ctx.fillText(`(${cls.count})`, x + barW / 2, PAD_T + chartH + 36);
  }

  // Title
  ctx.fillStyle = t.ink;
  ctx.font = "bold 14px 'Space Mono', monospace";
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

  var t = getCanvasTheme();

  // Background
  ctx.fillStyle = t.bgCard;
  ctx.fillRect(0, 0, W, totalH);

  // Title
  let y = 0;
  ctx.fillStyle = t.ink;
  ctx.font = "bold 24px 'Luckiest Guy', cursive";
  ctx.textAlign = "center";
  ctx.fillText(`Razzle Draft Class Analytics — ${posLabel}`, W / 2, y + 32);
  ctx.font = "16px 'Caveat', cursive";
  ctx.fillStyle = t.inkLight;
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
  ctx.strokeStyle = t.inkFaint;
  ctx.lineWidth = 1;
  ctx.setLineDash([3, 3]);
  for (let v = 0; v <= scaleMax; v += 10) {
    const gy = y + chartH - 40 - (v / scaleMax) * (chartH - 60);
    ctx.beginPath();
    ctx.moveTo(PAD_L, gy);
    ctx.lineTo(W - PAD_R, gy);
    ctx.stroke();
    ctx.fillStyle = t.inkLight;
    ctx.font = "11px 'Space Mono', monospace";
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

    const color = gradeColors[cls.grade] || "#8a7565";
    ctx.fillStyle = color;
    ctx.fillRect(x, by, barW, bH);
    ctx.strokeStyle = t.ink;
    ctx.lineWidth = 2;
    ctx.strokeRect(x, by, barW, bH);

    // Value
    ctx.fillStyle = t.ink;
    ctx.font = "bold 11px 'Space Mono', monospace";
    ctx.textAlign = "center";
    ctx.fillText((cls.avg_rps || 0).toFixed(1), x + barW / 2, by - 6);

    // Grade
    const gw = 20, gh = 16;
    ctx.fillStyle = color;
    ctx.fillRect(x + barW / 2 - gw / 2, by - 24, gw, gh);
    ctx.strokeStyle = t.ink;
    ctx.lineWidth = 1;
    ctx.strokeRect(x + barW / 2 - gw / 2, by - 24, gw, gh);
    ctx.fillStyle = t.white;
    ctx.font = "bold 10px 'Space Mono', monospace";
    ctx.fillText(cls.grade, x + barW / 2, by - 12);

    // Year
    ctx.fillStyle = t.ink;
    ctx.font = "bold 12px 'Space Mono', monospace";
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
    ctx.fillStyle = t.bgCard;
    ctx.fillRect(cx, cy, cardW, cardH);
    ctx.strokeStyle = t.ink;
    ctx.lineWidth = 2;
    ctx.strokeRect(cx, cy, cardW, cardH);

    // Shadow
    ctx.fillStyle = t.ink;
    ctx.fillRect(cx + 3, cy + 3, cardW, cardH);
    ctx.fillStyle = t.bgCard;
    ctx.fillRect(cx, cy, cardW, cardH);
    ctx.strokeStyle = t.ink;
    ctx.lineWidth = 2;
    ctx.strokeRect(cx, cy, cardW, cardH);

    // Grade badge
    const color = gradeColors[cls.grade] || "#8a7565";
    ctx.fillStyle = color;
    const gbx = cx + cardW - 30, gby = cy + 6;
    ctx.fillRect(gbx, gby, 24, 20);
    ctx.strokeStyle = t.ink;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(gbx, gby, 24, 20);
    ctx.fillStyle = t.white;
    ctx.font = "bold 13px 'Space Mono', monospace";
    ctx.textAlign = "center";
    ctx.fillText(cls.grade, gbx + 12, gby + 15);

    // Year
    ctx.textAlign = "left";
    ctx.fillStyle = t.ink;
    ctx.font = "bold 18px 'Luckiest Guy', cursive";
    ctx.fillText(cls.year.toString(), cx + 10, cy + 24);

    // Stats
    ctx.font = "12px 'Space Mono', monospace";
    ctx.fillStyle = t.inkMedium;
    ctx.fillText(`${cls.count} prospects  |  Avg RPS: ${(cls.avg_rps || 0).toFixed(1)}`, cx + 10, cy + 44);

    // Tier counts
    ctx.font = "11px 'Space Mono', monospace";
    const tierText = `E:${cls.tiers.elite} P:${cls.tiers.premium} S:${cls.tiers.solid} F:${cls.tiers.flier}`;
    ctx.fillText(tierText, cx + 10, cy + 62);

    // Top prospect
    if (cls.top_prospect) {
      ctx.font = "10px 'Space Mono', monospace";
      ctx.fillStyle = t.inkLight;
      ctx.fillText("Top:", cx + 10, cy + 82);
      ctx.fillStyle = t.ink;
      ctx.font = "bold 11px 'Space Mono', monospace";
      const name = cls.top_prospect.name.length > 22 ? cls.top_prospect.name.slice(0, 20) + "..." : cls.top_prospect.name;
      ctx.fillText(`${name} (${(cls.top_prospect.rps || 0).toFixed(1)})`, cx + 10, cy + 96);
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
      ctx.strokeStyle = t.ink;
      ctx.lineWidth = 1;
      ctx.strokeRect(cx + 10, barY, barTotalW, 8);
    }
  }

  y += cardRows * (cardH + 12) + 10;

  // Watermark
  ctx.font = "bold 14px 'Space Mono', monospace";
  ctx.fillStyle = t.ink;
  ctx.globalAlpha = 0.3;
  ctx.textAlign = "center";
  ctx.fillText("razzle.lol", W / 2, y + 8);
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
  var _ink = typeof getCanvasTheme === "function" ? getCanvasTheme().ink : "#2d1f14";
  const posColors = { ALL: _ink, QB: "#5b7fff", RB: "#2ec4b6", WR: "#d97757", TE: "#8b5cf6" };
  const container = document.getElementById("tvPositionBtns");
  container.innerHTML = "";
  for (const pos of ["ALL", "QB", "RB", "WR", "TE"]) {
    const active = pos === _tvState.position;
    const btn = document.createElement("button");
    btn.className = active ? "btn-primary" : "btn-chunky";
    btn.textContent = pos;
    btn.style.cssText = "font-size:11px; padding:4px 12px;";
    if (!active && posColors[pos] !== _ink) btn.style.borderColor = posColors[pos];
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
    { name: "Bench", min: 0, color: "#8a7565", badge: "BENCH" },
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
    html += '<span style="display:inline-block; font-family:var(--font-mono); font-size:12px; text-transform:uppercase; letter-spacing:1px; color:var(--text-on-accent); background:' + tier.color + '; padding:4px 14px; border:2px solid var(--ink); border-radius:4px; transform:rotate(-2deg); box-shadow:2px 2px 0 var(--ink);">' + tier.badge + '</span>';
    html += '<span style="font-family:var(--font-hand); font-size:16px; color:var(--ink-light);">' + tierPlayers.length + ' player' + (tierPlayers.length !== 1 ? 's' : '') + '</span>';
    html += '</div>';

    // Player cards grid
    html += '<div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(200px, 1fr)); gap:8px;">';
    for (const p of tierPlayers) {
      const pc = posColors[p.position] || getCanvasTheme().ink;
      const barWidth = Math.max(5, p._tv);
      html += '<div style="background:var(--bg-card); border:2px solid var(--ink); border-radius:8px; padding:8px 10px; box-shadow:2px 2px 0 var(--ink); display:flex; flex-direction:column; gap:4px; border-left:5px solid ' + pc + ';">';
      // Name + position
      html += '<div style="display:flex; align-items:center; gap:6px;">';
      html += '<span style="font-family:var(--font-mono); font-size:13px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">' + escapeHtml(p.full_name) + '</span>';
      html += '<span style="font-family:var(--font-mono); font-size:9px; font-weight:bold; color:var(--text-on-accent); background:' + pc + '; padding:1px 5px; border-radius:3px; border:2px solid var(--ink);">' + escapeHtml(p.position) + '</span>';
      html += '</div>';
      // Team + Age
      html += '<div style="font-family:var(--font-mono); font-size:11px; color:var(--ink-light);">' + escapeHtml(p.team || "FA") + (p.age ? ' · Age ' + Math.round(p.age) : '') + '</div>';
      // Trade value bar
      html += '<div style="display:flex; align-items:center; gap:6px;">';
      html += '<div style="flex:1; height:8px; background:var(--bg-warm); border:2px solid var(--ink-faint); border-radius:4px; overflow:hidden;">';
      html += '<div style="width:' + barWidth + '%; height:100%; background:' + pc + '; border-radius:4px;"></div>';
      html += '</div>';
      html += '<span style="font-family:var(--font-mono); font-size:13px; font-weight:bold; min-width:28px; text-align:right;">' + p._tv + '</span>';
      html += '</div>';
      html += '</div>';
    }
    html += '</div></div>';
  }

  if (!html) {
    html = '<div style="text-align:center; padding:40px; font-family:var(--font-hand); font-size:22px; color:var(--ink-light);">' + razzleEmpty() + '</div>';
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
        const pc = posColors[p.position] || getCanvasTheme().ink;
        return '<div class="tv-auto-row" data-side="' + side + '" data-pid="' + escapeAttr(p.player_id || p.full_name) + '" style="padding:6px 10px; cursor:pointer; display:flex; align-items:center; gap:6px; border-bottom:1px solid var(--ink-faint);">'
          + '<span style="font-family:var(--font-mono); font-size:9px; font-weight:bold; color:var(--text-on-accent); background:' + pc + '; padding:1px 5px; border-radius:3px;">' + escapeHtml(p.position) + '</span>'
          + '<span style="font-family:var(--font-mono); font-size:12px;">' + escapeHtml(p.full_name) + '</span>'
          + '<span style="font-family:var(--font-mono); font-size:11px; color:var(--ink-light); margin-left:auto;">' + p._tv + '</span>'
          + '</div>';
      }).join("");
      autoDiv.style.display = "";
    }, 150);
  });

  input.addEventListener("blur", () => {
    setTimeout(() => { autoDiv.style.display = "none"; }, 200);
  });

  autoDiv.addEventListener("mousedown", (e) => {
    const row = e.target.closest(".tv-auto-row");
    if (!row) return;
    addToTradeSide(row.dataset.side, row.dataset.pid);
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
    const pc = posColors[p.position] || getCanvasTheme().ink;
    return '<div style="display:flex; align-items:center; gap:6px; padding:5px 8px; background:var(--bg-card); border:2px solid var(--ink); border-radius:6px; border-left:4px solid ' + pc + ';">'
      + '<span style="font-family:var(--font-mono); font-size:9px; font-weight:bold; color:var(--text-on-accent); background:' + pc + '; padding:1px 4px; border-radius:3px;">' + escapeHtml(p.position) + '</span>'
      + '<span style="font-family:var(--font-mono); font-size:12px; flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">' + escapeHtml(p.full_name) + '</span>'
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
    badge.style.background = "var(--green-light)";
    badge.style.color = "var(--green)";
  } else {
    const sign = diff > 0 ? "A+" : "B+";
    badge.textContent = sign + Math.abs(diff);
    badge.style.background = "var(--red-light)";
    badge.style.color = "var(--red)";
  }
}

// ─── Trade Value PNG Export ──────────────────────────────────────────

function exportTradeValuesPNG() {
  const posColors = { QB: "#5b7fff", RB: "#2ec4b6", WR: "#d97757", TE: "#8b5cf6" };
  const tiers = [
    { name: "Elite", min: 85, color: "#2ec4b6", badge: "ELITE" },
    { name: "Star", min: 70, color: "#5b7fff", badge: "STAR" },
    { name: "Starter", min: 55, color: "#d97757", badge: "STARTER" },
    { name: "Bench", min: 0, color: "#8a7565", badge: "BENCH" },
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

  var t = getCanvasTheme();

  // Background
  ctx.fillStyle = t.bgCard;
  ctx.fillRect(0, 0, W, H);

  // Title
  ctx.font = "bold 24px 'Luckiest Guy', cursive";
  ctx.fillStyle = t.ink;
  ctx.textAlign = "center";
  const posLabel = _tvState.position === "ALL" ? "Dynasty" : _tvState.position;
  ctx.fillText("Razzle " + posLabel + " Trade Values", W / 2, padY + 26);

  // Subtitle
  ctx.font = "16px 'Caveat', cursive";
  ctx.fillStyle = t.subtitleAlpha;
  const seasonText = state.season === "career" ? "career" : state.season || "Latest";
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
    ctx.strokeStyle = t.ink;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = t.white;
    ctx.font = "bold 10px 'Space Mono', monospace";
    ctx.textAlign = "center";
    ctx.fillText(g.tier.badge, 0, 4);
    ctx.restore();

    // Player count
    ctx.font = "14px 'Caveat', cursive";
    ctx.fillStyle = t.inkLight;
    ctx.textAlign = "left";
    ctx.fillText(g.players.length + " player" + (g.players.length !== 1 ? "s" : ""), padX + 86, y + tierHeaderH / 2 + 5);

    y += tierHeaderH;

    // Player rows
    for (let i = 0; i < g.players.length; i++) {
      const p = g.players[i];
      const pc = posColors[p.position] || getCanvasTheme().ink;
      const ry = y + i * rowH;

      // Alternating bg
      if (i % 2 === 0) {
        ctx.fillStyle = "rgba(229,213,195,0.25)";
        ctx.fillRect(padX, ry, W - padX * 2, rowH);
      }

      // Position badge
      ctx.fillStyle = pc;
      ctx.fillRect(padX + 8, ry + 6, 28, 16);
      ctx.strokeStyle = t.ink;
      ctx.lineWidth = 1;
      ctx.strokeRect(padX + 8, ry + 6, 28, 16);
      ctx.fillStyle = t.white;
      ctx.font = "bold 8px 'Space Mono', monospace";
      ctx.textAlign = "center";
      ctx.fillText(p.position, padX + 22, ry + 17);

      // Name
      ctx.textAlign = "left";
      ctx.fillStyle = t.ink;
      ctx.font = "bold 12px 'Space Mono', monospace";
      ctx.fillText(p.full_name || "", padX + 44, ry + 18);

      // Team + age
      ctx.fillStyle = t.inkLight;
      ctx.font = "10px 'Space Mono', monospace";
      ctx.fillText((p.team || "FA") + (p.age ? "  Age " + Math.round(p.age) : ""), padX + 300, ry + 18);

      // Trade value bar
      const barX = padX + 430;
      const barW = 240;
      const barH = 10;
      const barY = ry + 9;
      ctx.fillStyle = "rgba(229,213,195,0.5)";
      ctx.fillRect(barX, barY, barW, barH);
      ctx.strokeStyle = t.inkFaint;
      ctx.lineWidth = 0.5;
      ctx.strokeRect(barX, barY, barW, barH);
      const fillW = Math.max(2, (p._tv / 100) * barW);
      ctx.fillStyle = pc;
      ctx.fillRect(barX, barY, fillW, barH);

      // Trade value number
      ctx.fillStyle = t.ink;
      ctx.font = "bold 13px 'Space Mono', monospace";
      ctx.textAlign = "right";
      ctx.fillText(String(p._tv), W - padX - 8, ry + 18);
    }

    y += g.players.length * rowH + tierGap;
  }

  // Watermark
  ctx.font = "bold 14px 'Space Mono', monospace";
  ctx.fillStyle = t.ink;
  ctx.globalAlpha = 0.3;
  ctx.textAlign = "center";
  ctx.fillText("razzle.lol", W / 2, y + 8);
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
  var t = getCanvasTheme();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = t.bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.font = "22px 'Caveat', cursive";
  ctx.fillStyle = t.inkLight;
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
    ctx.fillStyle = t.bg;
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

  var t = getCanvasTheme();

  // Clear
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = t.bg;
  ctx.fillRect(0, 0, W, H);

  const baseline = data.baseline;
  if (!baseline.length) return;

  // Compute ranges
  const ages = baseline.map(b => b.age);
  const minAge = Math.min(...ages);
  const maxAge = Math.max(...ages);

  // Include player data in max PPG
  let maxPPG = Math.max(...baseline.map(b => b.avg_ppg).filter(v => v != null), 1);
  for (const p of (data.players || [])) {
    if (_acState.enabledPlayers[p.name]) {
      for (const pt of p.points) {
        if (pt.ppg > maxPPG) maxPPG = pt.ppg;
      }
    }
  }
  maxPPG = Math.ceil(maxPPG / 5) * 5 + 5; // Round up with padding

  // Scale functions (guard against zero range)
  const ageRange = (maxAge - minAge) || 1;
  const xScale = (age) => padL + ((age - minAge) / ageRange) * chartW;
  const yScale = (ppg) => padT + chartH - (ppg / (maxPPG || 1)) * chartH;

  // Grid lines
  ctx.strokeStyle = t.inkFaint;
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
  ctx.fillStyle = t.inkMedium;
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
    ctx.strokeStyle = t.inkFaint;
    ctx.lineWidth = 1;
    ctx.moveTo(x, padT + chartH);
    ctx.lineTo(x, padT + chartH + 4);
    ctx.stroke();
  }

  // Axis labels
  ctx.font = "bold 12px 'Space Mono', monospace";
  ctx.fillStyle = t.ink;
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
    "#ffc857", "#e63946", "#8a7565", "#4a9e5c", "#c44daa",
  ];
  let colorIdx = 0;
  for (const p of (data.players || [])) {
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
    ctx.globalAlpha = 1.0;

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
    ctx.fillText((p.name || '').split(" ").pop(), xScale(last.age) + 6, yScale(last.ppg) + 3);

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
    ctx.strokeStyle = t.ink;
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
  ctx.fillStyle = t.ink;
  ctx.textAlign = "left";
  ctx.fillText(_acState.position + " Aging Curve", padL, 24);

  // Subtitle annotation
  ctx.font = "16px 'Caveat', cursive";
  ctx.fillStyle = t.inkLight;
  ctx.textAlign = "right";
  ctx.fillText("avg PPG by age, all seasons", W - padR, 28);

  // Chart border
  ctx.strokeStyle = t.ink;
  ctx.lineWidth = 2;
  ctx.strokeRect(padL, padT, chartW, chartH);
}

function renderACLegend() {
  const data = _acState.data;
  if (!data) return;
  const container = document.getElementById("acLegend");

  const playerColors = [
    "#e87422", "#5b7fff", "#2ec4b6", "#8b5cf6", "#d44040",
    "#ffc857", "#e63946", "#8a7565", "#4a9e5c", "#c44daa",
  ];

  let html = '<div style="font-family:var(--font-mono); font-size:11px; text-transform:uppercase; letter-spacing:1px; color:var(--ink-light); margin-right:8px; padding-top:6px;">Players</div>';
  (data.players || []).forEach((p, i) => {
    const color = playerColors[i % playerColors.length];
    const enabled = _acState.enabledPlayers[p.name];
    const opacity = enabled ? "1" : "0.4";
    const border = enabled ? "2px solid " + color : "2px solid var(--ink-faint)";
    html += '<button class="ac-player-toggle" data-name="' + escapeAttr(p.name) + '" style="'
      + 'display:inline-flex; align-items:center; gap:6px; padding:4px 10px; border-radius:20px;'
      + 'border:' + border + '; background:' + (enabled ? color + '15' : 'transparent') + ';'
      + 'cursor:pointer; opacity:' + opacity + '; font-family:var(--font-mono); font-size:11px;'
      + 'transition:all 0.15s;">'
      + '<span style="width:10px; height:10px; border-radius:50%; background:' + color + '; display:inline-block;"></span>'
      + escapeHtml(p.name) + ' <span style="color:var(--ink-light);">' + p.career_ppg + '</span>'
      + '</button>';
  });
  container.innerHTML = html;
  container.querySelectorAll('.ac-player-toggle').forEach(btn => {
    btn.addEventListener('click', () => toggleACPlayer(btn.dataset.name));
  });
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
  var t = getCanvasTheme();
  ctx.font = "bold 14px 'Space Mono', monospace";
  ctx.fillStyle = t.ink;
  ctx.globalAlpha = 0.3;
  ctx.textAlign = "center";
  ctx.fillText("razzle.lol", W / 2, H - 10);
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
  if (pct == null) return "#c4b5a5";
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
  if (pct == null) return "#8a7565";
  return "#2d1f14";
}

async function loadHeatMap() {
  const canvas = document.getElementById("hmCanvas");
  const ctx = canvas.getContext("2d");
  var t = getCanvasTheme();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = t.bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.font = "22px 'Caveat', cursive";
  ctx.fillStyle = t.inkLight;
  ctx.textAlign = "center";
  ctx.fillText("pulling positional film...", canvas.width / 2, canvas.height / 2);

  try {
    const url = "/api/heatmap?position=" + _hmState.position + "&group=" + _hmState.group;
    const resp = await apiFetch(url);
    _hmState.data = resp;
    renderHeatMapChart();
  } catch (err) {
    var th = getCanvasTheme();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = th.bg;
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
  var t = getCanvasTheme();

  // Background
  ctx.fillStyle = t.bg;
  ctx.fillRect(0, 0, totalW, totalH);

  // Title
  ctx.font = "bold 22px 'Luckiest Guy', cursive";
  ctx.fillStyle = t.ink;
  ctx.textAlign = "left";
  ctx.fillText(_hmState.position + " Heat Map", padL, 30);

  // Subtitle
  ctx.font = "18px 'Caveat', cursive";
  ctx.fillStyle = t.inkLight;
  const groupLabel = _hmState.group.charAt(0).toUpperCase() + _hmState.group.slice(1);
  ctx.fillText(groupLabel + " — percentile ranks within position", padL + 280, 32);

  // Chart border
  const chartX = padL;
  const chartY = titleH;
  const chartW = nameColW + numStats * cellW;
  const chartH = headerH + numPlayers * cellH;
  ctx.strokeStyle = t.ink;
  ctx.lineWidth = 2;
  ctx.strokeRect(chartX, chartY, chartW, chartH);

  // Column headers (rotated stat labels)
  ctx.save();
  ctx.font = "bold 11px 'Space Mono', monospace";
  ctx.fillStyle = t.ink;
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
  ctx.strokeStyle = t.ink;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(chartX, titleH + headerH);
  ctx.lineTo(chartX + chartW, titleH + headerH);
  ctx.stroke();

  // Name column header
  ctx.font = "bold 11px 'Space Mono', monospace";
  ctx.fillStyle = t.inkMedium;
  ctx.textAlign = "left";
  ctx.fillText("PLAYER", padL + 8, titleH + headerH - 8);

  // Rows
  const posColor = _hmPosColors[_hmState.position] || "#d97757";
  for (let r = 0; r < numPlayers; r++) {
    const player = players[r];
    const rowY = titleH + headerH + r * cellH;

    // Alternating row bg
    if (r % 2 === 0) {
      ctx.fillStyle = t.isDark ? "rgba(237,224,207,0.03)" : "rgba(45,31,20,0.03)";
      ctx.fillRect(padL, rowY, chartW, cellH);
    }

    // Player name + team
    ctx.font = "bold 12px 'Space Mono', monospace";
    ctx.fillStyle = t.ink;
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
      ctx.strokeStyle = t.isDark ? "rgba(237,224,207,0.12)" : "rgba(45,31,20,0.12)";
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
        ctx.fillStyle = t.inkLight;
        ctx.textAlign = "center";
        ctx.fillText("—", cellX + cellW / 2, rowY + 18);
      }
    }

    // Row separator
    ctx.strokeStyle = t.isDark ? "rgba(237,224,207,0.08)" : "rgba(45,31,20,0.08)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padL, rowY + cellH);
    ctx.lineTo(padL + chartW, rowY + cellH);
    ctx.stroke();
  }

  // Name column separator
  ctx.strokeStyle = t.ink;
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
  var t = getCanvasTheme();

  // Watermark
  ctx.font = "bold 14px 'Space Mono', monospace";
  ctx.fillStyle = t.ink;
  ctx.globalAlpha = 0.3;
  ctx.textAlign = "center";
  ctx.fillText("razzle.lol", W / 2, H - 4);
  ctx.globalAlpha = 1.0;

  const link = document.createElement("a");
  link.download = "razzle-heatmap-" + _hmState.position.toLowerCase() + "-" + _hmState.group + ".png";
  link.href = canvas.toDataURL("image/png");
  link.click();
}

// ─── Watchlist panel ────────────────────────────────────────────

function openWatchlistPanel() {
  var overlay = document.getElementById("watchlistOverlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.id = "watchlistOverlay";
    overlay.className = "filter-modal-overlay";
    overlay.onclick = function(e) { if (e.target === overlay) overlay.classList.remove("open"); };
    document.body.appendChild(overlay);
  }
  renderWatchlistPanel();
  overlay.classList.add("open");
}

function closeWatchlistPanel(e) {
  if (e && e.target !== e.currentTarget) return;
  var overlay = document.getElementById("watchlistOverlay");
  if (overlay) overlay.classList.remove("open");
}

function renderWatchlistPanel() {
  var overlay = document.getElementById("watchlistOverlay");
  if (!overlay) return;
  var list = getWatchlist();
  var tierNames = ["Untiered", "Tier 1", "Tier 2", "Tier 3", "Tier 4", "Tier 5"];

  var html = '<div style="background:var(--bg-card); border:3px solid var(--ink); border-radius:12px; box-shadow:4px 4px 0 var(--ink); padding:24px; width:600px; max-width:95vw; max-height:85vh; overflow-y:auto;" onclick="event.stopPropagation()">';
  html += '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">';
  html += '<h3 style="font-family:var(--font-display); font-size:22px; margin:0;">Watchlist <span style="color:var(--orange);">(' + list.length + ')</span></h3>';
  html += '<div style="display:flex; gap:6px;">';
  if (list.length > 0) {
    html += '<button class="btn-primary" onclick="openTierBoard()">Tier Board</button>';
  }
  html += '<button class="btn-chunky" onclick="closeWatchlistPanel(event)">Close</button>';
  html += '</div></div>';

  if (list.length === 0) {
    html += '<p style="font-family:var(--font-hand); font-size:22px; color:var(--ink-light); text-align:center; padding:40px 0;">' + razzleEmpty() + '</p>';
    html += '<p style="font-family:var(--font-mono); font-size:12px; color:var(--ink-faint); text-align:center;">click the &#9734; star next to any player in the table</p>';
    html += '</div>';
    overlay.innerHTML = html;
    return;
  }

  // Group by position
  var groups = { QB: [], RB: [], WR: [], TE: [], OTHER: [] };
  list.forEach(function(p) {
    var g = groups[p.position] ? p.position : "OTHER";
    groups[g].push(p);
  });

  var posColors = { QB: "var(--pos-qb)", RB: "var(--pos-rb)", WR: "var(--pos-wr)", TE: "var(--pos-te)", OTHER: "var(--ink-light)" };

  ["QB", "RB", "WR", "TE", "OTHER"].forEach(function(pos) {
    if (groups[pos].length === 0) return;
    html += '<div style="margin-bottom:14px;">';
    html += '<div style="font-family:var(--font-mono); font-size:14px; color:' + posColors[pos] + '; margin-bottom:6px; border-bottom:2px dashed var(--ink-faint); padding-bottom:4px;">' + pos + ' (' + groups[pos].length + ')</div>';

    groups[pos].forEach(function(p) {
      html += '<div style="display:flex; align-items:center; gap:8px; padding:5px 8px; border-radius:6px; margin-bottom:3px; background:var(--bg);">';
      html += '<span class="pos-badge pos-' + p.position.toLowerCase() + '" style="font-size:10px; padding:1px 6px;">' + escapeHtml(p.position) + '</span>';
      html += '<span style="font-family:var(--font-mono); font-size:13px; flex:1;">' + escapeHtml(p.name) + '</span>';
      html += '<span style="font-family:var(--font-mono); font-size:11px; color:var(--ink-light);">' + escapeHtml(p.team) + '</span>';
      html += '<select class="select-chunky" style="font-size:11px; padding:2px 6px; width:90px;" onchange="setWatchlistTier(\'' + escapeJS(p.player_id) + '\', this.value); renderWatchlistPanel();">';
      for (var t = 0; t <= 5; t++) {
        html += '<option value="' + t + '"' + (p.tier === t ? ' selected' : '') + '>' + tierNames[t] + '</option>';
      }
      html += '</select>';
      html += '<button class="btn-chunky" style="font-size:10px; padding:2px 6px; color:var(--red);" onclick="removeFromWatchlist(\'' + escapeJS(p.player_id) + '\'); renderWatchlistPanel(); renderTable();" title="Remove">&#10005;</button>';
      html += '</div>';
    });
    html += '</div>';
  });

  html += '</div>';
  overlay.innerHTML = html;
}

// ─── Tier Board ─────────────────────────────────────────────────

var TIER_COLORS = ["var(--ink-faint)", "var(--green)", "var(--pos-qb)", "var(--orange)", "var(--purple)", "var(--red)"];
var TIER_LABELS = ["Untiered", "Tier 1", "Tier 2", "Tier 3", "Tier 4", "Tier 5"];

function openTierBoard() {
  // Close watchlist first
  var wl = document.getElementById("watchlistOverlay");
  if (wl) wl.classList.remove("open");

  var overlay = document.getElementById("tierBoardOverlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.id = "tierBoardOverlay";
    overlay.className = "filter-modal-overlay";
    overlay.onclick = function(e) { if (e.target === overlay) overlay.classList.remove("open"); };
    document.body.appendChild(overlay);
  }
  renderTierBoard();
  overlay.classList.add("open");
}

function closeTierBoard(e) {
  if (e && e.target !== e.currentTarget) return;
  var overlay = document.getElementById("tierBoardOverlay");
  if (overlay) overlay.classList.remove("open");
}

function renderTierBoard() {
  var overlay = document.getElementById("tierBoardOverlay");
  if (!overlay) return;
  var list = getWatchlist();
  var posColors = { QB: "var(--pos-qb)", RB: "var(--pos-rb)", WR: "var(--pos-wr)", TE: "var(--pos-te)" };

  var html = '<div style="background:var(--bg-card); border:3px solid var(--ink); border-radius:12px; box-shadow:4px 4px 0 var(--ink); padding:24px; width:800px; max-width:95vw; max-height:90vh; overflow-y:auto;" onclick="event.stopPropagation()">';
  html += '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">';
  html += '<h3 style="font-family:var(--font-display); font-size:22px; margin:0;">Tier Board</h3>';
  html += '<div style="display:flex; gap:6px;">';
  html += '<button class="btn-primary" onclick="exportTierBoardPNG()">Export PNG</button>';
  html += '<button class="btn-chunky" onclick="openWatchlistPanel(); closeTierBoard();">Back</button>';
  html += '<button class="btn-chunky" onclick="closeTierBoard(event)">Close</button>';
  html += '</div></div>';
  html += '<p style="font-family:var(--font-hand); font-size:18px; color:var(--ink-light); margin-bottom:16px;">drag-free tier assignment — use dropdowns to move players between tiers</p>';

  // Render tiers 1-5 then untiered (0)
  var tierOrder = [1, 2, 3, 4, 5, 0];
  tierOrder.forEach(function(tier) {
    var players = list.filter(function(p) { return p.tier === tier; });
    var color = TIER_COLORS[tier];
    var label = TIER_LABELS[tier];

    html += '<div style="margin-bottom:14px; border:2px solid var(--ink); border-radius:var(--radius-sm); overflow:hidden; background:var(--bg);">';
    // Tier header
    html += '<div style="display:flex; align-items:center; gap:10px; padding:8px 14px; background:var(--bg-warm); border-bottom:2px dashed var(--ink-faint);">';
    html += '<span style="display:inline-block; font-family:var(--font-mono); font-size:13px; color:var(--text-on-accent); background:' + color + '; border:2px solid var(--ink); border-radius:8px; padding:2px 12px; transform:rotate(-2deg); box-shadow:2px 2px 0 var(--ink);">' + label + '</span>';
    html += '<span style="font-family:var(--font-mono); font-size:11px; color:var(--ink-light);">' + players.length + ' player' + (players.length !== 1 ? 's' : '') + '</span>';
    html += '</div>';

    // Player cards flow
    html += '<div style="display:flex; flex-wrap:wrap; gap:6px; padding:10px 14px; min-height:36px;">';
    if (players.length === 0) {
      html += '<span style="font-family:var(--font-hand); font-size:16px; color:var(--ink-faint);">empty</span>';
    }
    players.forEach(function(p) {
      var pc = posColors[p.position] || "var(--ink-light)";
      html += '<div style="display:inline-flex; align-items:center; gap:5px; padding:4px 10px 4px 0; border:2px solid var(--ink); border-radius:8px; background:var(--bg-card); box-shadow:2px 2px 0 var(--ink); font-size:12px;">';
      html += '<div style="width:5px; align-self:stretch; background:' + pc + '; border-radius:6px 0 0 6px;"></div>';
      html += '<span class="pos-badge pos-' + p.position.toLowerCase() + '" style="font-size:9px; padding:1px 5px; margin-left:4px;">' + escapeHtml(p.position) + '</span>';
      html += '<span style="font-family:var(--font-mono); font-size:12px;">' + escapeHtml(p.name) + '</span>';
      html += '<span style="font-family:var(--font-mono); font-size:10px; color:var(--ink-light);">' + escapeHtml(p.team) + '</span>';
      html += '<select class="select-chunky" style="font-size:10px; padding:1px 4px; width:72px; border-width:2px;" onchange="setWatchlistTier(\'' + escapeJS(p.player_id) + '\', this.value); renderTierBoard();">';
      for (var t = 0; t <= 5; t++) {
        html += '<option value="' + t + '"' + (p.tier === t ? ' selected' : '') + '>' + TIER_LABELS[t] + '</option>';
      }
      html += '</select>';
      html += '</div>';
    });
    html += '</div></div>';
  });

  html += '</div>';
  overlay.innerHTML = html;
}

// ─── Tier Board PNG Export ───────────────────────────────────────

function exportTierBoardPNG() {
  var list = getWatchlist();
  var tierOrder = [1, 2, 3, 4, 5, 0];
  var tierColorHex = ["#c4b5a5", "#2ec4b6", "#5b7fff", "#d97757", "#8b5cf6", "#e63946"];
  var posColorHex = { QB: "#5b7fff", RB: "#2ec4b6", WR: "#d97757", TE: "#8b5cf6" };

  var W = 800;
  var TIER_H = 52;
  var CARD_H = 28;
  var CARD_GAP = 6;
  var CARD_PAD = 14;
  var TIER_PAD = 10;
  var HEADER_H = 60;
  var FOOTER_H = 40;

  // Calculate total height
  var totalH = HEADER_H;
  tierOrder.forEach(function(tier) {
    var players = list.filter(function(p) { return p.tier === tier; });
    var rows = Math.max(1, Math.ceil(players.length / 4));
    totalH += TIER_H + rows * (CARD_H + CARD_GAP) + TIER_PAD;
  });
  totalH += FOOTER_H;

  var canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = totalH;
  var ctx = canvas.getContext("2d");
  var t = getCanvasTheme();

  // Sand background
  ctx.fillStyle = t.bg;
  ctx.fillRect(0, 0, W, totalH);

  // Header
  ctx.fillStyle = t.ink;
  ctx.font = "bold 24px 'Luckiest Guy', cursive";
  ctx.fillText("Tier Board", 24, 38);
  ctx.fillStyle = t.inkLight;
  ctx.font = "18px 'Caveat', cursive";
  ctx.fillText("my watchlist rankings", 190, 38);

  var y = HEADER_H;

  tierOrder.forEach(function(tier) {
    var players = list.filter(function(p) { return p.tier === tier; });
    var rows = Math.max(1, Math.ceil(players.length / 4));
    var sectionH = TIER_H + rows * (CARD_H + CARD_GAP) + TIER_PAD;
    var color = tierColorHex[tier];

    // Section bg
    ctx.fillStyle = t.bgCard;
    ctx.strokeStyle = t.ink;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(16, y, W - 32, sectionH - 4, 8);
    ctx.fill();
    ctx.stroke();

    // Tier badge (rotated sticker)
    ctx.save();
    ctx.translate(40, y + 22);
    ctx.rotate(-0.04);
    ctx.fillStyle = color;
    ctx.strokeStyle = t.ink;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(-14, -12, 80, 24, 6);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = t.white;
    ctx.font = "bold 12px 'Space Mono', monospace";
    ctx.textAlign = "center";
    ctx.fillText(TIER_LABELS[tier], 26, 5);
    ctx.restore();
    ctx.textAlign = "left";

    // Player count
    ctx.fillStyle = t.inkLight;
    ctx.font = "11px 'Space Mono', monospace";
    ctx.fillText(players.length + " player" + (players.length !== 1 ? "s" : ""), 130, y + 26);

    // Player cards
    var cx = CARD_PAD + 16;
    var cy = y + TIER_H;
    var cardW = (W - 32 - CARD_PAD * 2 - CARD_GAP * 3) / 4;

    players.forEach(function(p, i) {
      var col = i % 4;
      var row = Math.floor(i / 4);
      var px = cx + col * (cardW + CARD_GAP);
      var py = cy + row * (CARD_H + CARD_GAP);
      var pc = posColorHex[p.position] || "#8a7565";

      // Card bg
      ctx.fillStyle = t.bgCard;
      ctx.strokeStyle = t.ink;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(px, py, cardW, CARD_H, 5);
      ctx.fill();
      ctx.stroke();

      // Position color stripe
      ctx.fillStyle = pc;
      ctx.beginPath();
      ctx.roundRect(px, py, 5, CARD_H, [5, 0, 0, 5]);
      ctx.fill();

      // Position badge
      ctx.fillStyle = pc;
      ctx.beginPath();
      ctx.roundRect(px + 10, py + 6, 24, 16, 4);
      ctx.fill();
      ctx.fillStyle = t.white;
      ctx.font = "bold 9px 'Space Mono', monospace";
      ctx.textAlign = "center";
      ctx.fillText(p.position, px + 22, py + 18);
      ctx.textAlign = "left";

      // Player name
      ctx.fillStyle = t.ink;
      ctx.font = "bold 11px 'Space Mono', monospace";
      var nameW = cardW - 64;
      var dispName = p.name;
      while (ctx.measureText(dispName).width > nameW && dispName.length > 3) {
        dispName = dispName.slice(0, -1);
      }
      if (dispName !== p.name) dispName += "..";
      ctx.fillText(dispName, px + 38, py + 18);

      // Team
      ctx.fillStyle = t.inkLight;
      ctx.font = "10px 'Space Mono', monospace";
      ctx.textAlign = "right";
      ctx.fillText(p.team, px + cardW - 6, py + 18);
      ctx.textAlign = "left";
    });

    y += sectionH;
  });

  // Watermark
  ctx.fillStyle = t.inkLight;
  ctx.font = "14px 'Caveat', cursive";
  ctx.textAlign = "right";
  ctx.fillText("razzle.lol", W - 20, totalH - 14);

  // Download
  var link = document.createElement("a");
  link.download = "razzle-tier-board.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
}

// ─── Keyboard shortcuts ────────────────────────────────────────

function isAnyOverlayOpen() {
  const overlays = document.querySelectorAll(".filter-modal-overlay.open");
  return overlays.length > 0;
}

function closeAllOverlays() {
  document.querySelectorAll(".filter-modal-overlay.open").forEach(el => el.classList.remove("open"));
}

function isInputFocused() {
  const el = document.activeElement;
  return el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.tagName === "SELECT" || el.isContentEditable);
}

document.addEventListener("keydown", function(e) {
  // Escape: close overlays or blur search
  if (e.key === "Escape") {
    var toolsDd = document.getElementById("toolsDropdown");
    if (toolsDd && toolsDd.classList.contains("open")) {
      closeToolsDropdown();
      e.preventDefault();
      return;
    }
    if (_tagPickerVisible) {
      hideTagPicker();
      e.preventDefault();
      return;
    }
    if (isAnyOverlayOpen()) {
      closeAllOverlays();
      e.preventDefault();
      return;
    }
    if (isInputFocused()) {
      document.activeElement.blur();
      e.preventDefault();
      return;
    }
    // Clear all row highlights
    var highlighted = document.querySelectorAll(".row-highlighted");
    if (highlighted.length) {
      highlighted.forEach(function(el) { el.classList.remove("row-highlighted"); });
      _showToast("highlights cleared");
      e.preventDefault();
      return;
    }
  }

  // Ctrl+Z / Ctrl+Y: undo/redo (works even when input focused, but not for native text undo)
  if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
    if (!isInputFocused()) { e.preventDefault(); undoState(); return; }
  }
  if ((e.ctrlKey || e.metaKey) && (e.key === "y" || ((e.key === "z" || e.key === "Z") && e.shiftKey))) {
    if (!isInputFocused()) { e.preventDefault(); redoState(); return; }
  }

  // Don't intercept when typing in inputs
  if (isInputFocused()) return;

  // / or Ctrl+K: focus search
  if (e.key === "/" || (e.key === "k" && (e.ctrlKey || e.metaKey))) {
    e.preventDefault();
    const search = document.getElementById("searchInput");
    if (search) search.focus();
    return;
  }

  // ? : toggle shortcut reference
  if (e.key === "?") {
    e.preventDefault();
    toggleShortcutRef();
    return;
  }

  // Position filters: 1=ALL, 2=QB, 3=RB, 4=WR, 5=TE
  const posMap = { "1": "ALL", "2": "QB", "3": "RB", "4": "WR", "5": "TE" };
  if (posMap.hasOwnProperty(e.key)) {
    togglePosition(posMap[e.key]);
    return;
  }

  // B: toggle data bars
  if (e.key === "b" || e.key === "B") {
    toggleDataBars();
    return;
  }

  // S: saved views
  if (e.key === "s" || e.key === "S") {
    openSavedViews();
    return;
  }

  // C: column picker
  if (e.key === "c" || e.key === "C") {
    openColumnPicker();
    return;
  }

  // F: formula builder
  if (e.key === "f" || e.key === "F") {
    if (typeof openFormulaBuilder === "function") openFormulaBuilder();
    return;
  }

  // M: formula store (marketplace)
  if (e.key === "m" || e.key === "M") {
    if (typeof openFormulaStore === "function") openFormulaStore();
    return;
  }

  // W: watchlist
  if (e.key === "w" || e.key === "W") {
    openWatchlistPanel();
    return;
  }

  // E: export CSV
  if (e.key === "e" || e.key === "E") {
    exportCSV();
    return;
  }

  // X: share/export
  if (e.key === "x" || e.key === "X") {
    openShareModal();
    return;
  }

  // H: heat colors toggle
  if (e.key === "h" || e.key === "H") {
    toggleHeatColors();
    return;
  }

  // T: toggle tier breaks
  if (e.key === "t" || e.key === "T") {
    toggleTierBreaks();
    return;
  }

  // D: toggle density mode
  if (e.key === "d" || e.key === "D") {
    toggleDensity();
    return;
  }

  // G: toggle column group headers
  if (e.key === "g" || e.key === "G") {
    toggleGroupHeaders();
    return;
  }

  // A: toggle stats summary bar
  if (e.key === "a" || e.key === "A") {
    toggleSummaryBar();
    return;
  }

  // N: toggle notes column
  if (e.key === "n" || e.key === "N") {
    toggleColumn("notes", !getActiveColumns().includes("notes"));
    renderTableHead(); renderTable(); renderColumnPicker(); saveStateToURL();
    return;
  }

  // R: toggle percentile display mode
  if (e.key === "r" || e.key === "R") {
    togglePercentileMode();
    return;
  }

  // L: toggle stat leader badges
  if (e.key === "l" || e.key === "L") {
    toggleLeaderBadges();
    return;
  }

  // P: clear all pinned players
  if (e.key === "p" || e.key === "P") {
    if (state.pinnedPlayers.length > 0) {
      clearAllPins();
    }
    return;
  }

  // I: toggle pin comparison diff mode
  if (e.key === "i" || e.key === "I") {
    toggleDiffMode();
    return;
  }

  // V: cycle visual modes (off → heat → percentile → bars → off)
  if (e.key === "v" || e.key === "V") {
    cycleVisualMode();
    return;
  }

  // ArrowLeft / ArrowRight: page navigation
  if (e.key === "ArrowLeft") {
    if (state.offset > 0) { prevPage(); _showToast("previous page"); }
    return;
  }
  if (e.key === "ArrowRight") {
    if (state.offset + state.limit < state.totalCount) { nextPage(); _showToast("next page"); }
    return;
  }

  // J/K: navigate table rows
  if (e.key === "j" || e.key === "J" || e.key === "k" || e.key === "K") {
    e.preventDefault();
    var tbody = document.getElementById("tableBody");
    if (!tbody) return;
    var rows = tbody.querySelectorAll("tr[data-player-id]");
    if (!rows.length) return;
    var cur = tbody.querySelector("tr.row-focused");
    var idx = -1;
    if (cur) { for (var i = 0; i < rows.length; i++) { if (rows[i] === cur) { idx = i; break; } } }
    if (e.key === "j" || e.key === "J") idx = Math.min(idx + 1, rows.length - 1);
    else idx = Math.max(idx - 1, 0);
    if (cur) cur.classList.remove("row-focused");
    rows[idx].classList.add("row-focused");
    rows[idx].scrollIntoView({ block: "nearest" });
    return;
  }

  // Enter: open focused player profile
  if (e.key === "Enter") {
    var focused = document.querySelector("#tableBody tr.row-focused");
    if (focused && focused.dataset.playerId && state.universe === "nfl") {
      e.preventDefault();
      openPlayerProfile(focused.dataset.playerId);
    }
    return;
  }
});

// Shortcut reference overlay
function toggleShortcutRef() {
  let overlay = document.getElementById("shortcutRefOverlay");
  if (overlay) {
    overlay.classList.toggle("open");
    return;
  }

  overlay = document.createElement("div");
  overlay.id = "shortcutRefOverlay";
  overlay.className = "filter-modal-overlay open";
  overlay.onclick = function(e) { if (e.target === overlay) overlay.classList.remove("open"); };
  overlay.innerHTML = `
    <div style="background:var(--bg-card); border:3px solid var(--ink); border-radius:12px; box-shadow:4px 4px 0 var(--ink); max-width:420px; width:90%; padding:24px; margin:auto; margin-top:120px;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
        <h3 style="font-family:var(--font-display); font-size:18px; margin:0;">Keyboard Shortcuts</h3>
        <button class="btn-chunky" onclick="document.getElementById('shortcutRefOverlay').classList.remove('open')" style="font-size:11px; padding:4px 10px;">Close</button>
      </div>
      <table style="width:100%; font-family:var(--font-mono); font-size:12px; border-collapse:collapse;">
        <tbody>
          ${shortcutRow("/", "Focus search")}
          ${shortcutRow("Esc", "Close overlay / blur input")}
          ${shortcutRow("1-5", "Position: ALL / QB / RB / WR / TE")}
          ${shortcutRow("S", "Saved views")}
          ${shortcutRow("C", "Column picker")}
          ${shortcutRow("F", "Formula builder")}
          ${shortcutRow("M", "Formula store")}
          ${shortcutRow("W", "Watchlist")}
          ${shortcutRow("E", "Export CSV")}
          ${shortcutRow("X", "Share / export")}
          ${shortcutRow("H", "Heat colors (percentiles)")}
          ${shortcutRow("R", "Percentile display mode")}
          ${shortcutRow("V", "Cycle visual mode (heat → pctl → bars → leaders)")}
          ${shortcutRow("L", "Stat leader badges (gold/silver/bronze)")}
          ${shortcutRow("B", "Inline data bars")}
          ${shortcutRow("T", "Tier break dividers")}
          ${shortcutRow("D", "Compact density mode")}
          ${shortcutRow("G", "Column group headers")}
          ${shortcutRow("A", "Stats summary bar")}
          ${shortcutRow("N", "Toggle notes column")}
          ${shortcutRow("P", "Clear pinned players")}
          ${shortcutRow("I", "Pin diff mode (compare vs 1st pin)")}
          ${shortcutRow("Shift+click", "Column header → secondary sort")}
          ${shortcutRow("Dbl-click", "Column header → quick filter")}
          ${shortcutRow("Dbl-click", "Stat cell → add filter from value")}
          ${shortcutRow("Right-click", "Column header → quick filter (Top 10/25/Avg)")}
          ${shortcutRow("← →", "Previous / next page")}
          ${shortcutRow("J / K", "Navigate rows down / up")}
          ${shortcutRow("Enter", "Open focused player profile")}
          ${shortcutRow("Ctrl+Z", "Undo last state change")}
          ${shortcutRow("Ctrl+Y", "Redo state change")}
          ${shortcutRow("?", "This reference")}
        </tbody>
      </table>
    </div>
  `;
  document.body.appendChild(overlay);
}

function shortcutRow(key, desc) {
  return `<tr style="border-bottom:1px solid var(--ink-faint);">
    <td style="padding:6px 8px; width:80px;"><kbd style="font-family:var(--font-mono); font-size:13px; background:var(--bg); border:2px solid var(--ink); border-radius:4px; padding:2px 8px; box-shadow:2px 2px 0 var(--ink);">${key}</kbd></td>
    <td style="padding:6px 8px;">${desc}</td>
  </tr>`;
}

// ─── Trade Analyzer ─────────────────────────────────────────────────

const _taState = { give: [], get: [], valueCache: {} };

function openTradeAnalyzer() {
  document.getElementById("tradeAnalyzerOverlay").classList.add("open");
  _taPopulatePickYears();
  // Focus give search
  setTimeout(() => document.getElementById("taSearchGive").focus(), 100);
  // Load pick value chart
  _taLoadPickChart();
}

function _taPopulatePickYears() {
  var baseYear = new Date().getFullYear();
  ["Give", "Get"].forEach(function(side) {
    var sel = document.getElementById("taPickYear" + side);
    if (!sel || sel.options.length > 0) return;
    for (var y = baseYear; y <= baseYear + 2; y++) {
      sel.add(new Option(y, y));
    }
  });
}

async function _taLoadPickChart() {
  if (_taPickCache) { _taDrawPickChart(); return; }
  const _draftYear = new Date().getFullYear();
  const picks = await _taFetchPickValues(_draftYear);
  _taPickCache = { _year: _draftYear };
  for (const p of picks) {
    _taPickCache[p.round + "_" + p.pick] = p;
  }
  _taDrawPickChart();
}

function closeTradeAnalyzer(e) {
  if (e && e.target !== e.currentTarget) return;
  var overlay = document.getElementById("tradeAnalyzerOverlay");
  if (overlay) overlay.classList.remove("open");
}

function _taSetupSearch(side) {
  const inputId = side === "give" ? "taSearchGive" : "taSearchGet";
  const autoId = side === "give" ? "taAutoGive" : "taAutoGet";
  const input = document.getElementById(inputId);
  const autoDiv = document.getElementById(autoId);
  let debounce = null;

  input.addEventListener("input", () => {
    clearTimeout(debounce);
    debounce = setTimeout(async () => {
      const q = input.value.trim();
      if (q.length < 2) { autoDiv.style.display = "none"; return; }
      try {
        const data = await apiFetch("/api/players?search=" + encodeURIComponent(q) + "&limit=8&relevant=true");
        const players = data.items || [];
        if (!players.length) { autoDiv.style.display = "none"; return; }
        const posColors = { QB: "#5b7fff", RB: "#2ec4b6", WR: "#d97757", TE: "#8b5cf6" };
        autoDiv.innerHTML = players.map(p => {
          const pc = posColors[p.position] || getCanvasTheme().ink;
          const pid = p.player_id || p.full_name;
          return '<div class="trade-autocomplete-item" data-pid="' + escapeAttr(pid) + '" data-side="' + side + '">'
            + '<span class="pos-badge" style="background:' + pc + ';">' + escapeHtml(p.position) + '</span>'
            + '<span style="font-family:var(--font-mono); font-size:12px;">' + escapeHtml(p.full_name) + '</span>'
            + '<span style="font-family:var(--font-mono); font-size:11px; color:var(--ink-light); margin-left:auto;">' + escapeHtml(p.team || "FA") + '</span>'
            + '</div>';
        }).join("");
        autoDiv.style.display = "";
      } catch (err) {
        console.error("Trade search failed:", err);
        autoDiv.style.display = "none";
      }
    }, 200);
  });

  autoDiv.addEventListener("mousedown", (e) => {
    const item = e.target.closest(".trade-autocomplete-item");
    if (!item) return;
    e.preventDefault();
    const pid = item.dataset.pid;
    _taAddPlayer(side, pid);
    input.value = "";
    autoDiv.style.display = "none";
  });

  input.addEventListener("blur", () => {
    setTimeout(() => { autoDiv.style.display = "none"; }, 200);
  });
}

async function _taAddPlayer(side, playerId) {
  const arr = _taState[side];
  if (arr.find(p => p.player_id === playerId)) return;

  // Fetch trade value from backend
  let playerData = _taState.valueCache[playerId];
  if (!playerData) {
    try {
      const resp = await apiFetch("/api/trade/values?player_ids=" + encodeURIComponent(playerId));
      const players = resp.players || [];
      if (players.length) {
        playerData = players[0];
        _taState.valueCache[playerId] = playerData;
      }
    } catch (err) {
      console.error("Trade value fetch failed:", err);
    }
  }
  if (!playerData) return;

  arr.push(playerData);
  _taRenderSide(side);
  _taUpdateVerdict();
}

function _taRemovePlayer(side, idx) {
  _taState[side].splice(idx, 1);
  _taRenderSide(side);
  _taUpdateVerdict();
}

function _taRenderSide(side) {
  const posColors = { QB: "#5b7fff", RB: "#2ec4b6", WR: "#d97757", TE: "#8b5cf6" };
  const arr = _taState[side];
  const listId = side === "give" ? "taListGive" : "taListGet";
  const totalId = side === "give" ? "taTotalGive" : "taTotalGet";
  const container = document.getElementById(listId);
  const total = arr.reduce((s, p) => s + (p.trade_value || 0), 0);
  document.getElementById(totalId).textContent = total;

  if (!arr.length) {
    const hint = side === "give" ? "add players or picks to trade away" : "add players or picks to acquire";
    container.innerHTML = '<div class="trade-empty-hint">' + hint + '</div>';
    return;
  }

  container.innerHTML = arr.map((p, i) => {
    if (p._type === "pick") {
      const rdColor = _PICK_ROUND_COLORS[p.round] || "#8a7565";
      return '<div class="trade-pick-card" style="border-left:4px solid ' + rdColor + ';">'
        + '<span class="pick-round-badge" style="background:' + rdColor + ';">RD' + p.round + '</span>'
        + '<span class="pick-label">' + escapeHtml(p.pick_label) + '</span>'
        + '<span class="pick-value">' + (p.trade_value || 0) + '</span>'
        + '<button class="remove-btn" onclick="_taRemovePlayer(\'' + side + '\', ' + i + ')" title="Remove">\u00d7</button>'
        + '</div>';
    }
    const pc = posColors[p.position] || getCanvasTheme().ink;
    return '<div class="trade-player-card" style="border-left:4px solid ' + pc + ';">'
      + '<span class="pos-badge" style="background:' + pc + ';">' + escapeHtml(p.position) + '</span>'
      + '<div class="player-info">'
      + '<div class="player-name">' + escapeHtml(p.full_name) + '</div>'
      + '<div class="player-meta">' + escapeHtml(p.team || "FA") + (p.age ? ' \u00b7 Age ' + Math.round(p.age) : '') + '</div>'
      + '</div>'
      + '<span class="player-value">' + (p.trade_value || 0) + '</span>'
      + '<button class="remove-btn" onclick="_taRemovePlayer(\'' + side + '\', ' + i + ')" title="Remove">\u00d7</button>'
      + '</div>';
  }).join("");
}

function _taUpdateVerdict() {
  const verdictArea = document.getElementById("taVerdictArea");
  const giveTotal = _taState.give.reduce((s, p) => s + (p.trade_value || 0), 0);
  const getTotal = _taState.get.reduce((s, p) => s + (p.trade_value || 0), 0);

  if (!_taState.give.length || !_taState.get.length) {
    verdictArea.style.display = "none";
    return;
  }

  verdictArea.style.display = "";
  const posColors = { QB: "#5b7fff", RB: "#2ec4b6", WR: "#d97757", TE: "#8b5cf6" };

  // Value bars
  const maxVal = Math.max(giveTotal, getTotal, 1);
  const givePct = Math.round((giveTotal / maxVal) * 100);
  const getPct = Math.round((getTotal / maxVal) * 100);

  // Build segmented bars from player/pick values
  function _barSegment(p) {
    const pc = p._type === "pick" ? (_PICK_ROUND_COLORS[p.round] || "#8a7565") : (posColors[p.position] || "#8a7565");
    const label = p._type === "pick" ? p.pick_label : p.full_name;
    const w = maxVal > 0 ? ((p.trade_value || 0) / maxVal * 100) : 0;
    return '<div style="width:' + w + '%; height:100%; background:' + pc + '; display:inline-block;" title="' + escapeAttr(label) + ': ' + p.trade_value + '"></div>';
  }
  let giveSegments = _taState.give.map(_barSegment).join("");
  let getSegments = _taState.get.map(_barSegment).join("");

  const barsHtml = '<div style="display:flex; flex-direction:column; gap:8px; margin-bottom:16px;">'
    + '<div style="display:flex; align-items:center; gap:8px;">'
    + '<span style="font-family:var(--font-mono); font-size:11px; text-transform:uppercase; min-width:50px;">Give</span>'
    + '<div style="flex:1; height:14px; background:var(--bg-warm); border:2px solid var(--ink); border-radius:6px; overflow:hidden; display:flex;">' + giveSegments + '</div>'
    + '<span style="font-family:var(--font-mono); font-size:13px; font-weight:bold; min-width:32px; text-align:right;">' + giveTotal + '</span>'
    + '</div>'
    + '<div style="display:flex; align-items:center; gap:8px;">'
    + '<span style="font-family:var(--font-mono); font-size:11px; text-transform:uppercase; min-width:50px;">Get</span>'
    + '<div style="flex:1; height:14px; background:var(--bg-warm); border:2px solid var(--ink); border-radius:6px; overflow:hidden; display:flex;">' + getSegments + '</div>'
    + '<span style="font-family:var(--font-mono); font-size:13px; font-weight:bold; min-width:32px; text-align:right;">' + getTotal + '</span>'
    + '</div>'
    + '</div>';

  document.getElementById("taValueBars").innerHTML = barsHtml;

  // Verdict
  const diff = getTotal - giveTotal;
  const avg = (giveTotal + getTotal) / 2;
  const pctDiff = avg > 0 ? Math.round(Math.abs(diff) / avg * 100) : 0;

  let verdict, verdictColor, verdictBg;
  if (pctDiff <= 10) {
    verdict = "FAIR";
    verdictColor = "#c5a000";
    verdictBg = "#f5eacc";
  } else if (diff > 0) {
    verdict = "WIN";
    verdictColor = "#2ec4b6";
    verdictBg = "#d9efec";
  } else {
    verdict = "LOSS";
    verdictColor = "#e63946";
    verdictBg = "#f2d5d8";
  }

  const pctLabel = pctDiff <= 10 ? "Even value" : (diff > 0 ? "+" + pctDiff + "% in your favor" : "-" + pctDiff + "% against you");

  document.getElementById("taVerdict").innerHTML = '<div style="display:inline-block; margin:8px 0;">'
    + '<span style="display:inline-block; font-family:var(--font-display); font-size:20px; color:' + verdictColor + '; background:' + verdictBg + '; padding:8px 24px; border:3px solid ' + verdictColor + '; border-radius:8px; box-shadow:4px 4px 0 var(--ink); transform:rotate(-2deg); letter-spacing:2px;">' + verdict + '</span>'
    + '</div>'
    + '<div style="font-family:var(--font-mono); font-size:13px; color:var(--ink-medium); margin-top:6px;">' + pctLabel + '</div>';

  // Commentary
  const quips = {
    WIN: [
      "take that and run before they notice",
      "robbery in broad daylight",
      "you fleeced them and they'll figure it out by week 4",
      "smash accept before they check the numbers",
      "the kind of deal that gets you banned from group chats"
    ],
    LOSS: [
      "you're giving up the ranch on this one",
      "their side of the deal is doing the heavy lifting",
      "might want to sleep on this one, chief",
      "the math is mathing and it's not in your favor",
      "this trade needs more seasoning on your end"
    ],
    FAIR: [
      "both sides can feel good about this one",
      "a trade where nobody gets flamed in the group chat",
      "clean deal, no drama",
      "the rare trade that actually makes sense for both sides",
      "perfectly balanced, as all things should be"
    ]
  };
  const pool = quips[verdict] || quips.FAIR;
  const quip = pool[Math.floor(Math.random() * pool.length)];
  document.getElementById("taCommentary").innerHTML = '<div style="font-family:var(--font-hand); font-size:20px; color:var(--ink-light); margin-top:10px; font-style:italic;">' + quip + '</div>';
}

// ─── Trade Analyzer PNG Export ───────────────────────────────────────

function exportTradeAnalyzerPNG() {
  if (!_taState.give.length || !_taState.get.length) return;

  const W = 1200, H = 630;
  const posColors = { QB: "#5b7fff", RB: "#2ec4b6", WR: "#d97757", TE: "#8b5cf6" };
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  var t = getCanvasTheme();

  // Background
  ctx.fillStyle = t.bgCard;
  ctx.fillRect(0, 0, W, H);

  // Border
  ctx.strokeStyle = t.ink;
  ctx.lineWidth = 4;
  ctx.strokeRect(4, 4, W - 8, H - 8);

  // Title
  ctx.font = "bold 28px 'Luckiest Guy', cursive";
  ctx.fillStyle = t.ink;
  ctx.textAlign = "center";
  ctx.fillText("Razzle Trade Analyzer", W / 2, 44);

  // Subtitle
  ctx.font = "20px 'Caveat', cursive";
  ctx.fillStyle = t.subtitleAlpha;
  ctx.fillText("check the math on that deal", W / 2, 68);

  const sideW = 460;
  const giveX = 40;
  const getX = W - 40 - sideW;
  const topY = 90;

  // Draw a side panel
  function drawSide(x, label, labelBg, labelBorder, players) {
    // Card background
    ctx.fillStyle = t.bg;
    ctx.strokeStyle = t.ink;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(x, topY, sideW, 380, 8);
    ctx.fill();
    ctx.stroke();
    // Shadow
    ctx.fillStyle = t.ink;
    ctx.fillRect(x + 4, topY + 4 + 380, sideW, 4);
    ctx.fillRect(x + sideW, topY + 4, 4, 380);

    // Label badge
    ctx.fillStyle = labelBg;
    ctx.strokeStyle = labelBorder;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(x + 16, topY + 12, 80, 28, 4);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = t.ink;
    ctx.font = "bold 13px 'Space Mono', monospace";
    ctx.textAlign = "center";
    ctx.fillText(label, x + 56, topY + 30);

    // Total
    const total = players.reduce((s, p) => s + (p.trade_value || 0), 0);
    ctx.font = "bold 18px 'Space Mono', monospace";
    ctx.fillStyle = t.ink;
    ctx.textAlign = "right";
    ctx.fillText(String(total), x + sideW - 16, topY + 32);

    // Player/Pick cards
    const cardY = topY + 52;
    const cardH = 44;
    for (let i = 0; i < Math.min(players.length, 7); i++) {
      const p = players[i];
      const isPick = p._type === "pick";
      const pc = isPick ? (_PICK_ROUND_COLORS[p.round] || "#8a7565") : (posColors[p.position] || "#8a7565");
      const cy = cardY + i * (cardH + 4);

      // Row bg
      if (i % 2 === 0) {
        ctx.fillStyle = "rgba(247,239,229,0.8)";
        ctx.fillRect(x + 12, cy, sideW - 24, cardH);
      }

      // Badge
      ctx.fillStyle = pc;
      ctx.beginPath();
      ctx.roundRect(x + 18, cy + 10, 36, 22, 3);
      ctx.fill();
      ctx.strokeStyle = t.ink;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.fillStyle = t.white;
      ctx.font = "bold 10px 'Space Mono', monospace";
      ctx.textAlign = "center";
      ctx.fillText(isPick ? ("RD" + p.round) : p.position, x + 36, cy + 25);

      // Name
      ctx.textAlign = "left";
      ctx.fillStyle = t.ink;
      ctx.font = "bold 14px 'Space Mono', monospace";
      ctx.fillText(isPick ? (p.pick_label || "") : (p.full_name || ""), x + 62, cy + 22);

      // Sub-text
      ctx.fillStyle = t.inkLight;
      ctx.font = "11px 'Space Mono', monospace";
      if (isPick) {
        ctx.fillText("Pick " + p.pick + " of 12", x + 62, cy + 37);
      } else {
        ctx.fillText((p.team || "FA") + (p.age ? " \u00b7 " + p.age : ""), x + 62, cy + 37);
      }

      // Value
      ctx.fillStyle = pc;
      ctx.font = "bold 18px 'Space Mono', monospace";
      ctx.textAlign = "right";
      ctx.fillText(String(p.trade_value || 0), x + sideW - 20, cy + 28);
    }
    if (players.length > 7) {
      ctx.font = "14px 'Caveat', cursive";
      ctx.fillStyle = t.inkLight;
      ctx.textAlign = "center";
      ctx.fillText("+" + (players.length - 7) + " more", x + sideW / 2, cardY + 7 * (cardH + 4) + 16);
    }
  }

  drawSide(giveX, "I GIVE", "#f2d5d8", "#e63946", _taState.give);
  drawSide(getX, "I GET", "#d9efec", "#2ec4b6", _taState.get);

  // VS divider
  ctx.save();
  ctx.fillStyle = t.ink;
  ctx.font = "bold 22px 'Luckiest Guy', cursive";
  ctx.textAlign = "center";
  ctx.fillText("VS", W / 2, topY + 200);
  ctx.restore();

  // Value bars at bottom
  const barY = 490;
  const giveTotal = _taState.give.reduce((s, p) => s + (p.trade_value || 0), 0);
  const getTotal = _taState.get.reduce((s, p) => s + (p.trade_value || 0), 0);
  const maxVal = Math.max(giveTotal, getTotal, 1);

  // Give bar
  ctx.fillStyle = t.bg;
  ctx.strokeStyle = t.ink;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(giveX, barY, sideW, 18, 4);
  ctx.fill();
  ctx.stroke();
  function _pngBarColor(p) {
    return p._type === "pick" ? (_PICK_ROUND_COLORS[p.round] || "#8a7565") : (posColors[p.position] || "#8a7565");
  }
  let bx = giveX;
  for (const p of _taState.give) {
    const w = ((p.trade_value || 0) / maxVal) * sideW;
    ctx.fillStyle = _pngBarColor(p);
    ctx.fillRect(bx, barY, w, 18);
    bx += w;
  }

  // Get bar
  ctx.fillStyle = t.bg;
  ctx.beginPath();
  ctx.roundRect(getX, barY, sideW, 18, 4);
  ctx.fill();
  ctx.stroke();
  bx = getX;
  for (const p of _taState.get) {
    const w = ((p.trade_value || 0) / maxVal) * sideW;
    ctx.fillStyle = _pngBarColor(p);
    ctx.fillRect(bx, barY, w, 18);
    bx += w;
  }

  // Bar labels
  ctx.font = "bold 13px 'Space Mono', monospace";
  ctx.fillStyle = t.ink;
  ctx.textAlign = "right";
  ctx.fillText(String(giveTotal), giveX + sideW, barY - 6);
  ctx.fillText(String(getTotal), getX + sideW, barY - 6);
  ctx.font = "bold 11px 'Space Mono', monospace";
  ctx.textAlign = "left";
  ctx.fillText("GIVE", giveX, barY - 6);
  ctx.fillText("GET", getX, barY - 6);

  // Verdict badge
  const diff = getTotal - giveTotal;
  const avg = (giveTotal + getTotal) / 2;
  const pctDiff = avg > 0 ? Math.round(Math.abs(diff) / avg * 100) : 0;
  let verdict, verdictColor, verdictBg;
  if (pctDiff <= 10) {
    verdict = "FAIR";
    verdictColor = "#c5a000";
    verdictBg = "#f5eacc";
  } else if (diff > 0) {
    verdict = "WIN";
    verdictColor = "#2ec4b6";
    verdictBg = "#d9efec";
  } else {
    verdict = "LOSS";
    verdictColor = "#e63946";
    verdictBg = "#f2d5d8";
  }

  ctx.save();
  ctx.translate(W / 2, barY + 8);
  ctx.rotate(-0.04);
  const bw = 80, bh = 32;
  ctx.fillStyle = verdictBg;
  ctx.strokeStyle = verdictColor;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(-bw / 2, -bh / 2, bw, bh, 6);
  ctx.fill();
  ctx.stroke();
  // Shadow
  ctx.fillStyle = t.ink;
  ctx.globalAlpha = 0.3;
  ctx.fillRect(-bw / 2 + 3, -bh / 2 + 3 + bh, bw, 3);
  ctx.globalAlpha = 1.0;
  ctx.fillStyle = verdictColor;
  ctx.font = "bold 18px 'Luckiest Guy', cursive";
  ctx.textAlign = "center";
  ctx.fillText(verdict, 0, 7);
  ctx.restore();

  // Pct label
  const pctLabel = pctDiff <= 10 ? "Even value" : (diff > 0 ? "+" + pctDiff + "% in your favor" : "-" + pctDiff + "% against you");
  ctx.font = "13px 'Space Mono', monospace";
  ctx.fillStyle = t.inkMedium;
  ctx.textAlign = "center";
  ctx.fillText(pctLabel, W / 2, 540);

  // Commentary
  const quips = {
    WIN: ["take that and run before they notice", "robbery in broad daylight", "smash accept before they check the numbers"],
    LOSS: ["you're giving up the ranch on this one", "might want to sleep on this one, chief", "the math is not in your favor"],
    FAIR: ["both sides can feel good about this one", "clean deal, no drama", "perfectly balanced, as all things should be"]
  };
  const pool = quips[verdict] || quips.FAIR;
  const quip = pool[Math.floor(Math.random() * pool.length)];
  ctx.font = "20px 'Caveat', cursive";
  ctx.fillStyle = t.subtitleAlpha;
  ctx.textAlign = "center";
  ctx.fillText(quip, W / 2, 565);

  // Watermark
  ctx.font = "bold 14px 'Space Mono', monospace";
  ctx.fillStyle = t.ink;
  ctx.globalAlpha = 0.3;
  ctx.textAlign = "right";
  ctx.fillText("razzle.lol", W - 20, H - 16);
  ctx.globalAlpha = 1.0;

  const link = document.createElement("a");
  link.download = "razzle-trade-" + Date.now() + ".png";
  link.href = canvas.toDataURL("image/png");
  link.click();
}

// ─── Draft Pick Support ──────────────────────────────────────────────

const _PICK_ROUND_COLORS = { 1: "#d97757", 2: "#5b7fff", 3: "#2ec4b6", 4: "#8b5cf6" };
let _taPickCache = null; // cached pick values from API

async function _taFetchPickValues(year) {
  try {
    const resp = await apiFetch("/api/trade/pick-values?year=" + year);
    return resp.picks || [];
  } catch (err) {
    console.error("Pick values fetch failed:", err);
    return [];
  }
}

async function _taAddPick(side) {
  const yearSel = document.getElementById("taPickYear" + side.charAt(0).toUpperCase() + side.slice(1));
  const rdSel = document.getElementById("taPickRd" + side.charAt(0).toUpperCase() + side.slice(1));
  const numSel = document.getElementById("taPickNum" + side.charAt(0).toUpperCase() + side.slice(1));
  const year = parseInt(yearSel.value) || new Date().getFullYear();
  const rd = parseInt(rdSel.value) || 1;
  const pk = parseInt(numSel.value) || 1;
  const pickId = year + "_" + rd + "_" + pk;

  const arr = _taState[side];
  if (arr.find(p => p._pickId === pickId)) return;

  // Fetch pick values if not cached for this year
  if (!_taPickCache || _taPickCache._year !== year) {
    const picks = await _taFetchPickValues(year);
    _taPickCache = { _year: year };
    for (const p of picks) {
      _taPickCache[p.round + "_" + p.pick] = p;
    }
  }

  const pickData = _taPickCache[rd + "_" + pk];
  if (!pickData) return;

  arr.push({
    _type: "pick",
    _pickId: pickId,
    pick_label: pickData.pick_label,
    round: rd,
    pick: pk,
    overall: pickData.overall,
    trade_value: pickData.trade_value,
  });
  _taRenderSide(side);
  _taUpdateVerdict();
  _taDrawPickChart();
}

function _taDrawPickChart() {
  const canvas = document.getElementById("taPickChartCanvas");
  if (!canvas || !_taPickCache) return;
  const ctx = canvas.getContext("2d");
  const W = canvas.width, H = canvas.height;

  var t = getCanvasTheme();
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = t.bg;
  ctx.fillRect(0, 0, W, H);

  // Collect all picks (48 picks for 4 rounds x 12 teams)
  const allPicks = [];
  for (let rd = 1; rd <= 4; rd++) {
    for (let pk = 1; pk <= 12; pk++) {
      const key = rd + "_" + pk;
      if (_taPickCache[key]) allPicks.push(_taPickCache[key]);
    }
  }
  if (allPicks.length < 2) return;

  const pad = { top: 24, bottom: 30, left: 44, right: 16 };
  const plotW = W - pad.left - pad.right;
  const plotH = H - pad.top - pad.bottom;
  const maxVal = allPicks[0].trade_value || 1;

  // Grid lines
  ctx.strokeStyle = t.isDark ? "rgba(237,224,207,0.1)" : "rgba(45,31,20,0.1)";
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = pad.top + (plotH * i / 4);
    ctx.beginPath();
    ctx.moveTo(pad.left, y);
    ctx.lineTo(W - pad.right, y);
    ctx.stroke();
    ctx.fillStyle = t.inkLight;
    ctx.font = "10px 'Space Mono', monospace";
    ctx.textAlign = "right";
    ctx.fillText(Math.round(maxVal * (1 - i / 4)), pad.left - 6, y + 4);
  }

  // Draw curve
  ctx.beginPath();
  ctx.strokeStyle = t.ink;
  ctx.lineWidth = 2;
  const selectedPicks = [];
  for (const side of ["give", "get"]) {
    for (const item of _taState[side]) {
      if (item._type === "pick") selectedPicks.push(item);
    }
  }

  for (let i = 0; i < allPicks.length; i++) {
    const pk = allPicks[i];
    const x = pad.left + (i / (allPicks.length - 1)) * plotW;
    const y = pad.top + plotH * (1 - pk.trade_value / maxVal);
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.stroke();

  // Dots for each pick
  for (let i = 0; i < allPicks.length; i++) {
    const pk = allPicks[i];
    const x = pad.left + (i / (allPicks.length - 1)) * plotW;
    const y = pad.top + plotH * (1 - pk.trade_value / maxVal);
    const rdColor = _PICK_ROUND_COLORS[pk.round] || "#8a7565";
    const isSelected = selectedPicks.some(s => s.overall === pk.overall);

    ctx.fillStyle = rdColor;
    ctx.beginPath();
    ctx.arc(x, y, isSelected ? 6 : 3, 0, Math.PI * 2);
    ctx.fill();
    if (isSelected) {
      ctx.strokeStyle = t.ink;
      ctx.lineWidth = 2;
      ctx.stroke();
      // Label
      ctx.fillStyle = t.ink;
      ctx.font = "bold 10px 'Space Mono', monospace";
      ctx.textAlign = "center";
      ctx.fillText((pk.pick_label || "").split(" ")[1] || "", x, y - 10);
    }
  }

  // Round labels at bottom
  ctx.font = "bold 10px 'Space Mono', monospace";
  ctx.textAlign = "center";
  for (let rd = 1; rd <= 4; rd++) {
    const startIdx = (rd - 1) * 12;
    const midIdx = startIdx + 5.5;
    const x = pad.left + (midIdx / (allPicks.length - 1)) * plotW;
    ctx.fillStyle = _PICK_ROUND_COLORS[rd];
    ctx.fillText("RD " + rd, x, H - 8);
  }

  // Title
  ctx.font = "bold 11px 'Space Mono', monospace";
  ctx.fillStyle = t.ink;
  ctx.textAlign = "left";
  ctx.fillText("PICK VALUE CURVE", pad.left, 14);
}

// Initialize trade analyzer search inputs
(function initTradeAnalyzer() {
  // Dynamically populate pick year selects (current year + 2)
  var baseYear = new Date().getFullYear();
  ["Give", "Get"].forEach(function(side) {
    var sel = document.getElementById("taPickYear" + side);
    if (sel) {
      sel.innerHTML = "";
      for (var y = baseYear; y <= baseYear + 2; y++) {
        var opt = document.createElement("option");
        opt.value = y;
        opt.textContent = y;
        sel.appendChild(opt);
      }
    }
  });
  _taSetupSearch("give");
  _taSetupSearch("get");
})();

// ─── My Roster — Dynasty Roster Value Calculator ──────────────────────

var _rosterCache = null;
function getMyRoster() {
  if (_rosterCache !== null) return _rosterCache;
  try { _rosterCache = JSON.parse(localStorage.getItem("razzle_my_roster")) || []; }
  catch { _rosterCache = []; }
  return _rosterCache;
}
function saveMyRoster(list) {
  _rosterCache = list;
  try { localStorage.setItem("razzle_my_roster", JSON.stringify(list)); } catch(e) {}
}
function addToRoster(playerId, name, position, team) {
  var list = getMyRoster();
  if (list.find(function(p) { return p.player_id === playerId; })) return;
  list.push({ player_id: playerId, name: name, position: position, team: team });
  saveMyRoster(list);
}
function removeFromRoster(playerId) {
  var list = getMyRoster().filter(function(p) { return p.player_id !== playerId; });
  saveMyRoster(list);
}

var _rosterReport = null; // cached API response

function openMyRoster() {
  var overlay = document.getElementById("rosterOverlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.id = "rosterOverlay";
    overlay.className = "filter-modal-overlay";
    overlay.onclick = function(e) { if (e.target === overlay) overlay.classList.remove("open"); };
    document.body.appendChild(overlay);
  }
  _rosterReport = null;
  renderMyRosterPanel();
  overlay.classList.add("open");
}

function closeMyRoster(e) {
  if (e && e.target !== e.currentTarget) return;
  var overlay = document.getElementById("rosterOverlay");
  if (overlay) overlay.classList.remove("open");
}

var _rosterSearchTimer = null;
function rosterSearchInput(val) {
  clearTimeout(_rosterSearchTimer);
  _rosterSearchTimer = setTimeout(function() { rosterSearchPlayers(val); }, 250);
}

async function rosterSearchPlayers(query) {
  var results = document.getElementById("rosterSearchResults");
  if (!results) return;
  if (!query || query.length < 2) { results.innerHTML = ""; return; }
  try {
    var data = await apiFetch("/api/players?search=" + encodeURIComponent(query) + "&limit=8");
    var players = data.items || [];
    var roster = getMyRoster();
    var html = "";
    players.forEach(function(p) {
      var pid = p.player_id || p.gsis_id || "";
      var inRoster = roster.find(function(r) { return r.player_id === pid; });
      if (inRoster) return;
      var pos = p.position || "??";
      html += '<div class="roster-search-row" style="display:flex; align-items:center; gap:6px; padding:4px 8px; cursor:pointer; border-radius:4px; margin-bottom:2px; background:var(--bg);" data-pid="' + escapeAttr(pid) + '" data-name="' + escapeAttr(p.full_name || p.name || "") + '" data-pos="' + escapeAttr(pos) + '" data-team="' + escapeAttr(p.team || "FA") + '" data-query="' + escapeAttr(query) + '">';
      html += '<span class="pos-badge pos-' + pos.toLowerCase() + '" style="font-size:9px; padding:1px 5px;">' + escapeHtml(pos) + '</span>';
      html += '<span style="font-family:var(--font-mono); font-size:12px;">' + escapeHtml(p.full_name || p.name || "") + '</span>';
      html += '<span style="font-family:var(--font-mono); font-size:10px; color:var(--ink-light);">' + escapeHtml(p.team || "FA") + '</span>';
      html += '<span style="font-family:var(--font-hand); font-size:12px; color:var(--green); margin-left:auto;">+ add</span>';
      html += '</div>';
    });
    if (players.length === 0) html = '<div style="font-family:var(--font-hand); font-size:14px; color:var(--ink-faint); padding:8px;">' + razzleEmpty() + '</div>';
    results.innerHTML = html;
    results.querySelectorAll(".roster-search-row").forEach(function(row) {
      row.addEventListener("click", function() {
        addToRoster(row.dataset.pid, row.dataset.name, row.dataset.pos, row.dataset.team);
        rosterSearchPlayers(row.dataset.query);
        renderMyRosterPanel();
      });
    });
  } catch (err) {
    results.innerHTML = '<div style="color:var(--red); font-size:12px;">' + razzleError() + '</div>';
  }
}

async function calculateRosterValue() {
  var list = getMyRoster();
  if (list.length === 0) return;
  var ids = list.map(function(p) { return p.player_id; });
  var reportArea = document.getElementById("rosterReportArea");
  if (reportArea) reportArea.innerHTML = '<div style="text-align:center; padding:30px; font-family:var(--font-hand); font-size:20px; color:var(--orange);">' + razzleLoading() + '</div>';
  try {
    var data = await apiFetch("/api/roster-value", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ player_ids: ids })
    });
    _rosterReport = data;
    renderRosterReport();
  } catch (err) {
    if (reportArea) reportArea.innerHTML = '<div style="color:var(--red); padding:20px; text-align:center;">fumbled the roster math... try reloading.</div>';
  }
}

function renderMyRosterPanel() {
  var overlay = document.getElementById("rosterOverlay");
  if (!overlay) return;
  var list = getMyRoster();
  var posColors = { QB: "var(--pos-qb)", RB: "var(--pos-rb)", WR: "var(--pos-wr)", TE: "var(--pos-te)" };

  var html = '<div style="background:var(--bg-card); border:3px solid var(--ink); border-radius:12px; box-shadow:4px 4px 0 var(--ink); padding:24px; width:700px; max-width:95vw; max-height:90vh; overflow-y:auto;" onclick="event.stopPropagation()">';
  // Header
  html += '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">';
  html += '<h3 style="font-family:var(--font-display); font-size:22px; margin:0;">My Roster <span style="color:var(--green);">(' + list.length + ')</span></h3>';
  html += '<div style="display:flex; gap:6px;">';
  if (list.length > 0) {
    html += '<button class="btn-primary" onclick="calculateRosterValue()">Calculate Value</button>';
  }
  html += '<button class="btn-chunky" onclick="closeMyRoster(event)">Close</button>';
  html += '</div></div>';

  // Search
  html += '<div style="margin-bottom:14px;">';
  html += '<input type="text" placeholder="search players to add..." style="width:100%; padding:8px 12px; border:2px solid var(--ink); border-radius:8px; font-family:var(--font-mono); font-size:13px; background:var(--bg); box-sizing:border-box;" oninput="rosterSearchInput(this.value)" />';
  html += '<div id="rosterSearchResults" style="max-height:200px; overflow-y:auto; margin-top:4px;"></div>';
  html += '</div>';

  if (list.length === 0) {
    html += '<p style="font-family:var(--font-hand); font-size:20px; color:var(--ink-light); text-align:center; padding:30px 0;">add players to see your dynasty roster value</p>';
    html += '</div>';
    overlay.innerHTML = html;
    return;
  }

  // Roster list grouped by position
  var groups = { QB: [], RB: [], WR: [], TE: [], OTHER: [] };
  list.forEach(function(p) {
    var g = groups[p.position] ? p.position : "OTHER";
    groups[g].push(p);
  });

  ["QB", "RB", "WR", "TE", "OTHER"].forEach(function(pos) {
    if (groups[pos].length === 0) return;
    var pc = posColors[pos] || "var(--ink-light)";
    html += '<div style="margin-bottom:10px;">';
    html += '<div style="font-family:var(--font-mono); font-size:13px; color:' + pc + '; margin-bottom:4px; border-bottom:2px dashed var(--ink-faint); padding-bottom:3px;">' + pos + ' (' + groups[pos].length + ')</div>';
    groups[pos].forEach(function(p) {
      html += '<div style="display:flex; align-items:center; gap:6px; padding:4px 8px; border-radius:6px; margin-bottom:2px; background:var(--bg);">';
      html += '<span class="pos-badge pos-' + p.position.toLowerCase() + '" style="font-size:9px; padding:1px 5px;">' + escapeHtml(p.position) + '</span>';
      html += '<span style="font-family:var(--font-mono); font-size:12px; flex:1;">' + escapeHtml(p.name) + '</span>';
      html += '<span style="font-family:var(--font-mono); font-size:10px; color:var(--ink-light);">' + escapeHtml(p.team) + '</span>';
      html += '<button class="btn-chunky" style="font-size:10px; padding:2px 6px; color:var(--red);" onclick="removeFromRoster(\'' + escapeJS(p.player_id) + '\'); renderMyRosterPanel();" title="Remove">&#10005;</button>';
      html += '</div>';
    });
    html += '</div>';
  });

  // Report area
  html += '<div id="rosterReportArea"></div>';

  // If we have a cached report, render it
  html += '</div>';
  overlay.innerHTML = html;

  if (_rosterReport) {
    renderRosterReport();
  }
}

// ─── Roster Report Rendering ──────────────────────────────────────────

var _GRADE_COLORS = {
  "A+": "#2ec4b6", "A": "#2ec4b6", "A-": "#2ec4b6",
  "B+": "#5b7fff", "B": "#5b7fff", "B-": "#5b7fff",
  "C+": "#d97757", "C": "#d97757", "C-": "#d97757",
  "D+": "#e63946", "D": "#e63946", "D-": "#e63946",
  "F": "#e63946"
};
var _STATUS_COLORS = { "competing": "#2ec4b6", "retooling": "#d97757", "rebuilding": "#e63946" };
var _POS_HEX = { QB: "#5b7fff", RB: "#2ec4b6", WR: "#d97757", TE: "#8b5cf6" };

function renderRosterReport() {
  var area = document.getElementById("rosterReportArea");
  if (!area || !_rosterReport) return;

  var r = _rosterReport;
  var gc = _GRADE_COLORS[r.grade] || "#d97757";
  var sc = _STATUS_COLORS[r.competing_status] || "#d97757";

  var html = '<div style="margin-top:16px; border-top:3px solid var(--ink); padding-top:16px;">';

  // Summary row: grade + total value + status
  html += '<div style="display:flex; align-items:center; gap:16px; margin-bottom:16px; flex-wrap:wrap;">';
  // Grade badge with explainer
  html += '<div style="text-align:center;">';
  html += '<div title="Overall roster strength based on total trade value" style="background:' + gc + '; color:var(--text-on-accent); font-family:var(--font-display); font-size:32px; padding:8px 16px; border:3px solid var(--ink); border-radius:12px; box-shadow:4px 4px 0 var(--ink); transform:rotate(-3deg); min-width:60px; text-align:center; cursor:help;">' + escapeHtml(r.grade) + '</div>';
  html += '<div style="font-family:var(--font-mono); font-size:9px; color:var(--ink-light); text-transform:uppercase; margin-top:4px;">Roster Grade</div>';
  html += '</div>';
  // Stats
  html += '<div style="flex:1;">';
  html += '<div style="font-family:var(--font-display); font-size:24px;">' + escapeHtml(String(r.total_value)) + ' <span style="font-family:var(--font-mono); font-size:14px; color:var(--ink-light);">total value</span></div>';
  html += '<div style="font-family:var(--font-mono); font-size:13px; color:var(--ink-light);">avg age: ' + escapeHtml(String(r.average_age)) + '</div>';
  html += '</div>';
  // Status badge with explainer
  html += '<div style="text-align:center;">';
  html += '<div title="Based on total value + average age: high value + young = competing, low value or old = rebuilding" style="background:' + sc + '; color:var(--text-on-accent); font-family:var(--font-mono); font-size:14px; padding:6px 14px; border:2px solid var(--ink); border-radius:8px; box-shadow:4px 4px 0 var(--ink); transform:rotate(2deg); text-transform:uppercase; cursor:help;">' + escapeHtml(r.competing_status) + '</div>';
  html += '<div style="font-family:var(--font-mono); font-size:9px; color:var(--ink-light); text-transform:uppercase; margin-top:4px;">Window</div>';
  html += '</div>';
  html += '</div>';

  // Charts row
  html += '<div style="display:flex; gap:16px; flex-wrap:wrap; margin-bottom:16px;">';
  // Pie chart
  html += '<div style="flex:1; min-width:220px;">';
  html += '<div style="font-family:var(--font-mono); font-size:13px; margin-bottom:6px;">Positional Breakdown</div>';
  html += '<canvas id="rosterPieChart" width="240" height="200" role="img" aria-label="Roster positional breakdown pie chart" style="border:3px solid var(--ink); border-radius:var(--radius-sm); background:var(--bg); box-shadow:4px 4px 0 var(--ink);"></canvas>';
  html += '</div>';
  // Age scatter
  html += '<div style="flex:1; min-width:220px;">';
  html += '<div style="font-family:var(--font-mono); font-size:13px; margin-bottom:6px;">Age vs Value</div>';
  html += '<canvas id="rosterAgeChart" width="280" height="200" role="img" aria-label="Roster age versus value scatter plot" style="border:3px solid var(--ink); border-radius:var(--radius-sm); background:var(--bg); box-shadow:4px 4px 0 var(--ink);"></canvas>';
  html += '</div>';
  html += '</div>';

  // Player values table
  html += '<div style="font-family:var(--font-mono); font-size:13px; margin-bottom:6px;">Player Values</div>';
  html += '<div style="max-height:200px; overflow-y:auto; border:2px solid var(--ink); border-radius:8px;">';
  var sortedPlayers = (r.players || []).slice().sort(function(a, b) { return b.trade_value - a.trade_value; });
  sortedPlayers.forEach(function(p, i) {
    var bg = i % 2 === 0 ? "var(--bg)" : "var(--bg-card)";
    html += '<div style="display:flex; align-items:center; gap:6px; padding:4px 8px; background:' + bg + '; font-size:12px;">';
    html += '<span style="font-family:var(--font-mono); color:var(--ink-faint); width:20px;">' + (i + 1) + '</span>';
    html += '<span class="pos-badge pos-' + (p.position || "wr").toLowerCase() + '" style="font-size:9px; padding:1px 5px;">' + escapeHtml(p.position) + '</span>';
    html += '<span style="font-family:var(--font-display); flex:1;">' + escapeHtml(p.full_name) + '</span>';
    html += '<span style="font-family:var(--font-mono); font-size:11px; color:var(--ink-light);">' + escapeHtml(p.team) + '</span>';
    // Value bar
    var pct = Math.min(100, p.trade_value);
    var pc = _POS_HEX[p.position] || "#d97757";
    html += '<div style="width:80px; height:14px; background:var(--ink-faint); border-radius:4px; overflow:hidden; border:2px solid var(--ink);">';
    html += '<div style="width:' + pct + '%; height:100%; background:' + pc + ';"></div>';
    html += '</div>';
    html += '<span style="font-family:var(--font-mono); font-size:12px; font-weight:bold; width:32px; text-align:right;">' + p.trade_value + '</span>';
    html += '</div>';
  });
  html += '</div>';

  // Export button
  html += '<div style="text-align:center; margin-top:16px;">';
  html += '<button class="btn-primary" onclick="exportRosterTeamCard()" style="font-size:14px; padding:10px 24px;">Export Team Card</button>';
  html += '</div>';

  html += '</div>';
  area.innerHTML = html;

  // Draw charts
  setTimeout(function() {
    drawRosterPieChart();
    drawRosterAgeChart();
  }, 50);
}

// ─── Pie Chart ────────────────────────────────────────────────────────

function drawRosterPieChart() {
  var canvas = document.getElementById("rosterPieChart");
  if (!canvas || !_rosterReport) return;
  var ctx = canvas.getContext("2d");
  var W = canvas.width, H = canvas.height;
  var t = getCanvasTheme();
  ctx.clearRect(0, 0, W, H);

  var totals = _rosterReport.positional_totals || {};
  var total = _rosterReport.total_value || 1;
  var posOrder = ["QB", "RB", "WR", "TE"];
  var slices = [];
  posOrder.forEach(function(pos) {
    if (totals[pos]) slices.push({ pos: pos, val: totals[pos], pct: totals[pos] / total });
  });
  // Add "Other" for non-standard positions
  var otherVal = total - slices.reduce(function(s, sl) { return s + sl.val; }, 0);
  if (otherVal > 0.5) slices.push({ pos: "Other", val: otherVal, pct: otherVal / total });

  var cx = 100, cy = H / 2, radius = 70;
  var startAngle = -Math.PI / 2;

  slices.forEach(function(sl) {
    var endAngle = startAngle + sl.pct * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, startAngle, endAngle);
    ctx.closePath();
    ctx.fillStyle = _POS_HEX[sl.pos] || "#8a7565";
    ctx.fill();
    ctx.strokeStyle = t.ink;
    ctx.lineWidth = 2;
    ctx.stroke();
    startAngle = endAngle;
  });

  // Legend
  var ly = 20;
  slices.forEach(function(sl) {
    ctx.fillStyle = _POS_HEX[sl.pos] || "#8a7565";
    ctx.fillRect(W - 65, ly, 12, 12);
    ctx.strokeStyle = t.ink;
    ctx.lineWidth = 1;
    ctx.strokeRect(W - 65, ly, 12, 12);
    ctx.fillStyle = t.ink;
    ctx.font = "bold 11px 'Space Mono', monospace";
    ctx.textAlign = "left";
    ctx.fillText(sl.pos + " " + Math.round(sl.pct * 100) + "%", W - 48, ly + 10);
    ly += 20;
  });
}

// ─── Age vs Value Scatter ─────────────────────────────────────────────

function drawRosterAgeChart() {
  var canvas = document.getElementById("rosterAgeChart");
  if (!canvas || !_rosterReport) return;
  var ctx = canvas.getContext("2d");
  var W = canvas.width, H = canvas.height;
  var t = getCanvasTheme();
  ctx.clearRect(0, 0, W, H);

  var players = _rosterReport.players || [];
  if (players.length === 0) return;

  var pad = { top: 20, right: 15, bottom: 30, left: 35 };
  var plotW = W - pad.left - pad.right;
  var plotH = H - pad.top - pad.bottom;

  // Determine ranges
  var ages = players.map(function(p) { return p.age || 22; });
  var minAge = Math.floor(Math.min.apply(null, ages)) - 1;
  var maxAge = Math.ceil(Math.max.apply(null, ages)) + 1;
  var maxVal = 100;

  function xPos(age) { return pad.left + ((age - minAge) / (maxAge - minAge)) * plotW; }
  function yPos(val) { return pad.top + plotH - (val / maxVal) * plotH; }

  // Grid
  ctx.strokeStyle = t.inkFaint;
  ctx.lineWidth = 1;
  for (var a = Math.ceil(minAge); a <= maxAge; a += 2) {
    var gx = xPos(a);
    ctx.beginPath(); ctx.moveTo(gx, pad.top); ctx.lineTo(gx, H - pad.bottom); ctx.stroke();
    ctx.fillStyle = t.ink;
    ctx.font = "10px 'Space Mono', monospace";
    ctx.textAlign = "center";
    ctx.fillText(a, gx, H - pad.bottom + 14);
  }
  for (var v = 0; v <= 100; v += 25) {
    var gy = yPos(v);
    ctx.beginPath(); ctx.moveTo(pad.left, gy); ctx.lineTo(W - pad.right, gy); ctx.stroke();
    ctx.fillStyle = t.ink;
    ctx.font = "10px 'Space Mono', monospace";
    ctx.textAlign = "right";
    ctx.fillText(v, pad.left - 4, gy + 3);
  }

  // Axis labels
  ctx.fillStyle = t.ink;
  ctx.font = "bold 10px 'Space Mono', monospace";
  ctx.textAlign = "center";
  ctx.fillText("AGE", pad.left + plotW / 2, H - 2);
  ctx.save();
  ctx.translate(10, pad.top + plotH / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText("VALUE", 0, 0);
  ctx.restore();

  // Plot dots
  players.forEach(function(p) {
    var age = p.age || 22;
    var val = p.trade_value || 0;
    var x = xPos(age);
    var y = yPos(val);
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fillStyle = _POS_HEX[p.position] || "#d97757";
    ctx.fill();
    ctx.strokeStyle = t.ink;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Name label for top players
    if (val >= 40 || players.length <= 10) {
      ctx.fillStyle = t.ink;
      ctx.font = "9px 'Space Mono', monospace";
      ctx.textAlign = "center";
      var lastName = (p.full_name || "").split(" ").slice(-1)[0];
      ctx.fillText(lastName, x, y - 8);
    }
  });
}

// ─── Team Card PNG Export ─────────────────────────────────────────────

function exportRosterTeamCard() {
  if (!_rosterReport) return;
  var r = _rosterReport;
  var sortedPlayers = (r.players || []).slice().sort(function(a, b) { return b.trade_value - a.trade_value; });

  var W = 600;
  var HEADER_H = 80;
  var SUMMARY_H = 80;
  var CHART_AREA_H = 200;
  var ROW_H = 24;
  var PLAYER_TABLE_H = Math.min(sortedPlayers.length, 30) * ROW_H + 30;
  var FOOTER_H = 36;
  var H = HEADER_H + SUMMARY_H + CHART_AREA_H + PLAYER_TABLE_H + FOOTER_H + 40;

  var canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  var ctx = canvas.getContext("2d");
  var t = getCanvasTheme();

  // Sand background
  ctx.fillStyle = t.bg;
  ctx.fillRect(0, 0, W, H);

  // Border
  ctx.strokeStyle = t.ink;
  ctx.lineWidth = 4;
  ctx.strokeRect(2, 2, W - 4, H - 4);

  // Header
  ctx.fillStyle = t.ink;
  ctx.font = "bold 28px 'Luckiest Guy', cursive";
  ctx.textAlign = "center";
  ctx.fillText("MY DYNASTY ROSTER", W / 2, 44);
  ctx.font = "16px 'Caveat', cursive";
  ctx.fillStyle = t.inkMedium;
  ctx.fillText("razzle.lol team card", W / 2, 68);

  var y = HEADER_H;

  // Grade badge
  var gc = _GRADE_COLORS[r.grade] || "#d97757";
  ctx.fillStyle = gc;
  _roundRect(ctx, 30, y + 5, 70, 55, 10);
  ctx.fill();
  ctx.strokeStyle = t.ink;
  ctx.lineWidth = 3;
  _roundRect(ctx, 30, y + 5, 70, 55, 10);
  ctx.stroke();
  ctx.fillStyle = t.white;
  ctx.font = "bold 32px 'Luckiest Guy', cursive";
  ctx.textAlign = "center";
  ctx.fillText(r.grade, 65, y + 42);

  // Total value
  ctx.fillStyle = t.ink;
  ctx.font = "bold 26px 'Luckiest Guy', cursive";
  ctx.textAlign = "left";
  ctx.fillText(r.total_value + " pts", 120, y + 30);
  ctx.font = "14px 'Space Mono', monospace";
  ctx.fillStyle = t.inkMedium;
  ctx.fillText("total dynasty value  |  avg age: " + r.average_age, 120, y + 50);

  // Status badge
  var sc = _STATUS_COLORS[r.competing_status] || "#d97757";
  var statusText = (r.competing_status || "").toUpperCase();
  ctx.fillStyle = sc;
  var sw = ctx.measureText(statusText).width + 24;
  _roundRect(ctx, W - sw - 30, y + 12, sw, 30, 8);
  ctx.fill();
  ctx.strokeStyle = t.ink;
  ctx.lineWidth = 2;
  _roundRect(ctx, W - sw - 30, y + 12, sw, 30, 8);
  ctx.stroke();
  ctx.fillStyle = t.white;
  ctx.font = "bold 14px 'Space Mono', monospace";
  ctx.textAlign = "center";
  ctx.fillText(statusText, W - sw / 2 - 30, y + 32);

  y += SUMMARY_H;

  // Positional pie chart (left half)
  var totals = r.positional_totals || {};
  var total = r.total_value || 1;
  var posOrder = ["QB", "RB", "WR", "TE"];
  var slices = [];
  posOrder.forEach(function(pos) {
    if (totals[pos]) slices.push({ pos: pos, val: totals[pos], pct: totals[pos] / total });
  });
  var otherVal = total - slices.reduce(function(s, sl) { return s + sl.val; }, 0);
  if (otherVal > 0.5) slices.push({ pos: "Other", val: otherVal, pct: otherVal / total });

  var pieCx = 120, pieCy = y + 90, pieR = 65;
  var startAngle = -Math.PI / 2;
  slices.forEach(function(sl) {
    var endAngle = startAngle + sl.pct * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(pieCx, pieCy);
    ctx.arc(pieCx, pieCy, pieR, startAngle, endAngle);
    ctx.closePath();
    ctx.fillStyle = _POS_HEX[sl.pos] || "#8a7565";
    ctx.fill();
    ctx.strokeStyle = t.ink;
    ctx.lineWidth = 2;
    ctx.stroke();
    startAngle = endAngle;
  });

  // Pie legend
  var ly = y + 20;
  ctx.textAlign = "left";
  slices.forEach(function(sl) {
    ctx.fillStyle = _POS_HEX[sl.pos] || "#8a7565";
    ctx.fillRect(210, ly, 14, 14);
    ctx.strokeStyle = t.ink;
    ctx.lineWidth = 1;
    ctx.strokeRect(210, ly, 14, 14);
    ctx.fillStyle = t.ink;
    ctx.font = "bold 12px 'Space Mono', monospace";
    ctx.fillText(sl.pos + ": " + Math.round(sl.val) + " (" + Math.round(sl.pct * 100) + "%)", 230, ly + 12);
    ly += 22;
  });

  // Age scatter (right half)
  var scatterX = 320, scatterY = y + 10, scatterW = 250, scatterH = 170;
  ctx.fillStyle = t.bgCard;
  _roundRect(ctx, scatterX, scatterY, scatterW, scatterH, 8);
  ctx.fill();
  ctx.strokeStyle = t.ink;
  ctx.lineWidth = 2;
  _roundRect(ctx, scatterX, scatterY, scatterW, scatterH, 8);
  ctx.stroke();

  var sPad = { top: 20, right: 10, bottom: 25, left: 30 };
  var sPlotW = scatterW - sPad.left - sPad.right;
  var sPlotH = scatterH - sPad.top - sPad.bottom;
  var playerData = r.players || [];
  var ages = playerData.map(function(p) { return p.age || 22; });
  var sMinAge = ages.length ? Math.floor(Math.min.apply(null, ages)) - 1 : 20;
  var sMaxAge = ages.length ? Math.ceil(Math.max.apply(null, ages)) + 1 : 35;

  function sxPos(age) { return scatterX + sPad.left + ((age - sMinAge) / (sMaxAge - sMinAge)) * sPlotW; }
  function syPos(val) { return scatterY + sPad.top + sPlotH - (val / 100) * sPlotH; }

  // Grid
  ctx.strokeStyle = t.inkFaint;
  ctx.lineWidth = 1;
  for (var a = Math.ceil(sMinAge); a <= sMaxAge; a += 2) {
    ctx.beginPath(); ctx.moveTo(sxPos(a), scatterY + sPad.top); ctx.lineTo(sxPos(a), scatterY + scatterH - sPad.bottom); ctx.stroke();
    ctx.fillStyle = t.inkMedium; ctx.font = "9px 'Space Mono', monospace"; ctx.textAlign = "center";
    ctx.fillText(a, sxPos(a), scatterY + scatterH - sPad.bottom + 12);
  }
  ctx.fillStyle = t.ink; ctx.font = "bold 9px 'Space Mono', monospace"; ctx.textAlign = "center";
  ctx.fillText("AGE", scatterX + sPad.left + sPlotW / 2, scatterY + scatterH - 2);

  // Dots
  playerData.forEach(function(p) {
    var ax = sxPos(p.age || 22);
    var ay = syPos(p.trade_value || 0);
    ctx.beginPath();
    ctx.arc(ax, ay, 4, 0, Math.PI * 2);
    ctx.fillStyle = _POS_HEX[p.position] || "#d97757";
    ctx.fill();
    ctx.strokeStyle = t.ink;
    ctx.lineWidth = 1;
    ctx.stroke();
  });

  // Title
  ctx.fillStyle = t.ink; ctx.font = "bold 10px 'Space Mono', monospace"; ctx.textAlign = "left";
  ctx.fillText("AGE vs VALUE", scatterX + sPad.left, scatterY + 14);

  y += CHART_AREA_H;

  // Player values table
  ctx.fillStyle = t.ink;
  ctx.font = "bold 12px 'Space Mono', monospace";
  ctx.textAlign = "left";
  ctx.fillText("PLAYER VALUES", 30, y + 16);
  y += 26;

  sortedPlayers.slice(0, 30).forEach(function(p, i) {
    var rowY = y + i * ROW_H;
    ctx.fillStyle = i % 2 === 0 ? t.bgCard : t.bg;
    ctx.fillRect(30, rowY, W - 60, ROW_H);

    // Rank
    ctx.fillStyle = t.inkLight;
    ctx.font = "10px 'Space Mono', monospace";
    ctx.textAlign = "right";
    ctx.fillText((i + 1) + ".", 50, rowY + 16);

    // Pos badge
    ctx.fillStyle = _POS_HEX[p.position] || "#d97757";
    _roundRect(ctx, 56, rowY + 4, 26, 16, 4);
    ctx.fill();
    ctx.fillStyle = t.white;
    ctx.font = "bold 9px 'Space Mono', monospace";
    ctx.textAlign = "center";
    ctx.fillText(p.position, 69, rowY + 15);

    // Name
    ctx.fillStyle = t.ink;
    ctx.font = "bold 12px 'Space Mono', monospace";
    ctx.textAlign = "left";
    ctx.fillText(p.full_name || "", 90, rowY + 16);

    // Team
    ctx.fillStyle = t.inkLight;
    ctx.font = "10px 'Space Mono', monospace";
    ctx.textAlign = "left";
    var nameW = ctx.measureText(p.full_name || "").width;
    ctx.fillText(p.team || "", 94 + nameW, rowY + 16);

    // Value bar
    var barX = W - 160, barW = 80, barH = 12;
    ctx.fillStyle = t.inkFaint;
    _roundRect(ctx, barX, rowY + 6, barW, barH, 3);
    ctx.fill();
    var pct = Math.min(100, p.trade_value) / 100;
    ctx.fillStyle = _POS_HEX[p.position] || "#d97757";
    _roundRect(ctx, barX, rowY + 6, barW * pct, barH, 3);
    ctx.fill();

    // Value number
    ctx.fillStyle = t.ink;
    ctx.font = "bold 12px 'Space Mono', monospace";
    ctx.textAlign = "right";
    ctx.fillText(p.trade_value, W - 36, rowY + 16);
  });

  y += PLAYER_TABLE_H;

  // Watermark
  ctx.fillStyle = t.ink;
  ctx.font = "bold 16px 'Luckiest Guy', cursive";
  ctx.textAlign = "right";
  ctx.globalAlpha = 0.3;
  ctx.fillText("razzle.lol", W - 20, H - 12);
  ctx.globalAlpha = 1.0;

  // Download
  var link = document.createElement("a");
  link.download = "razzle-team-card.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
}

function _roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

// ---------------------------------------------------------------------------
// Player Comp Finder
// ---------------------------------------------------------------------------

let _compData = null; // Store for PNG export

async function loadPlayerComps(playerId) {
  const section = document.getElementById("profileCompsSection");
  if (!section) return;

  section.innerHTML = `<div style="text-align:center; padding:30px; font-family:var(--font-hand); font-size:20px; color:var(--ink-light);">scouting the film for similar players...</div>`;

  try {
    const data = await apiFetch(`/api/players/${playerId}/comps?limit=5`);
    if (data.error) {
      section.innerHTML = `<div style="text-align:center; padding:30px; font-family:var(--font-hand); font-size:18px; color:var(--ink-light);">${escapeHtml(data.error)}</div>`;
      return;
    }
    _compData = data;
    renderPlayerComps(data, section);
  } catch (err) {
    section.innerHTML = `<div style="text-align:center; padding:30px; font-family:var(--font-hand); font-size:18px; color:var(--red);">fumbled the comp search... try again in a sec.</div>`;
  }
}

function renderPlayerComps(data, container) {
  const { player, comps, stat_keys, stat_labels, target_stats, season } = data;
  if (!comps || comps.length === 0) {
    container.innerHTML = `<div style="text-align:center; padding:30px; font-family:var(--font-hand); font-size:18px; color:var(--ink-light);">no similar players found on the tape</div>`;
    return;
  }

  const pos = (player.position || "").toUpperCase();
  const posColors = { QB: "var(--pos-qb)", RB: "var(--pos-rb)", WR: "var(--pos-wr)", TE: "var(--pos-te)" };
  const posColor = posColors[pos] || "var(--ink)";

  let html = "";

  // Section header
  html += `<div class="profile-section-title" style="display:flex; align-items:center; justify-content:space-between;">`;
  html += `<span>Player Comps — ${season} Season</span>`;
  html += `<button class="btn-chunky" onclick="exportCompsImage()" style="font-size:10px; padding:4px 10px;">Export Comps PNG</button>`;
  html += `</div>`;

  // Annotation
  html += `<div style="font-family:var(--font-hand); font-size:16px; color:var(--ink-light); margin-bottom:12px; padding-left:4px;">match% = cosine similarity on per-game stat profiles (8 position-specific metrics)</div>`;

  // Comp cards
  html += `<div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(200px, 1fr)); gap:12px; margin-bottom:20px;">`;

  for (const comp of comps) {
    const simColor = comp.similarity >= 95 ? "var(--green)" : comp.similarity >= 90 ? "var(--orange)" : "var(--ink-medium)";
    html += `<div style="background:var(--bg-card); border:3px solid var(--ink); border-radius:var(--radius-sm); box-shadow:4px 4px 0 var(--ink); padding:14px; cursor:pointer; transition:transform 0.15s, box-shadow 0.15s;" onmouseover="this.style.transform='translate(-2px,-2px)';this.style.boxShadow='6px 6px 0 var(--ink)'" onmouseout="this.style.transform='';this.style.boxShadow='4px 4px 0 var(--ink)'" onclick="openPlayerProfile('${escapeJS(comp.player_id)}')">`;

    // Headshot + name
    html += `<div style="display:flex; align-items:center; gap:8px; margin-bottom:8px;">`;
    if (comp.headshot_url) {
      html += `<img src="${escapeAttr(comp.headshot_url)}" alt="" style="width:36px; height:36px; border-radius:50%; border:2px solid var(--ink); object-fit:cover;" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'">`;
      html += `<span style="display:none; width:36px; height:36px; border-radius:50%; border:2px solid var(--ink); background:${posColor}; color:var(--text-on-accent); font-family:var(--font-mono); font-size:14px; align-items:center; justify-content:center;">${escapeHtml((comp.full_name || "").split(" ").map(n => n[0]).join(""))}</span>`;
    } else {
      html += `<span style="display:flex; width:36px; height:36px; border-radius:50%; border:2px solid var(--ink); background:${posColor}; color:var(--text-on-accent); font-family:var(--font-mono); font-size:14px; align-items:center; justify-content:center;">${escapeHtml((comp.full_name || "").split(" ").map(n => n[0]).join(""))}</span>`;
    }
    html += `<div style="flex:1; min-width:0;">`;
    html += `<div style="font-family:var(--font-mono); font-size:14px; font-weight:700; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${escapeHtml(comp.full_name)}</div>`;
    html += `<div style="font-family:var(--font-mono); font-size:11px; color:var(--ink-medium);">${escapeHtml(comp.team || "FA")} · ${comp.games}G · ${comp.ppg} PPG</div>`;
    html += `</div>`;
    html += `</div>`;

    // Similarity score
    html += `<div style="text-align:center; margin:8px 0;">`;
    html += `<span style="font-family:var(--font-display); font-size:28px; font-weight:700; color:${simColor};">${comp.similarity}%</span>`;
    html += `<div style="font-family:var(--font-mono); font-size:10px; color:var(--ink-light); text-transform:uppercase;">match</div>`;
    html += `</div>`;

    // Top matching stats
    if (comp.matching_stats && comp.matching_stats.length > 0) {
      html += `<div style="border-top:2px dashed var(--ink-faint); padding-top:8px;">`;
      for (const ms of comp.matching_stats) {
        html += `<div style="display:flex; justify-content:space-between; font-family:var(--font-mono); font-size:11px; padding:2px 0;">`;
        html += `<span style="color:var(--ink-light);">${escapeHtml(String(ms.label))}</span>`;
        html += `<span style="color:var(--ink);">${escapeHtml(String(ms.comp_val))}</span>`;
        html += `</div>`;
      }
      html += `</div>`;
    }

    html += `</div>`;
  }

  html += `</div>`;

  // Mini radar overlay: target vs top comp
  const topComp = comps[0];
  html += `<div class="profile-section-title" style="font-size:14px;">Stat Profile: ${escapeHtml(player.full_name)} vs ${escapeHtml(topComp.full_name)}</div>`;
  html += `<div style="display:flex; gap:16px; align-items:center; margin-bottom:12px;">`;
  html += `<div style="display:flex; align-items:center; gap:6px; font-family:var(--font-mono); font-size:12px;"><span style="width:12px; height:12px; background:${posColor}; opacity:0.5; border:2px solid var(--ink); display:inline-block;"></span> ${escapeHtml(player.full_name)}</div>`;
  html += `<div style="display:flex; align-items:center; gap:6px; font-family:var(--font-mono); font-size:12px;"><span style="width:12px; height:12px; background:var(--ink); opacity:0.4; border:2px solid var(--ink); display:inline-block;"></span> ${escapeHtml(topComp.full_name)}</div>`;
  html += `</div>`;
  html += `<canvas id="compRadarCanvas" width="400" height="340" role="img" aria-label="Player comparison radar chart" style="border:2px solid var(--ink); border-radius:8px; background:var(--bg); width:100%; max-width:400px; display:block; margin:0 auto;"></canvas>`;

  // Stat comparison table
  html += `<div class="profile-section-title" style="font-size:14px; margin-top:16px;">Full Stat Comparison</div>`;
  html += `<table class="profile-season-table"><thead><tr>`;
  html += `<th style="text-align:left;">Stat</th>`;
  html += `<th>${escapeHtml(player.full_name)}</th>`;
  for (const c of comps.slice(0, 3)) {
    html += `<th>${escapeHtml((c.full_name || "").split(" ").pop())}</th>`;
  }
  html += `</tr></thead><tbody>`;

  // Build stat vectors for table
  for (const key of stat_keys) {
    const label = stat_labels[key] || key;
    const targetVal = target_stats[key] ? target_stats[key].value : "—";
    html += `<tr><td style="text-align:left; font-weight:600;">${label}</td>`;
    html += `<td style="font-weight:700; color:${posColor};">${targetVal}</td>`;
    for (const c of comps.slice(0, 3)) {
      const val = c.all_stats && c.all_stats[key] != null ? c.all_stats[key] : "—";
      html += `<td>${val}</td>`;
    }
    html += `</tr>`;
  }
  html += `</tbody></table>`;

  container.innerHTML = html;

  // Draw radar chart
  requestAnimationFrame(() => drawCompRadar(data));
}


function drawCompRadar(data) {
  var t = getCanvasTheme();
  const canvas = document.getElementById("compRadarCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const { player, comps, stat_keys, stat_labels, target_stats } = data;
  if (!comps || comps.length === 0) return;

  const topComp = comps[0];
  const pos = (player.position || "").toUpperCase();
  const posColorMap = { QB: "#5b7fff", RB: "#2ec4b6", WR: "#d97757", TE: "#8b5cf6" };
  const posColor = posColorMap[pos] || "#d97757";

  const W = canvas.width;
  const H = canvas.height;
  const cx = W / 2;
  const cy = H / 2 + 10;
  const R = Math.min(W, H) * 0.35;

  ctx.clearRect(0, 0, W, H);

  // Use 5-6 stats for radar
  const radarKeys = stat_keys.slice(0, Math.min(6, stat_keys.length));
  const n = radarKeys.length;
  const angleStep = (2 * Math.PI) / n;

  // Find max values across all comps for normalization
  const maxVals = {};
  for (const key of radarKeys) {
    const tv = target_stats[key] ? target_stats[key].value : 0;
    let mv = Math.abs(tv);
    for (const c of comps) {
      const cv = c.all_stats && c.all_stats[key] != null ? Math.abs(c.all_stats[key]) : 0;
      if (cv > mv) mv = cv;
    }
    maxVals[key] = mv || 1;
  }

  // Draw grid circles
  ctx.strokeStyle = t.inkFaint;
  ctx.lineWidth = 1;
  for (let ring = 1; ring <= 4; ring++) {
    const r = (R / 4) * ring;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, 2 * Math.PI);
    ctx.stroke();
  }

  // Draw axes + labels
  ctx.strokeStyle = t.inkFaint;
  ctx.fillStyle = t.ink;
  ctx.font = "bold 11px 'Space Mono', monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  for (let i = 0; i < n; i++) {
    const angle = -Math.PI / 2 + i * angleStep;
    const x = cx + R * Math.cos(angle);
    const y = cy + R * Math.sin(angle);
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(x, y);
    ctx.stroke();

    // Label
    const lx = cx + (R + 20) * Math.cos(angle);
    const ly = cy + (R + 20) * Math.sin(angle);
    const label = stat_labels[radarKeys[i]] || radarKeys[i];
    ctx.fillText(label, lx, ly);
  }

  // Helper to draw polygon
  function drawPoly(values, fillColor, strokeColor, alpha) {
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const angle = -Math.PI / 2 + i * angleStep;
      const val = values[i] / maxVals[radarKeys[i]];
      const r = Math.max(0, Math.min(1, val)) * R;
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = fillColor;
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  // Target player polygon
  const targetVals = radarKeys.map(k => target_stats[k] ? target_stats[k].value : 0);

  // Top comp polygon
  const compVals = radarKeys.map(k => {
    const m = (topComp.matching_stats || []).find(ms => ms.stat === k);
    return m ? m.comp_val : 0;
  });

  // Use all_stats from backend for full comp values
  const compFullVals = radarKeys.map(k => {
    if (topComp.all_stats && topComp.all_stats[k] != null) return topComp.all_stats[k];
    return 0;
  });

  var _ct = getCanvasTheme();
  drawPoly(compFullVals, _ct.inkMedium, _ct.inkMedium, 0.15);
  drawPoly(targetVals, posColor, posColor, 0.3);

  // Dots on target polygon
  ctx.fillStyle = posColor;
  for (let i = 0; i < n; i++) {
    const angle = -Math.PI / 2 + i * angleStep;
    const val = targetVals[i] / maxVals[radarKeys[i]];
    const r = Math.max(0, Math.min(1, val)) * R;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, 2 * Math.PI);
    ctx.fill();
    ctx.strokeStyle = t.ink;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }
}


function exportCompsImage() {
  if (!_compData || !_compData.comps || _compData.comps.length === 0) return;

  const { player, comps, stat_keys, stat_labels, target_stats, season } = _compData;
  const pos = (player.position || "").toUpperCase();
  const posColors = { QB: "#5b7fff", RB: "#2ec4b6", WR: "#d97757", TE: "#8b5cf6" };
  const pColor = posColors[pos] || getCanvasTheme().ink;

  const padX = 30, padY = 30;
  const W = 800;
  const cardH = 90;
  const cardGap = 12;
  const compsToShow = comps.slice(0, 5);
  const cardsH = compsToShow.length * (cardH + cardGap);
  const tableRowH = 24;
  const tableH = 28 + stat_keys.length * tableRowH;
  const H = padY + 70 + cardsH + 20 + tableH + 50 + padY;

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");

  var t = getCanvasTheme();

  // Background
  ctx.fillStyle = t.bgCard;
  ctx.fillRect(0, 0, W, H);

  // Header
  ctx.fillStyle = t.ink;
  ctx.font = "bold 24px 'Luckiest Guy', cursive";
  ctx.textAlign = "left";
  ctx.fillText(`PLAYER COMPS — ${player.full_name}`, padX, padY + 28);

  // Subtitle
  ctx.fillStyle = t.inkLight;
  ctx.font = "12px 'Space Mono', monospace";
  ctx.fillText(`${pos} · ${player.team || "FA"} · ${season} Season · ${player.ppg || 0} PPR PPG`, padX, padY + 48);

  // Position badge
  ctx.fillStyle = pColor;
  const badgeX = W - padX - 60;
  ctx.fillRect(badgeX, padY + 10, 50, 30);
  ctx.strokeStyle = t.ink;
  ctx.lineWidth = 2;
  ctx.strokeRect(badgeX, padY + 10, 50, 30);
  ctx.fillStyle = t.white;
  ctx.font = "bold 14px 'Space Mono', monospace";
  ctx.textAlign = "center";
  ctx.fillText(pos, badgeX + 25, padY + 30);

  // Comp cards
  let y = padY + 70;
  ctx.textAlign = "left";

  for (let i = 0; i < compsToShow.length; i++) {
    const c = compsToShow[i];
    const cardY = y + i * (cardH + cardGap);

    // Card background
    ctx.fillStyle = t.bgCard;
    ctx.fillRect(padX, cardY, W - padX * 2, cardH);
    ctx.strokeStyle = t.ink;
    ctx.lineWidth = 3;
    ctx.strokeRect(padX, cardY, W - padX * 2, cardH);
    // Shadow
    ctx.fillStyle = t.ink;
    ctx.fillRect(padX + 4, cardY + 4, W - padX * 2, cardH);
    // Redraw card on top
    ctx.fillStyle = t.bgCard;
    ctx.fillRect(padX, cardY, W - padX * 2, cardH);
    ctx.strokeStyle = t.ink;
    ctx.lineWidth = 3;
    ctx.strokeRect(padX, cardY, W - padX * 2, cardH);

    // Rank badge
    ctx.fillStyle = pColor;
    ctx.fillRect(padX + 10, cardY + 10, 30, 30);
    ctx.strokeStyle = t.ink;
    ctx.lineWidth = 2;
    ctx.strokeRect(padX + 10, cardY + 10, 30, 30);
    ctx.fillStyle = t.white;
    ctx.font = "bold 16px 'Luckiest Guy', cursive";
    ctx.textAlign = "center";
    ctx.fillText(`#${i + 1}`, padX + 25, cardY + 30);

    // Name + team
    ctx.textAlign = "left";
    ctx.fillStyle = t.ink;
    ctx.font = "bold 18px 'Luckiest Guy', cursive";
    ctx.fillText(c.full_name, padX + 52, cardY + 28);
    ctx.fillStyle = t.inkLight;
    ctx.font = "11px 'Space Mono', monospace";
    ctx.fillText(`${c.team || "FA"} · ${c.games || 0}G · ${c.ppg || 0} PPG`, padX + 52, cardY + 46);

    // Similarity score
    const simColor = c.similarity >= 95 ? "#2ec4b6" : c.similarity >= 90 ? "#d97757" : "#5c4a3d";
    ctx.fillStyle = simColor;
    ctx.font = "bold 28px 'Luckiest Guy', cursive";
    ctx.textAlign = "right";
    ctx.fillText(`${c.similarity}%`, W - padX - 16, cardY + 35);
    ctx.fillStyle = t.inkLight;
    ctx.font = "bold 10px 'Space Mono', monospace";
    ctx.fillText("MATCH", W - padX - 16, cardY + 50);

    // Top matching stats
    ctx.textAlign = "left";
    ctx.font = "11px 'Space Mono', monospace";
    const matchX = padX + 320;
    if (c.matching_stats) {
      for (let j = 0; j < Math.min(3, c.matching_stats.length); j++) {
        const ms = c.matching_stats[j];
        ctx.fillStyle = t.inkLight;
        ctx.fillText(ms.label + ":", matchX + j * 110, cardY + 72);
        ctx.fillStyle = t.ink;
        ctx.fillText(String(ms.comp_val), matchX + j * 110 + 55, cardY + 72);
      }
    }
  }

  // Stat table
  const tableY = y + compsToShow.length * (cardH + cardGap) + 20;
  const colW = (W - padX * 2) / (2 + Math.min(3, compsToShow.length));

  // Table header
  ctx.fillStyle = t.bgWarm;
  ctx.fillRect(padX, tableY, W - padX * 2, 28);
  ctx.strokeStyle = t.ink;
  ctx.lineWidth = 2;
  ctx.strokeRect(padX, tableY, W - padX * 2, 28);
  ctx.fillStyle = t.ink;
  ctx.font = "bold 11px 'Space Mono', monospace";
  ctx.textAlign = "left";
  ctx.fillText("Stat", padX + 8, tableY + 18);
  ctx.fillText((player.full_name || '').split(" ").pop(), padX + colW + 8, tableY + 18);
  for (let i = 0; i < Math.min(3, compsToShow.length); i++) {
    ctx.fillText((compsToShow[i].full_name || '').split(" ").pop(), padX + colW * (i + 2) + 8, tableY + 18);
  }

  // Table rows
  for (let r = 0; r < stat_keys.length; r++) {
    const rowY = tableY + 28 + r * tableRowH;
    ctx.fillStyle = r % 2 === 0 ? t.bgCard : t.bg;
    ctx.fillRect(padX, rowY, W - padX * 2, tableRowH);

    ctx.fillStyle = t.ink;
    ctx.font = "bold 11px 'Space Mono', monospace";
    ctx.textAlign = "left";
    ctx.fillText(stat_labels[stat_keys[r]] || stat_keys[r], padX + 8, rowY + 16);

    ctx.font = "11px 'Space Mono', monospace";
    ctx.fillStyle = pColor;
    const tv = target_stats[stat_keys[r]] ? target_stats[stat_keys[r]].value : "—";
    ctx.fillText(String(tv), padX + colW + 8, rowY + 16);

    ctx.fillStyle = t.ink;
    for (let i = 0; i < Math.min(3, compsToShow.length); i++) {
      const val = compsToShow[i].all_stats && compsToShow[i].all_stats[stat_keys[r]] != null
        ? compsToShow[i].all_stats[stat_keys[r]] : "—";
      ctx.fillText(String(val), padX + colW * (i + 2) + 8, rowY + 16);
    }
  }

  // Table border
  ctx.strokeStyle = t.ink;
  ctx.lineWidth = 2;
  ctx.strokeRect(padX, tableY, W - padX * 2, 28 + stat_keys.length * tableRowH);

  // Watermark
  const wmY = H - padY - 10;
  ctx.fillStyle = t.inkLight;
  ctx.font = "italic 14px 'Caveat', cursive";
  ctx.textAlign = "center";
  ctx.fillText("razzle.lol", W / 2, wmY);

  // Download
  const link = document.createElement("a");
  const safeName = (player.full_name || "player").replace(/[^a-zA-Z0-9]/g, "-").toLowerCase();
  link.download = `razzle-comps-${safeName}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
}


// ── Boom/Bust Analyzer ──────────────────────────────────────────────

let _boomBustData = null;

async function loadBoomBust(playerId) {
  const section = document.getElementById("profileBoomBustSection");
  if (!section) return;

  section.innerHTML = `<div style="text-align:center; padding:30px; font-family:var(--font-hand); font-size:20px; color:var(--ink-light);">studying the game log variance...</div>`;

  try {
    const data = await apiFetch(`/api/players/${playerId}/boom-bust`);
    if (data.error) {
      section.innerHTML = `<div style="text-align:center; padding:30px; font-family:var(--font-hand); font-size:18px; color:var(--ink-light);">${escapeHtml(data.error)}</div>`;
      return;
    }
    _boomBustData = data;
    renderBoomBust(data, section);
  } catch (err) {
    section.innerHTML = `<div style="text-align:center; padding:30px; font-family:var(--font-hand); font-size:18px; color:var(--red);">fumbled the boom/bust analysis... try again in a sec.</div>`;
  }
}

function renderBoomBust(data, container) {
  const { player, season, games_played, weekly_scores, mean_ppg, median_ppg,
          floor_ppg, ceiling_ppg, stdev, boom_rate, bust_rate,
          boom_threshold, bust_threshold, position_avg_ppg,
          consistency_score, grade, position_rank, position_total } = data;

  const pos = (player.position || "").toUpperCase();
  const posColors = { QB: "var(--pos-qb)", RB: "var(--pos-rb)", WR: "var(--pos-wr)", TE: "var(--pos-te)" };
  const posColor = posColors[pos] || "var(--ink)";

  // Grade color
  const safeGrade = grade || "C";
  const gradeColor = safeGrade.startsWith("A") ? "var(--green)" :
                     safeGrade.startsWith("B") ? "var(--blue)" :
                     safeGrade.startsWith("C") ? "var(--orange)" :
                     safeGrade.startsWith("D") ? "var(--yellow)" : "var(--red)";

  let html = "";

  // Section header
  html += `<div class="profile-section-title" style="display:flex; align-items:center; justify-content:space-between;">`;
  html += `<span>Boom/Bust Profile — ${season} Season</span>`;
  html += `<button class="btn-chunky" onclick="exportBoomBustImage()" style="font-size:10px; padding:4px 10px;">Export Boom/Bust PNG</button>`;
  html += `</div>`;

  // Annotation
  html += `<div style="font-family:var(--font-hand); font-size:16px; color:var(--ink-light); margin-bottom:12px; padding-left:4px;">boom = ${boom_threshold}+ PPR pts (1.5× ${pos} avg) · bust = ${bust_threshold} or below (0.5× ${pos} avg)</div>`;

  // Grade badge + stat cards row
  html += `<div style="display:flex; gap:12px; align-items:flex-start; flex-wrap:wrap; margin-bottom:16px;">`;

  // Grade sticker with label
  html += `<div style="text-align:center; flex-shrink:0;">`;
  html += `<div style="background:${gradeColor}; color:var(--text-on-accent); font-family:var(--font-display); font-size:36px; font-weight:700; width:72px; height:72px; display:flex; align-items:center; justify-content:center; border:3px solid var(--ink); border-radius:12px; box-shadow:4px 4px 0 var(--ink); transform:rotate(-3deg);">`;
  html += grade;
  html += `</div>`;
  html += `<div style="font-family:var(--font-mono); font-size:9px; color:var(--ink-light); text-transform:uppercase; margin-top:4px;">Consistency</div>`;
  html += `</div>`;

  // Stat cards
  const stats = [
    { label: "Median", value: median_ppg != null ? median_ppg.toFixed(1) : "—", sub: "PPR/G" },
    { label: "Floor", value: floor_ppg != null ? floor_ppg.toFixed(1) : "—", sub: "10th pct" },
    { label: "Ceiling", value: ceiling_ppg != null ? ceiling_ppg.toFixed(1) : "—", sub: "90th pct" },
    { label: "Boom%", value: boom_rate != null ? boom_rate.toFixed(0) + "%" : "—", sub: `${Math.round((boom_rate || 0) * games_played / 100)}/${games_played} wks` },
    { label: "Bust%", value: bust_rate != null ? bust_rate.toFixed(0) + "%" : "—", sub: `${Math.round((bust_rate || 0) * games_played / 100)}/${games_played} wks` },
    { label: "Score", value: consistency_score != null ? consistency_score.toFixed(0) : "—", sub: `of 100` },
    { label: "Rank", value: `#${position_rank}`, sub: `of ${position_total} ${pos}s` },
  ];

  html += `<div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(90px, 1fr)); gap:8px; flex:1;">`;
  for (const st of stats) {
    const cardColor = st.label === "Boom%" ? "var(--green)" :
                      st.label === "Bust%" ? "var(--red)" : posColor;
    html += `<div style="background:var(--bg-card); border:3px solid var(--ink); border-radius:8px; box-shadow:4px 4px 0 var(--ink); padding:8px; text-align:center;">`;
    html += `<div style="font-family:var(--font-display); font-size:20px; font-weight:700; color:${cardColor};">${st.value}</div>`;
    html += `<div style="font-family:var(--font-mono); font-size:10px; color:var(--ink-medium); text-transform:uppercase;">${st.label}</div>`;
    html += `<div style="font-family:var(--font-mono); font-size:9px; color:var(--ink-light);">${st.sub}</div>`;
    html += `</div>`;
  }
  html += `</div>`;
  html += `</div>`;

  // Histogram canvas
  html += `<div class="profile-chart-wrap">`;
  html += `<canvas id="boomBustHistogram" width="720" height="280" role="img" aria-label="Weekly scoring distribution histogram" style="border:2px solid var(--ink); border-radius:8px; background:var(--bg); width:100%;"></canvas>`;
  html += `</div>`;

  // Histogram legend
  html += `<div style="display:flex; gap:16px; justify-content:center; margin:8px 0; font-family:var(--font-mono); font-size:11px; color:var(--ink-medium);">`;
  html += `<span style="display:flex; align-items:center; gap:4px;"><span style="width:12px; height:12px; background:var(--green); border:2px solid var(--ink); display:inline-block;"></span> Boom (${boom_threshold}+ pts)</span>`;
  html += `<span style="display:flex; align-items:center; gap:4px;"><span style="width:12px; height:12px; background:${posColor}; border:2px solid var(--ink); display:inline-block;"></span> Normal</span>`;
  html += `<span style="display:flex; align-items:center; gap:4px;"><span style="width:12px; height:12px; background:var(--red); border:2px solid var(--ink); display:inline-block;"></span> Bust (${bust_threshold} or below)</span>`;
  html += `</div>`;

  // Floor-ceiling range bar
  html += `<div style="margin-top:12px; padding:12px; background:var(--bg-card); border:2px solid var(--ink); border-radius:8px;">`;
  html += `<div style="font-family:var(--font-mono); font-size:12px; text-transform:uppercase; margin-bottom:8px; color:var(--ink-medium);">Score Range</div>`;
  html += `<canvas id="boomBustRangeBar" width="720" height="50" role="img" aria-label="Score range floor to ceiling bar" style="width:100%; height:50px;"></canvas>`;
  html += `</div>`;

  container.innerHTML = html;

  // Draw charts after DOM update
  requestAnimationFrame(() => {
    drawBoomBustHistogram(data);
    drawBoomBustRangeBar(data);
  });
}

function drawBoomBustHistogram(data) {
  const canvas = document.getElementById("boomBustHistogram");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const W = canvas.width, H = canvas.height;
  var t = getCanvasTheme();
  ctx.clearRect(0, 0, W, H);

  const { weekly_scores, boom_threshold, bust_threshold, player } = data;
  const scores = (weekly_scores || []).map(w => w.score);
  const pos = (player.position || "").toUpperCase();
  const posHex = { QB: "#5b7fff", RB: "#2ec4b6", WR: "#d97757", TE: "#8b5cf6" };
  const posColor = posHex[pos] || "#d97757";

  // Build histogram buckets (5-point buckets)
  const maxScore = Math.max(...scores, (boom_threshold || 20) + 5);
  const bucketSize = 5;
  const numBuckets = Math.ceil(maxScore / bucketSize) + 1;
  const buckets = new Array(numBuckets).fill(0);
  for (const s of scores) {
    const idx = Math.min(Math.floor(s / bucketSize), numBuckets - 1);
    buckets[idx]++;
  }
  const maxCount = Math.max(...buckets, 1);

  // Chart area
  const pad = { top: 30, right: 20, bottom: 45, left: 45 };
  const cW = W - pad.left - pad.right;
  const cH = H - pad.top - pad.bottom;
  const barW = Math.floor(cW / numBuckets) - 2;

  // Y-axis labels
  ctx.fillStyle = t.inkMedium;
  ctx.font = "11px 'Space Mono', monospace";
  ctx.textAlign = "right";
  for (let i = 0; i <= maxCount; i++) {
    const y = pad.top + cH - (i / maxCount) * cH;
    ctx.fillText(i.toString(), pad.left - 6, y + 4);
    ctx.strokeStyle = t.inkFaint;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pad.left, y);
    ctx.lineTo(W - pad.right, y);
    ctx.stroke();
  }

  // Draw bars
  for (let i = 0; i < numBuckets; i++) {
    const x = pad.left + i * (cW / numBuckets) + 1;
    const barH = (buckets[i] / maxCount) * cH;
    const y = pad.top + cH - barH;
    const bucketMid = (i + 0.5) * bucketSize;

    // Color: green for boom, red for bust, position color for middle
    if (bucketMid >= boom_threshold) {
      ctx.fillStyle = "#2ec4b6";
    } else if ((i + 1) * bucketSize <= bust_threshold) {
      ctx.fillStyle = "#e63946";
    } else {
      ctx.fillStyle = posColor;
    }

    ctx.fillRect(x, y, barW, barH);
    ctx.strokeStyle = t.ink;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x, y, barW, barH);

    // X-axis label
    ctx.fillStyle = t.inkMedium;
    ctx.font = "10px 'Space Mono', monospace";
    ctx.textAlign = "center";
    ctx.fillText(`${i * bucketSize}`, x + barW / 2, pad.top + cH + 16);
  }

  // X-axis title
  ctx.fillStyle = t.inkMedium;
  ctx.font = "11px 'Space Mono', monospace";
  ctx.textAlign = "center";
  ctx.fillText("Fantasy Points (PPR)", W / 2, H - 5);

  // Y-axis title
  ctx.save();
  ctx.translate(12, H / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillStyle = t.inkMedium;
  ctx.font = "11px 'Space Mono', monospace";
  ctx.textAlign = "center";
  ctx.fillText("Weeks", 0, 0);
  ctx.restore();

  // Boom threshold line
  const boomX = pad.left + (boom_threshold / bucketSize) * (cW / numBuckets);
  if (boomX < W - pad.right) {
    ctx.strokeStyle = "#2ec4b6";
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.moveTo(boomX, pad.top);
    ctx.lineTo(boomX, pad.top + cH);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = "#2ec4b6";
    ctx.font = "bold 11px 'Space Mono', monospace";
    ctx.textAlign = "left";
    ctx.fillText("BOOM", boomX + 4, pad.top + 14);
  }

  // Bust threshold line
  const bustX = pad.left + (bust_threshold / bucketSize) * (cW / numBuckets);
  if (bustX > pad.left) {
    ctx.strokeStyle = "#e63946";
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.moveTo(bustX, pad.top);
    ctx.lineTo(bustX, pad.top + cH);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = "#e63946";
    ctx.font = "bold 11px 'Space Mono', monospace";
    ctx.textAlign = "right";
    ctx.fillText("BUST", bustX - 4, pad.top + 14);
  }

  // Title annotation
  ctx.fillStyle = t.inkLight;
  ctx.font = "16px 'Caveat', cursive";
  ctx.textAlign = "right";
  ctx.fillText("weekly score distribution", W - pad.right, pad.top - 8);
}

function drawBoomBustRangeBar(data) {
  const canvas = document.getElementById("boomBustRangeBar");
  if (!canvas) return;
  var t = getCanvasTheme();
  const ctx = canvas.getContext("2d");
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  const { mean_ppg, player } = data;
  const floor_ppg = data.floor_ppg || 0;
  const ceiling_ppg = data.ceiling_ppg || 0;
  const median_ppg = data.median_ppg || 0;
  const pos = (player.position || "").toUpperCase();
  const posHex = { QB: "#5b7fff", RB: "#2ec4b6", WR: "#d97757", TE: "#8b5cf6" };
  const posColor = posHex[pos] || "#d97757";

  const maxVal = Math.max(ceiling_ppg * 1.2, 35);
  const pad = { left: 40, right: 40 };
  const barY = 16, barH = 18;
  const cW = W - pad.left - pad.right;

  const toX = (val) => pad.left + (val / maxVal) * cW;

  // Floor-ceiling range bar
  const floorX = toX(floor_ppg);
  const ceilX = toX(ceiling_ppg);
  ctx.fillStyle = posColor + "40";
  ctx.fillRect(floorX, barY, ceilX - floorX, barH);
  ctx.strokeStyle = posColor;
  ctx.lineWidth = 2;
  ctx.strokeRect(floorX, barY, ceilX - floorX, barH);

  // Median marker
  const medX = toX(median_ppg);
  ctx.fillStyle = posColor;
  ctx.fillRect(medX - 2, barY - 4, 4, barH + 8);

  // Labels
  ctx.font = "bold 10px 'Space Mono', monospace";
  ctx.textAlign = "center";
  ctx.fillStyle = "#e63946";
  ctx.fillText(floor_ppg.toFixed(1), floorX, barY - 4);
  ctx.fillStyle = posColor;
  ctx.fillText(median_ppg.toFixed(1), medX, H - 2);
  ctx.fillStyle = "#2ec4b6";
  ctx.fillText(ceiling_ppg.toFixed(1), ceilX, barY - 4);

  // Tiny labels
  ctx.font = "9px 'Space Mono', monospace";
  ctx.fillStyle = t.inkLight;
  ctx.textAlign = "center";
  ctx.fillText("FLOOR", floorX, H - 2);
  ctx.fillText("MED", medX, barY - 14 > 0 ? barY - 14 : barY + barH + 14);
  ctx.fillText("CEILING", ceilX, H - 2);
}

function exportBoomBustImage() {
  if (!_boomBustData) return;
  const data = _boomBustData;
  const { player, season, games_played, weekly_scores, mean_ppg,
          boom_threshold, bust_threshold, consistency_score, grade,
          position_rank, position_total } = data;
  const median_ppg = data.median_ppg || 0;
  const floor_ppg = data.floor_ppg || 0;
  const ceiling_ppg = data.ceiling_ppg || 0;
  const boom_rate = data.boom_rate || 0;
  const bust_rate = data.bust_rate || 0;

  const pos = (player.position || "").toUpperCase();
  const posHex = { QB: "#5b7fff", RB: "#2ec4b6", WR: "#d97757", TE: "#8b5cf6" };
  const posColor = posHex[pos] || "#d97757";
  const safeGrade = grade || "C";
  const gradeColor = safeGrade.startsWith("A") ? "#2ec4b6" :
                     safeGrade.startsWith("B") ? "#5b7fff" :
                     safeGrade.startsWith("C") ? "#d97757" :
                     safeGrade.startsWith("D") ? "#ffc857" : "#e63946";

  const canvas = document.createElement("canvas");
  canvas.width = 800;
  canvas.height = 700;
  const ctx = canvas.getContext("2d");
  var t = getCanvasTheme();

  // Background
  ctx.fillStyle = t.bg;
  ctx.fillRect(0, 0, 800, 700);

  // Header bar
  ctx.fillStyle = t.ink;
  ctx.fillRect(0, 0, 800, 56);
  ctx.fillStyle = t.bgCard;
  ctx.font = "bold 22px 'Luckiest Guy', cursive";
  ctx.textAlign = "left";
  ctx.fillText(`BOOM/BUST PROFILE — ${player.full_name}`, 20, 36);

  // Position badge
  ctx.fillStyle = posColor;
  ctx.fillRect(700, 10, 80, 36);
  ctx.fillStyle = t.white;
  ctx.font = "bold 18px 'Luckiest Guy', cursive";
  ctx.textAlign = "center";
  ctx.fillText(pos, 740, 35);

  // Subtitle
  ctx.fillStyle = t.inkMedium;
  ctx.font = "13px 'Space Mono', monospace";
  ctx.textAlign = "left";
  ctx.fillText(`${player.team || "FA"} · ${season || ""} Season · ${games_played || 0} Games · Avg ${mean_ppg || 0} PPR/G`, 20, 80);

  // Grade sticker
  ctx.save();
  ctx.translate(740, 95);
  ctx.rotate(-0.05);
  ctx.fillStyle = gradeColor;
  ctx.beginPath();
  ctx.roundRect(-30, -30, 60, 60, 10);
  ctx.fill();
  ctx.strokeStyle = t.ink;
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.fillStyle = t.white;
  ctx.font = "bold 32px 'Luckiest Guy', cursive";
  ctx.textAlign = "center";
  ctx.fillText(safeGrade, 0, 12);
  ctx.restore();

  // Stat cards row
  const cardStats = [
    { label: "MEDIAN", value: median_ppg.toFixed(1), color: posColor },
    { label: "FLOOR", value: floor_ppg.toFixed(1), color: "#e63946" },
    { label: "CEILING", value: ceiling_ppg.toFixed(1), color: "#2ec4b6" },
    { label: "BOOM%", value: boom_rate.toFixed(0) + "%", color: "#2ec4b6" },
    { label: "BUST%", value: bust_rate.toFixed(0) + "%", color: "#e63946" },
    { label: "RANK", value: `#${position_rank || "—"}`, color: posColor },
  ];
  const cardW = 105, cardH = 60, startX = 20, startY = 100;
  for (let i = 0; i < cardStats.length; i++) {
    const x = startX + i * (cardW + 10);
    ctx.fillStyle = t.bgCard;
    ctx.beginPath();
    ctx.roundRect(x, startY, cardW, cardH, 6);
    ctx.fill();
    ctx.strokeStyle = t.ink;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = cardStats[i].color;
    ctx.font = "bold 22px 'Luckiest Guy', cursive";
    ctx.textAlign = "center";
    ctx.fillText(cardStats[i].value, x + cardW / 2, startY + 28);
    ctx.fillStyle = t.inkMedium;
    ctx.font = "bold 10px 'Space Mono', monospace";
    ctx.fillText(cardStats[i].label, x + cardW / 2, startY + 50);
  }

  // Histogram in export
  const hPad = { top: 200, left: 60, right: 40, bottom: 60 };
  const hW = 800 - hPad.left - hPad.right;
  const hH = 300;
  const scores = (weekly_scores || []).map(w => w.score);
  if (!scores.length) return;
  const maxScore = Math.max(...scores, (boom_threshold || 20) + 5);
  const bucketSize = 5;
  const numBuckets = Math.ceil(maxScore / bucketSize) + 1;
  const buckets = new Array(numBuckets).fill(0);
  for (const s of scores) {
    const idx = Math.min(Math.floor(s / bucketSize), numBuckets - 1);
    buckets[idx]++;
  }
  const maxCount = Math.max(...buckets, 1);
  const barW = Math.floor(hW / numBuckets) - 2;

  // Grid lines
  for (let i = 0; i <= maxCount; i++) {
    const y = hPad.top + hH - (i / maxCount) * hH;
    ctx.strokeStyle = t.inkFaint;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(hPad.left, y);
    ctx.lineTo(800 - hPad.right, y);
    ctx.stroke();
    ctx.fillStyle = t.inkMedium;
    ctx.font = "11px 'Space Mono', monospace";
    ctx.textAlign = "right";
    ctx.fillText(i.toString(), hPad.left - 6, y + 4);
  }

  // Bars
  for (let i = 0; i < numBuckets; i++) {
    const x = hPad.left + i * (hW / numBuckets) + 1;
    const bH = (buckets[i] / maxCount) * hH;
    const y = hPad.top + hH - bH;
    const mid = (i + 0.5) * bucketSize;
    ctx.fillStyle = mid >= boom_threshold ? "#2ec4b6" :
                    (i + 1) * bucketSize <= bust_threshold ? "#e63946" : posColor;
    ctx.fillRect(x, y, barW, bH);
    ctx.strokeStyle = t.ink;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x, y, barW, bH);
    ctx.fillStyle = t.inkMedium;
    ctx.font = "10px 'Space Mono', monospace";
    ctx.textAlign = "center";
    ctx.fillText(`${i * bucketSize}`, x + barW / 2, hPad.top + hH + 16);
  }

  // Threshold lines
  const boomX = hPad.left + (boom_threshold / bucketSize) * (hW / numBuckets);
  ctx.strokeStyle = "#2ec4b6";
  ctx.lineWidth = 2;
  ctx.setLineDash([6, 4]);
  ctx.beginPath();
  ctx.moveTo(boomX, hPad.top);
  ctx.lineTo(boomX, hPad.top + hH);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = "#2ec4b6";
  ctx.font = "bold 11px 'Space Mono', monospace";
  ctx.textAlign = "left";
  ctx.fillText("BOOM", boomX + 4, hPad.top + 14);

  const bustX = hPad.left + (bust_threshold / bucketSize) * (hW / numBuckets);
  ctx.strokeStyle = "#e63946";
  ctx.lineWidth = 2;
  ctx.setLineDash([6, 4]);
  ctx.beginPath();
  ctx.moveTo(bustX, hPad.top);
  ctx.lineTo(bustX, hPad.top + hH);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = "#e63946";
  ctx.font = "bold 11px 'Space Mono', monospace";
  ctx.textAlign = "right";
  ctx.fillText("BUST", bustX - 4, hPad.top + 14);

  // Axis labels
  ctx.fillStyle = t.inkMedium;
  ctx.font = "12px 'Space Mono', monospace";
  ctx.textAlign = "center";
  ctx.fillText("Fantasy Points (PPR)", 400, hPad.top + hH + 40);

  // Range bar at bottom
  const rbY = hPad.top + hH + 55;
  const rbLeft = hPad.left;
  const rbRight = 800 - hPad.right;
  const rbW = rbRight - rbLeft;
  const rbMax = Math.max(ceiling_ppg * 1.2, 35);
  const rbToX = (v) => rbLeft + (v / rbMax) * rbW;

  const flX = rbToX(floor_ppg);
  const ceX = rbToX(ceiling_ppg);
  const mdX = rbToX(median_ppg);
  ctx.fillStyle = posColor + "40";
  ctx.fillRect(flX, rbY, ceX - flX, 18);
  ctx.strokeStyle = posColor;
  ctx.lineWidth = 2;
  ctx.strokeRect(flX, rbY, ceX - flX, 18);
  ctx.fillStyle = posColor;
  ctx.fillRect(mdX - 2, rbY - 4, 4, 26);

  ctx.font = "bold 10px 'Space Mono', monospace";
  ctx.textAlign = "center";
  ctx.fillStyle = "#e63946";
  ctx.fillText(`${floor_ppg.toFixed(1)} FLOOR`, flX, rbY - 6);
  ctx.fillStyle = posColor;
  ctx.fillText(`${median_ppg.toFixed(1)} MED`, mdX, rbY + 36);
  ctx.fillStyle = "#2ec4b6";
  ctx.fillText(`${ceiling_ppg.toFixed(1)} CEIL`, ceX, rbY - 6);

  // Watermark
  ctx.fillStyle = t.ink;
  ctx.globalAlpha = 0.4;
  ctx.font = "bold 14px 'Space Mono', monospace";
  ctx.textAlign = "right";
  ctx.fillText("razzle.lol", 780, 690);
  ctx.globalAlpha = 1;

  // Download
  const safeName = (player.full_name || "player").replace(/[^a-zA-Z0-9]/g, "-").toLowerCase();
  const link = document.createElement("a");
  link.download = `razzle-boombust-${safeName}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
}

// Keyboard hint strip (appended to toolbar area)
(function addKeyboardHint() {
  const toolbar = document.querySelector(".toolbar");
  if (!toolbar) return;
  const hint = document.createElement("div");
  hint.style.cssText = "font-family:var(--font-mono); font-size:10px; color:var(--ink-faint); padding:2px 0; white-space:nowrap;";
  hint.innerHTML = `<kbd style="font-size:10px; border:2px solid var(--ink-faint); border-radius:2px; padding:0 3px;">/</kbd> search &nbsp; <kbd style="font-size:10px; border:2px solid var(--ink-faint); border-radius:2px; padding:0 3px;">1-5</kbd> position &nbsp; <kbd style="font-size:10px; border:2px solid var(--ink-faint); border-radius:2px; padding:0 3px;">N</kbd> notes &nbsp; <kbd style="font-size:10px; border:2px solid var(--ink-faint); border-radius:2px; padding:0 3px;">?</kbd> shortcuts`;
  toolbar.appendChild(hint);
})();
