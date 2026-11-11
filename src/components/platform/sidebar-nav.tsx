"use client";

import {
  BarChart3,
  BookOpen,
  CalendarDays,
  ClipboardCheck,
  Gift,
  GraduationCap,
  Handshake,
  LayoutDashboard,
  MessagesSquare,
  Rocket,
  Settings,
  Shield,
  SlidersHorizontal,
  UserRound,
  UsersRound,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const ICONS = {
  dashboard: LayoutDashboard,
  forum: MessagesSquare,
  directory: UsersRound,
  events: CalendarDays,
  learn: BookOpen,
  projects: Rocket,
  connections: Handshake,
  referrals: Gift,
  account: UserRound,
  admin: BarChart3,
  applications: ClipboardCheck,
  moderation: Shield,
  courses: GraduationCap,
  settings: SlidersHorizontal,
  members: Settings,
} as const;
export type NavIcon = keyof typeof ICONS;
export type NavLink = { href: string; label: string; icon: NavIcon; locked?: boolean; badge?: number };

export function SidebarNav({ sections }: { sections: { title?: string; links: NavLink[] }[] }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Member" className="space-y-7">
      {sections.map((s, i) => (
        <div key={i}>
          {s.title && <p className="eyebrow mb-2 px-3 text-subtle">{s.title}</p>}
          <ul className="space-y-0.5">
            {s.links.map((l) => {
              const Icon = ICONS[l.icon];
              const active = l.href === "/admin" ? pathname === "/admin" : pathname === l.href || pathname.startsWith(l.href + "/");
              return (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition",
                      active ? "bg-ink text-white" : "text-ink/75 hover:bg-fog hover:text-ink",
                      l.locked && "opacity-55",
                    )}
                  >
                    <Icon className={cn("h-4 w-4", active && "text-sun")} aria-hidden />
                    <span className="flex-1">{l.label}</span>
                    {l.badge ? <span className={cn("rounded-full px-1.5 text-[11px] font-semibold", active ? "bg-sun text-ink" : "bg-sun")}>{l.badge}</span> : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

export function MobileTabBar({ links }: { links: NavLink[] }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Member mobile" className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
      <ul className="grid grid-cols-5">
        {links.map((l) => {
          const Icon = ICONS[l.icon];
          const active = pathname === l.href || pathname.startsWith(l.href + "/");
          return (
            <li key={l.href}>
              <Link href={l.href} aria-current={active ? "page" : undefined} className={cn("flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium", active ? "text-ink" : "text-muted")}>
                <span className={cn("rounded-full px-3 py-1 transition", active && "bg-sun")}>
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                {l.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
