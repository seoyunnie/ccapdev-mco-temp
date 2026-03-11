import { createServerFn } from "@tanstack/react-start";

import { prisma } from "../db.ts";
import { getActiveBanStatusFn, requireRole, requireSession } from "./auth.ts";
import { sanitize } from "./utils.ts";

const REPORT_EXCERPT_LIMIT = 180;

async function collectDescendantCommentIds(rootIds: string[]): Promise<string[]> {
  if (rootIds.length === 0) {
    return [];
  }

  const children = await prisma.comment.findMany({ where: { parentId: { in: rootIds } }, select: { id: true } });
  const childIds = children.map((child) => child.id);
  const descendantIds = await collectDescendantCommentIds(childIds);
  return [...childIds, ...descendantIds];
}

async function deleteCommentTree(commentId: string): Promise<void> {
  const descendantIds = await collectDescendantCommentIds([commentId]);
  if (descendantIds.length > 0) {
    await prisma.vote.deleteMany({ where: { commentId: { in: descendantIds } } });
    await prisma.report.deleteMany({ where: { commentId: { in: descendantIds } } });
    await prisma.comment.deleteMany({ where: { id: { in: descendantIds } } });
  }

  await prisma.vote.deleteMany({ where: { commentId } });
  await prisma.report.deleteMany({ where: { commentId } });
  await prisma.comment.delete({ where: { id: commentId } });
}

