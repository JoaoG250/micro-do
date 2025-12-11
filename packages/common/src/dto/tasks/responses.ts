import { Exclude, Expose, Type } from "class-transformer";
import type { Priority, Status } from "../../constants";

@Exclude()
export class CommentResponse {
  @Expose()
  id: string;

  @Expose()
  content: string;

  @Expose()
  authorId: string;

  @Expose()
  taskId: string;

  @Expose()
  createdAt: Date;
}

@Exclude()
export class TaskResponse {
  @Expose()
  id: string;

  @Expose()
  title: string;

  @Expose()
  description: string;

  @Expose()
  priority: Priority;

  @Expose()
  status: Status;

  @Expose()
  dueDate: Date;

  @Expose()
  assigneeIds: string[];

  @Expose()
  @Type(() => CommentResponse)
  comments: CommentResponse[];

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
