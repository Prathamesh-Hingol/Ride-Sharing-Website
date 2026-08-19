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
} from "../models/rideModel.js";
import { parseBody, rideCreateSchema, rideFilterSchema } from "../validation/rideSchemas.js";

export async function getAllPendingRides(_req: Request, res: Response): Promise<void> {
  try {
    const result = await getPendingRides();
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    const err = error as Error;
    console.error(`Error in fetching pending rides: ${err.message}`);
    res.status(500).json({ success: false, message: "Failed to fetch pending rides", error: err.message });
  }
}

export async function getAllFilteredRides(req: Request, res: Response): Promise<void> {
  try {
    const filters = parseBody(rideFilterSchema, req.body);
    const result = await getFilteredPendingRides(filters);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    const err = error as Error & { statusCode?: number };
    console.error(`Error in fetching filtered rides: ${err.message}`);
    res.status(err.statusCode ?? 500).json({ success: false, message: "Failed to fetch filtered rides", error: err.message });
  }
}

export async function addNewRide(req: Request, res: Response): Promise<void> {
  try {
    // Frontend sends: { from, to, date, time, seats, price?, vehicle }
    const validated = parseBody(rideCreateSchema, req.body);

    await addNewlyCreatedRide({
      userID: req.session.user!.id,    // from session — no DB lookup needed
      source: validated.from,
      destination: validated.to,
      date: validated.date,
      time: validated.time,
      seatsAvailable: validated.seats,
      totalCost: validated.price ?? 0,
      vehicleType: validated.vehicle,
    });

    res.status(201).json({ success: true, message: "Ride created successfully" });
  } catch (error) {
    const err = error as Error & { statusCode?: number };
    console.error("Error in creating ride:", err.stack);
    res.status(err.statusCode ?? 500).json({ success: false, message: "Failed to create ride", error: err.message });
  }
}

export async function getAllUpcomingRides(req: Request, res: Response): Promise<void> {
  try {
    const userID = req.session.user!.id;
    const result = await getUpcomingRides({ userID });
    res.status(200).json({ success: true, message: "Upcoming rides fetched successfully", data: result });
  } catch (error) {
    const err = error as Error;
    console.error("Error in fetching upcoming rides:", err.stack);
    res.status(500).json({ success: false, message: "Failed to fetch upcoming rides", error: err.message });
  }
}

export async function getAllCompletedRides(req: Request, res: Response): Promise<void> {
  try {
    const userID = req.session.user!.id;
    const result = await getCompletedRides({ userID });
    res.status(200).json({ success: true, message: "Completed rides fetched successfully", data: result });
  } catch (error) {
    const err = error as Error;
    console.error("Error in fetching completed rides:", err.stack);
    res.status(500).json({ success: false, message: "Failed to fetch completed rides", error: err.message });
  }
}

export async function cancelRideForUser(req: Request, res: Response): Promise<void> {
  try {
    const rideID = Number(req.params.rideID);
    if (!Number.isInteger(rideID) || rideID <= 0) {
      res.status(400).json({ success: false, message: "Invalid ride ID" });
      return;
    }
    const result = await cancelRide({ rideID, ownerID: req.session.user!.id });
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    const err = error as Error & { statusCode?: number };
    res.status(err.statusCode ?? 500).json({ success: false, message: err.message });
  }
}

export async function leaveRideForUser(req: Request, res: Response): Promise<void> {
  try {
    const rideID = Number(req.params.rideID);
    if (!Number.isInteger(rideID) || rideID <= 0) {
      res.status(400).json({ success: false, message: "Invalid ride ID" });
      return;
    }
    const result = await leaveRide({ rideID, userID: req.session.user!.id });
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    const err = error as Error & { statusCode?: number };
    res.status(err.statusCode ?? 500).json({ success: false, message: err.message });
  }
}

export async function getRideGroupForUser(req: Request, res: Response): Promise<void> {
  try {
    const rideID = Number(req.params.rideID);
    if (!Number.isInteger(rideID) || rideID <= 0) {
      res.status(400).json({ success: false, message: "Invalid ride ID" });
      return;
    }
    const result = await getRideGroup({ rideID, userID: req.session.user!.id });
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    const err = error as Error & { statusCode?: number };
    res.status(err.statusCode ?? 500).json({ success: false, message: err.message });
  }
}
