import {
  ChatMessage,
  Conversation,
  ConversationParticipant,
  User,
} from "../models/index.js";
import { Op } from "sequelize";
import { Consultation } from "../models/Consultation.js";
import { sequelize } from "../config/sequelize.js";
import { AppError } from "../errors/AppError.js";
import { Sanitizer } from "../utils/sanitizer.js";

export class ChatService {
  static async getOrCreateConversation(userId1: number, userId2: number) {
    const expectedDistinctUsers = userId1 === userId2 ? 1 : 2;

    // Find conversations where BOTH users are participants
    // 1. Get all conversation IDs for userId1
    const user1Convs = await ConversationParticipant.findAll({
      where: { userId: userId1 },
      attributes: ["conversationId"],
      raw: true,
    });
    const user1ConvIds = user1Convs.map((p: any) => p.conversationId);

    if (user1ConvIds.length > 0) {
      // 2. Find a private conversation among those where userId2 is also a participant
      const existingConv = await Conversation.findOne({
        where: {
          id: { [Op.in]: user1ConvIds },
          isGroup: false,
        },
        include: [
          {
            model: ConversationParticipant,
            as: "participants",
            where: { userId: userId2 },
            required: true,
          },
        ],
      });

      if (existingConv) {
         // Re-fetch with full associations
         const fullConv = await Conversation.findByPk(existingConv.id, {
           include: [
             {
               model: ConversationParticipant,
               as: "participants",
               attributes: ["userId"],
             },
             {
               model: User,
               as: "members",
               attributes: ["id", "name", "role", "avatarUrl"],
             },
           ],
         });

         if (fullConv && fullConv.participants.length === expectedDistinctUsers) {
           return fullConv;
         }
      }
    }

    const newConversation = await Conversation.create({ isGroup: false });

    await ConversationParticipant.create({
      conversationId: newConversation.id,
      userId: userId1,
      role: "Member",
    });
    if (userId1 !== userId2) {
      await ConversationParticipant.create({
        conversationId: newConversation.id,
        userId: userId2,
        role: "Member",
      });
    }

    // Return the conversation with participants and members included
    return Conversation.findByPk(newConversation.id, {
      include: [
        {
          model: ConversationParticipant,
          as: "participants",
          attributes: ["userId"],
        },
        {
          model: User,
          as: "members",
          attributes: ["id", "name", "role", "avatarUrl"],
        },
      ],
    });
  }

  static async getConversationById(id: number) {
    return Conversation.findByPk(id, {
      include: [
        {
          model: ConversationParticipant,
          as: "participants",
          attributes: ["userId", "role"],
        },
        {
          model: User,
          as: "members",
          attributes: ["id", "name", "role", "avatarUrl"],
          through: { attributes: ["role"] },
        },
      ],
    });
  }

  static async sendMessage({
    senderId,
    conversationId,
    content,
    replyToId,
    attachmentUrl,
    attachmentType,
    attachmentName,
  }: any) {
    if (!senderId || !conversationId || !content)
      throw new Error("Missing required fields");

    const sanitizedContent = Sanitizer.escapeHTML(content);

    const message = await ChatMessage.create({
      senderId,
      conversationId,
      content: sanitizedContent,
      replyToId,
      attachmentUrl,
      attachmentType,
      isRead: false,
      isDelivered: false,
    });

    await Conversation.update(
      { updatedAt: new Date() },
      { where: { id: conversationId } },
    );

    return ChatMessage.findByPk(message.id, {
      include: [
        {
          model: User,
          as: "sender",
          attributes: ["id", "name", "avatarUrl", "role"],
        },
        {
          model: ChatMessage,
          as: "repliedTo",
          include: [{ model: User, as: "sender", attributes: ["id", "name"] }],
        },
      ],
    });
  }

  static async createGroupConversation(
    creatorId: number,
    { name, description, country, category, groupType }: any,
  ) {
    const conversation = await Conversation.create({
      isGroup: true,
      name,
      description,
      country,
      category: category || "General",
      groupType: groupType || "Public",
      createdBy: creatorId,
    });

    await ConversationParticipant.create({
      conversationId: conversation.id,
      userId: creatorId,
      role: "Admin",
    });

    return conversation;
  }

  static async editMessage(
    messageId: number,
    senderId: number,
    newContent: string,
  ) {
    const message = await ChatMessage.findByPk(messageId);
    if (!message) throw new Error("Message not found");
    if (Number(message.senderId) !== Number(senderId))
      throw new Error("Unauthorized to edit");

    message.content = newContent;
    message.isEdited = true;
    await message.save();
    return message;
  }

