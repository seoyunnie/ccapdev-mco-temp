// Seed script — run with: pnpm prisma db seed
// Needs DATABASE_URL in .env to work

import { PrismaClient } from "../generated/prisma/client";

const prisma = new PrismaClient();

async function main(): Promise<void> {
  console.log("Seeding database...");

  // ── Users
  // Note: auth users are created via Better Auth signUp, but we can
  // insert directly for dev/test purposes. Passwords would need to be
  // hashed by Better Auth. These are for TESTING relations ONLY !!!

  const admin = await prisma.user.upsert({
    where: { email: "admin@adormable.com" },
    update: {},
    create: {
      id: "user-admin",
      name: "Admin Kuromi",
      email: "admin@adormable.com",
      role: "admin",
      emailVerified: true,
    },
  });

  const concierge = await prisma.user.upsert({
    where: { email: "concierge@adormable.com" },
    update: {},
    create: {
      id: "user-concierge",
      name: "Concierge My Melody",
      email: "concierge@adormable.com",
      role: "concierge",
      emailVerified: true,
    },
  });

  const resident = await prisma.user.upsert({
    where: { email: "resident@adormable.com" },
    update: {},
    create: {
      id: "user-resident",
      name: "Juan Dela Cruz",
      email: "resident@adormable.com",
      role: "resident",
      emailVerified: true,
    },
  });

  const resident2 = await prisma.user.upsert({
    where: { email: "resident2@adormable.com" },
    update: {},
    create: {
      id: "user-resident2",
      name: "Maria Santos",
      email: "resident2@adormable.com",
      role: "resident",
      emailVerified: true,
    },
  });

  // Study Zones nd Seats

  const quietRoom = await prisma.studyZone.upsert({
    where: { id: "zone-quiet" },
    update: {},
    create: { id: "zone-quiet", name: "Quiet Room A", capacity: 10, image: null },
  });

  const mainHall = await prisma.studyZone.upsert({
    where: { id: "zone-main" },
    update: {},
    create: { id: "zone-main", name: "Main Hall", capacity: 30, image: null },
  });

  await prisma.studyZone.upsert({
    where: { id: "zone-group" },
    update: {},
    create: { id: "zone-group", name: "Group Study Room B", capacity: 8, image: null },
  });

  // Seats for Quiet Room
  const seatLabels = ["A1", "A2", "A3", "A4", "A5", "B1", "B2", "B3", "B4", "B5"];
  for (const label of seatLabels) {
    await prisma.seat.upsert({
      where: { id: `seat-quiet-${label}` },
      update: {},
      create: { id: `seat-quiet-${label}`, zoneId: quietRoom.id, label },
    });
  }

  // Seats for Main Hall
  for (let i = 1; i <= 12; i++) {
    await prisma.seat.upsert({
      where: { id: `seat-main-${i}` },
      update: {},
      create: { id: `seat-main-${i}`, zoneId: mainHall.id, label: `${i}` },
    });
  }

  // Reservations

  await prisma.reservation.upsert({
    where: { id: "res-1" },
    update: {},
    create: {
      id: "res-1",
      userId: resident.id,
      zoneId: quietRoom.id,
      seatId: "seat-quiet-A1",
      date: new Date("2026-03-10"),
      startTime: new Date("2026-03-10T14:00:00Z"),
      endTime: new Date("2026-03-10T16:00:00Z"),
      status: "confirmed",
    },
  });

  await prisma.reservation.upsert({
    where: { id: "res-2" },
    update: {},
    create: {
      id: "res-2",
      userId: resident.id,
      zoneId: mainHall.id,
      seatId: "seat-main-12",
      date: new Date("2026-03-12"),
      startTime: new Date("2026-03-12T10:00:00Z"),
      endTime: new Date("2026-03-12T12:00:00Z"),
      status: "pending",
    },
  });

  // Establishments/ Reviews

  const cafe = await prisma.establishment.upsert({
    where: { id: "est-cafe" },
    update: {},
    create: {
      id: "est-cafe",
      name: "Moonlight Café",
      category: "Café",
      description: "Cozy café with great coffee, right beside the dorm.",
      ownerId: admin.id,
      status: "active",
    },
  });

  const laundry = await prisma.establishment.upsert({
    where: { id: "est-laundry" },
    update: {},
    create: {
      id: "est-laundry",
      name: "QuickWash Laundry",
      category: "Service",
      description: "24/7 self-service laundry. Affordable rates.",
      ownerId: concierge.id,
      status: "active",
    },
  });

  await prisma.review.upsert({
    where: { id: "review-1" },
    update: {},
    create: {
      id: "review-1",
      establishmentId: cafe.id,
      authorId: resident.id,
      rating: 5,
      content: "Best matcha latte near the dorm! Super cozy vibes.",
      images: [],
    },
  });

  await prisma.review.upsert({
    where: { id: "review-2" },
    update: {},
    create: {
      id: "review-2",
      establishmentId: laundry.id,
      authorId: resident2.id,
      rating: 4,
      content: "Convenient and affordable. Wish they had more dryers though.",
      images: [],
    },
  });

  // Threads + Comments

  const thread1 = await prisma.thread.upsert({
    where: { id: "thread-1" },
    update: {},
    create: {
      id: "thread-1",
      title: "Best quiet hours study spots?",
      authorId: resident.id,
      content: "Looking for recommendations on the quietest zones during exam week. Where do you guys usually go?",
      tag: "study",
      upvotes: 3,
    },
  });

  const thread2 = await prisma.thread.upsert({
    where: { id: "thread-2" },
    update: {},
    create: {
      id: "thread-2",
      title: "Dorm WiFi has been terrible lately",
      authorId: resident2.id,
      content:
        "Is anyone else experiencing slow internet? It's been really bad this past week especially on the 3rd floor.",
      tag: "general",
      upvotes: 7,
    },
  });

  await prisma.comment.upsert({
    where: { id: "comment-1" },
    update: {},
    create: {
      id: "comment-1",
      threadId: thread1.id,
      authorId: resident2.id,
      content: "Quiet Room A is the best during exam week. Get there early though!",
      upvotes: 2,
    },
  });

  await prisma.comment.upsert({
    where: { id: "comment-2" },
    update: {},
    create: {
      id: "comment-2",
      threadId: thread2.id,
      authorId: concierge.id,
      content: "We've reported this to maintenance. Should be fixed by Friday.",
      upvotes: 5,
    },
  });

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
