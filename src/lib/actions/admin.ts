"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { assertPermission } from "../auth";
import { isSupabaseConfigured } from "../config";
import { repo } from "../data";
import { sendEmail, templates } from "../email";
import type {
  ApplicationStatus,
  Course,
  CourseCategory,
  EventCategory,
  Lesson,
  PlatformSettings,
  ReportStatus,
  Role,
  Startup,
  Tier,
  YCEvent,
} from "../types";
import { COURSE_CATEGORIES, EVENT_CATEGORIES } from "../types";
import { londonLocalToISO, slugify, str } from "../utils";
import type { ActionState } from "./types";

/* ═════════════ APPLICATIONS ═════════════ */
export async function reviewApplication(fd: FormData) {
  await assertPermission("reviewApplications");
  const status = str(fd, "status") as ApplicationStatus;
  if (!["verified", "rejected", "more_info", "pending"].includes(status)) throw new Error("Invalid status");
  const tier = (str(fd, "tier") === "essex_alumni" ? "essex_alumni" : "standard") as Tier;
  const updated = await repo().reviewApplication(str(fd, "id"), { status, tier, note: str(fd, "note", 1000) });
  if (updated && status !== "pending") {
    await sendEmail(updated.email, templates.applicationDecision(updated.fullName.split(" ")[0], status, updated.reviewerNote));
  }
  revalidatePath("/admin", "layout");
}

export async function setMemberRoles(fd: FormData) {
  await assertPermission("manageRoles");
  const allowed: Role[] = ["super_admin", "admin", "event_manager", "moderator", "mentor", "member"];
  const roles = fd.getAll("roles").map(String).filter((r): r is Role => allowed.includes(r as Role));
  await repo().setRoles(str(fd, "userId"), Array.from(new Set<Role>(["member", ...roles])));
  revalidatePath("/admin/members");
}

/* ═════════════ EVENTS ═════════════ */
export async function saveEvent(_: ActionState, fd: FormData): Promise<ActionState> {
  await assertPermission("manageEvents");
  const id = str(fd, "id") || `new_${crypto.randomUUID()}`;
  const title = str(fd, "title", 160);
  const startsAt = str(fd, "startsAt");
  const endsAt = str(fd, "endsAt");
  if (title.length < 3) return { ok: false, message: "Add a title." };
  const startIso = londonLocalToISO(startsAt);
  const endIso = londonLocalToISO(endsAt);
  const start = new Date(startIso ?? "invalid");
  const end = new Date(endIso ?? "invalid");
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) return { ok: false, message: "Check the start and end times." };
  const category = str(fd, "category") as EventCategory;
  const capRaw = str(fd, "capacity");
  const speakerName = str(fd, "speakerName", 120);
  const event: YCEvent = {
    id: id.startsWith("new_") && !isSupabaseConfigured ? `ev_${crypto.randomUUID().slice(0, 8)}` : id,
    slug: str(fd, "slug", 80) || slugify(title),
    title,
    category: EVENT_CATEGORIES.includes(category) ? category : "Networking",
    format: (["in_person", "online", "hybrid"].includes(str(fd, "format")) ? str(fd, "format") : "in_person") as YCEvent["format"],
    startsAt: start.toISOString(),
    endsAt: end.toISOString(),
    location: str(fd, "location", 200),
    summary: str(fd, "summary", 300),
    description: str(fd, "description", 6000),
    speaker: speakerName ? { name: speakerName, title: str(fd, "speakerTitle", 160), bio: str(fd, "speakerBio", 1500) } : null,
    capacity: capRaw ? Math.max(1, parseInt(capRaw, 10)) : null,
    access: str(fd, "access") === "public" ? "public" : "members",
    priceNote: str(fd, "priceNote", 120),
    status: (["draft", "published", "cancelled", "archived"].includes(str(fd, "status")) ? str(fd, "status") : "draft") as YCEvent["status"],
    isSample: fd.get("isSample") === "on",
  };
  try {
    await repo().saveEvent(event);
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Could not save event." };
  }
  revalidatePath("/events", "layout");
  revalidatePath("/admin/events");
  redirect("/admin/events?saved=1");
}

export async function setEventStatus(fd: FormData) {
  await assertPermission("manageEvents");
  const e = await repo().getEventById(str(fd, "id"));
  const status = str(fd, "status") as YCEvent["status"];
  if (!e || !["draft", "published", "cancelled", "archived"].includes(status)) throw new Error("Invalid");
  await repo().saveEvent({ ...e, status });
  revalidatePath("/events", "layout");
  revalidatePath("/admin/events");
}

export async function setRsvpStatus(fd: FormData) {
  await assertPermission("manageEvents");
  const status = str(fd, "status") as "confirmed" | "waitlist" | "cancelled";
  if (!["confirmed", "waitlist", "cancelled"].includes(status)) throw new Error("Invalid");
  await repo().updateRsvpStatus(str(fd, "id"), status);
  revalidatePath("/admin/events", "layout");
}

/* ═════════════ MODERATION ═════════════ */
export async function moderatePost(fd: FormData) {
  await assertPermission("moderate");
  const field = str(fd, "field");
  const value = str(fd, "value") === "1";
  if (!["isPinned", "isLocked", "isRemoved", "isPublicPreview"].includes(field)) throw new Error("Invalid");
  await repo().moderatePost(str(fd, "id"), { [field]: value });
  revalidatePath("/forum", "layout");
  revalidatePath("/admin/moderation");
  revalidatePath("/");
}

