/* Razzle — Standalone Player Profile Page */

const POS_COLORS = { QB: "#5b7fff", RB: "#2ec4b6", WR: "#d97757", TE: "#8b5cf6" };
const POS_CSS = { QB: "var(--pos-qb)", RB: "var(--pos-rb)", WR: "var(--pos-wr)", TE: "var(--pos-te)" };

let _profileData = null;

// ---------------------------------------------------------------------------
// Init
// ---------------------------------------------------------------------------

(async function init() {
  const playerId = getPlayerIdFromURL();
  if (!playerId) {
    document.getElementById("playerPage").innerHTML = `
      <div class="player-loading">
        <div class="player-loading-text">no player ID found</div>
        <a href="/lab.html" class="btn-primary" style="margin-top:16px;">Back to Screener</a>
      </div>`;
    return;
  }
  await loadPlayer(playerId);
})();

function getPlayerIdFromURL() {
  // URL: /player/{id} or /player.html?id={id}
  const path = window.location.pathname;
  const match = path.match(/\/player\/(.+)/);
  if (match) return decodeURIComponent(match[1]);
  const params = new URLSearchParams(window.location.search);
  return params.get("id") || "";
}

async function loadPlayer(playerId) {
  const page = document.getElementById("playerPage");
  try {
    const resp = await fetch(`/api/players/${encodeURIComponent(playerId)}/profile`);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const data = await resp.json();
    _profileData = data;

    if (!data.player || !data.player.full_name) {
      page.innerHTML = `
        <div class="player-loading">
          <div class="player-loading-text">player not found on the film</div>
          <a href="/lab.html" class="btn-primary" style="margin-top:16px;">Back to Screener</a>
        </div>`;
      return;
    }

    // Update page title + meta
    const p = data.player;
    document.title = `${p.full_name} (${p.position}) — Razzle`;

    renderPlayerPage(data, page);
  } catch (err) {
    page.innerHTML = `
      <div class="player-loading">
        <div class="player-loading-text" style="color:var(--red);">fumbled the data fetch... try again in a sec.</div>
        <a href="/lab.html" class="btn-primary" style="margin-top:16px;">Back to Screener</a>
      </div>`;
  }
}

// ---------------------------------------------------------------------------
// Render
// ---------------------------------------------------------------------------

