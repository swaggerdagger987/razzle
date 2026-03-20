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

  // Check formula limit for free users (3 max)
  const isEdit = state.formulas.some(f => f.name === name);
  if (!isEdit && typeof checkFeatureGate === "function") {
    const gate = checkFeatureGate("formulas", state.formulas.length);
    if (!gate.allowed) {
      _showToast(gate.message);
      return;
    }
  }

  // Remove existing formula with same name
  state.formulas = state.formulas.filter(f => f.name !== name);
  state.formulas.push({ name, components });

  // Save to localStorage
  try { localStorage.setItem("razzle_formulas", JSON.stringify(state.formulas)); } catch(e) {}
  // Sync to server if logged in
  _syncFormulaToServer(name, components);

  // Register the column
  const key = `formula_${name.toLowerCase().replace(/[^a-z0-9]/g, "_")}`;
  COLUMNS[key] = { label: (typeof escapeHtml === "function" ? escapeHtml(name) : name), group: "Formulas", decimals: 1 };

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
  if (!confirm("Delete formula \"" + name + "\"?")) return;
  state.formulas = state.formulas.filter(f => f.name !== name);
  try { localStorage.setItem("razzle_formulas", JSON.stringify(state.formulas)); } catch(e) {}
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
  if (!container) return;
  if (!state.formulas.length) {
    container.innerHTML = '<p style="font-family:var(--font-hand); font-size:16px; color:var(--ink-light);">no saved formulas yet</p>';
    return;
  }

  container.innerHTML = '<div style="font-family:var(--font-mono); font-size:11px; text-transform:uppercase; color:var(--ink-light); letter-spacing:1px; margin-bottom:8px;">Saved Formulas</div>' +
    state.formulas.map(f => {
      const desc = f.components.map(c => {
        const col = COLUMNS[c.stat];
        return `${col ? col.label : c.stat} × ${c.weight}%`;
      }).join(" + ");
      const isPublished = f.fromStore || isFormulaPublished(f.name);
      var _esc = typeof escapeHtml === "function" ? escapeHtml : function(s) { return s; };
      var _escAttr = typeof escapeAttr === "function" ? escapeAttr : function(s) { return s.replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/'/g,"&#39;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); };
      const publishBtn = isPublished
        ? `<span style="font-family:var(--font-mono); font-size:9px; color:var(--green); font-weight:700; padding:2px 6px; border:2px solid var(--green); border-radius:4px;">Published</span>`
        : `<button class="btn-chunky" style="font-size:9px; padding:2px 8px;" data-publish-formula="${_escAttr(f.name)}">Publish</button>`;
      return `<div style="display:flex; align-items:center; justify-content:space-between; padding:6px 0; border-bottom:1px solid var(--ink-faint); gap:6px;">
        <div style="flex:1; min-width:0;">
          <strong style="font-family:var(--font-mono); font-size:13px;">${_esc(f.name)}</strong>
          <span style="font-family:var(--font-mono); font-size:10px; color:var(--ink-light); margin-left:8px;">${desc}</span>
        </div>
        <div style="display:flex; align-items:center; gap:6px; flex-shrink:0;">
          ${publishBtn}
          <span style="cursor:pointer; color:var(--red); font-weight:700; font-size:14px;" data-delete-formula="${_escAttr(f.name)}">×</span>
        </div>
      </div>`;
    }).join("");

  // Event delegation for publish/delete buttons (avoids inline onclick XSS)
  container.addEventListener("click", function(e) {
    var pub = e.target.closest("[data-publish-formula]");
    if (pub) { e.stopPropagation(); openPublishFlow(pub.dataset.publishFormula); return; }
    var del = e.target.closest("[data-delete-formula]");
    if (del) { deleteFormula(del.dataset.deleteFormula); return; }
  });
}

// ── Cloud sync (Pro+ feature) ──────────────────────────────────────

/**
 * On page load, fetch formulas from server and merge with localStorage.
 * Server wins on name conflict. Only runs for logged-in Pro/Elite users.
 * Called from lab.js after loadFormulas().
 */
