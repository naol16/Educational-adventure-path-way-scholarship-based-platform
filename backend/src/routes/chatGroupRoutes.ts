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
        console.log('[chatGroupRoutes] POST /api/groups request by user:', req.user);
        console.log('[chatGroupRoutes] POST /api/groups body:', req.body);
        const { name, country, description } = req.body;
        if (!name || !country) {
            return res.status(400).json({ status: "error", message: "Name and Country are required" });
        }
        const group = await ChatService.createGroupConversation(req.user!.id, { name, country, description });
        res.status(201).json({ status: "success", data: group });
    } catch (err: any) {
        console.error('[chatGroupRoutes] Error in POST /api/groups ->', err?.stack || err);
        res.status(500).json({ status: "error", message: err.message });
    }
});

/**
 * @route GET /api/groups
 * @desc List all group conversations
 */
router.get("/", authenticate, async (req, res) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const { data, total, hasMore } = await ChatService.getGroupConversations(req.user!.id, page, limit);
        res.status(200).json({ 
            status: "success", 
            data,
            pagination: { page, limit, total, hasMore }
        });
    } catch (err: any) {
        console.error('[chatGroupRoutes] Error in GET /api/groups ->', err?.stack || err);
        res.status(500).json({ status: "error", message: err.message });
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
            return res.status(400).json({ status: "error", message: "Invalid Group ID" });
        }
        const participant = await ChatService.joinGroup(req.user!.id, conversationId);
        res.status(200).json({ status: "success", data: participant });
    } catch (err: any) {
        console.error('[chatGroupRoutes] Error in POST /api/groups/:id/join ->', err?.stack || err);
        res.status(500).json({ status: "error", message: err.message });
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
            return res.status(400).json({ status: "error", message: "Invalid Group ID" });
        }
        await ChatService.leaveGroup(req.user!.id, conversationId);
        res.status(200).json({ status: "success", message: "Left group successfully" });
    } catch (err: any) {
        console.error('[chatGroupRoutes] Error in DELETE /api/groups/:id/leave ->', err?.stack || err);
        res.status(500).json({ status: "error", message: err.message });
    }
});

router.post("/:id/leave", authenticate, async (req, res) => {
    try {
        const conversationId = parseInt(req.params.id as string);
        if (isNaN(conversationId)) {
            return res.status(400).json({ status: "error", message: "Invalid Group ID" });
        }
        await ChatService.leaveGroup(req.user!.id, conversationId);
        res.status(200).json({ status: "success", message: "Left group successfully" });
    } catch (err: any) {
        console.error('[chatGroupRoutes] Error in POST /api/groups/:id/leave ->', err?.stack || err);
        res.status(500).json({ status: "error", message: err.message });
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
            return res.status(400).json({ status: "error", message: "Invalid Group ID" });
        }
        const members = await ChatService.getConversationMembers(conversationId);
        res.status(200).json({ status: "success", data: members });
    } catch (err: any) {
        console.error('[chatGroupRoutes] Error in GET /api/groups/:id/members ->', err?.stack || err);
        res.status(500).json({ status: "error", message: err.message });
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
            return res.status(400).json({ status: "error", message: "Invalid Data" });
        }
        
        // Simple authorization: check if current user is admin
        if (req.user!.role !== UserRole.ADMIN) {
             return res.status(403).json({ status: "error", message: "Only admins can add members" });
        }

        const participant = await ChatService.addMemberToGroup(conversationId, userId);
        res.status(200).json({ status: "success", data: participant });
    } catch (err: any) {
        console.error('[chatGroupRoutes] Error in POST /api/groups/:id/members ->', err?.stack || err);
        res.status(500).json({ status: "error", message: err.message });
    }
});

/**
 * @route GET /api/groups/:id
 * @desc Get group details
 */
router.get("/:id", authenticate, async (req, res) => {
    try {
        const conversationId = parseInt(req.params.id as string);
        if (isNaN(conversationId)) {
            return res.status(400).json({ status: "error", message: "Invalid Group ID" });
        }
        const group = await ChatService.getConversationById(conversationId);
        if (!group || !group.isGroup) {
            return res.status(404).json({ status: "error", message: "Group not found" });
        }
        
        // Check if user is a member
        const isMember = await ChatService.checkMembership(req.user!.id, conversationId);
        
        res.status(200).json({ 
            status: "success", 
            data: { ...group.get({ plain: true }), isMember } 
        });
    } catch (err: any) {
        console.error('[chatGroupRoutes] Error in GET /api/groups/:id ->', err?.stack || err);
        res.status(500).json({ status: "error", message: err.message });
    }
});

/**
 * @route GET /api/groups/:id/membership
 * @desc Check if current user is a member
 */
router.get("/:id/membership", authenticate, async (req, res) => {
    try {
        const conversationId = parseInt(req.params.id as string);
        if (isNaN(conversationId)) {
            return res.status(400).json({ status: "error", message: "Invalid Group ID" });
        }
        const isMember = await ChatService.checkMembership(req.user!.id, conversationId);
        res.status(200).json({ status: "success", data: { isMember } });
    } catch (err: any) {
        console.error('[chatGroupRoutes] Error in GET /api/groups/:id/membership ->', err?.stack || err);
        res.status(500).json({ status: "error", message: err.message });
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
            return res.status(400).json({ status: "error", message: "Invalid IDs" });
        }

        // Simple authorization: check if current user is admin
        if (req.user!.role !== UserRole.ADMIN) {
             return res.status(403).json({ status: "error", message: "Only admins can remove members" });
        }

        await ChatService.leaveGroup(userId, conversationId);
        res.status(200).json({ status: "success", message: "Member removed successfully" });
    } catch (err: any) {
        console.error('[chatGroupRoutes] Error in DELETE /api/groups/:id/members/:userId ->', err?.stack || err);
        res.status(500).json({ status: "error", message: err.message });
    }
});

/**
 * @route PUT /api/groups/:id
 * @desc Update a group (Admin only)
 */
router.put("/:id", authenticate, authorize(UserRole.ADMIN), async (req, res) => {
    try {
        const id = parseInt(req.params.id as string);
        const group = await ChatService.updateGroupConversation(id, req.body);
        res.status(200).json({ status: "success", data: group });
    } catch (err: any) {
        console.error('[chatGroupRoutes] Error in PUT /api/groups/:id ->', err?.stack || err);
        res.status(500).json({ status: "error", message: err.message });
    }
});

/**
 * @route DELETE /api/groups/:id
 * @desc Delete a group (Admin only)
 */
router.delete("/:id", authenticate, authorize(UserRole.ADMIN), async (req, res) => {
    try {
        const id = parseInt(req.params.id as string);
        await ChatService.deleteGroupConversation(id);
        res.status(200).json({ status: "success", message: "Group deleted successfully" });
    } catch (err: any) {
        console.error('[chatGroupRoutes] Error in DELETE /api/groups/:id ->', err?.stack || err);
        res.status(500).json({ status: "error", message: err.message });
    }
});
export default router;
