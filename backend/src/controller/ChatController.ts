import { Request, Response } from "express";
import { ChatService } from "../services/ChatService.js";
import { catchAsync } from "../utils/catchAsync.js";
import { AppError } from "../errors/AppError.js";

export class ChatController {
    /**
     * POST /messages - Send a message to a user (starts conversation if doesn't exist)
     */
    static sendMessage = catchAsync(async (req: Request, res: Response) => {
        const { receiverId, conversationId, content } = req.body;
        const senderId = (req as any).user.id;

        if ((!receiverId && !conversationId) || !content) {
            throw new AppError("Invalid request. Missing receiverId/conversationId or content.", 400);
        }

        let conversation;
        if (conversationId) {
            conversation = await ChatService.getConversationById(Number(conversationId));
            if (!conversation) throw new AppError("Conversation not found", 404);

            // If it's a group, check membership
            if (conversation.isGroup) {
                const isMember = await ChatService.checkMembership(senderId, conversation.id);
                if (!isMember) {
                    throw new AppError("You must join this group to send messages.", 403);
                }
            }
        } else {
            conversation = await ChatService.getOrCreateConversation(senderId, Number(receiverId));
        }

        const message = await ChatService.sendMessage({ 
            conversationId: conversation.id, 
            senderId, 
            content 
        });

        res.status(201).json({
            status: "success",
            data: { conversation, message }
        });
    });

    /**
     * POST /start - Start/get a conversation without sending a message
     */
    static startChat = catchAsync(async (req: Request, res: Response) => {
        const { receiverId } = req.body;
        const senderId = (req as any).user.id;

        if (!receiverId) {
            throw new AppError("Invalid request. Missing receiverId.", 400);
        }

        const conversation = await ChatService.getOrCreateConversation(senderId, Number(receiverId));
        
        // Fetch the conversation with participants to be consistent with getConversations
        const fullConversation = await ChatService.getConversations(senderId).then(convs => convs.find(c => c.id === conversation.id));

        res.status(200).json({
            status: "success",
            data: fullConversation || conversation
        });
    });

    /**
     * GET /conversations - Fetch all user's conversations
     */
    static getConversations = catchAsync(async (req: Request, res: Response) => {
        const userId = (req as any).user.id;
        const conversations = await ChatService.getConversations(userId);

        res.status(200).json({
            status: "success",
            data: conversations
        });
    });

    /**
     * GET /available-users - Fetch all users user can start a chat with
     */
    static getAvailableUsers = catchAsync(async (req: Request, res: Response) => {
        const userId = (req as any).user.id;
        const users = await ChatService.getAvailableUsersToChat(userId);

        res.status(200).json({
            status: "success",
            data: users
        });
    });

    /**
     * GET /messages/:conversationId - Fetch messages for a specific conversation
     */
    static getMessages = catchAsync(async (req: Request, res: Response) => {
        const { conversationId } = req.params;
        const { limit, offset } = req.query;
        const userId = (req as any).user.id;

        const conversation = await ChatService.getConversationById(Number(conversationId));
        if (!conversation) throw new AppError("Conversation not found", 404);

        // If not a group, check if user is a participant
        if (!conversation.isGroup) {
            const isParticipant = await ChatService.checkMembership(userId, conversation.id);
            if (!isParticipant) throw new AppError("Access denied", 403);
        }

        const messages = await ChatService.getMessages(
            Number(conversationId),
            limit ? Number(limit) : 50,
            offset ? Number(offset) : 0
        );

        res.status(200).json({
            status: "success",
            data: messages
        });
    });

    /**
     * PATCH /messages/read/:conversationId - Mark messages in a conversation as read
     */
    static markAsRead = catchAsync(async (req: Request, res: Response) => {
        const { conversationId } = req.params;
        const userId = (req as any).user.id;

        await ChatService.markAsRead(Number(conversationId), userId);

        res.status(200).json({
            status: "success",
            message: "Messages marked as read."
        });
    });

    /**
     * PATCH /notifications/:conversationId - Toggle notifications (mute/unmute)
     */
    static toggleNotifications = catchAsync(async (req: Request, res: Response) => {
        const { conversationId } = req.params;
        const { enabled } = req.body;
        const userId = (req as any).user.id;

        await ChatService.toggleNotifications(Number(conversationId), userId, enabled);

        res.status(200).json({
            status: "success",
            message: `Notifications ${enabled ? 'enabled' : 'disabled'}.`
        });
    });

