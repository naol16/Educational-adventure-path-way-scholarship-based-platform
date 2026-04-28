import { Request, Response } from "express";
import { ChatService } from "../services/ChatService.js";
import { catchAsync } from "../utils/catchAsync.js";
import { AppError } from "../errors/AppError.js";

export class ChatController {
    /**
     * POST /messages - Send a message to a user (starts conversation if doesn't exist)
     */
    static sendMessage = catchAsync(async (req: Request, res: Response) => {
        const { receiverId, content } = req.body;
        const senderId = (req as any).user.id;

        if (!receiverId || !content) {
            throw new AppError("Invalid request. Missing receiverId or content.", 400);
        }

        const conversation = await ChatService.getOrCreateConversation(senderId, Number(receiverId));
        const message = await ChatService.sendMessage(conversation.id, senderId, content);

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
     * POST /upload - Upload a file to chat
     */
    static uploadFile = catchAsync(async (req: Request, res: Response) => {
        if (!req.files || !req.files.file) {
            throw new AppError("No file uploaded", 400);
        }

        const file = req.files.file as any;
        
        // Import FileService dynamically or at the top? Wait, ChatController needs FileService!
        const { FileService } = await import("../services/FileService.js");
        
        const secureUrl = await FileService.uploadFile(file.data, "chat_attachments");

        res.status(200).json({
            status: "success",
            data: { url: secureUrl }
        });
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
}
