const finderGames = window.blockRadarGames || [];
const finderForm = document.querySelector("#advanced-finder");
const finderResults = document.querySelector("#finder-results");
const finderStatus = document.querySelector("#finder-page-status");
const finderShare = document.querySelector("#share-finder");
const finderReset = document.querySelector("#reset-finder");
const finderFields = ["age", "group", "time", "mood", "spend", "scares"];

const shortGames = new Set(["blade-ball", "tower-of-hell", "natural-disaster-survival", "arsenal"]);
const longGames = new Set(["blox-fruits", "bee-swarm-simulator", "theme-park-tycoon-2", "restaurant-tycoon-2", "pet-simulator-99"]);

function safeText(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function fieldValue(name) {
  return finderForm.elements[name].value;
}

function moodMatch(game, mood) {
  const text = [game.name, game.category, game.summary, game.bestFor].join(" ").toLowerCase();
  if (mood === "chill") return game.safety >= 8 && !["Horror", "Shooter"].includes(game.category);
  if (mood === "creative") return /creative|build|fashion|avatar|tycoon|design/.test(text);
  if (mood === "social") return /friend|social|roleplay|co-op|team/.test(text);
  if (mood === "competitive") return /competitive|skill|shooter|voting|duel|reflex/.test(text);
  if (mood === "scary") return game.category === "Horror" || /medium|high/i.test(game.scareLevel);
  if (mood === "progression") return /progression|grind|upgrade|collect|quest/.test(text);
  return true;
}

function groupMatch(game, group) {
  const text = [game.summary, game.bestFor, game.category].join(" ").toLowerCase();
  if (group === "solo") return !/teamwork|co-op|friends/.test(text) || /skill|building|progression/.test(text);
  if (group === "duo") return /friend|co-op|team|roleplay|survival/.test(text);
  if (group === "group") return /friend|social|team|roleplay|voting|round/.test(text);
  return true;
}

function scoreGame(game) {
  let score = game.safety * 4 + Math.min((game.playing || 0) / 25000, 8);
  const reasons = [];
  const age = fieldValue("age");
  const group = fieldValue("group");
  const time = fieldValue("time");
  const mood = fieldValue("mood");
  const spend = fieldValue("spend");
  const scares = fieldValue("scares");
  const minimumAge = Number.parseInt(game.age, 10) || 13;

  if (age !== "any") {
    const allowed = age === "under9" ? minimumAge <= 8 : age === "9to11" ? minimumAge <= 11 : true;
    score += allowed ? 18 : -45;
    if (allowed) reasons.push(`Fits the ${age === "under9" ? "age 8 and under" : age === "9to11" ? "age 9-11" : "age 12+"} filter`);
  }

  if (group !== "any") {
    const match = groupMatch(game, group);
    score += match ? 12 : -8;
    if (match) reasons.push(group === "solo" ? "Works for solo play" : group === "duo" ? "Good for two players" : "Supports group play");
  }

  if (time !== "any") {
    const match = time === "short" ? shortGames.has(game.id) : time === "long" ? longGames.has(game.id) : !shortGames.has(game.id) || !longGames.has(game.id);
    score += match ? 12 : -6;
    if (match) reasons.push(time === "short" ? "Easy to play in a short session" : time === "long" ? "Has long-term progression" : "Fits a 20-40 minute session");
  }

  if (mood !== "any") {
    const match = moodMatch(game, mood);
    score += match ? 16 : -8;
    if (match) reasons.push(`Matches a ${mood} mood`);
  }

  if (spend !== "any") {
    const text = String(game.spend).toLowerCase();
    const low = text.includes("low") && !text.includes("medium");
    const match = spend === "low" ? low : low || text.includes("medium") || text.includes("optional") || text.includes("cosmetic");
    score += match ? 14 : -18;
    if (match) reasons.push(spend === "low" ? "Lower spending pressure" : "Moderate or lower spending fit");
  }

  if (scares !== "any") {
    const value = String(game.scareLevel).toLowerCase();
    const match = scares === "none" ? value.includes("none") : !value.includes("high");
    score += match ? 14 : -25;
    if (match) reasons.push(scares === "none" ? "No scare content flagged" : "Avoids high scare intensity");
  }

  if (!reasons.length) reasons.push("Strong overall safety and popularity balance");
  return { game, score, reasons: reasons.slice(0, 3) };
}

function updateFinderUrl() {
  const url = new URL(window.location.href);
  for (const field of finderFields) {
    const value = fieldValue(field);
    if (value === "any") url.searchParams.delete(field);
    else url.searchParams.set(field, value);
  }
  history.replaceState({}, "", url);
}

function renderFinderResults() {
  const ranked = finderGames.map(scoreGame).sort((a, b) => b.score - a.score).slice(0, 3);
  const topScore = ranked[0]?.score || 1;
  finderResults.innerHTML = ranked.map(({ game, score, reasons }, index) => {
    const match = Math.max(58, Math.min(98, Math.round(90 - (topScore - score) * 0.7 - index * 2)));
    return `
      <article class="finder-result-card">
        <div class="finder-match"><strong>${match}%</strong><span>match</span></div>
        <img src="${safeText(game.image)}" alt="${safeText(game.name)} Roblox thumbnail" />
        <div class="finder-result-body">
          <p class="eyebrow">${index === 0 ? "Best match" : "Alternative"}</p>
          <h2>${safeText(game.name)}</h2>
          <p>${safeText(game.summary)}</p>
          <ul>${reasons.map((reason) => `<li>${safeText(reason)}</li>`).join("")}</ul>
          <div class="meta-row"><span class="tag">Safety ${game.safety.toFixed(1)}</span><span class="tag">${safeText(game.age)}</span><span class="tag">${safeText(game.liveLabel || "Live data updating")}</span></div>
          <div class="result-actions">
            <a class="card-link" href="${safeText(game.page)}">Open game hub</a>
            <a class="card-link secondary-link" href="/compare?left=${safeText(game.id)}">Compare</a>
            <button class="favorite-button" type="button" data-favorite-id="${safeText(game.id)}" aria-pressed="false">Save game</button>
          </div>
        </div>
      </article>`;
  }).join("");
  finderStatus.textContent = `Showing ${ranked.length} recommendations.`;
  updateFinderUrl();
  window.BlockRadarFavorites?.refresh();
}

finderForm.addEventListener("submit", (event) => {
  event.preventDefault();
  renderFinderResults();
  finderResults.scrollIntoView({ behavior: "smooth", block: "start" });
});

finderReset.addEventListener("click", () => {
  finderForm.reset();
  renderFinderResults();
});

finderShare.addEventListener("click", async () => {
  updateFinderUrl();
  try {
    await navigator.clipboard.writeText(window.location.href);
    finderStatus.textContent = "Finder link copied.";
  } catch {
    finderStatus.textContent = "Copy the URL from your browser to share these filters.";
  }
});

const params = new URLSearchParams(window.location.search);
for (const field of finderFields) {
  const value = params.get(field);
  const select = finderForm.elements[field];
  if (value && [...select.options].some((option) => option.value === value)) select.value = value;
}
renderFinderResults();
