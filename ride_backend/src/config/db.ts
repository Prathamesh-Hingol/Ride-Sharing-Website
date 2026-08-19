import pkg from "pg";
import { logger } from "./logger.js";
import { getEnvironment } from "./env.js";

const { Pool } = pkg;
const env = getEnvironment();

/**
 * Raw pg Pool — kept ONLY for connect-pg-simple (session store).
 * All application data queries go through Prisma (src/config/prisma.ts).
 *
 * Uses DATABASE_URL (the Neon pooler connection string).
 *
 * Neon (serverless Postgres) aggressively closes idle connections, which
 * causes ECONNRESET / "Connection terminated unexpectedly" errors when the
 * pool tries to reuse a socket that the server has already closed.
 *
 * Mitigations applied:
 *  - idleTimeoutMillis: 55_000   — evict idle clients before Neon's ~60 s timeout
 *  - keepAlive: true             — TCP keepalive probes detect dead sockets early
 *  - pool "error" handler        — log & discard; do NOT let it bubble as uncaughtException
 */
const pool = new Pool({
  connectionString: env.databaseUrl,
  ssl: env.databaseSsl ? { rejectUnauthorized: false } : false,
  max: 5,
  idleTimeoutMillis: 20_000,       // evict idle connections quickly before serverless sleep
  connectionTimeoutMillis: 30_000, // allow up to 30s for serverless wake-up
  keepAlive: true,
});

/**
 * Catch idle-client errors (ECONNRESET, "Connection terminated unexpectedly").
 * Without this handler Node.js would emit an uncaughtException and crash the process.
 * The pool automatically removes the broken client; no manual action is required.
 */
pool.on("error", (err: Error) => {
  // Only log connection-reset errors at "warn" level — they are expected from Neon
  // and the pool recovers automatically by creating a fresh connection on next use.
  const isExpectedReset =
    err.message.includes("Connection terminated unexpectedly") ||
    (err as NodeJS.ErrnoException).code === "ECONNRESET";

  if (isExpectedReset) {
    logger.warn(`pg pool: idle client dropped by server (${err.message}) — pool will reconnect automatically`);
  } else {
    logger.error("Unexpected error on idle pg client", { message: err.message, stack: err.stack });
  }
});

export default pool;
