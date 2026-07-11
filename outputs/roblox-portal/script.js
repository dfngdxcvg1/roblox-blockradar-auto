const games = window.blockRadarGames;

const grid = document.querySelector("#game-grid");
const search = document.querySelector("#game-search");
const category = document.querySelector("#category-filter");
const liveBoard = document.querySelector("#live-board");
const liveUpdated = document.querySelector("#live-updated");
const moodFilter = document.querySelector("#mood-filter");
const spendFilter = document.querySelector("#spend-filter");
const finderResult = document.querySelector("#finder-result");
const randomPick = document.querySelector("#random-pick");
const rerollGame = document.querySelector("#reroll-game");

function initials(name) {
  return name
    .split(/\s+/)
    .map((word) => word[0])
    .join("")
    .replace(/[^A-Z]/gi, "")
    .slice(0, 3)
    .toUpperCase();
}

function formatGameMini(game) {
  return `
    <a href="${game.page}">
      <strong>${game.name}</strong>
      <span>${game.category} · ${game.liveLabel || "Live data pending"} · ${game.ratingLabel || "Rating updating"}</span>
    </a>
  `;
}

function renderLiveBoard() {
  if (!liveBoard) return;
  const hot = [...games].sort((a, b) => (b.playing || 0) - (a.playing || 0)).slice(0, 7);
  liveBoard.innerHTML = hot.map((game, index) => `
    <li>
      <span class="rank">${index + 1}</span>
      ${formatGameMini(game)}
      <em>${game.visitsLabel || ""}</em>
    </li>
  `).join("");
  const latest = games.map((game) => game.updatedAt).filter(Boolean).sort().at(-1);
  if (liveUpdated && latest) {
    liveUpdated.textContent = `Updated ${new Date(latest).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}`;
  }
}

function moodMatches(game, mood) {
  const haystack = [game.name, game.category, game.summary, game.bestFor, game.spend, game.scareLevel].join(" ").toLowerCase();
  if (mood === "friends") return haystack.includes("friend") || haystack.includes("co-op") || haystack.includes("roleplay");
  if (mood === "safe") return game.safety >= 8 && !String(game.scamRisk).toLowerCase().includes("medium");
  if (mood === "scary") return game.category === "Horror" || !String(game.scareLevel).toLowerCase().includes("none");
  if (mood === "creative") return haystack.includes("creative") || haystack.includes("fashion") || haystack.includes("sandbox") || haystack.includes("tycoon");
  if (mood === "grind") return haystack.includes("progression") || haystack.includes("grind") || haystack.includes("simulator");
  return true;
}

function spendMatches(game, spend) {
  const value = String(game.spend).toLowerCase();
  if (spend === "low") return value.includes("low");
  if (spend === "medium") return value.includes("medium") || value.includes("optional") || value.includes("cosmetic");
  if (spend === "high") return true;
  return true;
}

function renderFinder() {
  if (!finderResult) return;
  const mood = moodFilter.value;
  const spend = spendFilter.value;
  const picks = games
    .filter((game) => moodMatches(game, mood) && spendMatches(game, spend))
    .sort((a, b) => (b.safety + (b.playing || 0) / 100000) - (a.safety + (a.playing || 0) / 100000))
    .slice(0, 3);

  finderResult.innerHTML = picks.length
    ? picks.map((game) => `<div class="finder-card">${formatGameMini(game)}<p>${game.bestFor}</p></div>`).join("")
    : '<p class="empty-state">No perfect match. Try a wider mood or spending filter.</p>';
}

function renderRandomPick() {
  if (!randomPick) return;
  const pool = games.filter((game) => game.safety >= 7).sort((a, b) => (b.playing || 0) - (a.playing || 0));
  const index = Math.floor(Math.random() * Math.min(pool.length, 12));
  const game = pool[index] || games[0];
  randomPick.innerHTML = `<div class="spotlight-pick">${formatGameMini(game)}<p>${game.summary}</p></div>`;
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
moodFilter?.addEventListener("change", renderFinder);
spendFilter?.addEventListener("change", renderFinder);
rerollGame?.addEventListener("click", renderRandomPick);
renderLiveBoard();
renderFinder();
renderRandomPick();
renderGames();
