import { AppShell } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Outlet, createFileRoute } from "@tanstack/react-router";

import { Footer } from "../../components/layout/footer.tsx";
import { Header } from "../../components/layout/header.tsx";
import { Sidebar } from "../../components/layout/sidebar.tsx";

export const Route = createFileRoute("/_app")({ component: AppLayout });

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
