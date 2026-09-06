import { supabase } from "./supabase";

/**
 * Start Google Sign-In via Supabase Auth.
 * This happens entirely client-side — Supabase itself redirects to Google,
 * so the Render backend is NOT involved (no cold-start delay).
 *
 * Preserves the current page destination so we can return there after
 * Google authentication completes.
 */
export async function startSupabaseLogin(): Promise<void> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error(
      "[SupabaseAuth] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. " +
        "Google Sign-In cannot start."
    );
    throw new Error(
      "تعذر بدء تسجيل الدخول عبر Google. إعدادات Supabase غير مكتملة."
    );
  }

  // Save the current destination so the callback page can return here.
  try {
    const destination = window.location.pathname + window.location.search;
    sessionStorage.setItem("estidama-post-login-redirect", destination);
  } catch {
    // sessionStorage unavailable — callback will fall back to "/".
  }

  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      queryParams: {
        prompt: "select_account",
      },
    },
  });

  if (error) {
    console.error("[SupabaseAuth] OAuth start failed:", error.message);
    // Surface a readable message — the caller (LoginModal) can display it.
    throw new Error("تعذر بدء تسجيل الدخول عبر Google. حاول مرة أخرى.");
  }
  // On success Supabase navigates away to the Google consent screen.
}

/**
 * Google login cancellation / OAuth failure handler.
 * When the user cancels at Google, Supabase redirects back to the app
 * with an `error=access_denied` query parameter. The callback page detects
 * this and returns here.
 */
export function isOAuthErrorCallback(search: string): string | null {
  const params = new URLSearchParams(search);
  const error = params.get("error");
  const code = params.get("code");
  // A valid authorization code means this is a successful OAuth callback.
  // The code takes precedence over any error param that may also be present.
  if (code) return null;
  // Return the error code itself (e.g. "access_denied") so callers can
  // distinguish a genuine user cancellation from other OAuth failures.
  if (error) return error;
  return null;
}
