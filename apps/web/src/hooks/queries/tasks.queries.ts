import { useQuery } from "@tanstack/react-query";
import { tasksService } from "@/services/tasks.service";

import type { TaskFilters } from "@repo/types/tasks";

export const taskKeys = {
  all: ["tasks"] as const,
  lists: () => [...taskKeys.all, "list"] as const,
  list: (filters: TaskFilters) => [...taskKeys.lists(), { filters }] as const,
  details: () => [...taskKeys.all, "detail"] as const,
  detail: (id: string) => [...taskKeys.details(), id] as const,
  comments: (id: string) => [...taskKeys.detail(id), "comments"] as const,
};

export const useTasksQuery = (filters?: TaskFilters) => {
  return useQuery({
    queryKey: taskKeys.list(filters || {}),
    queryFn: () => tasksService.getTasks(filters),
  });
};

export const useTaskQuery = (id: string) => {
  return useQuery({
    queryKey: taskKeys.detail(id),
    queryFn: () => tasksService.getTask(id),
    enabled: !!id,
  });
};

export const useTaskCommentsQuery = (id: string) => {
  return useQuery({
    queryKey: taskKeys.comments(id),
    queryFn: () => tasksService.getComments(id),
    enabled: !!id,
  });
};
