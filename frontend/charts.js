/* Razzle — Charts (Canvas API, no dependencies) */

const CHART_COLORS = ["#d97757", "#5b7fff", "#2ec4b6", "#8b5cf6", "#e63946"];
let currentChartTab = "radar";

// ─── Chart panel ─────────────────────────────────────────────────
function openChartPanel() {
  document.getElementById("chartOverlay").classList.add("open");
  switchChartTab("radar");
}

function closeChartPanel(e) {
  if (e && e.target !== e.currentTarget) return;
  document.getElementById("chartOverlay").classList.remove("open");
}

function switchChartTab(tab) {
  currentChartTab = tab;
  document.querySelectorAll("[id^=chartTab]").forEach(b => b.classList.remove("active"));
  const btn = document.getElementById("chartTab" + tab.charAt(0).toUpperCase() + tab.slice(1));
  if (btn) btn.classList.add("active");

  // Heat map needs natural canvas size (scrollable); others scale to fit
  const canvas = document.getElementById("chartCanvas");
  const exportBtn = document.getElementById("chartExportBtn");
  if (tab === "heatmap") {
    canvas.style.width = "";
    canvas.style.minWidth = "700px";
    if (exportBtn) exportBtn.style.display = "";
  } else {
    canvas.style.width = "100%";
    canvas.style.minWidth = "";
    canvas.width = 760;
    canvas.height = 460;
    if (exportBtn) exportBtn.style.display = "none";
  }

  renderChartConfig();
  drawChart();
}

// ─── Chart config UI ─────────────────────────────────────────────
function renderChartConfig() {
  const container = document.getElementById("chartConfig");
  const statOptions = Object.entries(COLUMNS)
    .filter(([k, c]) => c.group !== "Formulas" && !["full_name", "position", "team"].includes(k))
    .map(([k, c]) => `<option value="${k}">${c.label}</option>`)
    .join("");

  if (currentChartTab === "radar") {
    const playerOptions = getPlayerOptions();
    container.innerHTML = `
      <div style="display:flex; gap:8px; flex-wrap:wrap; align-items:center;">
        <span style="font-family:var(--font-mono); font-size:11px; text-transform:uppercase; color:var(--ink-light);">Players:</span>
        <select class="select-chunky" id="radarPlayer1" onchange="drawChart()">${playerOptions}</select>
        <select class="select-chunky" id="radarPlayer2" onchange="drawChart()"><option value="">— compare —</option>${playerOptions}</select>
        <select class="select-chunky" id="radarPlayer3" onchange="drawChart()"><option value="">— player 3 —</option>${playerOptions}</select>
        <select class="select-chunky" id="radarPlayer4" onchange="drawChart()"><option value="">— player 4 —</option>${playerOptions}</select>
      </div>
      <div style="display:flex; gap:6px; flex-wrap:wrap; margin-top:8px;">
        <span style="font-family:var(--font-mono); font-size:11px; text-transform:uppercase; color:var(--ink-light);">Stats (5-6):</span>
        ${["fantasy_points_ppr", "rushing_yards", "receiving_yards", "touchdowns", "targets", "receptions"].map((s, i) =>
          `<select class="select-chunky radar-stat" onchange="drawChart()">${statOptions.replace(`value="${s}"`, `value="${s}" selected`)}</select>`
        ).join("")}
      </div>`;
  } else if (currentChartTab === "scatter") {
    container.innerHTML = `
      <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap;">
        <span style="font-family:var(--font-mono); font-size:11px; text-transform:uppercase; color:var(--ink-light);">X:</span>
        <select class="select-chunky" id="scatterX" onchange="drawChart()">${statOptions.replace('value="targets"', 'value="targets" selected')}</select>
        <span style="font-family:var(--font-mono); font-size:11px; text-transform:uppercase; color:var(--ink-light);">Y:</span>
        <select class="select-chunky" id="scatterY" onchange="drawChart()">${statOptions.replace('value="receiving_yards"', 'value="receiving_yards" selected')}</select>
        <label style="display:flex; align-items:center; gap:4px; font-family:var(--font-mono); font-size:11px; cursor:pointer;">
          <input type="checkbox" id="scatterTrend" onchange="drawChart()" style="accent-color:var(--orange); width:14px; height:14px;"> Trend line
        </label>
      </div>`;
  } else if (currentChartTab === "heatmap") {
    const heatmapPresets = {
      ppr_core: { label: "PPR Core", stats: ["fantasy_points_ppr", "ppg", "games", "touchdowns", "receptions", "targets", "receiving_yards", "rushing_yards"] },
      passing: { label: "Passing", stats: ["passing_yards", "passing_tds", "completions", "attempts", "interceptions", "comp_pct", "yards_per_att", "passing_epa"] },
      rushing: { label: "Rushing", stats: ["rushing_yards", "rushing_tds", "carries", "yards_per_carry", "rush_ypg", "rushing_epa", "touchdowns", "games"] },
      receiving: { label: "Receiving", stats: ["receiving_yards", "receiving_tds", "receptions", "targets", "catch_rate", "yards_per_target", "target_share", "wopr"] },
      efficiency: { label: "Efficiency", stats: ["ppg", "yards_per_carry", "yards_per_rec", "yards_per_target", "catch_rate", "target_share", "wopr", "racr"] },
    };
    const presetOptions = Object.entries(heatmapPresets).map(([k, v]) => `<option value="${k}">${v.label}</option>`).join("");
    container.innerHTML = `
      <div style="display:flex; gap:8px; flex-wrap:wrap; align-items:center;">
        <span style="font-family:var(--font-mono); font-size:11px; text-transform:uppercase; color:var(--ink-light);">Position:</span>
        <select class="select-chunky" id="heatmapPos" onchange="drawChart()">
          <option value="QB">QB</option>
          <option value="RB">RB</option>
          <option value="WR" selected>WR</option>
          <option value="TE">TE</option>
        </select>
        <span style="font-family:var(--font-mono); font-size:11px; text-transform:uppercase; color:var(--ink-light);">Stats:</span>
        <select class="select-chunky" id="heatmapPreset" onchange="drawChart()">${presetOptions}</select>
        <span style="font-family:var(--font-mono); font-size:11px; text-transform:uppercase; color:var(--ink-light);">Top:</span>
        <select class="select-chunky" id="heatmapCount" onchange="drawChart()">
          <option value="15">15</option>
          <option value="20" selected>20</option>
          <option value="30">30</option>
        </select>
      </div>
      <p style="font-family:var(--font-hand); font-size:16px; color:var(--ink-light); margin:6px 0 0;">
        percentile ranks within position group
      </p>`;
  } else if (currentChartTab === "trend") {
    const playerOptions = getPlayerOptions();
    const isCareer = state.season === "career";
    container.innerHTML = `
      <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap;">
        <span style="font-family:var(--font-mono); font-size:11px; text-transform:uppercase; color:var(--ink-light);">Player:</span>
        <select class="select-chunky" id="trendPlayer" onchange="drawChart()">${playerOptions}</select>
        <span style="font-family:var(--font-mono); font-size:11px; text-transform:uppercase; color:var(--ink-light);">Stat:</span>
        <select class="select-chunky" id="trendStat" onchange="drawChart()">${statOptions.replace('value="fantasy_points_ppr"', 'value="fantasy_points_ppr" selected')}</select>
        <span style="font-family:var(--font-mono); font-size:11px; text-transform:uppercase; color:var(--ink-light);">View:</span>
        <select class="select-chunky" id="trendMode" onchange="drawChart()">
          <option value="weekly" ${!isCareer ? "selected" : ""}>Weekly</option>
          <option value="seasons" ${isCareer ? "selected" : ""}>By Season</option>
        </select>
      </div>`;
  }
}

