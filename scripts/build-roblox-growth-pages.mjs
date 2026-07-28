import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve("outputs/roblox-portal");
const baseUrl = "https://roblox.pingdou123.uk";
const reviewed = "July 28, 2026";
const reviewedIso = "2026-07-28";

const dataSource = await readFile(path.join(root, "data.js"), "utf8");
const codesSource = await readFile(path.join(root, "codes-data.js"), "utf8");
const browserWindow = {};
Function("window", `${dataSource}\n${codesSource}; return window;`)(browserWindow);
const games = browserWindow.blockRadarGames || [];
const codeGroups = browserWindow.blockRadarCodeGroups || [];

const profiles = [
  {
    id: "grow-a-garden-2",
    name: "Grow a Garden 2",
    verdict: "A good fit for players who understand that night stealing is part of the game, but younger players may need help with public-server conflict and spending limits.",
    beginner: [
      "Walk through the seed shop and garden before spending. Restock timing matters, so learn what is available first.",
      "Buy a small mix of affordable seeds. Keeping some sheckles avoids being stuck after a poor harvest.",
      "Plant in a layout you can water and harvest quickly instead of filling every space at once.",
      "Sell enough crops to create a reserve, then use only the surplus for riskier upgrades.",
      "Learn what changes when night stealing starts. Protect the crops that matter before leaving your plot.",
      "Join or create a guild only after the basic day-night loop makes sense."
    ],
    pitfalls: [
      "Spending the full balance on one shop restock.",
      "Using every Watering Can before a valuable crop is ready.",
      "Treating game-rule stealing as an account scam, or treating an actual off-platform scam as normal gameplay.",
      "Checking offline growth and restocks so often that sessions lose a clear stopping point."
    ],
    safety: [
      ["Official content label", "Roblox currently shows Maturity: Minimal in the chart data."],
      ["Main social risk", "Players can steal during the night phase, which can create conflict even though it is an intended rule."],
      ["Spending pressure", "Seeds, progression, and timed opportunities can make an upgrade feel urgent."],
      ["Scam boundary", "No code or trade reward should require a password, browser extension, or outside website."],
      ["Parent check", "Watch one complete day-night cycle and agree on a session end point."]
    ],
    bestTitle: "Best Grow a Garden 2 seeds and upgrades for a stable start",
    bestIntro: "The best early choice is not automatically the rarest seed. A useful purchase either improves reliable income, protects the plot, or shortens a task you already repeat.",
    best: [
      ["Affordable repeat crops", "Use low-cost seeds to learn harvest timing and build a sheckle reserve before chasing scarcity."],
      ["Green Bean Seeds from TEAMGREENBEAN", "The reviewed code gives three seeds and is a low-risk way to test the code system."],
      ["Watering Can reserve", "Keep part of the WATERYOPLANTS reward for a crop that benefits from faster attention."],
      ["Layout upgrades before decoration", "A readable garden makes watering, harvesting, and night preparation faster."],
      ["Guild investment after self-sufficiency", "Weekly guild rewards matter more when your own garden can already fund its next restock."]
    ],
    mapTitle: "Grow a Garden 2 night stealing and garden secrets",
    routeIntro: "Treat the plot as a loop: shop, plant, harvest, sell, prepare, then defend. The night phase changes priorities, so the best route finishes important garden work before it begins.",
    route: [
      ["Shop check", "Read the current restock and decide a spending ceiling before buying."],
      ["Compact planting lane", "Group crops by how soon they need attention so one pass handles watering and harvest."],
      ["Sell and reserve", "Bank enough sheckles for the next basic seed purchase before buying an upgrade."],
      ["Night preparation", "Finish valuable harvests and return attention to the plot before stealing starts."],
      ["Offline exit", "Leave the garden in a state that benefits from offline growth, then end the session instead of waiting on another restock."]
    ],
    extraSource: "https://progameguides.com/roblox/grow-a-garden-2-codes/"
  },
  {
    id: "99-nights-in-the-forest",
    name: "99 Nights in the Forest",
    verdict: "The official label is Minimal, but the dark forest, implied watcher, pursuit pressure, and survival failures can feel intense. Preview it before approving it for a scare-sensitive child.",
    beginner: [
      "Stabilize the camp fire and gather a reserve before taking a long search route.",
      "Build beds early because they improve day progression and reduce repeated survival cycles.",
      "Search during daylight with one objective instead of wandering until night.",
      "Plan missing-child rescues because they also contribute to the day multiplier.",
      "Return before visibility and pressure become dangerous, even if the current search is unfinished.",
      "In a group, assign gathering, camp, and rescue roles and agree on a return call."
    ],
    pitfalls: [
      "Leaving camp without a reserve for the fire.",
      "Ignoring beds and then repeating more nights than necessary.",
      "Splitting the team with no shared return time.",
      "Spending Diamonds on a class before understanding what role the run needs."
    ],
    safety: [
      ["Official content label", "Roblox chart data currently shows Maturity: Minimal."],
      ["Scare intensity", "The official premise says something is watching, and darkness makes the threat feel stronger."],
      ["Co-op risk", "Public teammates may ignore roles or leave players behind; known friends are more predictable."],
      ["Spending pressure", "Classes use Diamonds, so a failed run can make progression purchases feel urgent."],
      ["Parent check", "Preview a night, the loudest encounter, and a failure state before deciding age fit."]
    ],
    bestTitle: "Best 99 Nights classes and upgrades: what to buy first",
    bestIntro: "The strongest early upgrade is the one that prevents a run from collapsing. Camp stability and day multipliers usually matter before a specialized class.",
    best: [
      ["Beds", "Build these early because the day multiplier reduces how many full cycles the team must survive."],
      ["Fire resource reserve", "A stocked camp protects every role; spending the final resource on exploration is rarely worth it."],
      ["Missing-child rescue progress", "Rescues improve the multiplier and give daylight searches a concrete purpose."],
      ["A class that fills the missing role", "Choose for gathering, support, or survival needs instead of buying solely by rarity."],
      ["Team communication", "A return time and assigned jobs are effectively a free upgrade to every resource run."]
    ],
    mapTitle: "99 Nights map route and survival plan",
    routeIntro: "The safest route expands in rings around camp. Each daylight window has one target and one turnaround time, so the group does not trade a small resource gain for a failed night.",
    route: [
      ["Camp center", "Stock the fire, place beds, and identify the safest return approach."],
      ["Near-resource ring", "Clear nearby supplies first so emergency runs remain short."],
      ["Marked search route", "Move toward one rescue or resource objective and remember the return landmarks."],
      ["Turnaround point", "Leave enough daylight to get every player back, not just the fastest one."],
      ["Night positions", "Regroup at camp, confirm resources, and avoid starting another search until daylight."]
    ],
    extraSource: "https://progameguides.com/roblox/99-nights-in-the-forest-codes/"
  },
  {
    id: "rivals",
    name: "RIVALS",
    verdict: "RIVALS is a skill-focused FPS with a current Mild label. It is better suited to older children who are comfortable with stylized gun combat, competitive losses, and public matchmaking.",
    beginner: [
      "Use the duel area to learn the first-to-five round structure before worrying about streaks.",
      "Choose one primary weapon and keep it long enough to learn recoil, range, and reload timing.",
      "Place the crosshair where an opponent is likely to appear before moving around the corner.",
      "Use cover to break line of sight instead of challenging every angle twice.",
      "Complete contracts for progression, but do not let a contract force a bad team habit.",
      "Review one lost round at a time: aim, cover, timing, or team spacing."
    ],
    pitfalls: [
      "Switching weapons after every loss and never learning one recoil pattern.",
      "Standing in the same exposed angle after firing.",
      "Confusing a cosmetic skin with a combat advantage.",
      "Continuing a frustrated losing streak instead of taking a short break."
    ],
    safety: [
      ["Official content label", "Roblox chart data currently shows Maturity: Mild."],
      ["Core content", "The game is a first-person shooter built around 1v1 to 5v5 gun duels."],
      ["Social pressure", "Win streaks and leaderboards can intensify trash talk or frustration."],
      ["Spending pressure", "Keys unlock weapons and skins, while contracts also provide progression."],
      ["Parent check", "Review voice and text settings, then watch a public match and the reward screen."]
    ],
    bestTitle: "RIVALS best weapons: choose a loadout that fits the duel",
    bestIntro: "There is no permanent best weapon for every map and skill level. A strong loadout covers the range you actually fight at and gives you a reliable answer after a missed shot.",
    best: [
      ["Reliable primary", "Prioritize a weapon whose recoil and fire rhythm you can repeat under pressure."],
      ["Close-range answer", "Carry an option that handles a rushed corner without requiring a perfect long-range setup."],
      ["Movement-compatible choice", "A weapon is only strong if you can use it while taking cover and changing angles."],
      ["Contract-efficient practice", "Use contracts to guide practice, but return to the main loadout before ranked or serious duels."],
      ["Skins last", "Cosmetics can be fun, but they do not replace aim, positioning, or map knowledge."]
    ],
    mapTitle: "RIVALS maps and positioning secrets",
    routeIntro: "Good positioning is a sequence, not one hiding spot. Start with information, take a protected angle, deal damage, then move before the opponent pre-aims the same location.",
    route: [
      ["Spawn read", "Identify the fastest enemy line and avoid entering it without cover."],
      ["First protected angle", "Peek from a position that lets you retreat after one exchange."],
      ["Damage confirmation", "Push only when damage, sound, or teammate information creates an advantage."],
      ["Angle change", "Move after revealing your position so the next fight is not pre-aimed."],
      ["Round reset", "Reload, check teammate positions, and plan the next opening instead of sprinting immediately."]
    ],
    extraSource: "https://progameguides.com/roblox/rivals-codes/"
  },
  {
    id: "steal-a-brainrot",
    name: "Steal a Brainrot",
    verdict: "The official label is Minimal, but stealing and troll gear are intentional mechanics. It can be upsetting for children who expect cooperative collection or who struggle when progress is taken.",
    beginner: [
      "Buy an affordable first Brainrot and watch how it generates money before expanding.",
      "Learn when the plot is protected and when another player can enter.",
      "Bank progress and improve the base before attempting a long raid.",
      "Treat stealing as a risk-reward decision: time away from the plot is also an opening for opponents.",
      "Rebirth only after confirming what resets and what permanent benefit you receive.",
      "Ignore websites and videos claiming a secret code box; no active redeem system was confirmed in the latest review."
    ],
    pitfalls: [
      "Leaving the base undefended immediately after buying a valuable unit.",
      "Spending all income on troll gear instead of reliable production.",
      "Assuming an item stolen under game rules is the same as account theft.",
      "Entering Roblox credentials on a fake code or free-item page."
    ],
    safety: [
      ["Official content label", "Roblox chart data currently shows Maturity: Minimal."],
      ["Conflict mechanic", "The official instructions explicitly tell players to steal Brainrots from other plots."],
      ["Trolling", "Slaps and troll gear are part of the advertised loop."],
      ["Spending pressure", "Collection rarity and rebirth progression can make faster growth feel urgent."],
      ["Parent check", "Explain the difference between game-rule stealing, rude behavior, and real account scams."]
    ],
    bestTitle: "Best Brainrots and value checks in Steal a Brainrot",
    bestIntro: "A Brainrot is useful when its income can repay the risk and time required to obtain it. A flashy rarity label alone is not enough to decide whether a raid or purchase is sensible.",
    best: [
      ["Income-to-cost check", "Estimate how long the unit must stay safe before its generated money covers the purchase."],
      ["Protection fit", "A high-income unit is a poor upgrade if the current base cannot hold it."],
      ["Rebirth timing", "Compare the permanent benefit with the value that will reset before confirming."],
      ["Low-risk production base", "Keep dependable earners so one stolen item does not stop all progression."],
      ["No off-platform value", "Never trade account access, real money, or outside promises for an in-game Brainrot."]
    ],
    mapTitle: "Steal a Brainrot base defense and stealing secrets",
    routeIntro: "Every raid has two paths: the route into another plot and the route back to your own. A good plan limits time away, protects production, and stops when the risk exceeds the possible gain.",
    route: [
      ["Base scan", "Check protection, income, and the most exposed unit before leaving."],
      ["Target selection", "Choose a realistic target instead of crossing the server for the rarest visible item."],
      ["Short entry route", "Avoid unnecessary fights and keep the return path in view."],
      ["Immediate return", "Bring the reward home before starting another interaction."],
      ["Secure and bank", "Confirm the unit is producing safely, then spend only part of the new income."]
    ],
    extraSource: "https://progameguides.com/roblox/steal-a-brainrot-codes/"
  },
  {
    id: "fish-it",
    name: "Fish It!",
    verdict: "Fish It has a current Minimal label and low-intensity core play. The main concerns are long collection sessions, rare-drop pressure, and spending on rods or boosts.",
    beginner: [
      "Practice the two-part catch input: charge the cast, then click quickly during the catch.",
      "Sell early catches until there is enough money for a meaningful rod upgrade and a reserve.",
      "Compare luck, speed, and weight capacity instead of buying by price alone.",
      "Move to a new location only when the current rod can handle the target fish.",
      "Use potion codes at the start of a planned session so boost time is not wasted.",
      "Sail and explore with a goal, such as one location, rod, or missing collection entry."
    ],
    pitfalls: [
      "Buying a rod that still cannot hold the target fish.",
      "Using boost potions immediately before leaving the game.",
      "Ignoring a code's level requirement.",
      "Grinding for a rare variation without a time or spending limit."
    ],
    safety: [
      ["Official content label", "Roblox chart data currently shows Maturity: Minimal."],
      ["Core content", "The official page focuses on fishing, sailing, exploring, and collecting many variations."],
      ["Social risk", "Chat is not required for the catch loop, and known-friend fishing can reduce stranger contact."],
      ["Spending pressure", "Rod progression and rare catches can encourage faster upgrades."],
      ["Parent check", "Set a session goal and stop point before using a timed potion or starting a rare hunt."]
    ],
    bestTitle: "Fish It best rods by budget, luck, speed, and weight",
    bestIntro: "The best rod is the cheapest one that clears your current weight requirement while improving the stat that limits your catches. Use the rod finder for an exact budget match.",
    best: [
      ["Lucky Rod - 10,000", "A strong early luck jump at 130 luck with 5,000 weight capacity."],
      ["Steampunk Rod - 215,000", "A balanced mid-step with 175 luck, 19 speed, and 25,000 weight."],
      ["Chrome Rod - 437,000", "Useful when weight is the bottleneck: 190,000 capacity with 229 luck."],
      ["Astral Rod - 1,000,000", "A speed-focused progression point with 380 luck and 43 speed."],
      ["Bamboo Rod - 12,000,000", "A late reviewed option with 760 luck, 98 speed, and 500,000 capacity."]
    ],
    mapTitle: "Fish It locations and fishing route",
    routeIntro: "Progress from reliable catches to heavier targets. Do not move simply because a location is farther away; move when the next stop supports a collection goal your rod can handle.",
    route: [
      ["Fisherman Island", "Learn the input and create the first upgrade reserve."],
      ["Kohana and Coral Reefs", "Use these as early progression stops while checking rod capacity."],
      ["Tropical Grove and Crater Island", "Prioritize balanced luck and speed once basic weight is covered."],
      ["Lost Isle", "Treat it as a later route stop and arrive with upgrade money in reserve."],
      ["Ancient Jungle and Ocean", "Use high-capacity gear for targeted collection rather than unfocused sailing."]
    ],
    extraSource: "https://fish-it.fandom.com/wiki/Rods"
  },
  {
    id: "anime-expeditions",
    name: "Anime Expeditions",
    verdict: "Anime Expeditions has a current Minimal label, but randomized summoning and trait progression can create strong spending pressure. A clear resource plan makes it safer for younger players.",
    beginner: [
      "Complete the first reliable expedition with the units already available before rerolling heavily.",
      "Build a team with damage, area coverage, and support instead of filling every slot with the rarest-looking unit.",
      "Level the units that remain useful across several modes.",
      "Save Trait Crystals until a long-term team member has been identified.",
      "Use friends to cover a missing role during difficult waves or bosses.",
      "Redeem milestone and compensation codes, then record what each resource is for before spending it."
    ],
    pitfalls: [
      "Rerolling traits on a unit that will soon leave the team.",
      "Building only single-target damage and losing to dense waves.",
      "Spending every summon resource before checking the current progression goal.",
      "Using a strong unit in the wrong placement or upgrade order."
    ],
    safety: [
      ["Official content label", "Roblox chart data currently shows Maturity: Minimal."],
      ["Core content", "The official page describes summoning, evolving, expeditions, waves, and bosses."],
      ["Random rewards", "Summons and trait systems can encourage repeated attempts."],
      ["Social risk", "Co-op is useful but does not require private contact with strangers."],
      ["Parent check", "Review the summon screen, currency sources, and purchase prompts before approving a budget."]
    ],
    bestTitle: "Anime Expeditions best units and team roles",
    bestIntro: "A best team is a set of roles, not six copies of the highest rarity. The right unit solves a wave, boss, range, or economy problem that the rest of the lineup cannot cover.",
    best: [
      ["Primary area damage", "Use broad coverage to prevent normal waves from leaking while resources are saved."],
      ["Boss damage", "Keep at least one unit whose upgrades stay efficient against a single durable target."],
      ["Support or control", "Slows, buffs, or other support effects can improve every damage slot at once."],
      ["Affordable early placement", "A team needs a unit that can be placed before the economy is fully built."],
      ["Trait investment target", "Spend scarce Trait Crystals only on a unit expected to remain in several modes."]
    ],
    mapTitle: "Anime Expeditions progression values and secrets",
    routeIntro: "The efficient route repeats the highest stage that is reliable, then spends resources on the next specific blockage. Random rerolls without a target make progress slower.",
    route: [
      ["Reliable expedition", "Farm a stage that succeeds consistently instead of barely clearing a higher one."],
      ["Team gap review", "Identify whether the failure comes from early cost, wave coverage, boss damage, or placement."],
      ["Focused upgrade", "Level or evolve the unit that fixes that exact gap."],
      ["Trait checkpoint", "Use Trait Crystals only after the core lineup is stable."],
      ["Co-op test", "Bring friends for the difficult mode, but make sure the solo farming route still works."]
    ],
    extraSource: "https://progameguides.com/roblox/anime-expeditions-codes/"
  }
];

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

