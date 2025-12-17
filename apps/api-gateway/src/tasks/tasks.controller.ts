import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  Param,
  UseGuards,
  Request,
  Put,
  Delete,
  HttpStatus,
  HttpCode,
} from "@nestjs/common";
import { ApiBearerAuth } from "@nestjs/swagger";
import { plainToInstance } from "class-transformer";
import { AuthGuard } from "@nestjs/passport";
import {
  CreateTaskDto,
  UpdateTaskDto,
  CreateCommentDto,
  TaskResponse,
  CommentResponse,
} from "@repo/common/dto/tasks";
import { ListTasksRpcDto } from "@repo/common/dto/tasks-rpc";
import { TasksService } from "./tasks.service";
import type { HttpRequest } from "src/types";
import { PageResponse } from "@repo/types/pagination";

@ApiBearerAuth()
@Controller("tasks")
@UseGuards(AuthGuard("jwt"))
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  async create(
    @Body() createTaskDto: CreateTaskDto,
    @Request() req: HttpRequest,
  ): Promise<TaskResponse> {
    const task = await this.tasksService.create({
      ...createTaskDto,
      authorId: req.user.id,
    });
    return plainToInstance(TaskResponse, task, {
      excludeExtraneousValues: true,
    });
  }

  @Get()
  async findAll(
    @Query() query: ListTasksRpcDto,
  ): Promise<PageResponse<TaskResponse>> {
    const result = await this.tasksService.findAll(query);
    const tasks = plainToInstance(TaskResponse, result.content, {
      excludeExtraneousValues: true,
    });
    return {
      ...result,
      content: tasks,
    };
  }

  @Put(":id")
  async update(
    @Param("id") id: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @Request() req: HttpRequest,
  ): Promise<TaskResponse> {
    const task = await this.tasksService.update(id, {
      ...updateTaskDto,
      authorId: req.user.id,
    });
    return plainToInstance(TaskResponse, task, {
      excludeExtraneousValues: true,
    });
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param("id") id: string): Promise<void> {
    await this.tasksService.remove(id);
  }

  @Post(":id/comments")
  async createComment(
    @Param("id") taskId: string,
    @Body() createCommentDto: CreateCommentDto,
    @Request() req: HttpRequest,
  ): Promise<CommentResponse> {
    const comment = await this.tasksService.createComment(
      taskId,
      createCommentDto,
      req.user.id,
    );
    return plainToInstance(CommentResponse, comment, {
      excludeExtraneousValues: true,
    });
  }

  @Get(":id/comments")
  async findAllComments(
    @Param("id") taskId: string,
    @Query("page") page: number = 1,
    @Query("limit") limit: number = 10,
  ): Promise<PageResponse<CommentResponse>> {
    const result = await this.tasksService.findAllComments({
      taskId,
      page,
      limit,
    });
    const comments = plainToInstance(CommentResponse, result.content, {
      excludeExtraneousValues: true,
    });
    return {
      ...result,
      content: comments,
    };
  }
}
