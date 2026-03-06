import { AppShell } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";

import { Footer } from "../../components/layout/footer.tsx";
import { Header } from "../../components/layout/header.tsx";
import { Sidebar } from "../../components/layout/sidebar.tsx";
import { authClient } from "../../lib/auth-client.ts";

// Routes under /_app that don't require authentication
const PUBLIC_PATHS = new Set(["/", "/study-nook", "/lobby", "/guide"]);

export const Route = createFileRoute("/_app")({
  beforeLoad: async ({ location }) => {
    // Allow public pages without auth
    const path = location.pathname;
    const isPublic =
      PUBLIC_PATHS.has(path) ||
      path.startsWith("/study-nook/") ||
      path.startsWith("/lobby/") ||
      path.startsWith("/guide/");
    if (isPublic) return;

    const { data: session } = await authClient.getSession();
    if (!session?.user) {
      throw redirect({ to: "/login" });
    }

    const role = session.user.role as string;

    // Admin routes — only admin
    if (path.startsWith("/admin") && role !== "admin") {
      throw redirect({ to: "/dashboard" });
    }

    // Staff routes — only concierge or admin
    if ((path === "/concierge" || path === "/moderation") && role !== "concierge" && role !== "admin") {
      throw redirect({ to: "/dashboard" });
    }
  },
  component: AppLayout,
});

function AppLayout() {
  const [isSidebarOpen, { toggle: onSidebarToggle }] = useDisclosure();

  return (
    <AppShell header={{ height: 70 }} padding={0}>
      <Header isBurgerOpen={isSidebarOpen} onSidebarToggle={onSidebarToggle} />

      <Sidebar isOpen={isSidebarOpen} onToggle={onSidebarToggle} />

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>

      <Footer />
    </AppShell>
  );
}
