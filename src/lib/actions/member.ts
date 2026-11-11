"use server";

import { revalidatePath } from "next/cache";
import { redirect, unstable_rethrow } from "next/navigation";
import { z } from "zod";
import { assertActiveMember, getViewer } from "../auth";
import { isSupabaseConfigured } from "../config";
import { repo } from "../data";
import { sendEmail, templates } from "../email";
import type { Profile, StartupStage, Startup } from "../types";
import { formatEventDate, formatTime, isEmail, slugify, str } from "../utils";
import type { ActionState } from "./types";

const fail = (message: string): ActionState => ({ ok: false, message });
const errMsg = (e: unknown) => (e instanceof Error ? e.message : "Something went wrong.");

/* ═════════════ EVENTS ═════════════ */

export async function rsvpToEvent(_: ActionState, fd: FormData): Promise<ActionState> {
  const r = repo();
  const viewer = await getViewer();
  const event = await r.getEventById(str(fd, "eventId"));
  if (!event || event.status !== "published") return fail("This event isn't open for registration.");
  if (new Date(event.startsAt) < new Date()) return fail("This event has already started.");
  if (event.access === "members" && !viewer?.isActiveMember) return fail("This event is for active members. Sign in or join to register.");

  const name = viewer?.profile.fullName ?? str(fd, "name", 120);
  const email = (viewer?.email ?? str(fd, "email", 200)).toLowerCase();
  if (!name || !isEmail(email)) return fail("Please add your name and a valid email address.");
  if (!viewer && fd.get("consent") !== "on") return fail("Please agree to the privacy policy to register.");

  try {
    let status: "confirmed" | "waitlist";
    if (isSupabaseConfigured) {
      status = (await r.createRsvp({ eventId: event.id, userId: viewer?.id ?? null, name, email, status: "confirmed" })).status as typeof status;
    } else {
      const existing = (await r.listRsvps(event.id)).find((x) => x.email === email && x.status !== "cancelled");
      if (existing) return { ok: true, message: `You're already ${existing.status === "waitlist" ? "on the waitlist" : "registered"}.` };
      const taken = (await r.confirmedCounts([event.id]))[event.id] ?? 0;
      status = event.capacity !== null && taken >= event.capacity ? "waitlist" : "confirmed";
      await r.createRsvp({ eventId: event.id, userId: viewer?.id ?? null, name, email, status });
    }
    await sendEmail(email, templates.rsvpConfirmed(name.split(" ")[0], event.title, `${formatEventDate(event.startsAt)}, ${formatTime(event.startsAt)} — ${event.location}`, status));
    revalidatePath(`/events/${event.slug}`);
    revalidatePath("/dashboard");
    return {
      ok: true,
      message: status === "waitlist" ? "The event is full — you're on the waitlist. We'll email you if a place opens." : "You're in! A confirmation has been sent to your email.",
      data: { status },
    };
  } catch (e) {
    return fail(errMsg(e));
  }
}

export async function cancelRsvp(fd: FormData) {
  const v = await getViewer();
  if (!v) throw new Error("Please sign in.");
  const id = str(fd, "rsvpId");
  const mine = (await repo().listUserRsvps(v.id)).find((r) => r.id === id);
  if (!mine) throw new Error("Registration not found.");
  await repo().updateRsvpStatus(id, "cancelled");
  revalidatePath("/dashboard");
  revalidatePath("/events", "layout");
}

/* ═════════════ FORUM ═════════════ */

const postSchema = z.object({
  title: z.string().trim().min(5, "Titles need at least 5 characters.").max(200),
  body: z.string().trim().min(1, "Write something first.").max(10000),
  categorySlug: z.string().min(1, "Choose a category."),
});

export async function createPost(_: ActionState, fd: FormData): Promise<ActionState> {
  try {
    const v = await assertActiveMember();
    const parsed = postSchema.safeParse({ title: str(fd, "title", 200), body: str(fd, "body", 10000), categorySlug: str(fd, "category") });
    if (!parsed.success) return fail(parsed.error.issues[0].message);
    const cats = await repo().listCategories();
    if (!cats.some((c) => c.slug === parsed.data.categorySlug)) return fail("Choose a valid category.");
    const post = await repo().createPost({ ...parsed.data, authorId: v.id });
    revalidatePath("/forum", "layout");
    redirect(`/forum/post/${post.id}`);
  } catch (e) {
    unstable_rethrow(e);
    return fail(errMsg(e));
  }
}

