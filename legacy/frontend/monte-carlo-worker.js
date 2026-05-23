// Monte Carlo Championship Probability Web Worker
// Runs 10,000 simulations off the main thread for responsive UI.
// Messages: { type: 'simulate', rosterPlayers, distributions, rosterIds, playoffSpots, sims, excludedPlayers }
// Returns:  { type: 'result', playoffCount, champCount, totalPts, ptsHistory }

self.onmessage = function(e) {
  var d = e.data;
  if (d.type === 'simulate') {
    var result = simulate(d.rosterPlayers, d.distributions, d.rosterIds, d.playoffSpots, d.sims || 10000, d.excludedPlayers);
    self.postMessage({ type: 'result', playoffCount: result.playoffCount, champCount: result.champCount, totalPts: result.totalPts, ptsHistory: result.ptsHistory });
  }
};

function simulate(rosterPlayers, distributions, rosterIds, playoffSpots, SIMS, excludedPlayers) {
  var playoffCount = {};
  var champCount = {};
  var totalPts = {};
  var ptsHistory = {};
  var nRosters = rosterIds.length;

  for (var i = 0; i < nRosters; i++) {
    var rid = rosterIds[i];
    playoffCount[rid] = 0;
    champCount[rid] = 0;
    totalPts[rid] = 0;
    ptsHistory[rid] = [];
  }

  // Pre-resolve roster player distributions for faster inner loop
  var rosterDists = new Array(nRosters);
  for (var ri = 0; ri < nRosters; ri++) {
    var roster = rosterPlayers[rosterIds[ri]];
    var dists = [];
    if (!roster || !roster.players) { rosterDists[ri] = dists; continue; }
    for (var pi = 0; pi < roster.players.length; pi++) {
      var pid = roster.players[pi];
      if (excludedPlayers && excludedPlayers[pid]) continue;
      var dist = distributions[pid];
      if (!dist || dist.games === 0 || dist.mean == null || dist.stdev == null) continue;
      dists.push({ mean: dist.mean, stdev: dist.stdev });
    }
    rosterDists[ri] = dists;
  }

  // Pre-extract wins/losses for ranking
  var rosterWins = new Array(nRosters);
  var rosterLosses = new Array(nRosters);
  for (var wi = 0; wi < nRosters; wi++) {
    var rp = rosterPlayers[rosterIds[wi]];
    rosterWins[wi] = (rp && rp.wins) || 0;
    rosterLosses[wi] = (rp && rp.losses) || 0;
  }

  // Reusable arrays to avoid allocation in hot loop
  var playerScores = [];
  var simScores = new Float64Array(nRosters);
  var ranked = new Array(nRosters);
  for (var init = 0; init < nRosters; init++) {
    ranked[init] = { idx: init, score: 0, wins: 0 };
  }

  for (var sim = 0; sim < SIMS; sim++) {
    // Score each roster
    for (var r = 0; r < nRosters; r++) {
      var dists = rosterDists[r];
      var nDists = dists.length;
      playerScores.length = 0;

      for (var p = 0; p < nDists; p++) {
        var d = dists[p];
        // Box-Muller transform
        var u1 = Math.random() || 1e-10;
        var u2 = Math.random();
        var z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
        // Clamp to [-4, 4]
        if (z > 4) z = 4; else if (z < -4) z = -4;
        var pts = d.mean + z * d.stdev;
        if (pts < 0) pts = 0;
        playerScores.push(pts);
      }

      // Sort descending, take top 9
      playerScores.sort(function(a, b) { return b - a; });
      var total = 0;
      var take = playerScores.length < 9 ? playerScores.length : 9;
      for (var t = 0; t < take; t++) total += playerScores[t];
      simScores[r] = total;
    }

    // Rank by wins then simScore
    for (var k = 0; k < nRosters; k++) {
      ranked[k].idx = k;
      ranked[k].score = simScores[k];
      ranked[k].wins = rosterWins[k];
    }
    ranked.sort(function(a, b) {
      if (b.wins !== a.wins) return b.wins - a.wins;
      return b.score - a.score;
    });

    // Playoff: top N
    var spots = playoffSpots < nRosters ? playoffSpots : nRosters;
    for (var j = 0; j < spots; j++) {
      playoffCount[rosterIds[ranked[j].idx]]++;
    }

    // Championship: highest score among playoff teams
    var bestScore = -1;
    var champIdx = -1;
    for (var c = 0; c < spots; c++) {
      if (ranked[c].score > bestScore) {
        bestScore = ranked[c].score;
        champIdx = ranked[c].idx;
      }
    }
    if (champIdx >= 0) champCount[rosterIds[champIdx]]++;

    // Accumulate
    for (var a = 0; a < nRosters; a++) {
      var rid = rosterIds[a];
      totalPts[rid] += simScores[a];
      ptsHistory[rid].push(Math.round(simScores[a] * 10) / 10);
    }
  }

  return { playoffCount: playoffCount, champCount: champCount, totalPts: totalPts, ptsHistory: ptsHistory };
}
