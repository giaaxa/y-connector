/* eslint-disable @typescript-eslint/no-explicit-any */
import "server-only";
import { DEFAULT_SETTINGS } from "../policy";
import { createSupabaseServer } from "../supabase/server";
import type {
  Application,
  Course,
  Membership,
  Post,
  Profile,
  Reply,
  Startup,
  YCEvent,
} from "../types";
import type { Repo } from "./repo";

type Row = Record<string, any>;

async function db() {
  return createSupabaseServer();
}
function must<T>(res: { data: T; error: any }): NonNullable<T> extends never ? any : NonNullable<T> {
  if (res.error) throw new Error(res.error.message);
  return (res.data ?? []) as any;
}

/* ───── mappers (snake_case rows → domain) ───── */
const toProfile = (r: Row, roles: string[] = []): Profile => ({
  id: r.id,
  fullName: r.full_name,
  headline: r.headline,
  university: r.university,
  city: r.city,
  bio: r.bio,
  skills: r.skills ?? [],
  interests: r.interests ?? [],
  currentProjects: r.current_projects,
  startupStage: r.startup_stage,
  lookingForCollaborators: r.looking_for_collaborators,
  availableForMentoring: r.available_for_mentoring,
  websiteUrl: r.website_url,
  discoverable: r.discoverable,
  allowContact: r.allow_contact,
  roles: (roles.length ? roles : (r.user_roles ?? []).map((x: Row) => x.role)) as Profile["roles"],
  referralCode: r.referral_code,
  referredBy: r.referred_by,
  createdAt: r.created_at,
});
const fromProfile = (p: Partial<Profile>): Row => {
  const m: Record<string, string> = {
    fullName: "full_name", headline: "headline", university: "university", city: "city", bio: "bio",
    skills: "skills", interests: "interests", currentProjects: "current_projects", startupStage: "startup_stage",
    lookingForCollaborators: "looking_for_collaborators", availableForMentoring: "available_for_mentoring",
    websiteUrl: "website_url", discoverable: "discoverable", allowContact: "allow_contact",
  };
  const out: Row = {};
  for (const [k, v] of Object.entries(p)) if (m[k]) out[m[k]] = v;
  return out;
};
const toApp = (r: Row): Application => ({
  id: r.id, userId: r.user_id, fullName: r.full_name, email: r.email, dateOfBirth: r.date_of_birth,
  university: r.university, studentStatus: r.student_status, graduationYear: r.graduation_year,
  universityEmail: r.university_email, universityEmailVerified: r.university_email_verified,
  proofPath: r.proof_path, location: r.location, interests: r.interests ?? [],
  professionalInterests: r.professional_interests, status: r.status, tier: r.tier,
  reviewerNote: r.reviewer_note, submittedAt: r.submitted_at, reviewedAt: r.reviewed_at,
});
const toMembership = (r: Row): Membership => ({
  userId: r.user_id, tier: r.tier, status: r.status, currentPeriodEnd: r.current_period_end,
  cancelAtPeriodEnd: r.cancel_at_period_end, stripeCustomerId: r.stripe_customer_id,
  stripeSubscriptionId: r.stripe_subscription_id, amountPence: r.amount_pence, updatedAt: r.updated_at,
});
const toEvent = (r: Row): YCEvent => ({
  id: r.id, slug: r.slug, title: r.title, category: r.category, format: r.format, startsAt: r.starts_at,
  endsAt: r.ends_at, location: r.location, summary: r.summary, description: r.description,
  speaker: r.speaker, capacity: r.capacity, access: r.access, priceNote: r.price_note, status: r.status,
  isSample: r.is_sample,
});
const fromEvent = (e: YCEvent): Row => ({
  id: e.id, slug: e.slug, title: e.title, category: e.category, format: e.format, starts_at: e.startsAt,
  ends_at: e.endsAt, location: e.location, summary: e.summary, description: e.description,
  speaker: e.speaker, capacity: e.capacity, access: e.access, price_note: e.priceNote, status: e.status,
  is_sample: e.isSample,
});
const toPost = (r: Row): Post => ({
  id: r.id, categorySlug: r.category_slug, authorId: r.author_id, title: r.title, body: r.body,
  createdAt: r.created_at, lastActivityAt: r.last_activity_at, score: r.score, replyCount: r.reply_count,
  isPinned: r.is_pinned, isLocked: r.is_locked, isRemoved: r.is_removed,
  isPublicPreview: r.is_public_preview, isSample: r.is_sample,
});
const toReply = (r: Row): Reply => ({
  id: r.id, postId: r.post_id, authorId: r.author_id, body: r.body, createdAt: r.created_at,
  score: r.score, isRemoved: r.is_removed,
});
const toCourse = (r: Row, lessons: Row[]): Course => ({
  id: r.id, slug: r.slug, title: r.title, category: r.category, summary: r.summary, level: r.level,
  skills: r.skills ?? [], access: r.access, relatedEventSlugs: r.related_event_slugs ?? [],
  status: r.status, isSample: r.is_sample,
  lessons: lessons
    .filter((l) => l.course_id === r.id)
    .sort((a, b) => a.position - b.position)
    .map((l) => ({ id: l.id, title: l.title, kind: l.kind, body: l.body ?? "", url: l.url ?? "", minutes: l.minutes })),
});
const toStartup = (r: Row): Startup => ({
  id: r.id, slug: r.slug, name: r.name, tagline: r.tagline, description: r.description,
  industry: r.industry, stage: r.stage, website: r.website, founders: r.founders ?? [],
  teamNeeds: r.team_needs ?? [], milestones: r.milestones ?? [],
  communityConnection: r.community_connection, themes: r.themes ?? [], approval: r.approval,
  submittedBy: r.submitted_by, isSample: r.is_sample, createdAt: r.created_at,
});
const fromStartup = (s: Startup): Row => ({
  id: s.id.startsWith("new_") ? undefined : s.id, slug: s.slug, name: s.name, tagline: s.tagline,
  description: s.description, industry: s.industry, stage: s.stage, website: s.website,
  founders: s.founders, team_needs: s.teamNeeds, milestones: s.milestones,
  community_connection: s.communityConnection, themes: s.themes, approval: s.approval,
});

