import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve("outputs/roblox-portal");
const baseUrl = "https://roblox.pingdou123.uk";
const reviewedIso = "2026-07-29";
const reviewed = "July 29, 2026";

const dataSource = await readFile(path.join(root, "data.js"), "utf8");
const codesSource = await readFile(path.join(root, "codes-data.js"), "utf8");
const browserWindow = {};
Function("window", `${dataSource}\n${codesSource}; return window;`)(browserWindow);
const games = browserWindow.blockRadarGames || [];
const codeGroups = browserWindow.blockRadarCodeGroups || [];

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function cleanOutput(value) {
  return `${String(value).replace(/[ \t]+$/gm, "").trimEnd()}\n`;
}

function gameById(id) {
  const game = games.find((item) => item.id === id);
  if (!game) throw new Error(`Missing game data for ${id}`);
  return game;
}

function list(items, className = "") {
  return `<ul${className ? ` class="${className}"` : ""}>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
}

function steps(items) {
  return `<div class="answer-steps">${items.map((item, index) => `
    <article class="answer-step"><span>${index + 1}</span><p>${escapeHtml(item)}</p></article>`).join("")}
  </div>`;
}

function pairs(items) {
  return `<div class="answer-grid">${items.map(([title, detail]) => `
    <article class="answer-card"><h3>${escapeHtml(title)}</h3><p>${escapeHtml(detail)}</p></article>`).join("")}
  </div>`;
}

function nav() {
  return '<a href="/games">Games</a><a href="/updates">Updates</a><a href="/rankings">Rankings</a><a href="/guides">Guides</a><a href="/codes">Codes</a><a href="/tools">Tools</a><a href="/search">Search</a><a href="/dashboard">My Radar</a>';
}

function structuredArticle({ title, description, canonical, image, modified = reviewedIso }) {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    datePublished: reviewedIso,
    dateModified: modified,
    mainEntityOfPage: canonical,
    image,
    author: { "@type": "Organization", name: "BlockRadar Editorial" },
    publisher: { "@type": "Organization", name: "BlockRadar" }
  }).replaceAll("<", "\\u003c");
}

function answerPage(definition) {
  const game = gameById(definition.gameId);
  const canonical = `${baseUrl}/${definition.slug}`;
  const schema = structuredArticle({
    title: definition.title,
    description: definition.description,
    canonical,
    image: game.image
  });
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(definition.title)} - BlockRadar</title>
    <meta name="description" content="${escapeHtml(definition.description)}" />
    <meta property="og:type" content="article" />
    <meta property="og:title" content="${escapeHtml(definition.title)}" />
    <meta property="og:description" content="${escapeHtml(definition.description)}" />
    <meta property="og:url" content="${canonical}" />
    <meta property="og:image" content="${escapeHtml(game.image)}" />
    <link rel="stylesheet" href="styles.css" />
    <script type="application/ld+json">${schema}</script>
    <script src="freshness.js" defer></script>
    <script src="feedback.js" defer></script>
    <script src="ads.js" defer></script>
  </head>
  <body>
    <header class="site-header">
      <a class="brand" href="/"><span class="brand-mark">BR</span><span>BlockRadar</span></a>
      <nav class="nav" aria-label="Primary navigation">${nav()}</nav>
      <a class="submit-link" href="/games/${escapeHtml(game.id)}">Game hub</a>
    </header>
    <main class="article-shell">
      <nav class="breadcrumb" aria-label="Breadcrumb"><a href="/">Home</a><span>/</span><a href="/guides">Guides</a><span>/</span><strong>${escapeHtml(game.name)}</strong></nav>
      <header class="guide-article-header">
        <div>
          <p class="eyebrow">${escapeHtml(definition.eyebrow)} &middot; Reviewed ${reviewed}</p>
          <span data-freshness-date="${reviewedIso}" data-fresh-days="14" data-warning-days="45">Reviewed ${reviewed}</span>
          <h1>${escapeHtml(definition.title)}</h1>
          <p>${escapeHtml(definition.description)}</p>
        </div>
        <img src="${escapeHtml(game.image)}" alt="${escapeHtml(game.name)} official Roblox thumbnail" />
      </header>
      <section class="direct-answer"><strong>Short answer</strong><p>${escapeHtml(definition.directAnswer)}</p></section>
      <article class="guide-article">
        <section><h2>${escapeHtml(definition.stepsTitle)}</h2>${steps(definition.steps)}</section>
        <section><h2>Checkpoints before you continue</h2>${pairs(definition.checkpoints)}</section>
        <section><h2>What usually goes wrong</h2>${list(definition.mistakes, "mistake-list")}</section>
        <section><h2>Use the answer after an update</h2><p>${escapeHtml(definition.updateNote)}</p></section>
        <section>
          <h2>Sources and update policy</h2>
          <p>BlockRadar reviewed the official experience and the supporting references below on ${reviewed}. Exact prices, requirements, balance, and event rules can change. The in-game screen is the final authority for the current server version.</p>
          <ul class="source-list">${definition.sources.map(([label, href]) => `<li><a href="${escapeHtml(href)}" target="_blank" rel="noopener">${escapeHtml(label)}</a></li>`).join("")}</ul>
        </section>
      </article>
      <section class="feedback-panel article-feedback" data-feedback-scope="guide:${escapeHtml(definition.slug)}">
        <p class="eyebrow">Community correction</p><h2>Did this answer solve the problem?</h2>
        <div class="feedback-actions"><button type="button" data-feedback-value="helpful" aria-pressed="false">Helpful</button><button type="button" data-feedback-value="not-helpful" aria-pressed="false">Not helpful</button><button type="button" data-feedback-value="outdated" aria-pressed="false">Report outdated</button></div>
        <small data-feedback-status>Choose one answer. No account is required.</small>
      </section>
      <nav class="article-next"><a href="/games/${escapeHtml(game.id)}">Open ${escapeHtml(game.name)} hub</a><a href="/codes?game=${escapeHtml(game.id)}">Check codes</a><a href="/guides">More answers</a></nav>
    </main>
    <footer class="site-footer"><strong>BlockRadar</strong><span>Independent Roblox guides. Not affiliated with Roblox Corporation.</span></footer>
  </body>
</html>`;
}

