import { mkdir, readFile, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";

const dataPath = "outputs/roblox-portal/data.js";
const reportPath = "work/roblox-trending-report.json";
const markerStart = "/* AUTO_TRENDING_START */";
const markerEnd = "/* AUTO_TRENDING_END */";
const chartUrl = new URL("https://apis.roblox.com/explore-api/v1/get-sorts");
const dataSource = await readFile(dataPath, "utf8");
const browserWindow = {};
Function("window", `${dataSource}; return window;`)(browserWindow);

chartUrl.searchParams.set("sessionId", randomUUID());
chartUrl.searchParams.set("device", "computer");
chartUrl.searchParams.set("country", "all");

async function getChart() {
  let lastError;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetch(chartUrl, {
        headers: {
          accept: "application/json",
          origin: "https://www.roblox.com",
          referer: "https://www.roblox.com/charts",
          "user-agent": "Mozilla/5.0 BlockRadarBot/1.0"
        },
        signal: AbortSignal.timeout(20000)
      });
      if (!response.ok) throw new Error(`Roblox chart request failed with ${response.status}`);
      const payload = await response.json();
      const chart = (payload.sorts || []).find((sort) => sort.sortId === "top-playing-now");
      if (!chart?.games?.length) throw new Error("Roblox Top Playing Now chart was missing from the response");
      return chart;
    } catch (error) {
      lastError = error;
      if (attempt < 3) await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
    }
  }
  throw lastError;
}

let chart;
try {
  chart = await getChart();
} catch (error) {
  const previous = browserWindow.blockRadarTrending;
  if (!previous?.games?.length) throw error;
  await mkdir("work", { recursive: true });
  await writeFile(
    reportPath,
    JSON.stringify(
      {
        checkedAt: new Date().toISOString(),
        stale: true,
        lastSuccessfulAt: previous.updatedAt,
        error: error.message,
        chartCount: previous.games.length
      },
      null,
      2
    )
  );
  console.warn(`Official chart refresh failed; kept ${previous.updatedAt} snapshot: ${error.message}`);
  process.exit(0);
}

const games = browserWindow.blockRadarGames || [];
const meta = browserWindow.blockRadarGameMeta || {};
const gameByUniverse = new Map(
  games
    .map((game) => [String(meta[game.id]?.universeId || browserWindow.blockRadarStats?.[game.id]?.universeId || ""), game])
    .filter(([universeId]) => universeId)
);
const updatedAt = new Date().toISOString();
const rankedGames = chart.games.map((item, index) => {
  const known = gameByUniverse.get(String(item.universeId));
  return {
    rank: index + 1,
    universeId: String(item.universeId),
    placeId: String(item.rootPlaceId),
    name: item.name,
    playerCount: Number(item.playerCount || 0),
    maturity: item.ageRecommendationDisplayName || "Not supplied",
    genre: item.genreL1 || "Not supplied",
    trackedSlug: known?.id || null
  };
});

const snapshot = {
  updatedAt,
  sourceLabel: chart.sortDisplayName || "Roblox Top Playing Now",
  sourceNote: chart.topicLayoutData?.infoText || "Top experiences sorted by concurrent users.",
  games: rankedGames
};
const assignment = `
window.blockRadarGames.forEach((game) => {
  const chartGame = window.blockRadarTrending.games.find((item) => item.trackedSlug === game.id);
  game.officialRank = chartGame?.rank || null;
  game.chartPlayers = chartGame?.playerCount || null;
  game.chartUpdatedAt = window.blockRadarTrending.updatedAt;
});`;
const trendingBlock = `${markerStart}
window.blockRadarTrending = ${JSON.stringify(snapshot, null, 2)};${assignment}
${markerEnd}`;
const markerPattern = new RegExp(
  `${markerStart.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}[\\s\\S]*?${markerEnd.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`
);
const nextSource = markerPattern.test(dataSource)
  ? dataSource.replace(markerPattern, trendingBlock)
  : `${dataSource.trim()}\n\n${trendingBlock}\n`;

await writeFile(dataPath, nextSource);
await mkdir("work", { recursive: true });
await writeFile(
  reportPath,
  JSON.stringify(
    {
      updatedAt,
      source: "Roblox Top Playing Now",
      chartCount: rankedGames.length,
      matchedCount: rankedGames.filter((game) => game.trackedSlug).length,
      rankedGames
    },
    null,
    2
  )
);

console.log(
  `Updated official chart snapshot: ${rankedGames.length} chart games, ${rankedGames.filter((game) => game.trackedSlug).length} matched.`
);
