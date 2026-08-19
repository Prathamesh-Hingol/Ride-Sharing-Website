import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

/**
 * Prisma Client — uses @prisma/adapter-pg with the DATABASE_URL (pooler)
 * for efficient connection management at runtime.
 *
 * The DIRECT_URL is only used by the Prisma CLI (migrations, generate).
 */
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

export const prisma = new PrismaClient({ adapter });