const answerDefinitions = [
  {
    gameId: "blox-fruits",
    slug: "blox-fruits-how-to-reach-second-sea",
    title: "How to reach Second Sea in Blox Fruits",
    description: "The exact Second Sea unlock route in Blox Fruits, including the level requirement, Military Detective quest, Ice Admiral, and Experienced Captain.",
    eyebrow: "Progression answer",
    directAnswer: "Reach level 700, speak to the Military Detective at Prison, use his key to open the Ice Admiral room in Frozen Village, defeat the Ice Admiral, return to the Detective, then ask the Experienced Captain in Middle Town to take you to Second Sea.",
    stepsTitle: "Second Sea unlock route",
    steps: [
      "Reach level 700 in First Sea. The Military Detective progression does not unlock early, so finish the appropriate island quests instead of trying to skip the requirement.",
      "Travel to Prison and speak to the Military Detective. Accept the quest and keep the key he gives you.",
      "Go to Frozen Village, enter the cave, and use the key on the locked wooden door that leads to the Ice Admiral encounter.",
      "Defeat the Ice Admiral. Return to the Military Detective at Prison so the quest state is completed.",
      "Travel to Middle Town and speak to the Experienced Captain. Choose the travel option for Second Sea."
    ],
    checkpoints: [
      ["Level", "Your account must be level 700 or higher before this route becomes available."],
      ["Quest state", "The Military Detective must give the key before the Ice Admiral door is part of the progression route."],
      ["Boss credit", "Make sure the Ice Admiral defeat counts for your quest before leaving Frozen Village."],
      ["Travel NPC", "Use the Experienced Captain in Middle Town after reporting back to the Detective."]
    ],
    mistakes: [
      "Looking for the Experienced Captain before completing the Military Detective quest.",
      "Going to the wrong ice area or fighting a similarly named enemy instead of the Ice Admiral behind the locked door.",
      "Leaving immediately after the boss fight without returning to the Military Detective.",
      "Following a video that begins in Second Sea and skips the First Sea unlock requirement."
    ],
    updateNote: "If an update moves an NPC, keep the quest order intact: level requirement, Detective quest, keyed boss room, report back, then Captain travel. Report this page as outdated if the in-game dialogue changes.",
    sources: [
      ["Official Blox Fruits Roblox page", gameById("blox-fruits").officialUrl],
      ["Blox Fruits Wiki: Second Sea", "https://blox-fruits.fandom.com/wiki/Second_Sea"]
    ]
  },
  {
    gameId: "blox-fruits",
    slug: "blox-fruits-how-to-get-fragments",
    title: "How to get Fragments in Blox Fruits",
    description: "A practical Blox Fruits Fragment route using raids first, with preparation, reward checks, and ways to avoid wasting Beli or raid time.",
    eyebrow: "Currency answer",
    directAnswer: "Fragments become a normal progression currency in Second Sea. Raids are the most repeatable route for most players: prepare a build that can clear waves, enter a raid legally through the in-game system, finish as many islands as possible, and save Fragments for a named upgrade instead of spending them at random.",
    stepsTitle: "Build a repeatable Fragment route",
    steps: [
      "Unlock Second Sea first. A First Sea player should finish the level 700 travel quest before planning a Fragment farm.",
      "Choose a raid your current build can survive. Consistent clears produce more useful progress than joining content where every attempt fails early.",
      "Bring area damage, mobility, and enough survivability to keep moving between islands. A teammate who can carry a raid is useful, but never pay through an outside website.",
      "Complete the raid through the in-game timer and check the Fragment reward before spending anything.",
      "Set a target such as an awakening step, race change, or another confirmed in-game purchase, then stop farming when that target is funded."
    ],
    checkpoints: [
      ["Separate currency", "Fragments are not Beli. Check the correct counter before deciding that a reward is missing."],
      ["Clear consistency", "Track completed raids per session, not just attempts started."],
      ["Spending target", "Write down the exact in-game upgrade before using a scarce balance."],
      ["Account safety", "Fragment generators, paid carries on unknown sites, and password requests are scams."]
    ],
    mistakes: [
      "Buying or hosting a raid before the build can contribute to the clear.",
      "Spending Fragments on several unrelated systems and delaying the upgrade that would improve farming.",
      "Treating an old reward number from a video as guaranteed after a balance update.",
      "Giving account access to another player who promises to farm Fragments."
    ],
    updateNote: "Raid rewards and alternative Fragment sources can be balanced. Use this page for the route and safety checks, then confirm the current reward shown by the game before repeating a long farm.",
    sources: [
      ["Official Blox Fruits Roblox page", gameById("blox-fruits").officialUrl],
      ["Blox Fruits Wiki: Fragments", "https://blox-fruits.fandom.com/wiki/Fragments"]
    ]
  },
  {
    gameId: "blox-fruits",
    slug: "blox-fruits-best-fruits-for-grinding",
    title: "Best Blox Fruits for grinding",
    description: "Choose a Blox Fruit for leveling by survivability, travel, area damage, and current sea instead of trade hype or rarity alone.",
    eyebrow: "Build decision",
    directAnswer: "Buddha is the strongest general grinding choice when you can support its melee-focused play. Light is especially useful in First Sea because mobility and ranged area attacks shorten travel and quest loops. Ice offers control and easy hits, while Magma is a strong damage option when its current abilities match the content.",
    stepsTitle: "Choose by the problem you need to solve",
    steps: [
      "Use Buddha when staying alive, grouping enemies, and extending melee range are more important than fast travel.",
      "Use Light in First Sea when island travel and quick ranged quest clearing are the main time costs.",
      "Use Ice when control, simple combos, and keeping normal enemies in place make the route safer.",
      "Use Magma when damage and sea-event utility matter more than the easiest movement route.",
      "Keep a good grinding fruit until the next progression checkpoint. Replacing it for trade value or rarity can make leveling slower."
    ],
    checkpoints: [
      ["Current sea", "Travel has a larger effect on early routes; later content may reward survivability and build synergy more."],
      ["Stats", "A fruit cannot fix scattered stat points or an under-leveled supporting fighting style."],
      ["Awakening", "Compare the version you actually own, not a fully awakened showcase you cannot use yet."],
      ["Play style", "The best fruit is one you can clear with consistently without repeated deaths or missed attacks."]
    ],
    mistakes: [
      "Choosing the rarest fruit in a value list even when its moves are awkward for repeated NPC groups.",
      "Comparing an unawakened fruit with footage of a fully upgraded version.",
      "Switching fruits during a good leveling route and losing the build that made the route reliable.",
      "Ignoring travel time, energy use, cooldowns, and survivability when judging damage."
    ],
    updateNote: "Balance patches can change damage and cooldowns. Keep the decision tied to four stable needs: travel, area coverage, survivability, and the build you can use now.",
    sources: [
      ["Official Blox Fruits Roblox page", gameById("blox-fruits").officialUrl],
      ["Blox Fruits Wiki: Blox Fruits", "https://blox-fruits.fandom.com/wiki/Blox_Fruits"]
    ]
  },
  {
    gameId: "99-nights-in-the-forest",
    slug: "99-nights-in-the-forest-how-to-win",
    title: "How to win 99 Nights in the Forest",
    description: "A reliable 99 Nights survival plan covering fire, daylight objectives, rescued children, camp roles, night preparation, and recovery.",
    eyebrow: "Survival answer",
    directAnswer: "Winning is a resource schedule, not one long exploration run. Keep the campfire supplied, use daylight for one marked objective at a time, rescue children to improve progression, return before night pressure rises, and assign clear camp, wood, food, and search roles when playing with friends.",
    stepsTitle: "Use this day-and-night loop",
    steps: [
      "Stabilize the first campfire before taking a long route. Gather enough fuel and basic supplies for the next night, not only the current minute.",
      "During daylight, choose one objective: wood, food, a rescue, a structure, or a stronghold run. Mark the return path as you travel.",
      "Bring rescued children and useful loot back before starting another distant objective. Secured progress is worth more than an overloaded risky trip.",
      "Before darkness, regroup at camp, split healing and weapons, top up the fire reserve, and close any obvious defense gap.",
      "At night, stay on the agreed defensive plan. After each night, identify the one resource that nearly failed and make it the next daylight priority."
    ],
    checkpoints: [
      ["Fire reserve", "The camp should have enough fuel that one delayed teammate does not create an immediate failure."],
      ["Return route", "Every search needs visible landmarks and a planned turn-back time."],
      ["Team roles", "Wood, food, rescue, and defense responsibilities should be named before players scatter."],
      ["Recovery stock", "Keep healing or revival resources for a real emergency instead of consuming every item immediately."]
    ],
    mistakes: [
      "Sending the whole team on the same search while nobody maintains the camp.",
      "Starting a second objective after finding good loot instead of banking the first result.",
      "Using all fuel, food, or healing during a comfortable phase and entering the next night with no reserve.",
      "Extending a route because daylight still looks safe without accounting for the return journey."
    ],
    updateNote: "New biomes, classes, enemies, and events may change the best equipment, but the winning loop remains useful: secure camp, choose one daylight goal, bank progress, prepare early, then review the weakest resource.",
    sources: [
      ["Official 99 Nights in the Forest Roblox page", gameById("99-nights-in-the-forest").officialUrl],
      ["BlockRadar 99 Nights survival checklist", `${baseUrl}/99-nights-survival-checklist`]
    ]
  },
  {
    gameId: "99-nights-in-the-forest",
    slug: "99-nights-in-the-forest-best-base-plan",
    title: "Best 99 Nights in the Forest base plan",
    description: "Build a 99 Nights base around visibility, short supply paths, a protected fire, assigned storage, and a simple night recovery route.",
    eyebrow: "Base decision",
    directAnswer: "The best base is compact enough to defend and easy to resupply. Keep the fire and critical storage central, preserve clear movement lanes, place supplies by purpose, and avoid expanding farther than the team can repair or patrol before night.",
    stepsTitle: "Build the base in this order",
    steps: [
      "Treat the campfire as the center of the base. Leave enough clear space to approach it quickly from every team route.",
      "Create short, readable zones for fuel, food, healing, and spare equipment so a player can find the right resource under pressure.",
      "Clear or organize the nearest approach lanes. Visibility and movement matter more than decorative complexity.",
      "Add only the defense the team can maintain. A large perimeter with empty sections creates more failure points than a compact plan.",
      "Define a fallback position and recovery task for each role before night begins."
    ],
    checkpoints: [
      ["Central fire", "No wall, storage pile, or decoration should block emergency access to the fire."],
      ["Supply labels", "Players should know where fuel and healing are without opening every container."],
      ["Sightlines", "Approach routes should be visible enough for the team to react before enemies are already inside."],
      ["Repair capacity", "The team must be able to restore the chosen layout during the next daylight window."]
    ],
    mistakes: [
      "Building a wide perimeter before the camp has a stable fuel and food reserve.",
      "Placing every useful item in one unorganized pile.",
      "Blocking player movement near the fire with defenses that look strong but create a trap.",
      "Copying a late-game base video with materials and team roles the current run does not have."
    ],
    updateNote: "If a patch changes build pieces, preserve the underlying plan: central access, short supply paths, visibility, maintainable defense, and a fallback route.",
    sources: [
      ["Official 99 Nights in the Forest Roblox page", gameById("99-nights-in-the-forest").officialUrl],
      ["BlockRadar map and survival route", `${baseUrl}/99-nights-in-the-forest-map-and-survival-route`]
    ]
  },
  {
    gameId: "fish-it",
    slug: "fish-it-how-to-enchant-a-rod",
    title: "How to enchant a rod in Fish It",
    description: "A safe Fish It rod-enchanting workflow covering the target rod, Enchant Stone, altar confirmation, result checks, and when to stop rerolling.",
    eyebrow: "Equipment answer",
    directAnswer: "Equip or select the rod you actually want to improve, bring the required Enchant Stone to the current enchanting interaction, confirm the target before using the stone, and judge the result against one fishing goal. Do not keep rerolling without a resource limit.",
    stepsTitle: "Enchant without wasting stones",
    steps: [
      "Choose the target rod first. Do not enchant a temporary rod only because it is currently equipped.",
      "Decide the goal before spending: faster catches, luck, weight capacity, mutation hunting, or another current stat shown by the game.",
      "Bring the required Enchant Stone to the in-game enchanting interaction or altar and select the intended rod.",
      "Read the confirmation screen carefully. Check both the rod name and the resource cost before accepting.",
      "Test the result on the route it was meant to improve. Set a hard stop before rerolling another scarce stone."
    ],
    checkpoints: [
      ["Correct rod", "The selected rod should be one you expect to use for several fishing sessions."],
      ["Named goal", "A useful enchant solves a specific catch-rate, luck, capacity, or route problem."],
      ["Visible cost", "Only trust the resource cost shown by the current in-game interface."],
      ["Reroll limit", "Keep enough stones or currency for the next confirmed progression requirement."]
    ],
    mistakes: [
      "Using a stone while the wrong rod is selected.",
      "Chasing a community 'best' enchant that does not improve the current fishing route.",
      "Rerolling every available stone after receiving a usable result.",
      "Following an old altar location or enchant pool without checking the current update."
    ],
    updateNote: "Enchant names, odds, locations, and available stones can change. This workflow remains valid, but the current in-game confirmation screen decides the exact cost and result pool.",
    sources: [
      ["Official Fish It Roblox page", gameById("fish-it").officialUrl],
      ["BlockRadar Fish It rod finder", `${baseUrl}/fish-it-rod-finder`]
    ]
  },
  {
    gameId: "fish-it",
    slug: "fish-it-best-spot-for-money",
    title: "Best Fish It spot for money",
    description: "Find the most profitable Fish It location for your current rod by measuring successful catches, sell value, travel time, and weight limits.",
    eyebrow: "Money route",
    directAnswer: "The best money spot is the highest-value area your current rod can fish consistently without frequent failed catches or weight-cap problems. Test each candidate for ten minutes and compare actual sell value per minute instead of copying a late-game location your equipment cannot support.",
    stepsTitle: "Run a ten-minute location test",
    steps: [
      "Open the Fish It rod finder and identify locations that match the current rod's level, weight, and progression stage.",
      "Fish one candidate spot for ten minutes without changing rod, bait, enchant, or selling method.",
      "Record successful catches, failed or escaped catches, total sell value, and travel time.",
      "Repeat the same test at one alternative location under similar conditions.",
      "Choose the route with the higher reliable value per minute, then retest after a rod, enchant, area, or event update."
    ],
    checkpoints: [
      ["Catch success", "A rare high-price fish does not compensate for a route where most catches fail."],
      ["Weight support", "The rod must handle the fish available in the area without repeated capacity problems."],
      ["Travel cost", "Include the time needed to reach the water and sell the inventory."],
      ["Current goal", "A money route and a secret-fish route may be different; do not judge both by the same result."]
    ],
    mistakes: [
      "Calling the newest island the best even when the current rod cannot land its normal catch pool.",
      "Comparing one lucky catch with ten minutes of steady fishing elsewhere.",
      "Changing bait or enchant between tests and attributing the difference only to location.",
      "Ignoring a new update that changes fish values, areas, weather, or the rod progression."
    ],
    updateNote: "This method intentionally avoids a permanent one-location claim. New islands and balance updates can move the best route, while a measured sell-per-minute comparison stays useful.",
    sources: [
      ["Official Fish It Roblox page", gameById("fish-it").officialUrl],
      ["BlockRadar Fish It locations guide", `${baseUrl}/fish-it-locations-and-fishing-route`]
    ]
  },
  {
    gameId: "grow-a-garden-2",
    slug: "grow-a-garden-2-how-to-make-money-fast",
    title: "How to make money fast in Grow a Garden 2",
    description: "A repeatable Grow a Garden 2 money route using affordable seeds, clean harvest cycles, a sheckle reserve, planned upgrades, and night preparation.",
    eyebrow: "Money route",
    directAnswer: "Build reliable sheckles before chasing rare restocks. Buy affordable seeds, use a layout you can water and harvest quickly, sell complete cycles, preserve enough money for the next seed purchase, and spend only the surplus on upgrades or scarce opportunities.",
    stepsTitle: "Use this repeatable garden cycle",
    steps: [
      "Check the current seed restock before buying. Choose a small mix you can afford without emptying the balance.",
      "Plant in a compact layout that keeps watering and harvesting paths clear.",
      "Finish and sell a complete harvest cycle before expanding the plot or buying decoration.",
      "Keep a seed reserve large enough to restart the cycle even if the next purchase performs poorly.",
      "Use surplus sheckles on the upgrade that removes the current bottleneck, then measure whether the next cycle actually becomes faster or more valuable."
    ],
    checkpoints: [
      ["Seed reserve", "Do not let one rare restock remove the money needed for the next normal crop cycle."],
      ["Harvest speed", "A readable layout should reduce walking and missed plants."],
      ["Upgrade purpose", "Name whether an upgrade improves growth, capacity, protection, or another repeated task."],
      ["Night plan", "Protect or finish the valuable part of the cycle before night stealing changes the risk."]
    ],
    mistakes: [
      "Spending the full balance because a seed looks rare.",
      "Expanding into a layout that takes longer to maintain than the current tools support.",
      "Using every boost on low-value plants without a planned harvest window.",
      "Confusing a large sale with a profitable cycle while ignoring the purchase and time cost."
    ],
    updateNote: "Seed prices and best crops can change. Protect the repeatable loop: affordable input, clean harvest, reserve, targeted upgrade, then measurement.",
    sources: [
      ["Official Grow a Garden 2 Roblox page", gameById("grow-a-garden-2").officialUrl],
      ["BlockRadar best seeds and upgrades", `${baseUrl}/grow-a-garden-2-best-seeds-and-upgrades`]
    ]
  },
  {
    gameId: "steal-a-brainrot",
    slug: "steal-a-brainrot-how-to-rebirth",
    title: "How to rebirth in Steal a Brainrot",
    description: "Use the Steal a Brainrot rebirth screen safely by checking current requirements, reset losses, protected assets, multiplier gains, and recovery time.",
    eyebrow: "Progression answer",
    directAnswer: "Open the in-game Rebirth menu and read the current cash and Brainrot requirements. Rebirth only when the permanent benefit is worth the reset, valuable assets are handled according to the current rules, and you have a clear route to rebuild the first income cycle.",
    stepsTitle: "Rebirth with a recovery plan",
    steps: [
      "Open the current Rebirth screen and write down every required item, cash amount, and stated reward. Requirements can change between updates.",
      "Read the reset warning. Identify what the game says will be removed, kept, protected, or unlocked.",
      "Finish any short purchase or collection goal that would be wasted by an immediate reset.",
      "Confirm the rebirth only through the official in-game control.",
      "After the reset, rebuild the cheapest reliable income path first and use the permanent benefit to shorten the same progression loop."
    ],
    checkpoints: [
      ["Requirements", "Use the live Rebirth menu, not an old screenshot, for the exact cash and Brainrot list."],
      ["Reset cost", "Know which inventory, base, and currency progress the current update removes."],
      ["Permanent gain", "The reward should improve future progression enough to justify rebuilding."],
      ["First recovery step", "Decide the first affordable Brainrot or income target before confirming."]
    ],
    mistakes: [
      "Selling or sacrificing the wrong Brainrot because an old guide shows different requirements.",
      "Confirming without reading what resets in the current version.",
      "Rebirthing immediately after receiving a temporary boost or event reward that could finish a nearby goal.",
      "Using scripts, account sharing, or off-platform payment to skip the rebuild."
    ],
    updateNote: "Exact rebirth tiers are update-sensitive. BlockRadar does not freeze a requirement number into this answer; use the live menu for numbers and this checklist for the decision.",
    sources: [
      ["Official Steal a Brainrot Roblox page", gameById("steal-a-brainrot").officialUrl],
      ["BlockRadar Steal a Brainrot beginner guide", `${baseUrl}/steal-a-brainrot-beginner-guide`]
    ]
  }
];

