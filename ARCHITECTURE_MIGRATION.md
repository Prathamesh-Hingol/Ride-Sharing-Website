# RideShare architecture migration

The IITISOC architecture was used as a reference, while Google OAuth/session authentication was intentionally retained.

## Adopted patterns

- `src/server.ts` owns startup, health checks, and graceful shutdown.
- `src/app.js` owns Express middleware and application construction.
- `src/routes/index.js` is the central route registry.
- Zod schemas validate API boundaries before controllers call models.
- Existing centralized error handling and Winston request logging remain in place.
- Prisma remains the database boundary; migrations are kept in `prisma/migrations`.
- Frontend requests continue through `api → services → hooks → pages`.

## Intentionally not copied

- Clerk: RideShare already has Google OAuth and session cookies.
- Cloudinary, Redis, BullMQ, and AI workers: these support IITISOC's image-generation domain and are not required for ride sharing.

## Current transition state

The server can now be started with `tsx src/server.ts`, while legacy `node index.js` remains available as `npm run start:legacy`. JavaScript modules are being converted incrementally to TypeScript, with `allowJs` enabled temporarily to avoid a flag-day migration.
