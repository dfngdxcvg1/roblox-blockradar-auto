(() => {
  const games = window.blockRadarGames || [];
  const codeGroups = window.blockRadarCodeGroups || [];
  const recentKey = 'blockradar:recently-viewed';
  const visitKey = 'blockradar:last-dashboard-visit';

  function readList(key) {
    try {
      const value = JSON.parse(localStorage.getItem(key) || '[]');
      return Array.isArray(value) ? value : [];
    } catch {
      return [];
    }
  }

  function escapeHtml(value) {
    return String(value ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
  }

  function gameRow(game, note) {
    return `<a class="radar-game-row" href="${game.page}">
      <img src="${escapeHtml(game.image)}" alt="" loading="lazy" />
      <span><strong>${escapeHtml(game.name)}</strong><small>${escapeHtml(note)}</small><em>${escapeHtml(game.liveLabel || 'Live data updating')}</em></span>
      <b>Open</b>
    </a>`;
  }

  const savedIds = window.BlockRadarFavorites?.all() || [];
  const recentIds = readList(recentKey);
  const savedGames = savedIds.map((id) => games.find((game) => game.id === id)).filter(Boolean);
  const recentGames = recentIds.map((id) => games.find((game) => game.id === id)).filter(Boolean);
  const previousVisit = localStorage.getItem(visitKey);
  const updatedSaved = previousVisit
    ? savedGames.filter((game) => new Date(game.updatedAt || 0) > new Date(previousVisit))
    : savedGames;
  const savedCodeGroups = codeGroups.filter((group) => savedIds.includes(group.id));

  const setText = (selector, value) => {
    const element = document.querySelector(selector);
    if (element) element.textContent = String(value);
  };
  setText('#radar-saved-count', savedGames.length);
  setText('#radar-update-count', updatedSaved.length);
  setText('#radar-code-count', savedCodeGroups.reduce((sum, group) => sum + group.codes.filter((code) => code.status === 'active').length, 0));
  setText('#radar-recent-count', recentGames.length);

  const favoritesRoot = document.querySelector('#radar-favorites');
  if (favoritesRoot) favoritesRoot.innerHTML = savedGames.length
    ? savedGames.map((game) => gameRow(game, game.officialRank ? `Official chart #${game.officialRank}` : game.category)).join('')
    : '<div class="dashboard-empty"><strong>No saved games yet.</strong><p>Save a game from any hub and it will appear here with live updates.</p><a href="/games">Browse games</a></div>';

  const recentRoot = document.querySelector('#radar-recent');
  if (recentRoot) recentRoot.innerHTML = recentGames.length
    ? recentGames.slice(0, 6).map((game) => gameRow(game, `Recently viewed | ${game.category}`)).join('')
    : '<div class="dashboard-empty"><strong>No recent games yet.</strong><p>Game hubs you open will be kept on this device.</p></div>';

  const updatesRoot = document.querySelector('#radar-updates');
  if (updatesRoot) updatesRoot.innerHTML = updatedSaved.length
    ? updatedSaved.map((game) => gameRow(game, `${game.ratingLabel || 'Rating updating'} | Data refreshed`)).join('')
    : '<div class="dashboard-empty"><strong>You are caught up.</strong><p>No saved game has newer live data since your last dashboard visit.</p></div>';

  const codesRoot = document.querySelector('#radar-codes');
  if (codesRoot) codesRoot.innerHTML = savedCodeGroups.length
    ? savedCodeGroups.map((group) => {
        const active = group.codes.filter((code) => code.status === 'active');
        return `<a class="radar-code-row" href="/codes?game=${group.id}"><span><strong>${escapeHtml(group.name)}</strong><small>${active.length ? `${active.length} reviewed active code${active.length === 1 ? '' : 's'}` : escapeHtml(group.statusMessage || 'No active codes confirmed')}</small></span><span data-freshness-date="${group.lastReviewed}" data-fresh-days="3" data-warning-days="7"></span></a>`;
      }).join('')
    : '<div class="dashboard-empty"><strong>No saved game has tracked codes.</strong><p>Save Blox Fruits, Fish It, RIVALS, or another code-tracked game.</p></div>';

  const checklistState = (() => {
    try { return JSON.parse(localStorage.getItem('blockradar-99-nights-checklist-v1') || '{}'); } catch { return {}; }
  })();
  const checklistDone = Object.values(checklistState).filter(Boolean).length;
  setText('#radar-checklist-progress', `${checklistDone}/12`);

  document.querySelector('#clear-recent')?.addEventListener('click', () => {
    localStorage.removeItem(recentKey);
    if (recentRoot) recentRoot.innerHTML = '<div class="dashboard-empty"><strong>Recent history cleared.</strong><p>New game hubs will appear here as you browse.</p></div>';
    setText('#radar-recent-count', 0);
  });

  window.BlockRadarFreshness?.refresh(document);
  localStorage.setItem(visitKey, new Date().toISOString());
})();
