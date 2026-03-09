import "@fontsource/nunito/400.css";
import "@fontsource/nunito/500.css";
import "@fontsource/nunito/600.css";
import "@fontsource/nunito/700.css";
import "@fontsource/nunito/800.css";
import "@fontsource/nunito/900.css";
import "@fontsource/quicksand/400.css";
import "@fontsource/quicksand/500.css";
import "@fontsource/quicksand/600.css";
import "@fontsource/quicksand/700.css";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "../globals.css";

import type { ReactNode } from "react";

import { ColorSchemeScript, mantineHtmlProps, MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";

import { AuthProvider } from "../contexts/auth-provider.tsx";
import { theme } from "../theme.ts";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { title: "Adormable" },
      { name: "theme-color", content: "#e64980" },
      { name: "robots", content: "noindex, nofollow, noarchive, nosnippet, noimageindex" },
      { charSet: "utf8" },
      { name: "viewport", content: "width=device-width, initial-scale=1.0" },
    ],
    links: [{ href: "/favicon.svg", type: "image/svg", rel: "icon" }],
  }),
  shellComponent: RootShell,
  component: RootLayout,
});

function RootShell({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" {...mantineHtmlProps}>
      <head>
        <HeadContent />
        <ColorSchemeScript forceColorScheme="light" />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootLayout() {
  return (
    <MantineProvider theme={theme} forceColorScheme="light">
      <Notifications position="top-right" />
      <AuthProvider>
        <Outlet />
      </AuthProvider>
    </MantineProvider>
  );
}
