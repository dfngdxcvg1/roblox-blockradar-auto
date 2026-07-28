export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const isLegacyDaily = url.pathname === "/daily"
      || url.pathname.startsWith("/daily/")
      || url.pathname === "/daily-roblox-guides.html";

    if (isLegacyDaily) {
      return new Response(null, {
        status: 301,
        headers: {
          Location: `${url.origin}/guides.html`,
          "Cache-Control": "public, max-age=86400"
        }
      });
    }

    return env.ASSETS.fetch(request);
  }
};