function steps(items) {
  return items.map((item, index) => `
    <article class="answer-step"><span>${index + 1}</span><p>${escapeHtml(item)}</p></article>`).join("");
}

function pairs(items) {
  return items.map(([title, detail]) => `
    <article class="answer-card"><h3>${escapeHtml(title)}</h3><p>${escapeHtml(detail)}</p></article>`).join("");
}

function pageShell({ profile, game, slug, title, description, eyebrow, directAnswer, body, sources }) {
  const canonical = `${baseUrl}/${slug}`;
  const schema = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    datePublished: reviewedIso,
    dateModified: reviewedIso,
    mainEntityOfPage: canonical,
    image: game.image,
    author: { "@type": "Organization", name: "BlockRadar Editorial" },
    publisher: { "@type": "Organization", name: "BlockRadar" }
  }).replaceAll("<", "\\u003c");
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(title)} - BlockRadar</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <link rel="canonical" href="${canonical}" />
    <meta name="robots" content="index,follow,max-image-preview:large" />
    <meta property="og:type" content="article" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:url" content="${canonical}" />
    <meta property="og:image" content="${escapeHtml(game.image)}" />
    <link rel="stylesheet" href="styles.css" />
    <script type="application/ld+json">${schema}</script>
    <script src="feedback.js" defer></script>
    <script src="ads.js" defer></script>
  </head>
  <body>
    <header class="site-header">
      <a class="brand" href="/"><span class="brand-mark">BR</span><span>BlockRadar</span></a>
      <nav class="nav" aria-label="Primary navigation"><a href="/games">Games</a><a href="/compare">Compare</a><a href="/rankings">Rankings</a><a href="/guides">Guides</a><a href="/codes">Codes</a><a href="/tools">Tools</a><a href="/safety">Safety</a></nav>
      <a class="submit-link" href="/games/${profile.id}">Game hub</a>
    </header>
    <main class="article-shell">
      <nav class="breadcrumb" aria-label="Breadcrumb"><a href="/">Home</a><span>/</span><a href="/guides">Guides</a><span>/</span><strong>${escapeHtml(profile.name)}</strong></nav>
      <header class="guide-article-header">
        <div><p class="eyebrow">${escapeHtml(eyebrow)} &middot; Updated ${reviewed}</p><h1>${escapeHtml(title)}</h1><p>${escapeHtml(description)}</p></div>
        <img src="${escapeHtml(game.image)}" alt="${escapeHtml(profile.name)} official Roblox thumbnail" />
      </header>
      <section class="direct-answer"><strong>Short answer</strong><p>${escapeHtml(directAnswer)}</p></section>
      <article class="guide-article">${body}
        <section>
          <h2>Sources and update policy</h2>
          <p>BlockRadar checked the official Roblox experience page and the current Roblox chart data on ${reviewed}. Time-sensitive codes or values also use the source below. Game updates can change details after review.</p>
          <ul class="source-list">${sources.map(([label, href]) => `<li><a href="${escapeHtml(href)}" target="_blank" rel="noopener">${escapeHtml(label)}</a></li>`).join("")}</ul>
        </section>
      </article>
      <section class="feedback-panel article-feedback" data-feedback-scope="guide:${escapeHtml(slug)}">
        <p class="eyebrow">Improve this guide</p><h2>Did this page solve the question?</h2>
        <div class="feedback-actions"><button type="button" data-feedback-value="helpful" aria-pressed="false">Helpful</button><button type="button" data-feedback-value="not-helpful" aria-pressed="false">Not helpful</button><button type="button" data-feedback-value="outdated" aria-pressed="false">Report outdated</button></div>
        <small data-feedback-status>Your choice is stored only on this device.</small>
      </section>
      <nav class="article-next"><a href="/games/${profile.id}">Open ${escapeHtml(profile.name)} hub</a><a href="/codes?game=${profile.id}">Check tracked codes</a><a href="/guides">More guides</a></nav>
    </main>
    <footer class="site-footer"><strong>BlockRadar</strong><span>Independent Roblox guides. Not affiliated with Roblox Corporation.</span></footer>
  </body>
