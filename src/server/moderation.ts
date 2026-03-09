import { createServerFn } from "@tanstack/react-start";

import { prisma } from "../db.ts";
import { requireRole } from "./auth.ts";

export const getReports = createServerFn({ method: "GET" }).handler(async () => {
  await requireRole(["concierge", "admin"]);
  const reports = await prisma.report.findMany({
    where: { status: "pending" },
    include: {
      reporter: { select: { name: true } },
      thread: { select: { title: true, authorId: true, author: { select: { name: true } } } },
      comment: { select: { content: true, authorId: true, author: { select: { name: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  return reports.map((r) => {
    return {
      id: r.id,
      title: r.thread?.title ?? (r.comment ? r.comment.content.slice(0, 50) + "…" : "Unknown"),
      author: r.thread?.author.name ?? r.comment?.author.name ?? "Unknown",
      reason: r.reason,
      reports: 1,
      date: r.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      threadId: r.threadId,
      commentId: r.commentId,
    };
  });
});

export const resolveReport = createServerFn({ method: "POST" })
  .inputValidator((d: { reportId: string; action: "resolve" | "dismiss" | "delete" }) => d)
  .handler(async ({ data }) => {
    const session = await requireRole(["concierge", "admin"]);
    const report = await prisma.report.findUnique({ where: { id: data.reportId } });
    if (!report) throw new Error("Report not found");

    if (data.action === "delete") {
      if (report.threadId) {
        await prisma.thread.delete({ where: { id: report.threadId } });
      } else if (report.commentId) {
        await prisma.comment.delete({ where: { id: report.commentId } });
      }
    }

    const updated = await prisma.report.update({
      where: { id: data.reportId },
      data: { status: data.action === "dismiss" ? "dismissed" : "resolved" },
    });
    await prisma.activityLog.create({
      data: {
        id: crypto.randomUUID(),
        userId: session.user.id,
        action: "resolve_report",
        detail: `${data.action} report ${data.reportId}`,
      },
    });

    return updated;
  });

export const createBan = createServerFn({ method: "POST" })
  .inputValidator((d: { userId: string; reason: string; durationDays: number }) => {
    if (d.durationDays < 1 || d.durationDays > 365) throw new Error("Ban duration must be 1–365 days");
    if (!d.reason.trim()) throw new Error("Ban reason is required");
    return d;
  })
  .handler(async ({ data }) => {
    const session = await requireRole(["concierge", "admin"]);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + data.durationDays);

    const ban = await prisma.ban.create({
      data: { id: crypto.randomUUID(), userId: data.userId, reason: data.reason, expiresAt },
    });

    await prisma.activityLog.create({
      data: {
        id: crypto.randomUUID(),
        userId: session.user.id,
        action: "ban_user",
        detail: `Banned user ${data.userId} for ${data.durationDays} days`,
      },
    });

    return ban;
  });

export const createReport = createServerFn({ method: "POST" })
  .inputValidator((d: { threadId?: string; commentId?: string; reason: string }) => {
    if (!d.threadId && !d.commentId) throw new Error("Either threadId or commentId is required");
    return d;
  })
  .handler(async ({ data }) => {
    const session = await requireRole(["resident", "concierge", "admin"]);
    return prisma.report.create({
      data: {
        id: crypto.randomUUID(),
        reporterId: session.user.id,
        threadId: data.threadId,
        commentId: data.commentId,
        reason: data.reason,
      },
    });
  });
