import { Router } from "express";
import { authenticate, authorize } from "../middlewares/authMiddleware.js";
import { ModerationService } from "../services/ModerationService.js";
import { UserRole } from "../types/userTypes.js";

const router = Router();

// All routes here are Admin only
router.use(authenticate, authorize(UserRole.ADMIN));

/**
 * @route POST /api/moderation/warn
 * @desc Warn a user
 */
router.post("/warn", async (req, res) => {
    try {
        const { userId, reason, conversationId } = req.body;
        if (!userId || !reason) {
            return res.status(400).json({ success: false, error: "userId and reason are required" });
        }
        const warning = await ModerationService.warnUser(req.user!.id, userId, reason, conversationId);
        res.status(201).json({ success: true, data: warning });
    } catch (err: any) {
        res.status(500).json({ success: false, error: err.message });
    }
});

/**
 * @route POST /api/moderation/message/:id
 * @desc Moderate (remove) a message
 */
router.post("/message/:id", async (req, res) => {
    try {
        const messageId = parseInt(req.params.id as string);
        if (isNaN(messageId)) {
            return res.status(400).json({ success: false, error: "Invalid message ID" });
        }
        const { reason } = req.body;
        if (!reason) {
            return res.status(400).json({ success: false, error: "Reason is required" });
        }
        const message = await ModerationService.removeMessage(messageId, reason);
        res.status(200).json({ success: true, data: message });
    } catch (err: any) {
        res.status(500).json({ success: false, error: err.message });
    }
});

/**
 * @route POST /api/moderation/suspend/:userId
 * @desc Suspend a user account
 */
router.post("/suspend/:userId", async (req, res) => {
    try {
        const userId = parseInt(req.params.userId as string);
        if (isNaN(userId)) {
            return res.status(400).json({ success: false, error: "Invalid user ID" });
        }
        await ModerationService.suspendUser(userId);
        res.status(200).json({ success: true, message: "User suspended successfully" });
    } catch (err: any) {
        res.status(500).json({ success: false, error: err.message });
    }
});

/**
 * @route POST /api/moderation/report
 * @desc Report a message
 */
router.post("/report", authenticate, async (req, res) => {
    try {
        const { messageId, reason } = req.body;
        if (!messageId || !reason) {
            return res.status(400).json({ success: false, error: "Message ID and Reason are required" });
        }
        const report = await ModerationService.reportMessage(req.user!.id, messageId, reason);
        res.status(201).json({ success: true, data: report });
    } catch (err: any) {
        res.status(500).json({ success: false, error: err.message });
    }
});

/**
 * @route GET /api/moderation/reports
 * @desc Get all pending reports (Admin only)
 */
router.get("/reports", authenticate, authorize(UserRole.ADMIN), async (req, res) => {
    try {
        const reports = await ModerationService.getReports();
        res.status(200).json({ success: true, data: reports });
    } catch (err: any) {
        res.status(500).json({ success: false, error: err.message });
    }
});

export default router;
