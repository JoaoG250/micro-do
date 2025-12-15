import { Injectable, Inject } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ClientProxy } from "@nestjs/microservices";
import { Repository } from "typeorm";
import { Notification, Task, Comment } from "@repo/db";
import {
  NOTIFICATION_TYPE,
  NotificationType,
  RABBITMQ_CLIENTS,
  RPC_API_GATEWAY_PATTERNS,
} from "@repo/common/constants";
import {
  CommentCreatedRpcDto,
  TaskCreatedRpcDto,
  TaskUpdatedRpcDto,
} from "@repo/common/dto/notifications-rpc";

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    @Inject(RABBITMQ_CLIENTS.API_GATEWAY)
    private readonly client: ClientProxy,
  ) {}

  async handleTaskCreated(taskCreatedDto: TaskCreatedRpcDto) {
    if (taskCreatedDto.assignees && taskCreatedDto.assignees.length > 0) {
      for (const assignee of taskCreatedDto.assignees) {
        await this.createAndSendNotification(
          assignee.id,
          `You have been assigned to task: ${taskCreatedDto.title}`,
          NOTIFICATION_TYPE.TASK_ASSIGNED,
          { taskId: taskCreatedDto.id },
        );
      }
    }
  }

  async handleTaskUpdated(taskUpdatedDto: TaskUpdatedRpcDto) {
    if (taskUpdatedDto.assignees && taskUpdatedDto.assignees.length > 0) {
      for (const assignee of taskUpdatedDto.assignees) {
        await this.createAndSendNotification(
          assignee.id,
          `Task updated: ${taskUpdatedDto.title}`,
          NOTIFICATION_TYPE.TASK_UPDATED,
          { taskId: taskUpdatedDto.id },
        );
      }
    }
  }

  async handleCommentCreated(commentCreatedDto: CommentCreatedRpcDto) {
    const task = await this.taskRepository.findOne({
      where: { id: commentCreatedDto.taskId },
      relations: ["assignees"],
    });

    if (task && task.assignees && task.assignees.length > 0) {
      for (const assignee of task.assignees) {
        if (assignee.id !== commentCreatedDto.authorId) {
          await this.createAndSendNotification(
            assignee.id,
            `New comment on task: ${task.title}`,
            NOTIFICATION_TYPE.COMMENT_CREATED,
            { taskId: task.id, commentId: commentCreatedDto.id },
          );
        }
      }
    }
  }

  private async createAndSendNotification(
    userId: string,
    message: string,
    type: NotificationType,
    metadata: any,
  ) {
    const notification = this.notificationRepository.create({
      userId,
      message,
      type,
      metadata,
      isRead: false,
    });
    await this.notificationRepository.save(notification);
    this.client.emit(
      RPC_API_GATEWAY_PATTERNS.NOTIFICATION_CREATED,
      notification,
    );
  }
}
