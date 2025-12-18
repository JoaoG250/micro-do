import type { Priority, Status } from "./constants.js";

export interface CreateTaskDto {
  title: string;
  description?: string;
  priority?: Priority;
  status?: Status;
  dueDate?: Date;
  assigneeIds?: string[];
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  priority?: Priority;
  status?: Status;
  dueDate?: Date;
  assigneeIds?: string[];
}

export interface TaskFilters {
  page?: number;
  limit?: number;
  status?: Status;
  priority?: Priority;
  search?: string;
  assigneeId?: string;
}

export interface CreateCommentDto {
  content: string;
}

export interface CommentResponse {
  id: string;
  content: string;
  authorId: string;
  taskId: string;
  createdAt: Date;
}

export interface TaskResponse {
  id: string;
  title: string;
  description: string | null;
  priority: Priority;
  status: Status;
  dueDate: Date | null;
  assigneeIds: string[];
  comments: CommentResponse[];
  createdAt: Date;
  updatedAt: Date;
}
