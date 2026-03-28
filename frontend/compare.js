/* Razzle — Shareable Player Comparison Page */

function _getPosColors() {
  var s = getComputedStyle(document.documentElement);
  return {
    QB: s.getPropertyValue('--pos-qb').trim() || "#5b7fff",
    RB: s.getPropertyValue('--pos-rb').trim() || "#2ec4b6",
    WR: s.getPropertyValue('--pos-wr').trim() || "#d97757",
    TE: s.getPropertyValue('--pos-te').trim() || "#8b5cf6"
  };
}
var POS_COLORS = (typeof getPosColors === "function") ? getPosColors() : { QB: "#5b7fff", RB: "#2ec4b6", WR: "#d97757", TE: "#8b5cf6" };
var POS_CSS = { QB: "var(--pos-qb)", RB: "var(--pos-rb)", WR: "var(--pos-wr)", TE: "var(--pos-te)" };

var _p1Data = null;
var _p2Data = null;

// ---------------------------------------------------------------------------
// Init
// ---------------------------------------------------------------------------

(async function init() {
  var ids = getIdsFromURL();
  if (!ids || ids.length < 2) {
    document.getElementById("comparePage").innerHTML =
      '<div class="compare-loading" style="max-width:480px;margin:60px auto;text-align:center;">' +
      '<div style="font-size:48px;margin-bottom:12px;">🐯</div>' +
      '<div style="font-family:var(--font-display);font-size:22px;margin-bottom:8px;">Pick two players first, boss.</div>' +
      '<div style="font-family:var(--font-hand);font-size:16px;color:var(--ink-light);margin-bottom:20px;">Select two players in the Lab and click Compare, or paste a compare URL.</div>' +
      '<a href="/lab.html" class="btn-chunky" style="display:inline-block;text-decoration:none;">Back to the Lab</a>' +
      '</div>';
    return;
  }
  await loadComparison(ids[0], ids[1]);
})();

function getIdsFromURL() {
  var path = window.location.pathname;
  // URL: /compare/{id1}/{id2}
  var match = path.match(/\/compare\/([^/]+)\/([^/]+)/);
  if (match) return [decodeURIComponent(match[1]), decodeURIComponent(match[2])];
  // Fallback: ?p1=xxx&p2=xxx
  var params = new URLSearchParams(window.location.search);
  var p1 = params.get("p1");
  var p2 = params.get("p2");
  if (p1 && p2) return [p1, p2];
  return null;
}

