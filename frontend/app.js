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
