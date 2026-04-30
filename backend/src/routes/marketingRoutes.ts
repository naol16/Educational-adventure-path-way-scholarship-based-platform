import { Router } from "express";
import { MarketingController } from "../controller/MarketingController.js";

const router = Router();

router.get("/landing-page", MarketingController.getLandingPageData);

export default router;
