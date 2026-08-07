/**
 * ICJ Enterprise Platform
 * Supabase Client (canonical lowercase module)
 * Version : 1.0.0
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
export const SUPABASE_ENABLED =
  import.meta.env.VITE_ENABLE_SUPABASE === "true" &&
  Boolean(supabaseUrl) &&
  Boolean(supabaseKey);

const createSupabaseStub = () => ({
  auth: {
    signUp: async () => ({ data: null, error: new Error("Supabase disabled") }),
    signInWithPassword: async () => ({ data: null, error: new Error("Supabase disabled") }),
    signOut: async () => ({ error: null }),
    getUser: async () => ({ data: { user: null } }),
    getSession: async () => ({ data: { session: null } }),
    onAuthStateChange: () => ({ data: { listener: null, subscription: { unsubscribe: () => {} } } }),
    signInWithOtp: async () => ({ data: null, error: new Error("Supabase disabled") }),
    verifyOtp: async () => ({ data: null, error: new Error("Supabase disabled") }),
    updateUser: async () => ({ data: null, error: new Error("Supabase disabled") }),
  },
  from: () => ({
    select: () => ({
      order: async () => ({ data: [], error: null }),
      eq: () => ({ single: async () => ({ data: null, error: new Error("Supabase disabled") }) }),
      single: async () => ({ data: null, error: new Error("Supabase disabled") }),
    }),
    insert: () => ({ select: () => ({ single: async () => ({ data: null, error: new Error("Supabase disabled") }) }) }),
    update: () => ({ eq: async () => ({ error: new Error("Supabase disabled") }), select: () => ({ single: async () => ({ data: null, error: new Error("Supabase disabled") }) }) }),
    delete: () => ({ eq: async () => ({ error: new Error("Supabase disabled") }) }),
    upsert: () => ({ select: () => ({ single: async () => ({ data: null, error: new Error("Supabase disabled") }) }) }),
  }),
  storage: {
    from: () => ({
      upload: async () => ({ error: new Error("Supabase disabled") }),
      getPublicUrl: () => ({ data: { publicUrl: "" } }),
    }),
  },
  functions: {
    invoke: async () => ({ data: null, error: new Error("Supabase disabled") }),
  },
});

export const supabase = SUPABASE_ENABLED
  ? createClient(supabaseUrl, supabaseKey, {
      auth: {
        storage: localStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    })
  : createSupabaseStub();

export default supabase;
