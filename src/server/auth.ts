import { createServerFn } from "@tanstack/react-start";

import { prisma } from "../db.ts";
import { auth } from "../lib/auth.ts";

type SessionResult = Awaited<ReturnType<typeof auth.api.getSession>>;
type AuthenticatedSession = NonNullable<SessionResult>;
interface ActiveBanRecord {
  id: string;
  reason: string;
  expiresAt: Date | null;
}
type SerializedBan = { id: string; reason: string; expiresAt: string | null; isPermanent: boolean } | null;

function serializeBan(activeBan: ActiveBanRecord | null): SerializedBan {
  if (activeBan == null) {
    return null;
  }

  return {
    id: activeBan.id,
    reason: activeBan.reason,
    expiresAt: activeBan.expiresAt?.toISOString() ?? null,
    isPermanent: activeBan.expiresAt == null,
  };
}

function getActiveBanForUser(userId: string): Promise<ActiveBanRecord | null> {
  return prisma.ban.findFirst({
    where: { userId, OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] },
    orderBy: { createdAt: "desc" },
  });
}

// Server function callable from beforeLoad (works on both client & server via RPC bridge).
// The @tanstack/react-start/server import lives inside the handler so it never
// Leaks into the client bundle (the import-protection plugin denies that specifier).
export const getSessionFn = createServerFn({ method: "GET" }).handler(async () => {
  const { getRequest } = await import("@tanstack/react-start/server");
  const request = getRequest();
  return auth.api.getSession({ headers: request.headers });
});

export const getSessionStateFn = createServerFn({ method: "GET" }).handler(async () => {
  const session = await getSessionFn();
  const userId = session?.user?.id;
  if (userId == null || userId.length === 0) {
    return { session: null, activeBan: null };
  }

  const activeBan = await getActiveBanForUser(userId);
  return { session, activeBan: serializeBan(activeBan) };
});

export const getActiveBanStatusFn = createServerFn({ method: "GET" }).handler(async () => {
  const session = await getSessionFn();
  const userId = session?.user?.id;
  if (userId == null || userId.length === 0) {
    return null;
  }

  const activeBan = await getActiveBanForUser(userId);
  if (activeBan == null) {
    return null;
  }

  const latestAppeal = await prisma.banAppeal.findFirst({
    where: { userId, banId: activeBan.id },
    orderBy: { createdAt: "desc" },
    include: { reviewer: { select: { name: true } } },
  });

  return {
    id: activeBan.id,
    reason: activeBan.reason,
    expiresAt: activeBan.expiresAt?.toISOString() ?? null,
    isPermanent: activeBan.expiresAt == null,
    appeal:
      latestAppeal == null
        ? null
        : {
            id: latestAppeal.id,
            message: latestAppeal.message,
            status: latestAppeal.status,
            staffNote: latestAppeal.staffNote,
            reviewerName: latestAppeal.reviewer?.name ?? null,
            createdAt: latestAppeal.createdAt.toISOString(),
            reviewedAt: latestAppeal.reviewedAt?.toISOString() ?? null,
          },
  };
});

// Server-side helpers — only call from within createServerFn handlers
export async function requireSession(): Promise<AuthenticatedSession> {
  const session = await getSessionFn();
  if (!session) {
    throw new Error("Unauthorized");
  }

  const activeBan = await getActiveBanForUser(session.user.id);

  if (activeBan) {
    throw new Error("ACCOUNT_BANNED");
  }

  return session;
}

export async function requireRole(roles: string[]): Promise<AuthenticatedSession> {
  const session = await requireSession();
  if (!roles.includes(session.user.role as string)) {
    throw new Error("Forbidden");
  }
  return session;
}
