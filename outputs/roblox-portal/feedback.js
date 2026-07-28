(() => {
  const storageKey = "blockradar-feedback-v1";

  function readVotes() {
    try {
      return JSON.parse(localStorage.getItem(storageKey) || "{}");
    } catch {
      return {};
    }
  }

  function writeVotes(votes) {
    try {
      localStorage.setItem(storageKey, JSON.stringify(votes));
    } catch {
      // The controls still work for the current page when storage is unavailable.
    }
  }

  function refresh(group, selected) {
    group.querySelectorAll("[data-feedback-value]").forEach((button) => {
      const active = button.dataset.feedbackValue === selected;
      button.classList.toggle("is-selected", active);
      button.setAttribute("aria-pressed", String(active));
    });
    const status = group.querySelector("[data-feedback-status]");
    if (status) {
      status.textContent = selected
        ? "Saved on this device. Thanks for helping keep BlockRadar current."
        : "Your choice is stored only on this device.";
    }
  }

  function init(root = document) {
    const votes = readVotes();
    root.querySelectorAll("[data-feedback-scope]").forEach((group) => {
      const scope = group.dataset.feedbackScope;
      refresh(group, votes[scope]);
      if (group.dataset.feedbackBound) return;
      group.dataset.feedbackBound = "true";
      group.addEventListener("click", (event) => {
        const button = event.target.closest("[data-feedback-value]");
        if (!button) return;
        const nextValue = button.dataset.feedbackValue;
        votes[scope] = votes[scope] === nextValue ? "" : nextValue;
        writeVotes(votes);
        refresh(group, votes[scope]);
      });
    });
  }

  window.BlockRadarFeedback = { init };
  init();
})();
