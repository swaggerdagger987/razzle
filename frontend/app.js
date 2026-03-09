/* Razzle — shared utilities */

const API_BASE = window.location.origin;

async function apiFetch(path, options = {}) {
  const url = API_BASE + path;
  const resp = await fetch(url, options);
  if (!resp.ok) throw new Error(`API ${resp.status}: ${resp.statusText}`);
  return resp.json();
}

function formatStat(val, decimals = 1) {
  if (val === null || val === undefined) return "—";
  return Number(val).toFixed(decimals);
}

function posClass(pos) {
  return (pos || "").toLowerCase();
}

function computeClientDVS(ppg, age, position) {
  if (!ppg || !age) return null;
  var prodScore = Math.min(100, ppg * 4);
  var curves = {
    QB:  { rise: 24, peak_start: 26, peak_end: 30, fall_end: 40 },
    RB:  { rise: 20, peak_start: 22, peak_end: 25, fall_end: 30 },
    WR:  { rise: 21, peak_start: 24, peak_end: 28, fall_end: 33 },
    TE:  { rise: 22, peak_start: 25, peak_end: 29, fall_end: 34 },
  };
  var c = curves[position] || curves.WR;
  var mult = 0.5;
  if (age < c.rise) mult = 0.6 + 0.4 * ((age - 18) / (c.rise - 18));
  else if (age < c.peak_start) mult = 0.85 + 0.15 * ((age - c.rise) / (c.peak_start - c.rise));
  else if (age <= c.peak_end) mult = 1.0;
  else if (age <= c.fall_end) mult = 1.0 - 0.9 * ((age - c.peak_end) / (c.fall_end - c.peak_end));
  else mult = 0.1;
  mult = Math.max(0.1, Math.min(1.0, mult));
  return Math.round(prodScore * mult * 10) / 10;
}
