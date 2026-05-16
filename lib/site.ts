const fallbackSiteUrl = "https://flowr.celestialsynthesis.com";

function normalizeSiteUrl(url: string) {
  return url.replace(/\/+$/, "");
}

export const siteUrl = normalizeSiteUrl(
  process.env.NEXT_PUBLIC_SITE_URL || fallbackSiteUrl,
);

export const siteHost = new URL(siteUrl).host;

export const sitemapLastModified = new Date("2026-05-04");
