import "server-only";
import { repo } from "./data";
import { seedPosts, seedProfiles, forumCategories } from "./seed";
import type { Post, Profile } from "./types";

export async function getUpcomingEvents(limit = 3) {
  const r = repo();
  const now = new Date().toISOString();
  const events = (await r.listEvents()).filter((e) => e.endsAt >= now && e.status === "published").slice(0, limit);
  const counts = await r.confirmedCounts(events.map((e) => e.id));
  return events.map((e) => ({ event: e, taken: counts[e.id] ?? 0 }));
}

export interface PreviewThread {
  id: string;
  title: string;
  category: string;
  author: string;
  score: number;
  replies: number;
  createdAt: string;
  isSample: boolean;
}

/**
 * Threads an admin has explicitly published as a public preview.
 * Falls back to clearly-labelled example threads if none exist yet.
 */
export async function getPublicPreviewThreads(limit = 5): Promise<PreviewThread[]> {
  const r = repo();
  let posts: Post[] = [];
  try {
    posts = await r.listPosts({ publicPreviewOnly: true, limit, sort: "top" });
  } catch {
    posts = [];
  }
  const cats = await r.listCategories().catch(() => forumCategories);
  const catName = (slug: string) => cats.find((c) => c.slug === slug)?.name ?? slug;
  if (!posts.length) {
    posts = seedPosts.filter((p) => p.isPublicPreview).slice(0, limit);
    return posts.map((p) => toThread(p, catName, seedProfiles));
  }
  const ids = posts.map((p) => p.authorId).filter((a) => !a.startsWith("preview:"));
  const authors = ids.length ? await r.getProfiles(ids).catch(() => []) : [];
  return posts.map((p) => toThread(p, catName, authors));
}

function toThread(p: Post, catName: (s: string) => string, authors: Profile[]): PreviewThread {
  const name = p.authorId.startsWith("preview:")
    ? p.authorId.slice(8)
    : (authors.find((a) => a.id === p.authorId)?.fullName.split(" ")[0] ?? "Member");
  return {
    id: p.id,
    title: p.title,
    category: catName(p.categorySlug),
    author: name,
    score: p.score,
    replies: p.replyCount,
    createdAt: p.createdAt,
    isSample: p.isSample,
  };
}
