import { ChatMessage } from "../models/ChatMessage.js";
import { Conversation } from "../models/Conversation.js";
import { ConversationParticipant } from "../models/ConversationParticipant.js";
import { User } from "../models/User.js";
import { Op } from "sequelize";
import { Consultation } from "../models/Consultation.js";
import { sequelize } from "../config/sequelize.js";

export class ChatService {
    /**
     * Get or create a conversation between two users (Student and Counselor)
     * Validates that they have an active booking/consultation.
     */
    static async getOrCreateConversation(userId1: number, userId2: number) {
        const expectedDistinctUsers = userId1 === userId2 ? 1 : 2;

        const participantInfo: any = await ConversationParticipant.findAll({
            where: {
                userId: { [Op.in]: [userId1, userId2] }
            },
            include: [{
                model: Conversation,
                where: { isGroup: false },
                attributes: []
            }],
            attributes: ['conversationId'],
            group: ['conversationId'],
            having: sequelize.literal(`COUNT(DISTINCT "user_id") = ${expectedDistinctUsers}`)
        });

        if (participantInfo.length > 0) {
            const conversationId = participantInfo[0].conversationId;
            const existing = await Conversation.findByPk(conversationId);
            if (existing) return existing;
        }

        // No conversation exists. Validate if they are allowed to chat.
        // Rule: Only allowed if there's a booking between them.
        const studentsId = Math.min(userId1, userId2); // Assumption: student is one, counselor is other
        // Better: Find roles to be sure
        const user1 = await User.findByPk(userId1);
        const user2 = await User.findByPk(userId2);

        if (!user1 || !user2) throw new Error("Users not found");

        const studentId = user1.role === 'student' ? user1.id : (user2.role === 'student' ? user2.id : null);
        const counselorId = user1.role === 'counselor' ? user1.id : (user2.role === 'counselor' ? user2.id : null);

        // Create new
        const conversation = await Conversation.create();
        await ConversationParticipant.create({ conversationId: conversation.id, userId: userId1 });
        if (userId1 !== userId2) {
            await ConversationParticipant.create({ conversationId: conversation.id, userId: userId2 });
        }

        return conversation;
    }

    static async sendMessage(conversationId: number, senderId: number, content: string) {
        const message = await ChatMessage.create({
            conversationId,
            senderId,
            content
        });
        
        // Include sender info for real-time delivery
        return ChatMessage.findByPk(message.id, {
            include: [{ model: User, as: 'sender', attributes: ['id', 'name', 'role'] }]
        });
    }

    static async editMessage(messageId: number, senderId: number, newContent: string) {
        console.log(`[ChatService] Attempting to edit message: id=${messageId}, senderId=${senderId}, newContent=${newContent}`);
        if (!messageId || !senderId) throw new Error("Invalid messageId or senderId");
        
        const message = await ChatMessage.findByPk(messageId);
        if (!message) {
            console.log(`[ChatService] Edit message really not found by PK: ${messageId}`);
            throw new Error("Message not found");
        }
        if (Number(message.senderId) !== Number(senderId)) {
            console.log(`[ChatService] Edit unauthorized: message.senderId=${message.senderId}, requesting senderId=${senderId}`);
            throw new Error("Unauthorized to edit");
        }
        message.content = newContent;
        await message.save();
        return message;
    }

    static async deleteMessage(messageId: number, senderId: number) {
        console.log(`[ChatService] Attempting to delete message: id=${messageId}, senderId=${senderId}`);
        if (!messageId || !senderId) throw new Error("Invalid messageId or senderId");
        
        const message = await ChatMessage.findByPk(messageId);
        if (!message) {
            console.log(`[ChatService] Delete message really not found by PK: ${messageId}`);
            throw new Error("Message not found");
        }
        if (Number(message.senderId) !== Number(senderId)) {
            console.log(`[ChatService] Delete unauthorized: message.senderId=${message.senderId}, requesting senderId=${senderId}`);
            throw new Error("Unauthorized to delete");
        }
        await message.destroy();
        return messageId;
    }

    static async getConversations(userId: number) {
        const conversations = await Conversation.findAll({
            attributes: {
                include: [
                    'isGroup', 'name', 'country', 'description',
                    [
                        sequelize.literal(`(
                            SELECT COUNT(*)
                            FROM "chat_messages" AS "msg"
                            WHERE "msg"."conversation_id" = "Conversation"."id"
                            AND "msg"."sender_id" != ${userId}
                            AND "msg"."is_read" = false
                        )`),
                        'unreadCount'
                    ]
                ]
            },
            include: [
                {
                    model: ConversationParticipant,
                    where: { userId },
                    attributes: [] // Don't need the pivot itself
                },
                {
                    model: User,
                    as: 'members',
                    through: { attributes: [] }, // Get other participants
                    attributes: ['id', 'name', 'role', 'email']
                },
                {
                    model: ChatMessage,
                    limit: 1,
                    order: [['created_at', 'DESC']],
                    attributes: ['content', 'createdAt']
                }
            ],
            order: [['updatedAt', 'DESC']]
        });

        // Deduplicate personal conversations by participant pair
        const seenOtherUserIds = new Set<number>();
        const conversationMap = new Map<number, any>();

        return conversations.filter(conv => {
            // Always keep group chats
            if (conv.isGroup) return true;

            // For DMs, ensure we only show one per "other person"
            const members = (conv as any).members || [];
            const otherUser = members.find((m: any) => m.id !== userId);
            
            // If it's a chat with self (only one member or both are me)
            if (!otherUser) {
                // For self-chats, we still only want one
                if (seenOtherUserIds.has(userId)) return false;
                seenOtherUserIds.add(userId);
                return true;
            }

            if (seenOtherUserIds.has(otherUser.id)) {
                return false;
            }

            seenOtherUserIds.add(otherUser.id);
            return true;
        });
    }

