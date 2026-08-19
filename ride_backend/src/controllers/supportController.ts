import type { Request, Response } from "express";
import nodemailer from "nodemailer";
import { getEnvironment } from "../config/env.js";

/**
 * supportController — uses the typed env config for email credentials.
 * No raw process.env access or redundant dotenv.config() calls.
 */

function createTransporter() {
  const env = getEnvironment();
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: env.emailSender,
      pass: env.emailPassword,
    },
  });
}

function createAutoReplyEmail(name: string): { subject: string; html: string } {
  return {
    subject: "Thank You for Contacting RideShare",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
        <div style="background-color: #3b82f6; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h1 style="color: white; margin: 0; text-align: center;">Ride Sharing</h1>
        </div>
        <div style="background-color: #fff; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb;">
          <p style="margin-bottom: 16px;">Dear ${name},</p>
          <p style="margin-bottom: 16px;">Thank you for reaching out to us. We have received your message and will get back to you as soon as possible.</p>
          <p style="margin-bottom: 16px;">Our team typically responds within 24-48 business hours.</p>
          <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
            <p style="margin: 0; color: #6b7280; font-size: 14px;">Best regards,</p>
            <p style="margin: 4px 0 0; color: #6b7280; font-size: 14px;">The RideShare Team</p>
            <p style="margin: 4px 0 0; color: #6b7280; font-size: 14px;">IIT INDORE, 452020</p>
            <p style="margin: 4px 0 0; color: #6b7280; font-size: 14px;">support@rideshare.com</p>
          </div>
        </div>
      </div>
    `,
  };
}

export const sendContactRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log("NodeMailer request came in backend");
    const { name, email, subject, message } = req.body as {
      name: string;
      email: string;
      subject: string;
      message: string;
    };

    const env = getEnvironment();
    const transporter = createTransporter();
    const autoReply = createAutoReplyEmail(name);

    await Promise.all([
      transporter.sendMail({
        from: env.emailSender,
        to: env.emailReceiver,
        subject: `New Contact Request Form: ${subject}`,
        text: `Name: ${name}\nEmail: ${email}\nSubject: ${subject}\nMessage: ${message}`,
      }),
      transporter.sendMail({
        from: env.emailSender,
        to: email,
        subject: autoReply.subject,
        html: autoReply.html,
      }),
    ]);

    console.log("Email sent successfully");
    res.status(200).json({ message: "Contact form submitted successfully" });
  } catch (error) {
    const err = error as Error;
    console.error("Error in sending email:", err);
    res.status(500).json({ error: "Failed to submit contact form" });
  }
};
