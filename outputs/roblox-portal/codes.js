const codeGroups = window.blockRadarCodeGroups || [];
const codesGame = document.querySelector("#codes-game");
const codesStatus = document.querySelector("#codes-status");
const codesSearch = document.querySelector("#codes-search");
const codesList = document.querySelector("#codes-list");
const codesSummary = document.querySelector("#codes-summary");
const copyStatus = document.querySelector("#copy-status");

function codeText(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderCodes() {
  const selectedGame = codesGame.value;
  const selectedStatus = codesStatus.value;
  const query = codesSearch.value.trim().toLowerCase();
  const groups = codeGroups.filter((group) => selectedGame === "all" || group.id === selectedGame);
  const rows = groups.flatMap((group) => group.codes
    .filter((item) => selectedStatus === "all" || item.status === selectedStatus)
    .filter((item) => [item.code, item.reward, group.name].join(" ").toLowerCase().includes(query))
    .map((item) => ({ ...item, group })));

  const noCodeGroups = groups.filter((group) => !group.codes.length);
  codesSummary.textContent = `${rows.length} code${rows.length === 1 ? "" : "s"} across ${groups.length} tracked game${groups.length === 1 ? "" : "s"}.`;
  const codeRows = rows.map(({ group, code, reward, status }) => `
    <article class="code-row">
      <div>
        <span class="code-game">${codeText(group.name)}</span>
        <code>${codeText(code)}</code>
      </div>
      <p>${codeText(reward)}</p>
      <span class="code-status ${status}">${status === "active" ? "Active in source review" : "Expired"}</span>
      <button class="copy-code" type="button" data-code="${codeText(code)}">Copy</button>
      <div class="feedback-inline" data-feedback-scope="code:${codeText(group.id)}:${codeText(code)}">
        <span>Did it work?</span>
        <button type="button" data-feedback-value="worked" aria-pressed="false">Worked</button>
        <button type="button" data-feedback-value="expired" aria-pressed="false">Expired</button>
        <button type="button" data-feedback-value="outdated" aria-pressed="false">Report outdated</button>
        <small data-feedback-status>Your choice is stored only on this device.</small>
      </div>
    </article>`).join("");
  const noCodeRows = noCodeGroups.map((group) => `
    <article class="empty-state code-empty">
      <strong>${codeText(group.name)}: ${codeText(group.statusMessage || "No active codes confirmed")}</strong>
      <p>${codeText(group.note)}</p>
      <a href="${codeText(group.gameUrl)}">Open the game guide</a>
    </article>`).join("");
  codesList.innerHTML = codeRows || noCodeRows
    ? `${codeRows}${noCodeRows}`
    : '<div class="empty-state">No codes match these filters.</div>';

  const sourceCards = groups.map((group) => `
    <article>
      <strong>${codeText(group.name)}</strong>
      <span>Reviewed ${codeText(group.lastReviewed)}</span>
      <p>${codeText(group.note)}</p>
      <a href="${codeText(group.gameUrl)}">Open ${codeText(group.name)} guide</a>
      <a href="${codeText(group.sourceUrl)}" target="_blank" rel="noopener">View ${codeText(group.sourceLabel)}</a>
    </article>`).join("");
  document.querySelector("#code-sources").innerHTML = sourceCards;
  window.BlockRadarFeedback?.init(codesList);

  const url = new URL(window.location.href);
  if (selectedGame === "all") url.searchParams.delete("game");
  else url.searchParams.set("game", selectedGame);
  if (selectedStatus === "active") url.searchParams.delete("status");
  else url.searchParams.set("status", selectedStatus);
  if (query) url.searchParams.set("q", query);
  else url.searchParams.delete("q");
  history.replaceState({}, "", url);
}

document.addEventListener("click", async (event) => {
  const button = event.target.closest("[data-code]");
  if (!button) return;
  try {
    await navigator.clipboard.writeText(button.dataset.code);
    copyStatus.textContent = `${button.dataset.code} copied.`;
    button.textContent = "Copied";
    setTimeout(() => { button.textContent = "Copy"; }, 1400);
  } catch {
    copyStatus.textContent = `Select and copy ${button.dataset.code}.`;
  }
});

codesGame.innerHTML = [
  '<option value="all">All tracked games</option>',
  ...codeGroups.map((group) => `<option value="${group.id}">${codeText(group.name)}</option>`)
].join("");
const params = new URLSearchParams(window.location.search);
if ([...codesGame.options].some((option) => option.value === params.get("game"))) {
  codesGame.value = params.get("game");
}
if ([...codesStatus.options].some((option) => option.value === params.get("status"))) {
  codesStatus.value = params.get("status");
}
codesSearch.value = params.get("q") || "";
codesGame.addEventListener("change", renderCodes);
codesStatus.addEventListener("change", renderCodes);
codesSearch.addEventListener("input", renderCodes);
renderCodes();
