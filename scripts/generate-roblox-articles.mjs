import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";

const dataPath = "outputs/roblox-portal/data.js";
const root = "outputs/roblox-portal";
const articleDir = `${root}/daily`;
const manifestPath = "work/roblox-articles.json";
const reportPath = "work/roblox-article-report.json";
const sitemapPath = `${root}/sitemap.xml`;
const indexPath = `${root}/daily-roblox-guides.html`;
const baseUrl = "https://roblox.pingdou123.uk";
const limit = Number(process.env.DAILY_ARTICLE_LIMIT || 20);

const dataSource = await readFile(dataPath, "utf8");
const window = {};
Function("window", `${dataSource}; return window;`)(window);

const games = window.blockRadarGames || [];
const now = new Date();
const day = now.toISOString().slice(0, 10);
const manifest = existsSync(manifestPath) ? JSON.parse(await readFile(manifestPath, "utf8")) : [];

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 86);
}

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function moneyRisk(game) {
  const spend = String(game.spend || "").toLowerCase();
  if (spend.includes("high")) return "high";
  if (spend.includes("medium")) return "medium";
  return "low";
}

function pickGames(seed, count = 5) {
  return [...games]
    .sort((a, b) => {
      const av = ((a.playing || 0) + (a.visits || 0) / 1000000 + a.name.length * seed) % 997;
      const bv = ((b.playing || 0) + (b.visits || 0) / 1000000 + b.name.length * seed) % 997;
      return bv - av;
    })
    .slice(0, count);
}

const themes = [
  {
    key: "play-now",
    title: "Best Roblox Games to Play Today",
    intent: "players who want a fast recommendation",
    intro: "This daily guide highlights Roblox games that are easy to choose right now, with live activity, safety context, and quick-start notes.",
  },
  {
    key: "friends",
    title: "Best Roblox Games to Play With Friends Today",
    intent: "friend groups looking for a shared session",
    intro: "Friend sessions work best when a game creates quick decisions, callouts, or social moments without forcing everyone into a long grind.",
  },
  {
    key: "safe-kids",
    title: "Safer Roblox Games for Kids Today",
    intent: "parents and younger players",
    intro: "These picks favor clearer goals, lower scare pressure, and easier parent review before joining a public server.",
  },
  {
    key: "without-robux",
    title: "Roblox Games That Are Fun Without Robux Today",
    intent: "free players",
    intro: "A good free-player game should be enjoyable before passes, boosts, trading, or paid cosmetics become part of the decision.",
  },
  {
    key: "mobile",
    title: "Best Roblox Games for Mobile Today",
    intent: "phone and tablet players",
    intro: "Mobile picks need readable controls, short sessions, and goals that do not require perfect keyboard movement.",
  },
  {
    key: "roleplay",
    title: "Best Roblox Roleplay Games Today",
    intent: "players who want houses, jobs, pets, towns, or social stories",
    intro: "Roleplay games are strongest when players can create goals quickly while keeping chat and privacy settings under control.",
  },
  {
    key: "simulator",
    title: "Best Roblox Simulator Games Today",
    intent: "players who like collecting, upgrades, codes, and long-term progress",
    intro: "Simulator games should make progress readable and fair enough for a first free session before spending Robux.",
  },
  {
    key: "bored",
    title: "Roblox Games to Play When Bored Today",
    intent: "players who need a quick idea",
    intro: "When players are bored, the best choice is a game with a fast start, clear rules, and a reason to play one more round.",
  },
  {
    key: "beginners",
    title: "Best Roblox Games for Beginners Today",
    intent: "new Roblox players",
    intro: "Beginner-friendly games explain themselves quickly and avoid punishing players for not knowing codes, trading, or advanced movement.",
  },
  {
    key: "spending-risk",
    title: "Roblox Spending Risk Watchlist Today",
    intent: "parents checking Robux pressure",
    intro: "This watchlist looks at spending pressure, trading exposure, and whether a game is still worth trying for free.",
  }
];

