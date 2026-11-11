import "server-only";
import { DEFAULT_SETTINGS } from "../policy";
import * as seed from "../seed";
import type {
  AmbassadorApplication,
  Application,
  CollabRequest,
  ContactMessage,
  Course,
  DeletionRequest,
  Membership,
  PlatformSettings,
  Post,
  Profile,
  Reply,
  Report,
  Rsvp,
  Startup,
  YCEvent,
} from "../types";
import type { DirectoryQuery, PostQuery, Repo } from "./repo";

/**
 * In-memory DEMO store. Data lives in server memory, resets on restart and is
 * shared by everyone using the preview. Never used when Supabase is configured.
 */
interface Store {
  settings: PlatformSettings;
  profiles: Profile[];
  applications: Application[];
  memberships: Membership[];
  events: YCEvent[];
  rsvps: Rsvp[];
  posts: Post[];
  replies: Reply[];
  votes: Map<string, number>;
  bookmarks: Set<string>;
  reports: Report[];
  courses: Course[];
  progress: Set<string>;
  startups: Startup[];
  ambassadors: AmbassadorApplication[];
  contacts: ContactMessage[];
  collabs: CollabRequest[];
  deletions: DeletionRequest[];
}

const g = globalThis as unknown as { __ycStore?: Store };

function store(): Store {
  if (!g.__ycStore) {
    const clone = <T>(v: T): T => structuredClone(v);
    g.__ycStore = {
      settings: clone(DEFAULT_SETTINGS),
      profiles: clone(seed.seedProfiles),
      applications: clone(seed.seedApplications),
      memberships: clone(seed.seedMemberships),
      events: clone(seed.seedEvents),
      rsvps: clone(seed.seedRsvps),
      posts: clone(seed.seedPosts),
      replies: clone(seed.seedReplies),
      votes: new Map([
        ["u_member:post:p1", 1],
        ["u_member:post:p4", 1],
      ]),
      bookmarks: new Set(["u_member:p4"]),
      reports: [
        {
          id: "rep1",
          targetType: "post",
          targetId: "p7",
          reporterId: "u_s5",
          reason: "Sample report — looks like self-promotion?",
          status: "open",
          createdAt: new Date().toISOString(),
        },
      ],
      courses: clone(seed.seedCourses),
      progress: new Set(["u_member:l1", "u_member:l2", "u_member:l10"]),
      startups: clone(seed.seedStartups),
      ambassadors: [],
      contacts: [],
      collabs: [
        {
          id: "cr1",
          fromId: "u_s2",
          toId: "u_member",
          message: "Saw your AI study-planner project — I'd love to help on the agent side.",
          status: "pending",
          sharedContact: null,
          createdAt: new Date().toISOString(),
        },
      ],
      deletions: [],
    };
  }
  return g.__ycStore;
}

const id = (prefix: string) => `${prefix}_${crypto.randomUUID().slice(0, 8)}`;
const now = () => new Date().toISOString();
const ok = async <T>(v: T) => structuredClone(v);

function sortPosts(posts: Post[], sort: PostQuery["sort"] = "active") {
  const pinnedFirst = (a: Post, b: Post) => Number(b.isPinned) - Number(a.isPinned);
  if (sort === "new")
    return posts.sort((a, b) => pinnedFirst(a, b) || b.createdAt.localeCompare(a.createdAt));
  if (sort === "top") return posts.sort((a, b) => b.score - a.score);
  return posts.sort((a, b) => pinnedFirst(a, b) || b.lastActivityAt.localeCompare(a.lastActivityAt));
}

