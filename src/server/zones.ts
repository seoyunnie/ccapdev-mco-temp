import { createServerFn } from "@tanstack/react-start";

import { prisma } from "../db.ts";
import { requireRole } from "./auth.ts";
import { getOccupiedSeatIdsForWindow, parseReservationWindow } from "./reservation-availability.ts";
import { normalizeSeatEntries } from "./utils.ts";

const MAX_ZONE_CAPACITY = 500;

export const getZones = createServerFn({ method: "GET" }).handler(async () => {
  const zones = await prisma.studyZone.findMany({
    include: { _count: { select: { seats: true } }, seats: true },
    orderBy: { name: "asc" },
  });
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const currentWindow = parseReservationWindow({
    date: `${today}T00:00:00.000Z`,
    startTime: now.toISOString(),
    endTime: new Date(now.getTime() + 1).toISOString(),
  });
  const occupiedByZone = new Map<string, Set<string>>(
    await Promise.all(
      zones.map(async (zone) => [zone.id, await getOccupiedSeatIdsForWindow(zone.id, currentWindow)] as const),
    ),
  );

  return zones.map((z) => {
    const occupiedSeatIds = occupiedByZone.get(z.id) ?? new Set<string>();
    const available = z.seats.filter((s) => !occupiedSeatIds.has(s.id)).length;
    const { capacity } = z;
    return {
      id: z.id,
      name: z.name,
      image: z.image,
      capacity,
      available,
      status: available === 0 ? "Full" : ("Open" as "Full" | "Open"),
    };
  });
});

export const getZone = createServerFn({ method: "GET" })
  .inputValidator((d: { zoneId: string; date?: string; startTime?: string; endTime?: string }) => d)
  .handler(async ({ data }) => {
    const zone = await prisma.studyZone.findUnique({
      where: { id: data.zoneId },
      include: { seats: { orderBy: { label: "asc" } } },
    });
    if (!zone) {
      throw new Error("Zone not found");
    }

    const normalizedSeats = normalizeSeatEntries(zone.seats);
    const window =
      data.date != null && data.startTime != null && data.endTime != null
        ? parseReservationWindow({ date: data.date, startTime: data.startTime, endTime: data.endTime })
        : null;
    const occupiedSeatIds = window == null ? new Set<string>() : await getOccupiedSeatIdsForWindow(zone.id, window);

    return {
      id: zone.id,
      name: zone.name,
      image: zone.image,
      capacity: zone.capacity,
      available: zone.seats.length - occupiedSeatIds.size,
      seats: normalizedSeats.map((s) => ({
        id: s.id,
        label: s.displayLabel,
        rowLabel: s.rowLabel,
        seatNumberLabel: s.seatNumberLabel,
        taken: occupiedSeatIds.has(s.id),
      })),
    };
  });

export const getZonesForAdmin = createServerFn({ method: "GET" }).handler(async () => {
  await requireRole(["admin"]);
  const zones = await prisma.studyZone.findMany({
    include: { _count: { select: { seats: true, reservations: true } }, seats: true },
    orderBy: { name: "asc" },
  });
  return zones.map((z) => ({
    id: z.id,
    name: z.name,
    capacity: z.capacity,
    seatCount: z._count.seats,
    reservations: z._count.reservations,
    hasImage: z.image != null,
    image: z.image,
    seatLabels: z.seats.map((seat) => seat.label),
  }));
});

const MAX_IMAGE_BYTES = 2_000_000;

