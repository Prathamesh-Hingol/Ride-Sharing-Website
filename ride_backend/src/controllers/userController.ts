import type { Request, Response } from "express";
import { getUserById } from "../models/userModel.js";

export async function getUserProfile(req: Request, res: Response): Promise<void> {
  try {
    // authenticate middleware guarantees req.session.user is set.
    const userId = req.session.user!.id;
    const user = await getUserById(userId);

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json(user);
  } catch (error) {
    const err = error as Error;
    console.error(`Error in getUserProfile: ${err.message}`);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
