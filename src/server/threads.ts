import { createServerFn } from "@tanstack/react-start";

import { prisma } from "../db.ts";
import { getSession, requireSession } from "./auth.ts";
import { formatRelative } from "./utils.ts";

export const getThreads = createServerFn({ method: "GET" }).handler(async () => {
  const rows = await prisma.thread.findMany({
    include: { author: true, _count: { select: { comments: true } } },
    orderBy: { createdAt: "desc" },
  });
  return rows.map((t) => ({
    id: t.id,
    title: t.title,
    author: t.author.name,
    snippet: t.content.length > 120 ? t.content.slice(0, 120) + "…" : t.content,
    upvotes: t.upvotes,
    comments: t._count.comments,
    tag: t.tag ?? "General",
    time: formatRelative(t.createdAt),
  }));
});

export const getThread = createServerFn({ method: "GET" })
  .inputValidator((d: { threadId: string }) => d)
  .handler(async ({ data }) => {
    const session = await getSession();
    const thread = await prisma.thread.findUnique({
      where: { id: data.threadId },
      include: {
        author: true,
        comments: {
          where: { parentId: null },
          include: { author: true, replies: { include: { author: true }, orderBy: { createdAt: "asc" } } },
          orderBy: { createdAt: "asc" },
        },
      },
    });
    if (!thread) throw new Error("Thread not found");

    return {
      id: thread.id,
      title: thread.title,
      author: thread.author.name,
      time: formatRelative(thread.createdAt),
      tag: thread.tag ?? "General",
      content: thread.content,
      upvotes: thread.upvotes,
      isAuthor: session?.user.id === thread.authorId,
      comments: thread.comments.map((c) => ({
        id: c.id,
        author: c.author.name,
        time: formatRelative(c.createdAt),
        content: c.content,
        upvotes: c.upvotes,
        replies: c.replies.map((r) => ({
          id: r.id,
          author: r.author.name,
          time: formatRelative(r.createdAt),
          content: r.content,
          upvotes: r.upvotes,
        })),
      })),
    };
  });

export const createThread = createServerFn({ method: "POST" })
  .inputValidator((d: { title: string; content: string; tag?: string }) => d)
  .handler(async ({ data }) => {
    const session = await requireSession();
    const thread = await prisma.thread.create({
      data: {
        id: crypto.randomUUID(),
        title: data.title,
        content: data.content,
        tag: data.tag,
        authorId: session.user.id,
      },
    });

    await prisma.activityLog.create({
      data: {
        id: crypto.randomUUID(),
        userId: session.user.id,
        action: "create_thread",
        detail: `Created thread "${data.title}"`,
      },
    });

    return thread;
  });

export const createComment = createServerFn({ method: "POST" })
  .inputValidator((d: { threadId: string; content: string; parentId?: string }) => d)
  .handler(async ({ data }) => {
    const session = await requireSession();
    const comment = await prisma.comment.create({
      data: {
        id: crypto.randomUUID(),
        threadId: data.threadId,
        parentId: data.parentId,
        authorId: session.user.id,
        content: data.content,
      },
    });

    await prisma.activityLog.create({
      data: {
        id: crypto.randomUUID(),
        userId: session.user.id,
        action: "create_comment",
        detail: `Commented on thread ${data.threadId}`,
      },
    });

    return comment;
  });

export const voteThread = createServerFn({ method: "POST" })
  .inputValidator((d: { threadId: string; value: 1 | -1 }) => d)
  .handler(async ({ data }) => {
    const session = await requireSession();
    const existing = await prisma.vote.findFirst({ where: { userId: session.user.id, threadId: data.threadId } });

    if (existing) {
      if (existing.value === data.value) {
        await prisma.vote.delete({ where: { id: existing.id } });
        await prisma.thread.update({ where: { id: data.threadId }, data: { upvotes: { increment: -data.value } } });
      } else {
        await prisma.vote.update({ where: { id: existing.id }, data: { value: data.value } });
        await prisma.thread.update({ where: { id: data.threadId }, data: { upvotes: { increment: data.value * 2 } } });
      }
    } else {
      await prisma.vote.create({
        data: { id: crypto.randomUUID(), userId: session.user.id, threadId: data.threadId, value: data.value },
      });
      await prisma.thread.update({ where: { id: data.threadId }, data: { upvotes: { increment: data.value } } });
    }

    await prisma.activityLog.create({
      data: {
        id: crypto.randomUUID(),
        userId: session.user.id,
        action: "vote_thread",
        detail: `Voted ${data.value > 0 ? "up" : "down"} on thread ${data.threadId}`,
      },
    });
  });

