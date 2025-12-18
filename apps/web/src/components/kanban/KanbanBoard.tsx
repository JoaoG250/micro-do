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
import { TaskFilters } from "./TaskFilters";
import { TaskFormDialog } from "../tasks/TaskFormDialog";
import { DeleteTaskDialog } from "../tasks/DeleteTaskDialog";
import { TaskDetailSheet } from "../tasks/TaskDetailSheet";
import { Button } from "@repo/ui/components/button";
import { useTasksQuery } from "@/hooks/queries/tasks.queries";
import {
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
} from "@/hooks/mutations/tasks.mutations";
import { STATUS, type Status } from "@repo/types/constants";
import type {
  TaskResponse,
  CreateTaskDto,
  TaskFilters as ITaskFilters,
} from "@repo/types/tasks";
import { Plus } from "lucide-react";
import { Spinner } from "@repo/ui/components/spinner";
import { useDebounce } from "@/hooks/use-debounce";

const columns = [
  { id: STATUS.TODO, title: "A Fazer" },
  { id: STATUS.IN_PROGRESS, title: "Em Progresso" },
  { id: STATUS.REVIEW, title: "Revisão" },
  { id: STATUS.DONE, title: "Concluído" },
];

export function KanbanBoard() {
  const [filters, setFilters] = useState<ITaskFilters>({});
  const debouncedFilters = useDebounce(filters, 300);

  const { data: tasks, isLoading } = useTasksQuery(debouncedFilters);
  const createTaskMutation = useCreateTaskMutation();
  const updateTaskMutation = useUpdateTaskMutation();
  const deleteTaskMutation = useDeleteTaskMutation();

  const [activeTask, setActiveTask] = useState<TaskResponse | null>(null);
  const [selectedTask, setSelectedTask] = useState<TaskResponse | null>(null);
  const [selectedTaskDetail, setSelectedTaskDetail] =
    useState<TaskResponse | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const openTaskDetail = (task: TaskResponse) => {
    setSelectedTaskDetail(task);
    setIsDetailOpen(true);
  };

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
          if (selectedTaskDetail?.id === selectedTask.id) {
            setSelectedTaskDetail({
              ...selectedTaskDetail,
              ...data,
            } as TaskResponse);
          }
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
        if (selectedTaskDetail?.id === selectedTask.id) {
          setIsDetailOpen(false);
          setSelectedTaskDetail(null);
        }
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
    <div className="h-full flex flex-col space-y-4 container mx-auto">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Quadro de Tarefas</h2>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nova Tarefa
        </Button>
      </div>

      <TaskFilters filters={filters} onFilterChange={setFilters} />

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 h-full overflow-y-auto xl:overflow-hidden pb-4">
          {columns.map((col) => (
            <div key={col.id} className="h-full min-h-[500px] xl:min-h-0">
              <KanbanColumn
                id={col.id}
                title={col.title}
                tasks={tasks?.content.filter((t) => t.status === col.id) || []}
                onEdit={openTaskDetail}
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

        <DragOverlay dropAnimation={null}>
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

      <TaskDetailSheet
        task={selectedTaskDetail}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
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
  );
}
