import type { Request, Response } from "express";
import {
  getRideMembers,
  addMessage,
  getOlderMessages,
} from "../services/chatService.js";
import { asyncHandler } from "../utils/index.js";

// Re-export service methods for any external consumers
export { getRideMembers, addMessage, getOlderMessages };

/**
 * POST /chat/rideMembers
 * Returns the member list for a ride group.
 */
export const getRideMembersHttp = asyncHandler(async (req: Request, res: Response) => {
  const rideID = Number(req.body.rideID);
  if (!Number.isInteger(rideID) || rideID <= 0) {
    res.status(400).json({ success: false, message: "rideID must be a positive integer" });
    return;
  }
  const members = await getRideMembers({ rideID });
  res.status(200).json({ success: true, data: members });
});
