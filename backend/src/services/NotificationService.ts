import { NotificationRepository } from "../repositories/NotificationRepository.js";
import { FirebaseService } from "./FirebaseService.js";
import { EmailService } from "./EmailService.js";

export class NotificationService {
  static async createNotification(
    userId: number,
    title: string,
    message: string,
    type: string,
    relatedId?: number | undefined,
    sendEmail: boolean = true
  ) {
    try {
      const notification = await NotificationRepository.create({
        userId,
        title,
        message,
        type,
        relatedId,
        isDelivered: true, // Mark as delivered upon successful creation
      });

      // Find user effectively via repository to get FCM token, email, and name
      const user = await NotificationRepository.findUserWithToken(userId);
      
      if (user?.fcmToken) {
        console.log(`[NotificationService] Sending push to user ${userId}...`);
        await FirebaseService.sendPush(user.fcmToken, title, message, {
          type,
          scholarshipId: relatedId,
        });
      }

      if (sendEmail && user?.email) {
        console.log(`[NotificationService] Sending generic email to user ${userId}...`);
        try {
          await EmailService.sendGenericNotificationEmail(
            user.email,
            user.name || 'User',
            title,
            message
          );
        } catch (emailError) {
          console.error("[NotificationService] Failed to send generic email:", emailError);
        }
      }

      return notification;
    } catch (error) {
      console.error("[NotificationService] createNotification error:", error);
      throw error;
    }
  }

  static async markAsClicked(notificationId: number, userId: number) {
    const notification = await NotificationRepository.findByIdAndUser(
      notificationId,
      userId,
    );

    if (notification) {
      notification.isClicked = true;
      // When clicked, it should also be implicitly read
      notification.isRead = true; 
      await notification.save();
      return true;
    }
    return false;
  }

  static async getUserNotifications(
    userId: number,
    unreadOnly: boolean = false,
  ) {
    return await NotificationRepository.findByUserId(userId, unreadOnly);
  }

  static async markAsRead(notificationId: number, userId: number) {
    const notification = await NotificationRepository.findByIdAndUser(
      notificationId,
      userId,
    );

    if (notification) {
      notification.isRead = true;
      // If read, it was definitely delivered
      notification.isDelivered = true;
      await notification.save();
      return true;
    }
    return false;
  }

  static async updateFcmToken(userId: number, fcmToken: string) {
    return await NotificationRepository.updateFcmToken(userId, fcmToken);
  }

  static async markAllAsRead(userId: number) {
    return await NotificationRepository.markAllAsRead(userId);
  }
}
