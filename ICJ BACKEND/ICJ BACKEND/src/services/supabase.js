import { createClient } from "@supabase/supabase-js";

const env = (typeof import.meta !== "undefined" && import.meta.env) ? import.meta.env : {};
const rawUrl = String(env.VITE_SUPABASE_URL || "").trim();
const rawKey = String(env.VITE_SUPABASE_PUBLISHABLE_KEY || env.VITE_SUPABASE_ANON_KEY || "").trim();

export const isSupabaseConfigured = Boolean(
  rawUrl &&
  rawKey &&
  rawUrl.startsWith("https://") &&
  !rawUrl.includes("placeholder") &&
  !rawKey.includes("placeholder")
);

const supabaseUrl = isSupabaseConfigured ? rawUrl : "https://placeholder.supabase.co";
const supabaseKey = isSupabaseConfigured ? rawKey : "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.placeholder";

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
  global: {
    headers: {
      "apikey": supabaseKey,
      "Authorization": `Bearer ${supabaseKey}`,
    },
  },
});

export default supabase;