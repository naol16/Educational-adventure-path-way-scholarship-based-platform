import express from "express";
import { AIChatController } from "../controller/AIChatController.js";
import { optionalAuthenticate } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/history", optionalAuthenticate as any, AIChatController.getHistory);
router.post("/general", optionalAuthenticate as any, AIChatController.askGeneral);
router.post("/scholarship/:id", optionalAuthenticate as any, AIChatController.askScholarship);

export default router;
