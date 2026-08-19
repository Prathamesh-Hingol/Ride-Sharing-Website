import { prisma } from "../config/prisma.js";
import { logger } from "../config/logger.js";

export interface UserData {
  googleId: string;
  email: string;
  name?: string | null;
  picture?: string | null;
}

/**
 * Get a user by their internal DB id.
 */
export async function getUserById(id: number) {
  return prisma.users.findUnique({ where: { id } });
}

/**
 * Find a user by their Google OAuth ID.
 */
export async function findByGoogleId(googleId: string) {
  return prisma.users.findUnique({ where: { google_id: googleId } });
}

/**
 * Create a new user record after Google OAuth sign-in.
 */
export async function create(userData: UserData) {
  const user = await prisma.users.create({
    data: {
      google_id: userData.googleId,
      email: userData.email,
      name: userData.name,
      picture: userData.picture,
    },
  });
  logger.info(`New user created: id=${user.id} email=${userData.email}`);
  return user;
}

/**
 * Update a user's mutable fields (name, picture).
 * Returns null if there is nothing to update.
 */
export async function update(id: number, userData: Partial<UserData>) {
  const data: { name?: string | null; picture?: string | null } = {};
  if (userData.name !== undefined) data.name = userData.name;
  if (userData.picture !== undefined) data.picture = userData.picture;

  // Nothing to update — skip the DB call entirely
  if (Object.keys(data).length === 0) return null;

  return prisma.users.update({ where: { id }, data });
}
