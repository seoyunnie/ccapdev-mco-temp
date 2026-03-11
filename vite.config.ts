import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";

import type { auth as AuthHandler } from "./src/lib/auth.ts";

// Stub server-only local modules in the client bundle.
// CreateServerFn replaces handler bodies with RPC stubs on the client,
// But top-level imports remain.  Stubbing these two files cuts off
// The entire Prisma + Better-Auth server dependency tree so Rollup
// Never tries to bundle Node built-ins from @prisma/client/runtime.
const SERVER_STUBS: Record<string, string> = {
  "/src/db.ts": "export const prisma = {};",
  "/src/lib/auth.ts": "export const auth = {};",
};

function serverOnlyStubPlugin(): Plugin {
  return {
    name: "server-only-stub",
    enforce: "pre",
    load(id) {
      if (this.environment?.name !== "client") {
        return null;
      }
      for (const [suffix, code] of Object.entries(SERVER_STUBS)) {
        if (id.endsWith(suffix)) {
          return code;
        }
      }
      return null;
    },
  };
}

// Vite plugin that catches /api/auth/* and forwards to Better Auth handler.
// Needed because TanStack Start v1 has no createAPIFileRoute.
function betterAuthVitePlugin(): Plugin {
  return {
    name: "better-auth-api",
    configureServer(server) {
      // oxlint-disable-next-line no-async-endpoint-handlers, no-misused-promises
      server.middlewares.use(async (req, res, next) => {
        if (req.url == null || !req.url.startsWith("/api/auth")) {
          next();
          return;
        }

        // oxlint-disable-next-line no-unsafe-type-assertion
        const { auth } = (await server.ssrLoadModule("/src/lib/auth.ts")) as { auth: typeof AuthHandler };

        const proto = req.headers["x-forwarded-proto"]?.toString() ?? "http";
        const host = req.headers.host ?? "localhost:5173";
        const url = new URL(req.url, `${proto}://${host}`);

        const bodyChunks: Buffer[] = [];
        for await (const chunk of req) {
          // oxlint-disable-next-line no-unsafe-argument
          bodyChunks.push(Buffer.from(chunk));
        }
        const body = Buffer.concat(bodyChunks);

        const headers = new Headers();
        for (const [key, val] of Object.entries(req.headers)) {
          if (val != null) {
            headers.set(key, Array.isArray(val) ? val.join(", ") : val);
          }
        }

        const webReq = new Request(url, {
          method: req.method,
          headers,
          ...(req.method !== "GET" && req.method !== "HEAD" ? { body, duplex: "half" as const } : {}),
        });

        const webRes = await auth.handler(webReq);

        res.statusCode = webRes.status;
        webRes.headers.forEach((v, k) => res.setHeader(k, v));
        const buf = Buffer.from(await webRes.arrayBuffer());
        res.end(buf);
      });
    },
  };
}

export default defineConfig({
  plugins: [
    serverOnlyStubPlugin(),
    betterAuthVitePlugin(),
    devtools(),
    tanstackStart({ router: { generatedRouteTree: "./route-tree.gen.ts" } }),
    react({ babel: { plugins: ["babel-plugin-react-compiler"] } }),
  ],
  ssr: { noExternal: ["@mantine/*"] },
});
