# Backend Changes — `db-auth` branch

> **Note:** This branch implements the full backend. The frontend was on `main` and has been merged into this branch (all 20 merge conflicts resolved, `tsc --noEmit` clean).

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

| File                             | Purpose                                                                                                                                                                                                                                                                                                                                                                                  |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `prisma/schema.prisma`           | 17 MongoDB models: 4 auth (User, Session, Account, Verification) + 11 domain (StudyZone, Seat, Reservation, Establishment, Review, Thread, Comment, Vote, Report, Ban, ActivityLog) + 2 infrastructure (HelpfulVote, ErrorLog); `Establishment` has `address String?`; `Reservation` has `studentName String?` and `studentId String?`; `Review` has `helpful Int` and `images String[]` |
| `prisma/seed.ts`                 | Seeds dev data: 4 users, 3 zones, 22 seats, 2 reservations, 2 establishments, 2 reviews, 2 threads, 2 comments                                                                                                                                                                                                                                                                           |
| `prisma.config.ts`               | Prisma config pointing output to `generated/prisma/client`                                                                                                                                                                                                                                                                                                                               |
| `src/db.ts`                      | PrismaClient singleton (HMR-safe global pattern)                                                                                                                                                                                                                                                                                                                                         |
| `src/lib/auth.ts`                | Better Auth server instance — Prisma adapter, email/password, role field, cookie plugin                                                                                                                                                                                                                                                                                                  |
| `src/lib/auth-client.ts`         | Better Auth client instance (React hook-based)                                                                                                                                                                                                                                                                                                                                           |
| `src/contexts/auth-context.tsx`  | React context: `useAuth()` → `{ isLoggedIn, role, name, isPending, signOut }`                                                                                                                                                                                                                                                                                                            |
| `src/contexts/auth-provider.tsx` | Wraps app in `AuthContext` using `authClient.useSession()`                                                                                                                                                                                                                                                                                                                               |
| `src/server/auth.ts`             | Core auth helpers: `getSession()` (dynamic import to avoid import-protection), `getSessionFn()` (SSR-safe), `requireSession()`, `requireRole(roles[])`                                                                                                                                                                                                                                   |
| `src/server/utils.ts`            | Shared utilities: `formatRelative(date)`, `categorizeAction(action)`, `logError(message, source?)` — writes to `ErrorLog` model                                                                                                                                                                                                                                                          |
| `src/server.ts`                  | Custom production server entry — intercepts `/api/auth/*` and routes to Better Auth before delegating to TanStack Start's default stream handler                                                                                                                                                                                                                                         |
| `src/server/threads.ts`          | Forum: `getThreads` (paginated), `getThread`, `createThread`, `createComment`, `voteThread`, `voteComment`, `deleteThread`, `updateThread`, `deleteComment`                                                                                                                                                                                                                              |
| `src/server/zones.ts`            | Study nook: `getZones`, `getZone`                                                                                                                                                                                                                                                                                                                                                        |
| `src/server/reservations.ts`     | Reservations: `getMyReservations`, `getAllReservations`, `createReservation`, `cancelReservation`, `purgeExpiredReservations`, `createWalkInReservation`                                                                                                                                                                                                                                 |
| `src/server/establishments.ts`   | Guide: `getEstablishments` (paginated), `getEstablishment` (loads `isHelpful` per review), `createEstablishment`, `createReview` (images support), `createOwnerReply`, `deleteEstablishment`, `updateEstablishment`, `toggleHelpful`                                                                                                                                                     |
| `src/server/profile.ts`          | Profile: `getUserProfile`, `updateProfile`, `deleteAccount`, `uploadProfilePhoto`                                                                                                                                                                                                                                                                                                        |
| `src/server/moderation.ts`       | Moderation: `getReports`, `resolveReport`, `createBan`, `createReport`                                                                                                                                                                                                                                                                                                                   |
| `src/server/admin.ts`            | Admin: `getAdminStats`, `getUsers`, `updateUserRole`, `getActivityLogs` (paginated), `getDiagnostics`, `getErrorLogs` (paginated)                                                                                                                                                                                                                                                        |

### Modified files

