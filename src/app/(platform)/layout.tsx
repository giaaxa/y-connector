import { LogOut, Search } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { MobileTabBar, SidebarNav, type NavLink } from "@/components/platform/sidebar-nav";
import { DemoBanner } from "@/components/site/demo-banner";
import { Avatar } from "@/components/ui/primitives";
import { signOut } from "@/lib/actions/auth";
import { requireViewer } from "@/lib/auth";
import { repo } from "@/lib/data";
import { can, ROLE_LABELS } from "@/lib/policy";

export default async function PlatformLayout({ children }: { children: React.ReactNode }) {
  const v = await requireViewer();
  const locked = !v.isActiveMember;
  const pendingCollabs = v.isActiveMember ? (await repo().listCollabRequests(v.id)).filter((c) => c.toId === v.id && c.status === "pending").length : 0;

  const member: NavLink[] = [
    { href: "/dashboard", label: "Dashboard", icon: "dashboard" },
    { href: "/forum", label: "Community forum", icon: "forum", locked },
    { href: "/directory", label: "Talent directory", icon: "directory", locked },
    { href: "/connections", label: "Connections", icon: "connections", locked, badge: pendingCollabs },
    { href: "/events", label: "Events", icon: "events" },
    { href: "/upskill", label: "Learning hub", icon: "learn" },
    { href: "/projects", label: "My projects", icon: "projects", locked },
    { href: "/referrals", label: "Invite friends", icon: "referrals", locked },
  ];
  const adminLinks: NavLink[] = [];
  if (can(v.roles, "viewMetrics")) adminLinks.push({ href: "/admin", label: "Overview", icon: "admin" });
  if (can(v.roles, "reviewApplications")) adminLinks.push({ href: "/admin/applications", label: "Applications", icon: "applications" });
  if (can(v.roles, "manageMembers")) adminLinks.push({ href: "/admin/members", label: "Members", icon: "members" });
  if (can(v.roles, "manageEvents")) adminLinks.push({ href: "/admin/events", label: "Events & RSVPs", icon: "events" });
  if (can(v.roles, "moderate")) adminLinks.push({ href: "/admin/moderation", label: "Moderation", icon: "moderation" });
  if (can(v.roles, "manageLearning")) adminLinks.push({ href: "/admin/learning", label: "Learning", icon: "courses" });
  if (can(v.roles, "manageStartups")) adminLinks.push({ href: "/admin/startups", label: "Startups", icon: "projects" });
  if (can(v.roles, "manageSettings")) adminLinks.push({ href: "/admin/settings", label: "Settings", icon: "settings" });

  const sections: { title?: string; links: NavLink[] }[] = [
    { links: member },
    { title: "You", links: [{ href: "/account", label: "Account & billing", icon: "account" }] },
  ];
  if (adminLinks.length) sections.push({ title: "Admin", links: adminLinks });

  return (
    <div className="min-h-dvh bg-mist">
      <DemoBanner />
      <header className="sticky top-0 z-30 border-b border-line bg-white/90 backdrop-blur">
        <div className="flex h-16 items-center gap-4 px-4 sm:px-6">
          <Logo href="/dashboard" />
          <form action="/forum" className="ml-auto hidden max-w-sm flex-1 md:block" role="search">
            <label className="relative block">
              <span className="sr-only">Search discussions</span>
              <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-subtle" />
              <input name="q" placeholder="Search discussions…" className="h-10 w-full rounded-full border border-line bg-mist pr-4 pl-9 text-sm focus:border-ink focus:bg-white focus:outline-none" disabled={locked} />
            </label>
          </form>
          <div className="ml-auto flex items-center gap-3 md:ml-0">
            <Link href="/account" className="flex items-center gap-2.5 rounded-full py-1 pr-1 pl-3 hover:bg-fog">
              <span className="hidden text-right text-sm leading-tight sm:block">
                <span className="block font-semibold">{v.profile.fullName}</span>
                <span className="block text-xs text-muted">{v.roles.filter((r) => r !== "member").map((r) => ROLE_LABELS[r]).join(", ") || (v.isActiveMember ? "Member" : "Applicant")}</span>
              </span>
              <Avatar name={v.profile.fullName} size={34} />
            </Link>
            <form action={signOut}>
              <button aria-label="Sign out" className="rounded-full p-2 text-muted hover:bg-fog hover:text-ink"><LogOut className="h-4 w-4" /></button>
            </form>
          </div>
        </div>
      </header>
      <div className="flex">
        <aside className="sticky top-16 hidden h-[calc(100dvh-4rem)] w-64 shrink-0 overflow-y-auto border-r border-line bg-white px-3 py-6 lg:block">
          <SidebarNav sections={sections} />
        </aside>
        <main id="main" className="min-w-0 flex-1 px-4 pt-6 pb-28 sm:px-6 lg:px-10 lg:pt-10 lg:pb-16">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
      <MobileTabBar
        links={[
          { href: "/dashboard", label: "Home", icon: "dashboard" },
          { href: "/forum", label: "Forum", icon: "forum" },
          { href: "/directory", label: "People", icon: "directory" },
          { href: "/upskill", label: "Learn", icon: "learn" },
          { href: "/account", label: "You", icon: "account" },
        ]}
      />
    </div>
  );
}
