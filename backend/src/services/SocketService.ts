import { Server as SocketIOServer } from "socket.io";
import { Server as HTTPServer } from "http";
import jwt from "jsonwebtoken";
import configs from "../config/configs.js";
import { ChatService } from "./ChatService.js";
import { createAdapter } from "@socket.io/redis-adapter";
import { redisConnection } from "../config/redis.js";

export class SocketService {
    private static io: SocketIOServer;
    private static userSockets = new Map<number, string[]>(); // userId -> socketIds[]

    static initialize(server: HTTPServer) {
        this.io = new SocketIOServer(server, {
            cors: {
                origin: "*", // Adjust in production
                methods: ["GET", "POST"]
            }
        });

        // Redis Adapter for scaling
        const pubClient = redisConnection;
        const subClient = pubClient.duplicate();
        this.io.adapter(createAdapter(pubClient, subClient));

        this.io.use((socket, next) => {
            const token = socket.handshake.auth.token || socket.handshake.query.token;
            if (!token) return next(new Error("Authentication error"));

            try {
                const decoded = jwt.verify(token, configs.JWT_SECRET!) as any;
                (socket as any).userId = decoded.id;
                next();
            } catch (err) {
                next(new Error("Authentication error"));
            }
        });

        this.io.on("connection", async (socket) => {
            const userId = (socket as any).userId;
            
            // Add to tracking
            const currentSockets = this.userSockets.get(userId) || [];
            this.userSockets.set(userId, [...currentSockets, socket.id]);

            // Broadcast online status
            this.io.emit("user_online", userId);

            socket.on("join_conversation", (conversationId: number) => {
                socket.join(`conversation_${conversationId}`);
            });

            socket.on("send_message", async (data: { conversationId: number; receiverId: number; content: string }) => {
                try {
                    const message = await ChatService.sendMessage(data.conversationId, userId, data.content);
                    if (!message) return;

                    // Broadcast to conversation room
                    this.io.to(`conversation_${data.conversationId}`).emit("receive_message", message);
                    
                    // Mark as delivered for the receiver (if online)
                    const receiverSockets = this.userSockets.get(data.receiverId);
                    if (receiverSockets && receiverSockets.length > 0) {
                        await ChatService.markAsDelivered(message.id);
                        this.io.to(`conversation_${data.conversationId}`).emit("message_delivered", {
                            messageId: message.id,
                            conversationId: data.conversationId,
                            deliveredAt: new Date()
                        });
                    }

                    // Direct alert for mobile/outside-room notifications
                    if (receiverSockets) {
                        receiverSockets.forEach(sid => {
                            this.io.to(sid).emit("new_message_alert", {
                                conversationId: data.conversationId,
                                senderName: (message as any).sender?.name || "Someone",
                                content: data.content
                            });
                        });
                    }
                } catch (err) {
                    console.error("[Socket] send_message error:", err);
                }
            });

            socket.on("mark_read", async (data: { conversationId: number; messageId?: number }) => {
                try {
                    await ChatService.markAsRead(data.conversationId, userId);
                    this.io.to(`conversation_${data.conversationId}`).emit("messages_read", {
                        conversationId: data.conversationId,
                        readerId: userId,
                        readAt: new Date()
                    });
                } catch (err) {
                    console.error("[Socket] mark_read error:", err);
                }
            });

            socket.on("edit_message", async (data: { messageId: number; conversationId: number; content: string }) => {
                try {
                    await ChatService.editMessage(data.messageId, userId, data.content);
                    this.io.to(`conversation_${data.conversationId}`).emit("message_edited", {
                        messageId: data.messageId,
                        conversationId: data.conversationId,
                        content: data.content
                    });
                } catch (err) {
                    console.error("[Socket] edit_message error:", err);
                }
            });

            socket.on("delete_message", async (data: { messageId: number; conversationId: number }) => {
                try {
                    await ChatService.deleteMessage(data.messageId, userId);
                    this.io.to(`conversation_${data.conversationId}`).emit("message_deleted", {
                        messageId: data.messageId,
                        conversationId: data.conversationId
                    });
                } catch (err) {
                    console.error("[Socket] delete_message error:", err);
                }
            });

            socket.on("typing", (data: { conversationId: number; isTyping: boolean }) => {
                socket.to(`conversation_${data.conversationId}`).emit("user_typing", {
                    userId,
                    isTyping: data.isTyping
                });
            });

            socket.on("disconnect", () => {
                const sockets = this.userSockets.get(userId) || [];
                const remaining = sockets.filter(sid => sid !== socket.id);
                
                if (remaining.length === 0) {
                    this.userSockets.delete(userId);
                    this.io.emit("user_offline", userId);
                } else {
                    this.userSockets.set(userId, remaining);
                }
            });
        });

        return this.io;
    }

    static getIO() {
        if (!this.io) throw new Error("Socket.io not initialized");
        return this.io;
    }
}