| File                                       | What changed                                                                                                                                                                                                                                                       |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --- |
| `vite.config.ts`                           | Added `serverOnlyStubPlugin()` + `betterAuthVitePlugin()` -- see Bundling section below for details                                                                                                                                                                |
| `src/routes/login.tsx`                     | Combined login/register page with toggle; uses `authClient.signIn.email()` + `authClient.signUp.email()`, `getSessionFn()` in `beforeLoad`; toggled via `?register=true` query param; `rememberMe` checkbox wired to `authClient.signIn.email({ rememberMe })`     |
| ~~`src/routes/signup.tsx`~~                | **Deleted** — redundant standalone signup page removed; header and sidebar links updated to `/login?register=true`                                                                                                                                                 |
| `src/routes/_app/route.tsx`                | Uses `getSessionFn()` in `beforeLoad` for SSR-safe auth + role gating                                                                                                                                                                                              |
| `src/routes/_app/dashboard.tsx`            | Loads `getMyReservations`; Manage button links to `/profile`                                                                                                                                                                                                       |
| `src/routes/_app/profile.tsx`              | Loads `getUserProfile`, calls `updateProfile`, `cancelReservation`, `deleteAccount`, `uploadProfilePhoto`; Photo upload modal with FileInput + base64 conversion                                                                                                   |
| `src/routes/_app/guide/$estId.tsx`         | Loads `getEstablishment` (with `isHelpful` per review), calls `createReview` (with images), `createOwnerReply`, `toggleHelpful`; Review image thumbnails; persistent helpful votes; owner reply inline form                                                        |
| `src/routes/_app/lobby/index.tsx`          | Loads `getThreads` (paginated), calls `createThread`; New Post → modal, Sort Select wired; Pagination component; client-only category management removed                                                                                                           |
| `src/routes/_app/lobby/$threadId.tsx`      | Loads `getThread`, calls `createComment`, `voteThread`, `voteComment`, `updateThread`, `deleteThread`, `deleteComment`, `createReport`; Edit/Delete/Reply/upvote/Report/DeleteComment wired; `isAuthor` flag from server controls comment delete button visibility |
| `src/routes/_app/study-nook/index.tsx`     | Loads `getZones`; availability filter Select wired                                                                                                                                                                                                                 |
| `src/routes/_app/study-nook/$zoneId.tsx`   | Loads `getZone`, calls `createReservation`                                                                                                                                                                                                                         |
| `src/routes/_app/guide/index.tsx`          | Loads `getEstablishments` (paginated); search wired; Pagination component                                                                                                                                                                                          |
| `src/routes/_app/guide/$estId.tsx`         | Loads `getEstablishment`, calls `createReview`, `createOwnerReply`; owner reply form gated to owner via `isOwner` flag                                                                                                                                             |     |
| `src/routes/_app/concierge.tsx`            | Loads `getAllReservations`, calls `cancelReservation`, `purgeExpiredReservations`, `createWalkInReservation`; walk-in form fully wired with state                                                                                                                  |
| `src/routes/_app/moderation.tsx`           | Loads `getReports`, calls `resolveReport`, `createBan`                                                                                                                                                                                                             |
| `src/routes/_app/admin/index.tsx`          | Loads `getAdminStats` + `getUsers` + `getDiagnostics`; `updateUserRole`, `createBan` wired; search/filter users wired; ban confirmation modal; real diagnostics with DB ping                                                                                       |
| `src/routes/_app/admin/establishments.tsx` | Loads `getEstablishments`, calls `createEstablishment`, `deleteEstablishment`, `updateEstablishment`; search, Edit/Delete/Assign/Cancel wired; `address` field wired through create/edit forms and server calls                                                    |
| `src/routes/_app/admin/logs.tsx`           | Loads `getActivityLogs` (paginated) + `getErrorLogs` (paginated); search + type filter wired; real error logs from DB; Pagination on both tabs                                                                                                                     |
| `package.json`                             | Added `better-auth`, `@better-auth/prisma-adapter`, `@prisma/client`, `prisma`, `dotenv`                                                                                                                                                                           |

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

- **All 27 mutation functions** check `requireSession()` or `requireRole()` — no anonymous writes.
- **Role-based access**: admin-only functions (`getAdminStats`, `getActivityLogs`, `updateUserRole`, `createEstablishment`, `deleteEstablishment`, `updateEstablishment`, `getDiagnostics`, `getErrorLogs`), concierge/admin functions (`getUsers`, `getAllReservations`, `getReports`, `resolveReport`, `createBan`, `purgeExpiredReservations`, `createWalkInReservation`).
- **Input validation**: role whitelist on `updateUserRole`, rating 1–5 on `createReview`, ban duration 1–365 days on `createBan`, content-not-empty checks on `createOwnerReply`, `createReport` requires at least one of `threadId`/`commentId`, image uploads validated (base64 data URL prefix, size limits, max count).
- **Seat double-booking prevention**: `createReservation` uses `prisma.$transaction()` for atomic check + create + seat update (no race condition).
- **Ownership checks**: `cancelReservation` verifies the user owns the reservation (or is concierge/admin). `deleteThread`/`deleteComment` verify authorship (or admin). `updateThread` verifies authorship. `createOwnerReply` verifies the user is the establishment owner.
- **Activity logging**: All 27 mutation functions log to `ActivityLog` for full audit trail.

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

