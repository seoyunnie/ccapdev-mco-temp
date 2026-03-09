# Backend Changes — `db-auth` branch

> **Note:** This branch is purely backend. The frontend is on a separate branch (merged to main as of 03/09/26).

Audit, analysis, todo/roadmap creation, and debugging all done by AI.

## What this branch adds

This branch implements the full backend layer for Adormable: database schema, user authentication, server functions (API layer), and seed data. After merging, every page in the app reads from and writes to a real MongoDB database via Prisma, and all actions are protected by session-based auth.

---

## Tech stack (new in this branch)

| Layer            | Tech                                | Why                                                                     |
| ---------------- | ----------------------------------- | ----------------------------------------------------------------------- |
| Database         | **Prisma 6.19** + **MongoDB Atlas** | Type-safe ORM, schema-first, auto-generated client                      |
| Auth             | **Better Auth 1.5**                 | Email/password auth with session cookies, role field, SSR-compatible    |
| Server functions | **TanStack Start** `createServerFn` | RPC-style server functions, called from route loaders and form handlers |

---

## File map

### New files

| File                             | Purpose                                                                                                                                                                             |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `prisma/schema.prisma`           | 15 MongoDB models: 4 auth (User, Session, Account, Verification) + 11 domain (StudyZone, Seat, Reservation, Establishment, Review, Thread, Comment, Vote, Report, Ban, ActivityLog) |
| `prisma/seed.ts`                 | Seeds dev data: 4 users, 3 zones, 22 seats, 2 reservations, 2 establishments, 2 reviews, 2 threads, 2 comments                                                                      |
| `prisma.config.ts`               | Prisma config pointing output to `generated/prisma/client`                                                                                                                          |
| `src/db.ts`                      | PrismaClient singleton (HMR-safe global pattern)                                                                                                                                    |
| `src/lib/auth.ts`                | Better Auth server instance — Prisma adapter, email/password, role field, cookie plugin                                                                                             |
| `src/lib/auth-client.ts`         | Better Auth client instance (React hook-based)                                                                                                                                      |
| `src/contexts/auth-context.tsx`  | React context: `useAuth()` → `{ isLoggedIn, role, name, isPending, signOut }`                                                                                                       |
| `src/contexts/auth-provider.tsx` | Wraps app in `AuthContext` using `authClient.useSession()`                                                                                                                          |
| `src/server/auth.ts`             | Core auth helpers: `getSession()` (dynamic import to avoid import-protection), `getSessionFn()` (SSR-safe), `requireSession()`, `requireRole(roles[])`                              |
| `src/server/utils.ts`            | Shared utilities: `formatRelative(date)`, `categorizeAction(action)`                                                                                                                |
| `src/server.ts`                  | Custom production server entry — intercepts `/api/auth/*` and routes to Better Auth before delegating to TanStack Start's default stream handler                                    |
| `src/server/threads.ts`          | Forum: `getThreads`, `getThread`, `createThread`, `createComment`, `voteThread`, `voteComment`, `deleteThread`, `updateThread`, `deleteComment`                                     |
| `src/server/zones.ts`            | Study nook: `getZones`, `getZone`                                                                                                                                                   |
| `src/server/reservations.ts`     | Reservations: `getMyReservations`, `getAllReservations`, `createReservation`, `cancelReservation`, `purgeExpiredReservations`, `createWalkInReservation`                             |
| `src/server/establishments.ts`   | Guide: `getEstablishments`, `getEstablishment`, `createEstablishment`, `createReview`, `createOwnerReply`, `deleteEstablishment`, `updateEstablishment`                              |
| `src/server/profile.ts`          | Profile: `getUserProfile`, `updateProfile`, `deleteAccount`                                                                                                                         |
| `src/server/moderation.ts`       | Moderation: `getReports`, `resolveReport`, `createBan`, `createReport`                                                                                                              |
| `src/server/admin.ts`            | Admin: `getAdminStats`, `getUsers`, `updateUserRole`, `getActivityLogs`                                                                                                             |

### Modified files

