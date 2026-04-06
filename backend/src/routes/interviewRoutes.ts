import { Router } from "express";
import { InterviewController } from "../controller/InterviewController.js";
import { authenticate, authorize } from "../middlewares/authMiddleware.js";
import { UserRole } from "../types/userTypes.js";

const router = Router();

router.use(authenticate, authorize(UserRole.STUDENT));

router.post("/generate", InterviewController.generate);
router.get("/session/:interview_id", InterviewController.getSession);
router.post("/submit", InterviewController.submit);

export default router;
