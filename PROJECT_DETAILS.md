# Saved Collections Project Details

## Overview

Saved Collections is a full-stack web app for saving Instagram, TikTok, and Google Maps links into user-owned collections. The product is modeled after Instagram's saved collections: users can create named boards, save links into them, and decide whether each collection is private or public.

The current implementation is an MVP with real authentication, a Neon-ready Postgres schema, collection management, link saving, and public collection browsing.

## Tech Stack

- Framework: Next.js 16 App Router
- Language: TypeScript
- UI: React 19, Tailwind CSS 4, lucide-react icons
- Auth: Auth.js / NextAuth v5 beta
- Database: Prisma 7 with PostgreSQL
- Neon support: Prisma PG driver adapter via `@prisma/adapter-pg`
- Validation: Zod
- Password hashing: bcryptjs

Redis is not currently used. `.env.example` includes `REDIS_URL` as a future integration point for caching, rate limiting, or link metadata jobs.

## Core Features

### Authentication

Users can:

- Sign up with name, email, and password.
- Login with email and password.
- Use Google OAuth when `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are configured.
- Logout from the dashboard.

Auth is configured in `src/lib/auth.ts`. The auth route is exposed through `src/app/api/auth/[...nextauth]/route.ts`.

Credentials users store a hashed password in the `User.passwordHash` field. Google OAuth users are stored through the Auth.js Prisma adapter using the `Account` table.

### Collections

Users can create collections with:

- Name
- Optional description
- Visibility: private or public

Collections belong to a user and are shown on the dashboard as square grid cards inspired by Instagram saved collections.

Private collections are only visible to their owner. Public collections appear in the public browsing page.

### Saved Links

Users can save links into a collection. The app currently accepts:

- Instagram URLs
- TikTok URLs
- Google Maps URLs, including `maps.app.goo.gl` share links

The link parser lives in `src/lib/link-utils.ts`. It validates the hostname, normalizes duplicate detection, and assigns the platform as `INSTAGRAM`, `TIKTOK`, or `GOOGLE_MAPS`.

Each saved link can include:

- URL
- Optional title
- Optional note
- Platform
- Normalized URL

Duplicate links are prevented per collection through the Prisma unique constraint on `(collectionId, normalizedUrl)`.

### Public Collections

The `/public` route lists collections where `isPublic` is true. Anyone can open a public collection detail page. Private collection detail pages redirect non-owners to `/login`.

## Routes

- `/` - Landing page. Authenticated users are redirected to `/dashboard`.
- `/signup` - Email/password account creation.
- `/login` - Email/password login and Google OAuth entry point.
- `/dashboard` - Authenticated user's private dashboard with collection cards and creation forms.
- `/collections/[id]` - Collection detail page. Owners can add links and toggle visibility.
- `/public` - Public collection browser.
- `/api/auth/[...nextauth]` - Auth.js route handler.

Database-backed routes are marked as dynamic with `export const dynamic = "force-dynamic"` so builds do not try to prerender live database queries.

## Data Model

The Prisma schema is in `prisma/schema.prisma`.

### User

Stores application users and Auth.js user fields.

Important fields:

- `id`
- `name`
- `email`
- `emailVerified`
- `image`
- `passwordHash`
- `collections`
- `savedLinks`

### Account

Stores OAuth account records for Auth.js.

Important fields:

- `provider`
- `providerAccountId`
- `access_token`
- `refresh_token`
- `userId`

### Session

Included for Auth.js compatibility. The app currently uses JWT session strategy.

### VerificationToken

Included for Auth.js compatibility.

### Collection

Represents a user-created saved collection.

Important fields:

- `id`
- `name`
- `slug`
- `description`
- `isPublic`
- `coverImageUrl`
- `ownerId`
- `links`

Constraints and indexes:

- Unique `(ownerId, slug)`
- Index `(isPublic, updatedAt)`

### SavedLink

Represents an Instagram, TikTok, or Google Maps link saved into a collection.

Important fields:

- `url`
- `normalizedUrl`
- `platform`
- `title`
- `note`
- `thumbnailUrl`
- `authorHandle`
- `collectionId`
- `ownerId`

Constraints and indexes:

- Unique `(collectionId, normalizedUrl)`
- Index `(ownerId, createdAt)`

### LinkPlatform

Enum values:

- `INSTAGRAM`
- `TIKTOK`
- `GOOGLE_MAPS`

## Key Files

- `src/app/page.tsx` - Landing page.
- `src/app/(auth)/signup/page.tsx` - Signup page.
- `src/app/(auth)/login/page.tsx` - Login page.
- `src/app/dashboard/page.tsx` - User dashboard.
- `src/app/collections/[id]/page.tsx` - Collection detail page.
- `src/app/public/page.tsx` - Public collection browser.
- `src/app/actions.ts` - Server actions for signup, collection creation, link saving, and visibility toggling.
- `src/lib/auth.ts` - Auth.js configuration.
- `src/lib/current-user.ts` - Server-side current user lookup.
- `src/lib/prisma.ts` - Prisma client with Postgres driver adapter.
- `src/lib/link-utils.ts` - Instagram/TikTok/Google Maps URL parsing and normalization.
- `src/lib/validation.ts` - Zod schemas.
- `src/components/collections/*` - Collection and saved-link UI components.
- `src/components/auth/*` - Login, signup, and logout UI components.

## Environment Variables

Use `.env.example` as the template.

Required:

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST.neon.tech/DBNAME?sslmode=require"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="replace-with-a-long-random-secret"
```

Optional Google OAuth:

```bash
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
```

Reserved for future Redis support:

```bash
REDIS_URL=""
```

## Local Setup

Install dependencies:

```bash
npm install
```

Generate Prisma client:

```bash
npm run postinstall
```

Push the schema to Neon Postgres:

```bash
npm run db:push
```

Run the development server:

```bash
npm run dev
```

Open:

```bash
http://localhost:3000
```

## Scripts

- `npm run dev` - Start local development server.
- `npm run build` - Production build.
- `npm run start` - Start production server after build.
- `npm run lint` - Run ESLint.
- `npm run postinstall` - Generate Prisma client.
- `npm run db:push` - Push schema to the configured database.
- `npm run db:migrate` - Create and apply a Prisma migration in development.
- `npm run db:studio` - Open Prisma Studio.

## Current Limitations

- Redis is not wired yet.
- The app does not fetch live Instagram, TikTok, or Google Maps metadata.
- Saved-link thumbnails are represented visually in the UI, but `thumbnailUrl` is not automatically populated.
- There is no collection editing or deletion flow yet.
- There is no saved-link deletion flow yet.
- There is no password reset flow yet.
- Google OAuth only appears as usable when Google credentials are configured.

## Suggested Next Steps

1. Add collection edit and delete actions.
2. Add saved-link delete and move-to-collection actions.
3. Add metadata extraction for Instagram, TikTok, and Google Maps links.
4. Add Redis-backed rate limiting for link saves and metadata fetches.
5. Add share pages based on stable collection slugs.
6. Add tests around authorization, URL parsing, and duplicate saves.
