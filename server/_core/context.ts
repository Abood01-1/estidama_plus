import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import * as db from "../db";
import { sdk } from "./sdk";
import { supabaseOpenId, verifySupabaseToken } from "./supabaseAuth";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

function getBearerToken(
  req: CreateExpressContextOptions["req"]
): string | null {
  const header = req.headers.authorization;
  if (typeof header !== "string" || !header.startsWith("Bearer ")) {
    return null;
  }
  const token = header.slice(7).trim();
  return token.length > 0 ? token : null;
}

/**
 * New primary auth path: Supabase Google login sends its JWT in the
 * Authorization header. We verify the token against the Supabase JWKS and
 * load (or lazily create) the user row using the same `openId` convention as
 * the old Google flow (`google:<sub>`), so no duplicate accounts appear.
 */
async function resolveSupabaseUser(
  req: CreateExpressContextOptions["req"]
): Promise<User | null> {
  const rawAuth = req.headers.authorization;
  // TEMP DIAG (safe): presence/scheme only, never logs the header value or token.
  console.log(
    "[AuthDiag] backend authHeaderPresent:",
    typeof rawAuth === "string" && rawAuth.length > 0,
    "isBearer:",
    typeof rawAuth === "string" && rawAuth.startsWith("Bearer ")
  );
  const token = getBearerToken(req);
  // TEMP DIAG (safe): boolean + length only.
  console.log(
    "[AuthDiag] backend extractedToken hasToken:",
    Boolean(token),
    "len:",
    token ? token.length : 0
  );
  if (!token) return null;

  const verified = await verifySupabaseToken(token);
  // TEMP DIAG (safe): success boolean only; detail lives in supabaseAuth warn.
  console.log("[AuthDiag] backend verifySupabaseToken success:", Boolean(verified));
  if (!verified) return null;

  const openId = supabaseOpenId(verified);
  const now = new Date();

  let user = await db.getUserByOpenId(openId).catch(() => undefined);

  if (!user) {
    await db
      .upsertUser({
        openId,
        name: verified.name ?? verified.email ?? "مستخدم",
        email: verified.email,
        loginMethod: "google",
        lastSignedIn: now,
      })
      .catch(() => {
        // DB may be unavailable — an ephemeral row lets non-DB pages keep working.
      });
    user = await db.getUserByOpenId(openId).catch(() => undefined);
  } else {
    // Refresh lastSignedIn without blocking the request on a slow DB.
    void db.upsertUser({ openId, lastSignedIn: now }).catch(() => {});
  }

  if (user) return user;

  // No DB: build an ephemeral user identical to how the legacy googleAuth flow
  // handled missing rows, so protected procedures still have an id/role.
  return {
    id: -1,
    openId,
    name: verified.name ?? verified.email ?? "مستخدم",
    email: verified.email,
    loginMethod: "google",
    role: "user",
    createdAt: now,
    updatedAt: now,
    lastSignedIn: now,
  } as User;
}

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  // 1) Supabase Bearer token is the fastest path for Google logins.
  try {
    user = await resolveSupabaseUser(opts.req);
  } catch {
    user = null;
  }
  // TEMP DIAG (safe): whether ctx.user resolved from Supabase path.
  console.log("[AuthDiag] backend supabasePath userFound:", Boolean(user));

  // 2) Fallback to the legacy session cookie / Manus OAuth flow so existing
  //    logged-in users (pre-Supabase) keep working.
  if (!user) {
    try {
      user = await sdk.authenticateRequest(opts.req);
    } catch {
      // Public procedures work without a user.
      user = null;
    }
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}