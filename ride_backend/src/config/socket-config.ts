import { Server, Socket } from "socket.io";
import type { IncomingMessage, ServerResponse } from "node:http";
import type { Server as HttpServer } from "node:http";
import type { RequestHandler } from "express";
import { getEnvironment } from "./env.js";

/** Events the client sends to the server */
export interface ClientToServerEvents {
  joinRoom: (payload: { rideId: number | string }) => void;
  getOlderMessages: (payload: { rideId: number | string }) => void;
  "chat message": (payload: { rideId: number | string; user?: unknown; message: string }) => void;
}

/** Events the server sends to the client */
export interface ServerToClientEvents {
  "ride members": (members: Array<{ id: number; name: string | null }>) => void;
  "older messages": (messages: unknown[]) => void;
  "chat message": (payload: {
    rideId: number | string;
    user_id: number | string;
    name: string | null;
    message: string;
    timestamp: Date | string;
  }) => void;
  "chat error": (message: string) => void;
}

export type TypedServer = Server<ClientToServerEvents, ServerToClientEvents>;
export type TypedSocket = Socket<ClientToServerEvents, ServerToClientEvents>;

let io: TypedServer;

export function initSocket(server: HttpServer, sessionMiddleware?: RequestHandler): TypedServer {
  const env = getEnvironment();
  io = new Server<ClientToServerEvents, ServerToClientEvents>(server, {
    cors: {
      origin: env.frontendOrigins,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  if (sessionMiddleware) {
    // Wrap the Express session middleware for use in Socket.IO engine.
    io.engine.use((req: IncomingMessage, res: ServerResponse, next: () => void) =>
      sessionMiddleware(req as Parameters<RequestHandler>[0], res as Parameters<RequestHandler>[1], next),
    );
  }

  return io;
}

export function getIO(): TypedServer {
  if (!io) {
    throw new Error("Socket.io not initialized — call initSocket(server) first.");
  }
  return io;
}
