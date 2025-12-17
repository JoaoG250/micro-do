import { Controller } from "@nestjs/common";
import { MessagePattern, Payload } from "@nestjs/microservices";
import { TasksService } from "./tasks.service";
import { RPC_TASK_PATTERNS } from "@repo/common/constants";
import {
  CreateTaskRpcDto,
  UpdateTaskRpcDto,
  CreateCommentRpcDto,
  ListTasksRpcDto,
  ListCommentsRpcDto,
} from "@repo/common/dto/tasks-rpc";

@Controller()
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @MessagePattern(RPC_TASK_PATTERNS.CREATE_TASK)
  create(@Payload() createTaskDto: CreateTaskRpcDto) {
    return this.tasksService.create(createTaskDto);
  }

  @MessagePattern(RPC_TASK_PATTERNS.LIST_TASKS)
  findAll(@Payload() listTasksDto: ListTasksRpcDto) {
    return this.tasksService.findAll(listTasksDto);
  }

  @MessagePattern(RPC_TASK_PATTERNS.UPDATE_TASK)
  update(@Payload() payload: { id: string; dto: UpdateTaskRpcDto }) {
    return this.tasksService.update(payload.id, payload.dto);
  }

  @MessagePattern(RPC_TASK_PATTERNS.CREATE_COMMENT)
  createComment(@Payload() createCommentDto: CreateCommentRpcDto) {
    return this.tasksService.createComment(createCommentDto);
  }

  @MessagePattern(RPC_TASK_PATTERNS.LIST_COMMENTS)
  findAllComments(@Payload() listCommentsDto: ListCommentsRpcDto) {
    return this.tasksService.findAllComments(listCommentsDto);
  }

  @MessagePattern(RPC_TASK_PATTERNS.DELETE_TASK)
  remove(@Payload() id: string) {
    return this.tasksService.remove(id);
  }
}
