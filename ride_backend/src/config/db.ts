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
 */
const pool = new Pool({
  connectionString: env.databaseUrl,
  ssl: env.databaseSsl ? { rejectUnauthorized: false } : false,
  max: 5,
  idleTimeoutMillis: 300_000,
  connectionTimeoutMillis: 10_000,
});

pool.on("error", (err: Error) => {
  logger.error("Unexpected error on idle pg client", err);
});

export default pool;