</html>`;
}

function codesPage(profile, game) {
  const group = codeGroups.find((item) => item.id === profile.id);
  const active = (group?.codes || []).filter((item) => item.status === "active");
  const codeTable = active.length
    ? `<div class="table-scroll"><table class="value-table"><thead><tr><th>Code</th><th>Reviewed reward</th><th>Status</th></tr></thead><tbody>${active.map((item) => `<tr><th scope="row"><code>${escapeHtml(item.code)}</code></th><td>${escapeHtml(item.reward)}</td><td>Active in source review</td></tr>`).join("")}</tbody></table></div>`
    : `<div class="status-callout"><strong>${escapeHtml(group?.statusMessage || "No active codes confirmed")}</strong><p>${escapeHtml(group?.note || "No verified public codes were found in the latest review.")}</p></div>`;
  const directAnswer = active.length
    ? `${active.length} codes were active in the source review on ${reviewed}. They can expire without notice, so use the tracker feedback if Roblox rejects one.`
    : `No active public codes or confirmed redeem system were found in the ${reviewed} review. Do not trust pages that invent a code box or ask for a login.`;
  return pageShell({
    profile,
    game,
    slug: `${profile.id}-codes-not-expired`,
    title: `${profile.name} codes not expired`,
    description: `Current ${profile.name} code status, reviewed rewards, safe redemption steps, and clear reasons a code may not work.`,
    eyebrow: "Codes status",
    directAnswer,
    body: `
      <section><h2>Codes checked in the latest review</h2>${codeTable}<p class="source-note">${escapeHtml(group?.note || "")}</p></section>
      <section><h2>How to redeem without risking an account</h2><div class="answer-steps">${steps([
        `Open ${profile.name} from its official Roblox experience page.`,
        "Find the in-game Codes, Rewards, Gift, or Settings control. If the game has no such control, stop.",
        "Paste the code exactly, including capitalization and punctuation.",
        "Read the in-game result. Only Roblox can confirm whether the reward was granted.",
        "Never enter a Roblox password on a third-party codes page."
      ])}</div></section>
      <section><h2>Why a reviewed code can fail</h2><p>A code may expire after an event, require a level or group membership, be limited to one redemption, or be entered with the wrong capitalization. A review date is evidence of when the list was checked, not a promise that the developer will keep a code active.</p></section>
      <section><h2>Fake-code warning</h2><p>BlockRadar does not use code generators. A page that promises unlimited currency, asks for a browser extension, sends you through surveys, or requests a Roblox login is not a normal redemption path. Close it and use the official experience only.</p></section>`,
    sources: [
      [`Official ${profile.name} Roblox page`, game.officialUrl],
      [group?.sourceLabel || "Code status source", group?.sourceUrl || profile.extraSource]
    ]
  });
}

function beginnerPage(profile, game) {
  return pageShell({
    profile,
    game,
    slug: `${profile.id}-beginner-guide`,
    title: `${profile.name} beginner guide`,
    description: `A practical first-session route for ${profile.name}, with progression priorities, common mistakes, and a clear stopping point.`,
    eyebrow: "Beginner route",
    directAnswer: `Start with the core loop, protect a small resource reserve, and improve one repeated task at a time. The six-step route below is designed for a first useful session, not a speedrun.`,
    body: `
      <section><h2>Your first useful session</h2><div class="answer-steps">${steps(profile.beginner)}</div></section>
      <section><h2>Four mistakes that slow beginners down</h2><ul class="mistake-list">${list(profile.pitfalls)}</ul></section>
      <section><h2>What to upgrade first</h2><p>${escapeHtml(profile.bestIntro)}</p><div class="answer-grid">${pairs(profile.best.slice(0, 3))}</div></section>
      <section><h2>Set a stopping point</h2><p>Finish one complete objective, secure the resources earned, and stop before starting another long loop. This avoids wasting timed boosts and makes it easier to remember the next clear goal when you return.</p></section>
      <section><h2>Where to go next</h2><p>${escapeHtml(profile.routeIntro)}</p><p><a class="inline-cta" href="/${profile.id === "grow-a-garden-2" ? "grow-a-garden-2-night-stealing-and-garden-secrets" : profile.id === "99-nights-in-the-forest" ? "99-nights-in-the-forest-map-and-survival-route" : profile.id === "rivals" ? "rivals-maps-and-positioning" : profile.id === "steal-a-brainrot" ? "steal-a-brainrot-base-defense-secrets" : profile.id === "fish-it" ? "fish-it-locations-and-fishing-route" : "anime-expeditions-progression-and-secrets"}">Open the route guide</a></p></section>`,
    sources: [
      [`Official ${profile.name} Roblox page`, game.officialUrl],
      ["BlockRadar methodology", `${baseUrl}/methodology`]
    ]
  });
}

function safetyPage(profile, game) {
  return pageShell({
    profile,
    game,
    slug: `is-${profile.id}-safe-for-kids`,
    title: `Is ${profile.name} safe for kids?`,
    description: `A parent-focused ${profile.name} safety review covering official maturity, chat, scares, conflict, spending pressure, and safer settings.`,
    eyebrow: "Parent safety review",
    directAnswer: profile.verdict,
    body: `
      <section><h2>Safety decision table</h2><div class="answer-grid">${pairs(profile.safety)}</div></section>
      <section><h2>What the official rating does not decide</h2><p>An official maturity label describes content, not every player's behavior or every child's response. Public chat, competitive frustration, collection pressure, and the length of a repeated progression loop still need a family decision.</p></section>
      <section><h2>Five-minute parent check</h2><div class="answer-steps">${steps([
        "Open the official experience page and confirm the title and maturity label.",
        "Watch the central gameplay loop, not only the opening area.",
        "Open chat, purchase, trade, summon, or reward screens that the child will see.",
        "Agree on what information is never shared and which links are never opened.",
        "Set a time and spending boundary before the first long session."
      ])}</div></section>
      <section><h2>When to choose a different game</h2><p>${escapeHtml(game.avoidIf)} A lower-pressure alternative is better when the main loop itself conflicts with the child's comfort or family rules; settings cannot remove a game's central mechanic.</p></section>
      <section><h2>BlockRadar age guide</h2><p>The current BlockRadar guide is ${escapeHtml(game.age)} with a ${Number(game.safety).toFixed(1)}/10 independent safety score. This is context, not a substitute for Roblox parental controls or a caregiver's judgment.</p></section>`,
    sources: [
      [`Official ${profile.name} Roblox page`, game.officialUrl],
      ["Roblox parental controls", "https://en.help.roblox.com/hc/en-us/articles/30428310121620-Parental-Controls-Overview"],
      ["BlockRadar methodology", `${baseUrl}/methodology`]
    ]
  });
}