- Seed users have no password hash — they exist only to populate relations. Real test accounts must be created via Sign Up.
- No real-time updates (e.g. WebSocket for new comments).
- Image storage uses base64 data URLs in MongoDB string fields. Acceptable for a school project; a production app would use an object store (S3, Cloudflare R2).

## Phase 1 fixes

Following issues resolved after initial integration:

- **R6 — Delete comment UI**: Added `deleteComment` call + `IconTrash` `ActionIcon` on comments, visible only when `comment.isAuthor` (flag returned by `getThread`).
- **R9 — `purgeExpiredReservations` auth**: Replaced manual role check with `requireRole(["concierge", "admin"])`.
- **R10 — Admin ban UX**: Ban button now opens a confirmation modal with an editable reason (`Textarea`, default `"Admin action"`) and duration (`NumberInput`, default 7 days) before firing `createBan`.
- **R11 — Remove `signup.tsx`**: Standalone signup page deleted; header and sidebar link updated to `/login?register=true`; `route-tree.gen.ts` regenerated.
- **R12 — Remove category management**: Client-only Manage Categories modal removed from `lobby/index.tsx` (state was lost on reload). Tag filters now use `DEFAULT_TAGS` from `lobby.constants.ts` directly.
- **R13 — Walk-in student info in DB**: Added `studentName String?` and `studentId String?` to the `Reservation` Prisma model; `createWalkInReservation` now stores them in the database row.
- **R14 — Establishment address**: Added `address String?` to the `Establishment` Prisma model; `getEstablishments`, `createEstablishment`, and `updateEstablishment` all handle the field; admin UI edit and create forms load and submit `address`.

## Phase 2 fixes

Following cosmetic and infrastructure issues resolved:

### Schema additions

- **`HelpfulVote` model**: Join table with `userId` + `reviewId` (unique constraint). Relations to `User` and `Review`.
- **`ErrorLog` model**: Fields `level`, `message`, `source`, `createdAt`. Used by `logError()` utility and queried by `getErrorLogs`.
- **`Review.helpful`**: New `Int @default(0)` field for persisted helpful count. `Review.helpfulVotes` relation added.
- **`User.helpfulVotes`**: Relation to `HelpfulVote[]`.

### New server functions

| Function             | File                | Purpose                                                                                                                     |
| -------------------- | ------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `toggleHelpful`      | `establishments.ts` | Creates or deletes `HelpfulVote`, atomically increments/decrements `Review.helpful`. Logs errors via `logError()`.          |
| `uploadProfilePhoto` | `profile.ts`        | Validates base64 data URL (<2 MB, starts with `data:image/`), updates `User.image`, logs activity.                          |
| `getDiagnostics`     | `admin.ts`          | Pings MongoDB via `$runCommandRaw({ ping: 1 })`, counts records across 5 models, returns `{ api, database, totalRecords }`. |
| `getErrorLogs`       | `admin.ts`          | Paginated query on `ErrorLog` model (admin-only). Returns `{ items, total, page, pageSize }`.                               |
| `logError`           | `utils.ts`          | Async utility — dynamically imports Prisma, creates `ErrorLog` record. Silent catch (never crashes the app).                |

### Server-side pagination

`getThreads`, `getEstablishments`, `getActivityLogs`, and `getErrorLogs` now accept `{ page?, pageSize? }` input params and return `{ items, total, page, pageSize }`. Uses Prisma `skip`/`take` for offset-based pagination.

### UI changes

- **Login — Remember me**: `rememberMe` state wired to `Checkbox`, passed to `authClient.signIn.email({ rememberMe })`.
- **Profile — Photo upload**: `FileInput` in photo modal converts file to base64 via `FileReader.readAsDataURL()`, calls `uploadProfilePhoto`. Loading state shown during upload.
- **Guide — Review images**: `FileInput` (multiple) converts images to base64 array, passed to `createReview({ images })`. Review cards display image thumbnails.
- **Guide — Helpful votes**: Button calls `toggleHelpful` server function. `isHelpful` flag per review loaded from `HelpfulVote` table via `getEstablishment`. Replaced client-only `useState` set.
- **Admin — Diagnostics**: Real DB ping and record count from `getDiagnostics()`. Shows green/red status badges.
- **Admin — Error logs**: Hardcoded entries removed. Error Logs tab reads from `ErrorLog` model with "Source" column. Empty state shown when no errors.
- **Pagination**: Mantine `Pagination` component added to lobby (threads), guide (establishments), and admin logs (activity + error) pages. Shown conditionally when `total > pageSize`.

