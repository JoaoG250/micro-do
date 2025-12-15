import { Exclude, Expose, Type } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";
import { PRIORITY, STATUS, type Priority, type Status } from "../../constants";

@Exclude()
export class CommentResponse {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  content: string;

  @ApiProperty()
  @Expose()
  authorId: string;

  @ApiProperty()
  @Expose()
  taskId: string;

  @ApiProperty()
  @Expose()
  createdAt: Date;
}

@Exclude()
export class TaskResponse {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  title: string;

  @ApiProperty()
  @Expose()
  description: string;

  @ApiProperty({ enum: PRIORITY })
  @Expose()
  priority: Priority;

  @ApiProperty({ enum: STATUS })
  @Expose()
  status: Status;

  @ApiProperty()
  @Expose()
  dueDate: Date;

  @ApiProperty({ type: [String] })
  @Expose()
  assigneeIds: string[];

  @ApiProperty({ type: [CommentResponse] })
  @Expose()
  @Type(() => CommentResponse)
  comments: CommentResponse[];

  @ApiProperty()
  @Expose()
  createdAt: Date;

  @ApiProperty()
  @Expose()
  updatedAt: Date;
}
