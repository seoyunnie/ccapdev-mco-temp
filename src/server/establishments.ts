import { createServerFn } from "@tanstack/react-start";

import { prisma } from "../db.ts";
import { getSessionFn, requireRole, requireSession } from "./auth.ts";
import { formatRelative, logError } from "./utils.ts";

const DEFAULT_PAGE_SIZE = 20;
const MAX_IMAGE_BYTES = 2_000_000;

export const getEstablishments = createServerFn({ method: "GET" })
  .inputValidator((d: { page?: number; pageSize?: number }) => d)
  .handler(async ({ data }) => {
    const page = data.page ?? 1;
    const pageSize = data.pageSize ?? DEFAULT_PAGE_SIZE;
    const [rows, total] = await Promise.all([
      prisma.establishment.findMany({
        include: { reviews: { select: { rating: true } }, owner: { select: { name: true } } },
        orderBy: { name: "asc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.establishment.count(),
    ]);
    return {
      items: rows.map((e) => {
        const avg = e.reviews.length > 0 ? e.reviews.reduce((s, r) => s + r.rating, 0) / e.reviews.length : 0;
        return {
          id: e.id,
          name: e.name,
          category: e.category,
          description: e.description ?? "",
          address: e.address ?? "",
          rating: Math.round(avg * 10) / 10,
          reviews: e.reviews.length,
          owner: e.owner.name,
          status: e.status.charAt(0).toUpperCase() + e.status.slice(1),
        };
      }),
      total,
      page,
      pageSize,
    };
  });

export const getEstablishment = createServerFn({ method: "GET" })
  .inputValidator((d: { estId: string }) => d)
  .handler(async ({ data }) => {
    const [est, session] = await Promise.all([
      prisma.establishment.findUnique({
        where: { id: data.estId },
        include: {
          reviews: { include: { author: true }, orderBy: { createdAt: "desc" } },
          owner: { select: { name: true } },
        },
      }),
      getSessionFn(),
    ]);
    if (!est) {
      throw new Error("Establishment not found");
    }

    const avg = est.reviews.length > 0 ? est.reviews.reduce((s, r) => s + r.rating, 0) / est.reviews.length : 0;

    // Get user's helpful votes for reviews on this establishment
    const helpfulVotes = session?.user?.id == null
      ? []
      : await prisma.helpfulVote.findMany({
          where: { userId: session.user.id, reviewId: { in: est.reviews.map((r) => r.id) } },
        });
    const helpfulSet = new Set(helpfulVotes.map((v) => v.reviewId));

    return {
      name: est.name,
      category: est.category,
      rating: Math.round(avg * 10) / 10,
      totalReviews: est.reviews.length,
      description: est.description ?? "",
      ownerName: est.owner.name,
      isOwner: session?.user?.id === est.ownerId,
      reviews: est.reviews.map((r) => ({
        id: r.id,
        author: r.author.name,
        rating: r.rating,
        time: formatRelative(r.createdAt),
        content: r.content,
        helpful: r.helpful,
        images: r.images,
        ownerReply: r.ownerReply,
        isHelpful: helpfulSet.has(r.id),
      })),
    };
  });

export const createEstablishment = createServerFn({ method: "POST" })
  .inputValidator((d: { name: string; category: string; description?: string; address?: string; ownerId: string }) => d)
  .handler(async ({ data }) => {
    const session = await requireRole(["admin"]);

    const est = await prisma.establishment.create({
      data: {
        id: crypto.randomUUID(),
        name: data.name,
        category: data.category,
        description: data.description,
        address: data.address,
        ownerId: data.ownerId,
      },
    });

    await prisma.activityLog.create({
      data: {
        id: crypto.randomUUID(),
        userId: session.user.id,
        action: "create_establishment",
        detail: `Created establishment "${data.name}"`,
      },
    });

    return est;
  });

export const createReview = createServerFn({ method: "POST" })
  .inputValidator((d: { establishmentId: string; rating: number; content: string; images?: string[] }) => {
    if (d.rating < 1 || d.rating > 5) {
      throw new Error("Rating must be 1–5");
    }
    if (!d.content.trim()) {
      throw new Error("Review content is required");
    }
    if (d.images) {
      for (const img of d.images) {
        if (!img.startsWith("data:image/")) {
          throw new Error("Invalid image data");
        }
        if (img.length > MAX_IMAGE_BYTES) {
          throw new Error("Each image must be under 1.5 MB");
        }
      }
      if (d.images.length > 5) {
        throw new Error("Maximum 5 images per review");
      }
    }
    return d;
  })
  .handler(async ({ data }) => {
    const session = await requireSession();
    const review = await prisma.review.create({
      data: {
        id: crypto.randomUUID(),
        establishmentId: data.establishmentId,
        authorId: session.user.id,
        rating: data.rating,
        content: data.content,
        images: data.images ?? [],
      },
    });

    await prisma.activityLog.create({
      data: {
        id: crypto.randomUUID(),
        userId: session.user.id,
        action: "create_review",
        detail: `Reviewed establishment ${data.establishmentId}`,
      },
    });

    return review;
  });

export const createOwnerReply = createServerFn({ method: "POST" })
  .inputValidator((d: { reviewId: string; reply: string }) => {
    if (!d.reply.trim()) {
      throw new Error("Reply cannot be empty");
    }
    return d;
  })
  .handler(async ({ data }) => {
    const session = await requireSession();
    const review = await prisma.review.findUnique({
      where: { id: data.reviewId },
      include: { establishment: { select: { ownerId: true } } },
    });
    if (!review) {
      throw new Error("Review not found");
    }
    if (review.establishment.ownerId !== session.user.id) {
      throw new Error("Forbidden");
    }

    const updated = await prisma.review.update({ where: { id: data.reviewId }, data: { ownerReply: data.reply } });

    await prisma.activityLog.create({
      data: {
        id: crypto.randomUUID(),
        userId: session.user.id,
        action: "create_owner_reply",
        detail: `Replied to review ${data.reviewId}`,
      },
    });

    return updated;
  });

export const deleteEstablishment = createServerFn({ method: "POST" })
  .inputValidator((d: { establishmentId: string }) => d)
  .handler(async ({ data }) => {
    const session = await requireRole(["admin"]);
    const est = await prisma.establishment.findUnique({ where: { id: data.establishmentId } });
    if (!est) {
      throw new Error("Establishment not found");
    }

    await prisma.establishment.delete({ where: { id: data.establishmentId } });

    await prisma.activityLog.create({
      data: {
        id: crypto.randomUUID(),
        userId: session.user.id,
        action: "delete_establishment",
        detail: `Deleted establishment "${est.name}"`,
      },
    });
  });

export const updateEstablishment = createServerFn({ method: "POST" })
  .inputValidator(
    (d: {
      establishmentId: string;
      name?: string;
      category?: string;
      description?: string;
      address?: string;
      ownerId?: string;
    }) => d,
  )
  .handler(async ({ data }) => {
    const session = await requireRole(["admin"]);
    const { establishmentId, ...updates } = data;
    const updated = await prisma.establishment.update({ where: { id: establishmentId }, data: updates });

    await prisma.activityLog.create({
      data: {
        id: crypto.randomUUID(),
        userId: session.user.id,
        action: "update_establishment",
        detail: `Updated establishment "${updated.name}"`,
      },
    });

    return updated;
  });

export const toggleHelpful = createServerFn({ method: "POST" })
  .inputValidator((d: { reviewId: string }) => d)
  .handler(async ({ data }) => {
    const session = await requireSession();
    try {
      const existing = await prisma.helpfulVote.findFirst({
        where: { userId: session.user.id, reviewId: data.reviewId },
      });

      if (existing) {
        await prisma.helpfulVote.delete({ where: { id: existing.id } });
        await prisma.review.update({ where: { id: data.reviewId }, data: { helpful: { decrement: 1 } } });
        return { helpful: false };
      }

      await prisma.helpfulVote.create({
        data: { id: crypto.randomUUID(), userId: session.user.id, reviewId: data.reviewId },
      });
      await prisma.review.update({ where: { id: data.reviewId }, data: { helpful: { increment: 1 } } });
      return { helpful: true };
    } catch (error) {
      await logError("Error toggling helpful vote", "establishments");
      throw error;
    }
  });
