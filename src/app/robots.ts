import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/dashboard", "/forum", "/directory", "/members", "/account", "/admin", "/api", "/projects", "/referrals", "/connections"] },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