| File                                       | What changed                                                                                        |
| ------------------------------------------ | --------------------------------------------------------------------------------------------------- |
| `vite.config.ts`                           | Added `serverOnlyStubPlugin()` + `betterAuthVitePlugin()` -- see Bundling section below for details |
| `src/routes/login.tsx`                     | Uses `authClient.signIn.email()`, `getSessionFn()` in `beforeLoad` for SSR-safe redirect            |
| `src/routes/signup.tsx`                    | Uses `authClient.signUp.email()`, `getSessionFn()` in `beforeLoad`                                  |
| `src/routes/_app/route.tsx`                | Uses `getSessionFn()` in `beforeLoad` for SSR-safe auth + role gating                               |
| `src/routes/_app/dashboard.tsx`            | Loads `getMyReservations`; Manage button links to `/profile`                                        |
| `src/routes/_app/profile.tsx`              | Loads `getUserProfile`, calls `updateProfile`, `cancelReservation`, `deleteAccount`; Delete Account and Edit reservation wired |
| `src/routes/_app/guide/$estId.tsx`         | Loads `getEstablishment`, calls `createReview`; Helpful thumbs-up toggle wired (client-side)        |
| `src/routes/_app/lobby/index.tsx`          | Loads `getThreads`, calls `createThread`; New Post → modal, Sort Select wired                       |
| `src/routes/_app/lobby/$threadId.tsx`      | Loads `getThread`, calls `createComment`, `voteThread`, `voteComment`, `updateThread`, `deleteThread`; Edit/Delete/Reply/upvote wired |
| `src/routes/_app/study-nook/index.tsx`     | Loads `getZones`; availability filter Select wired                                                  |
| `src/routes/_app/study-nook/$zoneId.tsx`   | Loads `getZone`, calls `createReservation`                                                          |
| `src/routes/_app/guide/index.tsx`          | Loads `getEstablishments`; search wired                                                             |
| `src/routes/_app/concierge.tsx`            | Loads `getAllReservations`, calls `cancelReservation`, `purgeExpiredReservations`, `createWalkInReservation`; walk-in form fully wired with state |
| `src/routes/_app/moderation.tsx`           | Loads `getReports`, calls `resolveReport`, `createBan`                                              |
| `src/routes/_app/admin/index.tsx`          | Loads `getAdminStats` + `getUsers`; `updateUserRole`, `createBan` wired; search/filter users wired  |
| `src/routes/_app/admin/establishments.tsx` | Loads `getEstablishments`, calls `createEstablishment`, `deleteEstablishment`, `updateEstablishment`; search, Edit/Delete/Assign/Cancel wired |
| `src/routes/_app/admin/logs.tsx`           | Loads `getActivityLogs`; search + type filter wired with `useState` + `.filter()`                   |
| `package.json`                             | Added `better-auth`, `@better-auth/prisma-adapter`, `@prisma/client`, `prisma`, `dotenv`            |

---

## How server functions work

Each server file exports functions created with `createServerFn()`. These run **only on the server** (never shipped to the client bundle). Route pages call them via:

- **Loaders** — `loader: () => getThreads()` in the route options. Data is fetched during SSR and hydrated on the client.
- **Mutations** — Called from `onClick` / form handlers. e.g. `await createThread({ data: { title, content } })`.

Input is validated via `.inputValidator()` before the handler runs.

---

## Auth flow

1. **Sign up / Log in** → `authClient.signUp.email()` or `authClient.signIn.email()` → hits `/api/auth/*` → Better Auth creates session + sets cookie.
2. **SSR route guard** → `beforeLoad` calls `getSessionFn()` (a `createServerFn`) → reads the cookie on the server → returns session or `null`.
3. **Client context** → `AuthProvider` wraps the app, calls `authClient.useSession()` → exposes `useAuth()` with `{ isLoggedIn, role, name }`.
4. **Server function auth** → Each mutation calls `requireSession()` or `requireRole([...])` which reads headers from the current request.

Roles: `guest` (default on signup) → `resident` → `concierge` → `admin`. Roles are changed manually via Prisma Studio or the Admin > Users page.

---

## Security measures

