import { trpc } from "@/lib/trpc";
import { supabase, supabaseUserToAppUser, type SupabaseUser } from "@/lib/supabase";
import { startSupabaseLogin } from "@/lib/supabaseAuth";
import { useCallback, useEffect, useMemo, useState } from "react";

type UseAuthOptions = {
  /* If true, when no session is present the effect will open Supabase Google login. */
  redirectOnUnauthenticated?: boolean;
  /** Where to send the user after a successful OAuth (saved across the redirect). */
  redirectPath?: string;
};

/**
 * Client-side auth state.
 *
 * Authentication is driven by the Supabase session (fast, no Render dependency):
 *   - `supabase.auth.getSession()` restores a persisted session immediately.
 *   - `isAuthenticated` / `user` come from Supabase first.
 *   - The `auth.me` tRPC query (Render) fills in the DB-backed profile row in the
 *     background (numeric id, email from DB, etc.) when Supabase has no profile
 *     details or once Render is warm. It is NOT required to show the UI.
 */
export function useAuth(options?: UseAuthOptions) {
  const { redirectOnUnauthenticated = false, redirectPath } = options ?? {};
  const utils = trpc.useUtils();

  // ---- Supabase session state (instant, local) ----
  const [sbSession, setSbSession] = useState<{
    user: SupabaseUser | null;
    initializing: boolean;
  }>({ user: null, initializing: true });

  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSbSession({
        user: data.session?.user ?? null,
        initializing: false,
      });
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      setSbSession({
        user: session?.user ?? null,
        initializing: false,
      });
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const supabaseUser = sbSession.user;

  // ---- DB-backed profile (Render tRPC) ----
  const meQuery = trpc.auth.me.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
    // Only fire once we have *some* idea of auth state; harmless when logged out.
    enabled: !sbSession.initializing,
  });

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      utils.auth.me.setData(undefined, null);
    },
  });

  const logout = useCallback(async () => {
    // 1) Clear Supabase session (fast and server-independent).
    await supabase.auth.signOut();

    // 2) Best-effort clear of any legacy app session cookie on Render.
    try {
      await logoutMutation.mutateAsync();
    } catch {
      /* backend may be down — Supabase sign-out already clears local state */
    } finally {
      try {
        sessionStorage.removeItem("manus-cookie");
      } catch {}
      utils.auth.me.setData(undefined, null);
    }
  }, [logoutMutation, utils]);

  const state = useMemo(() => {
    // If Supabase says there's a user, we are authenticated *immediately* —
    // no waiting for the Render /api/trpc cold start.
    if (supabaseUser) {
      const optimistic = supabaseUserToAppUser(supabaseUser);
      const dbUser = meQuery.data;
      // Prefer the DB row (has numeric id/role), fall back to optimistic shape.
      const user = dbUser ?? optimistic;
      return {
        user,
        loading: false,
        error: null,
        isAuthenticated: true,
      };
    }

    // If Supabase is still restoring the session, mirror the loading state.
    if (sbSession.initializing) {
      return {
        user: null,
        loading: true,
        error: null,
        isAuthenticated: false,
      };
    }

    // No Supabase session: fall back to the legacy Manus/backend cookie session
    // (existing users who signed in before Supabase was introduced).
    if (meQuery.data && !meQuery.isLoading) {
      return {
        user: meQuery.data,
        loading: false,
        error: null,
        isAuthenticated: true,
      };
    }

    return {
      user: null,
      loading: meQuery.isLoading || logoutMutation.isPending,
      error: meQuery.error ?? logoutMutation.error ?? null,
      isAuthenticated: false,
    };
  }, [supabaseUser, sbSession.initializing, meQuery.data, meQuery.isLoading, meQuery.error, logoutMutation.error, logoutMutation.isPending]);

  // ---- Unauthenticated redirect ----
  useEffect(() => {
    if (!redirectOnUnauthenticated) return;
    if (sbSession.initializing) return;
    if (state.isAuthenticated) return;
    if (typeof window === "undefined") return;

    // Save where we want to land after Google OAuth completes.
    const destination = redirectPath ?? window.location.pathname + window.location.search;
    try {
      sessionStorage.setItem("estidama-post-login-redirect", destination);
    } catch {}

    void startSupabaseLogin();
  }, [redirectOnUnauthenticated, redirectPath, sbSession.initializing, state.isAuthenticated]);

  return {
    ...state,
    refresh: () => meQuery.refetch(),
    logout,
  };
}