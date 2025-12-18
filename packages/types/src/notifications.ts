import type { NotificationType } from "./constants.js";

export interface NotificationResponse {
  id: string;
  userId: string;
  type: NotificationType;
  message: string;
  isRead: boolean;
  createdAt: Date;
}
