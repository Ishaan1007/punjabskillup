import { createClient } from "@supabase/supabase-js";

// Server-only client. Uses the service role key, which bypasses row level
// security. Never import this file into a "use client" component.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabaseAdmin = url && serviceRoleKey
  ? createClient(url, serviceRoleKey, { auth: { persistSession: false } })
  : null;
