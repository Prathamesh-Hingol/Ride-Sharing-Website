import { Router } from "express";
import {
  sendRequest,
  handleRequest,
  getRequestsSent,
  getRequestsReceived,
} from "../controllers/requestController.js";

const router = Router();
router.post("/sendRequest", sendRequest);
router.post("/handleRequest", handleRequest);
router.post("/requestsSent", getRequestsSent);
router.post("/requestReceived", getRequestsReceived);

export default router;
