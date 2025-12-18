import { IsString } from "class-validator";

export class SearchUsersRpcDto {
  @IsString()
  search: string;
}
