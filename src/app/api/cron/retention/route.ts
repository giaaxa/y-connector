import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/config";
import { createSupabaseAdmin } from "@/lib/supabase/server";

/**
 * Data-retention job: deletes verification documents N days after a decision
 * (N = settings.verificationRetentionDays). Schedule daily via Vercel Cron and
 * protect with CRON_SECRET (Vercel sends it as a Bearer token).
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isSupabaseConfigured) return NextResponse.json({ skipped: "Supabase not configured" });
  const admin = createSupabaseAdmin();
  const { data, error } = await admin.rpc("purge_verification_documents");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const paths = (data as string[]) ?? [];
  if (paths.length) await admin.storage.from("verification").remove(paths);
  return NextResponse.json({ purged: paths.length });
}
