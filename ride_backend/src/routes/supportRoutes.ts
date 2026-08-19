import { Router } from "express";
import { sendContactRequest } from "../controllers/supportController.js";

const router = Router();
router.post("/contact", sendContactRequest);

export default router;
