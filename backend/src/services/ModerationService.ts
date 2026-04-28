import { User } from "../models/User.js";
import { ChatMessage } from "../models/ChatMessage.js";
import { UserWarning } from "../models/UserWarning.js";
import { MessageReport } from "../models/MessageReport.js";
import { SocketService } from "./SocketService.js";

export class ModerationService {
    /**
     * Warn a user
     */
    static async warnUser(adminId: number, userId: number, reason: string, conversationId?: number) {
        const warning = await UserWarning.create({
            adminId,
            userId,
            reason
        });

        if (conversationId) {
            const user = await User.findByPk(userId);
            const admin = await User.findByPk(adminId);
            
            await ChatMessage.create({
                conversationId,
                senderId: adminId,
                content: `[SYSTEM: User ${user?.name || 'Student'} has been issued a formal warning for: ${reason}]`,
                isRead: false
            });
        }

        return warning;
    }

    /**
     * Remove a message (Moderate it)
     */
    static async removeMessage(messageId: number, reason: string) {
        const message = await ChatMessage.findByPk(messageId);
        if (!message) throw new Error("Message not found");

        await message.update({
            isModerated: true,
            moderationReason: reason,
            content: `[Message Removed: ${reason}]`
        });

        // Emit real-time update to the room
        SocketService.getIO().to(`conversation_${message.conversationId}`).emit('message_moderated', {
            messageId: message.id,
            newContent: message.content,
            reason
        });

        return message;
    }

    /**
     * Report a message (Student action)
     */
    static async reportMessage(reporterId: number, messageId: number, reason: string) {
        return MessageReport.create({
            reporterId,
            messageId,
            reason
        });
    }

    /**
     * Get all reports (Admin only)
     */
    static async getReports() {
        return MessageReport.findAll({
            where: { status: 'PENDING' },
            include: [
                { model: User, as: 'reporter', attributes: ['id', 'name'] },
                { model: ChatMessage, include: [{ model: User, as: 'sender', attributes: ['id', 'name'] }] }
            ],
            order: [['created_at', 'DESC']]
        });
    }

    /**
     * Suspend a user account
     */
    static async suspendUser(userId: number) {
        const user = await User.findByPk(userId);
        if (!user) throw new Error("User not found");

        return user.update({ isActive: false });
    }

    /**
     * Get user warnings
     */
    static async getUserWarnings(userId: number) {
        return UserWarning.findAll({
            where: { userId },
            include: [{ model: User, as: 'admin', attributes: ['id', 'name'] }],
            order: [['created_at', 'DESC']]
        });
    }
}
