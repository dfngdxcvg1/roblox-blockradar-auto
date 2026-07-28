const toolId = document.body.dataset.tool;

function safeText(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function compact(value) {
  return new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 2 }).format(value);
}

if (toolId === "blox-fruits-values") {
  const fruits = [
    ["West Dragon", 5660000000, 10],
    ["East Dragon", 5000000000, 10],
    ["Kitsune", 660000000, 10],
    ["Control", 160000000, 9],
    ["Tiger", 130000000, 8],
    ["Yeti", 120000000, 7],
    ["Gas", 60000000, 7],
    ["Lightning", 50000000, 5],
    ["Dough", 30000000, 9],
    ["Venom", 20000000, 8],
    ["T-Rex", 20000000, 8],
    ["Portal", 10000000, 10],
    ["Buddha", 10000000, 10],
    ["Spirit", 10000000, 7],
    ["Shadow", 6500000, 5]
  ].map(([name, value, demand]) => ({ name, value, demand }));
  const sides = { yours: [], theirs: [] };

  document.querySelectorAll("[data-fruit-select]").forEach((select) => {
    select.innerHTML = fruits.map((fruit) => (
      `<option value="${safeText(fruit.name)}">${safeText(fruit.name)} - ${compact(fruit.value)}</option>`
    )).join("");
  });

  function renderTrade() {
    for (const side of Object.keys(sides)) {
      const list = document.querySelector(`[data-trade-list="${side}"]`);
      list.innerHTML = sides[side].length
        ? sides[side].map((fruit, index) => `
          <button class="trade-item" type="button" data-remove-side="${side}" data-remove-index="${index}" title="Remove ${safeText(fruit.name)}">
            <span>${safeText(fruit.name)}</span><strong>${compact(fruit.value)}</strong><small>Demand ${fruit.demand}/10</small>
          </button>`).join("")
        : '<p class="empty-line">No fruit added.</p>';
      const total = sides[side].reduce((sum, fruit) => sum + fruit.value, 0);
      const demand = sides[side].length
        ? sides[side].reduce((sum, fruit) => sum + fruit.demand, 0) / sides[side].length
        : 0;
      document.querySelector(`[data-trade-total="${side}"]`).textContent = compact(total);
      document.querySelector(`[data-trade-demand="${side}"]`).textContent = demand ? demand.toFixed(1) : "0";
    }

    const yourTotal = sides.yours.reduce((sum, fruit) => sum + fruit.value, 0);
    const theirTotal = sides.theirs.reduce((sum, fruit) => sum + fruit.value, 0);
    const difference = theirTotal - yourTotal;
    const baseline = Math.max(yourTotal, theirTotal, 1);
    const percent = Math.round(Math.abs(difference) / baseline * 100);
    const verdict = document.querySelector("#trade-verdict");
    if (!yourTotal || !theirTotal) {
      verdict.innerHTML = "<strong>Add fruits to both sides.</strong><span>The calculator compares total community value and average demand.</span>";
    } else if (percent <= 5) {
      verdict.innerHTML = `<strong>Close by listed value</strong><span>${percent}% difference. Demand and current market behavior can still change the result.</span>`;
    } else if (difference > 0) {
      verdict.innerHTML = `<strong>Their side is higher by ${compact(difference)}</strong><span>${percent}% difference by the reviewed community estimates.</span>`;
    } else {
      verdict.innerHTML = `<strong>Your side is higher by ${compact(Math.abs(difference))}</strong><span>${percent}% difference by the reviewed community estimates.</span>`;
    }
  }

  document.addEventListener("click", (event) => {
    const add = event.target.closest("[data-add-fruit]");
    if (add) {
      const side = add.dataset.addFruit;
      const select = document.querySelector(`[data-fruit-select="${side}"]`);
      const fruit = fruits.find((item) => item.name === select.value);
      if (fruit && sides[side].length < 4) sides[side].push(fruit);
      renderTrade();
      return;
    }
    const remove = event.target.closest("[data-remove-side]");
    if (remove) {
      sides[remove.dataset.removeSide].splice(Number(remove.dataset.removeIndex), 1);
      renderTrade();
    }
  });
  renderTrade();
}

if (toolId === "mm2-values") {
  const items = [
    ["Traveler's Gun", 5600, "Very high", "Stable"],
    ["Evergun", 3450, "Very high", "Stable"],
    ["Constellation", 2700, "High", "Watch"],
    ["Evergreen", 2500, "High", "Stable"],
    ["Turkey", 2450, "High", "Stable"],
    ["Vampire's Gun", 1950, "High", "Watch"],
    ["Alienbeam", 1875, "High", "Stable"],
    ["Darkshot", 1625, "High", "Stable"],
    ["Darksword", 1600, "High", "Stable"],
    ["Raygun", 1400, "Good", "Stable"],
    ["Blossom", 1305, "Good", "Stable"],
    ["Sakura", 1295, "Good", "Stable"],
    ["Sunrise", 1125, "Good", "Watch"],
    ["Snowcannon", 850, "Good", "Stable"],
    ["Bauble", 825, "Good", "Watch"],
    ["Sunset", 625, "Regular", "Stable"],
    ["Soul", 605, "Regular", "Stable"],
    ["Spirit", 595, "Regular", "Stable"],
    ["Rainbow Gun", 420, "Regular", "Stable"],
    ["Flora", 410, "Regular", "Watch"]
  ].map(([name, value, demand, stability]) => ({ name, value, demand, stability }));
  const search = document.querySelector("#mm2-search");
  const sort = document.querySelector("#mm2-sort");
  const table = document.querySelector("#mm2-values-body");

  function renderValues() {
    const query = search.value.trim().toLowerCase();
    const rows = items.filter((item) => item.name.toLowerCase().includes(query));
    rows.sort(sort.value === "name"
      ? (a, b) => a.name.localeCompare(b.name)
      : sort.value === "demand"
        ? (a, b) => ["Very high", "High", "Good", "Regular"].indexOf(a.demand) - ["Very high", "High", "Good", "Regular"].indexOf(b.demand)
        : (a, b) => b.value - a.value);
    table.innerHTML = rows.map((item) => `
      <tr><th scope="row">${safeText(item.name)}</th><td>${item.value.toLocaleString()}</td><td>${item.demand}</td><td>${item.stability}</td></tr>
    `).join("") || '<tr><td colspan="4">No item matches that search.</td></tr>';
    document.querySelector("#mm2-count").textContent = `${rows.length} items shown`;
  }
  search.addEventListener("input", renderValues);
  sort.addEventListener("change", renderValues);
  renderValues();
}

