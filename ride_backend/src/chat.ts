import { getIO } from "./config/socket-config.js";
import { getRideMembers, addNewMessage, getPreviousMessages } from "./controllers/chatController.js";
import type { IncomingMessage } from "node:http";
import type { SessionData } from "express-session";

interface SessionIncomingMessage extends IncomingMessage {
  session?: SessionData;
}

export function registerChatHandlers(): void {
  const io = getIO();

  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);
    const req = socket.request as SessionIncomingMessage;
    const sessionUser = req.session?.user;

    if (!sessionUser) {
      socket.disconnect(true);
      return;
    }

    // Join ride room
    socket.on("joinRoom", async ({ rideId }) => {
      const numRideId = Number(rideId);
      if (!Number.isInteger(numRideId) || numRideId <= 0) {
        socket.emit("chat error", "Invalid ride ID");
        return;
      }

      console.log(`User ${socket.id} (user ID ${sessionUser.id}) joined room ${numRideId}`);

      try {
        const members = await getRideMembers({ rideID: numRideId });
        if (!members.some((member) => member.id === sessionUser.id)) {
          socket.emit("chat error", "You are not a member of this ride group");
          return;
        }
        socket.join(String(numRideId));
        socket.emit("ride members", members);
      } catch (err) {
        console.error("Error fetching members:", err);
        socket.emit("chat error", "Failed to load ride members");
      }
    });

    socket.on("getOlderMessages", async ({ rideId }) => {
      const numRideId = Number(rideId);
      if (!Number.isInteger(numRideId) || numRideId <= 0) {
        socket.emit("chat error", "Invalid ride ID");
        return;
      }

      try {
        const members = await getRideMembers({ rideID: numRideId });
        if (!members.some((member) => member.id === sessionUser.id)) {
          socket.emit("chat error", "You are not a member of this ride group");
          return;
        }
        socket.join(String(numRideId));
        const messages = await getPreviousMessages({ rideID: numRideId });
        socket.emit("older messages", messages);
      } catch (err) {
        console.error("Error fetching messages:", err);
        socket.emit("chat error", "Failed to load chat history");
      }
    });

    // New message
    socket.on("chat message", async ({ rideId, message }) => {
      const numRideId = Number(rideId);
      if (!Number.isInteger(numRideId) || numRideId <= 0) {
        socket.emit("chat error", "Invalid ride ID");
        return;
      }

      try {
        const members = await getRideMembers({ rideID: numRideId });
        const member = members.find((candidate) => candidate.id === sessionUser.id);
        if (!member || typeof message !== "string" || !message.trim()) {
          socket.emit("chat error", "You are not allowed to send messages to this group");
          return;
        }

        const trimmedMessage = message.trim().slice(0, 2000);
        await addNewMessage({
          rideID: numRideId,
          user_id: member.id,
          name: member.name,
          message: trimmedMessage,
        });

        io.to(String(numRideId)).emit("chat message", {
          rideId: numRideId,
          user_id: member.id,
          name: member.name,
          message: trimmedMessage,
          timestamp: new Date(),
        });
      } catch (err) {
        console.error("Error saving message:", err);
        socket.emit("chat error", "Failed to send message");
      }
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });
}

