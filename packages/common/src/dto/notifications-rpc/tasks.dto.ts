import { IsNotEmpty, IsString, IsObject } from "class-validator";
import { Expose } from "class-transformer";

export class TaskCreatedRpcDto {
  @Expose()
  @IsString()
  @IsNotEmpty()
  id: string;

  @Expose()
  @IsString()
  @IsNotEmpty()
  title: string;

  @Expose()
  @IsObject()
  assignees: { id: string }[];
}

export class TaskUpdatedRpcDto {
  @Expose()
  @IsString()
  @IsNotEmpty()
  id: string;

  @Expose()
  @IsString()
  @IsNotEmpty()
  title: string;

  @Expose()
  @IsObject()
  assignees: { id: string }[];
}