export async function moderateReply(fd: FormData) {
  await assertPermission("moderate");
  await repo().moderateReply(str(fd, "id"), { isRemoved: str(fd, "value") === "1" });
  revalidatePath("/forum", "layout");
  revalidatePath("/admin/moderation");
}

export async function resolveReport(fd: FormData) {
  await assertPermission("moderate");
  const status = str(fd, "status") as ReportStatus;
  if (!["open", "resolved", "dismissed"].includes(status)) throw new Error("Invalid");
  await repo().setReportStatus(str(fd, "id"), status);
  revalidatePath("/admin/moderation");
}

/* ═════════════ LEARNING ═════════════ */
export async function saveCourse(_: ActionState, fd: FormData): Promise<ActionState> {
  await assertPermission("manageLearning");
  const title = str(fd, "title", 160);
  if (title.length < 3) return { ok: false, message: "Add a title." };
  const category = str(fd, "category") as CourseCategory;
  // Lessons are submitted as parallel arrays.
  const titles = fd.getAll("lessonTitle").map(String);
  const kinds = fd.getAll("lessonKind").map(String);
  const bodies = fd.getAll("lessonBody").map(String);
  const urls = fd.getAll("lessonUrl").map(String);
  const minutes = fd.getAll("lessonMinutes").map(String);
  const ids = fd.getAll("lessonId").map(String);
  const lessons: Lesson[] = titles
    .map((t, i) => ({
      id: ids[i] || crypto.randomUUID(), // stable ids preserve member progress
      title: t.trim().slice(0, 160),
      kind: (["text", "video", "pdf", "link"].includes(kinds[i]) ? kinds[i] : "text") as Lesson["kind"],
      body: (bodies[i] ?? "").slice(0, 20000),
      url: /^https:\/\//.test(urls[i] ?? "") ? urls[i] : "",
      minutes: Math.max(1, parseInt(minutes[i] || "10", 10) || 10),
    }))
    .filter((l) => l.title);
  const id = str(fd, "id") || `new_${crypto.randomUUID()}`;
  const course: Course = {
    id: id.startsWith("new_") && !isSupabaseConfigured ? `co_${crypto.randomUUID().slice(0, 8)}` : id,
    slug: str(fd, "slug", 80) || slugify(title),
    title,
    category: COURSE_CATEGORIES.includes(category) ? category : "Entrepreneurship",
    summary: str(fd, "summary", 400),
    level: (["Beginner", "Intermediate", "Advanced"].includes(str(fd, "level")) ? str(fd, "level") : "Beginner") as Course["level"],
    skills: str(fd, "skills", 300).split(",").map((s) => s.trim()).filter(Boolean),
    access: str(fd, "access") === "premium" ? "premium" : "included",
    relatedEventSlugs: str(fd, "relatedEventSlugs", 400).split(",").map((s) => s.trim()).filter(Boolean),
    status: str(fd, "status") === "published" ? "published" : "draft",
    isSample: fd.get("isSample") === "on",
    lessons,
  };
  try {
    await repo().saveCourse(course);
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Could not save course." };
  }
  revalidatePath("/upskill", "layout");
  redirect("/admin/learning?saved=1");
}

/* ═════════════ STARTUPS ═════════════ */
export async function setStartupApproval(fd: FormData) {
  await assertPermission("manageStartups");
  const s = await repo().getStartup(str(fd, "slug"));
  const approval = str(fd, "approval") as Startup["approval"];
  if (!s || !["pending", "approved", "rejected"].includes(approval)) throw new Error("Invalid");
  await repo().saveStartup({ ...s, approval });
  revalidatePath("/startups", "layout");
  revalidatePath("/admin/startups");
}

/* ═════════════ SETTINGS ═════════════ */
export async function updateSettings(_: ActionState, fd: FormData): Promise<ActionState> {
  await assertPermission("manageSettings");
  const int = (k: string, min: number, max: number) => {
    const n = parseInt(str(fd, k), 10);
    if (Number.isNaN(n) || n < min || n > max) throw new Error(`${k} must be between ${min} and ${max}.`);
    return n;
  };
  try {
    const patch: Partial<PlatformSettings> = {
      recentAlumniYears: int("recentAlumniYears", 0, 20),
      maxAgeExclusive: int("maxAgeExclusive", 18, 100),
      verificationRetentionDays: int("verificationRetentionDays", 7, 730),
      priceEssexPence: int("priceEssexPence", 0, 100000),
      priceStandardPence: int("priceStandardPence", 0, 100000),
      requireProofOfStatus: fd.get("requireProofOfStatus") === "on",
      essexUniversityNames: str(fd, "essexUniversityNames", 500).split(",").map((s) => s.trim()).filter(Boolean),
      essexEmailDomains: str(fd, "essexEmailDomains", 500).split(",").map((s) => s.trim().toLowerCase()).filter(Boolean),
    };
    await repo().updateSettings(patch);
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Invalid settings." };
  }
  revalidatePath("/", "layout");
  return { ok: true, message: "Settings saved. Remember: displayed prices must match your Stripe Prices." };
}
