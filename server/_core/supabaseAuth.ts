import { createClient } from "@supabase/supabase-js";
import { ENV } from "./env";

export type SupabaseVerifiedUser = {
  sub: string; // Supabase user UUID
  email: string | null;
  name: string | null;
  googleSub: string | null; // Google `sub` from user_metadata when available
  role: string;
};

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.length > 0;

/**
 * Verify a Supabase access token server-side via `auth.getUser()`.
 * This accepts whatever signing scheme the project uses (HS256 or RS256)
 * without trusting anything the frontend claims.
 */
export async function verifySupabaseToken(
  accessToken: string
): Promise<SupabaseVerifiedUser | null> {
  if (!ENV.supabaseUrl || !ENV.supabaseAnonKey) {
    console.warn("[SupabaseAuth] SUPABASE_URL / SUPABASE_ANON_KEY not configured");
    // TEMP DIAG (safe): config presence only, never logs key values.
    console.log(
      "[AuthDiag] backend supabaseEnv urlPresent:",
      Boolean(ENV.supabaseUrl),
      "anonKeyPresent:",
      Boolean(ENV.supabaseAnonKey)
    );
    return null;
  }

  try {
    const client = createClient(ENV.supabaseUrl, ENV.supabaseAnonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data, error } = await client.auth.getUser(accessToken);
    if (error || !data?.user) {
      console.warn("[SupabaseAuth] Token verification failed:", error?.message ?? "no user");
      // TEMP DIAG (safe): failure detail only — name/status/message, never the token.
      const err = error as { name?: unknown; status?: unknown; message?: unknown } | null;
      console.log(
        "[AuthDiag] backend verifyError name:",
        typeof err?.name === "string" ? err.name : "(none)",
        "status:",
        typeof err?.status === "number" || typeof err?.status === "string"
          ? String(err.status)
          : "(none)",
        "message:",
        typeof err?.message === "string" ? err.message : "no user"
      );
      return null;
    }
    return buildVerifiedUser(data.user);
  } catch (error) {
    console.warn("[SupabaseAuth] Token verification failed:", String(error));
    return null;
  }
}

type SupabaseUserLike = {
  id: string;
  email?: string | null;
  user_metadata?: Record<string, unknown> | null;
};

function buildVerifiedUser(sbUser: SupabaseUserLike): SupabaseVerifiedUser | null {
  const sub = sbUser.id;
  if (!isNonEmptyString(sub)) return null;

  const email = isNonEmptyString(sbUser.email) ? sbUser.email : null;

  // Supabase stores Google profile data in `user_metadata` claims.
  const userMetadata =
    sbUser.user_metadata && typeof sbUser.user_metadata === "object"
      ? (sbUser.user_metadata as Record<string, unknown>)
      : {};
  const googleSub = isNonEmptyString(userMetadata.sub) ? userMetadata.sub : null;
  const name =
    isNonEmptyString(userMetadata.name)
      ? (userMetadata.name as string)
      : isNonEmptyString(userMetadata.full_name)
        ? (userMetadata.full_name as string)
        : null;

  return {
    sub,
    email,
    name,
    googleSub,
    role: "user",
  };
}

/**
 * Map a verified Supabase user into the app's `openId` convention.
 * Existing Google OAuth users were stores as `google:<sub>` — keeping the
 * same format ensures no duplicate user rows when they sign in via Supabase.
 */
export function supabaseOpenId(vu: SupabaseVerifiedUser): string {
  return vu.googleSub ? `google:${vu.googleSub}` : `supabase:${vu.sub}`;
}