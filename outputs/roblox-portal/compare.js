const compareGames = window.blockRadarGames || [];
const leftSelect = document.querySelector("#compare-left");
const rightSelect = document.querySelector("#compare-right");
const comparison = document.querySelector("#comparison-result");
const swapButton = document.querySelector("#swap-games");
const shareButton = document.querySelector("#share-comparison");
const shareStatus = document.querySelector("#compare-status");

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function riskTone(value) {
  const text = String(value).toLowerCase();
  if (text.includes("none") || text.includes("low")) return "green";
  if (text.includes("medium") || text.includes("caution")) return "yellow";
  return "red";
}

function winner(left, right, key, higherIsBetter = true) {
  if (left[key] === right[key]) return ["", ""];
  const leftWins = higherIsBetter ? left[key] > right[key] : left[key] < right[key];
  return leftWins ? ["comparison-winner", ""] : ["", "comparison-winner"];
}

function updateUrl(left, right) {
  const url = new URL(window.location.href);
  url.searchParams.set("left", left.id);
  url.searchParams.set("right", right.id);
  history.replaceState({}, "", url);
}

function gamePanel(game) {
  return `
    <article class="compare-game">
      <img src="${escapeHtml(game.image)}" alt="${escapeHtml(game.name)} Roblox thumbnail" />
      <div>
        <p class="eyebrow">${escapeHtml(game.category)}</p>
        <h2>${escapeHtml(game.name)}</h2>
        <p>${escapeHtml(game.summary)}</p>
        <a class="card-link" href="${escapeHtml(game.page)}">Open game hub</a>
      </div>
    </article>`;
}

function renderComparison() {
  const left = compareGames.find((game) => game.id === leftSelect.value) || compareGames[0];
  const right = compareGames.find((game) => game.id === rightSelect.value) || compareGames[1];
  const [leftSafetyClass, rightSafetyClass] = winner(left, right, "safety");
  const [leftPlayersClass, rightPlayersClass] = winner(left, right, "playing");

  updateUrl(left, right);
  comparison.innerHTML = `
    <div class="compare-head">${gamePanel(left)}${gamePanel(right)}</div>
    <div class="comparison-table" role="table" aria-label="${escapeHtml(left.name)} and ${escapeHtml(right.name)} comparison">
      <div class="comparison-row comparison-labels" role="row">
        <strong role="columnheader">What matters</strong>
        <strong role="columnheader">${escapeHtml(left.name)}</strong>
        <strong role="columnheader">${escapeHtml(right.name)}</strong>
      </div>
      <div class="comparison-row" role="row"><strong role="rowheader">Safety score</strong><span class="${leftSafetyClass}">${left.safety.toFixed(1)}/10</span><span class="${rightSafetyClass}">${right.safety.toFixed(1)}/10</span></div>
      <div class="comparison-row" role="row"><strong role="rowheader">Age guide</strong><span>${escapeHtml(left.age)}</span><span>${escapeHtml(right.age)}</span></div>
      <div class="comparison-row" role="row"><strong role="rowheader">Free-player fit</strong><span>${escapeHtml(left.free)}</span><span>${escapeHtml(right.free)}</span></div>
      <div class="comparison-row" role="row"><strong role="rowheader">Spending</strong><span>${escapeHtml(left.spend)}</span><span>${escapeHtml(right.spend)}</span></div>
      <div class="comparison-row" role="row"><strong role="rowheader">Chat risk</strong><span><i class="risk-dot ${riskTone(left.chatRisk)}"></i>${escapeHtml(left.chatRisk)}</span><span><i class="risk-dot ${riskTone(right.chatRisk)}"></i>${escapeHtml(right.chatRisk)}</span></div>
      <div class="comparison-row" role="row"><strong role="rowheader">Scare level</strong><span><i class="risk-dot ${riskTone(left.scareLevel)}"></i>${escapeHtml(left.scareLevel)}</span><span><i class="risk-dot ${riskTone(right.scareLevel)}"></i>${escapeHtml(right.scareLevel)}</span></div>
      <div class="comparison-row" role="row"><strong role="rowheader">Scam exposure</strong><span><i class="risk-dot ${riskTone(left.scamRisk)}"></i>${escapeHtml(left.scamRisk)}</span><span><i class="risk-dot ${riskTone(right.scamRisk)}"></i>${escapeHtml(right.scamRisk)}</span></div>
      <div class="comparison-row" role="row"><strong role="rowheader">Live players</strong><span class="${leftPlayersClass}">${escapeHtml(left.liveLabel || "Updating")}</span><span class="${rightPlayersClass}">${escapeHtml(right.liveLabel || "Updating")}</span></div>
      <div class="comparison-row" role="row"><strong role="rowheader">Best for</strong><span>${escapeHtml(left.bestFor)}</span><span>${escapeHtml(right.bestFor)}</span></div>
    </div>`;
}

async function shareComparison() {
  try {
    await navigator.clipboard.writeText(window.location.href);
    shareStatus.textContent = "Comparison link copied.";
  } catch {
    shareStatus.textContent = "Copy the URL from your browser to share this comparison.";
  }
}

const options = compareGames.map((game) => `<option value="${game.id}">${escapeHtml(game.name)}</option>`).join("");
leftSelect.innerHTML = options;
rightSelect.innerHTML = options;

const params = new URLSearchParams(window.location.search);
leftSelect.value = compareGames.some((game) => game.id === params.get("left")) ? params.get("left") : "blox-fruits";
rightSelect.value = compareGames.some((game) => game.id === params.get("right")) ? params.get("right") : "doors";
if (leftSelect.value === rightSelect.value) {
  rightSelect.value = compareGames.find((game) => game.id !== leftSelect.value)?.id || compareGames[0].id;
}

leftSelect.addEventListener("change", renderComparison);
rightSelect.addEventListener("change", renderComparison);
swapButton.addEventListener("click", () => {
  const previous = leftSelect.value;
  leftSelect.value = rightSelect.value;
  rightSelect.value = previous;
  renderComparison();
});
shareButton.addEventListener("click", shareComparison);
renderComparison();
