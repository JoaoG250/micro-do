import { Exclude, Expose } from "class-transformer";
import type { NotificationType } from "@repo/common/constants";
import type { NotificationResponse as INotificationResponse } from "@repo/types/notifications";

@Exclude()
export class NotificationResponse implements INotificationResponse {
  @Expose()
  id: string;

  @Expose()
  userId: string;

  @Expose()
  message: string;

  @Expose()
  type: NotificationType;

  @Expose()
  isRead: boolean;

  @Expose()
  createdAt: Date;

  @Expose()
  metadata: any;
}
