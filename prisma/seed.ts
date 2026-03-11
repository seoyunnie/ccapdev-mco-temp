// Seed script — run with: pnpm prisma db seed
// Needs DATABASE_URL in .env to work
// Wipes existing data and creates a fully-furnished demo database.
/* oxlint-disable no-magic-numbers */

import { PrismaClient } from "../generated/prisma/client";
import { normalizeEstablishmentCategory } from "../src/features/guide/guide.taxonomy.ts";
import { normalizeThreadTag } from "../src/features/lobby/lobby.taxonomy.ts";

const prisma = new PrismaClient();

// ── Helpers ────────────────────────────────────────────────
function daysAgo(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
}

function hoursFromNow(hours: number): Date {
  const d = new Date();
  d.setHours(d.getHours() + hours);
  return d;
}

function todayAt(hour: number, minute = 0): Date {
  const d = new Date();
  d.setHours(hour, minute, 0, 0);
  return d;
}

async function main(): Promise<void> {
  console.log("🧹 Wiping existing data...");
  // Delete in dependency order
  await prisma.helpfulVote.deleteMany();
  await prisma.vote.deleteMany();
  await prisma.report.deleteMany();
  // Delete replies before top-level comments (self-referential relation)
  await prisma.comment.deleteMany({ where: { parentId: { not: null } } });
  await prisma.comment.deleteMany();
  await prisma.thread.deleteMany();
  await prisma.review.deleteMany();
  await prisma.reservation.deleteMany();
  await prisma.seat.deleteMany();
  await prisma.studyZone.deleteMany();
  await prisma.establishment.deleteMany();
  await prisma.banAppeal.deleteMany();
  await prisma.ban.deleteMany();
  await prisma.activityLog.deleteMany();
  await prisma.errorLog.deleteMany();
  // Don't delete users/sessions/accounts — those are managed by Better Auth sign-up.
  // We upsert seed users below so dev accounts created via the UI survive re-seeding.

  console.log("🌱 Seeding database...");

  // ═══════════════════════════════════════════════════════════
  // USERS (for seeding relations only — real auth accounts via sign-up)
  // ═══════════════════════════════════════════════════════════
  const admin = await prisma.user.upsert({
    where: { email: "admin@adormable.com" },
    update: {},
    create: {
      id: "user-admin",
      name: "Admin Kuromi",
      email: "admin@adormable.com",
      role: "admin",
      emailVerified: true,
      bio: "System administrator. Keeping things in order since day one.",
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
      bio: "Your friendly dorm concierge! Ask me anything about the facilities.",
    },
  });

  const resident1 = await prisma.user.upsert({
    where: { email: "juan@adormable.com" },
    update: {},
    create: {
      id: "user-juan",
      name: "Juan Dela Cruz",
      email: "juan@adormable.com",
      role: "resident",
      emailVerified: true,
      bio: "3rd year CS student. Coffee addict. ☕",
    },
  });

  const resident2 = await prisma.user.upsert({
    where: { email: "maria@adormable.com" },
    update: {},
    create: {
      id: "user-maria",
      name: "Maria Santos",
      email: "maria@adormable.com",
      role: "resident",
      emailVerified: true,
      bio: "Nursing student and part-time bookworm.",
    },
  });

  const resident3 = await prisma.user.upsert({
    where: { email: "carlo@adormable.com" },
    update: {},
    create: {
      id: "user-carlo",
      name: "Carlo Reyes",
      email: "carlo@adormable.com",
      role: "resident",
      emailVerified: true,
      bio: "Engineering student. Always in the study room.",
    },
  });

  const resident4 = await prisma.user.upsert({
    where: { email: "amanda@adormable.com" },
    update: {},
    create: {
      id: "user-amanda",
      name: "Amanda Lim",
      email: "amanda@adormable.com",
      role: "resident",
      emailVerified: true,
      bio: "Art major. Love exploring local food spots!",
    },
  });

  const resident5 = await prisma.user.upsert({
    where: { email: "kenzo@adormable.com" },
    update: {},
    create: {
      id: "user-kenzo",
      name: "Kenzo Tanaka",
      email: "kenzo@adormable.com",
      role: "resident",
      emailVerified: true,
      bio: "Exchange student from Tokyo. Trying to survive Filipino heat. 🥵",
    },
  });

  const resident6 = await prisma.user.upsert({
    where: { email: "bea@adormable.com" },
    update: {},
    create: {
      id: "user-bea",
      name: "Bea Garcia",
      email: "bea@adormable.com",
      role: "resident",
      emailVerified: true,
      bio: "Pre-law student. Moot court champion. 📚",
    },
  });

  const guest1 = await prisma.user.upsert({
    where: { email: "guest@adormable.com" },
    update: {},
    create: { id: "user-guest", name: "New Guest", email: "guest@adormable.com", role: "guest", emailVerified: true },
  });

  // ═══════════════════════════════════════════════════════════
  // STUDY ZONES & SEATS
  // ═══════════════════════════════════════════════════════════
  const quietRoom = await prisma.studyZone.create({ data: { id: "zone-quiet", name: "Quiet Room A", capacity: 10 } });
  const mainHall = await prisma.studyZone.create({ data: { id: "zone-main", name: "Main Hall", capacity: 30 } });
  const groupRoom = await prisma.studyZone.create({
    data: { id: "zone-group", name: "Group Study Room B", capacity: 8 },
  });
  const computerLab = await prisma.studyZone.create({
    data: { id: "zone-computer", name: "Computer Lab", capacity: 20 },
  });
  const rooftopLounge = await prisma.studyZone.create({
    data: { id: "zone-rooftop", name: "Rooftop Lounge", capacity: 15 },
  });

  // Seats for Quiet Room (A1–B5)
  const quietLabels = ["A1", "A2", "A3", "A4", "A5", "B1", "B2", "B3", "B4", "B5"];
  await prisma.seat.createMany({
    data: quietLabels.map((label) => ({ id: `seat-quiet-${label}`, zoneId: quietRoom.id, label })),
  });

  // Seats for Main Hall (1–20)
  await prisma.seat.createMany({
    data: Array.from({ length: 20 }, (_, i) => ({ id: `seat-main-${i + 1}`, zoneId: mainHall.id, label: `${i + 1}` })),
  });

  // Seats for Group Room (G1–G8)
  await prisma.seat.createMany({
    data: Array.from({ length: 8 }, (_, i) => ({
      id: `seat-group-G${i + 1}`,
      zoneId: groupRoom.id,
      label: `G${i + 1}`,
    })),
  });

  // Seats for Computer Lab (PC1–PC20)
  await prisma.seat.createMany({
    data: Array.from({ length: 20 }, (_, i) => ({
      id: `seat-pc-${i + 1}`,
      zoneId: computerLab.id,
      label: `PC${i + 1}`,
    })),
  });

  // Seats for Rooftop Lounge (R1–R10)
  await prisma.seat.createMany({
    data: Array.from({ length: 10 }, (_, i) => ({
      id: `seat-roof-R${i + 1}`,
      zoneId: rooftopLounge.id,
      label: `R${i + 1}`,
    })),
  });

  // ═══════════════════════════════════════════════════════════
  // RESERVATIONS
  // ═══════════════════════════════════════════════════════════
  const reservations = [
    {
      id: "res-1",
      userId: resident1.id,
      zoneId: quietRoom.id,
      seatId: "seat-quiet-A1",
      date: new Date(),
      startTime: todayAt(14),
      endTime: todayAt(16),
      status: "confirmed",
    },
    {
      id: "res-2",
      userId: resident1.id,
      zoneId: mainHall.id,
      seatId: "seat-main-5",
      date: new Date(),
      startTime: todayAt(10),
      endTime: todayAt(12),
      status: "confirmed",
    },
    {
      id: "res-3",
      userId: resident2.id,
      zoneId: quietRoom.id,
      seatId: "seat-quiet-B2",
      date: new Date(),
      startTime: todayAt(9),
      endTime: todayAt(11),
      status: "confirmed",
    },
    {
      id: "res-4",
      userId: resident3.id,
      zoneId: computerLab.id,
      seatId: "seat-pc-3",
      date: new Date(),
      startTime: todayAt(13),
      endTime: todayAt(17),
      status: "confirmed",
    },
    {
      id: "res-5",
      userId: resident4.id,
      zoneId: rooftopLounge.id,
      seatId: "seat-roof-R1",
      date: new Date(),
      startTime: todayAt(15),
      endTime: todayAt(18),
      status: "pending",
    },
    {
      id: "res-6",
      userId: resident5.id,
      zoneId: groupRoom.id,
      seatId: "seat-group-G1",
      date: daysAgo(1),
      startTime: daysAgo(1),
      endTime: daysAgo(1),
      status: "cancelled",
    },
    {
      id: "res-7",
      userId: resident6.id,
      zoneId: mainHall.id,
      seatId: "seat-main-12",
      date: daysAgo(2),
      startTime: daysAgo(2),
      endTime: daysAgo(2),
      status: "confirmed",
    },
    {
      id: "res-8",
      userId: resident2.id,
      zoneId: computerLab.id,
      seatId: "seat-pc-10",
      date: new Date(),
      startTime: hoursFromNow(1),
      endTime: hoursFromNow(3),
      status: "pending",
    },
  ];
  await Promise.all(
    reservations.map((reservation) => prisma.reservation.create({ data: { ...reservation, isAnonymous: false } })),
  );

  // ═══════════════════════════════════════════════════════════
  // ESTABLISHMENTS
  // ═══════════════════════════════════════════════════════════
  const cafe = await prisma.establishment.create({
    data: {
      id: "est-cafe",
      name: "Moonlight Café",
      category: normalizeEstablishmentCategory("Coffee Shop"),
      description: "Cozy café with great coffee, right beside the dorm. Try their iced matcha latte!",
      address: "Unit 102, Dorm Building A",
      ownerId: admin.id,
      status: "active",
    },
  });

  const laundry = await prisma.establishment.create({
    data: {
      id: "est-laundry",
      name: "QuickWash Laundry",
      category: normalizeEstablishmentCategory("Services"),
      description: "24/7 self-service laundry. Drop off in the morning, pick up by afternoon.",
      address: "Ground Floor, Dorm Building B",
      ownerId: concierge.id,
      status: "active",
    },
  });

  const koreanBbq = await prisma.establishment.create({
    data: {
      id: "est-kbbq",
      name: "Seoul Grill House",
      category: normalizeEstablishmentCategory("Korean BBQ"),
      description: "Unlimited samgyeopsal with rice and banchan. Student-friendly prices!",
      address: "153 University Ave",
      ownerId: admin.id,
      status: "active",
    },
  });

  const filipinoFood = await prisma.establishment.create({
    data: {
      id: "est-jolly",
      name: "Lola's Kitchen",
      category: normalizeEstablishmentCategory("Filipino Food"),
      description: "Home-cooked Filipino meals. Best sinigang and adobo near campus.",
      address: "27 Rizal Street",
      ownerId: concierge.id,
      status: "active",
    },
  });

  const convenience = await prisma.establishment.create({
    data: {
      id: "est-7eleven",
      name: "Campus MiniStop",
      category: normalizeEstablishmentCategory("Convenience Store"),
      description: "Open 24 hours. Snacks, drinks, instant noodles, and basic supplies.",
      address: "Dorm Lobby",
      ownerId: admin.id,
      status: "active",
    },
  });

  const printShop = await prisma.establishment.create({
    data: {
      id: "est-print",
      name: "Print & Go",
      category: normalizeEstablishmentCategory("Study Spots"),
      description: "Printing, photocopying, binding, and scanning. Rush services available.",
      address: "2nd Floor, Student Center",
      ownerId: concierge.id,
      status: "active",
    },
  });

  const coffeeBrew = await prisma.establishment.create({
    data: {
      id: "est-brew",
      name: "The Brew Lab",
      category: normalizeEstablishmentCategory("Cafe & Coffee"),
      description: "Specialty pour-over and cold brew. Great for those late-night study sessions.",
      address: "88 Katipunan Ave",
      ownerId: admin.id,
      status: "active",
    },
  });

  await prisma.establishment.create({
    data: {
      id: "est-closed",
      name: "Old Campus Bookstore",
      category: normalizeEstablishmentCategory("Essentials"),
      description: "Temporarily closed for renovation.",
      address: "Main Gate, Building C",
      ownerId: admin.id,
      status: "closed",
    },
  });

  // ═══════════════════════════════════════════════════════════
  // REVIEWS
  // ═══════════════════════════════════════════════════════════
  const reviewsData = [
    {
      id: "review-1",
      estId: cafe.id,
      authorId: resident1.id,
      rating: 5,
      content: "Best matcha latte near the dorm! Super cozy vibes. The barista remembers my order every time.",
      helpful: 4,
    },
    {
      id: "review-2",
      estId: cafe.id,
      authorId: resident2.id,
      rating: 4,
      content: "Great coffee and ambiance. Gets a bit crowded during lunch though.",
      helpful: 2,
    },
    {
      id: "review-3",
      estId: cafe.id,
      authorId: resident4.id,
      rating: 5,
      content: "Their new pastries are amazing! Cinnamon roll is a must-try.",
      helpful: 1,
    },
    {
      id: "review-4",
      estId: laundry.id,
      authorId: resident2.id,
      rating: 4,
      content: "Convenient and affordable. Wish they had more dryers though.",
      helpful: 3,
    },
    {
      id: "review-5",
      estId: laundry.id,
      authorId: resident3.id,
      rating: 3,
      content: "Decent service but one of the machines was broken last week. Hope they fix it soon.",
      helpful: 1,
      ownerReply: "Thanks for letting us know! The machine has been repaired.",
    },
    {
      id: "review-6",
      estId: koreanBbq.id,
      authorId: resident1.id,
      rating: 5,
      content: "Unlimited samgyeopsal for 299?! Best deal near campus. The kimchi jjigae is also fire 🔥",
      helpful: 6,
    },
    {
      id: "review-7",
      estId: koreanBbq.id,
      authorId: resident5.id,
      rating: 5,
      content: "As a Korean exchange student, I can say this place is legit. Tastes like home!",
      helpful: 8,
    },
    {
      id: "review-8",
      estId: koreanBbq.id,
      authorId: resident4.id,
      rating: 4,
      content: "Really good food but wait times on weekends can be long. Go early!",
      helpful: 2,
    },
    {
      id: "review-9",
      estId: filipinoFood.id,
      authorId: resident3.id,
      rating: 5,
      content: "Lola's sinigang cured my homesickness. 10/10 comfort food.",
      helpful: 5,
    },
    {
      id: "review-10",
      estId: filipinoFood.id,
      authorId: resident6.id,
      rating: 4,
      content: "Generous servings and affordable combos. The kare-kare is amazing.",
      helpful: 3,
    },
    {
      id: "review-11",
      estId: convenience.id,
      authorId: resident1.id,
      rating: 3,
      content: "Convenient location but prices are a bit higher than outside stores.",
      helpful: 1,
    },
    {
      id: "review-12",
      estId: convenience.id,
      authorId: resident5.id,
      rating: 4,
      content: "Life saver at 2 AM when you need instant noodles for your all-nighter.",
      helpful: 2,
    },
    {
      id: "review-13",
      estId: printShop.id,
      authorId: resident6.id,
      rating: 4,
      content: "Fast printing and reasonable prices. Saved me before a deadline!",
      helpful: 3,
    },
    {
      id: "review-14",
      estId: printShop.id,
      authorId: resident2.id,
      rating: 5,
      content: "Best print quality near campus. They also do color printing!",
      helpful: 1,
    },
    {
      id: "review-15",
      estId: coffeeBrew.id,
      authorId: resident4.id,
      rating: 5,
      content:
        "The single-origin Ethiopian pour-over is incredible. This is the coffee shop for serious coffee lovers.",
      helpful: 4,
    },
    {
      id: "review-16",
      estId: coffeeBrew.id,
      authorId: resident3.id,
      rating: 4,
      content: "Pricier than Moonlight but the quality is noticeable. Cold brew is smooth.",
      helpful: 2,
    },
  ];

  await Promise.all(
    reviewsData.map((review) =>
      prisma.review.create({
        data: {
          id: review.id,
          establishmentId: review.estId,
          authorId: review.authorId,
          rating: review.rating,
          content: review.content,
          helpful: review.helpful,
          images: [],
          ownerReply: (review as { ownerReply?: string }).ownerReply ?? null,
          createdAt: daysAgo(Math.floor(Math.random() * 30) + 1),
        },
      }),
    ),
  );

  // Helpful votes (match the helpful counts above)
  const helpfulVotes = [
    { reviewId: "review-1", userIds: [resident2.id, resident3.id, resident4.id, resident5.id] },
    { reviewId: "review-2", userIds: [resident1.id, resident3.id] },
    {
      reviewId: "review-6",
      userIds: [resident2.id, resident3.id, resident4.id, resident5.id, resident6.id, concierge.id],
    },
    {
      reviewId: "review-7",
      userIds: [
        resident1.id,
        resident2.id,
        resident3.id,
        resident4.id,
        resident6.id,
        admin.id,
        concierge.id,
        resident1.id,
      ].slice(0, 8),
    },
    { reviewId: "review-9", userIds: [resident1.id, resident2.id, resident4.id, resident5.id, resident6.id] },
  ];
  await Promise.all(
    helpfulVotes.flatMap((helpfulVote) => {
      const uniqueUsers = [...new Set(helpfulVote.userIds)];
      return uniqueUsers.map((userId) =>
        prisma.helpfulVote.create({ data: { id: crypto.randomUUID(), userId, reviewId: helpfulVote.reviewId } }),
      );
    }),
  );

  // ═══════════════════════════════════════════════════════════
  // THREADS
  // ═══════════════════════════════════════════════════════════
  const thread1 = await prisma.thread.create({
    data: {
      id: "thread-1",
      title: "Best quiet hours study spots?",
      authorId: resident1.id,
      content:
        "Looking for recommendations on the quietest zones during exam week. Where do you guys usually go? Quiet Room A is always full...",
      tag: normalizeThreadTag("study"),
      upvotes: 12,
      createdAt: daysAgo(5),
    },
  });

  const thread2 = await prisma.thread.create({
    data: {
      id: "thread-2",
      title: "Dorm WiFi has been terrible lately",
      authorId: resident2.id,
      content:
        "Is anyone else experiencing slow internet? It's been really bad this past week especially on the 3rd floor. Can barely load lecture videos.",
      tag: normalizeThreadTag("issue"),
      upvotes: 18,
      createdAt: daysAgo(3),
    },
  });

  const thread3 = await prisma.thread.create({
    data: {
      id: "thread-3",
      title: "Looking for study group — Calculus 2",
      authorId: resident3.id,
      content:
        "Anyone taking Calc 2 this sem? I'm forming a study group. We can meet in Group Study Room B on Tuesdays and Thursdays. DM me if interested!",
      tag: normalizeThreadTag("discussion"),
      upvotes: 8,
      createdAt: daysAgo(7),
    },
  });

  const thread4 = await prisma.thread.create({
    data: {
      id: "thread-4",
      title: "Seoul Grill House — unlimited samgyeopsal review",
      authorId: resident5.id,
      content:
        "Just went to Seoul Grill House with friends and wow, the food is amazing for the price. Highly recommend going on weekdays to avoid the queue. The side dishes are unlimited too!",
      tag: normalizeThreadTag("discussion"),
      upvotes: 15,
      createdAt: daysAgo(2),
    },
  });

  const thread5 = await prisma.thread.create({
    data: {
      id: "thread-5",
      title: "Anyone know the laundry schedule this week?",
      authorId: resident4.id,
      content:
        "The QuickWash schedule poster is faded and I can't read it. Does anyone know the hours for this week? Also, is machine #3 fixed yet?",
      tag: normalizeThreadTag("issue"),
      upvotes: 3,
      createdAt: daysAgo(1),
    },
  });

  const thread6 = await prisma.thread.create({
    data: {
      id: "thread-6",
      title: "New coffee shop opened: The Brew Lab",
      authorId: resident4.id,
      content:
        "Has anyone tried The Brew Lab on Katipunan Ave? I heard they do specialty pour-overs. Wondering if it's worth the walk.",
      tag: normalizeThreadTag("discussion"),
      upvotes: 6,
      createdAt: daysAgo(4),
    },
  });

  const thread7 = await prisma.thread.create({
    data: {
      id: "thread-7",
      title: "Rooftop lounge hours extended!",
      authorId: concierge.id,
      content:
        "Good news everyone! The rooftop lounge will now be open until 11 PM on weekdays and midnight on weekends. Enjoy the study space!",
      tag: normalizeThreadTag("event"),
      upvotes: 22,
      createdAt: daysAgo(1),
    },
  });

  const thread8 = await prisma.thread.create({
    data: {
      id: "thread-8",
      title: "Tips for reservation system",
      authorId: resident6.id,
      content:
        "For those who keep missing seats — pro tip: book early in the morning around 7-8 AM. Most people cancel their late-night bookings by then. Quiet Room A is the most popular so act fast!",
      tag: normalizeThreadTag("discussion"),
      upvotes: 10,
      createdAt: daysAgo(6),
    },
  });

  // ═══════════════════════════════════════════════════════════
  // COMMENTS (with nested replies)
  // ═══════════════════════════════════════════════════════════
  const comment1 = await prisma.comment.create({
    data: {
      id: "comment-1",
      threadId: thread1.id,
      authorId: resident2.id,
      content: "Quiet Room A is the best during exam week. Get there early though — it fills up by 8 AM!",
      upvotes: 5,
      createdAt: daysAgo(5),
    },
  });

  await prisma.comment.create({
    data: {
      id: "comment-1-reply-1",
      threadId: thread1.id,
      parentId: comment1.id,
      authorId: resident3.id,
      content: "True! I went at 9 AM last time and all seats were taken. 7:30 AM is the sweet spot.",
      upvotes: 2,
      createdAt: daysAgo(5),
    },
  });

  await prisma.comment.create({
    data: {
      id: "comment-2",
      threadId: thread1.id,
      authorId: resident5.id,
      content: "The computer lab is actually pretty quiet on weekends. Most people don't know about it.",
      upvotes: 3,
      createdAt: daysAgo(4),
    },
  });

  const comment3 = await prisma.comment.create({
    data: {
      id: "comment-3",
      threadId: thread2.id,
      authorId: concierge.id,
      content: "We've reported this to maintenance. Should be fixed by Friday. Apologies for the inconvenience!",
      upvotes: 8,
      createdAt: daysAgo(3),
    },
  });

  await prisma.comment.create({
    data: {
      id: "comment-3-reply-1",
      threadId: thread2.id,
      parentId: comment3.id,
      authorId: resident2.id,
      content: "Thanks for the update! Any temporary workaround? I have a submission due tomorrow.",
      upvotes: 1,
      createdAt: daysAgo(3),
    },
  });

  await prisma.comment.create({
    data: {
      id: "comment-3-reply-2",
      threadId: thread2.id,
      parentId: comment3.id,
      authorId: concierge.id,
      content: "You can use the computer lab's ethernet connection for now. It's not affected by the WiFi issue.",
      upvotes: 4,
      createdAt: daysAgo(3),
    },
  });

  await prisma.comment.create({
    data: {
      id: "comment-4",
      threadId: thread2.id,
      authorId: resident1.id,
      content: "Same on 4th floor. Had to hotspot from my phone just to submit homework 😭",
      upvotes: 6,
      createdAt: daysAgo(3),
    },
  });

  await prisma.comment.create({
    data: {
      id: "comment-5",
      threadId: thread3.id,
      authorId: resident1.id,
      content: "I'm in! Calc 2 is killing me. Tuesday works for me.",
      upvotes: 2,
      createdAt: daysAgo(6),
    },
  });

  await prisma.comment.create({
    data: {
      id: "comment-6",
      threadId: thread3.id,
      authorId: resident6.id,
      content: "Count me in too! Can we do 3-5 PM?",
      upvotes: 1,
      createdAt: daysAgo(6),
    },
  });

  await prisma.comment.create({
    data: {
      id: "comment-7",
      threadId: thread4.id,
      authorId: resident1.id,
      content: "Went there yesterday because of this post. Can confirm — the samgyeopsal is insane for the price! 🔥",
      upvotes: 4,
      createdAt: daysAgo(1),
    },
  });

  await prisma.comment.create({
    data: {
      id: "comment-8",
      threadId: thread4.id,
      authorId: resident4.id,
      content: "Pro tip: ask for the garlic butter dip. It's not on the menu but they'll give it to you if you ask.",
      upvotes: 7,
      createdAt: daysAgo(1),
    },
  });

  await prisma.comment.create({
    data: {
      id: "comment-9",
      threadId: thread5.id,
      authorId: concierge.id,
      content: "Hours are 7 AM to 10 PM daily. Machine #3 was fixed yesterday!",
      upvotes: 3,
      createdAt: daysAgo(1),
    },
  });

  await prisma.comment.create({
    data: {
      id: "comment-10",
      threadId: thread6.id,
      authorId: resident3.id,
      content: "Yes! Their Ethiopian pour-over is worth every peso. A bit pricey but the quality is amazing.",
      upvotes: 2,
      createdAt: daysAgo(3),
    },
  });

  await prisma.comment.create({
    data: {
      id: "comment-11",
      threadId: thread7.id,
      authorId: resident1.id,
      content: "This is amazing news! Finally I can study there after dinner without rushing.",
      upvotes: 3,
      createdAt: daysAgo(1),
    },
  });

  await prisma.comment.create({
    data: {
      id: "comment-12",
      threadId: thread7.id,
      authorId: resident5.id,
      content: "Best announcement ever! The sunset from the rooftop is so nice for study vibes.",
      upvotes: 5,
      createdAt: daysAgo(1),
    },
  });

  await prisma.comment.create({
    data: {
      id: "comment-13",
      threadId: thread8.id,
      authorId: resident2.id,
      content: "This is so helpful, thank you! I've been struggling to get a spot in Quiet Room A.",
      upvotes: 2,
      createdAt: daysAgo(5),
    },
  });

  // ═══════════════════════════════════════════════════════════
  // VOTES (on threads)
  // ═══════════════════════════════════════════════════════════
  const threadVotes = [
    { threadId: thread1.id, voters: [resident2.id, resident3.id, resident4.id, resident5.id] },
    { threadId: thread2.id, voters: [resident1.id, resident3.id, resident4.id, resident5.id, resident6.id] },
    { threadId: thread4.id, voters: [resident1.id, resident2.id, resident3.id, resident4.id, resident6.id] },
    {
      threadId: thread7.id,
      voters: [resident1.id, resident2.id, resident3.id, resident4.id, resident5.id, resident6.id],
    },
  ];
  await Promise.all(
    threadVotes.flatMap((threadVote) =>
      threadVote.voters.map((voterId) =>
        prisma.vote.create({
          data: { id: crypto.randomUUID(), userId: voterId, threadId: threadVote.threadId, value: 1 },
        }),
      ),
    ),
  );

  // Comment votes
  const commentVotes = [
    { commentId: "comment-3", voters: [resident1.id, resident2.id, resident4.id, resident5.id] },
    { commentId: "comment-8", voters: [resident1.id, resident2.id, resident3.id, resident5.id, resident6.id] },
  ];
  await Promise.all(
    commentVotes.flatMap((commentVote) =>
      commentVote.voters.map((voterId) =>
        prisma.vote.create({
          data: { id: crypto.randomUUID(), userId: voterId, commentId: commentVote.commentId, value: 1 },
        }),
      ),
    ),
  );

  // ═══════════════════════════════════════════════════════════
  // REPORTS
  // ═══════════════════════════════════════════════════════════
  await prisma.report.create({
    data: {
      id: "report-1",
      reporterId: resident2.id,
      threadId: thread2.id,
      reason: "Contains personal information about a staff member",
      status: "pending",
      createdAt: daysAgo(2),
    },
  });
  await prisma.report.create({
    data: {
      id: "report-2",
      reporterId: resident3.id,
      commentId: "comment-4",
      reason: "Inappropriate language",
      status: "pending",
      createdAt: daysAgo(1),
    },
  });
  await prisma.report.create({
    data: {
      id: "report-3",
      reporterId: resident1.id,
      threadId: thread5.id,
      reason: "Duplicate thread — already discussed in thread-2",
      status: "dismissed",
      createdAt: daysAgo(1),
    },
  });

  // ═══════════════════════════════════════════════════════════
  // BANS
  // ═══════════════════════════════════════════════════════════
  const banExpiry = new Date();
  banExpiry.setDate(banExpiry.getDate() + 3);
  await prisma.ban.create({
    data: {
      id: "ban-1",
      userId: guest1.id,
      reason: "Spam account — multiple flagged posts",
      expiresAt: banExpiry,
      createdAt: daysAgo(1),
    },
  });
  await prisma.banAppeal.create({
    data: {
      id: "appeal-1",
      userId: guest1.id,
      banId: "ban-1",
      message:
        "I understand the spam reports. I was testing the forum and should have stopped after the first duplicate post.",
      status: "pending",
      createdAt: daysAgo(0),
    },
  });

  // ═══════════════════════════════════════════════════════════
  // ACTIVITY LOGS
  // ═══════════════════════════════════════════════════════════
  const logs = [
    {
      userId: admin.id,
      action: "create_establishment",
      detail: 'Created establishment "Moonlight Café"',
      createdAt: daysAgo(30),
    },
    {
      userId: admin.id,
      action: "create_establishment",
      detail: 'Created establishment "Seoul Grill House"',
      createdAt: daysAgo(28),
    },
    {
      userId: admin.id,
      action: "create_establishment",
      detail: 'Created establishment "Campus MiniStop"',
      createdAt: daysAgo(28),
    },
    {
      userId: concierge.id,
      action: "create_establishment",
      detail: 'Created establishment "QuickWash Laundry"',
      createdAt: daysAgo(29),
    },
    {
      userId: concierge.id,
      action: "create_establishment",
      detail: 'Created establishment "Lola\'s Kitchen"',
      createdAt: daysAgo(25),
    },
    {
      userId: resident1.id,
      action: "create_reservation",
      detail: "Reserved in zone Quiet Room A",
      createdAt: daysAgo(0),
    },
    { userId: resident1.id, action: "create_reservation", detail: "Reserved in zone Main Hall", createdAt: daysAgo(0) },
    {
      userId: resident2.id,
      action: "create_reservation",
      detail: "Reserved in zone Quiet Room A",
      createdAt: daysAgo(0),
    },
    {
      userId: resident3.id,
      action: "create_reservation",
      detail: "Reserved in zone Computer Lab",
      createdAt: daysAgo(0),
    },
    {
      userId: resident1.id,
      action: "create_thread",
      detail: 'Created thread "Best quiet hours study spots?"',
      createdAt: daysAgo(5),
    },
    {
      userId: resident2.id,
      action: "create_thread",
      detail: 'Created thread "Dorm WiFi has been terrible lately"',
      createdAt: daysAgo(3),
    },
    {
      userId: resident3.id,
      action: "create_thread",
      detail: 'Created thread "Looking for study group — Calculus 2"',
      createdAt: daysAgo(7),
    },
    {
      userId: resident5.id,
      action: "create_thread",
      detail: 'Created thread "Seoul Grill House — unlimited samgyeopsal review"',
      createdAt: daysAgo(2),
    },
    {
      userId: resident1.id,
      action: "create_review",
      detail: "Reviewed establishment Moonlight Café",
      createdAt: daysAgo(20),
    },
    {
      userId: resident2.id,
      action: "create_review",
      detail: "Reviewed establishment QuickWash Laundry",
      createdAt: daysAgo(18),
    },
    {
      userId: resident5.id,
      action: "create_review",
      detail: "Reviewed establishment Seoul Grill House",
      createdAt: daysAgo(10),
    },
    { userId: concierge.id, action: "create_comment", detail: "Commented on thread thread-2", createdAt: daysAgo(3) },
    { userId: resident2.id, action: "create_comment", detail: "Commented on thread thread-1", createdAt: daysAgo(5) },
    {
      userId: admin.id,
      action: "update_user_role",
      detail: "Changed user user-concierge role to concierge",
      createdAt: daysAgo(30),
    },
    { userId: admin.id, action: "ban_user", detail: "Banned user user-guest for 3 days", createdAt: daysAgo(1) },
    { userId: concierge.id, action: "resolve_report", detail: "dismiss report report-3", createdAt: daysAgo(1) },
    {
      userId: concierge.id,
      action: "walk_in_reservation",
      detail: "Walk-in booking for Anna Cruz (2021-12345)",
      createdAt: daysAgo(2),
    },
    { userId: admin.id, action: "purge_expired", detail: "Purged 3 expired bookings", createdAt: daysAgo(1) },
    { userId: resident4.id, action: "update_profile", detail: "Updated profile", createdAt: daysAgo(8) },
    { userId: resident4.id, action: "update_profile_photo", detail: "Updated profile photo", createdAt: daysAgo(8) },
  ];

  await Promise.all(logs.map((log) => prisma.activityLog.create({ data: { id: crypto.randomUUID(), ...log } })));

  // ═══════════════════════════════════════════════════════════
  // ERROR LOGS (sample)
  // ═══════════════════════════════════════════════════════════
  await prisma.errorLog.create({
    data: {
      id: crypto.randomUUID(),
      level: "Error",
      message: "Failed to connect to SMTP server for email verification",
      source: "auth",
      createdAt: daysAgo(5),
    },
  });
  await prisma.errorLog.create({
    data: {
      id: crypto.randomUUID(),
      level: "Warning",
      message: "Slow query detected: getEstablishments took >2s",
      source: "establishments",
      createdAt: daysAgo(2),
    },
  });
  await prisma.errorLog.create({
    data: {
      id: crypto.randomUUID(),
      level: "Error",
      message: "Image upload exceeded size limit (attempted 5.2 MB)",
      source: "profile",
      createdAt: daysAgo(1),
    },
  });

  console.log("✅ Seeding complete!");
  console.log("   • 9 users (1 admin, 1 concierge, 6 residents, 1 guest)");
  console.log("   • 5 study zones with 68 total seats");
  console.log("   • 8 reservations");
  console.log("   • 8 establishments (7 active, 1 closed)");
  console.log("   • 16 reviews with helpful votes");
  console.log("   • 8 threads with 13+ comments (including nested replies)");
  console.log("   • Thread & comment votes");
  console.log("   • 3 reports, 1 ban");
  console.log("   • 25 activity logs, 3 error logs");
}

try {
  await main();
} catch (error) {
  console.error(error);
  process.exit(1);
} finally {
  await prisma.$disconnect();
}
