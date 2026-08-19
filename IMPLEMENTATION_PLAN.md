# IIT Indore Ride Sharing — Implementation Plan

## Goal

Deliver a reliable flow for IIT Indore students:

`Sign in → Offer a ride → Find a ride → Request to join → Accept/reject → Group chat → Complete ride`

## Phase 1 — Local setup and database baseline

### Checklist

- [x] Confirm Node.js and npm versions.
- [x] Install backend and frontend dependencies.
- [x] Configure `ride_backend/.env` from `.env.example` without committing secrets.
- [x] Verify `DATABASE_URL` and `DIRECT_URL` point to the intended PostgreSQL database.
- [x] Run `npm run prisma:generate`.
- [x] Apply or create a Prisma migration and verify all tables exist.
- [x] Run the backend health check (`GET /health`).
- [x] Run the database readiness check (`GET /ready`).
- [x] Start the frontend and verify that the sign-in page loads.
- [x] Record the exact local startup commands in the project README.

### Exit criteria

Phase 1 is complete when the backend starts without configuration errors, `/health` returns `200`, `/ready` can execute `SELECT 1`, Prisma can connect, and the frontend can reach the backend with session cookies enabled.

## Phase 2 — Normalize the API contract (current)

- [x] Choose canonical backend names (`source`, `destination`, `seatsAvailable`, `totalCost`, etc.).
- [x] Add a frontend API-boundary mapping layer so pages do not use competing field names.
- [x] Map frontend find filters to backend `source`/`destination` names.
- [x] Fix the join-request client to send `rideID` instead of the unused `rideId` field.
- [ ] Align the accept/reject request payload and authorization rules.
- Return the created ride, including `rideID`, from the create endpoint.
- [x] Preserve vehicle model as backend `vehicleModel` and frontend `vehicle_model`.
- [ ] Align all remaining request payloads between frontend and backend.

## Phase 3 — Complete offer/find ride

- [x] Validate ride input on the backend.
- [x] Reject past departure times and invalid seat/cost values.
- [x] Implement case-insensitive route/date/time filtering.
- [x] Add a client-side minimum date to the offer form.
- [x] Add focused validation tests for valid, invalid, past, and filter inputs.
- Replace string date/time columns with a proper `departureAt DateTime` field through a migration.
- Add loading, empty, and server-error states in the UI.

## Phase 3A — Backend TypeScript and Jest migration (required before further feature work)

The selected reference architecture is documented in [ARCHITECTURE_MIGRATION.md](ARCHITECTURE_MIGRATION.md). Google OAuth/session authentication remains in place.

### TypeScript migration

- [x] Add backend TypeScript configuration with strict checking and Node.js ESM support.
- [x] Define typed environment/configuration contracts.
- [x] Add a TypeScript server entry point with graceful shutdown.
- [x] Add a centralized route registry without changing existing frontend URLs.
- [x] Add Zod API-boundary schemas for ride creation and filtering.
- [x] Convert the ride validation module first.
- [x] Convert Prisma/database models and middleware.
- [x] Convert controllers and routes.
- [x] Convert Socket.IO handlers.
- [x] Convert `index.js` to `index.ts` and update the start/dev commands.
- [x] Remove obsolete JavaScript source files after TypeScript build passes.
- [x] Keep generated Prisma files and build output outside the source tree.

### Jest migration

- [x] Add Jest, `ts-jest`, and Node test typings.
- [x] Configure Jest for TypeScript ESM modules.
- [x] Move environment tests to Jest.
- [x] Convert ride validation tests to Jest.
- [ ] Add coverage thresholds after the initial migration is stable.
- [ ] Add separate unit and integration test commands.
- [ ] Ensure tests do not require production credentials or mutate the real database.

### Exit criteria

The backend starts from TypeScript, `npm run build` produces the server output, `npm test` runs Jest successfully, and the existing health/configuration behavior remains unchanged.

## Phase 4 — Implement join requests

- [x] Connect the Book Ride action to `POST /request/sendRequest`.
- [x] Prevent self-requests, duplicates, full rides, and requests for closed rides.
- [x] Add a unique database constraint on `(rideID, requestBy)` to the Prisma schema.
- [ ] Apply the schema change to the local database after checking for duplicate request rows.
- [x] Show a pending-request state in the booking confirmation UI.
- [x] Restrict accept/reject actions to the ride owner.
- [x] Make acceptance capacity-safe inside a transaction.
- [x] Add a Profile request-management UI for pending sent/received requests and owner accept/reject actions.

## Phase 5 — Secure request management

- [x] Permit only the ride owner to accept/reject requests.
- [x] Accept inside a transaction that checks availability and decrements exactly once.
- [x] Prevent race-condition overselling.
- [x] Add authenticated ride cancellation behavior.
- [x] Add authenticated leave-group behavior with seat restoration.
- [ ] Add frontend controls for cancellation and leaving a ride.

## Phase 6 — Real groups and chat

- [x] Replace dummy chat data with a real ride-specific route.
- [x] Replace dummy group-member data with an authenticated ride-group endpoint and route.
- [x] Route chat by real `rideID` and authenticated user.
- [x] Authenticate Socket.IO connections using the shared session middleware.
- [x] Permit only the owner and accepted members to join/read/write a room.
- Store messages with a `createdAt DateTime` field.

## Phase 7 — Ride lifecycle and safety

- [ ] Add an explicit `Full` state (availability is currently represented by seat count).
- [x] Add owner cancel controls and member leave controls.
- [ ] Add owner edit controls.
- [x] Prevent a ride creator from requesting their own ride in both UI and backend.
- [ ] Add notifications, reporting/blocking, and emergency contact information.

## Phase 8 — Verification and deployment

- Add backend tests for authorization, capacity, duplicate requests, and chat membership.
- Add frontend tests for forms, filters, request states, and chat.
- Perform a two-account end-to-end smoke test.
- Deploy database, backend, and frontend with production cookie/OAuth settings.

## Current blockers found before implementation

1. `BookRide.tsx` navigates to a success page but does not send a join request.
2. `Chats.tsx` uses a hard-coded ride ID and user identity.
3. Socket.IO accepts arbitrary room IDs and client-supplied user IDs without membership authorization.
4. Frontend filter names (`from`, `to`) do not match backend names (`source`, `destination`).
5. Frontend request payload types do not match the backend accept/reject payload.
6. Accepting a request does not verify ride ownership, remaining capacity, or prior acceptance.
7. Ride and message date/time values are stored as strings, making ordering and expiry logic fragile.

## Working rule

Finish and test one phase before adding optional features. Do not add UI that depends on dummy IDs or simulated success states.
