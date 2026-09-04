import { createRemoteJWKSet, jwtVerify, type JWTPayload } from "jose";
import { ENV } from "./env";

/**
 * Server-side verification of Supabase Auth JWTs.
 *
 * The Render backend still needs to know "who is calling" for protected tRPC
 * procedures, but must NOT trust anything the frontend merely claims.
 * Instead, we verify the Supabase `access_token` (a JWT) against the
 * project's JWKS endpoint, exactly like a proper resource server.
 */

let jwks: ReturnType<typeof createRemoteJWKSet> | null = null;

function getJwks() {
  if (!jwks) {
    const url = new URL("/auth/v1/.well-known/jwks.json", ENV.supabaseUrl).toString();
    jwks = createRemoteJWKSet(new URL(url));
  }
  return jwks;
}

export type SupabaseVerifiedUser = {
  sub: string; // Supabase user UUID
  email: string | null;
  name: string | null;
  googleSub: string | null; // Google `sub` from user_metadata when available
  role: string;
};

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.length > 0;

export async function verifySupabaseToken(
  accessToken: string
): Promise<SupabaseVerifiedUser | null> {
  if (!ENV.supabaseUrl || !ENV.supabaseAnonKey) {
    console.warn("[SupabaseAuth] SUPABASE_URL / SUPABASE_ANON_KEY not configured");
    return null;
  }

  try {
    const { payload } = await jwtVerify(accessToken, getJwks(), {
      algorithms: ["RS256"],
      issuer: `${ENV.supabaseUrl}/auth/v1`,
      audience: "authenticated",
    });

    return buildVerifiedUser(payload);
  } catch (error) {
    console.warn("[SupabaseAuth] Token verification failed:", String(error));
    return null;
  }
}

function buildVerifiedUser(payload: JWTPayload): SupabaseVerifiedUser | null {
  const sub = payload.sub;
  if (!isNonEmptyString(sub)) return null;

  const email = isNonEmptyString(payload.email) ? payload.email : null;
  const name =
    isNonEmptyString(payload.name)
      ? payload.name
      : isNonEmptyString(payload.full_name)
        ? payload.full_name
        : null;

  // Supabase stores Google profile data in `user_metadata` claims.
  const userMetadata =
    payload.user_metadata && typeof payload.user_metadata === "object"
      ? (payload.user_metadata as Record<string, unknown>)
      : {};
  const googleSub = isNonEmptyString(userMetadata.sub) ? userMetadata.sub : null;

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