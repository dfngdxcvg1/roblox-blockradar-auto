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
if (sitemapUrls.length < 50 || sitemapUrls.length > 80) {
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

if (errors.length) {
  console.error(errors.join("\n"));
  process.exitCode = 1;
} else {
  console.log(`SEO check passed: ${htmlFiles.length} HTML pages checked, ${sitemapUrls.length} URLs in sitemap.`);
}
