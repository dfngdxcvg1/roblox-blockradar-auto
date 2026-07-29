(() => {
  const searchIndex = window.blockRadarSearchIndex || [];
  const forms = document.querySelectorAll('[data-site-search]');
  const queryInput = document.querySelector('#search-query');
  const resultsRoot = document.querySelector('#search-results');
  const summary = document.querySelector('#search-summary');
  const typeFilter = document.querySelector('#search-type');
  let gapTimer = 0;
  let lastGap = '';

  function escapeHtml(value) {
    return String(value ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }

  function normalize(value) {
    return String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  }

  function scoreItem(item, query) {
    const normalized = normalize(query);
    if (!normalized) return item.popularity || 0;
    const terms = normalized.split(/\s+/).filter(Boolean);
    const title = normalize(item.title);
    const text = normalize(`${item.title} ${item.description} ${item.keywords}`);
    let score = terms.every((term) => text.includes(term)) ? 20 : -100;
    if (title === normalized) score += 120;
    if (title.startsWith(normalized)) score += 80;
    if (title.includes(normalized)) score += 55;
    for (const term of terms) {
      if (title.split(' ').some((word) => word.startsWith(term))) score += 12;
      if (text.includes(term)) score += 4;
    }
    return score + (item.popularity || 0) / 10;
  }

  function searchItems(query, type = 'All', limit = 60) {
    return searchIndex
      .filter((item) => type === 'All' || item.type === type)
      .map((item) => ({ item, score: scoreItem(item, query) }))
      .filter(({ score }) => score >= 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(({ item }) => item);
  }

  function resultCard(item) {
    const image = item.image
      ? `<img src="${escapeHtml(item.image)}" alt="" loading="lazy" />`
      : `<span class="search-result-icon">${escapeHtml(item.type.slice(0, 2).toUpperCase())}</span>`;
    return `<a class="search-result-row" href="${escapeHtml(item.url)}">
      ${image}
      <span><small>${escapeHtml(item.type)}</small><strong>${escapeHtml(item.title)}</strong><p>${escapeHtml(item.description)}</p></span>
      <b>Open</b>
    </a>`;
  }

  function gapSessionId() {
    const key = 'blockradar-feedback-session-v1';
    try {
      const current = localStorage.getItem(key);
      if (current) return current;
      const next = crypto.randomUUID?.() || `${Date.now()}_${Math.random().toString(36).slice(2)}`;
      localStorage.setItem(key, next);
      return next;
    } catch {
      return `${Date.now()}_${Math.random().toString(36).slice(2)}`;
    }
  }

  function recordGap(query) {
    const normalized = normalize(query);
    if (normalized.length < 3 || normalized === lastGap) return;
    clearTimeout(gapTimer);
    gapTimer = setTimeout(async () => {
      lastGap = normalized;
      try {
        await fetch('/api/query-gap', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: query.slice(0, 120),
            page: `${window.location.pathname}${window.location.search}`.slice(0, 240),
            sessionId: gapSessionId()
          }),
          keepalive: true
        });
      } catch {
        // Search remains usable when anonymous demand logging is unavailable.
      }
    }, 900);
  }

  function renderResults() {
    if (!resultsRoot || !queryInput) return;
    const query = queryInput.value.trim();
    const type = typeFilter?.value || 'All';
    const results = searchItems(query, type);
    summary.textContent = query
      ? `${results.length} result${results.length === 1 ? '' : 's'} for "${query}"`
      : `${results.length} popular games, guides, codes, and tools`;
    resultsRoot.innerHTML = results.length
      ? results.map(resultCard).join('')
      : '<div class="empty-state"><strong>No exact answer yet.</strong><p>Try the game name plus codes, guide, values, map, safety, or tool. This anonymous search gap helps prioritize the next reviewed answer.</p></div>';
    if (query && !results.length) recordGap(query);
    const url = new URL(window.location.href);
    if (query) url.searchParams.set('q', query);
    else url.searchParams.delete('q');
    if (type !== 'All') url.searchParams.set('type', type);
    else url.searchParams.delete('type');
    history.replaceState({}, '', url);
  }

  function bindSuggestions(form) {
    const input = form.querySelector('input[type=search]');
    const suggestions = form.querySelector('[data-search-suggestions]');
    if (!input || !suggestions) return;
    const render = () => {
      const query = input.value.trim();
      const items = searchItems(query, 'All', 6);
      suggestions.innerHTML = items.map((item) => `<a href="${escapeHtml(item.url)}"><small>${escapeHtml(item.type)}</small><strong>${escapeHtml(item.title)}</strong></a>`).join('');
      suggestions.hidden = !query || !items.length;
    };
    input.addEventListener('input', render);
    input.addEventListener('focus', render);
    input.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') suggestions.hidden = true;
    });
    document.addEventListener('click', (event) => {
      if (!form.contains(event.target)) suggestions.hidden = true;
    });
  }

  forms.forEach((form) => {
    bindSuggestions(form);
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const input = form.querySelector('input[type=search]');
      const query = input?.value.trim() || '';
      if (resultsRoot && input === queryInput) renderResults();
      else window.location.href = `/search${query ? `?q=${encodeURIComponent(query)}` : ''}`;
    });
  });

  if (queryInput) {
    const params = new URLSearchParams(window.location.search);
    queryInput.value = params.get('q') || '';
    if (typeFilter && [...typeFilter.options].some((option) => option.value === params.get('type'))) typeFilter.value = params.get('type');
    queryInput.addEventListener('input', renderResults);
    typeFilter?.addEventListener('change', renderResults);
    document.querySelectorAll('[data-search-term]').forEach((button) => {
      button.addEventListener('click', () => {
        queryInput.value = button.dataset.searchTerm;
        renderResults();
        queryInput.focus();
      });
    });
    renderResults();
  }

  window.BlockRadarSearch = { search: searchItems };
})();
