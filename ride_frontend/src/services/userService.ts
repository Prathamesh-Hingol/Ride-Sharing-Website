import { getUserProfile } from "../api/userApi";
import { UserProfile } from "../types";

/**
 * Service Layer — User
 * Maps raw backend user data to the frontend UserProfile type.
 */

/**
 * Fetches and maps the authenticated user's profile.
 * The backend returns { id, name, email, picture } — we map to our UserProfile type.
 * Throws on failure so the hook can set an error state.
 */
export const fetchUserProfile = async (): Promise<UserProfile> => {
  // The backend /user/profile returns the raw Google OAuth user object
  // We cast it here and map the fields our components care about
  const data = await getUserProfile() as any;
  return {
    studentId: data.id ?? data.studentId,
    name: data.name,
    email: data.email,
    photoUrl: data.picture ?? data.photoUrl,
    createdAt: data.createdAt ?? data.created_at,
  };
};