export async function createReply(_: ActionState, fd: FormData): Promise<ActionState> {
  try {
    const v = await assertActiveMember();
    const postId = str(fd, "postId");
    const body = str(fd, "body", 5000);
    if (!body) return fail("Write a reply first.");
    const post = await repo().getPost(postId);
    if (!post || post.isRemoved) return fail("This thread no longer exists.");
    if (post.isLocked) return fail("This thread is locked.");
    await repo().createReply({ postId, authorId: v.id, body });
    revalidatePath(`/forum/post/${postId}`);
    return { ok: true, message: "Reply posted." };
  } catch (e) {
    return fail(errMsg(e));
  }
}

export async function castVote(fd: FormData) {
  const v = await assertActiveMember();
  const type = str(fd, "type") === "reply" ? "reply" : "post";
  const id = str(fd, "id");
  const value = Number(str(fd, "value"));
  if (![-1, 0, 1].includes(value)) throw new Error("Invalid vote");
  await repo().vote(v.id, { type, id }, value as -1 | 0 | 1);
  revalidatePath("/forum", "layout");
}

export async function toggleBookmark(fd: FormData) {
  const v = await assertActiveMember();
  await repo().toggleBookmark(v.id, str(fd, "postId"));
  revalidatePath("/forum", "layout");
}

export async function reportContent(_: ActionState, fd: FormData): Promise<ActionState> {
  try {
    const v = await assertActiveMember();
    const reason = str(fd, "reason", 1000);
    if (reason.length < 3) return fail("Tell the moderators briefly what's wrong.");
    const targetType = str(fd, "targetType") === "reply" ? "reply" : "post";
    await repo().createReport({ targetType, targetId: str(fd, "targetId"), reporterId: v.id, reason });
    return { ok: true, message: "Thanks — a moderator will review this." };
  } catch (e) {
    return fail(errMsg(e));
  }
}

/* ═════════════ PROFILE & DIRECTORY ═════════════ */

const STAGES: StartupStage[] = ["idea", "exploring", "building", "pilot", "launched", "growing"];

export async function updateProfile(_: ActionState, fd: FormData): Promise<ActionState> {
  const v = await getViewer();
  if (!v) return fail("Please sign in.");
  const website = str(fd, "websiteUrl", 300);
  if (website && !/^https:\/\/[^\s]+$/i.test(website)) return fail("Links must start with https://");
  const stage = str(fd, "startupStage") as StartupStage;
  const patch: Partial<Profile> = {
    fullName: str(fd, "fullName", 120) || v.profile.fullName,
    headline: str(fd, "headline", 140),
    university: str(fd, "university", 160),
    city: str(fd, "city", 120),
    bio: str(fd, "bio", 1200),
    skills: fd.getAll("skills").map(String).slice(0, 15),
    interests: fd.getAll("interests").map(String).slice(0, 15),
    currentProjects: str(fd, "currentProjects", 600),
    startupStage: STAGES.includes(stage) ? stage : null,
    lookingForCollaborators: fd.get("lookingForCollaborators") === "on",
    availableForMentoring: fd.get("availableForMentoring") === "on",
    websiteUrl: website,
    discoverable: fd.get("discoverable") === "on",
    allowContact: fd.get("allowContact") === "on",
  };
  await repo().updateProfile(v.id, patch);
  revalidatePath("/", "layout");
  return { ok: true, message: "Profile saved." };
}

export async function sendCollabRequest(_: ActionState, fd: FormData): Promise<ActionState> {
  try {
    const v = await assertActiveMember();
    const toId = str(fd, "toId");
    const message = str(fd, "message", 1000);
    if (toId === v.id) return fail("That's you!");
    if (message.length < 5) return fail("Add a short note about why you'd like to connect.");
    const target = await repo().getProfile(toId);
    if (!target?.allowContact) return fail("This member isn't accepting requests right now.");
    const existing = (await repo().listCollabRequests(v.id)).find((c) => c.toId === toId && c.status === "pending");
    if (existing) return fail("You already have a pending request with this member.");
    await repo().createCollabRequest({ fromId: v.id, toId, message });
    revalidatePath(`/members/${toId}`);
    return { ok: true, message: "Request sent. If they accept, you'll both see each other's contact email." };
  } catch (e) {
    return fail(errMsg(e));
  }
}

export async function respondCollab(fd: FormData) {
  const v = await assertActiveMember();
  const accept = str(fd, "decision") === "accept";
  await repo().respondCollabRequest(str(fd, "id"), v.id, accept, accept ? v.email : null);
  revalidatePath("/dashboard");
  revalidatePath("/connections");
}