    static async getAvailableUsersToChat(userId: number) {
        return User.findAll({
            where: {
                id: { [Op.ne]: userId }
            },
            attributes: ['id', 'name', 'role', 'email']
        });
    }

    static async getMessages(conversationId: number, limit = 50, offset = 0) {
        const messages = await ChatMessage.findAll({
            where: { conversationId },
            include: [{ model: User, as: 'sender', attributes: ['id', 'name', 'role'] }],
            limit,
            offset,
            order: [['created_at', 'DESC']]
        });

        // Replace content for moderated messages
        return messages.map(m => {
            if (m.isModerated) {
                m.content = `[Message Removed: ${m.moderationReason || 'Violated Community Guidelines'}]`;
            }
            return m;
        });
    }

    static async markAsDelivered(messageId: number) {
        return ChatMessage.update(
            { 
                isDelivered: true, 
                deliveredAt: new Date() 
            },
            { where: { id: messageId, isDelivered: false } }
        );
    }

    static async markAsRead(conversationId: number, userId: number) {
        const now = new Date();
        return ChatMessage.update(
            { 
                isRead: true,
                readAt: now
            },
            {
                where: {
                    conversationId,
                    senderId: { [Op.ne]: userId },
                    isRead: false
                }
            }
        );
    }

    /**
     * Get all members of a conversation
     */
    static async getConversationMembers(conversationId: number) {
        const conversation = await Conversation.findByPk(conversationId, {
            include: [{
                model: User,
                as: 'members',
                attributes: ['id', 'name', 'role', 'email'],
                through: { attributes: [] }
            }]
        });
        
        const members = (conversation as any)?.members || [];
        
        // Deduplicate by ID just in case there are multiple participant entries
        const uniqueMembers = Array.from(new Map(members.map((m: any) => [m.id, m])).values());
        
        return uniqueMembers;
    }

    /**
     * Add a member to a group conversation
     */
    static async addMemberToGroup(conversationId: number, userId: number) {
        const conversation = await Conversation.findByPk(conversationId);
        if (!conversation || !conversation.isGroup) {
            throw new Error("Group conversation not found");
        }

        // Check if already a participant
        const existing = await ConversationParticipant.findOne({
            where: { userId, conversationId }
        });

        if (existing) return existing;

        return ConversationParticipant.create({ userId, conversationId });
    }

    /**
     * Create a group conversation (Admin only)
     */
    static async createGroupConversation(adminId: number, data: { name: string, country: string, description?: string }) {
        const conversation = await Conversation.create({
            isGroup: true,
            name: data.name,
            country: data.country,
            description: data.description,
            createdBy: adminId
        });

        // Automatically add the creator as a participant so they can see the chat
        await ConversationParticipant.create({
            conversationId: conversation.id,
            userId: adminId
        });

        return conversation;
    }

    /**
     * Join a group conversation
     */
    static async joinGroup(userId: number, conversationId: number) {
        const conversation = await Conversation.findByPk(conversationId);
        if (!conversation || !conversation.isGroup) {
            throw new Error("Group conversation not found");
        }

        // Check if already a participant
        const existing = await ConversationParticipant.findOne({
            where: { userId, conversationId }
        });

        if (existing) return existing;

        return ConversationParticipant.create({ userId, conversationId });
    }

    /**
     * Leave a group conversation
     */
    static async leaveGroup(userId: number, conversationId: number) {
        return ConversationParticipant.destroy({
            where: { userId, conversationId }
        });
    }

    /**
     * Get all available group conversations with membership status
     */
    static async getGroupConversations(userId?: number) {
        return Conversation.findAll({
            where: { isGroup: true },
            attributes: {
                include: userId ? [
                    [
                        sequelize.literal(`EXISTS(
                            SELECT 1 FROM "conversation_participants" 
                            WHERE "conversation_id" = "Conversation"."id" 
                            AND "user_id" = ${userId}
                        )`),
                        'isJoined'
                    ]
                ] : []
            },
            include: [
                {
                    model: User,
                    as: 'creator',
                    attributes: ['id', 'name']
                }
            ]
        });
    }
}
