import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { parse as parseCookieHeader } from "cookie";
import type { Express, Request, Response } from "express";
import * as db from "./db";
import { ENV } from "./_core/env";
import { sdk } from "./_core/sdk";

// Standalone "Sign in with Google" — independent of the Manus OAuth portal.
// It reuses the app's own session (signed JWT in COOKIE_NAME) so the rest of
// the app (auth.me, protectedProcedure) keeps working unchanged.

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo";

// One-time CSRF nonce cookie for the Google flow. Not `__Host-` prefixed so it
// still works over plain http on localhost during development.
const GOOGLE_STATE_COOKIE = "g_oauth_state";

function getOrigin(req: Request): string {
  const forwardedProto = req.headers["x-forwarded-proto"];
  const proto =
    (Array.isArray(forwardedProto) ? forwardedProto[0] : forwardedProto)
      ?.split(",")[0]
      ?.trim() || req.protocol;
  const host = req.headers.host;
  return `${proto}://${host}`;
}

function getRedirectUri(req: Request): string {
  return `${getOrigin(req)}/api/auth/google/callback`;
}

export function registerGoogleAuthRoutes(app: Express) {
  // Step 1 — kick off the login: mint a nonce, then redirect to Google.
  app.get("/api/auth/google", (req: Request, res: Response) => {
    if (!ENV.googleClientId) {
      res
        .status(500)
        .send(
          "Google OAuth غير مُعدّ. أضف GOOGLE_CLIENT_ID و GOOGLE_CLIENT_SECRET إلى ملف .env."
        );
      return;
    }

    const nonce = crypto.randomUUID();
    const secure = getOrigin(req).startsWith("https");
    res.cookie(GOOGLE_STATE_COOKIE, nonce, {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure,
      maxAge: 600_000, // 10 minutes
    });

    const url = new URL(GOOGLE_AUTH_URL);
    url.searchParams.set("client_id", ENV.googleClientId);
    url.searchParams.set("redirect_uri", getRedirectUri(req));
    url.searchParams.set("response_type", "code");
    url.searchParams.set("scope", "openid email profile");
    url.searchParams.set("state", nonce);
    url.searchParams.set("prompt", "select_account");

    res.redirect(302, url.toString());
  });

  // Step 2 — Google redirects back here with ?code&state.
  app.get("/api/auth/google/callback", async (req: Request, res: Response) => {
    const code = typeof req.query.code === "string" ? req.query.code : undefined;
    const state =
      typeof req.query.state === "string" ? req.query.state : undefined;

    if (!code || !state) {
      res.status(400).send("code and state are required");
      return;
    }

    // CSRF guard: state must match the one-time cookie we set in step 1.
    const expectedNonce =
      parseCookieHeader(req.headers.cookie ?? "")[GOOGLE_STATE_COOKIE];
    if (!expectedNonce || state !== expectedNonce) {
      res.status(403).send("invalid oauth state");
      return;
    }
    res.clearCookie(GOOGLE_STATE_COOKIE, { path: "/" });

    try {
      // Exchange the authorization code for tokens.
      const tokenRes = await fetch(GOOGLE_TOKEN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code,
          client_id: ENV.googleClientId,
          client_secret: ENV.googleClientSecret,
          redirect_uri: getRedirectUri(req),
          grant_type: "authorization_code",
        }),
      });

      if (!tokenRes.ok) {
        console.error("[GoogleAuth] Token exchange failed", await tokenRes.text());
        res.status(502).send("Google token exchange failed");
        return;
      }

      const tokens = (await tokenRes.json()) as { access_token?: string };
      if (!tokens.access_token) {
        res.status(502).send("Google did not return an access token");
        return;
      }

      // Fetch the user's profile.
      const profileRes = await fetch(GOOGLE_USERINFO_URL, {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      });

      if (!profileRes.ok) {
        console.error("[GoogleAuth] Userinfo failed", await profileRes.text());
        res.status(502).send("Failed to fetch Google profile");
        return;
      }

      const profile = (await profileRes.json()) as {
        sub?: string;
        email?: string;
        name?: string;
      };

      if (!profile.sub) {
        res.status(502).send("Google profile missing subject id");
        return;
      }

      const openId = `google:${profile.sub}`;
      const displayName = profile.name || profile.email || "مستخدم Google";

      // Persist the user (best-effort — works without a DB too).
      await db.upsertUser({
        openId,
        name: displayName,
        email: profile.email ?? null,
        loginMethod: "google",
        lastSignedIn: new Date(),
      });

      // Mint the app's own session token. appId falls back so JWT verification
      // (which requires a non-empty appId) still passes when VITE_APP_ID unset.
      const sessionToken = await sdk.signSession(
        {
          openId,
          appId: ENV.appId || "estidama-plus-web",
          name: displayName,
        },
        { expiresInMs: ONE_YEAR_MS }
      );

      // Set the session cookie. On plain http (local dev) browsers reject
      // `SameSite=None` cookies, so use `Lax` there; keep `None` on https so it
      // still works when the app is embedded in an iframe on a deployed host.
      const secure = getOrigin(req).startsWith("https");
      res.cookie(COOKIE_NAME, sessionToken, {
        httpOnly: true,
        path: "/",
        sameSite: secure ? "none" : "lax",
        secure,
        maxAge: ONE_YEAR_MS,
      });

      res.redirect(302, "/");
    } catch (error) {
      console.error("[GoogleAuth] Callback failed", error);
      res.status(500).send("Google login failed");
    }
  });
}