export const getReports = createServerFn({ method: "GET" }).handler(async () => {
  await requireRole(["concierge", "admin"]);
  const reports = await prisma.report.findMany({
    where: { status: "pending" },
    include: {
      reporter: { select: { name: true } },
      thread: { select: { title: true, authorId: true, author: { select: { name: true, image: true } } } },
      comment: { select: { content: true, authorId: true, author: { select: { name: true, image: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  const groupedReports = new Map<string, typeof reports>();

  for (const report of reports) {
    const key = report.threadId == null ? `comment:${report.commentId}` : `thread:${report.threadId}`;
    const existing = groupedReports.get(key) ?? [];
    existing.push(report);
    groupedReports.set(key, existing);
  }

  return [...groupedReports.values()].map((group) => {
    const [latest] = group;
    const reasons = [...new Set(group.map((report) => report.reason))];
    const excerptSource = latest.thread?.title ?? latest.comment?.content ?? "Unknown";

    return {
      id: latest.id,
      reportIds: group.map((report) => report.id),
      targetType: latest.threadId == null ? "comment" : "thread",
      targetId: latest.threadId ?? latest.commentId ?? latest.id,
      title: latest.thread?.title ?? `Comment by ${latest.comment?.author.name ?? "Unknown"}`,
      excerpt:
        excerptSource.length > REPORT_EXCERPT_LIMIT
          ? `${excerptSource.slice(0, REPORT_EXCERPT_LIMIT)}…`
          : excerptSource,
      author: latest.thread?.author.name ?? latest.comment?.author.name ?? "Unknown",
      authorImage: latest.thread?.author.image ?? latest.comment?.author.image ?? null,
      reasons,
      primaryReason: reasons[0] ?? "Other",
      reports: group.length,
      date: latest.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      threadId: latest.threadId,
      commentId: latest.commentId,
    };
  });
});

export const resolveReport = createServerFn({ method: "POST" })
  .inputValidator((d: { reportId: string; action: "resolve" | "dismiss" | "delete" }) => d)
  .handler(async ({ data }) => {
    const session = await requireRole(["concierge", "admin"]);
    const report = await prisma.report.findUnique({ where: { id: data.reportId } });
    if (!report) {
      throw new Error("Report not found");
    }

    const reportTargetWhere = report.threadId == null ? { commentId: report.commentId } : { threadId: report.threadId };

    if (data.action === "delete") {
      if (report.threadId != null) {
        await prisma.thread.delete({ where: { id: report.threadId } });
      } else if (report.commentId != null) {
        await deleteCommentTree(report.commentId);
      }

      await prisma.report.deleteMany({ where: reportTargetWhere });
    } else {
      await prisma.report.updateMany({
        where: reportTargetWhere,
        data: { status: data.action === "dismiss" ? "dismissed" : "resolved" },
      });
    }

    await prisma.activityLog.create({
      data: {
        id: crypto.randomUUID(),
        userId: session.user.id,
        action: "resolve_report",
        detail: `${data.action} report ${data.reportId}`,
      },
    });

    return { success: true };
  });

export const createBan = createServerFn({ method: "POST" })
  .inputValidator((d: { userId: string; reason: string; durationDays: number }) => {
    if (d.durationDays < 1 || d.durationDays > 365) {
      throw new Error("Ban duration must be 1–365 days");
    }
    if (!d.reason.trim()) {
      throw new Error("Ban reason is required");
    }
    return { ...d, reason: sanitize(d.reason) };
  })
  .handler(async ({ data }) => {
    const session = await requireRole(["concierge", "admin"]);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + data.durationDays);

    await prisma.ban.deleteMany({
      where: { userId: data.userId, OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] },
    });

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
    if (d.threadId == null && d.commentId == null) {
      throw new Error("Either threadId or commentId is required");
    }
    if (!d.reason.trim()) {
      throw new Error("Report reason is required");
    }
    return { ...d, reason: sanitize(d.reason) };
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

export const submitBanAppeal = createServerFn({ method: "POST" })
  .inputValidator((d: { message: string }) => {
    if (!d.message.trim()) {
      throw new Error("Appeal message is required");
    }
    return { message: sanitize(d.message) };
  })
  .handler(async ({ data }) => {
    const session = await requireSession();
    const activeBan = await getActiveBanStatusFn();
    if (activeBan == null) {
      throw new Error("No active ban found");
    }
    if (activeBan.appeal?.status === "pending") {
      throw new Error("You already have a pending appeal");
    }

    const appeal = await prisma.banAppeal.create({
      data: { id: crypto.randomUUID(), userId: session.user.id, banId: activeBan.id, message: data.message },
    });

    await prisma.activityLog.create({
      data: {
        id: crypto.randomUUID(),
        userId: session.user.id,
        action: "submit_ban_appeal",
        detail: `Submitted appeal ${appeal.id}`,
      },
    });

    return appeal;
  });

export const getBanAppeals = createServerFn({ method: "GET" }).handler(async () => {
  await requireRole(["concierge", "admin"]);
  const appeals = await prisma.banAppeal.findMany({
    include: {
      user: { select: { name: true, email: true } },
      ban: { select: { reason: true, expiresAt: true } },
      reviewer: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return appeals.map((appeal) => ({
    id: appeal.id,
    userId: appeal.userId,
    userName: appeal.user.name,
    userEmail: appeal.user.email,
    message: appeal.message,
    status: appeal.status,
    staffNote: appeal.staffNote,
    createdAt: appeal.createdAt.toISOString(),
    reviewedAt: appeal.reviewedAt?.toISOString() ?? null,
    reviewerName: appeal.reviewer?.name ?? null,
    banReason: appeal.ban?.reason ?? "Dorm policy violation",
    banExpiresAt: appeal.ban?.expiresAt?.toISOString() ?? null,
  }));
});

export const reviewBanAppeal = createServerFn({ method: "POST" })
  .inputValidator((d: { appealId: string; decision: "approve" | "reject"; staffNote?: string }) => ({
    appealId: d.appealId,
    decision: d.decision,
    staffNote: d.staffNote == null ? undefined : sanitize(d.staffNote),
  }))
  .handler(async ({ data }) => {
    const session = await requireRole(["concierge", "admin"]);
    const appeal = await prisma.banAppeal.findUnique({ where: { id: data.appealId } });
    if (!appeal) {
      throw new Error("Appeal not found");
    }
    if (appeal.status !== "pending") {
      throw new Error("Appeal has already been reviewed");
    }

    const approved = data.decision === "approve";

    await prisma.$transaction(async (tx) => {
      await tx.banAppeal.update({
        where: { id: data.appealId },
        data: {
          status: approved ? "approved" : "rejected",
          staffNote: data.staffNote,
          reviewerId: session.user.id,
          reviewedAt: new Date(),
        },
      });

      if (approved) {
        await tx.ban.deleteMany({ where: { userId: appeal.userId } });
      }
    });

    await prisma.activityLog.create({
      data: {
        id: crypto.randomUUID(),
        userId: session.user.id,
        action: approved ? "approve_ban_appeal" : "reject_ban_appeal",
        detail: `${approved ? "Approved" : "Rejected"} appeal ${data.appealId}`,
      },
    });

    return { success: true };
  });
