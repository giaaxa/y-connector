import { NextResponse } from "next/server";
import { markUniversityEmailVerified } from "@/lib/data/service";
import { verifyToken } from "@/lib/tokens";

/** Confirms ownership of a university email via a signed, expiring link. */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const data = verifyToken<{ uid: string; email: string }>(searchParams.get("token") ?? "");
  if (!data) return NextResponse.redirect(`${origin}/dashboard?uniEmail=invalid`);
  await markUniversityEmailVerified(data.uid, data.email);
  return NextResponse.redirect(`${origin}/dashboard?uniEmail=verified`);
}
