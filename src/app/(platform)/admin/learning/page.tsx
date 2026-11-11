import { Plus } from "lucide-react";
import Link from "next/link";
import { AdminHeader, Table } from "@/components/admin/stat";
import { ButtonLink } from "@/components/ui/button";
import { Badge, Notice, SampleTag } from "@/components/ui/primitives";
import { requirePermission } from "@/lib/auth";
import { repo } from "@/lib/data";

export default async function LearningAdminPage({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  await requirePermission("manageLearning");
  const { saved } = await searchParams;
  const courses = await repo().listCourses({ includeDrafts: true });
  return (
    <div>
      <AdminHeader title="Learning content" intro="Courses support text lessons, video links, PDFs and external resources." actions={<ButtonLink href="/admin/learning/new" size="sm"><Plus className="h-4 w-4" /> New course</ButtonLink>} />
      {saved && <Notice tone="ok" className="mb-4">Course saved.</Notice>}
      <Table head={["Course", "Category", "Access", "Lessons", "Status"]}>
        {courses.map((c) => (
          <tr key={c.id}>
            <td className="px-4 py-3"><Link href={`/admin/learning/${c.slug}`} className="font-medium hover:underline">{c.title}</Link> {c.isSample && <SampleTag />}</td>
            <td className="px-4 py-3 text-muted">{c.category}</td>
            <td className="px-4 py-3"><Badge tone={c.access === "included" ? "sun" : "dark"}>{c.access}</Badge></td>
            <td className="px-4 py-3 tabular-nums">{c.lessons.length}</td>
            <td className="px-4 py-3"><Badge tone={c.status === "published" ? "ok" : "neutral"}>{c.status}</Badge></td>
          </tr>
        ))}
      </Table>
    </div>
  );
}
