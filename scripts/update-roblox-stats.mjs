import { mkdir, readFile, writeFile } from "node:fs/promises";

const dataPath = "outputs/roblox-portal/data.js";
const reportPath = "work/roblox-auto-update-report.json";
const markerStart = "/* AUTO_STATS_START */";
const markerEnd = "/* AUTO_STATS_END */";

const dataSource = await readFile(dataPath, "utf8");
const window = {};
Function("window", `${dataSource}; return window;`)(window);

const games = window.blockRadarGames || [];
const meta = window.blockRadarGameMeta || {};

async function getJson(url) {
  const response = await fetch(url, {
    headers: {
      "accept": "application/json",
      "user-agent": "BlockRadarBot/1.0 (+https://roblox.pingdou123.uk/)"
    }
  });
  if (!response.ok) {
    throw new Error(`${response.status} ${url}`);
  }
  return response.json();
}

async function resolveUniverseId(placeId) {
  const json = await getJson(`https://apis.roblox.com/universes/v1/places/${placeId}/universe`);
  return String(json.universeId);
}

const resolved = [];
for (const game of games) {
  const placeId = meta[game.id]?.placeId;
  if (!placeId) continue;
  try {
    const universeId = meta[game.id]?.universeId || await resolveUniverseId(placeId);
    resolved.push({ game, placeId: String(placeId), universeId });
  } catch (error) {
    resolved.push({ game, placeId: String(placeId), error: error.message });
  }
}

const byUniverse = new Map();
const validUniverseIds = resolved.filter((item) => item.universeId).map((item) => item.universeId);

for (let i = 0; i < validUniverseIds.length; i += 50) {
  const chunk = validUniverseIds.slice(i, i + 50);
  const details = await getJson(`https://games.roblox.com/v1/games?universeIds=${chunk.join(",")}`);
  for (const item of details.data || []) {
    byUniverse.set(String(item.id), item);
  }

  const votes = await getJson(`https://games.roblox.com/v1/games/votes?universeIds=${chunk.join(",")}`);
  for (const item of votes.data || []) {
    byUniverse.set(String(item.id), { ...(byUniverse.get(String(item.id)) || {}), votes: item });
  }
}

function compactNumber(value) {
  const number = Number(value || 0);
  return new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(number);
}

function likeRatio(votes) {
  const up = Number(votes?.upVotes || 0);
  const down = Number(votes?.downVotes || 0);
  const total = up + down;
  return total ? Math.round((up / total) * 100) : null;
}

const now = new Date().toISOString();
const stats = {};
const updated = [];

for (const item of resolved) {
  const details = byUniverse.get(item.universeId);
  if (!details) continue;
  const ratio = likeRatio(details.votes);
  stats[item.game.id] = {
    placeId: item.placeId,
    universeId: item.universeId,
    playing: details.playing || 0,
    visits: details.visits || 0,
    favorites: details.favoritedCount || 0,
    likeRatio: ratio,
    updatedAt: now,
    liveLabel: `${compactNumber(details.playing)} playing`,
    visitsLabel: `${compactNumber(details.visits)} visits`,
    favoritesLabel: `${compactNumber(details.favoritedCount)} favorites`,
    ratingLabel: ratio == null ? "Rating unavailable" : `${ratio}% like ratio`
  };
  updated.push({
    id: item.game.id,
    name: item.game.name,
    playing: details.playing || 0,
    visits: details.visits || 0,
    likeRatio: ratio
  });
}

const statsBlock = `${markerStart}
window.blockRadarStats = ${JSON.stringify(stats, null, 2)};
window.blockRadarGames.forEach((game) => {
  const stats = window.blockRadarStats?.[game.id];
  if (stats) Object.assign(game, stats);
});
${markerEnd}`;

const markerPattern = new RegExp(`${markerStart.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}[\\s\\S]*?${markerEnd.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`);
const nextSource = markerPattern.test(dataSource)
  ? dataSource.replace(markerPattern, statsBlock)
  : `${dataSource.trim()}\n\n${statsBlock}\n`;

await writeFile(dataPath, nextSource);
await mkdir("work", { recursive: true });
await writeFile(reportPath, JSON.stringify({ updatedAt: now, updatedCount: updated.length, updated }, null, 2));

console.log(`Updated Roblox stats for ${updated.length} games.`);
