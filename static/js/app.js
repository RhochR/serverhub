/* ─── ServerHub App ─── */

const COLORS = [
  "#6750A4","#0061A4","#006E1C","#9C4000","#984061",
"#006A6B","#6B5778","#006491","#36618E","#1B5E20",
"#7B1FA2","#C62828","#E65100","#1565C0","#00695C"
];

let allData = { servers: [], categories: [] };
let activeCategory = "all";
let editingId = null;

// ─── Init ───
async function init() {
  await loadData();
  renderNav();
  renderGrid();
  setupSearch();
  setupTheme();
  setupNavRail();
  populateColorSwatches();
}

async function loadData() {
  const res = await fetch("/api/servers");
  allData = await res.json();
}

// ─── MD3 Expressive Navigation Rail ───
// Manages the collapsed ↔ expanded toggle.
// Per MD3 spec:
//   • Collapsed  = 80px, icon-only, active indicator is a pill behind icon
//   • Expanded   = 256px, icon + label, active indicator stretches full width
function setupNavRail() {
  const rail = document.getElementById("navRail");
  const menuBtn = document.getElementById("navMenuBtn");

  // Persist expand state across page loads
  const savedExpanded = localStorage.getItem("navExpanded") === "true";
  if (savedExpanded) rail.classList.add("expanded");
  updateMenuIcon(savedExpanded);

  menuBtn.addEventListener("click", () => {
    const isExpanded = rail.classList.toggle("expanded");
    localStorage.setItem("navExpanded", isExpanded);
    updateMenuIcon(isExpanded);
  });
}

function updateMenuIcon(isExpanded) {
  // Menu icon becomes close/back when expanded — expressively communicates state
  const icon = document.querySelector("#navMenuBtn .material-icons-round");
  if (icon) icon.textContent = isExpanded ? "menu_open" : "menu";
}

// ─── Navigation ───
function renderNav() {
  const container = document.getElementById("navItems");
  container.innerHTML = "";

  const allBtn = makeNavItem("all", "All Servers", "apps");
  container.appendChild(allBtn);

  allData.categories.forEach(cat => {
    const btn = makeNavItem(cat.id, cat.name, cat.icon || "folder");
    container.appendChild(btn);
  });
}

function makeNavItem(id, name, icon) {
  const btn = document.createElement("button");
  btn.className = "nav-item" + (activeCategory === id ? " active" : "");
  // data-tooltip is shown on hover when rail is collapsed (CSS-driven)
  btn.setAttribute("data-tooltip", name);

  // MD3 structure: indicator div (contains icon) + label span
  // The indicator pill is behind the icon; in expanded mode the whole item gets bg
  btn.innerHTML = `
  <div class="nav-item-indicator">
  <span class="material-icons-round">${icon}</span>
  </div>
  <span class="nav-item-label">${name}</span>
  `;

  btn.onclick = () => {
    activeCategory = id;
    document.querySelectorAll(".nav-item").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById("pageTitle").textContent =
    id === "all" ? "All Servers" : allData.categories.find(c => c.id === id)?.name || "Servers";
    renderGrid();
  };
  return btn;
}

// ─── Grid ───
function renderGrid(filter = "") {
  const grid = document.getElementById("serverGrid");
  const empty = document.getElementById("emptyState");
  grid.innerHTML = "";

  let servers = allData.servers;
  const isGroupedView = activeCategory === "all" && !filter;

  if (filter) {
    const q = filter.toLowerCase();
    servers = servers.filter(s =>
      s.name.toLowerCase().includes(q) ||
      (s.description || "").toLowerCase().includes(q) ||
      (s.url || "").toLowerCase().includes(q)
    );
  } else if (activeCategory !== "all") {
    servers = servers.filter(s => s.category === activeCategory);
  }

  const count = servers.length;
  document.getElementById("serverCount").textContent = `${count} Server${count !== 1 ? "s" : ""}`;

  if (count === 0) {
    empty.style.display = "flex";
    return;
  }
  empty.style.display = "none";

  if (isGroupedView) {
    // Grouped layout for "All Servers"
    allData.categories.forEach(cat => {
      const catServers = servers.filter(s => s.category === cat.id);
      if (catServers.length > 0) {
        const section = document.createElement("section");
        section.className = "grid-group";
        section.innerHTML = `
          <div class="group-header">
            <span class="material-icons-round">${cat.icon || 'folder'}</span>
            <h2 class="group-title">${cat.name}</h2>
            <div class="group-divider"></div>
          </div>
          <div class="group-content"></div>
        `;
        const container = section.querySelector(".group-content");
        catServers.forEach((s, i) => {
          const card = buildCard(s);
          card.style.animationDelay = `${i * 40}ms`;
          container.appendChild(card);
        });
        grid.appendChild(section);
      }
    });
  } else {
    // Standard flat grid for search or specific category
    servers.forEach((s, i) => {
      const card = buildCard(s);
      card.style.animationDelay = `${i * 40}ms`;
      grid.appendChild(card);
    });
  }
}

