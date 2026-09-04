import { startSupabaseLogin } from "./lib/supabaseAuth";

export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

/**
 * Legacy `startLogin` entrypoint used by components that predate Supabase
 * (e.g. DashboardLayout's "Sign in" button and the unauthenticated redirect).
 *
 * We now delegate to Supabase Google OAuth so the Render backend is never
 * needed to begin a login (no cold-start wait).
 */
export type StartLoginOptions = {
  type?: "signIn" | "signUp";
  provider?: "google" | "apple" | "email" | string;
};

export const startLogin = (_options?: StartLoginOptions) => {
  void startSupabaseLogin();
};