import { useMutation, useQueryClient } from "@tanstack/react-query";
import { tasksService } from "@/services/tasks.service";
import { taskKeys } from "../queries/tasks.queries";
import type { TaskResponse, UpdateTaskDto } from "@repo/types/tasks";
import type { PageResponse } from "@repo/types/pagination";
import { toast } from "sonner";

export const useCreateTaskMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: tasksService.createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
      toast.success("Tarefa criada com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao criar tarefa.");
    },
  });
};

export const useUpdateTaskMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTaskDto }) =>
      tasksService.updateTask(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: taskKeys.lists() });

      const previousTasks = queryClient.getQueryData<
        PageResponse<TaskResponse>
      >(taskKeys.lists());

      if (previousTasks) {
        queryClient.setQueryData<PageResponse<TaskResponse>>(
          taskKeys.lists(),
          (old) => {
            if (!old) return old;
            return {
              ...old,
              content: old.content.map((task) =>
                task.id === id ? { ...task, ...data } : task
              ),
            };
          }
        );
      }

      return { previousTasks };
    },
    onError: (_err, _newTodo, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(taskKeys.lists(), context.previousTasks);
      }
      toast.error("Erro ao atualizar tarefa.");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
    },
  });
};

export const useDeleteTaskMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: tasksService.deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
      toast.success("Tarefa excluída com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao excluir tarefa.");
    },
  });
};
