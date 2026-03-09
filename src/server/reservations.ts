import { createServerFn } from "@tanstack/react-start";

import { prisma } from "../db.ts";
import { requireRole, requireSession } from "./auth.ts";

export const getMyReservations = createServerFn({ method: "GET" }).handler(
  async () => {
    const session = await requireSession();
    const rows = await prisma.reservation.findMany({
      where: { userId: session.user.id },
      include: { zone: true, seat: true },
      orderBy: { date: "desc" },
    });
    return rows.map((r) => ({
      id: r.id,
      zone: r.seat
        ? `${r.zone.name} – Seat ${r.seat.label}`
        : r.zone.name,
      date: r.date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      time: `${r.startTime.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })} – ${r.endTime.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`,
      status: r.status.charAt(0).toUpperCase() + r.status.slice(1),
    }));
  },
);

export const getAllReservations = createServerFn({ method: "GET" }).handler(
  async () => {
    await requireRole(["concierge", "admin"]);
    const rows = await prisma.reservation.findMany({
      include: { zone: true, seat: true, user: true },
      orderBy: { date: "desc" },
    });
    return rows.map((r) => ({
      id: r.id,
      student: r.isAnonymous ? "Anonymous" : r.user.name,
      zone: r.seat
        ? `${r.zone.name} – Seat ${r.seat.label}`
        : r.zone.name,
      time: `${r.startTime.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })} – ${r.endTime.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`,
      status: r.status.charAt(0).toUpperCase() + r.status.slice(1),
    }));
  },
);

export const createReservation = createServerFn({ method: "POST" })
  .inputValidator(
    (d: {
      zoneId: string;
      seatId?: string;
      date: string;
      startTime: string;
      endTime: string;
      isAnonymous?: boolean;
    }) => d,
  )
  .handler(async ({ data }) => {
    const session = await requireSession();

    const reservation = await prisma.$transaction(async (tx) => {
      if (data.seatId) {
        const seat = await tx.seat.findUnique({ where: { id: data.seatId } });
        if (!seat) throw new Error("Seat not found");
        if (seat.isTaken) throw new Error("Seat is already taken");
        await tx.seat.update({ where: { id: data.seatId }, data: { isTaken: true } });
      }

      return tx.reservation.create({
        data: {
          id: crypto.randomUUID(),
          userId: session.user.id,
          zoneId: data.zoneId,
          seatId: data.seatId,
          date: new Date(data.date),
          startTime: new Date(data.startTime),
          endTime: new Date(data.endTime),
          isAnonymous: data.isAnonymous ?? false,
          status: "confirmed",
        },
      });
    });

    await prisma.activityLog.create({
      data: {
        id: crypto.randomUUID(),
        userId: session.user.id,
        action: "create_reservation",
        detail: `Reserved in zone ${data.zoneId}`,
      },
    });

    return reservation;
  });

export const cancelReservation = createServerFn({ method: "POST" })
  .inputValidator((d: { reservationId: string }) => d)
  .handler(async ({ data }) => {
    const session = await requireSession();
    const reservation = await prisma.reservation.findUnique({
      where: { id: data.reservationId },
    });
    if (!reservation) throw new Error("Not found");
    if (
      reservation.userId !== session.user.id &&
      !["concierge", "admin"].includes(session.user.role as string)
    )
      throw new Error("Forbidden");

    await prisma.reservation.update({
      where: { id: data.reservationId },
      data: { status: "cancelled" },
    });

    if (reservation.seatId) {
      await prisma.seat.update({
        where: { id: reservation.seatId },
        data: { isTaken: false },
      });
    }

    await prisma.activityLog.create({
      data: {
        id: crypto.randomUUID(),
        userId: session.user.id,
        action: "cancel_reservation",
        detail: `Cancelled reservation ${data.reservationId}`,
      },
    });
  });

export const purgeExpiredReservations = createServerFn({
  method: "POST",
}).handler(async () => {
  const session = await requireSession();
  if (!["concierge", "admin"].includes(session.user.role as string))
    throw new Error("Forbidden");

  const now = new Date();
  const expired = await prisma.reservation.findMany({
    where: { endTime: { lt: now }, status: { not: "cancelled" } },
  });

  for (const r of expired) {
    if (r.seatId) {
      await prisma.seat.update({
        where: { id: r.seatId },
        data: { isTaken: false },
      });
    }
  }

  await prisma.reservation.updateMany({
    where: { endTime: { lt: now }, status: { not: "cancelled" } },
    data: { status: "cancelled" },
  });

  await prisma.activityLog.create({
    data: {
      id: crypto.randomUUID(),
      userId: session.user.id,
      action: "purge_expired",
      detail: `Purged ${expired.length} expired bookings`,
    },
  });

  return { purged: expired.length };
});

export const createWalkInReservation = createServerFn({ method: "POST" })
  .inputValidator(
    (d: {
      studentName: string;
      studentId: string;
      zoneId: string;
      startTime: string;
      endTime: string;
    }) => d,
  )
  .handler(async ({ data }) => {
    const session = await requireRole(["concierge", "admin"]);

    const reservation = await prisma.reservation.create({
      data: {
        id: crypto.randomUUID(),
        userId: session.user.id,
        zoneId: data.zoneId,
        date: new Date(),
        startTime: new Date(data.startTime),
        endTime: new Date(data.endTime),
        status: "confirmed",
        isAnonymous: false,
      },
    });

    await prisma.activityLog.create({
      data: {
        id: crypto.randomUUID(),
        userId: session.user.id,
        action: "walk_in_reservation",
        detail: `Walk-in booking for ${data.studentName} (${data.studentId})`,
      },
    });

    return reservation;
  });
