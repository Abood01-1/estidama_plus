import { supabase } from "@/lib/supabase";
import { isOAuthErrorCallback } from "@/lib/supabaseAuth";
import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";

/**
 * Handles the redirect back from Google via Supabase.
 *
 * Supabase's `getSession()` + `detectSessionInUrl: true` exchanges the
 * authorization code (PKCE) and stores the session in localStorage.
 * This page simply waits for that to finish, then sends the user to
 * - their original destination (saved in sessionStorage before sign-in), or
 * - the home page.
 *
 * The page renders in the app's existing branding — no new visual design.
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

    // Google can redirect back with ?error=access_denied if the user cancels.
    const oauthError = isOAuthErrorCallback(search);
    if (oauthError) {
      setStatus("error");
      setErrorMessage("تم إلغاء تسجيل الدخول عبر Google.");
      return;
    }

    let cancelled = false;

    (async () => {
      // Let Supabase exchange the auth code for a session.
      const { data, error } = await supabase.auth.getSession();

      if (cancelled) return;

      if (error) {
        console.error("[AuthCallback] getSession failed:", error.message);
        setStatus("error");
        setErrorMessage("تعذر إتمام تسجيل الدخول. حاول مرة أخرى.");
        return;
      }

      if (!data.session) {
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

      // Let React state settle before navigating further.
      setTimeout(() => {
        window.location.assign(destination);
      }, 50);
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