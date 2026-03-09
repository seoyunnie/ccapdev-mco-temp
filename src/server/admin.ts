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
    if (!validRoles.includes(d.role)) throw new Error("Invalid role");
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

export const getActivityLogs = createServerFn({ method: "GET" }).handler(async () => {
  await requireRole(["admin"]);
  const logs = await prisma.activityLog.findMany({
    include: { user: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return logs.map((l) => ({
    id: l.id,
    user: l.user?.name ?? "System",
    action: l.action,
    detail: l.detail,
    type: categorizeAction(l.action),
    timestamp: l.createdAt.toISOString().replace("T", " ").slice(0, 19),
  }));
});
