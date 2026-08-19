import { Router } from "express";
import {
  getAllPendingRides,
  getAllFilteredRides,
  addNewRide,
  getAllUpcomingRides,
  getAllCompletedRides,
  cancelRideForUser,
  leaveRideForUser,
  getRideGroupForUser,
} from "../controllers/rideController.js";

const router = Router();
router.get("/availableRides", getAllPendingRides);
router.post("/filteredAvailableRides", getAllFilteredRides);
router.post("/addRide", addNewRide);
router.get("/pendingRides", getAllUpcomingRides);
router.get("/completedRides", getAllCompletedRides);
router.get("/:rideID/group", getRideGroupForUser);
router.post("/:rideID/cancel", cancelRideForUser);
router.post("/:rideID/leave", leaveRideForUser);

export default router;
