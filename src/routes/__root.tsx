import { AppShell } from "@mantine/core";
import { createRootRoute, Outlet } from "@tanstack/react-router";

function RootComponent() {
  return (
    <AppShell>
      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}

export const Route = createRootRoute({ component: RootComponent });
