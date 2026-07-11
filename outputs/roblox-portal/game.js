const params = new URLSearchParams(window.location.search);
const pageId = document.body?.dataset?.game;
const id = pageId || params.get("id") || "blox-fruits";
const game = window.blockRadarGames.find((item) => item.id === id) || window.blockRadarGames[0];
const detail = document.querySelector("#game-detail");
const pathPrefix = window.location.pathname.includes("/games/") || window.location.pathname.includes("\\games\\") ? "../" : "";

document.title = `${game.name} Guide, Codes & Safety Score - BlockRadar`;

function list(items) {
  return items.map((item) => `<li>${item}</li>`).join("");
}

function riskClass(value) {
  const text = String(value).toLowerCase();
  if (text.includes("low") || text.includes("none")) return "green";
  if (text.includes("medium") || text.includes("caution")) return "yellow";
  return "red";
}

function scoreLabel(score) {
  if (score >= 8.5) return "Parent-friendly";
  if (score >= 7.2) return "Good with review";
  if (score >= 6) return "Check first";
  return "Needs caution";
}

function spendingLabel(text) {
  const value = String(text).toLowerCase();
  if (value.includes("low")) return "Low pressure";
  if (value.includes("medium") || value.includes("optional")) return "Moderate pressure";
  return "High pressure";
}

detail.innerHTML = `
  <section class="detail-hero">
    <div class="detail-media" style="background:${game.color}">
      <img src="${game.image}" alt="${game.name} official Roblox thumbnail" onerror="this.classList.add('image-failed')" />
      <span>${game.name.split(" ").map((word) => word[0]).join("").slice(0, 3)}</span>
    </div>
    <div>
      <p class="eyebrow">${game.category} Roblox Hub</p>
      <h1>${game.name}</h1>
      <p class="hero-copy">${game.summary}</p>
      <div class="meta-row">
        <span class="tag">Age guide: ${game.age}</span>
        <span class="tag">Free-player fit: ${game.free}</span>
        <span class="tag">Codes: ${game.codes}</span>
        <span class="tag">Verdict: ${scoreLabel(game.safety)}</span>
        <span class="tag">${game.liveLabel || "Live data pending"}</span>
        <span class="tag">${game.visitsLabel || "Visits updating"}</span>
      </div>
      <div class="detail-actions">
        <a class="card-link" href="${game.officialUrl}" target="_blank" rel="noopener">Open official Roblox page</a>
        <a class="card-link secondary-link" href="${pathPrefix}games.html">Browse library</a>
      </div>
    </div>
  </section>

  <nav class="breadcrumb" aria-label="Breadcrumb">
    <a href="${pathPrefix}index.html">Home</a>
    <span>/</span>
    <a href="${pathPrefix}games.html">Games</a>
    <span>/</span>
    <strong>${game.name}</strong>
  </nav>

  <section class="detail-grid">
    <article class="detail-card score-card">
      <h2>Safety snapshot</h2>
      <div class="big-score">${game.safety.toFixed(1)}<span>/10</span></div>
      <div class="meter"><i style="width:${game.safety * 10}%"></i></div>
      <div class="risk-grid">
        <span class="score-pill ${riskClass(game.chatRisk)}">Chat: ${game.chatRisk}</span>
        <span class="score-pill ${riskClass(game.scareLevel)}">Scares: ${game.scareLevel}</span>
        <span class="score-pill ${riskClass(game.scamRisk)}">Scams: ${game.scamRisk}</span>
      </div>
      <p class="card-note">Overall verdict: ${scoreLabel(game.safety)}. Review the risk tags before approving long sessions or purchases.</p>
    </article>

    <article class="detail-card">
      <h2>Who should play</h2>
      <p>${game.bestFor}</p>
      <h3>Skip it if</h3>
      <p>${game.avoidIf}</p>
    </article>

    <article class="detail-card fact-card">
      <h2>Quick facts</h2>
      <dl>
        <div><dt>Category</dt><dd>${game.category}</dd></div>
        <div><dt>Spending</dt><dd>${spendingLabel(game.spend)}</dd></div>
        <div><dt>Code demand</dt><dd>${game.codes}</dd></div>
        <div><dt>Free-player fit</dt><dd>${game.free}</dd></div>
        <div><dt>Live players</dt><dd>${game.liveLabel || "Updating"}</dd></div>
        <div><dt>Visits</dt><dd>${game.visitsLabel || "Updating"}</dd></div>
        <div><dt>Player rating</dt><dd>${game.ratingLabel || "Updating"}</dd></div>
      </dl>
    </article>

    <article class="detail-card">
      <h2>Before you play</h2>
      <ol>
        <li>Open the official Roblox page and confirm the experience name.</li>
        <li>Read the spending and scam notes before trading or buying passes.</li>
        <li>For younger players, preview chat behavior and scare level first.</li>
      </ol>
    </article>

    <article class="detail-card">
      <h2>Beginner route</h2>
      <ol>${list(game.quickStart)}</ol>
    </article>

    <article class="detail-card">
      <h2>Parent notes</h2>
      <ol>${list(game.parentNotes)}</ol>
    </article>

    <article class="detail-card wide-card">
      <h2>Similar Roblox games</h2>
      <div class="similar-list">${game.similar.map((item) => `<span class="tag">${item}</span>`).join("")}</div>
    </article>

    <article class="detail-card wide-card">
      <h2>Search topics covered</h2>
      <p>This hub is structured for players searching: ${game.name} guide, ${game.name} codes, is ${game.name} safe for kids, ${game.name} beginner tips, and games like ${game.name}.</p>
    </article>
  </section>
`;
