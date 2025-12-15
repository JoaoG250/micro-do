import { Injectable, Inject, HttpStatus } from "@nestjs/common";
import { RpcException, ClientProxy } from "@nestjs/microservices";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Task, Comment, User } from "@repo/db";
import {
  RPC_NOTIFICATION_PATTERNS,
  RABBITMQ_CLIENTS,
} from "@repo/common/constants";
import {
  CreateTaskRpcDto,
  UpdateTaskRpcDto,
  CreateCommentRpcDto,
  ListTasksRpcDto,
} from "@repo/common/dto/tasks-rpc";
import {
  TaskCreatedRpcDto,
  TaskUpdatedRpcDto,
  CommentCreatedRpcDto,
} from "@repo/common/dto/notifications-rpc";
import { plainToInstance } from "class-transformer";

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @Inject(RABBITMQ_CLIENTS.NOTIFICATIONS_SERVICE)
    private readonly client: ClientProxy,
  ) {}

  async create(createTaskDto: CreateTaskRpcDto): Promise<Task> {
    const { assigneeIds, ...taskData } = createTaskDto;
    const task = this.taskRepository.create({
      ...taskData,
      assignees: assigneeIds?.map((id) => ({ id })) || [],
    });
    const savedTask = await this.taskRepository.save(task);
    const eventPayload = plainToInstance(TaskCreatedRpcDto, savedTask, {
      excludeExtraneousValues: true,
    });
    this.client.emit(RPC_NOTIFICATION_PATTERNS.TASK_CREATED, eventPayload);
    return savedTask;
  }

  async findAll(
    query: ListTasksRpcDto,
  ): Promise<{ tasks: Task[]; total: number }> {
    const {
      page = 1,
      limit = 10,
      status,
      priority,
      search,
      assigneeId,
    } = query;
    const skip = (page - 1) * limit;

    const qb = this.taskRepository.createQueryBuilder("task");

    if (status) {
      qb.andWhere("task.status = :status", { status });
    }

    if (priority) {
      qb.andWhere("task.priority = :priority", { priority });
    }

    if (search) {
      qb.andWhere(
        "(task.title ILIKE :search OR task.description ILIKE :search)",
        { search: `%${search}%` },
      );
    }

    if (assigneeId) {
      qb.innerJoin("task.assignees", "assignee", "assignee.id = :assigneeId", {
        assigneeId,
      });
    }

    qb.skip(skip).take(limit).orderBy("task.createdAt", "DESC");

    const [tasks, total] = await qb.getManyAndCount();

    return { tasks, total };
  }

  async findOne(id: string): Promise<Task> {
    return this.taskRepository.findOne({
      where: { id },
      relations: ["comments", "assignees", "comments.author"],
    });
  }

  async update(id: string, updateTaskDto: UpdateTaskRpcDto): Promise<Task> {
    const { assigneeIds, ...updateData } = updateTaskDto;
    const task = await this.taskRepository.preload({
      id,
      ...updateData,
      assignees: assigneeIds ? assigneeIds.map((id) => ({ id })) : undefined,
    });
    if (!task) {
      throw new RpcException({
        message: `Task with ID ${id} not found`,
        status: HttpStatus.NOT_FOUND,
      });
    }
    const savedTask = await this.taskRepository.save(task);
    const eventPayload = plainToInstance(TaskUpdatedRpcDto, savedTask, {
      excludeExtraneousValues: true,
    });
    this.client.emit(RPC_NOTIFICATION_PATTERNS.TASK_UPDATED, eventPayload);
    return savedTask;
  }

  async remove(id: string): Promise<boolean> {
    const result = await this.taskRepository.delete(id);
    if (result.affected === 0) {
      throw new RpcException({
        message: `Task with ID ${id} not found`,
        status: HttpStatus.NOT_FOUND,
      });
    }
    return true;
  }

  async createComment(createCommentDto: CreateCommentRpcDto): Promise<Comment> {
    const { authorId, taskId, ...commentData } = createCommentDto;

    const taskExists = await this.taskRepository.findOne({
      where: { id: taskId },
    });
    if (!taskExists) {
      throw new RpcException({
        message: `Task with ID ${taskId} not found`,
        status: HttpStatus.NOT_FOUND,
      });
    }

    const userExists = await this.userRepository.findOne({
      where: { id: authorId },
    });
    if (!userExists) {
      throw new RpcException({
        message: `User with ID ${authorId} not found`,
        status: HttpStatus.NOT_FOUND,
      });
    }

    const comment = this.commentRepository.create({
      ...commentData,
      author: { id: authorId },
      task: { id: taskId },
    });
    const savedComment = await this.commentRepository.save(comment);
    const eventPayload = plainToInstance(CommentCreatedRpcDto, savedComment, {
      excludeExtraneousValues: true,
    });
    this.client.emit(RPC_NOTIFICATION_PATTERNS.COMMENT_CREATED, eventPayload);
    return savedComment;
  }

  async findAllComments(taskId: string): Promise<Comment[]> {
    return this.commentRepository.find({
      where: { taskId },
      order: { createdAt: "ASC" },
    });
  }
}
