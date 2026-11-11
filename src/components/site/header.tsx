import { getViewer } from "@/lib/auth";
import { DemoBanner } from "./demo-banner";
import { HeaderNav } from "./header-nav";

export const PUBLIC_NAV = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/events", label: "Events" },
  { href: "/community", label: "Community" },
  { href: "/upskill", label: "Upskill" },
  { href: "/startups", label: "Startups" },
  { href: "/membership", label: "Membership" },
];

export async function SiteHeader() {
  const viewer = await getViewer();
  return (
    <>
      <DemoBanner />
      <HeaderNav
        nav={PUBLIC_NAV}
        viewer={viewer ? { name: viewer.profile.fullName, isActiveMember: viewer.isActiveMember, isStaff: viewer.isStaff } : null}
      />
    </>
  );
}