function bestPage(profile, game) {
  const slugByGame = {
    "grow-a-garden-2": "grow-a-garden-2-best-seeds-and-upgrades",
    "99-nights-in-the-forest": "99-nights-in-the-forest-best-classes-and-upgrades",
    rivals: "rivals-best-weapons",
    "steal-a-brainrot": "steal-a-brainrot-best-brainrots-and-values",
    "fish-it": "fish-it-best-rods",
    "anime-expeditions": "anime-expeditions-best-units-and-team-roles"
  };
  return pageShell({
    profile,
    game,
    slug: slugByGame[profile.id],
    title: profile.bestTitle,
    description: `${profile.bestTitle}, with decision criteria, practical progression order, and mistakes that waste resources.`,
    eyebrow: "Items and upgrades",
    directAnswer: profile.bestIntro,
    body: `
      <section><h2>Best choices by purpose</h2><div class="answer-grid">${pairs(profile.best)}</div></section>
      <section><h2>Use this decision order</h2><div class="answer-steps">${steps([
        "Name the exact problem: income, survival, range, capacity, wave coverage, or another bottleneck.",
        "Reject any option that does not solve that problem at the current progression level.",
        "Compare the full cost with the resources that must remain in reserve.",
        "Choose the smallest upgrade that creates a noticeable improvement.",
        "Test the result before committing the next scarce resource."
      ])}</div></section>
      <section><h2>Avoid the rarity trap</h2><p>Rare does not always mean useful now. An expensive item can be weaker for the current task, too costly to support, or difficult to trade. Keep the decision tied to the next repeatable objective.</p></section>
      <section><h2>When values or balance change</h2><p>Recheck this page's date after a major update. Developers can change stats, prices, rewards, or progression requirements without preserving an old community ranking.</p></section>`,
    sources: [
      [`Official ${profile.name} Roblox page`, game.officialUrl],
      ["Supporting current guide or value source", profile.extraSource]
    ]
  });
}

