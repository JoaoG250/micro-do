import { Controller } from "@nestjs/common";
import { EventPattern, Payload } from "@nestjs/microservices";
import { plainToInstance } from "class-transformer";
import { NotificationResponse } from "@repo/common/dto/notifications";
import {
  NOTIFICATION_TYPE,
  WEBSOCKET_EVENTS,
  NotificationType,
  RPC_API_GATEWAY_PATTERNS,
} from "@repo/common/constants";
import { NotificationsGateway } from "./notifications.gateway";
import { Notification } from "@repo/db";

@Controller()
export class NotificationsController {
  constructor(private readonly notificationsGateway: NotificationsGateway) {}

  @EventPattern(RPC_API_GATEWAY_PATTERNS.NOTIFICATION_CREATED)
  handleNotificationCreated(@Payload() notification: Notification) {
    const response = plainToInstance(NotificationResponse, notification, {
      excludeExtraneousValues: true,
    });

    const event = this.getWebSocketEvent(notification.type);
    this.notificationsGateway.notifyUser(notification.userId, event, response);
  }

  private getWebSocketEvent(type: NotificationType) {
    let event = "notification";
    switch (type) {
      case NOTIFICATION_TYPE.TASK_ASSIGNED:
        event = WEBSOCKET_EVENTS.TASK_CREATED;
        break;
      case NOTIFICATION_TYPE.TASK_UPDATED:
        event = WEBSOCKET_EVENTS.TASK_UPDATED;
        break;
      case NOTIFICATION_TYPE.COMMENT_CREATED:
        event = WEBSOCKET_EVENTS.COMMENT_NEW;
        break;
    }
    return event;
  }
}