function buildCard(s) {
  const accent = s.color || "#6750A4";
  const card = document.createElement("div");
  card.className = "server-card";
  card.style.setProperty("--card-accent", accent);

  card.innerHTML = `
  <div class="card-accent-bar"></div>
  <div class="card-body">
  <div class="card-top">
  <div class="card-icon-wrap">
  <span class="material-icons-round">${s.icon || "dns"}</span>
  </div>
  <div class="card-actions">
  <button class="card-icon-btn" onclick="openEditModal(event,'${s.id}')" title="Edit">
  <span class="material-icons-round">edit</span>
  </button>
  <button class="card-icon-btn danger" onclick="confirmDelete(event,'${s.id}','${escHtml(s.name)}')" title="Delete">
  <span class="material-icons-round">delete</span>
  </button>
  </div>
  </div>
  <div class="card-info">
  <div class="card-name">${escHtml(s.name)}</div>
  ${s.description ? `<div class="card-desc">${escHtml(s.description)}</div>` : ""}
  </div>
  <div class="card-url">
  <span class="material-icons-round">link</span>
  ${escHtml(s.url)}
  </div>
  </div>
  <div class="card-footer">
  <a class="btn-open" href="${escHtml(s.url)}" target="_blank" rel="noopener">
  <span class="material-icons-round" style="font-size:18px">open_in_new</span>
  Open
  </a>
  </div>
  `;
  return card;
}

function escHtml(str) {
  return String(str || "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}

// ─── Search ───
function setupSearch() {
  document.getElementById("searchInput").addEventListener("input", e => {
    renderGrid(e.target.value);
  });
}

// ─── Theme ───
function setupTheme() {
  const saved = localStorage.getItem("theme") || "dark";
  document.documentElement.dataset.theme = saved;
  updateThemeIcon(saved);

  document.getElementById("themeToggle").onclick = () => {
    const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    localStorage.setItem("theme", next);
    updateThemeIcon(next);
  };
}

function updateThemeIcon(theme) {
  document.getElementById("themeIcon").textContent = theme === "dark" ? "light_mode" : "dark_mode";
}

// ─── Color Swatches ───
function populateColorSwatches() {
  const wrap = document.getElementById("colorSwatches");
  wrap.innerHTML = "";
  COLORS.forEach(c => {
    const sw = document.createElement("div");
    sw.className = "color-swatch";
    sw.style.background = c;
    sw.dataset.color = c;
    sw.onclick = () => selectColor(c);
    wrap.appendChild(sw);
  });
}

function selectColor(c) {
  document.getElementById("sColor").value = c;
  document.querySelectorAll(".color-swatch").forEach(sw => {
    sw.classList.toggle("selected", sw.dataset.color === c);
  });
}

// ─── Add/Edit Modal ───
window.openAddModal = function () {
  editingId = null;
  document.getElementById("modalTitle").textContent = "Add Server";
  document.getElementById("editId").value = "";
  document.getElementById("sName").value = "";
  document.getElementById("sUrl").value = "";
  document.getElementById("sDesc").value = "";
  document.getElementById("sIcon").value = "dns";
  document.getElementById("iconPreview").textContent = "dns";
  selectColor(COLORS[0]);
  populateCatSelect("");
  openModal("serverModal");
};

function openEditModal(e, id) {
  e.stopPropagation();
  const s = allData.servers.find(x => x.id === id);
  if (!s) return;
  editingId = id;
  document.getElementById("modalTitle").textContent = "Edit Server";
  document.getElementById("sName").value = s.name;
  document.getElementById("sUrl").value = s.url;
  document.getElementById("sDesc").value = s.description || "";
  document.getElementById("sIcon").value = s.icon || "dns";
  document.getElementById("iconPreview").textContent = s.icon || "dns";
  selectColor(s.color || COLORS[0]);
  populateCatSelect(s.category || "");
  openModal("serverModal");
}

function populateCatSelect(selected) {
  const sel = document.getElementById("sCat");
  sel.innerHTML = allData.categories.map(c =>
  `<option value="${c.id}" ${c.id === selected ? "selected" : ""}>${c.name}</option>`
  ).join("");
}

window.updateIconPreview = function () {
  document.getElementById("iconPreview").textContent =
  document.getElementById("sIcon").value || "dns";
};

window.saveServer = async function () {
  const payload = {
    name: document.getElementById("sName").value.trim(),
    url: document.getElementById("sUrl").value.trim(),
    description: document.getElementById("sDesc").value.trim(),
    category: document.getElementById("sCat").value,
    icon: document.getElementById("sIcon").value.trim() || "dns",
    color: document.getElementById("sColor").value,
  };
  if (!payload.name || !payload.url) { showToast("Name and URL are required!"); return; }

  if (editingId) {
    await fetch(`/api/servers/${editingId}`, {
      method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload)
    });
    showToast("Server updated");
  } else {
    await fetch("/api/servers", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload)
    });
    showToast("Server added");
  }
  closeModal("serverModal");
  await loadData();
  renderGrid(document.getElementById("searchInput").value);
};