function codesPage(id) {
  const game = gameById(id);
  const group = codeGroups.find((item) => item.id === id);
  if (!group) throw new Error(`Missing code group for ${id}`);
  const active = group.codes.filter((item) => item.status === "active");
  const expired = group.codes.filter((item) => item.status === "expired");
  const checkedIso = group.lastReviewed || reviewedIso;
  const checkedLabel = new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" })
    .format(new Date(`${checkedIso}T12:00:00Z`));
  const slug = `${id}-codes-not-expired`;
  const title = `${game.name} codes not expired`;
  const description = `Current ${game.name} codes, reviewed rewards, expiration status, safe redemption steps, and reasons a code may not work.`;
  const canonical = `${baseUrl}/${slug}`;
  const schema = structuredArticle({ title, description, canonical, image: game.image, modified: checkedIso });
  const activeRows = active.length
    ? active.map((item) => `<tr><th scope="row"><code>${escapeHtml(item.code)}</code></th><td>${escapeHtml(item.reward)}</td><td><span class="status-dot active"></span>Active at review</td></tr>`).join("")
    : '<tr><td colspan="3">No active public codes were confirmed in the latest source review.</td></tr>';
  const expiredRows = expired.length
    ? `<section><h2>Expired codes kept for reference</h2>${list(expired.map((item) => `${item.code}: ${item.reward}`), "mistake-list")}</section>`
    : "";
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(title)} - BlockRadar</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <meta property="og:type" content="article" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:url" content="${canonical}" />
    <meta property="og:image" content="${escapeHtml(game.image)}" />
    <link rel="stylesheet" href="styles.css" />
    <script type="application/ld+json">${schema}</script>
    <script src="freshness.js" defer></script>
    <script src="feedback.js" defer></script>
    <script src="ads.js" defer></script>
  </head>
  <body>
    <header class="site-header">
      <a class="brand" href="/"><span class="brand-mark">BR</span><span>BlockRadar</span></a>
      <nav class="nav" aria-label="Primary navigation">${nav()}</nav>
      <a class="submit-link" href="/codes?game=${escapeHtml(id)}">Code tracker</a>
    </header>
    <main class="article-shell">
      <nav class="breadcrumb" aria-label="Breadcrumb"><a href="/">Home</a><span>/</span><a href="/codes">Codes</a><span>/</span><strong>${escapeHtml(game.name)}</strong></nav>
      <header class="guide-article-header">
        <div><p class="eyebrow">Codes status &middot; Source reviewed ${escapeHtml(checkedLabel)}</p><span data-freshness-date="${escapeHtml(checkedIso)}" data-fresh-days="7" data-warning-days="21">Reviewed ${escapeHtml(checkedLabel)}</span><h1>${escapeHtml(title)}</h1><p>${escapeHtml(description)}</p></div>
        <img src="${escapeHtml(game.image)}" alt="${escapeHtml(game.name)} official Roblox thumbnail" />
      </header>
      <section class="direct-answer"><strong>Current status</strong><p>${active.length ? `${active.length} codes were active in the source review on ${checkedLabel}. Roblox can expire them without notice, so vote Expired in the tracker if one is rejected.` : `No active public codes were confirmed in the ${checkedLabel} source review. Do not trust a site that invents a redemption box or asks for a Roblox login.`}</p></section>
      <article class="guide-article">
        <section><h2>Codes checked in the latest review</h2><div class="table-scroll"><table class="value-table"><thead><tr><th>Code</th><th>Reviewed reward</th><th>Status</th></tr></thead><tbody>${activeRows}</tbody></table></div><p class="source-note">${escapeHtml(group.note || "")}</p></section>
        <section><h2>Redeem safely</h2>${steps([
          `Open ${game.name} from the official Roblox experience page.`,
          "Find the in-game Codes, Rewards, Gift, or Settings control. Stop if the game has no redemption control.",
          "Paste the code exactly, including capitalization, numbers, underscores, and punctuation.",
          "Read the in-game result. Only Roblox can confirm that the reward was added.",
          "Never enter a Roblox password, cookie, backup code, or account token on a codes website."
        ])}</section>
        <section><h2>Why an active code may fail</h2>${pairs([
          ["Already redeemed", "Most codes can be used only once on an account."],
          ["Case or spacing", "A copied space or changed letter can make a valid code fail."],
          ["Eligibility", "Some rewards require a level, event state, or official group membership."],
          ["Developer expiration", "A creator can disable a code after the source review without notice."]
        ])}</section>
        ${expiredRows}
        <section><h2>Sources and update policy</h2><p>BlockRadar separates source-reviewed status from guaranteed redemption. Use the in-game result as the final answer and submit a structured vote when the list changes.</p><ul class="source-list"><li><a href="${escapeHtml(game.officialUrl)}" target="_blank" rel="noopener">Official ${escapeHtml(game.name)} Roblox page</a></li><li><a href="${escapeHtml(group.sourceUrl)}" target="_blank" rel="noopener">${escapeHtml(group.sourceLabel)}</a></li></ul></section>
      </article>
      <section class="feedback-panel article-feedback" data-feedback-scope="guide:${escapeHtml(slug)}">
        <p class="eyebrow">Code correction</p><h2>Does this list match the game?</h2>
        <div class="feedback-actions"><button type="button" data-feedback-value="worked" aria-pressed="false">Worked</button><button type="button" data-feedback-value="expired" aria-pressed="false">Expired</button><button type="button" data-feedback-value="outdated" aria-pressed="false">Page outdated</button></div>
        <small data-feedback-status>Choose one answer. No account is required.</small>
      </section>
      <nav class="article-next"><a href="/codes?game=${escapeHtml(id)}">Open live tracker</a><a href="/games/${escapeHtml(id)}">Open ${escapeHtml(game.name)} hub</a><a href="/roblox-scam-link-checker">Check a suspicious link</a></nav>
    </main>
    <footer class="site-footer"><strong>BlockRadar</strong><span>Current codes without fake generators. Not affiliated with Roblox Corporation.</span></footer>
  </body>
