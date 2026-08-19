import { Router } from "express";
import { getUserProfile } from "../controllers/userController.js";

const router = Router();
router.get("/profile", getUserProfile);

export default router;