export const voteComment = createServerFn({ method: "POST" })
  .inputValidator((d: { commentId: string; value: 1 | -1 }) => d)
  .handler(async ({ data }) => {
    const session = await requireSession();
    const existing = await prisma.vote.findFirst({ where: { userId: session.user.id, commentId: data.commentId } });

    if (existing) {
      if (existing.value === data.value) {
        await prisma.vote.delete({ where: { id: existing.id } });
        await prisma.comment.update({ where: { id: data.commentId }, data: { upvotes: { increment: -data.value } } });
      } else {
        await prisma.vote.update({ where: { id: existing.id }, data: { value: data.value } });
        await prisma.comment.update({
          where: { id: data.commentId },
          data: { upvotes: { increment: data.value * 2 } },
        });
      }
    } else {
      await prisma.vote.create({
        data: { id: crypto.randomUUID(), userId: session.user.id, commentId: data.commentId, value: data.value },
      });
      await prisma.comment.update({ where: { id: data.commentId }, data: { upvotes: { increment: data.value } } });
    }

    await prisma.activityLog.create({
      data: {
        id: crypto.randomUUID(),
        userId: session.user.id,
        action: "vote_comment",
        detail: `Voted ${data.value > 0 ? "up" : "down"} on comment ${data.commentId}`,
      },
    });
  });

export const deleteThread = createServerFn({ method: "POST" })
  .inputValidator((d: { threadId: string }) => d)
  .handler(async ({ data }) => {
    const session = await requireSession();
    const thread = await prisma.thread.findUnique({ where: { id: data.threadId } });
    if (!thread) throw new Error("Thread not found");
    if (thread.authorId !== session.user.id && !["admin"].includes(session.user.role as string))
      throw new Error("Forbidden");

    await prisma.thread.delete({ where: { id: data.threadId } });

    await prisma.activityLog.create({
      data: {
        id: crypto.randomUUID(),
        userId: session.user.id,
        action: "delete_thread",
        detail: `Deleted thread "${thread.title}"`,
      },
    });
  });

export const updateThread = createServerFn({ method: "POST" })
  .inputValidator((d: { threadId: string; title: string; content: string; tag?: string }) => d)
  .handler(async ({ data }) => {
    const session = await requireSession();
    const thread = await prisma.thread.findUnique({ where: { id: data.threadId } });
    if (!thread) throw new Error("Thread not found");
    if (thread.authorId !== session.user.id) throw new Error("Forbidden");

    const updated = await prisma.thread.update({
      where: { id: data.threadId },
      data: { title: data.title, content: data.content, tag: data.tag },
    });

    await prisma.activityLog.create({
      data: {
        id: crypto.randomUUID(),
        userId: session.user.id,
        action: "update_thread",
        detail: `Updated thread "${data.title}"`,
      },
    });

    return updated;
  });

export const deleteComment = createServerFn({ method: "POST" })
  .inputValidator((d: { commentId: string }) => d)
  .handler(async ({ data }) => {
    const session = await requireSession();
    const comment = await prisma.comment.findUnique({ where: { id: data.commentId } });
    if (!comment) throw new Error("Comment not found");
    if (comment.authorId !== session.user.id && !["admin"].includes(session.user.role as string))
      throw new Error("Forbidden");

    await prisma.comment.delete({ where: { id: data.commentId } });

    await prisma.activityLog.create({
      data: {
        id: crypto.randomUUID(),
        userId: session.user.id,
        action: "delete_comment",
        detail: `Deleted comment ${data.commentId}`,
      },
    });
  });
