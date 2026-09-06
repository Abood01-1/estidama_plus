import { supabase } from "@/lib/supabase";
import { isOAuthErrorCallback } from "@/lib/supabaseAuth";
import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";

/**
 * Handles the redirect back from Google via Supabase.

 * The authorization code returned by Google (PKCE flow) is explicitly
 * exchanged for a session using `supabase.auth.exchangeCodeForSession(code)`.

 * Steps:
 * 1. If Google returned `error=access_denied`, show the cancellation message.

 * 2. Try to restore an already-established session first (the client's
 *     `detectSessionInUrl` may have already exchanged the code). This avoids
 *     exchanging the same authorization code twice.
 *
 * 3. If no session exists yet, extract `?code=...` from the URL and exchange
 *     it for a session exactly once.

 * 4. On success, redirect to the saved destination (or home).
 *
 * 5. On failure, show an error message and log the actual error to the console.



 * No timeout is needed — the exchange either succeeds or fails deterministically.

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
      const code = params.get("code");

      // First check if a session already exists — the client's automatic
      // `detectSessionInUrl` exchange may have already completed. This avoids
      // exchanging the same authorization code twice.


      const { data: existingData, error: existingError } = await supabase.auth.getSession();

      if (cancelled) return;

      if (existingError) {
        console.error("[AuthCallback] getSession failed:", existingError.message);
        setStatus("error");
        setErrorMessage("تعذر إتمام تسجيل الدخول. حاول مرة أخرى.");
        return;
      }

      if (existingData.session) {
        finish(existingData.session);
        return;
      }

      // No session yet — check for genuine OAuth errors (e.g. user cancelled at Google).
      // A valid `code` in the URL takes precedence and is handled below.


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

      // No session and no OAuth error — if we have an authorization code, exchange it explicitly.


      // This is the authoritative PKCE completion step that `detectSessionInUrl`
      // can miss in production, causing the previous "Login timed out" error.


      if (code) {
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);

        if (cancelled) return;

        if (error) {
          console.error("[AuthCallback] exchangeCodeForSession failed:", error.message);
          setStatus("error");
          setErrorMessage("تعذر إتمام تسجيل الدخول. حاول مرة أخرى.");
          return;
        }

        finish(data.session);
        return;
      }

      // No code and no existing session — nothing more we can do here.


      setStatus("error");
      setErrorMessage("تعذر إتمام تسجيل الدخول. حاول مرة أخرى.");
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