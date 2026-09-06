import { supabase } from "@/lib/supabase";
import { isOAuthErrorCallback } from "@/lib/supabaseAuth";
import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";

/**
 * Handles the redirect back from Google via Supabase.
 *
 * The Supabase client is created with `detectSessionInUrl: true` and
 * `flowType: "pkce"`. On this callback URL the GoTrueClient automatically
 * detects the PKCE `code` in the address bar during its own initialization —
 * BEFORE React mounts — exchanges it for a session, and strips the `code`
 * query parameter from the URL via `history.replaceState`.
 *
 * Therefore AuthCallback must NOT call `exchangeCodeForSession()` again.
 * Re-exchanging the same single-use authorization code (or calling it after
 * the library already stripped the code from the URL) always fails and shows
 * the generic sign-in error. Instead we await the client's initialization via
 * `getSession()`, which resolves either with the exchanged session or the
 * underlying error.
 *
 * Steps:
 * 1. If Google returned `error=access_denied`, show the cancellation message.
 * 2. Otherwise wait for `getSession()` — the PKCE exchange has already been
 *    performed by the client's initialization.
 * 3. On success, redirect to the saved destination (or home).
 * 4. On failure, show an error message and log the actual error to the console.
 */
export default function AuthCallbackPage() {
  const [, setLocation] = useLocation();
  const [status, setStatus] = useState<"waiting" | "error">("waiting");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    const search = window.location.search;

    let cancelled = false;

    const finish = (session: { user: unknown } | null) => {
      if (cancelled) return;
      if (!session) {
        setStatus("error");
        setErrorMessage("تعذر العثور على جلسة تسجيل دخول. حاول مرة أخرى.");
        return;
      }

      // Clear the OAuth query params from the address bar.
      window.history.replaceState({}, "", window.location.pathname);

      // Return to the destination the user originally wanted.
      let destination = "/";
      try {
        const saved = sessionStorage.getItem("estidama-post-login-redirect");
        if (saved) {
          destination = saved;
          // Only allow same-origin paths to avoid open redirects.
          if (!destination.startsWith("/")) destination = "/";
        }
      } catch {}
      try {
        sessionStorage.removeItem("estidama-post-login-redirect");
      } catch {}

      window.location.assign(destination);
    };

    (async () => {
      const params = new URLSearchParams(search);

      // Check for genuine OAuth errors (e.g. user cancelled at Google).
      const oauthError = isOAuthErrorCallback(search);
      if (oauthError) {
        setStatus("error");
        // Only show the cancellation message for a genuine access_denied.
        // Any other OAuth error is a generic failure, not a user cancellation.
        setErrorMessage(
          oauthError === "access_denied"
            ? "تم إلغاء تسجيل الدخول عبر Google."
            : "تعذر إتمام تسجيل الدخول. حاول مرة أخرى."
        );
        return;
      }

      // The GoTrueClient (created in @/lib/supabase with `detectSessionInUrl:
      // true`) already detected the PKCE code in this URL during its automatic
      // initialization and exchanged it for a session — it also removed the
      // `code` param from the address bar. `getSession()` awaits that
      // initialization promise, so this resolves with the exchanged session or
      // the real error. Do NOT call `exchangeCodeForSession()` here: the code
      // is single-use and would already be consumed (or stripped from the URL).
      const { data, error } = await supabase.auth.getSession();
      if (cancelled) return;

      if (error || !data.session) {
        if (error) {
          console.error("[AuthCallback] getSession failed:", error.message);
        }
        setStatus("error");
        setErrorMessage("تعذر إتمام تسجيل الدخول. حاول مرة أخرى.");
        return;
      }

      finish(data.session);
    })();

    return () => {
      cancelled = true;
    };
  }, [setLocation]);

  return (
    <div className="rtl flex min-h-screen items-center justify-center bg-background text-foreground">
      <div className="w-full max-w-sm p-8 text-center">
        {status === "waiting" ? (
          <>
            <div className="mx-auto mb-6 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <h1 className="mb-2 text-xl font-bold">جاري تسجيل الدخول…</h1>
            <p className="text-sm text-muted-foreground">
              يتم إنشاء جلستك الآمنة عبر Google
            </p>
          </>
        ) : (
          <>
            <h1 className="mb-2 text-xl font-bold">تعذر تسجيل الدخول</h1>
            <p className="mb-6 text-sm text-muted-foreground">{errorMessage}</p>
            <button
              type="button"
              onClick={() => setLocation("/")}
              className="btn btn-primary w-full"
            >
              العودة للرئيسية
            </button>
          </>
        )}
      </div>
    </div>
  );
}