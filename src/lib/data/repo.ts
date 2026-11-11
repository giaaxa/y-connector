import type {
  AmbassadorApplication,
  Application,
  ApplicationStatus,
  CollabRequest,
  ContactMessage,
  Course,
  DeletionRequest,
  ForumCategory,
  Membership,
  PlatformSettings,
  Post,
  Profile,
  Reply,
  Report,
  ReportStatus,
  Role,
  Rsvp,
  Startup,
  Tier,
  YCEvent,
} from "../types";

export type PostSort = "new" | "active" | "top";

export interface PostQuery {
  category?: string;
  q?: string;
  sort?: PostSort;
  authorId?: string;
  ids?: string[];
  publicPreviewOnly?: boolean;
  includeRemoved?: boolean;
  limit?: number;
}

export interface DirectoryQuery {
  q?: string;
  skill?: string;
  collaborators?: boolean;
  mentors?: boolean;
}

/**
 * Data-access contract. Two implementations:
 *  - demo-repo.ts      in-memory sample data (no credentials needed)
 *  - supabase-repo.ts  PostgreSQL via Supabase, enforced by RLS
 * Callers must perform permission checks (lib/auth.ts) before mutating.
 */
export interface Repo {
  // Settings
  getSettings(): Promise<PlatformSettings>;
  updateSettings(patch: Partial<PlatformSettings>): Promise<void>;

  // Profiles
  getProfile(id: string): Promise<Profile | null>;
  getProfiles(ids: string[]): Promise<Profile[]>;
  listProfiles(): Promise<Profile[]>;
  searchDirectory(q: DirectoryQuery): Promise<Profile[]>;
  updateProfile(id: string, patch: Partial<Profile>): Promise<void>;
  findProfileByReferralCode(code: string): Promise<Profile | null>;
  listReferrals(userId: string): Promise<Profile[]>;
  setRoles(userId: string, roles: Role[]): Promise<void>;

  // Applications (private)
  getApplication(userId: string): Promise<Application | null>;
  saveApplication(app: Application): Promise<void>;
  listApplications(status?: ApplicationStatus): Promise<Application[]>;
  reviewApplication(
    id: string,
    decision: { status: ApplicationStatus; tier: Tier; note: string },
  ): Promise<Application | null>;

  // Membership (written by Stripe webhooks)
  getMembership(userId: string): Promise<Membership | null>;
  listMemberships(): Promise<Membership[]>;

  // Events
  listEvents(opts?: { includeUnpublished?: boolean }): Promise<YCEvent[]>;
  getEventBySlug(slug: string): Promise<YCEvent | null>;
  getEventById(id: string): Promise<YCEvent | null>;
  saveEvent(event: YCEvent): Promise<void>;
  listRsvps(eventId?: string): Promise<Rsvp[]>;
  listUserRsvps(userId: string): Promise<Rsvp[]>;
  createRsvp(rsvp: Omit<Rsvp, "id" | "createdAt">): Promise<Rsvp>;
  updateRsvpStatus(id: string, status: Rsvp["status"]): Promise<void>;
  /** Public-safe confirmed counts (no attendee data). */
  confirmedCounts(eventIds: string[]): Promise<Record<string, number>>;

  // Forum
  listCategories(): Promise<ForumCategory[]>;
  listPosts(q?: PostQuery): Promise<Post[]>;
  getPost(id: string): Promise<Post | null>;
  createPost(p: Pick<Post, "categorySlug" | "authorId" | "title" | "body">): Promise<Post>;
  moderatePost(
    id: string,
    patch: Partial<Pick<Post, "isPinned" | "isLocked" | "isRemoved" | "isPublicPreview">>,
  ): Promise<void>;
  listReplies(postId: string, includeRemoved?: boolean): Promise<Reply[]>;
  createReply(r: Pick<Reply, "postId" | "authorId" | "body">): Promise<Reply>;
  moderateReply(id: string, patch: { isRemoved: boolean }): Promise<void>;
  vote(userId: string, target: { type: "post" | "reply"; id: string }, value: -1 | 0 | 1): Promise<void>;
  getUserVotes(userId: string, ids: string[]): Promise<Record<string, number>>;
  toggleBookmark(userId: string, postId: string): Promise<boolean>;
  listBookmarkIds(userId: string): Promise<string[]>;
  createReport(r: Pick<Report, "targetType" | "targetId" | "reporterId" | "reason">): Promise<void>;
  listReports(status?: ReportStatus): Promise<Report[]>;
  setReportStatus(id: string, status: ReportStatus): Promise<void>;
  getReply(id: string): Promise<Reply | null>;

  // Learning
  listCourses(opts?: { includeDrafts?: boolean }): Promise<Course[]>;
  getCourse(slug: string): Promise<Course | null>;
  saveCourse(course: Course): Promise<void>;
  listCompletedLessons(userId: string): Promise<string[]>;
  setLessonComplete(userId: string, courseId: string, lessonId: string, done: boolean): Promise<void>;

  // Startups
  listStartups(opts?: { approval?: Startup["approval"] | "all"; submittedBy?: string }): Promise<Startup[]>;
  getStartup(slug: string): Promise<Startup | null>;
  saveStartup(s: Startup): Promise<void>;

  // Growth & contact
  createAmbassadorApplication(a: Omit<AmbassadorApplication, "id" | "createdAt" | "status">): Promise<void>;
  listAmbassadorApplications(): Promise<AmbassadorApplication[]>;
  createContactMessage(m: Omit<ContactMessage, "id" | "createdAt">): Promise<void>;
  listContactMessages(): Promise<ContactMessage[]>;
  createCollabRequest(r: Pick<CollabRequest, "fromId" | "toId" | "message">): Promise<void>;
  listCollabRequests(userId: string): Promise<CollabRequest[]>;
  respondCollabRequest(id: string, toId: string, accept: boolean, contact: string | null): Promise<void>;

  // Privacy
  createDeletionRequest(userId: string, reason: string): Promise<void>;
  listDeletionRequests(): Promise<DeletionRequest[]>;
  getOpenDeletionRequest(userId: string): Promise<DeletionRequest | null>;
}
