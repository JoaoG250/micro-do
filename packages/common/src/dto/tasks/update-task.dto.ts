import { IsString, IsOptional, IsEnum, IsArray } from "class-validator";
import { PRIORITY, STATUS } from "../../constants";
import type { Priority, Status } from "../../constants";
import { ApiProperty } from "@nestjs/swagger";

export class UpdateTaskDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ enum: PRIORITY, required: false })
  @IsEnum(PRIORITY)
  @IsOptional()
  priority?: Priority;

  @ApiProperty({ enum: STATUS, required: false })
  @IsEnum(STATUS)
  @IsOptional()
  status?: Status;

  @ApiProperty({ required: false })
  @IsOptional()
  dueDate?: Date;

  @ApiProperty({ type: [String], required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  assigneeIds?: string[];
}