async function loadComparison(id1, id2) {
  var page = document.getElementById("comparePage");
  try {
    var results = await Promise.all([
      fetch("/api/players/" + encodeURIComponent(id1) + "/profile").then(function(r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); }),
      fetch("/api/players/" + encodeURIComponent(id2) + "/profile").then(function(r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
    ]);

    _p1Data = results[0];
    _p2Data = results[1];

    if (!_p1Data.player || !_p2Data.player) {
      page.innerHTML =
        '<div class="compare-loading">' +
        '<div class="compare-loading-text">one or both players not found on the film</div>' +
        '<a href="/lab.html" class="btn-primary" style="margin-top:16px;">Back to Screener</a>' +
        '</div>';
      return;
    }

    document.title = (_p1Data.player.full_name || "Player 1") + " vs " + (_p2Data.player.full_name || "Player 2") + " — Razzle";
    renderComparison(page);
  } catch (err) {
    page.innerHTML = razzleErrorHTML();
  }
}

// ---------------------------------------------------------------------------
// Render
// ---------------------------------------------------------------------------

function renderComparison(container) {
  var p1 = _p1Data.player, p2 = _p2Data.player;
  var c1 = _p1Data.career || {}, c2 = _p2Data.career || {};
  var pos1 = (p1.position || "").toUpperCase();
  var pos2 = (p2.position || "").toUpperCase();
  var color1 = POS_COLORS[pos1] || "#d97757";
  var color2 = POS_COLORS[pos2] || "#8b5cf6";
  // If same position, use position color + slightly different shade
  if (pos1 === pos2) {
    color2 = adjustColor(color1, -30);
  }

  var html = "";

  // Back link
  html += '<a href="/lab.html" class="compare-back">&larr; Back to Screener</a>';

  // Hero cards
  html += '<div class="compare-heroes">';
  html += renderHeroCard(p1, c1, pos1, color1);
  html += '<div class="compare-vs"><div class="compare-vs-badge">VS</div></div>';
  html += renderHeroCard(p2, c2, pos2, color2);
  html += '</div>';

  // Actions
  html += '<div class="compare-actions">';
  html += '<button class="btn-primary" onclick="exportComparePNG()" style="font-size:12px; padding:8px 18px;">Export PNG</button>';
  html += '<button class="btn-chunky" onclick="copyCompareURL()" style="font-size:12px; padding:8px 18px;">Copy Link</button>';
  html += '<a href="/player/' + encodeURIComponent(p1.player_id || "") + '" class="btn-chunky" style="font-size:12px; padding:8px 14px; text-decoration:none;">' + esc(p1.full_name) + ' Profile</a>';
  html += '<a href="/player/' + encodeURIComponent(p2.player_id || "") + '" class="btn-chunky" style="font-size:12px; padding:8px 14px; text-decoration:none;">' + esc(p2.full_name) + ' Profile</a>';
  html += '</div>';

  // Charts
  html += '<div class="compare-charts-row">';
  // Radar overlay
  html += '<div class="compare-section compare-chart-wrap">';
  html += '<div class="compare-section-title">Stat Shape Overlay</div>';
  html += '<canvas id="compareRadar" width="400" height="360"></canvas>';
  html += '<div class="compare-legend">';
  html += '<span><span class="compare-legend-dot" style="background:' + color1 + ';"></span>' + esc(p1.full_name) + '</span>';
  html += '<span><span class="compare-legend-dot" style="background:' + color2 + ';"></span>' + esc(p2.full_name) + '</span>';
  html += '</div>';
  html += '</div>';

  // Career arc overlay
  var s1 = _p1Data.seasons || [];
  var s2 = _p2Data.seasons || [];
  if (s1.length > 1 || s2.length > 1) {
    html += '<div class="compare-section compare-chart-wrap">';
    html += '<div class="compare-section-title">Career Arc</div>';
    html += '<canvas id="compareArc" width="400" height="360"></canvas>';
    html += '<div class="compare-legend">';
    html += '<span><span class="compare-legend-dot" style="background:' + color1 + ';"></span>' + esc(p1.full_name) + '</span>';
    html += '<span><span class="compare-legend-dot" style="background:' + color2 + ';"></span>' + esc(p2.full_name) + '</span>';
    html += '</div>';
    html += '</div>';
  }
  html += '</div>';

  // Stat diff table
  html += '<div class="compare-section">';
  html += '<div class="compare-section-title">Head-to-Head Stats</div>';
  html += renderStatDiffTable(p1, p2, c1, c2, pos1, pos2, color1, color2);
  html += '<div class="compare-annotation">green = advantage, based on career totals</div>';
  html += '</div>';

  container.innerHTML = html;

  // Draw charts
  requestAnimationFrame(function() {
    drawCompareRadar(color1, color2, pos1);
    if (s1.length > 1 || s2.length > 1) drawCompareArc(color1, color2);
  });
}

function renderHeroCard(player, career, pos, color) {
  var g = career.games || 1;
  var pprg = career.fantasy_points_ppr ? (career.fantasy_points_ppr / g).toFixed(1) : "0.0";
  var age = player.age ? Math.floor(player.age) : "?";

  var html = '<div class="compare-player-card" style="border-top: 6px solid ' + color + ';">';
  html += '<div style="display:flex; align-items:center; gap:8px; margin-bottom:8px;">';
  html += '<span class="compare-pos-badge" style="background:' + color + ';">' + pos + '</span>';
  html += '<div class="compare-player-name">' + esc(player.full_name) + '</div>';
  html += '</div>';
  html += '<div class="compare-player-meta">';
  html += '<span style="color:' + color + '; font-weight:700;">' + esc(player.team || "FA") + '</span>';
  html += ' &middot; Age ' + age;
  if (player.college) html += ' &middot; ' + esc(player.college);
  html += '</div>';

  // Mini stats
  var stats = getMiniStats(pos, career);
  html += '<div class="compare-mini-stats">';
  for (var i = 0; i < stats.length; i++) {
    html += '<div class="compare-mini-stat">';
    html += '<div class="compare-mini-value">' + stats[i].value + '</div>';
    html += '<div class="compare-mini-label">' + stats[i].label + '</div>';
    html += '</div>';
  }
  html += '</div>';
  html += '</div>';
  return html;
}

function getMiniStats(pos, career) {
  var g = career.games || 1;
  var f0 = function(v) { return v != null ? Math.round(v).toLocaleString() : "\u2014"; };
  var f1 = function(v) { return v != null ? Number(v).toFixed(1) : "\u2014"; };
  var pprg = career.fantasy_points_ppr ? career.fantasy_points_ppr / g : 0;

  var base = [
    { label: "PPR/G", value: f1(pprg) },
    { label: "Games", value: f0(career.games) }
  ];

  if (pos === "QB") {
    return base.concat([
      { label: "Pass TD", value: f0(career.passing_tds) },
      { label: "Pass Yds", value: f0(career.passing_yards) }
    ]);
  } else if (pos === "RB") {
    return base.concat([
      { label: "Rush Yds", value: f0(career.rushing_yards) },
      { label: "Rec Yds", value: f0(career.receiving_yards) }
    ]);
  }
  return base.concat([
    { label: "Rec Yds", value: f0(career.receiving_yards) },
    { label: "Rec TD", value: f0(career.receiving_tds) }
  ]);
}

// ---------------------------------------------------------------------------
// Stat diff table
// ---------------------------------------------------------------------------

function renderStatDiffTable(p1, p2, c1, c2, pos1, pos2, color1, color2) {
  // Use the position of player 1 for stat selection, fallback to generic
  var pos = pos1 || pos2 || "WR";
  var rows = getCompareStats(pos);
  var g1 = c1.games || 1, g2 = c2.games || 1;

  var html = '<div style="overflow-x:auto; -webkit-overflow-scrolling:touch;">';
  html += '<table class="compare-stat-table">';
  html += '<thead><tr>';
  html += '<th>Stat</th>';
  html += '<th>' + esc(p1.full_name) + '</th>';
  html += '<th></th>';
  html += '<th>' + esc(p2.full_name) + '</th>';
  html += '</tr></thead><tbody>';

  for (var i = 0; i < rows.length; i++) {
    var r = rows[i];
    var v1 = getStatValue(c1, g1, r);
    var v2 = getStatValue(c2, g2, r);
    var winner = 0; // 0=tie, 1=p1, 2=p2
    if (v1 !== null && v2 !== null) {
      if (r.lower) { // lower is better (turnovers)
        winner = v1 < v2 ? 1 : v2 < v1 ? 2 : 0;
      } else {
        winner = v1 > v2 ? 1 : v2 > v1 ? 2 : 0;
      }
    }

    var disp1 = v1 != null ? r.fmt(v1) : "\u2014";
    var disp2 = v2 != null ? r.fmt(v2) : "\u2014";
    var cls1 = winner === 1 ? ' class="stat-win" style="color:' + color1 + ';"' : '';
    var cls2 = winner === 2 ? ' class="stat-win" style="color:' + color2 + ';"' : '';

    // Diff bar (use absolute values to handle negative stats like EPA)
    var bar = "";
    var absTotal = (v1 != null && v2 != null) ? (Math.abs(v1) + Math.abs(v2)) : 0;
    if (absTotal > 0 && isFinite(absTotal)) {
      var pct1 = Math.max((Math.abs(v1) / absTotal) * 100, 5);
      var pct2 = Math.max(100 - pct1, 5);
      // Normalize so they sum to exactly 100%
      var pctTotal = pct1 + pct2;
      pct1 = (pct1 / pctTotal) * 100;
      pct2 = (pct2 / pctTotal) * 100;
      bar = '<span class="compare-diff-bar" style="width:' + pct1 + '%; background:' + color1 + '; opacity:0.5;"></span>' +
            '<span class="compare-diff-bar" style="width:' + pct2 + '%; background:' + color2 + '; opacity:0.5;"></span>';
    }

    html += '<tr>';
    html += '<td>' + r.label + '</td>';
    html += '<td' + cls1 + '>' + disp1 + '</td>';
    html += '<td style="width:80px;">' + bar + '</td>';
    html += '<td' + cls2 + '>' + disp2 + '</td>';
    html += '</tr>';
  }

  html += '</tbody></table></div>';
  return html;
}

function getStatValue(career, games, statDef) {
  if (statDef.perGame) {
    var raw = career[statDef.key];
    return raw != null ? raw / (games || 1) : null;
  }
  return career[statDef.key] != null ? career[statDef.key] : null;
}

function getCompareStats(pos) {
  var f0 = function(v) { return v != null ? Math.round(v).toLocaleString() : "\u2014"; };
  var f1 = function(v) { return v != null ? Number(v).toFixed(1) : "\u2014"; };
  var fp = function(v) { return v != null ? Number(v).toFixed(1) + "%" : "\u2014"; };

  var base = [
    { key: "games", label: "Games", fmt: f0 },
    { key: "fantasy_points_ppr", label: "PPR Total", fmt: f1 },
    { key: "fantasy_points_ppr", label: "PPR/G", fmt: f1, perGame: true },
  ];

  if (pos === "QB") {
    return base.concat([
      { key: "completions", label: "Completions", fmt: f0 },
      { key: "attempts", label: "Pass Attempts", fmt: f0 },
      { key: "passing_yards", label: "Pass Yards", fmt: f0 },
      { key: "passing_tds", label: "Pass TDs", fmt: f0 },
      { key: "turnovers", label: "Turnovers", fmt: f0, lower: true },
      { key: "rushing_yards", label: "Rush Yards", fmt: f0 },
      { key: "rushing_tds", label: "Rush TDs", fmt: f0 },
    ]);
  } else if (pos === "RB") {
    return base.concat([
      { key: "carries", label: "Carries", fmt: f0 },
      { key: "rushing_yards", label: "Rush Yards", fmt: f0 },
      { key: "rushing_tds", label: "Rush TDs", fmt: f0 },
      { key: "targets", label: "Targets", fmt: f0 },
      { key: "receptions", label: "Receptions", fmt: f0 },
      { key: "receiving_yards", label: "Rec Yards", fmt: f0 },
      { key: "receiving_tds", label: "Rec TDs", fmt: f0 },
    ]);
  }
  // WR/TE
  return base.concat([
    { key: "targets", label: "Targets", fmt: f0 },
    { key: "receptions", label: "Receptions", fmt: f0 },
    { key: "receiving_yards", label: "Rec Yards", fmt: f0 },
    { key: "receiving_tds", label: "Rec TDs", fmt: f0 },
    { key: "rushing_yards", label: "Rush Yards", fmt: f0 },
  ]);
}

// ---------------------------------------------------------------------------
// Radar chart (overlaid)
// ---------------------------------------------------------------------------

function drawCompareRadar(color1, color2, pos) {
  var canvas = document.getElementById("compareRadar");
  if (!canvas) return;
  var ctx = canvas.getContext("2d");
  var W = canvas.width, H = canvas.height;
  var cx = W / 2, cy = H / 2 + 10;
  var R = Math.min(W, H) / 2 - 50;
  var t = getCanvasTheme();

  var s1 = _p1Data.seasons || [];
  var s2 = _p2Data.seasons || [];
  var latest1 = s1.length > 0 ? s1[s1.length - 1] : _p1Data.career;
  var latest2 = s2.length > 0 ? s2[s2.length - 1] : _p2Data.career;
  if (!latest1 && !latest2) return;

  var axes = getRadarAxes(pos);
  var n = axes.length;
  if (!n) return;

  ctx.clearRect(0, 0, W, H);

  // Grid rings
  for (var ring = 1; ring <= 4; ring++) {
    var r = (ring / 4) * R;
    ctx.beginPath();
    for (var i = 0; i <= n; i++) {
      var angle = (Math.PI * 2 * (i % n)) / n - Math.PI / 2;
      var x = cx + r * Math.cos(angle);
      var y = cy + r * Math.sin(angle);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.strokeStyle = t.inkFaint;
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // Axis lines + labels
  ctx.font = "11px 'Space Mono', monospace";
  ctx.fillStyle = t.inkMedium;
  ctx.textAlign = "center";
  for (var i = 0; i < n; i++) {
    var angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    ctx.fillText(axes[i].label, cx + (R + 28) * Math.cos(angle), cy + (R + 28) * Math.sin(angle) + 4);
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + R * Math.cos(angle), cy + R * Math.sin(angle));
    ctx.strokeStyle = t.inkFaint;
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // Draw both data polygons
  if (latest1) drawRadarPoly(ctx, cx, cy, R, n, axes, latest1, color1, 0.25);
  if (latest2) drawRadarPoly(ctx, cx, cy, R, n, axes, latest2, color2, 0.25);
}

function drawRadarPoly(ctx, cx, cy, R, n, axes, data, color, alpha) {
  var t = getCanvasTheme();
  var values = axes.map(function(a) { return Math.min((data[a.key] || 0) / a.max, 1); });

  ctx.beginPath();
  for (var i = 0; i <= n; i++) {
    var idx = i % n;
    var angle = (Math.PI * 2 * idx) / n - Math.PI / 2;
    var r = values[idx] * R;
    var x = cx + r * Math.cos(angle);
    var y = cy + r * Math.sin(angle);
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.closePath();

  // Semi-transparent fill
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.fill();
  ctx.globalAlpha = 1;

  ctx.strokeStyle = color;
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Dots
  for (var i = 0; i < n; i++) {
    var angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    var r = values[i] * R;
    ctx.beginPath();
    ctx.arc(cx + r * Math.cos(angle), cy + r * Math.sin(angle), 4, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = t.white;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }
}

function getRadarAxes(pos) {
  if (pos === "QB") {
    return [
      { key: "passing_yards", label: "Pass Yds", max: 5500 },
      { key: "passing_tds", label: "Pass TD", max: 50 },
      { key: "comp_pct", label: "CMP%", max: 75 },
      { key: "rushing_yards", label: "Rush Yds", max: 1000 },
      { key: "fantasy_points_ppr", label: "PPR", max: 400 },
    ];
  } else if (pos === "RB") {
    return [
      { key: "rushing_yards", label: "Rush Yds", max: 2000 },
      { key: "rushing_tds", label: "Rush TD", max: 20 },
      { key: "receptions", label: "REC", max: 100 },
      { key: "receiving_yards", label: "Rec Yds", max: 800 },
      { key: "fantasy_points_ppr", label: "PPR", max: 350 },
    ];
  } else if (pos === "TE") {
    return [
      { key: "receptions", label: "REC", max: 110 },
      { key: "receiving_yards", label: "Rec Yds", max: 1400 },
      { key: "receiving_tds", label: "Rec TD", max: 14 },
      { key: "targets", label: "TGT", max: 150 },
      { key: "fantasy_points_ppr", label: "PPR", max: 300 },
    ];
  }
  // WR
  return [
    { key: "receiving_yards", label: "Rec Yds", max: 1800 },
    { key: "receiving_tds", label: "Rec TD", max: 16 },
    { key: "receptions", label: "REC", max: 130 },
    { key: "targets", label: "TGT", max: 180 },
    { key: "fantasy_points_ppr", label: "PPR", max: 400 },
  ];
}

// ---------------------------------------------------------------------------
// Career arc chart (dual line)
// ---------------------------------------------------------------------------

function drawCompareArc(color1, color2) {
  var canvas = document.getElementById("compareArc");
  if (!canvas) return;
  var ctx = canvas.getContext("2d");
  var W = canvas.width, H = canvas.height;
  var pad = { top: 20, right: 30, bottom: 35, left: 55 };
  var plotW = W - pad.left - pad.right;
  var plotH = H - pad.top - pad.bottom;
  var t = getCanvasTheme();

  ctx.clearRect(0, 0, W, H);

  var s1 = _p1Data.seasons || [];
  var s2 = _p2Data.seasons || [];

  // Collect all years for X axis
  var allYears = {};
  s1.forEach(function(s) { allYears[s.season] = true; });
  s2.forEach(function(s) { allYears[s.season] = true; });
  var years = Object.keys(allYears).map(Number).sort();
  if (years.length < 2) return;

  var v1Map = {}, v2Map = {};
  s1.forEach(function(s) { v1Map[s.season] = s.fantasy_points_ppr || 0; });
  s2.forEach(function(s) { v2Map[s.season] = s.fantasy_points_ppr || 0; });

  var allVals = years.map(function(y) { return v1Map[y] || 0; }).concat(years.map(function(y) { return v2Map[y] || 0; }));
  var maxVal = Math.max.apply(null, allVals.concat([1]));

  // Y gridlines
  ctx.strokeStyle = t.inkFaint;
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);
  for (var i = 0; i <= 4; i++) {
    var y = pad.top + plotH - (i / 4) * plotH;
    ctx.beginPath();
    ctx.moveTo(pad.left, y);
    ctx.lineTo(W - pad.right, y);
    ctx.stroke();
    ctx.fillStyle = t.inkLight;
    ctx.font = "11px 'Space Mono', monospace";
    ctx.textAlign = "right";
    ctx.fillText(String(Math.round((i / 4) * maxVal)), pad.left - 8, y + 4);
  }
  ctx.setLineDash([]);

  // X labels
  ctx.fillStyle = t.inkLight;
  ctx.font = "11px 'Space Mono', monospace";
  ctx.textAlign = "center";
  for (var i = 0; i < years.length; i++) {
    var x = pad.left + (i / (years.length - 1)) * plotW;
    ctx.fillText(String(years[i]), x, H - pad.bottom + 18);
  }

  // Draw lines for each player
  drawArcLine(ctx, years, v1Map, maxVal, pad, plotW, plotH, color1);
  drawArcLine(ctx, years, v2Map, maxVal, pad, plotW, plotH, color2);

  // Y axis label
  ctx.save();
  ctx.translate(14, pad.top + plotH / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillStyle = t.inkLight;
  ctx.font = "11px 'Space Mono', monospace";
  ctx.textAlign = "center";
  ctx.fillText("PPR Points", 0, 0);
  ctx.restore();
}

function drawArcLine(ctx, years, vMap, maxVal, pad, plotW, plotH, color) {
  var points = [];
  for (var i = 0; i < years.length; i++) {
    if (vMap[years[i]] != null) {
      points.push({
        x: pad.left + (i / (years.length - 1)) * plotW,
        y: pad.top + plotH - ((vMap[years[i]] || 0) / maxVal) * plotH,
        val: vMap[years[i]] || 0
      });
    }
  }
  if (points.length < 2) return;

  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  for (var i = 0; i < points.length; i++) {
    i === 0 ? ctx.moveTo(points[i].x, points[i].y) : ctx.lineTo(points[i].x, points[i].y);
  }
  ctx.stroke();

  // Dots
  var t = getCanvasTheme();
  for (var i = 0; i < points.length; i++) {
    ctx.beginPath();
    ctx.arc(points[i].x, points[i].y, 4, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = t.white;
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}

// ---------------------------------------------------------------------------
// PNG Export
// ---------------------------------------------------------------------------

function exportComparePNG() {
  if (!_p1Data || !_p2Data || !_p1Data.player || !_p2Data.player) return;

  var p1 = _p1Data.player, p2 = _p2Data.player;
  var c1 = _p1Data.career || {}, c2 = _p2Data.career || {};
  var pos1 = (p1.position || "").toUpperCase();
  var pos2 = (p2.position || "").toUpperCase();
  var _pc = _getPosColors();
  var color1 = _pc[pos1] || "#d97757";
  var color2 = _pc[pos2] || "#8b5cf6";
  if (pos1 === pos2) color2 = adjustColor(color1, -30);

  var t = getCanvasTheme();

  var W = 1200, H = 630;
  var canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  var ctx = canvas.getContext("2d");

  // Background
  ctx.fillStyle = t.bg;
  ctx.fillRect(0, 0, W, H);

  // Top accent stripe split
  ctx.fillStyle = color1;
  ctx.fillRect(0, 0, W / 2, 8);
  ctx.fillStyle = color2;
  ctx.fillRect(W / 2, 0, W / 2, 8);

  // VS badge
  ctx.fillStyle = t.bg;
  ctx.strokeStyle = t.ink;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(W / 2, 80, 28, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = _pc.WR || "#d97757";
  ctx.font = "20px 'Luckiest Guy', cursive";
  ctx.textAlign = "center";
  ctx.fillText("VS", W / 2, 87);

  // Player 1 card (left)
  drawExportPlayerCard(ctx, 40, 24, W / 2 - 70, 200, p1, c1, pos1, color1);

  // Player 2 card (right)
  drawExportPlayerCard(ctx, W / 2 + 30, 24, W / 2 - 70, 200, p2, c2, pos2, color2);

  // Stat comparison rows in lower half
  var pos = pos1 || pos2 || "WR";
  var stats = getCompareStats(pos);
  var g1 = c1.games || 1, g2 = c2.games || 1;
  var startY = 244;
  var rowH = 22;
  var maxRows = Math.min(stats.length, 12);

  ctx.font = "bold 11px 'Space Mono', monospace";
  for (var i = 0; i < maxRows; i++) {
    var r = stats[i];
    var v1 = getStatValue(c1, g1, r);
    var v2 = getStatValue(c2, g2, r);
    var y = startY + i * rowH;

    // Alternating row bg
    if (i % 2 === 0) {
      ctx.fillStyle = t.isDark ? "rgba(237,224,207,0.06)" : "rgba(247,239,229,0.5)";
      ctx.fillRect(50, y - 2, W - 100, rowH);
    }

    // Label
    ctx.fillStyle = t.inkLight;
    ctx.font = "11px 'Space Mono', monospace";
    ctx.textAlign = "center";
    ctx.fillText(r.label, W / 2, y + 14);

    // Values
    var winner = 0;
    if (v1 !== null && v2 !== null) {
      if (r.lower) winner = v1 < v2 ? 1 : v2 < v1 ? 2 : 0;
      else winner = v1 > v2 ? 1 : v2 > v1 ? 2 : 0;
    }

    ctx.font = winner === 1 ? "bold 13px 'Space Mono', monospace" : "13px 'Space Mono', monospace";
    ctx.fillStyle = winner === 1 ? color1 : t.ink;
    ctx.textAlign = "right";
    ctx.fillText(v1 !== null ? r.fmt(v1) : "\u2014", W / 2 - 70, y + 14);

    ctx.font = winner === 2 ? "bold 13px 'Space Mono', monospace" : "13px 'Space Mono', monospace";
    ctx.fillStyle = winner === 2 ? color2 : t.ink;
    ctx.textAlign = "left";
    ctx.fillText(v2 !== null ? r.fmt(v2) : "\u2014", W / 2 + 70, y + 14);
  }

  // Radar overlay in bottom-right
  var radarCx = W - 180, radarCy = 440, radarR = 110;
  drawRadarOnExport(ctx, radarCx, radarCy, radarR, color1, color2, pos);

  // Watermark
  ctx.fillStyle = t.isDark ? "rgba(237,224,207,0.3)" : "rgba(45,31,20,0.3)";
  ctx.font = "18px 'Luckiest Guy', cursive";
  ctx.textAlign = "right";
  ctx.fillText("razzle.lol", W - 50, H - 30);

  // Handwritten annotation
  ctx.fillStyle = t.isDark ? "rgba(237,224,207,0.25)" : "rgba(45,31,20,0.25)";
  ctx.font = "16px 'Caveat', cursive";
  ctx.textAlign = "left";
  ctx.fillText("who would you rather have?", 50, H - 30);

  // Download
  var link = document.createElement("a");
  var name1 = (p1.full_name || "p1").replace(/[^a-zA-Z0-9]/g, "_").toLowerCase();
  var name2 = (p2.full_name || "p2").replace(/[^a-zA-Z0-9]/g, "_").toLowerCase();
  link.download = name1 + "_vs_" + name2 + "_razzle.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
}

function drawExportPlayerCard(ctx, x, y, w, h, player, career, pos, color) {
  var t = getCanvasTheme();
  // Card bg
  ctx.fillStyle = t.bgCard;
  ctx.strokeStyle = t.ink;
  ctx.lineWidth = 2;
  roundRect(ctx, x, y, w, h, 10);
  ctx.fill();
  roundRect(ctx, x, y, w, h, 10);
  ctx.stroke();

  // Top stripe
  ctx.fillStyle = color;
  ctx.fillRect(x + 1, y + 1, w - 2, 6);

  // Position badge
  ctx.fillStyle = color;
  roundRect(ctx, x + 14, y + 18, 50, 36, 6);
  ctx.fill();
  ctx.strokeStyle = t.ink;
  ctx.lineWidth = 2;
  roundRect(ctx, x + 14, y + 18, 50, 36, 6);
  ctx.stroke();
  ctx.fillStyle = t.white;
  ctx.font = "22px 'Luckiest Guy', cursive";
  ctx.textAlign = "center";
  ctx.fillText(pos, x + 39, y + 44);

  // Name
  ctx.fillStyle = t.ink;
  ctx.font = "26px 'Luckiest Guy', cursive";
  ctx.textAlign = "left";
  var displayName = player.full_name || "";
  // Truncate if too long
  if (ctx.measureText(displayName).width > w - 90) {
    while (ctx.measureText(displayName + "...").width > w - 90 && displayName.length > 0) {
      displayName = displayName.slice(0, -1);
    }
    displayName += "...";
  }
  ctx.fillText(displayName, x + 74, y + 46);

  // Meta
  ctx.fillStyle = t.inkLight;
  ctx.font = "13px 'Space Mono', monospace";
  ctx.fillText((player.team || "FA") + " \u00B7 Age " + (player.age ? Math.floor(player.age) : "?"), x + 74, y + 68);

  // Stats
  var g = career.games || 1;
  var pprg = career.fantasy_points_ppr ? (career.fantasy_points_ppr / g).toFixed(1) : "0.0";
  var stats = [
    { label: "PPR/G", value: pprg },
    { label: "GP", value: String(career.games || 0) },
  ];
  if (pos === "QB") {
    stats.push({ label: "PASS TD", value: String(Math.round(career.passing_tds || 0)) });
  } else if (pos === "RB") {
    stats.push({ label: "RUSH YD", value: String(Math.round(career.rushing_yards || 0)) });
  } else {
    stats.push({ label: "REC YD", value: String(Math.round(career.receiving_yards || 0)) });
  }

  var boxW = Math.floor((w - 40) / stats.length);
  for (var i = 0; i < stats.length; i++) {
    var bx = x + 14 + i * (boxW + 6);
    var by = y + 90;
    ctx.fillStyle = t.bg;
    roundRect(ctx, bx, by, boxW, 52, 6);
    ctx.fill();
    ctx.strokeStyle = t.ink;
    ctx.lineWidth = 1;
    roundRect(ctx, bx, by, boxW, 52, 6);
    ctx.stroke();

    ctx.fillStyle = t.ink;
    ctx.font = "20px 'Luckiest Guy', cursive";
    ctx.textAlign = "center";
    ctx.fillText(stats[i].value, bx + boxW / 2, by + 26);

    ctx.fillStyle = t.inkLight;
    ctx.font = "11px 'Space Mono', monospace";
    ctx.fillText(stats[i].label, bx + boxW / 2, by + 42);
  }
}

function drawRadarOnExport(ctx, cx, cy, R, color1, color2, pos) {
  var t = getCanvasTheme();
  var s1 = _p1Data.seasons || [];
  var s2 = _p2Data.seasons || [];
  var latest1 = s1.length > 0 ? s1[s1.length - 1] : _p1Data.career;
  var latest2 = s2.length > 0 ? s2[s2.length - 1] : _p2Data.career;

  var axes = getRadarAxes(pos);
  var n = axes.length;

  // Grid
  for (var ring = 1; ring <= 4; ring++) {
    var r = (ring / 4) * R;
    ctx.beginPath();
    for (var i = 0; i <= n; i++) {
      var angle = (Math.PI * 2 * (i % n)) / n - Math.PI / 2;
      i === 0 ? ctx.moveTo(cx + r * Math.cos(angle), cy + r * Math.sin(angle))
              : ctx.lineTo(cx + r * Math.cos(angle), cy + r * Math.sin(angle));
    }
    ctx.closePath();
    ctx.strokeStyle = t.inkFaint;
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // Labels
  ctx.font = "11px 'Space Mono', monospace";
  ctx.fillStyle = t.inkMedium;
  ctx.textAlign = "center";
  for (var i = 0; i < n; i++) {
    var angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    ctx.fillText(axes[i].label, cx + (R + 18) * Math.cos(angle), cy + (R + 18) * Math.sin(angle) + 3);
  }

  // Data polygons
  if (latest1) drawRadarPolyExport(ctx, cx, cy, R, n, axes, latest1, color1);
  if (latest2) drawRadarPolyExport(ctx, cx, cy, R, n, axes, latest2, color2);
}

function drawRadarPolyExport(ctx, cx, cy, R, n, axes, data, color) {
  var values = axes.map(function(a) { return Math.min((data[a.key] || 0) / a.max, 1); });
  ctx.beginPath();
  for (var i = 0; i <= n; i++) {
    var idx = i % n;
    var angle = (Math.PI * 2 * idx) / n - Math.PI / 2;
    var r = values[idx] * R;
    i === 0 ? ctx.moveTo(cx + r * Math.cos(angle), cy + r * Math.sin(angle))
            : ctx.lineTo(cx + r * Math.cos(angle), cy + r * Math.sin(angle));
  }
  ctx.closePath();
  ctx.globalAlpha = 0.2;
  ctx.fillStyle = color;
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.stroke();
}

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

function adjustColor(hex, amount) {
  var r = parseInt(hex.slice(1, 3), 16) || 0;
  var g = parseInt(hex.slice(3, 5), 16) || 0;
  var b = parseInt(hex.slice(5, 7), 16) || 0;
  r = Math.max(0, Math.min(255, r + amount));
  g = Math.max(0, Math.min(255, g + amount));
  b = Math.max(0, Math.min(255, b + amount));
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

function copyCompareURL() {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(window.location.href).then(function() {
      showToast("link copied.");
    }).catch(function() {
      showToast("fumbled the copy — try again");
    });
  } else {
    try {
      var ta = document.createElement("textarea");
      ta.value = window.location.href;
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      showToast("link copied.");
    } catch(e) {
      showToast("fumbled the copy — try again");
    }
  }
}

function showToast(msg) {
  var toast = document.getElementById("compareToast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "compareToast";
    toast.style.cssText =
      "position:fixed; bottom:24px; left:50%; transform:translateX(-50%);" +
      "background:var(--ink); color:var(--bg); padding:10px 24px;" +
      "border-radius:8px; font-family:var(--font-mono); font-size:14px;" +
      "z-index:10000; box-shadow:4px 4px 0 var(--ink);" +
      "transition:opacity 0.3s; pointer-events:none;";
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.style.opacity = "1";
  setTimeout(function() { toast.style.opacity = "0"; }, 2500);
}

function esc(str) {
  var div = document.createElement("div");
  div.textContent = str || "";
  return div.innerHTML;
}
