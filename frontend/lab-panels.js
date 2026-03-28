/* ===================================================================
   LAB PANELS JS — Rankings & Values (7 native panel render functions)
   Each function is stored on window._labPanelDefs for consumption
   by the panel registry in lab.html's inline script.
   =================================================================== */
(function() {
  'use strict';

  var _latestSeason = (function() { var n = new Date(); return n.getMonth() >= 8 ? n.getFullYear() : n.getFullYear() - 1; })();

  // AbortController for panel fetches — aborted on panel switch
  var _panelController = new AbortController();
  window._abortPanelFetches = function() {
    _panelController.abort();
    _panelController = new AbortController();
  };
  function _panelSignal() { return _panelController.signal; }

  var defs = window._labPanelDefs = window._labPanelDefs || [];

  function fmt(v, dec) {
    if (v === null || v === undefined) return '-';
    var n = Number(v);
    if (isNaN(n)) return '-';
    return n.toFixed(dec === undefined ? 1 : dec);
  }

  var POS_COLORS = (typeof getPosColors === "function") ? getPosColors() : { QB: '#5b7fff', RB: '#2ec4b6', WR: '#d97757', TE: '#8b5cf6' };
  var POS_CSS = { QB: 'var(--pos-qb)', RB: 'var(--pos-rb)', WR: 'var(--pos-wr)', TE: 'var(--pos-te)' };

  // ─── Clickable player name helper ─────────────────────────────
  // Returns HTML for a player name that opens the profile popup on click.
  // Usage: pLink('Josh Allen', 'abc123') or pLink('Josh Allen', 'abc123', 'extra-class')
  function pLink(name, playerId, extraStyle) {
    if (!playerId) return escapeHtml(name);
    return '<a href="/player/' + encodeURIComponent(playerId) + '" class="panel-player-link" data-player-id="' + escapeAttr(playerId) + '"' +
      (extraStyle ? ' style="' + extraStyle + '"' : '') +
      '>' + escapeHtml(name) + '</a>';
  }

  // Delegated click handler — attached once to .lab-main
  document.addEventListener('click', function(e) {
    var link = e.target.closest('.panel-player-link');
    if (!link) return;
    e.preventDefault();
    var pid = link.getAttribute('data-player-id');
    if (pid && typeof openPlayerProfile === 'function') {
      openPlayerProfile(pid);
    }
  });

  // ─── NFL-Only Panel Messages ────────────────────────────────────
  // Panels that don't apply to college show a friendly Caveat-font message
  var NFL_ONLY_MESSAGES = {
    tradevalues: 'college players don\'t have dynasty trade values... yet. switch to NFL to see who\'s worth what.',
    rosterbuilder: 'roster building is an NFL thing — college rosters are the coach\'s problem. switch to NFL to build yours.',
    waivers: 'no waiver wire in college — every recruit was a 5-star in someone\'s eyes. switch to NFL for waiver targets.',
    tradefinder: 'can\'t trade college players (the NCAA frowns on that). switch to NFL to find trade matches.',
    auction: 'auction values are for your fantasy draft, not the transfer portal. switch to NFL for draft-day dollars.',
    cheatsheet: 'cheat sheets are for your draft board, not the college depth chart. switch to NFL for draft prep.',
    dashboard: 'the dynasty dashboard tracks NFL assets — college players haven\'t declared yet. switch to NFL for the overview.',
    handcuffs: 'handcuff insurance is an NFL strategy — in college, the backup just transfers. switch to NFL for handcuff pairs.',
    rankings: 'dynasty rankings are for NFL players with pro contracts. switch to NFL to see who\'s worth rostering.',
    tiers: 'dynasty tiers are based on NFL trade values — college players aren\'t on the board yet. switch to NFL for tier rankings.',
    buysell: 'buy low / sell high is based on NFL dynasty value mismatches. switch to NFL to find deals.',
    drops: 'drop rate tracking uses NFL play-by-play data — college doesn\'t track drops the same way. switch to NFL.',
    garbagetime: 'garbage time detection uses NFL game scripts and scoring margins. switch to NFL for stat-padder alerts.',
    matchups: 'matchup heatmaps track NFL defensive rankings by position. switch to NFL for schedule advantages.',
    stacks: 'QB-WR stacking uses NFL play-by-play correlation data. switch to NFL for stack targets.',
    redzone: 'red zone and goal-line usage comes from NFL play-by-play tracking. switch to NFL for TD vultures.',
    streaks: 'hot/cold streaks track weekly NFL performance runs. switch to NFL for momentum plays.',
    weeklymvp: 'weekly MVP tracking is an NFL regular season feature. switch to NFL for week-by-week standouts.',
    playoffs: 'playoff matchup planning is for NFL fantasy playoffs (weeks 14-17). switch to NFL for schedule edges.',
    pace: 'pace projections extrapolate from NFL weekly game logs. switch to NFL for season-long projections.',
    tdregression: 'TD regression uses NFL expected touchdown models. switch to NFL for buy/sell TD candidates.',
    airyards: 'air yards, aDOT, WOPR, and RACR come from NFL tracking data. switch to NFL for target efficiency.',
    yoy: 'year-over-year comparison uses NFL per-game deltas across seasons. switch to NFL for risers and fallers.',
    targetpremium: 'target premium uses NFL receiving efficiency metrics. switch to NFL for target quality rankings.',
    powerrankings: 'dynasty power rankings are based on NFL roster trade values. switch to NFL to see which teams are loaded.',
    gamescript: 'game script analysis uses NFL play-by-play score differentials. switch to NFL for winning/losing script breakdowns.'
  };

  function showNflOnlyMsg(el, panelName, title, subtitle) {
    var isCollege = typeof state !== 'undefined' && state.universe === 'college';
    if (!isCollege) return false;
    var msg = NFL_ONLY_MESSAGES[panelName] || 'this panel is NFL only — switch back to see the data.';
    el.innerHTML =
      '<div class="lp-page">' +
        '<div class="lp-header"><h2>' + (title || panelName) + '</h2>' +
        (subtitle ? '<div class="lp-subtitle">' + subtitle + '</div>' : '') + '</div>' +
        '<div class="lp-nfl-only">' +
          '<div class="lp-nfl-only-icon">&#x1F3C8;</div>' +
          '<div class="lp-nfl-only-text">' + msg + '</div>' +
          '<button class="lp-nfl-only-btn" onclick="setUniverse(\'nfl\')">Switch to NFL</button>' +
        '</div>' +
      '</div>';
    return true;
  }

  // ─── 1. DYNASTY RANKINGS ──────────────────────────────────────
  defs.push({ name: 'rankings', render: function(el) {
    if (showNflOnlyMsg(el, 'rankings', 'Dynasty Rankings', 'who\'s worth the most in your league')) return;
    var state = { position: '', data: null, view: 'rankings', historyData: null };
    var searchQuery = '';
    var seasonsLoaded = false;
    var compareIds = [];

    el.innerHTML =
      '<div class="lp-page">' +
        '<div class="lp-header"><h2>Dynasty Rankings</h2>' +
        '<div class="lp-subtitle">who\'s worth the most in your league</div>' +
        '<div class="lp-meta">ranked by DVS (Dynasty Value Score) — production x age curve</div></div>' +
        '<div class="lp-controls" id="lp-rankings-filters">' +
          '<div class="lp-pos-tabs">' +
          '<button class="lp-pos-tab active" data-pos="">All</button>' +
          '<button class="lp-pos-tab" data-pos="QB">QB</button>' +
          '<button class="lp-pos-tab" data-pos="RB">RB</button>' +
          '<button class="lp-pos-tab" data-pos="WR">WR</button>' +
          '<button class="lp-pos-tab" data-pos="TE">TE</button>' +
          '</div>' +
          '<select class="lp-select" id="lp-rankings-season" aria-label="Season"></select>' +
          '<input class="lp-search" type="text" id="lp-rankings-search" placeholder="search player...">' +
          '<div class="lp-view-toggle" id="lp-rankings-view">' +
            '<button class="lp-view-btn active" data-view="rankings">Rankings</button>' +
            '<button class="lp-view-btn" data-view="history">History</button>' +
          '</div>' +
        '</div>' +
        '<div id="lp-rankings-content"><div class="lp-loading">' + razzleLoading() + '</div></div>' +
      '</div>';

    var seasonSel = el.querySelector('#lp-rankings-season');

    function filterBySearch(players) {
      if (!searchQuery) return players;
      var q = searchQuery.toLowerCase();
      return players.filter(function(p) {
        return (p.full_name || '').toLowerCase().indexOf(q) !== -1 ||
               (p.team || '').toLowerCase().indexOf(q) !== -1;
      });
    }

    function loadRankings() {
      var content = el.querySelector('#lp-rankings-content');
      content.innerHTML = '<div class="lp-loading">' + razzleLoading() + '</div>';

      var url = '/api/dynasty-rankings?limit=200';
      if (state.position) url += '&position=' + encodeURIComponent(state.position);
      var season = seasonSel.value || '';
      if (season) url += '&season=' + season;

      fetch(url, { signal: _panelSignal() }).then(function(r) {
        if (!r.ok) throw new Error('API error');
        return r.json();
      }).then(function(data) {
        state.data = data;
        if (!seasonsLoaded && data.available_seasons) {
          seasonsLoaded = true;
          seasonSel.innerHTML = '';
          (data.available_seasons || []).forEach(function(s) {
            var opt = document.createElement('option');
            opt.value = s; opt.textContent = s;
            seasonSel.appendChild(opt);
          });
          seasonSel.value = data.season;
        }
        renderTiers(data.tiers || [], content);
      }).catch(function() {
        content.innerHTML = '<div class="panel-error">' + razzleError() + '<br><button onclick="location.reload()">retry</button></div>';
      });
    }

    function loadHistory() {
      var content = el.querySelector('#lp-rankings-content');
      content.innerHTML = '<div class="lp-loading">pulling historical film...</div>';

      var url = '/api/dynasty-history?limit=20';
      if (compareIds.length) {
        url = '/api/dynasty-history?players=' + encodeURIComponent(compareIds.join(','));
      } else if (state.position) {
        url += '&position=' + encodeURIComponent(state.position);
      }

      fetch(url, { signal: _panelSignal() }).then(function(r) {
        if (!r.ok) throw new Error('API error');
        return r.json();
      }).then(function(data) {
        state.historyData = data;
        renderHistory(data, content);
      }).catch(function() {
        content.innerHTML = '<div class="panel-error">' + razzleError() + '<br><button onclick="location.reload()">retry</button></div>';
      });
    }

    function renderHistory(data, content) {
      var players = filterBySearch(data.players || []);
      var seasons = data.seasons || [];

      // Compare player search UI
      var html = '<div class="dh-compare-bar">';
      html += '<div class="lp-search-wrap"><input class="lp-search" type="text" id="lp-dh-compare-input" placeholder="add player to compare..."></div>';
      if (compareIds.length) {
        html += '<button class="lp-btn-small" id="lp-dh-clear-compare">clear comparison</button>';
      }
      html += '</div>';

      if (!players.length || !seasons.length) {
        html += '<div class="panel-empty">' + razzleEmpty() + '<span class="hint">try a different position or season</span></div>';
        content.innerHTML = html;
        setupCompareSearch(content);
        return;
      }

      html += '<div class="dh-wrap">';
      html += '<table class="dh-table"><thead><tr>';
      html += '<th scope="col">Player</th>';
      seasons.forEach(function(s) { html += '<th class="center">' + escapeHtml(String(s)) + '</th>'; });
      html += '<th class="center">Trend</th>';
      html += '</tr></thead><tbody>';

      players.forEach(function(p) {
        var posLc = (p.position || '').toLowerCase();
        html += '<tr data-pid="' + escapeAttr(p.player_id) + '">';
        html += '<td><div class="dh-player-cell">';
        if (p.headshot_url) html += '<img class="dh-headshot" src="' + escapeAttr(p.headshot_url) + '" alt="Player headshot" loading="lazy" onerror="this.onerror=null;this.src=\'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 40 40%22><circle cx=%2220%22 cy=%2220%22 r=%2220%22 fill=%22%23d97757%22/><text x=%2220%22 y=%2225%22 text-anchor=%22middle%22 fill=%22white%22 font-size=%2216%22>?</text></svg>\'">';
        html += '<div><div class="dh-name">' + pLink(p.full_name, p.player_id) + '</div>';
        html += '<span class="rankings-pos-badge ' + posLc + '">' + escapeHtml(p.position) + '</span>';
        html += ' <span class="dh-team">' + escapeHtml(p.team) + '</span></div></div></td>';

        var vals = [];
        (p.history || []).forEach(function(h, idx) {
          if (h) {
            var tv = h.trade_value;
            vals.push(tv);
            var cls = tv >= 80 ? 'elite' : tv >= 50 ? 'solid' : tv >= 20 ? 'low' : 'rep';
            html += '<td class="center"><span class="dh-val ' + cls + '">' + fmt(tv) + '</span></td>';
          } else {
            html += '<td class="center"><span class="dh-val empty">-</span></td>';
          }
        });

        // Mini sparkline via inline SVG
        html += '<td class="center">';
        if (vals.length >= 2) {
          var w = 60, h2 = 24;
          var mn = Math.min.apply(null, vals), mx = Math.max.apply(null, vals);
          var rng = mx - mn || 1;
          var pts = [];
          for (var vi = 0; vi < vals.length; vi++) {
            var x = (vi / (vals.length - 1)) * w;
            var y = h2 - ((vals[vi] - mn) / rng) * (h2 - 4) - 2;
            pts.push(x.toFixed(1) + ',' + y.toFixed(1));
          }
          var trend = vals[vals.length - 1] - vals[0];
          var color = trend >= 0 ? 'var(--green)' : 'var(--orange)';
          html += '<svg width="' + w + '" height="' + h2 + '" style="vertical-align:middle">';
          html += '<polyline points="' + pts.join(' ') + '" fill="none" stroke="' + color + '" stroke-width="2"/>';
          html += '</svg>';
        }
        html += '</td></tr>';
      });

      html += '</tbody></table></div>';
      html += '<div style="text-align:center;margin-top:12px"><button class="lp-btn-small" id="lp-dh-export">Export PNG</button></div>';
      content.innerHTML = html;

      var exportBtn = content.querySelector('#lp-dh-export');
      if (exportBtn) {
        exportBtn.addEventListener('click', function() {
          var wrap = content.querySelector('.dh-wrap');
          if (wrap && typeof html2canvas !== 'undefined') {
            var isDark = document.documentElement.getAttribute('data-theme') === 'dark';
            html2canvas(wrap, { backgroundColor: isDark ? '#2d1f14' : '#ede0cf', scale: 2, useCORS: true, logging: false }).then(function(canvas) {
              var ctx = canvas.getContext('2d');
              ctx.font = '600 24px Caveat, cursive';
              ctx.fillStyle = isDark ? 'rgba(237, 224, 207, 0.25)' : 'rgba(45, 31, 20, 0.25)';
              ctx.textAlign = 'right';
              ctx.fillText('razzle.lol', canvas.width - 20, canvas.height - 16);
              var link = document.createElement('a');
              link.download = 'razzle-dynasty-history.png';
              link.href = canvas.toDataURL('image/png');
              link.click();
            }).catch(function() { if (typeof _showToast === 'function') _showToast('fumbled the screenshot — try again'); });
          }
        });
      }

      content.querySelectorAll('tr[data-pid]').forEach(function(tr) {
        tr.addEventListener('click', function() {
          var pid = tr.getAttribute('data-pid');
          if (pid) if (typeof openPlayerPopup === 'function') openPlayerPopup(pid); else window.location.href = '/player/' + encodeURIComponent(pid);
        });
      });
      setupCompareSearch(content);
    }

    function setupCompareSearch(content) {
      var input = content.querySelector('#lp-dh-compare-input');
      var clearBtn = content.querySelector('#lp-dh-clear-compare');
      if (clearBtn) {
        clearBtn.addEventListener('click', function() {
          compareIds = [];
          loadHistory();
        });
      }
      if (!input) return;
      var timer;
      input.addEventListener('input', function() {
        clearTimeout(timer);
        var self = this;
        timer = setTimeout(function() {
          var q = self.value.trim();
          if (q.length < 2) {
            var list = content.querySelector('.dh-compare-results');
            if (list) list.remove();
            return;
          }
          fetch('/api/players/quick-search?q=' + encodeURIComponent(q) + '&limit=5', { signal: _panelSignal() }).then(function(r) {
            if (!r.ok) throw new Error('search failed');
            return r.json();
          }).then(function(results) {
            var existing = content.querySelector('.dh-compare-results');
            if (existing) existing.remove();
            if (!results.length) return;
            var dropdown = document.createElement('div');
            dropdown.className = 'dh-compare-results lp-search-list';
            dropdown.style.display = 'block';
            results.forEach(function(p) {
              var row = document.createElement('div');
              row.innerHTML = '<span class="rankings-pos-badge ' + (p.position || '').toLowerCase() + '">' + escapeHtml(p.position || '') + '</span> ' +
                escapeHtml(p.full_name || '') + ' <span style="color:var(--ink-light);font-size:11px">' + escapeHtml(p.team || '') + '</span>';
              row.addEventListener('click', function() {
                if (compareIds.indexOf(p.player_id) === -1 && compareIds.length < 5) {
                  compareIds.push(p.player_id);
                  loadHistory();
                }
              });
              dropdown.appendChild(row);
            });
            input.parentNode.appendChild(dropdown);
          }).catch(function() {
            var existing = content.querySelector('.dh-compare-results');
            if (existing) existing.remove();
          });
        }, 250);
      });
    }

    function renderTiers(tiers, content) {
      if (!tiers.length) {
        content.innerHTML = '<div class="panel-empty">' + razzleEmpty() + '<span class="hint">try a different position or season</span></div>';
        return;
      }
      var html = '';
      var rank = 1;
      for (var i = 0; i < tiers.length; i++) {
        var tier = tiers[i];
        var filtered = filterBySearch(tier.players);
        if (!filtered.length) continue;
        html += '<div class="rankings-tier tier-' + tier.tier + '">';
        html += '<div class="rankings-tier-header">';
        html += '<div class="rankings-tier-badge">Tier ' + tier.tier + '</div>';
        html += '<div class="rankings-tier-label">' + escapeHtml(tier.label) + '</div>';
        html += '<div class="rankings-tier-count">' + filtered.length + ' players</div>';
        html += '</div><div class="rankings-grid">';
        for (var j = 0; j < filtered.length; j++) {
          var p = filtered[j];
          var posLc = (p.position || '').toLowerCase();
          var ageCls = !p.age ? '' : p.age <= 25 ? 'young' : p.age <= 28 ? 'prime' : 'aging';
          html += '<div class="rankings-card" data-pid="' + escapeAttr(p.player_id) + '">';
          html += '<div class="rankings-rank">#' + rank + '</div>';
          html += playerHeadshot(p, p.position);
          html += '<div class="rankings-info">';
          html += '<div class="rankings-name">' + pLink(p.full_name, p.player_id) + '</div>';
          html += '<div class="rankings-meta">';
          html += '<span class="rankings-pos-badge ' + posLc + '">' + escapeHtml(p.position) + '</span>';
          html += '<span class="rankings-team">' + escapeHtml(p.team) + '</span>';
          if (p.age) html += '<span class="rankings-age ' + ageCls + '">Age ' + escapeHtml(String(p.age)) + '</span>';
          html += '</div></div>';
          html += '<div class="rankings-scores">';
          html += '<div class="rankings-value">' + fmt(p.dynasty_value) + ' <span style="font-size:11px;font-weight:400;color:var(--ink-light)">DVS</span></div>';
          html += '<div class="rankings-ppg">' + fmt(p.ppg) + ' ppg</div>';
          html += '</div></div>';
          rank++;
        }
        html += '</div></div>';
      }
      if (!html) {
        content.innerHTML = '<div class="panel-empty">' + razzleEmpty() + '<span class="hint">try a different position or season</span></div>';
        return;
      }
      content.innerHTML = html;
      content.querySelectorAll('.rankings-card').forEach(function(card) {
        card.addEventListener('click', function() {
          var pid = this.getAttribute('data-pid');
          if (pid) if (typeof openPlayerPopup === 'function') openPlayerPopup(pid); else window.location.href = '/player/' + encodeURIComponent(pid);
        });
      });
    }

    function switchView(view) {
      state.view = view;
      el.querySelectorAll('#lp-rankings-view .lp-view-btn').forEach(function(b) { b.classList.remove('active'); });
      var _vb = el.querySelector('#lp-rankings-view .lp-view-btn[data-view="' + view + '"]');
      if (_vb) _vb.classList.add('active');
      // Hide season selector in history mode (shows all seasons)
      seasonSel.style.display = view === 'history' ? 'none' : '';
      if (view === 'history') {
        loadHistory();
      } else {
        loadRankings();
      }
    }

    el.querySelector('#lp-rankings-filters').addEventListener('click', function(e) {
      var btn = e.target.closest('.lp-pos-tab');
      if (btn) {
        el.querySelectorAll('#lp-rankings-filters .lp-pos-tab').forEach(function(b) { b.classList.remove('active'); });
        btn.classList.add('active');
        state.position = btn.getAttribute('data-pos') || '';
        if (state.view === 'history') loadHistory();
        else loadRankings();
      }
    });
    el.querySelector('#lp-rankings-view').addEventListener('click', function(e) {
      var btn = e.target.closest('.lp-view-btn');
      if (btn) switchView(btn.getAttribute('data-view'));
    });
    seasonSel.addEventListener('change', function() { loadRankings(); });
    el.querySelector('#lp-rankings-search').addEventListener('input', function(e) {
      searchQuery = e.target.value.trim();
      if (state.view === 'history' && state.historyData) {
        renderHistory(state.historyData, el.querySelector('#lp-rankings-content'));
      } else if (state.data) {
        renderTiers(state.data.tiers || [], el.querySelector('#lp-rankings-content'));
      }
    });

    loadRankings();
  }});

  // ─── 2. TIERS ─────────────────────────────────────────────────
  defs.push({ name: 'tiers', render: function(el) {
    if (showNflOnlyMsg(el, 'tiers', 'Dynasty Tiers', 'S-tier to F-tier dynasty assets')) return;
    var state = { season: 0, position: '' };
    var searchQuery = '';
    var currentData = null;

    el.innerHTML =
      '<div class="lp-page">' +
        '<div class="lp-header"><h2>Dynasty Tier List</h2>' +
        '<div class="lp-subtitle">who\'s untouchable and who\'s getting cut</div>' +
        '<div class="lp-meta" id="lp-tl-meta"></div></div>' +
        '<div class="lp-controls">' +
          '<div class="lp-pos-tabs" id="lp-tl-pos">' +
            '<button class="lp-pos-tab active" data-pos="">All</button>' +
            '<button class="lp-pos-tab" data-pos="QB">QB</button>' +
            '<button class="lp-pos-tab" data-pos="RB">RB</button>' +
            '<button class="lp-pos-tab" data-pos="WR">WR</button>' +
            '<button class="lp-pos-tab" data-pos="TE">TE</button>' +
          '</div>' +
          '<select class="lp-select" id="lp-tl-season" aria-label="Season"></select>' +
          '<input class="lp-search" type="text" id="lp-tl-search" placeholder="search player...">' +
        '</div>' +
        '<div id="lp-tl-tiers"><div class="lp-loading">' + razzleLoading() + '</div></div>' +
      '</div>';

    var seasonSel = el.querySelector('#lp-tl-season');
    var seasonsLoaded = false;

    function filterBySearch(players) {
      if (!searchQuery) return players;
      var q = searchQuery.toLowerCase();
      return players.filter(function(p) {
        return (p.full_name || '').toLowerCase().indexOf(q) !== -1 ||
               (p.team || '').toLowerCase().indexOf(q) !== -1;
      });
    }

    function fetchTiers() {
      var tiersEl = el.querySelector('#lp-tl-tiers');
      tiersEl.innerHTML = '<div class="lp-loading">' + razzleLoading() + '</div>';
      var params = [];
      if (state.season > 0) params.push('season=' + state.season);
      if (state.position) params.push('position=' + state.position);
      var url = '/api/tier-list' + (params.length ? '?' + params.join('&') : '');

      fetch(url, { signal: _panelSignal() }).then(function(r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      }).then(function(data) {
        currentData = data;
        if (!seasonsLoaded && data.available_seasons) {
          seasonsLoaded = true;
          seasonSel.innerHTML = '';
          (data.available_seasons || []).forEach(function(s) {
            var opt = document.createElement('option');
            opt.value = s; opt.textContent = s;
            if (s === data.season) opt.selected = true;
            seasonSel.appendChild(opt);
          });
        }
        el.querySelector('#lp-tl-meta').textContent = data.season + ' season \u00b7 ' + data.total_players + ' players';
        renderTiers(data.tiers || [], tiersEl);
      }).catch(function(err) {
        tiersEl.innerHTML = '<div class="panel-error">' + razzleError() + '<br><button onclick="location.reload()">retry</button></div>';
      });
    }

    function renderTiers(tiers, container) {
      var html = '';
      var anyVisible = false;
      tiers.forEach(function(tier) {
        var filtered = filterBySearch(tier.players || []);
        html += '<div class="tl-tier">';
        html += '<div class="tl-tier-label ' + tier.tier + '">';
        html += '<div class="tl-tier-letter">' + escapeHtml(tier.tier) + '</div>';
        html += '<div class="tl-tier-count">' + filtered.length + '</div>';
        html += '<div class="tl-tier-desc">' + escapeHtml(tier.label || '') + '</div>';
        html += '</div><div class="tl-tier-players">';
        if (!filtered.length) {
          html += '<span class="tl-empty-tier">' + razzleEmpty() + '</span>';
        } else {
          anyVisible = true;
          filtered.forEach(function(p) {
            html += '<div class="tl-player-chip" data-pid="' + escapeAttr(p.player_id) + '">';
            html += '<span class="tl-chip-pos ' + p.position + '">' + escapeHtml(p.position) + '</span>';
            html += '<span class="tl-chip-name">' + pLink(p.full_name, p.player_id) + '</span>';
            html += '<span class="tl-chip-tv">' + escapeHtml(String(p.trade_value)) + '</span>';
            html += '</div>';
          });
        }
        html += '</div></div>';
      });
      if (searchQuery && !anyVisible) {
        container.innerHTML = '<div class="panel-empty">' + razzleEmpty() + '<span class="hint">try a different position or season</span></div>';
        return;
      }
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
    el.querySelector('#lp-tl-search').addEventListener('input', function(e) {
      searchQuery = e.target.value.trim();
      if (currentData) renderTiers(currentData.tiers || [], el.querySelector('#lp-tl-tiers'));
    });

    fetchTiers();
  }});

  // ─── 3. TRADE VALUES ──────────────────────────────────────────
  defs.push({ name: 'tradevalues', render: function(el) {
    if (showNflOnlyMsg(el, 'tradevalues', 'Trade Values', 'who\'s worth what in dynasty')) return;
    var currentPosition = '';
    var currentData = null;
    var searchQuery = '';
    var seasonsLoaded = false;

    // Read weights from URL or use defaults
    var urlParams = new URLSearchParams(window.location.search);
    var weights = {
      production: parseInt(urlParams.get('wp'), 10) || 50,
      age: parseInt(urlParams.get('wa'), 10) || 30,
      scarcity: parseInt(urlParams.get('ws'), 10) || 20
    };

    var TIER_LABELS = {
      1: 'Elite', 2: 'Blue Chip', 3: 'Premium', 4: 'Solid',
      5: 'Promising', 6: 'Depth', 7: 'Roster Clogger', 8: 'Cut Bait'
    };

    var TV_TIER_THRESHOLDS = [80, 65, 50, 35, 20, 10, 5, 0];

    function recalcTier(tv) {
      for (var i = 0; i < TV_TIER_THRESHOLDS.length; i++) {
        if (tv >= TV_TIER_THRESHOLDS[i]) return i + 1;
      }
      return 8;
    }

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
          '<select class="lp-select" id="lp-tv-season" aria-label="Season"></select>' +
          '<input class="lp-search" type="text" id="lp-tv-search" placeholder="search player...">' +
        '</div>' +
        '<div class="tv-methodology" id="lp-tv-weights">' +
          '<div class="tv-weight-slider">' +
            '<label>Production <span id="lp-tv-w-prod-val">50</span>%</label>' +
            '<input type="range" id="lp-tv-w-prod" min="0" max="100" value="50">' +
          '</div>' +
          '<div class="tv-weight-slider">' +
            '<label>Age Curve <span id="lp-tv-w-age-val">30</span>%</label>' +
            '<input type="range" id="lp-tv-w-age" min="0" max="100" value="30">' +
          '</div>' +
          '<div class="tv-weight-slider">' +
            '<label>Pos Scarcity <span id="lp-tv-w-scar-val">20</span>%</label>' +
            '<input type="range" id="lp-tv-w-scar" min="0" max="100" value="20">' +
          '</div>' +
          '<button class="lp-btn-small" id="lp-tv-w-reset">reset</button>' +
        '</div>' +
        '<div id="lp-tv-body"><div class="lp-loading">calculating trade values...</div></div>' +
      '</div>';

    var seasonSel = el.querySelector('#lp-tv-season');

    // Set slider initial values from URL params
    el.querySelector('#lp-tv-w-prod').value = weights.production;
    el.querySelector('#lp-tv-w-age').value = weights.age;
    el.querySelector('#lp-tv-w-scar').value = weights.scarcity;
    el.querySelector('#lp-tv-w-prod-val').textContent = weights.production;
    el.querySelector('#lp-tv-w-age-val').textContent = weights.age;
    el.querySelector('#lp-tv-w-scar-val').textContent = weights.scarcity;

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
        html += '<img class="tv-headshot" src="' + escapeAttr(p.headshot_url) + '" alt="Player headshot" loading="lazy" onerror="this.onerror=null;this.src=\'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 40 40%22><circle cx=%2220%22 cy=%2220%22 r=%2220%22 fill=%22%23d97757%22/><text x=%2220%22 y=%2225%22 text-anchor=%22middle%22 fill=%22white%22 font-size=%2216%22>?</text></svg>\'">';
      } else {
        html += '<div class="tv-headshot"></div>';
      }
      html += '<div class="tv-player-info">';
      html += '<div class="tv-player-name">' + pLink(p.full_name, p.player_id) + '</div>';
      html += '<div class="tv-player-meta">';
      html += '<span class="tv-pos-badge ' + pos + '">' + escapeHtml(p.position) + '</span>';
      html += '<span class="tv-team-label">' + escapeHtml(p.team) + '</span>';
      if (p.age) html += '<span class="tv-age">age ' + escapeHtml(String(p.age)) + '</span>';
      html += '</div></div>';
      html += '<div class="tv-bar-area"><div class="tv-bar-track"><div class="tv-bar-fill ' + pos + '" style="width:' + pct + '%"></div></div>';
      html += '<div class="tv-value">' + fmt(p.trade_value) + '</div></div>';
      html += '<div class="tv-stats">';
      html += '<div class="tv-stat"><div>' + fmt(p.ppg) + '</div><div class="tv-stat-label">PPG</div></div>';
      html += '<div class="tv-stat"><div>' + (p.games != null ? p.games : '-') + '</div><div class="tv-stat-label">GP</div></div>';
      html += '</div>';
      html += '<span class="tv-tier-badge t' + p.tier + '">' + escapeHtml(p.tier_label) + '</span>';
      html += '</div>';
      return html;
    }

    function applyWeights(players) {
      var total = weights.production + weights.age + weights.scarcity;
      if (total === 0) total = 1;
      var wp = weights.production / total;
      var wa = weights.age / total;
      var ws = weights.scarcity / total;
      return players.map(function(p) {
        var tv = Math.min(100, Math.max(0,
          (p.production_score || 0) * wp +
          (p.age_score || 0) * wa +
          (p.scarcity_score || 0) * ws
        ));
        tv = Math.round(tv * 10) / 10;
        var tier = recalcTier(tv);
        return Object.assign({}, p, {
          trade_value: tv,
          tier: tier,
          tier_label: TIER_LABELS[tier] || 'Tier ' + tier
        });
      }).sort(function(a, b) { return b.trade_value - a.trade_value; })
        .map(function(p, i) { return Object.assign({}, p, { rank: i + 1 }); });
    }

    function render(data) {
      currentData = data;
      var body = el.querySelector('#lp-tv-body');
      var reweighted = applyWeights(data.players || []);
      var players = filterBySearch(reweighted);

      if (!players.length) {
        body.innerHTML = '<div class="panel-empty">' + razzleEmpty() + '<span class="hint">try a different position or season</span></div>';
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
          if (pid) if (typeof openPlayerPopup === 'function') openPlayerPopup(pid); else window.location.href = '/player/' + encodeURIComponent(pid);
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

      fetch(url, { signal: _panelSignal() }).then(function(r) {
        if (!r.ok) throw new Error('API error');
        return r.json();
      }).then(function(data) {
        if (!seasonsLoaded && data.available_seasons) {
          seasonsLoaded = true;
          seasonSel.innerHTML = '';
          (data.available_seasons || []).forEach(function(s) {
            var opt = document.createElement('option');
            opt.value = s; opt.textContent = s;
            seasonSel.appendChild(opt);
          });
          seasonSel.value = data.season;
        }
        render(data);
      }).catch(function() {
        body.innerHTML = '<div class="panel-error">' + razzleError() + '<br><button onclick="location.reload()">retry</button></div>';
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

    // Linked sliders: always sum to 100%. Adjusting one proportionally adjusts the others.
    function linkedSliderUpdate(changedKey) {
      var prodEl = el.querySelector('#lp-tv-w-prod');
      var ageEl = el.querySelector('#lp-tv-w-age');
      var scarEl = el.querySelector('#lp-tv-w-scar');
      var sliders = { production: prodEl, age: ageEl, scarcity: scarEl };
      var newVal = parseInt(sliders[changedKey].value, 10);
      if (newVal > 100) newVal = 100;
      if (newVal < 0) newVal = 0;

      var otherKeys = Object.keys(sliders).filter(function(k) { return k !== changedKey; });
      var otherSum = weights[otherKeys[0]] + weights[otherKeys[1]];
      var remaining = 100 - newVal;

      if (otherSum > 0) {
        // Distribute remaining proportionally
        var r0 = Math.round(remaining * weights[otherKeys[0]] / otherSum);
        var r1 = remaining - r0;
        // Clamp
        if (r0 < 0) { r1 += r0; r0 = 0; }
        if (r1 < 0) { r0 += r1; r1 = 0; }
        weights[otherKeys[0]] = r0;
        weights[otherKeys[1]] = r1;
      } else {
        // Both others are 0: split remaining evenly
        weights[otherKeys[0]] = Math.round(remaining / 2);
        weights[otherKeys[1]] = remaining - weights[otherKeys[0]];
      }
      weights[changedKey] = newVal;

      // Update slider elements and labels
      prodEl.value = weights.production;
      ageEl.value = weights.age;
      scarEl.value = weights.scarcity;
      el.querySelector('#lp-tv-w-prod-val').textContent = weights.production;
      el.querySelector('#lp-tv-w-age-val').textContent = weights.age;
      el.querySelector('#lp-tv-w-scar-val').textContent = weights.scarcity;

      // Persist weights in URL for sharing
      var p = new URLSearchParams(window.location.search);
      if (weights.production !== 50 || weights.age !== 30 || weights.scarcity !== 20) {
        p.set('wp', weights.production);
        p.set('wa', weights.age);
        p.set('ws', weights.scarcity);
      } else {
        p.delete('wp'); p.delete('wa'); p.delete('ws');
      }
      history.replaceState(null, '', '?' + p.toString());
      if (currentData) render(currentData);
    }

    el.querySelector('#lp-tv-w-prod').addEventListener('input', function() { linkedSliderUpdate('production'); });
    el.querySelector('#lp-tv-w-age').addEventListener('input', function() { linkedSliderUpdate('age'); });
    el.querySelector('#lp-tv-w-scar').addEventListener('input', function() { linkedSliderUpdate('scarcity'); });
    el.querySelector('#lp-tv-w-reset').addEventListener('click', function() {
      weights.production = 50;
      weights.age = 30;
      weights.scarcity = 20;
      el.querySelector('#lp-tv-w-prod').value = 50;
      el.querySelector('#lp-tv-w-age').value = 30;
      el.querySelector('#lp-tv-w-scar').value = 20;
      el.querySelector('#lp-tv-w-prod-val').textContent = 50;
      el.querySelector('#lp-tv-w-age-val').textContent = 30;
      el.querySelector('#lp-tv-w-scar-val').textContent = 20;
      var p = new URLSearchParams(window.location.search);
      p.delete('wp'); p.delete('wa'); p.delete('ws');
      history.replaceState(null, '', '?' + p.toString());
      if (currentData) render(currentData);
    });

    loadData();
  }});

  // ─── 4. VORP ──────────────────────────────────────────────────
  defs.push({ name: 'vorp', render: function(el) {
    var currentPosition = '';
    var currentData = null;
    var seasonsLoaded = false;
    var searchQuery = '';
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
          '<select class="lp-select" id="lp-vorp-season" aria-label="Season"></select>' +
          '<input class="lp-search" type="text" id="lp-vorp-search" placeholder="search player...">' +
        '</div>' +
        '<div class="vorp-thresholds" id="lp-vorp-thresholds"></div>' +
        '<div id="lp-vorp-body" style="overflow-x:auto;-webkit-overflow-scrolling:touch"><div class="lp-loading">calculating replacement value...</div></div>' +
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
      var sortCol = col === 'vorp_tier' ? 'vorp' : col;
      return players.slice().sort(function(a, b) {
        var va = a[sortCol], vb = b[sortCol];
        if (va == null && vb == null) return 0;
        if (va == null) return 1;
        if (vb == null) return -1;
        if (typeof va === 'string') return dir * va.localeCompare(String(vb));
        return dir * ((Number(va) || 0) - (Number(vb) || 0));
      });
    }

    function buildTable(players, section) {
      if (!players || !players.length) return '<div class="panel-empty">' + razzleEmpty() + '<span class="hint">try a different position or season</span></div>';

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
        { key: 'vorp_tier', label: 'Tier' },
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
        if (p.headshot_url) html += '<img class="vorp-headshot" src="' + escapeAttr(p.headshot_url) + '" alt="Player headshot" loading="lazy" onerror="this.onerror=null;this.src=\'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 40 40%22><circle cx=%2220%22 cy=%2220%22 r=%2220%22 fill=%22%23d97757%22/><text x=%2220%22 y=%2225%22 text-anchor=%22middle%22 fill=%22white%22 font-size=%2216%22>?</text></svg>\'">';
        html += '<div class="vorp-player-info"><div class="vorp-player-name">' + pLink(p.full_name, p.player_id) + '</div>';
        html += '<div class="vorp-player-meta"><span class="vorp-pos-badge ' + pos + '">' + escapeHtml(p.position) + '</span>';
        html += '<span class="vorp-team-label">' + escapeHtml(p.team) + '</span></div></div></div></td>';
        var tierLabels = { elite: 'Elite', starter: 'Starter', flex: 'Flex', fringe: 'Fringe', replacement: 'Replacement' };
        html += '<td class="center"><span class="vorp-tier-badge ' + tier + '">' + (tierLabels[tier] || tier) + '</span></td>';
        html += '<td class="center"><span class="vorp-badge ' + tier + '">' + sign + fmt(p.vorp, 2) + '</span></td>';
        html += '<td class="center" style="font-weight:700">' + fmt(p.ppg) + '</td>';
        html += '<td class="center" style="color:var(--ink-medium)">' + fmt(p.replacement_ppg) + '</td>';
        html += '<td class="center">' + (p.pos_rank != null ? p.pos_rank : '-') + '</td>';
        html += '</tr>';
      });
      html += '</tbody></table></div>';
      return html;
    }

    function filterBySearch(players) {
      if (!searchQuery) return players;
      var q = searchQuery.toLowerCase();
      return players.filter(function(p) {
        return (p.full_name || '').toLowerCase().indexOf(q) !== -1 ||
               (p.team || '').toLowerCase().indexOf(q) !== -1;
      });
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

      var winners = filterBySearch(data.league_winners || []);
      var replacements = filterBySearch(data.replacement_level || []);

      if (!winners.length && !replacements.length) {
        body.innerHTML = '<div class="panel-empty">' + razzleEmpty() + '<span class="hint">try a different position or season</span></div>';
        return;
      }

      body.innerHTML = buildTable(winners, 'league_winners') + buildTable(replacements, 'replacement_level');

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
          if (pid) if (typeof openPlayerPopup === 'function') openPlayerPopup(pid); else window.location.href = '/player/' + encodeURIComponent(pid);
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

      fetch(url, { signal: _panelSignal() }).then(function(r) {
        if (!r.ok) throw new Error('API error');
        return r.json();
      }).then(function(data) {
        if (!seasonsLoaded && data.available_seasons) {
          seasonsLoaded = true;
          seasonSel.innerHTML = '';
          (data.available_seasons || []).forEach(function(s) {
            var opt = document.createElement('option');
            opt.value = s; opt.textContent = s;
            seasonSel.appendChild(opt);
          });
          seasonSel.value = data.season;
        }
        renderVorp(data);
      }).catch(function() {
        body.innerHTML = '<div class="panel-error">' + razzleError() + '<br><button onclick="location.reload()">retry</button></div>';
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
    el.querySelector('#lp-vorp-search').addEventListener('input', function(e) {
      searchQuery = e.target.value.trim();
      if (currentData) renderVorp(currentData);
    });

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
          '<select class="lp-select" id="lp-pa-season" aria-label="Season"></select>' +
          '<div class="lp-pos-tabs" id="lp-pa-pos">' +
            '<button class="lp-pos-tab active" data-pos="">ALL</button>' +
            '<button class="lp-pos-tab" data-pos="QB">QB</button>' +
            '<button class="lp-pos-tab" data-pos="RB">RB</button>' +
            '<button class="lp-pos-tab" data-pos="WR">WR</button>' +
            '<button class="lp-pos-tab" data-pos="TE">TE</button>' +
          '</div>' +
        '</div>' +
        '<div id="lp-pa-avgs"></div>' +
        '<div id="lp-pa-content"><div class="lp-loading">' + razzleLoading() + '</div></div>' +
      '</div>';

    var seasonSel = el.querySelector('#lp-pa-season');

    function load() {
      var season = seasonSel.value || '';
      var url = '/api/positional-advantage?';
      if (season) url += 'season=' + encodeURIComponent(season) + '&';
      if (currentPosition) url += 'position=' + encodeURIComponent(currentPosition) + '&';

      el.querySelector('#lp-pa-content').innerHTML = '<div class="lp-loading">' + razzleLoading() + '</div>';
      el.querySelector('#lp-pa-avgs').innerHTML = '';

      fetch(url, { signal: _panelSignal() }).then(function(r) {
        if (!r.ok) throw new Error('API error');
        return r.json();
      }).then(function(data) {
        if (!seasonsLoaded && data.available_seasons) {
          seasonsLoaded = true;
          seasonSel.innerHTML = '';
          (data.available_seasons || []).forEach(function(s) {
            var opt = document.createElement('option');
            opt.value = s; opt.textContent = s;
            if (s === data.season) opt.selected = true;
            seasonSel.appendChild(opt);
          });
        }
        renderAvgs(data.pos_averages);
        renderPA(data);
      }).catch(function() {
        el.querySelector('#lp-pa-content').innerHTML = '<div class="panel-error">' + razzleError() + '<br><button onclick="location.reload()">retry</button></div>';
      });
    }

    function renderAvgs(avgs) {
      if (!avgs) return;
      var html = '<div class="pa-avgs">';
      ['QB', 'RB', 'WR', 'TE'].forEach(function(pos) {
        var color = POS_COLORS[pos] || '#8a7565';
        html += '<div class="pa-avg-chip"><span style="color:' + color + '">' + escapeHtml(pos) + '</span> avg: ' + fmt(avgs[pos]) + ' PPG</div>';
      });
      html += '</div>';
      el.querySelector('#lp-pa-avgs').innerHTML = html;
    }

    function renderPA(data) {
      var players = data.players || [];
      var content = el.querySelector('#lp-pa-content');
      if (!players.length) {
        content.innerHTML = '<div class="pa-card"><div class="pa-card-header">Positional Advantage</div><div class="panel-empty">' + razzleEmpty() + '</div></div>';
        return;
      }
      var html = '<div class="pa-card">';
      html += '<div class="pa-card-header">Positional Advantage (' + data.count + ' players)</div>';
      html += '<table class="pa-table"><thead><tr>';
      html += '<th scope="col">#</th><th>Player</th><th>Pos</th><th>PPG</th><th>Pos Avg</th><th>Edge</th><th>% Above</th><th></th><th>GP</th>';
      html += '</tr></thead><tbody>';

      var maxAdv = Math.max.apply(null, players.map(function(p) { return Math.abs(p.advantage || 0); }).concat([1]));
      for (var i = 0; i < players.length; i++) {
        var p = players[i];
        var posColor = POS_CSS[p.position] || 'var(--ink-light)';
        var sign = p.advantage > 0 ? '+' : '';
        var badgeClass = p.advantage >= 0 ? 'pa-adv-pos' : 'pa-adv-neg';
        var barWidth = Math.max(2, Math.round(Math.abs(p.advantage) / maxAdv * 80));
        var barColor = p.advantage >= 0 ? 'var(--green)' : 'var(--orange)';

        html += '<tr data-pid="' + escapeAttr(p.player_id) + '">';
        html += '<td class="pa-rank">' + (i + 1) + '</td>';
        html += '<td>' + pLink(p.name, p.player_id) + ' <span style="font-size:11px;color:var(--ink-light)">' + escapeHtml(p.team) + '</span></td>';
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
    if (showNflOnlyMsg(el, 'auction', 'Auction Values', 'trade values converted to draft-day dollars')) return;
    var state = { budget: 200, rosterSize: 15, season: 0, position: 'ALL', search: '', sortKey: 'auction_value', sortDir: -1, data: null };
    var seasonsLoaded = false;

    el.innerHTML =
      '<div class="lp-page">' +
        '<div class="lp-header"><h2>Auction Values</h2>' +
        '<div class="lp-subtitle">trade values converted to draft-day dollars</div></div>' +
        '<div class="lp-controls">' +
          '<label>Budget: <input type="range" id="lp-av-slider" min="50" max="500" step="10" value="200"></label>' +
          '<div class="av-budget-display" id="lp-av-budget">$200</div>' +
          '<label>Roster: <input type="number" class="lp-select" id="lp-av-roster" min="8" max="25" value="15" style="width:60px"></label>' +
          '<label>Season: <select class="lp-select" id="lp-av-season"></select></label>' +
        '</div>' +
        '<div class="lp-pos-tabs" id="lp-av-pos">' +
          '<button class="lp-pos-tab active" data-pos="ALL">All</button>' +
          '<button class="lp-pos-tab" data-pos="QB">QB</button>' +
          '<button class="lp-pos-tab" data-pos="RB">RB</button>' +
          '<button class="lp-pos-tab" data-pos="WR">WR</button>' +
          '<button class="lp-pos-tab" data-pos="TE">TE</button>' +
        '</div>' +
        '<div class="lp-controls"><input class="lp-search" type="text" id="lp-av-search" placeholder="search player..."></div>' +
        '<div class="av-summary" id="lp-av-summary"></div>' +
        '<div class="av-table-wrap" id="lp-av-table"><div class="lp-loading">' + razzleLoading() + '</div></div>' +
      '</div>';

    var slider = el.querySelector('#lp-av-slider');
    var budgetDisp = el.querySelector('#lp-av-budget');
    var rosterInput = el.querySelector('#lp-av-roster');
    var seasonSel = el.querySelector('#lp-av-season');
    var searchInput = el.querySelector('#lp-av-search');

    slider.addEventListener('input', function() { state.budget = parseInt(this.value) || 200; budgetDisp.textContent = '$' + state.budget; });
    slider.addEventListener('change', function() { fetchData(); });
    rosterInput.addEventListener('change', function() { state.rosterSize = Math.max(8, Math.min(25, parseInt(this.value) || 15)); this.value = state.rosterSize; fetchData(); });
    seasonSel.addEventListener('change', function() { state.season = parseInt(this.value) || 0; fetchData(); });
    searchInput.addEventListener('input', function() { state.search = this.value.toLowerCase(); renderTable(); });

    el.querySelector('#lp-av-pos').addEventListener('click', function(e) {
      var tab = e.target.closest('.lp-pos-tab');
      if (!tab) return;
      el.querySelectorAll('#lp-av-pos .lp-pos-tab').forEach(function(t) { t.classList.remove('active'); });
      tab.classList.add('active');
      state.position = tab.getAttribute('data-pos');
      renderTable();
    });

    function tierClass(t) { return t === 'dollar' ? 'dollar-tier' : t || ''; }
    function tierLabel(t) { return { premium: 'Premium', starter: 'Starter', value: 'Value', bargain: 'Bargain', dollar: '$1 Filler' }[t] || t || ''; }

    function fetchData() {
      var tableEl = el.querySelector('#lp-av-table');
      tableEl.innerHTML = '<div class="lp-loading">' + razzleLoading() + '</div>';
      var url = '/api/auction-values?budget=' + state.budget + '&roster_size=' + state.rosterSize;
      if (state.season > 0) url += '&season=' + state.season;

      fetch(url, { signal: _panelSignal() }).then(function(r) { if (!r.ok) throw new Error('err'); return r.json(); })
      .then(function(data) {
        state.data = data;
        if (!seasonsLoaded && data.available_seasons) {
          seasonsLoaded = true;
          seasonSel.innerHTML = '';
          (data.available_seasons || []).forEach(function(s) {
            var opt = document.createElement('option');
            opt.value = s; opt.textContent = s;
            if (s === data.season) opt.selected = true;
            seasonSel.appendChild(opt);
          });
        }
        renderSummary();
        renderTable();
      }).catch(function() {
        tableEl.innerHTML = '<div class="panel-error">' + razzleError() + '<br><button onclick="location.reload()">retry</button></div>';
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

      if (!players.length) { tableEl.innerHTML = '<div class="panel-empty">' + razzleEmpty() + '<span class="hint">try a different position or season</span></div>'; return; }

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
        html += '<tr data-pid="' + escapeAttr(p.player_id) + '">';
        html += '<td>' + (i + 1) + '</td>';
        html += '<td>' + pLink(p.full_name, p.player_id) + '</td>';
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
    if (showNflOnlyMsg(el, 'cheatsheet', 'Cheat Sheet', 'your draft day companion')) return;
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
          '<select class="lp-select" id="lp-cs-season" aria-label="Season"></select>' +
        '</div>' +
        '<div class="lp-loading" id="lp-cs-loading">' + razzleLoading() + '</div>' +
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

      fetch(url, { signal: _panelSignal() }).then(function(r) { if (!r.ok) throw new Error('err'); return r.json(); })
      .then(function(data) {
        state.data = data;
        if (!seasonsLoaded && data.available_seasons) {
          seasonsLoaded = true;
          seasonSel.innerHTML = '';
          (data.available_seasons || []).forEach(function(s) {
            var opt = document.createElement('option');
            opt.value = s; opt.textContent = s;
            if (s === data.season) opt.selected = true;
            seasonSel.appendChild(opt);
          });
        }
        state.season = data.season;
        renderCS();
      }).catch(function() {
        el.querySelector('#lp-cs-loading').innerHTML = '<div class="panel-error">' + razzleError() + '<br><button onclick="location.reload()">retry</button></div>';
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
          html += '<span class="cs-pname">' + pLink(p.full_name, p.player_id) + '</span>';
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
          if (pid) if (typeof openPlayerPopup === 'function') openPlayerPopup(pid); else window.location.href = '/player/' + encodeURIComponent(pid);
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
    var boCollege = typeof state !== 'undefined' && state.universe === 'college';
    var boTitle = boCollege ? 'College Breakout Candidates' : 'Breakout Candidates';
    var boSub = boCollege ? 'high-usage college players with room for production growth' : 'opportunity outpacing production — volume-based, not efficiency';
    el.innerHTML = '<div class="lp-page">' +
      '<div class="lp-header"><h2>' + boTitle + '</h2>' +
      '<div class="lp-subtitle">' + boSub + '</div></div>' +
      '<div class="lp-controls">' +
      '<div class="lp-pos-tabs" id="bo-pos-tabs">' +
      '<button class="lp-pos-tab active" data-pos="">All</button>' +
      '<button class="lp-pos-tab" data-pos="QB">QB</button>' +
      '<button class="lp-pos-tab" data-pos="RB">RB</button>' +
      '<button class="lp-pos-tab" data-pos="WR">WR</button>' +
      '<button class="lp-pos-tab" data-pos="TE">TE</button>' +
      '</div>' +
      '<select class="lp-select" id="bo-season" aria-label="Season"></select>' +
      weekSelectHTML('bo-week') +
      '</div>' +
      '<div id="bo-body" style="overflow-x:auto;-webkit-overflow-scrolling:touch"><div class="lp-loading">scouting the film...</div></div>' +
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

    function fmtD(v) {
      if (v == null || isNaN(v)) return '0';
      return parseFloat(Number(v).toFixed(1)).toString();
    }

    function loadBO() {
      var body = el.querySelector('#bo-body');
      body.innerHTML = '<div class="lp-loading">scouting the film...</div>';
      var sel = el.querySelector('#bo-season');
      if (sel && sel.options.length === 0) seasonsPopulated = false;
      var season = sel.value;
      var isCollege = typeof state !== 'undefined' && state.universe === 'college';
      var url = isCollege ? '/api/college/breakouts?limit=50' : '/api/breakout-candidates?limit=50';
      if (season) url += '&season=' + season;
      if (curPos) url += '&position=' + curPos;
      var boWeekVal = parseInt((el.querySelector('#bo-week') || {}).value) || 0;
      if (!isCollege && boWeekVal > 0) url += '&week=' + boWeekVal;

      fetch(url, { signal: _panelSignal() }).then(function(r) { if (!r.ok) throw new Error('API error'); return r.json(); }).then(function(data) {
        if (!seasonsPopulated && data.available_seasons) {
          var sel = el.querySelector('#bo-season');
          (data.available_seasons || []).forEach(function(s) {
            var o = document.createElement('option');
            o.value = s; o.textContent = s;
            if (s == (data.season || ((data.available_seasons && data.available_seasons.length) ? data.available_seasons[0] : null))) o.selected = true;
            sel.appendChild(o);
          });
          seasonsPopulated = true;
          if (!isCollege) populateWeekSelect(el, 'bo-week', sel.value, loadBO);
        }
        var candidates = data.candidates || [];
        if (!candidates.length) { body.innerHTML = '<div class="panel-empty">' + razzleEmpty() + '<span class="hint">try a different position or season</span></div>'; return; }

        var html = '<div class="breakouts-grid">';
        candidates.forEach(function(p) {
          var pos = (p.position || 'WR').toLowerCase();
          var ac = ageClass(p.age);
          var rbsVal = p.rbs_score != null ? fmtD(p.rbs_score) : (p.breakout_score != null ? fmtD(p.breakout_score) : '0');
          html += '<div class="breakout-card" data-pid="' + escapeAttr(p.player_id) + '">';
          html += '<div class="breakout-card-top ' + pos + '"></div><div class="breakout-card-body">';
          html += '<div class="breakout-card-row1">';
          html += '<div class="breakout-rank">' + escapeHtml(String(p.rank)) + '</div>';
          if (p.headshot_url) html += '<img class="breakout-headshot" src="' + escapeAttr(p.headshot_url) + '" alt="Player headshot" loading="lazy" onerror="this.onerror=null;this.src=\'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 40 40%22><circle cx=%2220%22 cy=%2220%22 r=%2220%22 fill=%22%23d97757%22/><text x=%2220%22 y=%2225%22 text-anchor=%22middle%22 fill=%22white%22 font-size=%2216%22>?</text></svg>\'">';
          html += '<div class="breakout-info"><div class="breakout-name">' + pLink(p.name, p.player_id) + '</div>';
          html += '<div class="breakout-meta"><span class="breakout-pos-badge ' + pos + '">' + escapeHtml(p.position) + '</span>';
          if (isCollege && p.conference) {
            html += '<span class="breakout-team">' + escapeHtml(p.team) + '</span>';
            html += '<span class="breakout-team" style="font-size:11px;color:var(--ink-light)">' + escapeHtml(p.conference) + '</span>';
          } else {
            html += '<span class="breakout-team">' + escapeHtml(p.team) + '</span>';
          }
          if (p.age) html += '<span class="breakout-age-badge ' + ac + '">' + ac + ' ' + escapeHtml(String(p.age)) + '</span>';
          html += '</div></div>';
          html += '<div class="breakout-rbs"><div class="breakout-rbs-score">' + escapeHtml(String(rbsVal)) + '</div>';
          html += '<div class="breakout-rbs-label">' + (isCollege ? 'BKO' : 'RBS') + '</div></div></div>';
          html += '<div class="breakout-bars">';
          html += '<div class="breakout-bar-group"><div class="breakout-bar-label"><span>Opportunity</span><span>' + escapeHtml(fmtD(p.opportunity_pct)) + '%</span></div>';
          html += '<div class="breakout-bar-track"><div class="breakout-bar-fill opportunity" style="width:' + parseFloat(p.opportunity_pct || 0) + '%"></div></div></div>';
          html += '<div class="breakout-bar-group"><div class="breakout-bar-label"><span>Production</span><span>' + escapeHtml(fmtD(p.production_pct)) + '%</span></div>';
          html += '<div class="breakout-bar-track"><div class="breakout-bar-fill production" style="width:' + parseFloat(p.production_pct || 0) + '%"></div></div></div></div>';
          html += '<div class="breakout-gap"><span class="breakout-gap-arrow">&#9650;</span><span class="breakout-gap-text">' + escapeHtml(p.annotation || '') + '</span></div>';
          html += '<div class="breakout-stats">';
          if (isCollege) {
            html += '<div class="breakout-stat"><div class="breakout-stat-val">' + escapeHtml(fmtD(p.yards_per_game || 0)) + '</div><div class="breakout-stat-key">YD/G</div></div>';
            html += '<div class="breakout-stat"><div class="breakout-stat-val">' + escapeHtml(fmtD(p.tds_per_game || 0)) + '</div><div class="breakout-stat-key">TD/G</div></div>';
          } else {
            html += '<div class="breakout-stat"><div class="breakout-stat-val">' + escapeHtml(fmtD(p.ppg)) + '</div><div class="breakout-stat-key">PPG</div></div>';
            html += '<div class="breakout-stat"><div class="breakout-stat-val">' + escapeHtml(fmtD(p.snap_pct)) + '%</div><div class="breakout-stat-key">Snap%</div></div>';
          }
          html += '<div class="breakout-stat"><div class="breakout-stat-val">' + escapeHtml(fmtD(posStatVal(p))) + '</div><div class="breakout-stat-key">' + posStatLabel(p.position) + '</div></div>';
          if (!isCollege && p.position !== 'QB' && p.position !== 'RB') html += '<div class="breakout-stat"><div class="breakout-stat-val">' + escapeHtml(fmtD(p.target_share)) + '%</div><div class="breakout-stat-key">TGT%</div></div>';
          html += '<div class="breakout-stat"><div class="breakout-stat-val">' + escapeHtml(String(p.games)) + '</div><div class="breakout-stat-key">Games</div></div>';
          html += '</div></div></div>';
        });
        html += '</div>';
        body.innerHTML = html;

        body.querySelectorAll('.breakout-card[data-pid]').forEach(function(card) {
          card.addEventListener('click', function() {
            var _pid = card.getAttribute('data-pid'); if (typeof openPlayerPopup === 'function') openPlayerPopup(_pid); else window.location.href = '/player/' + encodeURIComponent(_pid);
          });
        });
      }).catch(function() { body.innerHTML = '<div class="panel-error">' + razzleError() + '<br><button onclick="location.reload()">retry</button></div>'; });
    }

    el.querySelector('#bo-pos-tabs').addEventListener('click', function(e) {
      var tab = e.target.closest('.lp-pos-tab');
      if (!tab) return;
      el.querySelectorAll('#bo-pos-tabs .lp-pos-tab').forEach(function(t) { t.classList.remove('active'); });
      tab.classList.add('active');
      curPos = tab.getAttribute('data-pos') || '';
      loadBO();
    });
    el.querySelector('#bo-season').addEventListener('change', function() {
      var isCollege = typeof state !== 'undefined' && state.universe === 'college';
      if (!isCollege) populateWeekSelect(el, 'bo-week', this.value, loadBO);
      else { var ws = el.querySelector('#bo-week'); if (ws) ws.style.display = 'none'; }
      loadBO();
    });
    loadBO();
  }});

  // ===== BUY / SELL =====
  defs.push({ name: 'buysell', render: function(el) {
    if (showNflOnlyMsg(el, 'buysell', 'Buy Low / Sell High', 'find mispriced dynasty assets')) return;
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
      '<div id="bs-body" style="overflow-x:auto;-webkit-overflow-scrolling:touch"><div class="lp-loading">studying the market...</div></div>' +
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
      var barWidth = Math.min(100, Math.round(((p.mismatch_score || 0) / 60) * 100));

      var h = '<div class="buysell-card" data-pid="' + escapeAttr(p.player_id) + '">';
      h += '<div class="buysell-card-top ' + pos + '"></div><div class="buysell-card-body">';
      h += '<div class="buysell-card-row1">';
      h += '<div class="buysell-rank">' + escapeHtml(String(p.rank)) + '</div>';
      if (p.headshot_url) h += '<img class="buysell-headshot" src="' + escapeAttr(p.headshot_url) + '" alt="Player headshot" loading="lazy" onerror="this.onerror=null;this.src=\'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 40 40%22><circle cx=%2220%22 cy=%2220%22 r=%2220%22 fill=%22%23d97757%22/><text x=%2220%22 y=%2225%22 text-anchor=%22middle%22 fill=%22white%22 font-size=%2216%22>?</text></svg>\'">';
      h += '<div class="buysell-info"><div class="buysell-name">' + pLink(p.name, p.player_id) + '</div>';
      h += '<div class="buysell-meta"><span class="buysell-pos-badge ' + pos + '">' + escapeHtml(p.position) + '</span>';
      h += '<span class="buysell-team">' + escapeHtml(p.team) + '</span>';
      if (p.age) h += '<span class="buysell-age-badge ' + ac + '">' + ac + ' ' + escapeHtml(String(p.age)) + '</span>';
      h += '</div></div>';
      h += '<div class="buysell-badges"><div class="buysell-grade ' + gc + '">' + escapeHtml(p.efficiency_grade) + '</div>';
      h += '<div class="buysell-grade-label">efficiency</div></div></div>';
      h += '<div class="buysell-mismatch"><div class="buysell-mismatch-row">';
      h += '<span class="buysell-mismatch-label">Value Mismatch</span>';
      h += '<span class="buysell-mismatch-val ' + type + '">' + escapeHtml(String(p.mismatch_score)) + '</span></div>';
      h += '<div class="buysell-mismatch-track"><div class="buysell-mismatch-fill ' + type + '" style="width:' + barWidth + '%"></div></div></div>';
      h += '<div class="buysell-annotation">' + escapeHtml(p.annotation || '') + '</div>';
      h += '<div class="buysell-stats">' + renderEffStats(p) + '</div>';
      h += '</div></div>';
      return h;
    }

    function renderColumn(players, isBuy) {
      if (!players || !players.length) return '<div class="panel-empty">' + razzleEmpty() + '<span class="hint">try a different position or season</span></div>';
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

      fetch(url, { signal: _panelSignal() }).then(function(r) { if (!r.ok) throw new Error('API error'); return r.json(); }).then(function(data) {
        if (!seasonsPopulated && data.available_seasons) {
          var sel = el.querySelector('#bs-season');
          (data.available_seasons || []).forEach(function(s) {
            var o = document.createElement('option');
            o.value = s; o.textContent = s;
            if (s == (data.season || ((data.available_seasons && data.available_seasons.length) ? data.available_seasons[0] : null))) o.selected = true;
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
            var _pid = card.getAttribute('data-pid'); if (typeof openPlayerPopup === 'function') openPlayerPopup(_pid); else window.location.href = '/player/' + encodeURIComponent(_pid);
          });
        });
      }).catch(function() { body.innerHTML = '<div class="panel-error">' + razzleError() + '<br><button onclick="location.reload()">retry</button></div>'; });
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
    var stkCollege = typeof state !== 'undefined' && state.universe === 'college';
    var stkTitle = stkCollege ? 'College Stock Watch' : 'Dynasty Stock Watch';
    var stkSub = stkCollege ? 'efficiency vs production rankings across college football' : 'composite valuations from efficiency, consistency, and schedule';
    el.innerHTML = '<div class="lp-page">' +
      '<div class="lp-header"><h2>' + stkTitle + '</h2>' +
      '<div class="lp-subtitle">' + stkSub + '</div></div>' +
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
      '<div id="stk-body" style="overflow-x:auto;-webkit-overflow-scrolling:touch"><div class="lp-loading">crunching the composite...</div></div>' +
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

    var stkIsCollege = typeof state !== 'undefined' && state.universe === 'college';
    var COLS = [
      { key: 'name', label: 'Player' },
      { key: 'stock_score', label: 'Score' },
      { key: 'ppg', label: 'PPG' },
      { key: 'efficiency_grade', label: 'Eff' },
      { key: 'consistency_grade', label: stkIsCollege ? 'YPT' : 'Con' },
      { key: 'sos_grade', label: stkIsCollege ? 'Prod' : 'SOS' },
      { key: 'stock_delta', label: 'Delta', hide: true },
      { key: 'age', label: 'Age', hide: true },
      { key: 'games', label: 'GP', hide: true }
    ];

    function buildRow(p) {
      var pos = (p.position || 'RB').toLowerCase();
      var isCollege = typeof state !== 'undefined' && state.universe === 'college';
      var h = '<tr data-pid="' + escapeAttr(p.player_id) + '">';
      COLS.forEach(function(c) {
        var cls = [];
        if (c.key !== 'name') cls.push('center');
        if (c.hide) cls.push('hide-mobile');
        if (c.key === 'name') {
          h += '<td><div class="stk-player-cell">';
          if (p.headshot_url) h += '<img class="stk-headshot" src="' + escapeAttr(p.headshot_url) + '" alt="Player headshot" loading="lazy" onerror="this.onerror=null;this.src=\'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 40 40%22><circle cx=%2220%22 cy=%2220%22 r=%2220%22 fill=%22%23d97757%22/><text x=%2220%22 y=%2225%22 text-anchor=%22middle%22 fill=%22white%22 font-size=%2216%22>?</text></svg>\'">';
          h += '<div class="stk-player-info"><div class="stk-player-name">' + pLink(p.name, p.player_id) + '</div>';
          h += '<div class="stk-player-meta"><span class="stk-pos-badge ' + pos + '">' + escapeHtml(p.position) + '</span>';
          h += '<span class="stk-team-label">' + escapeHtml(p.team) + '</span>';
          if (isCollege && p.conference) h += '<span class="stk-team-label" style="font-size:11px;color:var(--ink-light)">' + escapeHtml(p.conference) + '</span>';
          h += '</div></div></div></td>';
        } else if (c.key === 'stock_score') {
          h += '<td class="' + cls.join(' ') + '"><span class="stk-score-badge ' + scoreClass(p.stock_score || 0) + '">' + escapeHtml(String(p.stock_score || 0)) + '</span></td>';
        } else if (c.key === 'ppg') {
          h += '<td class="' + cls.join(' ') + '" style="font-weight:700">' + fmt(p.ppg) + '</td>';
        } else if (c.key === 'efficiency_grade' || c.key === 'consistency_grade' || c.key === 'sos_grade') {
          var g = p[c.key];
          h += '<td class="' + cls.join(' ') + '">';
          if (g) { h += '<span class="stk-grade-badge ' + gradeClass(g) + '">' + escapeHtml(g) + '</span>'; }
          else { h += '<span class="stk-grade-badge" style="opacity:0.5">-</span>'; }
          h += '</td>';
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
      if (!players || !players.length) return '<div class="panel-empty">' + razzleEmpty() + '<span class="hint">try a different position or season</span></div>';
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
      if (!data || (!(data.rising && data.rising.length) && !(data.falling && data.falling.length))) {
        body.innerHTML = '<div class="panel-empty">' + razzleEmpty() + '<span class="hint">try a different position or season</span></div>';
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
          var _pid = tr.getAttribute('data-pid'); if (typeof openPlayerPopup === 'function') openPlayerPopup(_pid); else window.location.href = '/player/' + encodeURIComponent(_pid);
        });
      });
    }

    function loadSTK() {
      var body = el.querySelector('#stk-body');
      body.innerHTML = '<div class="lp-loading">crunching the composite...</div>';
      var sel = el.querySelector('#stk-season');
      if (sel && sel.options.length === 0) seasonsPopulated = false;
      var season = sel.value;
      var isCollege = typeof state !== 'undefined' && state.universe === 'college';
      var url = isCollege ? '/api/college/stock-watch?limit=30' : '/api/stock-watch?limit=30';
      if (season) url += '&season=' + season;
      if (curPos) url += '&position=' + curPos;

      fetch(url, { signal: _panelSignal() }).then(function(r) { if (!r.ok) throw new Error('API error'); return r.json(); }).then(function(data) {
        if (!seasonsPopulated && data.available_seasons) {
          var sel = el.querySelector('#stk-season');
          (data.available_seasons || []).forEach(function(s) {
            var o = document.createElement('option');
            o.value = s; o.textContent = s;
            if (s == data.season) o.selected = true;
            sel.appendChild(o);
          });
          seasonsPopulated = true;
        }
        render(data);
      }).catch(function() { body.innerHTML = '<div class="panel-error">' + razzleError() + '<br><button onclick="location.reload()">retry</button></div>'; });
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
    if (showNflOnlyMsg(el, 'waivers', 'Rising Players', 'surging lately — trending up over recent weeks')) return;
    el.innerHTML = '<div class="lp-page">' +
      '<div class="lp-header"><h2>Rising Players</h2>' +
      '<div class="lp-subtitle">surging lately — trending up over recent weeks</div></div>' +
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
      '<div id="ww-body" style="overflow-x:auto;-webkit-overflow-scrolling:touch"><div class="lp-loading">' + razzleLoading() + '</div></div>' +
      '</div>';

    var curPos = '';
    var seasonsPopulated = false;
    var currentWin = '4';

    function loadWW() {
      var body = el.querySelector('#ww-body');
      body.innerHTML = '<div class="lp-loading">' + razzleLoading() + '</div>';
      var season = el.querySelector('#ww-season').value;
      var win = el.querySelector('#ww-window').value;
      currentWin = win;
      var url = '/api/waivers?window=' + encodeURIComponent(win);
      if (season) url += '&season=' + encodeURIComponent(season);
      if (curPos) url += '&position=' + encodeURIComponent(curPos);

      fetch(url, { signal: _panelSignal() }).then(function(r) { if (!r.ok) throw new Error('API error'); return r.json(); }).then(function(data) {
        if (!seasonsPopulated && data.available_seasons) {
          var sel = el.querySelector('#ww-season');
          sel.innerHTML = '';
          (data.available_seasons || []).forEach(function(s) {
            var o = document.createElement('option');
            o.value = s; o.textContent = s;
            if (s === data.season) o.selected = true;
            sel.appendChild(o);
          });
          seasonsPopulated = true;
        }
        var targets = data.targets || [];
        var html = '<div class="ww-card"><div class="ww-card-header">Rising Players (' + escapeHtml(String(data.count || 0)) + ')</div>';
        if (!targets.length) {
          html += '<div class="panel-empty">' + razzleEmpty() + '</div></div>';
          body.innerHTML = html;
          return;
        }
        html += '<table class="ww-table"><thead><tr>';
        html += '<th scope="col">#</th><th>Player</th><th>Pos</th><th>GP</th><th>Szn PPG</th><th>Recent PPG</th><th>Surge</th><th>Last ' + escapeHtml(String(data.window || currentWin)) + '</th>';
        html += '</tr></thead><tbody>';
        for (var i = 0; i < targets.length; i++) {
          var p = targets[i];
          var posColor = POS_CSS[p.position] || 'var(--ink-light)';
          var sign = p.delta > 0 ? '+' : '';
          html += '<tr>';
          html += '<td class="ww-rank">' + (i + 1) + '</td>';
          html += '<td>' + pLink(p.name, p.player_id) + ' <span style="font-size:11px;color:var(--ink-light)">' + escapeHtml(p.team) + '</span></td>';
          html += '<td><span class="ww-pos-badge" style="background:' + posColor + '">' + escapeHtml(p.position) + '</span></td>';
          html += '<td>' + escapeHtml(String(p.games)) + '</td>';
          html += '<td>' + fmt(p.season_avg) + '</td>';
          html += '<td style="font-weight:700;color:var(--green)">' + fmt(p.recent_avg) + '</td>';
          html += '<td><span class="ww-delta-badge">' + sign + fmt(p.delta) + ' (' + sign + fmt(p.delta_pct, 0) + '%)</span></td>';
          var scores = p.recent_scores || [];
          var maxScore = Math.max.apply(null, scores.concat([1]));
          html += '<td><div class="ww-recent">';
          for (var j = 0; j < scores.length; j++) {
            var h2 = Math.max(2, Math.round((scores[j] / maxScore) * 20));
            var barColor = scores[j] >= p.season_avg ? 'var(--green)' : 'var(--orange)';
            html += '<div class="ww-recent-bar" style="height:' + h2 + 'px;background:' + barColor + '" title="' + fmt(scores[j]) + '"></div>';
          }
          html += '</div></td></tr>';
        }
        html += '</tbody></table></div>';
        body.innerHTML = html;
      }).catch(function() { body.innerHTML = '<div class="panel-error">' + razzleError() + '<br><button onclick="location.reload()">retry</button></div>'; });
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
    var scCollege = typeof state !== 'undefined' && state.universe === 'college';
    var scTitle = scCollege ? 'College Positional Scarcity' : 'Positional Scarcity';
    var scSub = scCollege ? 'production drop-off by position across college football' : 'where the cliff hits hardest';
    el.innerHTML = '<div class="lp-page">' +
      '<div class="lp-header"><h2>' + scTitle + '</h2>' +
      '<div class="lp-subtitle">' + scSub + '</div></div>' +
      '<div class="lp-controls">' +
      '<select class="lp-select" id="sc-season" aria-label="Season"></select>' +
      '</div>' +
      '<div id="sc-body" style="overflow-x:auto;-webkit-overflow-scrolling:touch"><div class="lp-loading">running the numbers...</div></div>' +
      '</div>';

    var seasonsPopulated = false;
    var POS_ANNOTATIONS = { QB: 'signal callers', RB: 'the backfield', WR: 'route runners', TE: 'the unicorns' };

    function loadSC() {
      var body = el.querySelector('#sc-body');
      body.innerHTML = '<div class="lp-loading">running the numbers...</div>';
      var sel = el.querySelector('#sc-season');
      if (sel && sel.options.length === 0) seasonsPopulated = false;
      var season = sel.value;
      var isCollege = typeof state !== 'undefined' && state.universe === 'college';
      var baseUrl = isCollege ? '/api/college/scarcity' : '/api/positional-scarcity';
      var url = season ? baseUrl + '?season=' + season : baseUrl;

      fetch(url, { signal: _panelSignal() }).then(function(r) { if (!r.ok) throw new Error('API error'); return r.json(); }).then(function(data) {
        if (!seasonsPopulated && data.available_seasons) {
          var sel = el.querySelector('#sc-season');
          (data.available_seasons || []).forEach(function(s) {
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
          var pos = (r.position || 'QB').toLowerCase();
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

          (pd.players || []).forEach(function(p) {
            while (nextBreakIdx < tierBreaks.length && p.rank > tierBreaks[nextBreakIdx].end) {
              var tb = tierBreaks[nextBreakIdx];
              html += '<div class="scarcity-tier-break"><div class="scarcity-tier-line"></div>';
              html += '<div class="scarcity-tier-label">' + escapeHtml(tb.annotation || tb.label) + '</div>';
              html += '<div class="scarcity-tier-line"></div></div>';
              nextBreakIdx++;
            }
            var pct = maxPpg > 0 ? (p.ppg / maxPpg) * 100 : 0;
            var scTeamLabel = isCollege && p.conference ? p.team + ' · ' + p.conference : p.team;
            html += '<div class="scarcity-bar-row" data-pid="' + escapeAttr(p.player_id) + '" title="' + escapeAttr(p.name + ' (' + scTeamLabel + ') — ' + p.ppg + ' PPG') + '">';
            html += '<div class="scarcity-bar-rank">' + escapeHtml(String(p.rank)) + '</div>';
            html += '<div class="scarcity-bar-name">' + escapeHtml(p.name) + (isCollege ? '<span style="font-size:11px;color:var(--ink-light);margin-left:4px">' + escapeHtml(p.team || '') + '</span>' : '') + '</div>';
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
            var _pid = row.getAttribute('data-pid'); if (typeof openPlayerPopup === 'function') openPlayerPopup(_pid); else window.location.href = '/player/' + encodeURIComponent(_pid);
          });
        });
      }).catch(function() { body.innerHTML = '<div class="panel-error">' + razzleError() + '<br><button onclick="location.reload()">retry</button></div>'; });
    }

    el.querySelector('#sc-season').addEventListener('change', loadSC);
    loadSC();
  }});

  // ===== HANDCUFFS =====
  defs.push({ name: 'handcuffs', render: function(el) {
    if (showNflOnlyMsg(el, 'handcuffs', 'Handcuff Rankings', 'most valuable backup RBs by team rushing volume')) return;
    el.innerHTML = '<div class="lp-page">' +
      '<div class="lp-header"><h2>Handcuff Rankings</h2>' +
      '<div class="lp-subtitle">most valuable backup RBs by team rushing volume</div></div>' +
      '<div class="lp-controls">' +
      '<select class="lp-select" id="hc-season" aria-label="Season"></select>' +
      '</div>' +
      '<div id="hc-body" style="overflow-x:auto;-webkit-overflow-scrolling:touch"><div class="lp-loading">' + razzleLoading() + '</div></div>' +
      '</div>';

    var seasonsPopulated = false;

    function loadHC() {
      var body = el.querySelector('#hc-body');
      body.innerHTML = '<div class="lp-loading">' + razzleLoading() + '</div>';
      var season = el.querySelector('#hc-season').value;
      var url = '/api/handcuffs';
      if (season) url += '?season=' + encodeURIComponent(season);

      fetch(url, { signal: _panelSignal() }).then(function(r) { if (!r.ok) throw new Error('API error'); return r.json(); }).then(function(data) {
        if (!seasonsPopulated && data.available_seasons) {
          var sel = el.querySelector('#hc-season');
          sel.innerHTML = '';
          (data.available_seasons || []).forEach(function(s) {
            var o = document.createElement('option');
            o.value = s; o.textContent = s;
            if (s === data.season) o.selected = true;
            sel.appendChild(o);
          });
          seasonsPopulated = true;
        }

        var hcs = data.handcuffs || [];
        if (!hcs.length) {
          body.innerHTML = '<div class="hc-card"><div class="hc-card-header">Handcuff Rankings</div><div class="panel-empty">' + razzleEmpty() + '</div></div>';
          return;
        }

        var html = '<div class="hc-card"><div class="hc-card-header">Handcuff Rankings (' + escapeHtml(String(data.count)) + ' teams)</div>';
        html += '<table class="hc-table"><thead><tr>';
        html += '<th scope="col">#</th><th>Team</th><th>Handcuff</th><th>HC PPG</th><th>HC Car/G</th><th>HC YPC</th><th>Value</th><th>Starter</th><th>Str PPG</th><th>Str Car/G</th><th>Team Rush/G</th>';
        html += '</tr></thead><tbody>';

        for (var i = 0; i < hcs.length; i++) {
          var h = hcs[i];
          html += '<tr>';
          html += '<td class="hc-rank">' + (i + 1) + '</td>';
          html += '<td><span class="hc-team-badge">' + escapeHtml(h.team) + '</span></td>';
          html += '<td style="font-weight:700">' + escapeHtml(h.handcuff_name) + '</td>';
          html += '<td style="font-weight:700;color:var(--green)">' + fmt(h.hc_ppg) + '</td>';
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
      }).catch(function() { body.innerHTML = '<div class="panel-error">' + razzleError() + '<br><button onclick="location.reload()">retry</button></div>'; });
    }

    el.querySelector('#hc-season').addEventListener('change', loadHC);
    loadHC();
  }});

  /* ===================================================================
     PERFORMANCE PANELS (8 native panel render functions)
     =================================================================== */

  // ===== 1. EFFICIENCY =====
  defs.push({ name: 'efficiency', render: function(el) {
    var effCollege = typeof state !== 'undefined' && state.universe === 'college';
    var effTitle = effCollege ? 'College Efficiency' : 'Fantasy Efficiency';
    var effSub = effCollege ? 'who does more with less in college football' : 'who does more with less, and who gets fed the most';
    el.innerHTML = '<div class="lp-page">' +
      '<div class="lp-header"><h2>' + effTitle + '</h2>' +
      '<div class="lp-subtitle">' + effSub + '</div></div>' +
      '<div class="lp-controls">' +
      '<div class="lp-pos-tabs" id="eff-pos-tabs">' +
      '<button class="lp-pos-tab active" data-pos="">All</button>' +
      '<button class="lp-pos-tab" data-pos="QB">QB</button>' +
      '<button class="lp-pos-tab" data-pos="RB">RB</button>' +
      '<button class="lp-pos-tab" data-pos="WR">WR</button>' +
      '<button class="lp-pos-tab" data-pos="TE">TE</button>' +
      '</div>' +
      '<select class="lp-select" id="eff-season" aria-label="Season"></select>' +
      weekSelectHTML('eff-week') +
      '</div>' +
      '<div id="eff-body" style="overflow-x:auto;-webkit-overflow-scrolling:touch"><div class="lp-loading">running the numbers...</div></div>' +
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
          var isCollegeEff = typeof state !== 'undefined' && state.universe === 'college';
          h += '<td><div class="eff-player-cell">';
          if (p.headshot_url) h += '<img class="eff-headshot" src="' + escapeAttr(p.headshot_url) + '" alt="Player headshot" loading="lazy" onerror="this.onerror=null;this.src=\'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 40 40%22><circle cx=%2220%22 cy=%2220%22 r=%2220%22 fill=%22%23d97757%22/><text x=%2220%22 y=%2225%22 text-anchor=%22middle%22 fill=%22white%22 font-size=%2216%22>?</text></svg>\'">';
          h += '<div class="eff-player-info"><div class="eff-player-name">' + pLink(p.name, p.player_id) + '</div>';
          h += '<div class="eff-player-meta"><span class="eff-pos-badge ' + pos + '">' + escapeHtml(p.position) + '</span>';
          h += '<span class="eff-team-label">' + escapeHtml(p.team) + '</span>';
          if (isCollegeEff && p.conference) h += '<span class="eff-team-label" style="font-size:11px;color:var(--ink-light)">' + escapeHtml(p.conference) + '</span>';
          h += '</div></div></div></td>';
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
        if (va == null && vb == null) return 0;
        if (va == null) return 1;
        if (vb == null) return -1;
        if (typeof va === 'string') return dir * va.localeCompare(String(vb));
        return dir * ((Number(va) || 0) - (Number(vb) || 0));
      });
    }

    function buildTable(players, section) {
      if (!players || !players.length) return '<div class="panel-empty">' + razzleEmpty() + '<span class="hint">try a different position or season</span></div>';
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
        body.innerHTML = '<div class="panel-empty">' + razzleEmpty() + '<span class="hint">try a different position or season</span></div>';
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
          var _pid = tr.getAttribute('data-pid'); if (typeof openPlayerPopup === 'function') openPlayerPopup(_pid); else window.location.href = '/player/' + encodeURIComponent(_pid);
        });
      });
    }

    function loadEFF() {
      var body = el.querySelector('#eff-body');
      body.innerHTML = '<div class="lp-loading">running the numbers...</div>';
      var sel = el.querySelector('#eff-season');
      if (sel && sel.options.length === 0) seasonsPopulated = false;
      var season = sel.value;
      var isCollege = typeof state !== 'undefined' && state.universe === 'college';
      var url = isCollege ? '/api/college/efficiency?limit=30' : '/api/efficiency-rankings?limit=30';
      if (season) url += '&season=' + season;
      if (curPos) url += '&position=' + curPos;
      var effWeekVal = parseInt((el.querySelector('#eff-week') || {}).value) || 0;
      if (!isCollege && effWeekVal > 0) url += '&week=' + effWeekVal;

      fetch(url, { signal: _panelSignal() }).then(function(r) {
        if (!r.ok) throw new Error('API error');
        return r.json();
      }).then(function(data) {
        if (!seasonsPopulated && data.available_seasons) {
          var sel = el.querySelector('#eff-season');
          (data.available_seasons || []).forEach(function(s) {
            var o = document.createElement('option');
            o.value = s; o.textContent = s;
            if (s == data.season) o.selected = true;
            sel.appendChild(o);
          });
          seasonsPopulated = true;
          if (!isCollege) populateWeekSelect(el, 'eff-week', sel.value, loadEFF);
        }
        render(data);
      }).catch(function() { body.innerHTML = '<div class="panel-error">' + razzleError() + '<br><button onclick="location.reload()">retry</button></div>'; });
    }

    el.querySelector('#eff-pos-tabs').addEventListener('click', function(e) {
      var tab = e.target.closest('.lp-pos-tab');
      if (!tab) return;
      el.querySelectorAll('#eff-pos-tabs .lp-pos-tab').forEach(function(t) { t.classList.remove('active'); });
      tab.classList.add('active');
      curPos = tab.getAttribute('data-pos') || '';
      loadEFF();
    });
    el.querySelector('#eff-season').addEventListener('change', function() {
      var isCollege = typeof state !== 'undefined' && state.universe === 'college';
      if (!isCollege) populateWeekSelect(el, 'eff-week', this.value, loadEFF);
      else { var ws = el.querySelector('#eff-week'); if (ws) ws.style.display = 'none'; }
      loadEFF();
    });
    loadEFF();
  }});

  // ===== 2. CONSISTENCY =====
  defs.push({ name: 'consistency', render: function(el) {
    var conCollege = typeof state !== 'undefined' && state.universe === 'college';
    var conTitle = conCollege ? 'College Consistency' : 'Consistency Rankings';
    var conSub = conCollege ? 'cross-season per-game consistency — who produces year after year?' : 'the safest floors and the wildest swings, week to week';
    el.innerHTML = '<div class="lp-page">' +
      '<div class="lp-header"><h2>' + conTitle + '</h2>' +
      '<div class="lp-subtitle">' + conSub + '</div></div>' +
      '<div class="lp-controls">' +
      '<div class="lp-pos-tabs" id="con-pos-tabs">' +
      '<button class="lp-pos-tab active" data-pos="">All</button>' +
      '<button class="lp-pos-tab" data-pos="QB">QB</button>' +
      '<button class="lp-pos-tab" data-pos="RB">RB</button>' +
      '<button class="lp-pos-tab" data-pos="WR">WR</button>' +
      '<button class="lp-pos-tab" data-pos="TE">TE</button>' +
      '</div>' +
      '<select class="lp-select" id="con-season" aria-label="Season"></select>' +
      weekSelectHTML('con-week') +
      '</div>' +
      '<div id="con-body" style="overflow-x:auto;-webkit-overflow-scrolling:touch"><div class="lp-loading">checking the tape...</div></div>' +
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
          var isCollegeCon = typeof state !== 'undefined' && state.universe === 'college';
          h += '<td><div class="con-player-cell">';
          if (p.headshot_url) h += '<img class="con-headshot" src="' + escapeAttr(p.headshot_url) + '" alt="Player headshot" loading="lazy" onerror="this.onerror=null;this.src=\'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 40 40%22><circle cx=%2220%22 cy=%2220%22 r=%2220%22 fill=%22%23d97757%22/><text x=%2220%22 y=%2225%22 text-anchor=%22middle%22 fill=%22white%22 font-size=%2216%22>?</text></svg>\'">';
          h += '<div class="con-player-info"><div class="con-player-name">' + pLink(p.name, p.player_id) + '</div>';
          h += '<div class="con-player-meta"><span class="con-pos-badge ' + pos + '">' + escapeHtml(p.position) + '</span>';
          h += '<span class="con-team-label">' + escapeHtml(p.team) + '</span>';
          if (isCollegeCon && p.conference) h += '<span class="con-team-label" style="font-size:11px;color:var(--ink-light)">' + escapeHtml(p.conference) + '</span>';
          h += '</div></div></div></td>';
        } else if (c.key === 'grade') {
          var g = p.grade || 'C';
          h += '<td class="' + cls.join(' ') + '"><span class="con-grade-badge ' + gradeClass(g) + '">' + escapeHtml(g) + '</span></td>';
        } else if (c.key === 'ppg') {
          h += '<td class="' + cls.join(' ') + '" style="font-weight:700">' + fmt(p.ppg) + '</td>';
        } else if (c.key === 'cov') {
          h += '<td class="' + cls.join(' ') + '" style="font-weight:700">' + fmt((p.cov || 0) * 100, 1) + '%</td>';
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
        if (va == null && vb == null) return 0;
        if (va == null) return 1;
        if (vb == null) return -1;
        if (typeof va === 'string') return dir * va.localeCompare(String(vb));
        return dir * ((Number(va) || 0) - (Number(vb) || 0));
      });
    }

    function buildTable(players, section) {
      if (!players || !players.length) return '<div class="panel-empty">' + razzleEmpty() + '<span class="hint">try a different position or season</span></div>';
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
        body.innerHTML = '<div class="panel-empty">' + razzleEmpty() + '<span class="hint">try a different position or season</span></div>';
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
          var _pid = tr.getAttribute('data-pid'); if (typeof openPlayerPopup === 'function') openPlayerPopup(_pid); else window.location.href = '/player/' + encodeURIComponent(_pid);
        });
      });
    }

    function loadCON() {
      var body = el.querySelector('#con-body');
      body.innerHTML = '<div class="lp-loading">checking the tape...</div>';
      var sel = el.querySelector('#con-season');
      if (sel && sel.options.length === 0) seasonsPopulated = false;
      var season = sel.value;
      var isCollege = typeof state !== 'undefined' && state.universe === 'college';
      var url = isCollege ? '/api/college/consistency?limit=30' : '/api/consistency-rankings?limit=30';
      if (season) url += '&season=' + season;
      if (curPos) url += '&position=' + curPos;
      var conWeekVal = parseInt((el.querySelector('#con-week') || {}).value) || 0;
      if (!isCollege && conWeekVal > 0) url += '&week=' + conWeekVal;

      fetch(url, { signal: _panelSignal() }).then(function(r) {
        if (!r.ok) throw new Error('API error');
        return r.json();
      }).then(function(data) {
        if (!seasonsPopulated && data.available_seasons) {
          var sel = el.querySelector('#con-season');
          (data.available_seasons || []).forEach(function(s) {
            var o = document.createElement('option');
            o.value = s; o.textContent = s;
            if (s == data.season) o.selected = true;
            sel.appendChild(o);
          });
          seasonsPopulated = true;
          if (!isCollege) populateWeekSelect(el, 'con-week', sel.value, loadCON);
        }
        render(data);
      }).catch(function() { body.innerHTML = '<div class="panel-error">' + razzleError() + '<br><button onclick="location.reload()">retry</button></div>'; });
    }

    el.querySelector('#con-pos-tabs').addEventListener('click', function(e) {
      var tab = e.target.closest('.lp-pos-tab');
      if (!tab) return;
      el.querySelectorAll('#con-pos-tabs .lp-pos-tab').forEach(function(t) { t.classList.remove('active'); });
      tab.classList.add('active');
      curPos = tab.getAttribute('data-pos') || '';
      loadCON();
    });
    el.querySelector('#con-season').addEventListener('change', function() {
      var isCollege = typeof state !== 'undefined' && state.universe === 'college';
      if (!isCollege) populateWeekSelect(el, 'con-week', this.value, loadCON);
      else { var ws = el.querySelector('#con-week'); if (ws) ws.style.display = 'none'; }
      loadCON();
    });
    loadCON();
  }});

  // ===== 3. SNAP EFFICIENCY =====
  defs.push({ name: 'snapefficiency', render: function(el) {
    var seCollege = typeof state !== 'undefined' && state.universe === 'college';
    var seTitle = seCollege ? 'College Touch Efficiency' : 'Snap Efficiency';
    var seSub = seCollege ? 'fantasy points per touch — who maximizes every opportunity?' : 'fantasy points per snap — who maximizes every snap they play?';
    el.innerHTML = '<div class="lp-page">' +
      '<div class="lp-header"><h2>' + seTitle + '</h2>' +
      '<div class="lp-subtitle">' + seSub + '</div></div>' +
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
      '<div id="se-body" style="overflow-x:auto;-webkit-overflow-scrolling:touch"><div class="lp-loading">' + razzleLoading() + '</div></div>' +
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
      body.innerHTML = '<div class="lp-loading">' + razzleLoading() + '</div>';
      var sel = el.querySelector('#se-season');
      if (sel && sel.options.length === 0) seasonsPopulated = false;
      var season = sel.value;
      var isCollege = typeof state !== 'undefined' && state.universe === 'college';
      var url = isCollege ? '/api/college/snap-efficiency' : '/api/snap-efficiency';
      if (season) url += '?season=' + season;
      if (curPos) url += (url.indexOf('?') > -1 ? '&' : '?') + 'position=' + curPos;

      fetch(url, { signal: _panelSignal() }).then(function(r) {
        if (!r.ok) throw new Error('API error');
        return r.json();
      }).then(function(data) {
        if (!seasonsPopulated && data.available_seasons) {
          var sel = el.querySelector('#se-season');
          var snapSeasons = data.snap_seasons || [];
          (data.available_seasons || []).forEach(function(s) {
            var o = document.createElement('option');
            o.value = s;
            var hasSnaps = isCollege || snapSeasons.indexOf(s) > -1;
            o.textContent = s + (hasSnaps ? '' : ' (no snap data)');
            if (s == data.season) o.selected = true;
            sel.appendChild(o);
          });
          seasonsPopulated = true;
        }
        if (!isCollege && data.has_snap_data === false) {
          body.innerHTML = '<div class="panel-empty">snap data not available for ' + escapeHtml(String(data.season)) + ' — snap counts require NFL tracking data which may not be available for all seasons</div>';
          return;
        }
        var players = data.players || [];
        if (!players.length) { body.innerHTML = '<div class="panel-empty">' + razzleEmpty() + '<span class="hint">try a different position or season</span></div>'; return; }

        var ptsLabel = isCollege ? 'Pts/Tch' : 'Pts/Snap';
        var volLabel = isCollege ? 'Tch/G' : 'Snaps/G';
        var totLabel = isCollege ? 'Touches' : 'Snaps';
        var headerTitle = isCollege ? 'Points Per Touch Rankings' : 'Points Per Snap Rankings';
        var maxPPS = Math.max.apply(null, players.map(function(p) { return p.pts_per_snap || 0; }).concat([1]));
        var html = '<div class="se-card"><div class="se-card-header">' + headerTitle + '</div>';
        html += '<table class="se-table"><thead><tr><th>#</th><th>Player</th><th>Pos</th><th>' + ptsLabel + '</th><th>PPG</th><th>' + volLabel + '</th><th>' + totLabel + '</th><th>GP</th><th></th></tr></thead><tbody>';
        for (var i = 0; i < players.length; i++) {
          var p = players[i];
          var posColor = POS_COLORS[p.position] || (typeof getCanvasTheme === 'function' ? getCanvasTheme().ink : '#2d1f14');
          var cls = effClass(p.pts_per_snap);
          var barPct = maxPPS > 0 ? p.pts_per_snap / maxPPS * 100 : 0;
          var teamLabel = escapeHtml(p.team);
          if (isCollege && p.conference) teamLabel += ' <span style="font-size:11px;color:var(--ink-light)">' + escapeHtml(p.conference) + '</span>';
          html += '<tr>';
          html += '<td class="se-rank">' + (i + 1) + '</td>';
          html += '<td>' + pLink(p.name, p.player_id) + ' <span style="color:var(--ink-light);font-size:11px">' + teamLabel + '</span></td>';
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
      }).catch(function() { body.innerHTML = '<div class="panel-error">' + razzleError() + '<br><button onclick="location.reload()">retry</button></div>'; });
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
    var wlCollege = typeof state !== 'undefined' && state.universe === 'college';
    var wlTitle = wlCollege ? 'College Workload Monitor' : 'Workload Monitor';
    var wlSub = wlCollege ? 'who\'s carrying the heaviest load in college football?' : 'who\'s carrying the heaviest load?';
    el.innerHTML = '<div class="lp-page">' +
      '<div class="lp-header"><h2>' + wlTitle + '</h2>' +
      '<div class="lp-subtitle">' + wlSub + '</div></div>' +
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
      '<div id="wl-body" style="overflow-x:auto;-webkit-overflow-scrolling:touch"><div class="lp-loading">' + razzleLoading() + '</div></div>' +
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
      body.innerHTML = '<div class="lp-loading">' + razzleLoading() + '</div>';
      var sel = el.querySelector('#wl-season');
      if (sel && sel.options.length === 0) seasonsPopulated = false;
      var season = sel.value;
      var isCollege = typeof state !== 'undefined' && state.universe === 'college';
      var url = isCollege ? '/api/college/workload' : '/api/workload-monitor';
      if (season) url += '?season=' + season;
      if (curPos) url += (url.indexOf('?') > -1 ? '&' : '?') + 'position=' + curPos;

      fetch(url, { signal: _panelSignal() }).then(function(r) {
        if (!r.ok) throw new Error('API error');
        return r.json();
      }).then(function(data) {
        if (!seasonsPopulated && data.available_seasons) {
          var sel = el.querySelector('#wl-season');
          (data.available_seasons || []).forEach(function(s) {
            var o = document.createElement('option');
            o.value = s; o.textContent = s;
            if (s == data.season) o.selected = true;
            sel.appendChild(o);
          });
          seasonsPopulated = true;
        }
        var players = data.players || [];
        if (!players.length) { body.innerHTML = '<div class="panel-empty">' + razzleEmpty() + '<span class="hint">try a different position or season</span></div>'; return; }

        var maxWL = Math.max.apply(null, players.map(function(p) { return p.workload || 0; }).concat([1]));
        var showSnaps = !isCollege;
        var html = '<div class="wl-card"><div class="wl-card-header">Workload Rankings</div>';
        html += '<table class="wl-table"><thead><tr><th>#</th><th>Player</th><th>Pos</th><th>Load</th><th>Tch/G</th>';
        if (showSnaps) html += '<th scope="col">Snp/G</th><th>Snp%</th>';
        html += '<th scope="col">Car/G</th><th>Tgt/G</th><th>Flags</th><th></th></tr></thead><tbody>';
        for (var i = 0; i < players.length; i++) {
          var p = players[i];
          var posColor = POS_COLORS[p.position] || (typeof getCanvasTheme === 'function' ? getCanvasTheme().ink : '#2d1f14');
          var cls = scoreClass(p.workload);
          var barPct = maxWL > 0 ? p.workload / maxWL * 100 : 0;
          var flagsHtml = (p.flags || []).map(function(f) { return '<span class="wl-flag">' + escapeHtml(f) + '</span>'; }).join('');
          var teamLabel = escapeHtml(p.team);
          if (isCollege && p.conference) teamLabel += ' <span style="font-size:11px;color:var(--ink-light)">' + escapeHtml(p.conference) + '</span>';
          html += '<tr>';
          html += '<td class="wl-rank">' + (i + 1) + '</td>';
          html += '<td>' + pLink(p.name, p.player_id) + ' <span style="color:var(--ink-light);font-size:11px">' + teamLabel + '</span></td>';
          html += '<td><span class="wl-pos-badge" style="background:' + posColor + '">' + escapeHtml(p.position) + '</span></td>';
          html += '<td><span class="wl-score-badge ' + cls + '">' + escapeHtml(String(p.workload)) + '</span></td>';
          html += '<td>' + fmt(p.touches_pg) + '</td>';
          if (showSnaps) {
            html += '<td>' + (p.snaps_pg != null ? fmt(p.snaps_pg) : '-') + '</td>';
            var snapPct = p.snap_pct != null ? escapeHtml(String(p.snap_pct)) + '%' : '-';
            html += '<td>' + snapPct + '</td>';
          }
          html += '<td>' + fmt(p.carries_pg) + '</td>';
          html += '<td>' + fmt(p.targets_pg) + '</td>';
          html += '<td style="text-align:left">' + flagsHtml + '</td>';
          html += '<td class="wl-bar-cell"><div class="wl-bar" style="width:' + barPct + '%"></div></td>';
          html += '</tr>';
        }
        html += '</tbody></table></div>';
        body.innerHTML = html;
      }).catch(function() { body.innerHTML = '<div class="panel-error">' + razzleError() + '<br><button onclick="location.reload()">retry</button></div>'; });
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
    var dtCollege = typeof state !== 'undefined' && state.universe === 'college';
    var dtTitle = dtCollege ? 'College Dual-Threat Index' : 'Dual-Threat Index';
    var dtSub = dtCollege ? 'rush + rec versatility in college football' : 'rush + rec versatility — who contributes in both dimensions?';
    el.innerHTML = '<div class="lp-page">' +
      '<div class="lp-header"><h2>' + dtTitle + '</h2>' +
      '<div class="lp-subtitle">' + dtSub + '</div></div>' +
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
      '<div id="dt-body" style="overflow-x:auto;-webkit-overflow-scrolling:touch"><div class="lp-loading">' + razzleLoading() + '</div></div>' +
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
      body.innerHTML = '<div class="lp-loading">' + razzleLoading() + '</div>';
      var sel = el.querySelector('#dt-season');
      if (sel && sel.options.length === 0) seasonsPopulated = false;
      var season = sel.value;
      var isCollege = typeof state !== 'undefined' && state.universe === 'college';
      var url = isCollege ? '/api/college/dual-threat' : '/api/dual-threat';
      if (season) url += '?season=' + season;
      if (curPos) url += (url.indexOf('?') > -1 ? '&' : '?') + 'position=' + curPos;

      fetch(url, { signal: _panelSignal() }).then(function(r) {
        if (!r.ok) throw new Error('API error');
        return r.json();
      }).then(function(data) {
        if (!seasonsPopulated && data.available_seasons) {
          var sel = el.querySelector('#dt-season');
          (data.available_seasons || []).forEach(function(s) {
            var o = document.createElement('option');
            o.value = s; o.textContent = s;
            if (s == data.season) o.selected = true;
            sel.appendChild(o);
          });
          seasonsPopulated = true;
        }
        var players = data.players || [];
        if (!players.length) { body.innerHTML = '<div class="panel-empty">' + razzleEmpty() + '<span class="hint">try a different position or season</span></div>'; return; }

        var html = '<div class="dt-card"><div class="dt-card-header">Dual-Threat Rankings</div>';
        html += '<table class="dt-table"><thead><tr><th>#</th><th>Player</th><th>Pos</th><th>DTI</th><th>Rush/G</th><th>Rec/G</th><th>Tot/G</th><th>Car/G</th><th>Rec/G</th><th>Split</th></tr></thead><tbody>';
        for (var i = 0; i < players.length; i++) {
          var p = players[i];
          var posColor = POS_COLORS[p.position] || (typeof getCanvasTheme === 'function' ? getCanvasTheme().ink : '#2d1f14');
          var cls = dtiClass(p.dti);
          var teamLabel = escapeHtml(p.team);
          if (isCollege && p.conference) teamLabel += ' <span style="font-size:11px;color:var(--ink-light)">' + escapeHtml(p.conference) + '</span>';
          html += '<tr>';
          html += '<td class="dt-rank">' + (i + 1) + '</td>';
          html += '<td>' + pLink(p.name, p.player_id) + ' <span style="color:var(--ink-light);font-size:11px">' + teamLabel + '</span></td>';
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
      }).catch(function() { body.innerHTML = '<div class="panel-error">' + razzleError() + '<br><button onclick="location.reload()">retry</button></div>'; });
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
    if (showNflOnlyMsg(el, 'targetpremium', 'Target Premium', 'target quality composite')) return;
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
      weekSelectHTML('tp-week') +
      '</div>' +
      '<div id="tp-body" style="overflow-x:auto;-webkit-overflow-scrolling:touch"><div class="lp-loading">' + razzleLoading() + '</div></div>' +
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
      body.innerHTML = '<div class="lp-loading">' + razzleLoading() + '</div>';
      var season = el.querySelector('#tp-season').value;
      var url = '/api/target-premium';
      if (season) url += '?season=' + season;
      else url += '?season=' + _latestSeason;
      if (curPos) url += '&position=' + curPos;
      var tpWeekVal = parseInt((el.querySelector('#tp-week') || {}).value) || 0;
      if (tpWeekVal > 0) url += '&week=' + tpWeekVal;

      fetch(url, { signal: _panelSignal() }).then(function(r) {
        if (!r.ok) throw new Error('API error');
        return r.json();
      }).then(function(data) {
        if (!seasonsPopulated && data.available_seasons) {
          var sel = el.querySelector('#tp-season');
          (data.available_seasons || []).forEach(function(s) {
            var o = document.createElement('option');
            o.value = s; o.textContent = s;
            if (s == data.season) o.selected = true;
            sel.appendChild(o);
          });
          seasonsPopulated = true;
          populateWeekSelect(el, 'tp-week', sel.value, loadTP);
        }
        var players = data.players || [];
        if (!players.length) { body.innerHTML = '<div class="panel-empty">' + razzleEmpty() + '<span class="hint">try a different position or season</span></div>'; return; }

        var html = '<div class="tp-card"><div class="tp-card-header">Target Quality Rankings</div>';
        html += '<table class="tp-table"><thead><tr><th>#</th><th>Player</th><th>Pos</th><th>Premium</th><th>Tgt/G</th><th>aDOT</th><th>Catch%</th><th>YAC/R</th><th>Y/Tgt</th><th></th></tr></thead><tbody>';
        for (var i = 0; i < players.length; i++) {
          var p = players[i];
          var posColor = POS_COLORS[p.position] || (typeof getCanvasTheme === 'function' ? getCanvasTheme().ink : '#2d1f14');
          var cls = premiumClass(p.premium);
          html += '<tr>';
          html += '<td class="tp-rank">' + (i + 1) + '</td>';
          html += '<td>' + pLink(p.name, p.player_id) + ' <span style="color:var(--ink-light);font-size:11px">' + escapeHtml(p.team) + '</span></td>';
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
      }).catch(function() { body.innerHTML = '<div class="panel-error">' + razzleError() + '<br><button onclick="location.reload()">retry</button></div>'; });
    }

    el.querySelector('#tp-pos-tabs').addEventListener('click', function(e) {
      var tab = e.target.closest('.lp-pos-tab');
      if (!tab) return;
      el.querySelectorAll('#tp-pos-tabs .lp-pos-tab').forEach(function(t) { t.classList.remove('active'); });
      tab.classList.add('active');
      curPos = tab.getAttribute('data-pos') || '';
      loadTP();
    });
    el.querySelector('#tp-season').addEventListener('change', function() {
      populateWeekSelect(el, 'tp-week', this.value, loadTP);
      loadTP();
    });
    loadTP();
  }});

  // ===== 7. DROP RATE =====
  defs.push({ name: 'drops', render: function(el) {
    if (showNflOnlyMsg(el, 'drops', 'Drop Rate', 'sure hands vs butterfingers')) return;
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
      weekSelectHTML('dr-week') +
      '</div>' +
      '<div id="dr-body" style="overflow-x:auto;-webkit-overflow-scrolling:touch"><div class="lp-loading">' + razzleLoading() + '</div></div>' +
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
      if (!players.length) return '<div class="panel-empty">' + razzleEmpty() + '<span class="hint">try a different position or season</span></div>';
      var maxDrops = Math.max.apply(null, players.map(function(p) { return p.drops || 0; }).concat([1]));
      var barCls = type === 'sure' ? 'dr-bar-good' : 'dr-bar-bad';
      var isGood = type === 'sure';

      var html = '<table class="dr-table"><thead><tr><th>#</th><th>Player</th><th>Pos</th><th>Drop%</th><th>Drops</th><th>Tgt</th><th>Catch%</th><th>YAC/R</th><th></th></tr></thead><tbody>';
      for (var i = 0; i < players.length; i++) {
        var p = players[i];
        var posColor = POS_COLORS[p.position] || (typeof getCanvasTheme === 'function' ? getCanvasTheme().ink : '#2d1f14');
        var barPct = maxDrops > 0 ? p.drops / maxDrops * 100 : 0;
        var cls = rateClass(p.drop_rate, isGood);
        html += '<tr>';
        html += '<td class="dr-rank">' + (i + 1) + '</td>';
        html += '<td>' + pLink(p.name, p.player_id) + ' <span style="color:var(--ink-light);font-size:11px">' + escapeHtml(p.team) + '</span></td>';
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
      body.innerHTML = '<div class="lp-loading">' + razzleLoading() + '</div>';
      var season = el.querySelector('#dr-season').value;
      var url = '/api/drop-rate';
      if (season) url += '?season=' + season;
      else url += '?season=' + _latestSeason;
      if (curPos) url += '&position=' + curPos;
      var drWeekVal = parseInt((el.querySelector('#dr-week') || {}).value) || 0;
      if (drWeekVal > 0) url += '&week=' + drWeekVal;

      fetch(url, { signal: _panelSignal() }).then(function(r) {
        if (!r.ok) throw new Error('API error');
        return r.json();
      }).then(function(data) {
        if (!seasonsPopulated && data.available_seasons) {
          var sel = el.querySelector('#dr-season');
          (data.available_seasons || []).forEach(function(s) {
            var o = document.createElement('option');
            o.value = s; o.textContent = s;
            if (s == data.season) o.selected = true;
            sel.appendChild(o);
          });
          seasonsPopulated = true;
          populateWeekSelect(el, 'dr-week', sel.value, loadDR);
        }
        var sure = data.sure_hands || [];
        var butter = data.butterfingers || [];
        if (!sure.length && !butter.length) { body.innerHTML = '<div class="panel-empty">' + razzleEmpty() + '<span class="hint">try a different position or season</span></div>'; return; }

        var html = '<div class="dr-grid">';
        html += '<div class="dr-card"><div class="dr-card-header sure">Sure Hands</div>' + renderDropTable(sure, 'sure') + '</div>';
        html += '<div class="dr-card"><div class="dr-card-header butter">Butterfingers</div>' + renderDropTable(butter, 'butter') + '</div>';
        html += '</div>';
        body.innerHTML = html;
      }).catch(function() { body.innerHTML = '<div class="panel-error">' + razzleError() + '<br><button onclick="location.reload()">retry</button></div>'; });
    }

    el.querySelector('#dr-pos-tabs').addEventListener('click', function(e) {
      var tab = e.target.closest('.lp-pos-tab');
      if (!tab) return;
      el.querySelectorAll('#dr-pos-tabs .lp-pos-tab').forEach(function(t) { t.classList.remove('active'); });
      tab.classList.add('active');
      curPos = tab.getAttribute('data-pos') || '';
      loadDR();
    });
    el.querySelector('#dr-season').addEventListener('change', function() {
      populateWeekSelect(el, 'dr-week', this.value, loadDR);
      loadDR();
    });
    loadDR();
  }});

  // ===== 8. GARBAGE TIME =====
  defs.push({ name: 'garbagetime', render: function(el) {
    if (showNflOnlyMsg(el, 'garbagetime', 'Garbage Time Detector', 'stat padders vs clean producers')) return;
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
      '<div id="gt-body" style="overflow-x:auto;-webkit-overflow-scrolling:touch"><div class="lp-loading">' + razzleLoading() + '</div></div>' +
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
        return '<div class="gt-card"><div class="gt-card-header ' + cls + '">' + escapeHtml(title) + '</div><div class="panel-empty">' + razzleEmpty() + '</div></div>';
      }
      var maxVal = Math.max.apply(null, players.map(function(p) { return (isPadders ? p.garbage_time_pct : p.ppg) || 0; }).concat([1]));
      var html = '<div class="gt-card"><div class="gt-card-header ' + cls + '">' + escapeHtml(title) + '</div>';
      html += '<table class="gt-table"><thead><tr><th>#</th><th>Player</th><th>Pos</th><th>GT%</th><th>PPG</th><th>Avg Diff</th><th></th></tr></thead><tbody>';
      for (var i = 0; i < players.length; i++) {
        var p = players[i];
        var posColor = POS_COLORS[p.position] || (typeof getCanvasTheme === 'function' ? getCanvasTheme().ink : '#2d1f14');
        var pCls = pctClass(p.garbage_time_pct);
        var barVal = isPadders ? p.garbage_time_pct : p.ppg;
        var barPct = maxVal > 0 ? barVal / maxVal * 100 : 0;
        var barCls = isPadders ? 'red' : 'green';
        html += '<tr>';
        html += '<td class="gt-rank">' + (i + 1) + '</td>';
        html += '<td>' + pLink(p.name, p.player_id) + ' <span style="color:var(--ink-light);font-size:11px">' + escapeHtml(p.team) + '</span></td>';
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
      body.innerHTML = '<div class="lp-loading">' + razzleLoading() + '</div>';
      var season = el.querySelector('#gt-season').value;
      var url = '/api/garbage-time';
      if (season) url += '?season=' + season;
      else url += '?season=' + _latestSeason;
      if (curPos) url += '&position=' + curPos;

      fetch(url, { signal: _panelSignal() }).then(function(r) {
        if (!r.ok) throw new Error('API error');
        return r.json();
      }).then(function(data) {
        if (!seasonsPopulated && data.available_seasons) {
          var sel = el.querySelector('#gt-season');
          (data.available_seasons || []).forEach(function(s) {
            var o = document.createElement('option');
            o.value = s; o.textContent = s;
            if (s == data.season) o.selected = true;
            sel.appendChild(o);
          });
          seasonsPopulated = true;
        }
        var padders = data.stat_padders || [];
        var clean = data.clean_producers || [];
        if (!padders.length && !clean.length) { body.innerHTML = '<div class="panel-empty">' + razzleEmpty() + '<span class="hint">try a different position or season</span></div>'; return; }

        var html = '<div class="gt-sections">';
        html += buildGTCard('Stat Padders — High Garbage Time %', 'padders', padders, true);
        html += buildGTCard('Clean Producers — Low Garbage Time %', 'clean', clean, false);
        html += '</div>';
        body.innerHTML = html;
      }).catch(function() { body.innerHTML = '<div class="panel-error">' + razzleError() + '<br><button onclick="location.reload()">retry</button></div>'; });
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

  // ===== WEEKLY SCORING HEATMAP =====
  defs.push({ name: 'weekly', render: function(el) {
    function getHeatColors() {
      var isDark = document.documentElement.getAttribute("data-theme") === "dark";
      if (isDark) {
        return [
          { bg: '#5c2525', text: '#f2d5d8' },
          { bg: '#5c4a25', text: '#f5eacc' },
          { bg: '#4a3728', text: '#c4b5a5' },
          { bg: '#1a4a42', text: '#d9efec' },
          { bg: '#0d3a2d', text: '#b8e6d8' }
        ];
      }
      return [
        { bg: '#f2d5d8', text: '#8b2030' },
        { bg: '#f5eacc', text: '#7a6020' },
        { bg: '#f7efe5', text: '#5c4a3d' },
        { bg: '#d9efec', text: '#1a6b60' },
        { bg: '#b8e6d8', text: '#0d5040' }
      ];
    }

    function getHeatColor(score, thresholds) {
      if (score === null || score === undefined) return null;
      var hc = getHeatColors();
      if (score <= thresholds.p20) return hc[0];
      if (score <= thresholds.p40) return hc[1];
      if (score <= thresholds.p60) return hc[2];
      if (score <= thresholds.p80) return hc[3];
      return hc[4];
    }

    var curPos = 'ALL';
    var sortCol = 'total';
    var sortDir = -1;
    var currentData = null;
    var seasonsPopulated = false;

    el.innerHTML =
      '<div class="lp-page">' +
        '<div class="lp-header"><h2>Weekly Scoring Heatmap</h2>' +
        '<div class="lp-subtitle">every week, every player, at a glance</div></div>' +
        '<div class="lp-controls">' +
          '<div class="lp-pos-tabs" id="wh-pos-tabs">' +
            '<button class="lp-pos-tab active" data-pos="ALL">All</button>' +
            '<button class="lp-pos-tab" data-pos="QB">QB</button>' +
            '<button class="lp-pos-tab" data-pos="RB">RB</button>' +
            '<button class="lp-pos-tab" data-pos="WR">WR</button>' +
            '<button class="lp-pos-tab" data-pos="TE">TE</button>' +
          '</div>' +
          '<select class="lp-select" id="wh-season" aria-label="Season"></select>' +
        '</div>' +
        '<div id="wh-body" style="overflow-x:auto;-webkit-overflow-scrolling:touch"><div class="lp-loading">' + razzleLoading() + '</div></div>' +
      '</div>';

    function loadWH() {
      var body = el.querySelector('#wh-body');
      body.innerHTML = '<div class="lp-loading">' + razzleLoading() + '</div>';
      var season = el.querySelector('#wh-season').value || '';
      var posParam = curPos === 'ALL' ? '' : curPos;
      var url = '/api/weekly-heatmap?limit=40';
      if (season) url += '&season=' + season;
      if (posParam) url += '&position=' + posParam;

      fetch(url, { signal: _panelSignal() }).then(function(r) {
        if (!r.ok) throw new Error('API error');
        return r.json();
      }).then(function(data) {
        currentData = data;
        if (!seasonsPopulated && data.available_seasons) {
          var sel = el.querySelector('#wh-season');
          (data.available_seasons || []).forEach(function(s) {
            var o = document.createElement('option');
            o.value = s; o.textContent = s;
            if (s === data.season) o.selected = true;
            sel.appendChild(o);
          });
          seasonsPopulated = true;
        }
        renderWH(data);
      }).catch(function() {
        body.innerHTML = '<div class="panel-error">' + razzleError() + '<br><button onclick="location.reload()">retry</button></div>';
      });
    }

    function renderWH(data) {
      var body = el.querySelector('#wh-body');
      if (!data.players || !data.players.length) {
        body.innerHTML = '<div class="panel-empty">' + razzleEmpty() + '<span class="hint">try a different position or season</span></div>';
        return;
      }

      var weeks = data.weeks || [];
      var thresholds = data.thresholds || {};

      var sorted = data.players.slice();
      sorted.sort(function(a, b) {
        var va, vb;
        if (sortCol === 'total') { va = a.total_pts || 0; vb = b.total_pts || 0; }
        else if (sortCol === 'ppg') { va = a.ppg || 0; vb = b.ppg || 0; }
        else { va = (a.weeks || {})[String(sortCol)]; vb = (b.weeks || {})[String(sortCol)]; va = va == null ? -999 : va; vb = vb == null ? -999 : vb; }
        return (va - vb) * sortDir;
      });

      var arrow = sortDir === -1 ? ' \u25BC' : ' \u25B2';
      var html = '<div class="wh-container"><table class="wh-table"><thead><tr>';
      html += '<th class="wh-player-col" data-sort="total">Player' + (sortCol === 'total' ? arrow : '') + '</th>';
      weeks.forEach(function(w) {
        html += '<th data-sort="' + w + '">W' + w + (sortCol === w ? arrow : '') + '</th>';
      });
      html += '<th scope="col">GP</th>';
      html += '<th data-sort="ppg">PPG' + (sortCol === 'ppg' ? arrow : '') + '</th>';
      html += '</tr></thead><tbody>';

      sorted.forEach(function(p, idx) {
        var pos = p.position || 'WR';
        var posColor = POS_CSS[pos] || 'var(--orange)';
        var t = thresholds[pos] || thresholds['WR'] || { p20: 5, p40: 10, p60: 15, p80: 20 };

        html += '<tr>';
        html += '<td class="wh-player-cell"><div class="wh-player-inner" data-pid="' + escapeAttr(p.player_id) + '">';
        html += '<span class="wh-rank">' + (idx + 1) + '</span>';
        html += '<span class="wh-pos-dot" style="background:' + posColor + '"></span>';
        html += '<span>' + pLink(p.name, p.player_id) + '</span>';
        html += '<span class="wh-team">' + escapeHtml(p.team) + '</span>';
        html += '</div></td>';

        weeks.forEach(function(w) {
          var score = (p.weeks || {})[String(w)];
          if (score === null || score === undefined) {
            html += '<td class="wh-bye">bye</td>';
          } else {
            var hc = getHeatColor(score, t);
            var sc = Number(score);
            html += '<td class="wh-score-cell" style="background:' + hc.bg + '; color:' + hc.text + ';" title="' + escapeAttr(p.name) + ' Week ' + w + ': ' + sc.toFixed(1) + ' pts">';
            html += sc.toFixed(1) + '</td>';
          }
        });

        html += '<td class="wh-ppg-cell" style="color:var(--ink-light)">' + p.games + '</td>';
        var ppgColor = getHeatColor(p.ppg, t);
        html += '<td class="wh-ppg-cell wh-score-cell" style="background:' + (ppgColor ? ppgColor.bg : '') + '; color:' + (ppgColor ? ppgColor.text : '') + ';">' + fmt(p.ppg) + '</td>';
        html += '</tr>';
      });

      html += '</tbody></table></div>';

      var legendPos = curPos !== 'ALL' ? curPos : 'WR';
      var lt = thresholds[legendPos] || { p20: 5, p40: 10, p60: 15, p80: 20 };
      html += '<div class="wh-legend"><span>&lt;' + (lt.p20 || 0).toFixed(0) + '</span><div class="wh-legend-bar">';
      getHeatColors().forEach(function(hc) { html += '<div class="wh-legend-cell" style="background:' + hc.bg + '"></div>'; });
      html += '</div><span>' + (lt.p80 || 0).toFixed(0) + '+</span></div>';
      html += '<div class="wh-legend-note">PPR points (' + legendPos + ' thresholds) — click column headers to sort</div>';

      body.innerHTML = html;

      body.querySelectorAll('th[data-sort]').forEach(function(th) {
        th.addEventListener('click', function() {
          var col = th.getAttribute('data-sort');
          var numCol = parseInt(col, 10);
          col = isNaN(numCol) ? col : numCol;
          if (sortCol === col) sortDir *= -1;
          else { sortCol = col; sortDir = -1; }
          renderWH(currentData);
        });
      });

      body.querySelectorAll('.wh-player-inner').forEach(function(pi) {
        pi.addEventListener('click', function() {
          var pid = pi.getAttribute('data-pid');
          if (pid) if (typeof openPlayerPopup === 'function') openPlayerPopup(pid); else window.location.href = '/player/' + encodeURIComponent(pid);
        });
      });
    }

    el.querySelector('#wh-pos-tabs').addEventListener('click', function(e) {
      var tab = e.target.closest('.lp-pos-tab');
      if (!tab) return;
      el.querySelectorAll('#wh-pos-tabs .lp-pos-tab').forEach(function(t) { t.classList.remove('active'); });
      tab.classList.add('active');
      curPos = tab.getAttribute('data-pos') || 'ALL';
      loadWH();
    });
    el.querySelector('#wh-season').addEventListener('change', loadWH);
    loadWH();
  }});

  // ===== MATCHUP HEATMAP =====
  defs.push({ name: 'matchups', render: function(el) {
    if (showNflOnlyMsg(el, 'matchups', 'Matchup Heatmap', 'defensive PPG allowed by position')) return;
    var curPos = 'ALL';
    var sortCol = null;
    var sortAsc = true;
    var currentData = null;
    var seasonsPopulated = false;

    el.innerHTML =
      '<div class="lp-page">' +
        '<div class="lp-header"><h2>Matchup Heatmap</h2>' +
        '<div class="lp-subtitle">which defenses give up the bag</div></div>' +
        '<div class="lp-controls">' +
          '<div class="lp-pos-tabs" id="mh-pos-tabs">' +
            '<button class="lp-pos-tab active" data-pos="ALL">All</button>' +
            '<button class="lp-pos-tab" data-pos="QB">QB</button>' +
            '<button class="lp-pos-tab" data-pos="RB">RB</button>' +
            '<button class="lp-pos-tab" data-pos="WR">WR</button>' +
            '<button class="lp-pos-tab" data-pos="TE">TE</button>' +
          '</div>' +
          '<select class="lp-select" id="mh-season" aria-label="Season"></select>' +
        '</div>' +
        '<div class="mh-legend">' +
          '<div class="mh-legend-item"><div class="mh-legend-swatch" style="background:var(--green);"></div> Easy</div>' +
          '<div class="mh-legend-item"><div class="mh-legend-swatch" style="background:var(--green-light);"></div> Soft</div>' +
          '<div class="mh-legend-item"><div class="mh-legend-swatch" style="background:var(--bg-card);"></div> Average</div>' +
          '<div class="mh-legend-item"><div class="mh-legend-swatch" style="background:var(--red-light);"></div> Tough</div>' +
          '<div class="mh-legend-item"><div class="mh-legend-swatch" style="background:var(--red);"></div> Hard</div>' +
        '</div>' +
        '<div id="mh-body" style="overflow-x:auto;-webkit-overflow-scrolling:touch"><div class="lp-loading">' + razzleLoading() + '</div></div>' +
        '<div id="mh-detail" class="mh-detail"></div>' +
      '</div>';

    function getHeatColor(ppg, allValues) {
      var isDark = document.documentElement.getAttribute("data-theme") === "dark";
      if (!allValues || !allValues.length) return isDark ? '#4a3728' : '#f7efe5';
      var s = allValues.slice().sort(function(a, b) { return a - b; });
      var p20 = s[Math.floor(s.length * 0.2)] || 0;
      var p40 = s[Math.floor(s.length * 0.4)] || 0;
      var p60 = s[Math.floor(s.length * 0.6)] || 0;
      var p80 = s[Math.floor(s.length * 0.8)] || 0;
      if (isDark) {
        if (ppg >= p80) return '#1a5a50';
        if (ppg >= p60) return '#1a4a42';
        if (ppg >= p40) return '#4a3728';
        if (ppg >= p20) return '#5c2525';
        return '#8b1a1a';
      }
      if (ppg >= p80) return '#2ec4b6';
      if (ppg >= p60) return '#d9efec';
      if (ppg >= p40) return '#f7efe5';
      if (ppg >= p20) return '#f2d5d8';
      return '#e63946';
    }

    function getAnnotation(rank, total) {
      if (rank <= 3) return 'cake';
      if (rank <= 6) return 'soft';
      if (rank >= total - 2) return 'avoid';
      if (rank >= total - 5) return 'tough';
      return '';
    }

    function loadMH() {
      var body = el.querySelector('#mh-body');
      body.innerHTML = '<div class="lp-loading">' + razzleLoading() + '</div>';
      el.querySelector('#mh-detail').classList.remove('visible');
      var season = el.querySelector('#mh-season').value || _latestSeason;
      var posParam = curPos === 'ALL' ? '' : curPos;
      var url = '/api/matchup-heatmap?season=' + season;
      if (posParam) url += '&position=' + posParam;

      fetch(url, { signal: _panelSignal() }).then(function(r) {
        if (!r.ok) throw new Error('API error');
        return r.json();
      }).then(function(data) {
        currentData = data;
        if (!seasonsPopulated && data.available_seasons) {
          var sel = el.querySelector('#mh-season');
          (data.available_seasons || []).forEach(function(s) {
            var o = document.createElement('option');
            o.value = s; o.textContent = s;
            if (s == data.season) o.selected = true;
            sel.appendChild(o);
          });
          seasonsPopulated = true;
        }
        renderMH(data);
      }).catch(function() {
        body.innerHTML = '<div class="panel-error">' + razzleError() + '<br><button onclick="location.reload()">retry</button></div>';
      });
    }

    function renderMH(data) {
      var body = el.querySelector('#mh-body');
      if (!data.teams || !data.teams.length) {
        body.innerHTML = '<div class="panel-empty">' + razzleEmpty() + '<span class="hint">try a different position or season</span></div>';
        return;
      }

      var positions = curPos === 'ALL' ? ['QB', 'RB', 'WR', 'TE'] : [curPos];
      var teams = data.teams;

      var posValues = {};
      positions.forEach(function(pos) {
        posValues[pos] = [];
        teams.forEach(function(t) {
          var v = ((t.positions || {})[pos] || {}).avg_ppg || 0;
          if (v > 0) posValues[pos].push(v);
        });
      });

      if (sortCol) {
        teams = teams.slice().sort(function(a, b) {
          var va, vb;
          if (sortCol === 'team') { va = a.team; vb = b.team; return sortAsc ? va.localeCompare(vb) : vb.localeCompare(va); }
          else if (sortCol === 'total') { va = a.total_avg; vb = b.total_avg; }
          else { va = ((a.positions || {})[sortCol] || {}).avg_ppg || 0; vb = ((b.positions || {})[sortCol] || {}).avg_ppg || 0; }
          return sortAsc ? va - vb : vb - va;
        });
      }

      var totalTeams = teams.length;
      var html = '<div class="mh-table-wrap"><table class="mh-table"><thead><tr>';
      html += '<th class="mh-team-col' + (sortCol === 'team' ? ' sorted' : '') + '" data-sort="team">Team <span class="mh-sort-arrow">' + (sortCol === 'team' ? (sortAsc ? '\u25B2' : '\u25BC') : '\u25B2') + '</span></th>';

      positions.forEach(function(pos) {
        var cls = sortCol === pos ? ' sorted' : '';
        var ar = sortCol === pos ? (sortAsc ? '\u25B2' : '\u25BC') : '\u25BC';
        html += '<th class="' + cls + '" data-sort="' + pos + '" style="color:' + POS_COLORS[pos] + ';">' + pos + ' PPG <span class="mh-sort-arrow">' + ar + '</span></th>';
      });

      if (positions.length > 1) {
        var cls = sortCol === 'total' ? ' sorted' : '';
        var ar = sortCol === 'total' ? (sortAsc ? '\u25B2' : '\u25BC') : '\u25BC';
        html += '<th class="' + cls + '" data-sort="total">Total <span class="mh-sort-arrow">' + ar + '</span></th>';
      }
      html += '</tr></thead><tbody>';

      teams.forEach(function(t) {
        html += '<tr>';
        html += '<td class="mh-team-cell">' + escapeHtml(t.team) + '<span style="font-family:var(--font-mono);font-size:11px;color:var(--ink-light);margin-left:6px;">' + t.games + 'G</span></td>';

        positions.forEach(function(pos) {
          var d = (t.positions || {})[pos] || {};
          var ppg = d.avg_ppg || 0;
          var rank = d.rank || 0;
          var bg = getHeatColor(ppg, posValues[pos]);
          var textColor = (bg === '#e63946' || bg === '#2ec4b6' || bg === '#8b1a1a' || bg === '#1a5a50') ? 'var(--text-on-accent)' : 'var(--ink)';
          var annotation = getAnnotation(rank, totalTeams);

          html += '<td style="background:' + bg + ';color:' + textColor + ';" data-team="' + escapeAttr(t.team) + '" data-pos="' + pos + '">';
          html += '<div class="mh-heat-cell"><span class="mh-heat-ppg">' + ppg.toFixed(1) + '</span><span class="mh-heat-rank">#' + rank + '</span></div>';
          if (annotation) html += '<span class="mh-annotation">' + annotation + '</span>';
          html += '</td>';
        });

        if (positions.length > 1) html += '<td style="font-weight:700;">' + fmt(t.total_avg) + '</td>';
        html += '</tr>';
      });

      html += '</tbody></table></div>';
      body.innerHTML = html;

      body.querySelectorAll('.mh-table thead th[data-sort]').forEach(function(th) {
        th.addEventListener('click', function() {
          var col = this.getAttribute('data-sort');
          if (sortCol === col) sortAsc = !sortAsc;
          else { sortCol = col; sortAsc = col === 'team'; }
          renderMH(currentData);
        });
      });

      body.querySelectorAll('.mh-table tbody td[data-team]').forEach(function(td) {
        td.addEventListener('click', function() {
          var team = this.getAttribute('data-team');
          var pos = this.getAttribute('data-pos');
          showMHDetail(team, pos);
        });
      });
    }

    function showMHDetail(team, pos) {
      var panel = el.querySelector('#mh-detail');
      if (currentData.detail && currentData.detail[team]) {
        var players = currentData.detail[team];
        var html = '<h3>Top scorers vs ' + escapeHtml(team) + ' (' + pos + ')</h3>';
        html += '<div class="mh-detail-players">';
        players.forEach(function(p) {
          var posColor = POS_CSS[p.position] || 'var(--ink-light)';
          var img = p.headshot_url ? '<img src="' + escapeAttr(p.headshot_url) + '" alt="Player headshot" onerror="this.onerror=null;this.src=\'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 40 40%22><circle cx=%2220%22 cy=%2220%22 r=%2220%22 fill=%22%23d97757%22/><text x=%2220%22 y=%2225%22 text-anchor=%22middle%22 fill=%22white%22 font-size=%2216%22>?</text></svg>\'">' : '';
          html += '<div class="mh-detail-player" data-pid="' + escapeAttr(p.player_id) + '">';
          html += img;
          html += '<div><div class="mh-detail-name">' + escapeHtml(p.name) + '</div>';
          html += '<div class="mh-detail-stats">' + p.games_vs + 'G vs ' + escapeHtml(team) + ' — ' + p.total_ppr + ' pts (' + p.ppg_vs + ' PPG)</div></div>';
          html += '<span class="mh-detail-pos" style="background:' + posColor + ';">' + escapeHtml(p.position) + '</span>';
          html += '</div>';
        });
        html += '</div>';
        panel.innerHTML = html;
        panel.classList.add('visible');
        panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

        panel.querySelectorAll('.mh-detail-player[data-pid]').forEach(function(dp) {
          dp.addEventListener('click', function() {
            var _pid = dp.getAttribute('data-pid'); if (typeof openPlayerPopup === 'function') openPlayerPopup(_pid); else window.location.href = '/player/' + encodeURIComponent(_pid);
          });
        });
      } else {
        el.querySelectorAll('#mh-pos-tabs .lp-pos-tab').forEach(function(t) { t.classList.remove('active'); });
        var target = el.querySelector('#mh-pos-tabs .lp-pos-tab[data-pos="' + pos + '"]');
        if (target) target.classList.add('active');
        curPos = pos;
        sortCol = null;
        loadMH();
      }
    }

    el.querySelector('#mh-pos-tabs').addEventListener('click', function(e) {
      var tab = e.target.closest('.lp-pos-tab');
      if (!tab) return;
      el.querySelectorAll('#mh-pos-tabs .lp-pos-tab').forEach(function(t) { t.classList.remove('active'); });
      tab.classList.add('active');
      curPos = tab.getAttribute('data-pos') || 'ALL';
      sortCol = null; sortAsc = true;
      loadMH();
    });
    el.querySelector('#mh-season').addEventListener('change', function() { sortCol = null; loadMH(); });
    loadMH();
  }});

  // ===== STACK CORRELATION FINDER =====
  defs.push({ name: 'stacks', render: function(el) {
    if (showNflOnlyMsg(el, 'stacks', 'QB-WR Stacks', 'correlation-based stack targets')) return;
    var seasonsPopulated = false;

    el.innerHTML =
      '<div class="lp-page">' +
        '<div class="lp-header"><h2>Stack Correlation Finder</h2>' +
        '<div class="lp-subtitle">QB + pass catcher combos that boom together</div></div>' +
        '<div class="lp-controls">' +
          '<select class="lp-select" id="sk-season" aria-label="Season"></select>' +
        '</div>' +
        '<div id="sk-body" style="overflow-x:auto;-webkit-overflow-scrolling:touch"><div class="lp-loading">' + razzleLoading() + '</div></div>' +
      '</div>';

    function corrClass(c) {
      if (c >= 0.6) return 'sk-corr-high';
      if (c >= 0.3) return 'sk-corr-mid';
      if (c >= 0) return 'sk-corr-low';
      return 'sk-corr-neg';
    }

    function loadSK() {
      var body = el.querySelector('#sk-body');
      body.innerHTML = '<div class="lp-loading">' + razzleLoading() + '</div>';
      var season = el.querySelector('#sk-season').value || '';
      var url = '/api/stacks';
      if (season) url += '?season=' + encodeURIComponent(season);

      fetch(url, { signal: _panelSignal() }).then(function(r) {
        if (!r.ok) throw new Error('API error');
        return r.json();
      }).then(function(data) {
        if (!seasonsPopulated && data.available_seasons) {
          var sel = el.querySelector('#sk-season');
          (data.available_seasons || []).forEach(function(s) {
            var o = document.createElement('option');
            o.value = s; o.textContent = s;
            if (s === data.season) o.selected = true;
            sel.appendChild(o);
          });
          seasonsPopulated = true;
        }
        renderSK(data);
      }).catch(function() {
        body.innerHTML = '<div class="panel-error">' + razzleError() + '<br><button onclick="location.reload()">retry</button></div>';
      });
    }

    function renderSK(data) {
      var body = el.querySelector('#sk-body');
      var stacks = data.stacks || [];
      if (!stacks.length) { body.innerHTML = '<div class="sk-card"><div class="sk-card-header">Stack Finder</div><div class="sk-empty">' + razzleEmpty() + '</div></div>'; return; }

      var html = '<div class="sk-card">';
      html += '<div class="sk-card-header">Best QB + WR/TE Stacks (' + escapeHtml(String(data.count)) + ' pairs)</div>';
      html += '<table class="sk-table"><thead><tr>';
      html += '<th scope="col">#</th><th>Team</th><th>QB</th><th>Receiver</th><th>Pos</th><th>Corr</th><th></th><th>QB PPG</th><th>Rec PPG</th><th>Combo</th><th class="hide-mobile">GP</th>';
      html += '</tr></thead><tbody>';

      for (var i = 0; i < stacks.length; i++) {
        var s = stacks[i];
        var posColor = POS_CSS[s.receiver_pos] || 'var(--ink-light)';
        var barWidth = Math.max(0, Math.min(100, Math.round((s.correlation || 0) * 100)));

        html += '<tr>';
        html += '<td class="sk-rank">' + (i + 1) + '</td>';
        html += '<td><span class="sk-team-badge">' + escapeHtml(s.team) + '</span></td>';
        html += '<td style="font-weight:700">' + escapeHtml(s.qb_name) + '</td>';
        html += '<td style="font-weight:700">' + escapeHtml(s.receiver_name) + '</td>';
        html += '<td><span class="sk-pos-badge" style="background:' + posColor + '">' + escapeHtml(s.receiver_pos) + '</span></td>';
        html += '<td><span class="sk-corr-badge ' + corrClass(s.correlation) + '">' + fmt(s.correlation, 3) + '</span></td>';
        html += '<td><div class="sk-corr-bar" style="width:' + barWidth + 'px"></div></td>';
        html += '<td>' + fmt(s.qb_ppg) + '</td>';
        html += '<td>' + fmt(s.receiver_ppg) + '</td>';
        html += '<td style="font-weight:700">' + fmt(s.combined_ppg) + '</td>';
        html += '<td class="hide-mobile">' + escapeHtml(String(s.common_games)) + '</td>';
        html += '</tr>';
      }
      html += '</tbody></table></div>';
      body.innerHTML = html;
    }

    el.querySelector('#sk-season').addEventListener('change', loadSK);
    loadSK();
  }});

  // ===== RED ZONE & GOAL-LINE =====
  defs.push({ name: 'redzone', render: function(el) {
    if (showNflOnlyMsg(el, 'redzone', 'Red Zone & Goal-Line', 'TD vultures and goal-line dominators')) return;
    var curPos = '';
    var seasonsPopulated = false;
    var currentData = null;
    var sortState = {
      dominators: { col: 'gl_opportunities', dir: -1 },
      td_dependent: { col: 'td_pct_of_fantasy', dir: -1 }
    };

    var DOM_COLUMNS = [
      { key: 'name', label: 'Player' },
      { key: 'gl_opportunities', label: 'GL Opp', tip: 'Goal-line opportunities' },
      { key: 'gl_carries', label: 'GL Car', tip: 'Goal-line carries' },
      { key: 'gl_targets', label: 'GL Tgt', tip: 'Goal-line targets', hide: true },
      { key: 'gl_tds', label: 'GL TD', tip: 'Goal-line touchdowns' },
      { key: 'gl_td_rate', label: 'GL TD%', tip: 'GL TD conversion rate' },
      { key: 'total_tds', label: 'TDs', hide: true },
      { key: 'ppg', label: 'PPG' },
      { key: 'games', label: 'GP', hide: true }
    ];

    var TDD_COLUMNS = [
      { key: 'name', label: 'Player' },
      { key: 'td_pct_of_fantasy', label: 'TD%', tip: 'Pct of fantasy pts from TDs' },
      { key: 'total_tds', label: 'TDs' },
      { key: 'rush_tds', label: 'RuTD', hide: true },
      { key: 'rec_tds', label: 'ReTD', hide: true },
      { key: 'ppg', label: 'PPG' },
      { key: 'gl_tds', label: 'GL TD' },
      { key: 'gl_opportunities', label: 'GL Opp', hide: true },
      { key: 'games', label: 'GP', hide: true }
    ];

    el.innerHTML =
      '<div class="lp-page">' +
        '<div class="lp-header"><h2>Red Zone &amp; Goal-Line</h2>' +
        '<div class="lp-subtitle">who owns the goal line, and who needs TDs to eat</div></div>' +
        '<div class="lp-controls">' +
          '<div class="lp-pos-tabs" id="rz-pos-tabs">' +
            '<button class="lp-pos-tab active" data-pos="">All</button>' +
            '<button class="lp-pos-tab" data-pos="QB">QB</button>' +
            '<button class="lp-pos-tab" data-pos="RB">RB</button>' +
            '<button class="lp-pos-tab" data-pos="WR">WR</button>' +
            '<button class="lp-pos-tab" data-pos="TE">TE</button>' +
          '</div>' +
          '<select class="lp-select" id="rz-season" aria-label="Season"></select>' +
          weekSelectHTML('rz-week') +
        '</div>' +
        '<div id="rz-body" style="overflow-x:auto;-webkit-overflow-scrolling:touch"><div class="lp-loading">scouting the goal line...</div></div>' +
      '</div>';

    function getCols(section) { return section === 'dominators' ? DOM_COLUMNS : TDD_COLUMNS; }

    function buildRow(p, section) {
      var pos = (p.position || 'RB').toLowerCase();
      var cols = getCols(section);
      var html = '<tr data-pid="' + escapeAttr(p.player_id) + '">';

      cols.forEach(function(col) {
        var classes = [];
        if (col.key !== 'name') classes.push('center');
        if (col.hide) classes.push('hide-mobile');

        if (col.key === 'name') {
          html += '<td><div class="rz-player-cell">';
          if (p.headshot_url) html += '<img class="rz-headshot" src="' + escapeAttr(p.headshot_url) + '" alt="Player headshot" loading="lazy" onerror="this.onerror=null;this.src=\'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 40 40%22><circle cx=%2220%22 cy=%2220%22 r=%2220%22 fill=%22%23d97757%22/><text x=%2220%22 y=%2225%22 text-anchor=%22middle%22 fill=%22white%22 font-size=%2216%22>?</text></svg>\'">';
          html += '<div class="rz-player-info"><div class="rz-player-name">' + pLink(p.name, p.player_id) + '</div>';
          html += '<div class="rz-player-meta"><span class="rz-pos-badge ' + pos + '">' + escapeHtml(p.position) + '</span>';
          html += '<span class="rz-team-label">' + escapeHtml(p.team) + '</span></div></div></div></td>';
        } else if (col.key === 'gl_td_rate') {
          var rate = p.gl_td_rate || 0;
          var rc = rate >= 50 ? 'high' : rate >= 25 ? 'mid' : 'low';
          html += '<td class="' + classes.join(' ') + '"><span class="rz-rate-badge ' + rc + '">' + fmt(rate, 1) + '%</span></td>';
        } else if (col.key === 'td_pct_of_fantasy') {
          var pct = p.td_pct_of_fantasy || 0;
          var pc = pct >= 50 ? 'heavy' : pct >= 35 ? 'moderate' : 'light';
          html += '<td class="' + classes.join(' ') + '"><span class="rz-tdpct-badge ' + pc + '">' + fmt(pct, 1) + '%</span></td>';
        } else if (col.key === 'ppg') {
          html += '<td class="' + classes.join(' ') + '" style="font-weight:700;">' + fmt(p[col.key]) + '</td>';
        } else {
          var val = p[col.key];
          html += '<td class="' + classes.join(' ') + '">' + (val != null ? escapeHtml(String(val)) : '-') + '</td>';
        }
      });
      html += '</tr>';
      return html;
    }

    function buildHeader(section) {
      var st = sortState[section];
      var cols = getCols(section);
      var html = '<thead><tr>';
      cols.forEach(function(col) {
        var classes = [];
        if (col.key !== 'name') classes.push('center');
        if (col.hide) classes.push('hide-mobile');
        var sorted = st.col === col.key;
        if (sorted) classes.push('sorted');
        var arrow = sorted ? (st.dir === 1 ? ' &#9650;' : ' &#9660;') : '';
        var tipAttr = col.tip ? ' title="' + escapeAttr(col.tip) + '"' : '';
        html += '<th class="' + classes.join(' ') + '" data-sort="' + col.key + '" data-section="' + section + '"' + tipAttr + '>' + col.label + '<span class="sort-arrow">' + arrow + '</span></th>';
      });
      html += '</tr></thead>';
      return html;
    }

    function sortPlayers(players, col, dir) {
      return players.slice().sort(function(a, b) {
        var va = a[col], vb = b[col];
        if (va == null && vb == null) return 0;
        if (va == null) return 1;
        if (vb == null) return -1;
        if (typeof va === 'string') return dir * va.localeCompare(String(vb));
        return dir * ((Number(va) || 0) - (Number(vb) || 0));
      });
    }

    function buildSection(players, section) {
      if (!players || !players.length) {
        var label = section === 'dominators' ? 'goal-line dominators' : 'TD-dependent players';
        return '<div class="rz-empty">' + razzleEmpty() + '</div>';
      }
      var isDom = section === 'dominators';
      var icon = isDom ? '&#x1F3C8;' : '&#x1F4A5;';
      var title = isDom ? 'Goal-Line Dominators' : 'TD Dependent';
      var subtitle = isDom ? 'most goal-line opportunities' : 'highest % of fantasy from TDs';
      var headerClass = isDom ? 'dominators' : 'td-dependent';

      var st = sortState[section];
      var sorted = sortPlayers(players, st.col, st.dir);

      var html = '<div class="rz-section">';
      html += '<div class="rz-section-header ' + headerClass + '"><span class="section-icon">' + icon + '</span> ' + title + ' <span style="font-family:var(--font-hand);font-size:14px;color:var(--ink-light);font-weight:400">(' + players.length + ') — ' + subtitle + '</span></div>';
      html += '<table class="rz-table" data-section="' + section + '">';
      html += buildHeader(section);
      html += '<tbody>';
      sorted.forEach(function(p) { html += buildRow(p, section); });
      html += '</tbody></table></div>';
      return html;
    }

    function renderRZ(data) {
      currentData = data;
      var body = el.querySelector('#rz-body');
      if (!data || (!(data.dominators && data.dominators.length) && !(data.td_dependent && data.td_dependent.length))) {
        body.innerHTML = '<div class="rz-empty">' + razzleEmpty() + '</div>';
        return;
      }
      var html = buildSection(data.dominators, 'dominators');
      html += buildSection(data.td_dependent, 'td_dependent');
      body.innerHTML = html;

      body.querySelectorAll('th[data-sort]').forEach(function(th) {
        th.addEventListener('click', function() {
          var col = th.getAttribute('data-sort');
          var sec = th.getAttribute('data-section');
          if (sortState[sec].col === col) sortState[sec].dir *= -1;
          else { sortState[sec].col = col; sortState[sec].dir = -1; }
          renderRZ(currentData);
        });
      });

      body.querySelectorAll('tr[data-pid]').forEach(function(tr) {
        tr.addEventListener('click', function() {
          var _pid = tr.getAttribute('data-pid'); if (typeof openPlayerPopup === 'function') openPlayerPopup(_pid); else window.location.href = '/player/' + encodeURIComponent(_pid);
        });
      });
    }

    function loadRZ() {
      var body = el.querySelector('#rz-body');
      body.innerHTML = '<div class="lp-loading">scouting the goal line...</div>';
      var season = el.querySelector('#rz-season').value || '';
      var url = '/api/redzone-usage?limit=30';
      if (season) url += '&season=' + season;
      if (curPos) url += '&position=' + curPos;
      var rzWeekVal = parseInt((el.querySelector('#rz-week') || {}).value) || 0;
      if (rzWeekVal > 0) url += '&week=' + rzWeekVal;

      fetch(url, { signal: _panelSignal() }).then(function(r) {
        if (!r.ok) throw new Error('API error');
        return r.json();
      }).then(function(data) {
        if (!seasonsPopulated && data.available_seasons) {
          var sel = el.querySelector('#rz-season');
          (data.available_seasons || []).forEach(function(s) {
            var o = document.createElement('option');
            o.value = s; o.textContent = s;
            sel.appendChild(o);
          });
          sel.value = data.season;
          seasonsPopulated = true;
          populateWeekSelect(el, 'rz-week', sel.value, loadRZ);
        }
        renderRZ(data);
      }).catch(function() {
        body.innerHTML = '<div class="panel-error">' + razzleError() + '<br><button onclick="location.reload()">retry</button></div>';
      });
    }

    el.querySelector('#rz-pos-tabs').addEventListener('click', function(e) {
      var tab = e.target.closest('.lp-pos-tab');
      if (!tab) return;
      el.querySelectorAll('#rz-pos-tabs .lp-pos-tab').forEach(function(t) { t.classList.remove('active'); });
      tab.classList.add('active');
      curPos = tab.getAttribute('data-pos') || '';
      loadRZ();
    });
    el.querySelector('#rz-season').addEventListener('change', function() {
      populateWeekSelect(el, 'rz-week', this.value, loadRZ);
      loadRZ();
    });
    loadRZ();
  }});

  // ===== HOT & COLD STREAKS =====
  defs.push({ name: 'streaks', render: function(el) {
    if (showNflOnlyMsg(el, 'streaks', 'Hot / Cold Streaks', 'weekly performance momentum')) return;
    var curPos = '';
    var seasonsPopulated = false;
    var currentData = null;

    el.innerHTML =
      '<div class="lp-page">' +
        '<div class="lp-header"><h2>Hot &amp; Cold Streaks</h2>' +
        '<div class="lp-subtitle">who\'s heating up and who\'s ice cold</div></div>' +
        '<div class="lp-controls">' +
          '<div class="lp-pos-tabs" id="str-pos-tabs">' +
            '<button class="lp-pos-tab active" data-pos="">All</button>' +
            '<button class="lp-pos-tab" data-pos="QB">QB</button>' +
            '<button class="lp-pos-tab" data-pos="RB">RB</button>' +
            '<button class="lp-pos-tab" data-pos="WR">WR</button>' +
            '<button class="lp-pos-tab" data-pos="TE">TE</button>' +
          '</div>' +
          '<select class="lp-select" id="str-season" aria-label="Season"></select>' +
          weekSelectHTML('str-week') +
          '<select class="lp-select" id="str-window" aria-label="Window">' +
            '<option value="3">3 weeks</option>' +
            '<option value="4" selected>4 weeks</option>' +
            '<option value="5">5 weeks</option>' +
          '</select>' +
        '</div>' +
        '<div id="str-body" style="overflow-x:auto;-webkit-overflow-scrolling:touch"><div class="lp-loading">' + razzleLoading() + '</div></div>' +
      '</div>';

    function loadSTR() {
      var body = el.querySelector('#str-body');
      body.innerHTML = '<div class="lp-loading">' + razzleLoading() + '</div>';
      var season = el.querySelector('#str-season').value || '';
      var win = el.querySelector('#str-window').value || '4';
      var url = '/api/streaks?window=' + encodeURIComponent(win);
      if (season) url += '&season=' + encodeURIComponent(season);
      if (curPos) url += '&position=' + encodeURIComponent(curPos);
      var strWeekVal = parseInt((el.querySelector('#str-week') || {}).value) || 0;
      if (strWeekVal > 0) url += '&week=' + strWeekVal;

      fetch(url, { signal: _panelSignal() }).then(function(r) {
        if (!r.ok) throw new Error('API error');
        return r.json();
      }).then(function(data) {
        currentData = data;
        if (!seasonsPopulated && data.available_seasons) {
          var sel = el.querySelector('#str-season');
          (data.available_seasons || []).forEach(function(s) {
            var o = document.createElement('option');
            o.value = s; o.textContent = s;
            if (s === data.season) o.selected = true;
            sel.appendChild(o);
          });
          seasonsPopulated = true;
          populateWeekSelect(el, 'str-week', sel.value, loadSTR);
        }
        renderSTR(data);
      }).catch(function() {
        body.innerHTML = '<div class="panel-error">' + razzleError() + '<br><button onclick="location.reload()">retry</button></div>';
      });
    }

    function renderTable(players, type) {
      var winLabel = currentData ? currentData.window : 4;
      var html = '<table class="str-table"><thead><tr>';
      html += '<th scope="col">Player</th><th>Pos</th><th>Szn Avg</th><th>Recent</th><th>Delta</th><th>Last ' + escapeHtml(String(winLabel)) + '</th>';
      html += '</tr></thead><tbody>';

      for (var i = 0; i < players.length; i++) {
        var p = players[i];
        var posColor = POS_CSS[p.position] || 'var(--ink-light)';
        var badgeClass = type === 'hot' ? 'hot' : 'cold';
        var sign = p.delta > 0 ? '+' : '';

        html += '<tr>';
        html += '<td>' + pLink(p.name, p.player_id) + ' <span style="font-size:11px;color:var(--ink-light)">' + escapeHtml(p.team) + '</span></td>';
        html += '<td><span class="str-pos-badge" style="background:' + posColor + '">' + escapeHtml(p.position) + '</span></td>';
        html += '<td>' + fmt(p.season_avg) + '</td>';
        html += '<td>' + fmt(p.recent_avg) + '</td>';
        html += '<td><span class="str-delta-badge ' + badgeClass + '">' + sign + fmt(p.delta) + ' (' + sign + fmt(p.delta_pct, 0) + '%)</span></td>';

        var scores = p.recent_scores || [];
        var maxScore = Math.max.apply(null, scores.concat([1]));
        html += '<td><div class="str-recent">';
        for (var j = 0; j < scores.length; j++) {
          var h = Math.max(2, Math.round((scores[j] / maxScore) * 20));
          var barColor = scores[j] >= p.season_avg ? 'var(--green)' : 'var(--orange)';
          html += '<div class="str-recent-bar" style="height:' + h + 'px;background:' + barColor + '"></div>';
        }
        html += '</div></td></tr>';
      }
      html += '</tbody></table>';
      return html;
    }

    function renderSTR(data) {
      var body = el.querySelector('#str-body');
      var hot = data.hot || [];
      var cold = data.cold || [];

      var html = '<div class="str-columns">';
      html += '<div class="str-section"><div class="str-section-header hot">On Fire</div>';
      html += hot.length ? renderTable(hot, 'hot') : '<div class="str-empty">' + razzleEmpty() + '</div>';
      html += '</div>';
      html += '<div class="str-section"><div class="str-section-header cold">Ice Cold</div>';
      html += cold.length ? renderTable(cold, 'cold') : '<div class="str-empty">' + razzleEmpty() + '</div>';
      html += '</div></div>';
      body.innerHTML = html;
    }

    el.querySelector('#str-pos-tabs').addEventListener('click', function(e) {
      var tab = e.target.closest('.lp-pos-tab');
      if (!tab) return;
      el.querySelectorAll('#str-pos-tabs .lp-pos-tab').forEach(function(t) { t.classList.remove('active'); });
      tab.classList.add('active');
      curPos = tab.getAttribute('data-pos') || '';
      loadSTR();
    });
    el.querySelector('#str-season').addEventListener('change', function() {
      populateWeekSelect(el, 'str-week', this.value, loadSTR);
      loadSTR();
    });
    el.querySelector('#str-window').addEventListener('change', loadSTR);
    loadSTR();
  }});

  // ===== WEEKLY LEADERS =====
  defs.push({ name: 'weeklyleaders', render: function(el) {
    var wklCollege = typeof state !== 'undefined' && state.universe === 'college';
    if (wklCollege) {
      el.innerHTML =
        '<div class="lp-page">' +
          '<div class="lp-header"><h2>Weekly Leaders</h2>' +
          '<div class="lp-subtitle">who went off this week</div></div>' +
          '<div style="text-align:center;padding:60px 20px;">' +
            '<div style="font-family:var(--font-hand);font-size:20px;color:var(--ink-light);transform:rotate(-1deg);max-width:400px;margin:0 auto;">' +
              'college stats are season-level only — weekly game data isn\'t available for college players. check <b>Stat Leaders</b> for season totals.' +
            '</div>' +
          '</div>' +
        '</div>';
      return;
    }

    var curPos = '';
    var currentWeek = 0;
    var availableWeeks = [];
    var currentData = null;
    var seasonsPopulated = false;
    var sortState = { col: 'fantasy_points', dir: -1 };

    el.innerHTML =
      '<div class="lp-page">' +
        '<div class="lp-header"><h2>Weekly Leaders</h2>' +
        '<div class="lp-subtitle">who went off this week</div></div>' +
        '<div class="lp-controls">' +
          '<select class="lp-select" id="wkl-season" aria-label="Season"></select>' +
          '<div class="wkl-week-nav">' +
            '<button class="wkl-week-btn" id="wkl-prev" aria-label="Previous week">&larr;</button>' +
            '<div class="wkl-week-label" id="wkl-week-label">Week 1</div>' +
            '<button class="wkl-week-btn" id="wkl-next" aria-label="Next week">&rarr;</button>' +
          '</div>' +
          '<div class="lp-pos-tabs" id="wkl-pos-tabs">' +
            '<button class="lp-pos-tab active" data-pos="">All</button>' +
            '<button class="lp-pos-tab" data-pos="QB">QB</button>' +
            '<button class="lp-pos-tab" data-pos="RB">RB</button>' +
            '<button class="lp-pos-tab" data-pos="WR">WR</button>' +
            '<button class="lp-pos-tab" data-pos="TE">TE</button>' +
          '</div>' +
        '</div>' +
        '<div id="wkl-body" style="overflow-x:auto;-webkit-overflow-scrolling:touch"><div class="lp-loading">' + razzleLoading() + '</div></div>' +
      '</div>';

    function updateWeekUI() {
      el.querySelector('#wkl-week-label').textContent = 'Week ' + currentWeek;
      var idx = availableWeeks.indexOf(currentWeek);
      el.querySelector('#wkl-prev').disabled = idx <= 0;
      el.querySelector('#wkl-next').disabled = idx >= availableWeeks.length - 1;
    }

    function loadWKL() {
      var body = el.querySelector('#wkl-body');
      body.innerHTML = '<div class="lp-loading">' + razzleLoading() + '</div>';
      var season = el.querySelector('#wkl-season').value || '';
      var url = '/api/weekly-leaders?';
      if (season) url += 'season=' + encodeURIComponent(season) + '&';
      if (currentWeek) url += 'week=' + encodeURIComponent(currentWeek) + '&';
      if (curPos) url += 'position=' + encodeURIComponent(curPos);

      fetch(url, { signal: _panelSignal() }).then(function(r) {
        if (!r.ok) throw new Error('API error');
        return r.json();
      }).then(function(data) {
        currentData = data;
        currentWeek = data.week;
        availableWeeks = data.available_weeks || [];
        if (!seasonsPopulated && data.available_seasons) {
          var sel = el.querySelector('#wkl-season');
          (data.available_seasons || []).forEach(function(s) {
            var o = document.createElement('option');
            o.value = s; o.textContent = s;
            if (String(s) === String(data.season)) o.selected = true;
            sel.appendChild(o);
          });
          seasonsPopulated = true;
        }
        updateWeekUI();
        renderWKL(data);
      }).catch(function() {
        body.innerHTML = '<div class="panel-error">' + razzleError() + '<br><button onclick="location.reload()">retry</button></div>';
      });
    }

    function renderWKL(data) {
      var body = el.querySelector('#wkl-body');
      var leaders = data.leaders || [];
      if (!leaders.length) { body.innerHTML = '<div class="panel-empty">' + razzleEmpty() + '<span class="hint">try a different position or season</span></div>'; return; }

      var sorted = leaders.slice().sort(function(a, b) {
        var va = a[sortState.col], vb = b[sortState.col];
        if (va == null && vb == null) return 0;
        if (va == null) return 1;
        if (vb == null) return -1;
        if (typeof va === 'string') return sortState.dir * va.localeCompare(String(vb));
        return sortState.dir * ((Number(va) || 0) - (Number(vb) || 0));
      });
      sorted.forEach(function(p, i) { p._rank = i + 1; });

      var cols = [
        { key: '_rank', label: '#', cls: 'center' },
        { key: 'name', label: 'Player', cls: '' },
        { key: 'fantasy_points', label: 'PPR', cls: 'center' },
        { key: 'pass_yd', label: 'Pass Yd', cls: 'center hide-mobile' },
        { key: 'pass_td', label: 'Pass TD', cls: 'center hide-mobile' },
        { key: 'rush_yd', label: 'Rush Yd', cls: 'center' },
        { key: 'rush_td', label: 'Rush TD', cls: 'center hide-mobile' },
        { key: 'rec', label: 'Rec', cls: 'center' },
        { key: 'rec_yd', label: 'Rec Yd', cls: 'center' },
        { key: 'rec_td', label: 'Rec TD', cls: 'center hide-mobile' },
        { key: 'tgt', label: 'Tgt', cls: 'center hide-mobile' }
      ];

      var html = '<table class="wkl-table"><thead><tr>';
      cols.forEach(function(col) {
        var arrow = '';
        var scls = '';
        if (sortState.col === col.key) {
          arrow = '<span class="sort-arrow">' + (sortState.dir > 0 ? '&#9650;' : '&#9660;') + '</span>';
          scls = ' sorted';
        }
        html += '<th data-col="' + escapeAttr(col.key) + '" class="' + col.cls + scls + '">' + col.label + arrow + '</th>';
      });
      html += '</tr></thead><tbody>';

      sorted.forEach(function(p) {
        html += '<tr data-pid="' + escapeAttr(p.player_id) + '">';
        var rankCls = p._rank === 1 ? 'top1' : p._rank === 2 ? 'top2' : p._rank === 3 ? 'top3' : '';
        html += '<td class="center"><span class="wkl-rank ' + rankCls + '">' + p._rank + '</span></td>';

        html += '<td><div class="wkl-player-cell"><div class="wkl-player-info">';
        html += '<div class="wkl-player-name">' + pLink(p.name, p.player_id) + '</div>';
        html += '<div class="wkl-player-meta"><span class="wkl-pos-badge ' + (p.position || '').toLowerCase() + '">' + escapeHtml(p.position) + '</span>';
        html += '<span class="wkl-team-label">' + escapeHtml(p.team) + '</span></div></div></div></td>';

        var pts = p.fantasy_points || 0;
        var ptsCls = pts >= 30 ? 'elite' : pts >= 20 ? 'great' : 'good';
        html += '<td class="center"><span class="wkl-pts ' + ptsCls + '">' + fmt(pts, 1) + '</span></td>';

        html += '<td class="center hide-mobile">' + (p.pass_yd != null ? p.pass_yd : '-') + '</td>';
        html += '<td class="center hide-mobile">' + (p.pass_td != null ? p.pass_td : '-') + '</td>';
        html += '<td class="center">' + (p.rush_yd != null ? p.rush_yd : '-') + '</td>';
        html += '<td class="center hide-mobile">' + (p.rush_td != null ? p.rush_td : '-') + '</td>';
        html += '<td class="center">' + (p.rec != null ? p.rec : '-') + '</td>';
        html += '<td class="center">' + (p.rec_yd != null ? p.rec_yd : '-') + '</td>';
        html += '<td class="center hide-mobile">' + (p.rec_td != null ? p.rec_td : '-') + '</td>';
        html += '<td class="center hide-mobile">' + (p.tgt != null ? p.tgt : '-') + '</td>';
        html += '</tr>';
      });

      html += '</tbody></table>';
      body.innerHTML = html;

      body.querySelectorAll('th[data-col]').forEach(function(th) {
        th.addEventListener('click', function() {
          var col = th.getAttribute('data-col');
          if (sortState.col === col) sortState.dir *= -1;
          else { sortState.col = col; sortState.dir = col === 'name' ? 1 : -1; }
          renderWKL(currentData);
        });
      });

      body.querySelectorAll('tr[data-pid]').forEach(function(tr) {
        tr.addEventListener('click', function() {
          var _pid = tr.getAttribute('data-pid'); if (typeof openPlayerPopup === 'function') openPlayerPopup(_pid); else window.location.href = '/player/' + encodeURIComponent(_pid);
        });
      });
    }

    el.querySelector('#wkl-pos-tabs').addEventListener('click', function(e) {
      var tab = e.target.closest('.lp-pos-tab');
      if (!tab) return;
      el.querySelectorAll('#wkl-pos-tabs .lp-pos-tab').forEach(function(t) { t.classList.remove('active'); });
      tab.classList.add('active');
      curPos = tab.getAttribute('data-pos') || '';
      loadWKL();
    });
    el.querySelector('#wkl-season').addEventListener('change', function() { currentWeek = 0; loadWKL(); });
    el.querySelector('#wkl-prev').addEventListener('click', function() {
      var idx = availableWeeks.indexOf(currentWeek);
      if (idx > 0) { currentWeek = availableWeeks[idx - 1]; loadWKL(); }
    });
    el.querySelector('#wkl-next').addEventListener('click', function() {
      var idx = availableWeeks.indexOf(currentWeek);
      if (idx < availableWeeks.length - 1) { currentWeek = availableWeeks[idx + 1]; loadWKL(); }
    });
    loadWKL();
  }});

  // ===== WEEKLY MVP GRID =====
  defs.push({ name: 'weeklymvp', render: function(el) {
    if (showNflOnlyMsg(el, 'weeklymvp', 'Weekly MVP Grid', 'position MVPs by week')) return;
    var seasonsPopulated = false;
    var POSITIONS = ['QB', 'RB', 'WR', 'TE'];

    el.innerHTML =
      '<div class="lp-page">' +
        '<div class="lp-header"><h2>Weekly MVP Grid</h2>' +
        '<div class="lp-subtitle">who was the #1 scorer each week by position</div></div>' +
        '<div class="lp-controls">' +
          '<select class="lp-select" id="mv-season" aria-label="Season"></select>' +
        '</div>' +
        '<div id="mv-body" style="overflow-x:auto;-webkit-overflow-scrolling:touch"><div class="lp-loading">' + razzleLoading() + '</div></div>' +
      '</div>';

    function loadMV() {
      var body = el.querySelector('#mv-body');
      body.innerHTML = '<div class="lp-loading">' + razzleLoading() + '</div>';
      var season = el.querySelector('#mv-season').value || '';
      var url = '/api/weekly-mvp';
      if (season) url += '?season=' + encodeURIComponent(season);

      fetch(url, { signal: _panelSignal() }).then(function(r) {
        if (!r.ok) throw new Error('API error');
        return r.json();
      }).then(function(data) {
        if (!seasonsPopulated && data.available_seasons) {
          var sel = el.querySelector('#mv-season');
          (data.available_seasons || []).forEach(function(s) {
            var o = document.createElement('option');
            o.value = s; o.textContent = s;
            if (s === data.season) o.selected = true;
            sel.appendChild(o);
          });
          seasonsPopulated = true;
        }
        renderMV(data);
      }).catch(function() {
        body.innerHTML = '<div class="panel-error">' + razzleError() + '<br><button onclick="location.reload()">retry</button></div>';
      });
    }

    function renderMV(data) {
      var body = el.querySelector('#mv-body');
      var weeks = data.weeks || [];
      if (!weeks.length) { body.innerHTML = '<div class="mv-empty">' + razzleEmpty() + '</div>'; return; }

      var html = '<div class="mv-card">';
      html += '<div class="mv-card-header">Weekly MVP Grid — ' + escapeHtml(String(data.season)) + ' (' + escapeHtml(String(data.total_weeks)) + ' weeks)</div>';
      html += '<table class="mv-grid"><thead><tr><th>Week</th>';
      POSITIONS.forEach(function(pos) { html += '<th scope="col">' + pos + '</th>'; });
      html += '</tr></thead><tbody>';

      weeks.forEach(function(wk) {
        html += '<tr><td>Wk ' + escapeHtml(String(wk.week)) + '</td>';
        POSITIONS.forEach(function(pos) {
          var mvp = wk[pos];
          var color = POS_CSS[pos] || 'var(--ink-light)';
          if (mvp && mvp.name !== '-') {
            html += '<td><div class="mv-cell">';
            html += '<div class="mv-cell-name">' + escapeHtml(mvp.name) + '</div>';
            html += '<div class="mv-cell-team">' + escapeHtml(mvp.team) + '</div>';
            html += '<div class="mv-cell-pts" style="background:' + color + '">' + fmt(mvp.fpts) + '</div>';
            html += '</div></td>';
          } else {
            html += '<td style="color:var(--ink-light)">--</td>';
          }
        });
        html += '</tr>';
      });

      html += '</tbody></table></div>';
      body.innerHTML = html;
    }

    el.querySelector('#mv-season').addEventListener('change', loadMV);
    loadMV();
  }});

  // ===== PLAYOFF SCHEDULE PLANNER =====
  defs.push({ name: 'playoffs', render: function(el) {
    if (showNflOnlyMsg(el, 'playoffs', 'Playoff Schedule Planner', 'weeks 14-17 matchup edges')) return;
    var curPos = '';
    var seasonsPopulated = false;

    var GRADE_COLORS = {
      'A+': 'Aplus', 'A': 'A', 'B+': 'Bplus', 'B': 'B', 'C': 'C', 'D': 'D', 'F': 'F'
    };

    el.innerHTML =
      '<div class="lp-page">' +
        '<div class="lp-header"><h2>Playoff Schedule Planner</h2>' +
        '<div class="lp-subtitle">who has the easiest path to a championship</div></div>' +
        '<div class="lp-controls">' +
          '<div class="lp-pos-tabs" id="po-pos-tabs">' +
            '<button class="lp-pos-tab active" data-pos="">All</button>' +
            '<button class="lp-pos-tab" data-pos="QB">QB</button>' +
            '<button class="lp-pos-tab" data-pos="RB">RB</button>' +
            '<button class="lp-pos-tab" data-pos="WR">WR</button>' +
            '<button class="lp-pos-tab" data-pos="TE">TE</button>' +
          '</div>' +
          '<select class="lp-select" id="po-season" aria-label="Season"></select>' +
        '</div>' +
        '<div id="po-body" style="overflow-x:auto;-webkit-overflow-scrolling:touch"><div class="lp-loading">' + razzleLoading() + '</div></div>' +
      '</div>';

    function gradeClass(grade) {
      return 'po-grade-' + (GRADE_COLORS[grade] || grade);
    }

    function loadPO() {
      var body = el.querySelector('#po-body');
      body.innerHTML = '<div class="lp-loading">' + razzleLoading() + '</div>';
      var season = el.querySelector('#po-season').value || '';
      var url = '/api/playoff-schedule?';
      if (season) url += 'season=' + encodeURIComponent(season) + '&';
      if (curPos) url += 'position=' + encodeURIComponent(curPos) + '&';

      fetch(url, { signal: _panelSignal() }).then(function(r) {
        if (!r.ok) throw new Error('API error');
        return r.json();
      }).then(function(data) {
        if (!seasonsPopulated && data.available_seasons) {
          var sel = el.querySelector('#po-season');
          (data.available_seasons || []).forEach(function(s) {
            var o = document.createElement('option');
            o.value = s; o.textContent = s;
            if (s === data.season) o.selected = true;
            sel.appendChild(o);
          });
          seasonsPopulated = true;
        }
        renderPO(data);
      }).catch(function() {
        body.innerHTML = '<div class="panel-error">' + razzleError() + '<br><button onclick="location.reload()">retry</button></div>';
      });
    }

    function renderPO(data) {
      var body = el.querySelector('#po-body');
      var players = data.players || [];
      if (!players.length) { body.innerHTML = '<div class="po-empty">' + razzleEmpty() + '</div>'; return; }

      var html = '<div class="po-card">';
      html += '<div class="po-card-header">Playoff Matchup Rankings — Wk 14-17 (' + escapeHtml(String(data.count || 0)) + ' players)</div>';
      html += '<table class="po-table"><thead><tr>';
      html += '<th scope="col">#</th><th>Player</th><th>Pos</th><th>PO PPG</th><th>SOS</th>';
      var weekNums = [14, 15, 16, 17];
      weekNums.forEach(function(w) { html += '<th scope="col">Wk ' + w + '</th>'; });
      html += '</tr></thead><tbody>';

      players.forEach(function(p, i) {
        var posColor = POS_COLORS[p.position] || '#8a7565';
        html += '<tr>';
        html += '<td class="po-rank">' + (i + 1) + '</td>';
        html += '<td>' + pLink(p.name, p.player_id) + ' <span style="font-size:11px;color:var(--ink-light)">' + escapeHtml(p.team) + '</span></td>';
        html += '<td><span class="po-pos-badge" style="background:' + posColor + '">' + escapeHtml(p.position) + '</span></td>';
        html += '<td style="font-weight:700">' + fmt(p.playoff_ppg) + '</td>';
        html += '<td><span class="po-grade ' + gradeClass(p.sos_grade) + '">' + escapeHtml(p.sos_grade) + '</span></td>';

        var weekMap = {};
        (p.weeks || []).forEach(function(w) { weekMap[w.week] = w; });

        weekNums.forEach(function(wn) {
          var wk = weekMap[wn];
          if (wk) {
            html += '<td><div class="po-matchup">';
            html += '<span class="po-grade ' + gradeClass(wk.grade) + '">' + escapeHtml(wk.grade) + '</span>';
            html += ' <span class="po-opp">vs ' + escapeHtml(wk.opponent) + '</span>';
            html += ' <span style="font-size:11px;font-weight:700">' + fmt(wk.fpts) + '</span>';
            html += '</div></td>';
          } else {
            html += '<td style="color:var(--ink-light)">--</td>';
          }
        });
        html += '</tr>';
      });

      html += '</tbody></table></div>';
      body.innerHTML = html;
    }

    el.querySelector('#po-pos-tabs').addEventListener('click', function(e) {
      var tab = e.target.closest('.lp-pos-tab');
      if (!tab) return;
      el.querySelectorAll('#po-pos-tabs .lp-pos-tab').forEach(function(t) { t.classList.remove('active'); });
      tab.classList.add('active');
      curPos = tab.getAttribute('data-pos') || '';
      loadPO();
    });
    el.querySelector('#po-season').addEventListener('change', loadPO);
    loadPO();
  }});

  // ─── 30. USAGE TRENDS ──────────────────────────────────────
  defs.push({ name: 'usage', render: function(el) {
    var utCollege = typeof state !== 'undefined' && state.universe === 'college';
    var curPos = '';
    var curWeeks = '5';

    el.innerHTML =
      '<div class="lp-page">' +
        '<div class="lp-header"><h2>' + (utCollege ? 'College Production Trends' : 'Usage Trends') + '</h2>' +
        '<div class="lp-subtitle">' + (utCollege ? 'season-over-season production risers and fallers' : 'who\'s trending up and who\'s fading') + '</div></div>' +
        '<div class="lp-controls">' +
          '<div class="lp-pos-tabs" id="ut-pos-tabs">' +
            '<button class="lp-pos-tab active" data-pos="">ALL</button>' +
            '<button class="lp-pos-tab" data-pos="QB">QB</button>' +
            '<button class="lp-pos-tab" data-pos="RB">RB</button>' +
            '<button class="lp-pos-tab" data-pos="WR">WR</button>' +
            '<button class="lp-pos-tab" data-pos="TE">TE</button>' +
          '</div>' +
          (utCollege ? '' :
          '<select class="lp-select" id="ut-weeks">' +
            '<option value="3">3 weeks</option>' +
            '<option value="5" selected>5 weeks</option>' +
            '<option value="8">8 weeks</option>' +
          '</select>' +
          weekSelectHTML('ut-week')) +
        '</div>' +
        '<div id="ut-body" style="overflow-x:auto;-webkit-overflow-scrolling:touch"><div class="lp-loading">' + razzleLoading() + '</div></div>' +
      '</div>';

    function loadUT() {
      var body = el.querySelector('#ut-body');
      var isCollege = typeof state !== 'undefined' && state.universe === 'college';
      body.innerHTML = '<div class="lp-loading">' + razzleLoading() + '</div>';
      var url;
      if (isCollege) {
        url = '/api/college/trends?limit=30';
        if (curPos) url += '&position=' + encodeURIComponent(curPos);
      } else {
        url = '/api/usage-trends?weeks=' + curWeeks;
        if (curPos) url += '&position=' + encodeURIComponent(curPos);
        var utWeekVal = parseInt((el.querySelector('#ut-week') || {}).value) || 0;
        if (utWeekVal > 0) url += '&week=' + utWeekVal;
      }

      fetch(url, { signal: _panelSignal() }).then(function(r) {
        if (!r.ok) throw new Error('API error');
        return r.json();
      }).then(function(data) {
        renderUT(data, body);
      }).catch(function() {
        body.innerHTML = '<div class="panel-error">' + razzleError() + '<br><button onclick="location.reload()">retry</button></div>';
      });
    }

    function drawSparkline(canvas, scores, isRiser) {
      if (!scores || scores.length < 2) return;
      var ctx = canvas.getContext('2d');
      var w = canvas.width;
      var h = canvas.height;
      ctx.clearRect(0, 0, w, h);
      if (!scores || scores.length < 2) return;
      var min = Math.min.apply(null, scores.concat([0]));
      var max = Math.max.apply(null, scores.concat([1]));
      var range = max - min || 1;
      var color = isRiser ? '#2ec4b6' : '#e63946';
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (var i = 0; i < scores.length; i++) {
        var x = (i / (scores.length - 1)) * (w - 4) + 2;
        var y = h - 2 - ((scores[i] - min) / range) * (h - 4);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      // dot on last point
      var lastX = w - 2;
      var lastY = h - 2 - ((scores[scores.length - 1] - min) / range) * (h - 4);
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(lastX, lastY, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    function renderUT(data, body) {
      var risers = data.risers || [];
      var fallers = data.fallers || [];
      if (!risers.length && !fallers.length) {
        body.innerHTML = '<div class="panel-empty">' + razzleEmpty() + '<span class="hint">try a different position or season</span></div>';
        return;
      }
      var html = '';
      if (risers.length) {
        html += '<div class="ut-section"><h3 class="ut-section-title ut-risers-title">Risers</h3>';
        html += buildUTTable(risers, true);
        html += '</div>';
      }
      if (fallers.length) {
        html += '<div class="ut-section"><h3 class="ut-section-title ut-fallers-title">Fallers</h3>';
        html += buildUTTable(fallers, false);
        html += '</div>';
      }
      body.innerHTML = html;
      // draw sparklines
      var canvases = body.querySelectorAll('canvas[data-ut-spark]');
      canvases.forEach(function(c) {
        var scores; try { scores = JSON.parse(c.getAttribute('data-ut-scores') || '[]'); } catch(e) { scores = []; }
        var riser = c.getAttribute('data-ut-riser') === '1';
        drawSparkline(c, scores, riser);
      });
    }

    function buildUTTable(players, isRiser) {
      var isCollege = typeof state !== 'undefined' && state.universe === 'college';
      var html = '<div class="ut-table-wrap"><table class="ut-table"><thead><tr>';
      if (isCollege) {
        html += '<th scope="col">#</th><th>Player</th><th>YPG</th><th>Delta</th><th>%</th>';
      } else {
        html += '<th scope="col">#</th><th>Player</th><th>PPG</th><th>Delta</th><th>Trend</th>';
      }
      html += '</tr></thead><tbody>';
      players.forEach(function(p, i) {
        var posColor = POS_COLORS[p.position] || '#8a7565';
        var delta = isCollege ? (p.delta_ypg || 0) : (p.delta || 0);
        var arrow = delta >= 0 ? '&#9650;' : '&#9660;';
        var deltaClass = delta >= 0 ? 'ut-delta-up' : 'ut-delta-down';
        html += '<tr>';
        html += '<td class="ut-rank">' + (i + 1) + '</td>';
        html += '<td class="ut-player-cell">';
        if (!isCollege && p.headshot_url) html += '<img class="ut-headshot" src="' + escapeAttr(p.headshot_url) + '" alt="Player headshot" loading="lazy">';
        html += '<span class="ut-name">' + pLink(p.name, p.player_id) + '</span>';
        html += '<span class="ut-pos-badge" style="background:' + posColor + '">' + escapeHtml(p.position) + '</span>';
        html += '<span class="ut-team">' + escapeHtml(p.team || '') + '</span>';
        if (isCollege && p.conference) html += '<span class="ut-team" style="font-size:11px;color:var(--ink-light)">' + escapeHtml(p.conference) + '</span>';
        html += '</td>';
        if (isCollege) {
          html += '<td class="ut-num">' + fmt(p.curr_ypg) + '</td>';
          html += '<td class="ut-num"><span class="' + deltaClass + '">' + arrow + ' ' + fmt(Math.abs(delta)) + '</span></td>';
          html += '<td class="ut-num"><span class="' + deltaClass + '">' + (p.delta_pct >= 0 ? '+' : '') + fmt(p.delta_pct) + '%</span></td>';
        } else {
          var scoresJson = escapeHtml(JSON.stringify(p.weekly_scores || []));
          html += '<td class="ut-num">' + fmt(p.ppg) + '</td>';
          html += '<td class="ut-num"><span class="' + deltaClass + '">' + arrow + ' ' + fmt(Math.abs(delta)) + '</span></td>';
          html += '<td><canvas data-ut-spark data-ut-scores="' + scoresJson + '" data-ut-riser="' + (isRiser ? '1' : '0') + '" width="80" height="24" role="img" aria-label="Usage trend sparkline"></canvas></td>';
        }
        html += '</tr>';
      });
      html += '</tbody></table></div>';
      return html;
    }

    el.querySelector('#ut-pos-tabs').addEventListener('click', function(e) {
      var tab = e.target.closest('.lp-pos-tab');
      if (!tab) return;
      el.querySelectorAll('#ut-pos-tabs .lp-pos-tab').forEach(function(t) { t.classList.remove('active'); });
      tab.classList.add('active');
      curPos = tab.getAttribute('data-pos') || '';
      loadUT();
    });
    var utWeeksSel = el.querySelector('#ut-weeks');
    if (utWeeksSel) {
      utWeeksSel.addEventListener('change', function(e) {
        curWeeks = e.target.value;
        loadUT();
      });
    }
    if (!utCollege) populateWeekSelect(el, 'ut-week', String(_latestSeason), loadUT);
    loadUT();
  }});

  // ─── 31. YEAR-OVER-YEAR ──────────────────────────────────────
  defs.push({ name: 'yoy', render: function(el) {
    if (showNflOnlyMsg(el, 'yoy', 'Year-over-Year', 'cross-season stat deltas')) return;
    var yyCollege = typeof state !== 'undefined' && state.universe === 'college';
    var curPos = '';
    var curS1 = String(_latestSeason - 1);
    var curS2 = String(_latestSeason);
    var curMetric = 'ppg';

    var metricLabels = {
      ppg: 'PPG', targets_g: 'Tgt/G', rec_yd_g: 'Rec Yd/G',
      rush_yd_g: 'Rush Yd/G', total_tds: 'TDs', snap_pct: 'Snap%'
    };

    el.innerHTML =
      '<div class="lp-page">' +
        '<div class="lp-header"><h2>' + (yyCollege ? 'College Year-over-Year' : 'Year-over-Year') + '</h2>' +
        '<div class="lp-subtitle">' + (yyCollege ? 'season-over-season production changes' : 'who improved and who regressed') + '</div></div>' +
        '<div class="lp-controls">' +
          '<div class="lp-pos-tabs" id="yy-pos-tabs">' +
            '<button class="lp-pos-tab active" data-pos="">ALL</button>' +
            '<button class="lp-pos-tab" data-pos="QB">QB</button>' +
            '<button class="lp-pos-tab" data-pos="RB">RB</button>' +
            '<button class="lp-pos-tab" data-pos="WR">WR</button>' +
            '<button class="lp-pos-tab" data-pos="TE">TE</button>' +
          '</div>' +
          (yyCollege ? '' :
          '<select class="lp-select" id="yy-s1">' + seasonOptions(_latestSeason - 1) + '</select>' +
          '<span style="font-family:var(--font-mono);font-size:13px;color:var(--ink-light)">→</span>' +
          '<select class="lp-select" id="yy-s2">' + seasonOptions() + '</select>' +
          '<select class="lp-select" id="yy-metric">' +
            '<option value="ppg">PPG</option>' +
            '<option value="targets_g">Tgt/G</option>' +
            '<option value="rec_yd_g">Rec Yd/G</option>' +
            '<option value="rush_yd_g">Rush Yd/G</option>' +
            '<option value="total_tds">TDs</option>' +
            '<option value="snap_pct">Snap%</option>' +
          '</select>') +
        '</div>' +
        '<div id="yy-body" style="overflow-x:auto;-webkit-overflow-scrolling:touch"><div class="lp-loading">' + razzleLoading() + '</div></div>' +
      '</div>';

    function loadYY() {
      var body = el.querySelector('#yy-body');
      var isCollege = typeof state !== 'undefined' && state.universe === 'college';
      body.innerHTML = '<div class="lp-loading">' + razzleLoading() + '</div>';
      var url;
      if (isCollege) {
        url = '/api/college/trends?limit=30';
        if (curPos) url += '&position=' + encodeURIComponent(curPos);
      } else {
        url = '/api/year-over-year?season1=' + curS1 + '&season2=' + curS2 + '&metric=' + curMetric;
        if (curPos) url += '&position=' + encodeURIComponent(curPos);
      }

      fetch(url, { signal: _panelSignal() }).then(function(r) {
        if (!r.ok) throw new Error('API error');
        return r.json();
      }).then(function(data) {
        renderYY(data, body, isCollege);
      }).catch(function() {
        body.innerHTML = '<div class="panel-error">' + razzleError() + '<br><button onclick="location.reload()">retry</button></div>';
      });
    }

    function renderYY(data, body, isCollege) {
      var risers = data.risers || [];
      var fallers = data.fallers || [];
      if (!risers.length && !fallers.length) {
        body.innerHTML = '<div class="panel-empty">' + razzleEmpty() + '<span class="hint">try a different position or season</span></div>';
        return;
      }
      var label = isCollege ? 'YPG' : (metricLabels[curMetric] || curMetric);
      var html = '';
      if (risers.length) {
        html += '<div class="yy-section"><h3 class="yy-section-title yy-risers-title">Risers (' + escapeHtml(label) + ')</h3>';
        html += buildYYTable(risers, true, label, isCollege);
        html += '</div>';
      }
      if (fallers.length) {
        html += '<div class="yy-section"><h3 class="yy-section-title yy-fallers-title">Fallers (' + escapeHtml(label) + ')</h3>';
        html += buildYYTable(fallers, false, label, isCollege);
        html += '</div>';
      }
      body.innerHTML = html;
    }

    function buildYYTable(players, isRiser, label, isCollege) {
      var html = '<div class="yy-table-wrap"><table class="yy-table"><thead><tr>';
      if (isCollege) {
        html += '<th scope="col">#</th><th>Player</th><th>Prev YPG</th><th>Curr YPG</th><th>Delta</th><th class="hide-mobile">TD/G</th>';
      } else {
        html += '<th scope="col">#</th><th>Player</th><th>' + escapeHtml(curS1) + '</th><th>' + escapeHtml(curS2) + '</th><th>Delta</th><th class="hide-mobile">Other Metrics</th>';
      }
      html += '</tr></thead><tbody>';
      players.forEach(function(p, i) {
        var posColor = POS_COLORS[p.position] || '#8a7565';
        var delta = isCollege ? (p.delta_ypg || 0) : (p.delta || 0);
        var deltaClass = delta >= 0 ? 'yy-delta-pos' : 'yy-delta-neg';
        var sign = delta >= 0 ? '+' : '';
        html += '<tr>';
        html += '<td class="yy-rank">' + (i + 1) + '</td>';
        html += '<td class="yy-player-cell">';
        if (!isCollege && p.headshot_url) html += '<img class="yy-headshot" src="' + escapeAttr(p.headshot_url) + '" alt="Player headshot" loading="lazy">';
        html += '<span class="yy-name">' + pLink(p.name, p.player_id) + '</span>';
        html += '<span class="yy-pos-badge" style="background:' + posColor + '">' + escapeHtml(p.position) + '</span>';
        html += '<span class="yy-team">' + escapeHtml(p.team || '') + '</span>';
        if (isCollege && p.conference) html += '<span class="yy-team" style="font-size:11px;color:var(--ink-light)">' + escapeHtml(p.conference) + '</span>';
        html += '</td>';
        if (isCollege) {
          html += '<td class="yy-num">' + fmt(p.prev_ypg) + '</td>';
          html += '<td class="yy-num">' + fmt(p.curr_ypg) + '</td>';
          html += '<td class="yy-num"><span class="yy-delta-badge ' + deltaClass + '">' + sign + fmt(delta) + '</span></td>';
          html += '<td class="yy-chips hide-mobile">';
          html += '<span class="yy-mini-chip">' + fmt(p.curr_tds_pg) + ' TD/G</span>';
          html += '</td>';
        } else {
          html += '<td class="yy-num">' + fmt(p.season1_value) + '</td>';
          html += '<td class="yy-num">' + fmt(p.season2_value) + '</td>';
          html += '<td class="yy-num"><span class="yy-delta-badge ' + deltaClass + '">' + sign + fmt(delta) + '</span></td>';
          html += '<td class="yy-chips hide-mobile">';
          var otherMetrics = p.other_deltas || {};
          var keys = Object.keys(otherMetrics);
          keys.forEach(function(k) {
            if (k === curMetric) return;
            var val = otherMetrics[k];
            var chipClass = val >= 0 ? 'yy-chip-pos' : 'yy-chip-neg';
            var chipSign = val >= 0 ? '+' : '';
            var chipLabel = metricLabels[k] || k;
            html += '<span class="yy-mini-chip ' + chipClass + '">' + escapeHtml(chipLabel) + ' ' + chipSign + fmt(val) + '</span>';
          });
          html += '</td>';
        }
        html += '</tr>';
      });
      html += '</tbody></table></div>';
      return html;
    }

    el.querySelector('#yy-pos-tabs').addEventListener('click', function(e) {
      var tab = e.target.closest('.lp-pos-tab');
      if (!tab) return;
      el.querySelectorAll('#yy-pos-tabs .lp-pos-tab').forEach(function(t) { t.classList.remove('active'); });
      tab.classList.add('active');
      curPos = tab.getAttribute('data-pos') || '';
      loadYY();
    });
    var yyS1 = el.querySelector('#yy-s1');
    var yyS2 = el.querySelector('#yy-s2');
    var yyMetric = el.querySelector('#yy-metric');
    if (yyS1) yyS1.addEventListener('change', function(e) { curS1 = e.target.value; loadYY(); });
    if (yyS2) yyS2.addEventListener('change', function(e) { curS2 = e.target.value; loadYY(); });
    if (yyMetric) yyMetric.addEventListener('change', function(e) { curMetric = e.target.value; loadYY(); });
    loadYY();
  }});

  // ─── 32. AGING CURVES ──────────────────────────────────────
  defs.push({ name: 'aging', render: function(el) {
    var agCollege = typeof state !== 'undefined' && state.universe === 'college';
    var curPos = 'QB';

    el.innerHTML =
      '<div class="lp-page">' +
        '<div class="lp-header"><h2>' + (agCollege ? 'College Experience Curves' : 'Aging Curves') + '</h2>' +
        '<div class="lp-subtitle">' + (agCollege ? 'how production changes by college experience year' : 'when players peak and decline by position') + '</div></div>' +
        '<div class="lp-controls">' +
          '<div class="lp-pos-tabs" id="ag-pos-tabs">' +
            '<button class="lp-pos-tab active" data-pos="QB">QB</button>' +
            '<button class="lp-pos-tab" data-pos="RB">RB</button>' +
            '<button class="lp-pos-tab" data-pos="WR">WR</button>' +
            '<button class="lp-pos-tab" data-pos="TE">TE</button>' +
          '</div>' +
        '</div>' +
        '<div id="ag-body" style="overflow-x:auto;-webkit-overflow-scrolling:touch"><div class="lp-loading">' + razzleLoading() + '</div></div>' +
      '</div>';

    function loadAG() {
      var body = el.querySelector('#ag-body');
      var isCollege = typeof state !== 'undefined' && state.universe === 'college';
      body.innerHTML = '<div class="lp-loading">' + razzleLoading() + '</div>';
      var url = isCollege
        ? '/api/college/aging-curves?position=' + encodeURIComponent(curPos)
        : '/api/aging-curves?position=' + encodeURIComponent(curPos);

      fetch(url, { signal: _panelSignal() }).then(function(r) {
        if (!r.ok) throw new Error('API error');
        return r.json();
      }).then(function(data) {
        renderAG(data, body);
      }).catch(function() {
        body.innerHTML = '<div class="panel-error">' + razzleError() + '<br><button onclick="location.reload()">retry</button></div>';
      });
    }

    function renderAG(data, body) {
      var curve = data.curve || [];
      var peak = data.peak || {};
      if (!curve.length) {
        body.innerHTML = '<div class="panel-empty">' + razzleEmpty() + '<span class="hint">try a different position or season</span></div>';
        return;
      }
      var html = '<div class="ag-chart-wrap"><canvas id="ag-canvas" width="600" height="350" role="img" aria-label="Aging curve trend line chart"></canvas></div>';
      html += '<div class="ag-summary">';
      var agIsCollege = typeof state !== 'undefined' && state.universe === 'college';
      var agPeakLabel = agIsCollege ? 'Peak Year' : 'Peak Age';
      var agPeakVal = agIsCollege ? ('Yr ' + (peak.age != null ? peak.age : '-')) : (peak.age != null ? peak.age : '-');
      var agStatLabel = agIsCollege ? 'Peak YPG' : 'Peak PPG';
      html += '<div class="ag-card"><div class="ag-card-label">' + agPeakLabel + '</div><div class="ag-card-value">' + agPeakVal + '</div></div>';
      html += '<div class="ag-card"><div class="ag-card-label">' + agStatLabel + '</div><div class="ag-card-value">' + fmt(peak.ppg) + '</div></div>';
      html += '<div class="ag-card"><div class="ag-card-label">Decline Start</div><div class="ag-card-value">' + (data.decline_start ? (agIsCollege ? 'Yr ' + data.decline_start : data.decline_start) : '-') + '</div></div>';
      html += '<div class="ag-card"><div class="ag-card-label">Sample Size</div><div class="ag-card-value">' + (data.sample_size != null ? data.sample_size : '-') + '</div></div>';
      html += '</div>';
      body.innerHTML = html;

      var canvas = el.querySelector('#ag-canvas');
      drawAgingChart(canvas, curve, peak, data);
    }

    function drawAgingChart(canvas, curve, peak, data) {
      var ctx = canvas.getContext('2d');
      var t = getCanvasTheme();
      var W = canvas.width;
      var H = canvas.height;
      var pad = { top: 20, right: 20, bottom: 40, left: 50 };
      var cw = W - pad.left - pad.right;
      var ch = H - pad.top - pad.bottom;
      var posColor = POS_COLORS[curPos] || '#8a7565';

      ctx.clearRect(0, 0, W, H);

      // find ranges
      var ages = curve.map(function(c) { return c.age; });
      var ppgs = curve.map(function(c) { return c.ppg; });
      var minAge = Math.min.apply(null, ages.concat([20]));
      var maxAge = Math.max.apply(null, ages.concat([35]));
      var maxPPG = Math.max.apply(null, ppgs.concat([1])) * 1.1;

      function xPos(age) { return pad.left + ((age - minAge) / (Math.max(maxAge - minAge, 1))) * cw; }
      function yPos(ppg) { return pad.top + ch - (ppg / maxPPG) * ch; }

      // grid lines
      ctx.strokeStyle = t.inkFaint;
      ctx.lineWidth = 0.5;
      for (var g = 0; g <= 5; g++) {
        var gy = pad.top + (g / 5) * ch;
        ctx.beginPath(); ctx.moveTo(pad.left, gy); ctx.lineTo(W - pad.right, gy); ctx.stroke();
      }

      // area fill
      ctx.fillStyle = posColor;
      ctx.globalAlpha = 0.15;
      ctx.beginPath();
      ctx.moveTo(xPos(curve[0].age), yPos(0));
      curve.forEach(function(c) { ctx.lineTo(xPos(c.age), yPos(c.ppg)); });
      ctx.lineTo(xPos(curve[curve.length - 1].age), yPos(0));
      ctx.closePath();
      ctx.fill();
      ctx.globalAlpha = 1;

      // line
      ctx.strokeStyle = posColor;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      curve.forEach(function(c, idx) {
        var x = xPos(c.age); var y = yPos(c.ppg);
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();

      // dots
      ctx.fillStyle = posColor;
      curve.forEach(function(c) {
        ctx.beginPath();
        ctx.arc(xPos(c.age), yPos(c.ppg), 3, 0, Math.PI * 2);
        ctx.fill();
      });

      // peak marker
      if (peak.age) {
        var peakX = xPos(peak.age);
        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = '#d97757';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(peakX, pad.top);
        ctx.lineTo(peakX, pad.top + ch);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = '#d97757';
        ctx.font = '11px Space Mono, monospace';
        ctx.textAlign = 'center';
        ctx.fillText('Peak: ' + peak.age, peakX, pad.top - 4);
      }

      // X axis labels
      var agChartCollege = typeof state !== 'undefined' && state.universe === 'college';
      ctx.fillStyle = t.inkMedium;
      ctx.font = '11px Space Mono, monospace';
      ctx.textAlign = 'center';
      var ageStep = agChartCollege ? 1 : 2;
      for (var a = minAge; a <= maxAge; a += ageStep) {
        var axLabel = agChartCollege ? 'Yr ' + a : a.toString();
        ctx.fillText(axLabel, xPos(a), H - pad.bottom + 16);
      }
      ctx.textAlign = 'center';
      ctx.fillText(agChartCollege ? 'Experience Year' : 'Age', W / 2, H - 4);

      // Y axis labels
      ctx.textAlign = 'right';
      for (var yg = 0; yg <= 5; yg++) {
        var val = (maxPPG * (5 - yg) / 5);
        ctx.fillText(fmt(val, 0), pad.left - 6, pad.top + (yg / 5) * ch + 4);
      }
      ctx.save();
      ctx.translate(12, pad.top + ch / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.textAlign = 'center';
      ctx.fillText(agChartCollege ? 'Total YPG' : 'PPG', 0, 0);
      ctx.restore();
    }

    el.querySelector('#ag-pos-tabs').addEventListener('click', function(e) {
      var tab = e.target.closest('.lp-pos-tab');
      if (!tab) return;
      el.querySelectorAll('#ag-pos-tabs .lp-pos-tab').forEach(function(t) { t.classList.remove('active'); });
      tab.classList.add('active');
      curPos = tab.getAttribute('data-pos') || 'QB';
      loadAG();
    });
    loadAG();
  }});

  // ─── 33. PACE TRACKER ──────────────────────────────────────
  defs.push({ name: 'pace', render: function(el) {
    if (showNflOnlyMsg(el, 'pace', 'Season Pace Tracker', 'projected season totals from weekly game logs')) return;
    var curPos = '';
    var curSeason = String(_latestSeason);

    el.innerHTML =
      '<div class="lp-page">' +
        '<div class="lp-header"><h2>Pace Tracker</h2>' +
        '<div class="lp-subtitle">projected season totals based on current pace</div></div>' +
        '<div class="lp-controls">' +
          '<div class="lp-pos-tabs" id="pt-pos-tabs">' +
            '<button class="lp-pos-tab active" data-pos="">ALL</button>' +
            '<button class="lp-pos-tab" data-pos="QB">QB</button>' +
            '<button class="lp-pos-tab" data-pos="RB">RB</button>' +
            '<button class="lp-pos-tab" data-pos="WR">WR</button>' +
            '<button class="lp-pos-tab" data-pos="TE">TE</button>' +
          '</div>' +
          '<select class="lp-select" id="pt-season">' + seasonOptions() + '</select>' +
        '</div>' +
        '<div id="pt-body" style="overflow-x:auto;-webkit-overflow-scrolling:touch"><div class="lp-loading">' + razzleLoading() + '</div></div>' +
      '</div>';

    function loadPT() {
      var body = el.querySelector('#pt-body');
      body.innerHTML = '<div class="lp-loading">' + razzleLoading() + '</div>';
      var url = '/api/pace-tracker?season=' + curSeason;
      if (curPos) url += '&position=' + encodeURIComponent(curPos);

      fetch(url, { signal: _panelSignal() }).then(function(r) {
        if (!r.ok) throw new Error('API error');
        return r.json();
      }).then(function(data) {
        renderPT(data, body);
      }).catch(function() {
        body.innerHTML = '<div class="panel-error">' + razzleError() + '<br><button onclick="location.reload()">retry</button></div>';
      });
    }

    function renderPT(data, body) {
      var players = data.players || [];
      if (!players.length) {
        body.innerHTML = '<div class="panel-empty">' + razzleEmpty() + '<span class="hint">try a different position or season</span></div>';
        return;
      }
      var html = '<div class="pt-grid">';
      players.forEach(function(p) {
        var posColor = POS_COLORS[p.position] || '#8a7565';
        html += '<div class="pt-card">';
        html += '<div class="pt-card-header">';
        html += '<span class="pt-player-name">' + pLink(p.name, p.player_id) + '</span>';
        html += '<span class="pt-pos-badge" style="background:' + posColor + '">' + escapeHtml(p.position) + '</span>';
        html += '<span class="pt-team">' + escapeHtml(p.team || '') + '</span>';
        html += '</div>';
        html += '<div class="pt-stats">';
        var stats = p.milestones || [];
        stats.forEach(function(s) {
          var pct = s.target ? Math.min(100, ((s.projected || 0) / s.target) * 100) : 0;
          var onPace = pct >= 100;
          html += '<div class="pt-stat-row">';
          html += '<span class="pt-stat-label">' + escapeHtml(s.label || s.stat) + '</span>';
          html += '<span class="pt-stat-vals">' + fmt(s.current, 0) + ' → ' + fmt(s.projected, 0) + '</span>';
          if (s.target) {
            html += '<div class="pt-pace-bar-wrap">';
            html += '<div class="pt-pace-bar" style="width:' + Math.min(100, pct) + '%;background:' + posColor + '"></div>';
            html += '</div>';
            html += '<span class="pt-pace-badge ' + (onPace ? 'pt-on-pace' : 'pt-off-pace') + '">' + (onPace ? 'ON PACE' : 'OFF PACE') + '</span>';
          }
          html += '</div>';
        });
        html += '</div></div>';
      });
      html += '</div>';
      body.innerHTML = html;
    }

    el.querySelector('#pt-pos-tabs').addEventListener('click', function(e) {
      var tab = e.target.closest('.lp-pos-tab');
      if (!tab) return;
      el.querySelectorAll('#pt-pos-tabs .lp-pos-tab').forEach(function(t) { t.classList.remove('active'); });
      tab.classList.add('active');
      curPos = tab.getAttribute('data-pos') || '';
      loadPT();
    });
    el.querySelector('#pt-season').addEventListener('change', function(e) { curSeason = e.target.value; loadPT(); });
    loadPT();
  }});

  // ─── 34. SEASON PACE ──────────────────────────────────────
  defs.push({ name: 'seasonpace', render: function(el) {
    var curPos = '';
    var curSeason = String(_latestSeason);

    el.innerHTML =
      '<div class="lp-page">' +
        '<div class="lp-header"><h2>Season Pace</h2>' +
        '<div class="lp-subtitle">milestone watch — who\'s on track for big numbers</div></div>' +
        '<div class="lp-controls">' +
          '<div class="lp-pos-tabs" id="spc-pos-tabs">' +
            '<button class="lp-pos-tab active" data-pos="">ALL</button>' +
            '<button class="lp-pos-tab" data-pos="QB">QB</button>' +
            '<button class="lp-pos-tab" data-pos="RB">RB</button>' +
            '<button class="lp-pos-tab" data-pos="WR">WR</button>' +
            '<button class="lp-pos-tab" data-pos="TE">TE</button>' +
          '</div>' +
          '<select class="lp-select" id="spc-season">' + seasonOptions() + '</select>' +
        '</div>' +
        '<div id="spc-body" style="overflow-x:auto;-webkit-overflow-scrolling:touch"><div class="lp-loading">' + razzleLoading() + '</div></div>' +
      '</div>';

    function loadSPC() {
      var body = el.querySelector('#spc-body');
      body.innerHTML = '<div class="lp-loading">' + razzleLoading() + '</div>';
      var url = '/api/season-pace?season=' + curSeason;
      if (curPos) url += '&position=' + encodeURIComponent(curPos);

      fetch(url, { signal: _panelSignal() }).then(function(r) {
        if (!r.ok) throw new Error('API error');
        return r.json();
      }).then(function(data) {
        renderSPC(data, body);
      }).catch(function() {
        body.innerHTML = '<div class="panel-error">' + razzleError() + '<br><button onclick="location.reload()">retry</button></div>';
      });
    }

    function renderSPC(data, body) {
      var players = data.players || [];
      if (!players.length) {
        body.innerHTML = '<div class="panel-empty">' + razzleEmpty() + '<span class="hint">try a different position or season</span></div>';
        return;
      }
      var eliteMilestones = ['5000 pass yd', '40 pass TD', '1500 rush yd', '1500 rec yd',
        '5000 Pass Yd', '40 Pass TD', '1500 Rush Yd', '1500 Rec Yd'];
      var html = '<div class="spc-card"><h3 class="spc-title">Milestone Watch</h3>';
      html += '<div class="spc-table-wrap"><table class="spc-table"><thead><tr>';
      html += '<th scope="col">#</th><th>Player</th><th>Pos</th><th>GP</th><th>PPG</th><th>Milestones</th>';
      html += '</tr></thead><tbody>';
      players.forEach(function(p, i) {
        var posColor = POS_COLORS[p.position] || '#8a7565';
        html += '<tr>';
        html += '<td class="spc-rank">' + (i + 1) + '</td>';
        html += '<td class="spc-name">' + pLink(p.name, p.player_id) + ' <span class="spc-team">' + escapeHtml(p.team || '') + '</span></td>';
        html += '<td><span class="spc-pos-badge" style="background:' + posColor + '">' + escapeHtml(p.position) + '</span></td>';
        html += '<td class="spc-num">' + (p.games != null ? p.games : '-') + '</td>';
        html += '<td class="spc-num">' + fmt(p.ppg) + '</td>';
        html += '<td class="spc-milestones">';
        var milestones = p.milestones || [];
        milestones.forEach(function(m) {
          var label = m.label || m;
          var isElite = false;
          for (var e = 0; e < eliteMilestones.length; e++) {
            if (label.toLowerCase().indexOf(eliteMilestones[e].toLowerCase()) !== -1) { isElite = true; break; }
          }
          html += '<span class="spc-milestone ' + (isElite ? 'spc-gold' : 'spc-silver') + '">' + escapeHtml(label) + '</span>';
        });
        html += '</td>';
        html += '</tr>';
      });
      html += '</tbody></table></div></div>';
      body.innerHTML = html;
    }

    el.querySelector('#spc-pos-tabs').addEventListener('click', function(e) {
      var tab = e.target.closest('.lp-pos-tab');
      if (!tab) return;
      el.querySelectorAll('#spc-pos-tabs .lp-pos-tab').forEach(function(t) { t.classList.remove('active'); });
      tab.classList.add('active');
      curPos = tab.getAttribute('data-pos') || '';
      loadSPC();
    });
    el.querySelector('#spc-season').addEventListener('change', function(e) { curSeason = e.target.value; loadSPC(); });
    loadSPC();
  }});

  // ─── 35. TD REGRESSION ──────────────────────────────────────
  defs.push({ name: 'tdregression', render: function(el) {
    if (showNflOnlyMsg(el, 'tdregression', 'TD Regression', 'expected vs actual touchdowns')) return;
    var curPos = '';
    var curSeason = String(_latestSeason);

    el.innerHTML =
      '<div class="lp-page">' +
        '<div class="lp-header"><h2>TD Regression</h2>' +
        '<div class="lp-subtitle">expected vs actual touchdowns — who\'s due for a correction</div></div>' +
        '<div class="lp-controls">' +
          '<div class="lp-pos-tabs" id="tdr-pos-tabs">' +
            '<button class="lp-pos-tab active" data-pos="">ALL</button>' +
            '<button class="lp-pos-tab" data-pos="QB">QB</button>' +
            '<button class="lp-pos-tab" data-pos="RB">RB</button>' +
            '<button class="lp-pos-tab" data-pos="WR">WR</button>' +
            '<button class="lp-pos-tab" data-pos="TE">TE</button>' +
          '</div>' +
          '<select class="lp-select" id="tdr-season">' + seasonOptions() + '</select>' +
        '</div>' +
        '<div id="tdr-body" style="overflow-x:auto;-webkit-overflow-scrolling:touch"><div class="lp-loading">' + razzleLoading() + '</div></div>' +
      '</div>';

    function loadTDR() {
      var body = el.querySelector('#tdr-body');
      body.innerHTML = '<div class="lp-loading">' + razzleLoading() + '</div>';
      var url = '/api/td-regression?season=' + curSeason;
      if (curPos) url += '&position=' + encodeURIComponent(curPos);

      fetch(url, { signal: _panelSignal() }).then(function(r) {
        if (!r.ok) throw new Error('API error');
        return r.json();
      }).then(function(data) {
        renderTDR(data, body);
      }).catch(function() {
        body.innerHTML = '<div class="panel-error">' + razzleError() + '<br><button onclick="location.reload()">retry</button></div>';
      });
    }

    function renderTDR(data, body) {
      var buyLow = data.positive_regression || [];
      var sellHigh = data.negative_regression || [];
      var rates = data.pos_avg_td_rates || {};
      if (!buyLow.length && !sellHigh.length) {
        body.innerHTML = '<div class="panel-empty">' + razzleEmpty() + '<span class="hint">try a different position or season</span></div>';
        return;
      }

      // find max diff for bar scaling
      var allDiffs = buyLow.concat(sellHigh).map(function(p) { return Math.abs(p.td_diff || 0); });
      var maxDiff = Math.max.apply(null, allDiffs) || 1;

      var html = '';
      // rate chips
      var rateKeys = Object.keys(rates);
      if (rateKeys.length) {
        html += '<div class="tdr-rates">';
        rateKeys.forEach(function(k) {
          html += '<span class="tdr-rate-chip"><strong>' + escapeHtml(k) + '</strong> avg TD rate: ' + fmt(rates[k], 1) + '%</span>';
        });
        html += '</div>';
      }

      html += '<div class="tdr-columns">';
      // buy low
      if (buyLow.length) {
        html += '<div class="tdr-col"><div class="tdr-col-header tdr-buy-header">Buy Low (Positive Regression)</div>';
        html += buildTDRTable(buyLow, true, maxDiff);
        html += '</div>';
      }
      // sell high
      if (sellHigh.length) {
        html += '<div class="tdr-col"><div class="tdr-col-header tdr-sell-header">Sell High (Negative Regression)</div>';
        html += buildTDRTable(sellHigh, false, maxDiff);
        html += '</div>';
      }
      html += '</div>';
      body.innerHTML = html;
    }

    function buildTDRTable(players, isBuy, maxDiff) {
      var html = '<div class="tdr-table-wrap"><table class="tdr-table"><thead><tr>';
      html += '<th scope="col">#</th><th>Player</th><th>Pos</th><th>TD</th><th>xTD</th><th>Diff</th><th class="hide-mobile">TD%</th><th class="hide-mobile">Opp</th><th>Bar</th>';
      html += '</tr></thead><tbody>';
      players.forEach(function(p, i) {
        var posColor = POS_COLORS[p.position] || '#8a7565';
        var diff = p.td_diff || 0;
        var diffClass = diff >= 0 ? 'tdr-diff-pos' : 'tdr-diff-neg';
        var sign = diff >= 0 ? '+' : '';
        var barPct = Math.min(100, (Math.abs(diff) / maxDiff) * 100);
        var barColor = isBuy ? 'var(--green)' : 'var(--red)';
        html += '<tr>';
        html += '<td class="tdr-rank">' + (i + 1) + '</td>';
        html += '<td class="tdr-name">' + pLink(p.name, p.player_id) + ' <span class="tdr-team">' + escapeHtml(p.team || '') + '</span></td>';
        html += '<td><span class="tdr-pos-badge" style="background:' + posColor + '">' + escapeHtml(p.position) + '</span></td>';
        html += '<td class="tdr-num">' + fmt(p.actual_tds, 0) + '</td>';
        html += '<td class="tdr-num">' + fmt(p.expected_tds) + '</td>';
        html += '<td class="tdr-num"><span class="tdr-diff-badge ' + diffClass + '">' + sign + fmt(diff) + '</span></td>';
        html += '<td class="tdr-num hide-mobile">' + fmt(p.td_rate, 1) + '%</td>';
        html += '<td class="tdr-num hide-mobile">' + fmt(p.opportunities, 0) + '</td>';
        html += '<td><div class="tdr-bar-wrap"><div class="tdr-bar" style="width:' + barPct + '%;background:' + barColor + '"></div></div></td>';
        html += '</tr>';
      });
      html += '</tbody></table></div>';
      return html;
    }

    el.querySelector('#tdr-pos-tabs').addEventListener('click', function(e) {
      var tab = e.target.closest('.lp-pos-tab');
      if (!tab) return;
      el.querySelectorAll('#tdr-pos-tabs .lp-pos-tab').forEach(function(t) { t.classList.remove('active'); });
      tab.classList.add('active');
      curPos = tab.getAttribute('data-pos') || '';
      loadTDR();
    });
    el.querySelector('#tdr-season').addEventListener('change', function(e) { curSeason = e.target.value; loadTDR(); });
    loadTDR();
  }});

  // ─── 36. AIR YARDS ──────────────────────────────────────
  defs.push({ name: 'airyards', render: function(el) {
    if (showNflOnlyMsg(el, 'airyards', 'Air Yards', 'aDOT, WOPR, RACR — target efficiency')) return;
    var curPos = '';
    var curSeason = String(_latestSeason);
    var sortState = { buy_low: { col: 'regression_delta', asc: false }, sell_high: { col: 'regression_delta', asc: true } };

    var colDefs = [
      { key: 'name', label: 'Player', sortable: false, tip: '' },
      { key: 'targets_g', label: 'Tgt/G', sortable: true, tip: 'Targets per game' },
      { key: 'air_yards', label: 'AirYd', sortable: true, tip: 'Total air yards' },
      { key: 'air_yards_g', label: 'AY/G', sortable: true, tip: 'Air yards per game' },
      { key: 'adot', label: 'aDOT', sortable: true, tip: 'Average depth of target' },
      { key: 'air_yards_share', label: 'AY%', sortable: true, tip: 'Air yard share of team total' },
      { key: 'wopr', label: 'WOPR', sortable: true, tip: 'Weighted Opportunity Rating' },
      { key: 'racr', label: 'RACR', sortable: true, tip: 'Receiver Air Conversion Ratio' },
      { key: 'ppg', label: 'PPG', sortable: true, tip: 'Fantasy points per game' },
      { key: 'regression_delta', label: 'Regr', sortable: true, tip: 'Regression delta — positive = buy, negative = sell' },
      { key: 'games', label: 'GP', sortable: true, tip: 'Games played' },
      { key: 'annotation', label: 'Annotation', sortable: false, tip: 'Context note', mobile_hide: true }
    ];

    el.innerHTML =
      '<div class="lp-page">' +
        '<div class="lp-header"><h2>Air Yards</h2>' +
        '<div class="lp-subtitle">air yard efficiency and regression indicators</div></div>' +
        '<div class="lp-controls">' +
          '<div class="lp-pos-tabs" id="ay-pos-tabs">' +
            '<button class="lp-pos-tab active" data-pos="">All</button>' +
            '<button class="lp-pos-tab" data-pos="WR">WR</button>' +
            '<button class="lp-pos-tab" data-pos="RB">RB</button>' +
            '<button class="lp-pos-tab" data-pos="TE">TE</button>' +
          '</div>' +
          '<select class="lp-select" id="ay-season">' + seasonOptions() + '</select>' +
        '</div>' +
        '<div id="ay-body" style="overflow-x:auto;-webkit-overflow-scrolling:touch"><div class="lp-loading">' + razzleLoading() + '</div></div>' +
      '</div>';

    function loadAY() {
      var body = el.querySelector('#ay-body');
      body.innerHTML = '<div class="lp-loading">' + razzleLoading() + '</div>';
      var url = '/api/air-yards?limit=25&season=' + curSeason;
      if (curPos) url += '&position=' + encodeURIComponent(curPos);

      fetch(url, { signal: _panelSignal() }).then(function(r) {
        if (!r.ok) throw new Error('API error');
        return r.json();
      }).then(function(data) {
        renderAY(data, body);
      }).catch(function() {
        body.innerHTML = '<div class="panel-error">' + razzleError() + '<br><button onclick="location.reload()">retry</button></div>';
      });
    }

    function sortPlayers(players, col, asc) {
      return players.slice().sort(function(a, b) {
        var va = a[col], vb = b[col];
        if (typeof va === 'string' && typeof vb === 'string') return asc ? va.localeCompare(vb) : vb.localeCompare(va);
        if (va === null || va === undefined) va = -Infinity;
        if (vb === null || vb === undefined) vb = -Infinity;
        return asc ? va - vb : vb - va;
      });
    }

    function renderAY(data, body) {
      var buyLow = data.buy_low || [];
      var sellHigh = data.sell_high || [];
      if (!buyLow.length && !sellHigh.length) {
        body.innerHTML = '<div class="panel-empty">' + razzleEmpty() + '<span class="hint">try a different position or season</span></div>';
        return;
      }

      var html = '<div class="ay-legend">' +
        '<span class="ay-legend-item ay-legend-buy">Buy Low (underperforming air yards)</span>' +
        '<span class="ay-legend-item ay-legend-sell">Sell High (overperforming air yards)</span>' +
        '</div>';

      if (buyLow.length) {
        var sorted = sortPlayers(buyLow, sortState.buy_low.col, sortState.buy_low.asc);
        html += '<div class="ay-section"><h3 class="ay-section-title ay-buy-title">Buy Low</h3>';
        html += buildAYTable(sorted, 'buy_low');
        html += '</div>';
      }
      if (sellHigh.length) {
        var sorted2 = sortPlayers(sellHigh, sortState.sell_high.col, sortState.sell_high.asc);
        html += '<div class="ay-section"><h3 class="ay-section-title ay-sell-title">Sell High</h3>';
        html += buildAYTable(sorted2, 'sell_high');
        html += '</div>';
      }
      body.innerHTML = html;

      // attach sort handlers
      body.querySelectorAll('th[data-ay-sort]').forEach(function(th) {
        th.addEventListener('click', function() {
          var section = th.getAttribute('data-ay-section');
          var col = th.getAttribute('data-ay-sort');
          if (sortState[section].col === col) {
            sortState[section].asc = !sortState[section].asc;
          } else {
            sortState[section].col = col;
            sortState[section].asc = false;
          }
          renderAY(data, body);
        });
      });
    }

    function buildAYTable(players, section) {
      var ss = sortState[section];
      var html = '<div class="ay-table-wrap"><table class="ay-table"><thead><tr>';
      colDefs.forEach(function(c) {
        var mobileClass = c.mobile_hide ? ' hide-mobile' : '';
        var sortArrow = '';
        if (c.sortable && ss.col === c.key) sortArrow = ss.asc ? ' &#9650;' : ' &#9660;';
        var tip = c.tip ? ' title="' + escapeHtml(c.tip) + '"' : '';
        if (c.sortable) {
          html += '<th class="ay-sortable' + mobileClass + '" data-ay-sort="' + c.key + '" data-ay-section="' + section + '"' + tip + '>' + escapeHtml(c.label) + sortArrow + '</th>';
        } else {
          html += '<th' + tip + ' class="' + mobileClass + '">' + escapeHtml(c.label) + '</th>';
        }
      });
      html += '</tr></thead><tbody>';
      players.forEach(function(p) {
        var posColor = POS_COLORS[p.position] || '#8a7565';
        var regrDelta = p.regression_delta || 0;
        var regrClass = regrDelta >= 0 ? 'ay-regr-buy' : 'ay-regr-sell';
        var regrSign = regrDelta >= 0 ? '+' : '';
        html += '<tr>';
        // player cell
        html += '<td class="ay-player-cell">';
        if (p.headshot_url) html += '<img class="ay-headshot" src="' + escapeAttr(p.headshot_url) + '" alt="Player headshot" loading="lazy">';
        html += '<span class="ay-name">' + pLink(p.name, p.player_id) + '</span>';
        html += '<span class="ay-pos-badge" style="background:' + posColor + '">' + escapeHtml(p.position) + '</span>';
        html += '<span class="ay-team">' + escapeHtml(p.team || '') + '</span>';
        html += '</td>';
        html += '<td class="ay-num">' + fmt(p.targets_g) + '</td>';
        html += '<td class="ay-num">' + fmt(p.air_yards, 0) + '</td>';
        html += '<td class="ay-num">' + fmt(p.air_yards_g) + '</td>';
        html += '<td class="ay-num">' + fmt(p.adot) + '</td>';
        html += '<td class="ay-num">' + fmt(p.air_yards_share != null ? (p.air_yards_share * 100) : null) + '%</td>';
        html += '<td class="ay-num">' + fmt(p.wopr, 2) + '</td>';
        html += '<td class="ay-num">' + fmt(p.racr, 2) + '</td>';
        html += '<td class="ay-num">' + fmt(p.ppg) + '</td>';
        html += '<td class="ay-num"><span class="ay-regr-badge ' + regrClass + '">' + regrSign + fmt(regrDelta) + '</span></td>';
        html += '<td class="ay-num">' + (p.games != null ? p.games : '-') + '</td>';
        html += '<td class="ay-annotation hide-mobile">' + escapeHtml(p.annotation || '') + '</td>';
        html += '</tr>';
      });
      html += '</tbody></table></div>';
      return html;
    }

    el.querySelector('#ay-pos-tabs').addEventListener('click', function(e) {
      var tab = e.target.closest('.lp-pos-tab');
      if (!tab) return;
      el.querySelectorAll('#ay-pos-tabs .lp-pos-tab').forEach(function(t) { t.classList.remove('active'); });
      tab.classList.add('active');
      curPos = tab.getAttribute('data-pos') || '';
      loadAY();
    });
    el.querySelector('#ay-season').addEventListener('change', function(e) { curSeason = e.target.value; loadAY(); });
    loadAY();
  }});

  // ─── PLAYER SEARCH HELPER ──────────────────────────────────────
  // Reusable autocomplete builder for panels that need player search
  function buildPlayerSearch(el, prefix, placeholder, onSelect) {
    var wrap = el.querySelector('.' + prefix + 'search-wrap');
    if (!wrap) return;
    var inp = wrap.querySelector('.' + prefix + 'search-input');
    var list = wrap.querySelector('.' + prefix + 'search-list');
    var timer = null;
    inp.addEventListener('input', function() {
      var q = inp.value.trim();
      if (q.length < 2) { list.innerHTML = ''; list.style.display = 'none'; return; }
      clearTimeout(timer);
      timer = setTimeout(function() {
        fetch('/api/players/quick-search?q=' + encodeURIComponent(q) + '&limit=8', { signal: _panelSignal() }).then(function(r) {
          if (!r.ok) throw new Error('API error');
          return r.json();
        }).then(function(data) {
          var players = Array.isArray(data) ? data : (data.players || []);
          if (!players.length) { list.innerHTML = '<div class="' + prefix + 'search-empty">' + razzleEmpty() + '</div>'; list.style.display = 'block'; return; }
          var html = '';
          players.forEach(function(p) {
            var posColor = POS_COLORS[p.position] || '#8a7565';
            html += '<div class="' + prefix + 'search-item" data-id="' + escapeAttr(p.player_id) + '" data-name="' + escapeAttr(p.full_name || p.name) + '" data-pos="' + escapeAttr(p.position) + '" data-team="' + escapeAttr(p.team) + '">';
            html += '<span class="' + prefix + 'search-pos" style="background:' + posColor + '">' + escapeHtml(p.position) + '</span>';
            html += '<span class="' + prefix + 'search-name">' + escapeHtml(p.full_name || p.name) + '</span>';
            html += '<span class="' + prefix + 'search-team">' + escapeHtml(p.team || '') + '</span>';
            html += '</div>';
          });
          list.innerHTML = html;
          list.style.display = 'block';
        }).catch(function() { list.innerHTML = ''; list.style.display = 'none'; });
      }, 250);
    });
    list.addEventListener('click', function(e) {
      var item = e.target.closest('.' + prefix + 'search-item');
      if (!item) return;
      var id = item.getAttribute('data-id');
      var name = item.getAttribute('data-name');
      var pos = item.getAttribute('data-pos');
      var team = item.getAttribute('data-team');
      inp.value = name;
      list.innerHTML = '';
      list.style.display = 'none';
      onSelect({ player_id: id, full_name: name, position: pos, team: team });
    });
    if (!wrap._docClickBound) {
      wrap._docClickBound = true;
      document.addEventListener('click', function(e) {
        if (!wrap.contains(e.target)) { list.style.display = 'none'; }
      });
    }
  }

  function searchWrapHTML(prefix, placeholder) {
    return '<div class="' + prefix + 'search-wrap lp-search-wrap">' +
      '<input type="text" class="' + prefix + 'search-input lp-search" placeholder="' + (placeholder || 'search player...') + '" aria-label="Search players">' +
      '<div class="' + prefix + 'search-list lp-search-list"></div>' +
    '</div>';
  }

  function seasonOptions(selected) {
    var html = '';
    var now = new Date();
    var latest = now.getMonth() >= 8 ? now.getFullYear() : now.getFullYear() - 1;
    for (var y = latest; y >= 2015; y--) {
      html += '<option value="' + y + '"' + (y === (selected || latest) ? ' selected' : '') + '>' + y + '</option>';
    }
    return html;
  }

  function weekSelectHTML(id) {
    return '<select class="lp-select" id="' + id + '" style="display:none;" title="Filter by week"><option value="0">All Weeks</option></select>';
  }

  function populateWeekSelect(el, selectId, season, onChange) {
    var sel = el.querySelector('#' + selectId);
    if (!sel) return;
    if (!season) { sel.style.display = 'none'; return; }
    fetch(window.location.origin + '/api/available-weeks?season=' + season, { signal: _panelSignal() })
      .then(function(r) { return r.ok ? r.json() : { weeks: [] }; })
      .then(function(data) {
        var weeks = data.weeks || [];
        if (!weeks.length) { sel.style.display = 'none'; return; }
        sel.style.display = '';
        var html = '<option value="0">All Weeks</option>';
        weeks.forEach(function(w) { html += '<option value="' + w + '">Week ' + w + '</option>'; });
        sel.innerHTML = html;
      })
      .catch(function() { sel.style.display = 'none'; });
    sel.onchange = function() { if (onChange) onChange(parseInt(sel.value) || 0); };
  }

  function posTabsHTML(id, includeAll) {
    var positions = ['QB', 'RB', 'WR', 'TE'];
    var html = '<div class="lp-pos-tabs" id="' + id + '">';
    if (includeAll) html += '<button class="lp-pos-tab active" data-pos="">All</button>';
    positions.forEach(function(p, i) {
      html += '<button class="lp-pos-tab' + (!includeAll && i === 0 ? ' active' : '') + '" data-pos="' + p + '">' + p + '</button>';
    });
    html += '</div>';
    return html;
  }

  // ─── 37. CAREER STATS TIMELINE ──────────────────────────────────
  defs.push({ name: 'career', render: function(el) {
    el.innerHTML =
      '<div class="lp-page">' +
        '<div class="lp-header"><h2>Career Stats Timeline</h2>' +
        '<div class="lp-subtitle">a player\'s full career arc</div></div>' +
        '<div class="lp-controls">' + searchWrapHTML('cst-', 'search player...') + '</div>' +
        '<div id="cst-content"><div class="panel-empty">search for a player to view career stats</div></div>' +
      '</div>';

    buildPlayerSearch(el, 'cst-', 'search player...', function(p) {
      loadCareer(p.player_id);
    });

    function loadCareer(pid) {
      var content = el.querySelector('#cst-content');
      content.innerHTML = '<div class="lp-loading">' + razzleLoading() + '</div>';
      fetch('/api/career-stats?player_id=' + encodeURIComponent(pid), { signal: _panelSignal() }).then(function(r) {
        if (!r.ok) throw new Error('API error');
        return r.json();
      }).then(function(data) {
        renderCareer(data, content);
      }).catch(function() {
        content.innerHTML = '<div class="panel-error">' + razzleError() + '<br><button onclick="location.reload()">retry</button></div>';
      });
    }

    function renderCareer(data, content) {
      var p = data.player || data;
      var seasons = data.seasons || [];
      var pos = p.position || '';
      var posColor = POS_COLORS[pos] || '#8a7565';
      var careerPPG = 0, totalPts = 0, totalGP = 0, peakPPG = 0;
      seasons.forEach(function(s) {
        totalPts += (s.total_points || s.fantasy_points || 0);
        totalGP += (s.games || s.games_played || 0);
        var sppg = s.ppg || (s.games ? (s.total_points || s.fantasy_points || 0) / s.games : 0);
        if (sppg > peakPPG) peakPPG = sppg;
      });
      careerPPG = totalGP > 0 ? totalPts / totalGP : 0;
      var trajectory = peakPPG > 0 && seasons.length > 1 ? (function() {
        var last = seasons[seasons.length - 1];
        var lastPPG = last.ppg || (last.games ? (last.total_points || last.fantasy_points || 0) / last.games : 0);
        if (lastPPG >= peakPPG * 0.9) return 'ascending';
        if (lastPPG >= peakPPG * 0.7) return 'plateau';
        return 'declining';
      })() : 'new';
      var trajLabels = { ascending: 'Rising', plateau: 'Steady', declining: 'Declining', 'new': 'New' };
      var trajColors = { ascending: 'var(--green)', plateau: 'var(--blue)', declining: 'var(--red)', 'new': 'var(--purple)' };

      var html = '<div class="cst-player-card">';
      html += playerHeadshot(p, pos);
      html += '<div class="cst-player-info">';
      html += '<div class="cst-player-name">' + escapeHtml(p.full_name || p.name || '') + '</div>';
      html += '<span class="cst-pos-badge" style="background:' + posColor + '">' + escapeHtml(pos) + '</span>';
      html += '<span class="cst-team">' + escapeHtml(p.team || '') + '</span>';
      if (p.age) html += '<span class="cst-age">Age ' + escapeHtml(String(p.age)) + '</span>';
      html += '<span class="cst-traj" style="background:' + trajColors[trajectory] + '">' + trajLabels[trajectory] + '</span>';
      html += '</div></div>';

      // Summary chips
      html += '<div class="cst-chips">';
      html += '<div class="cst-chip"><div class="cst-chip-val">' + fmt(careerPPG) + '</div><div class="cst-chip-label">Career PPG</div></div>';
      html += '<div class="cst-chip"><div class="cst-chip-val">' + fmt(totalPts, 0) + '</div><div class="cst-chip-label">Total PPR</div></div>';
      html += '<div class="cst-chip"><div class="cst-chip-val">' + totalGP + '</div><div class="cst-chip-label">Games</div></div>';
      html += '<div class="cst-chip"><div class="cst-chip-val">' + seasons.length + '</div><div class="cst-chip-label">Seasons</div></div>';
      html += '<div class="cst-chip"><div class="cst-chip-val">' + fmt(peakPPG) + '</div><div class="cst-chip-label">Peak PPG</div></div>';
      html += '</div>';

      // Canvas chart placeholder
      html += '<div class="cst-chart-card"><canvas id="cst-canvas" width="700" height="260" role="img" aria-label="Career stat timeline chart"></canvas></div>';

      // Career highs
      var highs = data.career_highs || {};
      if (Object.keys(highs).length) {
        html += '<div class="cst-highs-title">Career Highs</div><div class="cst-highs">';
        Object.keys(highs).forEach(function(k) {
          html += '<div class="cst-high-card"><div class="cst-high-val">' + fmt(highs[k], k.indexOf('td') >= 0 ? 0 : 1) + '</div><div class="cst-high-label">' + escapeHtml(k.replace(/_/g, ' ')) + '</div></div>';
        });
        html += '</div>';
      }

      // Season table
      html += '<div class="cst-table-wrap"><table class="cst-table"><thead><tr>';
      html += '<th scope="col">Season</th><th>GP</th><th>PPG</th><th>Total</th>';
      if (pos === 'QB') { html += '<th scope="col">Pass Yd</th><th>Pass TD</th><th>INT</th><th>Rush Yd</th><th>Rush TD</th>'; }
      else if (pos === 'RB') { html += '<th scope="col">Rush Yd</th><th>Rush TD</th><th>Car</th><th>Rec</th><th>Rec Yd</th><th>Rec TD</th>'; }
      else { html += '<th scope="col">Rec</th><th>Rec Yd</th><th>Rec TD</th><th>Tgt</th><th>Rush Yd</th><th>Rush TD</th>'; }
      html += '</tr></thead><tbody>';
      var totals = { gp: 0, pts: 0, pass_yd: 0, pass_td: 0, int: 0, rush_yd: 0, rush_td: 0, car: 0, rec: 0, rec_yd: 0, rec_td: 0, tgt: 0 };
      seasons.forEach(function(s) {
        var gp = s.games || s.games_played || 0;
        var pts = s.total_points || s.fantasy_points || 0;
        var ppg = gp > 0 ? pts / gp : 0;
        totals.gp += gp; totals.pts += pts;
        totals.pass_yd += (s.passing_yards || 0); totals.pass_td += (s.passing_tds || 0); totals.int += (s.interceptions || 0);
        totals.rush_yd += (s.rushing_yards || 0); totals.rush_td += (s.rushing_tds || 0); totals.car += (s.carries || 0);
        totals.rec += (s.receptions || 0); totals.rec_yd += (s.receiving_yards || 0); totals.rec_td += (s.receiving_tds || 0); totals.tgt += (s.targets || 0);
        html += '<tr><td>' + (s.season || '') + '</td><td>' + gp + '</td><td class="cst-ppg-cell">' + fmt(ppg) + '</td><td>' + fmt(pts, 0) + '</td>';
        if (pos === 'QB') { html += '<td>' + fmt(s.passing_yards, 0) + '</td><td>' + (s.passing_tds || 0) + '</td><td>' + (s.interceptions || 0) + '</td><td>' + fmt(s.rushing_yards, 0) + '</td><td>' + (s.rushing_tds || 0) + '</td>'; }
        else if (pos === 'RB') { html += '<td>' + fmt(s.rushing_yards, 0) + '</td><td>' + (s.rushing_tds || 0) + '</td><td>' + (s.carries || 0) + '</td><td>' + (s.receptions || 0) + '</td><td>' + fmt(s.receiving_yards, 0) + '</td><td>' + (s.receiving_tds || 0) + '</td>'; }
        else { html += '<td>' + (s.receptions || 0) + '</td><td>' + fmt(s.receiving_yards, 0) + '</td><td>' + (s.receiving_tds || 0) + '</td><td>' + (s.targets || 0) + '</td><td>' + fmt(s.rushing_yards, 0) + '</td><td>' + (s.rushing_tds || 0) + '</td>'; }
        html += '</tr>';
      });
      // Totals row
      html += '<tr class="cst-totals"><td>Career</td><td>' + totals.gp + '</td><td class="cst-ppg-cell">' + fmt(totals.gp > 0 ? totals.pts / totals.gp : 0) + '</td><td>' + fmt(totals.pts, 0) + '</td>';
      if (pos === 'QB') { html += '<td>' + fmt(totals.pass_yd, 0) + '</td><td>' + totals.pass_td + '</td><td>' + totals.int + '</td><td>' + fmt(totals.rush_yd, 0) + '</td><td>' + totals.rush_td + '</td>'; }
      else if (pos === 'RB') { html += '<td>' + fmt(totals.rush_yd, 0) + '</td><td>' + totals.rush_td + '</td><td>' + totals.car + '</td><td>' + totals.rec + '</td><td>' + fmt(totals.rec_yd, 0) + '</td><td>' + totals.rec_td + '</td>'; }
      else { html += '<td>' + totals.rec + '</td><td>' + fmt(totals.rec_yd, 0) + '</td><td>' + totals.rec_td + '</td><td>' + totals.tgt + '</td><td>' + fmt(totals.rush_yd, 0) + '</td><td>' + totals.rush_td + '</td>'; }
      html += '</tr></tbody></table></div>';

      content.innerHTML = html;

      // Draw PPG chart
      var canvas = el.querySelector('#cst-canvas');
      if (canvas && seasons.length > 0) {
        var ctx = canvas.getContext('2d');
        var t = getCanvasTheme();
        var W = canvas.width, H = canvas.height;
        var pad = { t: 20, r: 20, b: 30, l: 40 };
        var cw = W - pad.l - pad.r, ch = H - pad.t - pad.b;
        var ppgArr = seasons.map(function(s) { var g = s.games || s.games_played || 1; return (s.total_points || s.fantasy_points || 0) / g; });
        var maxPPG = Math.max.apply(null, ppgArr) * 1.15 || 1;

        ctx.clearRect(0, 0, W, H);
        // Grid
        ctx.strokeStyle = t.inkFaint; ctx.lineWidth = 1;
        for (var g = 0; g <= 4; g++) {
          var gy = pad.t + ch - (g / 4) * ch;
          ctx.beginPath(); ctx.moveTo(pad.l, gy); ctx.lineTo(pad.l + cw, gy); ctx.stroke();
          ctx.fillStyle = t.inkLight; ctx.font = '11px "Space Mono", monospace'; ctx.textAlign = 'right';
          ctx.fillText(fmt(maxPPG * g / 4), pad.l - 5, gy + 3);
        }
        // Area fill
        ctx.beginPath();
        ppgArr.forEach(function(v, i) {
          var x = pad.l + (seasons.length > 1 ? i / (seasons.length - 1) : 0.5) * cw;
          var y = pad.t + ch - (v / maxPPG) * ch;
          if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        });
        ctx.lineTo(pad.l + cw, pad.t + ch);
        ctx.lineTo(pad.l, pad.t + ch);
        ctx.closePath();
        ctx.fillStyle = posColor + '26';
        ctx.fill();
        // Line
        ctx.beginPath();
        ppgArr.forEach(function(v, i) {
          var x = pad.l + (seasons.length > 1 ? i / (seasons.length - 1) : 0.5) * cw;
          var y = pad.t + ch - (v / maxPPG) * ch;
          if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        });
        ctx.strokeStyle = posColor; ctx.lineWidth = 3; ctx.stroke();
        // Dots + labels
        ppgArr.forEach(function(v, i) {
          var x = pad.l + (seasons.length > 1 ? i / (seasons.length - 1) : 0.5) * cw;
          var y = pad.t + ch - (v / maxPPG) * ch;
          ctx.beginPath(); ctx.arc(x, y, 5, 0, Math.PI * 2); ctx.fillStyle = posColor; ctx.fill();
          ctx.strokeStyle = t.white; ctx.lineWidth = 2; ctx.stroke();
          ctx.fillStyle = t.ink; ctx.font = 'bold 11px "Space Mono", monospace'; ctx.textAlign = 'center';
          ctx.fillText(fmt(v), x, y - 10);
          // Season label
          ctx.fillStyle = t.inkLight; ctx.font = '11px "Space Mono", monospace';
          ctx.fillText(String(seasons[i].season || ''), x, pad.t + ch + 16);
        });
        // Y-axis label
        ctx.save(); ctx.translate(12, pad.t + ch / 2); ctx.rotate(-Math.PI / 2);
        ctx.fillStyle = t.inkLight; ctx.font = '11px "Space Mono", monospace'; ctx.textAlign = 'center';
        ctx.fillText('PPG', 0, 0); ctx.restore();
      }
    }
  }});

  // ─── 38. CAREER COMPARISON ──────────────────────────────────────
  defs.push({ name: 'career-compare', render: function(el) {
    var slotColors = [POS_COLORS.WR, POS_COLORS.QB, POS_COLORS.RB];
    var players = []; // {player_id, full_name, position, team, data}

    el.innerHTML =
      '<div class="lp-page">' +
        '<div class="lp-header"><h2>Career Comparison</h2>' +
        '<div class="lp-subtitle">overlay career arcs for up to 3 players</div></div>' +
        '<div class="lp-controls">' + searchWrapHTML('ccp-', 'add player (max 3)...') + '</div>' +
        '<div id="ccp-chips" class="ccp-chips"></div>' +
        '<div id="ccp-content"><div class="panel-empty">search and add players to compare careers</div></div>' +
      '</div>';

    buildPlayerSearch(el, 'ccp-', 'add player...', function(p) {
      if (players.length >= 3) return;
      if (players.some(function(x) { return x.player_id === p.player_id; })) return;
      var entry = { player_id: p.player_id, full_name: p.full_name, position: p.position, team: p.team, data: null };
      players.push(entry);
      el.querySelector('.ccp-search-input').value = '';
      renderChips();
      loadPlayerData(entry);
    });

    function renderChips() {
      var chipsEl = el.querySelector('#ccp-chips');
      var html = '';
      players.forEach(function(p, i) {
        html += '<span class="ccp-chip" style="border-color:' + slotColors[i] + '"><span class="ccp-chip-dot" style="background:' + slotColors[i] + '"></span>' + escapeHtml(p.full_name) + '<button class="ccp-chip-rm" data-idx="' + i + '">&times;</button></span>';
      });
      chipsEl.innerHTML = html;
      chipsEl.querySelectorAll('.ccp-chip-rm').forEach(function(btn) {
        btn.addEventListener('click', function() {
          players.splice(parseInt(this.getAttribute('data-idx')), 1);
          renderChips();
          renderComparison();
        });
      });
    }

    function loadPlayerData(entry) {
      var content = el.querySelector('#ccp-content');
      content.innerHTML = '<div class="lp-loading">' + razzleLoading() + '</div>';
      fetch('/api/career-stats?player_id=' + encodeURIComponent(entry.player_id), { signal: _panelSignal() }).then(function(r) {
        if (!r.ok) throw new Error('API error');
        return r.json();
      }).then(function(data) {
        entry.data = data;
        renderComparison();
      }).catch(function() {
        content.innerHTML = '<div class="panel-error">' + razzleError() + '<br><button onclick="location.reload()">retry</button></div>';
      });
    }

    function renderComparison() {
      var content = el.querySelector('#ccp-content');
      var loaded = players.filter(function(p) { return p.data; });
      if (!loaded.length) { content.innerHTML = '<div class="panel-empty">search and add players to compare careers</div>'; return; }

      var html = '<div class="ccp-chart-card"><canvas id="ccp-canvas" width="700" height="280" role="img" aria-label="Career comparison trend line chart"></canvas></div>';

      // Summary comparison table
      html += '<div class="ccp-table-wrap"><table class="ccp-table"><thead><tr><th>Metric</th>';
      loaded.forEach(function(p, i) {
        html += '<th style="color:' + slotColors[i] + '">' + escapeHtml(p.full_name) + '</th>';
      });
      html += '</tr></thead><tbody>';
      var metrics = ['Career PPG', 'Total Points', 'Games', 'Seasons', 'Peak PPG'];
      var vals = loaded.map(function(p) {
        var ss = p.data.seasons || [];
        var gp = 0, pts = 0, peak = 0;
        ss.forEach(function(s) { gp += (s.games || s.games_played || 0); pts += (s.total_points || s.fantasy_points || 0); var sp = s.ppg || ((s.games||1)>0?(s.total_points||s.fantasy_points||0)/(s.games||1):0); if(sp>peak)peak=sp; });
        return [gp > 0 ? pts / gp : 0, pts, gp, ss.length, peak];
      });
      metrics.forEach(function(m, mi) {
        html += '<tr><td>' + m + '</td>';
        var best = -Infinity;
        vals.forEach(function(v) { if (v[mi] > best) best = v[mi]; });
        vals.forEach(function(v) {
          var cls = v[mi] === best && loaded.length > 1 ? ' class="ccp-best"' : '';
          html += '<td' + cls + '>' + fmt(v[mi], mi === 2 || mi === 3 ? 0 : 1) + '</td>';
        });
        html += '</tr>';
      });
      html += '</tbody></table></div>';

      // Season-by-season PPG table
      var allYears = {};
      loaded.forEach(function(p) { (p.data.seasons || []).forEach(function(s) { allYears[s.season] = true; }); });
      var years = Object.keys(allYears).sort();
      if (years.length) {
        html += '<div class="ccp-table-wrap"><table class="ccp-table"><thead><tr><th>Season</th>';
        loaded.forEach(function(p, i) { html += '<th style="color:' + slotColors[i] + '">' + escapeHtml(p.full_name) + '</th>'; });
        html += '</tr></thead><tbody>';
        years.forEach(function(yr) {
          html += '<tr><td>' + yr + '</td>';
          var yrVals = loaded.map(function(p) {
            var s = (p.data.seasons || []).filter(function(ss) { return String(ss.season) === String(yr); })[0];
            if (!s) return null;
            var g = s.games || s.games_played || 1;
            return (s.total_points || s.fantasy_points || 0) / g;
          });
          var best = -Infinity;
          yrVals.forEach(function(v) { if (v !== null && v > best) best = v; });
          yrVals.forEach(function(v) {
            if (v === null) { html += '<td>-</td>'; }
            else {
              var cls = v === best && loaded.length > 1 ? ' class="ccp-best"' : '';
              html += '<td' + cls + '>' + fmt(v) + '</td>';
            }
          });
          html += '</tr>';
        });
        html += '</tbody></table></div>';
      }

      content.innerHTML = html;

      // Draw overlay chart
      var canvas = el.querySelector('#ccp-canvas');
      if (canvas) {
        var ctx = canvas.getContext('2d');
        var t = getCanvasTheme();
        var W = canvas.width, H = canvas.height;
        var pad = { t: 20, r: 20, b: 30, l: 40 };
        var cw = W - pad.l - pad.r, ch = H - pad.t - pad.b;
        ctx.clearRect(0, 0, W, H);

        // Determine all seasons for x-axis
        var xYears = Object.keys(allYears).sort();
        if (!xYears.length) return;
        var maxPPG = 1;
        loaded.forEach(function(p) {
          (p.data.seasons || []).forEach(function(s) {
            var g = s.games || s.games_played || 1;
            var ppg = (s.total_points || s.fantasy_points || 0) / g;
            if (ppg > maxPPG) maxPPG = ppg;
          });
        });
        maxPPG *= 1.15;

        // Grid
        ctx.strokeStyle = t.inkFaint; ctx.lineWidth = 1;
        for (var g = 0; g <= 4; g++) {
          var gy = pad.t + ch - (g / 4) * ch;
          ctx.beginPath(); ctx.moveTo(pad.l, gy); ctx.lineTo(pad.l + cw, gy); ctx.stroke();
          ctx.fillStyle = t.inkLight; ctx.font = '11px "Space Mono", monospace'; ctx.textAlign = 'right';
          ctx.fillText(fmt(maxPPG * g / 4), pad.l - 5, gy + 3);
        }
        // X labels
        xYears.forEach(function(yr, i) {
          var x = pad.l + (xYears.length > 1 ? i / (xYears.length - 1) : 0.5) * cw;
          ctx.fillStyle = t.inkLight; ctx.font = '11px "Space Mono", monospace'; ctx.textAlign = 'center';
          ctx.fillText(yr, x, pad.t + ch + 16);
        });

        // Draw each player
        loaded.forEach(function(p, pi) {
          var color = slotColors[pi];
          var seasonMap = {};
          (p.data.seasons || []).forEach(function(s) {
            var g = s.games || s.games_played || 1;
            seasonMap[s.season] = (s.total_points || s.fantasy_points || 0) / g;
          });
          ctx.beginPath(); ctx.strokeStyle = color; ctx.lineWidth = 3;
          var first = true;
          xYears.forEach(function(yr, i) {
            if (seasonMap[yr] === undefined) { first = true; return; }
            var x = pad.l + (xYears.length > 1 ? i / (xYears.length - 1) : 0.5) * cw;
            var y = pad.t + ch - (seasonMap[yr] / maxPPG) * ch;
            if (first) { ctx.moveTo(x, y); first = false; } else { ctx.lineTo(x, y); }
          });
          ctx.stroke();
          // Dots
          xYears.forEach(function(yr) {
            if (seasonMap[yr] === undefined) return;
            var i = xYears.indexOf(yr);
            var x = pad.l + (xYears.length > 1 ? i / (xYears.length - 1) : 0.5) * cw;
            var y = pad.t + ch - (seasonMap[yr] / maxPPG) * ch;
            ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2); ctx.fillStyle = color; ctx.fill();
            ctx.strokeStyle = t.white; ctx.lineWidth = 2; ctx.stroke();
          });
        });
      }
    }
  }});

  // ─── 39. COMPARE TABLE ──────────────────────────────────────────
  defs.push({ name: 'comptable', render: function(el) {
    var selectedPlayers = []; // {player_id, full_name, position, team}
    var curSeason = _latestSeason;
    var sortCol = 'ppg';
    var sortAsc = false;
    var INVERSE = { interceptions: true, int: true };

    var cols = [
      { key: 'name', label: 'Player', sortable: false },
      { key: 'games', label: 'G', sortable: true },
      { key: 'total_points', label: 'Total', sortable: true },
      { key: 'ppg', label: 'PPG', sortable: true },
      { key: 'passing_yards', label: 'Pass Yd', sortable: true },
      { key: 'passing_tds', label: 'Pass TD', sortable: true },
      { key: 'interceptions', label: 'INT', sortable: true },
      { key: 'rushing_yards', label: 'Rush Yd', sortable: true },
      { key: 'rushing_tds', label: 'Rush TD', sortable: true },
      { key: 'carries', label: 'Car', sortable: true },
      { key: 'receptions', label: 'Rec', sortable: true },
      { key: 'receiving_yards', label: 'Rec Yd', sortable: true },
      { key: 'receiving_tds', label: 'Rec TD', sortable: true },
      { key: 'targets', label: 'Tgt', sortable: true },
      { key: 'yards_per_carry', label: 'Y/Car', sortable: true },
      { key: 'yards_per_rec', label: 'Y/Rec', sortable: true },
      { key: 'catch_rate', label: 'Catch%', sortable: true }
    ];

    el.innerHTML =
      '<div class="lp-page">' +
        '<div class="lp-header"><h2>Compare Table</h2>' +
        '<div class="lp-subtitle">side-by-side stats for 2-8 players</div></div>' +
        '<div class="lp-controls">' +
          searchWrapHTML('cmt-', 'add player...') +
          '<select class="lp-select" id="cmt-season">' + seasonOptions() + '</select>' +
          '<button class="btn-primary" id="cmt-compare-btn">Compare</button>' +
        '</div>' +
        '<div id="cmt-chips" class="cmt-chips"></div>' +
        '<div id="cmt-content"><div class="panel-empty">add 2-8 players then click Compare</div></div>' +
      '</div>';

    buildPlayerSearch(el, 'cmt-', 'add player...', function(p) {
      if (selectedPlayers.length >= 8) return;
      if (selectedPlayers.some(function(x) { return x.player_id === p.player_id; })) return;
      selectedPlayers.push(p);
      el.querySelector('.cmt-search-input').value = '';
      renderChips();
    });

    function renderChips() {
      var chipsEl = el.querySelector('#cmt-chips');
      var html = '';
      selectedPlayers.forEach(function(p, i) {
        var posColor = POS_COLORS[p.position] || '#8a7565';
        html += '<span class="cmt-chip" style="border-color:' + posColor + '"><span class="cmt-chip-pos" style="background:' + posColor + '">' + escapeHtml(p.position) + '</span>' + escapeHtml(p.full_name) + '<button class="cmt-chip-rm" data-idx="' + i + '">&times;</button></span>';
      });
      chipsEl.innerHTML = html;
      chipsEl.querySelectorAll('.cmt-chip-rm').forEach(function(btn) {
        btn.addEventListener('click', function() {
          selectedPlayers.splice(parseInt(this.getAttribute('data-idx')), 1);
          renderChips();
        });
      });
    }

    el.querySelector('#cmt-season').addEventListener('change', function() { curSeason = parseInt(this.value) || _latestSeason; });
    el.querySelector('#cmt-compare-btn').addEventListener('click', function() { loadCompare(); });

    function loadCompare() {
      if (selectedPlayers.length < 2) { el.querySelector('#cmt-content').innerHTML = '<div class="panel-empty">add at least 2 players</div>'; return; }
      var ids = selectedPlayers.map(function(p) { return p.player_id; }).join(',');
      var content = el.querySelector('#cmt-content');
      content.innerHTML = '<div class="lp-loading">' + razzleLoading() + '</div>';
      fetch('/api/compare-table?players=' + encodeURIComponent(ids) + '&season=' + curSeason, { signal: _panelSignal() }).then(function(r) {
        if (!r.ok) throw new Error('API error');
        return r.json();
      }).then(function(data) {
        renderTable(data.players || data, content);
      }).catch(function() {
        content.innerHTML = '<div class="panel-error">' + razzleError() + '<br><button onclick="location.reload()">retry</button></div>';
      });
    }

    function renderTable(data, content) {
      if (!data || !data.length) { content.innerHTML = '<div class="panel-empty">' + razzleEmpty() + '<span class="hint">try a different position or season</span></div>'; return; }
      // Sort
      data.sort(function(a, b) {
        var va = a[sortCol], vb = b[sortCol];
        if (va === undefined || va === null) va = -Infinity;
        if (vb === undefined || vb === null) vb = -Infinity;
        return sortAsc ? va - vb : vb - va;
      });
      // Find best per column
      var bests = {};
      cols.forEach(function(c) {
        if (!c.sortable) return;
        var best = null;
        data.forEach(function(p) {
          var v = p[c.key];
          if (v === undefined || v === null) return;
          if (INVERSE[c.key]) { if (best === null || v < best) best = v; }
          else { if (best === null || v > best) best = v; }
        });
        bests[c.key] = best;
      });

      var html = '<div class="cmt-table-wrap"><table class="cmt-table"><thead><tr>';
      cols.forEach(function(c) {
        var arrow = '';
        if (c.sortable && sortCol === c.key) arrow = sortAsc ? ' &#9650;' : ' &#9660;';
        html += '<th' + (c.sortable ? ' class="cmt-sortable" data-col="' + c.key + '"' : '') + '>' + c.label + arrow + '</th>';
      });
      html += '</tr></thead><tbody>';
      data.forEach(function(p) {
        html += '<tr>';
        cols.forEach(function(c) {
          if (c.key === 'name') {
            var posColor = POS_COLORS[p.position] || '#8a7565';
            html += '<td class="cmt-player-cell">';
            if (p.headshot_url) html += '<img class="cmt-headshot" src="' + escapeAttr(p.headshot_url) + '" alt="Player headshot" loading="lazy" onerror="this.onerror=null;this.src=\'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 40 40%22><circle cx=%2220%22 cy=%2220%22 r=%2220%22 fill=%22%23d97757%22/><text x=%2220%22 y=%2225%22 text-anchor=%22middle%22 fill=%22white%22 font-size=%2216%22>?</text></svg>\'">';
            html += '<span>' + escapeHtml(p.full_name || p.name || '') + '</span>';
            html += '<span class="cmt-pos" style="background:' + posColor + '">' + escapeHtml(p.position || '') + '</span>';
            html += '</td>';
          } else {
            var v = p[c.key];
            var isBest = bests[c.key] !== undefined && v === bests[c.key] && data.length > 1;
            var dec = c.key === 'catch_rate' ? 1 : (c.key === 'yards_per_carry' || c.key === 'yards_per_rec' ? 1 : (c.key === 'ppg' ? 1 : 0));
            html += '<td class="cmt-num' + (isBest ? ' cmt-best' : '') + '">' + fmt(v, dec) + '</td>';
          }
        });
        html += '</tr>';
      });
      html += '</tbody></table></div>';
      content.innerHTML = html;

      content.querySelectorAll('.cmt-sortable').forEach(function(th) {
        th.addEventListener('click', function() {
          var col = this.getAttribute('data-col');
          if (sortCol === col) sortAsc = !sortAsc;
          else { sortCol = col; sortAsc = false; }
          renderTable(data, content);
        });
      });
    }
  }});

  // ─── 40. STRENGTHS & WEAKNESSES ─────────────────────────────────
  defs.push({ name: 'strengths', render: function(el) {
    var curSeason = _latestSeason;

    el.innerHTML =
      '<div class="lp-page">' +
        '<div class="lp-header"><h2>Strengths &amp; Weaknesses</h2>' +
        '<div class="lp-subtitle">what they do best and where they fall short</div></div>' +
        '<div class="lp-controls">' +
          searchWrapHTML('sw2-', 'search player...') +
          '<select class="lp-select" id="sw2-season">' + seasonOptions() + '</select>' +
        '</div>' +
        '<div id="sw2-content"><div class="panel-empty">search for a player to see their profile</div></div>' +
      '</div>';

    buildPlayerSearch(el, 'sw2-', 'search player...', function(p) {
      loadStrengths(p.player_id);
    });
    el.querySelector('#sw2-season').addEventListener('change', function() { curSeason = parseInt(this.value) || _latestSeason; });

    function gradeColor(g) {
      if (!g) return 'var(--ink-light)';
      var c = g.charAt(0);
      if (c === 'A') return 'var(--green)';
      if (c === 'B') return 'var(--blue)';
      if (c === 'C') return 'var(--yellow)';
      if (c === 'D') return 'var(--orange)';
      return 'var(--red)';
    }
    function barColor(pct) {
      if (pct >= 90) return 'var(--green)';
      if (pct >= 75) return 'var(--blue)';
      if (pct >= 50) return 'var(--yellow)';
      if (pct >= 25) return 'var(--orange)';
      return 'var(--red)';
    }

    function loadStrengths(pid) {
      var content = el.querySelector('#sw2-content');
      content.innerHTML = '<div class="lp-loading">' + razzleLoading() + '</div>';
      fetch('/api/player-strengths?player_id=' + encodeURIComponent(pid) + '&season=' + curSeason, { signal: _panelSignal() }).then(function(r) {
        if (!r.ok) throw new Error('API error');
        return r.json();
      }).then(function(data) {
        renderStrengths(data, content);
      }).catch(function() {
        content.innerHTML = '<div class="panel-error">' + razzleError() + '<br><button onclick="location.reload()">retry</button></div>';
      });
    }

    function renderStrengths(data, content) {
      var p = data.player || data;
      var strengths = data.strengths || [];
      var weaknesses = data.weaknesses || [];
      var all = data.all_stats || (strengths.concat(weaknesses));
      var pos = p.position || '';
      var posColor = POS_COLORS[pos] || '#8a7565';
      var overallGrade = data.overall_grade || p.grade || '-';

      var html = '<div class="sw2-player-card">';
      html += playerHeadshot(p, pos);
      html += '<div class="sw2-player-info">';
      html += '<span class="sw2-player-name">' + escapeHtml(p.full_name || p.name || '') + '</span>';
      html += '<span class="sw2-pos-badge" style="background:' + posColor + '">' + escapeHtml(pos) + '</span>';
      html += '<span class="sw2-team">' + escapeHtml(p.team || '') + '</span>';
      html += '</div>';
      html += '<div class="sw2-overall-grade" style="background:' + gradeColor(overallGrade) + '">' + escapeHtml(overallGrade) + '</div>';
      html += '</div>';

      // Two-column grid
      html += '<div class="sw2-columns">';
      html += '<div class="sw2-col"><div class="sw2-col-header sw2-strengths-header">Strengths</div>';
      strengths.forEach(function(s) {
        html += renderStatCard(s, true);
      });
      html += '</div>';
      html += '<div class="sw2-col"><div class="sw2-col-header sw2-weaknesses-header">Weaknesses</div>';
      weaknesses.forEach(function(s) {
        html += renderStatCard(s, false);
      });
      html += '</div></div>';

      // Full percentile bars
      var sorted = all.slice().sort(function(a, b) { return (b.percentile || 0) - (a.percentile || 0); });
      html += '<div class="sw2-bars-title">Full Percentile Profile</div>';
      html += '<div class="sw2-bars">';
      sorted.forEach(function(s) {
        var pct = s.percentile || 0;
        html += '<div class="sw2-bar-row">';
        html += '<div class="sw2-bar-label">' + escapeHtml(s.label || s.stat || '') + '</div>';
        html += '<div class="sw2-bar-track"><div class="sw2-bar-fill" style="width:' + pct + '%;background:' + barColor(pct) + '"></div></div>';
        html += '<div class="sw2-bar-val">' + fmt(pct, 0) + '%</div>';
        html += '<div class="sw2-bar-grade" style="color:' + gradeColor(s.grade) + '">' + escapeHtml(s.grade || '') + '</div>';
        html += '</div>';
      });
      html += '</div>';

      content.innerHTML = html;
    }

    function renderStatCard(s, isStrength) {
      var pct = s.percentile || 0;
      var html = '<div class="sw2-stat-card">';
      html += '<div class="sw2-stat-rank">#' + (s.rank != null ? s.rank : '-') + '</div>';
      html += '<div class="sw2-stat-info">';
      html += '<div class="sw2-stat-label">' + escapeHtml(s.label || s.stat || '') + '</div>';
      html += '<div class="sw2-stat-value">' + fmt(s.value) + '</div>';
      html += '</div>';
      html += '<div class="sw2-stat-pct-bar"><div class="sw2-stat-pct-fill" style="width:' + pct + '%;background:' + barColor(pct) + '"></div></div>';
      html += '<div class="sw2-stat-grade" style="background:' + gradeColor(s.grade) + '">' + escapeHtml(s.grade || '') + '</div>';
      html += '</div>';
      return html;
    }
  }});

  // ─── 41. REPORT CARD ────────────────────────────────────────────
  defs.push({ name: 'reportcard', render: function(el) {
    var curPos = '';
    var curSeason = _latestSeason;
    var honorSort = { col: 'gpa_pct', asc: false };
    var needsSort = { col: 'gpa_pct', asc: true };
    var lastData = null;

    var GRADE_ORDER = { 'A+': 8, 'A': 7, 'B+': 6, 'B': 5, 'C+': 4, 'C': 3, 'D': 2, 'F': 1 };

    el.innerHTML =
      '<div class="lp-page">' +
        '<div class="lp-header"><h2>Report Card</h2>' +
        '<div class="lp-subtitle">fantasy GPA — the full picture</div></div>' +
        '<div class="lp-controls">' +
          posTabsHTML('rpc-pos-tabs', true) +
          '<select class="lp-select" id="rpc-season">' + seasonOptions() + '</select>' +
          weekSelectHTML('rpc-week') +
        '</div>' +
        '<div id="rpc-content"><div class="lp-loading">' + razzleLoading() + '</div></div>' +
      '</div>';

    function gradeClass(g) {
      if (g === 'A+' || g === 'A') return 'rpc-elite';
      if (g === 'B+' || g === 'B') return 'rpc-good';
      if (g === 'C+' || g === 'C') return 'rpc-avg';
      if (g === 'D') return 'rpc-below';
      return 'rpc-poor';
    }
    function stockClass(v) {
      if (v >= 80) return 'rpc-elite';
      if (v >= 60) return 'rpc-good';
      if (v >= 40) return 'rpc-avg';
      if (v >= 20) return 'rpc-below';
      return 'rpc-poor';
    }

    function loadData() {
      var content = el.querySelector('#rpc-content');
      content.innerHTML = '<div class="lp-loading">' + razzleLoading() + '</div>';
      var url = '/api/report-cards?limit=25&season=' + curSeason;
      if (curPos) url += '&position=' + encodeURIComponent(curPos);
      var rpcWeekVal = parseInt((el.querySelector('#rpc-week') || {}).value) || 0;
      if (rpcWeekVal > 0) url += '&week=' + rpcWeekVal;
      fetch(url, { signal: _panelSignal() }).then(function(r) {
        if (!r.ok) throw new Error('API error');
        return r.json();
      }).then(function(data) {
        lastData = data;
        renderCards(data, content);
      }).catch(function() {
        content.innerHTML = '<div class="panel-error">' + razzleError() + '<br><button onclick="location.reload()">retry</button></div>';
      });
    }

    function sortPlayers(arr, s) {
      return arr.slice().sort(function(a, b) {
        var va = a[s.col], vb = b[s.col];
        // Grade columns
        if (typeof va === 'string' && GRADE_ORDER[va] !== undefined) va = GRADE_ORDER[va];
        if (typeof vb === 'string' && GRADE_ORDER[vb] !== undefined) vb = GRADE_ORDER[vb];
        if (va === undefined || va === null) va = -Infinity;
        if (vb === undefined || vb === null) vb = -Infinity;
        return s.asc ? va - vb : vb - va;
      });
    }

    function renderCards(data, content) {
      var honor = data.honor_roll || [];
      var needs = data.needs_improvement || [];

      var html = '';
      html += renderSection('Honor Roll', honor, honorSort, 'honor');
      html += renderSection('Needs Improvement', needs, needsSort, 'needs');
      content.innerHTML = html;

      content.querySelectorAll('.rpc-sortable').forEach(function(th) {
        th.addEventListener('click', function() {
          var col = this.getAttribute('data-col');
          var section = this.getAttribute('data-section');
          var s = section === 'honor' ? honorSort : needsSort;
          if (s.col === col) s.asc = !s.asc;
          else { s.col = col; s.asc = false; }
          renderCards(lastData, content);
        });
      });
    }

    function renderSection(title, players, sortState, section) {
      var sorted = sortPlayers(players, sortState);
      var isHonor = section === 'honor';
      var html = '<div class="rpc-section"><div class="rpc-section-title ' + (isHonor ? 'rpc-honor-title' : 'rpc-needs-title') + '">' + title + '</div>';
      html += '<div class="rpc-table-wrap"><table class="rpc-table"><thead><tr>';
      var thCols = [
        { key: 'name', label: 'Player', sort: false },
        { key: 'gpa_pct', label: 'GPA', sort: true },
        { key: 'efficiency_grade', label: 'Eff', sort: true },
        { key: 'consistency_grade', label: 'Con', sort: true },
        { key: 'sos_grade', label: 'SOS', sort: true },
        { key: 'stock_score', label: 'Stock', sort: true },
        { key: 'opp_share', label: 'Opp%', sort: true },
        { key: 'dom_rating', label: 'Dom', sort: true },
        { key: 'ppg', label: 'PPG', sort: true },
        { key: 'age', label: 'Age', sort: true },
        { key: 'games', label: 'GP', sort: true },
        { key: 'annotation', label: 'Note', sort: false }
      ];
      thCols.forEach(function(c) {
        var arrow = '';
        if (c.sort && sortState.col === c.key) arrow = sortState.asc ? ' &#9650;' : ' &#9660;';
        html += '<th' + (c.sort ? ' class="rpc-sortable" data-col="' + c.key + '" data-section="' + section + '"' : '') + '>' + c.label + arrow + '</th>';
      });
      html += '</tr></thead><tbody>';
      sorted.forEach(function(p) {
        var posColor = POS_COLORS[p.position] || '#8a7565';
        html += '<tr>';
        // Player cell
        html += '<td class="rpc-player-cell">';
        if (p.headshot_url) html += '<img class="rpc-headshot" src="' + escapeAttr(p.headshot_url) + '" alt="Player headshot" loading="lazy" onerror="this.onerror=null;this.src=\'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 40 40%22><circle cx=%2220%22 cy=%2220%22 r=%2220%22 fill=%22%23d97757%22/><text x=%2220%22 y=%2225%22 text-anchor=%22middle%22 fill=%22white%22 font-size=%2216%22>?</text></svg>\'">';
        html += '<span class="rpc-name">' + escapeHtml(p.full_name || p.name || '') + '</span>';
        html += '<span class="rpc-pos" style="background:' + posColor + '">' + escapeHtml(p.position || '') + '</span>';
        html += '<span class="rpc-team">' + escapeHtml(p.team || '') + '</span>';
        html += '</td>';
        // GPA
        html += '<td><span class="rpc-grade-badge ' + gradeClass(p.gpa_grade || p.grade) + '">' + escapeHtml(p.gpa_grade || p.grade || fmt(p.gpa)) + '</span></td>';
        // Eff/Con/SOS
        var _eg = p.efficiency_grade, _cg = p.consistency_grade, _sg = p.sos_grade;
        html += '<td>' + (_eg ? '<span class="rpc-grade-badge ' + gradeClass(_eg) + '">' + escapeHtml(_eg) + '</span>' : '<span class="rpc-grade-badge" style="opacity:0.5">-</span>') + '</td>';
        html += '<td>' + (_cg ? '<span class="rpc-grade-badge ' + gradeClass(_cg) + '">' + escapeHtml(_cg) + '</span>' : '<span class="rpc-grade-badge" style="opacity:0.5">-</span>') + '</td>';
        html += '<td>' + (_sg ? '<span class="rpc-grade-badge ' + gradeClass(_sg) + '">' + escapeHtml(_sg) + '</span>' : '<span class="rpc-grade-badge" style="opacity:0.5">-</span>') + '</td>';
        // Stock
        html += '<td><span class="rpc-grade-badge ' + stockClass(p.stock_score || 0) + '">' + fmt(p.stock_score, 0) + '</span></td>';
        // Opp% / Dom
        html += '<td class="rpc-num">' + fmt(p.opp_share) + '%</td>';
        html += '<td class="rpc-num">' + fmt(p.dom_rating) + '%</td>';
        // PPG / Age / GP
        html += '<td class="rpc-num">' + fmt(p.ppg) + '</td>';
        html += '<td class="rpc-num">' + (p.age != null ? p.age : '-') + '</td>';
        html += '<td class="rpc-num">' + (p.games != null ? p.games : '-') + '</td>';
        html += '<td class="rpc-annotation">' + escapeHtml(p.annotation || '') + '</td>';
        html += '</tr>';
      });
      html += '</tbody></table></div></div>';
      return html;
    }

    el.querySelector('#rpc-pos-tabs').addEventListener('click', function(e) {
      var tab = e.target.closest('.lp-pos-tab');
      if (!tab) return;
      el.querySelectorAll('#rpc-pos-tabs .lp-pos-tab').forEach(function(t) { t.classList.remove('active'); });
      tab.classList.add('active');
      curPos = tab.getAttribute('data-pos') || '';
      loadData();
    });
    el.querySelector('#rpc-season').addEventListener('change', function() {
      curSeason = parseInt(this.value) || _latestSeason;
      populateWeekSelect(el, 'rpc-week', this.value, loadData);
      loadData();
    });
    populateWeekSelect(el, 'rpc-week', String(_latestSeason), loadData);
    loadData();
  }});

  // ─── 42. FPTS BREAKDOWN ─────────────────────────────────────────
  defs.push({ name: 'fptsbreakdown', render: function(el) {
    var curPos = '';
    var curSeason = _latestSeason;
    var compColors = { pass_yd: POS_COLORS.QB, rush_yd: POS_COLORS.RB, rec_yd: POS_COLORS.WR, rec: POS_COLORS.TE, td: '#e63946' };
    var compLabels = { pass_yd: 'Pass Yd', rush_yd: 'Rush Yd', rec_yd: 'Rec Yd', rec: 'Receptions', td: 'Touchdowns' };

    el.innerHTML =
      '<div class="lp-page">' +
        '<div class="lp-header"><h2>Points Breakdown</h2>' +
        '<div class="lp-subtitle">where do fantasy points come from?</div></div>' +
        '<div class="lp-controls">' +
          posTabsHTML('fpb-pos-tabs', true) +
          '<select class="lp-select" id="fpb-season">' + seasonOptions() + '</select>' +
        '</div>' +
        '<div id="fpb-content"><div class="lp-loading">' + razzleLoading() + '</div></div>' +
      '</div>';

    function loadData() {
      var content = el.querySelector('#fpb-content');
      content.innerHTML = '<div class="lp-loading">' + razzleLoading() + '</div>';
      var url = '/api/fpts-breakdown?season=' + curSeason;
      if (curPos) url += '&position=' + encodeURIComponent(curPos);
      fetch(url, { signal: _panelSignal() }).then(function(r) {
        if (!r.ok) throw new Error('API error');
        return r.json();
      }).then(function(data) {
        renderBreakdown(data.players || data, content);
      }).catch(function() {
        content.innerHTML = '<div class="panel-error">' + razzleError() + '<br><button onclick="location.reload()">retry</button></div>';
      });
    }

    function renderBreakdown(players, content) {
      if (!players || !players.length) { content.innerHTML = '<div class="panel-empty">' + razzleEmpty() + '<span class="hint">try a different position or season</span></div>'; return; }

      // Legend
      var html = '<div class="fpb-legend">';
      Object.keys(compColors).forEach(function(k) {
        html += '<span class="fpb-legend-item"><span class="fpb-legend-dot" style="background:' + compColors[k] + '"></span>' + compLabels[k] + '</span>';
      });
      html += '</div>';

      html += '<div class="fpb-card">';
      players.forEach(function(p, i) {
        var posColor = POS_COLORS[p.position] || '#8a7565';
        var total = (p.pass_yd_pts || 0) + (p.rush_yd_pts || 0) + (p.rec_yd_pts || 0) + (p.rec_pts || 0) + (p.td_pts || 0);
        if (total <= 0) total = p.ppg || 1;

        html += '<div class="fpb-row">';
        html += '<div class="fpb-rank">' + (i + 1) + '</div>';
        html += '<div class="fpb-player">';
        html += '<span class="fpb-name">' + escapeHtml(p.full_name || p.name || '') + '</span>';
        html += '<span class="fpb-team">' + escapeHtml(p.team || '') + '</span>';
        html += '<span class="fpb-pos" style="background:' + posColor + '">' + escapeHtml(p.position || '') + '</span>';
        html += '</div>';
        html += '<div class="fpb-ppg">' + fmt(p.ppg) + '</div>';
        html += '<div class="fpb-bar">';

        var components = [
          { key: 'pass_yd_pts', color: compColors.pass_yd },
          { key: 'rush_yd_pts', color: compColors.rush_yd },
          { key: 'rec_yd_pts', color: compColors.rec_yd },
          { key: 'rec_pts', color: compColors.rec },
          { key: 'td_pts', color: compColors.td }
        ];
        components.forEach(function(c) {
          var val = p[c.key] || 0;
          var pct = total > 0 ? (val / total) * 100 : 0;
          if (pct > 0) {
            html += '<div class="fpb-segment" style="width:' + pct + '%;background:' + c.color + '">';
            if (pct >= 10) html += '<span class="fpb-seg-label">' + fmt(pct, 0) + '%</span>';
            html += '</div>';
          }
        });
        html += '</div></div>';
      });
      html += '</div>';
      content.innerHTML = html;
    }

    el.querySelector('#fpb-pos-tabs').addEventListener('click', function(e) {
      var tab = e.target.closest('.lp-pos-tab');
      if (!tab) return;
      el.querySelectorAll('#fpb-pos-tabs .lp-pos-tab').forEach(function(t) { t.classList.remove('active'); });
      tab.classList.add('active');
      curPos = tab.getAttribute('data-pos') || '';
      loadData();
    });
    el.querySelector('#fpb-season').addEventListener('change', function() { curSeason = parseInt(this.value) || _latestSeason; loadData(); });
    loadData();
  }});

  // ─── 43. GAME LOG ───────────────────────────────────────────────
  defs.push({ name: 'gamelog', render: function(el) {
    var curSeason = _latestSeason;
    var curPlayer = null;
    var sortCol = 'week';
    var sortAsc = true;

    el.innerHTML =
      '<div class="lp-page">' +
        '<div class="lp-header"><h2>Game Log</h2>' +
        '<div class="lp-subtitle">week-by-week performance</div></div>' +
        '<div class="lp-controls">' +
          searchWrapHTML('glo-', 'search player...') +
          '<select class="lp-select" id="glo-season">' + seasonOptions() + '</select>' +
        '</div>' +
        '<div id="glo-content"><div class="panel-empty">search for a player to view game log</div></div>' +
      '</div>';

    buildPlayerSearch(el, 'glo-', 'search player...', function(p) {
      curPlayer = p;
      loadGameLog();
    });
    el.querySelector('#glo-season').addEventListener('change', function() { curSeason = parseInt(this.value) || _latestSeason; if (curPlayer) loadGameLog(); });

    function fptsClass(v) {
      if (v >= 30) return 'glo-elite';
      if (v >= 20) return 'glo-great';
      if (v >= 10) return 'glo-ok';
      return 'glo-bad';
    }

    function loadGameLog() {
      if (!curPlayer) return;
      var content = el.querySelector('#glo-content');
      content.innerHTML = '<div class="lp-loading">' + razzleLoading() + '</div>';
      fetch('/api/game-log?player_id=' + encodeURIComponent(curPlayer.player_id) + '&season=' + curSeason, { signal: _panelSignal() }).then(function(r) {
        if (!r.ok) throw new Error('API error');
        return r.json();
      }).then(function(data) {
        renderGameLog(data, content);
      }).catch(function() {
        content.innerHTML = '<div class="panel-error">' + razzleError() + '<br><button onclick="location.reload()">retry</button></div>';
      });
    }

    function renderGameLog(data, content) {
      var p = data.player || curPlayer;
      var games = data.games || data.weeks || [];
      var pos = p.position || curPlayer.position || '';
      var posColor = POS_COLORS[pos] || '#8a7565';
      var totalPts = 0, gp = games.length;
      games.forEach(function(g) { totalPts += (g.fantasy_points || g.fpts || 0); });

      var html = '<div class="glo-player-card">';
      html += playerHeadshot(p, pos);
      html += '<div class="glo-player-info">';
      html += '<span class="glo-player-name">' + escapeHtml(p.full_name || p.name || curPlayer.full_name) + '</span>';
      html += '<span class="glo-pos" style="background:' + posColor + '">' + escapeHtml(pos) + '</span>';
      html += '<span class="glo-team">' + escapeHtml(p.team || curPlayer.team || '') + '</span>';
      html += '</div>';
      html += '<div class="glo-summary">';
      html += '<span class="glo-chip">' + gp + ' G</span>';
      html += '<span class="glo-chip">' + fmt(totalPts, 0) + ' pts</span>';
      html += '<span class="glo-chip">' + fmt(gp > 0 ? totalPts / gp : 0) + ' PPG</span>';
      html += '</div></div>';

      // Sort games
      games.sort(function(a, b) {
        var va = a[sortCol] !== undefined ? a[sortCol] : 0;
        var vb = b[sortCol] !== undefined ? b[sortCol] : 0;
        return sortAsc ? va - vb : vb - va;
      });

      // Build columns based on position
      var colDefs = [{ key: 'week', label: 'Wk' }, { key: 'opponent', label: 'Opp' }];
      if (pos === 'QB') {
        colDefs = colDefs.concat([
          { key: 'passing_yards', label: 'Pass Yd' }, { key: 'passing_tds', label: 'Pass TD' }, { key: 'interceptions', label: 'INT' },
          { key: 'rushing_yards', label: 'Rush Yd' }, { key: 'rushing_tds', label: 'Rush TD' }, { key: 'carries', label: 'Car' }
        ]);
      } else if (pos === 'RB') {
        colDefs = colDefs.concat([
          { key: 'rushing_yards', label: 'Rush Yd' }, { key: 'rushing_tds', label: 'Rush TD' }, { key: 'carries', label: 'Car' },
          { key: 'receptions', label: 'Rec' }, { key: 'receiving_yards', label: 'Rec Yd' }, { key: 'targets', label: 'Tgt' }
        ]);
      } else {
        colDefs = colDefs.concat([
          { key: 'receptions', label: 'Rec' }, { key: 'receiving_yards', label: 'Rec Yd' }, { key: 'receiving_tds', label: 'Rec TD' },
          { key: 'targets', label: 'Tgt' }, { key: 'rushing_yards', label: 'Rush Yd' }, { key: 'carries', label: 'Car' }
        ]);
      }
      colDefs.push({ key: 'fantasy_points', label: 'FPTS' });

      html += '<div class="glo-table-wrap"><table class="glo-table"><thead><tr>';
      colDefs.forEach(function(c) {
        var arrow = '';
        if (sortCol === c.key) arrow = sortAsc ? ' &#9650;' : ' &#9660;';
        html += '<th class="glo-sortable" data-col="' + c.key + '">' + c.label + arrow + '</th>';
      });
      html += '</tr></thead><tbody>';

      games.forEach(function(g) {
        html += '<tr>';
        colDefs.forEach(function(c) {
          var v = g[c.key];
          if (c.key === 'fantasy_points' || c.key === 'fpts') {
            var fpts = g.fantasy_points != null ? g.fantasy_points : (g.fpts != null ? g.fpts : 0);
            html += '<td class="glo-num ' + fptsClass(fpts) + '">' + fmt(fpts) + '</td>';
          } else if (c.key === 'opponent') {
            html += '<td>' + escapeHtml(g.opponent || g.opp || '-') + '</td>';
          } else if (c.key === 'week') {
            html += '<td class="glo-num">' + (v != null ? v : '-') + '</td>';
          } else {
            html += '<td class="glo-num">' + fmt(v, (c.key.indexOf('yards') >= 0 ? 0 : 0)) + '</td>';
          }
        });
        html += '</tr>';
      });

      // Totals row
      html += '<tr class="glo-totals"><td>Total</td><td></td>';
      colDefs.slice(2).forEach(function(c) {
        if (c.key === 'fantasy_points' || c.key === 'fpts') {
          html += '<td class="glo-num">' + fmt(totalPts, 0) + '</td>';
        } else {
          var sum = 0;
          games.forEach(function(g) { sum += (g[c.key] || 0); });
          html += '<td class="glo-num">' + fmt(sum, 0) + '</td>';
        }
      });
      html += '</tr></tbody></table></div>';

      content.innerHTML = html;

      content.querySelectorAll('.glo-sortable').forEach(function(th) {
        th.addEventListener('click', function() {
          var col = this.getAttribute('data-col');
          if (sortCol === col) sortAsc = !sortAsc;
          else { sortCol = col; sortAsc = col === 'week'; }
          renderGameLog(data, content);
        });
      });
    }
  }});

  // ─── 44. PLAYER ARCHETYPES ──────────────────────────────────────
  defs.push({ name: 'archetypes', render: function(el) {
    var curPos = '';
    var curSeason = _latestSeason;
    var iconMap = {
      workhorse: '\u{1F3CB}', alpha_target: '\u{1F451}', deep_threat: '\u{1F680}', slot_machine: '\u{1F3B0}',
      dual_threat: '\u26A1', pocket_passer: '\u{1F3AF}', mobile_qb: '\u{1F3C3}', receiving_back: '\u{1F3C8}',
      goal_line: '\u{1F6A9}', possession: '\u{1F91D}', yac_monster: '\u{1F4A8}', volume: '\u{1F4E6}',
      td_dependent: '\u{1F3C6}', scheme: '\u2699\uFE0F', athletic: '\u{1F4AA}', red_zone: '\u{1F534}',
      elite: '\u2B50', default: '\u{1F4CA}'
    };

    el.innerHTML =
      '<div class="lp-page">' +
        '<div class="lp-header"><h2>Player Archetypes</h2>' +
        '<div class="lp-subtitle">how players are built to score</div></div>' +
        '<div class="lp-controls">' +
          posTabsHTML('arc-pos-tabs', true) +
          '<select class="lp-select" id="arc-season">' + seasonOptions() + '</select>' +
        '</div>' +
        '<div id="arc-content"><div class="lp-loading">' + razzleLoading() + '</div></div>' +
      '</div>';

    function getIcon(archetype) {
      var key = (archetype || '').toLowerCase().replace(/[\s-]/g, '_');
      for (var k in iconMap) {
        if (key.indexOf(k) >= 0) return iconMap[k];
      }
      return iconMap['default'];
    }

    function loadData() {
      var content = el.querySelector('#arc-content');
      content.innerHTML = '<div class="lp-loading">' + razzleLoading() + '</div>';
      var url = '/api/player-archetypes?season=' + curSeason;
      if (curPos) url += '&position=' + encodeURIComponent(curPos);
      fetch(url, { signal: _panelSignal() }).then(function(r) {
        if (!r.ok) throw new Error('API error');
        return r.json();
      }).then(function(data) {
        renderArchetypes(data.archetypes || data, content);
      }).catch(function() {
        content.innerHTML = '<div class="panel-error">' + razzleError() + '<br><button onclick="location.reload()">retry</button></div>';
      });
    }

    function renderArchetypes(archetypes, content) {
      if (!archetypes || !archetypes.length) { content.innerHTML = '<div class="panel-empty">' + razzleEmpty() + '<span class="hint">try a different position or season</span></div>'; return; }
      var html = '<div class="arc-grid">';
      archetypes.forEach(function(arch) {
        var archPlayers = arch.players || [];
        var posColor = POS_COLORS[arch.position] || '#8a7565';
        html += '<div class="arc-card">';
        html += '<div class="arc-card-header">';
        html += '<span class="arc-icon">' + getIcon(arch.name || arch.archetype) + '</span>';
        html += '<div class="arc-card-title">';
        html += '<div class="arc-name">' + escapeHtml(arch.name || arch.archetype || '') + '</div>';
        html += '<div class="arc-desc">' + escapeHtml(arch.description || '') + '</div>';
        html += '</div>';
        html += '<span class="arc-pos-badge" style="background:' + posColor + '">' + escapeHtml(arch.position || '') + '</span>';
        html += '<span class="arc-count">' + archPlayers.length + '</span>';
        html += '</div>';
        html += '<div class="arc-players">';
        archPlayers.forEach(function(p) {
          var pPosColor = POS_COLORS[p.position] || posColor;
          html += '<div class="arc-player">';
          html += '<span class="arc-player-pos" style="background:' + pPosColor + '">' + escapeHtml(p.position || '') + '</span>';
          html += '<span class="arc-player-name">' + escapeHtml(p.full_name || p.name || '') + '</span>';
          html += '<span class="arc-player-team">' + escapeHtml(p.team || '') + '</span>';
          if (p.age) html += '<span class="arc-player-age">Age ' + escapeHtml(String(p.age)) + '</span>';
          html += '<span class="arc-player-ppg">' + fmt(p.ppg) + ' ppg</span>';
          if (p.key_stat) html += '<span class="arc-player-stat">' + escapeHtml(p.key_stat) + '</span>';
          html += '</div>';
        });
        html += '</div></div>';
      });
      html += '</div>';
      content.innerHTML = html;
    }

    el.querySelector('#arc-pos-tabs').addEventListener('click', function(e) {
      var tab = e.target.closest('.lp-pos-tab');
      if (!tab) return;
      el.querySelectorAll('#arc-pos-tabs .lp-pos-tab').forEach(function(t) { t.classList.remove('active'); });
      tab.classList.add('active');
      curPos = tab.getAttribute('data-pos') || '';
      loadData();
    });
    el.querySelector('#arc-season').addEventListener('change', function() { curSeason = parseInt(this.value) || _latestSeason; loadData(); });
    loadData();
  }});

  // ─── 45. POINTS BREAKDOWN (DONUT) ──────────────────────────────
  defs.push({ name: 'breakdown', render: function(el) {
    var curSeason = _latestSeason;

    el.innerHTML =
      '<div class="lp-page">' +
        '<div class="lp-header"><h2>Scoring Breakdown</h2>' +
        '<div class="lp-subtitle">where do their points come from?</div></div>' +
        '<div class="lp-controls">' +
          searchWrapHTML('pbd-', 'search player...') +
          '<select class="lp-select" id="pbd-season">' + seasonOptions() + '</select>' +
        '</div>' +
        '<div id="pbd-content"><div class="panel-empty">search for a player to see scoring breakdown</div></div>' +
      '</div>';

    buildPlayerSearch(el, 'pbd-', 'search player...', function(p) {
      loadBreakdown(p.player_id, p);
    });
    el.querySelector('#pbd-season').addEventListener('change', function() { curSeason = parseInt(this.value) || _latestSeason; });

    var compColors = ['#5b7fff', '#2ec4b6', '#d97757', '#8b5cf6', '#e63946', '#ffc857', '#2ec4b6', '#d97757'];

    function loadBreakdown(pid, playerInfo) {
      var content = el.querySelector('#pbd-content');
      content.innerHTML = '<div class="lp-loading">' + razzleLoading() + '</div>';
      fetch('/api/points-breakdown?player_id=' + encodeURIComponent(pid) + '&season=' + curSeason, { signal: _panelSignal() }).then(function(r) {
        if (!r.ok) throw new Error('API error');
        return r.json();
      }).then(function(data) {
        renderBreakdown(data, playerInfo, content);
      }).catch(function() {
        content.innerHTML = '<div class="panel-error">' + razzleError() + '<br><button onclick="location.reload()">retry</button></div>';
      });
    }

    function renderBreakdown(data, playerInfo, content) {
      var p = data.player || playerInfo || {};
      var components = data.components || data.breakdown || [];
      var pos = p.position || playerInfo.position || '';
      var posColor = POS_COLORS[pos] || '#8a7565';
      var gp = p.games || p.games_played || 1;
      var totalPts = p.total_points || p.fantasy_points || 0;
      var ppg = gp > 0 ? totalPts / gp : (p.ppg || 0);

      var html = '<div class="pbd-player-card">';
      html += playerHeadshot(p, pos);
      html += '<div class="pbd-player-info">';
      html += '<span class="pbd-player-name">' + escapeHtml(p.full_name || p.name || playerInfo.full_name || '') + '</span>';
      html += '<span class="pbd-pos" style="background:' + posColor + '">' + escapeHtml(pos) + '</span>';
      html += '<span class="pbd-team">' + escapeHtml(p.team || playerInfo.team || '') + '</span>';
      html += '</div>';
      html += '<div class="pbd-summary">';
      html += '<span class="pbd-chip">' + gp + ' G</span>';
      html += '<span class="pbd-chip">' + fmt(totalPts, 0) + ' pts</span>';
      html += '<span class="pbd-chip">' + fmt(ppg) + ' PPG</span>';
      html += '</div></div>';

      // Canvas donut + legend
      html += '<div class="pbd-chart-area">';
      html += '<canvas id="pbd-canvas" width="280" height="280" role="img" aria-label="Points breakdown donut chart"></canvas>';
      html += '<div class="pbd-legend">';
      var total = 0;
      components.forEach(function(c) { total += Math.abs(c.points || c.value || 0); });
      components.forEach(function(c, i) {
        var color = compColors[i % compColors.length];
        var val = c.points || c.value || 0;
        var pct = total > 0 ? (val / total) * 100 : 0;
        html += '<div class="pbd-legend-item"><span class="pbd-legend-dot" style="background:' + color + '"></span>';
        html += '<span class="pbd-legend-label">' + escapeHtml(c.label || c.category || '') + '</span>';
        html += '<span class="pbd-legend-val">' + fmt(val) + ' (' + fmt(pct, 0) + '%)</span>';
        html += '</div>';
      });
      html += '</div></div>';

      // Detail cards
      html += '<div class="pbd-details">';
      components.forEach(function(c, i) {
        var color = compColors[i % compColors.length];
        html += '<div class="pbd-detail-card" style="border-left:4px solid ' + color + '">';
        html += '<div class="pbd-detail-label">' + escapeHtml(c.label || c.category || '') + '</div>';
        html += '<div class="pbd-detail-pts">' + fmt(c.points || c.value || 0) + ' pts</div>';
        if (c.raw_stat !== undefined) html += '<div class="pbd-detail-raw">' + fmt(c.raw_stat, c.raw_stat % 1 === 0 ? 0 : 1) + ' ' + escapeHtml(c.raw_label || '') + '</div>';
        html += '</div>';
      });
      html += '</div>';

      content.innerHTML = html;

      // Draw donut
      var canvas = el.querySelector('#pbd-canvas');
      if (canvas && components.length > 0) {
        var ctx = canvas.getContext('2d');
        var t = getCanvasTheme();
        var cx = 140, cy = 140, outerR = 120, innerR = 72;
        ctx.clearRect(0, 0, 280, 280);

        var angle = -Math.PI / 2;
        components.forEach(function(c, i) {
          var val = Math.abs(c.points || c.value || 0);
          var sweep = total > 0 ? (val / total) * Math.PI * 2 : 0;
          if (sweep <= 0) return;
          var color = compColors[i % compColors.length];

          ctx.beginPath();
          ctx.arc(cx, cy, outerR, angle, angle + sweep);
          ctx.arc(cx, cy, innerR, angle + sweep, angle, true);
          ctx.closePath();
          ctx.fillStyle = color;
          ctx.fill();

          // Border between slices
          ctx.strokeStyle = t.bg;
          ctx.lineWidth = 2;
          ctx.stroke();

          // Label if >= 8%
          var pct = total > 0 ? (val / total) * 100 : 0;
          if (pct >= 8) {
            var midAngle = angle + sweep / 2;
            var labelR = (outerR + innerR) / 2;
            var lx = cx + Math.cos(midAngle) * labelR;
            var ly = cy + Math.sin(midAngle) * labelR;
            ctx.fillStyle = (typeof getCanvasTheme === 'function' ? getCanvasTheme().white : '#fff');
            ctx.font = 'bold 11px "Space Mono", monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(fmt(pct, 0) + '%', lx, ly);
          }

          angle += sweep;
        });

        // Center label
        ctx.fillStyle = t.ink;
        ctx.font = 'bold 24px "Space Mono", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(fmt(ppg), cx, cy - 8);
        ctx.font = '12px "Space Mono", monospace';
        ctx.fillStyle = t.inkLight;
        ctx.fillText('PPG', cx, cy + 12);
      }
    }
  }});

  // ─── AWARDS ──────────────────────────────────────────────────
  defs.push({ name: 'awards', render: function(el) {
    var awCollege = typeof state !== 'undefined' && state.universe === 'college';
    var awState = { position: '', season: 0, data: null };

    var TROPHY_MAP = {
      mvp: '&#x1F3C6;', most_efficient: '&#x26A1;', iron_man: '&#x1F6E1;',
      schedule_survivor: '&#x1F525;', volume_king: '&#x1F451;', breakout_star: '&#x1F31F;',
      rising_stock: '&#x1F4C8;', dominator: '&#x1F43E;', redzone_king: '&#x1F3AF;',
      best_floor: '&#x1F9F1;'
    };

    function gradeClass(grade) {
      if (!grade) return 'avg';
      if (grade === 'A+' || grade === 'A') return 'elite';
      if (grade === 'B+' || grade === 'B') return 'good';
      if (grade === 'C+' || grade === 'C') return 'avg';
      if (grade === 'D') return 'below';
      return 'poor';
    }

    function buildAwardCard(award, isCollege) {
      var w = award.winner;
      if (!w) return '';
      var pos = (w.position || 'RB').toLowerCase();
      var trophy = TROPHY_MAP[award.key] || '&#x1F3C6;';
      var html = '<div class="aw2-card">';
      html += '<div class="aw2-card-header"><span class="aw2-trophy">' + trophy + '</span><div>';
      html += '<div class="aw2-card-title">' + escapeHtml(award.name) + '</div>';
      html += '<div class="aw2-card-desc">' + escapeHtml(award.description) + '</div>';
      html += '</div></div>';
      html += '<div class="aw2-winner" data-pid="' + escapeAttr(w.player_id) + '">';
      if (!isCollege && w.headshot_url) {
        html += '<img class="aw2-winner-headshot" src="' + escapeAttr(w.headshot_url) + '" alt="Player headshot" loading="lazy" onerror="this.onerror=null;this.src=\'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 40 40%22><circle cx=%2220%22 cy=%2220%22 r=%2220%22 fill=%22%23d97757%22/><text x=%2220%22 y=%2225%22 text-anchor=%22middle%22 fill=%22white%22 font-size=%2216%22>?</text></svg>\'">';
      }
      html += '<div class="aw2-winner-info">';
      html += '<div class="aw2-winner-name">' + escapeHtml(w.name) + '</div>';
      html += '<div class="aw2-winner-meta">';
      html += '<span class="aw2-pos-badge ' + pos + '">' + escapeHtml(w.position) + '</span>';
      html += '<span>' + escapeHtml(w.team) + '</span>';
      if (isCollege && w.conference) html += '<span style="font-size:11px;color:var(--ink-light)">' + escapeHtml(w.conference) + '</span>';
      html += '<span>' + escapeHtml(String(w.ppg)) + ' PPG</span>';
      html += '</div>';
      if (!isCollege) {
        html += '<div class="aw2-winner-grades">';
        html += '<span class="aw2-grade ' + gradeClass(w.gpa_grade) + '">GPA ' + escapeHtml(w.gpa_grade || '') + '</span>';
        html += '<span class="aw2-grade ' + gradeClass(w.efficiency_grade) + '">Eff ' + escapeHtml(w.efficiency_grade || '') + '</span>';
        html += '<span class="aw2-grade ' + gradeClass(w.consistency_grade) + '">Con ' + escapeHtml(w.consistency_grade || '') + '</span>';
        html += '</div>';
      } else {
        html += '<div class="aw2-winner-grades">';
        if (w.tds !== undefined) html += '<span class="aw2-grade good">' + w.tds + ' TDs</span>';
        if (w.ppo) html += '<span class="aw2-grade elite">' + w.ppo + ' PPO</span>';
        html += '<span class="aw2-grade avg">' + w.games + ' G</span>';
        html += '</div>';
      }
      if (award.annotation) {
        html += '<div class="aw2-annotation">' + escapeHtml(award.annotation) + '</div>';
      }
      html += '</div>';
      if (!isCollege && w.key_stat) {
        html += '<div class="aw2-winner-stat"><div class="aw2-stat-value">' + escapeHtml(w.key_stat) + '</div>';
        html += '<div class="aw2-stat-label">' + escapeHtml(award.stat_label || '') + '</div></div>';
      }
      html += '</div>';
      if (award.runners_up && award.runners_up.length) {
        html += '<div class="aw2-runners"><div class="aw2-runners-title">Runners Up</div>';
        award.runners_up.forEach(function(r, i) {
          var rPos = (r.position || 'RB').toLowerCase();
          html += '<div class="aw2-runner-row" data-pid="' + escapeAttr(r.player_id) + '">';
          html += '<span class="aw2-runner-rank">' + (i + 2) + '</span>';
          if (!isCollege && r.headshot_url) {
            html += '<img class="aw2-runner-headshot" src="' + escapeAttr(r.headshot_url) + '" alt="Player headshot" loading="lazy" onerror="this.onerror=null;this.src=\'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 40 40%22><circle cx=%2220%22 cy=%2220%22 r=%2220%22 fill=%22%23d97757%22/><text x=%2220%22 y=%2225%22 text-anchor=%22middle%22 fill=%22white%22 font-size=%2216%22>?</text></svg>\'">';
          }
          html += '<span class="aw2-runner-pos ' + rPos + '">' + escapeHtml(r.position) + '</span>';
          html += '<span class="aw2-runner-name">' + escapeHtml(r.name) + '</span>';
          if (isCollege && r.team) html += '<span style="font-size:11px;color:var(--ink-light)">' + escapeHtml(r.team) + '</span>';
          html += '<span class="aw2-runner-stat">' + escapeHtml(isCollege ? String(r.ppg != null ? r.ppg : '') + ' PPG' : (r.key_stat || '')) + '</span>';
          html += '</div>';
        });
        html += '</div>';
      }
      html += '</div>';
      return html;
    }

    el.innerHTML =
      '<div class="lp-page">' +
        '<div class="lp-header"><h2>' + (awCollege ? 'College Superlatives' : 'Season Superlatives') + '</h2>' +
        '<div class="lp-subtitle">' + (awCollege ? 'the college hardware that matters' : 'the hardware that matters') + '</div></div>' +
        '<div class="lp-controls">' +
          '<select class="lp-select aw2-season">' + seasonOptions() + '</select>' +
          posTabsHTML('aw2-pos-tabs', true) +
        '</div>' +
        '<div class="aw2-content"><div class="lp-loading">tallying the votes...</div></div>' +
      '</div>';

    function load() {
      var content = el.querySelector('.aw2-content');
      var isCollege = typeof state !== 'undefined' && state.universe === 'college';
      content.innerHTML = '<div class="lp-loading">tallying the ' + (isCollege ? 'college ' : '') + 'votes...</div>';
      var url = isCollege ? '/api/college/season-awards?' : '/api/season-awards?';
      var params = [];
      if (awState.position) params.push('position=' + encodeURIComponent(awState.position));
      if (awState.season) params.push('season=' + encodeURIComponent(awState.season));
      url += params.join('&');

      fetch(url, { signal: _panelSignal() }).then(function(r) {
        if (!r.ok) throw new Error('API error');
        return r.json();
      }).then(function(data) {
        awState.data = data;
        if (data.available_seasons && data.available_seasons.length) {
          var sel = el.querySelector('.aw2-season');
          sel.innerHTML = '';
          var _opts = '';
          (data.available_seasons || []).forEach(function(s) {
            _opts += '<option value="' + escapeHtml(String(s)) + '"' + (s === data.season ? ' selected' : '') + '>' + escapeHtml(String(s)) + '</option>';
          });
          sel.innerHTML = _opts;
        }
        renderAwards(data, isCollege);
      }).catch(function() {
        content.innerHTML = '<div class="panel-error">' + razzleError() + '<br><button onclick="location.reload()">retry</button></div>';
      });
    }

    function renderAwards(data, isCollege) {
      var content = el.querySelector('.aw2-content');
      if (!data || !data.awards || !data.awards.length) {
        content.innerHTML = '<div class="panel-empty">' + razzleEmpty() + '<span class="hint">try a different position or season</span></div>';
        return;
      }
      var html = '<div class="aw2-grid">';
      data.awards.forEach(function(award) { html += buildAwardCard(award, isCollege); });
      html += '</div>';
      content.innerHTML = html;
      if (!isCollege) {
        content.querySelectorAll('[data-pid]').forEach(function(el2) {
          el2.style.cursor = 'pointer';
          el2.addEventListener('click', function() {
            var pid = this.getAttribute('data-pid');
            if (pid) if (typeof openPlayerPopup === 'function') openPlayerPopup(pid); else window.location.href = '/player/' + encodeURIComponent(pid);
          });
        });
      }
    }

    el.querySelector('#aw2-pos-tabs').addEventListener('click', function(e) {
      var tab = e.target.closest('.lp-pos-tab');
      if (!tab) return;
      el.querySelectorAll('#aw2-pos-tabs .lp-pos-tab').forEach(function(t) { t.classList.remove('active'); });
      tab.classList.add('active');
      awState.position = tab.getAttribute('data-pos') || '';
      load();
    });

    el.querySelector('.aw2-season').addEventListener('change', function() {
      awState.season = parseInt(this.value, 10) || 0;
      load();
    });

    load();
  }});

  // ─── DASHBOARD ───────────────────────────────────────────────
  defs.push({ name: 'dashboard', render: function(el) {
    if (showNflOnlyMsg(el, 'dashboard', 'Dynasty Dashboard', 'at-a-glance dynasty overview')) return;
    var state = { season: 0 };

    el.innerHTML =
      '<div class="lp-page">' +
        '<div class="lp-header"><h2>Dynasty Dashboard</h2>' +
        '<div class="lp-subtitle">at-a-glance overview</div>' +
        '<div class="lp-meta db2-meta"></div></div>' +
        '<div class="lp-controls">' +
          '<select class="lp-select db2-season">' + seasonOptions() + '</select>' +
        '</div>' +
        '<div class="db2-top5"></div>' +
        '<div class="db2-trends"></div>' +
        '<div class="db2-grid"></div>' +
        '<div class="db2-scarcity"></div>' +
      '</div>';

    function playerRow(p, i, chipType, chipText) {
      var html = '<div class="db2-row" data-pid="' + escapeAttr(p.player_id) + '">';
      html += '<span class="db2-row-rank">' + (i + 1) + '</span>';
      html += '<span class="db2-pos ' + escapeHtml(p.position) + '">' + escapeHtml(p.position) + '</span>';
      html += '<span class="db2-row-name">' + escapeHtml(p.full_name) + '</span>';
      html += '<span class="db2-row-team">' + escapeHtml(p.team) + '</span>';
      html += '<span class="db2-chip ppg">' + escapeHtml(String(p.ppg)) + ' PPG</span>';
      html += '<span class="db2-chip ' + chipType + '">' + chipText + '</span>';
      html += '</div>';
      return html;
    }

    function load() {
      el.querySelector('.db2-grid').innerHTML = '<div class="lp-loading">' + razzleLoading() + '</div>';
      var url = '/api/dynasty-dashboard';
      if (state.season > 0) url += '?season=' + state.season;

      fetch(url, { signal: _panelSignal() }).then(function(r) {
        if (!r.ok) throw new Error('API error');
        return r.json();
      }).then(function(d) {
        if (d.available_seasons) {
          var sel = el.querySelector('.db2-season');
          sel.innerHTML = '';
          var _opts = '';
          d.available_seasons.forEach(function(s) {
            _opts += '<option value="' + escapeHtml(String(s)) + '"' + (s === d.season ? ' selected' : '') + '>' + escapeHtml(String(s)) + '</option>';
          });
          sel.innerHTML = _opts;
        }
        el.querySelector('.db2-meta').textContent = d.season + ' season \u00b7 ' + d.total_players + ' players tracked';

        // Top 5
        var t5html = '<div class="db2-top5-row">';
        (d.top5 || []).forEach(function(p, i) {
          t5html += '<div class="db2-top5-card" data-pid="' + escapeAttr(p.player_id) + '"><div class="db2-top5-rank">#' + (i + 1) + '</div>';
          t5html += '<div class="db2-top5-name">' + escapeHtml(p.full_name) + '</div>';
          t5html += '<div class="db2-top5-tv">' + escapeHtml(String(p.trade_value)) + '</div>';
          t5html += '<div class="db2-top5-meta"><span class="db2-pos ' + escapeHtml(p.position) + '">' + escapeHtml(p.position) + '</span> ' + escapeHtml(p.team) + ' &middot; ' + escapeHtml(String(p.ppg)) + ' PPG</div>';
          t5html += '</div>';
        });
        t5html += '</div>';
        el.querySelector('.db2-top5').innerHTML = t5html;

        // Trends
        var trHtml = '<div class="db2-trends-row">';
        ['QB', 'RB', 'WR', 'TE'].forEach(function(pos) {
          var t = (d.trends || {})[pos] || { count: 0, avg_ppg: 0, avg_age: 0, avg_tv: 0 };
          trHtml += '<div class="db2-trend-card"><div class="db2-trend-pos ' + pos + '">' + pos + '</div>';
          trHtml += '<div class="db2-trend-big">' + escapeHtml(String(t.avg_ppg)) + '</div>';
          trHtml += '<div class="db2-trend-stat">avg PPG</div>';
          trHtml += '<div class="db2-trend-stat">' + t.count + ' players &middot; avg age ' + t.avg_age + '</div>';
          trHtml += '</div>';
        });
        trHtml += '</div>';
        el.querySelector('.db2-trends').innerHTML = trHtml;

        // Grid
        var gHtml = '';
        gHtml += '<div class="db2-section"><div class="db2-section-header risers">&#x2197; Rising Stocks</div>';
        (d.risers || []).forEach(function(p, i) { gHtml += playerRow(p, i, 'up', '+' + escapeHtml(String(p.rank_diff))); });
        if (!d.risers || !d.risers.length) gHtml += '<div class="db2-row">' + razzleEmpty() + '</div>';
        gHtml += '</div>';
        gHtml += '<div class="db2-section"><div class="db2-section-header fallers">&#x2198; Falling Stocks</div>';
        (d.fallers || []).forEach(function(p, i) { gHtml += playerRow(p, i, 'down', escapeHtml(String(p.rank_diff))); });
        if (!d.fallers || !d.fallers.length) gHtml += '<div class="db2-row">' + razzleEmpty() + '</div>';
        gHtml += '</div>';
        gHtml += '<div class="db2-section"><div class="db2-section-header value">&#x1F4A1; Value Picks</div>';
        (d.value_picks || []).forEach(function(p, i) { gHtml += playerRow(p, i, 'tv', escapeHtml(String(p.trade_value))); });
        if (!d.value_picks || !d.value_picks.length) gHtml += '<div class="db2-row">' + razzleEmpty() + '</div>';
        gHtml += '</div>';
        el.querySelector('.db2-grid').innerHTML = gHtml;

        // Scarcity
        var scHtml = '<div class="db2-section"><div class="db2-section-header scarcity">&#x26A0; Position Scarcity</div>';
        var scarcity = d.position_scarcity || {};
        var maxDrop = 0;
        ['QB', 'RB', 'WR', 'TE'].forEach(function(pos) { var s = scarcity[pos]; if (s && s.dropoff > maxDrop) maxDrop = s.dropoff; });
        ['QB', 'RB', 'WR', 'TE'].forEach(function(pos) {
          var s = scarcity[pos];
          if (!s) return;
          var pct = maxDrop > 0 ? Math.round((s.dropoff / maxDrop) * 100) : 0;
          scHtml += '<div class="db2-scar-row"><span class="db2-scar-pos ' + pos + '">' + pos + '</span>';
          scHtml += '<div class="db2-scar-bar-wrap"><div class="db2-scar-bar ' + pos + '" style="width:' + pct + '%"></div></div>';
          scHtml += '<span class="db2-scar-info">' + escapeHtml(s.top_player) + ' (' + s.top_ppg + ') &rarr; ' + escapeHtml(s.mid_player) + ' (' + s.mid_ppg + ') = -' + s.dropoff + '</span>';
          scHtml += '</div>';
        });
        scHtml += '</div>';
        el.querySelector('.db2-scarcity').innerHTML = scHtml;
      }).catch(function() {
        el.querySelector('.db2-grid').innerHTML = '<div class="panel-error">' + razzleError() + '<br><button onclick="location.reload()">retry</button></div>';
      });
    }

    el.querySelector('.db2-season').addEventListener('change', function() {
      state.season = parseInt(this.value, 10) || 0;
      load();
    });

    load();
  }});

  // ─── DRAFT CLASS ─────────────────────────────────────────────
  defs.push({ name: 'draftclass', render: function(el) {
    var state = { year: 0, position: '', data: null };
    var sortKey = 'total_ppr';
    var sortAsc = false;

    el.innerHTML =
      '<div class="lp-page">' +
        '<div class="lp-header"><h2>Draft Class Grades</h2>' +
        '<div class="lp-subtitle">who hit and who busted</div></div>' +
        '<div class="lp-controls">' +
          '<select class="lp-select dc2-year"><option value="">pulling seasons...</option></select>' +
          posTabsHTML('dc2-pos-tabs', true) +
        '</div>' +
        '<div class="dc2-content"><div class="lp-loading">' + razzleLoading() + '</div></div>' +
      '</div>';

    function verdictLabel(v) {
      if (v === 'hit') return 'HIT';
      if (v === 'solid') return 'SOLID';
      if (v === 'ok') return 'OK';
      if (v === 'bust') return 'BUST';
      return 'N/A';
    }

    function sortPlayers(arr) {
      var sorted = arr.slice();
      sorted.sort(function(a, b) {
        var va = a[sortKey], vb = b[sortKey];
        if (typeof va === 'string' && typeof vb === 'string') return sortAsc ? va.localeCompare(vb) : vb.localeCompare(va);
        va = va == null ? -Infinity : va;
        vb = vb == null ? -Infinity : vb;
        return sortAsc ? va - vb : vb - va;
      });
      return sorted;
    }

    function load() {
      var content = el.querySelector('.dc2-content');
      content.innerHTML = '<div class="lp-loading">' + razzleLoading() + '</div>';
      var url = '/api/draft-class';
      var p = [];
      if (state.year) p.push('year=' + state.year);
      if (state.position) p.push('position=' + state.position);
      if (p.length) url += '?' + p.join('&');

      fetch(url, { signal: _panelSignal() }).then(function(r) {
        if (!r.ok) throw new Error('fail');
        return r.json();
      }).then(function(d) {
        state.data = d;
        if (d.available_classes) {
          var sel = el.querySelector('.dc2-year');
          sel.innerHTML = '';
          var _opts = '';
          for (var i = 0; i < d.available_classes.length; i++) {
            _opts += '<option value="' + escapeHtml(String(d.available_classes[i])) + '"' + (d.available_classes[i] === d.draft_year ? ' selected' : '') + '>' + escapeHtml(String(d.available_classes[i])) + ' Class</option>';
          }
          sel.innerHTML = _opts;
        }
        state.year = d.draft_year;
        renderData(d);
      }).catch(function() {
        content.innerHTML = '<div class="panel-error">' + razzleError() + '<br><button onclick="location.reload()">retry</button></div>';
      });
    }

    function renderData(d) {
      var s = d.summary || {};
      var content = el.querySelector('.dc2-content');
      var html = '';

      html += '<div class="dc2-summary">';
      html += '<div class="dc2-chip"><div class="dc2-chip-label">Draft Class</div><div class="dc2-chip-value">' + escapeHtml(String(s.draft_year)) + '</div></div>';
      html += '<div class="dc2-chip"><div class="dc2-chip-label">Players</div><div class="dc2-chip-value">' + escapeHtml(String(s.total_players)) + '</div></div>';
      html += '<div class="dc2-chip"><div class="dc2-chip-label">Avg PPG</div><div class="dc2-chip-value">' + escapeHtml(String(s.avg_ppg)) + '</div></div>';
      html += '<div class="dc2-chip"><div class="dc2-chip-label">Hits (15+ PPG)</div><div class="dc2-chip-value green">' + escapeHtml(String(s.hits)) + '</div></div>';
      html += '<div class="dc2-chip"><div class="dc2-chip-label">Busts (&lt;5 PPG)</div><div class="dc2-chip-value red">' + escapeHtml(String(s.busts)) + '</div></div>';
      html += '<div class="dc2-chip"><div class="dc2-chip-label">Hit Rate</div><div class="dc2-chip-value">' + escapeHtml(String(s.hit_rate)) + '%</div></div>';
      html += '</div>';

      if (d.rounds && d.rounds.length > 0) {
        html += '<div class="dc2-chart-wrap"><div class="dc2-chart-title">Average PPG by Round</div>';
        html += '<canvas class="dc2-canvas" role="img" aria-label="Average PPG by draft round bar chart"></canvas></div>';
      }

      html += '<div class="dc2-table-wrap"><table class="dc2-table"><thead><tr>';
      var cols = [
        { key: 'pick', label: 'Pick' }, { key: 'name', label: 'Player' }, { key: 'position', label: 'Pos' },
        { key: 'draft_team', label: 'Drafted' }, { key: 'current_team', label: 'Team' },
        { key: 'games', label: 'G' }, { key: 'ppg', label: 'PPG' }, { key: 'total_ppr', label: 'Total PPR' },
        { key: 'verdict', label: 'Verdict' }
      ];
      for (var ci = 0; ci < cols.length; ci++) {
        var sorted = cols[ci].key === sortKey;
        var arrow = sorted ? (sortAsc ? ' \u25B2' : ' \u25BC') : '';
        html += '<th data-sort="' + cols[ci].key + '"' + (sorted ? ' class="sorted"' : '') + '>' + escapeHtml(cols[ci].label) + '<span class="sort-arrow">' + arrow + '</span></th>';
      }
      html += '</tr></thead><tbody>';

      var players = sortPlayers(d.players);
      for (var pi = 0; pi < players.length; pi++) {
        var p = players[pi];
        html += '<tr data-pid="' + escapeAttr(p.player_id || '') + '">';
        html += '<td>' + escapeHtml(String(p.round)) + '.' + escapeHtml(String(p.pick).padStart(2, '0')) + '</td>';
        html += '<td style="text-align:left;font-weight:700;">' + escapeHtml(p.name) + '</td>';
        html += '<td><span class="dc2-pos-badge ' + escapeHtml(p.position) + '">' + escapeHtml(p.position) + '</span></td>';
        html += '<td>' + escapeHtml(p.draft_team) + '</td>';
        html += '<td>' + escapeHtml(p.current_team) + '</td>';
        html += '<td>' + escapeHtml(String(p.games)) + '</td>';
        html += '<td>' + escapeHtml(String(p.ppg)) + '</td>';
        html += '<td>' + escapeHtml(String(p.total_ppr)) + '</td>';
        html += '<td><span class="dc2-verdict ' + escapeHtml(p.verdict) + '">' + verdictLabel(p.verdict) + '</span></td>';
        html += '</tr>';
      }
      html += '</tbody></table></div>';
      content.innerHTML = html;

      // Sort handlers
      content.querySelectorAll('.dc2-table th[data-sort]').forEach(function(th) {
        th.addEventListener('click', function() {
          var key = this.getAttribute('data-sort');
          if (sortKey === key) sortAsc = !sortAsc;
          else { sortKey = key; sortAsc = false; }
          renderData(state.data);
        });
      });

      // Row clicks
      content.querySelectorAll('.dc2-table tbody tr[data-pid]').forEach(function(row) {
        row.addEventListener('click', function() {
          var pid = this.getAttribute('data-pid');
          if (pid) if (typeof openPlayerPopup === 'function') openPlayerPopup(pid); else window.location.href = '/player/' + encodeURIComponent(pid);
        });
      });

      // Draw chart
      setTimeout(function() { drawRoundChart(d.rounds); }, 50);
    }

    function drawRoundChart(rounds) {
      var canvas = el.querySelector('.dc2-canvas');
      if (!canvas || !rounds || !rounds.length) return;
      var wrap = canvas.parentElement;
      var w = wrap.clientWidth - 20;
      var h = 200;
      var dpr = window.devicePixelRatio || 1;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      var ctx = canvas.getContext('2d');
      ctx.scale(dpr, dpr);

      var maxPpg = 0;
      rounds.forEach(function(r) { if (r.avg_ppg > maxPpg) maxPpg = r.avg_ppg; });
      if (maxPpg === 0) maxPpg = 1;

      var barW = Math.min(60, (w - 40) / rounds.length - 8);
      var left = 40;

      var t = getCanvasTheme();
      ctx.fillStyle = t.bgCard;
      ctx.fillRect(0, 0, w, h);

      rounds.forEach(function(r, i) {
        var barH = (r.avg_ppg / maxPpg) * (h - 50);
        var x = left + i * (barW + 8);
        var y = h - 30 - barH;
        ctx.fillStyle = '#d97757';
        ctx.fillRect(x, y, barW, barH);
        ctx.strokeStyle = t.ink;
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, barW, barH);
        ctx.fillStyle = t.ink;
        ctx.font = 'bold 11px "Space Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('Rd ' + r.round, x + barW / 2, h - 14);
        ctx.fillText((Number(r.avg_ppg) || 0).toFixed(1), x + barW / 2, y - 6);
      });
    }

    el.querySelector('#dc2-pos-tabs').addEventListener('click', function(e) {
      var tab = e.target.closest('.lp-pos-tab');
      if (!tab) return;
      el.querySelectorAll('#dc2-pos-tabs .lp-pos-tab').forEach(function(t) { t.classList.remove('active'); });
      tab.classList.add('active');
      state.position = tab.getAttribute('data-pos') || '';
      load();
    });

    el.querySelector('.dc2-year').addEventListener('change', function() {
      state.year = parseInt(this.value, 10) || 0;
      load();
    });

    load();
  }});

  // ─── EXPLORER ────────────────────────────────────────────────
  defs.push({ name: 'explorer', render: function(el) {
    var expCollege = typeof state !== 'undefined' && state.universe === 'college';
    var NFL_METRIC_LABELS = {
      ppg: 'PPG', targets_g: 'Targets/G', receptions_g: 'Rec/G', rec_yards_g: 'Rec Yards/G',
      rush_yards_g: 'Rush Yards/G', carries_g: 'Carries/G', air_yards_g: 'Air Yards/G',
      tds: 'Total TDs', age: 'Age', snap_pct: 'Snap %', adot: 'aDOT',
      catch_rate: 'Catch Rate %', racr: 'RACR', target_share: 'Target Share',
      air_yards_share: 'Air Yards Share', wopr: 'WOPR', games: 'Games'
    };
    var COLLEGE_METRIC_LABELS = {
      ppg: 'PPG', total_ypg: 'Total YPG', rush_ypg: 'Rush YPG',
      rec_ypg: 'Rec YPG', pass_ypg: 'Pass YPG', tds: 'Total TDs',
      tds_per_game: 'TDs/Game', carries_g: 'Carries/G', targets_g: 'Targets/G',
      receptions_g: 'Rec/G', yards_per_carry: 'Yards/Carry',
      yards_per_rec: 'Yards/Rec', catch_rate: 'Catch Rate %',
      games: 'Games', opportunities_g: 'Opps/G'
    };
    var METRIC_LABELS = expCollege ? COLLEGE_METRIC_LABELS : NFL_METRIC_LABELS;
    var MARGIN = { top: 20, right: 30, bottom: 50, left: 60 };
    var currentData = null;
    var hoveredPlayer = null;
    var chartCanvas = null;
    var plotPoints = [];

    var defaultX = expCollege ? 'total_ypg' : 'targets_g';
    var defaultY = 'ppg';
    var metricOpts = '';
    var mkeys = Object.keys(METRIC_LABELS);
    for (var mi = 0; mi < mkeys.length; mi++) {
      var mk = mkeys[mi];
      metricOpts += '<option value="' + mk + '"' + (mk === defaultX ? ' selected' : '') + '>' + escapeHtml(METRIC_LABELS[mk]) + '</option>';
    }
    var yOpts = '';
    for (var yi = 0; yi < mkeys.length; yi++) {
      var yk = mkeys[yi];
      yOpts += '<option value="' + yk + '"' + (yk === defaultY ? ' selected' : '') + '>' + escapeHtml(METRIC_LABELS[yk]) + '</option>';
    }

    el.innerHTML =
      '<div class="lp-page">' +
        '<div class="lp-header"><h2>' + (expCollege ? 'College Stat Explorer' : 'Stat Explorer') + '</h2>' +
        '<div class="lp-subtitle">' + (expCollege ? 'plot any college stat against any other' : 'plot any stat against any other') + '</div></div>' +
        '<div class="lp-controls">' +
          '<label class="lp-ctrl-label">X: <select class="lp-select exp-x-select">' + metricOpts + '</select></label>' +
          '<label class="lp-ctrl-label">Y: <select class="lp-select exp-y-select">' + yOpts + '</select></label>' +
          '<select class="lp-select exp-season">' + seasonOptions() + '</select>' +
          posTabsHTML('exp-pos-tabs', true) +
        '</div>' +
        '<div class="exp-body"><div class="lp-loading">crunching numbers...</div></div>' +
      '</div>';

    function niceTickValues(min, max, count) {
      var range = max - min;
      if (range <= 0) return [min];
      var step = range / count;
      var mag = Math.pow(10, Math.floor(Math.log10(step)));
      var norm = step / mag;
      var niceStep;
      if (norm <= 1.5) niceStep = mag;
      else if (norm <= 3) niceStep = 2 * mag;
      else if (norm <= 7) niceStep = 5 * mag;
      else niceStep = 10 * mag;
      var ticks = [];
      var start = Math.ceil(min / niceStep) * niceStep;
      for (var v = start; v <= max; v += niceStep) {
        ticks.push(Math.round(v * 1000) / 1000);
      }
      return ticks;
    }

    function formatTickValue(v) {
      if (v == null || isNaN(v)) return "0";
      if (Math.abs(v) >= 100) return Math.round(v).toString();
      if (Math.abs(v) >= 1) return v.toFixed(1);
      return v.toFixed(2);
    }

    function load() {
      var body = el.querySelector('.exp-body');
      var isCollege = typeof state !== 'undefined' && state.universe === 'college';
      body.innerHTML = '<div class="lp-loading">crunching ' + (isCollege ? 'college ' : '') + 'numbers...</div>';
      var xStat = el.querySelector('.exp-x-select').value;
      var yStat = el.querySelector('.exp-y-select').value;
      var season = el.querySelector('.exp-season').value;
      var posTab = el.querySelector('#exp-pos-tabs .lp-pos-tab.active');
      var position = posTab ? posTab.getAttribute('data-pos') || '' : '';

      var url;
      if (isCollege) {
        url = '/api/college/stat-explorer?x_stat=' + encodeURIComponent(xStat) + '&y_stat=' + encodeURIComponent(yStat);
      } else {
        url = '/api/stat-explorer?x_stat=' + encodeURIComponent(xStat) + '&y_stat=' + encodeURIComponent(yStat);
      }
      if (season) url += '&season=' + season;
      if (position) url += '&position=' + position;

      fetch(url, { signal: _panelSignal() }).then(function(r) {
        if (!r.ok) throw new Error('API error');
        return r.json();
      }).then(function(data) {
        currentData = data;
        // Update metric labels from server if college returns different metrics
        if (data.metrics) {
          var activeLabels = data.metrics;
          var xSel = el.querySelector('.exp-x-select');
          var ySel = el.querySelector('.exp-y-select');
          var curX = xSel.value;
          var curY = ySel.value;
          var newKeys = Object.keys(activeLabels);
          if (newKeys.length !== mkeys.length || newKeys[0] !== mkeys[0]) {
            xSel.innerHTML = '';
            ySel.innerHTML = '';
            var _xOpts = '';
            var _yOpts = '';
            for (var ki = 0; ki < newKeys.length; ki++) {
              var nk = newKeys[ki];
              _xOpts += '<option value="' + nk + '"' + (nk === curX ? ' selected' : '') + '>' + escapeHtml(activeLabels[nk]) + '</option>';
              _yOpts += '<option value="' + nk + '"' + (nk === curY ? ' selected' : '') + '>' + escapeHtml(activeLabels[nk]) + '</option>';
            }
            xSel.innerHTML = _xOpts;
            ySel.innerHTML = _yOpts;
            METRIC_LABELS = activeLabels;
            mkeys = newKeys;
          }
        }
        if (data.available_seasons && data.available_seasons.length) {
          var sSel = el.querySelector('.exp-season');
          var curSeason = sSel.value;
          sSel.innerHTML = '';
          var _opts = '';
          (data.available_seasons || []).forEach(function(s) {
            _opts += '<option value="' + escapeHtml(String(s)) + '"' + (String(s) === curSeason ? ' selected' : '') + '>' + escapeHtml(String(s)) + '</option>';
          });
          sSel.innerHTML = _opts;
        }
        drawChart(data);
      }).catch(function() {
        body.innerHTML = '<div class="panel-error">' + razzleError() + '<br><button onclick="location.reload()">retry</button></div>';
      });
    }

    function drawChart(data) {
      var body = el.querySelector('.exp-body');
      var players = data.players || [];
      if (!players.length) {
        body.innerHTML = '<div class="panel-empty">' + razzleEmpty() + '<span class="hint">try a different position or season</span></div>';
        return;
      }

      var xLabel = METRIC_LABELS[data.x_stat] || data.x_stat;
      var yLabel = METRIC_LABELS[data.y_stat] || data.y_stat;

      var html = '<div class="exp-count">' + players.length + ' players shown</div>';
      html += '<div class="exp-chart-wrap"><canvas class="exp-canvas" role="img" aria-label="Stat explorer scatter plot"></canvas>';
      html += '<div class="exp-tooltip"></div></div>';
      body.innerHTML = html;

      chartCanvas = el.querySelector('.exp-canvas');
      var wrap = el.querySelector('.exp-chart-wrap');
      var t = getCanvasTheme();
      var wrapW = wrap.clientWidth - 40;
      var canvasH = Math.min(600, Math.max(350, wrapW * 0.6));
      var dpr = window.devicePixelRatio || 1;
      chartCanvas.width = wrapW * dpr;
      chartCanvas.height = canvasH * dpr;
      chartCanvas.style.width = wrapW + 'px';
      chartCanvas.style.height = canvasH + 'px';

      var ctx = chartCanvas.getContext('2d');
      ctx.scale(dpr, dpr);

      var plotW = wrapW - MARGIN.left - MARGIN.right;
      var plotH = canvasH - MARGIN.top - MARGIN.bottom;

      var xVals = players.map(function(p) { return p.x; });
      var yVals = players.map(function(p) { return p.y; });
      var xMin = Math.min.apply(null, xVals.concat([0])), xMax = Math.max.apply(null, xVals.concat([1]));
      var yMin = Math.min.apply(null, yVals.concat([0])), yMax = Math.max.apply(null, yVals.concat([1]));
      var xPad = (xMax - xMin) * 0.05 || 1;
      var yPad = (yMax - yMin) * 0.05 || 1;
      xMin -= xPad; xMax += xPad; yMin -= yPad; yMax += yPad;

      function xScale(v) { return MARGIN.left + ((v - xMin) / (xMax - xMin)) * plotW; }
      function yScale(v) { return MARGIN.top + plotH - ((v - yMin) / (yMax - yMin)) * plotH; }

      ctx.fillStyle = t.bgCard;
      ctx.fillRect(0, 0, wrapW, canvasH);

      ctx.strokeStyle = t.inkFaint;
      ctx.lineWidth = 0.5;
      var xTicks = niceTickValues(xMin, xMax, 6);
      var yTicks = niceTickValues(yMin, yMax, 6);
      xTicks.forEach(function(v) { var x = xScale(v); ctx.beginPath(); ctx.moveTo(x, MARGIN.top); ctx.lineTo(x, MARGIN.top + plotH); ctx.stroke(); });
      yTicks.forEach(function(v) { var y = yScale(v); ctx.beginPath(); ctx.moveTo(MARGIN.left, y); ctx.lineTo(MARGIN.left + plotW, y); ctx.stroke(); });

      ctx.strokeStyle = t.ink;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(MARGIN.left, MARGIN.top);
      ctx.lineTo(MARGIN.left, MARGIN.top + plotH);
      ctx.lineTo(MARGIN.left + plotW, MARGIN.top + plotH);
      ctx.stroke();

      ctx.fillStyle = t.inkMedium;
      ctx.font = '11px "Space Mono", monospace';
      ctx.textAlign = 'center';
      xTicks.forEach(function(v) { ctx.fillText(formatTickValue(v), xScale(v), MARGIN.top + plotH + 18); });
      ctx.textAlign = 'right';
      yTicks.forEach(function(v) { ctx.fillText(formatTickValue(v), MARGIN.left - 8, yScale(v) + 4); });

      ctx.fillStyle = t.ink;
      ctx.font = 'bold 13px "Space Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(xLabel, MARGIN.left + plotW / 2, canvasH - 6);
      ctx.save();
      ctx.translate(16, MARGIN.top + plotH / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText(yLabel, 0, 0);
      ctx.restore();

      if (players.length > 2) {
        var sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, n = players.length;
        players.forEach(function(p) { sumX += p.x; sumY += p.y; sumXY += p.x * p.y; sumX2 += p.x * p.x; });
        var denom = n * sumX2 - sumX * sumX;
        if (denom === 0) { denom = 1; }
        var slope = (n * sumXY - sumX * sumY) / denom;
        var intercept = (sumY - slope * sumX) / n;
        if (isFinite(slope) && isFinite(intercept)) {
          ctx.strokeStyle = 'rgba(217, 119, 87, 0.4)';
          ctx.lineWidth = 2;
          ctx.setLineDash([6, 4]);
          ctx.beginPath();
          ctx.moveTo(xScale(xMin), yScale(slope * xMin + intercept));
          ctx.lineTo(xScale(xMax), yScale(slope * xMax + intercept));
          ctx.stroke();
          ctx.setLineDash([]);
        }
      }

      plotPoints = [];
      var dotR = players.length > 100 ? 4 : (players.length > 50 ? 5 : 6);
      players.forEach(function(p) {
        var px = xScale(p.x), py = yScale(p.y);
        var color = POS_COLORS[p.position] || '#8a7565';
        ctx.beginPath();
        ctx.arc(px, py, dotR, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.75;
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.strokeStyle = t.ink;
        ctx.lineWidth = 1;
        ctx.stroke();
        plotPoints.push({ px: px, py: py, player: p });
      });

      chartCanvas.addEventListener('mousemove', function(e) {
        var rect = chartCanvas.getBoundingClientRect();
        var mx = (e.clientX - rect.left) * (wrapW / rect.width);
        var my = (e.clientY - rect.top) * (canvasH / rect.height);
        var closest = null, minDist = 20;
        plotPoints.forEach(function(pt) {
          var dist = Math.sqrt(Math.pow(pt.px - mx, 2) + Math.pow(pt.py - my, 2));
          if (dist < minDist) { minDist = dist; closest = pt; }
        });
        var tooltip = el.querySelector('.exp-tooltip');
        if (closest) {
          chartCanvas.style.cursor = 'pointer';
          hoveredPlayer = closest.player;
          var p = closest.player;
          var teamLine = escapeHtml(p.position) + ' — ' + escapeHtml(p.team);
          if (p.conference) teamLine += ' (' + escapeHtml(p.conference) + ')';
          tooltip.innerHTML = '<div style="font-weight:700">' + escapeHtml(p.name) + '</div>' +
            '<div>' + teamLine + '</div>' +
            '<div>' + escapeHtml(xLabel) + ': ' + (Number(p.x) || 0).toFixed(1) + '</div>' +
            '<div>' + escapeHtml(yLabel) + ': ' + (Number(p.y) || 0).toFixed(1) + '</div>';
          tooltip.style.display = 'block';
          var wrapRect = wrap.getBoundingClientRect();
          var tipX = e.clientX - wrapRect.left + 15;
          var tipY = e.clientY - wrapRect.top - 10;
          if (tipX + 200 > wrap.clientWidth) tipX = e.clientX - wrapRect.left - 200;
          tooltip.style.left = tipX + 'px';
          tooltip.style.top = tipY + 'px';
        } else {
          chartCanvas.style.cursor = 'crosshair';
          hoveredPlayer = null;
          tooltip.style.display = 'none';
        }
      });

      chartCanvas.addEventListener('mouseleave', function() {
        el.querySelector('.exp-tooltip').style.display = 'none';
        hoveredPlayer = null;
      });

      chartCanvas.addEventListener('click', function() {
        if (hoveredPlayer && hoveredPlayer.player_id) {
          window.open('/player/' + encodeURIComponent(hoveredPlayer.player_id), '_blank', 'noopener');
        }
      });
    }

    el.querySelector('.exp-x-select').addEventListener('change', load);
    el.querySelector('.exp-y-select').addEventListener('change', load);
    el.querySelector('.exp-season').addEventListener('change', load);
    el.querySelector('#exp-pos-tabs').addEventListener('click', function(e) {
      var tab = e.target.closest('.lp-pos-tab');
      if (!tab) return;
      el.querySelectorAll('#exp-pos-tabs .lp-pos-tab').forEach(function(t) { t.classList.remove('active'); });
      tab.classList.add('active');
      load();
    });

    load();
  }});

  // ─── LEADERS ─────────────────────────────────────────────────
  defs.push({ name: 'leaders', render: function(el) {
    var ldCollege = typeof state !== 'undefined' && state.universe === 'college';
    var ldState = { position: '', season: 0, data: null };
    var annotations = {
      ppg: 'the whole package', passing_yards: 'slinging it', passing_tds: 'finding the end zone',
      rushing_yards: 'ground game kings', rushing_tds: 'punching it in', receiving_yards: 'racking up yardage',
      receiving_tds: 'red zone royalty', receptions: 'the target hogs',
      target_share: 'eating all the targets', yards_per_carry: 'efficiency kings',
      total_yards: 'all-purpose monsters', total_tds: 'end zone royalty',
      pass_yards: 'airing it out', rush_yards: 'ground pounders', rec_yards: 'yardage machines'
    };
    var rateStats = { target_share: true, yards_per_carry: true };

    el.innerHTML =
      '<div class="lp-page">' +
        '<div class="lp-header"><h2>' + (ldCollege ? 'College Stat Leaders' : 'Stat Leaders') + '</h2>' +
        '<div class="lp-subtitle">' + (ldCollege ? 'who\'s leading the pack in college football' : 'who\'s leading the pack') + '</div></div>' +
        '<div class="lp-controls">' +
          '<select class="lp-select ld2-season">' + seasonOptions() + '</select>' +
          posTabsHTML('ld2-pos-tabs', true) +
        '</div>' +
        '<div class="ld2-content"><div class="lp-loading">' + razzleLoading() + '</div></div>' +
      '</div>';

    function load() {
      var content = el.querySelector('.ld2-content');
      var isCollege = typeof state !== 'undefined' && state.universe === 'college';
      content.innerHTML = '<div class="lp-loading">' + razzleLoading() + '</div>';
      var url;
      if (isCollege) {
        url = '/api/college/leaders?limit=10';
        if (ldState.position) url += '&position=' + encodeURIComponent(ldState.position);
        if (ldState.season) url += '&season=' + ldState.season;
      } else {
        url = '/api/stat-leaders?limit=10';
        if (ldState.position) url += '&position=' + encodeURIComponent(ldState.position);
        if (ldState.season) url += '&season=' + ldState.season;
      }

      fetch(url, { signal: _panelSignal() }).then(function(r) {
        if (!r.ok) throw new Error('API error');
        return r.json();
      }).then(function(data) {
        ldState.data = data;
        var seasonList = data.seasons || data.available_seasons || [];
        if (seasonList.length) {
          var sel = el.querySelector('.ld2-season');
          sel.innerHTML = '';
          var _opts = '';
          for (var i = 0; i < seasonList.length; i++) {
            _opts += '<option value="' + escapeHtml(String(seasonList[i])) + '"' + (seasonList[i] === data.season ? ' selected' : '') + '>' + escapeHtml(String(seasonList[i])) + '</option>';
          }
          sel.innerHTML = _opts;
        }
        renderCategories(data.categories || [], isCollege);
      }).catch(function() {
        content.innerHTML = '<div class="panel-error">' + razzleError() + '<br><button onclick="location.reload()">retry</button></div>';
      });
    }

    function renderCategories(categories, isCollege) {
      var content = el.querySelector('.ld2-content');
      if (!categories.length) {
        content.innerHTML = '<div class="panel-empty">' + razzleEmpty() + '<span class="hint">try a different position or season</span></div>';
        return;
      }
      var html = '<div class="ld2-grid">';
      for (var c = 0; c < categories.length; c++) {
        var cat = categories[c];
        if (!isCollege && !ldState.position && rateStats[cat.key]) continue;
        var annotation = annotations[cat.key] || '';
        html += '<div class="ld2-card"><div class="ld2-card-header">';
        html += '<span class="ld2-card-title">' + escapeHtml(cat.label) + '</span>';
        if (annotation) html += '<span class="ld2-card-annotation">' + escapeHtml(annotation) + '</span>';
        html += '</div><ul class="ld2-list">';
        for (var i = 0; i < cat.leaders.length; i++) {
          var p = cat.leaders[i];
          var rank = i + 1;
          var rankCls = rank === 1 ? 'gold' : rank === 2 ? 'silver' : rank === 3 ? 'bronze' : 'normal';
          var posLower = (p.position || 'wr').toLowerCase();
          var playerName = p.full_name || p.name || 'Unknown';
          html += '<li class="ld2-row" data-pid="' + escapeAttr(p.player_id) + '">';
          html += '<span class="ld2-rank ' + rankCls + '">' + rank + '</span>';
          if (!isCollege) html += playerHeadshot(p, p.position);
          html += '<div class="ld2-player-info">';
          html += '<span class="ld2-player-name">' + escapeHtml(playerName) + '</span>';
          html += '<span class="ld2-pos-badge ' + posLower + '">' + escapeHtml(p.position) + '</span>';
          html += '<span class="ld2-team">' + escapeHtml(p.team) + '</span>';
          if (isCollege && p.conference) html += '<span class="ld2-team" style="font-size:11px;color:var(--ink-light)">' + escapeHtml(p.conference) + '</span>';
          html += '</div>';
          html += '<span class="ld2-stat-value">' + escapeHtml(p.stat_display) + '</span>';
          html += '</li>';
        }
        html += '</ul></div>';
      }
      html += '</div>';
      content.innerHTML = html;
      content.querySelectorAll('.ld2-row[data-pid]').forEach(function(row) {
        row.addEventListener('click', function() {
          var pid = this.getAttribute('data-pid');
          if (pid) if (typeof openPlayerPopup === 'function') openPlayerPopup(pid); else window.location.href = '/player/' + encodeURIComponent(pid);
        });
      });
    }

    el.querySelector('#ld2-pos-tabs').addEventListener('click', function(e) {
      var tab = e.target.closest('.lp-pos-tab');
      if (!tab) return;
      el.querySelectorAll('#ld2-pos-tabs .lp-pos-tab').forEach(function(t) { t.classList.remove('active'); });
      tab.classList.add('active');
      ldState.position = tab.getAttribute('data-pos') || '';
      load();
    });

    el.querySelector('.ld2-season').addEventListener('change', function() {
      ldState.season = parseInt(this.value, 10) || 0;
      load();
    });

    load();
  }});

  // ─── OPPORTUNITY ─────────────────────────────────────────────
  defs.push({ name: 'opportunity', render: function(el) {
    var currentPosition = '';
    var currentData = null;
    var sortState = {
      alpha_dogs: { col: 'opp_share', dir: -1 },
      dominators: { col: 'dominator_rating', dir: -1 }
    };

    function shareClass(pct) {
      if (pct >= 25) return 'elite'; if (pct >= 18) return 'good';
      if (pct >= 12) return 'avg'; if (pct >= 8) return 'below'; return 'poor';
    }
    function domClass(rating) {
      if (rating >= 30) return 'elite'; if (rating >= 20) return 'good';
      if (rating >= 12) return 'avg'; if (rating >= 6) return 'below'; return 'poor';
    }

    var ALPHA_COLUMNS = [
      { key: 'name', label: 'Player' },
      { key: 'opp_share', label: 'Opp%', tip: 'Opportunity share' },
      { key: 'dominator_rating', label: 'Dom', tip: 'Dominator rating' },
      { key: 'targets_per_game', label: 'Tgt/G' },
      { key: 'carries_per_game', label: 'Car/G' },
      { key: 'ppg', label: 'PPG' }
    ];
    var DOM_COLUMNS = [
      { key: 'name', label: 'Player' },
      { key: 'dominator_rating', label: 'Dom', tip: 'Dominator rating' },
      { key: 'opp_share', label: 'Opp%' },
      { key: 'rec_yd_share', label: 'RecYd%' },
      { key: 'rec_td_share', label: 'RecTD%' },
      { key: 'ppg', label: 'PPG' }
    ];

    function getColumns(section) { return section === 'alpha_dogs' ? ALPHA_COLUMNS : DOM_COLUMNS; }

    el.innerHTML =
      '<div class="lp-page">' +
        '<div class="lp-header"><h2>Opportunity Share</h2>' +
        '<div class="lp-subtitle">who\'s eating the most touches</div></div>' +
        '<div class="lp-controls">' +
          '<select class="lp-select opp2-season">' + seasonOptions() + '</select>' +
          weekSelectHTML('opp2-week') +
          posTabsHTML('opp2-pos-tabs', true) +
        '</div>' +
        '<div class="opp2-content"><div class="lp-loading">mapping the opportunity landscape...</div></div>' +
      '</div>';

    function sortPlayers(players, col, dir) {
      return players.slice().sort(function(a, b) {
        var va = a[col], vb = b[col];
        if (va == null) va = -Infinity; if (vb == null) vb = -Infinity;
        if (typeof va === 'string') return dir * va.localeCompare(vb);
        return dir * (vb - va);
      });
    }

    function buildRow(p, section) {
      var pos = (p.position || 'RB').toLowerCase();
      var cols = getColumns(section);
      var html = '<tr data-pid="' + escapeAttr(p.player_id) + '">';
      cols.forEach(function(col) {
        if (col.key === 'name') {
          html += '<td><div class="opp2-player-cell">';
          if (p.headshot_url) html += '<img class="opp2-headshot" src="' + escapeAttr(p.headshot_url) + '" alt="Player headshot" loading="lazy" onerror="this.onerror=null;this.src=\'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 40 40%22><circle cx=%2220%22 cy=%2220%22 r=%2220%22 fill=%22%23d97757%22/><text x=%2220%22 y=%2225%22 text-anchor=%22middle%22 fill=%22white%22 font-size=%2216%22>?</text></svg>\'">';
          html += '<div><div class="opp2-player-name">' + escapeHtml(p.name) + '</div>';
          html += '<div class="opp2-player-meta"><span class="opp2-pos-badge ' + pos + '">' + escapeHtml(p.position) + '</span> ' + escapeHtml(p.team) + '</div></div></div></td>';
        } else if (col.key === 'opp_share') {
          html += '<td class="center"><span class="opp2-share-badge ' + shareClass(p.opp_share || 0) + '">' + fmt(p.opp_share) + '%</span></td>';
        } else if (col.key === 'dominator_rating') {
          html += '<td class="center"><span class="opp2-dom-badge ' + domClass(p.dominator_rating || 0) + '">' + fmt(p.dominator_rating) + '</span></td>';
        } else if (col.key === 'ppg') {
          html += '<td class="center" style="font-weight:700">' + fmt(p.ppg) + '</td>';
        } else if (col.key === 'rec_yd_share' || col.key === 'rec_td_share') {
          var val = p[col.key];
          html += '<td class="center">' + (val != null ? fmt(val) + '%' : '-') + '</td>';
        } else {
          var v = p[col.key];
          html += '<td class="center">' + (v != null ? fmt(v) : '-') + '</td>';
        }
      });
      html += '</tr>';
      return html;
    }

    function buildHeader(section) {
      var st = sortState[section];
      var cols = getColumns(section);
      var html = '<thead><tr>';
      cols.forEach(function(col) {
        var sorted = st.col === col.key;
        var arrow = sorted ? (st.dir === 1 ? ' &#9650;' : ' &#9660;') : '';
        var tip = col.tip ? ' title="' + escapeHtml(col.tip) + '"' : '';
        html += '<th' + (col.key !== 'name' ? ' class="center"' : '') + ' data-sort="' + col.key + '" data-section="' + section + '"' + tip + '>' + col.label + '<span class="sort-arrow">' + arrow + '</span></th>';
      });
      html += '</tr></thead>';
      return html;
    }

    function buildTable(players, section) {
      if (!players || !players.length) return '<div class="panel-empty">' + razzleEmpty() + '<span class="hint">try a different position or season</span></div>';
      var isAlpha = section === 'alpha_dogs';
      var icon = isAlpha ? '&#x1F43A;' : '&#x1F451;';
      var title = isAlpha ? 'Alpha Dogs' : 'Dominator Rating Leaders';
      var st = sortState[section];
      var sorted = sortPlayers(players, st.col, st.dir);
      var html = '<div class="opp2-section"><div class="opp2-section-header ' + (isAlpha ? 'alpha' : 'dominator') + '">' + icon + ' ' + title + ' <span style="font-family:var(--font-hand);font-size:16px;color:var(--ink-light);font-weight:400">(' + players.length + ' players)</span></div>';
      html += '<table class="opp2-table" data-section="' + section + '">' + buildHeader(section) + '<tbody>';
      sorted.forEach(function(p) { html += buildRow(p, section); });
      html += '</tbody></table></div>';
      return html;
    }

    function render(data) {
      currentData = data;
      var content = el.querySelector('.opp2-content');
      if (!data || (!(data.alpha_dogs && data.alpha_dogs.length) && !(data.dominators && data.dominators.length))) {
        content.innerHTML = '<div class="panel-empty">' + razzleEmpty() + '<span class="hint">try a different position or season</span></div>';
        return;
      }
      var html = buildTable(data.alpha_dogs, 'alpha_dogs') + buildTable(data.dominators, 'dominators');
      content.innerHTML = html;
      content.querySelectorAll('th[data-sort]').forEach(function(th) {
        th.addEventListener('click', function() {
          var col = th.getAttribute('data-sort');
          var sec = th.getAttribute('data-section');
          if (sortState[sec].col === col) sortState[sec].dir *= -1;
          else { sortState[sec].col = col; sortState[sec].dir = -1; }
          render(currentData);
        });
      });
      content.querySelectorAll('tr[data-pid]').forEach(function(tr) {
        tr.addEventListener('click', function() {
          var pid = tr.getAttribute('data-pid');
          if (pid) if (typeof openPlayerPopup === 'function') openPlayerPopup(pid); else window.location.href = '/player/' + encodeURIComponent(pid);
        });
      });
    }

    function load() {
      var content = el.querySelector('.opp2-content');
      content.innerHTML = '<div class="lp-loading">mapping the opportunity landscape...</div>';
      var season = el.querySelector('.opp2-season').value || '';
      var url = '/api/opportunity-share?limit=30';
      if (season) url += '&season=' + season;
      if (currentPosition) url += '&position=' + currentPosition;
      var opp2WeekVal = parseInt((el.querySelector('#opp2-week') || {}).value) || 0;
      if (opp2WeekVal > 0) url += '&week=' + opp2WeekVal;

      fetch(url, { signal: _panelSignal() }).then(function(r) {
        if (!r.ok) throw new Error('API error');
        return r.json();
      }).then(function(data) {
        if (data.available_seasons) {
          var sel = el.querySelector('.opp2-season');
          sel.innerHTML = '';
          var _opts = '';
          (data.available_seasons || []).forEach(function(s) {
            _opts += '<option value="' + escapeHtml(String(s)) + '"' + (s === data.season ? ' selected' : '') + '>' + escapeHtml(String(s)) + '</option>';
          });
          sel.innerHTML = _opts;
          populateWeekSelect(el, 'opp2-week', sel.value, load);
        }
        render(data);
      }).catch(function() {
        content.innerHTML = '<div class="panel-error">' + razzleError() + '<br><button onclick="location.reload()">retry</button></div>';
      });
    }

    el.querySelector('#opp2-pos-tabs').addEventListener('click', function(e) {
      var tab = e.target.closest('.lp-pos-tab');
      if (!tab) return;
      el.querySelectorAll('#opp2-pos-tabs .lp-pos-tab').forEach(function(t) { t.classList.remove('active'); });
      tab.classList.add('active');
      currentPosition = tab.getAttribute('data-pos') || '';
      load();
    });

    el.querySelector('.opp2-season').addEventListener('change', function() {
      populateWeekSelect(el, 'opp2-week', this.value, load);
      load();
    });
    load();
  }});

  // ─── PERCENTILES ─────────────────────────────────────────────
  defs.push({ name: 'percentiles', render: function(el) {
    var currentPlayerId = null;

    function barColor(pctile) {
      if (pctile >= 90) return 'var(--green)';
      if (pctile >= 75) return 'var(--blue)';
      if (pctile >= 50) return 'var(--orange)';
      if (pctile >= 25) return 'var(--yellow)';
      return 'var(--red)';
    }

    el.innerHTML =
      '<div class="lp-page">' +
        '<div class="lp-header"><h2>Player Percentiles</h2>' +
        '<div class="lp-subtitle">how they stack up against the position</div></div>' +
        '<div class="lp-controls">' +
          searchWrapHTML('pct2-', 'search a player...') +
          '<select class="lp-select pct2-season" style="display:none">' + seasonOptions() + '</select>' +
        '</div>' +
        '<div class="pct2-result"><div class="panel-empty">search for a player to see their percentile rankings</div></div>' +
      '</div>';

    buildPlayerSearch(el, 'pct2-', 'search a player...', function(selected) {
      currentPlayerId = selected.player_id;
      loadPercentiles(selected.player_id);
      el.querySelector('.pct2-season').style.display = '';
    });

    function loadPercentiles(playerId, season) {
      var result = el.querySelector('.pct2-result');
      result.innerHTML = '<div class="lp-loading">' + razzleLoading() + '</div>';
      var url = '/api/player-percentiles?player_id=' + encodeURIComponent(playerId);
      if (season) url += '&season=' + season;

      fetch(url, { signal: _panelSignal() }).then(function(r) {
        if (!r.ok) throw new Error('fail');
        return r.json();
      }).then(function(data) {
        if (data.error) {
          result.innerHTML = '<div class="panel-empty">' + escapeHtml(data.error) + '</div>';
          return;
        }
        if (data.available_seasons) {
          var sel = el.querySelector('.pct2-season');
          sel.innerHTML = '';
          var _opts = '';
          for (var i = 0; i < data.available_seasons.length; i++) {
            _opts += '<option value="' + escapeHtml(String(data.available_seasons[i])) + '"' + (data.available_seasons[i] === data.season ? ' selected' : '') + '>' + escapeHtml(String(data.available_seasons[i])) + '</option>';
          }
          sel.innerHTML = _opts;
        }
        renderPercentiles(data);
      }).catch(function() {
        result.innerHTML = '<div class="panel-error">' + razzleError() + '<br><button onclick="location.reload()">retry</button></div>';
      });
    }

    function renderPercentiles(data) {
      var p = data.player;
      if (!p) { el.querySelector('.pct2-result').innerHTML = '<div class="panel-empty">' + razzleEmpty() + '<span class="hint">try a different position or season</span></div>'; return; }
      var pos = p.position || 'WR';
      var pcts = data.percentiles || [];
      var result = el.querySelector('.pct2-result');

      if (!pcts.length) {
        result.innerHTML = '<div class="panel-empty">' + razzleEmpty() + '<span class="hint">try a different position or season</span></div>';
        return;
      }

      var html = '<div class="pct2-player-card"><div>';
      html += '<h3 class="pct2-player-name">' + escapeHtml(p.full_name) + '</h3>';
      html += '<div class="pct2-player-meta">';
      html += '<span class="pct2-pos-badge ' + escapeHtml(pos) + '">' + escapeHtml(pos) + '</span>';
      html += '<span>' + escapeHtml(p.team) + '</span>';
      if (p.age) html += '<span>Age ' + Math.round(p.age) + '</span>';
      html += '<span>' + data.season + ' Season</span>';
      html += '</div></div></div>';

      html += '<div class="pct2-pool">vs. ' + data.position_pool + ' ' + escapeHtml(pos) + 's with 4+ games</div>';

      html += '<div class="pct2-bars">';
      for (var i = 0; i < pcts.length; i++) {
        var m = pcts[i];
        var color = barColor(m.percentile);
        var widthPct = Math.max(5, m.percentile);
        html += '<div class="pct2-bar-row">';
        html += '<div class="pct2-bar-label">' + escapeHtml(m.label) + '</div>';
        html += '<div class="pct2-bar-track"><div class="pct2-bar-fill" style="width:' + widthPct + '%;background:' + color + '"><span class="pct2-bar-pctile">' + m.percentile + '</span></div></div>';
        html += '<div class="pct2-bar-value">' + escapeHtml(String(m.value)) + '</div>';
        html += '</div>';
      }
      html += '</div>';

      var avgPct = 0;
      for (var j = 0; j < pcts.length; j++) avgPct += pcts[j].percentile;
      avgPct = Math.round(avgPct / pcts.length);
      html += '<div style="text-align:center;margin:16px 0">';
      html += '<span style="font-family:var(--font-mono);font-size:14px;color:var(--ink-light)">Average Percentile: </span>';
      html += '<span style="font-family:var(--font-mono);font-size:18px;font-weight:700;color:' + barColor(avgPct) + '">' + avgPct + 'th</span>';
      html += '</div>';

      result.innerHTML = html;
    }

    el.querySelector('.pct2-season').addEventListener('change', function() {
      if (currentPlayerId) loadPercentiles(currentPlayerId, parseInt(this.value, 10));
    });
  }});

  // ─── PROSPECTS ───────────────────────────────────────────────
  defs.push({ name: 'prospects', render: function(el) {
    var state = { position: '', draftYear: 0, data: null };
    var TIER_CONFIG = [
      { key: 'elite', min: 80, label: 'Elite', annotation: 'freaks of nature' },
      { key: 'premium', min: 60, label: 'Premium', annotation: 'day 1-2 impact' },
      { key: 'solid', min: 40, label: 'Solid', annotation: 'developmental upside' },
      { key: 'raw', min: 0, label: 'Raw', annotation: 'lottery tickets' }
    ];
    var PCT_LABELS = { forty: '40yd', vertical: 'Vert', broad_jump: 'Broad', bench: 'Bench', cone: '3Cone', shuttle: 'Shuttle' };

    function pctColor(val) {
      if (val >= 80) return 'var(--green)'; if (val >= 60) return 'var(--blue)';
      if (val >= 40) return 'var(--orange)'; if (val >= 20) return 'var(--yellow)'; return 'var(--red)';
    }

    el.innerHTML =
      '<div class="lp-page">' +
        '<div class="lp-header"><h2>Rookie Big Board</h2>' +
        '<div class="lp-subtitle">scouting the next wave</div></div>' +
        '<div class="lp-controls">' +
          '<select class="lp-select bb-year"><option value="">scouting classes...</option></select>' +
          posTabsHTML('bb-pos-tabs', true) +
        '</div>' +
        '<div class="bb-content"><div class="lp-loading">scouting the board...</div></div>' +
      '</div>';

    function loadYears() {
      fetch('/api/prospect-options', { signal: _panelSignal() }).then(function(r) {
        if (!r.ok) throw new Error('fail');
        return r.json();
      }).then(function(data) {
        var years = data.years || [];
        if (!years.length) return;
        var sel = el.querySelector('.bb-year');
        sel.innerHTML = '';
        var _opts = '';
        for (var i = 0; i < years.length; i++) {
          _opts += '<option value="' + escapeHtml(String(years[i])) + '">' + escapeHtml(String(years[i])) + ' Draft Class</option>';
        }
        sel.innerHTML = _opts;
        state.draftYear = years[0];
        loadProspects();
      }).catch(function() {
        el.querySelector('.bb-year').innerHTML = '<option value="">no draft classes found</option>';
      });
    }

    function loadProspects() {
      var content = el.querySelector('.bb-content');
      content.innerHTML = '<div class="lp-loading">scouting the board...</div>';
      var url = '/api/prospect-scores?draft_year=' + (state.draftYear || '');
      if (state.position) url += '&position=' + encodeURIComponent(state.position);

      fetch(url, { signal: _panelSignal() }).then(function(r) {
        if (!r.ok) throw new Error('fail');
        return r.json();
      }).then(function(data) {
        state.data = data;
        renderBoard(data.prospects || []);
      }).catch(function() {
        content.innerHTML = '<div class="panel-error">' + razzleError() + '<br><button onclick="location.reload()">retry</button></div>';
      });
    }

    function groupByTier(prospects) {
      var tiers = {};
      for (var i = 0; i < TIER_CONFIG.length; i++) tiers[TIER_CONFIG[i].key] = [];
      tiers['unknown'] = [];
      for (var j = 0; j < prospects.length; j++) {
        var p = prospects[j];
        var rps = p.rps;
        if (rps == null) { tiers['unknown'].push(p); continue; }
        var placed = false;
        for (var k = 0; k < TIER_CONFIG.length; k++) {
          if (rps >= TIER_CONFIG[k].min) { tiers[TIER_CONFIG[k].key].push(p); placed = true; break; }
        }
        if (!placed) tiers['raw'].push(p);
      }
      return tiers;
    }

    function renderBoard(prospects) {
      var content = el.querySelector('.bb-content');
      if (!prospects.length) { content.innerHTML = '<div class="panel-empty">' + razzleEmpty() + '<span class="hint">try a different position or season</span></div>'; return; }

      var tiers = groupByTier(prospects);
      var html = '';
      var tierOrder = TIER_CONFIG.map(function(t) { return t.key; });
      tierOrder.push('unknown');

      for (var ti = 0; ti < tierOrder.length; ti++) {
        var tierKey = tierOrder[ti];
        var players = tiers[tierKey];
        if (!players || !players.length) continue;
        var cfg = TIER_CONFIG.find(function(t) { return t.key === tierKey; });
        var tierLabel = cfg ? cfg.label : 'No Combine Data';
        var tierAnnotation = cfg ? cfg.annotation : 'limited measurables';

        html += '<div class="bb-tier rps-' + tierKey + '">';
        html += '<div class="bb-tier-header"><div class="bb-tier-badge">' + escapeHtml(tierLabel) + '</div>';
        html += '<div class="bb-tier-label">' + escapeHtml(tierAnnotation) + '</div>';
        html += '<div class="bb-tier-count">' + players.length + ' prospects</div></div>';
        html += '<div class="bb-grid">';

        for (var pi = 0; pi < players.length; pi++) {
          var p = players[pi];
          var posLc = (p.position || '').toLowerCase();
          var draftInfo = '';
          if (p.draft_round && p.draft_pick) {
            draftInfo = 'Rd ' + p.draft_round + ' Pick ' + p.draft_pick;
            if (p.draft_team) draftInfo += ' — ' + p.draft_team;
          } else { draftInfo = 'Undrafted'; }
          var measStr = '';
          if (p.height_display) measStr += p.height_display;
          if (p.weight) measStr += (measStr ? ' / ' : '') + p.weight + ' lbs';

          html += '<div class="bb-card">';
          html += '<div class="bb-card-top"><div class="bb-rank">#' + (p.rank != null ? p.rank : '') + '</div>';
          html += '<span class="bb-pos-badge ' + posLc + '">' + escapeHtml(p.position || '') + '</span>';
          html += '<div class="bb-info"><div class="bb-name">' + escapeHtml(p.player_name || '') + '</div>';
          html += '<div class="bb-meta">' + escapeHtml(p.school || '') + '</div></div>';
          html += '<div class="bb-rps"><div class="bb-rps-value">' + fmt(p.rps) + '</div>';
          html += '<div class="bb-rps-label">RPS</div></div></div>';
          html += '<div class="bb-draft-row"><div class="bb-draft-chip">' + escapeHtml(draftInfo) + '</div>';
          if (measStr) html += '<div class="bb-meas">' + escapeHtml(measStr) + '</div>';
          html += '</div>';

          var pcts = p.percentiles || {};
          var pctKeys = Object.keys(PCT_LABELS);
          var hasPcts = false;
          for (var pk = 0; pk < pctKeys.length; pk++) { if (pcts[pctKeys[pk]] != null) { hasPcts = true; break; } }
          if (hasPcts) {
            html += '<div class="bb-pcts">';
            for (var pk2 = 0; pk2 < pctKeys.length; pk2++) {
              var mk = pctKeys[pk2];
              var val = pcts[mk];
              if (val == null) continue;
              html += '<div class="bb-pct-row"><div class="bb-pct-label">' + PCT_LABELS[mk] + '</div>';
              html += '<div class="bb-pct-bar-bg"><div class="bb-pct-bar-fill" style="width:' + val + '%;background:' + pctColor(val) + '"></div></div>';
              html += '<div class="bb-pct-val">' + Math.round(val) + '%</div></div>';
            }
            html += '</div>';
          }
          html += '</div>';
        }
        html += '</div></div>';
      }
      content.innerHTML = html;
    }

    el.querySelector('#bb-pos-tabs').addEventListener('click', function(e) {
      var tab = e.target.closest('.lp-pos-tab');
      if (!tab) return;
      el.querySelectorAll('#bb-pos-tabs .lp-pos-tab').forEach(function(t) { t.classList.remove('active'); });
      tab.classList.add('active');
      state.position = tab.getAttribute('data-pos') || '';
      loadProspects();
    });

    el.querySelector('.bb-year').addEventListener('change', function() {
      state.draftYear = parseInt(this.value, 10) || 0;
      loadProspects();
    });

    loadYears();
  }});

  // ─── RECAP ───────────────────────────────────────────────────
  defs.push({ name: 'recap', render: function(el) {
    var rcCollege = typeof state !== 'undefined' && state.universe === 'college';
    el.innerHTML =
      '<div class="lp-page">' +
        '<div class="lp-header"><h2>' + (rcCollege ? 'College Season Recap' : 'Season Recap') + '</h2>' +
        '<div class="lp-subtitle">' + (rcCollege ? 'the college season in review' : 'the season in review') + '</div></div>' +
        '<div class="lp-controls">' +
          '<select class="lp-select rc2-season">' + seasonOptions() + '</select>' +
        '</div>' +
        '<div class="rc2-content"><div class="lp-loading">' + razzleLoading() + '</div></div>' +
      '</div>';

    function posChip(pos) {
      var c = POS_COLORS[pos] || '#8a7565';
      return '<span class="rc2-pos-chip" style="background:' + c + '">' + escapeHtml(pos) + '</span>';
    }

    function renderList(items, fn) {
      if (!items.length) return '<ul class="rc2-list"><li>' + razzleEmpty() + '</li></ul>';
      var html = '<ul class="rc2-list">';
      for (var i = 0; i < items.length; i++) html += '<li>' + fn(items[i]) + '</li>';
      html += '</ul>';
      return html;
    }

    function load() {
      var content = el.querySelector('.rc2-content');
      var isCollege = typeof state !== 'undefined' && state.universe === 'college';
      content.innerHTML = '<div class="lp-loading">' + razzleLoading() + '</div>';
      var season = el.querySelector('.rc2-season').value || '';
      var url = isCollege ? '/api/college/season-recap?' : '/api/season-recap?';
      if (season) url += 'season=' + encodeURIComponent(season);

      fetch(url, { signal: _panelSignal() }).then(function(r) {
        if (!r.ok) throw new Error('API error');
        return r.json();
      }).then(function(data) {
        if (data.available_seasons) {
          var sel = el.querySelector('.rc2-season');
          sel.innerHTML = '';
          var _opts = '';
          (data.available_seasons || []).forEach(function(s) {
            _opts += '<option value="' + escapeHtml(String(s)) + '"' + (s === data.season ? ' selected' : '') + '>' + escapeHtml(String(s)) + '</option>';
          });
          sel.innerHTML = _opts;
        }
        render(data, isCollege);
      }).catch(function() {
        content.innerHTML = '<div class="panel-error">the tape machine jammed — give it another shot<br><button onclick="location.reload()">retry</button></div>';
      });
    }

    function render(data, isCollege) {
      var html = '';
      var mvp = data.overall_1;
      if (mvp) {
        html += '<div class="rc2-mvp"><div class="rc2-mvp-label">' + data.season + (isCollege ? ' College Fantasy MVP' : ' Fantasy MVP') + '</div>';
        html += '<div class="rc2-mvp-name">' + escapeHtml(mvp.name) + ' ' + posChip(mvp.position) + '</div>';
        if (isCollege && mvp.team) html += '<div style="font-size:12px;color:var(--ink-light);margin-bottom:6px">' + escapeHtml(mvp.team) + (mvp.conference ? ' (' + escapeHtml(mvp.conference) + ')' : '') + '</div>';
        html += '<div class="rc2-mvp-stats">';
        html += '<div class="rc2-mvp-stat"><div class="rc2-mvp-val">' + escapeHtml(String(mvp.total_fpts)) + '</div><div class="rc2-mvp-lbl">Total Pts</div></div>';
        html += '<div class="rc2-mvp-stat"><div class="rc2-mvp-val">' + escapeHtml(String(mvp.ppg)) + '</div><div class="rc2-mvp-lbl">PPG</div></div>';
        html += '<div class="rc2-mvp-stat"><div class="rc2-mvp-val">' + escapeHtml(String(mvp.games)) + '</div><div class="rc2-mvp-lbl">Games</div></div>';
        if (isCollege && mvp.tds !== undefined) html += '<div class="rc2-mvp-stat"><div class="rc2-mvp-val">' + escapeHtml(String(mvp.tds)) + '</div><div class="rc2-mvp-lbl">TDs</div></div>';
        html += '</div></div>';
      }

      html += '<div class="rc2-pos-leaders">';
      ['QB', 'RB', 'WR', 'TE'].forEach(function(pos) {
        var ldr = (data.pos_leaders || {})[pos];
        var pc = POS_COLORS[pos] || '#8a7565';
        html += '<div class="rc2-pos-card"><div class="rc2-pos-label" style="background:' + pc + '">' + pos + '1</div>';
        if (ldr) {
          html += '<div class="rc2-pos-name">' + escapeHtml(ldr.name) + '</div>';
          if (isCollege && ldr.team) html += '<div style="font-size:11px;color:var(--ink-light)">' + escapeHtml(ldr.team) + '</div>';
          html += '<div class="rc2-pos-stat">' + ldr.total_fpts + ' pts / ' + ldr.ppg + ' PPG</div>';
        } else { html += '<div class="rc2-pos-stat">&mdash;</div>'; }
        html += '</div>';
      });
      html += '</div>';

      html += '<div class="rc2-sections">';

      if (!isCollege) {
        html += '<div class="rc2-section"><div class="rc2-section-header">Highest Single Game</div>';
        html += renderList(data.top_weeks || [], function(p) {
          return '<span>' + escapeHtml(p.name) + posChip(p.position) + '</span><span><span class="rc2-badge gold">Wk ' + p.week + '</span> ' + fmt(p.fpts) + ' pts</span>';
        });
        html += '</div>';
      }

      if (isCollege) {
        html += '<div class="rc2-section"><div class="rc2-section-header">Top Yardage Producers</div>';
        html += renderList(data.top_yards || [], function(p) {
          return '<span>' + escapeHtml(p.name) + posChip(p.position) + ' <span style="font-size:11px;color:var(--ink-light)">' + escapeHtml(p.team) + '</span></span><span><span class="rc2-badge gold">' + p.total_yards + ' yds</span> ' + p.ppg + ' PPG</span>';
        });
        html += '</div>';

        html += '<div class="rc2-section"><div class="rc2-section-header">TD Leaders</div>';
        html += renderList(data.top_tds || [], function(p) {
          return '<span>' + escapeHtml(p.name) + posChip(p.position) + ' <span style="font-size:11px;color:var(--ink-light)">' + escapeHtml(p.team) + '</span></span><span><span class="rc2-badge gold">' + p.tds + ' TDs</span></span>';
        });
        html += '</div>';
      }

      html += '<div class="rc2-section"><div class="rc2-section-header">Biggest Breakouts</div>';
      html += renderList(data.breakouts || [], function(p) {
        var delta = isCollege ? p.delta_ppg : p.delta;
        return '<span>' + escapeHtml(p.name) + posChip(p.position) + (isCollege && p.team ? ' <span style="font-size:11px;color:var(--ink-light)">' + escapeHtml(p.team) + '</span>' : '') + '</span><span><span class="rc2-badge green">+' + fmt(delta) + ' PPG</span> ' + p.prev_ppg + ' &rarr; ' + p.ppg + '</span>';
      });
      html += '</div>';

      html += '<div class="rc2-section"><div class="rc2-section-header">Biggest ' + (isCollege ? 'Declines' : 'Busts') + '</div>';
      html += renderList(data.busts || [], function(p) {
        var delta = isCollege ? p.delta_ppg : p.delta;
        return '<span>' + escapeHtml(p.name) + posChip(p.position) + (isCollege && p.team ? ' <span style="font-size:11px;color:var(--ink-light)">' + escapeHtml(p.team) + '</span>' : '') + '</span><span><span class="rc2-badge red">' + fmt(delta) + ' PPG</span> ' + p.prev_ppg + ' &rarr; ' + p.ppg + '</span>';
      });
      html += '</div>';

      if (!isCollege) {
        html += '<div class="rc2-section"><div class="rc2-section-header">Most Consistent</div>';
        html += renderList(data.most_consistent || [], function(p) {
          return '<span>' + escapeHtml(p.name) + posChip(p.position) + '</span><span><span class="rc2-badge blue">CoV ' + fmt(p.cov, 0) + '%</span> ' + p.ppg + ' PPG</span>';
        });
        html += '</div>';

        html += '<div class="rc2-section"><div class="rc2-section-header">Most Volatile</div>';
        html += renderList(data.most_volatile || [], function(p) {
          return '<span>' + escapeHtml(p.name) + posChip(p.position) + '</span><span><span class="rc2-badge red">CoV ' + fmt(p.cov, 0) + '%</span> ' + p.ppg + ' PPG</span>';
        });
        html += '</div>';

        html += '<div class="rc2-section"><div class="rc2-section-header">Season Stats</div>';
        html += '<ul class="rc2-list"><li><span>Total Players</span><span>' + data.total_players + '</span></li>';
        html += '<li><span>Average PPG</span><span>' + data.avg_ppg + '</span></li></ul></div>';
      }
      html += '</div>';

      el.querySelector('.rc2-content').innerHTML = html;
    }

    el.querySelector('.rc2-season').addEventListener('change', load);
    load();
  }});

  // ─── RECORDS ─────────────────────────────────────────────────
  defs.push({ name: 'records', render: function(el) {
    var recCollege = typeof state !== 'undefined' && state.universe === 'college';
    var currentPosition = '';

    function posChip(pos) {
      var c = POS_COLORS[pos] || '#8a7565';
      return '<span class="rec-pos-chip" style="background:' + c + '">' + escapeHtml(pos) + '</span>';
    }
    function rankClass(i) {
      if (i === 0) return 'gold'; if (i === 1) return 'silver'; if (i === 2) return 'bronze'; return '';
    }

    el.innerHTML =
      '<div class="lp-page">' +
        '<div class="lp-header"><h2>' + (recCollege ? 'College Record Book' : 'Fantasy Record Book') + '</h2>' +
        '<div class="lp-subtitle">' + (recCollege ? 'the best college seasons and careers' : 'the all-time greats') + '</div></div>' +
        '<div class="lp-controls">' +
          posTabsHTML('rec-pos-tabs', true) +
        '</div>' +
        '<div class="rec-content"><div class="lp-loading">' + razzleLoading() + '</div></div>' +
      '</div>';

    function load() {
      var content = el.querySelector('.rec-content');
      var isCollege = typeof state !== 'undefined' && state.universe === 'college';
      content.innerHTML = '<div class="lp-loading">' + razzleLoading() + '</div>';
      var url;
      if (isCollege) {
        url = '/api/college/records?';
      } else {
        url = '/api/records?';
      }
      if (currentPosition) url += 'position=' + encodeURIComponent(currentPosition);

      fetch(url, { signal: _panelSignal() }).then(function(r) {
        if (!r.ok) throw new Error('API error');
        return r.json();
      }).then(function(data) { render(data, isCollege); }).catch(function() {
        content.innerHTML = '<div class="panel-error">the tape machine jammed — give it another shot<br><button onclick="location.reload()">retry</button></div>';
      });
    }

    function playerCell(p, isCollege) {
      var html = escapeHtml(p.name) + posChip(p.position);
      if (isCollege && p.team) html += ' <span style="font-size:11px;color:var(--ink-light)">' + escapeHtml(p.team) + '</span>';
      if (isCollege && p.conference) html += ' <span style="font-size:11px;color:var(--ink-light)">' + escapeHtml(p.conference) + '</span>';
      return html;
    }

    function render(data, isCollege) {
      var html = '<div class="rec-grid">';

      if (!isCollege) {
        html += '<div class="rec-section"><div class="rec-section-header">Single-Game Records</div>';
        html += '<table class="rec-table"><thead><tr><th>#</th><th>Player</th><th>Szn</th><th>Wk</th><th>PPR</th></tr></thead><tbody>';
        (data.single_game || []).forEach(function(p, i) {
          html += '<tr data-pid="' + escapeAttr(p.player_id) + '"><td><span class="rec-rank ' + rankClass(i) + '">' + (i + 1) + '</span></td>';
          html += '<td>' + escapeHtml(p.name) + posChip(p.position) + '</td>';
          html += '<td><span class="rec-season-badge">' + p.season + '</span></td>';
          html += '<td>' + p.week + '</td><td class="rec-fpts">' + p.fpts + '</td></tr>';
        });
        html += '</tbody></table></div>';
      }

      html += '<div class="rec-section"><div class="rec-section-header">' + (isCollege ? 'Best Single Seasons (Fantasy Pts)' : 'Single-Season Records') + '</div>';
      html += '<table class="rec-table"><thead><tr><th>#</th><th>Player</th><th>Szn</th><th>G</th><th>Total</th><th>PPG</th></tr></thead><tbody>';
      (data.single_season || []).forEach(function(p, i) {
        html += '<tr data-pid="' + escapeAttr(p.player_id) + '"><td><span class="rec-rank ' + rankClass(i) + '">' + (i + 1) + '</span></td>';
        html += '<td>' + playerCell(p, isCollege) + '</td>';
        html += '<td><span class="rec-season-badge">' + p.season + '</span></td>';
        html += '<td>' + p.games + '</td><td class="rec-fpts">' + p.total_fpts + '</td><td>' + p.ppg + '</td></tr>';
      });
      html += '</tbody></table></div>';

      if (isCollege) {
        html += '<div class="rec-section"><div class="rec-section-header">Best Single Seasons (Total Yards)</div>';
        html += '<table class="rec-table"><thead><tr><th>#</th><th>Player</th><th>Szn</th><th>G</th><th>Yards</th><th>YPG</th></tr></thead><tbody>';
        (data.season_yards || []).forEach(function(p, i) {
          html += '<tr data-pid="' + escapeAttr(p.player_id) + '"><td><span class="rec-rank ' + rankClass(i) + '">' + (i + 1) + '</span></td>';
          html += '<td>' + playerCell(p, true) + '</td>';
          html += '<td><span class="rec-season-badge">' + p.season + '</span></td>';
          html += '<td>' + p.games + '</td><td class="rec-fpts">' + p.total_yards + '</td><td>' + p.ypg + '</td></tr>';
        });
        html += '</tbody></table></div>';

        html += '<div class="rec-section"><div class="rec-section-header">Best Single Seasons (TDs)</div>';
        html += '<table class="rec-table"><thead><tr><th>#</th><th>Player</th><th>Szn</th><th>G</th><th>TDs</th></tr></thead><tbody>';
        (data.season_tds || []).forEach(function(p, i) {
          html += '<tr data-pid="' + escapeAttr(p.player_id) + '"><td><span class="rec-rank ' + rankClass(i) + '">' + (i + 1) + '</span></td>';
          html += '<td>' + playerCell(p, true) + '</td>';
          html += '<td><span class="rec-season-badge">' + p.season + '</span></td>';
          html += '<td>' + p.games + '</td><td class="rec-fpts">' + p.tds + '</td></tr>';
        });
        html += '</tbody></table></div>';

        html += '<div class="rec-section"><div class="rec-section-header">Career Fantasy Points Leaders</div>';
        html += '<table class="rec-table"><thead><tr><th>#</th><th>Player</th><th>Szns</th><th>G</th><th>Total</th><th>PPG</th></tr></thead><tbody>';
        (data.career_fpts || []).forEach(function(p, i) {
          html += '<tr data-pid="' + escapeAttr(p.player_id) + '"><td><span class="rec-rank ' + rankClass(i) + '">' + (i + 1) + '</span></td>';
          html += '<td>' + playerCell(p, true) + '</td>';
          html += '<td><span class="rec-season-badge">' + escapeHtml(p.seasons) + '</span></td>';
          html += '<td>' + p.games + '</td><td class="rec-fpts">' + p.total_fpts + '</td><td>' + p.ppg + '</td></tr>';
        });
        html += '</tbody></table></div>';

        html += '<div class="rec-section"><div class="rec-section-header">Career Yards Leaders</div>';
        html += '<table class="rec-table"><thead><tr><th>#</th><th>Player</th><th>Szns</th><th>G</th><th>Yards</th><th>YPG</th></tr></thead><tbody>';
        (data.career_yards || []).forEach(function(p, i) {
          html += '<tr data-pid="' + escapeAttr(p.player_id) + '"><td><span class="rec-rank ' + rankClass(i) + '">' + (i + 1) + '</span></td>';
          html += '<td>' + playerCell(p, true) + '</td>';
          html += '<td><span class="rec-season-badge">' + escapeHtml(p.seasons) + '</span></td>';
          html += '<td>' + p.games + '</td><td class="rec-fpts">' + p.total_yards + '</td><td>' + p.ypg + '</td></tr>';
        });
        html += '</tbody></table></div>';
      } else {
        html += '<div class="rec-section"><div class="rec-section-header">Career PPG Leaders</div>';
        html += '<table class="rec-table"><thead><tr><th>#</th><th>Player</th><th>G</th><th>PPG</th><th>Total</th></tr></thead><tbody>';
        (data.career_ppg || []).forEach(function(p, i) {
          html += '<tr data-pid="' + escapeAttr(p.player_id) + '"><td><span class="rec-rank ' + rankClass(i) + '">' + (i + 1) + '</span></td>';
          html += '<td>' + escapeHtml(p.name) + posChip(p.position) + '</td>';
          html += '<td>' + p.games + '</td><td class="rec-fpts">' + p.ppg + '</td><td>' + p.total_fpts + '</td></tr>';
        });
        html += '</tbody></table></div>';

        html += '<div class="rec-section"><div class="rec-section-header">Most Career Points</div>';
        html += '<table class="rec-table"><thead><tr><th>#</th><th>Player</th><th>G</th><th>Total</th><th>PPG</th></tr></thead><tbody>';
        (data.career_total || []).forEach(function(p, i) {
          html += '<tr data-pid="' + escapeAttr(p.player_id) + '"><td><span class="rec-rank ' + rankClass(i) + '">' + (i + 1) + '</span></td>';
          html += '<td>' + escapeHtml(p.name) + posChip(p.position) + '</td>';
          html += '<td>' + p.games + '</td><td class="rec-fpts">' + p.total_fpts + '</td><td>' + p.ppg + '</td></tr>';
        });
        html += '</tbody></table></div>';
      }

      html += '</div>';
      el.querySelector('.rec-content').innerHTML = html;
    }

    el.querySelector('#rec-pos-tabs').addEventListener('click', function(e) {
      var tab = e.target.closest('.lp-pos-tab');
      if (!tab) return;
      el.querySelectorAll('#rec-pos-tabs .lp-pos-tab').forEach(function(t) { t.classList.remove('active'); });
      tab.classList.add('active');
      currentPosition = tab.getAttribute('data-pos') || '';
      load();
    });

    load();
  }});

  // ─── ROSTER BUILDER ──────────────────────────────────────────
  defs.push({ name: 'rosterbuilder', render: function(el) {
    if (showNflOnlyMsg(el, 'rosterbuilder', 'Roster Builder', 'build and grade your dynasty roster')) return;
    var rosterIds = [];
    var gradeData = null;
    var searchTimeout = null;

    function gradeColor(grade) {
      if (!grade) return 'var(--ink-light)';
      var g = grade.charAt(0);
      if (g === 'A') return 'var(--green)';
      if (g === 'B') return 'var(--blue)';
      if (g === 'C') return 'var(--orange)';
      return 'var(--red)';
    }

    el.innerHTML =
      '<div class="lp-page">' +
        '<div class="lp-header"><h2>Roster Builder</h2>' +
        '<div class="lp-subtitle">build your squad and grade it</div></div>' +
        '<div class="rbld-layout">' +
          '<div class="rbld-left">' +
            '<div class="rbld-search-area">' +
              '<input type="text" class="lp-search rbld-search" placeholder="search player to add...">' +
              '<div class="rbld-autocomplete"></div>' +
            '</div>' +
            '<div class="rbld-slot-count">0 / 25</div>' +
            '<ul class="rbld-roster-list"><li class="rbld-empty">add players to start building</li></ul>' +
            '<button class="rbld-clear-btn">Clear Roster</button>' +
          '</div>' +
          '<div class="rbld-right">' +
            '<div class="rbld-grade-empty">add players to see your roster grade</div>' +
            '<div class="rbld-grade-content" style="display:none">' +
              '<div class="rbld-grade-card"><div class="rbld-grade-letter"></div><div class="rbld-grade-score"></div><div class="rbld-total-tv"></div></div>' +
              '<div class="rbld-dim-bars"></div>' +
              '<div class="rbld-pos-grid"></div>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>';

    function searchPlayers(query) {
      fetch('/api/players/quick-search?q=' + encodeURIComponent(query) + '&limit=8', { signal: _panelSignal() }).then(function(r) {
        return r.ok ? r.json() : { players: [] };
      }).then(function(data) {
        var players = data.players || data || [];
        var ac = el.querySelector('.rbld-autocomplete');
        var html = '';
        players.forEach(function(p) {
          if (rosterIds.indexOf(p.player_id) !== -1) return;
          html += '<div class="rbld-ac-item" data-pid="' + escapeAttr(p.player_id) + '">';
          html += '<span class="rbld-ac-pos ' + escapeHtml(p.position) + '">' + escapeHtml(p.position) + '</span>';
          html += '<span>' + escapeHtml(p.full_name || p.display_name || '') + '</span>';
          html += '<span class="rbld-ac-team">' + escapeHtml(p.team || '') + '</span></div>';
        });
        ac.innerHTML = html;
        ac.style.display = html ? 'block' : 'none';
      }).catch(function() {
        var ac = el.querySelector('.rbld-autocomplete');
        if (ac) ac.style.display = 'none';
      });
    }

    function addPlayer(pid) {
      if (rosterIds.length >= 25 || rosterIds.indexOf(pid) !== -1) return;
      rosterIds.push(pid);
      fetchGrade();
    }

    function removePlayer(pid) {
      rosterIds = rosterIds.filter(function(id) { return id !== pid; });
      if (rosterIds.length === 0) { gradeData = null; renderEmpty(); }
      else fetchGrade();
    }

    function fetchGrade() {
      if (!rosterIds.length) return;
      var headers = { 'Content-Type': 'application/json' };
      var token = localStorage.getItem('razzle_token');
      if (token) headers['Authorization'] = 'Bearer ' + token;
      fetch('/api/roster-grade', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({ player_ids: rosterIds }),
        signal: _panelSignal()
      }).then(function(r) {
        if (r.status === 401 || r.status === 403) {
          el.querySelector('.rbld-grade-empty').style.display = 'block';
          el.querySelector('.rbld-grade-content').style.display = 'none';
          el.querySelector('.rbld-grade-empty').innerHTML =
            '<div style="font-family:var(--font-mono); font-size:14px;">Roster Grading requires Pro</div>' +
            '<a href="/pricing.html" style="font-family:var(--font-mono); font-size:11px; color:var(--orange);">Upgrade &rarr;</a>';
          return null;
        }
        if (!r.ok) throw new Error('fail');
        return r.json();
      }).then(function(data) {
        if (!data) return;
        if (data.error) { renderEmpty(); return; }
        gradeData = data;
        render();
      }).catch(function() { renderEmpty(); });
    }

    function renderEmpty() {
      el.querySelector('.rbld-slot-count').textContent = rosterIds.length + ' / 25';
      el.querySelector('.rbld-roster-list').innerHTML = '<li class="rbld-empty">add players to start building</li>';
      el.querySelector('.rbld-grade-empty').style.display = 'block';
      el.querySelector('.rbld-grade-content').style.display = 'none';
    }

    function render() {
      var d = gradeData;
      if (!d || !d.players) return renderEmpty();
      el.querySelector('.rbld-slot-count').textContent = d.player_count + ' / 25';

      var html = '';
      d.players.forEach(function(p) {
        var vorpCls = p.vorp >= 0 ? 'positive' : 'negative';
        html += '<li class="rbld-player-row">';
        html += '<span class="rbld-ac-pos ' + escapeHtml(p.position) + '">' + escapeHtml(p.position) + '</span>';
        html += '<span class="rbld-player-name">' + escapeHtml(p.full_name) + '</span>';
        html += '<span class="rbld-player-team">' + escapeHtml(p.team) + '</span>';
        html += '<span class="rbld-player-tv">' + fmt(p.trade_value) + '</span>';
        html += '<span class="rbld-player-vorp ' + vorpCls + '">' + (p.vorp >= 0 ? '+' : '') + fmt(p.vorp) + '</span>';
        html += '<button class="rbld-remove-btn" data-pid="' + escapeAttr(p.player_id) + '">&times;</button>';
        html += '</li>';
      });
      el.querySelector('.rbld-roster-list').innerHTML = html;
      el.querySelectorAll('.rbld-remove-btn').forEach(function(btn) {
        btn.addEventListener('click', function() { removePlayer(this.getAttribute('data-pid')); });
      });

      el.querySelector('.rbld-grade-empty').style.display = 'none';
      el.querySelector('.rbld-grade-content').style.display = 'block';
      el.querySelector('.rbld-grade-letter').textContent = d.overall_grade;
      el.querySelector('.rbld-grade-letter').style.color = gradeColor(d.overall_grade);
      el.querySelector('.rbld-grade-score').textContent = d.overall_score + ' / 100';
      el.querySelector('.rbld-total-tv').textContent = 'Total Trade Value: ' + fmt(d.total_trade_value);

      var dims = d.dimensions || {};
      var dimLabels = [
        { key: 'trade_value', label: 'Trade Value', cls: 'tv' },
        { key: 'vorp', label: 'VORP', cls: 'vorp' },
        { key: 'age_balance', label: 'Age Balance', cls: 'age' },
        { key: 'positional_depth', label: 'Positional Depth', cls: 'depth' }
      ];
      var dimHtml = '';
      dimLabels.forEach(function(dim) {
        var val = dims[dim.key] || 0;
        dimHtml += '<div class="rbld-dim-row"><div class="rbld-dim-label"><span>' + escapeHtml(dim.label) + '</span><span>' + fmt(val, 0) + '</span></div>';
        dimHtml += '<div class="rbld-dim-bar"><div class="rbld-dim-fill ' + dim.cls + '" style="width:' + Math.min(100, val) + '%"></div></div></div>';
      });
      el.querySelector('.rbld-dim-bars').innerHTML = dimHtml;

      var posSummary = d.position_summary || {};
      var posHtml = '';
      ['QB', 'RB', 'WR', 'TE'].forEach(function(pos) {
        var ps = posSummary[pos] || { count: 0, avg_trade_value: 0, total_vorp: 0 };
        posHtml += '<div class="rbld-pos-item ' + pos + '"><div class="rbld-pos-item-label">' + pos + '</div>';
        posHtml += '<div class="rbld-pos-item-count">' + ps.count + '</div>';
        posHtml += '<div class="rbld-pos-item-meta">Avg TV: ' + fmt(ps.avg_trade_value) + '</div>';
        posHtml += '<div class="rbld-pos-item-meta">VORP: ' + (ps.total_vorp >= 0 ? '+' : '') + fmt(ps.total_vorp) + '</div></div>';
      });
      el.querySelector('.rbld-pos-grid').innerHTML = posHtml;
    }

    el.querySelector('.rbld-search').addEventListener('input', function() {
      clearTimeout(searchTimeout);
      var q = this.value.trim();
      if (q.length < 2) { el.querySelector('.rbld-autocomplete').style.display = 'none'; return; }
      searchTimeout = setTimeout(function() { searchPlayers(q); }, 200);
    });

    // Event delegation for autocomplete items (avoids listener leak per search)
    el.querySelector('.rbld-autocomplete').addEventListener('click', function(e) {
      var item = e.target.closest('.rbld-ac-item');
      if (!item) return;
      var pid = item.getAttribute('data-pid');
      addPlayer(pid);
      this.style.display = 'none';
      el.querySelector('.rbld-search').value = '';
    });

    if (!el._docClickBound) {
      el._docClickBound = true;
      document.addEventListener('click', function(e) {
        if (!e.target.closest('.rbld-search-area')) el.querySelector('.rbld-autocomplete').style.display = 'none';
      });
    }

    el.querySelector('.rbld-clear-btn').addEventListener('click', function() {
      rosterIds = []; gradeData = null; renderEmpty();
    });
  }});

  // ─── SCHEDULE (SOS) ──────────────────────────────────────────
  defs.push({ name: 'schedule', render: function(el) {
    var currentPosition = '';
    var currentData = null;
    var sortState = {
      schedule_suppressed: { col: 'sos_delta', dir: -1 },
      schedule_inflated: { col: 'sos_delta', dir: 1 }
    };

    function gradeClass(grade) {
      if (!grade) return 'grade-f';
      var g = grade.charAt(0);
      if (g === 'A') return grade === 'A+' ? 'grade-aplus' : 'grade-a';
      if (g === 'B') return 'grade-b'; if (g === 'C') return 'grade-c';
      if (g === 'D') return 'grade-d'; return 'grade-f';
    }

    var SUPP_COLS = [
      { key: 'name', label: 'Player' }, { key: 'ppg', label: 'PPG' },
      { key: 'grade', label: 'SOS' }, { key: 'sos_rank', label: 'Rank' },
      { key: 'avg_opp_ppg', label: 'Opp PPG' }, { key: 'sos_delta', label: 'Delta' }
    ];
    var INF_COLS = [
      { key: 'name', label: 'Player' }, { key: 'ppg', label: 'PPG' },
      { key: 'grade', label: 'SOS' }, { key: 'sos_rank', label: 'Rank' },
      { key: 'avg_opp_ppg', label: 'Opp PPG' }, { key: 'sos_delta', label: 'Delta' }
    ];

    function getCols(section) { return section === 'schedule_suppressed' ? SUPP_COLS : INF_COLS; }

    el.innerHTML =
      '<div class="lp-page">' +
        '<div class="lp-header"><h2>Strength of Schedule</h2>' +
        '<div class="lp-subtitle">who had it easy and who didn\'t</div></div>' +
        '<div class="lp-controls">' +
          '<select class="lp-select sos2-season">' + seasonOptions() + '</select>' +
          posTabsHTML('sos2-pos-tabs', true) +
        '</div>' +
        '<div class="sos2-content"><div class="lp-loading">scouting the schedule...</div></div>' +
      '</div>';

    function sortPlayers(players, col, dir) {
      return players.slice().sort(function(a, b) {
        var va = a[col], vb = b[col];
        if (va == null) va = -Infinity; if (vb == null) vb = -Infinity;
        if (typeof va === 'string') return dir * va.localeCompare(vb);
        return dir * (vb - va);
      });
    }

    function buildRow(p, section) {
      var pos = (p.position || 'RB').toLowerCase();
      var cols = getCols(section);
      var html = '<tr data-pid="' + escapeAttr(p.player_id) + '">';
      cols.forEach(function(col) {
        if (col.key === 'name') {
          html += '<td><div class="sos2-player-cell">';
          if (p.headshot_url) html += '<img class="sos2-headshot" src="' + escapeAttr(p.headshot_url) + '" alt="Player headshot" loading="lazy" onerror="this.onerror=null;this.src=\'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 40 40%22><circle cx=%2220%22 cy=%2220%22 r=%2220%22 fill=%22%23d97757%22/><text x=%2220%22 y=%2225%22 text-anchor=%22middle%22 fill=%22white%22 font-size=%2216%22>?</text></svg>\'">';
          html += '<div><div class="sos2-player-name">' + escapeHtml(p.name) + '</div>';
          html += '<div class="sos2-player-meta"><span class="sos2-pos-badge ' + pos + '">' + escapeHtml(p.position) + '</span> ' + escapeHtml(p.team) + '</div></div></div></td>';
        } else if (col.key === 'grade') {
          html += '<td class="center"><span class="sos2-grade-badge ' + gradeClass(p.grade || 'C') + '">' + escapeHtml(p.grade || 'C') + '</span></td>';
        } else if (col.key === 'ppg') {
          html += '<td class="center" style="font-weight:700">' + fmt(p.ppg) + '</td>';
        } else if (col.key === 'sos_rank') {
          html += '<td class="center">#' + p.sos_rank + '</td>';
        } else if (col.key === 'avg_opp_ppg') {
          html += '<td class="center">' + fmt(p.avg_opp_ppg) + '</td>';
        } else if (col.key === 'sos_delta') {
          var d = p.sos_delta || 0;
          var cls = d > 0 ? 'hard' : 'easy';
          html += '<td class="center"><span class="sos2-delta ' + cls + '">' + (d > 0 ? '+' : '') + fmt(d) + '</span></td>';
        } else {
          html += '<td class="center">' + (p[col.key] != null ? escapeHtml(String(p[col.key])) : '-') + '</td>';
        }
      });
      html += '</tr>';
      return html;
    }

    function buildHeader(section) {
      var st = sortState[section];
      var cols = getCols(section);
      var html = '<thead><tr>';
      cols.forEach(function(col) {
        var sorted = st.col === col.key;
        var arrow = sorted ? (st.dir === 1 ? ' &#9650;' : ' &#9660;') : '';
        html += '<th' + (col.key !== 'name' ? ' class="center"' : '') + ' data-sort="' + col.key + '" data-section="' + section + '">' + col.label + '<span class="sort-arrow">' + arrow + '</span></th>';
      });
      html += '</tr></thead>';
      return html;
    }

    function buildTable(players, section) {
      if (!players || !players.length) return '<div class="panel-empty">' + razzleEmpty() + '<span class="hint">try a different position or season</span></div>';
      var isSuppressed = section === 'schedule_suppressed';
      var title = isSuppressed ? '&#x1F6E1; Schedule Suppressed' : '&#x1F36D; Schedule Inflated';
      var st = sortState[section];
      var sorted = sortPlayers(players, st.col, st.dir);
      var html = '<div class="sos2-section"><div class="sos2-section-header ' + (isSuppressed ? 'suppressed' : 'inflated') + '">' + title + ' <span style="font-family:var(--font-hand);font-size:16px;color:var(--ink-light);font-weight:400">(' + players.length + ' players)</span></div>';
      html += '<table class="sos2-table" data-section="' + section + '">' + buildHeader(section) + '<tbody>';
      sorted.forEach(function(p) { html += buildRow(p, section); });
      html += '</tbody></table></div>';
      return html;
    }

    function render(data) {
      currentData = data;
      var content = el.querySelector('.sos2-content');
      if (!data || (!(data.schedule_suppressed && data.schedule_suppressed.length) && !(data.schedule_inflated && data.schedule_inflated.length))) {
        content.innerHTML = '<div class="panel-empty">' + razzleEmpty() + '<span class="hint">try a different position or season</span></div>';
        return;
      }
      var html = buildTable(data.schedule_suppressed, 'schedule_suppressed') + buildTable(data.schedule_inflated, 'schedule_inflated');
      content.innerHTML = html;
      content.querySelectorAll('th[data-sort]').forEach(function(th) {
        th.addEventListener('click', function() {
          var col = th.getAttribute('data-sort');
          var sec = th.getAttribute('data-section');
          if (sortState[sec].col === col) sortState[sec].dir *= -1;
          else { sortState[sec].col = col; sortState[sec].dir = -1; }
          render(currentData);
        });
      });
      content.querySelectorAll('tr[data-pid]').forEach(function(tr) {
        tr.addEventListener('click', function() {
          var pid = tr.getAttribute('data-pid');
          if (pid) if (typeof openPlayerPopup === 'function') openPlayerPopup(pid); else window.location.href = '/player/' + encodeURIComponent(pid);
        });
      });
    }

    function load() {
      var content = el.querySelector('.sos2-content');
      content.innerHTML = '<div class="lp-loading">scouting the schedule...</div>';
      var season = el.querySelector('.sos2-season').value || '';
      var url = '/api/strength-of-schedule?limit=30';
      if (season) url += '&season=' + season;
      if (currentPosition) url += '&position=' + currentPosition;

      fetch(url, { signal: _panelSignal() }).then(function(r) {
        if (!r.ok) throw new Error('API error');
        return r.json();
      }).then(function(data) {
        if (data.available_seasons) {
          var sel = el.querySelector('.sos2-season');
          sel.innerHTML = '';
          var _opts = '';
          (data.available_seasons || []).forEach(function(s) {
            _opts += '<option value="' + escapeHtml(String(s)) + '"' + (s === data.season ? ' selected' : '') + '>' + escapeHtml(String(s)) + '</option>';
          });
          sel.innerHTML = _opts;
        }
        render(data);
      }).catch(function() {
        content.innerHTML = '<div class="panel-error">' + razzleError() + '<br><button onclick="location.reload()">retry</button></div>';
      });
    }

    el.querySelector('#sos2-pos-tabs').addEventListener('click', function(e) {
      var tab = e.target.closest('.lp-pos-tab');
      if (!tab) return;
      el.querySelectorAll('#sos2-pos-tabs .lp-pos-tab').forEach(function(t) { t.classList.remove('active'); });
      tab.classList.add('active');
      currentPosition = tab.getAttribute('data-pos') || '';
      load();
    });

    el.querySelector('.sos2-season').addEventListener('change', function() { load(); });
    load();
  }});

  // ─── SCORING ─────────────────────────────────────────────────
  defs.push({ name: 'scoring', render: function(el) {
    var state = { season: 0, position: '', data: null };

    el.innerHTML =
      '<div class="lp-page">' +
        '<div class="lp-header"><h2>Scoring Format Comparison</h2>' +
        '<div class="lp-subtitle">PPR vs Half vs Standard rank shifts</div></div>' +
        '<div class="lp-controls">' +
          '<select class="lp-select sc2-season">' + seasonOptions() + '</select>' +
          posTabsHTML('sc2-pos-tabs', true) +
        '</div>' +
        '<div class="sc2-content"><div class="lp-loading">comparing scoring formats...</div></div>' +
      '</div>';

    function buildTable(players) {
      if (!players || !players.length) return '<div class="panel-empty">' + razzleEmpty() + '<span class="hint">try a different position or season</span></div>';
      var html = '<table class="sc2-table"><thead><tr>';
      html += '<th scope="col">Pos</th><th>Player</th><th>Team</th>';
      html += '<th scope="col">PPR PPG</th><th>Half PPG</th><th>Std PPG</th>';
      html += '<th scope="col">PPR Rank</th><th>Std Rank</th><th>Shift</th>';
      html += '</tr></thead><tbody>';
      players.forEach(function(p) {
        var shiftClass = p.rank_diff > 0 ? 'up' : (p.rank_diff < 0 ? 'down' : 'neutral');
        var shiftText = p.rank_diff > 0 ? ('+' + p.rank_diff) : String(p.rank_diff);
        html += '<tr data-pid="' + escapeAttr(p.player_id) + '">';
        html += '<td><span class="sc2-pos-badge ' + escapeHtml(p.position) + '">' + escapeHtml(p.position) + '</span></td>';
        html += '<td>';
        if (p.headshot_url) html += '<img class="sc2-headshot" src="' + escapeAttr(p.headshot_url) + '" alt="Player headshot" onerror="this.onerror=null;this.src=\'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 40 40%22><circle cx=%2220%22 cy=%2220%22 r=%2220%22 fill=%22%23d97757%22/><text x=%2220%22 y=%2225%22 text-anchor=%22middle%22 fill=%22white%22 font-size=%2216%22>?</text></svg>\'" loading="lazy">';
        html += escapeHtml(p.full_name) + '</td>';
        html += '<td>' + escapeHtml(p.team) + '</td>';
        html += '<td>' + fmt(p.ppg_ppr) + '</td><td>' + fmt(p.ppg_half) + '</td><td>' + fmt(p.ppg_std) + '</td>';
        html += '<td>' + p.rank_ppr + '</td><td>' + p.rank_std + '</td>';
        html += '<td><span class="sc2-rank-shift ' + shiftClass + '">' + escapeHtml(shiftText) + '</span></td>';
        html += '</tr>';
      });
      html += '</tbody></table>';
      return html;
    }

    function load() {
      var content = el.querySelector('.sc2-content');
      content.innerHTML = '<div class="lp-loading">comparing scoring formats...</div>';
      var url = '/api/scoring-comparison?';
      if (state.season) url += 'season=' + state.season + '&';
      if (state.position) url += 'position=' + state.position;

      fetch(url, { signal: _panelSignal() }).then(function(r) {
        if (!r.ok) throw new Error('fail');
        return r.json();
      }).then(function(data) {
        state.data = data;
        if (data.available_seasons) {
          var sel = el.querySelector('.sc2-season');
          sel.innerHTML = '';
          var _opts = '';
          (data.available_seasons || []).forEach(function(s) {
            _opts += '<option value="' + escapeHtml(String(s)) + '"' + (s === data.season ? ' selected' : '') + '>' + escapeHtml(String(s)) + '</option>';
          });
          sel.innerHTML = _opts;
        }
        state.season = data.season;
        render(data);
      }).catch(function() {
        content.innerHTML = '<div class="panel-error">' + razzleError() + '<br><button onclick="location.reload()">retry</button></div>';
      });
    }

    function render(data) {
      var content = el.querySelector('.sc2-content');
      var html = '<div class="sc2-section"><div class="sc2-section-header risers">&#x2B06; PPR Risers</div>' + buildTable(data.risers) + '</div>';
      html += '<div class="sc2-section"><div class="sc2-section-header fallers">&#x2B07; PPR Fallers</div>' + buildTable(data.fallers) + '</div>';
      content.innerHTML = html;
      content.querySelectorAll('tr[data-pid]').forEach(function(tr) {
        tr.addEventListener('click', function() {
          var pid = tr.getAttribute('data-pid');
          if (pid) if (typeof openPlayerPopup === 'function') openPlayerPopup(pid); else window.location.href = '/player/' + encodeURIComponent(pid);
        });
      });
    }

    el.querySelector('#sc2-pos-tabs').addEventListener('click', function(e) {
      var tab = e.target.closest('.lp-pos-tab');
      if (!tab) return;
      el.querySelectorAll('#sc2-pos-tabs .lp-pos-tab').forEach(function(t) { t.classList.remove('active'); });
      tab.classList.add('active');
      state.position = tab.getAttribute('data-pos') || '';
      load();
    });

    el.querySelector('.sc2-season').addEventListener('change', function() {
      state.season = parseInt(this.value, 10) || 0;
      load();
    });

    load();
  }});

  // ─── SUCCESS RATE ────────────────────────────────────────────
  defs.push({ name: 'successrate', render: function(el) {
    var state = { season: 0, position: '', data: null };

    function rateClass(r) {
      if (r >= 45) return 'sr2-rate-high';
      if (r >= 35) return 'sr2-rate-mid';
      return 'sr2-rate-low';
    }

    el.innerHTML =
      '<div class="lp-page">' +
        '<div class="lp-header"><h2>Success Rate</h2>' +
        '<div class="lp-subtitle">who converts when it matters</div></div>' +
        '<div class="lp-controls">' +
          '<select class="lp-select sr2-season">' + seasonOptions() + '</select>' +
          weekSelectHTML('sr2-week') +
          posTabsHTML('sr2-pos-tabs', true) +
        '</div>' +
        '<div class="sr2-content"><div class="lp-loading">' + razzleLoading() + '</div></div>' +
      '</div>';

    function load() {
      var content = el.querySelector('.sr2-content');
      content.innerHTML = '<div class="lp-loading">' + razzleLoading() + '</div>';
      var url = '/api/success-rate?season=' + (state.season || _latestSeason);
      if (state.position) url += '&position=' + state.position;
      var sr2WeekVal = parseInt((el.querySelector('#sr2-week') || {}).value) || 0;
      if (sr2WeekVal > 0) url += '&week=' + sr2WeekVal;

      fetch(url, { signal: _panelSignal() }).then(function(r) {
        if (!r.ok) throw new Error('API error');
        return r.json();
      }).then(function(data) {
        state.data = data;
        render(data);
      }).catch(function() {
        content.innerHTML = '<div class="panel-error">' + razzleError() + '<br><button onclick="location.reload()">retry</button></div>';
      });
    }

    function render(data) {
      var content = el.querySelector('.sr2-content');
      var players = data.players || [];
      if (!players.length) {
        content.innerHTML = '<div class="panel-empty">' + razzleEmpty() + '<span class="hint">try a different position or season</span></div>';
        return;
      }

      var maxSR = 0;
      players.forEach(function(p) { if (p.success_rate > maxSR) maxSR = p.success_rate; });

      var html = '<table class="sr2-table"><thead><tr>';
      html += '<th scope="col">#</th><th>Player</th><th>Pos</th><th>SR%</th><th>Type</th><th>Vol</th><th>PPG</th><th>YPC</th><th></th>';
      html += '</tr></thead><tbody>';

      players.forEach(function(p, i) {
        var posColor = POS_COLORS[p.position] || (typeof getCanvasTheme === 'function' ? getCanvasTheme().ink : '#2d1f14');
        var cls = rateClass(p.success_rate);
        var barPct = maxSR > 0 ? p.success_rate / maxSR * 100 : 0;
        var ypc = p.ypc != null ? escapeHtml(String(p.ypc)) : '-';
        html += '<tr>';
        html += '<td class="sr2-rank">' + (i + 1) + '</td>';
        html += '<td>' + escapeHtml(p.name) + ' <span style="color:var(--ink-light);font-size:11px">' + escapeHtml(p.team) + '</span></td>';
        html += '<td><span class="sr2-pos-badge" style="background:' + posColor + '">' + escapeHtml(p.position) + '</span></td>';
        html += '<td><span class="sr2-rate-badge ' + cls + '">' + fmt(p.success_rate) + '%</span></td>';
        html += '<td><span class="sr2-type-chip">' + escapeHtml(p.sr_type) + '</span></td>';
        html += '<td>' + fmt(p.volume, 0) + '</td>';
        html += '<td>' + fmt(p.ppg) + '</td>';
        html += '<td>' + ypc + '</td>';
        html += '<td class="sr2-bar-cell"><div class="sr2-bar" style="width:' + barPct + '%"></div></td>';
        html += '</tr>';
      });
      html += '</tbody></table>';
      content.innerHTML = html;
    }

    el.querySelector('#sr2-pos-tabs').addEventListener('click', function(e) {
      var tab = e.target.closest('.lp-pos-tab');
      if (!tab) return;
      el.querySelectorAll('#sr2-pos-tabs .lp-pos-tab').forEach(function(t) { t.classList.remove('active'); });
      tab.classList.add('active');
      state.position = tab.getAttribute('data-pos') || '';
      load();
    });

    el.querySelector('.sr2-season').addEventListener('change', function() {
      state.season = parseInt(this.value, 10) || 0;
      populateWeekSelect(el, 'sr2-week', this.value, load);
      load();
    });

    populateWeekSelect(el, 'sr2-week', String(_latestSeason), load);
    load();
  }});

  // ─── TARGETS ─────────────────────────────────────────────────
  defs.push({ name: 'targets', render: function(el) {
    var currentData = null;
    var activeMode = 'targets';
    function getPosLight() {
      var isDark = document.documentElement.getAttribute("data-theme") === "dark";
      if (isDark) {
        return { QB: '#2a3352', RB: '#1a3a35', WR: '#5c3325', TE: '#3a2852' };
      }
      return { QB: '#dde4f7', RB: '#d9efec', WR: '#f7e4d8', TE: '#e5dcf7' };
    }

    el.innerHTML =
      '<div class="lp-page">' +
        '<div class="lp-header"><h2>Target Distribution</h2>' +
        '<div class="lp-subtitle">who\'s eating on each team</div></div>' +
        '<div class="lp-controls">' +
          '<select class="lp-select td2-season"></select>' +
          weekSelectHTML('td2-week') +
          '<select class="lp-select td2-team"><option value="">All Teams</option></select>' +
          '<div class="td2-mode-tabs">' +
            '<button class="td2-mode-tab active" data-mode="targets">Targets</button>' +
            '<button class="td2-mode-tab" data-mode="carries">Carries</button>' +
          '</div>' +
        '</div>' +
        '<div class="td2-content"><div class="lp-loading">studying the film...</div></div>' +
      '</div>';

    function getAnnotation(team, mode) {
      if (!team.players || !team.players.length) return '';
      var top = team.players[0];
      var share = mode === 'targets' ? top.target_share : top.carry_share;
      if (share > 30) return escapeHtml((top.name || '').split(' ').pop() || top.name || '') + ' owns this ' + mode.slice(0, -1) + ' tree';
      if (share > 22) return escapeHtml((top.name || '').split(' ').pop() || top.name || '') + ' leads the way';
      return 'spread it around';
    }

    function load() {
      var content = el.querySelector('.td2-content');
      content.innerHTML = '<div class="lp-loading">studying the film...</div>';
      var season = el.querySelector('.td2-season').value || '';
      var team = el.querySelector('.td2-team').value || '';
      var td2WeekVal = parseInt((el.querySelector('#td2-week') || {}).value) || 0;
      var url = '/api/target-distribution?';
      if (season) url += 'season=' + season + '&';
      if (team) url += 'team=' + team + '&';
      if (td2WeekVal > 0) url += 'week=' + td2WeekVal;

      fetch(url, { signal: _panelSignal() }).then(function(r) {
        if (!r.ok) throw new Error('API error');
        return r.json();
      }).then(function(data) {
        currentData = data;
        populateSeasons(data.available_seasons, data.season);
        populateTeams(data.teams);
        var td2SeasonSel = el.querySelector('.td2-season');
        if (td2SeasonSel && td2SeasonSel.value) populateWeekSelect(el, 'td2-week', td2SeasonSel.value, load);
        renderDistribution(data);
      }).catch(function() {
        content.innerHTML = '<div class="panel-error">' + (typeof razzleError === 'function' ? razzleError() : 'fumbled the data...') + '<br><button onclick="location.reload()">retry</button></div>';
      });
    }

    function populateSeasons(seasons, current) {
      var sel = el.querySelector('.td2-season');
      if (sel.options.length > 0) return;
      var _opts = '';
      (seasons || []).forEach(function(s) {
        _opts += '<option value="' + escapeHtml(String(s)) + '"' + (s === current ? ' selected' : '') + '>' + escapeHtml(String(s)) + '</option>';
      });
      sel.innerHTML = _opts;
    }

    function populateTeams(teams) {
      var sel = el.querySelector('.td2-team');
      if (sel.options.length > 1) return;
      var _opts = '';
      (teams || []).forEach(function(t) {
        _opts += '<option value="' + escapeAttr(t.team) + '">' + escapeHtml(t.team) + '</option>';
      });
      sel.innerHTML += _opts;
    }

    function renderDistribution(data) {
      var content = el.querySelector('.td2-content');
      if (!data.teams || !data.teams.length) {
        content.innerHTML = '<div class="panel-empty">' + razzleEmpty() + '<span class="hint">try a different position or season</span></div>';
        return;
      }

      var html = '';
      data.teams.forEach(function(team) {
        var sortKey = activeMode === 'targets' ? 'targets' : 'carries';
        if (!team.players) team.players = [];
        team.players.sort(function(a, b) { return b[sortKey] - a[sortKey]; });
        var total = activeMode === 'targets' ? team.total_targets : team.total_carries;
        var label = activeMode === 'targets' ? 'Targets' : 'Carries';

        html += '<div class="td2-team-card"><div class="td2-team-header">';
        html += '<div><span class="td2-team-name">' + escapeHtml(team.team_name) + '</span>';
        html += '<span class="td2-team-abbr">' + escapeHtml(team.team) + '</span></div>';
        html += '<div class="td2-team-totals">' + total + ' total ' + label.toLowerCase() + '</div></div>';

        html += '<div class="td2-dist-bar">';
        var otherPct = 100;
        team.players.forEach(function(p) {
          var share = activeMode === 'targets' ? p.target_share : p.carry_share;
          if (!share || share < 2) return;
          otherPct -= share;
          var posColor = POS_COLORS[p.position] || '#d97757';
          var lightColor = getPosLight()[p.position] || '#f7e4d8';
          var lastName = (p.name || '').split(' ').pop() || p.name || '';
          html += '<div class="td2-dist-seg" style="width:' + share + '%;background:' + lightColor + ';border-right:2px solid ' + posColor + '" title="' + escapeAttr(p.name) + ': ' + share + '%">';
          if (share > 8) html += '<span class="td2-seg-label">' + escapeHtml(lastName) + '</span>';
          html += '</div>';
        });
        if (otherPct > 2) {
          html += '<div class="td2-dist-seg" style="width:' + Math.max(otherPct, 0).toFixed(1) + '%;background:var(--bg-warm)">';
          if (otherPct > 8) html += '<span class="td2-seg-label" style="color:var(--ink-light)">other</span>';
          html += '</div>';
        }
        html += '</div>';

        var ann = getAnnotation(team, activeMode);
        if (ann) html += '<div class="td2-annotation">' + ann + '</div>';

        html += '<div class="td2-players">';
        team.players.forEach(function(p) {
          var share = activeMode === 'targets' ? p.target_share : p.carry_share;
          var count = activeMode === 'targets' ? p.targets : p.carries;
          if (count === 0) return;
          var posColor = POS_COLORS[p.position] || '#d97757';
          html += '<div class="td2-player-row" data-pid="' + escapeAttr(p.player_id) + '">';
          html += '<div class="td2-player-pos" style="background:' + posColor + '">' + escapeHtml(p.position) + '</div>';
          html += '<div class="td2-player-name">' + escapeHtml(p.name) + '</div>';
          html += '<div class="td2-player-stat">' + count + ' ' + (activeMode === 'targets' ? 'tgt' : 'car') + '</div>';
          html += '<div class="td2-player-share">' + share + '%</div>';
          html += '</div>';
        });
        html += '</div></div>';
      });

      content.innerHTML = html;
      content.querySelectorAll('[data-pid]').forEach(function(row) {
        row.addEventListener('click', function() {
          var pid = row.getAttribute('data-pid');
          if (pid) if (typeof openPlayerPopup === 'function') openPlayerPopup(pid); else window.location.href = '/player/' + encodeURIComponent(pid);
        });
      });
    }

    el.querySelectorAll('.td2-mode-tab').forEach(function(tab) {
      tab.addEventListener('click', function() {
        el.querySelectorAll('.td2-mode-tab').forEach(function(t) { t.classList.remove('active'); });
        tab.classList.add('active');
        activeMode = tab.getAttribute('data-mode');
        if (currentData) renderDistribution(currentData);
      });
    });

    el.querySelector('.td2-season').addEventListener('change', function() {
      populateWeekSelect(el, 'td2-week', this.value, load);
      load();
    });
    el.querySelector('.td2-team').addEventListener('change', load);
    load();
  }});

  // ─── TEAM ROSTER ─────────────────────────────────────────────
  defs.push({ name: 'team', render: function(el) {
    var state = { team: '', season: 0, data: null };
    var GROUP_ORDER = ['QB', 'RB', 'WR', 'TE'];
    var GROUP_LABELS = { QB: 'Quarterbacks', RB: 'Running Backs', WR: 'Wide Receivers', TE: 'Tight Ends' };
    var GROUP_ANNOTATIONS = { QB: 'the signal callers', RB: 'ground game crew', WR: 'pass catchers', TE: 'the big targets' };

    function getStatsForPosition(pos) {
      if (pos === 'QB') return [{ key: 'ppg', label: 'PPG' }, { key: 'passing_yards', label: 'Pass Yds' }, { key: 'passing_tds', label: 'Pass TD' }, { key: 'rushing_yards', label: 'Rush Yds' }, { key: 'games', label: 'GP' }];
      if (pos === 'RB') return [{ key: 'ppg', label: 'PPG' }, { key: 'rushing_yards', label: 'Rush Yds' }, { key: 'rushing_tds', label: 'Rush TD' }, { key: 'receptions', label: 'Rec' }, { key: 'games', label: 'GP' }];
      if (pos === 'WR') return [{ key: 'ppg', label: 'PPG' }, { key: 'receiving_yards', label: 'Rec Yds' }, { key: 'receiving_tds', label: 'Rec TD' }, { key: 'receptions', label: 'Rec' }, { key: 'games', label: 'GP' }];
      if (pos === 'TE') return [{ key: 'ppg', label: 'PPG' }, { key: 'receiving_yards', label: 'Rec Yds' }, { key: 'receiving_tds', label: 'Rec TD' }, { key: 'receptions', label: 'Rec' }, { key: 'games', label: 'GP' }];
      return [{ key: 'ppg', label: 'PPG' }, { key: 'games', label: 'GP' }];
    }

    function fmtStat(value) {
      if (value == null) return '-';
      if (typeof value === 'number') return value % 1 === 0 ? String(value) : value.toFixed(1);
      return String(value);
    }

    el.innerHTML =
      '<div class="lp-page">' +
        '<div class="lp-header"><h2 class="tm-title">Team Roster</h2>' +
        '<div class="lp-subtitle tm-subtitle">scouting the depth chart</div></div>' +
        '<div class="lp-controls">' +
          '<select class="lp-select tm-team"><option value="">Select a team</option></select>' +
          '<select class="lp-select tm-season">' + seasonOptions() + '</select>' +
        '</div>' +
        '<div class="tm-content"><div class="lp-loading">' + razzleLoading() + '</div></div>' +
      '</div>';

    function load() {
      var content = el.querySelector('.tm-content');
      content.innerHTML = '<div class="lp-loading">' + razzleLoading() + '</div>';
      var url = '/api/team-roster';
      var params = [];
      if (state.team) params.push('team=' + encodeURIComponent(state.team));
      var season = el.querySelector('.tm-season').value;
      if (season) params.push('season=' + season);
      if (params.length) url += '?' + params.join('&');

      fetch(url, { signal: _panelSignal() }).then(function(r) {
        if (!r.ok) throw new Error('API error');
        return r.json();
      }).then(function(data) {
        state.data = data;
        state.team = data.team || state.team;
        el.querySelector('.tm-title').textContent = (data.team_full_name || data.team) + ' Roster';

        if (data.available_teams) {
          var sel = el.querySelector('.tm-team');
          if (sel.options.length <= 1) {
            sel.innerHTML = '';
            var _opts = '';
            data.available_teams.forEach(function(t) {
              _opts += '<option value="' + escapeAttr(t.abbr) + '"' + (t.abbr === data.team ? ' selected' : '') + '>' + escapeHtml(t.name) + '</option>';
            });
            sel.innerHTML = _opts;
          } else { sel.value = data.team; }
        }
        if (data.available_seasons) {
          var sSel = el.querySelector('.tm-season');
          sSel.innerHTML = '';
          var _opts = '';
          (data.available_seasons || []).forEach(function(s) {
            _opts += '<option value="' + escapeHtml(String(s)) + '"' + (s === data.season ? ' selected' : '') + '>' + escapeHtml(String(s)) + '</option>';
          });
          sSel.innerHTML = _opts;
        }
        renderGroups(data.groups || {});
      }).catch(function() {
        content.innerHTML = '<div class="panel-error">' + razzleError() + '<br><button onclick="location.reload()">retry</button></div>';
      });
    }

    function renderGroups(groups) {
      var content = el.querySelector('.tm-content');
      var totalPlayers = 0;
      for (var k in groups) totalPlayers += (groups[k] || []).length;
      if (!totalPlayers) { content.innerHTML = '<div class="panel-empty">' + razzleEmpty() + '<span class="hint">try a different position or season</span></div>'; return; }

      var html = '<div class="tm-groups">';
      for (var g = 0; g < GROUP_ORDER.length; g++) {
        var pos = GROUP_ORDER[g];
        var players = groups[pos] || [];
        if (!players.length) continue;
        var posLower = pos.toLowerCase();
        var stats = getStatsForPosition(pos);

        html += '<div class="tm-group-card"><div class="tm-group-header pos-' + posLower + '">';
        html += '<div><span class="tm-group-title">' + escapeHtml(GROUP_LABELS[pos] || pos) + '</span>';
        html += ' <span class="tm-group-annotation">' + escapeHtml(GROUP_ANNOTATIONS[pos] || '') + '</span></div>';
        html += '<span class="tm-group-count">' + players.length + '</span></div>';
        html += '<ul class="tm-roster-list">';

        for (var i = 0; i < players.length; i++) {
          var p = players[i];
          var ageBadge = '';
          if (p.age) {
            var ageCls = p.age <= 25 ? 'young' : p.age <= 28 ? 'prime' : 'aging';
            ageBadge = '<span class="tm-age-badge ' + ageCls + '">' + escapeHtml(String(p.age)) + '</span>';
          }
          html += '<li class="tm-player-row" data-pid="' + escapeAttr(p.player_id) + '">';
          html += '<span class="tm-player-rank">' + (i + 1) + '</span>';
          html += playerHeadshot(p, p.position || pos);
          html += '<div class="tm-player-info"><span class="tm-player-name">' + escapeHtml(p.full_name) + '</span>' + ageBadge + '</div>';
          html += '<div class="tm-player-stats">';
          for (var s = 0; s < stats.length; s++) {
            var st = stats[s];
            var ppgCls = st.key === 'ppg' ? ' ppg' : '';
            html += '<div class="tm-stat' + ppgCls + '"><span class="tm-stat-value">' + fmtStat(p[st.key]) + '</span><span class="tm-stat-label">' + escapeHtml(st.label) + '</span></div>';
          }
          html += '</div></li>';
        }
        html += '</ul></div>';
      }
      html += '</div>';
      content.innerHTML = html;
      content.querySelectorAll('.tm-player-row[data-pid]').forEach(function(row) {
        row.addEventListener('click', function() {
          var pid = this.getAttribute('data-pid');
          if (pid) if (typeof openPlayerPopup === 'function') openPlayerPopup(pid); else window.location.href = '/player/' + encodeURIComponent(pid);
        });
      });
    }

    el.querySelector('.tm-team').addEventListener('change', function() {
      state.team = this.value; load();
    });
    el.querySelector('.tm-season').addEventListener('change', function() { load(); });
    load();
  }});

  // ─── TRADE FINDER ────────────────────────────────────────────
  defs.push({ name: 'tradefinder', render: function(el) {
    if (showNflOnlyMsg(el, 'tradefinder', 'Trade Finder', 'find equal-value trade targets')) return;
    var currentData = null;
    var targetPosFilter = '';
    var seasonLoaded = false;
    var TIER_LABELS = { 1: 'Elite', 2: 'Blue Chip', 3: 'Premium', 4: 'Solid', 5: 'Promising', 6: 'Depth', 7: 'Roster Clogger', 8: 'Cut Bait' };

    el.innerHTML =
      '<div class="lp-page">' +
        '<div class="lp-header"><h2>Trade Finder</h2>' +
        '<div class="lp-subtitle">find fair trades, buy low, sell high</div></div>' +
        '<div class="lp-controls">' +
          searchWrapHTML('tf2-', 'search a player...') +
          '<select class="lp-select tf2-season"></select>' +
        '</div>' +
        '<div class="tf2-body"><div class="panel-empty">search for a player to find trade targets</div></div>' +
      '</div>';

    buildPlayerSearch(el, 'tf2-', 'search a player...', function(selected) {
      loadTradeTargets(selected.player_id);
    });

    function stockArrow(trend) {
      if (trend === 'rising') return '<span class="tf2-stock-arrow rising">&#9650;</span>';
      if (trend === 'falling') return '<span class="tf2-stock-arrow falling">&#9660;</span>';
      return '<span class="tf2-stock-arrow stable">&#9644;</span>';
    }

    function valDiffChip(diff) {
      var sign = diff > 0 ? '+' : '';
      var cls = diff > 2 ? 'positive' : (diff < -2 ? 'negative' : 'neutral');
      return '<span class="tf2-val-diff ' + cls + '">' + sign + fmt(diff) + '</span>';
    }

    function loadTradeTargets(playerId) {
      var body = el.querySelector('.tf2-body');
      body.innerHTML = '<div class="lp-loading">scouting trade targets...</div>';
      var season = el.querySelector('.tf2-season').value || '';
      var url = '/api/trade-finder?player_id=' + encodeURIComponent(playerId);
      if (season) url += '&season=' + season;

      fetch(url, { signal: _panelSignal() }).then(function(r) {
        if (!r.ok) throw new Error('API error');
        return r.json();
      }).then(function(data) {
        if (data.error) {
          body.innerHTML = '<div class="panel-error">' + escapeHtml(data.message || data.error) + '</div>';
          return;
        }
        if (!seasonLoaded && data.available_seasons) {
          var sel = el.querySelector('.tf2-season');
          var _opts = '';
          (data.available_seasons || []).forEach(function(s) {
            _opts += '<option value="' + escapeHtml(String(s)) + '">' + escapeHtml(String(s)) + '</option>';
          });
          sel.innerHTML = _opts;
          sel.value = data.season;
          seasonLoaded = true;
        }
        currentData = data;
        targetPosFilter = '';
        render(data);
      }).catch(function() {
        body.innerHTML = '<div class="panel-error">' + (typeof razzleError === 'function' ? razzleError() : 'the trade finder fumbled... try again.') + '<br><button onclick="location.reload()">retry</button></div>';
      });
    }

    function filterTargets(targets) {
      if (!targetPosFilter) return targets;
      return targets.filter(function(p) { return p.position === targetPosFilter; });
    }

    function buildTargetTable(targets, sectionId) {
      if (!targets.length) {
        var msg = razzleEmpty();
        return '<div class="panel-empty">' + msg + '</div>';
      }
      var html = '<table class="tf2-table"><thead><tr>';
      html += '<th scope="col">Player</th><th>Pos</th><th>Team</th><th>Value</th><th>Diff</th><th>Stock</th><th class="hide-mobile">PPG</th><th class="hide-mobile">Tier</th>';
      html += '</tr></thead><tbody>';
      targets.forEach(function(p) {
        var pos = (p.position || 'RB').toLowerCase();
        html += '<tr data-pid="' + escapeAttr(p.player_id) + '">';
        html += '<td><div class="tf2-player-cell">';
        if (p.headshot_url) html += '<img class="tf2-row-img" src="' + escapeAttr(p.headshot_url) + '" alt="Player headshot" loading="lazy" onerror="this.onerror=null;this.src=\'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 40 40%22><circle cx=%2220%22 cy=%2220%22 r=%2220%22 fill=%22%23d97757%22/><text x=%2220%22 y=%2225%22 text-anchor=%22middle%22 fill=%22white%22 font-size=%2216%22>?</text></svg>\'">';
        html += '<span>' + escapeHtml(p.full_name) + '</span></div></td>';
        html += '<td><span class="tf2-pos-badge ' + pos + '">' + escapeHtml(p.position) + '</span></td>';
        html += '<td>' + escapeHtml(p.team) + '</td>';
        html += '<td>' + fmt(p.trade_value) + '</td>';
        html += '<td>' + valDiffChip(p.value_diff) + '</td>';
        html += '<td>' + stockArrow(p.stock_trend || 'stable') + '</td>';
        html += '<td class="hide-mobile">' + fmt(p.ppg) + '</td>';
        html += '<td class="hide-mobile"><span class="tf2-tier-badge t' + p.tier + '">' + escapeHtml(p.tier_label || TIER_LABELS[p.tier] || '') + '</span></td>';
        html += '</tr>';
      });
      html += '</tbody></table>';
      return html;
    }

    function render(data) {
      var body = el.querySelector('.tf2-body');
      var sel = data.selected_player;
      if (!sel) { body.innerHTML = '<div class="panel-error">player data not available</div>'; return; }

      var pos = (sel.position || 'RB').toLowerCase();
      var html = '<div class="tf2-selected-card">';
      if (sel.headshot_url) html += '<img class="tf2-sel-headshot" src="' + escapeAttr(sel.headshot_url) + '" alt="Player headshot" onerror="this.onerror=null;this.src=\'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 40 40%22><circle cx=%2220%22 cy=%2220%22 r=%2220%22 fill=%22%23d97757%22/><text x=%2220%22 y=%2225%22 text-anchor=%22middle%22 fill=%22white%22 font-size=%2216%22>?</text></svg>\'">';
      html += '<div class="tf2-sel-info"><div class="tf2-sel-name">' + escapeHtml(sel.full_name) + '</div>';
      html += '<div class="tf2-sel-meta"><span class="tf2-pos-badge ' + pos + '">' + escapeHtml(sel.position) + '</span>';
      html += '<span>' + escapeHtml(sel.team) + '</span>';
      if (sel.age) html += '<span>age ' + sel.age + '</span>';
      html += '<span class="tf2-tier-badge t' + sel.tier + '">' + escapeHtml(sel.tier_label || '') + '</span>';
      html += stockArrow(sel.stock_trend || 'stable');
      html += '</div></div>';
      html += '<div class="tf2-sel-stats">';
      html += '<div class="tf2-sel-stat"><div class="tf2-sel-stat-val">' + fmt(sel.trade_value) + '</div><div class="tf2-sel-stat-label">Trade Value</div></div>';
      html += '<div class="tf2-sel-stat"><div class="tf2-sel-stat-val">' + fmt(sel.ppg) + '</div><div class="tf2-sel-stat-label">PPG</div></div>';
      html += '<div class="tf2-sel-stat"><div class="tf2-sel-stat-val">' + (sel.games != null ? sel.games : '-') + '</div><div class="tf2-sel-stat-label">GP</div></div>';
      html += '</div></div>';

      html += '<div class="tf2-target-controls"><div class="tf2-pos-tabs">';
      html += '<button class="tf2-pos-tab' + (!targetPosFilter ? ' active' : '') + '" data-pos="">All</button>';
      ['QB', 'RB', 'WR', 'TE'].forEach(function(p) {
        html += '<button class="tf2-pos-tab' + (targetPosFilter === p ? ' active' : '') + '" data-pos="' + p + '">' + p + '</button>';
      });
      html += '</div></div>';

      var equalFiltered = filterTargets(data.equal_targets || []);
      html += '<div class="tf2-section"><div class="tf2-section-header">Equal Value Targets <span class="tf2-section-count">' + equalFiltered.length + '</span></div>';
      html += '<div class="tf2-section-desc">players with similar dynasty trade value</div>';
      html += buildTargetTable(equalFiltered, 'equal') + '</div>';

      var buyFiltered = filterTargets(data.buy_low || []);
      html += '<div class="tf2-section"><div class="tf2-section-header">Buy Low Targets <span class="tf2-section-count">' + buyFiltered.length + '</span></div>';
      html += '<div class="tf2-section-desc">higher value but falling stock &mdash; buy the dip</div>';
      html += buildTargetTable(buyFiltered, 'buylow') + '</div>';

      var sellFiltered = filterTargets(data.sell_high || []);
      html += '<div class="tf2-section"><div class="tf2-section-header">Sell High Targets <span class="tf2-section-count">' + sellFiltered.length + '</span></div>';
      html += '<div class="tf2-section-desc">lower value but rising stock &mdash; sell into strength</div>';
      html += buildTargetTable(sellFiltered, 'sellhigh') + '</div>';

      body.innerHTML = html;
      body.querySelectorAll('tr[data-pid]').forEach(function(row) {
        row.addEventListener('click', function() {
          var pid = row.getAttribute('data-pid');
          if (pid) if (typeof openPlayerPopup === 'function') openPlayerPopup(pid); else window.location.href = '/player/' + encodeURIComponent(pid);
        });
      });

      var tabs = body.querySelector('.tf2-pos-tabs');
      if (tabs) {
        tabs.addEventListener('click', function(e) {
          var tab = e.target.closest('.tf2-pos-tab');
          if (!tab) return;
          tabs.querySelectorAll('.tf2-pos-tab').forEach(function(t) { t.classList.remove('active'); });
          tab.classList.add('active');
          targetPosFilter = tab.getAttribute('data-pos') || '';
          render(currentData);
        });
      }
    }

    el.querySelector('.tf2-season').addEventListener('change', function() {
      if (currentData && currentData.selected_player) {
        loadTradeTargets(currentData.selected_player.player_id);
      }
    });
  }});


  // ═══════════════════════════════════════════════════════════════
  // DRAFT CLASS TRACKER
  // ═══════════════════════════════════════════════════════════════
  defs.push({ name: 'drafttracker', render: function(el) {
    var panelState = { year: 0, position: '', data: null };
    var CLASSIFICATION_COLORS = {
      stud: '#2ec4b6',
      hit: '#5b7fff',
      average: '#d97757',
      bust: '#e63946',
      too_early: '#8a7565'
    };
    var CLASSIFICATION_LABELS = {
      stud: 'Stud',
      hit: 'Hit',
      average: 'Average',
      bust: 'Bust',
      too_early: 'Too Early'
    };

    el.innerHTML =
      '<div class="lp-page">' +
        '<div class="lp-header"><h2>Draft Class Tracker</h2>' +
        '<div class="lp-subtitle">how did each draft class actually produce?</div></div>' +
        '<div class="lp-controls">' +
          '<select class="lp-select dct-year"><option value="">pulling drafts...</option></select>' +
          posTabsHTML('dct-pos-tabs', true) +
        '</div>' +
        '<div class="dct-round-breakdown"></div>' +
        '<div class="dct-pos-breakdown"></div>' +
        '<div class="dct-content"><div class="lp-loading">reviewing the tape...</div></div>' +
      '</div>';

    function loadData() {
      var yearParam = panelState.year ? '&draft_year=' + panelState.year : '';
      var posParam = panelState.position ? '&position=' + encodeURIComponent(panelState.position) : '';
      var contentEl = el.querySelector('.dct-content');
      contentEl.innerHTML = '<div class="lp-loading">reviewing the tape...</div>';
      fetch('/api/draft-class-tracker?' + yearParam.replace(/^&/, '') + posParam, { signal: _panelSignal() })
        .then(function(r) { if (!r.ok) throw new Error('fail'); return r.json(); })
        .then(function(data) {
          panelState.data = data;
          panelState.year = data.draft_year;
          renderYearSelect(data.available_years);
          renderRoundBreakdown(data.round_breakdown);
          renderPosBreakdown(data.position_breakdown);
          renderPlayerTable(data.players);
        })
        .catch(function() {
          contentEl.innerHTML = '<div class="lp-loading" style="color:var(--red)">fumbled the draft class data...</div>';
        });
    }

    function renderYearSelect(years) {
      var sel = el.querySelector('.dct-year');
      if (sel.options.length <= 1) {
        sel.innerHTML = '';
        years.forEach(function(y) {
          var opt = document.createElement('option');
          opt.value = y;
          opt.textContent = y + ' Draft Class';
          if (y === panelState.year) opt.selected = true;
          sel.appendChild(opt);
        });
      }
    }

    function renderRoundBreakdown(rounds) {
      var container = el.querySelector('.dct-round-breakdown');
      if (!rounds || !rounds.length) { container.innerHTML = ''; return; }
      var html = '<div style="display:flex; gap:8px; flex-wrap:wrap; margin-bottom:16px;">';
      rounds.forEach(function(rd) {
        var hitPct = rd.hit_rate;
        var barColor = hitPct >= 50 ? 'var(--green)' : hitPct >= 30 ? 'var(--orange)' : 'var(--red)';
        html += '<div style="background:var(--bg-card); border:2px solid var(--ink); border-radius:var(--radius-sm); padding:8px 12px; min-width:100px; text-align:center;">' +
          '<div style="font-family:var(--font-mono); font-size:14px; color:var(--ink);">Round ' + rd.round + '</div>' +
          '<div style="margin:4px 0; height:6px; background:var(--ink-faint); border-radius:8px;">' +
            '<div style="height:100%; width:' + hitPct + '%; background:' + barColor + '; border-radius:8px;"></div>' +
          '</div>' +
          '<div style="font-family:var(--font-mono); font-size:11px; color:var(--ink-light);">' +
            rd.hits + '/' + rd.total + ' hits (' + hitPct + '%)' +
          '</div>' +
        '</div>';
      });
      html += '</div>';
      container.innerHTML = html;
    }

    function renderPosBreakdown(positions) {
      var container = el.querySelector('.dct-pos-breakdown');
      if (!positions) { container.innerHTML = ''; return; }
      var html = '<div style="display:flex; gap:8px; flex-wrap:wrap; margin-bottom:16px;">';
      var posOrder = ['QB', 'RB', 'WR', 'TE'];
      posOrder.forEach(function(pos) {
        var pd = positions[pos];
        if (!pd) return;
        var color = POS_COLORS[pos] || '#8a7565';
        html += '<div style="background:var(--bg-card); border:2px solid var(--ink); border-radius:var(--radius-sm); padding:8px 12px; min-width:90px; text-align:center; border-left:4px solid ' + color + ';">' +
          '<div style="font-family:var(--font-mono); font-size:14px; color:' + color + ';">' + pos + '</div>' +
          '<div style="font-family:var(--font-mono); font-size:12px;">' + pd.total + ' drafted</div>' +
          '<div style="font-family:var(--font-mono); font-size:11px; color:var(--ink-light);">' +
            pd.avg_ppg + ' avg PPG' +
          '</div>' +
          '<div style="font-family:var(--font-mono); font-size:11px;">' +
            '<span style="color:var(--green);">' + pd.studs + ' studs</span> · ' +
            '<span style="color:var(--red);">' + pd.busts + ' busts</span>' +
          '</div>' +
        '</div>';
      });
      html += '</div>';
      container.innerHTML = html;
    }

    function renderPlayerTable(players) {
      var contentEl = el.querySelector('.dct-content');
      if (!players || !players.length) {
        contentEl.innerHTML = '<div class="lp-loading">no skill players drafted this year...</div>';
        return;
      }

      var html = '<div style="overflow-x:auto;">' +
        '<table class="screener-table" style="width:100%; font-size:12px;">' +
        '<thead><tr>' +
          '<th style="text-align:left;">Player</th>' +
          '<th scope="col">Pos</th>' +
          '<th scope="col">Rd</th>' +
          '<th scope="col">Pick</th>' +
          '<th scope="col">Team</th>' +
          '<th scope="col">College</th>' +
          '<th scope="col">Games</th>' +
          '<th scope="col">PPG</th>' +
          '<th scope="col">Career FPTS</th>' +
          '<th scope="col">Career AV</th>' +
          '<th scope="col">Verdict</th>' +
        '</tr></thead><tbody>';

      players.forEach(function(p) {
        var posColor = POS_COLORS[p.position] || '#8a7565';
        var verdictColor = CLASSIFICATION_COLORS[p.classification] || '#8a7565';
        var verdictLabel = CLASSIFICATION_LABELS[p.classification] || p.classification;

        html += '<tr>' +
          '<td style="text-align:left; font-weight:600;">' + escapeHtml(p.player_name) + '</td>' +
          '<td><span style="background:' + posColor + '; color:var(--text-on-accent); padding:1px 6px; border-radius:8px; font-size:11px; font-weight:700;">' + escapeHtml(p.position) + '</span></td>' +
          '<td>' + p.round + '</td>' +
          '<td>' + p.pick + '</td>' +
          '<td style="font-family:var(--font-mono); font-size:11px;">' + escapeHtml(p.draft_team || '') + '</td>' +
          '<td style="font-family:var(--font-mono); font-size:11px;">' + escapeHtml(p.college || '') + '</td>' +
          '<td>' + p.career_games + '</td>' +
          '<td style="font-weight:700;">' + fmt(p.career_ppg) + '</td>' +
          '<td>' + fmt(p.career_fpts, 0) + '</td>' +
          '<td>' + fmt(p.career_av, 0) + '</td>' +
          '<td><span style="background:' + verdictColor + '; color:var(--text-on-accent); padding:2px 8px; border-radius:8px; font-size:11px; font-weight:700; border:2px solid var(--ink-faint);">' + verdictLabel + '</span></td>' +
        '</tr>';
      });

      html += '</tbody></table></div>';
      contentEl.innerHTML = html;
    }

    // Year selector
    el.querySelector('.dct-year').addEventListener('change', function() {
      panelState.year = parseInt(this.value) || _latestSeason;
      loadData();
    });

    // Position tabs
    el.querySelector('#dct-pos-tabs').addEventListener('click', function(e) {
      if (!e.target.classList.contains('lp-pos-tab')) return;
      el.querySelectorAll('#dct-pos-tabs .lp-pos-tab').forEach(function(t) { t.classList.remove('active'); });
      e.target.classList.add('active');
      panelState.position = e.target.dataset.pos || '';
      loadData();
    });

    loadData();
  }});

  // =========================================================================
  // CORRELATIONS — Stat Correlation Matrix
  // =========================================================================
  defs.push({ name: 'correlations', render: function(el) {
    var panelState = { season: 0, position: '', selectedCell: null };

    el.innerHTML =
      '<div class="lp-page">' +
        '<div class="lp-header"><h2>Stat Correlation Matrix</h2>' +
        '<div class="lp-subtitle">which stats actually predict fantasy points?</div></div>' +
        '<div class="lp-controls">' +
          '<select class="corr-season lp-select" style="margin-right:8px"><option value="0">All Seasons</option></select>' +
          '<div class="lp-pos-tabs" id="corr-pos-tabs">' +
            '<button class="lp-pos-tab active" data-pos="">ALL</button>' +
            '<button class="lp-pos-tab" data-pos="QB">QB</button>' +
            '<button class="lp-pos-tab" data-pos="RB">RB</button>' +
            '<button class="lp-pos-tab" data-pos="WR">WR</button>' +
            '<button class="lp-pos-tab" data-pos="TE">TE</button>' +
          '</div>' +
        '</div>' +
        '<div id="corr-content"><div class="lp-loading">running the numbers...</div></div>' +
      '</div>';

    function loadData() {
      var content = el.querySelector('#corr-content');
      content.innerHTML = '<div class="lp-loading">running the numbers...</div>';
      var url = '/api/stat-correlations?season=' + panelState.season + '&position=' + encodeURIComponent(panelState.position);
      if (panelState.selectedCell) {
        url += '&x_stat=' + encodeURIComponent(panelState.selectedCell.x) + '&y_stat=' + encodeURIComponent(panelState.selectedCell.y);
      }
      fetch(url, { signal: _panelSignal() }).then(function(r) {
        if (!r.ok) throw new Error('API error');
        return r.json();
      }).then(function(data) {
        if (data.error) {
          content.innerHTML = '<div class="panel-error">' + escapeHtml(data.error) + '</div>';
          return;
        }
        renderCorrelations(data, content);
        // Populate season selector
        var sel = el.querySelector('.corr-season');
        if (sel.options.length <= 1 && data.available_seasons) {
          (data.available_seasons || []).forEach(function(s) {
            var opt = document.createElement('option');
            opt.value = s; opt.textContent = s;
            sel.appendChild(opt);
          });
        }
      }).catch(function() {
        content.innerHTML = '<div class="panel-error">' + razzleError() + '<br><button onclick="location.reload()">retry</button></div>';
      });
    }

    function corrColor(r) {
      var isDark = document.documentElement.getAttribute("data-theme") === "dark";
      if (r === null || r === undefined) return isDark ? '#4a3728' : '#f7efe5';
      var abs = Math.min(Math.abs(r), 1);
      var intensity = Math.round(abs * 200);
      if (isDark) {
        // Dark mode: start from dark card color, go toward muted tints
        if (r > 0) return 'rgb(' + (74 + intensity * 0.15) + ',' + (55 - intensity * 0.15) + ',' + (40 - intensity * 0.15) + ')';
        return 'rgb(' + (40 - intensity * 0.1) + ',' + (55 - intensity * 0.15) + ',' + (74 + intensity * 0.15) + ')';
      }
      if (r > 0) return 'rgb(' + (255 - intensity * 0.3) + ',' + (240 - intensity * 0.7) + ',' + (240 - intensity * 0.9) + ')';
      return 'rgb(' + (240 - intensity * 0.9) + ',' + (240 - intensity * 0.7) + ',' + (255 - intensity * 0.3) + ')';
    }

    function renderCorrelations(data, content) {
      var keys = data.stat_keys || [];
      var labels = data.labels || {};
      var matrix = data.matrix || {};
      var predictors = data.top_predictors || [];

      var html = '';

      // Top predictors of PPG
      html += '<div class="corr-section">';
      html += '<h3 class="corr-section-title">Top Predictors of Fantasy PPG</h3>';
      html += '<div class="corr-predictors">';
      predictors.forEach(function(p) {
        var pct = Math.round(Math.abs(p.r) * 100);
        var color = p.r > 0 ? '#2ec4b6' : '#e63946';
        html += '<div class="corr-pred-row">' +
          '<span class="corr-pred-label">' + escapeHtml(p.label) + '</span>' +
          '<div class="corr-pred-bar-bg">' +
            '<div class="corr-pred-bar" style="width:' + pct + '%;background:' + color + '"></div>' +
          '</div>' +
          '<span class="corr-pred-val" style="color:' + color + '">' + (p.r > 0 ? '+' : '') + (p.r != null ? p.r.toFixed(2) : '—') + '</span>' +
        '</div>';
      });
      html += '</div></div>';

      // Heat map (canvas)
      var cellSize = 52;
      var labelW = 70;
      var canvasW = labelW + keys.length * cellSize + 10;
      var canvasH = labelW + keys.length * cellSize + 10;
      html += '<div class="corr-section">';
      html += '<h3 class="corr-section-title">Correlation Matrix</h3>';
      html += '<div class="corr-hint" style="font-family:var(--font-hand);font-size:18px;color:var(--ink-light);margin-bottom:8px">click a cell to see the scatter plot</div>';
      html += '<div class="corr-heatmap-wrap" style="overflow-x:auto">';
      html += '<canvas id="corr-heatmap" width="' + canvasW + '" height="' + canvasH + '" role="img" aria-label="Stat correlation heat map" style="cursor:pointer"></canvas>';
      html += '</div></div>';

      // Scatter plot placeholder
      html += '<div class="corr-section" id="corr-scatter-section" style="display:none">';
      html += '<h3 class="corr-section-title" id="corr-scatter-title">Scatter Plot</h3>';
      html += '<div class="corr-scatter-wrap"><canvas id="corr-scatter" width="600" height="400" role="img" aria-label="Correlation scatter plot"></canvas></div>';
      html += '</div>';

      // Sample size
      html += '<div class="corr-sample" style="text-align:center;font-family:var(--font-mono);font-size:11px;color:var(--ink-light);margin-top:12px">n = ' + (data.sample_size || 0) + ' player-seasons</div>';

      content.innerHTML = html;

      // Draw heat map
      var canvas = el.querySelector('#corr-heatmap');
      if (!canvas) return;
      var t = getCanvasTheme();
      var ctx = canvas.getContext('2d');
      var dpr = window.devicePixelRatio || 1;
      canvas.width = canvasW * dpr;
      canvas.height = canvasH * dpr;
      canvas.style.width = canvasW + 'px';
      canvas.style.height = canvasH + 'px';
      ctx.scale(dpr, dpr);

      // Draw cells
      keys.forEach(function(k1, i) {
        keys.forEach(function(k2, j) {
          var r = matrix[k1] ? matrix[k1][k2] : null;
          var x = labelW + j * cellSize;
          var y = labelW + i * cellSize;
          ctx.fillStyle = corrColor(r);
          ctx.fillRect(x, y, cellSize - 2, cellSize - 2);
          ctx.strokeStyle = t.bg;
          ctx.lineWidth = 2;
          ctx.strokeRect(x, y, cellSize - 2, cellSize - 2);
          // Value text
          if (r !== null && r !== undefined) {
            ctx.fillStyle = Math.abs(r) > 0.5 ? t.white : t.ink;
            ctx.font = 'bold 11px "Space Mono", monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(r.toFixed(2), x + (cellSize - 2) / 2, y + (cellSize - 2) / 2);
          }
        });
      });

      // Row labels (left)
      ctx.fillStyle = t.ink;
      ctx.font = 'bold 11px "Space Mono", monospace';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      keys.forEach(function(k, i) {
        ctx.fillText(labels[k] || k, labelW - 6, labelW + i * cellSize + (cellSize - 2) / 2);
      });

      // Column labels (top, rotated)
      keys.forEach(function(k, j) {
        ctx.save();
        ctx.translate(labelW + j * cellSize + (cellSize - 2) / 2, labelW - 6);
        ctx.rotate(-Math.PI / 4);
        ctx.fillStyle = t.ink;
        ctx.font = 'bold 11px "Space Mono", monospace';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillText(labels[k] || k, 0, 0);
        ctx.restore();
      });

      // Click handler for heat map cells
      canvas.addEventListener('click', function(e) {
        var rect = canvas.getBoundingClientRect();
        var mx = (e.clientX - rect.left);
        var my = (e.clientY - rect.top);
        var col = Math.floor((mx - labelW) / cellSize);
        var row = Math.floor((my - labelW) / cellSize);
        if (col >= 0 && col < keys.length && row >= 0 && row < keys.length && col !== row) {
          panelState.selectedCell = { x: keys[col], y: keys[row] };
          loadData();
        }
      });

      // Scatter plot if data present
      if (data.scatter && data.scatter.length > 0 && panelState.selectedCell) {
        var scatterSection = el.querySelector('#corr-scatter-section');
        scatterSection.style.display = 'block';
        var xKey = panelState.selectedCell.x;
        var yKey = panelState.selectedCell.y;
        var xLabel = labels[xKey] || xKey;
        var yLabel = labels[yKey] || yKey;
        var r = matrix[yKey] ? matrix[yKey][xKey] : null;
        el.querySelector('#corr-scatter-title').textContent = xLabel + ' vs ' + yLabel + (r != null ? ' (r = ' + r.toFixed(2) + ')' : '');

        var sc = el.querySelector('#corr-scatter');
        var sctx = sc.getContext('2d');
        var sW = 600, sH = 400;
        sc.width = sW * dpr;
        sc.height = sH * dpr;
        sc.style.width = sW + 'px';
        sc.style.height = sH + 'px';
        sctx.scale(dpr, dpr);

        var pad = { t: 30, r: 30, b: 40, l: 55 };
        var cw = sW - pad.l - pad.r, ch = sH - pad.t - pad.b;
        var pts = data.scatter;
        var xMin = Infinity, xMax = -Infinity, yMin = Infinity, yMax = -Infinity;
        pts.forEach(function(p) {
          if (p.x < xMin) xMin = p.x; if (p.x > xMax) xMax = p.x;
          if (p.y < yMin) yMin = p.y; if (p.y > yMax) yMax = p.y;
        });
        var xRange = xMax - xMin || 1;
        var yRange = yMax - yMin || 1;
        xMin -= xRange * 0.05; xMax += xRange * 0.05;
        yMin -= yRange * 0.05; yMax += yRange * 0.05;
        xRange = xMax - xMin; yRange = yMax - yMin;

        // Grid
        sctx.strokeStyle = t.bgWarm; sctx.lineWidth = 1;
        for (var g = 0; g <= 4; g++) {
          var gy = pad.t + ch - (g / 4) * ch;
          sctx.beginPath(); sctx.moveTo(pad.l, gy); sctx.lineTo(pad.l + cw, gy); sctx.stroke();
          sctx.fillStyle = t.inkLight; sctx.font = '11px "Space Mono", monospace'; sctx.textAlign = 'right';
          sctx.fillText(fmt(yMin + (g / 4) * yRange), pad.l - 5, gy + 3);
        }
        for (var g = 0; g <= 4; g++) {
          var gx = pad.l + (g / 4) * cw;
          sctx.beginPath(); sctx.moveTo(gx, pad.t); sctx.lineTo(gx, pad.t + ch); sctx.stroke();
          sctx.fillStyle = t.inkLight; sctx.font = '11px "Space Mono", monospace'; sctx.textAlign = 'center';
          sctx.fillText(fmt(xMin + (g / 4) * xRange), gx, pad.t + ch + 16);
        }

        // Dots
        pts.forEach(function(p) {
          var px = pad.l + ((p.x - xMin) / xRange) * cw;
          var py = pad.t + ch - ((p.y - yMin) / yRange) * ch;
          var color = POS_COLORS[p.pos] || '#8a7565';
          sctx.beginPath();
          sctx.arc(px, py, 4, 0, Math.PI * 2);
          sctx.fillStyle = color + 'cc';
          sctx.fill();
          sctx.strokeStyle = color;
          sctx.lineWidth = 1;
          sctx.stroke();
        });

        // Axis labels
        sctx.fillStyle = t.ink; sctx.font = 'bold 12px "Space Mono", monospace';
        sctx.textAlign = 'center';
        sctx.fillText(xLabel, pad.l + cw / 2, sH - 5);
        sctx.save();
        sctx.translate(14, pad.t + ch / 2);
        sctx.rotate(-Math.PI / 2);
        sctx.fillText(yLabel, 0, 0);
        sctx.restore();

        // Trendline
        if (pts.length > 5) {
          var sx = 0, sy = 0, sxy = 0, sx2 = 0, n = pts.length;
          pts.forEach(function(p) { sx += p.x; sy += p.y; sxy += p.x * p.y; sx2 += p.x * p.x; });
          var sdenom = n * sx2 - sx * sx;
          if (sdenom === 0) { sdenom = 1; }
          var slope = (n * sxy - sx * sy) / sdenom;
          var intercept = (sy - slope * sx) / n;
          if (isFinite(slope) && isFinite(intercept)) {
            var x1 = xMin, y1 = slope * x1 + intercept;
            var x2 = xMax, y2 = slope * x2 + intercept;
            var px1 = pad.l + ((x1 - xMin) / xRange) * cw;
            var py1 = pad.t + ch - ((y1 - yMin) / yRange) * ch;
            var px2 = pad.l + ((x2 - xMin) / xRange) * cw;
            var py2 = pad.t + ch - ((y2 - yMin) / yRange) * ch;
            sctx.beginPath();
            sctx.moveTo(px1, py1);
            sctx.lineTo(px2, py2);
            sctx.strokeStyle = '#d97757';
            sctx.lineWidth = 2;
            sctx.setLineDash([6, 4]);
            sctx.stroke();
            sctx.setLineDash([]);
          }
        }
      }
    }

    // Season selector
    el.querySelector('.corr-season').addEventListener('change', function() {
      panelState.season = parseInt(this.value) || 0;
      panelState.selectedCell = null;
      loadData();
    });

    // Position tabs
    el.querySelector('#corr-pos-tabs').addEventListener('click', function(e) {
      if (!e.target.classList.contains('lp-pos-tab')) return;
      el.querySelectorAll('#corr-pos-tabs .lp-pos-tab').forEach(function(t) { t.classList.remove('active'); });
      e.target.classList.add('active');
      panelState.position = e.target.dataset.pos || '';
      panelState.selectedCell = null;
      loadData();
    });

    loadData();
  }});

  // ─── DYNASTY POWER RANKINGS ──────────────────────────────────
  defs.push({ name: 'powerrankings', render: function(el) {
    if (showNflOnlyMsg(el, 'powerrankings', 'Dynasty Power Rankings', 'which NFL teams have the most fantasy-valuable rosters')) return;

    var POS_COLS = POS_COLORS;
    var panelData = null;
    var selectedTeam = null;

    el.innerHTML =
      '<div class="lp-page">' +
        '<div class="lp-header"><h2>Dynasty Power Rankings</h2>' +
        '<div class="lp-subtitle">which NFL teams have the most fantasy-valuable rosters?</div>' +
        '<div class="lp-meta">total dynasty trade value summed across QB + RB + WR + TE</div></div>' +
        '<div class="lp-controls">' +
          '<select class="lp-select pr-season"></select>' +
        '</div>' +
        '<div class="pr-chart-wrap" style="margin:16px 0;">' +
          '<canvas id="pr-canvas" width="800" height="900" role="img" aria-label="Dynasty power rankings bar chart" style="width:100%;max-width:800px;border:3px solid var(--ink);border-radius:var(--radius-sm);box-shadow:4px 4px 0 var(--ink);background:var(--bg-card);"></canvas>' +
        '</div>' +
        '<div class="pr-detail" id="pr-detail" style="display:none;"></div>' +
        '<div class="pr-loading"><div class="lp-loading">' + razzleLoading() + '</div></div>' +
      '</div>';

    function loadData() {
      var loadEl = el.querySelector('.pr-loading');
      loadEl.style.display = '';
      var seasonVal = el.querySelector('.pr-season').value;
      var url = '/api/dynasty-power-rankings';
      if (seasonVal && seasonVal !== '0') url += '?season=' + seasonVal;

      fetch(url, { signal: _panelSignal() }).then(function(r) {
        if (!r.ok) throw new Error('API error');
        return r.json();
      }).then(function(data) {
        panelData = data;
        loadEl.style.display = 'none';

        // Populate season selector
        var sSel = el.querySelector('.pr-season');
        if (data.available_seasons && sSel.options.length === 0) {
          (data.available_seasons || []).forEach(function(s) {
            var opt = document.createElement('option');
            opt.value = s; opt.textContent = s;
            if (s === data.season) opt.selected = true;
            sSel.appendChild(opt);
          });
        }

        drawChart(data);
      }).catch(function() {
        loadEl.innerHTML = '<div class="panel-error">' + razzleError() + '<br><button onclick="location.reload()">retry</button></div>';
      });
    }

    function drawChart(data) {
      var canvas = el.querySelector('#pr-canvas');
      if (!canvas) return;
      var teams = data.teams || [];
      if (!teams.length) return;

      var dpr = window.devicePixelRatio || 1;
      var rowH = 26;
      var padTop = 50;
      var padBottom = 20;
      var padLeft = 60;
      var padRight = 40;
      var totalH = padTop + teams.length * rowH + padBottom;

      canvas.style.height = totalH / dpr + 'px';
      canvas.width = 800 * dpr;
      canvas.height = totalH * dpr;

      var ctx = canvas.getContext('2d');
      var th = getCanvasTheme();
      ctx.scale(dpr, dpr);
      var W = 800;

      // Background
      ctx.fillStyle = th.bgCard;
      ctx.fillRect(0, 0, W, totalH);

      // Find max value for scaling
      var maxVal = 1;
      teams.forEach(function(tm) { if (tm.total_value > maxVal) maxVal = tm.total_value; });
      var barAreaW = W - padLeft - padRight;

      // Title
      ctx.fillStyle = th.ink;
      ctx.font = 'bold 16px "Space Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('Dynasty Roster Value by Team', W / 2, 22);
      ctx.font = '11px "Space Mono", monospace';
      ctx.fillStyle = th.inkLight;
      ctx.fillText('league avg: ' + fmt(data.league_average) + ' total trade value', W / 2, 38);

      // League average line
      var avgX = padLeft + (data.league_average / maxVal) * barAreaW;
      ctx.strokeStyle = '#d97757';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      ctx.moveTo(avgX, padTop - 5);
      ctx.lineTo(avgX, padTop + teams.length * rowH);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw bars
      teams.forEach(function(t, i) {
        var y = padTop + i * rowH;
        var barH = rowH - 4;

        // Rank + team label
        ctx.fillStyle = th.ink;
        ctx.font = '11px "Space Mono", monospace';
        ctx.textAlign = 'right';
        ctx.fillText(t.rank + '. ' + t.team, padLeft - 6, y + barH / 2 + 4);

        // Stacked bar: QB → RB → WR → TE
        var segments = [
          { key: 'qb_value', color: POS_COLS.QB },
          { key: 'rb_value', color: POS_COLS.RB },
          { key: 'wr_value', color: POS_COLS.WR },
          { key: 'te_value', color: POS_COLS.TE }
        ];
        var x = padLeft;
        segments.forEach(function(seg) {
          var val = t[seg.key] || 0;
          var segW = (val / maxVal) * barAreaW;
          if (segW > 0.5) {
            ctx.fillStyle = seg.color;
            ctx.fillRect(x, y, segW, barH);
            // Subtle right border between segments
            ctx.fillStyle = th.isDark ? 'rgba(45,31,20,0.4)' : 'rgba(247,239,229,0.4)';
            ctx.fillRect(x + segW - 1, y, 1, barH);
          }
          x += segW;
        });

        // Total value label
        ctx.fillStyle = th.ink;
        ctx.font = '11px "Space Mono", monospace';
        ctx.textAlign = 'left';
        ctx.fillText(fmt(t.total_value, 0), x + 4, y + barH / 2 + 4);

        // Highlight selected
        if (selectedTeam === t.team) {
          ctx.strokeStyle = th.ink;
          ctx.lineWidth = 2;
          ctx.strokeRect(padLeft, y, (t.total_value / maxVal) * barAreaW, barH);
        }
      });

      // Legend
      var legendX = padLeft;
      var legendY = padTop - 14;
      ctx.font = '11px "Space Mono", monospace';
      ctx.textAlign = 'left';
      ['QB', 'RB', 'WR', 'TE'].forEach(function(pos) {
        ctx.fillStyle = POS_COLS[pos];
        ctx.fillRect(legendX, legendY - 7, 10, 10);
        ctx.fillStyle = th.ink;
        ctx.fillText(pos, legendX + 13, legendY + 2);
        legendX += 45;
      });
    }

    function showDetail(team) {
      var detailEl = el.querySelector('#pr-detail');
      if (!panelData || !panelData.teams) { detailEl.style.display = 'none'; return; }

      var t = null;
      panelData.teams.forEach(function(tm) { if (tm.team === team) t = tm; });
      if (!t) { detailEl.style.display = 'none'; return; }

      selectedTeam = team;
      drawChart(panelData);

      var html = '<div class="lp-card" style="border:3px solid var(--ink);border-radius:8px;box-shadow:4px 4px 0 var(--ink);padding:16px;margin-top:12px;background:var(--bg-card);">';
      html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">';
      html += '<h3 style="margin:0;font-family:var(--font-display);font-size:20px;color:var(--ink);">' + escapeHtml(t.team) + ' — #' + t.rank + '</h3>';
      html += '<span style="font-family:var(--font-mono);font-size:14px;color:var(--ink-medium);">Total: ' + fmt(t.total_value, 0) + '</span>';
      html += '</div>';

      // Position breakdown chips
      html += '<div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:14px;">';
      [{ label: 'QB', val: t.qb_value, col: POS_COLS.QB },
       { label: 'RB', val: t.rb_value, col: POS_COLS.RB },
       { label: 'WR', val: t.wr_value, col: POS_COLS.WR },
       { label: 'TE', val: t.te_value, col: POS_COLS.TE }].forEach(function(g) {
        var pct = t.total_value > 0 ? Math.round(g.val / t.total_value * 100) : 0;
        html += '<div style="background:' + g.col + '22;border:2px solid ' + g.col + ';border-radius:var(--radius-sm);padding:6px 12px;font-family:var(--font-mono);font-size:12px;">';
        html += '<span style="font-weight:bold;color:' + g.col + ';">' + g.label + '</span> ';
        html += '<span style="color:var(--ink);">' + fmt(g.val, 0) + '</span> ';
        html += '<span style="color:var(--ink-light);">(' + pct + '%)</span>';
        html += '</div>';
      });
      html += '</div>';

      // Top players
      if (t.top_players && t.top_players.length) {
        html += '<div style="font-family:var(--font-hand);font-size:14px;color:var(--ink-light);margin-bottom:6px;">top dynasty assets</div>';
        html += '<table style="width:100%;border-collapse:collapse;font-family:var(--font-mono);font-size:12px;">';
        html += '<tr style="border-bottom:2px solid var(--ink-faint);">';
        html += '<th style="text-align:left;padding:4px 6px;">Player</th>';
        html += '<th style="text-align:center;padding:4px 6px;">Pos</th>';
        html += '<th style="text-align:right;padding:4px 6px;">PPG</th>';
        html += '<th style="text-align:right;padding:4px 6px;">Age</th>';
        html += '<th style="text-align:right;padding:4px 6px;">Value</th></tr>';
        t.top_players.forEach(function(p) {
          var posColor = POS_COLS[p.position] || '#8a7565';
          html += '<tr style="border-bottom:2px solid var(--ink-faint);">';
          html += '<td style="padding:4px 6px;">' + escapeHtml(p.full_name) + '</td>';
          html += '<td style="text-align:center;padding:4px 6px;color:' + posColor + ';font-weight:bold;">' + escapeHtml(p.position) + '</td>';
          html += '<td style="text-align:right;padding:4px 6px;">' + fmt(p.ppg) + '</td>';
          html += '<td style="text-align:right;padding:4px 6px;">' + (p.age != null ? p.age : '-') + '</td>';
          html += '<td style="text-align:right;padding:4px 6px;font-weight:bold;">' + fmt(p.trade_value) + '</td></tr>';
        });
        html += '</table>';
      }
      html += '</div>';
      detailEl.innerHTML = html;
      detailEl.style.display = '';
    }

    // Click handler on canvas
    el.querySelector('#pr-canvas').addEventListener('click', function(e) {
      if (!panelData || !panelData.teams) return;
      var canvas = this;
      var rect = canvas.getBoundingClientRect();
      var scaleY = canvas.height / (window.devicePixelRatio || 1) / rect.height;
      var clickY = (e.clientY - rect.top) * scaleY;
      var padTop = 50;
      var rowH = 26;
      var idx = Math.floor((clickY - padTop) / rowH);
      if (idx >= 0 && idx < panelData.teams.length) {
        showDetail(panelData.teams[idx].team);
      }
    });

    el.querySelector('.pr-season').addEventListener('change', function() {
      selectedTeam = null;
      el.querySelector('#pr-detail').style.display = 'none';
      loadData();
    });

    loadData();
  }});

  // ===== GAME SCRIPT =====
  defs.push({ name: 'gamescript', render: function(el) {
    if (showNflOnlyMsg(el, 'gamescript', 'Game Script', 'see how game script affects fantasy production')) return;
    var POS_COLS = POS_COLORS;
    var curPos = '';
    var seasonsPopulated = false;

    el.innerHTML =
      '<div class="lp-page">' +
      '<div class="lp-header"><h2>Game Script</h2>' +
      '<div class="lp-subtitle">fantasy production in winning vs losing game scripts</div></div>' +
      '<div class="lp-controls">' +
      '<div class="lp-pos-tabs" id="gs-pos-tabs">' +
      '<button class="lp-pos-tab active" data-pos="">All</button>' +
      '<button class="lp-pos-tab" data-pos="QB">QB</button>' +
      '<button class="lp-pos-tab" data-pos="RB">RB</button>' +
      '<button class="lp-pos-tab" data-pos="WR">WR</button>' +
      '<button class="lp-pos-tab" data-pos="TE">TE</button>' +
      '</div>' +
      '<select class="lp-select" id="gs-season" aria-label="Season"></select>' +
      weekSelectHTML('gs-week') +
      '</div>' +
      '<div id="gs-body" style="overflow-x:auto;-webkit-overflow-scrolling:touch"><div class="lp-loading">reviewing the film...</div></div>' +
      '</div>';

    function diffBadge(val) {
      var v = parseFloat(val) || 0;
      var cls = v > 0 ? 'gs-diff-pos' : 'gs-diff-neg';
      var sign = v > 0 ? '+' : '';
      return '<span class="gs-diff-badge ' + cls + '">' + sign + v.toFixed(1) + '</span>';
    }

    function gtChip(val) {
      var v = parseFloat(val) || 0;
      if (v <= 0) return '';
      var cls = v >= 25 ? 'gs-gt-high' : v >= 15 ? 'gs-gt-mid' : 'gs-gt-low';
      return '<span class="gs-gt-chip ' + cls + '">' + v.toFixed(0) + '% GT</span>';
    }

    function renderTable(players, isPositive) {
      if (!players || !players.length) return '<div class="panel-empty">' + razzleEmpty() + '<span class="hint">try a different position or season</span></div>';
      var h = '<table class="gs-table"><thead><tr>';
      h += '<th scope="col">#</th><th>Player</th><th>Team</th><th>GP</th>';
      h += '<th title="Fantasy Points Per Game (PPR)">PPG</th><th title="Average Score Differential — positive means team was winning">Avg Diff</th><th title="Garbage Time % — % of stats scored in garbage time">GT%</th></tr></thead><tbody>';
      players.forEach(function(p, i) {
        var posColor = POS_COLS[p.position] || '#8a7565';
        h += '<tr class="gs-row" data-pid="' + escapeAttr(p.player_id) + '">';
        h += '<td class="gs-rank">' + (i + 1) + '</td>';
        h += '<td class="gs-player"><span class="gs-pos-dot" style="background:' + posColor + '"></span>';
        h += '<span class="gs-name">' + escapeHtml(p.name) + '</span>';
        h += '<span class="gs-pos" style="color:' + posColor + '">' + escapeHtml(p.position) + '</span></td>';
        h += '<td class="gs-team">' + escapeHtml(p.team) + '</td>';
        h += '<td class="gs-gp">' + p.games + '</td>';
        h += '<td class="gs-ppg"><strong>' + fmt(p.ppg) + '</strong></td>';
        h += '<td class="gs-diff">' + diffBadge(p.avg_diff) + '</td>';
        h += '<td class="gs-gt">' + gtChip(p.gt_pct) + '</td>';
        h += '</tr>';
      });
      h += '</tbody></table>';
      return h;
    }

    function loadGS() {
      var body = el.querySelector('#gs-body');
      body.innerHTML = '<div class="lp-loading">reviewing the film...</div>';
      var season = el.querySelector('#gs-season').value;
      var url = '/api/game-script?limit=25';
      if (season) url += '&season=' + season;
      if (curPos) url += '&position=' + curPos;
      var gsWeekVal = parseInt((el.querySelector('#gs-week') || {}).value) || 0;
      if (gsWeekVal > 0) url += '&week=' + gsWeekVal;

      fetch(url, { signal: _panelSignal() }).then(function(r) { if (!r.ok) throw new Error('API error'); return r.json(); }).then(function(data) {
        if (!seasonsPopulated && data.available_seasons) {
          var sel = el.querySelector('#gs-season');
          (data.available_seasons || []).forEach(function(s) {
            var o = document.createElement('option');
            o.value = s; o.textContent = s;
            if (s == data.season) o.selected = true;
            sel.appendChild(o);
          });
          seasonsPopulated = true;
          populateWeekSelect(el, 'gs-week', sel.value, loadGS);
        }
        var html = '<div class="gs-columns">';
        html += '<div class="gs-column"><div class="gs-column-header positive">';
        html += '<span class="gs-column-icon">&#9650;</span>';
        html += '<span class="gs-column-title">Winning Scripts</span>';
        html += '<span class="gs-column-note">teams ahead on the scoreboard</span></div>';
        html += renderTable(data.positive_script, true) + '</div>';
        html += '<div class="gs-column"><div class="gs-column-header negative">';
        html += '<span class="gs-column-icon">&#9660;</span>';
        html += '<span class="gs-column-title">Losing Scripts</span>';
        html += '<span class="gs-column-note">teams trailing on the scoreboard</span></div>';
        html += renderTable(data.negative_script, false) + '</div></div>';
        body.innerHTML = html;

        body.querySelectorAll('.gs-row[data-pid]').forEach(function(row) {
          row.addEventListener('click', function() {
            var _pid = row.getAttribute('data-pid'); if (typeof openPlayerPopup === 'function') openPlayerPopup(_pid); else window.location.href = '/player/' + encodeURIComponent(_pid);
          });
        });
      }).catch(function() { body.innerHTML = '<div class="panel-error">' + razzleError() + '<br><button onclick="location.reload()">retry</button></div>'; });
    }

    el.querySelector('#gs-pos-tabs').addEventListener('click', function(e) {
      var tab = e.target.closest('.lp-pos-tab');
      if (!tab) return;
      el.querySelectorAll('#gs-pos-tabs .lp-pos-tab').forEach(function(t) { t.classList.remove('active'); });
      tab.classList.add('active');
      curPos = tab.getAttribute('data-pos') || '';
      loadGS();
    });
    el.querySelector('#gs-season').addEventListener('change', function() {
      populateWeekSelect(el, 'gs-week', this.value, loadGS);
      loadGS();
    });
    loadGS();
  }});

  // ─── FAAB STRATEGY ────────────────────────────────────────────────
  defs.push({ name: 'faab', render: function(el) {
    if (showNflOnlyMsg(el, 'faab', 'FAAB Strategy', 'waiver budget pacing and spend patterns')) return;

    // Historical FAAB spend patterns (typical dynasty league averages)
    var WEEKLY_SPEND = [
      { week: 1, pct: 12, label: 'Wk 1' },
      { week: 2, pct: 9, label: 'Wk 2' },
      { week: 3, pct: 8, label: 'Wk 3' },
      { week: 4, pct: 7, label: 'Wk 4' },
      { week: 5, pct: 6, label: 'Wk 5' },
      { week: 6, pct: 5, label: 'Wk 6' },
      { week: 7, pct: 5, label: 'Wk 7' },
      { week: 8, pct: 6, label: 'Wk 8' },
      { week: 9, pct: 7, label: 'Wk 9' },
      { week: 10, pct: 8, label: 'Wk 10' },
      { week: 11, pct: 6, label: 'Wk 11' },
      { week: 12, pct: 5, label: 'Wk 12' },
      { week: 13, pct: 4, label: 'Wk 13' },
      { week: 14, pct: 4, label: 'Wk 14' },
      { week: 15, pct: 3, label: 'Wk 15' },
      { week: 16, pct: 3, label: 'Wk 16' },
      { week: 17, pct: 2, label: 'Wk 17' },
    ];

    var POS_SPEND = [
      { pos: 'RB', pct: 42, color: POS_COLORS.RB },
      { pos: 'WR', pct: 32, color: POS_COLORS.WR },
      { pos: 'QB', pct: 14, color: POS_COLORS.QB },
      { pos: 'TE', pct: 12, color: POS_COLORS.TE },
    ];

    var PACING = [
      { phase: 'Early (Wk 1-4)', budget: '35-40%', advice: 'Be aggressive. Early breakouts set your season. Don\'t be the manager who saves FAAB for Week 16.' },
      { phase: 'Mid (Wk 5-10)', budget: '30-35%', advice: 'Stay active but selective. Bye weeks create opportunities. Target the second wave of breakouts.' },
      { phase: 'Late (Wk 11-14)', budget: '15-20%', advice: 'Playoff push mode. Spend on starters, not stashes. Win-now moves only.' },
      { phase: 'Playoffs (Wk 15-17)', budget: '5-10%', advice: 'Emergency reserves. Stream defenses and kickers. One big waiver pickup can win the ship.' },
    ];

    el.innerHTML =
      '<div class="lp-page">' +
        '<div class="lp-header"><h2>FAAB Strategy</h2>' +
        '<div class="lp-subtitle">waiver budget pacing and spend patterns</div></div>' +

        // Weekly spend chart
        '<div class="lp-section" style="margin-bottom:24px;">' +
          '<h3 style="font-family:var(--font-display); font-size:16px; margin-bottom:12px;">Average FAAB Spend by Week</h3>' +
          '<div style="display:flex; align-items:flex-end; gap:4px; height:160px; padding:8px 0;">' +
            WEEKLY_SPEND.map(function(w) {
              var h = Math.round(w.pct / 12 * 140);
              var isHigh = w.pct >= 8;
              return '<div style="flex:1; display:flex; flex-direction:column; align-items:center; gap:2px;">' +
                '<div style="font-family:var(--font-mono); font-size:11px; color:var(--ink-light);">' + w.pct + '%</div>' +
                '<div style="width:100%; height:' + h + 'px; background:' + (isHigh ? 'var(--orange)' : 'var(--ink-faint)') + '; border-radius:8px 8px 0 0; border:2px solid var(--ink); min-width:16px;"></div>' +
                '<div style="font-family:var(--font-mono); font-size:11px; color:var(--ink-light); white-space:nowrap;">' + w.label + '</div>' +
              '</div>';
            }).join('') +
          '</div>' +
          '<div style="font-family:var(--font-hand); font-size:13px; color:var(--ink-light); margin-top:6px; text-align:center;">early season and bye weeks see the biggest FAAB burns</div>' +
        '</div>' +

        // Position breakdown
        '<div class="lp-section" style="margin-bottom:24px;">' +
          '<h3 style="font-family:var(--font-display); font-size:16px; margin-bottom:12px;">FAAB Spend by Position</h3>' +
          '<div style="display:flex; gap:12px; flex-wrap:wrap;">' +
            POS_SPEND.map(function(p) {
              return '<div style="flex:1; min-width:100px; background:var(--bg-card); border:2px solid var(--ink); border-radius:8px; padding:12px; text-align:center;">' +
                '<div style="font-family:var(--font-display); font-size:24px; color:' + p.color + ';">' + p.pct + '%</div>' +
                '<div style="font-family:var(--font-mono); font-size:12px; font-weight:700; color:' + p.color + ';">' + p.pos + '</div>' +
              '</div>';
            }).join('') +
          '</div>' +
          '<div style="font-family:var(--font-hand); font-size:13px; color:var(--ink-light); margin-top:6px; text-align:center;">RBs command the most waiver spend — scarcity is real</div>' +
        '</div>' +

        // Budget pacing guide
        '<div class="lp-section">' +
          '<h3 style="font-family:var(--font-display); font-size:16px; margin-bottom:12px;">Budget Pacing Guide</h3>' +
          '<div style="display:grid; gap:10px;">' +
            PACING.map(function(p) {
              return '<div style="display:flex; gap:12px; align-items:flex-start; background:var(--bg-card); border:2px solid var(--ink); border-radius:8px; padding:12px;">' +
                '<div style="min-width:80px;">' +
                  '<div style="font-family:var(--font-mono); font-size:11px; font-weight:700;">' + escapeHtml(p.phase) + '</div>' +
                  '<div style="font-family:var(--font-display); font-size:18px; color:var(--orange);">' + p.budget + '</div>' +
                '</div>' +
                '<div style="font-family:var(--font-hand); font-size:14px; color:var(--ink-medium); line-height:1.4;">' + escapeHtml(p.advice) + '</div>' +
              '</div>';
            }).join('') +
          '</div>' +
        '</div>' +

      '</div>';
  }});

})();