/** Loads lesson rows: full rows for members, public outline otherwise. */
async function loadLessons(courseIds: string[]) {
  if (!courseIds.length) return [];
  const s = await db();
  const full = await s.from("lessons").select("*").in("course_id", courseIds);
  if (!full.error && full.data?.length) return full.data;
  const outline = await s.from("lesson_outline").select("*").in("course_id", courseIds);
  return outline.data ?? [];
}

export const supabaseRepo: Repo = {
  async getSettings() {
    const s = await db();
    const { data } = await s.from("settings").select("data").eq("id", 1).maybeSingle();
    return { ...DEFAULT_SETTINGS, ...(data?.data ?? {}) };
  },
  async updateSettings(patch) {
    const s = await db();
    const current = await this.getSettings();
    must(await s.from("settings").update({ data: { ...current, ...patch }, updated_at: new Date().toISOString() }).eq("id", 1));
  },

  async getProfile(id) {
    const s = await db();
    const { data } = await s.from("profiles").select("*, user_roles(role)").eq("id", id).maybeSingle();
    return data ? toProfile(data) : null;
  },
  async getProfiles(ids) {
    if (!ids.length) return [];
    const s = await db();
    return must(await s.from("profiles").select("*, user_roles(role)").in("id", ids)).map((r) => toProfile(r));
  },
  async listProfiles() {
    const s = await db();
    return must(await s.from("profiles").select("*, user_roles(role)").order("created_at", { ascending: false })).map((r) => toProfile(r));
  },
  async searchDirectory(q) {
    const s = await db();
    let query = s.from("profiles").select("*, user_roles(role)").eq("discoverable", true);
    if (q.skill) query = query.contains("skills", [q.skill]);
    if (q.collaborators) query = query.eq("looking_for_collaborators", true);
    if (q.mentors) query = query.eq("available_for_mentoring", true);
    if (q.q) {
      const t = q.q.replace(/[%,()]/g, " ").trim();
      query = query.or(`full_name.ilike.%${t}%,headline.ilike.%${t}%,university.ilike.%${t}%,current_projects.ilike.%${t}%`);
    }
    return must(await query.limit(200)).map((r) => toProfile(r));
  },
  async updateProfile(id, patch) {
    const s = await db();
    must(await s.from("profiles").update(fromProfile(patch)).eq("id", id));
  },
  async findProfileByReferralCode(code) {
    const s = await db();
    const { data } = await s.from("profiles").select("*").eq("referral_code", code.toUpperCase()).maybeSingle();
    return data ? toProfile(data) : null;
  },
  async listReferrals(userId) {
    const s = await db();
    return must(await s.from("profiles").select("*").eq("referred_by", userId)).map((r) => toProfile(r));
  },
  async setRoles(userId, roles) {
    const s = await db();
    must(await s.from("user_roles").delete().eq("user_id", userId));
    const list = roles.length ? roles : ["member"];
    must(await s.from("user_roles").insert(list.map((role) => ({ user_id: userId, role }))));
  },

  async getApplication(userId) {
    const s = await db();
    const { data } = await s.from("applications").select("*").eq("user_id", userId).maybeSingle();
    return data ? toApp(data) : null;
  },
  async saveApplication(a) {
    const s = await db();
    must(
      await s.from("applications").upsert(
        {
          user_id: a.userId, full_name: a.fullName, email: a.email, date_of_birth: a.dateOfBirth,
          university: a.university, student_status: a.studentStatus, graduation_year: a.graduationYear,
          university_email: a.universityEmail, proof_path: a.proofPath, location: a.location,
          interests: a.interests, professional_interests: a.professionalInterests, tier: a.tier,
        },
        { onConflict: "user_id" },
      ),
    );
    await s.from("profiles").update({ full_name: a.fullName, university: a.university, city: a.location }).eq("id", a.userId);
  },
  async listApplications(status) {
    const s = await db();
    let q = s.from("applications").select("*").order("submitted_at", { ascending: false });
    if (status) q = q.eq("status", status);
    return must(await q).map(toApp);
  },
  async reviewApplication(id, d) {
    const s = await db();
    const { data } = await s
      .from("applications")
      .update({ status: d.status, tier: d.tier, reviewer_note: d.note, reviewed_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .maybeSingle();
    return data ? toApp(data) : null;
  },

  async getMembership(userId) {
    const s = await db();
    const { data } = await s.from("memberships").select("*").eq("user_id", userId).maybeSingle();
    return data ? toMembership(data) : null;
  },
  async listMemberships() {
    const s = await db();
    return must(await s.from("memberships").select("*")).map(toMembership);
  },

  async listEvents(opts) {
    const s = await db();
    let q = s.from("events").select("*").order("starts_at");
    if (!opts?.includeUnpublished) q = q.in("status", ["published", "cancelled"]);
    return must(await q).map(toEvent);
  },
  async getEventBySlug(slug) {
    const s = await db();
    const { data } = await s.from("events").select("*").eq("slug", slug).maybeSingle();
    return data ? toEvent(data) : null;
  },
  async getEventById(id) {
    const s = await db();
    const { data } = await s.from("events").select("*").eq("id", id).maybeSingle();
    return data ? toEvent(data) : null;
  },
  async saveEvent(e) {
    const s = await db();
    const row = fromEvent(e);
    if (e.id.startsWith("new_")) delete row.id;
    must(await s.from("events").upsert(row));
  },
  async listRsvps(eventId) {
    const s = await db();
    let q = s.from("rsvps").select("*").order("created_at");
    if (eventId) q = q.eq("event_id", eventId);
    return must(await q).map((r) => ({ id: r.id, eventId: r.event_id, userId: r.user_id, name: r.name, email: r.email, status: r.status, createdAt: r.created_at }));
  },
  async listUserRsvps(userId) {
    const s = await db();
    return must(await s.from("rsvps").select("*").eq("user_id", userId).neq("status", "cancelled")).map((r) => ({
      id: r.id, eventId: r.event_id, userId: r.user_id, name: r.name, email: r.email, status: r.status, createdAt: r.created_at,
    }));
  },
  async createRsvp(r) {
    // Capacity, access and validation are enforced inside the SQL function.
    const s = await db();
    const row = must(await s.rpc("rsvp_to_event", { p_event: r.eventId, p_name: r.name, p_email: r.email })) as Row;
    return { id: row.id, eventId: row.event_id, userId: row.user_id, name: row.name, email: row.email, status: row.status, createdAt: row.created_at };
  },
  async updateRsvpStatus(id, status) {
    const s = await db();
    must(await s.from("rsvps").update({ status }).eq("id", id));
  },

  async confirmedCounts(ids) {
    const s = await db();
    const entries = await Promise.all(
      ids.map(async (id) => [id, ((await s.rpc("event_confirmed_count", { p_event: id })).data as number) ?? 0] as const),
    );
    return Object.fromEntries(entries);
  },
  async listCategories() {
    const s = await db();
    return must(await s.from("forum_categories").select("*").order("position")).map((r) => ({ slug: r.slug, name: r.name, description: r.description }));
  },
  async listPosts(q = {}) {
    const s = await db();
    if (q.publicPreviewOnly) {
      const rows = must(await s.rpc("public_preview_posts", { p_limit: q.limit ?? 5 })) as Row[];
      return rows.map((r) => ({
        ...toPost({ ...r, author_id: `preview:${r.author_name}`, last_activity_at: r.created_at, is_pinned: false, is_locked: false, is_removed: false, is_public_preview: true }),
      }));
    }
    let query = s.from("posts").select("*");
    if (!q.includeRemoved) query = query.eq("is_removed", false);
    if (q.category) query = query.eq("category_slug", q.category);
    if (q.authorId) query = query.eq("author_id", q.authorId);
    if (q.ids) query = query.in("id", q.ids.length ? q.ids : ["00000000-0000-0000-0000-000000000000"]);
    if (q.q) query = query.textSearch("search", q.q, { type: "websearch" });
    if (q.sort === "new") query = query.order("is_pinned", { ascending: false }).order("created_at", { ascending: false });
    else if (q.sort === "top") query = query.order("score", { ascending: false });
    else query = query.order("is_pinned", { ascending: false }).order("last_activity_at", { ascending: false });
    return must(await query.limit(q.limit ?? 100)).map(toPost);
  },
  async getPost(id) {
    const s = await db();
    const { data } = await s.from("posts").select("*").eq("id", id).maybeSingle();
    return data ? toPost(data) : null;
  },
  async createPost(p) {
    const s = await db();
    const row = must(await s.from("posts").insert({ category_slug: p.categorySlug, author_id: p.authorId, title: p.title, body: p.body }).select().single());
    await s.from("votes").insert({ user_id: p.authorId, target_type: "post", target_id: row.id, value: 1 });
    return toPost({ ...row, score: 1 });
  },
  async moderatePost(id, patch) {
    const s = await db();
    const m: Row = {};
    if (patch.isPinned !== undefined) m.is_pinned = patch.isPinned;
    if (patch.isLocked !== undefined) m.is_locked = patch.isLocked;
    if (patch.isRemoved !== undefined) m.is_removed = patch.isRemoved;
    if (patch.isPublicPreview !== undefined) m.is_public_preview = patch.isPublicPreview;
    must(await s.from("posts").update(m).eq("id", id));
  },
  async listReplies(postId, includeRemoved) {
    const s = await db();
    let q = s.from("replies").select("*").eq("post_id", postId).order("created_at");
    if (!includeRemoved) q = q.eq("is_removed", false);
    return must(await q).map(toReply);
  },
  async getReply(id) {
    const s = await db();
    const { data } = await s.from("replies").select("*").eq("id", id).maybeSingle();
    return data ? toReply(data) : null;
  },
  async createReply(r) {
    const s = await db();
    return toReply(must(await s.from("replies").insert({ post_id: r.postId, author_id: r.authorId, body: r.body }).select().single()));
  },
  async moderateReply(id, patch) {
    const s = await db();
    must(await s.from("replies").update({ is_removed: patch.isRemoved }).eq("id", id));
  },
  async vote(userId, target, value) {
    const s = await db();
    if (value === 0)
      must(await s.from("votes").delete().match({ user_id: userId, target_type: target.type, target_id: target.id }));
    else
      must(await s.from("votes").upsert({ user_id: userId, target_type: target.type, target_id: target.id, value }));
  },
  async getUserVotes(userId, ids) {
    if (!ids.length) return {};
    const s = await db();
    const rows = must(await s.from("votes").select("target_id, value").eq("user_id", userId).in("target_id", ids));
    return Object.fromEntries(rows.map((r) => [r.target_id, r.value]));
  },
  async toggleBookmark(userId, postId) {
    const s = await db();
    const { data } = await s.from("bookmarks").select("post_id").match({ user_id: userId, post_id: postId }).maybeSingle();
    if (data) {
      must(await s.from("bookmarks").delete().match({ user_id: userId, post_id: postId }));
      return false;
    }
    must(await s.from("bookmarks").insert({ user_id: userId, post_id: postId }));
    return true;
  },
  async listBookmarkIds(userId) {
    const s = await db();
    return must(await s.from("bookmarks").select("post_id").eq("user_id", userId)).map((r) => r.post_id);
  },
  async createReport(r) {
    const s = await db();
    must(await s.from("reports").insert({ target_type: r.targetType, target_id: r.targetId, reporter_id: r.reporterId, reason: r.reason }));
  },
  async listReports(status) {
    const s = await db();
    let q = s.from("reports").select("*").order("created_at", { ascending: false });
    if (status) q = q.eq("status", status);
    return must(await q).map((r) => ({ id: r.id, targetType: r.target_type, targetId: r.target_id, reporterId: r.reporter_id, reason: r.reason, status: r.status, createdAt: r.created_at }));
  },
  async setReportStatus(id, status) {
    const s = await db();
    must(await s.from("reports").update({ status }).eq("id", id));
  },

  async listCourses(opts) {
    const s = await db();
    let q = s.from("courses").select("*").order("title");
    if (!opts?.includeDrafts) q = q.eq("status", "published");
    const rows = must(await q);
    const lessons = await loadLessons(rows.map((r) => r.id));
    return rows.map((r) => toCourse(r, lessons));
  },
  async getCourse(slug) {
    const s = await db();
    const { data } = await s.from("courses").select("*").eq("slug", slug).maybeSingle();
    if (!data) return null;
    return toCourse(data, await loadLessons([data.id]));
  },
  async saveCourse(c) {
    const s = await db();
    const row: Row = {
      slug: c.slug, title: c.title, category: c.category, summary: c.summary, level: c.level,
      skills: c.skills, access: c.access, related_event_slugs: c.relatedEventSlugs, status: c.status, is_sample: c.isSample,
    };
    if (!c.id.startsWith("new_")) row.id = c.id;
    const saved = must(await s.from("courses").upsert(row).select().single());
    // Upsert by stable id (keeps lesson_progress), then delete removed lessons only.
    const isUuid = (x: string) => /^[0-9a-f-]{36}$/i.test(x);
    const rows = c.lessons.map((l, i) => ({
      id: isUuid(l.id) ? l.id : crypto.randomUUID(),
      course_id: saved.id, position: i, title: l.title, kind: l.kind, body: l.body, url: l.url, minutes: l.minutes,
    }));
    if (rows.length) must(await s.from("lessons").upsert(rows));
    const keep = rows.map((r) => r.id);
    let del = s.from("lessons").delete().eq("course_id", saved.id);
    if (keep.length) del = del.not("id", "in", `(${keep.join(",")})`);
    must(await del);
  },
  async listCompletedLessons(userId) {
    const s = await db();
    return must(await s.from("lesson_progress").select("lesson_id").eq("user_id", userId)).map((r) => r.lesson_id);
  },
  async setLessonComplete(userId, courseId, lessonId, done) {
    const s = await db();
    if (done) must(await s.from("lesson_progress").upsert({ user_id: userId, course_id: courseId, lesson_id: lessonId }));
    else must(await s.from("lesson_progress").delete().match({ user_id: userId, lesson_id: lessonId }));
  },

  async listStartups(opts) {
    const s = await db();
    let q = s.from("startups").select("*").order("created_at", { ascending: false });
    if (opts?.approval !== "all") q = q.eq("approval", opts?.approval ?? "approved");
    if (opts?.submittedBy) q = q.eq("submitted_by", opts.submittedBy);
    return must(await q).map(toStartup);
  },
  async getStartup(slug) {
    const s = await db();
    const { data } = await s.from("startups").select("*").eq("slug", slug).maybeSingle();
    return data ? toStartup(data) : null;
  },
  async saveStartup(st) {
    const s = await db();
    must(await s.from("startups").upsert(fromStartup(st)));
  },

  async createAmbassadorApplication(a) {
    const s = await db();
    must(await s.from("ambassador_applications").insert(a));
  },
  async listAmbassadorApplications() {
    const s = await db();
    return must(await s.from("ambassador_applications").select("*").order("created_at", { ascending: false })).map((r) => ({
      id: r.id, name: r.name, email: r.email, location: r.location, focus: r.focus, message: r.message, status: r.status, createdAt: r.created_at,
    }));
  },
  async createContactMessage(m) {
    const s = await db();
    must(await s.from("contact_messages").insert(m));
  },
  async listContactMessages() {
    const s = await db();
    return must(await s.from("contact_messages").select("*").order("created_at", { ascending: false })).map((r) => ({
      id: r.id, name: r.name, email: r.email, topic: r.topic, message: r.message, createdAt: r.created_at,
    }));
  },
  async createCollabRequest(r) {
    const s = await db();
    must(await s.from("collab_requests").insert({ from_id: r.fromId, to_id: r.toId, message: r.message }));
  },
  async listCollabRequests(userId) {
    const s = await db();
    return must(
      await s.from("collab_requests").select("*").or(`from_id.eq.${userId},to_id.eq.${userId}`).order("created_at", { ascending: false }),
    ).map((r) => ({ id: r.id, fromId: r.from_id, toId: r.to_id, message: r.message, status: r.status, sharedContact: r.shared_contact, createdAt: r.created_at }));
  },
  async respondCollabRequest(id, toId, accept, contact) {
    const s = await db();
    must(await s.from("collab_requests").update({ status: accept ? "accepted" : "declined", shared_contact: accept ? contact : null }).match({ id, to_id: toId }));
  },

  async createDeletionRequest(userId, reason) {
    const s = await db();
    must(await s.from("deletion_requests").insert({ user_id: userId, reason }));
  },
  async listDeletionRequests() {
    const s = await db();
    return must(await s.from("deletion_requests").select("*").order("created_at", { ascending: false })).map((r) => ({
      id: r.id, userId: r.user_id, reason: r.reason, status: r.status, createdAt: r.created_at,
    }));
  },
  async getOpenDeletionRequest(userId) {
    const s = await db();
    const { data } = await s.from("deletion_requests").select("*").match({ user_id: userId, status: "open" }).maybeSingle();
    return data ? { id: data.id, userId: data.user_id, reason: data.reason, status: data.status, createdAt: data.created_at } : null;
  },
};
