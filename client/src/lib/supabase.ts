import { createClient, type Session, type User as SupabaseUser } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;


console.log("SUPABASE URL EXISTS:", !!supabaseUrl);
console.log("SUPABASE KEY EXISTS:", !!supabaseAnonKey);


if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "[Supabase] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. " +
      "Google Sign-In will not work until these environment variables are set."
  );
}

export const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "placeholder-anon-key",
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      // PKCE is the most secure flow for a browser client (no access token in URL).
      flowType: "pkce",
    },
  }
);

// Synchronously accessible access token for tRPC headers / API calls.
// Updated on session load and on every auth state change.
export let supabaseAccessToken: string | null = null;

// Initialize the token tracker so tRPC can attach it as a Bearer header.
supabase.auth.getSession().then(({ data }) => {
  supabaseAccessToken = data.session?.access_token ?? null;
});

supabase.auth.onAuthStateChange((_event, session: Session | null) => {
  supabaseAccessToken = session?.access_token ?? null;
});

export type { SupabaseUser };

// Convert a Supabase user into the shape the app's `useAuth` hook expects.
// Uses the Google `sub` from user_metadata when available so existing
// `google:<sub>` openIds in the database keep matching — no duplicate users.
export function supabaseUserToAppUser(
  sbUser: SupabaseUser
): {
  id: number;
  openId: string;
  name: string;
  email: string | null;
  loginMethod: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
  lastSignedIn: Date;
} {
  const meta = (sbUser.user_metadata ?? {}) as Record<string, unknown>;
  const googleSub = typeof meta.sub === "string" ? meta.sub : undefined;
  const name =
    typeof meta.name === "string"
      ? meta.name
      : typeof meta.full_name === "string"
        ? meta.full_name
        : sbUser.email ?? "مستخدم";

  return {
    // Frontend doesn't know the DB numeric id yet; the tRPC `auth.me` response
    // will replace this object once it arrives (non-blocking).
    id: -1,
    openId: googleSub ? `google:${googleSub}` : `supabase:${sbUser.id}`,
    name,
    email: sbUser.email ?? null,
    loginMethod: "google",
    role: "user",
    createdAt: new Date(sbUser.created_at),
    updatedAt: new Date(sbUser.updated_at ?? sbUser.created_at),
    lastSignedIn: new Date(sbUser.last_sign_in_at ?? Date.now()),
  };
}