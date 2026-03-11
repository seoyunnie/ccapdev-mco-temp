import { createServerFn } from "@tanstack/react-start";

import { prisma } from "../db.ts";
import { normalizeThreadTag } from "../features/lobby/lobby.taxonomy.ts";
import { getSessionFn, requireSession } from "./auth.ts";
import { clampPagination, formatRelative, sanitize } from "./utils.ts";

const MAX_IMAGE_BYTES = 2_000_000;

export const getThreads = createServerFn({ method: "GET" })
  .inputValidator((d: { page?: number; pageSize?: number }) => d)
  .handler(async ({ data }) => {
    const session = await getSessionFn();
    const { page, pageSize } = clampPagination(data.page, data.pageSize);
    const [rows, total] = await Promise.all([
      prisma.thread.findMany({
        include: { author: true, _count: { select: { comments: true } } },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.thread.count(),
    ]);

    // Fetch user's votes for these threads
    const threadIds = rows.map((t) => t.id);
    const votes =
      session?.user?.id == null
        ? []
        : await prisma.vote.findMany({ where: { userId: session.user.id, threadId: { in: threadIds } } });
    const voteMap = new Map(votes.map((v) => [v.threadId, v.value]));

    return {
      items: rows.map((t) => ({
        id: t.id,
        title: t.title,
        author: t.author.name,
        authorImage: t.author.image,
        snippet: t.content.length > 120 ? `${t.content.slice(0, 120)}…` : t.content,
        image: t.image,
        upvotes: t.upvotes,
        userVote: voteMap.get(t.id) ?? 0,
        comments: t._count.comments,
        tag: normalizeThreadTag(t.tag),
        time: formatRelative(t.createdAt),
      })),
      total,
      page,
      pageSize,
    };
  });

export const getThread = createServerFn({ method: "GET" })
  .inputValidator((d: { threadId: string }) => d)
  .handler(async ({ data }) => {
    const session = await getSessionFn();
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
    if (!thread) {
      throw new Error("Thread not found");
    }

    // Fetch user's votes for this thread and all visible comments
    const allCommentIds = thread.comments.flatMap((c) => [c.id, ...c.replies.map((r) => r.id)]);
    const votes =
      session?.user?.id == null
        ? []
        : await prisma.vote.findMany({
            where: {
              userId: session.user.id,
              OR: [
                { threadId: data.threadId },
                ...(allCommentIds.length > 0 ? [{ commentId: { in: allCommentIds } }] : []),
              ],
            },
          });
    const voteMap = new Map(votes.map((v) => [v.threadId ?? v.commentId, v.value]));

    return {
      id: thread.id,
      title: thread.title,
      author: thread.author.name,
      authorImage: thread.author.image,
      time: formatRelative(thread.createdAt),
      tag: normalizeThreadTag(thread.tag),
      content: thread.content,
      image: thread.image,
      upvotes: thread.upvotes,
      userVote: voteMap.get(thread.id) ?? 0,
      isAuthor: session?.user.id === thread.authorId,
      comments: thread.comments.map((c) => ({
        id: c.id,
        author: c.author.name,
        authorImage: c.author.image,
        time: formatRelative(c.createdAt),
        content: c.content,
        upvotes: c.upvotes,
        userVote: voteMap.get(c.id) ?? 0,
        isAuthor: session?.user.id === c.authorId,
        replies: c.replies.map((r) => ({
          id: r.id,
          author: r.author.name,
          authorImage: r.author.image,
          time: formatRelative(r.createdAt),
          content: r.content,
          upvotes: r.upvotes,
          userVote: voteMap.get(r.id) ?? 0,
        })),
      })),
    };
  });

export const createThread = createServerFn({ method: "POST" })
  .inputValidator((d: { title: string; content: string; tag?: string; image?: string }) => {
    if (!d.title.trim()) {
      throw new Error("Title is required");
    }
    if (!d.content.trim()) {
      throw new Error("Content is required");
    }
    if (d.image != null) {
      if (!d.image.startsWith("data:image/")) {
        throw new Error("Invalid image data");
      }
      if (d.image.length > MAX_IMAGE_BYTES) {
        throw new Error("Image must be under 2 MB");
      }
    }
    return { title: sanitize(d.title), content: sanitize(d.content), tag: normalizeThreadTag(d.tag), image: d.image };
  })
  .handler(async ({ data }) => {
    const session = await requireSession();
    const thread = await prisma.thread.create({
      data: {
        id: crypto.randomUUID(),
        title: data.title,
        content: data.content,
        tag: data.tag,
        image: data.image ?? null,
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
  .inputValidator((d: { threadId: string; content: string; parentId?: string }) => {
    if (!d.content.trim()) {
      throw new Error("Comment content is required");
    }
    return { ...d, content: sanitize(d.content) };
  })
  .handler(async ({ data }) => {
    const session = await requireSession();
    const comment = await prisma.comment.create({
      data: {
        id: crypto.randomUUID(),
        threadId: data.threadId,
        parentId: data.parentId ?? null,
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
    if (!thread) {
      throw new Error("Thread not found");
    }
    if (thread.authorId !== session.user.id && !["admin"].includes(session.user.role as string)) {
      throw new Error("Forbidden");
    }

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
  .inputValidator((d: { threadId: string; title: string; content: string; tag?: string; image?: string | null }) => {
    if (!d.title.trim()) {
      throw new Error("Title is required");
    }
    if (!d.content.trim()) {
      throw new Error("Content is required");
    }
    if (d.image != null && d.image !== "") {
      if (!d.image.startsWith("data:image/")) {
        throw new Error("Invalid image data");
      }
      if (d.image.length > MAX_IMAGE_BYTES) {
        throw new Error("Image must be under 2 MB");
      }
    }
    return { ...d, title: sanitize(d.title), content: sanitize(d.content), tag: normalizeThreadTag(d.tag) };
  })
  .handler(async ({ data }) => {
    const session = await requireSession();
    const thread = await prisma.thread.findUnique({ where: { id: data.threadId } });
    if (!thread) {
      throw new Error("Thread not found");
    }
    if (thread.authorId !== session.user.id) {
      throw new Error("Forbidden");
    }

    const updated = await prisma.thread.update({
      where: { id: data.threadId },
      data: { title: data.title, content: data.content, tag: data.tag, image: data.image === "" ? null : data.image },
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
    if (!comment) {
      throw new Error("Comment not found");
    }
    if (comment.authorId !== session.user.id && !["admin"].includes(session.user.role as string)) {
      throw new Error("Forbidden");
    }

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
