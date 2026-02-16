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
import "@mantine/carousel/styles.css";
import "./globals.css";

import { MantineProvider } from "@mantine/core";
import { RouterProvider } from "@tanstack/react-router";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AuthProvider } from "./contexts/auth-context.tsx";
import { router } from "./router.ts";
import { adormableTheme } from "./theme.ts";

// oxlint-disable-next-line unicorn/prefer-query-selector
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <MantineProvider theme={adormableTheme} forceColorScheme="light">
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </MantineProvider>
  </StrictMode>,
);