- **All 22 mutation functions** check `requireSession()` or `requireRole()` — no anonymous writes.
- **Role-based access**: admin-only functions (`getAdminStats`, `getActivityLogs`, `updateUserRole`, `createEstablishment`, `deleteEstablishment`, `updateEstablishment`), concierge/admin functions (`getUsers`, `getAllReservations`, `getReports`, `resolveReport`, `createBan`, `purgeExpiredReservations`, `createWalkInReservation`).
- **Input validation**: role whitelist on `updateUserRole`, rating 1–5 on `createReview`, ban duration 1–365 days on `createBan`, content-not-empty checks on `createOwnerReply`, `createReport` requires at least one of `threadId`/`commentId`.
- **Seat double-booking prevention**: `createReservation` uses `prisma.$transaction()` for atomic check + create + seat update (no race condition).
- **Ownership checks**: `cancelReservation` verifies the user owns the reservation (or is concierge/admin). `deleteThread`/`deleteComment` verify authorship (or admin). `updateThread` verifies authorship. `createOwnerReply` verifies the user is the establishment owner.
- **Activity logging**: 17 of 22 mutations log to `ActivityLog` for audit trail. 5 mutations (`updateThread`, `deleteComment`, `createOwnerReply`, `deleteEstablishment`, `updateEstablishment`) do not yet log — these are low-severity gaps since their auth checks are all in place.

---

## Bundling — Vite plugins

TanStack Start's `createServerFn` replaces handler bodies with RPC stubs for the client bundle, but **top-level `import` statements in server files remain**. This causes Prisma and Better Auth (which depend on Node.js built-ins) to leak into the browser build.

Two custom Vite plugins in `vite.config.ts` solve this:

### `serverOnlyStubPlugin()`

Intercepts the `load` hook for **client** environment builds. When the resolved module ID matches `src/db.ts` or `src/lib/auth.ts`, the plugin returns a trivial stub (`export const prisma = {};` / `export const auth = {};`) instead of the real source. This cuts off the entire Prisma + Better Auth dependency tree before Rollup ever traverses it.

### `betterAuthVitePlugin()`

Registers Vite dev-server middleware that intercepts all `/api/auth/*` requests and forwards them to Better Auth's `auth.handler()`. This is necessary because TanStack Start v1 has no `createAPIFileRoute`. The plugin loads the auth module via `server.ssrLoadModule()` so it stays HMR-compatible.

### `src/server.ts` — custom production server entry

TanStack Start's plugin (`resolveEntry`) scans `src/` for a file named `server.{ts,tsx,js,...}` and uses it as the server entry point instead of its built-in default. `src/server.ts` wraps `createStartHandler(defaultStreamHandler)` and intercepts `/api/auth/*` before delegating to TanStack Start, so Better Auth works identically in development and production builds.

### `src/server/auth.ts` — dynamic import

`getSession()` uses `await import("@tanstack/react-start/server")` instead of a static top-level import. The TanStack Start import-protection plugin blocks `@tanstack/react-start/server` from appearing in client-side code; a dynamic import inside the handler body (which `createServerFn` strips for the client) avoids this error.

---

## Known limitations (future work)

- **Activity log gaps**: 5 mutations (`updateThread`, `deleteComment`, `createOwnerReply`, `deleteEstablishment`, `updateEstablishment`) don't write to `ActivityLog` yet. See `Todo.md` R1.
- **`deleteAccount` logging order**: The activity log is created AFTER the user row is deleted, so `userId` is null in the log entry. The `detail` field captures the email, so data isn't lost. See `Todo.md` R2.
- **Establishment edit mode**: `admin/establishments.tsx` imports `updateEstablishment` but the Edit button pre-fills the create form — it always calls `createEstablishment` instead. See `Todo.md` R3.
- **No report button in UI**: `createReport` server function exists but there's no "Report" button in lobby or thread views. See `Todo.md` R4.
- **No owner reply UI**: `createOwnerReply` server function exists but `guide/$estId.tsx` has no reply form for owners. See `Todo.md` R5.
- **No delete comment UI**: `deleteComment` server function exists but no delete button on comments. See `Todo.md` R6.
- Filtering/sorting on list pages is client-side only (no server-side pagination yet).
- Seed users have no password hash — they exist only to populate relations. Real test accounts must be created via Sign Up.
- No file/image upload yet (review images, user avatars). `FileInput` on the review form renders but does not upload.
- No real-time updates (e.g. WebSocket for new comments).
- `helpful` count on reviews is a client-side toggle only — no persistence model in the schema yet.
- Walk-in reservations are attributed to the concierge's user ID; student name/ID is stored only in the activity log.
