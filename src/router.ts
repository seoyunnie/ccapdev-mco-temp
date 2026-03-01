import { createRouter } from "@tanstack/react-router";

import { routeTree } from "./route-tree.gen.ts";

export const router = createRouter({ defaultPreload: "intent", routeTree, scrollRestoration: true });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
