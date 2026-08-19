import "dotenv/config";
import { defineConfig } from "prisma/config";

/**
 * Prisma CLI Configuration
 * Mirrors the setup from IITISOC/backend/prisma.config.ts
 *
 * DIRECT_URL is used here (not DATABASE_URL) because:
 * - The Prisma CLI runs DDL statements (CREATE TABLE, ALTER TABLE)
 * - PgBouncer (the pooler) does not support DDL in transaction mode
 * - DIRECT_URL bypasses the pooler for a raw connection to Neon
 *
 * The PrismaClient at runtime uses DATABASE_URL (pooler) for efficiency.
 */
export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DIRECT_URL,
  },
});
