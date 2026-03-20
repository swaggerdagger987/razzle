/* ===================================================================
   LAB MOCK DRAFT — Dynasty Rookie Mock Draft Simulator
   Panel: mockdraft
   =================================================================== */
(function() {
  'use strict';

  var defs = window._labPanelDefs = window._labPanelDefs || [];
  var POS_COLORS = { QB: '#5b7fff', RB: '#2ec4b6', WR: '#d97757', TE: '#8b5cf6' };
  var POS_TINTS = { QB: '#dde4f7', RB: '#d9efec', WR: '#f7e4d8', TE: '#e5dcf7' };

  // ─── Tier helpers ───────────────────────────────────────────────
  function rpsTier(rps) {
    if (rps >= 75) return 'Elite';
    if (rps >= 60) return 'Premium';
    if (rps >= 45) return 'Solid';
    if (rps >= 30) return 'Raw';
    return 'Flier';
  }

  function tierColor(tier) {
    switch (tier) {
      case 'Elite': return '#d97757';
      case 'Premium': return '#5b7fff';
      case 'Solid': return '#2ec4b6';
      case 'Raw': return '#8b5cf6';
      default: return '#8a7565';
    }
  }

  function escapeHtml(s) {
    if (!s) return '';
    var d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  // ─── Draft State ────────────────────────────────────────────────
  var draft = {
    board: [],          // all prospects sorted by RPS
    picks: [],          // { overall: N, round: N, team: N, prospect: {...}, isUser: bool }
    config: { teams: 12, rounds: 4, userPick: 1, snake: true },
    started: false,
    finished: false,
    currentOverall: 0,  // 0-based index into pick order
    pickOrder: [],      // array of team indices (0-based) in draft order
    el: null,           // container element
    draftYear: 0
  };

  function resetDraft() {
    draft.picks = [];
    draft.started = false;
    draft.finished = false;
    draft.currentOverall = 0;
    draft.pickOrder = [];
  }

  // ─── Pick Order (snake or linear) ──────────────────────────────
  function buildPickOrder(teams, rounds, snake) {
    var order = [];
    for (var r = 0; r < rounds; r++) {
      if (snake && r % 2 === 1) {
        for (var t = teams - 1; t >= 0; t--) order.push({ round: r, team: t });
      } else {
        for (var t2 = 0; t2 < teams; t2++) order.push({ round: r, team: t2 });
      }
    }
    return order;
  }

  // ─── Get remaining prospects ───────────────────────────────────
  function getAvailable() {
    var picked = new Set(draft.picks.map(function(p) { return p.prospect.player_name; }));
    return draft.board.filter(function(p) { return !picked.has(p.player_name); });
  }

  // ─── Auto-pick for CPU ─────────────────────────────────────────
  function cpuPick() {
    var avail = getAvailable();
    if (!avail.length) return null;
    // Take best available by RPS (already sorted)
    return avail[0];
  }

  // ─── Execute a pick ────────────────────────────────────────────
  function makePick(prospect, isUser) {
    var slot = draft.pickOrder[draft.currentOverall];
    draft.picks.push({
      overall: draft.currentOverall + 1,
      round: slot.round + 1,
      team: slot.team + 1,
      prospect: prospect,
      isUser: isUser
    });
    draft.currentOverall++;
    if (draft.currentOverall >= draft.pickOrder.length) {
      draft.finished = true;
    }
  }

  // ─── Undo last user pick ───────────────────────────────────────
  function undoLastUserPick() {
    // Undo back to the last user pick (removing CPU picks that followed)
    while (draft.picks.length > 0) {
      var last = draft.picks[draft.picks.length - 1];
      draft.picks.pop();
      draft.currentOverall--;
      draft.finished = false;
      if (last.isUser) break;
    }
  }

  // ─── Is it the user's turn? ────────────────────────────────────
  function isUserTurn() {
    if (draft.finished || draft.currentOverall >= draft.pickOrder.length) return false;
    var slot = draft.pickOrder[draft.currentOverall];
    return slot.team === (draft.config.userPick - 1);
  }

  // ─── Run CPU picks until user's turn or end ────────────────────
  function runCPUPicks() {
    var maxIter = draft.pickOrder.length;
    var count = 0;
    while (!draft.finished && !isUserTurn() && count < maxIter) {
      var prospect = cpuPick();
      if (!prospect) { draft.finished = true; break; }
      makePick(prospect, false);
      count++;
    }
  }

  // ─── Grade helpers ─────────────────────────────────────────────
  function pickGrade(pickOverall, rpsRank) {
    var diff = rpsRank - pickOverall; // positive = value, negative = reach
    if (diff >= 8) return { grade: 'Steal', color: '#d97757', icon: '\u2B06' };
    if (diff >= 3) return { grade: 'Value', color: '#2ec4b6', icon: '\u2B06' };
    if (diff >= -3) return { grade: 'Fair', color: '#8a7565', icon: '\u2194' };
    return { grade: 'Reach', color: '#e63946', icon: '\u2B07' };
  }

  function overallDraftGrade(userPicks) {
    if (!userPicks.length) return 'N/A';
    var totalDiff = 0;
    userPicks.forEach(function(p) {
      totalDiff += (p.prospect.rank - p.overall);
    });
    var avg = totalDiff / userPicks.length;
    if (avg >= 8) return 'A+';
    if (avg >= 5) return 'A';
    if (avg >= 3) return 'B+';
    if (avg >= 1) return 'B';
    if (avg >= -1) return 'C+';
    if (avg >= -3) return 'C';
    if (avg >= -5) return 'D';
    return 'F';
  }

  // ─── RENDER ────────────────────────────────────────────────────
  defs.push({ name: 'mockdraft', render: function(el) {
    draft.el = el;
    resetDraft();
    renderConfig(el);
  }});

  // ─── Config Screen ─────────────────────────────────────────────
  function renderConfig(el) {
    el.innerHTML = '<div class="md-config">' +
      '<div class="md-config-title">Dynasty Rookie Mock Draft</div>' +
      '<div class="md-config-subtitle" style="font-family:var(--font-hand);font-size:18px;color:var(--ink-light);margin-bottom:16px;">pick your squad before anyone else does</div>' +
      '<div class="md-config-grid">' +
        '<div class="md-config-field">' +
          '<label>League Size</label>' +
          '<div class="md-btn-group" id="mdTeams">' +
            '<button class="md-opt" data-val="8">8</button>' +
            '<button class="md-opt" data-val="10">10</button>' +
            '<button class="md-opt active" data-val="12">12</button>' +
            '<button class="md-opt" data-val="14">14</button>' +
          '</div>' +
        '</div>' +
        '<div class="md-config-field">' +
          '<label>Rounds</label>' +
          '<div class="md-btn-group" id="mdRounds">' +
            '<button class="md-opt" data-val="3">3</button>' +
            '<button class="md-opt active" data-val="4">4</button>' +
            '<button class="md-opt" data-val="5">5</button>' +
          '</div>' +
        '</div>' +
        '<div class="md-config-field">' +
          '<label>Your Pick</label>' +
          '<select class="md-select" id="mdUserPick"></select>' +
        '</div>' +
        '<div class="md-config-field">' +
          '<label>Draft Order</label>' +
          '<div class="md-btn-group" id="mdOrder">' +
            '<button class="md-opt active" data-val="snake">Snake</button>' +
            '<button class="md-opt" data-val="linear">Linear</button>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<button class="btn-chunky md-start-btn" id="mdStartBtn">Start Draft</button>' +
    '</div>';

    // Populate pick selector
    var sel = el.querySelector('#mdUserPick');
    for (var i = 1; i <= 12; i++) {
      var opt = document.createElement('option');
      opt.value = i;
      opt.textContent = '#' + i;
      if (i === 1) opt.selected = true;
      sel.appendChild(opt);
    }

    // Button group handlers
    el.querySelectorAll('.md-btn-group').forEach(function(group) {
      group.querySelectorAll('.md-opt').forEach(function(btn) {
        btn.addEventListener('click', function() {
          group.querySelectorAll('.md-opt').forEach(function(b) { b.classList.remove('active'); });
          btn.classList.add('active');

          // Update pick selector when team count changes
          if (group.id === 'mdTeams') {
            var count = parseInt(btn.dataset.val);
            var pickSel = el.querySelector('#mdUserPick');
            var curVal = parseInt(pickSel.value);
            pickSel.innerHTML = '';
            for (var j = 1; j <= count; j++) {
              var o = document.createElement('option');
              o.value = j;
              o.textContent = '#' + j;
              if (j === curVal) o.selected = true;
              pickSel.appendChild(o);
            }
          }
        });
      });
    });

    // Start button
    el.querySelector('#mdStartBtn').addEventListener('click', function() {
      var teams = parseInt(el.querySelector('#mdTeams .md-opt.active').dataset.val);
      var rounds = parseInt(el.querySelector('#mdRounds .md-opt.active').dataset.val);
      var userPick = parseInt(el.querySelector('#mdUserPick').value);
      var snake = el.querySelector('#mdOrder .md-opt.active').dataset.val === 'snake';

      draft.config = { teams: teams, rounds: rounds, userPick: userPick, snake: snake };
      resetDraft();
      draft.pickOrder = buildPickOrder(teams, rounds, snake);

      // Show loading
      el.innerHTML = '<div class="lab-panel-loading"><div class="loading-msg">scouting the class...</div></div>';

      // Fetch prospects
      fetch('/api/prospect-scores?position=')
        .then(function(r) { if (!r.ok) throw new Error('API error'); return r.json(); })
        .then(function(data) {
          draft.board = data.prospects || [];
          draft.draftYear = data.draft_year || new Date().getFullYear();
          if (!draft.board.length) {
            el.innerHTML = '<div class="lab-panel-loading"><div class="loading-msg" style="color:var(--red);">' + (typeof razzleEmpty === "function" ? razzleEmpty() : "no film on these prospects yet") + '</div></div>';
            return;
          }
          draft.started = true;
          // Run CPU picks until user's first turn
          runCPUPicks();
          renderDraftUI(el);
        })
        .catch(function(err) {
          el.innerHTML = '<div class="lab-panel-loading"><div class="loading-msg" style="color:var(--red);">' + razzleError() + '</div></div>';
        });
    });
  }

  // ─── Draft UI (board + best available) ─────────────────────────
  function renderDraftUI(el) {
    if (draft.finished) {
      renderRecap(el);
      return;
    }

    var currentSlot = draft.pickOrder[draft.currentOverall];
    var currentRound = currentSlot.round + 1;
    var currentTeam = currentSlot.team + 1;
    var isUser = isUserTurn();
    var overallNum = draft.currentOverall + 1;

    var html = '<div class="md-draft-layout">';

    // ─── Header ──────────────────────────────────────────────────
    html += '<div class="md-draft-header">';
    html += '<div class="md-draft-info">';
    html += '<span class="md-draft-year">' + draft.draftYear + ' Rookie Draft</span>';
    html += '<span class="md-draft-meta">' + draft.config.teams + ' teams \u2022 ' + draft.config.rounds + ' rounds \u2022 ' + (draft.config.snake ? 'snake' : 'linear') + '</span>';
    html += '</div>';
    if (isUser) {
      html += '<div class="md-on-clock">';
      html += '<span class="md-clock-pulse"></span>';
      html += '<span class="md-clock-text">You\'re on the clock</span>';
      html += '<span class="md-clock-pick">Round ' + currentRound + ', Pick ' + overallNum + '</span>';
      html += '</div>';
    } else {
      html += '<div class="md-pick-info">Pick ' + overallNum + ' of ' + draft.pickOrder.length + '</div>';
    }
    html += '</div>';

    // ─── Draft Board Grid ────────────────────────────────────────
    html += '<div class="md-board-wrap"><table class="md-board">';
    html += '<thead><tr><th class="md-board-corner">Rd</th>';
    for (var t = 1; t <= draft.config.teams; t++) {
      var isUserCol = (t === draft.config.userPick);
      html += '<th class="md-board-th' + (isUserCol ? ' md-user-col' : '') + '">Tm ' + t + (isUserCol ? ' (You)' : '') + '</th>';
    }
    html += '</tr></thead><tbody>';

    for (var r = 0; r < draft.config.rounds; r++) {
      html += '<tr>';
      html += '<td class="md-board-rd">R' + (r + 1) + '</td>';
      for (var c = 0; c < draft.config.teams; c++) {
        var isUserCol2 = (c === draft.config.userPick - 1);
        // Find the pick for this round+team
        var pick = null;
        var isCurrent = false;
        for (var pi = 0; pi < draft.picks.length; pi++) {
          if (draft.picks[pi].round === r + 1 && draft.picks[pi].team === c + 1) {
            pick = draft.picks[pi];
            break;
          }
        }
        // Check if this is the current pick cell
        if (!draft.finished && currentSlot.round === r && currentSlot.team === c) {
          isCurrent = true;
        }

        var cellClass = 'md-board-cell';
        if (isUserCol2) cellClass += ' md-user-col';
        if (isCurrent) cellClass += ' md-current-pick';

        if (pick) {
          var pos = pick.prospect.position || '';
          var bg = POS_TINTS[pos] || '#f7efe5';
          var border = POS_COLORS[pos] || 'var(--ink-light)';
          var name = pick.prospect.player_name || '';
          // Truncate long names
          var shortName = name.length > 14 ? name.substring(0, 12) + '..' : name;
          html += '<td class="' + cellClass + ' md-filled" style="background:' + bg + ';border-left:3px solid ' + border + ';">';
          html += '<span class="md-cell-name">' + escapeHtml(shortName) + '</span>';
          html += '<span class="md-cell-pos" style="color:' + border + ';">' + escapeHtml(pos) + '</span>';
          html += '</td>';
        } else {
          html += '<td class="' + cellClass + '">';
          if (isCurrent && isUser) {
            html += '<span class="md-cell-empty md-clock-pulse-cell">your pick</span>';
          } else if (isCurrent) {
            html += '<span class="md-cell-empty">picking...</span>';
          } else {
            html += '<span class="md-cell-empty"></span>';
          }
          html += '</td>';
        }
      }
      html += '</tr>';
    }
    html += '</tbody></table></div>';

    // ─── Best Available / Controls ───────────────────────────────
    if (isUser) {
      var avail = getAvailable();
      html += '<div class="md-best-available">';
      html += '<div class="md-ba-header">';
      html += '<span class="md-ba-title">Best Available</span>';
      var canUndo = draft.picks.some(function(p) { return p.isUser; });
      if (canUndo) {
        html += '<button class="btn-chunky md-undo-btn" id="mdUndoBtn">Undo Pick</button>';
      }
      html += '</div>';
      html += '<table class="md-ba-table"><thead><tr>';
      html += '<th>Rank</th><th>Name</th><th>Pos</th><th>School</th><th>RPS</th><th>Tier</th><th></th>';
      html += '</tr></thead><tbody>';

      var showCount = Math.min(avail.length, 20);
      for (var a = 0; a < showCount; a++) {
        var p = avail[a];
        var posColor = POS_COLORS[p.position] || 'var(--ink)';
        var tier = rpsTier(p.rps);
        html += '<tr class="md-ba-row" data-name="' + escapeHtml(p.player_name) + '">';
        html += '<td class="md-ba-rank">' + p.rank + '</td>';
        html += '<td class="md-ba-name">' + escapeHtml(p.player_name) + '</td>';
        html += '<td><span class="md-pos-badge" style="background:' + posColor + ';">' + escapeHtml(p.position) + '</span></td>';
        html += '<td class="md-ba-school">' + escapeHtml(p.school || '') + '</td>';
        html += '<td class="md-ba-rps">' + (p.rps || 0).toFixed(1) + '</td>';
        html += '<td><span class="md-tier-chip" style="border-color:' + tierColor(tier) + ';color:' + tierColor(tier) + ';">' + tier + '</span></td>';
        html += '<td><button class="btn-chunky md-draft-btn" data-name="' + escapeHtml(p.player_name) + '">Draft</button></td>';
        html += '</tr>';
      }
      html += '</tbody></table></div>';
    } else {
      // Show recent picks
      html += '<div class="md-recent-picks">';
      html += '<div class="md-ba-title">Recent Picks</div>';
      var recent = draft.picks.slice(-5).reverse();
      recent.forEach(function(pk) {
        var pc = POS_COLORS[pk.prospect.position] || 'var(--ink)';
        html += '<div class="md-recent-row">';
        html += '<span class="md-recent-num">' + pk.overall + '.</span>';
        html += '<span class="md-pos-badge" style="background:' + pc + ';">' + escapeHtml(pk.prospect.position) + '</span>';
        html += '<span>' + escapeHtml(pk.prospect.player_name) + '</span>';
        html += '</div>';
      });
      html += '</div>';
    }

    html += '</div>';
    el.innerHTML = html;

    // ─── Event listeners ─────────────────────────────────────────
    el.querySelectorAll('.md-draft-btn').forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        var name = btn.dataset.name;
        userDraftPlayer(el, name);
      });
    });

    el.querySelectorAll('.md-ba-row').forEach(function(row) {
      row.addEventListener('dblclick', function() {
        var name = row.dataset.name;
        userDraftPlayer(el, name);
      });
    });

    var undoBtn = el.querySelector('#mdUndoBtn');
    if (undoBtn) {
      undoBtn.addEventListener('click', function() {
        undoLastUserPick();
        renderDraftUI(el);
      });
    }
  }

  function userDraftPlayer(el, name) {
    var prospect = draft.board.find(function(p) { return p.player_name === name; });
    if (!prospect) return;
    makePick(prospect, true);
    // Run CPU picks after user's pick
    runCPUPicks();
    renderDraftUI(el);
  }

  // ─── Recap Card ────────────────────────────────────────────────
  function renderRecap(el) {
    var userPicks = draft.picks.filter(function(p) { return p.isUser; });
    var grade = overallDraftGrade(userPicks);

    var gradeColor = '#8a7565';
    var g0 = grade ? grade.charAt(0) : '';
    if (g0 === 'A') gradeColor = '#d97757';
    else if (g0 === 'B') gradeColor = '#2ec4b6';
    else if (g0 === 'C') gradeColor = '#ffc857';
    else if (g0 === 'D' || grade === 'F') gradeColor = '#e63946';

    var html = '<div class="md-recap">';
    html += '<div class="md-recap-header">';
    html += '<div class="md-recap-title">Draft Complete</div>';
    html += '<div class="md-recap-subtitle" style="font-family:var(--font-hand);font-size:18px;color:var(--ink-light);">here\'s how you did</div>';
    html += '<div class="md-recap-grade" style="border-color:' + gradeColor + ';color:' + gradeColor + ';">' + grade + '</div>';
    html += '</div>';

    // User's picks table
    html += '<table class="md-recap-table"><thead><tr>';
    html += '<th>Rd</th><th>Pick</th><th>Player</th><th>Pos</th><th>School</th><th>RPS Rank</th><th>Value</th>';
    html += '</tr></thead><tbody>';

    userPicks.forEach(function(pk) {
      var g = pickGrade(pk.overall, pk.prospect.rank);
      var posColor = POS_COLORS[pk.prospect.position] || 'var(--ink)';
      html += '<tr>';
      html += '<td>' + pk.round + '</td>';
      html += '<td>' + pk.overall + '</td>';
      html += '<td class="md-recap-name">' + escapeHtml(pk.prospect.player_name) + '</td>';
      html += '<td><span class="md-pos-badge" style="background:' + posColor + ';">' + escapeHtml(pk.prospect.position) + '</span></td>';
      html += '<td>' + escapeHtml(pk.prospect.school || '') + '</td>';
      html += '<td>' + pk.prospect.rank + '</td>';
      html += '<td><span class="md-grade-chip" style="background:' + g.color + ';">' + g.icon + ' ' + g.grade + '</span></td>';
      html += '</tr>';
    });
    html += '</tbody></table>';

    // Full draft board (collapsed view)
    html += '<details class="md-full-board-details">';
    html += '<summary class="md-full-board-summary">View Full Draft Board</summary>';
    html += renderFullBoardHTML();
    html += '</details>';

    // Actions
    html += '<div class="md-recap-actions">';
    html += '<button class="btn-chunky md-again-btn" id="mdAgainBtn">Draft Again</button>';
    html += '<button class="btn-chunky" id="mdScreenshotBtn" style="background:var(--orange);color:white;">Screenshot Draft</button>';
    html += '</div>';
    html += '</div>';

    el.innerHTML = html;

    el.querySelector('#mdAgainBtn').addEventListener('click', function() {
      resetDraft();
      renderConfig(el);
    });

    el.querySelector('#mdScreenshotBtn').addEventListener('click', function() {
      if (typeof screenshotPanel === 'function') {
        screenshotPanel('mockdraft');
      }
    });
  }

  function renderFullBoardHTML() {
    var html = '<div class="md-board-wrap"><table class="md-board">';
    html += '<thead><tr><th class="md-board-corner">Rd</th>';
    for (var t = 1; t <= draft.config.teams; t++) {
      var isUserCol = (t === draft.config.userPick);
      html += '<th class="md-board-th' + (isUserCol ? ' md-user-col' : '') + '">Tm ' + t + (isUserCol ? ' (You)' : '') + '</th>';
    }
    html += '</tr></thead><tbody>';

    for (var r = 0; r < draft.config.rounds; r++) {
      html += '<tr>';
      html += '<td class="md-board-rd">R' + (r + 1) + '</td>';
      for (var c = 0; c < draft.config.teams; c++) {
        var isUserCol2 = (c === draft.config.userPick - 1);
        var pick = null;
        for (var pi = 0; pi < draft.picks.length; pi++) {
          if (draft.picks[pi].round === r + 1 && draft.picks[pi].team === c + 1) {
            pick = draft.picks[pi];
            break;
          }
        }
        var cellClass = 'md-board-cell';
        if (isUserCol2) cellClass += ' md-user-col';

        if (pick) {
          var pos = pick.prospect.position || '';
          var bg = POS_TINTS[pos] || '#f7efe5';
          var border = POS_COLORS[pos] || 'var(--ink-light)';
          var name = pick.prospect.player_name || '';
          var shortName = name.length > 14 ? name.substring(0, 12) + '..' : name;
          html += '<td class="' + cellClass + ' md-filled" style="background:' + bg + ';border-left:3px solid ' + border + ';">';
          html += '<span class="md-cell-name">' + escapeHtml(shortName) + '</span>';
          html += '<span class="md-cell-pos" style="color:' + border + ';">' + escapeHtml(pos) + '</span>';
          html += '</td>';
        } else {
          html += '<td class="' + cellClass + '"><span class="md-cell-empty"></span></td>';
        }
      }
      html += '</tr>';
    }
    html += '</tbody></table></div>';
    return html;
  }

})();
