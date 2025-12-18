import { apiClient as api } from "@/lib/axios";
import type {
  CreateTaskDto,
  UpdateTaskDto,
  TaskResponse,
  CommentResponse,
  CreateCommentDto,
  TaskFilters,
} from "@repo/types/tasks";
import type { PageResponse } from "@repo/types/pagination";

export const tasksService = {
  getTasks: async (
    filters?: TaskFilters
  ): Promise<PageResponse<TaskResponse>> => {
    const params = new URLSearchParams();
    if (filters) {
      if (filters.page) params.append("page", filters.page.toString());
      if (filters.limit) params.append("limit", filters.limit.toString());
      if (filters.status) params.append("status", filters.status);
      if (filters.priority) params.append("priority", filters.priority);
      if (filters.search) params.append("search", filters.search);
      if (filters.assigneeId) params.append("assigneeId", filters.assigneeId);
    }
    const response = await api.get<PageResponse<TaskResponse>>(
      `/tasks?${params.toString()}`
    );
    return response.data;
  },

  createTask: async (data: CreateTaskDto): Promise<TaskResponse> => {
    const response = await api.post<TaskResponse>("/tasks", data);
    return response.data;
  },

  getTask: async (id: string): Promise<TaskResponse> => {
    const response = await api.get<TaskResponse>(`/tasks/${id}`);
    return response.data;
  },

  updateTask: async (
    id: string,
    data: UpdateTaskDto
  ): Promise<TaskResponse> => {
    const response = await api.put<TaskResponse>(`/tasks/${id}`, data);
    return response.data;
  },

  deleteTask: async (id: string): Promise<void> => {
    await api.delete(`/tasks/${id}`);
  },

  createComment: async (
    taskId: string,
    data: CreateCommentDto
  ): Promise<CommentResponse> => {
    const response = await api.post<CommentResponse>(
      `/tasks/${taskId}/comments`,
      data
    );
    return response.data;
  },

  getComments: async (
    taskId: string,
    page = 1,
    limit = 50
  ): Promise<PageResponse<CommentResponse>> => {
    const response = await api.get<PageResponse<CommentResponse>>(
      `/tasks/${taskId}/comments`,
      { params: { page, limit } }
    );
    return response.data;
  },
};
