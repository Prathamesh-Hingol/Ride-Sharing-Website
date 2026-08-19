import type { Request, Response } from "express";
import {
  handleUserSentRequest,
  handleUserReceivedRequest,
  getSentRequests,
  getReceivedRequests,
} from "../models/requestModel.js";

export async function sendRequest(req: Request, res: Response): Promise<void> {
  try {
    const rideID = Number(req.body.rideID);
    if (!Number.isInteger(rideID) || rideID <= 0) {
      res.status(400).json({ success: false, message: "rideID must be a positive integer" });
      return;
    }
    const requestBy = req.session.user!.id; // always from session, never from body
    const result = await handleUserSentRequest({ rideID, requestBy });
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    const err = error as Error & { statusCode?: number };
    console.log("Error in making request:", err.stack);
    res.status(err.statusCode ?? 500).json({ success: false, message: err.message });
  }
}

export async function handleRequest(req: Request, res: Response): Promise<void> {
  try {
    const rideID = Number(req.body.rideID);
    const requestBy = Number(req.body.requestBy);
    const flag = req.body.flag as "Accepted" | "Rejected";

    if (!Number.isInteger(rideID) || !Number.isInteger(requestBy)) {
      res.status(400).json({ success: false, message: "rideID and requestBy must be integers" });
      return;
    }

    await handleUserReceivedRequest({ rideID, requestBy, flag, ownerID: req.session.user!.id });
    res.status(200).json({ success: true, data: "Request handled successfully." });
  } catch (error) {
    const err = error as Error & { statusCode?: number };
    console.log("Error in handling request:", err.stack);
    res.status(err.statusCode ?? 500).json({ success: false, message: err.message });
  }
}

export async function getRequestsSent(req: Request, res: Response): Promise<void> {
  try {
    const requestBy = req.session.user!.id;
    const result = await getSentRequests({ requestBy });
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    const err = error as Error;
    console.error(`Error in fetching requests sent: ${err.message}`);
    res.status(500).json({ success: false, message: "Failed to fetch requests sent", error: err.message });
  }
}

export async function getRequestsReceived(req: Request, res: Response): Promise<void> {
  try {
    const createdBy = req.session.user!.id;
    const result = await getReceivedRequests({ createdBy });
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    const err = error as Error;
    console.error(`Error in fetching requests received: ${err.message}`);
    res.status(500).json({ success: false, message: "Failed to fetch requests received", error: err.message });
  }
}
