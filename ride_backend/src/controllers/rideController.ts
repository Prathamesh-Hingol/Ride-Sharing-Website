import type { Request, Response } from "express";
import {
  getPendingRides,
  getFilteredPendingRides,
  addNewlyCreatedRide,
  getUpcomingRides,
  getCompletedRides,
  cancelRide,
  leaveRide,
  getRideGroup,
} from "../services/rideService.js";
import { parseBody, rideCreateSchema, rideFilterSchema } from "../validation/rideSchemas.js";
import { asyncHandler } from "../utils/index.js";

/** GET /rides/availableRides — all pending rides with available seats */
export const getAllPendingRides = asyncHandler(async (_req: Request, res: Response) => {
  const result = await getPendingRides();
  res.status(200).json({ success: true, data: result });
});

/** POST /rides/filteredAvailableRides — pending rides filtered by source/destination/date/time */
export const getAllFilteredRides = asyncHandler(async (req: Request, res: Response) => {
  const filters = parseBody(rideFilterSchema, req.body);
  const result = await getFilteredPendingRides(filters);
  res.status(200).json({ success: true, data: result });
});

/** POST /rides/addRide — create a new ride offering */
export const addNewRide = asyncHandler(async (req: Request, res: Response) => {
  // Frontend sends: { from, to, date, time, seats, price?, vehicle }
  const validated = parseBody(rideCreateSchema, req.body);

  await addNewlyCreatedRide({
    userID: req.session.user!.id,  // from session — no DB lookup needed
    source: validated.from,
    destination: validated.to,
    date: validated.date,
    time: validated.time,
    seatsAvailable: validated.seats,
    totalCost: validated.price && validated.price > 0 ? validated.price : null,
    vehicleType: validated.vehicle,
  });

  res.status(201).json({ success: true, message: "Ride created successfully" });
});

/** GET /rides/upcomingRides — the authenticated user's upcoming (Pending) rides */
export const getAllUpcomingRides = asyncHandler(async (req: Request, res: Response) => {
  const result = await getUpcomingRides({ userID: req.session.user!.id });
  res.status(200).json({ success: true, message: "Upcoming rides fetched successfully", data: result });
});

/** GET /rides/completedRides — the authenticated user's completed rides */
export const getAllCompletedRides = asyncHandler(async (req: Request, res: Response) => {
  const result = await getCompletedRides({ userID: req.session.user!.id });
  res.status(200).json({ success: true, message: "Completed rides fetched successfully", data: result });
});

/** POST /rides/:rideID/cancel — ride owner cancels their ride */
export const cancelRideForUser = asyncHandler(async (req: Request, res: Response) => {
  const rideID = Number(req.params.rideID);
  if (!Number.isInteger(rideID) || rideID <= 0) {
    res.status(400).json({ success: false, message: "Invalid ride ID" });
    return;
  }
  const result = await cancelRide({ rideID, ownerID: req.session.user!.id });
  res.status(200).json({ success: true, data: result });
});

/** POST /rides/:rideID/leave — accepted passenger leaves a ride */
export const leaveRideForUser = asyncHandler(async (req: Request, res: Response) => {
  const rideID = Number(req.params.rideID);
  if (!Number.isInteger(rideID) || rideID <= 0) {
    res.status(400).json({ success: false, message: "Invalid ride ID" });
    return;
  }
  const result = await leaveRide({ rideID, userID: req.session.user!.id });
  res.status(200).json({ success: true, data: result });
});

/** GET /rides/:rideID/group — fetch group members for a ride the user belongs to */
export const getRideGroupForUser = asyncHandler(async (req: Request, res: Response) => {
  const rideID = Number(req.params.rideID);
  if (!Number.isInteger(rideID) || rideID <= 0) {
    res.status(400).json({ success: false, message: "Invalid ride ID" });
    return;
  }
  const result = await getRideGroup({ rideID, userID: req.session.user!.id });
  res.status(200).json({ success: true, data: result });
});
