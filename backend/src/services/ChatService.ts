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

export class ChatService {
  static async getOrCreateConversation(userId1: number, userId2: number) {
    const expectedDistinctUsers = userId1 === userId2 ? 1 : 2;

    const participantInfo: any = await ConversationParticipant.findAll({
      where: {
        userId: { [Op.in]: [userId1, userId2] },
      },
      attributes: ["conversationId"],
      raw: true,
    });

    const convIds = participantInfo.map((p: any) => p.conversationId);

    if (convIds.length > 0) {
      const existingConv = await Conversation.findOne({
        where: {
          id: { [Op.in]: convIds },
          isGroup: false,
        },
        include: [
          {
            model: ConversationParticipant,
            as: "participants",
            attributes: ["userId"],
          },
        ],
      });

      if (
        existingConv &&
        existingConv.participants.length === expectedDistinctUsers
      ) {
        return existingConv;
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

    return newConversation;
  }

  static async getConversationById(id: number) {
    return Conversation.findByPk(id);
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

    const message = await ChatMessage.create({
      senderId,
      conversationId,
      content,
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
    if (!message) throw new Error("Message not found");

    const participant = await ConversationParticipant.findOne({
      where: { conversationId: message.conversationId, userId: senderId },
    });

    if (
      Number(message.senderId) !== Number(senderId) &&
      (!participant || participant.role === "Member")
    ) {
      throw new Error("Unauthorized to delete");
    }

    await message.destroy();
    return messageId;
  }

  static async getConversations(userId: number) {
    const conversations = await Conversation.findAll({
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

    return Promise.all(
      filtered.map(async (conv) => {
        try {
          const plain = conv.get({ plain: true });

          // Ensure members are included in the plain object
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
          return conv.get({ plain: true }); // Fallback to basic data
        }
      }),
    );
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

  static async getGroupConversations(userId?: number) {
    const groups = await Conversation.findAll({
      where: { isGroup: true, isActive: true },
      include: [
        { model: ConversationParticipant, as: "participants", attributes: ["userId", "role"] },
      ],
      order: [["createdAt", "DESC"]],
    });

    if (userId) {
      return groups.map((g) => {
        const plain = g.get({ plain: true });
        plain.isJoined = plain.participants?.some(
          (p: any) => p.userId === userId,
        );
        plain.memberRole = plain.participants?.find(
          (p: any) => p.userId === userId,
        )?.role;
        delete plain.participants;
        return plain;
      });
    }
    return groups;
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

  static async updateGroupConversation(id: number, data: any) {
    const group = await Conversation.findByPk(id);
    if (!group || !group.isGroup) throw new AppError("Group not found", 404);

    await group.update({
      name: data.name || group.name,
      description: data.description || group.description,
      country: data.country || group.country,
      category: data.category || group.category,
      groupType: data.groupType || group.groupType,
    });

    return group;
  }

  static async deleteGroupConversation(id: number) {
    const group = await Conversation.findByPk(id);
    if (!group || !group.isGroup) throw new AppError("Group not found", 404);

    // Delete participants and messages first
    await ConversationParticipant.destroy({ where: { conversationId: id } });
    await ChatMessage.destroy({ where: { conversationId: id } });
    await group.destroy();

    return true;
  }
}
