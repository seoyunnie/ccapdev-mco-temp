import { createServerFn } from "@tanstack/react-start";

import { prisma } from "../db.ts";
import { requireRole, requireSession } from "./auth.ts";
import { assertSeatAvailable, parseReservationWindow } from "./reservation-availability.ts";
import { buildSeatLabelMap } from "./utils.ts";

export const getMyReservations = createServerFn({ method: "GET" }).handler(async () => {
  const session = await requireSession();
  const rows = await prisma.reservation.findMany({
    where: { userId: session.user.id },
    include: { zone: { include: { seats: { select: { id: true, label: true } } } }, seat: true },
    orderBy: { date: "desc" },
  });
  return rows.map((r) => {
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
  });
});

export const getAllReservations = createServerFn({ method: "GET" }).handler(async () => {
  await requireRole(["concierge", "admin"]);
  const rows = await prisma.reservation.findMany({
    include: { zone: { include: { seats: { select: { id: true, label: true } } } }, seat: true, user: true },
    orderBy: { date: "desc" },
  });
  return rows.map((r) => {
    const seatLabelMap = buildSeatLabelMap(r.zone.seats);
    const displaySeatLabel = r.seat ? (seatLabelMap.get(r.seat.id) ?? r.seat.label) : null;
    return {
      id: r.id,
      student: r.studentName ?? (r.isAnonymous ? "Anonymous" : r.user.name),
      zone: displaySeatLabel == null ? r.zone.name : `${r.zone.name} – Seat ${displaySeatLabel}`,
      time: `${r.startTime.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })} – ${r.endTime.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`,
      status: r.status.charAt(0).toUpperCase() + r.status.slice(1),
    };
  });
});

export const createReservation = createServerFn({ method: "POST" })
  .inputValidator(
    (d: { zoneId: string; seatId: string; date: string; startTime: string; endTime: string; isAnonymous?: boolean }) =>
      d,
  )
  .handler(async ({ data }) => {
    const session = await requireSession();
    const window = parseReservationWindow(data);

    const reservation = await prisma.$transaction(async (tx) => {
      const seat = await tx.seat.findUnique({ where: { id: data.seatId } });
      if (!seat || seat.zoneId !== data.zoneId) {
        throw new Error("Seat not found in this zone");
      }

      await assertSeatAvailable({ zoneId: data.zoneId, seatId: data.seatId, window });

      return tx.reservation.create({
        data: {
          id: crypto.randomUUID(),
          userId: session.user.id,
          zoneId: data.zoneId,
          seatId: data.seatId,
          date: window.date,
          startTime: window.startTime,
          endTime: window.endTime,
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
    const reservation = await prisma.reservation.findUnique({ where: { id: data.reservationId } });
    if (!reservation) {
      throw new Error("Not found");
    }
    if (reservation.userId !== session.user.id && !["concierge", "admin"].includes(session.user.role as string)) {
      throw new Error("Forbidden");
    }

    await prisma.reservation.update({ where: { id: data.reservationId }, data: { status: "cancelled" } });

    await prisma.activityLog.create({
      data: {
        id: crypto.randomUUID(),
        userId: session.user.id,
        action: "cancel_reservation",
        detail: `Cancelled reservation ${data.reservationId}`,
      },
    });
  });

export const updateReservation = createServerFn({ method: "POST" })
  .inputValidator(
    (d: { reservationId: string; date: string; startTime: string; endTime: string; isAnonymous?: boolean }) => d,
  )
  .handler(async ({ data }) => {
    const session = await requireSession();
    const reservation = await prisma.reservation.findUnique({ where: { id: data.reservationId } });
    if (!reservation) {
      throw new Error("Reservation not found");
    }
    if (reservation.userId !== session.user.id && !["concierge", "admin"].includes(session.user.role as string)) {
      throw new Error("Forbidden");
    }

    const window = parseReservationWindow(data);

    if (reservation.seatId != null) {
      await assertSeatAvailable({
        zoneId: reservation.zoneId,
        seatId: reservation.seatId,
        window,
        excludeReservationId: reservation.id,
      });
    }

    const updated = await prisma.reservation.update({
      where: { id: data.reservationId },
      data: {
        date: window.date,
        startTime: window.startTime,
        endTime: window.endTime,
        isAnonymous: data.isAnonymous ?? reservation.isAnonymous,
      },
    });

    await prisma.activityLog.create({
      data: {
        id: crypto.randomUUID(),
        userId: session.user.id,
        action: "update_reservation",
        detail: `Updated reservation ${data.reservationId}`,
      },
    });

    return updated;
  });

export const purgeExpiredReservations = createServerFn({ method: "POST" }).handler(async () => {
  const session = await requireRole(["concierge", "admin"]);

  const now = new Date();
  const expired = await prisma.reservation.findMany({ where: { endTime: { lt: now }, status: { not: "cancelled" } } });

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
      seatId: string;
      date: string;
      startTime: string;
      endTime: string;
    }) => d,
  )
  .handler(async ({ data }) => {
    const session = await requireRole(["concierge", "admin"]);
    const window = parseReservationWindow(data);

    const seat = await prisma.seat.findUnique({ where: { id: data.seatId } });
    if (!seat || seat.zoneId !== data.zoneId) {
      throw new Error("Seat not found in this zone");
    }

    await assertSeatAvailable({ zoneId: data.zoneId, seatId: data.seatId, window });

    const reservation = await prisma.reservation.create({
      data: {
        id: crypto.randomUUID(),
        userId: session.user.id,
        zoneId: data.zoneId,
        seatId: data.seatId,
        date: window.date,
        startTime: window.startTime,
        endTime: window.endTime,
        status: "confirmed",
        isAnonymous: false,
        studentName: data.studentName,
        studentId: data.studentId,
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
