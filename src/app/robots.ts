import type { MetadataRoute } from "next";

import { absoluteCanonicalUrl, CANONICAL_SITE_ORIGIN } from "@/lib/seo/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/og"],
    },
    host: CANONICAL_SITE_ORIGIN,
    sitemap: absoluteCanonicalUrl("/sitemap.xml"),
  };
}
