import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@repo/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/dialog";
import { Field, FieldLabel, FieldError } from "@repo/ui/components/field";
import { Input } from "@repo/ui/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import { Textarea } from "@repo/ui/components/textarea";
import type { TaskResponse, CreateTaskDto } from "@repo/types/tasks";
import { useEffect } from "react";
import { PRIORITY, STATUS } from "@repo/types/constants";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@repo/ui/components/popover";
import { Calendar } from "@repo/ui/components/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@repo/ui/lib/utils";
import { UserMultiSelect } from "../common/UserMultiSelect";
import { taskSchema, type TaskSchema } from "@/validation/schemas";

interface TaskFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateTaskDto) => void;
  task?: TaskResponse | null;
  isSubmitting?: boolean;
}

export function TaskFormDialog({
  open,
  onOpenChange,
  onSubmit,
  task,
  isSubmitting,
}: TaskFormDialogProps) {
  const form = useForm<TaskSchema>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: "",
      description: "",
      status: STATUS.TODO,
      priority: PRIORITY.MEDIUM,
      assigneeIds: [],
    },
  });

  useEffect(() => {
    if (task) {
      form.reset({
        title: task.title,
        description: task.description || "",
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
        assigneeIds: task.assigneeIds || [],
      });
    } else {
      form.reset({
        title: "",
        description: "",
        status: STATUS.TODO,
        priority: PRIORITY.MEDIUM,
        dueDate: undefined,
        assigneeIds: [],
      });
    }
  }, [task, form, open]);

  const handleSubmit = (values: TaskSchema) => {
    onSubmit(values);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {task ? "Editar Tarefa" : "Criar Nova Tarefa"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <Controller
            control={form.control}
            name="title"
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel htmlFor={field.name}>Título</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  placeholder="Título da tarefa"
                  data-invalid={fieldState.invalid}
                  aria-invalid={fieldState.invalid}
                />
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />
          <Controller
            control={form.control}
            name="description"
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel htmlFor={field.name}>Descrição</FieldLabel>
                <Textarea
                  {...field}
                  id={field.name}
                  placeholder="Descrição da tarefa"
                  className="resize-none"
                  data-invalid={fieldState.invalid}
                  aria-invalid={fieldState.invalid}
                />
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />
          <div className="flex gap-4">
            <Controller
              control={form.control}
              name="status"
              render={({ field, fieldState }) => (
                <Field className="flex-1">
                  <FieldLabel htmlFor={field.name}>Status</FieldLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <SelectTrigger
                      id={field.name}
                      data-invalid={fieldState.invalid}
                      aria-invalid={fieldState.invalid}
                    >
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={STATUS.TODO}>A fazer</SelectItem>
                      <SelectItem value={STATUS.IN_PROGRESS}>
                        Em progresso
                      </SelectItem>
                      <SelectItem value={STATUS.REVIEW}>Revisão</SelectItem>
                      <SelectItem value={STATUS.DONE}>Concluído</SelectItem>
                    </SelectContent>
                  </Select>
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />
            <Controller
              control={form.control}
              name="priority"
              render={({ field, fieldState }) => (
                <Field className="flex-1">
                  <FieldLabel htmlFor={field.name}>Prioridade</FieldLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <SelectTrigger
                      id={field.name}
                      data-invalid={fieldState.invalid}
                      aria-invalid={fieldState.invalid}
                    >
                      <SelectValue placeholder="Selecione a prioridade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={PRIORITY.LOW}>Baixa</SelectItem>
                      <SelectItem value={PRIORITY.MEDIUM}>Média</SelectItem>
                      <SelectItem value={PRIORITY.HIGH}>Alta</SelectItem>
                      <SelectItem value={PRIORITY.URGENT}>Urgente</SelectItem>
                    </SelectContent>
                  </Select>
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />
          </div>
          <Controller
            control={form.control}
            name="dueDate"
            render={({ field, fieldState }) => (
              <Field className="flex flex-col">
                <FieldLabel htmlFor={field.name}>Data de Vencimento</FieldLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground",
                        fieldState.invalid &&
                          "border-destructive text-destructive"
                      )}
                      id={field.name}
                    >
                      {field.value ? (
                        format(field.value, "PPP", { locale: ptBR })
                      ) : (
                        <span>Selecione uma data</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                      lang="pt-BR"
                    />
                  </PopoverContent>
                </Popover>
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="assigneeIds"
            render={({ field }) => (
              <Field>
                <FieldLabel>Atribuir a</FieldLabel>
                <UserMultiSelect
                  value={field.value || []}
                  onChange={field.onChange}
                />
              </Field>
            )}
          />

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
