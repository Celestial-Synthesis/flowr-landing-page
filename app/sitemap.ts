import type { MetadataRoute } from "next";

const siteUrl = "https://flowr.celestialsynthesis.com";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: siteUrl,
      lastModified: new Date("2026-05-04"),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteUrl}/privacy`,
      lastModified: new Date("2026-05-04"),
      changeFrequency: "yearly",
      priority: 0.4,
    },
    {
      url: `${siteUrl}/terms`,
      lastModified: new Date("2026-05-04"),
      changeFrequency: "yearly",
      priority: 0.4,
    },
  ];
}
