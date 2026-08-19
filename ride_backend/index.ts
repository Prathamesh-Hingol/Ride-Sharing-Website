import http from "node:http";
import { logger } from "./src/config/logger.js";
import { getEnvironment } from "./src/config/env.js";
import pool from "./src/config/db.js";
import { initSocket } from "./src/config/socket-config.js";
import { registerChatHandlers } from "./src/chat.js";
import { createApp } from "./src/app.js";

// ─── Process-level safety net ────────────────────────────────────────────────
// Catches any error that escapes all try/catch blocks.
// Without these, Node.js would exit immediately — with them we at least get a
// log line and a controlled shutdown.
process.on("uncaughtException", (err: Error) => {
  logger.error(`uncaughtException: ${err.message}`, { stack: err.stack });
  // Give the logger time to flush before exiting
  setTimeout(() => process.exit(1), 500);
});

process.on("unhandledRejection", (reason: unknown) => {
  const message = reason instanceof Error ? reason.message : String(reason);
  logger.error(`unhandledRejection: ${message}`);
});
// ─────────────────────────────────────────────────────────────────────────────

async function startServer(): Promise<void> {
  const env = getEnvironment();
  const app = createApp();
  const server = http.createServer(app);

  initSocket(server, app.locals.sessionMiddleware);
  registerChatHandlers();

  // Start listening immediately so the port is bound and developer gets instant feedback
  server.listen(env.serverPort, () => {
    logger.info(`Server running on port ${env.serverPort} (http://localhost:${env.serverPort})`);
  });

  // Verify database connection with clear status logging
  try {
    logger.info("Connecting to PostgreSQL...");
    await pool.query("SELECT 1");
    logger.info("PostgreSQL connected successfully");
  } catch (error) {
    const err = error as NodeJS.ErrnoException;

    // ECONNRESET during startup means the pool made a connection but Neon closed it
    // immediately. The pool will create a fresh socket on the next real query — not fatal.
    if (err.code === "ECONNRESET" || err.message?.includes("Connection terminated")) {
      logger.warn("PostgreSQL startup ping dropped by server (ECONNRESET) — pool will reconnect on first query");
    } else {
      logger.error("Unable to start server because PostgreSQL is unavailable", {
        message: err.message,
      });
      // Truly can't reach the database — nothing useful can run
      process.exit(1);
    }
  }
}

startServer();