function buildArticle(theme, index) {
  const picks = pickGames(index + theme.key.length, 5);
  const lead = picks[0];
  const title = `${theme.title}: ${lead.name}, ${picks[1].name}, and More`;
  const slug = `${day}-${slugify(theme.key)}-${slugify(lead.name)}-${index + 1}`;
  const href = `daily/${slug}.html`;
  const description = `${theme.title} with BlockRadar picks, live player context, safety notes, spending pressure, and quick-start advice.`;
  const bodyItems = picks.map((game, gameIndex) => {
    const live = game.liveLabel || `${game.playing || 0} playing`;
    const risk = moneyRisk(game);
    return `<li><strong><a href="../${game.page}">${escapeHtml(game.name)}</a></strong><span>${escapeHtml(game.category)} - ${escapeHtml(live)} - spending pressure: ${risk} - safety score: ${escapeHtml(game.safety)}</span><p>${escapeHtml(game.bestFor || game.summary)}</p></li>`;
  }).join("");

  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(title)} - BlockRadar</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <link rel="stylesheet" href="../styles.css" />
    <script src="../ads.js" defer></script>
  </head>
  <body>
    <header class="site-header"><a class="brand" href="../index.html"><span class="brand-mark">BR</span><span>BlockRadar</span></a><nav class="nav"><a href="../games.html">Games</a><a href="../rankings.html">Rankings</a><a href="../guides.html">Guides</a><a href="../codes.html">Codes</a><a href="../safety.html">Safety</a><a href="../creators.html">Creators</a></nav><a class="submit-link" href="../creators.html">Submit Game</a></header>
    <main class="article-shell">
      <article class="long-article">
        <p class="eyebrow">Daily Roblox Guide - ${day}</p>
        <h1>${escapeHtml(title)}</h1>
        <p class="lead">${escapeHtml(theme.intro)} It is written for ${escapeHtml(theme.intent)} and uses the latest BlockRadar game data available during the daily update.</p>
        <h2>Today's short list</h2>
        <ol>${bodyItems}</ol>
        <h2>How to choose from this list</h2>
        <p>Start with the game that matches the session: quick rounds for short breaks, roleplay for relaxed friend time, and lower spending pressure for younger players. If a game includes trading, giveaways, or paid boosts, read the safety notes before joining a public server.</p>
        <h2>Parent and player checks</h2>
        <ul>
          <li>Review chat and privacy settings before younger players join public servers.</li>
          <li>Avoid free Robux claims, trust trades, and outside-link invitations.</li>
          <li>Try one free session before buying passes, boosts, or cosmetics.</li>
        </ul>
      </article>
    </main>
    <footer class="site-footer"><strong>BlockRadar</strong><span><a href="../parents.html">Parents</a> · <a href="../about.html">About</a> · Independent Roblox discovery concept.</span></footer>
  </body>
</html>
`;
  return { day, title, href, description, slug, html };
}

function buildIndex(entries) {
  const latest = entries.slice(-120).reverse();
  const cards = latest.map((item) => `<article><span class="tag">${escapeHtml(item.day)}</span><h2>${escapeHtml(item.title)}</h2><p>${escapeHtml(item.description)}</p><a class="card-link" href="${escapeHtml(item.href)}">Read guide</a></article>`).join("\n        ");
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Daily Roblox Guides - BlockRadar</title>
    <meta name="description" content="Daily Roblox game guides with fresh player picks, safety notes, spending risk checks, and friend-friendly recommendations." />
    <link rel="stylesheet" href="styles.css" />
    <script src="ads.js" defer></script>
  </head>
  <body>
    <header class="site-header"><a class="brand" href="index.html"><span class="brand-mark">BR</span><span>BlockRadar</span></a><nav class="nav"><a href="games.html">Games</a><a href="rankings.html">Rankings</a><a href="guides.html">Guides</a><a href="codes.html">Codes</a><a href="safety.html">Safety</a><a href="creators.html">Creators</a></nav><a class="submit-link" href="creators.html">Submit Game</a></header>
    <main class="page-shell">
      <section class="page-title">
        <p class="eyebrow">Daily Guides</p>
        <h1>Fresh Roblox guides generated from live BlockRadar data.</h1>
        <p>Use these pages for quick daily choices, friend sessions, safe starts, no-Robux picks, mobile play, and spending-risk checks.</p>
      </section>
      <section class="article-grid">
        ${cards}
      </section>
    </main>
    <footer class="site-footer"><strong>BlockRadar</strong><span><a href="parents.html">Parents</a> · <a href="about.html">About</a> · Independent Roblox discovery concept.</span></footer>
  </body>
</html>
`;
}

function updateSitemap(source, entries) {
  let next = source.trim().replace("</urlset>", "");
  for (const entry of entries) {
    const loc = `${baseUrl}/${entry.href}`;
    if (!next.includes(`<loc>${loc}</loc>`)) {
      next += `\n  <url><loc>${loc}</loc></url>`;
    }
  }
  const indexLoc = `${baseUrl}/daily-roblox-guides.html`;
  if (!next.includes(`<loc>${indexLoc}</loc>`)) {
    next += `\n  <url><loc>${indexLoc}</loc></url>`;
  }
  return `${next}\n</urlset>\n`;
}

await mkdir(articleDir, { recursive: true });
await mkdir("work", { recursive: true });

const alreadyToday = manifest.filter((item) => item.day === day);
const created = [];

if (alreadyToday.length === 0) {
  for (let i = 0; i < limit; i += 1) {
    const theme = themes[i % themes.length];
    const article = buildArticle(theme, i);
    await writeFile(`${root}/${article.href}`, article.html);
    created.push({
      day: article.day,
      title: article.title,
      href: article.href,
      description: article.description
    });
  }
}

const nextManifest = [...manifest, ...created];
await writeFile(manifestPath, JSON.stringify(nextManifest, null, 2));
await writeFile(indexPath, buildIndex(nextManifest));

const sitemap = await readFile(sitemapPath, "utf8");
await writeFile(sitemapPath, updateSitemap(sitemap, created));

await writeFile(reportPath, JSON.stringify({
  updatedAt: now.toISOString(),
  day,
  requestedLimit: limit,
  added: created.length,
  totalArticles: nextManifest.length,
  addedArticles: created.map((item) => ({ title: item.title, href: item.href }))
}, null, 2));

console.log(`Generated ${created.length} Roblox articles for ${day}. Total articles: ${nextManifest.length}.`);
