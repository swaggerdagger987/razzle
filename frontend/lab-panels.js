/* ===================================================================
   LAB PANELS JS — Rankings & Values (7 native panel render functions)
   Each function is stored on window._labPanelDefs for consumption
   by the panel registry in lab.html's inline script.
   =================================================================== */
(function() {
  'use strict';

  var defs = window._labPanelDefs = window._labPanelDefs || [];

  function fmt(v, dec) {
    if (v === null || v === undefined) return '-';
    return Number(v).toFixed(dec === undefined ? 1 : dec);
  }

  var POS_COLORS = { QB: '#5b7fff', RB: '#2ec4b6', WR: '#d97757', TE: '#8b5cf6' };

  // ─── 1. DYNASTY RANKINGS ──────────────────────────────────────
  defs.push({ name: 'rankings', render: function(el) {
    var state = { position: '', data: null };

    el.innerHTML =
      '<div class="lp-page">' +
        '<div class="lp-header"><h2>Dynasty Rankings</h2>' +
        '<div class="lp-subtitle">who\'s worth the most in your league</div>' +
        '<div class="lp-meta">ranked by DVS (Dynasty Value Score) — production x age curve</div></div>' +
        '<div class="rankings-filters" id="lp-rankings-filters">' +
          '<button class="rankings-filter-btn active" data-pos="">All</button>' +
          '<button class="rankings-filter-btn pos-qb" data-pos="QB">QB</button>' +
          '<button class="rankings-filter-btn pos-rb" data-pos="RB">RB</button>' +
          '<button class="rankings-filter-btn pos-wr" data-pos="WR">WR</button>' +
          '<button class="rankings-filter-btn pos-te" data-pos="TE">TE</button>' +
        '</div>' +
        '<div id="lp-rankings-content"><div class="lp-loading">pulling film on dynasty values...</div></div>' +
      '</div>';

    function loadRankings(pos) {
      state.position = pos || '';
      var content = el.querySelector('#lp-rankings-content');
      content.innerHTML = '<div class="lp-loading">pulling film on dynasty values...</div>';

      var url = '/api/dynasty-rankings?limit=200';
      if (pos) url += '&position=' + encodeURIComponent(pos);

      fetch(url).then(function(r) {
        if (!r.ok) throw new Error('API error');
        return r.json();
      }).then(function(data) {
        state.data = data;
        renderTiers(data.tiers || [], content);
      }).catch(function() {
        content.innerHTML = '<div class="lp-error">could not load rankings</div>';
      });
    }

    function renderTiers(tiers, content) {
      if (!tiers.length) {
        content.innerHTML = '<div class="lp-empty">no ranked players found</div>';
        return;
      }
      var html = '';
      var rank = 1;
      for (var i = 0; i < tiers.length; i++) {
        var tier = tiers[i];
        html += '<div class="rankings-tier tier-' + tier.tier + '">';
        html += '<div class="rankings-tier-header">';
        html += '<div class="rankings-tier-badge">Tier ' + tier.tier + '</div>';
        html += '<div class="rankings-tier-label">' + escapeHtml(tier.label) + '</div>';
        html += '<div class="rankings-tier-count">' + tier.players.length + ' players</div>';
        html += '</div><div class="rankings-grid">';
        for (var j = 0; j < tier.players.length; j++) {
          var p = tier.players[j];
          var posLc = (p.position || '').toLowerCase();
          var ageCls = !p.age ? '' : p.age <= 25 ? 'young' : p.age <= 28 ? 'prime' : 'aging';
          html += '<div class="rankings-card" data-pid="' + escapeAttr(p.player_id) + '">';
          html += '<div class="rankings-rank">#' + rank + '</div>';
          html += playerHeadshot(p, p.position);
          html += '<div class="rankings-info">';
          html += '<div class="rankings-name">' + escapeHtml(p.full_name) + '</div>';
          html += '<div class="rankings-meta">';
          html += '<span class="rankings-pos-badge ' + posLc + '">' + escapeHtml(p.position) + '</span>';
          html += '<span class="rankings-team">' + escapeHtml(p.team) + '</span>';
          if (p.age) html += '<span class="rankings-age ' + ageCls + '">Age ' + p.age + '</span>';
          html += '</div></div>';
          html += '<div class="rankings-scores">';
          html += '<div class="rankings-value">' + fmt(p.dynasty_value) + ' <span style="font-size:10px;font-weight:400;color:var(--ink-light)">DVS</span></div>';
          html += '<div class="rankings-ppg">' + fmt(p.ppg) + ' ppg</div>';
          html += '</div></div>';
          rank++;
        }
        html += '</div></div>';
      }
      content.innerHTML = html;
      content.querySelectorAll('.rankings-card').forEach(function(card) {
        card.addEventListener('click', function() {
          var pid = this.getAttribute('data-pid');
          if (pid) window.location.href = '/player/' + encodeURIComponent(pid);
        });
      });
    }

    el.querySelector('#lp-rankings-filters').addEventListener('click', function(e) {
      var btn = e.target.closest('.rankings-filter-btn');
      if (!btn) return;
      el.querySelectorAll('.rankings-filter-btn').forEach(function(b) { b.classList.remove('active'); });
      btn.classList.add('active');
      loadRankings(btn.getAttribute('data-pos'));
    });

    loadRankings('');
  }});

  // ─── 2. TIERS ─────────────────────────────────────────────────
  defs.push({ name: 'tiers', render: function(el) {
    var state = { season: 0, position: '' };

    el.innerHTML =
      '<div class="lp-page">' +
        '<div class="lp-header"><h2>Dynasty Tier List</h2>' +
        '<div class="lp-subtitle">who\'s untouchable and who\'s getting cut</div>' +
        '<div class="lp-meta" id="lp-tl-meta"></div></div>' +
        '<div class="lp-controls">' +
          '<select class="lp-select" id="lp-tl-season"></select>' +
          '<div class="lp-pos-tabs" id="lp-tl-pos">' +
            '<button class="lp-pos-tab active" data-pos="">All</button>' +
            '<button class="lp-pos-tab" data-pos="QB">QB</button>' +
            '<button class="lp-pos-tab" data-pos="RB">RB</button>' +
            '<button class="lp-pos-tab" data-pos="WR">WR</button>' +
            '<button class="lp-pos-tab" data-pos="TE">TE</button>' +
          '</div>' +
        '</div>' +
        '<div id="lp-tl-tiers"><div class="lp-loading">pulling film...</div></div>' +
      '</div>';

    var seasonSel = el.querySelector('#lp-tl-season');
    var seasonsLoaded = false;

    function fetchTiers() {
      var tiersEl = el.querySelector('#lp-tl-tiers');
      tiersEl.innerHTML = '<div class="lp-loading">pulling film...</div>';
      var params = [];
      if (state.season > 0) params.push('season=' + state.season);
      if (state.position) params.push('position=' + state.position);
      var url = '/api/tier-list' + (params.length ? '?' + params.join('&') : '');

      fetch(url).then(function(r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      }).then(function(data) {
        if (!seasonsLoaded && data.available_seasons) {
          seasonsLoaded = true;
          seasonSel.innerHTML = '';
          data.available_seasons.forEach(function(s) {
            var opt = document.createElement('option');
            opt.value = s; opt.textContent = s;
            if (s === data.season) opt.selected = true;
            seasonSel.appendChild(opt);
          });
        }
        el.querySelector('#lp-tl-meta').textContent = data.season + ' season \u00b7 ' + data.total_players + ' players';
        renderTiers(data.tiers || [], tiersEl);
      }).catch(function(err) {
        tiersEl.innerHTML = '<div class="lp-error">failed to load tier list</div>';
      });
    }

    function renderTiers(tiers, container) {
      var html = '';
      tiers.forEach(function(tier) {
        html += '<div class="tl-tier">';
        html += '<div class="tl-tier-label ' + escapeHtml(tier.tier) + '">';
        html += '<div class="tl-tier-letter">' + escapeHtml(tier.tier) + '</div>';
        html += '<div class="tl-tier-count">' + tier.players.length + '</div>';
        html += '<div class="tl-tier-desc">' + escapeHtml(tier.label || '') + '</div>';
        html += '</div><div class="tl-tier-players">';
        if (!tier.players.length) {
          html += '<span class="tl-empty-tier">no players in this tier</span>';
        } else {
          tier.players.forEach(function(p) {
            html += '<div class="tl-player-chip">';
            html += '<span class="tl-chip-pos ' + escapeHtml(p.position) + '">' + escapeHtml(p.position) + '</span>';
            html += '<span class="tl-chip-name">' + escapeHtml(p.full_name) + '</span>';
            html += '<span class="tl-chip-tv">' + escapeHtml(String(p.trade_value)) + '</span>';
            html += '</div>';
          });
        }
        html += '</div></div>';
      });
      container.innerHTML = html;
    }

    seasonSel.addEventListener('change', function() {
      state.season = parseInt(this.value, 10) || 0;
      fetchTiers();
    });
    el.querySelector('#lp-tl-pos').addEventListener('click', function(e) {
      var tab = e.target.closest('.lp-pos-tab');
      if (!tab) return;
      el.querySelectorAll('#lp-tl-pos .lp-pos-tab').forEach(function(t) { t.classList.remove('active'); });
      tab.classList.add('active');
      state.position = tab.getAttribute('data-pos');
      fetchTiers();
    });

    fetchTiers();
  }});

  // ─── 3. TRADE VALUES ──────────────────────────────────────────
  defs.push({ name: 'tradevalues', render: function(el) {
    var currentPosition = '';
    var currentData = null;
    var searchQuery = '';
    var seasonsLoaded = false;

    var TIER_LABELS = {
      1: 'Elite', 2: 'Blue Chip', 3: 'Premium', 4: 'Solid',
      5: 'Promising', 6: 'Depth', 7: 'Roster Clogger', 8: 'Cut Bait'
    };

    el.innerHTML =
      '<div class="lp-page">' +
        '<div class="lp-header"><h2>Dynasty Trade Value Chart</h2>' +
        '<div class="lp-subtitle">every player\'s dynasty worth at a glance</div></div>' +
        '<div class="lp-controls">' +
          '<div class="lp-pos-tabs" id="lp-tv-pos">' +
            '<button class="lp-pos-tab active" data-pos="">All</button>' +
            '<button class="lp-pos-tab" data-pos="QB">QB</button>' +
            '<button class="lp-pos-tab" data-pos="RB">RB</button>' +
            '<button class="lp-pos-tab" data-pos="WR">WR</button>' +
            '<button class="lp-pos-tab" data-pos="TE">TE</button>' +
          '</div>' +
          '<select class="lp-select" id="lp-tv-season"></select>' +
          '<input class="lp-search" type="text" id="lp-tv-search" placeholder="search player...">' +
        '</div>' +
        '<div class="tv-methodology">' +
          '<div class="tv-method-chip"><span class="method-label">Production:</span> 50%</div>' +
          '<div class="tv-method-chip"><span class="method-label">Age Curve:</span> 30%</div>' +
          '<div class="tv-method-chip"><span class="method-label">Pos Scarcity:</span> 20%</div>' +
        '</div>' +
        '<div id="lp-tv-body"><div class="lp-loading">calculating trade values...</div></div>' +
      '</div>';

    var seasonSel = el.querySelector('#lp-tv-season');

    function filterBySearch(players) {
      if (!searchQuery) return players;
      var q = searchQuery.toLowerCase();
      return players.filter(function(p) {
        return (p.full_name || '').toLowerCase().indexOf(q) !== -1 ||
               (p.team || '').toLowerCase().indexOf(q) !== -1;
      });
    }

    function buildPlayerRow(p) {
      var pos = (p.position || 'RB').toLowerCase();
      var pct = Math.max(0, Math.min(100, p.trade_value));
      var rankClass = p.rank === 1 ? ' top1' : p.rank === 2 ? ' top2' : p.rank === 3 ? ' top3' : '';

      var html = '<div class="tv-row" data-pid="' + escapeAttr(p.player_id) + '">';
      html += '<div class="tv-rank' + rankClass + '">' + escapeHtml(String(p.rank)) + '</div>';
      if (p.headshot_url) {
        html += '<img class="tv-headshot" src="' + escapeAttr(p.headshot_url) + '" alt="" loading="lazy" onerror="this.style.display=\'none\'">';
      } else {
        html += '<div class="tv-headshot"></div>';
      }
      html += '<div class="tv-player-info">';
      html += '<div class="tv-player-name">' + escapeHtml(p.full_name) + '</div>';
      html += '<div class="tv-player-meta">';
      html += '<span class="tv-pos-badge ' + pos + '">' + escapeHtml(p.position) + '</span>';
      html += '<span class="tv-team-label">' + escapeHtml(p.team) + '</span>';
      if (p.age) html += '<span class="tv-age">age ' + p.age + '</span>';
      html += '</div></div>';
      html += '<div class="tv-bar-area"><div class="tv-bar-track"><div class="tv-bar-fill ' + pos + '" style="width:' + pct + '%"></div></div>';
      html += '<div class="tv-value">' + fmt(p.trade_value) + '</div></div>';
      html += '<div class="tv-stats">';
      html += '<div class="tv-stat"><div>' + fmt(p.ppg) + '</div><div class="tv-stat-label">PPG</div></div>';
      html += '<div class="tv-stat"><div>' + (p.games || '-') + '</div><div class="tv-stat-label">GP</div></div>';
      html += '</div>';
      html += '<span class="tv-tier-badge t' + p.tier + '">' + escapeHtml(p.tier_label) + '</span>';
      html += '</div>';
      return html;
    }

    function render(data) {
      currentData = data;
      var body = el.querySelector('#lp-tv-body');
      var players = filterBySearch(data.players || []);

      if (!players.length) {
        body.innerHTML = '<div class="lp-empty">' + (searchQuery ? 'no players match "' + escapeHtml(searchQuery) + '"' : 'no trade value data found') + '</div>';
        return;
      }

      var tierGroups = {};
      players.forEach(function(p) {
        var t = p.tier;
        if (!tierGroups[t]) tierGroups[t] = [];
        tierGroups[t].push(p);
      });

      var html = '<div class="tv-chart-wrap">';
      Object.keys(tierGroups).map(Number).sort(function(a, b) { return a - b; }).forEach(function(t) {
        var group = tierGroups[t];
        var label = TIER_LABELS[t] || 'Tier ' + t;
        html += '<div class="tv-tier-header">';
        html += '<span class="tv-tier-num t' + t + '">' + t + '</span>';
        html += escapeHtml(label);
        html += '<span class="tv-tier-label">tier ' + t + ' of 8</span>';
        html += '<span class="tv-tier-count">' + group.length + ' player' + (group.length !== 1 ? 's' : '') + '</span>';
        html += '</div>';
        group.forEach(function(p) { html += buildPlayerRow(p); });
      });
      html += '</div>';
      body.innerHTML = html;

      body.querySelectorAll('.tv-row[data-pid]').forEach(function(row) {
        row.addEventListener('click', function() {
          var pid = row.getAttribute('data-pid');
          if (pid) window.location.href = '/player/' + encodeURIComponent(pid);
        });
      });
    }

    function loadData() {
      var body = el.querySelector('#lp-tv-body');
      body.innerHTML = '<div class="lp-loading">calculating trade values...</div>';
      var season = seasonSel.value || '';
      var url = '/api/trade-value-chart?limit=150';
      if (season) url += '&season=' + season;
      if (currentPosition) url += '&position=' + currentPosition;

      fetch(url).then(function(r) {
        if (!r.ok) throw new Error('API error');
        return r.json();
      }).then(function(data) {
        if (!seasonsLoaded && data.available_seasons) {
          seasonsLoaded = true;
          seasonSel.innerHTML = '';
          data.available_seasons.forEach(function(s) {
            var opt = document.createElement('option');
            opt.value = s; opt.textContent = s;
            seasonSel.appendChild(opt);
          });
          seasonSel.value = data.season;
        }
        render(data);
      }).catch(function() {
        body.innerHTML = '<div class="lp-error">failed to load trade value data</div>';
      });
    }

    el.querySelector('#lp-tv-pos').addEventListener('click', function(e) {
      var tab = e.target.closest('.lp-pos-tab');
      if (!tab) return;
      el.querySelectorAll('#lp-tv-pos .lp-pos-tab').forEach(function(t) { t.classList.remove('active'); });
      tab.classList.add('active');
      currentPosition = tab.getAttribute('data-pos') || '';
      loadData();
    });
    seasonSel.addEventListener('change', function() { loadData(); });

    var searchTimer;
    el.querySelector('#lp-tv-search').addEventListener('input', function() {
      clearTimeout(searchTimer);
      var self = this;
      searchTimer = setTimeout(function() {
        searchQuery = self.value.trim();
        if (currentData) render(currentData);
      }, 200);
    });

    loadData();
  }});

  // ─── 4. VORP ──────────────────────────────────────────────────
  defs.push({ name: 'vorp', render: function(el) {
    var currentPosition = '';
    var currentData = null;
    var seasonsLoaded = false;
    var sortState = {
      league_winners: { col: 'vorp', dir: -1 },
      replacement_level: { col: 'vorp', dir: 1 }
    };

    el.innerHTML =
      '<div class="lp-page">' +
        '<div class="lp-header"><h2>Value Over Replacement</h2>' +
        '<div class="lp-subtitle">who actually moves the needle vs. who you can find on waivers</div></div>' +
        '<div class="lp-controls">' +
          '<div class="lp-pos-tabs" id="lp-vorp-pos">' +
            '<button class="lp-pos-tab active" data-pos="">All</button>' +
            '<button class="lp-pos-tab" data-pos="QB">QB</button>' +
            '<button class="lp-pos-tab" data-pos="RB">RB</button>' +
            '<button class="lp-pos-tab" data-pos="WR">WR</button>' +
            '<button class="lp-pos-tab" data-pos="TE">TE</button>' +
          '</div>' +
          '<select class="lp-select" id="lp-vorp-season"></select>' +
        '</div>' +
        '<div class="vorp-thresholds" id="lp-vorp-thresholds"></div>' +
        '<div id="lp-vorp-body"><div class="lp-loading">calculating replacement value...</div></div>' +
      '</div>';

    var seasonSel = el.querySelector('#lp-vorp-season');

    function vorpTier(v) {
      if (v >= 6) return 'elite';
      if (v >= 3) return 'starter';
      if (v >= 1) return 'flex';
      if (v >= 0) return 'fringe';
      return 'replacement';
    }

    function sortPlayers(players, col, dir) {
      return players.slice().sort(function(a, b) {
        var va = a[col], vb = b[col];
        if (va == null) va = -Infinity;
        if (vb == null) vb = -Infinity;
        if (typeof va === 'string') return dir * va.localeCompare(vb);
        return dir * (vb - va);
      });
    }

    function buildTable(players, section) {
      if (!players || !players.length) return '<div class="lp-empty">no data</div>';

      var isW = section === 'league_winners';
      var title = isW ? 'League Winners' : 'Replacement Level';
      var subtitle = isW ? 'highest value above replacement' : 'near or below replacement level';
      var hdrCls = isW ? 'winners' : 'replacement';
      var st = sortState[section];
      var sorted = sortPlayers(players, st.col, st.dir);

      var html = '<div class="vorp-section">';
      html += '<div class="vorp-section-header ' + hdrCls + '">' + title;
      html += ' <span style="font-family:var(--font-hand);font-size:16px;color:var(--ink-light);font-weight:400">(' + players.length + ') — ' + subtitle + '</span></div>';
      html += '<table class="vorp-table" data-section="' + section + '"><thead><tr>';

      var cols = [
        { key: 'full_name', label: 'Player' },
        { key: 'vorp', label: 'VORP' },
        { key: 'ppg', label: 'PPG' },
        { key: 'replacement_ppg', label: 'Repl PPG' },
        { key: 'pos_rank', label: 'Pos Rk' }
      ];

      cols.forEach(function(col) {
        var cls = col.key !== 'full_name' ? 'center' : '';
        var sorted = st.col === col.key;
        if (sorted) cls += ' sorted';
        var arrow = sorted ? (st.dir === 1 ? ' &#9650;' : ' &#9660;') : '';
        html += '<th class="' + cls + '" data-sort="' + col.key + '" data-section="' + section + '">' + col.label + '<span class="sort-arrow">' + arrow + '</span></th>';
      });
      html += '</tr></thead><tbody>';

      sorted.forEach(function(p) {
        var pos = (p.position || 'RB').toLowerCase();
        var tier = vorpTier(p.vorp);
        var sign = p.vorp > 0 ? '+' : '';
        html += '<tr data-pid="' + escapeAttr(p.player_id) + '">';
        html += '<td><div class="vorp-player-cell">';
        if (p.headshot_url) html += '<img class="vorp-headshot" src="' + escapeAttr(p.headshot_url) + '" alt="" loading="lazy" onerror="this.style.display=\'none\'">';
        html += '<div class="vorp-player-info"><div class="vorp-player-name">' + escapeHtml(p.full_name) + '</div>';
        html += '<div class="vorp-player-meta"><span class="vorp-pos-badge ' + pos + '">' + escapeHtml(p.position) + '</span>';
        html += '<span class="vorp-team-label">' + escapeHtml(p.team) + '</span></div></div></div></td>';
        html += '<td class="center"><span class="vorp-badge ' + tier + '">' + sign + fmt(p.vorp, 2) + '</span></td>';
        html += '<td class="center" style="font-weight:700">' + fmt(p.ppg) + '</td>';
        html += '<td class="center" style="color:var(--ink-medium)">' + fmt(p.replacement_ppg) + '</td>';
        html += '<td class="center">' + (p.pos_rank || '-') + '</td>';
        html += '</tr>';
      });
      html += '</tbody></table></div>';
      return html;
    }

    function renderVorp(data) {
      currentData = data;
      var body = el.querySelector('#lp-vorp-body');
      var thresholds = data.replacement_thresholds || {};
      var thRow = el.querySelector('#lp-vorp-thresholds');
      var labels = { QB: 'QB12', RB: 'RB24', WR: 'WR36', TE: 'TE12' };
      var thtml = '';
      ['QB', 'RB', 'WR', 'TE'].forEach(function(pos) {
        if (thresholds[pos] !== undefined) {
          thtml += '<div class="vorp-threshold-chip"><span class="pos-label">' + labels[pos] + ':</span>' + fmt(thresholds[pos]) + ' PPG</div>';
        }
      });
      thRow.innerHTML = thtml;

      if (!data.league_winners.length && !data.replacement_level.length) {
        body.innerHTML = '<div class="lp-empty">no VORP data found</div>';
        return;
      }

      body.innerHTML = buildTable(data.league_winners, 'league_winners') + buildTable(data.replacement_level, 'replacement_level');

      body.querySelectorAll('th[data-sort]').forEach(function(th) {
        th.addEventListener('click', function() {
          var col = th.getAttribute('data-sort');
          var sec = th.getAttribute('data-section');
          if (sortState[sec].col === col) sortState[sec].dir *= -1;
          else { sortState[sec].col = col; sortState[sec].dir = -1; }
          renderVorp(currentData);
        });
      });
      body.querySelectorAll('tr[data-pid]').forEach(function(tr) {
        tr.addEventListener('click', function() {
          var pid = tr.getAttribute('data-pid');
          if (pid) window.location.href = '/player/' + encodeURIComponent(pid);
        });
      });
    }

    function loadData() {
      var body = el.querySelector('#lp-vorp-body');
      body.innerHTML = '<div class="lp-loading">calculating replacement value...</div>';
      var season = seasonSel.value || '';
      var url = '/api/vorp?limit=30';
      if (season) url += '&season=' + season;
      if (currentPosition) url += '&position=' + currentPosition;

      fetch(url).then(function(r) {
        if (!r.ok) throw new Error('API error');
        return r.json();
      }).then(function(data) {
        if (!seasonsLoaded && data.available_seasons) {
          seasonsLoaded = true;
          seasonSel.innerHTML = '';
          data.available_seasons.forEach(function(s) {
            var opt = document.createElement('option');
            opt.value = s; opt.textContent = s;
            seasonSel.appendChild(opt);
          });
          seasonSel.value = data.season;
        }
        renderVorp(data);
      }).catch(function() {
        body.innerHTML = '<div class="lp-error">failed to load VORP data</div>';
      });
    }

    el.querySelector('#lp-vorp-pos').addEventListener('click', function(e) {
      var tab = e.target.closest('.lp-pos-tab');
      if (!tab) return;
      el.querySelectorAll('#lp-vorp-pos .lp-pos-tab').forEach(function(t) { t.classList.remove('active'); });
      tab.classList.add('active');
      currentPosition = tab.getAttribute('data-pos') || '';
      loadData();
    });
    seasonSel.addEventListener('change', function() { loadData(); });

    loadData();
  }});

  // ─── 5. POSITIONAL ADVANTAGE ──────────────────────────────────
  defs.push({ name: 'advantage', render: function(el) {
    var currentPosition = '';
    var seasonsLoaded = false;

    el.innerHTML =
      '<div class="lp-page">' +
        '<div class="lp-header"><h2>Positional Advantage</h2>' +
        '<div class="lp-subtitle">biggest scoring edge over the positional average</div></div>' +
        '<div class="lp-controls">' +
          '<select class="lp-select" id="lp-pa-season"></select>' +
          '<div class="lp-pos-tabs" id="lp-pa-pos">' +
            '<button class="lp-pos-tab active" data-pos="">ALL</button>' +
            '<button class="lp-pos-tab" data-pos="QB">QB</button>' +
            '<button class="lp-pos-tab" data-pos="RB">RB</button>' +
            '<button class="lp-pos-tab" data-pos="WR">WR</button>' +
            '<button class="lp-pos-tab" data-pos="TE">TE</button>' +
          '</div>' +
        '</div>' +
        '<div id="lp-pa-avgs"></div>' +
        '<div id="lp-pa-content"><div class="lp-loading">pulling film...</div></div>' +
      '</div>';

    var seasonSel = el.querySelector('#lp-pa-season');

    function load() {
      var season = seasonSel.value || '';
      var url = '/api/positional-advantage?';
      if (season) url += 'season=' + encodeURIComponent(season) + '&';
      if (currentPosition) url += 'position=' + encodeURIComponent(currentPosition) + '&';

      el.querySelector('#lp-pa-content').innerHTML = '<div class="lp-loading">pulling film...</div>';
      el.querySelector('#lp-pa-avgs').innerHTML = '';

      fetch(url).then(function(r) {
        if (!r.ok) throw new Error('API error');
        return r.json();
      }).then(function(data) {
        if (!seasonsLoaded) {
          seasonsLoaded = true;
          seasonSel.innerHTML = '';
          for (var y = 2024; y >= 2020; y--) {
            var opt = document.createElement('option');
            opt.value = y; opt.textContent = y;
            if (y === data.season) opt.selected = true;
            seasonSel.appendChild(opt);
          }
        }
        renderAvgs(data.pos_averages);
        renderPA(data);
      }).catch(function() {
        el.querySelector('#lp-pa-content').innerHTML = '<div class="lp-error">something went wrong</div>';
      });
    }

    function renderAvgs(avgs) {
      if (!avgs) return;
      var html = '<div class="pa-avgs">';
      ['QB', 'RB', 'WR', 'TE'].forEach(function(pos) {
        var color = POS_COLORS[pos] || '#888';
        html += '<div class="pa-avg-chip"><span style="color:' + color + '">' + escapeHtml(pos) + '</span> avg: ' + fmt(avgs[pos]) + ' PPG</div>';
      });
      html += '</div>';
      el.querySelector('#lp-pa-avgs').innerHTML = html;
    }

    function renderPA(data) {
      var players = data.players || [];
      var content = el.querySelector('#lp-pa-content');
      if (!players.length) {
        content.innerHTML = '<div class="pa-card"><div class="pa-card-header">Positional Advantage</div><div class="lp-empty">no data found</div></div>';
        return;
      }
      var html = '<div class="pa-card">';
      html += '<div class="pa-card-header">Positional Advantage (' + data.count + ' players)</div>';
      html += '<table class="pa-table"><thead><tr>';
      html += '<th>#</th><th>Player</th><th>Pos</th><th>PPG</th><th>Pos Avg</th><th>Edge</th><th>% Above</th><th></th><th>GP</th>';
      html += '</tr></thead><tbody>';

      var maxAdv = Math.max.apply(null, players.map(function(p) { return Math.abs(p.advantage); }).concat([1]));
      for (var i = 0; i < players.length; i++) {
        var p = players[i];
        var posColor = POS_COLORS[p.position] || '#888';
        var sign = p.advantage > 0 ? '+' : '';
        var badgeClass = p.advantage >= 0 ? 'pa-adv-pos' : 'pa-adv-neg';
        var barWidth = Math.max(2, Math.round(Math.abs(p.advantage) / maxAdv * 80));
        var barColor = p.advantage >= 0 ? '#2ec4b6' : '#d97757';

        html += '<tr>';
        html += '<td class="pa-rank">' + (i + 1) + '</td>';
        html += '<td>' + escapeHtml(p.name) + ' <span style="font-size:10px;color:var(--ink-light)">' + escapeHtml(p.team) + '</span></td>';
        html += '<td><span class="pa-pos-badge" style="background:' + posColor + '">' + escapeHtml(p.position) + '</span></td>';
        html += '<td style="font-weight:700">' + fmt(p.ppg) + '</td>';
        html += '<td>' + fmt(p.pos_avg) + '</td>';
        html += '<td><span class="pa-adv-badge ' + badgeClass + '">' + sign + fmt(p.advantage) + '</span></td>';
        html += '<td>' + sign + fmt(p.pct_above, 0) + '%</td>';
        html += '<td><div class="pa-bar" style="width:' + barWidth + 'px;background:' + barColor + '"></div></td>';
        html += '<td>' + p.games + '</td>';
        html += '</tr>';
      }
      html += '</tbody></table></div>';
      content.innerHTML = html;
    }

    el.querySelector('#lp-pa-pos').addEventListener('click', function(e) {
      var tab = e.target.closest('.lp-pos-tab');
      if (!tab) return;
      el.querySelectorAll('#lp-pa-pos .lp-pos-tab').forEach(function(t) { t.classList.remove('active'); });
      tab.classList.add('active');
      currentPosition = tab.getAttribute('data-pos') || '';
      load();
    });
    seasonSel.addEventListener('change', load);

    load();
  }});

  // ─── 6. AUCTION VALUES ────────────────────────────────────────
  defs.push({ name: 'auction', render: function(el) {
    var state = { budget: 200, rosterSize: 15, season: 0, position: 'ALL', search: '', sortKey: 'auction_value', sortDir: -1, data: null };
    var seasonsLoaded = false;

    el.innerHTML =
      '<div class="lp-page">' +
        '<div class="lp-header"><h2>Auction Values</h2>' +
        '<div class="lp-subtitle">trade values converted to draft-day dollars</div></div>' +
        '<div class="lp-controls">' +
          '<label>Budget: <input type="range" id="lp-av-slider" min="50" max="500" step="10" value="200"></label>' +
          '<div class="av-budget-display" id="lp-av-budget">$200</div>' +
          '<label>Roster: <input type="number" id="lp-av-roster" min="8" max="25" value="15" style="width:60px;font-family:var(--font-mono);font-size:13px;padding:4px 8px;border:2px solid var(--ink);border-radius:6px"></label>' +
          '<label>Season: <select class="lp-select" id="lp-av-season"></select></label>' +
        '</div>' +
        '<div class="lp-controls" id="lp-av-pos">' +
          '<button class="lp-pos-tab active" data-pos="ALL" style="border:2px solid var(--ink);border-radius:20px;padding:5px 14px;font-family:var(--font-mono);font-size:12px;box-shadow:2px 2px 0 var(--ink);cursor:pointer;background:var(--ink);color:var(--bg-card)">All</button>' +
          '<button class="lp-pos-tab" data-pos="QB" style="border:2px solid var(--ink);border-radius:20px;padding:5px 14px;font-family:var(--font-mono);font-size:12px;box-shadow:2px 2px 0 var(--ink);cursor:pointer;background:var(--bg-card)">QB</button>' +
          '<button class="lp-pos-tab" data-pos="RB" style="border:2px solid var(--ink);border-radius:20px;padding:5px 14px;font-family:var(--font-mono);font-size:12px;box-shadow:2px 2px 0 var(--ink);cursor:pointer;background:var(--bg-card)">RB</button>' +
          '<button class="lp-pos-tab" data-pos="WR" style="border:2px solid var(--ink);border-radius:20px;padding:5px 14px;font-family:var(--font-mono);font-size:12px;box-shadow:2px 2px 0 var(--ink);cursor:pointer;background:var(--bg-card)">WR</button>' +
          '<button class="lp-pos-tab" data-pos="TE" style="border:2px solid var(--ink);border-radius:20px;padding:5px 14px;font-family:var(--font-mono);font-size:12px;box-shadow:2px 2px 0 var(--ink);cursor:pointer;background:var(--bg-card)">TE</button>' +
        '</div>' +
        '<div style="display:flex;justify-content:center;margin-bottom:16px"><input class="lp-search" type="text" id="lp-av-search" placeholder="search players..."></div>' +
        '<div class="av-summary" id="lp-av-summary"></div>' +
        '<div class="av-table-wrap" id="lp-av-table"><div class="lp-loading">pulling film...</div></div>' +
      '</div>';

    var slider = el.querySelector('#lp-av-slider');
    var budgetDisp = el.querySelector('#lp-av-budget');
    var rosterInput = el.querySelector('#lp-av-roster');
    var seasonSel = el.querySelector('#lp-av-season');
    var searchInput = el.querySelector('#lp-av-search');

    slider.addEventListener('input', function() { state.budget = parseInt(this.value); budgetDisp.textContent = '$' + state.budget; });
    slider.addEventListener('change', function() { fetchData(); });
    rosterInput.addEventListener('change', function() { state.rosterSize = Math.max(8, Math.min(25, parseInt(this.value) || 15)); this.value = state.rosterSize; fetchData(); });
    seasonSel.addEventListener('change', function() { state.season = parseInt(this.value) || 0; fetchData(); });
    searchInput.addEventListener('input', function() { state.search = this.value.toLowerCase(); renderTable(); });

    el.querySelector('#lp-av-pos').addEventListener('click', function(e) {
      var tab = e.target.closest('.lp-pos-tab');
      if (!tab) return;
      el.querySelectorAll('#lp-av-pos .lp-pos-tab').forEach(function(t) { t.classList.remove('active'); t.style.background = 'var(--bg-card)'; t.style.color = 'var(--ink)'; });
      tab.classList.add('active');
      tab.style.background = 'var(--ink)';
      tab.style.color = 'var(--bg-card)';
      state.position = tab.getAttribute('data-pos');
      renderTable();
    });

    function tierClass(t) { return t === 'dollar' ? 'dollar-tier' : t || ''; }
    function tierLabel(t) { return { premium: 'Premium', starter: 'Starter', value: 'Value', bargain: 'Bargain', dollar: '$1 Filler' }[t] || t || ''; }

    function fetchData() {
      var tableEl = el.querySelector('#lp-av-table');
      tableEl.innerHTML = '<div class="lp-loading">pulling film...</div>';
      var url = '/api/auction-values?budget=' + state.budget + '&roster_size=' + state.rosterSize;
      if (state.season > 0) url += '&season=' + state.season;

      fetch(url).then(function(r) { if (!r.ok) throw new Error('err'); return r.json(); })
      .then(function(data) {
        state.data = data;
        if (!seasonsLoaded && data.available_seasons) {
          seasonsLoaded = true;
          seasonSel.innerHTML = '';
          data.available_seasons.forEach(function(s) {
            var opt = document.createElement('option');
            opt.value = s; opt.textContent = s;
            if (s === data.season) opt.selected = true;
            seasonSel.appendChild(opt);
          });
        }
        renderSummary();
        renderTable();
      }).catch(function() {
        tableEl.innerHTML = '<div class="lp-error">failed to load auction values</div>';
      });
    }

    function renderSummary() {
      if (!state.data) return;
      var pt = state.data.position_totals || {};
      var html = '';
      ['QB', 'RB', 'WR', 'TE'].forEach(function(pos) {
        var s = pt[pos] || { count: 0, avg_value: 0, top_value: 0 };
        html += '<div class="av-sum-card">';
        html += '<div class="av-sum-pos ' + pos + '">' + pos + '</div>';
        html += '<div class="av-sum-big">$' + s.top_value + '</div>';
        html += '<div class="av-sum-stat">top value</div>';
        html += '<div class="av-sum-stat">' + s.count + ' players &middot; avg $' + s.avg_value + '</div>';
        html += '</div>';
      });
      el.querySelector('#lp-av-summary').innerHTML = html;
    }

    function renderTable() {
      if (!state.data || !state.data.players) return;
      var tableEl = el.querySelector('#lp-av-table');
      var players = state.data.players.slice();
      if (state.position !== 'ALL') players = players.filter(function(p) { return p.position === state.position; });
      if (state.search) players = players.filter(function(p) { return (p.full_name || '').toLowerCase().indexOf(state.search) !== -1 || (p.team || '').toLowerCase().indexOf(state.search) !== -1; });
      players.sort(function(a, b) {
        var av = a[state.sortKey] || 0, bv = b[state.sortKey] || 0;
        if (typeof av === 'string') return state.sortDir * av.localeCompare(bv);
        return state.sortDir * (bv - av);
      });

      if (!players.length) { tableEl.innerHTML = '<div class="lp-empty">no players match your filters</div>'; return; }

      var html = '<table class="av-table"><thead><tr>';
      var cols = [
        { key: 'rank', label: '#' }, { key: 'full_name', label: 'Player' },
        { key: 'position', label: 'Pos' }, { key: 'team', label: 'Team' },
        { key: 'auction_value', label: 'Auction $' }, { key: 'trade_value', label: 'Trade Val' },
        { key: 'ppg', label: 'PPG' }, { key: 'tier', label: 'Tier' }
      ];
      cols.forEach(function(col) {
        var arrow = state.sortKey === col.key ? (state.sortDir > 0 ? ' &#9650;' : ' &#9660;') : '';
        html += '<th data-sort="' + col.key + '">' + col.label + arrow + '</th>';
      });
      html += '</tr></thead><tbody>';

      players.forEach(function(p, i) {
        html += '<tr>';
        html += '<td>' + (i + 1) + '</td>';
        html += '<td>' + escapeHtml(p.full_name) + '</td>';
        html += '<td><span class="av-pos-badge ' + escapeHtml(p.position) + '">' + escapeHtml(p.position) + '</span></td>';
        html += '<td>' + escapeHtml(p.team) + '</td>';
        html += '<td><span class="av-dollar ' + tierClass(p.tier) + '">$' + p.auction_value + '</span></td>';
        html += '<td><div class="av-tv-bar"><div class="av-tv-fill" style="width:' + Math.min(100, p.trade_value) + '%"></div></div>' + p.trade_value + '</td>';
        html += '<td>' + p.ppg + '</td>';
        html += '<td><span class="av-tier-badge ' + tierClass(p.tier) + '">' + escapeHtml(tierLabel(p.tier)) + '</span></td>';
        html += '</tr>';
      });
      html += '</tbody></table>';
      tableEl.innerHTML = html;

      tableEl.querySelectorAll('th[data-sort]').forEach(function(th) {
        th.addEventListener('click', function() {
          var key = this.getAttribute('data-sort');
          if (state.sortKey === key) state.sortDir *= -1;
          else { state.sortKey = key; state.sortDir = -1; }
          renderTable();
        });
      });
    }

    fetchData();
  }});

  // ─── 7. CHEAT SHEET ───────────────────────────────────────────
  defs.push({ name: 'cheatsheet', render: function(el) {
    var state = { season: 0, format: 'ppr', data: null };
    var seasonsLoaded = false;
    var POS_ORDER = ['QB', 'RB', 'WR', 'TE'];

    el.innerHTML =
      '<div class="lp-page">' +
        '<div class="lp-header"><h2>Draft Cheat Sheet</h2>' +
        '<div class="lp-subtitle">print it, screenshot it, win your draft</div></div>' +
        '<div class="lp-controls">' +
          '<div class="cs-fmt-tabs" id="lp-cs-fmt">' +
            '<button class="cs-fmt-tab active" data-fmt="ppr">PPR</button>' +
            '<button class="cs-fmt-tab" data-fmt="half">Half-PPR</button>' +
            '<button class="cs-fmt-tab" data-fmt="std">Standard</button>' +
          '</div>' +
          '<select class="lp-select" id="lp-cs-season"></select>' +
        '</div>' +
        '<div class="lp-loading" id="lp-cs-loading">pulling film...</div>' +
        '<div class="cs-grid" id="lp-cs-grid" style="display:none"></div>' +
      '</div>';

    var seasonSel = el.querySelector('#lp-cs-season');

    el.querySelector('#lp-cs-fmt').addEventListener('click', function(e) {
      var tab = e.target.closest('.cs-fmt-tab');
      if (!tab) return;
      el.querySelectorAll('.cs-fmt-tab').forEach(function(t) { t.classList.remove('active'); });
      tab.classList.add('active');
      state.format = tab.getAttribute('data-fmt');
      fetchCS();
    });
    seasonSel.addEventListener('change', function() { state.season = parseInt(this.value) || 0; fetchCS(); });

    function fetchCS() {
      el.querySelector('#lp-cs-loading').style.display = 'block';
      el.querySelector('#lp-cs-grid').style.display = 'none';
      var url = '/api/cheat-sheet?format=' + state.format;
      if (state.season) url += '&season=' + state.season;

      fetch(url).then(function(r) { if (!r.ok) throw new Error('err'); return r.json(); })
      .then(function(data) {
        state.data = data;
        if (!seasonsLoaded && data.available_seasons) {
          seasonsLoaded = true;
          seasonSel.innerHTML = '';
          data.available_seasons.forEach(function(s) {
            var opt = document.createElement('option');
            opt.value = s; opt.textContent = s;
            if (s === data.season) opt.selected = true;
            seasonSel.appendChild(opt);
          });
        }
        state.season = data.season;
        renderCS();
      }).catch(function() {
        el.querySelector('#lp-cs-loading').textContent = 'failed to load cheat sheet';
      });
    }

    function renderCS() {
      el.querySelector('#lp-cs-loading').style.display = 'none';
      var grid = el.querySelector('#lp-cs-grid');
      grid.style.display = 'grid';
      var positions = state.data.positions || {};
      var html = '';
      POS_ORDER.forEach(function(pos) {
        var players = positions[pos] || [];
        html += '<div class="cs-col"><div class="cs-col-header ' + pos + '">' + pos + ' (' + players.length + ')</div>';
        var currentTier = '';
        players.forEach(function(p) {
          if (p.tier !== currentTier) {
            currentTier = p.tier;
            html += '<div class="cs-tier-break">' + escapeHtml(currentTier) + '</div>';
          }
          html += '<div class="cs-player" data-pid="' + escapeAttr(p.player_id) + '">';
          html += '<span class="cs-rank">' + p.rank + '</span>';
          html += '<span class="cs-pname">' + escapeHtml(p.full_name) + '</span>';
          html += '<span class="cs-team">' + escapeHtml(p.team) + '</span>';
          html += '<span class="cs-ppg">' + fmt(p.ppg) + '</span>';
          html += '</div>';
        });
        html += '</div>';
      });
      grid.innerHTML = html;

      grid.querySelectorAll('.cs-player[data-pid]').forEach(function(row) {
        row.addEventListener('click', function() {
          var pid = this.getAttribute('data-pid');
          if (pid) window.location.href = '/player/' + encodeURIComponent(pid);
        });
      });
    }

    fetchCS();
  }});

  /* ===================================================================
     DISCOVERY PANELS (6 panels)
     breakouts, buysell, stocks, waivers, scarcity, handcuffs
     =================================================================== */

  // ===== BREAKOUTS =====
  defs.push({ name: 'breakouts', render: function(el) {
    el.innerHTML = '<div class="lp-page">' +
      '<div class="lp-header"><h2>Breakout Candidates</h2>' +
      '<div class="lp-subtitle">opportunity outpacing production — volume-based, not efficiency</div></div>' +
      '<div class="lp-controls">' +
      '<div class="lp-pos-tabs" id="bo-pos-tabs">' +
      '<button class="lp-pos-tab active" data-pos="">All</button>' +
      '<button class="lp-pos-tab" data-pos="QB">QB</button>' +
      '<button class="lp-pos-tab" data-pos="RB">RB</button>' +
      '<button class="lp-pos-tab" data-pos="WR">WR</button>' +
      '<button class="lp-pos-tab" data-pos="TE">TE</button>' +
      '</div>' +
      '<select class="lp-select" id="bo-season" aria-label="Season"></select>' +
      '</div>' +
      '<div id="bo-body"><div class="lp-loading">scouting the film...</div></div>' +
      '</div>';

    var curPos = '';
    var seasonsPopulated = false;

    function ageClass(age) {
      if (!age) return 'prime';
      if (age <= 24) return 'young';
      if (age <= 27) return 'prime';
      return 'aging';
    }

    function posStatLabel(pos) {
      if (pos === 'QB') return 'ATT/G';
      if (pos === 'RB') return 'CAR/G';
      return 'TGT/G';
    }

    function posStatVal(p) {
      if (p.position === 'QB') return p.attempts_per_game;
      if (p.position === 'RB') return p.carries_per_game;
      return p.targets_per_game;
    }

    function loadBO() {
      var body = el.querySelector('#bo-body');
      body.innerHTML = '<div class="lp-loading">scouting the film...</div>';
      var season = el.querySelector('#bo-season').value;
      var url = '/api/breakout-candidates?limit=50';
      if (season) url += '&season=' + season;
      if (curPos) url += '&position=' + curPos;

      fetch(url).then(function(r) { if (!r.ok) throw new Error('API error'); return r.json(); }).then(function(data) {
        if (!seasonsPopulated && data.available_seasons) {
          var sel = el.querySelector('#bo-season');
          data.available_seasons.forEach(function(s) {
            var o = document.createElement('option');
            o.value = s; o.textContent = s;
            if (s == (data.season || data.available_seasons[0])) o.selected = true;
            sel.appendChild(o);
          });
          seasonsPopulated = true;
        }
        var candidates = data.candidates || [];
        if (!candidates.length) { body.innerHTML = '<div class="lp-empty">no breakout candidates found</div>'; return; }

        var html = '<div class="breakouts-grid">';
        candidates.forEach(function(p) {
          var pos = (p.position || 'WR').toLowerCase();
          var ac = ageClass(p.age);
          html += '<div class="breakout-card" data-pid="' + escapeAttr(p.player_id) + '">';
          html += '<div class="breakout-card-top ' + pos + '"></div><div class="breakout-card-body">';
          html += '<div class="breakout-card-row1">';
          html += '<div class="breakout-rank">' + escapeHtml(String(p.rank)) + '</div>';
          if (p.headshot_url) html += '<img class="breakout-headshot" src="' + escapeAttr(p.headshot_url) + '" alt="" loading="lazy" onerror="this.style.display=\'none\'">';
          html += '<div class="breakout-info"><div class="breakout-name">' + escapeHtml(p.name) + '</div>';
          html += '<div class="breakout-meta"><span class="breakout-pos-badge ' + pos + '">' + escapeHtml(p.position) + '</span>';
          html += '<span class="breakout-team">' + escapeHtml(p.team) + '</span>';
          if (p.age) html += '<span class="breakout-age-badge ' + ac + '">' + ac + ' ' + p.age + '</span>';
          html += '</div></div>';
          html += '<div class="breakout-rbs"><div class="breakout-rbs-score">' + escapeHtml(String(p.rbs_score)) + '</div>';
          html += '<div class="breakout-rbs-label">RBS</div></div></div>';
          html += '<div class="breakout-bars">';
          html += '<div class="breakout-bar-group"><div class="breakout-bar-label"><span>Opportunity</span><span>' + escapeHtml(String(p.opportunity_pct)) + '%</span></div>';
          html += '<div class="breakout-bar-track"><div class="breakout-bar-fill opportunity" style="width:' + parseFloat(p.opportunity_pct) + '%"></div></div></div>';
          html += '<div class="breakout-bar-group"><div class="breakout-bar-label"><span>Production</span><span>' + escapeHtml(String(p.production_pct)) + '%</span></div>';
          html += '<div class="breakout-bar-track"><div class="breakout-bar-fill production" style="width:' + parseFloat(p.production_pct) + '%"></div></div></div></div>';
          html += '<div class="breakout-gap"><span class="breakout-gap-arrow">&#9650;</span><span class="breakout-gap-text">' + escapeHtml(p.annotation) + '</span></div>';
          html += '<div class="breakout-stats">';
          html += '<div class="breakout-stat"><div class="breakout-stat-val">' + escapeHtml(String(p.ppg)) + '</div><div class="breakout-stat-key">PPG</div></div>';
          html += '<div class="breakout-stat"><div class="breakout-stat-val">' + escapeHtml(String(p.snap_pct)) + '%</div><div class="breakout-stat-key">Snap%</div></div>';
          html += '<div class="breakout-stat"><div class="breakout-stat-val">' + escapeHtml(String(posStatVal(p))) + '</div><div class="breakout-stat-key">' + posStatLabel(p.position) + '</div></div>';
          if (p.position !== 'QB' && p.position !== 'RB') html += '<div class="breakout-stat"><div class="breakout-stat-val">' + escapeHtml(String(p.target_share)) + '%</div><div class="breakout-stat-key">TGT%</div></div>';
          html += '<div class="breakout-stat"><div class="breakout-stat-val">' + escapeHtml(String(p.games)) + '</div><div class="breakout-stat-key">Games</div></div>';
          html += '</div></div></div>';
        });
        html += '</div>';
        body.innerHTML = html;

        body.querySelectorAll('.breakout-card[data-pid]').forEach(function(card) {
          card.addEventListener('click', function() {
            window.location.href = '/player/' + encodeURIComponent(card.getAttribute('data-pid'));
          });
        });
      }).catch(function() { body.innerHTML = '<div class="lp-empty">failed to load breakout data</div>'; });
    }

    el.querySelector('#bo-pos-tabs').addEventListener('click', function(e) {
      var tab = e.target.closest('.lp-pos-tab');
      if (!tab) return;
      el.querySelectorAll('#bo-pos-tabs .lp-pos-tab').forEach(function(t) { t.classList.remove('active'); });
      tab.classList.add('active');
      curPos = tab.getAttribute('data-pos') || '';
      loadBO();
    });
    el.querySelector('#bo-season').addEventListener('change', loadBO);
    loadBO();
  }});

  // ===== BUY / SELL =====
  defs.push({ name: 'buysell', render: function(el) {
    el.innerHTML = '<div class="lp-page">' +
      '<div class="lp-header"><h2>Buy Low / Sell High</h2>' +
      '<div class="lp-subtitle">efficiency vs dynasty ranking — who\'s mispriced?</div></div>' +
      '<div class="lp-controls">' +
      '<div class="lp-pos-tabs" id="bs-pos-tabs">' +
      '<button class="lp-pos-tab active" data-pos="">All</button>' +
      '<button class="lp-pos-tab" data-pos="QB">QB</button>' +
      '<button class="lp-pos-tab" data-pos="RB">RB</button>' +
      '<button class="lp-pos-tab" data-pos="WR">WR</button>' +
      '<button class="lp-pos-tab" data-pos="TE">TE</button>' +
      '</div>' +
      '<select class="lp-select" id="bs-season" aria-label="Season"></select>' +
      '</div>' +
      '<div id="bs-body"><div class="lp-loading">studying the market...</div></div>' +
      '</div>';

    var curPos = '';
    var seasonsPopulated = false;

    function ageClass(age) {
      if (!age) return 'prime';
      if (age <= 24) return 'young';
      if (age <= 27) return 'prime';
      if (age <= 30) return 'aging';
      return 'veteran';
    }

    function gradeClass(grade) {
      if (!grade) return 'grade-c';
      var f = grade.charAt(0).toUpperCase();
      if (f === 'A') return 'grade-a';
      if (f === 'B') return 'grade-b';
      if (f === 'C') return 'grade-c';
      if (f === 'D') return 'grade-d';
      return 'grade-f';
    }

    function renderEffStats(p) {
      var s = p.eff_stats || {};
      var h = '';
      if (p.position === 'QB') {
        h += '<div class="buysell-stat"><div class="buysell-stat-val">' + escapeHtml(String(s.yards_per_att || 0)) + '</div><div class="buysell-stat-key">Y/ATT</div></div>';
        h += '<div class="buysell-stat"><div class="buysell-stat-val">' + escapeHtml(String(s.td_rate || 0)) + '%</div><div class="buysell-stat-key">TD%</div></div>';
        h += '<div class="buysell-stat"><div class="buysell-stat-val">' + escapeHtml(String(s.int_rate || 0)) + '%</div><div class="buysell-stat-key">INT%</div></div>';
      } else if (p.position === 'RB') {
        h += '<div class="buysell-stat"><div class="buysell-stat-val">' + escapeHtml(String(s.yards_per_carry || 0)) + '</div><div class="buysell-stat-key">YPC</div></div>';
        h += '<div class="buysell-stat"><div class="buysell-stat-val">' + escapeHtml(String(s.yards_per_target || 0)) + '</div><div class="buysell-stat-key">Y/TGT</div></div>';
        h += '<div class="buysell-stat"><div class="buysell-stat-val">' + escapeHtml(String(s.td_rate || 0)) + '%</div><div class="buysell-stat-key">TD%</div></div>';
      } else {
        h += '<div class="buysell-stat"><div class="buysell-stat-val">' + escapeHtml(String(s.yards_per_target || 0)) + '</div><div class="buysell-stat-key">Y/TGT</div></div>';
        h += '<div class="buysell-stat"><div class="buysell-stat-val">' + escapeHtml(String(s.catch_rate || 0)) + '%</div><div class="buysell-stat-key">CATCH%</div></div>';
        h += '<div class="buysell-stat"><div class="buysell-stat-val">' + escapeHtml(String(s.yac_per_rec || 0)) + '</div><div class="buysell-stat-key">YAC/R</div></div>';
        h += '<div class="buysell-stat"><div class="buysell-stat-val">' + escapeHtml(String(s.td_rate || 0)) + '%</div><div class="buysell-stat-key">TD%</div></div>';
      }
      h += '<div class="buysell-stat"><div class="buysell-stat-val">' + escapeHtml(String(p.ppg)) + '</div><div class="buysell-stat-key">PPG</div></div>';
      return h;
    }

    function renderCard(p, isBuy) {
      var pos = (p.position || 'WR').toLowerCase();
      var ac = ageClass(p.age);
      var gc = gradeClass(p.efficiency_grade);
      var type = isBuy ? 'buy' : 'sell';
      var barWidth = Math.min(100, Math.round((p.mismatch_score / 60) * 100));

      var h = '<div class="buysell-card" data-pid="' + escapeAttr(p.player_id) + '">';
      h += '<div class="buysell-card-top ' + pos + '"></div><div class="buysell-card-body">';
      h += '<div class="buysell-card-row1">';
      h += '<div class="buysell-rank">' + escapeHtml(String(p.rank)) + '</div>';
      if (p.headshot_url) h += '<img class="buysell-headshot" src="' + escapeAttr(p.headshot_url) + '" alt="" loading="lazy" onerror="this.style.display=\'none\'">';
      h += '<div class="buysell-info"><div class="buysell-name">' + escapeHtml(p.name) + '</div>';
      h += '<div class="buysell-meta"><span class="buysell-pos-badge ' + pos + '">' + escapeHtml(p.position) + '</span>';
      h += '<span class="buysell-team">' + escapeHtml(p.team) + '</span>';
      if (p.age) h += '<span class="buysell-age-badge ' + ac + '">' + ac + ' ' + p.age + '</span>';
      h += '</div></div>';
      h += '<div class="buysell-badges"><div class="buysell-grade ' + gc + '">' + escapeHtml(p.efficiency_grade) + '</div>';
      h += '<div class="buysell-grade-label">efficiency</div></div></div>';
      h += '<div class="buysell-mismatch"><div class="buysell-mismatch-row">';
      h += '<span class="buysell-mismatch-label">Value Mismatch</span>';
      h += '<span class="buysell-mismatch-val ' + type + '">' + escapeHtml(String(p.mismatch_score)) + '</span></div>';
      h += '<div class="buysell-mismatch-track"><div class="buysell-mismatch-fill ' + type + '" style="width:' + barWidth + '%"></div></div></div>';
      h += '<div class="buysell-annotation">' + escapeHtml(p.annotation) + '</div>';
      h += '<div class="buysell-stats">' + renderEffStats(p) + '</div>';
      h += '</div></div>';
      return h;
    }

    function renderColumn(players, isBuy) {
      if (!players || !players.length) return '<div class="lp-empty">no ' + (isBuy ? 'buy low' : 'sell high') + ' candidates</div>';
      var h = '<div class="buysell-list">';
      players.forEach(function(p) { h += renderCard(p, isBuy); });
      h += '</div>';
      return h;
    }

    function loadBS() {
      var body = el.querySelector('#bs-body');
      body.innerHTML = '<div class="lp-loading">studying the market...</div>';
      var season = el.querySelector('#bs-season').value;
      var url = '/api/buy-sell-candidates?limit=15';
      if (season) url += '&season=' + season;
      if (curPos) url += '&position=' + curPos;

      fetch(url).then(function(r) { if (!r.ok) throw new Error('API error'); return r.json(); }).then(function(data) {
        if (!seasonsPopulated && data.available_seasons) {
          var sel = el.querySelector('#bs-season');
          data.available_seasons.forEach(function(s) {
            var o = document.createElement('option');
            o.value = s; o.textContent = s;
            if (s == (data.season || data.available_seasons[0])) o.selected = true;
            sel.appendChild(o);
          });
          seasonsPopulated = true;
        }
        var html = '<div class="buysell-columns">';
        html += '<div class="buysell-column"><div class="buysell-column-header buy">';
        html += '<span class="buysell-column-arrow buy">&#9650;</span>';
        html += '<span class="buysell-column-title">Buy Low</span>';
        html += '<span class="buysell-column-note">efficient but undervalued</span></div>';
        html += renderColumn(data.buy_low, true) + '</div>';
        html += '<div class="buysell-column"><div class="buysell-column-header sell">';
        html += '<span class="buysell-column-arrow sell">&#9660;</span>';
        html += '<span class="buysell-column-title">Sell High</span>';
        html += '<span class="buysell-column-note">ranked above their efficiency</span></div>';
        html += renderColumn(data.sell_high, false) + '</div></div>';
        body.innerHTML = html;

        body.querySelectorAll('.buysell-card[data-pid]').forEach(function(card) {
          card.addEventListener('click', function() {
            window.location.href = '/player/' + encodeURIComponent(card.getAttribute('data-pid'));
          });
        });
      }).catch(function() { body.innerHTML = '<div class="lp-empty">failed to load buy/sell data</div>'; });
    }

    el.querySelector('#bs-pos-tabs').addEventListener('click', function(e) {
      var tab = e.target.closest('.lp-pos-tab');
      if (!tab) return;
      el.querySelectorAll('#bs-pos-tabs .lp-pos-tab').forEach(function(t) { t.classList.remove('active'); });
      tab.classList.add('active');
      curPos = tab.getAttribute('data-pos') || '';
      loadBS();
    });
    el.querySelector('#bs-season').addEventListener('change', loadBS);
    loadBS();
  }});

  // ===== STOCK WATCH =====
  defs.push({ name: 'stocks', render: function(el) {
    el.innerHTML = '<div class="lp-page">' +
      '<div class="lp-header"><h2>Dynasty Stock Watch</h2>' +
      '<div class="lp-subtitle">composite valuations from efficiency, consistency, and schedule</div></div>' +
      '<div class="lp-controls">' +
      '<div class="lp-pos-tabs" id="stk-pos-tabs">' +
      '<button class="lp-pos-tab active" data-pos="">All</button>' +
      '<button class="lp-pos-tab" data-pos="QB">QB</button>' +
      '<button class="lp-pos-tab" data-pos="RB">RB</button>' +
      '<button class="lp-pos-tab" data-pos="WR">WR</button>' +
      '<button class="lp-pos-tab" data-pos="TE">TE</button>' +
      '</div>' +
      '<select class="lp-select" id="stk-season" aria-label="Season"></select>' +
      '</div>' +
      '<div id="stk-body"><div class="lp-loading">crunching the composite...</div></div>' +
      '</div>';

    var curPos = '';
    var seasonsPopulated = false;
    var currentData = null;
    var sortState = {
      rising: { col: 'stock_delta', dir: -1 },
      falling: { col: 'stock_delta', dir: 1 }
    };

    var GRADE_ORDER = {'A+':8,'A':7,'B+':6,'B':5,'C+':4,'C':3,'D':2,'F':1};

    function gradeClass(grade) {
      if (!grade) return 'grade-f';
      var g = grade.charAt(0);
      if (g === 'A') return grade === 'A+' ? 'grade-aplus' : 'grade-a';
      if (g === 'B') return 'grade-b';
      if (g === 'C') return 'grade-c';
      if (g === 'D') return 'grade-d';
      return 'grade-f';
    }

    function scoreClass(score) {
      if (score >= 80) return 'elite';
      if (score >= 60) return 'good';
      if (score >= 40) return 'avg';
      if (score >= 20) return 'below';
      return 'poor';
    }

    var COLS = [
      { key: 'name', label: 'Player' },
      { key: 'stock_score', label: 'Score' },
      { key: 'ppg', label: 'PPG' },
      { key: 'efficiency_grade', label: 'Eff' },
      { key: 'consistency_grade', label: 'Con' },
      { key: 'sos_grade', label: 'SOS' },
      { key: 'stock_delta', label: 'Delta', hide: true },
      { key: 'age', label: 'Age', hide: true },
      { key: 'games', label: 'GP', hide: true }
    ];

    function buildRow(p) {
      var pos = (p.position || 'RB').toLowerCase();
      var h = '<tr data-pid="' + escapeAttr(p.player_id) + '">';
      COLS.forEach(function(c) {
        var cls = [];
        if (c.key !== 'name') cls.push('center');
        if (c.hide) cls.push('hide-mobile');
        if (c.key === 'name') {
          h += '<td><div class="stk-player-cell">';
          if (p.headshot_url) h += '<img class="stk-headshot" src="' + escapeAttr(p.headshot_url) + '" alt="" loading="lazy" onerror="this.style.display=\'none\'">';
          h += '<div class="stk-player-info"><div class="stk-player-name">' + escapeHtml(p.name) + '</div>';
          h += '<div class="stk-player-meta"><span class="stk-pos-badge ' + pos + '">' + escapeHtml(p.position) + '</span>';
          h += '<span class="stk-team-label">' + escapeHtml(p.team) + '</span></div></div></div></td>';
        } else if (c.key === 'stock_score') {
          h += '<td class="' + cls.join(' ') + '"><span class="stk-score-badge ' + scoreClass(p.stock_score || 0) + '">' + escapeHtml(String(p.stock_score || 0)) + '</span></td>';
        } else if (c.key === 'ppg') {
          h += '<td class="' + cls.join(' ') + '" style="font-weight:700">' + fmt(p.ppg) + '</td>';
        } else if (c.key === 'efficiency_grade' || c.key === 'consistency_grade' || c.key === 'sos_grade') {
          var g = p[c.key] || 'C';
          h += '<td class="' + cls.join(' ') + '"><span class="stk-grade-badge ' + gradeClass(g) + '">' + escapeHtml(g) + '</span></td>';
        } else if (c.key === 'stock_delta') {
          var d = p.stock_delta || 0;
          var sign = d > 0 ? '+' : '';
          h += '<td class="' + cls.join(' ') + '" style="font-weight:700;color:var(--' + (d > 0 ? 'green' : 'red') + ')">' + sign + d + '</td>';
        } else {
          var v = p[c.key];
          h += '<td class="' + cls.join(' ') + '">' + (v != null ? escapeHtml(String(v)) : '-') + '</td>';
        }
      });
      h += '</tr>';
      return h;
    }

    function sortPlayers(players, col, dir) {
      return players.slice().sort(function(a, b) {
        var va = a[col], vb = b[col];
        if (va == null) va = -Infinity;
        if (vb == null) vb = -Infinity;
        if (typeof va === 'string') {
          var ga = GRADE_ORDER[va], gb = GRADE_ORDER[vb];
          if (ga !== undefined && gb !== undefined) return dir * (gb - ga);
          return dir * va.localeCompare(vb);
        }
        return dir * (vb - va);
      });
    }

    function buildTable(players, section) {
      if (!players || !players.length) return '<div class="lp-empty">no ' + section + ' stocks found</div>';
      var isRising = section === 'rising';
      var icon = isRising ? '&#x1F4C8;' : '&#x1F4C9;';
      var title = isRising ? 'Rising Stocks' : 'Falling Stocks';
      var st = sortState[section];
      var sorted = sortPlayers(players, st.col, st.dir);

      var h = '<div class="stk-section"><div class="stk-section-header ' + section + '">';
      h += '<span class="stk-section-icon ' + section + '">' + icon + '</span> ' + title;
      h += ' <span style="font-family:var(--font-hand);font-size:16px;color:var(--ink-light);font-weight:400">(' + players.length + ' players)</span></div>';
      h += '<table class="stk-table" data-section="' + section + '"><thead><tr>';
      COLS.forEach(function(c) {
        var cls = [];
        if (c.key !== 'name') cls.push('center');
        if (c.hide) cls.push('hide-mobile');
        if (st.col === c.key) cls.push('sorted');
        var arrow = st.col === c.key ? (st.dir === 1 ? ' &#9650;' : ' &#9660;') : '';
        h += '<th class="' + cls.join(' ') + '" data-sort="' + c.key + '" data-section="' + section + '">' + c.label + '<span class="sort-arrow">' + arrow + '</span></th>';
      });
      h += '</tr></thead><tbody>';
      sorted.forEach(function(p) { h += buildRow(p); });
      h += '</tbody></table></div>';
      return h;
    }

    function render(data) {
      currentData = data;
      var body = el.querySelector('#stk-body');
      if (!data || (!data.rising.length && !data.falling.length)) {
        body.innerHTML = '<div class="lp-empty">no stock watch data found</div>';
        return;
      }
      body.innerHTML = buildTable(data.rising, 'rising') + buildTable(data.falling, 'falling');

      body.querySelectorAll('th[data-sort]').forEach(function(th) {
        th.addEventListener('click', function() {
          var col = th.getAttribute('data-sort');
          var sec = th.getAttribute('data-section');
          if (sortState[sec].col === col) sortState[sec].dir *= -1;
          else { sortState[sec].col = col; sortState[sec].dir = -1; }
          render(currentData);
        });
      });
      body.querySelectorAll('tr[data-pid]').forEach(function(tr) {
        tr.addEventListener('click', function() {
          window.location.href = '/player/' + encodeURIComponent(tr.getAttribute('data-pid'));
        });
      });
    }

    function loadSTK() {
      var body = el.querySelector('#stk-body');
      body.innerHTML = '<div class="lp-loading">crunching the composite...</div>';
      var season = el.querySelector('#stk-season').value;
      var url = '/api/stock-watch?limit=30';
      if (season) url += '&season=' + season;
      if (curPos) url += '&position=' + curPos;

      fetch(url).then(function(r) { if (!r.ok) throw new Error('API error'); return r.json(); }).then(function(data) {
        if (!seasonsPopulated && data.available_seasons) {
          var sel = el.querySelector('#stk-season');
          data.available_seasons.forEach(function(s) {
            var o = document.createElement('option');
            o.value = s; o.textContent = s;
            if (s == data.season) o.selected = true;
            sel.appendChild(o);
          });
          seasonsPopulated = true;
        }
        render(data);
      }).catch(function() { body.innerHTML = '<div class="lp-empty">failed to load stock watch data</div>'; });
    }

    el.querySelector('#stk-pos-tabs').addEventListener('click', function(e) {
      var tab = e.target.closest('.lp-pos-tab');
      if (!tab) return;
      el.querySelectorAll('#stk-pos-tabs .lp-pos-tab').forEach(function(t) { t.classList.remove('active'); });
      tab.classList.add('active');
      curPos = tab.getAttribute('data-pos') || '';
      loadSTK();
    });
    el.querySelector('#stk-season').addEventListener('change', loadSTK);
    loadSTK();
  }});

  // ===== WAIVERS =====
  defs.push({ name: 'waivers', render: function(el) {
    el.innerHTML = '<div class="lp-page">' +
      '<div class="lp-header"><h2>Waiver Wire Targets</h2>' +
      '<div class="lp-subtitle">surging lately but low on the season — probably still on your wire</div></div>' +
      '<div class="lp-controls">' +
      '<select class="lp-select" id="ww-season" aria-label="Season"></select>' +
      '<select class="lp-select" id="ww-window" aria-label="Window">' +
      '<option value="3">Last 3 games</option>' +
      '<option value="4" selected>Last 4 games</option>' +
      '<option value="5">Last 5 games</option>' +
      '</select>' +
      '<div class="lp-pos-tabs" id="ww-pos-tabs">' +
      '<button class="lp-pos-tab active" data-pos="">All</button>' +
      '<button class="lp-pos-tab" data-pos="QB">QB</button>' +
      '<button class="lp-pos-tab" data-pos="RB">RB</button>' +
      '<button class="lp-pos-tab" data-pos="WR">WR</button>' +
      '<button class="lp-pos-tab" data-pos="TE">TE</button>' +
      '</div>' +
      '</div>' +
      '<div id="ww-body"><div class="lp-loading">pulling film...</div></div>' +
      '</div>';

    var curPos = '';
    var seasonsPopulated = false;
    var currentWin = '4';

    function loadWW() {
      var body = el.querySelector('#ww-body');
      body.innerHTML = '<div class="lp-loading">pulling film...</div>';
      var season = el.querySelector('#ww-season').value;
      var win = el.querySelector('#ww-window').value;
      currentWin = win;
      var url = '/api/waivers?window=' + encodeURIComponent(win);
      if (season) url += '&season=' + encodeURIComponent(season);
      if (curPos) url += '&position=' + encodeURIComponent(curPos);

      fetch(url).then(function(r) { if (!r.ok) throw new Error('API error'); return r.json(); }).then(function(data) {
        if (!seasonsPopulated) {
          var sel = el.querySelector('#ww-season');
          sel.innerHTML = '';
          for (var y = 2024; y >= 2020; y--) {
            var o = document.createElement('option');
            o.value = y; o.textContent = y;
            if (y === data.season) o.selected = true;
            sel.appendChild(o);
          }
          seasonsPopulated = true;
        }
        var targets = data.targets || [];
        var html = '<div class="ww-card"><div class="ww-card-header">Waiver Wire Targets (' + escapeHtml(String(data.count || 0)) + ')</div>';
        if (!targets.length) {
          html += '<div class="lp-empty">no waiver targets found</div></div>';
          body.innerHTML = html;
          return;
        }
        html += '<table class="ww-table"><thead><tr>';
        html += '<th>#</th><th>Player</th><th>Pos</th><th>GP</th><th>Szn PPG</th><th>Recent PPG</th><th>Surge</th><th>Last ' + escapeHtml(String(data.window || currentWin)) + '</th>';
        html += '</tr></thead><tbody>';
        for (var i = 0; i < targets.length; i++) {
          var p = targets[i];
          var posColor = POS_COLORS[p.position] || '#888';
          var sign = p.delta > 0 ? '+' : '';
          html += '<tr>';
          html += '<td class="ww-rank">' + (i + 1) + '</td>';
          html += '<td>' + escapeHtml(p.name) + ' <span style="font-size:10px;color:var(--ink-light)">' + escapeHtml(p.team) + '</span></td>';
          html += '<td><span class="ww-pos-badge" style="background:' + posColor + '">' + escapeHtml(p.position) + '</span></td>';
          html += '<td>' + escapeHtml(String(p.games)) + '</td>';
          html += '<td>' + fmt(p.season_avg) + '</td>';
          html += '<td style="font-weight:700;color:#166534">' + fmt(p.recent_avg) + '</td>';
          html += '<td><span class="ww-delta-badge">' + sign + fmt(p.delta) + ' (' + sign + fmt(p.delta_pct, 0) + '%)</span></td>';
          var scores = p.recent_scores || [];
          var maxScore = Math.max.apply(null, scores.concat([1]));
          html += '<td><div class="ww-recent">';
          for (var j = 0; j < scores.length; j++) {
            var h2 = Math.max(2, Math.round((scores[j] / maxScore) * 20));
            var barColor = scores[j] >= p.season_avg ? '#2ec4b6' : '#d97757';
            html += '<div class="ww-recent-bar" style="height:' + h2 + 'px;background:' + barColor + '" title="' + fmt(scores[j]) + '"></div>';
          }
          html += '</div></td></tr>';
        }
        html += '</tbody></table></div>';
        body.innerHTML = html;
      }).catch(function() { body.innerHTML = '<div class="lp-empty">failed to load waiver data</div>'; });
    }

    el.querySelector('#ww-pos-tabs').addEventListener('click', function(e) {
      var tab = e.target.closest('.lp-pos-tab');
      if (!tab) return;
      el.querySelectorAll('#ww-pos-tabs .lp-pos-tab').forEach(function(t) { t.classList.remove('active'); });
      tab.classList.add('active');
      curPos = tab.getAttribute('data-pos') || '';
      loadWW();
    });
    el.querySelector('#ww-season').addEventListener('change', loadWW);
    el.querySelector('#ww-window').addEventListener('change', loadWW);
    loadWW();
  }});

  // ===== SCARCITY =====
  defs.push({ name: 'scarcity', render: function(el) {
    el.innerHTML = '<div class="lp-page">' +
      '<div class="lp-header"><h2>Positional Scarcity</h2>' +
      '<div class="lp-subtitle">where the cliff hits hardest</div></div>' +
      '<div class="lp-controls">' +
      '<select class="lp-select" id="sc-season" aria-label="Season"></select>' +
      '</div>' +
      '<div id="sc-body"><div class="lp-loading">running the numbers...</div></div>' +
      '</div>';

    var seasonsPopulated = false;
    var POS_ANNOTATIONS = { QB: 'signal callers', RB: 'the backfield', WR: 'route runners', TE: 'the unicorns' };

    function loadSC() {
      var body = el.querySelector('#sc-body');
      body.innerHTML = '<div class="lp-loading">running the numbers...</div>';
      var season = el.querySelector('#sc-season').value;
      var url = season ? '/api/positional-scarcity?season=' + season : '/api/positional-scarcity';

      fetch(url).then(function(r) { if (!r.ok) throw new Error('API error'); return r.json(); }).then(function(data) {
        if (!seasonsPopulated && data.available_seasons) {
          var sel = el.querySelector('#sc-season');
          data.available_seasons.forEach(function(s) {
            var o = document.createElement('option');
            o.value = s; o.textContent = s;
            if (s === data.season) o.selected = true;
            sel.appendChild(o);
          });
          seasonsPopulated = true;
        }

        var positions = data.positions;
        var ranking = data.scarcity_ranking || [];

        // Summary cards
        var html = '<div class="scarcity-summary">';
        ranking.forEach(function(r, i) {
          var pos = r.position.toLowerCase();
          var label = i === 0 ? 'most scarce' : i === ranking.length - 1 ? 'most replaceable' : '#' + (i + 1) + ' scarcity';
          html += '<div class="scarcity-summary-card">' +
            '<div class="scarcity-summary-pos ' + pos + '">' + escapeHtml(r.position) + '</div>' +
            '<div class="scarcity-summary-dropoff">' + escapeHtml(String(r.drop_off)) + ' <span style="font-size:11px;color:var(--ink-light)">PPG</span></div>' +
            '<div class="scarcity-summary-label">' + escapeHtml(label) + '</div>' +
            '<div class="scarcity-summary-range">' + escapeHtml(String(r.top_ppg)) + ' &rarr; ' + escapeHtml(String(r.replacement_ppg)) + ' PPG</div></div>';
        });
        html += '</div>';

        // Position charts
        html += '<div class="scarcity-grid">';
        ['QB', 'RB', 'WR', 'TE'].forEach(function(pos) {
          var pd = positions[pos];
          if (!pd) return;
          var pl = pos.toLowerCase();
          var maxPpg = pd.top_ppg || 1;

          html += '<div class="scarcity-card"><div class="scarcity-card-header ' + pl + '">';
          html += '<div class="scarcity-card-title">' + escapeHtml(pos) + ' Drop-off</div>';
          html += '<div class="scarcity-card-annotation">' + escapeHtml(POS_ANNOTATIONS[pos] || '') + '</div></div>';
          html += '<div class="scarcity-chart">';

          var tierBreaks = pd.tier_breaks || [];
          var nextBreakIdx = 0;

          pd.players.forEach(function(p) {
            while (nextBreakIdx < tierBreaks.length && p.rank > tierBreaks[nextBreakIdx].end) {
              var tb = tierBreaks[nextBreakIdx];
              html += '<div class="scarcity-tier-break"><div class="scarcity-tier-line"></div>';
              html += '<div class="scarcity-tier-label">' + escapeHtml(tb.annotation || tb.label) + '</div>';
              html += '<div class="scarcity-tier-line"></div></div>';
              nextBreakIdx++;
            }
            var pct = maxPpg > 0 ? (p.ppg / maxPpg) * 100 : 0;
            html += '<div class="scarcity-bar-row" data-pid="' + escapeAttr(p.player_id) + '" title="' + escapeAttr(p.name + ' (' + p.team + ') — ' + p.ppg + ' PPG') + '">';
            html += '<div class="scarcity-bar-rank">' + escapeHtml(String(p.rank)) + '</div>';
            html += '<div class="scarcity-bar-name">' + escapeHtml(p.name) + '</div>';
            html += '<div class="scarcity-bar-track"><div class="scarcity-bar-fill ' + pl + '" style="width:' + pct.toFixed(1) + '%"></div></div>';
            html += '<div class="scarcity-bar-ppg">' + escapeHtml(String(p.ppg)) + '</div></div>';
          });

          while (nextBreakIdx < tierBreaks.length) {
            var tb2 = tierBreaks[nextBreakIdx];
            html += '<div class="scarcity-tier-break"><div class="scarcity-tier-line"></div>';
            html += '<div class="scarcity-tier-label">' + escapeHtml(tb2.annotation || tb2.label) + '</div>';
            html += '<div class="scarcity-tier-line"></div></div>';
            nextBreakIdx++;
          }
          html += '</div></div>';
        });
        html += '</div>';

        body.innerHTML = html;

        body.querySelectorAll('.scarcity-bar-row[data-pid]').forEach(function(row) {
          row.addEventListener('click', function() {
            window.location.href = '/player/' + encodeURIComponent(row.getAttribute('data-pid'));
          });
        });
      }).catch(function() { body.innerHTML = '<div class="lp-empty">failed to load scarcity data</div>'; });
    }

    el.querySelector('#sc-season').addEventListener('change', loadSC);
    loadSC();
  }});

  // ===== HANDCUFFS =====
  defs.push({ name: 'handcuffs', render: function(el) {
    el.innerHTML = '<div class="lp-page">' +
      '<div class="lp-header"><h2>Handcuff Rankings</h2>' +
      '<div class="lp-subtitle">most valuable backup RBs by team rushing volume</div></div>' +
      '<div class="lp-controls">' +
      '<select class="lp-select" id="hc-season" aria-label="Season"></select>' +
      '</div>' +
      '<div id="hc-body"><div class="lp-loading">pulling film...</div></div>' +
      '</div>';

    var seasonsPopulated = false;

    function loadHC() {
      var body = el.querySelector('#hc-body');
      body.innerHTML = '<div class="lp-loading">pulling film...</div>';
      var season = el.querySelector('#hc-season').value;
      var url = '/api/handcuffs';
      if (season) url += '?season=' + encodeURIComponent(season);

      fetch(url).then(function(r) { if (!r.ok) throw new Error('API error'); return r.json(); }).then(function(data) {
        if (!seasonsPopulated) {
          var sel = el.querySelector('#hc-season');
          sel.innerHTML = '';
          for (var y = 2024; y >= 2020; y--) {
            var o = document.createElement('option');
            o.value = y; o.textContent = y;
            if (y === data.season) o.selected = true;
            sel.appendChild(o);
          }
          seasonsPopulated = true;
        }

        var hcs = data.handcuffs || [];
        if (!hcs.length) {
          body.innerHTML = '<div class="hc-card"><div class="hc-card-header">Handcuff Rankings</div><div class="lp-empty">no handcuff data found</div></div>';
          return;
        }

        var html = '<div class="hc-card"><div class="hc-card-header">Handcuff Rankings (' + escapeHtml(String(data.count)) + ' teams)</div>';
        html += '<table class="hc-table"><thead><tr>';
        html += '<th>#</th><th>Team</th><th>Handcuff</th><th>HC PPG</th><th>HC Car/G</th><th>HC YPC</th><th>Value</th><th>Starter</th><th>Str PPG</th><th>Str Car/G</th><th>Team Rush/G</th>';
        html += '</tr></thead><tbody>';

        for (var i = 0; i < hcs.length; i++) {
          var h = hcs[i];
          html += '<tr>';
          html += '<td class="hc-rank">' + (i + 1) + '</td>';
          html += '<td><span class="hc-team-badge">' + escapeHtml(h.team) + '</span></td>';
          html += '<td style="font-weight:700">' + escapeHtml(h.handcuff_name) + '</td>';
          html += '<td style="font-weight:700;color:#166534">' + fmt(h.hc_ppg) + '</td>';
          html += '<td>' + fmt(h.hc_car_g) + '</td>';
          html += '<td>' + fmt(h.hc_ypc) + '</td>';
          html += '<td><span class="hc-value-badge">' + fmt(h.hc_value) + '</span></td>';
          html += '<td class="hc-starter">' + escapeHtml(h.starter_name) + '</td>';
          html += '<td class="hc-starter">' + fmt(h.starter_ppg) + '</td>';
          html += '<td class="hc-starter">' + fmt(h.starter_car_g) + '</td>';
          html += '<td>' + fmt(h.team_rush_g) + '</td>';
          html += '</tr>';
        }

        html += '</tbody></table></div>';
        body.innerHTML = html;
      }).catch(function() { body.innerHTML = '<div class="lp-empty">failed to load handcuff data</div>'; });
    }

    el.querySelector('#hc-season').addEventListener('change', loadHC);
    loadHC();
  }});

  /* ===================================================================
     PERFORMANCE PANELS (8 native panel render functions)
     =================================================================== */

  // ===== 1. EFFICIENCY =====
  defs.push({ name: 'efficiency', render: function(el) {
    el.innerHTML = '<div class="lp-page">' +
      '<div class="lp-header"><h2>Fantasy Efficiency</h2>' +
      '<div class="lp-subtitle">who does more with less, and who gets fed the most</div></div>' +
      '<div class="lp-controls">' +
      '<div class="lp-pos-tabs" id="eff-pos-tabs">' +
      '<button class="lp-pos-tab active" data-pos="">All</button>' +
      '<button class="lp-pos-tab" data-pos="QB">QB</button>' +
      '<button class="lp-pos-tab" data-pos="RB">RB</button>' +
      '<button class="lp-pos-tab" data-pos="WR">WR</button>' +
      '<button class="lp-pos-tab" data-pos="TE">TE</button>' +
      '</div>' +
      '<select class="lp-select" id="eff-season" aria-label="Season"></select>' +
      '</div>' +
      '<div id="eff-body"><div class="lp-loading">running the numbers...</div></div>' +
      '</div>';

    var curPos = '';
    var seasonsPopulated = false;
    var currentData = null;
    var sortState = {
      most_efficient: { col: 'ppo', dir: -1 },
      volume_kings: { col: 'opportunities', dir: -1 }
    };

    function gradeClass(grade) {
      if (!grade) return 'grade-f';
      var g = grade.charAt(0);
      if (g === 'A') return grade === 'A+' ? 'grade-aplus' : 'grade-a';
      if (g === 'B') return 'grade-b';
      if (g === 'C') return 'grade-c';
      if (g === 'D') return 'grade-d';
      return 'grade-f';
    }

    var EFF_COLUMNS = [
      { key: 'name', label: 'Player' },
      { key: 'ppo', label: 'PPO', tip: 'Fantasy points per opportunity' },
      { key: 'grade', label: 'Grade', tip: 'Efficiency grade based on PPO percentile' },
      { key: 'yards_per_touch', label: 'YPT', tip: 'Yards per touch' },
      { key: 'catch_rate', label: 'Catch%', tip: 'Catch rate' },
      { key: 'yac_per_rec', label: 'YAC/R', tip: 'Yards after catch per reception', hide: true },
      { key: 'td_rate', label: 'TD%', tip: 'TD rate per touch', hide: true },
      { key: 'opportunities', label: 'Opps', tip: 'Total opportunities' },
      { key: 'ppg', label: 'PPG', tip: 'Fantasy points per game' },
      { key: 'games', label: 'GP', hide: true }
    ];

    var VOL_COLUMNS = [
      { key: 'name', label: 'Player' },
      { key: 'opportunities', label: 'Opps', tip: 'Total opportunities' },
      { key: 'touches', label: 'Touches' },
      { key: 'ppo', label: 'PPO', tip: 'Fantasy points per opportunity' },
      { key: 'grade', label: 'Grade' },
      { key: 'yards_per_touch', label: 'YPT', hide: true },
      { key: 'td_rate', label: 'TD%', hide: true },
      { key: 'ppg', label: 'PPG' },
      { key: 'total_tds', label: 'TDs' },
      { key: 'games', label: 'GP', hide: true }
    ];

    function getCols(section) { return section === 'most_efficient' ? EFF_COLUMNS : VOL_COLUMNS; }

    function buildRow(p, section) {
      var pos = (p.position || 'RB').toLowerCase();
      var cols = getCols(section);
      var h = '<tr data-pid="' + escapeAttr(p.player_id) + '">';
      cols.forEach(function(c) {
        var cls = [];
        if (c.key !== 'name') cls.push('center');
        if (c.hide) cls.push('hide-mobile');
        if (c.key === 'name') {
          h += '<td><div class="eff-player-cell">';
          if (p.headshot_url) h += '<img class="eff-headshot" src="' + escapeAttr(p.headshot_url) + '" alt="" loading="lazy" onerror="this.style.display=\'none\'">';
          h += '<div class="eff-player-info"><div class="eff-player-name">' + escapeHtml(p.name) + '</div>';
          h += '<div class="eff-player-meta"><span class="eff-pos-badge ' + pos + '">' + escapeHtml(p.position) + '</span>';
          h += '<span class="eff-team-label">' + escapeHtml(p.team) + '</span></div></div></div></td>';
        } else if (c.key === 'grade') {
          var g = p.grade || 'C';
          h += '<td class="' + cls.join(' ') + '"><span class="eff-grade-badge ' + gradeClass(g) + '">' + escapeHtml(g) + '</span></td>';
        } else if (c.key === 'ppo') {
          h += '<td class="' + cls.join(' ') + '" style="font-weight:700">' + fmt(p.ppo, 2) + '</td>';
        } else if (c.key === 'ppg') {
          h += '<td class="' + cls.join(' ') + '" style="font-weight:700">' + fmt(p.ppg) + '</td>';
        } else if (c.key === 'catch_rate') {
          h += '<td class="' + cls.join(' ') + '">' + (p.catch_rate > 0 ? fmt(p.catch_rate, 1) + '%' : '-') + '</td>';
        } else if (c.key === 'td_rate') {
          h += '<td class="' + cls.join(' ') + '">' + fmt(p.td_rate, 1) + '%</td>';
        } else {
          var v = p[c.key];
          h += '<td class="' + cls.join(' ') + '">' + (v != null ? escapeHtml(String(v)) : '-') + '</td>';
        }
      });
      h += '</tr>';
      return h;
    }

    function sortPlayers(players, col, dir) {
      return players.slice().sort(function(a, b) {
        var va = a[col], vb = b[col];
        if (va == null) va = -Infinity;
        if (vb == null) vb = -Infinity;
        if (typeof va === 'string') return dir * va.localeCompare(vb);
        return dir * (vb - va);
      });
    }

    function buildTable(players, section) {
      if (!players || !players.length) return '<div class="lp-empty">no ' + (section === 'most_efficient' ? 'efficient' : 'volume') + ' players found</div>';
      var isEff = section === 'most_efficient';
      var title = isEff ? 'Most Efficient' : 'Volume Kings';
      var headerClass = isEff ? 'efficient' : 'volume';
      var st = sortState[section];
      var sorted = sortPlayers(players, st.col, st.dir);
      var cols = getCols(section);

      var h = '<div class="eff-section"><div class="eff-section-header ' + headerClass + '">';
      h += '<span class="eff-section-icon ' + headerClass + '">' + (isEff ? '&#x1F3AF;' : '&#x1F4AA;') + '</span> ';
      h += title + ' <span style="font-family:var(--font-hand);font-size:16px;color:var(--ink-light);font-weight:400">(' + players.length + ' players)</span></div>';
      h += '<table class="eff-table" data-section="' + section + '"><thead><tr>';
      cols.forEach(function(c) {
        var cls = [];
        if (c.key !== 'name') cls.push('center');
        if (c.hide) cls.push('hide-mobile');
        if (st.col === c.key) cls.push('sorted');
        var arrow = st.col === c.key ? (st.dir === 1 ? ' &#9650;' : ' &#9660;') : '';
        var tipAttr = c.tip ? ' title="' + escapeAttr(c.tip) + '"' : '';
        h += '<th class="' + cls.join(' ') + '" data-sort="' + c.key + '" data-section="' + section + '"' + tipAttr + '>' + c.label + '<span class="sort-arrow">' + arrow + '</span></th>';
      });
      h += '</tr></thead><tbody>';
      sorted.forEach(function(p) { h += buildRow(p, section); });
      h += '</tbody></table></div>';
      return h;
    }

    function render(data) {
      currentData = data;
      var body = el.querySelector('#eff-body');
      if (!data || (!(data.most_efficient || []).length && !(data.volume_kings || []).length)) {
        body.innerHTML = '<div class="lp-empty">no efficiency data found</div>';
        return;
      }
      body.innerHTML = buildTable(data.most_efficient || [], 'most_efficient') + buildTable(data.volume_kings || [], 'volume_kings');
      body.querySelectorAll('th[data-sort]').forEach(function(th) {
        th.addEventListener('click', function() {
          var col = th.getAttribute('data-sort');
          var sec = th.getAttribute('data-section');
          if (sortState[sec].col === col) sortState[sec].dir *= -1;
          else { sortState[sec].col = col; sortState[sec].dir = -1; }
          render(currentData);
        });
      });
      body.querySelectorAll('tr[data-pid]').forEach(function(tr) {
        tr.addEventListener('click', function() {
          window.location.href = '/player/' + encodeURIComponent(tr.getAttribute('data-pid'));
        });
      });
    }

    function loadEFF() {
      var body = el.querySelector('#eff-body');
      body.innerHTML = '<div class="lp-loading">running the numbers...</div>';
      var season = el.querySelector('#eff-season').value;
      var url = '/api/efficiency-rankings?limit=30';
      if (season) url += '&season=' + season;
      if (curPos) url += '&position=' + curPos;

      fetch(url).then(function(r) {
        if (!r.ok) throw new Error('API error');
        return r.json();
      }).then(function(data) {
        if (!seasonsPopulated && data.available_seasons) {
          var sel = el.querySelector('#eff-season');
          data.available_seasons.forEach(function(s) {
            var o = document.createElement('option');
            o.value = s; o.textContent = s;
            if (s == data.season) o.selected = true;
            sel.appendChild(o);
          });
          seasonsPopulated = true;
        }
        render(data);
      }).catch(function() { body.innerHTML = '<div class="lp-empty">failed to load efficiency data</div>'; });
    }

    el.querySelector('#eff-pos-tabs').addEventListener('click', function(e) {
      var tab = e.target.closest('.lp-pos-tab');
      if (!tab) return;
      el.querySelectorAll('#eff-pos-tabs .lp-pos-tab').forEach(function(t) { t.classList.remove('active'); });
      tab.classList.add('active');
      curPos = tab.getAttribute('data-pos') || '';
      loadEFF();
    });
    el.querySelector('#eff-season').addEventListener('change', loadEFF);
    loadEFF();
  }});

  // ===== 2. CONSISTENCY =====
  defs.push({ name: 'consistency', render: function(el) {
    el.innerHTML = '<div class="lp-page">' +
      '<div class="lp-header"><h2>Consistency Rankings</h2>' +
      '<div class="lp-subtitle">the safest floors and the wildest swings, week to week</div></div>' +
      '<div class="lp-controls">' +
      '<div class="lp-pos-tabs" id="con-pos-tabs">' +
      '<button class="lp-pos-tab active" data-pos="">All</button>' +
      '<button class="lp-pos-tab" data-pos="QB">QB</button>' +
      '<button class="lp-pos-tab" data-pos="RB">RB</button>' +
      '<button class="lp-pos-tab" data-pos="WR">WR</button>' +
      '<button class="lp-pos-tab" data-pos="TE">TE</button>' +
      '</div>' +
      '<select class="lp-select" id="con-season" aria-label="Season"></select>' +
      '</div>' +
      '<div id="con-body"><div class="lp-loading">checking the tape...</div></div>' +
      '</div>';

    var curPos = '';
    var seasonsPopulated = false;
    var currentData = null;
    var sortState = {
      rock_solid: { col: 'cov', dir: 1 },
      wild_cards: { col: 'cov', dir: -1 }
    };

    function gradeClass(grade) {
      if (!grade) return 'grade-f';
      var g = grade.charAt(0);
      if (g === 'A') return grade === 'A+' ? 'grade-aplus' : 'grade-a';
      if (g === 'B') return 'grade-b';
      if (g === 'C') return 'grade-c';
      if (g === 'D') return 'grade-d';
      return 'grade-f';
    }

    var SOLID_COLS = [
      { key: 'name', label: 'Player' },
      { key: 'ppg', label: 'PPG' },
      { key: 'grade', label: 'Grade' },
      { key: 'stddev', label: 'StdDev' },
      { key: 'cov', label: 'CoV%' },
      { key: 'floor', label: 'Floor' },
      { key: 'ceiling', label: 'Ceiling', hide: true },
      { key: 'range', label: 'Range', hide: true },
      { key: 'games', label: 'GP', hide: true }
    ];

    var WILD_COLS = [
      { key: 'name', label: 'Player' },
      { key: 'ppg', label: 'PPG' },
      { key: 'grade', label: 'Grade' },
      { key: 'stddev', label: 'StdDev' },
      { key: 'cov', label: 'CoV%' },
      { key: 'floor', label: 'Floor' },
      { key: 'ceiling', label: 'Ceiling' },
      { key: 'range', label: 'Range', hide: true },
      { key: 'games', label: 'GP', hide: true }
    ];

    function getCols(section) { return section === 'rock_solid' ? SOLID_COLS : WILD_COLS; }

    function buildRow(p, section) {
      var pos = (p.position || 'RB').toLowerCase();
      var cols = getCols(section);
      var h = '<tr data-pid="' + escapeAttr(p.player_id) + '">';
      cols.forEach(function(c) {
        var cls = [];
        if (c.key !== 'name') cls.push('center');
        if (c.hide) cls.push('hide-mobile');
        if (c.key === 'name') {
          h += '<td><div class="con-player-cell">';
          if (p.headshot_url) h += '<img class="con-headshot" src="' + escapeAttr(p.headshot_url) + '" alt="" loading="lazy" onerror="this.style.display=\'none\'">';
          h += '<div class="con-player-info"><div class="con-player-name">' + escapeHtml(p.name) + '</div>';
          h += '<div class="con-player-meta"><span class="con-pos-badge ' + pos + '">' + escapeHtml(p.position) + '</span>';
          h += '<span class="con-team-label">' + escapeHtml(p.team) + '</span></div></div></div></td>';
        } else if (c.key === 'grade') {
          var g = p.grade || 'C';
          h += '<td class="' + cls.join(' ') + '"><span class="con-grade-badge ' + gradeClass(g) + '">' + escapeHtml(g) + '</span></td>';
        } else if (c.key === 'ppg') {
          h += '<td class="' + cls.join(' ') + '" style="font-weight:700">' + fmt(p.ppg) + '</td>';
        } else if (c.key === 'cov') {
          h += '<td class="' + cls.join(' ') + '" style="font-weight:700">' + fmt(p.cov * 100, 1) + '%</td>';
        } else if (c.key === 'floor') {
          h += '<td class="' + cls.join(' ') + '" style="color:var(--green)">' + fmt(p.floor) + '</td>';
        } else if (c.key === 'ceiling') {
          h += '<td class="' + cls.join(' ') + '" style="color:var(--blue)">' + fmt(p.ceiling) + '</td>';
        } else {
          var v = p[c.key];
          h += '<td class="' + cls.join(' ') + '">' + (v != null ? fmt(v) : '-') + '</td>';
        }
      });
      h += '</tr>';
      return h;
    }

    function sortPlayers(players, col, dir) {
      return players.slice().sort(function(a, b) {
        var va = a[col], vb = b[col];
        if (va == null) va = -Infinity;
        if (vb == null) vb = -Infinity;
        if (typeof va === 'string') return dir * va.localeCompare(vb);
        return dir * (vb - va);
      });
    }

    function buildTable(players, section) {
      if (!players || !players.length) return '<div class="lp-empty">no ' + (section === 'rock_solid' ? 'consistent' : 'volatile') + ' players found</div>';
      var isSolid = section === 'rock_solid';
      var title = isSolid ? 'Rock Solid' : 'Wild Cards';
      var headerClass = isSolid ? 'solid' : 'wild';
      var st = sortState[section];
      var sorted = sortPlayers(players, st.col, st.dir);
      var cols = getCols(section);

      var h = '<div class="con-section"><div class="con-section-header ' + headerClass + '">';
      h += '<span class="con-section-icon ' + headerClass + '">' + (isSolid ? '&#x1F3AF;' : '&#x1F3B2;') + '</span> ';
      h += title + ' <span style="font-family:var(--font-hand);font-size:16px;color:var(--ink-light);font-weight:400">(' + players.length + ' players)</span></div>';
      h += '<table class="con-table" data-section="' + section + '"><thead><tr>';
      cols.forEach(function(c) {
        var cls = [];
        if (c.key !== 'name') cls.push('center');
        if (c.hide) cls.push('hide-mobile');
        if (st.col === c.key) cls.push('sorted');
        var arrow = st.col === c.key ? (st.dir === 1 ? ' &#9650;' : ' &#9660;') : '';
        h += '<th class="' + cls.join(' ') + '" data-sort="' + c.key + '" data-section="' + section + '">' + c.label + '<span class="sort-arrow">' + arrow + '</span></th>';
      });
      h += '</tr></thead><tbody>';
      sorted.forEach(function(p) { h += buildRow(p, section); });
      h += '</tbody></table></div>';
      return h;
    }

    function render(data) {
      currentData = data;
      var body = el.querySelector('#con-body');
      if (!data || (!(data.rock_solid || []).length && !(data.wild_cards || []).length)) {
        body.innerHTML = '<div class="lp-empty">no consistency data found</div>';
        return;
      }
      body.innerHTML = buildTable(data.rock_solid || [], 'rock_solid') + buildTable(data.wild_cards || [], 'wild_cards');
      body.querySelectorAll('th[data-sort]').forEach(function(th) {
        th.addEventListener('click', function() {
          var col = th.getAttribute('data-sort');
          var sec = th.getAttribute('data-section');
          if (sortState[sec].col === col) sortState[sec].dir *= -1;
          else { sortState[sec].col = col; sortState[sec].dir = -1; }
          render(currentData);
        });
      });
      body.querySelectorAll('tr[data-pid]').forEach(function(tr) {
        tr.addEventListener('click', function() {
          window.location.href = '/player/' + encodeURIComponent(tr.getAttribute('data-pid'));
        });
      });
    }

    function loadCON() {
      var body = el.querySelector('#con-body');
      body.innerHTML = '<div class="lp-loading">checking the tape...</div>';
      var season = el.querySelector('#con-season').value;
      var url = '/api/consistency-rankings?limit=30';
      if (season) url += '&season=' + season;
      if (curPos) url += '&position=' + curPos;

      fetch(url).then(function(r) {
        if (!r.ok) throw new Error('API error');
        return r.json();
      }).then(function(data) {
        if (!seasonsPopulated && data.available_seasons) {
          var sel = el.querySelector('#con-season');
          data.available_seasons.forEach(function(s) {
            var o = document.createElement('option');
            o.value = s; o.textContent = s;
            if (s == data.season) o.selected = true;
            sel.appendChild(o);
          });
          seasonsPopulated = true;
        }
        render(data);
      }).catch(function() { body.innerHTML = '<div class="lp-empty">failed to load consistency data</div>'; });
    }

    el.querySelector('#con-pos-tabs').addEventListener('click', function(e) {
      var tab = e.target.closest('.lp-pos-tab');
      if (!tab) return;
      el.querySelectorAll('#con-pos-tabs .lp-pos-tab').forEach(function(t) { t.classList.remove('active'); });
      tab.classList.add('active');
      curPos = tab.getAttribute('data-pos') || '';
      loadCON();
    });
    el.querySelector('#con-season').addEventListener('change', loadCON);
    loadCON();
  }});

  // ===== 3. SNAP EFFICIENCY =====
  defs.push({ name: 'snapefficiency', render: function(el) {
    el.innerHTML = '<div class="lp-page">' +
      '<div class="lp-header"><h2>Snap Efficiency</h2>' +
      '<div class="lp-subtitle">fantasy points per snap — who maximizes every snap they play?</div></div>' +
      '<div class="lp-controls">' +
      '<div class="lp-pos-tabs" id="se-pos-tabs">' +
      '<button class="lp-pos-tab active" data-pos="">All</button>' +
      '<button class="lp-pos-tab" data-pos="QB">QB</button>' +
      '<button class="lp-pos-tab" data-pos="RB">RB</button>' +
      '<button class="lp-pos-tab" data-pos="WR">WR</button>' +
      '<button class="lp-pos-tab" data-pos="TE">TE</button>' +
      '</div>' +
      '<select class="lp-select" id="se-season" aria-label="Season"></select>' +
      '</div>' +
      '<div id="se-body"><div class="lp-loading">pulling film...</div></div>' +
      '</div>';

    var curPos = '';
    var seasonsPopulated = false;

    function effClass(pps) {
      if (pps >= 0.5) return 'se-eff-elite';
      if (pps >= 0.35) return 'se-eff-high';
      if (pps >= 0.2) return 'se-eff-mid';
      return 'se-eff-low';
    }

    function loadSE() {
      var body = el.querySelector('#se-body');
      body.innerHTML = '<div class="lp-loading">pulling film...</div>';
      var season = el.querySelector('#se-season').value;
      var url = '/api/snap-efficiency';
      if (season) url += '?season=' + season;
      else url += '?season=' + new Date().getFullYear();
      if (curPos) url += '&position=' + curPos;

      fetch(url).then(function(r) {
        if (!r.ok) throw new Error('API error');
        return r.json();
      }).then(function(data) {
        if (!seasonsPopulated) {
          var sel = el.querySelector('#se-season');
          for (var y = new Date().getFullYear(); y >= 2020; y--) {
            var o = document.createElement('option');
            o.value = y; o.textContent = y;
            if (data.season && y == data.season) o.selected = true;
            sel.appendChild(o);
          }
          seasonsPopulated = true;
        }
        var players = data.players || [];
        if (!players.length) { body.innerHTML = '<div class="lp-empty">no snap efficiency data found</div>'; return; }

        var maxPPS = Math.max.apply(null, players.map(function(p) { return p.pts_per_snap; }));
        var html = '<div class="se-card"><div class="se-card-header">Points Per Snap Rankings</div>';
        html += '<table class="se-table"><thead><tr><th>#</th><th>Player</th><th>Pos</th><th>Pts/Snap</th><th>PPG</th><th>Snaps/G</th><th>Snaps</th><th>GP</th><th></th></tr></thead><tbody>';
        for (var i = 0; i < players.length; i++) {
          var p = players[i];
          var posColor = POS_COLORS[p.position] || '#333';
          var cls = effClass(p.pts_per_snap);
          var barPct = maxPPS > 0 ? p.pts_per_snap / maxPPS * 100 : 0;
          html += '<tr>';
          html += '<td class="se-rank">' + (i + 1) + '</td>';
          html += '<td>' + escapeHtml(p.name) + ' <span style="color:var(--ink-light);font-size:10px">' + escapeHtml(p.team) + '</span></td>';
          html += '<td><span class="se-pos-badge" style="background:' + posColor + '">' + escapeHtml(p.position) + '</span></td>';
          html += '<td><span class="se-eff-badge ' + cls + '">' + fmt(p.pts_per_snap, 3) + '</span></td>';
          html += '<td>' + fmt(p.ppg) + '</td>';
          html += '<td>' + fmt(p.snaps_pg) + '</td>';
          html += '<td>' + escapeHtml(String(p.snaps)) + '</td>';
          html += '<td>' + escapeHtml(String(p.games)) + '</td>';
          html += '<td class="se-bar-cell"><div class="se-bar" style="width:' + barPct + '%"></div></td>';
          html += '</tr>';
        }
        html += '</tbody></table></div>';
        body.innerHTML = html;
      }).catch(function() { body.innerHTML = '<div class="lp-empty">failed to load snap efficiency data</div>'; });
    }

    el.querySelector('#se-pos-tabs').addEventListener('click', function(e) {
      var tab = e.target.closest('.lp-pos-tab');
      if (!tab) return;
      el.querySelectorAll('#se-pos-tabs .lp-pos-tab').forEach(function(t) { t.classList.remove('active'); });
      tab.classList.add('active');
      curPos = tab.getAttribute('data-pos') || '';
      loadSE();
    });
    el.querySelector('#se-season').addEventListener('change', loadSE);
    loadSE();
  }});

  // ===== 4. WORKLOAD =====
  defs.push({ name: 'workload', render: function(el) {
    el.innerHTML = '<div class="lp-page">' +
      '<div class="lp-header"><h2>Workload Monitor</h2>' +
      '<div class="lp-subtitle">who\'s carrying the heaviest load?</div></div>' +
      '<div class="lp-controls">' +
      '<div class="lp-pos-tabs" id="wl-pos-tabs">' +
      '<button class="lp-pos-tab active" data-pos="">All</button>' +
      '<button class="lp-pos-tab" data-pos="QB">QB</button>' +
      '<button class="lp-pos-tab" data-pos="RB">RB</button>' +
      '<button class="lp-pos-tab" data-pos="WR">WR</button>' +
      '<button class="lp-pos-tab" data-pos="TE">TE</button>' +
      '</div>' +
      '<select class="lp-select" id="wl-season" aria-label="Season"></select>' +
      '</div>' +
      '<div id="wl-body"><div class="lp-loading">pulling film...</div></div>' +
      '</div>';

    var curPos = '';
    var seasonsPopulated = false;

    function scoreClass(s) {
      if (s >= 80) return 'wl-score-high';
      if (s >= 50) return 'wl-score-mid';
      return 'wl-score-low';
    }

    function loadWL() {
      var body = el.querySelector('#wl-body');
      body.innerHTML = '<div class="lp-loading">pulling film...</div>';
      var season = el.querySelector('#wl-season').value;
      var url = '/api/workload-monitor';
      if (season) url += '?season=' + season;
      else url += '?season=' + new Date().getFullYear();
      if (curPos) url += '&position=' + curPos;

      fetch(url).then(function(r) {
        if (!r.ok) throw new Error('API error');
        return r.json();
      }).then(function(data) {
        if (!seasonsPopulated) {
          var sel = el.querySelector('#wl-season');
          for (var y = new Date().getFullYear(); y >= 2020; y--) {
            var o = document.createElement('option');
            o.value = y; o.textContent = y;
            if (data.season && y == data.season) o.selected = true;
            sel.appendChild(o);
          }
          seasonsPopulated = true;
        }
        var players = data.players || [];
        if (!players.length) { body.innerHTML = '<div class="lp-empty">no workload data found</div>'; return; }

        var maxWL = Math.max.apply(null, players.map(function(p) { return p.workload; }));
        var html = '<div class="wl-card"><div class="wl-card-header">Workload Rankings</div>';
        html += '<table class="wl-table"><thead><tr><th>#</th><th>Player</th><th>Pos</th><th>Load</th><th>Tch/G</th><th>Snp/G</th><th>Snp%</th><th>Car/G</th><th>Tgt/G</th><th>Flags</th><th></th></tr></thead><tbody>';
        for (var i = 0; i < players.length; i++) {
          var p = players[i];
          var posColor = POS_COLORS[p.position] || '#333';
          var cls = scoreClass(p.workload);
          var barPct = maxWL > 0 ? p.workload / maxWL * 100 : 0;
          var flagsHtml = (p.flags || []).map(function(f) { return '<span class="wl-flag">' + escapeHtml(f) + '</span>'; }).join('');
          var snapPct = p.snap_pct != null ? escapeHtml(String(p.snap_pct)) + '%' : '-';
          html += '<tr>';
          html += '<td class="wl-rank">' + (i + 1) + '</td>';
          html += '<td>' + escapeHtml(p.name) + ' <span style="color:var(--ink-light);font-size:10px">' + escapeHtml(p.team) + '</span></td>';
          html += '<td><span class="wl-pos-badge" style="background:' + posColor + '">' + escapeHtml(p.position) + '</span></td>';
          html += '<td><span class="wl-score-badge ' + cls + '">' + escapeHtml(String(p.workload)) + '</span></td>';
          html += '<td>' + fmt(p.touches_pg) + '</td>';
          html += '<td>' + fmt(p.snaps_pg) + '</td>';
          html += '<td>' + snapPct + '</td>';
          html += '<td>' + fmt(p.carries_pg) + '</td>';
          html += '<td>' + fmt(p.targets_pg) + '</td>';
          html += '<td style="text-align:left">' + flagsHtml + '</td>';
          html += '<td class="wl-bar-cell"><div class="wl-bar" style="width:' + barPct + '%"></div></td>';
          html += '</tr>';
        }
        html += '</tbody></table></div>';
        body.innerHTML = html;
      }).catch(function() { body.innerHTML = '<div class="lp-empty">failed to load workload data</div>'; });
    }

    el.querySelector('#wl-pos-tabs').addEventListener('click', function(e) {
      var tab = e.target.closest('.lp-pos-tab');
      if (!tab) return;
      el.querySelectorAll('#wl-pos-tabs .lp-pos-tab').forEach(function(t) { t.classList.remove('active'); });
      tab.classList.add('active');
      curPos = tab.getAttribute('data-pos') || '';
      loadWL();
    });
    el.querySelector('#wl-season').addEventListener('change', loadWL);
    loadWL();
  }});

  // ===== 5. DUAL-THREAT =====
  defs.push({ name: 'dualthreat', render: function(el) {
    el.innerHTML = '<div class="lp-page">' +
      '<div class="lp-header"><h2>Dual-Threat Index</h2>' +
      '<div class="lp-subtitle">rush + rec versatility — who contributes in both dimensions?</div></div>' +
      '<div class="lp-controls">' +
      '<div class="lp-pos-tabs" id="dt-pos-tabs">' +
      '<button class="lp-pos-tab active" data-pos="">All</button>' +
      '<button class="lp-pos-tab" data-pos="QB">QB</button>' +
      '<button class="lp-pos-tab" data-pos="RB">RB</button>' +
      '<button class="lp-pos-tab" data-pos="WR">WR</button>' +
      '<button class="lp-pos-tab" data-pos="TE">TE</button>' +
      '</div>' +
      '<select class="lp-select" id="dt-season" aria-label="Season"></select>' +
      '</div>' +
      '<div id="dt-body"><div class="lp-loading">pulling film...</div></div>' +
      '</div>';

    var curPos = '';
    var seasonsPopulated = false;

    function dtiClass(dti) {
      if (dti >= 40) return 'dt-dti-elite';
      if (dti >= 25) return 'dt-dti-high';
      if (dti >= 15) return 'dt-dti-mid';
      return 'dt-dti-low';
    }

    function loadDT() {
      var body = el.querySelector('#dt-body');
      body.innerHTML = '<div class="lp-loading">pulling film...</div>';
      var season = el.querySelector('#dt-season').value;
      var url = '/api/dual-threat';
      if (season) url += '?season=' + season;
      else url += '?season=' + new Date().getFullYear();
      if (curPos) url += '&position=' + curPos;

      fetch(url).then(function(r) {
        if (!r.ok) throw new Error('API error');
        return r.json();
      }).then(function(data) {
        if (!seasonsPopulated) {
          var sel = el.querySelector('#dt-season');
          for (var y = new Date().getFullYear(); y >= 2020; y--) {
            var o = document.createElement('option');
            o.value = y; o.textContent = y;
            if (data.season && y == data.season) o.selected = true;
            sel.appendChild(o);
          }
          seasonsPopulated = true;
        }
        var players = data.players || [];
        if (!players.length) { body.innerHTML = '<div class="lp-empty">no dual-threat players found</div>'; return; }

        var html = '<div class="dt-card"><div class="dt-card-header">Dual-Threat Rankings</div>';
        html += '<table class="dt-table"><thead><tr><th>#</th><th>Player</th><th>Pos</th><th>DTI</th><th>Rush/G</th><th>Rec/G</th><th>Tot/G</th><th>Car/G</th><th>Rec/G</th><th>Split</th></tr></thead><tbody>';
        for (var i = 0; i < players.length; i++) {
          var p = players[i];
          var posColor = POS_COLORS[p.position] || '#333';
          var cls = dtiClass(p.dti);
          html += '<tr>';
          html += '<td class="dt-rank">' + (i + 1) + '</td>';
          html += '<td>' + escapeHtml(p.name) + ' <span style="color:var(--ink-light);font-size:10px">' + escapeHtml(p.team) + '</span></td>';
          html += '<td><span class="dt-pos-badge" style="background:' + posColor + '">' + escapeHtml(p.position) + '</span></td>';
          html += '<td><span class="dt-dti-badge ' + cls + '">' + escapeHtml(String(p.dti)) + '</span></td>';
          html += '<td>' + fmt(p.rush_yd_pg) + '</td>';
          html += '<td>' + fmt(p.rec_yd_pg) + '</td>';
          html += '<td style="font-weight:700">' + fmt(p.total_yd_pg) + '</td>';
          html += '<td>' + fmt(p.carries_pg) + '</td>';
          html += '<td>' + fmt(p.rec_pg) + '</td>';
          html += '<td class="dt-split-cell"><div class="dt-split-bar"><div class="dt-split-rush" style="width:' + (p.rush_pct || 0) + '%"></div><div class="dt-split-rec" style="width:' + (p.rec_pct || 0) + '%"></div></div></td>';
          html += '</tr>';
        }
        html += '</tbody></table></div>';
        body.innerHTML = html;
      }).catch(function() { body.innerHTML = '<div class="lp-empty">failed to load dual-threat data</div>'; });
    }

    el.querySelector('#dt-pos-tabs').addEventListener('click', function(e) {
      var tab = e.target.closest('.lp-pos-tab');
      if (!tab) return;
      el.querySelectorAll('#dt-pos-tabs .lp-pos-tab').forEach(function(t) { t.classList.remove('active'); });
      tab.classList.add('active');
      curPos = tab.getAttribute('data-pos') || '';
      loadDT();
    });
    el.querySelector('#dt-season').addEventListener('change', loadDT);
    loadDT();
  }});

  // ===== 6. TARGET PREMIUM =====
  defs.push({ name: 'targetpremium', render: function(el) {
    el.innerHTML = '<div class="lp-page">' +
      '<div class="lp-header"><h2>Target Premium</h2>' +
      '<div class="lp-subtitle">target quality composite — who gets the best looks?</div></div>' +
      '<div class="lp-controls">' +
      '<div class="lp-pos-tabs" id="tp-pos-tabs">' +
      '<button class="lp-pos-tab active" data-pos="">All</button>' +
      '<button class="lp-pos-tab" data-pos="WR">WR</button>' +
      '<button class="lp-pos-tab" data-pos="TE">TE</button>' +
      '<button class="lp-pos-tab" data-pos="RB">RB</button>' +
      '</div>' +
      '<select class="lp-select" id="tp-season" aria-label="Season"></select>' +
      '</div>' +
      '<div id="tp-body"><div class="lp-loading">pulling film...</div></div>' +
      '</div>';

    var curPos = '';
    var seasonsPopulated = false;

    function premiumClass(p) {
      if (p >= 75) return 'tp-premium-elite';
      if (p >= 55) return 'tp-premium-high';
      if (p >= 35) return 'tp-premium-mid';
      return 'tp-premium-low';
    }

    function loadTP() {
      var body = el.querySelector('#tp-body');
      body.innerHTML = '<div class="lp-loading">pulling film...</div>';
      var season = el.querySelector('#tp-season').value;
      var url = '/api/target-premium';
      if (season) url += '?season=' + season;
      else url += '?season=' + new Date().getFullYear();
      if (curPos) url += '&position=' + curPos;

      fetch(url).then(function(r) {
        if (!r.ok) throw new Error('API error');
        return r.json();
      }).then(function(data) {
        if (!seasonsPopulated) {
          var sel = el.querySelector('#tp-season');
          for (var y = new Date().getFullYear(); y >= 2020; y--) {
            var o = document.createElement('option');
            o.value = y; o.textContent = y;
            if (data.season && y == data.season) o.selected = true;
            sel.appendChild(o);
          }
          seasonsPopulated = true;
        }
        var players = data.players || [];
        if (!players.length) { body.innerHTML = '<div class="lp-empty">no target premium data found</div>'; return; }

        var html = '<div class="tp-card"><div class="tp-card-header">Target Quality Rankings</div>';
        html += '<table class="tp-table"><thead><tr><th>#</th><th>Player</th><th>Pos</th><th>Premium</th><th>Tgt/G</th><th>aDOT</th><th>Catch%</th><th>YAC/R</th><th>Y/Tgt</th><th></th></tr></thead><tbody>';
        for (var i = 0; i < players.length; i++) {
          var p = players[i];
          var posColor = POS_COLORS[p.position] || '#333';
          var cls = premiumClass(p.premium);
          html += '<tr>';
          html += '<td class="tp-rank">' + (i + 1) + '</td>';
          html += '<td>' + escapeHtml(p.name) + ' <span style="color:var(--ink-light);font-size:10px">' + escapeHtml(p.team) + '</span></td>';
          html += '<td><span class="tp-pos-badge" style="background:' + posColor + '">' + escapeHtml(p.position) + '</span></td>';
          html += '<td><span class="tp-premium-badge ' + cls + '">' + escapeHtml(String(p.premium)) + '</span></td>';
          html += '<td>' + fmt(p.targets_pg) + '</td>';
          html += '<td>' + fmt(p.adot) + '</td>';
          html += '<td>' + fmt(p.catch_rate) + '%</td>';
          html += '<td>' + fmt(p.yac_per_rec) + '</td>';
          html += '<td>' + fmt(p.ypt) + '</td>';
          html += '<td class="tp-bar-cell"><div class="tp-bar" style="width:' + (p.premium || 0) + '%"></div></td>';
          html += '</tr>';
        }
        html += '</tbody></table></div>';
        body.innerHTML = html;
      }).catch(function() { body.innerHTML = '<div class="lp-empty">failed to load target premium data</div>'; });
    }

    el.querySelector('#tp-pos-tabs').addEventListener('click', function(e) {
      var tab = e.target.closest('.lp-pos-tab');
      if (!tab) return;
      el.querySelectorAll('#tp-pos-tabs .lp-pos-tab').forEach(function(t) { t.classList.remove('active'); });
      tab.classList.add('active');
      curPos = tab.getAttribute('data-pos') || '';
      loadTP();
    });
    el.querySelector('#tp-season').addEventListener('change', loadTP);
    loadTP();
  }});

  // ===== 7. DROP RATE =====
  defs.push({ name: 'drops', render: function(el) {
    el.innerHTML = '<div class="lp-page">' +
      '<div class="lp-header"><h2>Drop Rate</h2>' +
      '<div class="lp-subtitle">sure hands vs butterfingers</div></div>' +
      '<div class="lp-controls">' +
      '<div class="lp-pos-tabs" id="dr-pos-tabs">' +
      '<button class="lp-pos-tab active" data-pos="">All</button>' +
      '<button class="lp-pos-tab" data-pos="WR">WR</button>' +
      '<button class="lp-pos-tab" data-pos="TE">TE</button>' +
      '<button class="lp-pos-tab" data-pos="RB">RB</button>' +
      '</div>' +
      '<select class="lp-select" id="dr-season" aria-label="Season"></select>' +
      '</div>' +
      '<div id="dr-body"><div class="lp-loading">pulling film...</div></div>' +
      '</div>';

    var curPos = '';
    var seasonsPopulated = false;

    function rateClass(r, good) {
      if (good) {
        if (r <= 4) return 'dr-rate-good';
        if (r <= 6) return 'dr-rate-mid';
        return 'dr-rate-bad';
      }
      if (r >= 20) return 'dr-rate-bad';
      if (r >= 15) return 'dr-rate-mid';
      return 'dr-rate-good';
    }

    function renderDropTable(players, type) {
      if (!players.length) return '<div class="lp-empty">no ' + (type === 'sure' ? 'sure hands' : 'butterfingers') + ' found</div>';
      var maxDrops = Math.max.apply(null, players.map(function(p) { return p.drops; }));
      var barCls = type === 'sure' ? 'dr-bar-good' : 'dr-bar-bad';
      var isGood = type === 'sure';

      var html = '<table class="dr-table"><thead><tr><th>#</th><th>Player</th><th>Pos</th><th>Drop%</th><th>Drops</th><th>Tgt</th><th>Catch%</th><th>YAC/R</th><th></th></tr></thead><tbody>';
      for (var i = 0; i < players.length; i++) {
        var p = players[i];
        var posColor = POS_COLORS[p.position] || '#333';
        var barPct = maxDrops > 0 ? p.drops / maxDrops * 100 : 0;
        var cls = rateClass(p.drop_rate, isGood);
        html += '<tr>';
        html += '<td class="dr-rank">' + (i + 1) + '</td>';
        html += '<td>' + escapeHtml(p.name) + ' <span style="color:var(--ink-light);font-size:10px">' + escapeHtml(p.team) + '</span></td>';
        html += '<td><span class="dr-pos-badge" style="background:' + posColor + '">' + escapeHtml(p.position) + '</span></td>';
        html += '<td><span class="dr-rate-badge ' + cls + '">' + fmt(p.drop_rate) + '%</span></td>';
        html += '<td>' + escapeHtml(String(p.drops)) + '</td>';
        html += '<td>' + escapeHtml(String(p.targets)) + '</td>';
        html += '<td>' + fmt(p.catch_rate) + '%</td>';
        html += '<td>' + fmt(p.yac_per_rec) + '</td>';
        html += '<td class="dr-bar-cell"><div class="dr-bar ' + barCls + '" style="width:' + barPct + '%"></div></td>';
        html += '</tr>';
      }
      html += '</tbody></table>';
      return html;
    }

    function loadDR() {
      var body = el.querySelector('#dr-body');
      body.innerHTML = '<div class="lp-loading">pulling film...</div>';
      var season = el.querySelector('#dr-season').value;
      var url = '/api/drop-rate';
      if (season) url += '?season=' + season;
      else url += '?season=' + new Date().getFullYear();
      if (curPos) url += '&position=' + curPos;

      fetch(url).then(function(r) {
        if (!r.ok) throw new Error('API error');
        return r.json();
      }).then(function(data) {
        if (!seasonsPopulated) {
          var sel = el.querySelector('#dr-season');
          for (var y = new Date().getFullYear(); y >= 2020; y--) {
            var o = document.createElement('option');
            o.value = y; o.textContent = y;
            if (data.season && y == data.season) o.selected = true;
            sel.appendChild(o);
          }
          seasonsPopulated = true;
        }
        var sure = data.sure_hands || [];
        var butter = data.butterfingers || [];
        if (!sure.length && !butter.length) { body.innerHTML = '<div class="lp-empty">no drop rate data found</div>'; return; }

        var html = '<div class="dr-grid">';
        html += '<div class="dr-card"><div class="dr-card-header sure">Sure Hands</div>' + renderDropTable(sure, 'sure') + '</div>';
        html += '<div class="dr-card"><div class="dr-card-header butter">Butterfingers</div>' + renderDropTable(butter, 'butter') + '</div>';
        html += '</div>';
        body.innerHTML = html;
      }).catch(function() { body.innerHTML = '<div class="lp-empty">failed to load drop rate data</div>'; });
    }

    el.querySelector('#dr-pos-tabs').addEventListener('click', function(e) {
      var tab = e.target.closest('.lp-pos-tab');
      if (!tab) return;
      el.querySelectorAll('#dr-pos-tabs .lp-pos-tab').forEach(function(t) { t.classList.remove('active'); });
      tab.classList.add('active');
      curPos = tab.getAttribute('data-pos') || '';
      loadDR();
    });
    el.querySelector('#dr-season').addEventListener('change', loadDR);
    loadDR();
  }});

  // ===== 8. GARBAGE TIME =====
  defs.push({ name: 'garbagetime', render: function(el) {
    el.innerHTML = '<div class="lp-page">' +
      '<div class="lp-header"><h2>Garbage Time Detector</h2>' +
      '<div class="lp-subtitle">stat padders vs clean producers — who inflates in blowouts?</div></div>' +
      '<div class="lp-controls">' +
      '<div class="lp-pos-tabs" id="gt-pos-tabs">' +
      '<button class="lp-pos-tab active" data-pos="">All</button>' +
      '<button class="lp-pos-tab" data-pos="QB">QB</button>' +
      '<button class="lp-pos-tab" data-pos="RB">RB</button>' +
      '<button class="lp-pos-tab" data-pos="WR">WR</button>' +
      '<button class="lp-pos-tab" data-pos="TE">TE</button>' +
      '</div>' +
      '<select class="lp-select" id="gt-season" aria-label="Season"></select>' +
      '</div>' +
      '<div id="gt-body"><div class="lp-loading">pulling film...</div></div>' +
      '</div>';

    var curPos = '';
    var seasonsPopulated = false;

    function pctClass(pct) {
      if (pct >= 20) return 'gt-pct-high';
      if (pct >= 10) return 'gt-pct-mid';
      return 'gt-pct-low';
    }

    function buildGTCard(title, cls, players, isPadders) {
      if (!players.length) {
        return '<div class="gt-card"><div class="gt-card-header ' + cls + '">' + escapeHtml(title) + '</div><div class="lp-empty">no players found</div></div>';
      }
      var maxVal = Math.max.apply(null, players.map(function(p) { return isPadders ? p.garbage_time_pct : p.ppg; }));
      var html = '<div class="gt-card"><div class="gt-card-header ' + cls + '">' + escapeHtml(title) + '</div>';
      html += '<table class="gt-table"><thead><tr><th>#</th><th>Player</th><th>Pos</th><th>GT%</th><th>PPG</th><th>Avg Diff</th><th></th></tr></thead><tbody>';
      for (var i = 0; i < players.length; i++) {
        var p = players[i];
        var posColor = POS_COLORS[p.position] || '#333';
        var pCls = pctClass(p.garbage_time_pct);
        var barVal = isPadders ? p.garbage_time_pct : p.ppg;
        var barPct = maxVal > 0 ? barVal / maxVal * 100 : 0;
        var barCls = isPadders ? 'red' : 'green';
        html += '<tr>';
        html += '<td class="gt-rank">' + (i + 1) + '</td>';
        html += '<td>' + escapeHtml(p.name) + ' <span style="color:var(--ink-light);font-size:10px">' + escapeHtml(p.team) + '</span></td>';
        html += '<td><span class="gt-pos-badge" style="background:' + posColor + '">' + escapeHtml(p.position) + '</span></td>';
        html += '<td><span class="gt-pct-badge ' + pCls + '">' + fmt(p.garbage_time_pct) + '%</span></td>';
        html += '<td>' + fmt(p.ppg) + '</td>';
        html += '<td>' + fmt(p.avg_score_diff) + '</td>';
        html += '<td class="gt-bar-cell"><div class="gt-bar ' + barCls + '" style="width:' + barPct + '%"></div></td>';
        html += '</tr>';
      }
      html += '</tbody></table></div>';
      return html;
    }

    function loadGT() {
      var body = el.querySelector('#gt-body');
      body.innerHTML = '<div class="lp-loading">pulling film...</div>';
      var season = el.querySelector('#gt-season').value;
      var url = '/api/garbage-time';
      if (season) url += '?season=' + season;
      else url += '?season=' + new Date().getFullYear();
      if (curPos) url += '&position=' + curPos;

      fetch(url).then(function(r) {
        if (!r.ok) throw new Error('API error');
        return r.json();
      }).then(function(data) {
        if (!seasonsPopulated) {
          var sel = el.querySelector('#gt-season');
          for (var y = new Date().getFullYear(); y >= 2020; y--) {
            var o = document.createElement('option');
            o.value = y; o.textContent = y;
            if (data.season && y == data.season) o.selected = true;
            sel.appendChild(o);
          }
          seasonsPopulated = true;
        }
        var padders = data.stat_padders || [];
        var clean = data.clean_producers || [];
        if (!padders.length && !clean.length) { body.innerHTML = '<div class="lp-empty">no garbage time data found</div>'; return; }

        var html = '<div class="gt-sections">';
        html += buildGTCard('Stat Padders — High Garbage Time %', 'padders', padders, true);
        html += buildGTCard('Clean Producers — Low Garbage Time %', 'clean', clean, false);
        html += '</div>';
        body.innerHTML = html;
      }).catch(function() { body.innerHTML = '<div class="lp-empty">failed to load garbage time data</div>'; });
    }

    el.querySelector('#gt-pos-tabs').addEventListener('click', function(e) {
      var tab = e.target.closest('.lp-pos-tab');
      if (!tab) return;
      el.querySelectorAll('#gt-pos-tabs .lp-pos-tab').forEach(function(t) { t.classList.remove('active'); });
      tab.classList.add('active');
      curPos = tab.getAttribute('data-pos') || '';
      loadGT();
    });
    el.querySelector('#gt-season').addEventListener('change', loadGT);
    loadGT();
  }});

})();