function routePage(profile, game) {
  const slugByGame = {
    "grow-a-garden-2": "grow-a-garden-2-night-stealing-and-garden-secrets",
    "99-nights-in-the-forest": "99-nights-in-the-forest-map-and-survival-route",
    rivals: "rivals-maps-and-positioning",
    "steal-a-brainrot": "steal-a-brainrot-base-defense-secrets",
    "fish-it": "fish-it-locations-and-fishing-route",
    "anime-expeditions": "anime-expeditions-progression-and-secrets"
  };
  return pageShell({
    profile,
    game,
    slug: slugByGame[profile.id],
    title: profile.mapTitle,
    description: `${profile.mapTitle}, with an ordered route, resource checkpoints, recovery plan, and repeatable session loop.`,
    eyebrow: "Map and secrets",
    directAnswer: profile.routeIntro,
    body: `
      <section><h2>The route, in order</h2><div class="route-list">${profile.route.map(([title, detail], index) => `<article><span>${index + 1}</span><div><h3>${escapeHtml(title)}</h3><p>${escapeHtml(detail)}</p></div></article>`).join("")}</div></section>
      <section><h2>The useful secret: preserve the return path</h2><p>Most failed routes do not fail at the destination. They fail because the player spends every resource, loses track of the exit, or starts a second objective before securing the first reward. Plan how the run ends before moving farther away.</p></section>
      <section><h2>Recovery after a bad run</h2><ul class="mistake-list">${list(profile.pitfalls.map((item) => `Check whether this caused the failure: ${item}`))}</ul><p>Change one cause on the next attempt. A smaller controlled route produces better information than repeating the same high-risk path.</p></section>
      <section><h2>Make it repeatable</h2><p>Use the same checkpoints until they feel automatic, then extend one step. A route that works reliably is more valuable than a faster path that loses progress half the time.</p></section>`,
    sources: [
      [`Official ${profile.name} Roblox page`, game.officialUrl],
      ["Supporting current guide source", profile.extraSource]
    ]
  });
}

