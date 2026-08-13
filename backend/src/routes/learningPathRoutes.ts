import { Router } from "express";
import { LearningPathController } from "../controller/LearningPathController.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = Router();

router.get("/my-path", authenticate, LearningPathController.getMyPath);
router.get(
  "/toefl-missions",
  authenticate,
  LearningPathController.getToeflMissionsWithResources,
);
router.post("/track", authenticate, LearningPathController.markComplete);
router.post(
  "/complete-section",
  authenticate,
  LearningPathController.markSectionComplete,
);
router.post(
  "/speaking/evaluate",
  authenticate,
  LearningPathController.evaluateSpeaking,
);
router.post(
  "/unit-test/generate",
  authenticate,
  LearningPathController.generateUnitTest,
);
router.post(
  "/unit-test/submit",
  authenticate,
  LearningPathController.submitUnitTest,
);
router.post(
  "/mission/generate-dynamic",
  authenticate,
  LearningPathController.generateDynamicMission,
);

export default router;
