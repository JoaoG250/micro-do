import { IsString, IsEmail, MinLength } from "class-validator";

export class RpcValidateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  pass: string;
}
