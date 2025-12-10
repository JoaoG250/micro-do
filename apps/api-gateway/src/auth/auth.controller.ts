import {
  Controller,
  Request,
  Post,
  UseGuards,
  Body,
  Get,
  UnauthorizedException,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthGuard } from "@nestjs/passport";
import {
  CreateUserDto,
  LoginDto,
  RegisterResponse,
  LoginResponse,
} from "@repo/common/dto/auth";
import type { HttpRequest } from "src/types";
import type { AuthUser } from "@repo/common/types/auth";

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post("register")
  async register(@Body() body: CreateUserDto): Promise<RegisterResponse> {
    return this.authService.createUser(
      body.username,
      body.email,
      body.password,
    );
  }

  @Post("login")
  async login(@Body() body: LoginDto): Promise<LoginResponse> {
    const user = await this.authService.validateUser(body.email, body.password);
    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }
    return this.authService.login(user);
  }

  @UseGuards(AuthGuard("jwt"))
  @Get("profile")
  getProfile(@Request() req: HttpRequest): AuthUser {
    return req.user;
  }
}
