import type { Request, Response, NextFunction, RequestHandler } from "express";
import { logger } from "../config/logger.js";

/**
 * Wraps an async Express route handler to automatically catch errors and
 * send a consistent JSON error response.
 *
 * Without this utility, every handler needs its own try/catch boilerplate:
 *   try { ... }
 *   catch (error) {
 *     const err = error as Error & { statusCode?: number };
 *     logger.error(...);
 *     res.status(err.statusCode ?? 500).json({ success: false, message: err.message });
 *   }
 *
 * With asyncHandler, handlers only contain the happy-path logic:
 *   export const myHandler = asyncHandler(async (req, res) => {
 *     const result = await someService();
 *     res.status(200).json({ success: true, data: result });
 *   });
 *
 * Error response shape: { success: false, message: string }
 * Status code: taken from err.statusCode if present (domain errors), else 500.
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>,
): RequestHandler {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await fn(req, res, next);
    } catch (error) {
      const err = error as Error & { statusCode?: number };
      logger.error(`[${req.method} ${req.path}] ${err.message}`, { stack: err.stack });
      res
        .status(err.statusCode ?? 500)
        .json({ success: false, message: err.message });
    }
  };
}
