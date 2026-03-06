// Needs: DATABASE_URL in .env + `pnpm prisma generate` after you sets up DB access, maybe later na
import { PrismaClient } from "../generated/prisma/client";

declare global {
  var __prisma: PrismaClient | undefined;
}

export const prisma = globalThis.__prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.__prisma = prisma;
}
