import {
  Injectable,
  Inject,
  NotFoundException,
  HttpStatus,
} from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { firstValueFrom, catchError } from "rxjs";
import {
  CreateTaskDto,
  UpdateTaskDto,
  CreateCommentDto,
} from "@repo/common/dto/tasks";
import {
  CreateTaskRpcDto,
  ListTasksRpcDto,
  CreateCommentRpcDto,
  UpdateTaskRpcDto,
} from "@repo/common/dto/tasks-rpc";
import { RABBITMQ_CLIENTS, RPC_TASK_PATTERNS } from "@repo/common/constants";
import { Task } from "@repo/db";

@Injectable()
export class TasksService {
  constructor(
    @Inject(RABBITMQ_CLIENTS.TASKS_SERVICE)
    private readonly client: ClientProxy,
  ) {}

  async create(createTaskDto: CreateTaskDto): Promise<Task> {
    const payload: CreateTaskRpcDto = { ...createTaskDto };
    return firstValueFrom(
      this.client.send<Task, CreateTaskRpcDto>(
        RPC_TASK_PATTERNS.CREATE_TASK,
        payload,
      ),
    );
  }

  async findAll(
    query: ListTasksRpcDto,
  ): Promise<{ tasks: Task[]; total: number }> {
    return firstValueFrom(
      this.client.send<{ tasks: Task[]; total: number }, ListTasksRpcDto>(
        RPC_TASK_PATTERNS.LIST_TASKS,
        query,
      ),
    );
  }

  async update(id: string, dto: UpdateTaskDto): Promise<Task> {
    const payload: UpdateTaskRpcDto = { ...dto };
    return firstValueFrom(
      this.client
        .send<
          Task,
          { id: string; dto: UpdateTaskRpcDto }
        >(RPC_TASK_PATTERNS.UPDATE_TASK, { id, dto: payload })
        .pipe(
          catchError((error) => {
            if (error?.status === HttpStatus.NOT_FOUND) {
              throw new NotFoundException(error.message);
            }
            throw error;
          }),
        ),
    );
  }

  async remove(id: string): Promise<void> {
    await firstValueFrom(
      this.client.send<boolean, string>(RPC_TASK_PATTERNS.DELETE_TASK, id).pipe(
        catchError((error) => {
          if (error?.status === HttpStatus.NOT_FOUND) {
            throw new NotFoundException(error.message);
          }
          throw error;
        }),
      ),
    );
  }

  async createComment(
    taskId: string,
    createCommentDto: CreateCommentDto,
    authorId: string,
  ): Promise<Comment> {
    const payload: CreateCommentRpcDto = {
      ...createCommentDto,
      taskId,
      authorId,
    };
    return firstValueFrom(
      this.client
        .send<
          Comment,
          CreateCommentRpcDto
        >(RPC_TASK_PATTERNS.CREATE_COMMENT, payload)
        .pipe(
          catchError((error) => {
            if (error?.status === HttpStatus.NOT_FOUND) {
              throw new NotFoundException(error.message);
            }
            throw error;
          }),
        ),
    );
  }

  async findAllComments(taskId: string): Promise<Comment[]> {
    return firstValueFrom(
      this.client.send<Comment[], string>(
        RPC_TASK_PATTERNS.LIST_COMMENTS,
        taskId,
      ),
    );
  }
}
