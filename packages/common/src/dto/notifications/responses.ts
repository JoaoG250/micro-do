import { Exclude, Expose } from "class-transformer";
import type { NotificationType } from "../../constants";

@Exclude()
export class NotificationResponse {
  @Expose()
  id: string;

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
