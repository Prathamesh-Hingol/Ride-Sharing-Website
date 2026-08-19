import type { Request, Response } from "express";
import { sendContactEmail } from "../services/supportService.js";
import { asyncHandler } from "../utils/index.js";

/**
 * POST /contact
 * Handles contact form submissions.
 */
export const sendContactRequest = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, subject, message } = req.body as {
    name?: string;
    email?: string;
    subject?: string;
    message?: string;
  };

  if (!name?.trim() || !email?.trim() || !subject?.trim() || !message?.trim()) {
    res.status(400).json({ success: false, message: "All fields (name, email, subject, message) are required" });
    return;
  }

  // Basic email pattern check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    res.status(400).json({ success: false, message: "Invalid email address format" });
    return;
  }

  await sendContactEmail({
    name: name.trim(),
    email: email.trim(),
    subject: subject.trim(),
    message: message.trim(),
  });

  res.status(200).json({ success: true, message: "Contact form submitted successfully" });
});
