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
  try {
    return await prisma.users.findUnique({ where: { id } });
  } catch (error) {
    const err = error as Error;
    logger.error(`Database error in getUserById: ${err.message}`);
    throw new Error(err.message);
  }
}

/**
 * Find a user by their Google OAuth ID.
 */
export async function findByGoogleId(googleId: string) {
  try {
    return await prisma.users.findUnique({ where: { google_id: googleId } });
  } catch (error) {
    const err = error as Error;
    logger.error(`Database error in findByGoogleId: ${err.message}`);
    throw new Error(err.message);
  }
}

/**
 * Create a new user record after Google OAuth sign-in.
 */
export async function create(userData: UserData) {
  try {
    return await prisma.users.create({
      data: {
        google_id: userData.googleId,
        email: userData.email,
        name: userData.name,
        picture: userData.picture,
      },
    });
  } catch (error) {
    const err = error as Error;
    logger.error(`Database error in create: ${err.message}`);
    throw new Error(err.message);
  }
}

/**
 * Update a user's mutable fields (name, picture).
 */
export async function update(id: number, userData: Partial<UserData>) {
  try {
    const data: { name?: string | null; picture?: string | null } = {};
    if (userData.name !== undefined) data.name = userData.name;
    if (userData.picture !== undefined) data.picture = userData.picture;

    if (Object.keys(data).length === 0) return null;

    return await prisma.users.update({ where: { id }, data });
  } catch (error) {
    const err = error as Error;
    logger.error(`Database error in update: ${err.message}`);
    throw new Error(err.message);
  }
}
