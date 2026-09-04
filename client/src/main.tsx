import { trpc } from "@/lib/trpc";
import { COOKIE_NAME, UNAUTHED_ERR_MSG } from "@shared/const";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, TRPCClientError } from "@trpc/client";
import { createRoot } from "react-dom/client";
import superjson from "superjson";
import App from "./App";
import { startSupabaseLogin } from "./lib/supabaseAuth";
import { supabaseAccessToken } from "./lib/supabase";
import "./index.css";

const queryClient = new QueryClient();

const redirectToLoginIfUnauthorized = (error: unknown) => {
  if (!(error instanceof TRPCClientError)) return;
  if (typeof window === "undefined") return;

  const isUnauthorized = error.message === UNAUTHED_ERR_MSG;

  if (!isUnauthorized) return;

  // A tRPC call was rejected by the backend. If there is a Supabase session we
  // assume Render was cold/asleep and simply retry — do NOT bounce the user to
  // Google login. If there is genuinely no Supabase session, start Google OAuth.
  const sbToken = supabaseAccessToken;
  if (!sbToken) {
    void startSupabaseLogin();
  } else {
    // Refresh the query cache so the next tRPC call re-attaches the token.
    queryClient.invalidateQueries();
  }
};

queryClient.getQueryCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.query.state.error;
    redirectToLoginIfUnauthorized(error);
    console.error("[API Query Error]", error);
  }
});

queryClient.getMutationCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.mutation.state.error;
    redirectToLoginIfUnauthorized(error);
    console.error("[API Mutation Error]", error);
  }
});

const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: "/api/trpc",
      transformer: superjson,
      headers() {
        // 1) New: Supabase access token as Bearer — server verifies JWT (no cold
        //    start required). This is the primary auth for new sign-ins.
        const token = supabaseAccessToken;
        if (token) {
          return { Authorization: `Bearer ${token}` };
        }

        // 2) Fallback to the legacy cookie session (existing Google OAuth users
        //    who signed in through the old Render flow still have `app_session_id`).
        try {
          const raw = sessionStorage.getItem("manus-cookie");
          if (raw) {
            const prefix = `${COOKIE_NAME}=`;
            const pair = raw.split(";").find(s => s.trim().startsWith(prefix));
            const legacy = pair?.trim().slice(prefix.length);
            if (legacy) {
              return { Authorization: `Bearer ${legacy}` };
            }
          }
        } catch {
          // sessionStorage unavailable
        }
        return {};
      },
      fetch(input, init) {
        return globalThis.fetch(input, {
          ...(init ?? {}),
          credentials: "include",
        });
      },
    }),
  ],
});

createRoot(document.getElementById("root")!).render(
  <trpc.Provider client={trpcClient} queryClient={queryClient}>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </trpc.Provider>
);