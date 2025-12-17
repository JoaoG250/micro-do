import { IsOptional, IsInt, Min, IsString, IsNotEmpty } from "class-validator";

export class ListCommentsRpcDto {
  @IsString()
  @IsNotEmpty()
  taskId: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number = 10;
}
