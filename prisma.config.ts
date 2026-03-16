// oxlint-disable-next-line import/no-unassigned-import
import "dotenv/config";
// Needs: DATABASE_URL in .env — yow put this here for the MongoDB connection string

import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations", seed: "tsx ./prisma/seed.ts" },
  engine: "classic",
  datasource: { url: env("DATABASE_URL") },
});
