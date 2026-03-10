/* ===================================================================
   LAB PROSPECT ATHLETIC RADAR — Spider chart for prospect combine data
   Panel: proradar
   =================================================================== */
(function() {
  'use strict';

  var defs = window._labPanelDefs = window._labPanelDefs || [];
  var POS_COLORS = { QB: '#5b7fff', RB: '#2ec4b6', WR: '#d97757', TE: '#8b5cf6' };
  var CHART_COLORS = ['#d97757', '#5b7fff', '#2ec4b6', '#8b5cf6'];

  var METRICS = [
    { key: 'forty', label: '40-Yard', unit: 's', dir: 'lower', short: '40' },
    { key: 'bench', label: 'Bench Press', unit: 'reps', dir: 'higher', short: 'Bench' },
    { key: 'vertical', label: 'Vertical', unit: '"', dir: 'higher', short: 'Vert' },
    { key: 'broad_jump', label: 'Broad Jump', unit: '"', dir: 'higher', short: 'Broad' },
    { key: 'cone', label: '3-Cone', unit: 's', dir: 'lower', short: 'Cone' },
    { key: 'shuttle', label: 'Shuttle', unit: 's', dir: 'lower', short: 'Shuttle' }
  ];

  function escapeHtml(s) {
    if (!s) return '';
    var d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  // ─── Panel state ───────────────────────────────────────────────
  var panelState = {
    prospects: [],
    selected: [null, null],  // up to 2 prospects for comparison
    allProspects: [],
    posFilter: '',
    searchTerm: ''
  };

  // ─── Register panel ────────────────────────────────────────────
  defs.push({ name: 'proradar', render: function(el) {
    el.innerHTML = '<div class="lab-panel-loading"><div class="loading-msg">measuring wingspans...</div></div>';

    fetch('/api/prospect-scores?position=')
      .then(function(r) { if (!r.ok) throw new Error('API error'); return r.json(); })
      .then(function(data) {
        panelState.allProspects = data.prospects || [];
        panelState.prospects = panelState.allProspects;
        renderPanel(el);
      })
      .catch(function(err) {
        el.innerHTML = '<div class="lab-panel-loading"><div class="loading-msg" style="color:var(--red);">failed to load prospects: ' + escapeHtml(err.message) + '</div></div>';
      });
  }});

  // ─── Main render ───────────────────────────────────────────────
  function renderPanel(el) {
    var html = '<div class="pr-layout">';

    // ─── Controls bar ────────────────────────────────────────────
    html += '<div class="pr-controls">';
    html += '<div class="pr-search-wrap">';
    html += '<input type="text" class="pr-search" id="prSearch" placeholder="Search prospects..." value="' + escapeHtml(panelState.searchTerm) + '">';
    html += '</div>';
    html += '<div class="pr-pos-tabs">';
    html += '<button class="pr-pos-tab' + (!panelState.posFilter ? ' active' : '') + '" data-pos="">ALL</button>';
    ['QB', 'RB', 'WR', 'TE'].forEach(function(pos) {
      html += '<button class="pr-pos-tab' + (panelState.posFilter === pos ? ' active' : '') + '" data-pos="' + pos + '" style="border-color:' + POS_COLORS[pos] + ';">' + pos + '</button>';
    });
    html += '</div>';
    html += '</div>';

    // ─── Main content: chart + prospects ─────────────────────────
    html += '<div class="pr-main">';

    // Chart card
    html += '<div class="pr-chart-card" id="prChartCard">';
    if (panelState.selected[0]) {
      html += renderChartCard();
    } else {
      html += '<div class="pr-chart-empty">';
      html += '<div class="pr-chart-empty-text" style="font-family:var(--font-hand);font-size:20px;color:var(--ink-light);">click a prospect to see their athletic profile</div>';
      html += '</div>';
    }
    html += '</div>';

    // Prospect list
    html += '<div class="pr-list">';
    html += '<div class="pr-list-header">';
    html += '<span class="pr-list-title">Prospects</span>';
    html += '<span class="pr-list-count">' + getFilteredProspects().length + ' found</span>';
    html += '</div>';
    html += renderProspectList();
    html += '</div>';

    html += '</div>'; // pr-main
    html += '</div>'; // pr-layout

    el.innerHTML = html;
    bindEvents(el);
  }

  function getFilteredProspects() {
    var list = panelState.allProspects;
    if (panelState.posFilter) {
      list = list.filter(function(p) { return p.position === panelState.posFilter; });
    }
    if (panelState.searchTerm) {
      var term = panelState.searchTerm.toLowerCase();
      list = list.filter(function(p) {
        return (p.player_name || '').toLowerCase().indexOf(term) !== -1 ||
               (p.school || '').toLowerCase().indexOf(term) !== -1;
      });
    }
    return list;
  }

  function renderProspectList() {
    var list = getFilteredProspects();
    var html = '<div class="pr-list-rows">';

    list.slice(0, 40).forEach(function(p) {
      var posColor = POS_COLORS[p.position] || 'var(--ink)';
      var isSelected = (panelState.selected[0] && panelState.selected[0].player_name === p.player_name) ||
                       (panelState.selected[1] && panelState.selected[1].player_name === p.player_name);
      var selIdx = -1;
      if (panelState.selected[0] && panelState.selected[0].player_name === p.player_name) selIdx = 0;
      if (panelState.selected[1] && panelState.selected[1].player_name === p.player_name) selIdx = 1;

      html += '<div class="pr-prospect-row' + (isSelected ? ' pr-selected' : '') + '" data-name="' + escapeHtml(p.player_name) + '">';
      html += '<span class="pr-prospect-rank">' + p.rank + '</span>';
      html += '<span class="pr-prospect-pos" style="background:' + posColor + ';">' + p.position + '</span>';
      html += '<span class="pr-prospect-name">' + escapeHtml(p.player_name) + '</span>';
      html += '<span class="pr-prospect-school">' + escapeHtml(p.school || '') + '</span>';
      html += '<span class="pr-prospect-rps">' + (p.rps || 0).toFixed(1) + '</span>';
      if (selIdx >= 0) {
        html += '<span class="pr-sel-badge" style="background:' + CHART_COLORS[selIdx] + ';">' + (selIdx + 1) + '</span>';
      }
      html += '</div>';
    });

    if (!list.length) {
      html += '<div class="pr-no-results" style="font-family:var(--font-hand);color:var(--ink-light);padding:20px;text-align:center;">no prospects match your search</div>';
    }

    html += '</div>';
    return html;
  }

  // ─── Chart Card ────────────────────────────────────────────────
  function renderChartCard() {
    var p1 = panelState.selected[0];
    var p2 = panelState.selected[1];

    var html = '<div class="pr-chart-inner">';

    // Player tags
    html += '<div class="pr-chart-players">';
    if (p1) {
      html += '<div class="pr-player-tag" style="border-color:' + CHART_COLORS[0] + ';">';
      html += '<span class="pr-tag-dot" style="background:' + CHART_COLORS[0] + ';"></span>';
      html += '<span class="pr-tag-name">' + escapeHtml(p1.player_name) + '</span>';
      html += '<span class="pr-tag-pos" style="color:' + (POS_COLORS[p1.position] || 'var(--ink)') + ';">' + p1.position + '</span>';
      html += '<button class="pr-tag-remove" data-idx="0">\u00D7</button>';
      html += '</div>';
    }
    if (p2) {
      html += '<div class="pr-player-tag" style="border-color:' + CHART_COLORS[1] + ';">';
      html += '<span class="pr-tag-dot" style="background:' + CHART_COLORS[1] + ';"></span>';
      html += '<span class="pr-tag-name">' + escapeHtml(p2.player_name) + '</span>';
      html += '<span class="pr-tag-pos" style="color:' + (POS_COLORS[p2.position] || 'var(--ink)') + ';">' + p2.position + '</span>';
      html += '<button class="pr-tag-remove" data-idx="1">\u00D7</button>';
      html += '</div>';
    }
    if (!p2 && p1) {
      html += '<div class="pr-add-compare" style="font-family:var(--font-hand);color:var(--ink-light);font-size:14px;">click another prospect to compare</div>';
    }
    html += '</div>';

    // Canvas
    html += '<canvas id="prRadarCanvas" width="400" height="400" style="max-width:100%;"></canvas>';

    // Percentile bars
    html += '<div class="pr-pct-bars">';
    var players = [p1, p2].filter(Boolean);
    METRICS.forEach(function(m) {
      html += '<div class="pr-pct-row">';
      html += '<span class="pr-pct-label">' + m.short + '</span>';
      players.forEach(function(p, i) {
        var pct = (p.percentiles && p.percentiles[m.key]) || 0;
        var val = p[m.key];
        var valStr = val != null ? (m.dir === 'lower' ? val.toFixed(2) : Math.round(val)) : '-';
        var barColor = CHART_COLORS[i];
        var pctClass = pct >= 80 ? 'pr-pct-elite' : pct >= 60 ? 'pr-pct-good' : pct >= 40 ? 'pr-pct-avg' : 'pr-pct-below';
        html += '<div class="pr-pct-col">';
        html += '<div class="pr-pct-bar-wrap">';
        html += '<div class="pr-pct-bar" style="width:' + Math.max(2, pct) + '%;background:' + barColor + ';"></div>';
        html += '</div>';
        html += '<span class="pr-pct-val">' + valStr + m.unit + '</span>';
        html += '<span class="pr-pct-num ' + pctClass + '">' + Math.round(pct) + 'th</span>';
        html += '</div>';
      });
      html += '</div>';
    });
    html += '</div>';

    // Athletic grade
    if (p1) {
      html += '<div class="pr-grades">';
      players.forEach(function(p, i) {
        var avg = p.athletic_avg;
        var gradeText = 'N/A';
        var gradeColor = 'var(--ink-light)';
        if (avg != null) {
          if (avg >= 85) { gradeText = 'Elite'; gradeColor = '#d97757'; }
          else if (avg >= 70) { gradeText = 'Above Avg'; gradeColor = '#2ec4b6'; }
          else if (avg >= 50) { gradeText = 'Average'; gradeColor = '#5b7fff'; }
          else if (avg >= 30) { gradeText = 'Below Avg'; gradeColor = '#8b5cf6'; }
          else { gradeText = 'Poor'; gradeColor = '#e63946'; }
        }
        html += '<div class="pr-grade-card" style="border-color:' + CHART_COLORS[i] + ';">';
        html += '<div class="pr-grade-name">' + escapeHtml(p.player_name) + '</div>';
        html += '<div class="pr-grade-score" style="color:' + gradeColor + ';">' + (avg != null ? avg.toFixed(1) : '-') + '</div>';
        html += '<div class="pr-grade-label" style="color:' + gradeColor + ';">' + gradeText + ' Athlete</div>';
        html += '<div class="pr-grade-detail">' + escapeHtml(p.position) + ' \u2022 ' + escapeHtml(p.school || '') + ' \u2022 RPS ' + (p.rps || 0).toFixed(1) + '</div>';
        html += '</div>';
      });
      html += '</div>';
    }

    html += '</div>';
    return html;
  }

  // ─── Draw Radar Chart ──────────────────────────────────────────
  function drawRadar() {
    var canvas = document.getElementById('prRadarCanvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var dpr = window.devicePixelRatio || 1;

    // HiDPI canvas
    var cssW = 400, cssH = 400;
    canvas.width = cssW * dpr;
    canvas.height = cssH * dpr;
    canvas.style.width = cssW + 'px';
    canvas.style.height = cssH + 'px';
    ctx.scale(dpr, dpr);

    var cx = cssW / 2, cy = cssH / 2;
    var R = 150;
    var n = METRICS.length;
    var angleStep = (2 * Math.PI) / n;

    ctx.clearRect(0, 0, cssW, cssH);

    // Draw grid rings
    ctx.strokeStyle = '#c4b5a5';
    ctx.lineWidth = 1;
    for (var ring = 1; ring <= 4; ring++) {
      var r = (R * ring) / 4;
      ctx.beginPath();
      for (var i = 0; i <= n; i++) {
        var angle = (i % n) * angleStep - Math.PI / 2;
        var x = cx + r * Math.cos(angle);
        var y = cy + r * Math.sin(angle);
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.stroke();
    }

    // Draw axes and labels
    ctx.fillStyle = '#2d1f14';
    ctx.font = 'bold 12px "Space Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (var j = 0; j < n; j++) {
      var angle2 = j * angleStep - Math.PI / 2;
      var ax = cx + R * Math.cos(angle2);
      var ay = cy + R * Math.sin(angle2);

      // Axis line
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(ax, ay);
      ctx.strokeStyle = '#c4b5a5';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Label
      var lx = cx + (R + 28) * Math.cos(angle2);
      var ly = cy + (R + 28) * Math.sin(angle2);
      ctx.fillStyle = '#2d1f14';
      ctx.fillText(METRICS[j].short, lx, ly);
    }

    // Draw player polygons
    var players = [panelState.selected[0], panelState.selected[1]].filter(Boolean);
    players.forEach(function(p, pIdx) {
      var color = CHART_COLORS[pIdx];
      ctx.beginPath();
      for (var k = 0; k <= n; k++) {
        var ki = k % n;
        var angle3 = ki * angleStep - Math.PI / 2;
        var pct = (p.percentiles && p.percentiles[METRICS[ki].key]) || 0;
        var val = (pct / 100) * R;
        var px = cx + val * Math.cos(angle3);
        var py = cy + val * Math.sin(angle3);
        k === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      }
      ctx.closePath();

      // Fill
      ctx.globalAlpha = 0.15;
      ctx.fillStyle = color;
      ctx.fill();
      ctx.globalAlpha = 1;

      // Stroke
      ctx.strokeStyle = color;
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Dots
      for (var d = 0; d < n; d++) {
        var angle4 = d * angleStep - Math.PI / 2;
        var dpct = (p.percentiles && p.percentiles[METRICS[d].key]) || 0;
        var dval = (dpct / 100) * R;
        var dx = cx + dval * Math.cos(angle4);
        var dy = cy + dval * Math.sin(angle4);
        ctx.beginPath();
        ctx.arc(dx, dy, 4, 0, 2 * Math.PI);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    });
  }

  // ─── Event binding ─────────────────────────────────────────────
  function bindEvents(el) {
    // Search
    var searchInput = el.querySelector('#prSearch');
    if (searchInput) {
      searchInput.addEventListener('input', function() {
        panelState.searchTerm = this.value;
        var listEl = el.querySelector('.pr-list');
        if (listEl) {
          listEl.querySelector('.pr-list-rows').outerHTML = renderProspectList();
          listEl.querySelector('.pr-list-count').textContent = getFilteredProspects().length + ' found';
          bindRowClicks(el);
        }
      });
    }

    // Position tabs
    el.querySelectorAll('.pr-pos-tab').forEach(function(tab) {
      tab.addEventListener('click', function() {
        el.querySelectorAll('.pr-pos-tab').forEach(function(t) { t.classList.remove('active'); });
        tab.classList.add('active');
        panelState.posFilter = tab.dataset.pos;
        var listEl = el.querySelector('.pr-list');
        if (listEl) {
          listEl.querySelector('.pr-list-rows').outerHTML = renderProspectList();
          listEl.querySelector('.pr-list-count').textContent = getFilteredProspects().length + ' found';
          bindRowClicks(el);
        }
      });
    });

    // Row clicks
    bindRowClicks(el);

    // Remove tags
    el.querySelectorAll('.pr-tag-remove').forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        var idx = parseInt(btn.dataset.idx);
        panelState.selected[idx] = null;
        // Shift second to first if first removed
        if (idx === 0 && panelState.selected[1]) {
          panelState.selected[0] = panelState.selected[1];
          panelState.selected[1] = null;
        }
        updateChart(el);
      });
    });

    // Draw radar if we have a selection
    if (panelState.selected[0]) {
      setTimeout(drawRadar, 50);
    }
  }

  function bindRowClicks(el) {
    el.querySelectorAll('.pr-prospect-row').forEach(function(row) {
      row.addEventListener('click', function() {
        var name = row.dataset.name;
        var prospect = panelState.allProspects.find(function(p) { return p.player_name === name; });
        if (!prospect) return;

        // If this prospect is already selected, deselect
        if (panelState.selected[0] && panelState.selected[0].player_name === name) {
          panelState.selected[0] = panelState.selected[1];
          panelState.selected[1] = null;
        } else if (panelState.selected[1] && panelState.selected[1].player_name === name) {
          panelState.selected[1] = null;
        } else if (!panelState.selected[0]) {
          panelState.selected[0] = prospect;
        } else if (!panelState.selected[1]) {
          panelState.selected[1] = prospect;
        } else {
          // Both slots full — replace second
          panelState.selected[1] = prospect;
        }

        updateChart(el);
      });
    });
  }

  function updateChart(el) {
    // Re-render chart card
    var chartCard = el.querySelector('#prChartCard');
    if (chartCard) {
      if (panelState.selected[0]) {
        chartCard.innerHTML = renderChartCard();
      } else {
        chartCard.innerHTML = '<div class="pr-chart-empty"><div class="pr-chart-empty-text" style="font-family:var(--font-hand);font-size:20px;color:var(--ink-light);">click a prospect to see their athletic profile</div></div>';
      }
    }

    // Re-render list (to update selection indicators)
    var listEl = el.querySelector('.pr-list');
    if (listEl) {
      listEl.querySelector('.pr-list-rows').outerHTML = renderProspectList();
      bindRowClicks(el);
    }

    // Bind remove buttons
    el.querySelectorAll('.pr-tag-remove').forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        var idx = parseInt(btn.dataset.idx);
        panelState.selected[idx] = null;
        if (idx === 0 && panelState.selected[1]) {
          panelState.selected[0] = panelState.selected[1];
          panelState.selected[1] = null;
        }
        updateChart(el);
      });
    });

    // Draw radar
    if (panelState.selected[0]) {
      setTimeout(drawRadar, 50);
    }
  }

})();
