(() => {
  const storageKey = "blockradar:favorites";
  const viewedKey = "blockradar:recently-viewed";

  function readList(key) {
    try {
      const value = JSON.parse(localStorage.getItem(key) || "[]");
      return Array.isArray(value) ? value.filter((item) => typeof item === "string") : [];
    } catch {
      return [];
    }
  }

  function writeList(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // The tools remain usable when storage is unavailable.
    }
  }

  function favorites() {
    return readList(storageKey);
  }

  function isSaved(id) {
    return favorites().includes(id);
  }

  function refresh() {
    const saved = favorites();
    document.querySelectorAll("[data-favorite-id]").forEach((button) => {
      const active = saved.includes(button.dataset.favoriteId);
      button.setAttribute("aria-pressed", String(active));
      button.classList.toggle("is-saved", active);
      button.textContent = active ? "Saved" : "Save game";
    });

    const count = document.querySelector("#saved-count");
    if (count) count.textContent = String(saved.length);
  }

  function toggle(id) {
    const saved = favorites();
    const next = saved.includes(id)
      ? saved.filter((item) => item !== id)
      : [...saved, id];
    writeList(storageKey, next);
    refresh();
    window.dispatchEvent(new CustomEvent("blockradar:favorites", { detail: { saved: next } }));
    return next.includes(id);
  }

  document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-favorite-id]");
    if (!button) return;
    const active = toggle(button.dataset.favoriteId);
    const game = window.blockRadarGames?.find((item) => item.id === button.dataset.favoriteId);
    const status = document.querySelector("#favorite-status");
    if (status) {
      status.textContent = `${game?.name || "Game"} ${active ? "saved" : "removed"}.`;
    }
  });

  const currentGame = document.body?.dataset?.game;
  if (currentGame) {
    const recent = readList(viewedKey).filter((item) => item !== currentGame);
    writeList(viewedKey, [currentGame, ...recent].slice(0, 8));
  }

  window.BlockRadarFavorites = {
    all: favorites,
    has: isSaved,
    refresh,
    toggle
  };

  refresh();
})();
