/* ====================================================================
   Inline Sticky Notes — shared across pokemon-lab v1..v5
   API:
     PokeNotes.init(versionId)
   Storage:
     localStorage key "razzle_pokemon_lab_notes" (all versions, one JSON)
   Toggle mode: button pinned top-left. When active, click anywhere to
     drop a sticky note at that x,y. Notes are draggable, editable,
     deletable per-version. Index page exports all to markdown.
   ==================================================================== */
(function(global) {
  var STORAGE_KEY = 'razzle_pokemon_lab_notes';
  var state = { version: null, mode: false, notes: [] };

  function loadAll() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); }
    catch (e) { return {}; }
  }
  function saveAll(all) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  }
  function loadForVersion(v) {
    var all = loadAll();
    return Array.isArray(all[v]) ? all[v] : [];
  }
  function saveForVersion(v, notes) {
    var all = loadAll();
    all[v] = notes;
    saveAll(all);
  }

  function uid() { return 'n_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 6); }

  function renderNote(note) {
    var el = document.createElement('div');
    el.className = 'pl-sticky-note';
    el.setAttribute('data-note-id', note.id);
    el.style.left = note.x + 'px';
    el.style.top = note.y + 'px';
    el.innerHTML =
      '<div class="pl-sticky-grip" title="Drag to move">&#8942;&#8942;</div>' +
      '<textarea class="pl-sticky-text" placeholder="your note…" maxlength="400">' +
      escapeHTML(note.text || '') +
      '</textarea>' +
      '<div class="pl-sticky-actions">' +
      '  <span class="pl-sticky-time">' + formatTime(note.ts) + '</span>' +
      '  <button type="button" class="pl-sticky-del" aria-label="Delete note">&times;</button>' +
      '</div>';

    var textarea = el.querySelector('.pl-sticky-text');
    textarea.addEventListener('input', function() {
      note.text = textarea.value;
      persist();
    });
    textarea.addEventListener('click', function(e) { e.stopPropagation(); });

    el.querySelector('.pl-sticky-del').addEventListener('click', function(e) {
      e.stopPropagation();
      state.notes = state.notes.filter(function(n) { return n.id !== note.id; });
      persist();
      el.remove();
    });

    var grip = el.querySelector('.pl-sticky-grip');
    grip.addEventListener('mousedown', dragStart);
    grip.addEventListener('touchstart', dragStart, { passive: false });

    function dragStart(e) {
      e.preventDefault();
      e.stopPropagation();
      var startX = (e.touches ? e.touches[0].clientX : e.clientX) - note.x;
      var startY = (e.touches ? e.touches[0].clientY : e.clientY) - note.y;
      function move(ev) {
        ev.preventDefault();
        var cx = ev.touches ? ev.touches[0].clientX : ev.clientX;
        var cy = ev.touches ? ev.touches[0].clientY : ev.clientY;
        note.x = Math.max(0, cx - startX);
        note.y = Math.max(0, cy - startY);
        el.style.left = note.x + 'px';
        el.style.top = note.y + 'px';
      }
      function end() {
        document.removeEventListener('mousemove', move);
        document.removeEventListener('mouseup', end);
        document.removeEventListener('touchmove', move);
        document.removeEventListener('touchend', end);
        persist();
      }
      document.addEventListener('mousemove', move);
      document.addEventListener('mouseup', end);
      document.addEventListener('touchmove', move, { passive: false });
      document.addEventListener('touchend', end);
    }

    return el;
  }

  function escapeHTML(s) {
    return String(s || '').replace(/[&<>"']/g, function(c) {
      return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c];
    });
  }

  function formatTime(ts) {
    try {
      var d = new Date(ts);
      return d.toLocaleString([], { month:'short', day:'numeric', hour:'numeric', minute:'2-digit' });
    } catch (e) { return ''; }
  }

  function persist() { saveForVersion(state.version, state.notes); }

  function renderAll() {
    var layer = document.getElementById('pl-notes-layer');
    if (!layer) return;
    layer.innerHTML = '';
    state.notes.forEach(function(n) { layer.appendChild(renderNote(n)); });
  }

  function dropNote(x, y) {
    var note = { id: uid(), x: x, y: y, text: '', ts: Date.now() };
    state.notes.push(note);
    persist();
    var layer = document.getElementById('pl-notes-layer');
    if (layer) {
      var el = renderNote(note);
      layer.appendChild(el);
      var ta = el.querySelector('.pl-sticky-text');
      if (ta) setTimeout(function() { ta.focus(); }, 0);
    }
  }

  function setMode(on) {
    state.mode = on;
    document.body.classList.toggle('pl-notes-active', on);
    var btn = document.getElementById('pl-notes-toggle');
    if (btn) {
      btn.textContent = on ? '✎ drop note (esc to stop)' : '✎ notes';
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    }
  }

  function pageClick(e) {
    if (!state.mode) return;
    if (e.target.closest('.pl-sticky-note')) return;
    if (e.target.closest('.pl-notes-toggle')) return;
    if (e.target.closest('.pl-notes-clear')) return;
    dropNote(e.clientX, e.clientY);
  }

  function init(versionId) {
    state.version = versionId;
    state.notes = loadForVersion(versionId);

    if (!document.getElementById('pl-notes-layer')) {
      var layer = document.createElement('div');
      layer.id = 'pl-notes-layer';
      layer.className = 'pl-notes-layer';
      document.body.appendChild(layer);
    }

    if (!document.getElementById('pl-notes-toolbar')) {
      var bar = document.createElement('div');
      bar.id = 'pl-notes-toolbar';
      bar.className = 'pl-notes-toolbar';
      bar.innerHTML =
        '<button type="button" id="pl-notes-toggle" class="pl-notes-toggle" aria-pressed="false">✎ notes</button>' +
        '<button type="button" id="pl-notes-clear" class="pl-notes-clear" title="Clear all notes on this version">clear</button>' +
        '<a href="index.html" class="pl-notes-index" title="Back to index">← index</a>';
      document.body.appendChild(bar);

      document.getElementById('pl-notes-toggle').addEventListener('click', function(e) {
        e.stopPropagation();
        setMode(!state.mode);
      });
      document.getElementById('pl-notes-clear').addEventListener('click', function(e) {
        e.stopPropagation();
        if (!state.notes.length) return;
        if (!confirm('Clear all ' + state.notes.length + ' notes on this version?')) return;
        state.notes = [];
        persist();
        renderAll();
      });
    }

    document.addEventListener('click', pageClick);
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && state.mode) setMode(false);
    });

    renderAll();
  }

  function exportAllMarkdown() {
    var all = loadAll();
    var lines = ['# Pokemon Lab — Situation Room Notes', '', '_Exported ' + new Date().toLocaleString() + '_', ''];
    var versions = ['v1-emerald', 'v2-firered', 'v3-crystal', 'v4-stadium', 'v5-hybrid'];
    versions.forEach(function(v) {
      var arr = Array.isArray(all[v]) ? all[v] : [];
      lines.push('## ' + v);
      if (!arr.length) { lines.push('', '_(no notes)_', ''); return; }
      arr.forEach(function(n, i) {
        lines.push('');
        lines.push('**Note ' + (i + 1) + '** — ' + formatTime(n.ts) + ' (at ' + Math.round(n.x) + ', ' + Math.round(n.y) + ')');
        lines.push('');
        lines.push(n.text ? '> ' + n.text.replace(/\n/g, '\n> ') : '> _(empty)_');
      });
      lines.push('');
    });
    return lines.join('\n');
  }

  function exportDownload() {
    var md = exportAllMarkdown();
    var blob = new Blob([md], { type: 'text/markdown' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'pokemon-lab-notes-' + new Date().toISOString().slice(0, 10) + '.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function() { URL.revokeObjectURL(url); }, 1000);
  }

  function countAll() {
    var all = loadAll();
    var total = 0;
    var versions = ['v1-emerald', 'v2-firered', 'v3-crystal', 'v4-stadium', 'v5-hybrid'];
    var per = {};
    versions.forEach(function(v) {
      var arr = Array.isArray(all[v]) ? all[v] : [];
      per[v] = arr.length;
      total += arr.length;
    });
    return { total: total, per: per };
  }

  global.PokeNotes = {
    init: init,
    exportMarkdown: exportAllMarkdown,
    exportDownload: exportDownload,
    countAll: countAll
  };
})(window);