  static async deleteMessage(messageId: number, senderId: number) {
    const message = await ChatMessage.findByPk(messageId);
    if (!message) return messageId; // Already deleted, consider it success

    const participant = await ConversationParticipant.findOne({
      where: { conversationId: message.conversationId, userId: senderId },
    });

    if (!participant) {
      throw new AppError("Unauthorized to delete this message", 403);
    }

    await message.destroy();
    return messageId;
  }

  static async getConversations(userId: number, page: number = 1, limit: number = 20) {
    const offset = (page - 1) * limit;

    // We fetch a bit more to handle the in-memory deduplication if necessary, 
    // but ideally deduplication should happen in the query.
    // For now, let's just paginate the database query.
    const { rows: conversations, count: totalCount } = await Conversation.findAndCountAll({
      include: [
        {
          model: ConversationParticipant,
          as: "participants",
          where: { userId },
          attributes: ["role", "isMuted"],
        },
        {
          model: User,
          as: "members",
          attributes: ["id", "name", "role", "avatarUrl"],
          through: { attributes: ["role"] },
        },
      ],
      order: [["updatedAt", "DESC"]],
      limit,
      offset,
      distinct: true // Important for correct count with includes
    });

    const seenOtherUserIds = new Set<number>();

    const filtered = conversations.filter((conv) => {
      if (conv.isGroup) return true;
      const members = (conv as any).members || [];
      const otherUser = members.find((m: any) => m.id !== userId);
      if (!otherUser) {
        if (seenOtherUserIds.has(userId)) return false;
        seenOtherUserIds.add(userId);
        return true;
      }
      if (seenOtherUserIds.has(otherUser.id)) return false;
      seenOtherUserIds.add(otherUser.id);
      return true;
    });

    const data = await Promise.all(
      filtered.map(async (conv) => {
        try {
          const plain = conv.get({ plain: true });

          if (!plain.members && (conv as any).members) {
            plain.members = ((conv as any).members as any[]).map((m) => ({
              id: m.id,
              name: m.name,
              role: m.role,
              avatarUrl: m.avatarUrl,
            }));
          }

          const lastMessage = await ChatMessage.findOne({
            where: { conversationId: conv.id },
            order: [["createdAt", "DESC"]],
            include: [{ model: User, as: "sender", attributes: ["name"] }],
          });

          plain.messages = lastMessage ? [lastMessage] : [];

          plain.unreadCount = await ChatMessage.count({
            where: {
              conversationId: conv.id,
              senderId: { [Op.ne]: userId },
              isRead: false,
            },
          });

          return plain;
        } catch (err) {
          console.error(`[ChatService] Error processing conversation ${conv.id}:`, err);
          return conv.get({ plain: true });
        }
      }),
    );

    return {
      data,
      total: totalCount,
      hasMore: offset + conversations.length < totalCount
    };
  }

  static async getAvailableUsersToChat(userId: number) {
    return User.findAll({
      where: {
        id: { [Op.ne]: userId },
      },
      attributes: ["id", "name", "role", "email", "avatarUrl"],
    });
  }

  static async getMessages(conversationId: number, limit = 50, offset = 0) {
    const messages = await ChatMessage.findAll({
      where: { conversationId },
      include: [
        {
          model: User,
          as: "sender",
          attributes: ["id", "name", "role", "avatarUrl"],
        },
        {
          model: ChatMessage,
          as: "repliedTo",
          include: [{ model: User, as: "sender", attributes: ["id", "name"] }],
        },
      ],
      limit,
      offset,
      order: [["createdAt", "DESC"]],
    });

    return messages.map((m) => {
      if (m.isModerated) {
        m.content = `[Message Removed: ${m.moderationReason || "Violated Community Guidelines"}]`;
      }
      return m;
    });
  }

  static async markAsDelivered(messageId: number) {
    return ChatMessage.update(
      { isDelivered: true, deliveredAt: new Date() },
      { where: { id: messageId, isDelivered: false } },
    );
  }

  static async markAsRead(conversationId: number, userId: number) {
    return ChatMessage.update(
      { isRead: true, readAt: new Date() },
      {
        where: {
          conversationId,
          senderId: { [Op.ne]: userId },
          isRead: false,
        },
      },
    );
  }

  static async toggleNotifications(
    conversationId: number,
    userId: number,
    enabled: boolean,
  ) {
    const participant = await ConversationParticipant.findOne({
      where: { conversationId, userId },
    });

    if (!participant) {
      throw new AppError("Participant not found", 404);
    }

    participant.isMuted = !enabled;
    await participant.save();
    return participant;
  }