function renderPlayerPage(data, container) {
  const { player, seasons, career, combine } = data;
  const pos = (player.position || "").toUpperCase();
  const posColor = POS_CSS[pos] || "var(--ink)";
  const posHex = POS_COLORS[pos] || "#d97757";

  // Detect breakout (use PPG, require both seasons substantial to avoid injury-recovery false positives)
  let breakoutInfo = null;
  if (seasons && seasons.length >= 2) {
    const sorted = [...seasons].sort((a, b) => a.season - b.season);
    for (let i = 1; i < sorted.length; i++) {
      const prevPPG = sorted[i - 1].ppg || 0;
      const currPPG = sorted[i].ppg || 0;
      const prevGP = sorted[i - 1].games || 0;
      const currGP = sorted[i].games || 0;
      if (prevPPG >= 8 && prevGP >= 10 && currGP >= 10) {
        const pct = ((currPPG - prevPPG) / prevPPG) * 100;
        if (pct >= 50 && (!breakoutInfo || pct > breakoutInfo.pct)) {
          breakoutInfo = { pct: Math.round(pct), season: sorted[i].season };
        }
      }
    }
  }

  const headlines = getHeadlineStats(pos, career);

  let html = "";

  // Contextual back link based on referrer
  const ref = document.referrer || "";
  let backHref = "/lab.html";
  let backLabel = "Back to Screener";
  if (ref.includes("/rankings")) { backHref = "/rankings.html"; backLabel = "Back to Rankings"; }
  else if (ref.includes("/leaders")) { backHref = "/leaders.html"; backLabel = "Back to Leaders"; }
  else if (ref.includes("/team/")) { backHref = ref.split("?")[0]; backLabel = "Back to Team"; }
  html += `<a href="${esc(backHref)}" class="player-back">&larr; ${esc(backLabel)}</a>`;

  // Hero card
  html += `<div class="player-hero pos-stripe-${pos.toLowerCase()}">`;
  html += `<div class="player-hero-top">`;
  if (player.headshot_url) {
    html += `<img class="player-hero-headshot" src="${esc(player.headshot_url)}" alt="" onerror="this.style.display='none';">`;
  }
  html += `<div class="player-pos-badge" style="background:${posColor};">${pos}</div>`;
  html += `<div style="flex:1; min-width:0;">`;
  html += `<div class="player-name">${esc(player.full_name)}</div>`;
  const displayAge = player.age ? Math.floor(player.age) : "?";
  const seasonCount = seasons ? seasons.length : 0;
  const teamLink = player.team ? `<a href="/team/${encodeURIComponent(player.team)}" style="color:${posColor}; font-weight:700; text-decoration:none;" onmouseover="this.style.textDecoration='underline'" onmouseout="this.style.textDecoration='none'">${esc(player.team)}</a>` : `<span style="color:${posColor}; font-weight:700;">FA</span>`;
  html += `<div class="player-meta">${teamLink} &middot; Age ${displayAge} &middot; ${esc(player.college || "")} &middot; ${seasonCount} Season${seasonCount !== 1 ? "s" : ""}</div>`;
  if (combine && combine.draft_round) {
    const pick = combine.draft_overall || combine.draft_pick;
    html += `<span class="player-draft-badge">Rd ${combine.draft_round}${pick ? " #" + pick : ""}${combine.draft_year ? " '" + String(combine.draft_year).slice(2) : ""}</span>`;
  }
  if (breakoutInfo) {
    html += `<span class="player-breakout-badge">BREAKOUT +${breakoutInfo.pct}% (${breakoutInfo.season})</span>`;
  }
  html += `</div>`;

  // Actions
  html += `<div class="player-hero-actions">`;
  html += `<button class="btn-primary" onclick="exportPlayerPNG()" style="font-size:12px; padding:8px 16px;">Export PNG</button>`;
  html += `<button class="btn-chunky" onclick="copyPlayerURL()" style="font-size:12px; padding:8px 16px;">Copy Link</button>`;
  html += `<button class="btn-chunky" onclick="openCompareSearch()" style="font-size:12px; padding:8px 16px;">Compare</button>`;
  html += `</div>`;
  html += `</div>`; // hero-top

  // Stats bar
  html += `<div class="player-stats-bar">`;
  for (const h of headlines) {
    html += `<div class="player-stat-card">`;
    html += `<div class="player-stat-value">${h.value}</div>`;
    html += `<div class="player-stat-label">${h.label}</div>`;
    html += `</div>`;
  }
  html += `</div>`;
  html += `</div>`; // hero

  // Charts row
  html += `<div class="player-charts-row">`;
  // Radar chart
  html += `<div class="player-section player-chart-wrap">`;
  html += `<div class="player-section-title">Stat Shape</div>`;
  html += `<canvas id="playerRadar" width="360" height="320"></canvas>`;
  html += `</div>`;
  // Career arc
  if (seasons && seasons.length > 1) {
    html += `<div class="player-section player-chart-wrap">`;
    html += `<div class="player-section-title">Career Arc</div>`;
    html += `<canvas id="playerArc" width="400" height="320"></canvas>`;
    html += `</div>`;
  }
  html += `</div>`;

  // Season log
  if (seasons && seasons.length > 0) {
    html += `<div class="player-section">`;
    html += `<div class="player-section-title">Season Log</div>`;
    html += `<div style="overflow-x:auto; -webkit-overflow-scrolling:touch;">`;
    html += renderSeasonTable(pos, seasons, career);
    html += `</div>`;
    html += `</div>`;
  }

  // Combine
  if (combine) {
    html += `<div class="player-section">`;
    html += `<div class="player-section-title">Combine & Draft</div>`;
    html += renderCombine(combine);
    html += `</div>`;
  }

  container.innerHTML = html;

  // Draw charts after DOM
  requestAnimationFrame(() => {
    drawRadar(seasons, career, pos);
    if (seasons && seasons.length > 1) drawArc(seasons, pos);
  });
}

// ---------------------------------------------------------------------------
// Headline stats
// ---------------------------------------------------------------------------

