import { Router } from "express";
import rideRoutes from "./rideRoutes.js";
import chatRoutes from "./chatRoutes.js";
import requestRoutes from "./requestRoutes.js";
import userRoutes from "./userRoutes.js";
import supportRoutes from "./supportRoutes.js";

/**
 * Central route registry.
 * Authentication is applied once by app.ts before this registry is mounted.
 */
const apiRoutes = Router();
apiRoutes.use("/rides", rideRoutes);
apiRoutes.use("/chat", chatRoutes);
apiRoutes.use("/request", requestRoutes);
apiRoutes.use("/user", userRoutes);
apiRoutes.use(supportRoutes);

export default apiRoutes;
