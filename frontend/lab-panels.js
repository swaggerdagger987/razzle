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

})();
