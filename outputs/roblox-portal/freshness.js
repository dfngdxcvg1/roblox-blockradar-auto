(() => {
  function status(dateValue, thresholds = {}) {
    const checked = new Date(dateValue);
    if (!dateValue || Number.isNaN(checked.getTime())) return { label: 'Update pending', className: 'pending', days: null };
    const days = Math.max(0, Math.floor((Date.now() - checked.getTime()) / 86400000));
    const freshDays = thresholds.freshDays ?? 3;
    const warningDays = thresholds.warningDays ?? 14;
    if (days <= freshDays) return { label: days === 0 ? 'Updated today' : `Updated ${days}d ago`, className: 'fresh', days };
    if (days <= warningDays) return { label: `Reviewed ${days}d ago`, className: 'recent', days };
    return { label: `Review overdue: ${days}d`, className: 'overdue', days };
  }

  function refresh(root = document) {
    root.querySelectorAll('[data-freshness-date]').forEach((element) => {
      const result = status(element.dataset.freshnessDate, {
        freshDays: Number(element.dataset.freshDays || 3),
        warningDays: Number(element.dataset.warningDays || 14)
      });
      element.textContent = result.label;
      element.classList.add('freshness-badge', result.className);
      element.dataset.freshnessDays = result.days ?? '';
    });
  }

  window.BlockRadarFreshness = { status, refresh };
  refresh();
})();
