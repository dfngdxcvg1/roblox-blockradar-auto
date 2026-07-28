import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve("outputs/roblox-portal");
const dataSource = await readFile(path.join(root, "data.js"), "utf8");
const browserWindow = {};
Function("window", `${dataSource}; return window;`)(browserWindow);
const games = browserWindow.blockRadarGames || [];

function decode(value) {
  return String(value || "")
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&middot;", " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function pageType(pathname) {
  if (["/tools", "/search", "/dashboard"].includes(pathname) || /(?:calculator|values|finder|checklist)$/.test(pathname)) return "Tool";
  if (pathname.includes("codes")) return "Codes";
  if (/safe|safety|parent|scam/.test(pathname)) return "Safety";
  if (/rank|most-played|best-roblox/.test(pathname)) return "Ranking";
  return "Guide";
}

const index = games.map((game) => ({
  type: "Game",
  title: game.name,
  url: game.page,
  description: game.summary,
  image: game.image,
  keywords: [game.category, game.age, game.codes, game.bestFor, game.spend, game.scareLevel, ...(game.similar || [])].join(" "),
  freshness: game.updatedAt || game.chartUpdatedAt || null,
  popularity: game.officialRank ? Math.max(1, 120 - game.officialRank) : 20
}));

const sitemap = await readFile(path.join(root, "sitemap.xml"), "utf8");
const urls = [...sitemap.matchAll(/<loc>https:\/\/roblox\.pingdou123\.uk([^<]*)<\/loc>/g)]
  .map((match) => match[1] || "/")
  .filter((pathname) => pathname !== "/" && !pathname.startsWith("/games/"));

for (const pathname of urls) {
  const html = await readFile(path.join(root, `${pathname.slice(1)}.html`), "utf8");
  const title = decode(html.match(/<title>([\s\S]*?)<\/title>/i)?.[1]).replace(/\s+-\s+BlockRadar$/i, "");
  const description = decode(
    html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i)?.[1]
      || html.match(/<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["']/i)?.[1]
      || ""
  );
  const h1 = decode(html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1]);
  const type = pageType(pathname);
  index.push({
    type,
    title: h1 || title,
    url: pathname,
    description,
    image: null,
    keywords: `${title} ${description} ${type}`,
    freshness: html.match(/dateModified["']?\s*:\s*["'](\d{4}-\d{2}-\d{2})/i)?.[1] || null,
    popularity: type === "Tool" ? 100 : type === "Codes" ? 90 : 40
  });
}

await writeFile(path.join(root, "search-index.js"), `window.blockRadarSearchIndex = ${JSON.stringify(index, null, 2)};\n`);
console.log(`Built a ${index.length}-item BlockRadar search index.`);
