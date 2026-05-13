import { Response, NextFunction } from "express";
import { ConversationParticipant } from "../models/index.js";
import { AuthRequest } from "../types/authTypes.js";

/**
 * Middleware to check if the user is a member of the group/conversation.
 * Used for endpoints that require membership (like sending messages).
 */
export const isGroupMember = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const conversationId = parseInt(req.params.id || req.body.conversationId);
        const userId = req.user?.id;

        if (!conversationId || !userId) {
            return res.status(400).json({ status: "error", message: "Invalid request: Missing IDs" });
        }

        const participant = await ConversationParticipant.findOne({
            where: {
                conversationId,
                userId
            }
        });

        if (!participant) {
            return res.status(403).json({ 
                status: "error", 
                message: "Membership required", 
                code: "MEMBERSHIP_REQUIRED" 
            });
        }

        // Attach participant info to request for later use if needed
        (req as any).participant = participant;
        next();
    } catch (error: any) {
        console.error("[isGroupMember Middleware Error]:", error);
        res.status(500).json({ status: "error", message: error.message });
    }
};
