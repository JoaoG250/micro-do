import { IsNotEmpty, IsString } from "class-validator";
import { Expose } from "class-transformer";

export class CommentCreatedRpcDto {
  @Expose()
  @IsString()
  @IsNotEmpty()
  id: string;

  @Expose()
  @IsString()
  @IsNotEmpty()
  taskId: string;

  @Expose()
  @IsString()
  @IsNotEmpty()
  authorId: string;
}
