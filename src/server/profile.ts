import { createServerFn } from "@tanstack/react-start";

import { prisma } from "../db.ts";
import { requireSession } from "./auth.ts";
import { buildSeatLabelMap, categorizeAction, sanitize } from "./utils.ts";

export const getUserProfile = createServerFn({ method: "GET" }).handler(async () => {
  const session = await requireSession();
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) {
    throw new Error("User not found");
  }

  const reservations = await prisma.reservation.findMany({
    where: { userId: user.id, status: { not: "cancelled" } },
    include: { zone: { include: { seats: { select: { id: true, label: true } } } }, seat: true },
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
    reservations: reservations.map((r) => {
      const seatLabelMap = buildSeatLabelMap(r.zone.seats);
      const displaySeatLabel = r.seat ? (seatLabelMap.get(r.seat.id) ?? r.seat.label) : null;
      return {
        id: r.id,
        zone: displaySeatLabel == null ? r.zone.name : `${r.zone.name} – Seat ${displaySeatLabel}`,
        date: r.date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        time: `${r.startTime.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })} – ${r.endTime.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`,
        status: r.status.charAt(0).toUpperCase() + r.status.slice(1),
        dateValue: r.date.toISOString().slice(0, 10),
        startTimeValue: r.startTime.toISOString(),
        endTimeValue: r.endTime.toISOString(),
        isAnonymous: r.isAnonymous,
        zoneId: r.zoneId,
        seatId: r.seatId,
        seatLabel: displaySeatLabel,
      };
    }),
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
      throw new Error("Image must be under 2 MB");
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
  .inputValidator((d: { name: string; bio: string }) => {
    if (!d.name.trim()) {
      throw new Error("Name is required");
    }
    return { name: sanitize(d.name), bio: sanitize(d.bio) };
  })
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
