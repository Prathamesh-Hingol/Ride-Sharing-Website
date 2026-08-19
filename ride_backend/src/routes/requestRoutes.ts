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
router.get("/requestsSent", getRequestsSent);
router.get("/requestsReceived", getRequestsReceived);

export default router;
