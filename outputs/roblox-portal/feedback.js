(() => {
  const voteKey = "blockradar-feedback-v2";
  const queueKey = "blockradar-feedback-queue-v1";
  const sessionKey = "blockradar-feedback-session-v1";

  function readJson(key, fallback) {
    try {
      const value = JSON.parse(localStorage.getItem(key) || "null");
      return value ?? fallback;
    } catch {
      return fallback;
    }
  }

  function writeJson(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      return false;
    }
    return true;
  }

  function sessionId() {
    try {
      const current = localStorage.getItem(sessionKey);
      if (current) return current;
      const next = crypto.randomUUID?.() || `${Date.now()}_${Math.random().toString(36).slice(2)}`;
      localStorage.setItem(sessionKey, next);
      return next;
    } catch {
      return `${Date.now()}_${Math.random().toString(36).slice(2)}`;
    }
  }

  function refresh(group, selected, state = "local") {
    group.querySelectorAll("[data-feedback-value]").forEach((button) => {
      const active = button.dataset.feedbackValue === selected;
      button.classList.toggle("is-selected", active);
      button.setAttribute("aria-pressed", String(active));
    });
    const status = group.querySelector("[data-feedback-status]");
    if (!status) return;
    if (!selected) status.textContent = state === "syncing" ? "Removing your vote..." : "Choose one answer. No account is required.";
    else if (state === "syncing") status.textContent = "Saved on this device. Syncing...";
    else if (state === "synced") status.textContent = "Saved and synced. Thanks for keeping BlockRadar current.";
    else status.textContent = "Saved on this device. Sync will retry automatically.";
  }

  function queuePayload(payload) {
    const queue = readJson(queueKey, []);
    const withoutCurrent = queue.filter((item) => item.scope !== payload.scope);
    writeJson(queueKey, [...withoutCurrent, payload].slice(-100));
  }

  function removeQueued(scope) {
    const queue = readJson(queueKey, []);
    writeJson(queueKey, queue.filter((item) => item.scope !== scope));
  }

  async function send(payload) {
    const response = await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true
    });
    if (!response.ok) throw new Error("Feedback sync failed");
    removeQueued(payload.scope);
  }

  async function syncQueue() {
    if (!navigator.onLine) return;
    const queue = readJson(queueKey, []);
    for (const payload of queue.slice(0, 20)) {
      try {
        await send(payload);
      } catch {
        break;
      }
    }
  }

  function init(root = document) {
    const votes = readJson(voteKey, readJson("blockradar-feedback-v1", {}));
    root.querySelectorAll("[data-feedback-scope]").forEach((group) => {
      const scope = group.dataset.feedbackScope;
      refresh(group, votes[scope]);
      if (group.dataset.feedbackBound) return;
      group.dataset.feedbackBound = "true";
      group.addEventListener("click", async (event) => {
        const button = event.target.closest("[data-feedback-value]");
        if (!button) return;
        const selected = votes[scope] === button.dataset.feedbackValue ? "" : button.dataset.feedbackValue;
        if (selected) votes[scope] = selected;
        else delete votes[scope];
        writeJson(voteKey, votes);
        const payload = {
          scope,
          value: selected || "cleared",
          page: `${window.location.pathname}${window.location.search}`.slice(0, 240),
          sessionId: sessionId()
        };
        queuePayload(payload);
        refresh(group, selected, "syncing");
        try {
          await send(payload);
          refresh(group, selected, "synced");
        } catch {
          refresh(group, selected, "local");
        }
      });
    });
  }

  window.BlockRadarFeedback = { init, syncQueue };
  init();
  syncQueue();
  window.addEventListener("online", syncQueue);
})();
