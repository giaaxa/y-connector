import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/config";
import { repo } from "@/lib/data";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url;
  const staticPaths = ["", "/about", "/events", "/community", "/upskill", "/startups", "/insights", "/membership", "/join", "/contact", "/ambassadors", "/legal/privacy", "/legal/terms", "/legal/community-guidelines"];
  const r = repo();
  const [events, courses, startups] = await Promise.all([r.listEvents(), r.listCourses(), r.listStartups()]);
  return [
    ...staticPaths.map((p) => ({ url: `${base}${p}`, changeFrequency: "weekly" as const })),
    ...events.map((e) => ({ url: `${base}/events/${e.slug}` })),
    ...courses.map((c) => ({ url: `${base}/upskill/${c.slug}` })),
    ...startups.map((s) => ({ url: `${base}/startups/${s.slug}` })),
  ];
}