export const demoRepo: Repo = {
  getSettings: async () => ok(store().settings),
  updateSettings: async (patch) => {
    Object.assign(store().settings, patch);
  },

  getProfile: async (pid) => ok(store().profiles.find((p) => p.id === pid) ?? null),
  getProfiles: async (ids) => ok(store().profiles.filter((p) => ids.includes(p.id))),
  listProfiles: async () => ok(store().profiles),
  searchDirectory: async (q: DirectoryQuery) => {
    const s = store();
    const active = new Set(
      s.memberships.filter((m) => m.status === "active").map((m) => m.userId),
    );
    const term = q.q?.toLowerCase().trim();
    return ok(
      s.profiles.filter(
        (p) =>
          p.discoverable &&
          active.has(p.id) &&
          (!q.skill || p.skills.includes(q.skill)) &&
          (!q.collaborators || p.lookingForCollaborators) &&
          (!q.mentors || p.availableForMentoring) &&
          (!term ||
            [p.fullName, p.headline, p.university, p.currentProjects, ...p.skills]
              .join(" ")
              .toLowerCase()
              .includes(term)),
      ),
    );
  },
  updateProfile: async (pid, patch) => {
    const p = store().profiles.find((x) => x.id === pid);
    if (p) Object.assign(p, patch);
  },
  findProfileByReferralCode: async (code) =>
    ok(store().profiles.find((p) => p.referralCode.toLowerCase() === code.toLowerCase()) ?? null),
  listReferrals: async (uid) => ok(store().profiles.filter((p) => p.referredBy === uid)),
  setRoles: async (uid, roles) => {
    const p = store().profiles.find((x) => x.id === uid);
    if (p) p.roles = roles.length ? roles : ["member"];
  },

  getApplication: async (uid) => ok(store().applications.find((a) => a.userId === uid) ?? null),
  saveApplication: async (app) => {
    const s = store();
    const i = s.applications.findIndex((a) => a.userId === app.userId);
    if (i >= 0) s.applications[i] = app;
    else s.applications.push(app);
    if (!s.profiles.some((p) => p.id === app.userId)) {
      s.profiles.push({
        ...seed.seedProfiles[0],
        id: app.userId,
        fullName: app.fullName,
        headline: "",
        university: app.university,
        city: app.location,
        bio: "",
        skills: [],
        interests: app.interests,
        currentProjects: "",
        startupStage: null,
        lookingForCollaborators: false,
        availableForMentoring: false,
        discoverable: false,
        roles: ["member"],
        referralCode: "YC" + app.userId.slice(-6).toUpperCase(),
        referredBy: null,
        createdAt: now(),
      });
    }
  },
  listApplications: async (status) =>
    ok(
      store()
        .applications.filter((a) => !status || a.status === status)
        .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt)),
    ),
  reviewApplication: async (aid, d) => {
    const a = store().applications.find((x) => x.id === aid);
    if (!a) return null;
    Object.assign(a, { status: d.status, tier: d.tier, reviewerNote: d.note, reviewedAt: now() });
    return ok(a);
  },

  getMembership: async (uid) => ok(store().memberships.find((m) => m.userId === uid) ?? null),
  listMemberships: async () => ok(store().memberships),

  listEvents: async (opts) =>
    ok(
      store()
        .events.filter((e) => opts?.includeUnpublished || e.status === "published" || e.status === "cancelled")
        .sort((a, b) => a.startsAt.localeCompare(b.startsAt)),
    ),
  getEventBySlug: async (slug) => ok(store().events.find((e) => e.slug === slug) ?? null),
  getEventById: async (eid) => ok(store().events.find((e) => e.id === eid) ?? null),
  saveEvent: async (event) => {
    const s = store();
    const i = s.events.findIndex((e) => e.id === event.id);
    if (i >= 0) s.events[i] = event;
    else s.events.push(event);
  },
  listRsvps: async (eventId) =>
    ok(store().rsvps.filter((r) => !eventId || r.eventId === eventId)),
  listUserRsvps: async (uid) => ok(store().rsvps.filter((r) => r.userId === uid && r.status !== "cancelled")),
  createRsvp: async (r) => {
    const rsvp: Rsvp = { ...r, id: id("rsvp"), createdAt: now() };
    store().rsvps.push(rsvp);
    return ok(rsvp);
  },
  updateRsvpStatus: async (rid, status) => {
    const r = store().rsvps.find((x) => x.id === rid);
    if (r) r.status = status;
  },

  confirmedCounts: async (ids) => {
    const out: Record<string, number> = {};
    for (const i of ids) out[i] = store().rsvps.filter((r) => r.eventId === i && r.status === "confirmed").length;
    return out;
  },

  listCategories: async () => ok(seed.forumCategories),
  listPosts: async (q: PostQuery = {}) => {
    const term = q.q?.toLowerCase().trim();
    const posts = store().posts.filter(
      (p) =>
        (q.includeRemoved || !p.isRemoved) &&
        (!q.category || p.categorySlug === q.category) &&
        (!q.authorId || p.authorId === q.authorId) &&
        (!q.ids || q.ids.includes(p.id)) &&
        (!q.publicPreviewOnly || p.isPublicPreview) &&
        (!term || `${p.title} ${p.body}`.toLowerCase().includes(term)),
    );
    return ok(sortPosts(posts, q.sort).slice(0, q.limit ?? 100));
  },
  getPost: async (pid) => ok(store().posts.find((p) => p.id === pid) ?? null),
  createPost: async (p) => {
    const t = now();
    const post: Post = {
      ...p,
      id: id("p"),
      createdAt: t,
      lastActivityAt: t,
      score: 1,
      replyCount: 0,
      isPinned: false,
      isLocked: false,
      isRemoved: false,
      isPublicPreview: false,
      isSample: false,
    };
    store().posts.push(post);
    store().votes.set(`${p.authorId}:post:${post.id}`, 1);
    return ok(post);
  },
  moderatePost: async (pid, patch) => {
    const p = store().posts.find((x) => x.id === pid);
    if (p) Object.assign(p, patch);
  },
  listReplies: async (pid, includeRemoved) =>
    ok(
      store()
        .replies.filter((r) => r.postId === pid && (includeRemoved || !r.isRemoved))
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
    ),
  createReply: async (r) => {
    const s = store();
    const reply: Reply = { ...r, id: id("c"), createdAt: now(), score: 0, isRemoved: false };
    s.replies.push(reply);
    const p = s.posts.find((x) => x.id === r.postId);
    if (p) {
      p.replyCount++;
      p.lastActivityAt = reply.createdAt;
    }
    return ok(reply);
  },
  moderateReply: async (rid, patch) => {
    const s = store();
    const r = s.replies.find((x) => x.id === rid);
    if (!r || r.isRemoved === patch.isRemoved) return;
    r.isRemoved = patch.isRemoved;
    const p = s.posts.find((x) => x.id === r.postId);
    if (p) p.replyCount += patch.isRemoved ? -1 : 1;
  },
  getReply: async (rid) => ok(store().replies.find((r) => r.id === rid) ?? null),
  vote: async (uid, target, value) => {
    const s = store();
    const key = `${uid}:${target.type}:${target.id}`;
    const prev = s.votes.get(key) ?? 0;
    if (value === 0) s.votes.delete(key);
    else s.votes.set(key, value);
    const item =
      target.type === "post"
        ? s.posts.find((p) => p.id === target.id)
        : s.replies.find((r) => r.id === target.id);
    if (item) item.score += value - prev;
  },
  getUserVotes: async (uid, ids) => {
    const out: Record<string, number> = {};
    for (const [k, v] of store().votes) {
      const [u, , tid] = k.split(":");
      if (u === uid && ids.includes(tid)) out[tid] = v;
    }
    return out;
  },
  toggleBookmark: async (uid, pid) => {
    const b = store().bookmarks;
    const key = `${uid}:${pid}`;
    if (b.has(key)) {
      b.delete(key);
      return false;
    }
    b.add(key);
    return true;
  },
  listBookmarkIds: async (uid) =>
    [...store().bookmarks].filter((k) => k.startsWith(uid + ":")).map((k) => k.split(":")[1]),
  createReport: async (r) => {
    store().reports.push({ ...r, id: id("rep"), status: "open", createdAt: now() });
  },
  listReports: async (status) =>
    ok(store().reports.filter((r) => !status || r.status === status)),
  setReportStatus: async (rid, status) => {
    const r = store().reports.find((x) => x.id === rid);
    if (r) r.status = status;
  },

  listCourses: async (opts) =>
    ok(store().courses.filter((c) => opts?.includeDrafts || c.status === "published")),
  getCourse: async (slug) => ok(store().courses.find((c) => c.slug === slug) ?? null),
  saveCourse: async (course) => {
    const s = store();
    const i = s.courses.findIndex((c) => c.id === course.id);
    if (i >= 0) s.courses[i] = course;
    else s.courses.push(course);
  },
  listCompletedLessons: async (uid) =>
    [...store().progress].filter((k) => k.startsWith(uid + ":")).map((k) => k.split(":")[1]),
  setLessonComplete: async (uid, _courseId, lessonId, done) => {
    const key = `${uid}:${lessonId}`;
    if (done) store().progress.add(key);
    else store().progress.delete(key);
  },

  listStartups: async (opts) =>
    ok(
      store().startups.filter(
        (s) =>
          (opts?.approval === "all" || s.approval === (opts?.approval ?? "approved")) &&
          (!opts?.submittedBy || s.submittedBy === opts.submittedBy),
      ),
    ),
  getStartup: async (slug) => ok(store().startups.find((s) => s.slug === slug) ?? null),
  saveStartup: async (st) => {
    const s = store();
    const i = s.startups.findIndex((x) => x.id === st.id);
    if (i >= 0) s.startups[i] = st;
    else s.startups.push(st);
  },

  createAmbassadorApplication: async (a) => {
    store().ambassadors.push({ ...a, id: id("amb"), status: "new", createdAt: now() });
  },
  listAmbassadorApplications: async () => ok(store().ambassadors),
  createContactMessage: async (m) => {
    store().contacts.push({ ...m, id: id("msg"), createdAt: now() });
  },
  listContactMessages: async () => ok(store().contacts),
  createCollabRequest: async (r) => {
    store().collabs.push({ ...r, id: id("cr"), status: "pending", sharedContact: null, createdAt: now() });
  },
  listCollabRequests: async (uid) =>
    ok(store().collabs.filter((c) => c.fromId === uid || c.toId === uid)),
  respondCollabRequest: async (cid, toId, accept, contact) => {
    const c = store().collabs.find((x) => x.id === cid && x.toId === toId);
    if (c) {
      c.status = accept ? "accepted" : "declined";
      c.sharedContact = accept ? contact : null;
    }
  },

  createDeletionRequest: async (uid, reason) => {
    store().deletions.push({ id: id("del"), userId: uid, reason, status: "open", createdAt: now() });
  },
  listDeletionRequests: async () => ok(store().deletions),
  getOpenDeletionRequest: async (uid) =>
    ok(store().deletions.find((d) => d.userId === uid && d.status === "open") ?? null),
};
