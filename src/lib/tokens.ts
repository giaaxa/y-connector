import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

/** Short-lived signed tokens (e.g. university-email verification links). */
function secret() {
  const s = process.env.APP_SIGNING_SECRET;
  if (!s && process.env.NODE_ENV === "production") throw new Error("APP_SIGNING_SECRET is required in production");
  return s ?? "dev-only-insecure-secret";
}

export function signToken(payload: Record<string, string | number>, ttlSeconds = 172_800) {
  const body = Buffer.from(JSON.stringify({ ...payload, exp: Math.floor(Date.now() / 1000) + ttlSeconds })).toString("base64url");
  const sig = createHmac("sha256", secret()).update(body).digest("base64url");
  return `${body}.${sig}`;
}

export function verifyToken<T extends Record<string, unknown>>(token: string): T | null {
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = createHmac("sha256", secret()).update(body).digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  const data = JSON.parse(Buffer.from(body, "base64url").toString()) as T & { exp: number };
  if (data.exp < Date.now() / 1000) return null;
  return data;
}
