import { createServerFn } from "@tanstack/react-start";

import { auth } from "../lib/auth.ts";

// Dynamic import avoids pulling @tanstack/react-start/server into the client
// bundle (the import-protection plugin denies that specifier).
export async function getSession(): ReturnType<typeof auth.api.getSession> {
  const { getRequest } = await import("@tanstack/react-start/server");
  const request = getRequest();
  return auth.api.getSession({ headers: request.headers });
}

// Server function callable from beforeLoad (works on both client & server)
export const getSessionFn = createServerFn({ method: "GET" }).handler(async () => {
  return getSession();
});

export async function requireSession(): Promise<NonNullable<Awaited<ReturnType<typeof getSession>>>> {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
  return session;
}

export async function requireRole(roles: string[]): ReturnType<typeof requireSession> {
  const session = await requireSession();
  if (!roles.includes(session.user.role as string)) throw new Error("Forbidden");
  return session;
}