  /** User rows for clients (not raw participant rows). */
  static async getConversationMembers(conversationId: number) {
    const rows = await ConversationParticipant.findAll({
      where: { conversationId },
      include: [
        {
          model: User,
          attributes: ["id", "name", "role", "avatarUrl"],
        },
      ],
    });
    return rows
      .map((p) => {
        const plain = p.get({ plain: true }) as Record<string, unknown>;
        const u = (plain.user || plain.User) as
          | Record<string, unknown>
          | undefined;
        if (!u || typeof u.id !== "number") return null;
        return {
          id: u.id as number,
          name: u.name as string,
          role: u.role as string,
          avatarUrl: u.avatarUrl as string | undefined,
        };
      })
      .filter(Boolean);
  }

  /** Everyone in the thread except the sender (DM and group). */
  static async getRecipientUserIdsExcludingSender(
    conversationId: number,
    senderId: number,
  ): Promise<number[]> {
    const rows = await ConversationParticipant.findAll({
      where: { conversationId, userId: { [Op.ne]: senderId } },
      attributes: ["userId"],
      raw: true,
    });
    return (rows as { userId: number }[]).map((r) => Number(r.userId));
  }

  static async addMemberToGroup(conversationId: number, userId: number) {
    const conversation = await Conversation.findByPk(conversationId);
    if (!conversation?.isGroup) throw new Error("Not a group conversation");

    const existing = await ConversationParticipant.findOne({
      where: { userId, conversationId },
    });
    if (existing) return existing;

    return ConversationParticipant.create({
      userId,
      conversationId,
      role: "Member",
    });
  }

  /** Remove a direct conversation the user belongs to (not used for groups). */
  static async deleteConversation(conversationId: number, userId: number) {
    const conversation = await Conversation.findByPk(conversationId);
    if (!conversation) throw new AppError("Conversation not found", 404);
    if (conversation.isGroup)
      throw new AppError("Leave the group instead of deleting", 400);

    const participant = await ConversationParticipant.findOne({
      where: { conversationId, userId },
    });
    if (!participant) throw new AppError("Not a participant", 403);

    await conversation.destroy();
  }

  static async joinGroup(userId: number, conversationId: number) {
    const conversation = await Conversation.findByPk(conversationId);
    if (!conversation || !conversation.isGroup)
      throw new Error("Group conversation not found");

    const existing = await ConversationParticipant.findOne({
      where: { userId, conversationId },
    });
    if (existing) return existing;

    return ConversationParticipant.create({
      userId,
      conversationId,
      role: "Member",
    });
  }

  static async getGroupConversations(userId?: number, page: number = 1, limit: number = 20) {
    const offset = (page - 1) * limit;

    const { rows: groups, count: totalCount } = await Conversation.findAndCountAll({
      where: { isGroup: true, isActive: true },
      include: [
        { model: ConversationParticipant, as: "participants", attributes: ["userId", "role"] },
        {
          model: User,
          as: "members",
          attributes: ["id", "name", "role", "avatarUrl"],
          through: { attributes: ["role"] },
        },
      ],
      order: [["createdAt", "DESC"]],
      limit,
      offset,
      distinct: true
    });

    let data = groups;
    if (userId) {
      data = groups.map((g) => {
        const plain = g.get({ plain: true });
        plain.isJoined = plain.participants?.some(
          (p: any) => p.userId === userId,
        );
        plain.memberRole = plain.participants?.find(
          (p: any) => p.userId === userId,
        )?.role;
        delete plain.participants;
        return plain;
      }) as any;
    }

    return {
      data,
      total: totalCount,
      hasMore: offset + groups.length < totalCount
    };
  }

  static async leaveGroup(userId: number, conversationId: number) {
    return ConversationParticipant.destroy({
      where: { userId, conversationId },
    });
  }

  /**
   * Checks if a user is a member of a conversation
   */
  static async checkMembership(userId: number, conversationId: number) {
    const participant = await ConversationParticipant.findOne({
      where: { userId, conversationId },
    });
    return !!participant;
  }

  /**
   * Update a group conversation (Admin only)
   */
  static async updateGroupConversation(id: number, data: any) {
    const group = await Conversation.findByPk(id);
    if (!group || !group.isGroup) throw new AppError("Group not found", 404);
    
    return group.update(data);
  }

  /**
   * Delete a group conversation (Admin only)
   */
  static async deleteGroupConversation(id: number) {
    const group = await Conversation.findByPk(id);
    if (!group || !group.isGroup) throw new AppError("Group not found", 404);
    
    await group.destroy();
  }
}
