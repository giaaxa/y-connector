import "server-only";
import { isSupabaseConfigured } from "../config";
import { demoRepo } from "./demo-repo";
import type { Repo } from "./repo";
import { supabaseRepo } from "./supabase-repo";

/** Returns the active data repository: Supabase in production, in-memory demo otherwise. */
export function repo(): Repo {
  return isSupabaseConfigured ? supabaseRepo : demoRepo;
}

export type { Repo } from "./repo";
