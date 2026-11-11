import type { Metadata } from "next";
import { requirePermission } from "@/lib/auth";

export const metadata: Metadata = { title: "Admin", robots: { index: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requirePermission("viewMetrics");
  return <>{children}</>;
}