// ─── Delete ───
function confirmDelete(e, id, name) {
  e.stopPropagation();
  document.getElementById("confirmText").textContent = `Delete "${name}"?`;
  document.getElementById("confirmDeleteBtn").onclick = async () => {
    await fetch(`/api/servers/${id}`, { method: "DELETE" });
    closeModal("confirmModal");
    showToast("Server deleted");
    await loadData();
    renderGrid(document.getElementById("searchInput").value);
  };
  openModal("confirmModal");
}

// ─── Category Manager ───
document.getElementById("manageCatsBtn").onclick = () => {
  renderCatList();
  openModal("catModal");
};

function renderCatList() {
  const list = document.getElementById("catList");
  list.innerHTML = allData.categories.map(c => `
  <div class="cat-item">
  <span class="material-icons-round">${c.icon || "folder"}</span>
  <span class="cat-item-name">${escHtml(c.name)}</span>
  <button class="cat-item-btn" onclick="deleteCategory('${c.id}')">
  <span class="material-icons-round">delete</span>
  </button>
  </div>
  `).join("");
}

window.addCategory = async function () {
  const name = document.getElementById("newCatName").value.trim();
  const icon = document.getElementById("newCatIcon").value.trim() || "folder";
  if (!name) return;
  await fetch("/api/categories", {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, icon })
  });
  document.getElementById("newCatName").value = "";
  document.getElementById("newCatIcon").value = "";
  await loadData();
  renderNav();
  renderCatList();
  showToast("Category added");
};

window.deleteCategory = async function (id) {
  await fetch(`/api/categories/${id}`, { method: "DELETE" });
  await loadData();
  if (activeCategory === id) activeCategory = "all";
  renderNav();
  renderGrid();
  renderCatList();
  showToast("Category deleted");
};

// ─── FAB button ───
document.getElementById("addServerBtn").onclick = openAddModal;

// ─── Modal helpers ───
function openModal(id) {
  document.getElementById(id).classList.add("open");
}
window.closeModal = function (id) {
  document.getElementById(id).classList.remove("open");
};
document.querySelectorAll(".modal-backdrop").forEach(b => {
  b.addEventListener("click", e => {
    if (e.target === b) b.classList.remove("open");
  });
});

// ─── Toast ───
function showToast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 2800);
}

// ─── Start ───
init();