function syncFormulasFromCloud() {
  var token = localStorage.getItem("razzle_token");
  if (!token) return;

  // Check if user is Pro or Elite
  if (typeof isPaidUser === "function" && !isPaidUser()) {
    // Show upgrade hint in formula builder
    _showCloudSyncHint(false);
    return;
  }

  var base = (typeof API_BASE !== "undefined" ? API_BASE : "");
  fetch(base + "/api/user/formulas", {
    headers: { "Authorization": "Bearer " + token }
  }).then(function(r) {
    if (!r.ok) throw new Error("fetch failed");
    return r.json();
  }).then(function(data) {
    var serverFormulas = data.formulas || [];
    if (!serverFormulas.length) {
      // No server formulas — push local to server
      _pushAllFormulasToServer(token, base);
      _showCloudSyncHint(true);
      return;
    }

    // Merge: server wins on name conflict
    var localFormulas = state.formulas || [];
    var mergedMap = {};

    // Add local formulas first
    for (var i = 0; i < localFormulas.length; i++) {
      mergedMap[localFormulas[i].name] = localFormulas[i];
    }

    // Server overwrites on name match
    var serverCount = 0;
    for (var j = 0; j < serverFormulas.length; j++) {
      var sf = serverFormulas[j];
      try {
        var components = JSON.parse(sf.weights);
        mergedMap[sf.name] = { name: sf.name, components: components };
        serverCount++;
      } catch (e) { /* skip malformed */ }
    }

    // Convert back to array
    var merged = [];
    for (var name in mergedMap) {
      merged.push(mergedMap[name]);
    }

    // Update state and localStorage
    state.formulas = merged;
    try { localStorage.setItem("razzle_formulas", JSON.stringify(merged)); } catch(e) {}

    // Re-register formula columns
    for (var k = 0; k < merged.length; k++) {
      var key = "formula_" + merged[k].name.toLowerCase().replace(/[^a-z0-9]/g, "_");
      if (typeof COLUMNS !== "undefined") {
        COLUMNS[key] = { label: (typeof escapeHtml === "function" ? escapeHtml(merged[k].name) : merged[k].name), group: "Formulas", decimals: 1 };
      }
    }

    // Push any local-only formulas to server
    _pushAllFormulasToServer(token, base);

    // Update UI
    if (typeof computeFormulaValues === "function") computeFormulaValues();
    if (typeof renderTable === "function") renderTable();
    if (typeof renderColumnPicker === "function") renderColumnPicker();
    if (typeof renderSavedFormulas === "function") renderSavedFormulas();

    _showCloudSyncHint(true);
  }).catch(function() {
    // Silent fail — local formulas still work
    _showCloudSyncHint(true);
  });
}

function _pushAllFormulasToServer(token, base) {
  var formulas = state.formulas || [];
  if (!formulas.length) return;

  var payload = formulas.map(function(f) {
    return { name: f.name, weights: JSON.stringify(f.components) };
  });

  fetch(base + "/api/user/formulas/import", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": "Bearer " + token },
    body: JSON.stringify({ formulas: payload })
  }).catch(function() {});
}

function _showCloudSyncHint(isPaid) {
  // Add a cloud sync badge near the formula count
  var container = document.getElementById("savedFormulas");
  if (!container) return;

  // Remove existing badge if any
  var existing = document.getElementById("cloudSyncBadge");
  if (existing) existing.remove();

  var badge = document.createElement("div");
  badge.id = "cloudSyncBadge";
  badge.style.cssText = "font-family:var(--font-mono); font-size:9px; margin-bottom:6px; display:inline-block; padding:2px 8px; border-radius:4px;";

  if (isPaid) {
    badge.style.color = "var(--pos-qb)";
    badge.style.border = "2px solid var(--pos-qb)";
    badge.textContent = "cloud-synced";
  } else {
    badge.style.color = "var(--ink-light)";
    badge.style.border = "2px dashed var(--ink-faint)";
    badge.innerHTML = "upgrade to sync formulas across devices";
  }

  container.insertBefore(badge, container.firstChild);
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
  }).then(function(r) { if (!r.ok) throw new Error("fetch failed"); return r.json(); }).then(function(data) {
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
