/**
 * Augment the express-session SessionData interface so that
 * req.session.user is fully typed across all controllers.
 *
 * This file is a TypeScript declaration file — it is never compiled
 * to JavaScript and has no runtime cost.
 */
import "express-session";

declare module "express-session" {
  interface SessionData {
    user: {
      id: number;
      googleId: string;
      email: string;
      name: string | null;
      picture: string | null;
      isAdmin: boolean | null;
    };
    /** Google OAuth refresh token — stored on login, used for token renewal */
    refreshToken?: string;
  }
}