if (toolId === "fish-it-rods") {
  const rods = [
    ["Luck Rod", 250, 50, 2, 15],
    ["Carbon Rod", 900, 30, 4, 20],
    ["Grass Rod", 1500, 55, 5, 250],
    ["Damascus Rod", 3000, 80, 4, 400],
    ["Ice Rod", 5000, 60, 7, 750],
    ["Lucky Rod", 10000, 130, 7, 5000],
    ["Midnight Rod", 50000, 100, 10, 10000],
    ["Steampunk Rod", 215000, 175, 19, 25000],
    ["Chrome Rod", 437000, 229, 23, 190000],
    ["Fluorescent Rod", 715000, 300, 23, 160000],
    ["Astral Rod", 1000000, 380, 43, 150000],
    ["Hazmat Rod", 1380000, 380, 32, 300000],
    ["Ares Rod", 3000000, 455, 56, 400000],
    ["Angler Rod", 8000000, 530, 71, 500000],
    ["Bamboo Rod", 12000000, 760, 98, 500000]
  ].map(([name, price, luck, speed, weight]) => ({ name, price, luck, speed, weight }));
  const locations = [
    ["Fisherman Island", "Start here, practice the catch input, and build the first cash reserve."],
    ["Kohana", "Move here when starter catches are reliable and the next rod is affordable."],
    ["Coral Reefs", "Use a rod with enough weight capacity before targeting heavier catches."],
    ["Tropical Grove", "Prioritize luck when your rod already handles the local weight range."],
    ["Crater Island", "Bring spare cash and avoid upgrading only for a small speed increase."],
    ["Lost Isle", "Treat this as a later route stop after building balanced rod stats."],
    ["Ancient Jungle", "Use high-capacity rods and plan a longer collection session."],
    ["Ocean", "Explore between islands when your rod and boat progression are ready."]
  ];
  const budget = document.querySelector("#rod-budget");
  const weight = document.querySelector("#rod-weight");
  const location = document.querySelector("#rod-location");
  location.innerHTML = locations.map(([name]) => `<option>${safeText(name)}</option>`).join("");

  function renderRod() {
    const maxBudget = Math.max(0, Number(budget.value || 0));
    const minWeight = Math.max(0, Number(weight.value || 0));
    const choices = rods.filter((rod) => rod.price <= maxBudget && rod.weight >= minWeight);
    choices.sort((a, b) => (b.luck + b.speed * 3) - (a.luck + a.speed * 3));
    const best = choices[0];
    const result = document.querySelector("#rod-result");
    result.innerHTML = best
      ? `<strong>${safeText(best.name)}</strong><span>Price ${best.price.toLocaleString()} &middot; Luck ${best.luck} &middot; Speed ${best.speed} &middot; Weight ${best.weight.toLocaleString()}</span>`
      : "<strong>No listed rod fits both limits.</strong><span>Raise the budget or lower the minimum weight requirement.</span>";
    const route = locations.find(([name]) => name === location.value);
    document.querySelector("#location-result").innerHTML = `<strong>${safeText(route[0])}</strong><span>${safeText(route[1])}</span>`;
  }
  budget.addEventListener("input", renderRod);
  weight.addEventListener("input", renderRod);
  location.addEventListener("change", renderRod);
  document.querySelector("#rod-table-body").innerHTML = rods.map((rod) => `
    <tr><th scope="row">${safeText(rod.name)}</th><td>${rod.price.toLocaleString()}</td><td>${rod.luck}</td><td>${rod.speed}</td><td>${rod.weight.toLocaleString()}</td></tr>
  `).join("");
  renderRod();
}

if (toolId === "99-nights-checklist") {
  const storageKey = "blockradar-99-nights-checklist-v1";
  const checks = [...document.querySelectorAll("[data-survival-check]")];

  function readState() {
    try {
      return JSON.parse(localStorage.getItem(storageKey) || "{}");
    } catch {
      return {};
    }
  }

  function renderProgress() {
    const completed = checks.filter((check) => check.checked).length;
    const percent = Math.round(completed / checks.length * 100);
    document.querySelector("#checklist-progress").textContent = `${completed} of ${checks.length} complete`;
    document.querySelector("#checklist-meter").style.width = `${percent}%`;
  }

  const state = readState();
  checks.forEach((check) => {
    check.checked = Boolean(state[check.value]);
    check.addEventListener("change", () => {
      const next = readState();
      next[check.value] = check.checked;
      localStorage.setItem(storageKey, JSON.stringify(next));
      renderProgress();
    });
  });
  document.querySelector("#checklist-reset").addEventListener("click", () => {
    localStorage.removeItem(storageKey);
    checks.forEach((check) => { check.checked = false; });
    renderProgress();
  });
  renderProgress();
}
