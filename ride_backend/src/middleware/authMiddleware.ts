import type { Request, Response, NextFunction } from "express";

/**
 * Route guard — rejects unauthenticated requests with 401.
 * session.user is typed via src/types/express-session.d.ts.
 */
export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  if (req.session?.user) {
    next();
  } else {
    res.status(401).json({ message: "Unauthorized" });
  }
};

/**
 * Admin-only route guard — rejects non-admin users with 403.
 */
export const isAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (req.session?.user?.isAdmin === true) {
    next();
  } else {
    res.status(403).json({ message: "Forbidden: Admins only" });
  }
};