function getHeadlineStats(pos, career) {
  if (!career || !career.games) return [];
  const f0 = v => v != null ? Math.round(v).toLocaleString() : "—";
  const f1 = v => v != null ? Number(v).toFixed(1) : "—";
  const pprg = (career.games > 0 && career.fantasy_points_ppr != null) ? (career.fantasy_points_ppr / career.games) : 0;

  const base = [
    { label: "PPR/G", value: f1(pprg) },
    { label: "Games", value: f0(career.games) },
  ];

  if (pos === "QB") {
    return [...base,
      { label: "Pass Yds", value: f0(career.passing_yards) },
      { label: "Pass TD", value: f0(career.passing_tds) },
      { label: "Rush Yds", value: f0(career.rushing_yards) },
    ];
  } else if (pos === "RB") {
    return [...base,
      { label: "Rush Yds", value: f0(career.rushing_yards) },
      { label: "Rush TD", value: f0(career.rushing_tds) },
      { label: "Rec Yds", value: f0(career.receiving_yards) },
    ];
  }
  return [...base,
    { label: "Rec Yds", value: f0(career.receiving_yards) },
    { label: "Rec TD", value: f0(career.receiving_tds) },
    { label: "Receptions", value: f0(career.receptions) },
  ];
}

// ---------------------------------------------------------------------------
// Season table
// ---------------------------------------------------------------------------

function renderSeasonTable(pos, seasons, career) {
  const cols = getSeasonCols(pos);
  let html = `<table class="player-season-table"><thead><tr><th>Year</th>`;
  for (const c of cols) html += `<th>${c.label}</th>`;
  html += `</tr></thead><tbody>`;

  for (const s of seasons) {
    html += `<tr><td>${esc(String(s.season))}</td>`;
    for (const c of cols) html += `<td>${esc(String(c.fmt(s[c.key])))}</td>`;
    html += `</tr>`;
  }

  if (career && career.games) {
    html += `<tr style="font-weight:700; border-top:2px solid var(--ink);"><td>Career</td>`;
    for (const c of cols) html += `<td>${esc(String(c.fmt(career[c.key])))}</td>`;
    html += `</tr>`;
  }

  html += `</tbody></table>`;
  return html;
}

function getSeasonCols(pos) {
  const f0 = v => v != null ? Math.round(v) : "—";
  const f1 = v => v != null ? Number(v).toFixed(1) : "—";
  const fp = v => v != null ? Number(v).toFixed(1) + "%" : "—";

  const base = [
    { key: "games", label: "GP", fmt: f0 },
    { key: "fantasy_points_ppr", label: "PPR", fmt: f1 },
  ];

  if (pos === "QB") {
    return [...base,
      { key: "completions", label: "CMP", fmt: f0 },
      { key: "attempts", label: "ATT", fmt: f0 },
      { key: "passing_yards", label: "Pass Yds", fmt: f0 },
      { key: "passing_tds", label: "Pass TD", fmt: f0 },
      { key: "turnovers", label: "INT", fmt: f0 },
      { key: "comp_pct", label: "CMP%", fmt: fp },
      { key: "rushing_yards", label: "Rush Yds", fmt: f0 },
      { key: "rushing_tds", label: "Rush TD", fmt: f0 },
    ];
  } else if (pos === "RB") {
    return [...base,
      { key: "carries", label: "CAR", fmt: f0 },
      { key: "rushing_yards", label: "Rush Yds", fmt: f0 },
      { key: "rushing_tds", label: "Rush TD", fmt: f0 },
      { key: "yards_per_carry", label: "Y/CAR", fmt: f1 },
      { key: "targets", label: "TGT", fmt: f0 },
      { key: "receptions", label: "REC", fmt: f0 },
      { key: "receiving_yards", label: "Rec Yds", fmt: f0 },
      { key: "receiving_tds", label: "Rec TD", fmt: f0 },
    ];
  }
  return [...base,
    { key: "targets", label: "TGT", fmt: f0 },
    { key: "receptions", label: "REC", fmt: f0 },
    { key: "receiving_yards", label: "Rec Yds", fmt: f0 },
    { key: "receiving_tds", label: "Rec TD", fmt: f0 },
    { key: "yards_per_rec", label: "Y/REC", fmt: f1 },
    { key: "catch_rate", label: "Catch%", fmt: fp },
    { key: "receiving_yards_after_catch", label: "YAC", fmt: f0 },
  ];
}

// ---------------------------------------------------------------------------
// Combine rendering
// ---------------------------------------------------------------------------