/* ═════════════ LEARNING ═════════════ */

export async function toggleLesson(fd: FormData) {
  const v = await assertActiveMember();
  const course = await repo().getCourse(str(fd, "courseSlug"));
  const lessonId = str(fd, "lessonId");
  if (!course || course.access !== "included" || !course.lessons.some((l) => l.id === lessonId)) throw new Error("Lesson not found");
  await repo().setLessonComplete(v.id, course.id, lessonId, str(fd, "done") === "1");
  revalidatePath(`/upskill/${course.slug}`);
}

/* ═════════════ STARTUPS ═════════════ */

export async function submitStartup(_: ActionState, fd: FormData): Promise<ActionState> {
  try {
    const v = await assertActiveMember();
    const name = str(fd, "name", 80);
    if (name.length < 2) return fail("Add your project's name.");
    const website = str(fd, "website", 300);
    if (website && !/^https:\/\//i.test(website)) return fail("Website must start with https://");
    const list = (k: string) => str(fd, k, 600).split(/\n|,/).map((s) => s.trim()).filter(Boolean).slice(0, 8);
    const stage = str(fd, "stage") as Startup["stage"];
    const s: Startup = {
      id: `new_${crypto.randomUUID()}`,
      slug: `${slugify(name)}-${crypto.randomUUID().slice(0, 4)}`,
      name,
      tagline: str(fd, "tagline", 140),
      description: str(fd, "description", 2000),
      industry: str(fd, "industry", 80),
      stage: ["exploring", "building", "pilot", "launched", "growing"].includes(stage) ? stage : "exploring",
      website,
      founders: fd.get("showFounder") === "on" ? [v.profile.fullName] : [],
      teamNeeds: list("teamNeeds"),
      milestones: list("milestones"),
      communityConnection: str(fd, "communityConnection", 400),
      themes: fd.getAll("themes").map(String).slice(0, 5),
      approval: "pending",
      submittedBy: v.id,
      isSample: false,
      createdAt: new Date().toISOString(),
    };
    if (!isSupabaseConfigured) s.id = `s_${crypto.randomUUID().slice(0, 8)}`;
    await repo().saveStartup(s);
    revalidatePath("/projects");
    return { ok: true, message: "Submitted! An admin will review it before it appears on the public showcase." };
  } catch (e) {
    return fail(errMsg(e));
  }
}

/* ═════════════ GROWTH & CONTACT (public) ═════════════ */

export async function applyAmbassador(_: ActionState, fd: FormData): Promise<ActionState> {
  const name = str(fd, "name", 120);
  const email = str(fd, "email", 200).toLowerCase();
  if (!name || !isEmail(email)) return fail("Please add your name and a valid email.");
  if (fd.get("consent") !== "on") return fail("Please agree to the privacy policy.");
  if (str(fd, "company")) return { ok: true, message: "Thanks!" }; // honeypot
  await repo().createAmbassadorApplication({
    name,
    email,
    location: str(fd, "location", 120),
    focus: fd.getAll("focus").map(String).join(", "),
    message: str(fd, "message", 2000),
  });
  return { ok: true, message: "Thank you! We'll be in touch about getting involved." };
}

export async function sendContact(_: ActionState, fd: FormData): Promise<ActionState> {
  const name = str(fd, "name", 120);
  const email = str(fd, "email", 200).toLowerCase();
  const message = str(fd, "message", 4000);
  if (!name || !isEmail(email) || message.length < 10) return fail("Please add your name, a valid email and a message.");
  if (str(fd, "company")) return { ok: true, message: "Thanks!" }; // honeypot
  await repo().createContactMessage({ name, email, topic: str(fd, "topic", 80), message });
  return { ok: true, message: "Message received — we'll reply as soon as we can." };
}

/* ═════════════ PRIVACY ═════════════ */

export async function requestAccountDeletion(_: ActionState, fd: FormData): Promise<ActionState> {
  const v = await getViewer();
  if (!v) return fail("Please sign in.");
  if (fd.get("confirm") !== "DELETE") return fail('Type "DELETE" to confirm.');
  if (await repo().getOpenDeletionRequest(v.id)) return { ok: true, message: "Your deletion request is already being processed." };
  await repo().createDeletionRequest(v.id, str(fd, "reason", 1000));
  return {
    ok: true,
    message: "Request received. We'll cancel any active subscription and erase your data within 30 days, as required by UK GDPR.",
  };
}
