import http from "node:http";
import { createApp } from "./app.js";
import pool from "./config/db.js";
import { getEnvironment } from "./config/env.js";
import { initSocket } from "./config/socket-config.js";
import { registerChatHandlers } from "./chat.js";
import { logger } from "./config/logger.js";

export async function startServer() {
  const env = getEnvironment();
  const app = createApp();
  const server = http.createServer(app);
  initSocket(server, app.locals.sessionMiddleware);
  registerChatHandlers();

  await pool.query("SELECT 1");
  server.listen(env.serverPort, () => logger.info(`Server running on port ${env.serverPort}`));

  const shutdown = async (signal: string) => {
    logger.info(`${signal} received; shutting down gracefully`);
    await new Promise<void>((resolve) => server.close(() => resolve()));
    await pool.end();
  };
  process.once("SIGTERM", () => void shutdown("SIGTERM"));
  process.once("SIGINT", () => void shutdown("SIGINT"));
  return server;
}

if (process.env.NODE_ENV !== "test") {
  startServer().catch((error) => {
    logger.error("Unable to start server", { message: error instanceof Error ? error.message : String(error) });
    process.exitCode = 1;
  });
}