export const createZone = createServerFn({ method: "POST" })
  .inputValidator((d: { name: string; capacity: number; image?: string; seatLabels?: string[] }) => {
    if (!d.name.trim()) {
      throw new Error("Zone name is required");
    }
    if (d.capacity < 1 || d.capacity > MAX_ZONE_CAPACITY) {
      throw new Error("Capacity must be 1–500");
    }
    if (d.image != null) {
      if (!d.image.startsWith("data:image/")) {
        throw new Error("Invalid image data");
      }
      if (d.image.length > MAX_IMAGE_BYTES) {
        throw new Error("Image must be under 2 MB");
      }
    }
    return d;
  })
  .handler(async ({ data }) => {
    const session = await requireRole(["admin"]);
    const zoneId = crypto.randomUUID();

    const zone = await prisma.studyZone.create({
      data: { id: zoneId, name: data.name.trim(), capacity: data.capacity, image: data.image ?? null },
    });

    if (data.seatLabels && data.seatLabels.length > 0) {
      await prisma.seat.createMany({
        data: data.seatLabels.map((label) => ({ id: crypto.randomUUID(), zoneId, label: label.trim() })),
      });
    }

    await prisma.activityLog.create({
      data: {
        id: crypto.randomUUID(),
        userId: session.user.id,
        action: "create_zone",
        detail: `Created study zone "${data.name}"`,
      },
    });

    return zone;
  });

export const updateZone = createServerFn({ method: "POST" })
  .inputValidator(
    (d: { zoneId: string; name?: string; capacity?: number; image?: string | null; seatLabels?: string[] }) => {
      if (d.name != null && !d.name.trim()) {
        throw new Error("Zone name cannot be empty");
      }
      if (d.capacity != null && (d.capacity < 1 || d.capacity > MAX_ZONE_CAPACITY)) {
        throw new Error("Capacity must be 1–500");
      }
      if (d.image != null && d.image !== "") {
        if (!d.image.startsWith("data:image/")) {
          throw new Error("Invalid image data");
        }
        if (d.image.length > MAX_IMAGE_BYTES) {
          throw new Error("Image must be under 2 MB");
        }
      }
      return d;
    },
  )
  .handler(async ({ data }) => {
    const session = await requireRole(["admin"]);
    const { zoneId, seatLabels, ...updates } = data;

    // Handle image: empty string means remove
    const updateData: Record<string, unknown> = {};
    if (updates.name != null) {
      updateData.name = updates.name.trim();
    }
    if (updates.capacity != null) {
      updateData.capacity = updates.capacity;
    }
    if (updates.image === "") {
      updateData.image = null;
    } else if (updates.image != null) {
      updateData.image = updates.image;
    }

    const zone = await prisma.studyZone.update({ where: { id: zoneId }, data: updateData });

    // Replace seats if new labels provided
    if (seatLabels != null) {
      await prisma.seat.deleteMany({ where: { zoneId, reservations: { none: { status: { not: "cancelled" } } } } });
      const existingSeats = await prisma.seat.findMany({ where: { zoneId }, select: { label: true } });
      const existingLabels = new Set(existingSeats.map((seat) => seat.label));
      const newLabels = seatLabels.filter((l) => !existingLabels.has(l.trim()));
      if (newLabels.length > 0) {
        await prisma.seat.createMany({
          data: newLabels.map((label) => ({ id: crypto.randomUUID(), zoneId, label: label.trim() })),
        });
      }
    }

    await prisma.activityLog.create({
      data: {
        id: crypto.randomUUID(),
        userId: session.user.id,
        action: "update_zone",
        detail: `Updated study zone "${zone.name}"`,
      },
    });

    return zone;
  });

export const deleteZone = createServerFn({ method: "POST" })
  .inputValidator((d: { zoneId: string }) => d)
  .handler(async ({ data }) => {
    const session = await requireRole(["admin"]);
    const zone = await prisma.studyZone.findUnique({ where: { id: data.zoneId } });
    if (!zone) {
      throw new Error("Zone not found");
    }

    await prisma.studyZone.delete({ where: { id: data.zoneId } });

    await prisma.activityLog.create({
      data: {
        id: crypto.randomUUID(),
        userId: session.user.id,
        action: "delete_zone",
        detail: `Deleted study zone "${zone.name}"`,
      },
    });
  });