function renderCombine(combine) {
  const fields = [
    { key: "draft_round", label: "Round", fmt: v => v ? `Rd ${v}` : "UDFA" },
    { key: "draft_pick", label: "Pick", fmt: v => v ? `#${v}` : null },
    { key: "height_display", label: "Height", fmt: v => v || null },
    { key: "weight", label: "Weight", fmt: v => v ? `${v} lbs` : null },
    { key: "forty", label: "40-Yard", fmt: v => v ? Number(v).toFixed(2) + "s" : null },
    { key: "bench", label: "Bench", fmt: v => v ? `${v} reps` : null },
    { key: "vertical", label: "Vertical", fmt: v => v ? Number(v).toFixed(1) + '"' : null },
    { key: "broad_jump", label: "Broad", fmt: v => v ? v + '"' : null },
    { key: "cone", label: "3-Cone", fmt: v => v ? Number(v).toFixed(2) + "s" : null },
    { key: "shuttle", label: "Shuttle", fmt: v => v ? Number(v).toFixed(2) + "s" : null },
  ];

  let html = `<div class="player-combine-grid">`;
  for (const f of fields) {
    const val = combine[f.key];
    const display = f.fmt(val);
    if (!display) continue;
    html += `<div class="player-combine-item">
      <div class="player-combine-value">${esc(String(display))}</div>
      <div class="player-combine-label">${esc(f.label)}</div>
    </div>`;
  }
  html += `</div>`;
  return html;
}

// ---------------------------------------------------------------------------
// Radar chart
// ---------------------------------------------------------------------------