function getPlayerOptions() {
  // Use selected players first, then top items
  const players = state.selectedPlayers.length > 0
    ? state.selectedPlayers
    : state.items.slice(0, 20);
  return players.map(p =>
    `<option value="${escapeAttr(p.player_id)}">${escapeHtml(p.full_name)} (${escapeHtml(p.position)} - ${escapeHtml(p.team)})</option>`
  ).join("");
}

// ─── Draw chart dispatcher ───────────────────────────────────────
function drawChart() {
  if (currentChartTab === "radar") drawRadar();
  else if (currentChartTab === "scatter") drawScatter();
  else if (currentChartTab === "trend") drawTrend();
  else if (currentChartTab === "heatmap") drawHeatmap();
}

// ─── Radar chart ─────────────────────────────────────────────────
function drawRadar() {
  const canvas = document.getElementById("chartCanvas");
  const ctx = canvas.getContext("2d");
  const W = canvas.width, H = canvas.height;
  const cx = W / 2, cy = H / 2;
  const R = Math.min(cx, cy) - 60;
  var t = getCanvasTheme();

  ctx.clearRect(0, 0, W, H);

  // Get stats
  const statSelects = document.querySelectorAll(".radar-stat");
  const stats = Array.from(statSelects).map(s => s.value).filter(Boolean);
  if (stats.length < 3) return;

  const n = stats.length;
  const angleStep = (2 * Math.PI) / n;

  // Get players (up to 4)
  const players = [];
  for (let pi = 1; pi <= 4; pi++) {
    const sel = document.getElementById(`radarPlayer${pi}`);
    const pId = sel?.value;
    if (pId) {
      const p = state.items.find(i => i.player_id === pId);
      if (p) players.push(p);
    }
  }

  // Find min/max values for normalization (supports negative stats like EPA)
  const minVals = {};
  const maxVals = {};
  for (const s of stats) {
    const vals = state.items.map(function(i) { return i[s] || 0; });
    minVals[s] = vals.reduce(function(mn, v) { return Math.min(mn, v); }, 0);
    maxVals[s] = vals.reduce(function(mx, v) { return Math.max(mx, v); }, 1);
    // Ensure range is at least 1 to avoid division by zero
    if (maxVals[s] - minVals[s] < 0.001) maxVals[s] = minVals[s] + 1;
  }

  // Draw grid
  ctx.strokeStyle = t.inkFaint;
  ctx.lineWidth = 1;
  for (let ring = 1; ring <= 4; ring++) {
    const r = (R * ring) / 4;
    ctx.beginPath();
    for (let i = 0; i <= n; i++) {
      const angle = i * angleStep - Math.PI / 2;
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();
  }

  // Draw axes and labels
  ctx.fillStyle = t.ink;
  ctx.font = "bold 11px 'Space Mono', monospace";
  ctx.textAlign = "center";
  for (let i = 0; i < n; i++) {
    const angle = i * angleStep - Math.PI / 2;
    const x = cx + R * Math.cos(angle);
    const y = cy + R * Math.sin(angle);

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(x, y);
    ctx.strokeStyle = t.inkFaint;
    ctx.stroke();

    const col = COLUMNS[stats[i]];
    const label = col ? col.label : stats[i];
    const lx = cx + (R + 30) * Math.cos(angle);
    const ly = cy + (R + 30) * Math.sin(angle);
    ctx.fillText(label, lx, ly + 4);
  }

  // Draw player polygons
  players.forEach((player, pIdx) => {
    const color = CHART_COLORS[pIdx];
    ctx.beginPath();
    for (let i = 0; i <= n; i++) {
      const si = i % n;
      const angle = si * angleStep - Math.PI / 2;
      const raw = player[stats[si]] || 0;
      const val = (raw - minVals[stats[si]]) / (maxVals[stats[si]] - minVals[stats[si]]);
      const r = R * Math.max(0, Math.min(1, val));
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fillStyle = color + "33";
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.stroke();

    // Draw dots
    for (let i = 0; i < n; i++) {
      const angle = i * angleStep - Math.PI / 2;
      const raw = player[stats[i]] || 0;
      const val = (raw - minVals[stats[i]]) / (maxVals[stats[i]] - minVals[stats[i]]);
      const r = R * Math.max(0, Math.min(1, val));
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, 2 * Math.PI);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = t.ink;
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  });

  // Legend
  players.forEach((player, pIdx) => {
    ctx.fillStyle = CHART_COLORS[pIdx];
    ctx.fillRect(20, 20 + pIdx * 24, 14, 14);
    ctx.strokeStyle = t.ink;
    ctx.lineWidth = 2;
    ctx.strokeRect(20, 20 + pIdx * 24, 14, 14);
    ctx.fillStyle = t.ink;
    ctx.font = 'bold 13px "Space Mono", monospace';
    ctx.textAlign = "left";
    ctx.fillText(player.full_name, 40, 32 + pIdx * 24);
  });
}

// ─── Scatter plot ────────────────────────────────────────────────
function drawScatter() {
  const canvas = document.getElementById("chartCanvas");
  const ctx = canvas.getContext("2d");
  const W = canvas.width, H = canvas.height;
  const pad = { top: 30, right: 30, bottom: 50, left: 70 };
  var t = getCanvasTheme();

  ctx.clearRect(0, 0, W, H);

  const xKey = document.getElementById("scatterX")?.value || "targets";
  const yKey = document.getElementById("scatterY")?.value || "receiving_yards";
  const xCol = COLUMNS[xKey] || { label: xKey };
  const yCol = COLUMNS[yKey] || { label: yKey };

  const data = state.items.filter(p => p[xKey] != null && p[yKey] != null);
  if (!data.length) return;

  const xVals = data.map(p => p[xKey]);
  const yVals = data.map(p => p[yKey]);
  const xMin = xVals.reduce(function(a, b) { return Math.min(a, b); }, Infinity);
  const xMax = xVals.reduce(function(a, b) { return Math.max(a, b); }, -Infinity);
  const yMin = yVals.reduce(function(a, b) { return Math.min(a, b); }, Infinity);
  const yMax = yVals.reduce(function(a, b) { return Math.max(a, b); }, -Infinity);
  const xRange = xMax - xMin || 1;
  const yRange = yMax - yMin || 1;

  const plotW = W - pad.left - pad.right;
  const plotH = H - pad.top - pad.bottom;

  const toX = v => pad.left + ((v - xMin) / xRange) * plotW;
  const toY = v => pad.top + plotH - ((v - yMin) / yRange) * plotH;

  // Grid lines
  ctx.strokeStyle = t.inkFaint;
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);
  for (let i = 0; i <= 4; i++) {
    const x = pad.left + (plotW * i) / 4;
    const y = pad.top + (plotH * i) / 4;
    ctx.beginPath(); ctx.moveTo(x, pad.top); ctx.lineTo(x, pad.top + plotH); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(pad.left + plotW, y); ctx.stroke();
  }
  ctx.setLineDash([]);

  // Axes
  ctx.strokeStyle = t.ink;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(pad.left, pad.top);
  ctx.lineTo(pad.left, pad.top + plotH);
  ctx.lineTo(pad.left + plotW, pad.top + plotH);
  ctx.stroke();

  // Axis labels
  ctx.fillStyle = t.ink;
  ctx.font = "bold 12px 'Space Mono', monospace";
  ctx.textAlign = "center";
  ctx.fillText(xCol.label, pad.left + plotW / 2, H - 10);
  ctx.save();
  ctx.translate(16, pad.top + plotH / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText(yCol.label, 0, 0);
  ctx.restore();

  // Dots
  const posColors = { QB: "#5b7fff", RB: "#2ec4b6", WR: "#d97757", TE: "#8b5cf6" };
  for (const p of data) {
    const x = toX(p[xKey]);
    const y = toY(p[yKey]);
    const color = posColors[p.position] || t.inkLight;

    ctx.beginPath();
    ctx.arc(x, y, 5, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = t.ink;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  // Trend / regression line
  const showTrend = document.getElementById("scatterTrend")?.checked;
  if (showTrend && data.length >= 3) {
    const n = data.length;
    const sumX = xVals.reduce((a, b) => a + b, 0);
    const sumY = yVals.reduce((a, b) => a + b, 0);
    const sumXY = data.reduce((a, p) => a + p[xKey] * p[yKey], 0);
    const sumX2 = xVals.reduce((a, b) => a + b * b, 0);
    const sumY2 = yVals.reduce((a, b) => a + b * b, 0);
    const denom = n * sumX2 - sumX * sumX;
    if (denom !== 0) {
    const slope = (n * sumXY - sumX * sumY) / denom;
    const intercept = (sumY - slope * sumX) / n;
    // R-squared
    const ssRes = data.reduce((a, p) => { const pred = slope * p[xKey] + intercept; return a + (p[yKey] - pred) ** 2; }, 0);
    const meanY = sumY / n;
    const ssTot = yVals.reduce((a, v) => a + (v - meanY) ** 2, 0);
    const r2 = ssTot > 0 ? 1 - ssRes / ssTot : 0;

    // Draw line
    ctx.beginPath();
    ctx.moveTo(toX(xMin), toY(slope * xMin + intercept));
    ctx.lineTo(toX(xMax), toY(slope * xMax + intercept));
    ctx.strokeStyle = "#d97757";
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);
    ctx.stroke();
    ctx.setLineDash([]);

    // R² label
    ctx.font = "bold 11px 'Space Mono', monospace";
    ctx.fillStyle = "#d97757";
    ctx.textAlign = "right";
    ctx.fillText(`R\u00b2 = ${r2.toFixed(3)}`, W - pad.right - 5, pad.top + 16);
    } // end denom !== 0
  }

  // Label selected/top players
  const labeled = state.selectedPlayers.length > 0
    ? data.filter(p => state.selectedPlayers.some(s => s.player_id === p.player_id))
    : data.slice(0, 8);
  ctx.font = "bold 10px 'Space Mono', monospace";
  ctx.textAlign = "left";
  ctx.fillStyle = t.ink;
  for (const p of labeled) {
    const x = toX(p[xKey]);
    const y = toY(p[yKey]);
    const lastName = (p.full_name || "?").split(" ").pop() || "?";
    ctx.fillText(lastName, x + 7, y + 3);
  }
}

// ─── Trend chart ─────────────────────────────────────────────────
async function drawTrend() {
  const trendMode = document.getElementById("trendMode")?.value || "weekly";
  if (trendMode === "seasons") return drawSeasonTrend();
  return drawWeeklyTrend();
}

async function drawWeeklyTrend() {
  const canvas = document.getElementById("chartCanvas");
  const ctx = canvas.getContext("2d");
  const W = canvas.width, H = canvas.height;
  const pad = { top: 30, right: 30, bottom: 50, left: 70 };
  var t = getCanvasTheme();

  ctx.clearRect(0, 0, W, H);

  const playerId = document.getElementById("trendPlayer")?.value;
  const statKey = document.getElementById("trendStat")?.value || "fantasy_points_ppr";
  if (!playerId) return;

  ctx.font = "24px 'Caveat', cursive";
  ctx.fillStyle = t.inkLight;
  ctx.textAlign = "center";
  ctx.fillText(razzleLoading(), W / 2, H / 2);

  try {
    const season = state.season === "career" ? 0 : state.season;
    const data = await apiFetch(`/api/players/${playerId}/weeks?season=${season}`);
    const weeks = data.weeks || [];
    if (!weeks.length) {
      ctx.clearRect(0, 0, W, H);
      ctx.fillText("no weekly data", W / 2, H / 2);
      return;
    }

    ctx.clearRect(0, 0, W, H);
    _drawTrendLine(ctx, W, H, pad, weeks.map(w => w[statKey] || 0), weeks.map(w => `W${w.week}`),
      data.player?.full_name || playerId, statKey, `by Week (${data.season})`);

  } catch (e) {
    ctx.clearRect(0, 0, W, H);
    ctx.font = "24px 'Caveat', cursive";
    ctx.fillStyle = "#e63946";
    ctx.textAlign = "center";
    ctx.fillText(razzleError(), W / 2, H / 2);
    console.error(e);
  }
}

async function drawSeasonTrend() {
  const canvas = document.getElementById("chartCanvas");
  const ctx = canvas.getContext("2d");
  const W = canvas.width, H = canvas.height;
  const pad = { top: 30, right: 30, bottom: 50, left: 70 };
  var t = getCanvasTheme();

  ctx.clearRect(0, 0, W, H);

  const playerId = document.getElementById("trendPlayer")?.value;
  const statKey = document.getElementById("trendStat")?.value || "fantasy_points_ppr";
  if (!playerId) return;

  ctx.font = "24px 'Caveat', cursive";
  ctx.fillStyle = t.inkLight;
  ctx.textAlign = "center";
  ctx.fillText(razzleLoading(), W / 2, H / 2);

  try {
    const data = await apiFetch(`/api/players/${playerId}/seasons`);
    const seasons = data.seasons || [];
    if (!seasons.length) {
      ctx.clearRect(0, 0, W, H);
      ctx.fillText("no season data", W / 2, H / 2);
      return;
    }

    ctx.clearRect(0, 0, W, H);
    _drawTrendLine(ctx, W, H, pad, seasons.map(s => s[statKey] || 0), seasons.map(s => `${s.season}`),
      data.player?.full_name || playerId, statKey, "by Season");

  } catch (e) {
    ctx.clearRect(0, 0, W, H);
    ctx.font = "24px 'Caveat', cursive";
    ctx.fillStyle = "#e63946";
    ctx.textAlign = "center";
    ctx.fillText(razzleError(), W / 2, H / 2);
    console.error(e);
  }
}

function _drawTrendLine(ctx, W, H, pad, vals, labels, playerName, statKey, subtitle) {
  var t = getCanvasTheme();
  const maxVal = vals.reduce(function(a, b) { return Math.max(a, b); }, 1);
  const plotW = W - pad.left - pad.right;
  const plotH = H - pad.top - pad.bottom;

  const toX = (i) => pad.left + (i / Math.max(labels.length - 1, 1)) * plotW;
  const toY = (v) => pad.top + plotH - (v / maxVal) * plotH;

  // Grid
  ctx.strokeStyle = t.inkFaint;
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);
  for (let i = 0; i <= 4; i++) {
    const y = pad.top + (plotH * i) / 4;
    ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(pad.left + plotW, y); ctx.stroke();
    const val = maxVal * (1 - i / 4);
    ctx.font = "11px 'Space Mono', monospace";
    ctx.fillStyle = t.inkLight;
    ctx.textAlign = "right";
    ctx.fillText(val.toFixed(1), pad.left - 8, y + 4);
  }
  ctx.setLineDash([]);

  // Axes
  ctx.strokeStyle = t.ink;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(pad.left, pad.top);
  ctx.lineTo(pad.left, pad.top + plotH);
  ctx.lineTo(pad.left + plotW, pad.top + plotH);
  ctx.stroke();

  // Line
  ctx.beginPath();
  ctx.strokeStyle = "#d97757";
  ctx.lineWidth = 3;
  for (let i = 0; i < vals.length; i++) {
    const x = toX(i);
    const y = toY(vals[i]);
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.stroke();

  // Fill area
  ctx.beginPath();
  ctx.moveTo(toX(0), toY(vals[0]));
  for (let i = 1; i < vals.length; i++) ctx.lineTo(toX(i), toY(vals[i]));
  ctx.lineTo(toX(vals.length - 1), pad.top + plotH);
  ctx.lineTo(toX(0), pad.top + plotH);
  ctx.closePath();
  ctx.fillStyle = "#d9775722";
  ctx.fill();

  // Dots and labels
  ctx.font = "10px 'Space Mono', monospace";
  ctx.textAlign = "center";
  for (let i = 0; i < vals.length; i++) {
    const x = toX(i);
    const y = toY(vals[i]);

    ctx.beginPath();
    ctx.arc(x, y, 5, 0, 2 * Math.PI);
    ctx.fillStyle = "#d97757";
    ctx.fill();
    ctx.strokeStyle = t.ink;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = t.ink;
    ctx.fillText(labels[i], x, pad.top + plotH + 16);

    if (vals.length <= 20) {
      ctx.fillStyle = t.inkLight;
      ctx.fillText(vals[i].toFixed(1), x, y - 10);
    }
  }

  // Title
  const col = COLUMNS[statKey];
  const statLabel = col ? col.label : statKey;
  ctx.font = "bold 16px 'Luckiest Guy', cursive";
  ctx.fillStyle = t.ink;
  ctx.textAlign = "left";
  ctx.fillText(`${playerName} — ${statLabel} ${subtitle}`, pad.left, 20);
}

// ─── Chart PNG export ────────────────────────────────────────────
function exportChartPNG() {
  const canvas = document.getElementById("chartCanvas");
  if (!canvas) return;
  const pos = document.getElementById("heatmapPos")?.value || "heatmap";
  const link = document.createElement("a");
  link.download = `razzle-heatmap-${pos.toLowerCase()}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
}

// ─── Heat map ───────────────────────────────────────────────────
const HEATMAP_PRESETS = {
  ppr_core: ["fantasy_points_ppr", "ppg", "games", "touchdowns", "receptions", "targets", "receiving_yards", "rushing_yards"],
  passing: ["passing_yards", "passing_tds", "completions", "attempts", "interceptions", "comp_pct", "yards_per_att", "passing_epa"],
  rushing: ["rushing_yards", "rushing_tds", "carries", "yards_per_carry", "rush_ypg", "rushing_epa", "touchdowns", "games"],
  receiving: ["receiving_yards", "receiving_tds", "receptions", "targets", "catch_rate", "yards_per_target", "target_share", "wopr"],
  efficiency: ["ppg", "yards_per_carry", "yards_per_rec", "yards_per_target", "catch_rate", "target_share", "wopr", "racr"],
};

// Stats where lower is better (for correct percentile coloring)
const LOWER_IS_BETTER = ["interceptions"];

function drawHeatmap() {
  const canvas = document.getElementById("chartCanvas");
  const ctx = canvas.getContext("2d");

  const pos = document.getElementById("heatmapPos")?.value || "WR";
  const presetKey = document.getElementById("heatmapPreset")?.value || "ppr_core";
  const count = parseInt(document.getElementById("heatmapCount")?.value || "20");
  const stats = HEATMAP_PRESETS[presetKey] || HEATMAP_PRESETS.ppr_core;

  // Filter players by position from current data
  const posPlayers = state.items
    .filter(p => p.position === pos)
    .sort((a, b) => (b.fantasy_points_ppr || 0) - (a.fantasy_points_ppr || 0))
    .slice(0, count);

  var t = getCanvasTheme();

  if (posPlayers.length < 2) {
    canvas.width = 760;
    canvas.height = 460;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = "24px 'Caveat', cursive";
    ctx.fillStyle = t.inkLight;
    ctx.textAlign = "center";
    ctx.fillText(`no ${pos} data — try loading more players`, canvas.width / 2, canvas.height / 2);
    return;
  }

  // Compute percentile ranks per stat
  const percentiles = {};
  for (const stat of stats) {
    const vals = posPlayers.map(p => p[stat] ?? null).filter(v => v !== null);
    vals.sort((a, b) => a - b);
    percentiles[stat] = {};
    for (const p of posPlayers) {
      const v = p[stat];
      if (v == null || vals.length === 0) { percentiles[stat][p.player_id] = null; continue; }
      const rank = vals.filter(x => x <= v).length;
      let pct = Math.min(100, Math.max(0, (rank / vals.length) * 100));
      if (LOWER_IS_BETTER.includes(stat)) pct = 100 - pct;
      percentiles[stat][p.player_id] = pct;
    }
  }

  // Layout
  const nameColW = 140;
  const cellW = 72;
  const cellH = 28;
  const headerH = 60;
  const padL = 16;
  const padT = 40;
  const gridW = stats.length * cellW;
  const gridH = posPlayers.length * cellH;

  const W = padL + nameColW + gridW + 20;
  const H = padT + headerH + gridH + 30;
  canvas.width = W;
  canvas.height = H;

  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = t.bg;
  ctx.fillRect(0, 0, W, H);

  // Position colors
  const posColors = { QB: "#5b7fff", RB: "#2ec4b6", WR: "#d97757", TE: "#8b5cf6" };
  const posColor = posColors[pos] || "#d97757";

  // Title
  ctx.font = "bold 18px 'Luckiest Guy', cursive";
  ctx.fillStyle = t.ink;
  ctx.textAlign = "left";
  ctx.fillText(`${pos} Heat Map — Positional Percentiles`, padL, 26);

  // Subtitle
  ctx.font = "16px 'Caveat', cursive";
  ctx.fillStyle = t.inkLight;
  ctx.fillText(`top ${posPlayers.length} by PPR`, padL + ctx.measureText(`${pos} Heat Map — Positional Percentiles`).width + 12, 26);

  const gridX = padL + nameColW;
  const gridY = padT + headerH;

  // Column headers (rotated stat labels)
  ctx.save();
  ctx.font = "bold 11px 'Space Mono', monospace";
  ctx.fillStyle = t.ink;
  for (let c = 0; c < stats.length; c++) {
    const col = COLUMNS[stats[c]];
    const label = col ? col.label : stats[c];
    const x = gridX + c * cellW + cellW / 2;
    const y = gridY - 6;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(-Math.PI / 4);
    ctx.textAlign = "left";
    ctx.fillText(label, 0, 0);
    ctx.restore();
  }
  ctx.restore();

  // Grid border
  ctx.strokeStyle = t.ink;
  ctx.lineWidth = 3;
  ctx.strokeRect(gridX, gridY, gridW, gridH);

  // Rows
  for (let r = 0; r < posPlayers.length; r++) {
    const player = posPlayers[r];
    const y = gridY + r * cellH;

    // Alternating row bg
    if (r % 2 === 0) {
      ctx.fillStyle = t.bgCard;
      ctx.fillRect(padL, y, nameColW, cellH);
    }

    // Player name
    ctx.font = 'bold 12px "Space Mono", monospace';
    ctx.fillStyle = t.ink;
    ctx.textAlign = "left";
    const nameParts = (player.full_name || "?").split(" ");
    const lastName = nameParts.slice(-1)[0] || "?";
    const firstName = nameParts[0] || "?";
    const shortName = firstName.charAt(0) + ". " + lastName;
    ctx.fillText(shortName, padL + 4, y + cellH / 2 + 4);

    // Team badge
    ctx.font = "bold 9px 'Space Mono', monospace";
    ctx.fillStyle = t.inkLight;
    ctx.fillText(player.team || "", padL + nameColW - 30, y + cellH / 2 + 3);

    // Stat cells
    for (let c = 0; c < stats.length; c++) {
      const stat = stats[c];
      const x = gridX + c * cellW;
      const pct = percentiles[stat][player.player_id];

      // Cell background color based on percentile
      if (pct !== null) {
        ctx.fillStyle = heatmapColor(pct);
        ctx.fillRect(x, y, cellW, cellH);
      } else {
        ctx.fillStyle = t.bgWarm;
        ctx.fillRect(x, y, cellW, cellH);
      }

      // Cell border
      ctx.strokeStyle = t.gridLine;
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, cellW, cellH);

      // Stat value
      const val = player[stat];
      const col = COLUMNS[stat];
      if (val != null) {
        const dec = col ? col.decimals : 1;
        const pctSuffix = col && col.pct ? "%" : "";
        const formatted = dec != null ? Number(val).toFixed(dec) + pctSuffix : val;
        ctx.font = "bold 11px 'Space Mono', monospace";
        ctx.fillStyle = pct !== null && pct > 75 ? "#ffffff" : t.ink;
        ctx.textAlign = "center";
        ctx.fillText(formatted, x + cellW / 2, y + cellH / 2 + 4);
      } else {
        ctx.font = "11px 'Caveat', cursive";
        ctx.fillStyle = t.inkLight;
        ctx.textAlign = "center";
        ctx.fillText("—", x + cellW / 2, y + cellH / 2 + 4);
      }
    }

    // Row divider
    ctx.strokeStyle = t.gridLine;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padL, y + cellH);
    ctx.lineTo(gridX + gridW, y + cellH);
    ctx.stroke();
  }

  // Grid outer border (redraw on top)
  ctx.strokeStyle = t.ink;
  ctx.lineWidth = 3;
  ctx.strokeRect(gridX, gridY, gridW, gridH);

  // Legend
  const legendY = gridY + gridH + 14;
  const legendX = gridX;
  const legendW = 200;
  const legendH = 12;

  // Gradient bar
  for (let i = 0; i < legendW; i++) {
    ctx.fillStyle = heatmapColor((i / legendW) * 100);
    ctx.fillRect(legendX + i, legendY, 1, legendH);
  }
  ctx.strokeStyle = t.ink;
  ctx.lineWidth = 2;
  ctx.strokeRect(legendX, legendY, legendW, legendH);

  ctx.font = "bold 10px 'Space Mono', monospace";
  ctx.fillStyle = t.ink;
  ctx.textAlign = "left";
  ctx.fillText("0%", legendX, legendY + legendH + 12);
  ctx.textAlign = "center";
  ctx.fillText("50%", legendX + legendW / 2, legendY + legendH + 12);
  ctx.textAlign = "right";
  ctx.fillText("100%", legendX + legendW, legendY + legendH + 12);

  ctx.font = "14px 'Caveat', cursive";
  ctx.fillStyle = t.inkLight;
  ctx.textAlign = "left";
  ctx.fillText("positional percentile", legendX + legendW + 10, legendY + legendH + 2);

  // Watermark
  ctx.font = 'bold 12px "Space Mono", monospace';
  ctx.fillStyle = t.isDark ? "rgba(237,224,207,0.2)" : "rgba(45,31,20,0.2)";
  ctx.textAlign = "right";
  ctx.fillText("razzle.lol", W - 12, H - 8);
}

function heatmapColor(pct) {
  // 0% = red (#e63946), 50% = yellow (#ffc857), 100% = green (#2ec4b6)
  if (pct <= 50) {
    const t = pct / 50;
    const r = Math.round(230 + (255 - 230) * t);
    const g = Math.round(57 + (200 - 57) * t);
    const b = Math.round(70 + (87 - 70) * t);
    return `rgb(${r}, ${g}, ${b})`;
  } else {
    const t = (pct - 50) / 50;
    const r = Math.round(255 - (255 - 46) * t);
    const g = Math.round(200 + (196 - 200) * t);
    const b = Math.round(87 + (182 - 87) * t);
    return `rgb(${r}, ${g}, ${b})`;
  }
}

// ─── Comparison mode ─────────────────────────────────────────────
async function openCompare() {
  if (state.selectedPlayers.length < 2) { if (typeof _showToast === 'function') _showToast('select 2+ players with the checkboxes first'); return; }
  document.getElementById("compareOverlay").classList.add("open");

  if (typeof isProspectView === "function" && isProspectView()) {
    const names = state.selectedPlayers.map(p => p.player_name || p.full_name).join(",");
    try {
      const data = await apiFetch(`/api/prospects/compare?names=${encodeURIComponent(names)}&draft_year=${state.draftYear || state.season}`);
      renderProspectCompareTable(data.prospects);
      drawProspectCompareSpider(data.prospects);
    } catch (e) {
      document.getElementById("compareContent").innerHTML =
        '<p style="font-family:var(--font-hand); font-size:22px; color:var(--red);">fumbled the prospect comparison...</p>';
      console.error(e);
    }
  } else {
    const ids = state.selectedPlayers.map(p => p.player_id).join(",");
    try {
      const data = await apiFetch(`/api/players/compare?ids=${ids}&season=${state.season}`);
      renderCompareTable(data.players);
      drawCompareRadar(data.players);
    } catch (e) {
      document.getElementById("compareContent").innerHTML =
        '<p style="font-family:var(--font-hand); font-size:22px; color:var(--red);">fumbled the comparison...</p>';
      console.error(e);
    }
  }
}

function closeCompare(e) {
  if (e && e.target !== e.currentTarget) return;
  document.getElementById("compareOverlay").classList.remove("open");
}

function renderCompareTable(players) {
  const compareStats = ["fantasy_points_ppr", "ppg", "games", "passing_yards", "rushing_yards",
    "receiving_yards", "receptions", "targets", "touchdowns", "turnovers"];

  let html = '<table style="width:100%; border-collapse:collapse; font-family:var(--font-mono); font-size:13px; margin-top:16px;">';

  // Header
  html += '<tr><th style="text-align:left; padding:8px; border-bottom:3px solid var(--ink); font-family:var(--font-mono); font-size:11px; text-transform:uppercase;">Stat</th>';
  for (const p of players) {
    const posColor = { QB: "var(--pos-qb)", RB: "var(--pos-rb)", WR: "var(--pos-wr)", TE: "var(--pos-te)" }[p.position] || "var(--ink)";
    html += `<th style="text-align:right; padding:8px; border-bottom:3px solid var(--ink);">
      <span style="font-family:var(--font-mono); font-size:13px;">${escapeHtml(p.full_name)}</span>
      <span style="display:inline-block; background:${posColor}; color:var(--text-on-accent); padding:1px 5px; border-radius:4px; border:2px solid var(--ink); font-size:9px; margin-left:4px;">${escapeHtml(p.position)}</span>
    </th>`;
  }
  html += '</tr>';

  // Rows
  for (const statKey of compareStats) {
    const col = COLUMNS[statKey];
    if (!col) continue;
    const vals = players.map(p => p[statKey] || 0);
    const maxVal = Math.max(...vals, 0);

    html += `<tr>`;
    html += `<td style="padding:6px 8px; border-bottom:1px solid var(--ink-faint); font-weight:700; font-size:11px;">${col.label}</td>`;
    for (let i = 0; i < players.length; i++) {
      const isBest = vals[i] === maxVal && maxVal > 0;
      const style = isBest ? "font-weight:700; color:var(--green);" : "";
      html += `<td style="text-align:right; padding:6px 8px; border-bottom:1px solid var(--ink-faint); ${style}">${formatStat(vals[i], col.decimals)}</td>`;
    }
    html += '</tr>';
  }
  html += '</table>';

  // Export button
  html += `<div style="margin-top:12px; text-align:right;">`;
  html += `<button class="btn-primary" onclick="exportNFLCompareImage()" style="font-size:11px; padding:6px 14px;">Export PNG</button>`;
  html += `</div>`;

  document.getElementById("compareContent").innerHTML = html;

  // Stash players for export
  window._nflComparePlayers = players;
}

function drawCompareRadar(players) {
  const canvas = document.getElementById("compareRadar");
  const ctx = canvas.getContext("2d");
  const W = canvas.width, H = canvas.height;
  const cx = W / 2, cy = H / 2;
  const R = Math.min(cx, cy) - 50;
  var t = getCanvasTheme();

  ctx.clearRect(0, 0, W, H);

  const stats = ["fantasy_points_ppr", "rushing_yards", "receiving_yards", "touchdowns", "targets", "receptions"];
  const n = stats.length;
  const angleStep = (2 * Math.PI) / n;

  // Normalize using max across compared players
  const maxVals = {};
  for (const s of stats) {
    maxVals[s] = Math.max(...players.map(p => Math.abs(p[s] || 0)), 1);
  }

  // Grid
  ctx.strokeStyle = t.inkFaint;
  ctx.lineWidth = 1;
  for (let ring = 1; ring <= 4; ring++) {
    const r = (R * ring) / 4;
    ctx.beginPath();
    for (let i = 0; i <= n; i++) {
      const angle = i * angleStep - Math.PI / 2;
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();
  }

  // Labels
  ctx.fillStyle = t.ink;
  ctx.font = "bold 11px 'Space Mono', monospace";
  ctx.textAlign = "center";
  for (let i = 0; i < n; i++) {
    const angle = i * angleStep - Math.PI / 2;
    ctx.beginPath(); ctx.moveTo(cx, cy);
    ctx.lineTo(cx + R * Math.cos(angle), cy + R * Math.sin(angle));
    ctx.strokeStyle = t.inkFaint;
    ctx.stroke();

    const col = COLUMNS[stats[i]];
    const lx = cx + (R + 25) * Math.cos(angle);
    const ly = cy + (R + 25) * Math.sin(angle);
    ctx.fillText(col ? col.label : stats[i], lx, ly + 4);
  }

  // Player polygons
  players.forEach((player, pIdx) => {
    const color = CHART_COLORS[pIdx % CHART_COLORS.length];
    ctx.beginPath();
    for (let i = 0; i <= n; i++) {
      const si = i % n;
      const angle = si * angleStep - Math.PI / 2;
      const val = (player[stats[si]] || 0) / maxVals[stats[si]];
      const r = R * Math.max(0, Math.min(1, val));
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fillStyle = color + "33";
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.stroke();
  });

  // Legend
  ctx.textAlign = "left";
  players.forEach((player, pIdx) => {
    ctx.fillStyle = CHART_COLORS[pIdx % CHART_COLORS.length];
    ctx.fillRect(10, 10 + pIdx * 22, 12, 12);
    ctx.strokeStyle = t.ink;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(10, 10 + pIdx * 22, 12, 12);
    ctx.fillStyle = t.ink;
    ctx.font = 'bold 12px "Space Mono", monospace';
    ctx.fillText(player.full_name, 28, 21 + pIdx * 22);
  });
}


// ─── NFL Comparison Export ────────────────────────────────────────

function exportNFLCompareImage() {
  const players = window._nflComparePlayers;
  if (!players || players.length < 2) return;

  const radarCanvas = document.getElementById("compareRadar");
  const posColors = { QB: "#5b7fff", RB: "#2ec4b6", WR: "#d97757", TE: "#8b5cf6" };
  const padX = 30, padY = 30;
  const W = 800;

  // Layout measurements
  const titleH = 40;
  const cardH = 100;
  const cardGap = 16;
  const playerCardW = (W - padX * 2 - cardGap * (players.length - 1)) / players.length;
  const statsH = 28; // per stat row
  const compareStats = ["ppg", "fantasy_points_ppr", "games", "passing_yards", "rushing_yards",
    "receiving_yards", "receptions", "targets", "touchdowns"];
  // Filter to stats where at least one player has data
  const activeStats = compareStats.filter(k => players.some(p => (p[k] || 0) > 0));
  const tableH = 28 + activeStats.length * statsH; // header + rows
  const radarH = 320;
  const watermarkH = 40;
  const H = padY + titleH + cardH + 16 + tableH + 16 + radarH + watermarkH + padY;

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");

  var t = getCanvasTheme();

  // Background
  ctx.fillStyle = t.bgCard;
  ctx.fillRect(0, 0, W, H);

  // Title (handwritten annotation)
  ctx.font = "24px 'Caveat', cursive";
  ctx.fillStyle = t.subtitleAlpha;
  ctx.textAlign = "center";
  ctx.fillText("player comparison", W / 2, padY + 24);

  // Player cards
  let cardY = padY + titleH;
  players.forEach((p, i) => {
    const cx = padX + i * (playerCardW + cardGap);
    const pColor = posColors[p.position] || t.ink;

    // Card bg + border
    ctx.fillStyle = t.bgCard;
    ctx.fillRect(cx, cardY, playerCardW, cardH);
    ctx.strokeStyle = t.ink;
    ctx.lineWidth = 3;
    ctx.strokeRect(cx, cardY, playerCardW, cardH);
    // Offset shadow
    ctx.fillStyle = t.ink;
    ctx.fillRect(cx + 4, cardY + 4, playerCardW, cardH);
    ctx.fillStyle = t.bgCard;
    ctx.fillRect(cx, cardY, playerCardW, cardH);
    ctx.strokeStyle = t.ink;
    ctx.lineWidth = 3;
    ctx.strokeRect(cx, cardY, playerCardW, cardH);

    // Position color top stripe
    ctx.fillStyle = pColor;
    ctx.fillRect(cx + 1.5, cardY + 1.5, playerCardW - 3, 6);

    // Position badge
    const badgeW = 36, badgeH = 20;
    const badgeX = cx + 10, badgeY = cardY + 16;
    ctx.fillStyle = pColor;
    ctx.fillRect(badgeX, badgeY, badgeW, badgeH);
    ctx.strokeStyle = t.ink;
    ctx.lineWidth = 2;
    ctx.strokeRect(badgeX, badgeY, badgeW, badgeH);
    ctx.fillStyle = t.white;
    ctx.font = "bold 11px 'Space Mono', monospace";
    ctx.textAlign = "center";
    ctx.fillText(p.position, badgeX + badgeW / 2, badgeY + 15);

    // Player name
    ctx.textAlign = "left";
    ctx.fillStyle = t.ink;
    ctx.font = "bold 18px 'Luckiest Guy', cursive";
    const nameX = badgeX + badgeW + 8;
    ctx.fillText(p.full_name, nameX, cardY + 32);

    // Team + Age
    ctx.fillStyle = t.inkLight;
    ctx.font = "12px 'Space Mono', monospace";
    const ageText = p.age ? ` | Age ${p.age}` : "";
    ctx.fillText((p.team || "FA") + ageText, nameX, cardY + 48);

    // DVS badge
    const dvs = computeClientDVS(p.ppg, p.age, p.position);
    if (dvs != null) {
      const dvsColor = dvs >= 85 ? "#2ec4b6" : dvs >= 70 ? "#5b7fff" : dvs >= 55 ? "#d97757" : t.inkLight;
      const dvsLabel = dvs >= 85 ? "ELITE" : dvs >= 70 ? "STAR" : dvs >= 55 ? "STARTER" : "";
      const dvsW = 80, dvsH = 24;
      const dvsX = cx + playerCardW - dvsW - 10;
      const dvsY = cardY + 60;
      ctx.fillStyle = dvsColor + "30";
      ctx.fillRect(dvsX, dvsY, dvsW, dvsH);
      ctx.strokeStyle = dvsColor;
      ctx.lineWidth = 2;
      ctx.strokeRect(dvsX, dvsY, dvsW, dvsH);
      ctx.fillStyle = dvsColor;
      ctx.font = "bold 13px 'Space Mono', monospace";
      ctx.textAlign = "center";
      ctx.fillText("DVS " + dvs.toFixed(1), dvsX + dvsW / 2, dvsY + 16);

      // Tier label
      if (dvsLabel) {
        ctx.font = "bold 9px 'Space Mono', monospace";
        ctx.fillText(dvsLabel, cx + 10 + 18, cardY + 68);
      }
    }
  });

  // Stats comparison table
  const tY = cardY + cardH + 16;
  const tableW = W - padX * 2;
  const colW = tableW / (players.length + 1); // stat label + each player

  // Table border
  ctx.strokeStyle = t.ink;
  ctx.lineWidth = 3;
  ctx.strokeRect(padX, tY, tableW, tableH);

  // Table header
  ctx.fillStyle = t.bgWarm;
  ctx.fillRect(padX + 1.5, tY + 1.5, tableW - 3, 26);
  ctx.strokeStyle = t.ink;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(padX, tY + 28);
  ctx.lineTo(padX + tableW, tY + 28);
  ctx.stroke();

  ctx.fillStyle = t.ink;
  ctx.font = "bold 10px 'Space Mono', monospace";
  ctx.textAlign = "left";
  ctx.fillText("STAT", padX + 8, tY + 18);
  players.forEach((p, i) => {
    ctx.textAlign = "right";
    ctx.font = "bold 10px 'Space Mono', monospace";
    ctx.fillText((p.full_name || "").split(" ").pop() || "?", padX + (i + 2) * colW - 8, tY + 18);
  });

  // Stat rows
  activeStats.forEach((statKey, rowIdx) => {
    const rY = tY + 28 + rowIdx * statsH;
    const col = COLUMNS[statKey];
    if (!col) return;
    const vals = players.map(p => p[statKey] || 0);
    const maxVal = Math.max(...vals, 0);

    // Alternating bg
    if (rowIdx % 2 === 0) {
      ctx.fillStyle = t.isDark ? "rgba(237,224,207,0.06)" : "rgba(229,213,195,0.3)";
      ctx.fillRect(padX + 1.5, rY, tableW - 3, statsH);
    }

    // Row divider
    ctx.strokeStyle = t.inkFaint;
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(padX, rY + statsH);
    ctx.lineTo(padX + tableW, rY + statsH);
    ctx.stroke();

    // Label
    ctx.fillStyle = t.ink;
    ctx.font = "bold 11px 'Space Mono', monospace";
    ctx.textAlign = "left";
    ctx.fillText(col.label, padX + 8, rY + 18);

    // Values
    players.forEach((p, i) => {
      const val = p[statKey] || 0;
      const isBest = val === maxVal && maxVal > 0;
      ctx.fillStyle = isBest ? "#2ec4b6" : t.ink;
      ctx.font = isBest ? "bold 12px 'Space Mono', monospace" : "12px 'Space Mono', monospace";
      ctx.textAlign = "right";
      const dec = col.decimals != null ? col.decimals : (statKey === "ppg" ? 1 : 0);
      ctx.fillText(formatStat(val, dec), padX + (i + 2) * colW - 8, rY + 18);
    });
  });

  // Radar chart
  const radarY = tY + tableH + 16;
  if (radarCanvas) {
    const radarDrawW = 300;
    const radarDrawH = 300;
    const radarX = (W - radarDrawW) / 2;
    ctx.drawImage(radarCanvas, radarX, radarY, radarDrawW, radarDrawH);
  }

  // Watermark
  ctx.font = "16px 'Caveat', cursive";
  ctx.fillStyle = "rgba(217, 119, 87, 0.5)";
  ctx.textAlign = "right";
  ctx.fillText("razzle.lol", W - 20, H - 16);

  // Download
  const names = players.map(p => (p.full_name || "player").replace(/\s+/g, "-").toLowerCase());
  const filename = "razzle-compare-" + names.join("-vs-") + ".png";
  const link = document.createElement("a");
  link.download = filename;
  link.href = canvas.toDataURL("image/png");
  link.click();
}

// ─── Prospect Comparison ─────────────────────────────────────────

const PROSPECT_COMPARE_COLORS = ["#5b7fff", "#d97757", "#2ec4b6", "#8b5cf6", "#e63946"];

function renderProspectCompareTable(prospects) {
  if (!prospects || prospects.length < 2) {
    document.getElementById("compareContent").innerHTML =
      '<p style="font-family:var(--font-hand); font-size:22px; color:var(--ink-light);">need at least 2 prospects with combine data</p>';
    return;
  }

  const combineMetrics = [
    { key: "forty", label: "40-Yard Dash", fmt: v => v ? v.toFixed(2) + "s" : "—" },
    { key: "bench", label: "Bench Press", fmt: v => v ? v + " reps" : "—" },
    { key: "vertical", label: "Vertical Jump", fmt: v => v ? v.toFixed(1) + '"' : "—" },
    { key: "broad_jump", label: "Broad Jump", fmt: v => v ? v + '"' : "—" },
    { key: "cone", label: "3-Cone Drill", fmt: v => v ? v.toFixed(2) + "s" : "—" },
    { key: "shuttle", label: "20-Yd Shuttle", fmt: v => v ? v.toFixed(2) + "s" : "—" },
  ];

  // Lower is better for time metrics
  const lowerBetter = { forty: true, cone: true, shuttle: true };

  let html = '<table style="width:100%; border-collapse:collapse; font-family:var(--font-mono); font-size:13px; margin-top:16px;">';

  // Header
  html += '<tr><th style="text-align:left; padding:8px; border-bottom:3px solid var(--ink); font-family:var(--font-mono); font-size:11px; text-transform:uppercase;">Metric</th>';
  prospects.forEach((p, i) => {
    const color = PROSPECT_COMPARE_COLORS[i % PROSPECT_COMPARE_COLORS.length];
    html += `<th style="text-align:right; padding:8px; border-bottom:3px solid var(--ink);">
      <span style="font-family:var(--font-mono); font-size:13px;">${p.prospect.player_name}</span>
      <span style="display:inline-block; background:${color}; color:var(--text-on-accent); padding:1px 5px; border-radius:4px; border:2px solid var(--ink); font-size:9px; margin-left:4px;">${p.prospect.position}</span>
    </th>`;
  });
  html += '</tr>';

  // Measurables
  const measRows = [
    { key: "height_display", label: "Height" },
    { key: "weight", label: "Weight", fmt: v => v ? v + " lbs" : "—" },
  ];
  for (const mr of measRows) {
    html += `<tr><td style="padding:6px 8px; border-bottom:1px solid var(--ink-faint); font-weight:700; font-size:11px;">${mr.label}</td>`;
    for (const p of prospects) {
      const val = p.prospect[mr.key];
      const display = mr.fmt ? mr.fmt(val) : (val || "—");
      html += `<td style="text-align:right; padding:6px 8px; border-bottom:1px solid var(--ink-faint);">${display}</td>`;
    }
    html += '</tr>';
  }

  // Combine metrics (value + percentile)
  for (const m of combineMetrics) {
    const vals = prospects.map(p => p.prospect[m.key]);
    const pcts = prospects.map(p => p.percentiles[m.key]);
    const numericVals = vals.filter(v => v != null);
    let bestIdx = -1;
    if (numericVals.length >= 2) {
      if (lowerBetter[m.key]) {
        const best = Math.min(...numericVals);
        bestIdx = vals.indexOf(best);
      } else {
        const best = Math.max(...numericVals);
        bestIdx = vals.indexOf(best);
      }
    }

    html += `<tr><td style="padding:6px 8px; border-bottom:1px solid var(--ink-faint); font-weight:700; font-size:11px;">${m.label}</td>`;
    prospects.forEach((p, i) => {
      const val = p.prospect[m.key];
      const pct = p.percentiles[m.key];
      const display = m.fmt(val);
      const isBest = i === bestIdx;
      const pctColor = pct != null ? getPercentileColor(pct) : "var(--ink-faint)";
      const pctLabel = pct != null ? `${Math.round(pct)}th` : "";
      const style = isBest ? "font-weight:700; color:var(--green);" : "";
      html += `<td style="text-align:right; padding:6px 8px; border-bottom:1px solid var(--ink-faint); ${style}">${display}`;
      if (pctLabel) html += ` <span style="color:${pctColor}; font-size:10px; font-weight:700;">${pctLabel}</span>`;
      html += `</td>`;
    });
    html += '</tr>';
  }

  // Draft info row
  html += `<tr><td style="padding:6px 8px; border-bottom:1px solid var(--ink-faint); font-weight:700; font-size:11px;">Draft Capital</td>`;
  for (const p of prospects) {
    const pr = p.prospect;
    const draftText = pr.draft_round && pr.draft_pick ? `Rd ${pr.draft_round}, #${pr.draft_pick}` : `${pr.draft_year} class`;
    html += `<td style="text-align:right; padding:6px 8px; border-bottom:1px solid var(--ink-faint);">${draftText}</td>`;
  }
  html += '</tr>';

  html += '</table>';

  // Export button
  html += `<div style="margin-top:12px; text-align:right;">`;
  html += `<button class="btn-primary" onclick="exportProspectCompareImage()" style="font-size:11px; padding:6px 14px;">Export PNG</button>`;
  html += `</div>`;

  document.getElementById("compareContent").innerHTML = html;
}


function drawProspectCompareSpider(prospects) {
  const canvas = document.getElementById("compareRadar");
  const ctx = canvas.getContext("2d");
  const W = canvas.width, H = canvas.height;
  const cx = W / 2, cy = H / 2;
  const R = Math.min(cx, cy) - 55;
  var t = getCanvasTheme();

  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = t.bg;
  ctx.fillRect(0, 0, W, H);

  if (!prospects || prospects.length < 2) return;

  const metricDefs = [
    { key: "forty", label: "40-Yard" },
    { key: "bench", label: "Bench" },
    { key: "vertical", label: "Vertical" },
    { key: "broad_jump", label: "Broad" },
    { key: "cone", label: "3-Cone" },
    { key: "shuttle", label: "Shuttle" },
  ];

  // Only show metrics where at least one prospect has data
  const activeMetrics = metricDefs.filter(m =>
    prospects.some(p => p.percentiles[m.key] != null)
  );
  if (activeMetrics.length < 3) return;

  const n = activeMetrics.length;
  const angleStep = (2 * Math.PI) / n;
  const startAngle = -Math.PI / 2;

  // Grid rings
  const rings = [20, 40, 60, 80, 100];
  for (const ring of rings) {
    ctx.beginPath();
    for (let i = 0; i <= n; i++) {
      const angle = startAngle + (i % n) * angleStep;
      const r = (ring / 100) * R;
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.strokeStyle = ring === 50 ? (t.isDark ? "rgba(237,224,207,0.2)" : "rgba(45,31,20,0.2)") : (t.isDark ? "rgba(237,224,207,0.08)" : "rgba(45,31,20,0.08)");
    ctx.lineWidth = ring === 50 ? 1.5 : 1;
    ctx.stroke();
  }

  // Axis lines
  for (let i = 0; i < n; i++) {
    const angle = startAngle + i * angleStep;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + R * Math.cos(angle), cy + R * Math.sin(angle));
    ctx.strokeStyle = t.isDark ? "rgba(237,224,207,0.1)" : "rgba(45,31,20,0.1)";
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // Draw each prospect's polygon
  prospects.forEach((pData, pIdx) => {
    const color = PROSPECT_COMPARE_COLORS[pIdx % PROSPECT_COMPARE_COLORS.length];
    ctx.beginPath();
    for (let i = 0; i <= n; i++) {
      const idx = i % n;
      const angle = startAngle + idx * angleStep;
      const pct = pData.percentiles[activeMetrics[idx].key] || 0;
      const r = (pct / 100) * R;
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fillStyle = color + "25";
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Data points
    for (let i = 0; i < n; i++) {
      const angle = startAngle + i * angleStep;
      const pct = pData.percentiles[activeMetrics[i].key] || 0;
      const r = (pct / 100) * R;
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = t.ink;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  });

  // Labels
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  for (let i = 0; i < n; i++) {
    const angle = startAngle + i * angleStep;
    const labelR = R + 30;
    const x = cx + labelR * Math.cos(angle);
    const y = cy + labelR * Math.sin(angle);
    ctx.font = "bold 11px 'Space Mono', monospace";
    ctx.fillStyle = t.ink;
    ctx.fillText(activeMetrics[i].label, x, y);
  }

  // Legend
  ctx.textAlign = "left";
  prospects.forEach((pData, pIdx) => {
    const color = PROSPECT_COMPARE_COLORS[pIdx % PROSPECT_COMPARE_COLORS.length];
    ctx.fillStyle = color;
    ctx.fillRect(10, 10 + pIdx * 22, 12, 12);
    ctx.strokeStyle = t.ink;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(10, 10 + pIdx * 22, 12, 12);
    ctx.fillStyle = t.ink;
    ctx.font = 'bold 12px "Space Mono", monospace';
    ctx.fillText((pData.prospect || {}).player_name || "?", 28, 21 + pIdx * 22);
  });

  // Title
  ctx.font = "18px 'Caveat', cursive";
  ctx.fillStyle = t.subtitleAlpha;
  ctx.textAlign = "center";
  ctx.fillText("prospect athletic comparison", cx, H - 10);
}


function exportProspectCompareImage() {
  // Export the compare overlay as PNG
  const canvas = document.getElementById("compareRadar");
  if (!canvas) return;

  // Create export canvas with table + radar + watermark
  var t = getCanvasTheme();
  const expCanvas = document.createElement("canvas");
  const W = 800;
  const H = 500;
  expCanvas.width = W;
  expCanvas.height = H;
  const ctx = expCanvas.getContext("2d");

  // Background
  ctx.fillStyle = t.bg;
  ctx.fillRect(0, 0, W, H);

  // Draw radar canvas centered
  const radarW = Math.min(canvas.width, W - 40);
  const radarH = Math.min(canvas.height, H - 60);
  const rx = (W - radarW) / 2;
  ctx.drawImage(canvas, rx, 20, radarW, radarH);

  // Watermark
  ctx.font = "16px 'Caveat', cursive";
  ctx.fillStyle = "rgba(217, 119, 87, 0.5)";
  ctx.textAlign = "right";
  ctx.fillText("razzle.lol", W - 20, H - 16);

  const link = document.createElement("a");
  link.download = "razzle-prospect-compare.png";
  link.href = expCanvas.toDataURL("image/png");
  link.click();
}
