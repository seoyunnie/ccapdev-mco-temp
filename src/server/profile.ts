import { createServerFn } from "@tanstack/react-start";

import { prisma } from "../db.ts";
import { requireSession } from "./auth.ts";
import { categorizeAction } from "./utils.ts";

export const getUserProfile = createServerFn({ method: "GET" }).handler(async () => {
  const session = await requireSession();
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) {
    throw new Error("User not found");
  }

  const reservations = await prisma.reservation.findMany({
    where: { userId: user.id, status: { not: "cancelled" } },
    include: { zone: true, seat: true },
    orderBy: { date: "desc" },
    take: 10,
  });

  const logs = await prisma.activityLog.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return {
    name: user.name,
    email: user.email,
    bio: user.bio ?? "",
    image: user.image,
    reservations: reservations.map((r) => ({
      id: r.id,
      zone: r.seat ? `${r.zone.name} – Seat ${r.seat.label}` : r.zone.name,
      date: r.date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      time: `${r.startTime.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })} – ${r.endTime.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`,
      status: r.status.charAt(0).toUpperCase() + r.status.slice(1),
    })),
    activityHistory: logs.map((l) => ({
      id: l.id,
      action: l.detail ?? l.action,
      date: l.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      type: categorizeAction(l.action),
    })),
  };
});

const MAX_IMAGE_BYTES = 2_000_000;

export const uploadProfilePhoto = createServerFn({ method: "POST" })
  .inputValidator((d: { image: string }) => {
    if (!d.image.startsWith("data:image/")) {
      throw new Error("Invalid image data");
    }
    if (d.image.length > MAX_IMAGE_BYTES) {
      throw new Error("Image must be under 1.5 MB");
    }
    return d;
  })
  .handler(async ({ data }) => {
    const session = await requireSession();
    await prisma.user.update({ where: { id: session.user.id }, data: { image: data.image } });

    await prisma.activityLog.create({
      data: {
        id: crypto.randomUUID(),
        userId: session.user.id,
        action: "update_profile_photo",
        detail: "Updated profile photo",
      },
    });
  });

export const updateProfile = createServerFn({ method: "POST" })
  .inputValidator((d: { name: string; bio: string }) => d)
  .handler(async ({ data }) => {
    const session = await requireSession();
    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data: { name: data.name, bio: data.bio },
    });

    await prisma.activityLog.create({
      data: { id: crypto.randomUUID(), userId: session.user.id, action: "update_profile", detail: `Updated profile` },
    });

    return updated;
  });

export const deleteAccount = createServerFn({ method: "POST" }).handler(async () => {
  const session = await requireSession();

  await prisma.activityLog.create({
    data: {
      id: crypto.randomUUID(),
      userId: session.user.id,
      action: "delete_account",
      detail: `User ${session.user.email} deleted their account`,
    },
  });

  await prisma.user.delete({ where: { id: session.user.id } });
});