function drawRadar(seasons, career, pos) {
  const canvas = document.getElementById("playerRadar");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const W = canvas.width, H = canvas.height;
  const cx = W / 2, cy = H / 2 + 10;
  const R = Math.min(W, H) / 2 - 40;
  var t = getCanvasTheme();

  const posHex = POS_COLORS[pos] || "#d97757";

  // Get the most recent season for radar
  const latest = seasons && seasons.length > 0 ? seasons[seasons.length - 1] : career;
  if (!latest) return;

  const axes = getRadarAxes(pos);
  const n = axes.length;
  if (!n) return;

  ctx.clearRect(0, 0, W, H);

  // Grid rings
  for (let ring = 1; ring <= 4; ring++) {
    const r = (ring / 4) * R;
    ctx.beginPath();
    for (let i = 0; i <= n; i++) {
      const angle = (Math.PI * 2 * (i % n)) / n - Math.PI / 2;
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);
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
  for (let i = 0; i < n; i++) {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    const lx = cx + (R + 24) * Math.cos(angle);
    const ly = cy + (R + 24) * Math.sin(angle);
    ctx.fillText(axes[i].label, lx, ly + 4);

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + R * Math.cos(angle), cy + R * Math.sin(angle));
    ctx.strokeStyle = t.inkFaint;
    ctx.stroke();
  }

  // Data polygon
  const values = axes.map(a => {
    const raw = latest[a.key] || 0;
    return Math.min(raw / a.max, 1);
  });

  ctx.beginPath();
  for (let i = 0; i <= n; i++) {
    const idx = i % n;
    const angle = (Math.PI * 2 * idx) / n - Math.PI / 2;
    const r = values[idx] * R;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fillStyle = posHex + "33";
  ctx.fill();
  ctx.strokeStyle = posHex;
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Data dots
  for (let i = 0; i < n; i++) {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    const r = values[i] * R;
    ctx.beginPath();
    ctx.arc(cx + r * Math.cos(angle), cy + r * Math.sin(angle), 4, 0, Math.PI * 2);
    ctx.fillStyle = posHex;
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
// Career arc chart
// ---------------------------------------------------------------------------

function drawArc(seasons, pos) {
  const canvas = document.getElementById("playerArc");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const W = canvas.width, H = canvas.height;
  const pad = { top: 20, right: 30, bottom: 35, left: 55 };
  const plotW = W - pad.left - pad.right;
  const plotH = H - pad.top - pad.bottom;
  var t = getCanvasTheme();

  const posHex = POS_COLORS[pos] || "#d97757";

  ctx.clearRect(0, 0, W, H);

  const values = seasons.map(s => s.fantasy_points_ppr || 0);
  const labels = seasons.map(s => String(s.season));
  const maxVal = Math.max(...values, 1);

  // Y gridlines
  ctx.strokeStyle = t.inkFaint;
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);
  const yTicks = 4;
  for (let i = 0; i <= yTicks; i++) {
    const y = pad.top + plotH - (i / yTicks) * plotH;
    ctx.beginPath();
    ctx.moveTo(pad.left, y);
    ctx.lineTo(W - pad.right, y);
    ctx.stroke();
    ctx.fillStyle = t.inkLight;
    ctx.font = "11px 'Space Mono', monospace";
    ctx.textAlign = "right";
    ctx.fillText(Math.round((i / yTicks) * maxVal), pad.left - 8, y + 4);
  }
  ctx.setLineDash([]);

  // X labels
  ctx.fillStyle = t.inkLight;
  ctx.font = "11px 'Space Mono', monospace";
  ctx.textAlign = "center";
  for (let i = 0; i < labels.length; i++) {
    const x = pad.left + (labels.length === 1 ? plotW / 2 : (i / (labels.length - 1)) * plotW);
    ctx.fillText(labels[i], x, H - pad.bottom + 18);
  }

  // Line
  ctx.beginPath();
  ctx.strokeStyle = posHex;
  ctx.lineWidth = 3;
  for (let i = 0; i < values.length; i++) {
    const x = pad.left + (values.length === 1 ? plotW / 2 : (i / (values.length - 1)) * plotW);
    const y = pad.top + plotH - (values[i] / maxVal) * plotH;
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.stroke();

  // Area fill
  ctx.lineTo(pad.left + plotW, pad.top + plotH);
  ctx.lineTo(pad.left, pad.top + plotH);
  ctx.closePath();
  ctx.fillStyle = posHex + "22";
  ctx.fill();

  // Dots
  for (let i = 0; i < values.length; i++) {
    const x = pad.left + (values.length === 1 ? plotW / 2 : (i / (values.length - 1)) * plotW);
    const y = pad.top + plotH - (values[i] / maxVal) * plotH;
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fillStyle = posHex;
    ctx.fill();
    ctx.strokeStyle = t.white;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Value label
    ctx.fillStyle = t.ink;
    ctx.font = "bold 11px 'Space Mono', monospace";
    ctx.textAlign = "center";
    ctx.fillText(Math.round(values[i]), x, y - 12);
  }

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

// ---------------------------------------------------------------------------
// Export + Share
// ---------------------------------------------------------------------------

async function exportPlayerPNG() {
  if (!_profileData || !_profileData.player) return;

  const p = _profileData.player;
  const career = _profileData.career || {};
  const pos = (p.position || "").toUpperCase();
  const posHex = POS_COLORS[pos] || "#d97757";

  var t = getCanvasTheme();

  const W = 1200, H = 630;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");

  // Background
  ctx.fillStyle = t.bg;
  ctx.fillRect(0, 0, W, H);

  // Position color accent bar
  ctx.fillStyle = posHex;
  ctx.fillRect(0, 0, W, 8);

  // Card background
  ctx.fillStyle = t.bgCard;
  ctx.strokeStyle = t.ink;
  ctx.lineWidth = 3;
  roundRect(ctx, 40, 30, W - 80, H - 80, 16);
  ctx.fill();
  ctx.stroke();

  // Position badge
  ctx.fillStyle = posHex;
  roundRect(ctx, 60, 50, 80, 60, 8);
  ctx.fill();
  ctx.strokeStyle = t.ink;
  ctx.lineWidth = 2;
  roundRect(ctx, 60, 50, 80, 60, 8);
  ctx.stroke();
  ctx.fillStyle = t.white;
  ctx.font = "bold 32px 'Luckiest Guy', cursive";
  ctx.textAlign = "center";
  ctx.fillText(pos, 100, 92);

  // Player name
  ctx.fillStyle = t.ink;
  ctx.font = "bold 42px 'Luckiest Guy', cursive";
  ctx.textAlign = "left";
  ctx.fillText(p.full_name || "", 160, 92);

  // Meta line
  ctx.fillStyle = t.inkLight;
  ctx.font = "16px 'Space Mono', monospace";
  ctx.fillText(`${p.team || "FA"} · Age ${p.age ? Math.floor(p.age) : "?"} · ${p.college || ""}`, 160, 120);

  // Stat boxes
  const stats = getHeadlineStats(pos, career);
  const boxW = 180, boxH = 80, startX = 60, startY = 160;
  for (let i = 0; i < stats.length; i++) {
    const x = startX + i * (boxW + 12);
    const y = startY;
    ctx.fillStyle = t.bg;
    ctx.strokeStyle = t.ink;
    ctx.lineWidth = 2;
    roundRect(ctx, x, y, boxW, boxH, 8);
    ctx.fill();
    roundRect(ctx, x, y, boxW, boxH, 8);
    ctx.stroke();

    ctx.fillStyle = t.ink;
    ctx.font = "bold 28px 'Luckiest Guy', cursive";
    ctx.textAlign = "center";
    ctx.fillText(stats[i].value, x + boxW / 2, y + 38);

    ctx.fillStyle = t.inkLight;
    ctx.font = "12px 'Space Mono', monospace";
    ctx.fillText(stats[i].label.toUpperCase(), x + boxW / 2, y + 62);
  }

  // Radar chart in export (right side)
  drawRadarOnCanvas(ctx, 860, 360, 160, _profileData.seasons, _profileData.career, pos);

  // Watermark
  ctx.fillStyle = t.isDark ? "rgba(237,224,207,0.3)" : "rgba(45,31,20,0.3)";
  ctx.font = "18px 'Luckiest Guy', cursive";
  ctx.textAlign = "right";
  ctx.fillText("razzle.lol", W - 56, H - 56);

  // Download
  const link = document.createElement("a");
  const safeName = (p.full_name || "player").replace(/[^a-zA-Z0-9]/g, "_").toLowerCase();
  link.download = `${safeName}_razzle.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
}

function drawRadarOnCanvas(ctx, cx, cy, R, seasons, career, pos) {
  var t = getCanvasTheme();
  const posHex = POS_COLORS[pos] || "#d97757";
  const latest = seasons && seasons.length > 0 ? seasons[seasons.length - 1] : career;
  if (!latest) return;

  const axes = getRadarAxes(pos);
  const n = axes.length;

  // Grid
  for (let ring = 1; ring <= 4; ring++) {
    const r = (ring / 4) * R;
    ctx.beginPath();
    for (let i = 0; i <= n; i++) {
      const angle = (Math.PI * 2 * (i % n)) / n - Math.PI / 2;
      i === 0 ? ctx.moveTo(cx + r * Math.cos(angle), cy + r * Math.sin(angle))
              : ctx.lineTo(cx + r * Math.cos(angle), cy + r * Math.sin(angle));
    }
    ctx.closePath();
    ctx.strokeStyle = t.inkFaint;
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // Labels
  ctx.font = "10px 'Space Mono', monospace";
  ctx.fillStyle = t.inkMedium;
  ctx.textAlign = "center";
  for (let i = 0; i < n; i++) {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    ctx.fillText(axes[i].label, cx + (R + 20) * Math.cos(angle), cy + (R + 20) * Math.sin(angle) + 4);
  }

  // Data
  const values = axes.map(a => Math.min((latest[a.key] || 0) / a.max, 1));
  ctx.beginPath();
  for (let i = 0; i <= n; i++) {
    const idx = i % n;
    const angle = (Math.PI * 2 * idx) / n - Math.PI / 2;
    const r = values[idx] * R;
    i === 0 ? ctx.moveTo(cx + r * Math.cos(angle), cy + r * Math.sin(angle))
            : ctx.lineTo(cx + r * Math.cos(angle), cy + r * Math.sin(angle));
  }
  ctx.closePath();
  ctx.fillStyle = posHex + "33";
  ctx.fill();
  ctx.strokeStyle = posHex;
  ctx.lineWidth = 2;
  ctx.stroke();
}

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

function openCompareSearch() {
  if (!_profileData || !_profileData.player) return;
  var currentId = _profileData.player.player_id;
  // Create a search overlay
  var overlay = document.createElement("div");
  overlay.id = "compareOverlay";
  var overlayBg = document.documentElement.getAttribute("data-theme") === "dark" ? "rgba(0,0,0,0.5)" : "rgba(45,31,20,0.5)";
  overlay.style.cssText = "position:fixed;top:0;left:0;right:0;bottom:0;background:" + overlayBg + ";z-index:9999;display:flex;align-items:center;justify-content:center;";
  overlay.innerHTML = '<div style="background:var(--bg-card);border:3px solid var(--ink);border-radius:12px;box-shadow:4px 4px 0 var(--ink);padding:24px;width:380px;max-width:90vw;">' +
    '<div style="font-family:var(--font-display);font-size:18px;margin-bottom:12px;">Compare ' + esc((_profileData.player || {}).full_name || "Player") + ' with...</div>' +
    '<input id="compareSearchInput" type="text" placeholder="Search player name..." style="width:100%;box-sizing:border-box;padding:10px 14px;border:2px solid var(--ink);border-radius:8px;font-family:var(--font-mono);font-size:14px;background:var(--bg);margin-bottom:8px;">' +
    '<div id="compareSearchResults" style="max-height:200px;overflow-y:auto;"></div>' +
    '<button onclick="document.getElementById(\'compareOverlay\').remove()" class="btn-chunky" style="margin-top:10px;font-size:12px;width:100%;">Never Mind</button>' +
    '</div>';
  document.body.appendChild(overlay);
  overlay.addEventListener("click", function(e) { if (e.target === overlay) overlay.remove(); });

  var input = document.getElementById("compareSearchInput");
  input.focus();
  var debounce = null;
  input.addEventListener("input", function() {
    clearTimeout(debounce);
    debounce = setTimeout(function() {
      var q = input.value.trim();
      if (q.length < 2) { var el = document.getElementById("compareSearchResults"); if (el) el.innerHTML = ""; return; }
      fetch("/api/players?search=" + encodeURIComponent(q) + "&limit=8")
        .then(function(r) { if (!r.ok) throw new Error(r.status); return r.json(); })
        .then(function(data) {
          var results = document.getElementById("compareSearchResults");
          if (!results) return;
          var players = data.players || [];
          results.innerHTML = players.map(function(p) {
            if (p.player_id === currentId) return "";
            return '<div class="compare-search-item" data-current="' + escapeAttr(currentId) + '" data-target="' + escapeAttr(p.player_id) + '" style="padding:8px 12px;cursor:pointer;border-bottom:1px solid var(--ink-faint);font-family:var(--font-mono);font-size:13px;">' +
              '<span style="font-weight:700;">' + esc(p.full_name) + '</span> <span style="color:var(--ink-light);">' + esc(p.position || "") + ' ' + esc(p.team || "") + '</span></div>';
          }).join("");
          // Event delegation handled below (avoids listener leak per search)
        }).catch(function() {});
    }, 250);
  });

  // Event delegation for compare search results (avoids listener leak per search)
  var resultsEl = document.getElementById("compareSearchResults");
  if (resultsEl) {
    resultsEl.addEventListener("click", function(e) {
      var item = e.target.closest(".compare-search-item");
      if (!item) return;
      window.location.href = "/compare/" + encodeURIComponent(item.dataset.current) + "/" + encodeURIComponent(item.dataset.target);
    });
    resultsEl.addEventListener("mouseover", function(e) {
      var item = e.target.closest(".compare-search-item");
      if (item) item.style.background = "var(--bg-warm)";
    });
    resultsEl.addEventListener("mouseout", function(e) {
      var item = e.target.closest(".compare-search-item");
      if (item) item.style.background = "transparent";
    });
  }
}

function copyPlayerURL() {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(window.location.href).then(() => {
      showToast("link copied.");
    }).catch(() => {
      showToast("fumbled the copy — try again");
    });
  } else {
    try {
      const ta = document.createElement("textarea");
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
  let toast = document.getElementById("playerToast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "playerToast";
    toast.style.cssText = `
      position:fixed; bottom:24px; left:50%; transform:translateX(-50%);
      background:var(--ink); color:var(--bg); padding:10px 24px;
      border-radius:8px; font-family:var(--font-mono); font-size:14px;
      z-index:10000; box-shadow:4px 4px 0 var(--ink);
      transition:opacity 0.3s; pointer-events:none;
    `;
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.style.opacity = "1";
  setTimeout(() => { toast.style.opacity = "0"; }, 2500);
}

function esc(str) {
  const div = document.createElement("div");
  div.textContent = str || "";
  return div.innerHTML;
}
