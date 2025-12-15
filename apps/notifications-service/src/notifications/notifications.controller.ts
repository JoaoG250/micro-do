import { Controller } from "@nestjs/common";
import { EventPattern, Payload } from "@nestjs/microservices";
import { NotificationsService } from "./notifications.service";
import { RPC_NOTIFICATION_PATTERNS } from "@repo/common/constants";
import {
  TaskCreatedRpcDto,
  TaskUpdatedRpcDto,
  CommentCreatedRpcDto,
} from "@repo/common/dto/notifications-rpc";

@Controller()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @EventPattern(RPC_NOTIFICATION_PATTERNS.TASK_CREATED)
  handleTaskCreated(@Payload() payload: TaskCreatedRpcDto) {
    return this.notificationsService.handleTaskCreated(payload);
  }

  @EventPattern(RPC_NOTIFICATION_PATTERNS.TASK_UPDATED)
  handleTaskUpdated(@Payload() payload: TaskUpdatedRpcDto) {
    return this.notificationsService.handleTaskUpdated(payload);
  }

  @EventPattern(RPC_NOTIFICATION_PATTERNS.COMMENT_CREATED)
  handleCommentCreated(@Payload() payload: CommentCreatedRpcDto) {
    return this.notificationsService.handleCommentCreated(payload);
  }
}
