export default {
  async fetch(request, env) {
    const url = new URL(request.url);
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
