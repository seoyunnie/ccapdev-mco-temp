import { createServerFn } from "@tanstack/react-start";

import { prisma } from "../db.ts";
import { requireRole } from "./auth.ts";
import { categorizeAction } from "./utils.ts";

export const getAdminStats = createServerFn({ method: "GET" }).handler(async () => {
  await requireRole(["admin"]);
  const [users, reservations, threads, reviews] = await Promise.all([
    prisma.user.count(),
    prisma.reservation.count({ where: { status: "confirmed" } }),
    prisma.thread.count(),
    prisma.review.count(),
  ]);
  return { users, reservations, threads, reviews };
});

export const getUsers = createServerFn({ method: "GET" }).handler(async () => {
  await requireRole(["concierge", "admin"]);
  const users = await prisma.user.findMany({
    include: { bans: { where: { expiresAt: { gt: new Date() } } } },
    orderBy: { name: "asc" },
  });
  return users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    status: u.bans.length > 0 ? "Banned" : "Active",
  }));
});

export const updateUserRole = createServerFn({ method: "POST" })
  .inputValidator((d: { userId: string; role: string }) => {
    const validRoles = ["guest", "resident", "concierge", "admin"];
    if (!validRoles.includes(d.role)) {
      throw new Error("Invalid role");
    }
    return d;
  })
  .handler(async ({ data }) => {
    const session = await requireRole(["admin"]);
    const updated = await prisma.user.update({ where: { id: data.userId }, data: { role: data.role } });

    await prisma.activityLog.create({
      data: {
        id: crypto.randomUUID(),
        userId: session.user.id,
        action: "update_user_role",
        detail: `Changed user ${data.userId} role to ${data.role}`,
      },
    });

    return updated;
  });

export const getActivityLogs = createServerFn({ method: "GET" })
  .inputValidator((d: { page?: number; pageSize?: number }) => d)
  .handler(async ({ data }) => {
    await requireRole(["admin"]);
    const page = data.page ?? 1;
    const pageSize = data.pageSize ?? 50;
    const [logs, total] = await Promise.all([
      prisma.activityLog.findMany({
        include: { user: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.activityLog.count(),
    ]);
    return {
      items: logs.map((l) => ({
        id: l.id,
        user: l.user?.name ?? "System",
        action: l.action,
        detail: l.detail,
        type: categorizeAction(l.action),
        timestamp: l.createdAt.toISOString().replace("T", " ").slice(0, 19),
      })),
      total,
      page,
      pageSize,
    };
  });

export const getDiagnostics = createServerFn({ method: "GET" }).handler(async () => {
  await requireRole(["admin"]);

  // Database check
  let dbStatus: "Connected" | "Disconnected" = "Disconnected";
  try {
    await prisma.$runCommandRaw({ ping: 1 });
    dbStatus = "Connected";
  } catch {
    dbStatus = "Disconnected";
  }

  // Counts as proxy for storage
  const [users, threads, reviews, reservations, logs] = await Promise.all([
    prisma.user.count(),
    prisma.thread.count(),
    prisma.review.count(),
    prisma.reservation.count(),
    prisma.activityLog.count(),
  ]);
  const totalRecords = users + threads + reviews + reservations + logs;

  return { api: "Operational" as const, database: dbStatus, totalRecords };
});

export const getErrorLogs = createServerFn({ method: "GET" })
  .inputValidator((d: { page?: number; pageSize?: number }) => d)
  .handler(async ({ data }) => {
    await requireRole(["admin"]);
    const page = data.page ?? 1;
    const pageSize = data.pageSize ?? 50;
    const [logs, total] = await Promise.all([
      prisma.errorLog.findMany({ orderBy: { createdAt: "desc" }, skip: (page - 1) * pageSize, take: pageSize }),
      prisma.errorLog.count(),
    ]);
    return {
      items: logs.map((l) => ({
        id: l.id,
        level: l.level,
        message: l.message,
        source: l.source ?? "unknown",
        timestamp: l.createdAt.toISOString().replace("T", " ").slice(0, 19),
      })),
      total,
      page,
      pageSize,
    };
  });

export const unbanUser = createServerFn({ method: "POST" })
  .inputValidator((d: { userId: string }) => d)
  .handler(async ({ data }) => {
    const session = await requireRole(["admin"]);
    await prisma.ban.deleteMany({ where: { userId: data.userId } });

    await prisma.activityLog.create({
      data: {
        id: crypto.randomUUID(),
        userId: session.user.id,
        action: "unban_user",
        detail: `Unbanned user ${data.userId}`,
      },
    });
  });
