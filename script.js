(function () {
  const grid = document.getElementById("grid");
  const filtersEl = document.getElementById("filters");
  const lb = document.getElementById("lightbox");
  const lbImg = document.getElementById("lbImg");
  const lbDetails = document.getElementById("lbDetails");
  document.getElementById("year").textContent = new Date().getFullYear();

  let current = "All";
  let visible = [];
  let cards = [];
  let index = 0;

  const categories = ["All", ...new Set(ARTWORKS.map(a => a.category).filter(Boolean))];

  function renderFilters() {
    filtersEl.innerHTML = "";
    if (categories.length <= 2) return;
    categories.forEach(cat => {
      const b = document.createElement("button");
      b.textContent = cat;
      b.setAttribute("role", "tab");
      b.setAttribute("aria-selected", cat === current);
      b.onclick = () => { current = cat; renderFilters(); renderGrid(); };
      filtersEl.appendChild(b);
    });
  }

  function caption(a) {
    return [a.year, a.medium].filter(Boolean).join(" · ");
  }

  function renderGrid() {
    visible = ARTWORKS.filter(a => current === "All" || a.category === current);
    cards = [];
    grid.innerHTML = "";
    if (!visible.length) { grid.innerHTML = '<p class="empty">No artwork yet.</p>'; return; }
    visible.forEach((a, i) => {
      const card = document.createElement("button");
      card.className = "card";
      card.setAttribute("aria-label", "View " + a.title);
      const img = document.createElement("img");
      img.src = "images/" + a.file;
      img.alt = a.title + (a.description ? ". " + a.description : "");
      img.loading = "lazy";
      card.append(img);
      card.onclick = () => open(i);
      cards.push(card);
    });
    layout();
  }

  // Place cards left to right: 1, 2, 3 across the first row, then 4, 5, 6, and so on.
  let colCount = 0;
  function layout() {
    if (!cards.length) return;
    const n = Math.max(1, Math.min(3, Math.floor(grid.clientWidth / 150)));
    colCount = n;
    grid.innerHTML = "";
    const cols = [];
    for (let c = 0; c < n; c++) {
      const col = document.createElement("div");
      col.className = "col";
      grid.appendChild(col);
      cols.push(col);
    }
    cards.forEach((card, i) => cols[i % n].appendChild(card));
  }
  window.addEventListener("resize", () => {
    const n = Math.max(1, Math.min(3, Math.floor(grid.clientWidth / 150)));
    if (cards.length && n !== colCount) layout();
  });

  function show() {
    const a = visible[index];
    lbImg.src = "images/" + a.file;
    lbImg.alt = a.title;
    lbDetails.innerHTML = "";
    const h = document.createElement("h3");
    h.textContent = a.title;
    lbDetails.appendChild(h);
    [["Year", a.year], ["Medium", a.medium], ["Size", a.size], ["Category", a.category]].forEach(([k, v]) => {
      if (!v) return;
      const row = document.createElement("p");
      row.className = "row";
      const key = document.createElement("span");
      key.textContent = k;
      row.append(key, String(v));
      lbDetails.appendChild(row);
    });
    if (a.description) {
      const d = document.createElement("p");
      d.className = "desc";
      d.textContent = a.description;
      lbDetails.appendChild(d);
    }
    const count = document.createElement("p");
    count.className = "count";
    count.textContent = (index + 1) + " / " + visible.length;
    lbDetails.appendChild(count);
  }
  function open(i) { index = i; show(); lb.hidden = false; document.body.style.overflow = "hidden"; }
  function close() { lb.hidden = true; document.body.style.overflow = ""; }
  function step(d) { index = (index + d + visible.length) % visible.length; show(); }

  document.getElementById("lbClose").onclick = close;
  document.getElementById("lbPrev").onclick = () => step(-1);
  document.getElementById("lbNext").onclick = () => step(1);
  lb.addEventListener("click", e => { if (e.target === lb) close(); });
  document.addEventListener("keydown", e => {
    if (lb.hidden) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowLeft") step(-1);
    if (e.key === "ArrowRight") step(1);
  });

  const socialsModal = document.getElementById("socialsModal");
  const socialsOpen = () => { socialsModal.hidden = false; };
  const socialsShut = () => { socialsModal.hidden = true; };
  document.getElementById("socialsBtn").onclick = socialsOpen;
  document.getElementById("socialsClose").onclick = socialsShut;
  socialsModal.addEventListener("click", e => { if (e.target === socialsModal) socialsShut(); });
  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && !socialsModal.hidden) socialsShut();
  });

  renderFilters();
  renderGrid();
})();
