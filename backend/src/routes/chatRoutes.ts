import express from "express";
import { ChatController } from "../controller/ChatController.js";
import { authenticate } from "../middlewares/authMiddleware.js";

import { sendChatMessageValidation } from "../validators/validationMiddleware.js";
import { validate } from "../validators/validationMiddleware.js";

const router = express.Router();

router.post("/send", authenticate as any, validate(sendChatMessageValidation), ChatController.sendMessage);
router.post("/start", authenticate as any, ChatController.startChat);
router.get("/conversations", authenticate as any, ChatController.getConversations);
router.get("/available-users", authenticate as any, ChatController.getAvailableUsers);
router.get("/download", authenticate as any, ChatController.downloadFile);
router.get("/url-metadata", authenticate as any, ChatController.getUrlMetadata);
router.get("/:conversationId", authenticate as any, ChatController.getMessages);
router.patch("/notifications/:conversationId", authenticate as any, ChatController.toggleNotifications);
router.patch("/read/:conversationId", authenticate as any, ChatController.markAsRead);
router.patch("/messages/:messageId", authenticate as any, ChatController.editMessage);
router.delete("/messages/:messageId", authenticate as any, ChatController.deleteMessage);
router.delete("/conversations/:conversationId", authenticate as any, ChatController.deleteConversation);
router.post("/upload", authenticate as any, ChatController.uploadFile);

export default router;
