export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/feedback") {
      return submitFeedback(request, env);
    }

    if (url.pathname === "/api/query-gap") {
      return submitQueryGap(request, env);
    }

    const isLegacyDaily = url.pathname === "/daily"
      || url.pathname.startsWith("/daily/")
      || url.pathname === "/daily-roblox-guides"
      || url.pathname === "/daily-roblox-guides.html";

    if (isLegacyDaily) {
      return new Response(null, {
        status: 301,
        headers: {
          Location: `${url.origin}/guides`,
          "Cache-Control": "public, max-age=86400"
        }
      });
    }

    if (url.pathname !== "/" && url.pathname.endsWith("/")) {
      url.pathname = url.pathname.slice(0, -1);
      return new Response(null, {
        status: 301,
        headers: {
          Location: url.toString(),
          "Cache-Control": "public, max-age=86400"
        }
      });
    }

    const isVerificationFile = /^\/google[a-z0-9]+\.html$/i.test(url.pathname);
    if (url.pathname.endsWith(".html") && !isVerificationFile) {
      url.pathname = url.pathname === "/index.html"
        ? "/"
        : url.pathname.slice(0, -".html".length);
      return new Response(null, {
        status: 301,
        headers: {
          Location: url.toString(),
          "Cache-Control": "public, max-age=86400"
        }
      });
    }

    const assetUrl = new URL(url);
    const fileName = assetUrl.pathname.split("/").at(-1);
    if (assetUrl.pathname === "/") {
      assetUrl.pathname = "/index.html";
    } else if (fileName && !fileName.includes(".")) {
      assetUrl.pathname += ".html";
    }

    return env.ASSETS.fetch(new Request(assetUrl, request));
  }
};

const allowedFeedbackValues = new Set([
  "accurate",
  "too-low",
  "too-high",
  "helpful",
  "not-helpful",
  "worked",
  "expired",
  "outdated",
  "cleared"
]);

function jsonResponse(body, status) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store"
    }
  });
}

async function submitFeedback(request, env) {
  if (request.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  if (!env.FEEDBACK_DB) {
    return jsonResponse({ error: "Feedback sync is temporarily unavailable" }, 503);
  }

  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > 4096) {
    return jsonResponse({ error: "Feedback payload is too large" }, 413);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON" }, 400);
  }

  const scope = String(body.scope || "").trim();
  const value = String(body.value || "").trim();
  const page = String(body.page || "/").trim();
  const sessionId = String(body.sessionId || "").trim();

  if (scope.length < 3 || scope.length > 180 || !/^[a-z0-9:_-]+$/i.test(scope)) {
    return jsonResponse({ error: "Invalid feedback scope" }, 400);
  }
  if (!allowedFeedbackValues.has(value)) {
    return jsonResponse({ error: "Invalid feedback value" }, 400);
  }
  if (!page.startsWith("/") || page.length > 240) {
    return jsonResponse({ error: "Invalid page" }, 400);
  }
  if (!/^[a-z0-9_-]{8,80}$/i.test(sessionId)) {
    return jsonResponse({ error: "Invalid session" }, 400);
  }

  try {
    await env.FEEDBACK_DB.prepare(`
      INSERT INTO blockradar_feedback (scope, value, page, session_id)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(session_id, scope) DO UPDATE SET
        value = excluded.value,
        page = excluded.page,
        updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
    `).bind(scope, value, page, sessionId).run();
  } catch {
    return jsonResponse({ error: "Feedback sync is temporarily unavailable" }, 503);
  }

  return jsonResponse({ synced: true }, 200);
}

async function submitQueryGap(request, env) {
  if (request.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  if (!env.FEEDBACK_DB) {
    return jsonResponse({ error: "Search-gap sync is temporarily unavailable" }, 503);
  }

  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > 2048) {
    return jsonResponse({ error: "Search-gap payload is too large" }, 413);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON" }, 400);
  }

  const query = String(body.query || "").trim().replace(/\s+/g, " ");
  const normalizedQuery = query.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  const page = String(body.page || "/search").trim();
  const sessionId = String(body.sessionId || "").trim();
  const looksPrivate = /@|https?:\/\/|www\.|\b\d{7,}\b/i.test(query);

  if (query.length < 3 || query.length > 120 || normalizedQuery.length < 3 || looksPrivate) {
    return jsonResponse({ error: "Invalid search query" }, 400);
  }
  if (!page.startsWith("/") || page.length > 240) {
    return jsonResponse({ error: "Invalid page" }, 400);
  }
  if (!/^[a-z0-9_-]{8,80}$/i.test(sessionId)) {
    return jsonResponse({ error: "Invalid session" }, 400);
  }

  try {
    await env.FEEDBACK_DB.prepare(`
      INSERT INTO blockradar_query_gaps (query, normalized_query, page, session_id)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(session_id, normalized_query) DO UPDATE SET
        occurrences = MIN(1000, blockradar_query_gaps.occurrences + 1),
        page = excluded.page,
        updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
    `).bind(query, normalizedQuery, page, sessionId).run();
  } catch {
    return jsonResponse({ error: "Search-gap sync is temporarily unavailable" }, 503);
  }

  return jsonResponse({ synced: true }, 200);
}
