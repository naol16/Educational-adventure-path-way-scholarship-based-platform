import { Router } from "express";
import { authenticate, authorize } from "../middlewares/authMiddleware.js";
import { ChatService } from "../services/ChatService.js";
import { UserRole } from "../types/userTypes.js";

const router = Router();

/**
 * @route POST /api/groups
 * @desc Create a group conversation (Admin only)
 */
router.post("/", authenticate, authorize(UserRole.ADMIN), async (req, res) => {
    try {
        const { name, country, description } = req.body;
        if (!name || !country) {
            return res.status(400).json({ success: false, error: "Name and Country are required" });
        }
        const group = await ChatService.createGroupConversation(req.user!.id, { name, country, description });
        res.status(201).json({ success: true, data: group });
    } catch (err: any) {
        res.status(500).json({ success: false, error: err.message });
    }
});

/**
 * @route GET /api/groups
 * @desc List all group conversations
 */
router.get("/", authenticate, async (req, res) => {
    try {
        const groups = await ChatService.getGroupConversations(req.user!.id);
        res.status(200).json({ success: true, data: groups });
    } catch (err: any) {
        res.status(500).json({ success: false, error: err.message });
    }
});

/**
 * @route POST /api/groups/:id/join
 * @desc Join a group conversation
 */
router.post("/:id/join", authenticate, async (req, res) => {
    try {
        const conversationId = parseInt(req.params.id as string);
        if (isNaN(conversationId)) {
            return res.status(400).json({ success: false, error: "Invalid Group ID" });
        }
        const participant = await ChatService.joinGroup(req.user!.id, conversationId);
        res.status(200).json({ success: true, data: participant });
    } catch (err: any) {
        res.status(500).json({ success: false, error: err.message });
    }
});

/**
 * @route DELETE /api/groups/:id/leave
 * @desc Leave a group conversation
 */
router.delete("/:id/leave", authenticate, async (req, res) => {
    try {
        const conversationId = parseInt(req.params.id as string);
        if (isNaN(conversationId)) {
            return res.status(400).json({ success: false, error: "Invalid Group ID" });
        }
        await ChatService.leaveGroup(req.user!.id, conversationId);
        res.status(200).json({ success: true, message: "Left group successfully" });
    } catch (err: any) {
        res.status(500).json({ success: false, error: err.message });
    }
});

/**
 * @route GET /api/groups/:id/members
 * @desc Get all members of a group
 */
router.get("/:id/members", authenticate, async (req, res) => {
    try {
        const conversationId = parseInt(req.params.id as string);
        if (isNaN(conversationId)) {
            return res.status(400).json({ success: false, error: "Invalid Group ID" });
        }
        const members = await ChatService.getConversationMembers(conversationId);
        res.status(200).json({ success: true, data: members });
    } catch (err: any) {
        res.status(500).json({ success: false, error: err.message });
    }
});

/**
 * @route POST /api/groups/:id/members
 * @desc Add a member to a group (Admin or Creator only)
 */
router.post("/:id/members", authenticate, async (req, res) => {
    try {
        const conversationId = parseInt(req.params.id as string);
        const { userId } = req.body;
        if (isNaN(conversationId) || !userId) {
            return res.status(400).json({ success: false, error: "Invalid Data" });
        }
        
        // Simple authorization: check if current user is admin
        if (req.user!.role !== UserRole.ADMIN) {
             return res.status(403).json({ success: false, error: "Only admins can add members" });
        }

        const participant = await ChatService.addMemberToGroup(conversationId, userId);
        res.status(200).json({ success: true, data: participant });
    } catch (err: any) {
        res.status(500).json({ success: false, error: err.message });
    }
});

/**
 * @route DELETE /api/groups/:id/members/:userId
 * @desc Remove a member from a group (Admin only)
 */
router.delete("/:id/members/:userId", authenticate, async (req, res) => {
    try {
        const conversationId = parseInt(req.params.id as string);
        const userId = parseInt(req.params.userId as string);
        
        if (isNaN(conversationId) || isNaN(userId)) {
            return res.status(400).json({ success: false, error: "Invalid IDs" });
        }

        // Simple authorization: check if current user is admin
        if (req.user!.role !== UserRole.ADMIN) {
             return res.status(403).json({ success: false, error: "Only admins can remove members" });
        }

        await ChatService.leaveGroup(userId, conversationId);
        res.status(200).json({ success: true, message: "Member removed successfully" });
    } catch (err: any) {
        res.status(500).json({ success: false, error: err.message });
    }
});

export default router;
