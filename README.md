# Saved Collections

A Next.js app for saving Instagram, TikTok, and Google Maps links into private or public collections.

## Stack

- Next.js 16 App Router
- Auth.js / NextAuth v5 beta for credentials login and Google OAuth
- Prisma 7 with Neon-compatible Postgres driver adapter
- Tailwind CSS 4

## Setup

1. Copy the environment template:

```bash
cp .env.example .env
```

2. Set `DATABASE_URL` to a Neon Postgres connection string:

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST.neon.tech/DBNAME?sslmode=require"
```

3. Set an auth secret:

```bash
NEXTAUTH_SECRET="replace-with-a-long-random-secret"
```

4. Optional Google OAuth:

```bash
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
```

5. Push the schema and start the app:

```bash
npm run db:push
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Useful Scripts

```bash
npm run dev
npm run build
npm run lint
npm run db:push
npm run db:migrate
npm run db:studio
```

`postinstall` runs `prisma generate` because the generated Prisma client is intentionally not committed.
