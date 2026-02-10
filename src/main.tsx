import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import "@mantine/core/styles.css";
import "@mantine/carousel/styles.css";
import "./globals.css";

import { MantineProvider } from "@mantine/core";
import { RouterProvider } from "@tanstack/react-router";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AuthProvider } from "./context/AuthContext.tsx";
import { router } from "./router.ts";
import { adormableTheme } from "./theme.ts";

// oxlint-disable-next-line unicorn/prefer-query-selector
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <MantineProvider theme={adormableTheme}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </MantineProvider>
  </StrictMode>,
);
