import type { Request, Response } from "express";
import { getUserById } from "../services/userService.js";
import { asyncHandler } from "../utils/index.js";

/** GET /user/profile — returns the authenticated user's full DB record */
export const getUserProfile = asyncHandler(async (req: Request, res: Response) => {
  // authenticate middleware guarantees req.session.user is set.
  const user = await getUserById(req.session.user!.id);

  if (!user) {
    res.status(404).json({ success: false, message: "User not found" });
    return;
  }

  res.status(200).json({ success: true, data: user });
});
