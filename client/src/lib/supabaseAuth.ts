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
  const errorDescription = params.get("error_description");
  if (error) return errorDescription ?? error;
  return null;
}