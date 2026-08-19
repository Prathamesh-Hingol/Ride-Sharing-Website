import { getIO } from "./config/socket-config.js";
import { getRideMembers, addMessage, getOlderMessages } from "./services/chatService.js";
import { logger } from "./config/logger.js";
import type { IncomingMessage } from "node:http";
import type { SessionData } from "express-session";

interface SessionIncomingMessage extends IncomingMessage {
  session?: SessionData;
}

export function registerChatHandlers(): void {
  const io = getIO();

  io.on("connection", (socket) => {
    const req = socket.request as SessionIncomingMessage;
    const sessionUser = req.session?.user;

    if (!sessionUser) {
      logger.warn(`Unauthenticated socket connection rejected: ${socket.id}`);
      socket.disconnect(true);
      return;
    }

    logger.info(`User connected to socket: ${socket.id} (userID: ${sessionUser.id})`);

    // Join ride room
    socket.on("joinRoom", async ({ rideId }) => {
      const numericRideId = Number(rideId);
      if (!Number.isInteger(numericRideId) || numericRideId <= 0) {
        socket.emit("chat error", "Invalid ride ID");
        return;
      }

      try {
        const members = await getRideMembers({ rideID: numericRideId });
        if (!members.some((member) => member.id === sessionUser.id)) {
          socket.emit("chat error", "You are not a member of this ride group");
          return;
        }
        socket.join(String(numericRideId));
        socket.emit("ride members", members);
        logger.info(`User ${sessionUser.id} joined chat room for ride ${numericRideId}`);
      } catch (err) {
        logger.error(`Error fetching members for ride ${numericRideId}:`, err);
        socket.emit("chat error", "Failed to fetch ride members");
      }
    });

    // Fetch older messages
    socket.on("getOlderMessages", async ({ rideId }) => {
      const numericRideId = Number(rideId);
      if (!Number.isInteger(numericRideId) || numericRideId <= 0) {
        socket.emit("chat error", "Invalid ride ID");
        return;
      }

      try {
        const members = await getRideMembers({ rideID: numericRideId });
        if (!members.some((member) => member.id === sessionUser.id)) {
          socket.emit("chat error", "You are not a member of this ride group");
          return;
        }
        socket.join(String(numericRideId));
        const messages = await getOlderMessages({ rideID: numericRideId });
        socket.emit("older messages", messages);
      } catch (err) {
        logger.error(`Error fetching older messages for ride ${numericRideId}:`, err);
        socket.emit("chat error", "Failed to fetch chat history");
      }
    });

    // New message
    socket.on("chat message", async ({ rideId, message }) => {
      const numericRideId = Number(rideId);
      if (!Number.isInteger(numericRideId) || numericRideId <= 0) {
        socket.emit("chat error", "Invalid ride ID");
        return;
      }

      try {
        const members = await getRideMembers({ rideID: numericRideId });
        const member = members.find((candidate) => candidate.id === sessionUser.id);
        if (!member || typeof message !== "string" || !message.trim()) {
          socket.emit("chat error", "You are not allowed to send messages to this group");
          return;
        }

        const trimmedMessage = message.trim().slice(0, 2000);
        const timestamp = new Date();

        await addMessage({
          rideID: numericRideId,
          user_id: member.id,
          name: member.name,
          message: trimmedMessage,
          timestamp,
        });

        io.to(String(numericRideId)).emit("chat message", {
          rideId: numericRideId,
          user_id: member.id,
          name: member.name ?? "Anonymous",
          message: trimmedMessage,
          timestamp: timestamp,
        });
      } catch (err) {
        logger.error(`Error saving message for ride ${numericRideId}:`, err);
        socket.emit("chat error", "Failed to send message");
      }
    });

    socket.on("disconnect", () => {
      logger.info(`Client disconnected from socket: ${socket.id}`);
    });
  });
}


