const games = window.blockRadarGames;

const grid = document.querySelector("#game-grid");
const search = document.querySelector("#game-search");
const category = document.querySelector("#category-filter");

function initials(name) {
  return name
    .split(/\s+/)
    .map((word) => word[0])
    .join("")
    .replace(/[^A-Z]/gi, "")
    .slice(0, 3)
    .toUpperCase();
}

function renderGames() {
  const query = search.value.trim().toLowerCase();
  const selectedCategory = category.value;
  const filtered = games.filter((game) => {
    const matchesQuery = [game.name, game.category, game.summary].join(" ").toLowerCase().includes(query);
    const matchesCategory = selectedCategory === "all" || game.category === selectedCategory;
    return matchesQuery && matchesCategory;
  });

  grid.innerHTML = "";

  if (!filtered.length) {
    grid.innerHTML = '<div class="empty-state">No matches yet. Try a genre, game name, or guide topic.</div>';
    return;
  }

  filtered.forEach((game) => {
    const card = document.createElement("article");
    card.className = "game-card";
    card.innerHTML = `
      <div class="thumb has-image" style="background:${game.color}">
        <img src="${game.image}" alt="${game.name} Roblox thumbnail" loading="lazy" onerror="this.classList.add('image-failed')" />
        <span>${initials(game.name)}</span>
      </div>
      <div class="game-body">
        <div class="meta-row">
          <span class="tag">${game.category}</span>
          <span class="tag">${game.age}</span>
          <span class="tag">Free: ${game.free}</span>
        </div>
        <h3>${game.name}</h3>
        <p>${game.summary}</p>
        <div class="score-row" aria-label="Safety score ${game.safety} out of 10">
          <span class="score">${game.safety.toFixed(1)}</span>
          <div class="meter"><i style="width:${game.safety * 10}%"></i></div>
        </div>
        <div class="meta-row live-stats">
          <span class="tag">${game.liveLabel || "Live data pending"}</span>
          <span class="tag">${game.visitsLabel || "Visits updating"}</span>
          <span class="tag">${game.ratingLabel || "Rating updating"}</span>
        </div>
        <div class="tag">${game.spend}</div>
        <a class="card-link" href="${game.page}">Open game hub</a>
      </div>
    `;
    grid.appendChild(card);
  });
}

search.addEventListener("input", renderGames);
category.addEventListener("change", renderGames);
renderGames();
