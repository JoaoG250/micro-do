import { Exclude, Expose } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";
import type {
  RegisterResponse as IRegisterResponse,
  LoginResponse as ILoginResponse,
  UserResponse as IUserResponse,
  SearchUserResponse as ISearchUserResponse,
} from "@repo/types/auth";

@Exclude()
export class RegisterResponse implements IRegisterResponse {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  email: string;

  @ApiProperty()
  @Expose()
  username: string;
}

@Exclude()
export class LoginResponse implements ILoginResponse {
  @ApiProperty()
  @Expose()
  accessToken: string;
}

@Exclude()
export class UserResponse implements IUserResponse {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  email: string;

  @ApiProperty()
  @Expose()
  username: string;
}

@Exclude()
export class SearchUserResponse implements ISearchUserResponse {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  username: string;
}
