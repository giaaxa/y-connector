"use client";

import { ArrowUpRight, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "@/components/brand/logo";
import { ButtonLink } from "@/components/ui/button";
import { Avatar } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";

type NavItem = { href: string; label: string };
type ViewerLite = { name: string; isActiveMember: boolean; isStaff: boolean } | null;

export function HeaderNav({ nav, viewer }: { nav: NavItem[]; viewer: ViewerLite }) {
  const pathname = usePathname();
  // The menu is "open for a given path", so navigating closes it without an effect.
  const [openPath, setOpenPath] = useState<string | null>(null);
  const open = openPath === pathname;
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b bg-white/85 backdrop-blur-xl transition-colors",
        scrolled ? "border-line" : "border-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-5 sm:px-8">
        <Logo />
        <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
              className={cn(
                "relative rounded-full px-3 py-2 text-sm font-medium text-ink/70 transition hover:text-ink",
                isActive(item.href) && "text-ink after:absolute after:inset-x-3 after:-bottom-[1px] after:h-0.5 after:rounded-full after:bg-sun",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-2 lg:flex">
          {viewer ? (
            <>
              {viewer.isStaff && (
                <ButtonLink href="/admin" variant="ghost" size="sm">
                  Admin
                </ButtonLink>
              )}
              <ButtonLink href="/dashboard" variant="dark" size="sm">
                {viewer.isActiveMember ? "Member hub" : "My application"}
                <ArrowUpRight className="h-4 w-4" />
              </ButtonLink>
              <Link href="/account" aria-label="Account settings" className="ml-1 rounded-full ring-sun transition hover:ring-2">
                <Avatar name={viewer.name} size={34} />
              </Link>
            </>
          ) : (
            <>
              <ButtonLink href="/login" variant="ghost" size="sm">
                Log In
              </ButtonLink>
              <ButtonLink href="/join" size="sm">
                Join the Network
              </ButtonLink>
            </>
          )}
        </div>
        <button
          type="button"
          className="-mr-2 inline-flex h-11 w-11 items-center justify-center rounded-full hover:bg-fog lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpenPath(open ? null : pathname)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div id="mobile-nav" className="fixed inset-x-0 top-16 bottom-0 z-40 overflow-y-auto bg-white lg:hidden">
          <nav aria-label="Mobile" className="flex flex-col px-5 pt-4 pb-10">
            {nav.map((item, i) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center justify-between border-b border-line py-4 text-2xl font-semibold tracking-tight animate-rise"
                style={{ animationDelay: `${i * 35}ms` }}
              >
                {item.label}
                {isActive(item.href) && <span className="h-2 w-2 rounded-full bg-sun" />}
              </Link>
            ))}
            <div className="mt-8 grid gap-3">
              {viewer ? (
                <>
                  <ButtonLink href="/dashboard" variant="dark" size="lg">
                    {viewer.isActiveMember ? "Member hub" : "My application"}
                  </ButtonLink>
                  {viewer.isStaff && (
                    <ButtonLink href="/admin" variant="outline" size="lg">
                      Admin
                    </ButtonLink>
                  )}
                </>
              ) : (
                <>
                  <ButtonLink href="/join" size="lg">
                    Join the Network
                  </ButtonLink>
                  <ButtonLink href="/login" variant="outline" size="lg">
                    Log In
                  </ButtonLink>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