    /**
     * POST /upload - Upload a file to chat
     */
    static uploadFile = catchAsync(async (req: Request, res: Response) => {
        const { conversationId } = req.body;
        const userId = (req as any).user.id;

        if (!req.files || !req.files.file) {
            throw new AppError("No file uploaded", 400);
        }

        // If conversationId is provided, check membership
        if (conversationId) {
            const conversation = await ChatService.getConversationById(Number(conversationId));
            if (conversation && conversation.isGroup) {
                const isMember = await ChatService.checkMembership(userId, conversation.id);
                if (!isMember) {
                    throw new AppError("You must join this group to upload files.", 403);
                }
            }
        }

        try {
            // Handle both single and multiple files if they were sent with the same key
            const uploadedFile = req.files.file;
            const file = Array.isArray(uploadedFile) ? uploadedFile[0] : uploadedFile;
            
            if (!file) {
                throw new AppError("File processing failed", 400);
            }

            const { FileService } = await import("../services/FileService.js");
            const secureUrl = await FileService.uploadFile(file.data, "chat_attachments");

            res.status(200).json({
                status: "success",
                data: { url: secureUrl }
            });
        } catch (error: any) {
            console.error("[ChatController] Upload failed:", error);
            throw new AppError(error.message || "File upload failed", 500);
        }
    });

    /**
     * GET /download - Proxy download for files to bypass cross-origin restrictions
     */
    static downloadFile = catchAsync(async (req: Request, res: Response) => {
        const { url } = req.query;
        if (!url || typeof url !== 'string') {
            throw new AppError("Invalid URL", 400);
        }

        console.log(`[DownloadProxy] Attempting to fetch URL: ${url}`);

        // Cloudinary throws 401 Unauthorized for PDFs delivered via /image/upload/
        // unless we force them to download as an attachment for security reasons.
        let fetchUrl = url;
        if (fetchUrl.includes('cloudinary.com') && fetchUrl.includes('/upload/')) {
            fetchUrl = fetchUrl.replace('/upload/', '/upload/fl_attachment/');
            console.log(`[DownloadProxy] Modified Cloudinary URL to force attachment: ${fetchUrl}`);
        }

        try {
            const axios = (await import("axios")).default;
            const response = await axios({
                url: fetchUrl,
                method: 'GET',
                responseType: 'stream'
            });

            // Extract filename from URL
            const filename = url.split('/').pop()?.split('?')[0] || 'downloaded-file';
            
            // Forward content type from original response if possible
            const contentType = response.headers['content-type'];
            if (contentType) res.setHeader('Content-Type', contentType);
            
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            response.data.pipe(res);
        } catch (error: any) {
            console.error(`[DownloadProxy] Failed to proxy fetch ${url}. Error:`, error.message);
            // If the proxy fails (e.g. 401 Unauthorized from the source), 
            // fallback to redirecting the user directly to the URL so their browser can handle it.
            res.redirect(url);
        }
    });
    
    /**
     * DELETE /conversations/:conversationId - Delete a conversation (and all its messages)
     */
    static deleteConversation = catchAsync(async (req: Request, res: Response) => {
        const { conversationId } = req.params;
        const userId = (req as any).user.id;

        await ChatService.deleteConversation(Number(conversationId), userId);

        res.status(200).json({
            status: "success",
            message: "Conversation deleted successfully."
        });
    });

    /**
     * PATCH /messages/:messageId - Edit a message
     */
    static editMessage = catchAsync(async (req: Request, res: Response) => {
        const { messageId } = req.params;
        const { content } = req.body;
        const userId = (req as any).user.id;

        const message = await ChatService.editMessage(Number(messageId), userId, content);

        res.status(200).json({
            status: "success",
            data: message
        });
    });

    /**
     * DELETE /messages/:messageId - Delete a message
     */
    static deleteMessage = catchAsync(async (req: Request, res: Response) => {
        const { messageId } = req.params;
        const userId = (req as any).user.id;

        await ChatService.deleteMessage(Number(messageId), userId);

        res.status(200).json({
            status: "success",
            message: "Message deleted successfully."
        });
    });
}
