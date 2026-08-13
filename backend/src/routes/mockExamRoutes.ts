import { Router } from "express";
import { MockExamController } from "../controller/MockExamController.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = Router();

// Apply authenticate middleware to protect all mock exam routes
router.post("/generate", authenticate, MockExamController.generate);
router.post("/evaluate", authenticate, MockExamController.evaluate);
router.get("/result/:examId", authenticate, MockExamController.getResult);

export default router;