const articleRows = [];
for (const profile of profiles) {
  const game = games.find((item) => item.id === profile.id);
  if (!game) throw new Error(`Missing game data for ${profile.id}`);
  const pages = [
    codesPage(profile, game),
    beginnerPage(profile, game),
    safetyPage(profile, game),
    bestPage(profile, game),
    routePage(profile, game)
  ];
  const slugs = pages.map((page) => page.match(/<link rel="canonical" href="[^"]+\/([^"/]+)" \/>/)?.[1]);
  const titles = pages.map((page) => page.match(/<h1>([^<]+)<\/h1>/)?.[1]);
  for (let index = 0; index < pages.length; index += 1) {
    await writeFile(path.join(root, `${slugs[index]}.html`), pages[index]);
    articleRows.push({
      game: profile.name,
      slug: slugs[index],
      title: titles[index],
      image: game.image
    });
  }
}

const guideGroups = profiles.map((profile) => {
  const rows = articleRows.filter((article) => article.game === profile.name);
  return `<section class="guide-topic-group">
    <div class="guide-topic-heading"><h3>${escapeHtml(profile.name)}</h3><a href="/games/${profile.id}">Game hub</a></div>
    <div class="guide-list growth-guide-list">${rows.map((article) => `<a href="/${article.slug}"><strong>${article.title}</strong><span>Reviewed ${reviewed}</span></a>`).join("")}</div>
  </section>`;
}).join("");
const growthBlock = `<!-- GROWTH_GUIDES_START -->
<section class="growth-guides">
  <div class="section-heading"><div><p class="eyebrow">30 focused answers</p><h2>Current guides for the fastest-growing games</h2></div><p>Codes, first-session routes, parent safety, best upgrades, and map or value strategy.</p></div>
  ${guideGroups}
</section>
<!-- GROWTH_GUIDES_END -->`;

const guidesPath = path.join(root, "guides.html");
const guidesHtml = await readFile(guidesPath, "utf8");
const markerPattern = /<!-- GROWTH_GUIDES_START -->[\s\S]*?<!-- GROWTH_GUIDES_END -->/;
const nextGuides = markerPattern.test(guidesHtml)
  ? guidesHtml.replace(markerPattern, growthBlock)
  : guidesHtml.replace("</main>", `${growthBlock}\n    </main>`);
await writeFile(guidesPath, nextGuides);

console.log(`Built ${articleRows.length} focused Roblox growth guides.`);
