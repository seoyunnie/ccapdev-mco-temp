// Needs: DATABASE_URL + BETTER_AUTH_SECRET in .env (put DB creds here)
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { tanstackStartCookies } from "better-auth/tanstack-start";

import { prisma } from "../db.ts";

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "mongodb" }),
  emailAndPassword: { enabled: true },
  plugins: [tanstackStartCookies()],
  user: {
    additionalFields: {
      role: { type: ["guest", "resident", "concierge", "admin"], required: true, defaultValue: "guest", input: false },
    },
  },
});
