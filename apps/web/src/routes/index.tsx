import { createFileRoute, redirect } from "@tanstack/react-router";
import { Button } from "@repo/ui/components/button";
import { useAuthStore } from "@/stores/auth.store";

import { useEffect } from "react";
import { Spinner } from "@repo/ui/components/spinner";

export const Route = createFileRoute("/")({
  beforeLoad: ({ location }) => {
    if (useAuthStore.getState().isLoading) return;
    if (!useAuthStore.getState().isAuthenticated) {
      throw redirect({
        to: "/login",
        search: {
          redirect: location.href,
        },
      });
    }
  },
  component: Index,
});

function Index() {
  const { isLoading, isAuthenticated } = useAuthStore();
  const logout = useAuthStore((state) => state.logout);
  const navigate = Route.useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate({
        to: "/login",
        search: { redirect: window.location.href },
      });
    }
  }, [isLoading, isAuthenticated, navigate]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner className="h-8 w-8 text-primary" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Início</h1>
      <Button onClick={logout}>Sair</Button>
    </div>
  );
}
