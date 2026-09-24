import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { getStoredTokens } from "@/lib/api-client";
import { apiMe } from "@/lib/auth-api";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async ({ location }) => {
    const tokens = getStoredTokens();
    if (!tokens) {
      throw redirect({
        to: "/auth",
        search: { redirect: location.href },
      });
    }

    try {
      const me = await apiMe();
      return { user: me };
    } catch {
      throw redirect({
        to: "/auth",
        search: { redirect: location.href },
      });
    }
  },
  component: () => <Outlet />,
});
