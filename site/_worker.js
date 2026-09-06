function preferredLocale(request) {
  const cookie = request.headers.get("Cookie") || "";
  const saved = cookie.match(/(?:^|;\s*)naturable_locale=(en|zh-cn)/i)?.[1]?.toLowerCase();
  const country = request.cf?.country || "";
  const accept = request.headers.get("Accept-Language") || "";
  return saved || (["CN"].includes(country) || (!country && /^zh(?:-CN)?\b/i.test(accept)) ? "zh-cn" : "en");
}

function withHeaders(response, headers) {
  const nextHeaders = new Headers(response.headers);
  for (const [name, value] of Object.entries(headers)) nextHeaders.set(name, value);
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: nextHeaders
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const locale = preferredLocale(request);
    const legacyRoutes = {
      "/index.html": "/en/",
      "/app.html": "/en/app/",
      "/how-it-works.html": "/en/how-it-works/",
      "/pricing.html": "/en/pricing/",
      "/about.html": "/en/about/",
      "/privacy.html": "/en/privacy/",
      "/terms.html": "/en/terms/",
      "/learn/index.html": "/en/learn/",
      "/learn/how-to-remove-ai-tells.html": "/en/learn/how-to-remove-ai-tells/",
      "/learn/what-is-perplexity-and-burstiness.html": "/en/learn/what-is-perplexity-and-burstiness/",
      "/learn/do-ai-humanizers-work.html": "/en/learn/do-ai-humanizers-work/"
    };
    const unlocalizedRoutes = {
      "/app": "/en/app/", "/app/": "/en/app/",
      "/how-it-works": "/en/how-it-works/", "/how-it-works/": "/en/how-it-works/",
      "/pricing": "/en/pricing/", "/pricing/": "/en/pricing/",
      "/about": "/en/about/", "/about/": "/en/about/",
      "/privacy": "/en/privacy/", "/privacy/": "/en/privacy/",
      "/terms": "/en/terms/", "/terms/": "/en/terms/",
      "/learn": "/en/learn/", "/learn/": "/en/learn/",
      "/learn/how-to-remove-ai-tells": "/en/learn/how-to-remove-ai-tells/", "/learn/how-to-remove-ai-tells/": "/en/learn/how-to-remove-ai-tells/",
      "/learn/what-is-perplexity-and-burstiness": "/en/learn/what-is-perplexity-and-burstiness/", "/learn/what-is-perplexity-and-burstiness/": "/en/learn/what-is-perplexity-and-burstiness/",
      "/learn/do-ai-humanizers-work": "/en/learn/do-ai-humanizers-work/", "/learn/do-ai-humanizers-work/": "/en/learn/do-ai-humanizers-work/",
      "/learn/common-patterns-in-chinese-ai-copy": "/en/learn/common-patterns-in-chinese-ai-copy/", "/learn/common-patterns-in-chinese-ai-copy/": "/en/learn/common-patterns-in-chinese-ai-copy/",
      "/learn/make-a-stiff-email-more-direct": "/en/learn/make-a-stiff-email-more-direct/", "/learn/make-a-stiff-email-more-direct/": "/en/learn/make-a-stiff-email-more-direct/",
      "/learn/replace-claims-with-evidence": "/en/learn/replace-claims-with-evidence/", "/learn/replace-claims-with-evidence/": "/en/learn/replace-claims-with-evidence/"
    };
    const canonicalTarget = legacyRoutes[url.pathname] || unlocalizedRoutes[url.pathname];
    if (canonicalTarget) {
      url.protocol = "https:";
      url.hostname = "naturable.app";
      url.pathname = canonicalTarget;
      return Response.redirect(url.toString(), 308);
    }
    if (url.hostname === "www.naturable.app") {
      const isRoot = url.pathname === "/";
      url.hostname = "naturable.app";
      if (isRoot) url.pathname = `/${locale}/`;
      const wwwLastSegment = url.pathname.split("/").pop() || "";
      if (url.pathname !== "/" && !url.pathname.endsWith("/") && !wwwLastSegment.includes(".")) {
        url.pathname += "/";
      }
      return Response.redirect(url.toString(), isRoot ? 302 : 308);
    }
    if (url.pathname === "/") {
      return Response.redirect(`${url.origin}/${locale}/`, 302);
    }
    const lastSegment = url.pathname.split("/").pop() || "";
    if (!url.pathname.endsWith("/") && !lastSegment.includes(".")) {
      url.pathname += "/";
      return Response.redirect(url.toString(), 308);
    }
    let response = await env.ASSETS.fetch(request);
    const contentType = response.headers.get("content-type") || "";
    if (url.pathname.endsWith(".txt")) {
      response = withHeaders(response, { "X-Robots-Tag": "noindex" });
    }
    if (contentType.includes("text/html")) {
      const language = url.pathname.startsWith("/zh-cn/") ? "zh-CN" : "en";
      response = withHeaders(response, { "Content-Language": language });
      if (language === "zh-CN") {
        return new HTMLRewriter().on("html", { element(el) { el.setAttribute("lang", language); } }).transform(response);
      }
    }
    return response;
  }
};
