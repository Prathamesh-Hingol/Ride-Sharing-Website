import type { Request, Response } from "express";
import {
  getRideMembers as getRideMembersModel,
  addMessage,
  getOlderMessages,
} from "../models/chatModel.js";
import type { RideMember } from "../models/chatModel.js";

// ─── Internal Socket.IO helpers (NOT mounted as HTTP routes) ─────────────────
// These are called directly by src/chat.ts — do NOT register them in chatRoutes.ts.

/**
 * Returns all members (creator + accepted requesters) for a ride.
 * Used internally by the Socket.IO joinRoom and chat message handlers.
 */
export async function getRideMembers({ rideID }: { rideID: number }): Promise<RideMember[]> {
  try {
    return await getRideMembersModel({ rideID });
  } catch (error) {
    console.error("Error getting ride member names:", error);
    throw new Error("Failed to retrieve ride member names");
  }
}

/**
 * Returns all previous messages for a ride, newest first.
 * Used internally by the Socket.IO getOlderMessages handler.
 */
export async function getPreviousMessages({ rideID }: { rideID: number }) {
  try {
    return await getOlderMessages({ rideID });
  } catch (error) {
    console.error("Error getting messages:", error);
    throw new Error("Failed to retrieve messages");
  }
}

/**
 * Persists a new chat message.
 * Used internally by the Socket.IO chat message handler.
 */
export async function addNewMessage({
  rideID,
  user_id,
  name,
  message,
}: {
  rideID: number;
  user_id: number;
  name: string | null;
  message: string;
}): Promise<{ success: true }> {
  try {
    await addMessage({ rideID, user_id, name, message });
    return { success: true };
  } catch (error) {
    console.error("Error adding message:", error);
    throw new Error("Failed to add message");
  }
}

// ─── HTTP handler ─────────────────────────────────────────────────────────────

/**
 * GET /chat/rideMembers  (requires rideID in body)
 * Returns the member list for a ride group.
 */
export async function getRideMembersHttp(req: Request, res: Response): Promise<void> {
  try {
    const rideID = Number(req.body.rideID);
    if (!Number.isInteger(rideID) || rideID <= 0) {
      res.status(400).json({ success: false, message: "rideID must be a positive integer" });
      return;
    }
    const members = await getRideMembersModel({ rideID });
    res.status(200).json({ success: true, data: members });
  } catch (error) {
    const err = error as Error;
    console.error("Error getting ride members:", err.message);
    res.status(500).json({ success: false, message: "Failed to retrieve ride members" });
  }
}
