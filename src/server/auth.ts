import { createServerFn } from "@tanstack/react-start";

import { auth } from "../lib/auth.ts";

// Server function callable from beforeLoad (works on both client & server via RPC bridge).
// The @tanstack/react-start/server import lives inside the handler so it never
// leaks into the client bundle (the import-protection plugin denies that specifier).
export const getSessionFn = createServerFn({ method: "GET" }).handler(async () => {
  const { getRequest } = await import("@tanstack/react-start/server");
  const request = getRequest();
  return auth.api.getSession({ headers: request.headers });
});

// Server-side helpers — only call from within createServerFn handlers
export async function requireSession() {
  const session = await getSessionFn();
  if (!session) {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function requireRole(roles: string[]) {
  const session = await requireSession();
  if (!roles.includes(session.user.role as string)) {
    throw new Error("Forbidden");
  }
  return session;
}
