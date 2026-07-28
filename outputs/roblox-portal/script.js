(() => {
  const games = window.blockRadarGames || [];
  const codeGroups = window.blockRadarCodeGroups || [];

  function escapeHtml(value) {
    return String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
  }

  function readList(key) {
    try {
      const value = JSON.parse(localStorage.getItem(key) || "[]");
      return Array.isArray(value) ? value : [];
    } catch {
      return [];
    }
  }

  function orderedGames() {
    return [...games].sort((left, right) => {
      if (left.officialRank && right.officialRank) return left.officialRank - right.officialRank;
      if (left.officialRank) return -1;
      if (right.officialRank) return 1;
      return (right.playing || 0) - (left.playing || 0);
    });
  }

  function gameTile(game, rank) {
    return `<article class="home-game-tile">
      <a class="home-game-image" href="${escapeHtml(game.page)}"><img src="${escapeHtml(game.image)}" alt="${escapeHtml(game.name)} Roblox thumbnail" loading="lazy" /><span>${rank ? `#${rank}` : escapeHtml(game.category)}</span></a>
      <div><a href="${escapeHtml(game.page)}"><strong>${escapeHtml(game.name)}</strong></a><small>${escapeHtml(game.liveLabel || "Player count updating")}</small></div>
      <button class="favorite-button compact-favorite" type="button" data-favorite-id="${escapeHtml(game.id)}" aria-pressed="false">Save game</button>
    </article>`;
  }

  function radarRow(game) {
    return `<a href="${escapeHtml(game.page)}"><img src="${escapeHtml(game.image)}" alt="" loading="lazy" /><span><strong>${escapeHtml(game.name)}</strong><small>${escapeHtml(game.liveLabel || game.category)}</small></span></a>`;
  }

  function renderHeaderData() {
    const latest = games.map((game) => game.updatedAt || game.chartUpdatedAt).filter(Boolean).sort().at(-1);
    const status = document.querySelector("#hero-data-status");
    if (status && latest) {
      status.innerHTML = `<span></span> Official chart and live stats updated ${new Date(latest).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}`;
    }
    const setText = (selector, value) => {
      const element = document.querySelector(selector);
      if (element) element.textContent = String(value);
    };
    setText("#home-game-count", games.length);
    setText("#home-code-count", codeGroups.length);
    setText("#home-saved-count", window.BlockRadarFavorites?.all().length || 0);
  }

  function renderTrending() {
    const root = document.querySelector("#home-trending-grid");
    if (!root) return;
    root.innerHTML = orderedGames().slice(0, 8).map((game, index) => gameTile(game, game.officialRank || index + 1)).join("");
    window.BlockRadarFavorites?.refresh();
  }

  function renderCodes() {
    const root = document.querySelector("#home-codes-list");
    if (!root) return;
    const groups = codeGroups
      .map((group) => ({ ...group, active: group.codes.filter((code) => code.status === "active") }))
      .filter((group) => group.active.length)
      .slice(0, 6);
    root.innerHTML = groups.map((group) => `<a href="/codes?game=${escapeHtml(group.id)}">
      <span><strong>${escapeHtml(group.name)}</strong><small>${group.active.length} active in source review</small></span>
      <span data-freshness-date="${escapeHtml(group.lastReviewed)}" data-fresh-days="3" data-warning-days="7">Reviewed ${escapeHtml(group.lastReviewed)}</span>
    </a>`).join("");
    window.BlockRadarFreshness?.refresh(root);
  }

  function renderRadar() {
    const savedIds = window.BlockRadarFavorites?.all() || [];
    const recentIds = readList("blockradar:recently-viewed");
    const saved = savedIds.map((id) => games.find((game) => game.id === id)).filter(Boolean).slice(0, 4);
    const recent = recentIds.map((id) => games.find((game) => game.id === id)).filter(Boolean).slice(0, 4);
    const savedRoot = document.querySelector("#home-saved-games");
    const recentRoot = document.querySelector("#home-recent-games");
    if (savedRoot) savedRoot.innerHTML = saved.length ? saved.map(radarRow).join("") : '<div class="home-radar-empty"><strong>No saved games yet</strong><a href="/games">Browse games to build your radar</a></div>';
    if (recentRoot) recentRoot.innerHTML = recent.length ? recent.map(radarRow).join("") : '<div class="home-radar-empty"><strong>No recent game hubs</strong><a href="/most-played-roblox-games-today">See what is popular now</a></div>';
    const savedCount = document.querySelector("#home-saved-count");
    if (savedCount) savedCount.textContent = String(savedIds.length);
  }

  function renderLibrary() {
    const root = document.querySelector("#home-library-grid");
    if (!root) return;
    root.innerHTML = orderedGames().slice(8, 16).map((game) => `<a href="${escapeHtml(game.page)}"><img src="${escapeHtml(game.image)}" alt="${escapeHtml(game.name)} Roblox thumbnail" loading="lazy" /><span><strong>${escapeHtml(game.name)}</strong><small>${escapeHtml(game.category)} &middot; Safety ${Number(game.safety).toFixed(1)}/10</small></span></a>`).join("");
  }

  renderHeaderData();
  renderTrending();
  renderCodes();
  renderRadar();
  renderLibrary();
  window.addEventListener("blockradar:favorites", () => {
    renderHeaderData();
    renderRadar();
  });
})();
