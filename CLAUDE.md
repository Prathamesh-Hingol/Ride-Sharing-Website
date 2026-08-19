# Project Guidelines — IIT Indore Ride Sharing

## Overview
This repository contains the Ride Sharing application for IIT Indore students.
- Backend: TypeScript (`ride_backend/index.ts`), Express v5, Prisma ORM, PostgreSQL, Socket.IO.
- Frontend: React (`ride_frontend/src`), TypeScript, Vite, Tailwind CSS.

## Active Skills & Plugins
- `understand-anything`: Activated for codebase comprehension, structural analysis, dependency mapping, and data flow tracing.

## Development Commands
- Typecheck backend: `cd ride_backend && npm run typecheck`
- Run backend tests: `cd ride_backend && npm test`
- Build backend: `cd ride_backend && npm run build`
- Start backend dev server: `cd ride_backend && npm run dev`

## Coding Rules
1. **No Guessing**: Always verify schemas (`prisma/schema.prisma`), API routes, and types before editing code.
2. **Session Authentication**: All protected API endpoints pass through `authMiddleware` and use typed session `req.session.user`.
3. **Canonical Field Names**: Use `source`, `destination`, `seatsAvailable`, `totalCost`, `vehicleType`, `rideID`.