</html>`;
}

function toolPage({ slug, title, description, eyebrow, intro, scripts = "", body, schemaType = "WebApplication" }) {
  const canonical = `${baseUrl}/${slug}`;
  const schema = JSON.stringify({
    "@context": "https://schema.org",
    "@type": schemaType,
    name: title,
    description,
    url: canonical,
    applicationCategory: "GameApplication",
    operatingSystem: "Any"
  }).replaceAll("<", "\\u003c");
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(title)} - BlockRadar</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <meta property="og:type" content="website" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:url" content="${canonical}" />
    <link rel="stylesheet" href="styles.css" />
    <script type="application/ld+json">${schema}</script>
    ${scripts}
    <script src="answer-tools.js" defer></script>
    <script src="ads.js" defer></script>
  </head>
  <body data-answer-tool="${escapeHtml(slug)}">
    <header class="site-header">
      <a class="brand" href="/"><span class="brand-mark">BR</span><span>BlockRadar</span></a>
      <nav class="nav" aria-label="Primary navigation">${nav()}</nav>
      <a class="submit-link" href="/tools">All tools</a>
    </header>
    <main class="page-shell answer-tool-shell">
      <nav class="breadcrumb" aria-label="Breadcrumb"><a href="/">Home</a><span>/</span><a href="/tools">Tools</a><span>/</span><strong>${escapeHtml(title)}</strong></nav>
      <section class="page-title compact-title">
        <p class="eyebrow">${escapeHtml(eyebrow)}</p>
        <h1>${escapeHtml(title)}</h1>
        <p>${escapeHtml(intro)}</p>
      </section>
      ${body}
      <section class="source-band compact-source">
        <div><p class="eyebrow">Trust boundary</p><h2>Useful guidance, with a visible limit</h2></div>
        <p>${escapeHtml(description)} BlockRadar never asks for a Roblox password, account cookie, private message, or off-platform trade.</p>
      </section>
    </main>
    <footer class="site-footer"><strong>BlockRadar</strong><span><a href="/parents">Parents</a> &middot; <a href="/methodology">Methodology</a> &middot; Independent Roblox resource.</span></footer>
  </body>
</html>`;
}

