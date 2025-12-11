import {
  Controller,
  Request,
  Post,
  UseGuards,
  Body,
  Get,
  UnauthorizedException,
  Res,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import type { Response } from "express";
import { AuthService } from "./auth.service";
import { AuthGuard } from "@nestjs/passport";
import {
  CreateUserDto,
  LoginDto,
  RegisterResponse,
  LoginResponse,
  UserResponse,
} from "@repo/common/dto/auth";
import type { HttpRequest } from "src/types";
import type { AuthUser } from "@repo/common/types/auth";
import { REFRESH_TOKEN_COOKIE_NAME } from "@repo/common/constants";
import { plainToInstance } from "class-transformer";

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post("register")
  async register(@Body() body: CreateUserDto): Promise<RegisterResponse> {
    const user = await this.authService.createUser(
      body.username,
      body.email,
      body.password,
    );
    return plainToInstance(RegisterResponse, user, {
      excludeExtraneousValues: true,
    });
  }

  @Post("login")
  async login(
    @Body() body: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<LoginResponse> {
    const user = await this.authService.validateUser(body.email, body.password);
    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }
    const { accessToken, refreshToken } = await this.authService.login(user);
    const cookie = this.authService.getCookieWithJwtRefreshToken(refreshToken);
    res.setHeader("Set-Cookie", cookie);
    return plainToInstance(
      LoginResponse,
      { accessToken },
      { excludeExtraneousValues: true },
    );
  }

  @Post("refresh")
  async refresh(@Request() req: HttpRequest): Promise<LoginResponse> {
    const refreshToken = req.cookies[REFRESH_TOKEN_COOKIE_NAME];
    if (!refreshToken || typeof refreshToken !== "string") {
      throw new UnauthorizedException("Refresh token not found");
    }
    const payload = await this.authService.verifyRefreshToken(refreshToken);
    if (!payload) {
      throw new UnauthorizedException("Invalid refresh token");
    }
    const user: AuthUser = {
      id: payload.sub,
      email: payload.email,
      username: payload.username,
    };
    const { accessToken } = await this.authService.login(user);
    return plainToInstance(
      LoginResponse,
      { accessToken },
      { excludeExtraneousValues: true },
    );
  }

  @Post("logout")
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@Res({ passthrough: true }) res: Response): Promise<void> {
    const cookie = this.authService.getCookieForLogOut();
    res.setHeader("Set-Cookie", cookie);
  }

  @UseGuards(AuthGuard("jwt"))
  @Get("profile")
  getProfile(@Request() req: HttpRequest): UserResponse {
    return plainToInstance(UserResponse, req.user, {
      excludeExtraneousValues: true,
    });
  }
}
