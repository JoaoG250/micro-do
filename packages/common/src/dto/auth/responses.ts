import { Exclude, Expose } from "class-transformer";

@Exclude()
export class RegisterResponse {
  @Expose()
  id: string;

  @Expose()
  email: string;

  @Expose()
  username: string;
}

@Exclude()
export class LoginResponse {
  @Expose()
  accessToken: string;
}

@Exclude()
export class UserResponse {
  @Expose()
  id: string;

  @Expose()
  email: string;

  @Expose()
  username: string;
}
