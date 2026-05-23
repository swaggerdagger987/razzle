/* ====================================================================
   Pokemon Lab — shared battle engine for v1..v5
   Provides: typewriter text, agent roster, dialog wiring, action handlers.
   Each version page calls PokeBattle.init({ versionId, agent, mode }).
   ==================================================================== */
(function(global) {

  // Razzle's six specialists. Emoji sprite = functional placeholder.
  // (Production would swap to pixel sprites; these read clearly at all sizes.)
  var ROSTER = [
    { id: 'razzle',    name: 'RAZZLE',       role: 'Chief of Staff',    sprite: '🐯', lv: 99,
      quips: [
        "Let's go over the scoreboard one more time. Your starters are healthy, but the bench is thin at RB.",
        "I pulled the snap counts from Week 8 — three of your guys are trending into boom-bust territory.",
        "I've got a plan. It involves Hawkeye's scout report and Octo's projections. Ready?"
      ] },
    { id: 'hawkeye',   name: 'HAWKEYE',      role: 'Scout',             sprite: '🦅', lv: 87,
      quips: [
        "Target share jumped 12% for your WR2 after the bye — tape shows route tree expanded into the slot.",
        "I watched every snap. He's getting open; the QB just isn't finding him. Progression is the issue.",
        "Pro tip: the opposing defense just lost their starting CB. Matchup tilts your way this week."
      ] },
    { id: 'octo',      name: 'OCTO',         role: 'Quant',             sprite: '🐙', lv: 92,
      quips: [
        "Your championship probability is 34.2%. Trading your RB3 for a WR2 takes it to 41.8%. Do it.",
        "Correlation matrix says stacking your QB with either WR stack is +EV. Don't split them.",
        "Monte-Carlo says 5,000 sims — median outcome is 9-5. Top-decile is 11-3. Hold the line."
      ] },
    { id: 'dolphin',   name: 'DR. DOLPHIN',  role: 'Medical',           sprite: '🐬', lv: 81,
      quips: [
        "High ankle sprain on your TE. Recovery curve says 3 weeks min. Do NOT start him on the tag.",
        "Hamstring reports from his Wednesday walkthrough — he's limited but trending up. I'd start him.",
        "The injury report calls it 'questionable' but the beat writers say he looked spry. I trust the writers."
      ] },
    { id: 'bones',     name: 'BONES',        role: 'Diplomat',          sprite: '🦊', lv: 78,
      quips: [
        "Your league-mate's team is tilted after the Monday loss. Offer the trade now — emotion is a tailwind.",
        "I ran the DM — he wants your WR2 but won't admit it. Ask for his RB2 and a future pick.",
        "Cold take: your commissioner vetoes 60% of trades involving rookies. Structure around that."
      ] },
    { id: 'atlas',     name: 'ATLAS',        role: 'Historian',         sprite: '🐘', lv: 84,
      quips: [
        "In 14 prior seasons, teams with your record at Week 8 won the title 22% of the time. Above median.",
        "This matchup — your QB vs this defense — historical split says he's a top-8 finish on 78% of plays.",
        "Pattern recognition: your league's champion has held a top-3 pick three years running. Plan accordingly."
      ] }
  ];

  function agentById(id) {
    return ROSTER.find(function(a) { return a.id === id; }) || ROSTER[0];
  }

  // ---- Typewriter ----
  function typewriter(el, text, opts) {
    opts = opts || {};
    var speed = opts.speed || 18;
    var onDone = opts.onDone || function() {};
    el.textContent = '';
    var i = 0;
    if (el._twTimer) clearInterval(el._twTimer);
    el._twTimer = setInterval(function() {
      el.textContent += text.charAt(i);
      i++;
      if (i >= text.length) {
        clearInterval(el._twTimer);
        el._twTimer = null;
        onDone();
      }
    }, speed);
    // Allow skip-to-end on click
    el.onclick = function() {
      if (el._twTimer) {
        clearInterval(el._twTimer);
        el._twTimer = null;
        el.textContent = text;
        onDone();
      }
    };
  }

  // ---- Battle init ----
  function init(opts) {
    opts = opts || {};
    var state = {
      versionId: opts.versionId,
      agentId: opts.agent || 'razzle',
      quipIndex: 0,
      onRender: opts.onRender || function() {}
    };

    function agent() { return agentById(state.agentId); }

    function renderSpeaker() {
      var nodes = document.querySelectorAll('[data-pl-speaker]');
      nodes.forEach(function(n) { n.textContent = agent().name + ' — ' + agent().role; });
      var sprites = document.querySelectorAll('[data-pl-opponent-sprite]');
      sprites.forEach(function(n) { n.textContent = agent().sprite; });
      var levels = document.querySelectorAll('[data-pl-opponent-lv]');
      levels.forEach(function(n) { n.textContent = 'Lv' + agent().lv; });
    }

    function sayNext() {
      var textEl = document.querySelector('[data-pl-text]');
      if (!textEl) return;
      var quips = agent().quips;
      var line = quips[state.quipIndex % quips.length];
      state.quipIndex++;
      var caret = document.querySelector('[data-pl-caret]');
      if (caret) caret.style.visibility = 'hidden';
      typewriter(textEl, line, {
        onDone: function() { if (caret) caret.style.visibility = 'visible'; }
      });
    }

    function switchAgent(id) {
      state.agentId = id;
      state.quipIndex = 0;
      renderSpeaker();
      sayNext();
      // Highlight roster chip
      document.querySelectorAll('[data-pl-agent-btn]').forEach(function(b) {
        b.classList.toggle('active', b.getAttribute('data-pl-agent-btn') === id);
      });
    }

    // Wire action buttons (ASK / TOOLS / ROSTER / LEAVE)
    function wireActions() {
      document.querySelectorAll('[data-pl-action]').forEach(function(btn) {
        btn.addEventListener('click', function() {
          var action = btn.getAttribute('data-pl-action');
          if (action === 'ask') showAskInput();
          else if (action === 'tools') showTools();
          else if (action === 'roster') cycleAgent();
          else if (action === 'leave') window.location.href = 'index.html';
          else if (action === 'next') sayNext();
        });
      });
      document.querySelectorAll('[data-pl-agent-btn]').forEach(function(b) {
        b.addEventListener('click', function() { switchAgent(b.getAttribute('data-pl-agent-btn')); });
      });
      // Chip presets (v5)
      document.querySelectorAll('[data-pl-preset]').forEach(function(chip) {
        chip.addEventListener('click', function() {
          submitAsk(chip.getAttribute('data-pl-preset'));
        });
      });
    }

    function cycleAgent() {
      var ids = ROSTER.map(function(a) { return a.id; });
      var idx = ids.indexOf(state.agentId);
      switchAgent(ids[(idx + 1) % ids.length]);
    }

    function showAskInput() {
      var form = document.querySelector('[data-pl-ask-form]');
      if (!form) return;
      form.style.display = 'flex';
      var input = form.querySelector('input');
      if (input) input.focus();
    }

    function hideAskInput() {
      var form = document.querySelector('[data-pl-ask-form]');
      if (form) form.style.display = 'none';
    }

    function showTools() {
      var textEl = document.querySelector('[data-pl-text]');
      if (!textEl) return;
      var line = agent().name + ' opens the toolkit: [PROJECTIONS] [TAPE] [ODDS] [WAIVERS]. (Prototype: toolkit selection is out of scope — pick one manually.)';
      typewriter(textEl, line);
    }

    function submitAsk(questionText) {
      hideAskInput();
      var chat = document.querySelector('[data-pl-chat]');
      if (chat) {
        var you = document.createElement('div');
        you.className = 'pl-v5-msg you';
        you.innerHTML = '<span class="who">YOU</span><span class="body"></span>';
        you.querySelector('.body').textContent = questionText;
        chat.appendChild(you);
        chat.scrollTop = chat.scrollHeight;
      }
      // Echo a "routed" reply via the agent
      var textEl = document.querySelector('[data-pl-text]');
      if (!textEl) return;
      var reply = agent().name + ' routes "' + questionText + '" → ' + agent().quips[Math.floor(Math.random() * agent().quips.length)];
      var caret = document.querySelector('[data-pl-caret]');
      if (caret) caret.style.visibility = 'hidden';
      typewriter(textEl, reply, {
        onDone: function() {
          if (caret) caret.style.visibility = 'visible';
          if (chat) {
            var them = document.createElement('div');
            them.className = 'pl-v5-msg';
            them.innerHTML = '<span class="who"></span><span class="body"></span>';
            them.querySelector('.who').textContent = agent().name;
            them.querySelector('.body').textContent = reply;
            chat.appendChild(them);
            chat.scrollTop = chat.scrollHeight;
          }
        }
      });
    }

    // Form submit wiring
    var form = document.querySelector('[data-pl-ask-form]');
    if (form) {
      form.addEventListener('submit', function(e) {
        e.preventDefault();
        var input = form.querySelector('input');
        var q = (input.value || '').trim();
        if (!q) return;
        input.value = '';
        submitAsk(q);
      });
    }

    // Peek toggle
    var peekBtn = document.querySelector('[data-pl-peek]');
    if (peekBtn) {
      var peeking = false;
      peekBtn.addEventListener('click', function() {
        peeking = !peeking;
        document.body.classList.toggle('pl-peeking', peeking);
        peekBtn.textContent = peeking ? 'show ui' : 'peek world';
      });
    }

    // Space / enter to advance in some versions
    document.addEventListener('keydown', function(e) {
      if (e.key === ' ' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault();
        sayNext();
      }
    });

    wireActions();
    renderSpeaker();
    sayNext();

    // Expose for console debugging
    global.PokeBattleState = state;
  }

  global.PokeBattle = {
    init: init,
    ROSTER: ROSTER
  };
})(window);
