import { NextResponse } from "next/server";
import { getViewer } from "@/lib/auth";
import { repo } from "@/lib/data";
import { signedProofUrl } from "@/lib/data/service";
import { can } from "@/lib/policy";

/** Admin-only redirect to a 60-second signed URL for a verification document. */
export async function GET(req: Request) {
  const v = await getViewer();
  if (!v || !can(v.roles, "reviewApplications")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const userId = new URL(req.url).searchParams.get("user") ?? "";
  const app = await repo().getApplication(userId);
  if (!app?.proofPath) return NextResponse.json({ error: "No document" }, { status: 404 });
  const url = await signedProofUrl(app.proofPath);
  if (!url) return NextResponse.json({ error: "Document unavailable" }, { status: 404 });
  return NextResponse.redirect(url, { headers: { "Cache-Control": "no-store" } });
}
