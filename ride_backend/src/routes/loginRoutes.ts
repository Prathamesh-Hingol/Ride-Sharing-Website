import { Router } from "express";
import { loginRedirect, googleCallback, logout, getStatus } from "../controllers/loginController.js";

const router = Router();
router.get("/google", loginRedirect);
router.get("/google/callback", googleCallback);
router.get("/status", getStatus);
router.post("/logout", logout);
router.get("/logout", logout); // Fallback for backwards compatibility

export default router;
