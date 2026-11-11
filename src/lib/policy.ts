import type {
  Application,
  Membership,
  PlatformSettings,
  Role,
  StudentStatus,
  Tier,
} from "./types";

export const DEFAULT_SETTINGS: PlatformSettings = {
  recentAlumniYears: 5, // PROVISIONAL default — admins set the real definition in /admin/settings
  maxAgeExclusive: 38,
  essexUniversityNames: ["University of Essex"],
  essexEmailDomains: ["essex.ac.uk"],
  requireProofOfStatus: true,
  priceEssexPence: 3000,
  priceStandardPence: 5000,
  verificationRetentionDays: 90,
};

export function ageOn(dob: string, on: Date = new Date()): number {
  const d = new Date(dob + "T00:00:00Z");
  let age = on.getUTCFullYear() - d.getUTCFullYear();
  const m = on.getUTCMonth() - d.getUTCMonth();
  if (m < 0 || (m === 0 && on.getUTCDate() < d.getUTCDate())) age--;
  return age;
}

export interface EligibilityInput {
  dateOfBirth: string;
  studentStatus: StudentStatus;
  graduationYear: number | null;
  university: string;
}

/** Returns a list of problems; empty means provisionally eligible (pending verification). */
export function checkEligibility(
  input: EligibilityInput,
  settings: PlatformSettings,
  now: Date = new Date(),
): string[] {
  const problems: string[] = [];
  const dob = new Date(input.dateOfBirth + "T00:00:00Z");
  if (Number.isNaN(dob.getTime()) || dob > now) {
    problems.push("Please enter a valid date of birth.");
    return problems;
  }
  const age = ageOn(input.dateOfBirth, now);
  if (age < 16) problems.push("Members must be at least 16 years old.");
  if (age >= settings.maxAgeExclusive)
    problems.push(`Membership is open to people under ${settings.maxAgeExclusive}.`);
  if (!input.university.trim()) problems.push("Please tell us your university.");
  if (input.studentStatus === "alumni") {
    const year = input.graduationYear;
    if (!year) problems.push("Please add your graduation year.");
    else {
      const thisYear = now.getUTCFullYear();
      if (year > thisYear) problems.push("Graduation year can't be in the future for alumni.");
      else if (thisYear - year > settings.recentAlumniYears)
        problems.push(
          `Alumni membership is currently open to people who graduated within the last ${settings.recentAlumniYears} years.`,
        );
    }
  }
  return problems;
}

export function isEssexUniversity(university: string, settings: PlatformSettings) {
  const u = university.trim().toLowerCase();
  return settings.essexUniversityNames.some((n) => n.toLowerCase() === u);
}

/** Tier suggestion at application time. Final tier is confirmed by an admin on verification. */
export function suggestTier(
  input: { university: string; studentStatus: StudentStatus },
  settings: PlatformSettings,
): Tier {
  return input.studentStatus === "alumni" && isEssexUniversity(input.university, settings)
    ? "essex_alumni"
    : "standard";
}

export function tierLabel(tier: Tier) {
  return tier === "essex_alumni" ? "Essex Alumni" : "Eligible Member";
}

export function tierPricePence(tier: Tier, settings: PlatformSettings) {
  return tier === "essex_alumni" ? settings.priceEssexPence : settings.priceStandardPence;
}

export function formatPence(p: number) {
  return `£${(p / 100).toFixed(p % 100 === 0 ? 0 : 2)}`;
}

/**
 * Membership is active ONLY when the applicant is verified AND a paid,
 * unexpired subscription has been confirmed by a Stripe webhook.
 */
export function isMembershipActive(
  application: Application | null,
  membership: Membership | null,
  now: Date = new Date(),
): boolean {
  if (!application || application.status !== "verified") return false;
  if (!membership) return false;
  if (!["active", "past_due"].includes(membership.status)) return false;
  if (!membership.currentPeriodEnd) return false;
  return new Date(membership.currentPeriodEnd) > now;
}

export const STAFF_ROLES: Role[] = ["super_admin", "admin", "event_manager", "moderator"];

export const ROLE_LABELS: Record<Role, string> = {
  super_admin: "Super Admin",
  admin: "Admin / Operations",
  event_manager: "Event Manager",
  moderator: "Community Moderator",
  mentor: "Mentor / Advisor",
  member: "Member",
};

/** Permission matrix used for server-side checks (mirrored by RLS in SQL). */
export const PERMISSIONS = {
  reviewApplications: ["super_admin", "admin"],
  manageMembers: ["super_admin", "admin"],
  manageRoles: ["super_admin"],
  manageEvents: ["super_admin", "admin", "event_manager"],
  moderate: ["super_admin", "admin", "moderator"],
  manageLearning: ["super_admin", "admin"],
  manageStartups: ["super_admin", "admin"],
  manageSettings: ["super_admin"],
  viewMetrics: ["super_admin", "admin", "event_manager", "moderator"],
  exportData: ["super_admin", "admin"],
} satisfies Record<string, Role[]>;
export type Permission = keyof typeof PERMISSIONS;

export function can(roles: Role[], permission: Permission) {
  return roles.some((r) => (PERMISSIONS[permission] as Role[]).includes(r));
}