const toolPages = [
  {
    slug: "updates",
    title: "Roblox game updates today",
    description: "Track official Roblox experience update activity, live player counts, and creator description changes without pretending every update has public patch notes.",
    eyebrow: "Official activity tracker",
    intro: "See which games changed recently, what their creators currently highlight, and where to verify the live experience.",
    scripts: '<script src="data.js" defer></script><script src="favorites.js" defer></script>',
    body: `
      <section class="tracker-controls" aria-label="Update filters">
        <label>Find a game<input id="update-query" type="search" placeholder="Search Blox Fruits, RIVALS, Fish It..." autocomplete="off" /></label>
        <label>Updated within<select id="update-window"><option value="all">Any time</option><option value="1">24 hours</option><option value="3">3 days</option><option value="7">7 days</option><option value="30">30 days</option></select></label>
        <label>Sort<select id="update-sort"><option value="recent">Most recently updated</option><option value="players">Most players now</option><option value="name">Game name</option></select></label>
      </section>
      <div class="tool-status-line"><strong id="update-summary">Loading official activity</strong><span id="update-built"></span></div>
      <section id="update-results" class="update-results" aria-live="polite"></section>
      <section class="tool-explainer">
        <h2>What an update timestamp proves</h2>
        <p>It proves that Roblox reports activity on the experience. It does not prove that the creator published full patch notes. BlockRadar shows the current official description and links to the experience instead of inventing missing changes or event times.</p>
      </section>`
  },
  {
    slug: "roblox-device-fixer",
    title: "Roblox game not loading fixer",
    description: "Choose a device and symptom to get an ordered Roblox loading, connection, graphics, launcher, or asset troubleshooting checklist.",
    eyebrow: "Device troubleshooting",
    intro: "Start with the exact device and failure you see. The fixer keeps account safety checks ahead of reinstalls and destructive steps.",
    body: `
      <form class="tool-form-grid" id="device-fixer-form">
        <label>Device<select id="fix-device"><option value="windows">Windows PC</option><option value="mobile">iPhone or Android</option><option value="xbox">Xbox</option><option value="playstation">PlayStation</option><option value="chromebook">Chromebook</option></select></label>
        <label>Problem<select id="fix-symptom"><option value="wont-open">Roblox will not open</option><option value="stuck">Game is stuck loading</option><option value="assets">Images, textures, or avatars are missing</option><option value="disconnect">Disconnects or connection errors</option><option value="lag">Low FPS, stutter, or lag</option><option value="one-game">Only one game fails</option></select></label>
        <button type="submit">Build troubleshooting plan</button>
      </form>
      <section id="device-fixer-result" class="tool-result-panel" aria-live="polite"></section>
      <section class="tool-explainer"><h2>Official help</h2><p><a href="https://en.help.roblox.com/hc/en-us/articles/203312880-General-Connection-Problems" target="_blank" rel="noopener">General connection problems</a> &middot; <a href="https://en.help.roblox.com/hc/en-us/articles/203314150-How-to-Reduce-Lag-and-Speed-Up-Play" target="_blank" rel="noopener">Reduce lag and speed up play</a> &middot; <a href="https://status.roblox.com/" target="_blank" rel="noopener">Roblox service status</a></p></section>`
  },
  {
    slug: "rivals-settings-builder",
    title: "RIVALS settings and crosshair builder",
    description: "Build a practical RIVALS starting setup for PC, mobile, controller, or console, then use a short test to tune aim, movement, visibility, and crosshair.",
    eyebrow: "RIVALS setup tool",
    intro: "Choose how you play and what is going wrong. The result is a starting baseline, not a copied pro setting that ignores your device.",
    body: `
      <form class="tool-form-grid" id="rivals-builder-form">
        <label>Platform<select id="rivals-platform"><option value="pc">PC mouse and keyboard</option><option value="mobile">Mobile touch</option><option value="controller">Controller or console</option></select></label>
        <label>Play style<select id="rivals-style"><option value="balanced">Balanced duels</option><option value="tracking">Automatic weapon tracking</option><option value="precision">Sniper or precision shots</option><option value="movement">Fast close-range movement</option></select></label>
        <label>Main problem<select id="rivals-problem"><option value="overaim">Crosshair passes the target</option><option value="underaim">Cannot turn or follow fast enough</option><option value="visibility">Lose the target on screen</option><option value="buttons">Controls feel crowded</option></select></label>
        <button type="submit">Build my setup</button>
      </form>
      <section class="rivals-output-layout">
        <div id="rivals-builder-result" class="tool-result-panel" aria-live="polite"></div>
        <div class="crosshair-lab" aria-label="Crosshair preview"><span>Preview</span><div id="crosshair-preview" class="crosshair-preview crosshair-dot"><i></i><b></b></div><small>Use the preview as a visibility check, then reproduce the closest available in-game option.</small></div>
      </section>
      <section class="tool-explainer"><h2>Thirty-second tuning test</h2><p>Keep one setup for three short rounds. Lower sensitivity one step if the crosshair repeatedly passes the target; raise it one step if tracking cannot keep up. Change only one setting between tests.</p><p><a href="/rivals-best-weapons">Choose a RIVALS loadout</a> &middot; <a href="/rivals-maps-and-positioning">Review map positioning</a> &middot; <a href="${escapeHtml(gameById("rivals").officialUrl)}" target="_blank" rel="noopener">Open official RIVALS</a></p></section>`
  },
  {
    slug: "roblox-scam-link-checker",
    title: "Roblox scam link checker",
    description: "Check whether a Roblox login, Robux, code, trade, or reward link uses an official Roblox domain and see common phishing warning signs without opening it.",
    eyebrow: "Private browser check",
    intro: "Paste a suspicious address. The check runs only in this page and never visits the submitted link.",
    body: `
      <form class="scam-check-form" id="scam-check-form">
        <label for="scam-url">Suspicious web address</label>
        <div><input id="scam-url" type="text" inputmode="url" placeholder="https://example.com/robux-reward" autocomplete="off" spellcheck="false" /><button type="submit">Check link</button></div>
      </form>
      <section id="scam-check-result" class="tool-result-panel scam-result" aria-live="polite"><h2>No link checked yet</h2><p>Never paste a password, cookie, backup code, or private account token here or anywhere outside the official Roblox sign-in flow.</p></section>
      <section class="tool-explainer"><h2>What this checker can prove</h2><p>It can identify the hostname, HTTPS use, hidden username text, IP-address links, shortened links, punycode, and names that imitate Roblox. It cannot guarantee that user-generated content on an official page is honest.</p><p><a href="https://en.help.roblox.com/hc/en-us/articles/204262550-Free-Robux-or-Subscription-Generators" target="_blank" rel="noopener">Roblox free Robux scam guidance</a> &middot; <a href="https://en.help.roblox.com/hc/en-us/articles/203312390-Player-Trading-Scams" target="_blank" rel="noopener">Roblox trading scam guidance</a></p></section>`
  }
];

