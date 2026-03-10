import { createServerFn } from "@tanstack/react-start";

import { prisma } from "../db.ts";

export const getZones = createServerFn({ method: "GET" }).handler(async () => {
  const zones = await prisma.studyZone.findMany({
    include: { _count: { select: { seats: true } }, seats: true },
    orderBy: { name: "asc" },
  });
  return zones.map((z) => {
    const available = z.seats.filter((s) => !s.isTaken).length;
    const { capacity } = z;
    return {
      id: z.id,
      name: z.name,
      capacity,
      available,
      status: available === 0 ? "Full" : ("Open" as "Full" | "Open"),
    };
  });
});

export const getZone = createServerFn({ method: "GET" })
  .inputValidator((d: { zoneId: string }) => d)
  .handler(async ({ data }) => {
    const zone = await prisma.studyZone.findUnique({
      where: { id: data.zoneId },
      include: { seats: { orderBy: { label: "asc" } } },
    });
    if (!zone) {
      throw new Error("Zone not found");
    }

    return {
      id: zone.id,
      name: zone.name,
      capacity: zone.capacity,
      seats: zone.seats.map((s) => ({ id: s.id, label: s.label, taken: s.isTaken })),
    };
  });
