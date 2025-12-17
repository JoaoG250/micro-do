import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { KanbanColumn } from "./KanbanColumn";
import { TaskCard } from "./TaskCard";
import { TaskFormDialog } from "../tasks/TaskFormDialog";
import { DeleteTaskDialog } from "../tasks/DeleteTaskDialog";
import { Button } from "@repo/ui/components/button";
import { useTasksQuery } from "@/hooks/queries/tasks.queries";
import {
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
} from "@/hooks/mutations/tasks.mutations";
import { STATUS, type Status } from "@repo/types/constants";
import type { TaskResponse, CreateTaskDto } from "@repo/types/tasks";
import { Plus } from "lucide-react";
import { Spinner } from "@repo/ui/components/spinner";

const columns = [
  { id: STATUS.TODO, title: "A Fazer" },
  { id: STATUS.IN_PROGRESS, title: "Em Progresso" },
  { id: STATUS.REVIEW, title: "Revisão" },
  { id: STATUS.DONE, title: "Concluído" },
];

export function KanbanBoard() {
  const { data: tasks, isLoading } = useTasksQuery();
  const createTaskMutation = useCreateTaskMutation();
  const updateTaskMutation = useUpdateTaskMutation();
  const deleteTaskMutation = useDeleteTaskMutation();

  const [activeTask, setActiveTask] = useState<TaskResponse | null>(null);
  const [selectedTask, setSelectedTask] = useState<TaskResponse | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks?.content.find((t) => t.id === active.id);
    if (task) setActiveTask(task);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      setActiveTask(null);
      return;
    }

    const activeId = active.id as string;
    const overId = over.id as string;

    const task = tasks?.content.find((t) => t.id === activeId);
    if (!task) {
      setActiveTask(null);
      return;
    }

    let newStatus = task.status;

    if (columns.some((col) => col.id === overId)) {
      newStatus = overId as Status;
    } else {
      const overTask = tasks?.content.find((t) => t.id === overId);
      if (overTask) {
        newStatus = overTask.status;
      }
    }

    if (newStatus !== task.status) {
      updateTaskMutation.mutate({
        id: task.id,
        data: { status: newStatus },
      });
    }

    setActiveTask(null);
  };

  const handleCreateTask = (data: CreateTaskDto) => {
    createTaskMutation.mutate(data, {
      onSuccess: () => {
        setIsCreateOpen(false);
      },
    });
  };

  const handleUpdateTask = (data: CreateTaskDto) => {
    if (!selectedTask) return;
    updateTaskMutation.mutate(
      { id: selectedTask.id, data },
      {
        onSuccess: () => {
          setIsEditOpen(false);
          setSelectedTask(null);
        },
      }
    );
  };

  const handleDeleteTask = () => {
    if (!selectedTask) return;
    deleteTaskMutation.mutate(selectedTask.id, {
      onSuccess: () => {
        setIsDeleteOpen(false);
        setSelectedTask(null);
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Spinner className="w-8 h-8 text-primary" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Quadro de Tarefas</h2>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nova Tarefa
        </Button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex h-full gap-4 overflow-x-auto pb-4">
          {columns.map((col) => (
            <div key={col.id} className="w-[300px] flex-shrink-0">
              <KanbanColumn
                id={col.id}
                title={col.title}
                tasks={tasks?.content.filter((t) => t.status === col.id) || []}
                onEdit={(task) => {
                  setSelectedTask(task);
                  setIsEditOpen(true);
                }}
                onDelete={(taskId) => {
                  const task = tasks?.content.find((t) => t.id === taskId);
                  if (task) {
                    setSelectedTask(task);
                    setIsDeleteOpen(true);
                  }
                }}
              />
            </div>
          ))}
        </div>

        <DragOverlay>
          {activeTask ? (
            <TaskCard task={activeTask} onEdit={() => {}} onDelete={() => {}} />
          ) : null}
        </DragOverlay>
      </DndContext>

      <TaskFormDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSubmit={handleCreateTask}
        isSubmitting={createTaskMutation.isPending}
      />

      <TaskFormDialog
        open={isEditOpen}
        onOpenChange={(open) => {
          setIsEditOpen(open);
          if (!open) setSelectedTask(null);
        }}
        onSubmit={handleUpdateTask}
        task={selectedTask}
        isSubmitting={updateTaskMutation.isPending}
      />

      <DeleteTaskDialog
        open={isDeleteOpen}
        onOpenChange={(open) => {
          setIsDeleteOpen(open);
          if (!open) setSelectedTask(null);
        }}
        onConfirm={handleDeleteTask}
        isDeleting={deleteTaskMutation.isPending}
      />
    </div>
  );
}
