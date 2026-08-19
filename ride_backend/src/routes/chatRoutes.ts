import { Router } from "express";
import { getRideMembersHttp } from "../controllers/chatController.js";

/**
 * Chat HTTP routes.
 *
 * NOTE: getPreviousMessages and addNewMessage are Socket.IO internals —
 * they are NOT exposed as HTTP endpoints here. They are called directly
 * from src/chat.ts via the chatController module.
 */
const router = Router();
router.post("/rideMembers", getRideMembersHttp);

export default router;
