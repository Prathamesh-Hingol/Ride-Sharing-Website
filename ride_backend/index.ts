import http from "node:http";
import { logger } from "./src/config/logger.js";
import { getEnvironment } from "./src/config/env.js";
import pool from "./src/config/db.js";
import { initSocket } from "./src/config/socket-config.js";
import { registerChatHandlers } from "./src/chat.js";
import { createApp } from "./src/app.js";

async function startServer(): Promise<void> {
  const env = getEnvironment();
  const app = createApp();
  const server = http.createServer(app);

  initSocket(server, app.locals.sessionMiddleware);
  registerChatHandlers();

  try {
    await pool.query("SELECT 1");
    logger.info("PostgreSQL connected");

    server.listen(env.serverPort, () => {
      logger.info(`Server running on port ${env.serverPort}`);
    });
  } catch (error) {
    const err = error as Error;
    logger.error("Unable to start server because PostgreSQL is unavailable", {
      message: err.message,
    });
    process.exitCode = 1;
  }
}

startServer();
