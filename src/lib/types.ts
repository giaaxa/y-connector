/* Domain model for Y Connector. Mirrors supabase/migrations/0001_schema.sql. */

export type Role =
  | "super_admin"
  | "admin"
  | "event_manager"
  | "moderator"
  | "mentor"
  | "member";

export type ApplicationStatus = "pending" | "verified" | "rejected" | "more_info";
export type StudentStatus = "student" | "alumni";
export type Tier = "essex_alumni" | "standard";
export type MembershipStatus =
  | "none"
  | "incomplete"
  | "active"
  | "past_due"
  | "canceled"
  | "expired";

export type StartupStage =
  | "idea"
  | "exploring"
  | "building"
  | "pilot"
  | "launched"
  | "growing";

export interface Profile {
  id: string;
  fullName: string;
  headline: string;
  university: string;
  city: string;
  bio: string;
  skills: string[];
  interests: string[];
  currentProjects: string;
  startupStage: StartupStage | null;
  lookingForCollaborators: boolean;
  availableForMentoring: boolean;
  websiteUrl: string;
  discoverable: boolean;
  allowContact: boolean;
  roles: Role[];
  referralCode: string;
  referredBy: string | null;
  createdAt: string;
}

/** Private: only visible to the applicant and to admins. */
export interface Application {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  dateOfBirth: string; // ISO date
  university: string;
  studentStatus: StudentStatus;
  graduationYear: number | null;
  universityEmail: string;
  universityEmailVerified: boolean;
  proofPath: string | null;
  location: string;
  interests: string[];
  professionalInterests: string;
  status: ApplicationStatus;
  tier: Tier;
  reviewerNote: string;
  submittedAt: string;
  reviewedAt: string | null;
}

export interface Membership {
  userId: string;
  tier: Tier;
  status: MembershipStatus;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  amountPence: number;
  updatedAt: string;
}

export type EventFormat = "in_person" | "online" | "hybrid";
export type EventStatus = "draft" | "published" | "cancelled" | "archived";
export type EventAccess = "public" | "members";

export const EVENT_CATEGORIES = [
  "Founder Conversation",
  "AI Workshop",
  "FinTech Session",
  "Industry Speaker",
  "Masterclass",
  "Networking",
  "Startup Lab",
  "Investment Education",
] as const;
export type EventCategory = (typeof EVENT_CATEGORIES)[number];

export interface Speaker {
  name: string;
  title: string;
  bio: string;
}

export interface YCEvent {
  id: string;
  slug: string;
  title: string;
  category: EventCategory;
  format: EventFormat;
  startsAt: string;
  endsAt: string;
  location: string;
  summary: string;
  description: string;
  speaker: Speaker | null;
  capacity: number | null;
  access: EventAccess;
  priceNote: string;
  status: EventStatus;
  isSample: boolean;
}

export type RsvpStatus = "confirmed" | "waitlist" | "cancelled";
export interface Rsvp {
  id: string;
  eventId: string;
  userId: string | null;
  name: string;
  email: string;
  status: RsvpStatus;
  createdAt: string;
}

export interface ForumCategory {
  slug: string;
  name: string;
  description: string;
}

export interface Post {
  id: string;
  categorySlug: string;
  authorId: string;
  title: string;
  body: string;
  createdAt: string;
  lastActivityAt: string;
  score: number;
  replyCount: number;
  isPinned: boolean;
  isLocked: boolean;
  isRemoved: boolean;
  isPublicPreview: boolean;
  isSample: boolean;
}

export interface Reply {
  id: string;
  postId: string;
  authorId: string;
  body: string;
  createdAt: string;
  score: number;
  isRemoved: boolean;
}

export type ReportStatus = "open" | "resolved" | "dismissed";
export interface Report {
  id: string;
  targetType: "post" | "reply";
  targetId: string;
  reporterId: string;
  reason: string;
  status: ReportStatus;
  createdAt: string;
}

export const COURSE_CATEGORIES = [
  "AI Fundamentals",
  "Building With AI",
  "Digital Marketing",
  "FinTech & Digital Payments",
  "Understanding Markets",
  "Entrepreneurship",
] as const;
export type CourseCategory = (typeof COURSE_CATEGORIES)[number];

export type LessonKind = "text" | "video" | "pdf" | "link";
export interface Lesson {
  id: string;
  title: string;
  kind: LessonKind;
  body: string;
  url: string;
  minutes: number;
}

export interface Course {
  id: string;
  slug: string;
  title: string;
  category: CourseCategory;
  summary: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  skills: string[];
  /** included = part of membership; premium = possible future separately priced package */
  access: "included" | "premium";
  lessons: Lesson[];
  relatedEventSlugs: string[];
  status: "draft" | "published";
  isSample: boolean;
}

export type StartupStatusStage = "exploring" | "building" | "pilot" | "launched" | "growing";
export type ApprovalStatus = "pending" | "approved" | "rejected";

export interface Startup {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  industry: string;
  stage: StartupStatusStage;
  website: string;
  founders: string[]; // only names that have consented to display
  teamNeeds: string[];
  milestones: string[];
  communityConnection: string;
  themes: string[];
  approval: ApprovalStatus;
  submittedBy: string | null;
  isSample: boolean;
  createdAt: string;
}

export interface AmbassadorApplication {
  id: string;
  name: string;
  email: string;
  location: string;
  focus: string;
  message: string;
  status: "new" | "contacted" | "accepted" | "declined";
  createdAt: string;
}

export interface CollabRequest {
  id: string;
  fromId: string;
  toId: string;
  message: string;
  status: "pending" | "accepted" | "declined";
  /** Shared only once the recipient accepts. */
  sharedContact: string | null;
  createdAt: string;
}

export interface PlatformSettings {
  /** How many years after graduation an alum counts as "recent". Admin-configurable. */
  recentAlumniYears: number;
  /** Applicants must be strictly younger than this age. */
  maxAgeExclusive: number;
  /** University names that qualify for the Essex alumni tier. */
  essexUniversityNames: string[];
  /** Email domains treated as Essex institutional email. */
  essexEmailDomains: string[];
  /** Require a university email OR proof-of-status upload. */
  requireProofOfStatus: boolean;
  /** Shown publicly; Stripe Price IDs are the source of truth for charging. */
  priceEssexPence: number;
  priceStandardPence: number;
  /** Months after which verification documents are deleted post-decision. */
  verificationRetentionDays: number;
}

export interface DeletionRequest {
  id: string;
  userId: string;
  reason: string;
  status: "open" | "completed";
  createdAt: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  topic: string;
  message: string;
  createdAt: string;
}

export interface Viewer {
  id: string;
  email: string;
  profile: Profile;
  application: Application | null;
  membership: Membership | null;
  roles: Role[];
  isActiveMember: boolean;
  isStaff: boolean;
}
