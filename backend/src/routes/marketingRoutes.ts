import { Router } from "express";
import { MarketingController } from "../controller/MarketingController.js";
import { ContactController } from "../controller/ContactController.js";

const router = Router();

router.get("/landing-page", MarketingController.getLandingPageData);
router.post("/contact", ContactController.submitForm);

export default router;
