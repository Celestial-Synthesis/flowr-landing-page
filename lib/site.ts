const fallbackSiteUrl = "https://flowr.celestialsynthesis.com";

function normalizeSiteUrl(url: string) {
  return url.replace(/\/+$/, "");
}

function withHttps(urlOrHost: string) {
  if (/^https?:\/\//i.test(urlOrHost)) {
    return urlOrHost;
  }
  return `https://${urlOrHost}`;
}

function resolveSiteUrl() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) {
    return withHttps(configured);
  }

  // Netlify provides these during build; prefer explicit NEXT_PUBLIC_SITE_URL when available.
  const netlifyUrl =
    process.env.URL?.trim() || process.env.DEPLOY_PRIME_URL?.trim();
  if (netlifyUrl) {
    return withHttps(netlifyUrl);
  }

  return fallbackSiteUrl;
}

export const siteUrl = normalizeSiteUrl(resolveSiteUrl());

export const siteHost = new URL(siteUrl).host;

export const sitemapLastModified = new Date("2026-05-04");
