import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@repo/ui/components/sheet";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { Textarea } from "@repo/ui/components/textarea";
import { ScrollArea } from "@repo/ui/components/scroll-area";
import { Separator } from "@repo/ui/components/separator";
import { Avatar, AvatarFallback } from "@repo/ui/components/avatar";
import {
  Calendar,
  Clock,
  Trash2,
  Edit2,
  Send,
  MessageSquare,
  User,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { TaskResponse } from "@repo/types/tasks";
import { useTaskCommentsQuery } from "@/hooks/queries/tasks.queries";
import { useCreateCommentMutation } from "@/hooks/mutations/tasks.mutations";
import { useState } from "react";
import { cn } from "@repo/ui/lib/utils";
import { PRIORITY, STATUS } from "@repo/types/constants";

interface TaskDetailSheetProps {
  task: TaskResponse | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (task: TaskResponse) => void;
  onDelete: (taskId: string) => void;
}

const statusMap = {
  [STATUS.TODO]: "A Fazer",
  [STATUS.IN_PROGRESS]: "Em Progresso",
  [STATUS.REVIEW]: "Revisão",
  [STATUS.DONE]: "Concluído",
};

const priorityMap = {
  [PRIORITY.LOW]: {
    label: "Baixa",
    color: "bg-blue-100 text-blue-800 border-blue-200",
  },
  [PRIORITY.MEDIUM]: {
    label: "Média",
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
  },
  [PRIORITY.HIGH]: {
    label: "Alta",
    color: "bg-orange-100 text-orange-800 border-orange-200",
  },
  [PRIORITY.URGENT]: {
    label: "Urgente",
    color: "bg-red-100 text-red-800 border-red-200",
  },
};

export function TaskDetailSheet({
  task,
  open,
  onOpenChange,
  onEdit,
  onDelete,
}: TaskDetailSheetProps) {
  const [newComment, setNewComment] = useState("");
  const { data: commentsPage, isLoading: isLoadingComments } =
    useTaskCommentsQuery(task?.id || "");
  const createCommentMutation = useCreateCommentMutation();

  if (!task) return null;

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    createCommentMutation.mutate(
      { taskId: task.id, content: newComment },
      {
        onSuccess: () => {
          setNewComment("");
        },
      }
    );
  };

  const priorityConfig =
    priorityMap[task.priority] || priorityMap[PRIORITY.MEDIUM];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-xl w-full flex flex-col h-full p-0 gap-0">
        <SheetHeader className="p-6 pb-2">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <SheetTitle className="text-xl font-semibold leading-tight">
                {task.title}
              </SheetTitle>
              <div className="flex flex-wrap gap-2 pt-2">
                <Badge variant="outline" className="font-normal capitalize">
                  {statusMap[task.status]}
                </Badge>
                <Badge
                  variant="secondary"
                  className={cn("font-normal border", priorityConfig.color)}
                >
                  {priorityConfig.label}
                </Badge>
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(task)}
                className="h-8 w-8 text-muted-foreground hover:text-primary"
                title="Editar tarefa"
              >
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(task.id)}
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                title="Excluir tarefa"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1 px-6">
          <div className="space-y-6 py-4">
            {/* Description */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">
                Descrição
              </h3>
              <p className="text-sm whitespace-pre-wrap leading-relaxed">
                {task.description || "Nenhuma descrição fornecida."}
              </p>
            </div>

            <Separator />

            {/* Metadata */}
            <div className="grid grid-cols-2 gap-4">
              {task.dueDate && (
                <div className="space-y-1">
                  <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5" />
                    Data de Vencimento
                  </h3>
                  <p className="text-sm">
                    {format(new Date(task.dueDate), "PPP", { locale: ptBR })}
                  </p>
                </div>
              )}

              <div className="space-y-1">
                <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <User className="h-3.5 w-3.5" />
                  Atribuído a
                </h3>
                <div className="flex items-center gap-1">
                  {task.assigneeIds && task.assigneeIds.length > 0 ? (
                    <span className="text-sm">
                      {task.assigneeIds.length} usuário(s)
                    </span>
                  ) : (
                    <span className="text-sm text-muted-foreground italic">
                      Não atribuído
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5" />
                  Criado em
                </h3>
                <p className="text-sm">
                  {format(new Date(task.createdAt), "PPP 'às' HH:mm", {
                    locale: ptBR,
                  })}
                </p>
              </div>
            </div>

            <Separator />

            {/* Comments Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Comentários
              </h3>

              <div className="space-y-4">
                {isLoadingComments ? (
                  <div className="flex justify-center p-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  </div>
                ) : commentsPage?.content?.length ? (
                  commentsPage.content.map((comment) => (
                    <div key={comment.id} className="flex gap-3 text-sm">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">U</AvatarFallback>
                      </Avatar>
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Usuário</span>
                          <span className="text-xs text-muted-foreground">
                            {format(
                              new Date(comment.createdAt),
                              "dd/MM/yyyy HH:mm"
                            )}
                          </span>
                        </div>
                        <p className="text-muted-foreground bg-muted/50 p-3 rounded-md">
                          {comment.content}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4 italic">
                    Nenhum comentário ainda.
                  </p>
                )}
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Add Comment Footer */}
        <div className="p-4 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex gap-2">
            <Textarea
              placeholder="Escreva um comentário..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="resize-none min-h-[44px] max-h-[120px]"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleAddComment();
                }
              }}
            />
            <Button
              size="icon"
              onClick={handleAddComment}
              disabled={!newComment.trim() || createCommentMutation.isPending}
              className="shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
