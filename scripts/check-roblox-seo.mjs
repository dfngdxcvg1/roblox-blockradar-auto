import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve("outputs/roblox-portal");
const baseUrl = "https://roblox.pingdou123.uk";
const errors = [];
const noindexPages = new Set([
  "daily-roblox-guides.html",
  "editorial-plan.html",
  "game.html"
]);
const requiredTools = [
  "tools.html",
  "blox-fruits-value-calculator.html",
  "mm2-values.html",
  "fish-it-rod-finder.html",
  "99-nights-survival-checklist.html"
];
const growthPagePatterns = [
  /-codes-not-expired\.html$/,
  /-beginner-guide\.html$/,
  /^is-(?:grow-a-garden-2|99-nights-in-the-forest|rivals|steal-a-brainrot|fish-it|anime-expeditions)-safe-for-kids\.html$/,
  /(?:best-seeds-and-upgrades|best-classes-and-upgrades|rivals-best-weapons|best-brainrots-and-values|fish-it-best-rods|best-units-and-team-roles)\.html$/,
  /(?:night-stealing-and-garden-secrets|map-and-survival-route|rivals-maps-and-positioning|base-defense-secrets|locations-and-fishing-route|progression-and-secrets)\.html$/
];

function canonicalPath(relativePath) {
  if (relativePath === "index.html") return "/";
  return `/${relativePath.replaceAll("\\", "/").replace(/\.html$/i, "")}`;
}

function visibleText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z0-9#]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const rootFiles = (await readdir(root, { withFileTypes: true }))
  .filter((entry) => entry.isFile() && entry.name.endsWith(".html"))
  .map((entry) => entry.name)
  .filter((name) => name !== "google4c9c5b5cfa7f7a88.html");
const gameFiles = (await readdir(path.join(root, "games")))
  .filter((name) => name.endsWith(".html"))
  .map((name) => `games/${name}`);
const htmlFiles = [...rootFiles, ...gameFiles];

for (const relativePath of htmlFiles) {
  const html = await readFile(path.join(root, relativePath), "utf8");
  const expectedCanonical = `${baseUrl}${canonicalPath(relativePath)}`;
  const canonicalMatches = [...html.matchAll(/<link\b[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["'][^>]*>/gi)];
  if (canonicalMatches.length !== 1 || canonicalMatches[0][1] !== expectedCanonical) {
    errors.push(`${relativePath}: expected one canonical ${expectedCanonical}`);
  }

  if (noindexPages.has(relativePath)) {
    if (!/<meta\b[^>]*name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(html)) {
      errors.push(`${relativePath}: expected noindex`);
    }
  } else if (!/<meta\b[^>]*name=["']robots["'][^>]*content=["'][^"']*index,follow/i.test(html)) {
    errors.push(`${relativePath}: expected index,follow`);
  }

  if (relativePath.startsWith("games/")) {
    const main = html.match(/<main\b[^>]*id=["']game-detail["'][^>]*>([\s\S]*?)<\/main>/i)?.[1] || "";
    if (!/<h1\b/i.test(main)) errors.push(`${relativePath}: missing static H1`);
    if (visibleText(main).length < 900) errors.push(`${relativePath}: static detail content is too thin`);
    if (main.includes("asset-thumbnail/image")) errors.push(`${relativePath}: uses retired Roblox thumbnail endpoint`);
  }

  if (growthPagePatterns.some((pattern) => pattern.test(relativePath))) {
    const main = html.match(/<main\b[^>]*class=["'][^"']*article-shell[^"']*["'][^>]*>([\s\S]*?)<\/main>/i)?.[1] || "";
    if (!/<h1\b/i.test(main)) errors.push(`${relativePath}: missing article H1`);
    if (visibleText(main).length < 1800) errors.push(`${relativePath}: focused guide content is too thin`);
    if (!/data-feedback-scope=["']guide:/.test(main)) errors.push(`${relativePath}: missing guide feedback controls`);
    if (!/Sources and update policy/.test(main)) errors.push(`${relativePath}: missing source policy`);
  }

  const internalHtmlLinks = [...html.matchAll(/href=["']([^"']*\.html(?:[?#][^"']*)?)["']/gi)]
    .map((match) => match[1])
    .filter((href) => !/^(?:https?:)?\/\//i.test(href));
  if (internalHtmlLinks.length) {
    errors.push(`${relativePath}: internal .html links remain (${internalHtmlLinks.slice(0, 3).join(", ")})`);
  }
}

const sitemap = await readFile(path.join(root, "sitemap.xml"), "utf8");
const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
if (sitemapUrls.some((url) => url.includes("/daily/") || url.endsWith("/daily-roblox-guides.html"))) {
  errors.push("sitemap.xml: daily URLs must not be indexable");
}
if (sitemapUrls.length < 100 || sitemapUrls.length > 180) {
  errors.push(`sitemap.xml: unexpected URL count ${sitemapUrls.length}`);
}
if ((sitemap.match(/<lastmod>/g) || []).length !== sitemapUrls.length) {
  errors.push("sitemap.xml: every URL must include lastmod");
}
if (sitemapUrls.some((url) => new URL(url).pathname.endsWith(".html"))) {
  errors.push("sitemap.xml: canonical URLs must not use .html");
}

for (const url of sitemapUrls) {
  const pathname = new URL(url).pathname;
  const relativePath = pathname === "/" ? "index.html" : `${pathname.slice(1)}.html`;
  try {
    await readFile(path.join(root, relativePath));
  } catch {
    errors.push(`sitemap.xml: missing local file for ${url}`);
  }
}

const growthPages = rootFiles.filter((file) => growthPagePatterns.some((pattern) => pattern.test(file)));
if (growthPages.length !== 30) {
  errors.push(`growth guides: expected 30 pages, found ${growthPages.length}`);
}

for (const tool of requiredTools) {
  if (!rootFiles.includes(tool)) errors.push(`tools: missing ${tool}`);
}

const dataSource = await readFile(path.join(root, "data.js"), "utf8");
const codesSource = await readFile(path.join(root, "codes-data.js"), "utf8");
const browserWindow = {};
Function("window", `${dataSource}\n${codesSource}; return window;`)(browserWindow);
if ((browserWindow.blockRadarGames || []).length < 35) {
  errors.push(`game library: expected at least 35 games, found ${(browserWindow.blockRadarGames || []).length}`);
}
if ((browserWindow.blockRadarCodeGroups || []).length < 12) {
  errors.push(`codes tracker: expected at least 12 games, found ${(browserWindow.blockRadarCodeGroups || []).length}`);
}
if (!(browserWindow.blockRadarTrending?.games || []).length) {
  errors.push("official chart: no Top Playing Now snapshot found");
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exitCode = 1;
} else {
  console.log(`SEO check passed: ${htmlFiles.length} HTML pages checked, ${sitemapUrls.length} URLs in sitemap.`);
}
