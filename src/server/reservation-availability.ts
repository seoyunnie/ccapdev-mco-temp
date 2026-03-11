import { prisma } from "../db.ts";

interface ReservationWindowInput {
  readonly date: string;
  readonly startTime: string;
  readonly endTime: string;
}

export interface ReservationWindow {
  readonly date: Date;
  readonly dayStart: Date;
  readonly dayEnd: Date;
  readonly startTime: Date;
  readonly endTime: Date;
}

export function parseReservationWindow(input: ReservationWindowInput): ReservationWindow {
  const date = new Date(input.date);
  const startTime = new Date(input.startTime);
  const endTime = new Date(input.endTime);

  if ([date, startTime, endTime].some((value) => Number.isNaN(value.getTime()))) {
    throw new Error("Invalid reservation date or time");
  }

  if (endTime <= startTime) {
    throw new Error("End time must be after start time");
  }

  const dayStart = new Date(date);
  dayStart.setUTCHours(0, 0, 0, 0);
  const dayEnd = new Date(dayStart);
  dayEnd.setUTCDate(dayEnd.getUTCDate() + 1);

  return { date, dayStart, dayEnd, startTime, endTime };
}

export async function getOccupiedSeatIdsForWindow(zoneId: string, window: ReservationWindow): Promise<Set<string>> {
  const overlappingReservations = await prisma.reservation.findMany({
    where: {
      zoneId,
      seatId: { not: null },
      status: { not: "cancelled" },
      date: { gte: window.dayStart, lt: window.dayEnd },
      startTime: { lt: window.endTime },
      endTime: { gt: window.startTime },
    },
    select: { seatId: true },
  });

  return new Set(
    overlappingReservations
      .map((reservation) => reservation.seatId)
      .filter((seatId): seatId is string => seatId != null),
  );
}

export async function assertSeatAvailable(input: {
  readonly zoneId: string;
  readonly seatId: string;
  readonly window: ReservationWindow;
  readonly excludeReservationId?: string;
}): Promise<void> {
  const conflictingReservation = await prisma.reservation.findFirst({
    where: {
      zoneId: input.zoneId,
      seatId: input.seatId,
      status: { not: "cancelled" },
      id: input.excludeReservationId == null ? undefined : { not: input.excludeReservationId },
      date: { gte: input.window.dayStart, lt: input.window.dayEnd },
      startTime: { lt: input.window.endTime },
      endTime: { gt: input.window.startTime },
    },
    select: { id: true },
  });

  if (conflictingReservation) {
    throw new Error("Seat is already reserved for that time window");
  }
}