## Revision Part 2 stabilization

Following the initial backend completion and earlier UI polish, Revision Part 2 focused on post-phase hardening in two passes.

### Phase R2-1 — Functional stabilization

- **Moderation queue grouping**: `getReports()` now groups reports by thread/comment target instead of showing duplicate queue rows for the same content. `resolveReport()` resolves or deletes the entire grouped target, and deleting a reported comment now removes its descendant reply tree safely.
- **Ban enforcement**: `requireSession()` now checks active bans centrally, so banned users are blocked consistently across authenticated server functions. Creating a new ban also removes any pre-existing active ban for that user.
- **Reservation editing**: `updateReservation()` was added so users can edit reservation date, time window, and anonymity directly from the profile page instead of navigating away and recreating the booking.
- **Seat label normalization**: Zone and reservation responses now normalize seat labels into readable alphanumeric display values. Public study nook maps, profile reservations, and staff reservation tables all use the same display layer.
- **Content model flexibility**: Admin establishment management now supports custom categories without requiring a schema change, matching the existing free-string `category` field in Prisma.
- **Public image flow**: Establishment and study zone pages now prefer uploaded database images on public cards and detail pages instead of falling back to static assets every time.

### Phase R2-2 — Visual hardening and release readiness

- **Footer/support cleanup**: Footer support links now route to real destinations (`/terms`, privacy anchor, support anchor) instead of placeholder home links.
- **Social branding polish**: Footer social actions now use lightweight, brand-aware treatments with explicit labels and distinct hover states.
- **Glass and contrast refinement**: Shared header, footer, auth card, and content surfaces were rebalanced with stronger contrast, clearer borders, and less washed-out translucency.
- **Background and media pass**: Landing/auth hero gradients were strengthened, shared image components gained consistent framing, and directory/lobby cards now render with more deliberate depth and surface separation.
- **Documentation refresh**: `changes.md`, `pers/guide.md`, and `pers/suggestions-v1.md` were updated to reflect the revised workflows and final stabilization status.
- **Quality gates**: Revision Part 2 was validated with `pnpm format:check`, `pnpm lint`, `npx tsc --noEmit`, and `npx vite build`.

## Revision Part 3 recovery

Revision Part 3 closed the remaining product gaps in two passes: model and workflow repair first, then visual finish and release cleanup.

### Phase R3-1 — Workflow, data model, and moderation repair

- **Reservation availability rewrite**: booking conflicts now come from reservation window overlap checks rather than the old global `Seat.isTaken` toggle. Study nook availability, concierge walk-ins, and reservation edits all use the same time-scoped seat logic.
- **Suspended account flow**: active bans now redirect authenticated users to `/suspended`, where they can review the ban reason, remain signed in, and submit an appeal instead of encountering generic auth failures.
- **Appeals loop**: `BanAppeal` was added to Prisma, moderation now records appeals, and the admin panel includes an appeals queue for approving or rejecting requests with staff notes.
- **Taxonomy hardening**: lobby topics and establishment categories now normalize through dedicated taxonomy helpers, keeping filters, seeds, server responses, and admin forms aligned.
- **Thread media support**: threads can now store optional images, and both lobby feed/detail views render a consistent placeholder-or-uploaded artwork path.

### Phase R3-2 — Visual finish and release cleanup

- **Carousel affordances**: landing-page carousels now expose browse hints, current-slide progress, edge cues, and direct CTA buttons so the featured cards are clearly actionable on desktop and mobile.
- **Dashboard hero redesign**: the old static resident banner was replaced with a layered dashboard hero that surfaces the next reservation, quick actions, and ambient motion cards.
- **Staff action menus**: concierge, moderation, admin users, establishments, and study zones now use labeled row-action menus instead of isolated icon-only action clusters.
- **Motion polish**: the shared reveal system supports directional and scale variants with delays, page-enter transitions are smoother, and the footer logo now uses restrained floating motion.
- **Guide presentation cohesion**: directory cards and establishment detail pages were refined so taxonomy badges, icons, imagery, and review galleries feel visually consistent.
