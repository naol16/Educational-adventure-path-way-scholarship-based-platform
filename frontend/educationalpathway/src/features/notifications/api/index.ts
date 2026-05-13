import api from "@/lib/api";
import { Notification } from "../types";

export const getNotifications = async (): Promise<Notification[]> => {
  try {
    const response = await api.get("/notifications");
    // Handle different response structures if necessary
    return response.data.data || response.data || [];
  } catch (error) {
    console.error("Error fetching notifications:", error);
    // Return empty array on error to prevent app crash
    return [];
  }
};

export const markNotificationAsRead = async (id: number): Promise<void> => {
  try {
    await api.patch(`/notifications/${id}/read`);
  } catch (error) {
    console.error("Error marking notification as read:", error);
    // Don't throw - silently handle the error
  }
};

export const markNotificationAsClicked = async (id: number): Promise<void> => {
  try {
    await api.patch(`/notifications/${id}/click`);
  } catch (error) {
    console.error("Error marking notification as clicked:", error);
    // Don't throw - silently handle the error
  }
};

export const markAllNotificationsAsRead = async (): Promise<void> => {
  try {
    await api.patch("/notifications/read-all");
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    // Don't throw - silently handle the error
  }
};

export const updateFCMToken = async (token: string): Promise<void> => {
  try {
    await api.post("/notifications/token", { token, fcmToken: token });
  } catch (error) {
    console.error("Error updating FCM token:", error);
    // Don't throw - silently handle the error
  }
};