for (const definition of answerDefinitions) {
  await writeFile(path.join(root, `${definition.slug}.html`), cleanOutput(answerPage(definition)));
}

for (const id of ["dress-to-impress", "blade-ball", "bee-swarm-simulator", "fisch", "jujutsu-shenanigans"]) {
  await writeFile(path.join(root, `${id}-codes-not-expired.html`), cleanOutput(codesPage(id)));
}

for (const definition of toolPages) {
  await writeFile(path.join(root, `${definition.slug}.html`), cleanOutput(toolPage(definition)));
}

const answerGroups = [
  ["Blox Fruits", answerDefinitions.filter((item) => item.gameId === "blox-fruits")],
  ["99 Nights in the Forest", answerDefinitions.filter((item) => item.gameId === "99-nights-in-the-forest")],
  ["Fish It", answerDefinitions.filter((item) => item.gameId === "fish-it")],
  ["Grow a Garden 2", answerDefinitions.filter((item) => item.gameId === "grow-a-garden-2")],
  ["Steal a Brainrot", answerDefinitions.filter((item) => item.gameId === "steal-a-brainrot")]
];
const answersBlock = `<!-- PLAYER_ANSWERS_START -->
<section class="growth-guides player-answer-guides">
  <div class="section-heading"><div><p class="eyebrow">Single-question answers</p><h2>Solve the problem that stopped your session</h2></div><p>Progression, money routes, equipment decisions, and recovery steps with visible review dates.</p></div>
  ${answerGroups.map(([name, definitions]) => `<section class="guide-topic-group"><div class="guide-topic-heading"><h3>${escapeHtml(name)}</h3></div><div class="guide-list growth-guide-list">${definitions.map((item) => `<a href="/${escapeHtml(item.slug)}"><strong>${escapeHtml(item.title)}</strong><span>Reviewed ${reviewed}</span></a>`).join("")}</div></section>`).join("")}
</section>
<!-- PLAYER_ANSWERS_END -->`;
const guidesPath = path.join(root, "guides.html");
const guidesHtml = await readFile(guidesPath, "utf8");
const answersPattern = /<!-- PLAYER_ANSWERS_START -->[\s\S]*?<!-- PLAYER_ANSWERS_END -->/;
const nextGuides = answersPattern.test(guidesHtml)
  ? guidesHtml.replace(answersPattern, answersBlock)
  : guidesHtml.replace("</main>", `${answersBlock}\n    </main>`);
await writeFile(guidesPath, nextGuides);

console.log(`Built ${answerDefinitions.length} player answers, 5 code pages, and ${toolPages.length} tools.`);
