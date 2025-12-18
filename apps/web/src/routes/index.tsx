import { createFileRoute, redirect } from "@tanstack/react-router";
import { Button } from "@repo/ui/components/button";
import { useAuthStore } from "@/stores/auth.store";

import { useEffect } from "react";
import { Spinner } from "@repo/ui/components/spinner";
import { KanbanBoard } from "@/components/kanban/KanbanBoard";

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
  const { isLoading: isAuthLoading, isAuthenticated } = useAuthStore();
  const logout = useAuthStore((state) => state.logout);
  const navigate = Route.useNavigate();

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      navigate({
        to: "/login",
        search: { redirect: window.location.href },
      });
    }
  }, [isAuthLoading, isAuthenticated, navigate]);

  if (isAuthLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner className="h-8 w-8 text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <header className="border-b px-6 py-3 flex items-center justify-between bg-card">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold">Micro Do</h1>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={logout}>
            Sair
          </Button>
        </div>
      </header>
      <main className="flex-1 overflow-hidden p-6 bg-background">
        <KanbanBoard />
      </main>
    </div>
  );
}
