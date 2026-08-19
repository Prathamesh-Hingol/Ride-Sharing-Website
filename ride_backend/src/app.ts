import express, { type Express } from "express";
import session from "express-session";
import connectPg from "connect-pg-simple";
import pool from "./config/db.js";
import cors from "cors";
import apiRoutes from "./routes/index.js";
import loginRoutes from "./routes/loginRoutes.js";
import { authenticate } from "./middleware/authMiddleware.js";
import { getEnvironment } from "./config/env.js";
import { AppError, errorHandler, notFoundHandler } from "./middleware/errorMiddleware.js";
import type { RequestHandler } from "express";

const PgSession = connectPg(session);

function corsOptions(frontendOrigins: string[]) {
  return {
    origin(origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
      // Requests without an Origin header are server-to-server/health requests.
      if (!origin || frontendOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new AppError(403, "Origin is not allowed by CORS"));
    },
    credentials: true,
  };
}

/**
 * Build the Express application after runtime configuration has been validated.
 * Keeping app creation separate from server startup makes HTTP tests easier.
 */
export function createApp(): Express {
  const env = getEnvironment();
  const app = express();

  if (env.cookieSecure) {
    // Required for secure cookies behind a reverse proxy such as Render or Railway.
    app.set("trust proxy", 1);
  }

  app.use(cors(corsOptions(env.frontendOrigins)));
  app.use(express.json({ limit: "100kb" }));
  app.use(express.urlencoded({ extended: true, limit: "100kb" }));

  const sessionMiddleware: RequestHandler = session({
    name: "rideshare.sid",
    rolling: true,
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      secure: env.cookieSecure,
      httpOnly: true,
      sameSite: env.cookieSameSite,
    },
    store: new PgSession({
      pool,
      tableName: "session",
      ttl: 7 * 24 * 60 * 60,
      createTableIfMissing: true,
    }),
    secret: env.sessionSecret,
    resave: false,
    saveUninitialized: false,
  });
  app.use(sessionMiddleware);

  // Expose the session middleware so Socket.IO can reuse it for auth.
  app.locals.sessionMiddleware = sessionMiddleware;

  app.get("/health", (_req, res) => {
    res.status(200).json({ status: "OK" });
  });

  app.get("/ready", async (_req, res, next) => {
    try {
      await pool.query("SELECT 1");
      res.status(200).json({ status: "READY" });
    } catch (error) {
      next(error);
    }
  });

  app.use("/auth", loginRoutes);
  app.use(authenticate);
  app.use(apiRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
