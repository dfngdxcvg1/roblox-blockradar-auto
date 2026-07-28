import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve("outputs/roblox-portal");
const gamesRoot = path.join(root, "games");
const baseUrl = "https://roblox.pingdou123.uk";
const today = new Date().toISOString().slice(0, 10);
const noindexPages = new Set([
  "daily-roblox-guides.html",
  "editorial-plan.html",
  "game.html"
]);
const sitemapExcluded = new Set([
  ...noindexPages,
  "google4c9c5b5cfa7f7a88.html"
]);
const relatedGuidesByGame = {
  "blox-fruits": [
    {
      title: "Blox Fruits trading scam guide",
      href: "/blox-fruits-trading-scam-guide",
      copy: "Recognize trust trades, fake middlemen, phishing links, and off-platform deals."
    },
    {
      title: "Is Blox Fruits safe for kids?",
      href: "/is-blox-fruits-safe-for-kids",
      copy: "Review chat, combat, trading, grinding, and Robux pressure before a child plays."
    },
    {
      title: "Reviewed Blox Fruits codes",
      href: "/codes?game=blox-fruits",
      copy: "Copy recently reviewed XP and stat-reset codes from the BlockRadar tracker."
    }
  ],
  "catalog-avatar-creator": [
    {
      title: "Is Catalog Avatar Creator safe?",
      href: "/is-catalog-avatar-creator-safe-for-kids",
      copy: "A parent guide to public chat, avatar purchases, social comparison, and safer settings."
    }
  ],
  "dress-to-impress": [
    {
      title: "Is Dress to Impress safe?",
      href: "/is-dress-to-impress-safe-for-kids",
      copy: "Understand voting, public chat, VIP pressure, outfit codes, and age fit."
    },
    {
      title: "Reviewed Dress to Impress codes",
      href: "/codes?game=dress-to-impress",
      copy: "Filter and copy outfit codes with source-review dates and redemption warnings."
    }
  ],
  "brookhaven-rp": [
    {
      title: "Is Brookhaven safe for kids?",
      href: "/is-brookhaven-safe-for-kids",
      copy: "Review roleplay boundaries, chat, private spaces, vehicles, and purchase prompts."
    },
    {
      title: "Games like Brookhaven",
      href: "/games-like-brookhaven",
      copy: "Compare social and roleplay alternatives before choosing the next game."
    }
  ],
  "bee-swarm-simulator": [
    {
      title: "Reviewed Bee Swarm Simulator codes",
      href: "/codes?game=bee-swarm-simulator",
      copy: "See code rewards, source notes, and the latest BlockRadar review date."
    }
  ],
  "blade-ball": [
    {
      title: "Reviewed Blade Ball codes",
      href: "/codes?game=blade-ball",
      copy: "Copy current source-reviewed codes and check why a code may stop working."
    }
  ],
  "doors": [
    {
      title: "Games like Doors",
      href: "/games-like-doors",
      copy: "Compare scare level, co-op fit, and session style across similar Roblox games."
    }
  ]
};
const growthGuidesByGame = {
  "grow-a-garden-2": [
    ["Grow a Garden 2 codes not expired", "/grow-a-garden-2-codes-not-expired"],
    ["Grow a Garden 2 beginner guide", "/grow-a-garden-2-beginner-guide"],
    ["Is Grow a Garden 2 safe for kids?", "/is-grow-a-garden-2-safe-for-kids"],
    ["Best seeds and upgrades", "/grow-a-garden-2-best-seeds-and-upgrades"],
    ["Night stealing and garden secrets", "/grow-a-garden-2-night-stealing-and-garden-secrets"]
  ],
  "99-nights-in-the-forest": [
    ["99 Nights codes not expired", "/99-nights-in-the-forest-codes-not-expired"],
    ["99 Nights beginner guide", "/99-nights-in-the-forest-beginner-guide"],
    ["Is 99 Nights safe for kids?", "/is-99-nights-in-the-forest-safe-for-kids"],
    ["Best classes and upgrades", "/99-nights-in-the-forest-best-classes-and-upgrades"],
    ["Map and survival route", "/99-nights-in-the-forest-map-and-survival-route"]
  ],
  "rivals": [
    ["RIVALS codes not expired", "/rivals-codes-not-expired"],
    ["RIVALS beginner guide", "/rivals-beginner-guide"],
    ["Is RIVALS safe for kids?", "/is-rivals-safe-for-kids"],
    ["RIVALS best weapons", "/rivals-best-weapons"],
    ["RIVALS maps and positioning", "/rivals-maps-and-positioning"]
  ],
  "steal-a-brainrot": [
    ["Steal a Brainrot code status", "/steal-a-brainrot-codes-not-expired"],
    ["Steal a Brainrot beginner guide", "/steal-a-brainrot-beginner-guide"],
    ["Is Steal a Brainrot safe for kids?", "/is-steal-a-brainrot-safe-for-kids"],
    ["Best Brainrots and value checks", "/steal-a-brainrot-best-brainrots-and-values"],
    ["Base defense and stealing secrets", "/steal-a-brainrot-base-defense-secrets"]
  ],
  "fish-it": [
    ["Fish It codes not expired", "/fish-it-codes-not-expired"],
    ["Fish It beginner guide", "/fish-it-beginner-guide"],
    ["Is Fish It safe for kids?", "/is-fish-it-safe-for-kids"],
    ["Fish It best rods", "/fish-it-best-rods"],
    ["Fish It locations and route", "/fish-it-locations-and-fishing-route"]
  ],
  "anime-expeditions": [
    ["Anime Expeditions codes", "/anime-expeditions-codes-not-expired"],
    ["Anime Expeditions beginner guide", "/anime-expeditions-beginner-guide"],
    ["Is Anime Expeditions safe for kids?", "/is-anime-expeditions-safe-for-kids"],
    ["Best units and team roles", "/anime-expeditions-best-units-and-team-roles"],
    ["Progression values and secrets", "/anime-expeditions-progression-and-secrets"]
  ]
};

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function list(items) {
  return items.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
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

function spendingLabel(value) {
  const text = String(value).toLowerCase();
  if (text.includes("low")) return "Low pressure";
  if (text.includes("medium") || text.includes("optional")) return "Moderate pressure";
  return "High pressure";
}

function relatedGuides(game) {
  const growthGuides = (growthGuidesByGame[game.id] || []).map(([title, href]) => ({
    title,
    href,
    copy: "A focused, source-reviewed guide for this specific player question."
  }));
  const guides = [...growthGuides, ...(relatedGuidesByGame[game.id] || [])];
  if (!guides.length) return "";
  return `
        <article class="detail-card wide-card">
          <h2>Related ${escapeHtml(game.name)} guides</h2>
          <div class="related-guide-list">${guides.map((guide) => `
              <a href="${escapeHtml(guide.href)}">
                <strong>${escapeHtml(guide.title)}</strong>
                <span>${escapeHtml(guide.copy)}</span>
              </a>`).join("")}
          </div>
        </article>`;
}

function gameDetail(game) {
  const name = escapeHtml(game.name);
  const verdict = scoreLabel(game.safety);
  return `
      <section class="detail-hero">
        <div class="detail-media" style="background:${escapeHtml(game.color)}">
          <img src="${escapeHtml(game.image)}" alt="${name} official Roblox thumbnail" onerror="this.classList.add('image-failed')" />
          <span>${escapeHtml(game.name.split(" ").map((word) => word[0]).join("").slice(0, 3))}</span>
        </div>
        <div>
          <p class="eyebrow">${escapeHtml(game.category)} Roblox Hub</p>
          <h1>${name}</h1>
          <p class="hero-copy">${escapeHtml(game.summary)}</p>
          <div class="meta-row">
            <span class="tag">Age guide: ${escapeHtml(game.age)}</span>
            <span class="tag">Free-player fit: ${escapeHtml(game.free)}</span>
            <span class="tag">Codes: ${escapeHtml(game.codes)}</span>
            <span class="tag">Verdict: ${verdict}</span>
            <span class="tag">${escapeHtml(game.liveLabel || "Live data pending")}</span>
            <span class="tag">${escapeHtml(game.visitsLabel || "Visits updating")}</span>${game.officialRank ? `
            <span class="tag">Official chart #${game.officialRank}</span>` : ""}
          </div>
          <div class="detail-actions">
            <a class="card-link" href="${escapeHtml(game.officialUrl)}" target="_blank" rel="noopener">Open official Roblox page</a>
            <a class="card-link secondary-link" href="/games">Browse library</a>
            <a class="card-link secondary-link" href="/compare?left=${escapeHtml(game.id)}">Compare</a>
            <button class="favorite-button" type="button" data-favorite-id="${escapeHtml(game.id)}" aria-pressed="false">Save game</button>
          </div>
        </div>
      </section>

      <nav class="breadcrumb" aria-label="Breadcrumb">
        <a href="/">Home</a><span>/</span>
        <a href="/games">Games</a><span>/</span>
        <strong>${name}</strong>
      </nav>

      <section class="detail-grid">
        <article class="detail-card score-card">
          <h2>Safety snapshot</h2>
          <div class="big-score">${Number(game.safety).toFixed(1)}<span>/10</span></div>
          <div class="meter"><i style="width:${Number(game.safety) * 10}%"></i></div>
          <div class="risk-grid">
            <span class="score-pill ${riskClass(game.chatRisk)}">Chat: ${escapeHtml(game.chatRisk)}</span>
            <span class="score-pill ${riskClass(game.scareLevel)}">Scares: ${escapeHtml(game.scareLevel)}</span>
            <span class="score-pill ${riskClass(game.scamRisk)}">Scams: ${escapeHtml(game.scamRisk)}</span>
          </div>
          <p class="card-note">Overall verdict: ${verdict}. Review the risk tags before approving long sessions or purchases.</p>
        </article>

        <article class="detail-card">
          <h2>Who should play</h2>
          <p>${escapeHtml(game.bestFor)}</p>
          <h3>Skip it if</h3>
          <p>${escapeHtml(game.avoidIf)}</p>
        </article>

        <article class="detail-card fact-card">
          <h2>Quick facts</h2>
          <dl>
            <div><dt>Category</dt><dd>${escapeHtml(game.category)}</dd></div>
            <div><dt>Spending</dt><dd>${spendingLabel(game.spend)}</dd></div>
            <div><dt>Code demand</dt><dd>${escapeHtml(game.codes)}</dd></div>
            <div><dt>Free-player fit</dt><dd>${escapeHtml(game.free)}</dd></div>
            <div><dt>Live players</dt><dd>${escapeHtml(game.liveLabel || "Updating")}</dd></div>
            <div><dt>Visits</dt><dd>${escapeHtml(game.visitsLabel || "Updating")}</dd></div>
            <div><dt>Player rating</dt><dd>${escapeHtml(game.ratingLabel || "Updating")}</dd></div>
            <div><dt>Official chart</dt><dd>${game.officialRank ? `#${game.officialRank} Top Playing Now` : "Outside current snapshot"}</dd></div>
            <div><dt>Stats updated</dt><dd>${escapeHtml((game.updatedAt || game.chartUpdatedAt || "").slice(0, 10) || "Updating")}</dd></div>
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
          <h2>What the official Roblox page says</h2>
          <p>${escapeHtml(game.officialSummary || game.summary)}</p>
          <p class="card-note">Live players, visits, rating, thumbnail, and chart position come from Roblox endpoints. BlockRadar's safety score is an independent editorial assessment.</p>
        </article>

        <article class="detail-card wide-card feedback-panel" data-feedback-scope="game:${escapeHtml(game.id)}:scare">
          <p class="eyebrow">Community correction</p>
          <h2>Is the scare level accurate?</h2>
          <div class="feedback-actions">
            <button type="button" data-feedback-value="accurate" aria-pressed="false">Accurate</button>
            <button type="button" data-feedback-value="too-low" aria-pressed="false">Too low</button>
            <button type="button" data-feedback-value="too-high" aria-pressed="false">Too high</button>
            <button type="button" data-feedback-value="outdated" aria-pressed="false">Page outdated</button>
          </div>
          <small data-feedback-status>Your choice is stored only on this device.</small>
        </article>

        <article class="detail-card wide-card">
          <h2>Similar Roblox games</h2>
          <div class="similar-list">${game.similar.map((item) => `<span class="tag">${escapeHtml(item)}</span>`).join("")}</div>
        </article>

        <article class="detail-card wide-card">
          <h2>Search topics covered</h2>
          <p>This hub covers ${name} beginner tips, codes status, age guidance, spending pressure, safety notes, and games similar to ${name}.</p>
        </article>${relatedGuides(game)}
      </section>`;
}

function gamePage(game) {
  const canonical = `${baseUrl}/games/${game.id}`;
  const description = `${game.name} Roblox guide with safety score, beginner route, spending pressure, scam-risk notes, live stats, and parent guidance.`;
  const structuredData = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "VideoGame",
    name: game.name,
    description,
    url: canonical,
    image: game.image,
    gamePlatform: "Roblox",
    genre: game.category,
    isPartOf: {
      "@type": "WebSite",
      name: "BlockRadar",
      url: `${baseUrl}/`
    }
  }).replaceAll("<", "\\u003c");

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(game.name)} Guide, Codes &amp; Safety Score - BlockRadar</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <meta name="robots" content="index,follow,max-image-preview:large" />
    <link rel="canonical" href="${canonical}" />
    <meta property="og:type" content="article" />
    <meta property="og:title" content="${escapeHtml(game.name)} Roblox Guide - BlockRadar" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:url" content="${canonical}" />
    <meta property="og:image" content="${escapeHtml(game.image)}" />
    <link rel="stylesheet" href="../styles.css" />
    <script type="application/ld+json">${structuredData}</script>
    <script src="../data.js" defer></script>
    <script src="../game.js" defer></script>
    <script src="../favorites.js" defer></script>
    <script src="../feedback.js" defer></script>
    <script src="../ads.js" defer></script>
  </head>
  <body data-game="${escapeHtml(game.id)}">
    <header class="site-header">
      <a class="brand" href="/"><span class="brand-mark">BR</span><span>BlockRadar</span></a>
      <nav class="nav" aria-label="Primary navigation">
        <a href="/games">Games</a><a href="/compare">Compare</a><a href="/rankings">Rankings</a>
        <a href="/guides">Guides</a><a href="/codes">Codes</a><a href="/tools">Tools</a><a href="/safety">Safety</a>
      </nav>
      <a class="submit-link" href="/creators">Submit Game</a>
    </header>
    <main class="detail-shell" id="game-detail">${gameDetail(game)}
    </main>
    <footer class="site-footer">
      <strong>BlockRadar</strong>
      <span><a href="/parents">Parents</a> &middot; <a href="/about">About</a> &middot; Independent Roblox discovery concept. Not affiliated with Roblox Corporation.</span>
    </footer>
  </body>
</html>
`;
}

function canonicalPath(relativePath) {
  if (relativePath === "index.html") return "/";
  return `/${relativePath.replaceAll("\\", "/").replace(/\.html$/i, "")}`;
}

function normalizeInternalLinks(html, relativePath) {
  return html.replace(/href=(["'])([^"']+)\1/gi, (match, quote, href) => {
    if (/^(?:[a-z]+:|#|\/\/)/i.test(href)) return match;
    const splitAt = href.search(/[?#]/);
    const target = splitAt === -1 ? href : href.slice(0, splitAt);
    const suffix = splitAt === -1 ? "" : href.slice(splitAt);
    if (!target.toLowerCase().endsWith(".html")) return match;
    const resolved = path.posix.normalize(
      path.posix.join(path.posix.dirname(relativePath.replaceAll("\\", "/")), target)
    );
    return `href=${quote}${canonicalPath(resolved)}${suffix}${quote}`;
  });
}

function ensureToolsNavigation(html) {
  return html.replace(/<nav class="nav"([^>]*)>([\s\S]*?)<\/nav>/i, (match, attributes, links) => {
    if (/href=["']\/tools["']/.test(links)) return match;
    const nextLinks = links.replace(
      /(<a href=["']\/codes["']>Codes<\/a>)/,
      '$1<a href="/tools">Tools</a>'
    );
    return `<nav class="nav"${attributes}>${nextLinks}</nav>`;
  });
}

function updateHead(html, relativePath, noindex) {
  const canonical = `${baseUrl}${canonicalPath(relativePath)}`;
  let next = html
    .replace(/\s*<link\b[^>]*rel=["']canonical["'][^>]*\/?>/gi, "")
    .replace(/\s*<meta\b[^>]*name=["']robots["'][^>]*\/?>/gi, "");
  const tags = [
    `    <link rel="canonical" href="${canonical}" />`,
    noindex
      ? '    <meta name="robots" content="noindex,follow" />'
      : '    <meta name="robots" content="index,follow,max-image-preview:large" />'
  ].join("\n");
  return next.replace("</head>", `${tags}\n  </head>`);
}

const dataSource = await readFile(path.join(root, "data.js"), "utf8");
const browserWindow = {};
Function("window", `${dataSource}; return window;`)(browserWindow);
const games = browserWindow.blockRadarGames || [];

for (const game of games) {
  await writeFile(path.join(gamesRoot, `${game.id}.html`), gamePage(game));
}

const rootEntries = await readdir(root, { withFileTypes: true });
const rootHtmlFiles = rootEntries
  .filter((entry) => entry.isFile() && entry.name.endsWith(".html"))
  .map((entry) => entry.name)
  .filter((name) => name !== "google4c9c5b5cfa7f7a88.html");

for (const name of rootHtmlFiles) {
  const filePath = path.join(root, name);
  const html = await readFile(filePath, "utf8");
  await writeFile(
    filePath,
    updateHead(ensureToolsNavigation(normalizeInternalLinks(html, name)), name, noindexPages.has(name))
  );
}

const sitemapPath = path.join(root, "sitemap.xml");
const previousSitemap = await readFile(sitemapPath, "utf8").catch(() => "");
const previousLastmod = new Map(
  [...previousSitemap.matchAll(/<url>\s*<loc>([^<]+)<\/loc>(?:\s*<lastmod>([^<]+)<\/lastmod>)?\s*<\/url>/g)]
    .filter((match) => match[2])
    .map((match) => [match[1], match[2]])
);
const indexableRoot = rootHtmlFiles.filter((name) => !sitemapExcluded.has(name));
const relativeUrls = [
  "index.html",
  ...indexableRoot.filter((name) => name !== "index.html").sort(),
  ...games.map((game) => `games/${game.id}.html`).sort()
];

const sitemapRows = relativeUrls.map((relativePath) => {
  const loc = `${baseUrl}${canonicalPath(relativePath)}`;
  const isDynamic = relativePath === "index.html"
    || relativePath === "games.html"
    || relativePath === "rankings.html"
    || relativePath === "most-played-roblox-games-today.html"
    || relativePath.startsWith("games/");
  const lastmod = isDynamic ? today : (previousLastmod.get(loc) || today);
  return `  <url><loc>${loc}</loc><lastmod>${lastmod}</lastmod></url>`;
});

await writeFile(
  sitemapPath,
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapRows.join("\n")}\n</urlset>\n`
);

console.log(`Built ${games.length} static game pages and a ${relativeUrls.length}-URL sitemap.`);
