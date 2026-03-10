/* Razzle — Formula Builder */

function openFormulaBuilder() {
  document.getElementById("formulaOverlay").classList.add("open");
  document.getElementById("formulaName").value = "";
  document.getElementById("formulaComponents").innerHTML = "";
  addFormulaComponent();
  renderSavedFormulas();
}

function closeFormulaBuilder(e) {
  if (e && e.target !== e.currentTarget) return;
  document.getElementById("formulaOverlay").classList.remove("open");
}

function addFormulaComponent() {
  const container = document.getElementById("formulaComponents");
  const idx = container.children.length;

  const statOptions = Object.entries(COLUMNS)
    .filter(([k, c]) => c.group !== "Formulas")
    .map(([k, c]) => `<option value="${k}">${c.label}</option>`)
    .join("");

  const row = document.createElement("div");
  row.className = "filter-modal-row";
  row.dataset.idx = idx;
  row.innerHTML = `
    <select class="select-chunky formula-stat" style="flex:2">${statOptions}</select>
    <span style="font-family:var(--font-mono); font-size:12px;">×</span>
    <input type="number" class="input-chunky formula-weight" value="100" style="flex:1; width:60px;" placeholder="weight %">
    <span style="font-family:var(--font-mono); font-size:12px;">%</span>
    <span style="cursor:pointer; color:var(--red); font-weight:700; font-size:16px;" onclick="this.parentElement.remove()">×</span>
  `;
  container.appendChild(row);
}

function saveFormula() {
  const name = document.getElementById("formulaName").value.trim();
  if (!name) {
    document.getElementById("formulaName").style.borderColor = "var(--red)";
    return;
  }

  const rows = document.querySelectorAll("#formulaComponents .filter-modal-row");
  const components = [];
  for (const row of rows) {
    const stat = row.querySelector(".formula-stat").value;
    const weight = parseFloat(row.querySelector(".formula-weight").value);
    if (stat && !isNaN(weight)) {
      components.push({ stat, weight });
    }
  }

  if (!components.length) return;

  // Remove existing formula with same name
  state.formulas = state.formulas.filter(f => f.name !== name);
  state.formulas.push({ name, components });

  // Save to localStorage
  localStorage.setItem("razzle_formulas", JSON.stringify(state.formulas));
  // Sync to server if logged in
  _syncFormulaToServer(name, components);

  // Register the column
  const key = `formula_${name.toLowerCase().replace(/[^a-z0-9]/g, "_")}`;
  COLUMNS[key] = { label: name, group: "Formulas", decimals: 1 };

  // Add to visible columns if not there
  if (!state.visibleColumns.includes(key)) {
    state.visibleColumns.push(key);
  }

  // Recompute and re-render
  computeFormulaValues();
  renderTable();
  renderColumnPicker();
  renderSavedFormulas();
  saveStateToURL();

  // Clear form
  document.getElementById("formulaName").value = "";
  document.getElementById("formulaComponents").innerHTML = "";
  addFormulaComponent();
}

function deleteFormula(name) {
  state.formulas = state.formulas.filter(f => f.name !== name);
  localStorage.setItem("razzle_formulas", JSON.stringify(state.formulas));
  _deleteFormulaFromServer(name);

  const key = `formula_${name.toLowerCase().replace(/[^a-z0-9]/g, "_")}`;
  delete COLUMNS[key];
  state.visibleColumns = state.visibleColumns.filter(k => k !== key);

  renderTable();
  renderColumnPicker();
  renderSavedFormulas();
  saveStateToURL();
}

function renderSavedFormulas() {
  const container = document.getElementById("savedFormulas");
  if (!state.formulas.length) {
    container.innerHTML = '<p style="font-family:var(--font-hand); font-size:16px; color:var(--ink-light);">no saved formulas yet</p>';
    return;
  }

  container.innerHTML = '<div style="font-family:var(--font-display); font-size:11px; text-transform:uppercase; color:var(--ink-light); letter-spacing:1px; margin-bottom:8px;">Saved Formulas</div>' +
    state.formulas.map(f => {
      const desc = f.components.map(c => {
        const col = COLUMNS[c.stat];
        return `${col ? col.label : c.stat} × ${c.weight}%`;
      }).join(" + ");
      const isPublished = f.fromStore || isFormulaPublished(f.name);
      const publishBtn = isPublished
        ? `<span style="font-family:var(--font-mono); font-size:9px; color:var(--green); font-weight:700; padding:2px 6px; border:1.5px solid var(--green); border-radius:4px;">Published</span>`
        : `<button class="btn-chunky" style="font-size:9px; padding:2px 8px;" onclick="event.stopPropagation(); openPublishFlow('${f.name.replace(/'/g, "\\'")}')">Publish</button>`;
      return `<div style="display:flex; align-items:center; justify-content:space-between; padding:6px 0; border-bottom:1px solid var(--ink-faint); gap:6px;">
        <div style="flex:1; min-width:0;">
          <strong style="font-family:var(--font-display); font-size:13px;">${f.name}</strong>
          <span style="font-family:var(--font-mono); font-size:10px; color:var(--ink-light); margin-left:8px;">${desc}</span>
        </div>
        <div style="display:flex; align-items:center; gap:6px; flex-shrink:0;">
          ${publishBtn}
          <span style="cursor:pointer; color:var(--red); font-weight:700; font-size:14px;" onclick="deleteFormula('${f.name}')">×</span>
        </div>
      </div>`;
    }).join("");
}

// ── Server sync helpers ──────────────────────────────────────────
function _syncFormulaToServer(name, components) {
  var token = localStorage.getItem("razzle_token");
  if (!token) return;
  var weights = JSON.stringify(components);
  fetch((typeof API_BASE !== "undefined" ? API_BASE : "") + "/api/user/formulas", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": "Bearer " + token },
    body: JSON.stringify({ name: name, weights: weights })
  }).catch(function() {});
}

function _deleteFormulaFromServer(name) {
  var token = localStorage.getItem("razzle_token");
  if (!token) return;
  // Need to find the formula ID from server — do a quick lookup
  fetch((typeof API_BASE !== "undefined" ? API_BASE : "") + "/api/user/formulas", {
    headers: { "Authorization": "Bearer " + token }
  }).then(function(r) { return r.json(); }).then(function(data) {
    var formulas = data.formulas || [];
    var match = formulas.find(function(f) { return f.name === name; });
    if (match) {
      fetch((typeof API_BASE !== "undefined" ? API_BASE : "") + "/api/user/formulas/" + match.id, {
        method: "DELETE",
        headers: { "Authorization": "Bearer " + token }
      }).catch(function() {});
    }
  }).catch(function() {});
}
