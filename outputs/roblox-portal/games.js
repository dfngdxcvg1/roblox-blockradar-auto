const libraryGames = window.blockRadarGames;
const libraryGrid = document.querySelector("#library-grid");
const librarySearch = document.querySelector("#library-search");
const libraryFilter = document.querySelector("#library-filter");

function initialsForLibrary(name) {
  return name.split(/\s+/).map((word) => word[0]).join("").replace(/[^A-Z]/gi, "").slice(0, 3).toUpperCase();
}

function renderLibrary() {
  const query = librarySearch.value.trim().toLowerCase();
  const filter = libraryFilter.value;
  const filtered = libraryGames.filter((game) => {
    const haystack = [game.name, game.category, game.summary, game.spend, game.chatRisk, game.scamRisk, game.bestFor].join(" ").toLowerCase();
    return haystack.includes(query) && (filter === "all" || game.category === filter);
  });

  libraryGrid.innerHTML = filtered.length
    ? filtered.map((game) => `
      <article class="game-card">
        <div class="thumb has-image" style="background:${game.color}">
          <img src="${game.image}" alt="${game.name} Roblox thumbnail" loading="lazy" onerror="this.classList.add('image-failed')" />
          <span>${initialsForLibrary(game.name)}</span>
        </div>
        <div class="game-body">
          <div class="meta-row">
            <span class="tag">${game.category}</span>
            <span class="tag">${game.age}</span>
            <span class="tag">Free: ${game.free}</span>
          </div>
          <h3>${game.name}</h3>
          <p>${game.summary}</p>
          <div class="score-row"><span class="score">${game.safety.toFixed(1)}</span><div class="meter"><i style="width:${game.safety * 10}%"></i></div></div>
          <div class="meta-row live-stats">
            <span class="tag">${game.liveLabel || "Live data pending"}</span>
            <span class="tag">${game.visitsLabel || "Visits updating"}</span>
          </div>
          <a class="card-link" href="${game.page}">Open game hub</a>
        </div>
      </article>
    `).join("")
    : '<div class="empty-state">No matching games yet. Try another category or search term.</div>';
}

librarySearch.addEventListener("input", renderLibrary);
libraryFilter.addEventListener("change", renderLibrary);
renderLibrary();
