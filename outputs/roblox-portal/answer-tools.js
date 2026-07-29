(() => {
  const games = window.blockRadarGames || [];

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function formatNumber(value) {
    return Number.isFinite(Number(value)) ? new Intl.NumberFormat("en-US").format(Number(value)) : "Updating";
  }

  function relativeDate(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return { label: "Update time unavailable", days: Infinity };
    const elapsed = Math.max(0, Date.now() - date.getTime());
    const hours = Math.floor(elapsed / 3600000);
    if (hours < 1) return { label: "Updated within the last hour", days: 0 };
    if (hours < 24) return { label: `Updated ${hours}h ago`, days: 0 };
    const days = Math.floor(hours / 24);
    return { label: `Updated ${days}d ago`, days };
  }

  function cleanSummary(value) {
    return String(value || "")
      .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 240);
  }

  function initUpdates() {
    const root = document.querySelector("#update-results");
    if (!root) return;
    const query = document.querySelector("#update-query");
    const windowFilter = document.querySelector("#update-window");
    const sort = document.querySelector("#update-sort");
    const summary = document.querySelector("#update-summary");
    const built = document.querySelector("#update-built");

    const render = () => {
      const term = query.value.trim().toLowerCase();
      const maxDays = windowFilter.value === "all" ? Infinity : Number(windowFilter.value);
      const rows = games
        .map((game) => ({ game, timing: relativeDate(game.experienceUpdatedAt) }))
        .filter(({ game, timing }) => (!term || `${game.name} ${game.category}`.toLowerCase().includes(term)) && timing.days <= maxDays)
        .sort((left, right) => {
          if (sort.value === "players") return Number(right.game.playing || 0) - Number(left.game.playing || 0);
          if (sort.value === "name") return left.game.name.localeCompare(right.game.name);
          return new Date(right.game.experienceUpdatedAt || 0) - new Date(left.game.experienceUpdatedAt || 0);
        });

      summary.textContent = `${rows.length} game${rows.length === 1 ? "" : "s"} match this update view`;
      const newestBuild = games.map((game) => game.chartUpdatedAt).filter(Boolean).sort().at(-1);
      built.textContent = newestBuild ? `Official activity snapshot ${new Date(newestBuild).toLocaleString()}` : "";
      root.innerHTML = rows.length ? rows.map(({ game, timing }) => `
        <article class="update-row">
          <img src="${escapeHtml(game.image)}" alt="" loading="lazy" />
          <div>
            <small>${escapeHtml(game.category)} &middot; ${escapeHtml(timing.label)}</small>
            <h2><a href="${escapeHtml(game.page)}">${escapeHtml(game.name)}</a></h2>
            <p>${escapeHtml(cleanSummary(game.officialSummary) || game.summary)}</p>
            <span>${formatNumber(game.playing)} playing now</span>
          </div>
          <div class="update-row-actions">
            <a href="${escapeHtml(game.officialUrl)}" target="_blank" rel="noopener">Official page</a>
            <button class="favorite-button" type="button" data-favorite-id="${escapeHtml(game.id)}" aria-pressed="false">Save</button>
          </div>
        </article>`).join("") : '<div class="empty-state"><strong>No games match this view.</strong><p>Expand the update window or clear the game search.</p></div>';
      window.BlockRadarFavorites?.refresh?.(root);
    };

    query.addEventListener("input", render);
    windowFilter.addEventListener("change", render);
    sort.addEventListener("change", render);
    render();
  }

  const sharedFixes = {
    "wont-open": [
      "Check Roblox service status first. A platform incident cannot be repaired by reinstalling the app.",
      "Restart the device completely, then launch Roblox from the official app or roblox.com only.",
      "Confirm the device clock, operating system, and Roblox app are updated.",
      "Temporarily close overlays, screen recorders, unofficial launchers, and security tools that may block Roblox, then test once.",
      "Reinstall only after the earlier checks fail. Never download a replacement launcher from a search ad or third-party site."
    ],
    stuck: [
      "Check Roblox service status and try a second experience. This separates a platform problem from one game.",
      "Leave the server, wait one minute, and join a different public server for the same game.",
      "Switch once between Wi-Fi and a trusted mobile connection if available. Do not use an unknown public network.",
      "Reduce Roblox graphics quality before joining a heavy experience again.",
      "Restart the router only if several devices on the same network also fail."
    ],
    assets: [
      "Open a second Roblox experience and the Roblox home screen to see whether images are missing everywhere.",
      "Disable any VPN, DNS filter, ad blocker, or security filter for one controlled test, then restore it.",
      "Check free storage and restart the device so the app can rebuild temporary assets.",
      "Update Roblox and the graphics driver or operating system through official update tools.",
      "If only one game is affected, report the experience to its creator and avoid deleting unrelated account data."
    ],
    disconnect: [
      "Write down the full error code before closing it.",
      "Check Roblox status and test another experience.",
      "Move closer to the router or use a wired connection where the device supports it.",
      "Stop large downloads and streaming on the same network for one test.",
      "Use Roblox's connection-problem guide for firewall and port checks; do not disable protection permanently."
    ],
    lag: [
      "Distinguish network lag from graphics lag: delayed actions suggest network; low frame rate and stutter suggest graphics.",
      "Lower Roblox graphics quality one step at a time and close other demanding apps.",
      "Check device temperature, battery-saving mode, and free storage.",
      "Test a less crowded server or a simpler experience.",
      "Restore one setting at a time after performance becomes stable."
    ],
    "one-game": [
      "Join two other Roblox experiences. If both work, the account and base connection are probably not the main problem.",
      "Check the affected game's official page for a shutdown, update, device restriction, or private-server requirement.",
      "Join a different server and remove any private-server link parameters.",
      "Lower graphics quality before the next join attempt.",
      "Report the game-specific failure with device, time, and error code; avoid reinstalling the entire operating system for one experience."
    ]
  };

  const deviceNotes = {
    windows: "On Windows, use the official Roblox app or roblox.com launcher. Update the display driver through Windows Update or the GPU maker, and test without unofficial launchers.",
    mobile: "On mobile, check free storage, app permissions, battery-saving mode, and the official App Store or Google Play update before reinstalling.",
    xbox: "On Xbox, confirm the console account, Roblox account link, network test, and console update. Fully quit Roblox instead of only suspending it.",
    playstation: "On PlayStation, check PSN and Roblox status, fully close the game, test the console network, and install system and Roblox updates.",
    chromebook: "On Chromebook, confirm Google Play support, ChromeOS updates, free storage, and whether a school or managed network blocks Roblox."
  };

  function initDeviceFixer() {
    const form = document.querySelector("#device-fixer-form");
    if (!form) return;
    const result = document.querySelector("#device-fixer-result");
    const render = () => {
      const device = document.querySelector("#fix-device").value;
      const symptom = document.querySelector("#fix-symptom").value;
      result.innerHTML = `<p class="eyebrow">Ordered plan</p><h2>${escapeHtml(document.querySelector("#fix-device").selectedOptions[0].text)}: ${escapeHtml(document.querySelector("#fix-symptom").selectedOptions[0].text)}</h2>
        <ol class="fix-steps">${sharedFixes[symptom].map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ol>
        <div class="result-note"><strong>Device check</strong><p>${escapeHtml(deviceNotes[device])}</p></div>`;
    };
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      render();
      result.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
    form.addEventListener("change", render);
    render();
  }

  const setupAdvice = {
    pc: {
      title: "Mouse and keyboard baseline",
      notes: ["Disable pointer acceleration in the operating-system mouse path if it makes movement inconsistent.", "Start with a moderate in-game sensitivity and enough mouse space for a controlled turn.", "Keep graphics stable enough that frame-time changes do not feel like aim changes."],
      buttons: "Keep weapon, reload, slide, and utility keys reachable without moving the movement hand."
    },
    mobile: {
      title: "Touch baseline",
      notes: ["Increase the fire and movement control size until they remain reliable during a fast swipe.", "Leave clear screen space around the crosshair so the target is not hidden by a thumb.", "Use a stable frame-rate setting before increasing visual quality."],
      buttons: "Separate fire, jump, slide, reload, and weapon controls so two common actions do not occupy the same thumb path."
    },
    controller: {
      title: "Controller baseline",
      notes: ["Start with moderate look sensitivity and a lower aiming sensitivity for precision.", "Use the smallest deadzone that does not create stick drift.", "Keep acceleration predictable; a fast maximum turn is useful only when small corrections remain controlled."],
      buttons: "Map jump, slide, reload, and weapon swap where they do not require releasing aim during a duel."
    }
  };

  const styleAdvice = {
    balanced: ["Use a compact crosshair with a visible center.", "Test at close and medium range before changing the setup.", "Favor consistency across weapons over one extreme setting."],
    tracking: ["Use a small gap so the target remains visible inside the crosshair.", "Avoid a large center dot that hides movement.", "Tune sensitivity while following a moving target, not while flicking at a wall."],
    precision: ["Use a fine center point and low visual clutter.", "Lower aiming sensitivity one step if small corrections jump past the target.", "Judge the setup with repeatable peek shots."],
    movement: ["Keep a high-contrast crosshair visible during slides and fast turns.", "Preserve enough turn speed for close threats.", "Do not raise sensitivity until normal tracking breaks."]
  };

  const problemAdvice = {
    overaim: "Lower the relevant look or aim sensitivity one step. Keep every other setting unchanged for three rounds.",
    underaim: "Raise sensitivity one step or increase available swipe or stick travel. Check frame rate before assuming sensitivity is the only cause.",
    visibility: "Use a brighter compact crosshair, reduce unnecessary visual effects where possible, and keep the center area clear.",
    buttons: "Increase spacing between the two controls most often pressed by mistake, then retest before moving the rest."
  };

  function initRivalsBuilder() {
    const form = document.querySelector("#rivals-builder-form");
    if (!form) return;
    const result = document.querySelector("#rivals-builder-result");
    const preview = document.querySelector("#crosshair-preview");
    const render = () => {
      const platform = document.querySelector("#rivals-platform").value;
      const style = document.querySelector("#rivals-style").value;
      const problem = document.querySelector("#rivals-problem").value;
      const setup = setupAdvice[platform];
      preview.className = `crosshair-preview crosshair-${style}`;
      const recommendations = [...setup.notes, ...styleAdvice[style]];
      result.innerHTML = `<p class="eyebrow">Starting setup</p><h2>${escapeHtml(setup.title)}</h2>
        <p class="result-lead">${escapeHtml(problemAdvice[problem])}</p>
        <ul class="setup-list">${recommendations.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
        <div class="result-note"><strong>Control layout</strong><p>${escapeHtml(setup.buttons)}</p></div>
        <button type="button" class="copy-plan-button">Copy setup plan</button><span class="copy-plan-status" aria-live="polite"></span>`;
      const text = [setup.title, problemAdvice[problem], ...recommendations, setup.buttons].join("\n");
      result.querySelector(".copy-plan-button").addEventListener("click", async () => {
        try {
          await navigator.clipboard.writeText(text);
          result.querySelector(".copy-plan-status").textContent = "Copied";
        } catch {
          result.querySelector(".copy-plan-status").textContent = "Copy unavailable";
        }
      });
      try {
        localStorage.setItem("blockradar-rivals-setup-v1", JSON.stringify({ platform, style, problem }));
      } catch {
        // The builder still works when browser storage is unavailable.
      }
    };
    try {
      const saved = JSON.parse(localStorage.getItem("blockradar-rivals-setup-v1") || "null");
      if (saved) {
        if (setupAdvice[saved.platform]) document.querySelector("#rivals-platform").value = saved.platform;
        if (styleAdvice[saved.style]) document.querySelector("#rivals-style").value = saved.style;
        if (problemAdvice[saved.problem]) document.querySelector("#rivals-problem").value = saved.problem;
      }
    } catch {
      // Ignore an invalid saved preference.
    }
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      render();
    });
    form.addEventListener("change", render);
    render();
  }

  function officialRobloxHost(hostname) {
    return hostname === "roblox.com" || hostname.endsWith(".roblox.com");
  }

  function hostIsIp(hostname) {
    return /^\d{1,3}(?:\.\d{1,3}){3}$/.test(hostname) || hostname.includes(":");
  }

  function initScamChecker() {
    const form = document.querySelector("#scam-check-form");
    if (!form) return;
    const input = document.querySelector("#scam-url");
    const result = document.querySelector("#scam-check-result");
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const raw = input.value.trim();
      if (!raw || /[\s<>]/.test(raw)) {
        result.className = "tool-result-panel scam-result danger";
        result.innerHTML = "<h2>Not a valid web address</h2><p>Paste one complete link. Do not paste a password, cookie, backup code, or private account token.</p>";
        return;
      }
      let parsed;
      try {
        parsed = new URL(/^[a-z][a-z0-9+.-]*:\/\//i.test(raw) ? raw : `https://${raw}`);
      } catch {
        result.className = "tool-result-panel scam-result danger";
        result.innerHTML = "<h2>Could not read this address</h2><p>Do not open it to investigate. Ask the sender for the official Roblox experience page instead.</p>";
        return;
      }

      const hostname = parsed.hostname.toLowerCase().replace(/\.$/, "");
      const official = officialRobloxHost(hostname);
      const shorteners = new Set(["bit.ly", "tinyurl.com", "t.co", "cutt.ly", "rebrand.ly", "is.gd", "rb.gy"]);
      const suspiciousWords = /(roblox|robux|rbx|reward|gift|generator|free|login|trade|verify|limited)/i;
      const warnings = [];
      if (parsed.protocol !== "https:") warnings.push("The link does not use HTTPS.");
      if (parsed.username || parsed.password) warnings.push("The address contains hidden username or password text before the hostname.");
      if (hostIsIp(hostname)) warnings.push("The link uses an IP address instead of a recognizable official domain.");
      if (hostname.startsWith("xn--") || hostname.includes(".xn--")) warnings.push("The hostname uses punycode and may imitate familiar letters.");
      if (shorteners.has(hostname)) warnings.push("A shortened link hides the final destination.");
      if (!official && suspiciousWords.test(`${hostname}${parsed.pathname}`)) warnings.push("The address uses Roblox, Robux, login, reward, or trade words on a non-Roblox domain.");

      if (official && parsed.protocol === "https:" && !warnings.length) {
        result.className = "tool-result-panel scam-result safe";
        result.innerHTML = `<p class="eyebrow">Domain result</p><h2>Official Roblox domain</h2><p><strong>${escapeHtml(hostname)}</strong> is roblox.com or one of its subdomains, and the link uses HTTPS.</p><div class="result-note"><strong>Still check the page</strong><p>A Roblox game, group, profile, or user-generated message can still make a dishonest claim. Roblox staff will not ask for a password or backup code in game chat.</p></div>`;
        return;
      }

      if (official) {
        result.className = "tool-result-panel scam-result caution";
        result.innerHTML = `<p class="eyebrow">Domain result</p><h2>Roblox domain with a warning</h2><p>The hostname is <strong>${escapeHtml(hostname)}</strong>, but the address has a risky format.</p>${listHtml(warnings)}<p>Navigate to roblox.com yourself instead of using this version of the link.</p>`;
        return;
      }

      const reasons = warnings.length ? warnings : ["The hostname is not roblox.com or a Roblox subdomain."];
      result.className = "tool-result-panel scam-result danger";
      result.innerHTML = `<p class="eyebrow">Domain result</p><h2>Do not use this link to sign in or redeem</h2><p>The actual hostname is <strong>${escapeHtml(hostname)}</strong>.</p>${listHtml(reasons)}<div class="result-note"><strong>Safer next step</strong><p>Close the message and open roblox.com manually. Search for the game, group, or item from the official site.</p></div>`;
    });
  }

  function listHtml(items) {
    return `<ul class="setup-list">${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
  }

  initUpdates();
  initDeviceFixer();
  initRivalsBuilder();
  initScamChecker();
})();
