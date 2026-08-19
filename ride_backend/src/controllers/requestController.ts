import type { Request, Response } from "express";
import {
  handleUserSentRequest,
  handleUserReceivedRequest,
  getSentRequests,
  getReceivedRequests,
} from "../services/requestService.js";
import { asyncHandler } from "../utils/index.js";

/** POST /request/sendRequest — authenticated user requests to join a ride */
export const sendRequest = asyncHandler(async (req: Request, res: Response) => {
  const rideID = Number(req.body.rideID);
  if (!Number.isInteger(rideID) || rideID <= 0) {
    res.status(400).json({ success: false, message: "rideID must be a positive integer" });
    return;
  }

  const requestBy = req.session.user!.id; // always from session, never from body
  const result = await handleUserSentRequest({ rideID, requestBy });
  res.status(200).json({ success: true, data: result });
});

/** POST /request/handleRequest — ride owner accepts or rejects a join request */
export const handleRequest = asyncHandler(async (req: Request, res: Response) => {
  const rideID = Number(req.body.rideID);
  const requestBy = Number(req.body.requestBy);
  const { flag } = req.body;

  if (!Number.isInteger(rideID) || !Number.isInteger(requestBy)) {
    res.status(400).json({ success: false, message: "rideID and requestBy must be integers" });
    return;
  }

  // Validate flag in the controller — reject before hitting the service/transaction
  if (flag !== "Accepted" && flag !== "Rejected") {
    res.status(400).json({ success: false, message: "flag must be 'Accepted' or 'Rejected'" });
    return;
  }

  await handleUserReceivedRequest({ rideID, requestBy, flag, ownerID: req.session.user!.id });
  res.status(200).json({ success: true, data: "Request handled successfully." });
});

/** GET /request/requestsSent — all pending requests the user has sent */
export const getRequestsSent = asyncHandler(async (req: Request, res: Response) => {
  const result = await getSentRequests({ requestBy: req.session.user!.id });
  res.status(200).json({ success: true, data: result });
});

/** GET /request/requestsReceived — all pending requests received on the user's rides */
export const getRequestsReceived = asyncHandler(async (req: Request, res: Response) => {
  const result = await getReceivedRequests({ createdBy: req.session.user!.id });
  res.status(200).json({ success: true, data: result });
});
