import { Injectable, Inject, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ClientProxy } from "@nestjs/microservices";
import { firstValueFrom } from "rxjs";
import { JwtService } from "@nestjs/jwt";
import { User } from "@repo/db";
import {
  RABBITMQ_CLIENTS,
  REFRESH_TOKEN_COOKIE_NAME,
  RPC_AUTH_PATTERNS,
} from "@repo/common/constants";
import { AuthUser, JwtPayload } from "@repo/common/types/auth";
import {
  CreateUserRpcDto,
  ValidateUserRpcDto,
} from "@repo/common/dto/auth-rpc";
import { ConfigKeys } from "../config.schema";

@Injectable()
export class AuthService implements OnModuleInit {
  private readonly refreshJwtSecret: string;
  private readonly refreshJwtExpirationTime: number;

  constructor(
    @Inject(RABBITMQ_CLIENTS.AUTH_SERVICE) private client: ClientProxy,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {
    this.refreshJwtSecret = this.configService.get<string>(
      ConfigKeys.JWT_REFRESH_SECRET,
    );
    this.refreshJwtExpirationTime = this.configService.get<number>(
      ConfigKeys.JWT_REFRESH_EXPIRATION_TIME,
    );
  }

  async onModuleInit() {
    await this.client.connect();
  }

  async validateUser(email: string, pass: string): Promise<User | null> {
    const payload: ValidateUserRpcDto = { email, pass };
    return firstValueFrom(
      this.client.send<User | null, ValidateUserRpcDto>(
        RPC_AUTH_PATTERNS.VALIDATE_USER,
        payload,
      ),
    );
  }

  async createUser(
    username: string,
    email: string,
    pass: string,
  ): Promise<User> {
    const payload: CreateUserRpcDto = { username, email, pass };
    return firstValueFrom(
      this.client.send<User, CreateUserRpcDto>(
        RPC_AUTH_PATTERNS.CREATE_USER,
        payload,
      ),
    );
  }

  async login(user: AuthUser) {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      username: user.username,
    };
    return {
      accessToken: this.jwtService.sign(payload),
      refreshToken: this.jwtService.sign(payload, {
        secret: this.refreshJwtSecret,
        expiresIn: this.refreshJwtExpirationTime,
      }),
    };
  }

  getCookieWithJwtRefreshToken(refreshToken: string) {
    return `${REFRESH_TOKEN_COOKIE_NAME}=${refreshToken}; HttpOnly; Path=/auth/refresh; Max-Age=${this.refreshJwtExpirationTime}`;
  }

  getCookieForLogOut() {
    return `${REFRESH_TOKEN_COOKIE_NAME}=; HttpOnly; Path=/auth/refresh; Max-Age=0`;
  }

  async verifyRefreshToken(refreshToken: string): Promise<JwtPayload | null> {
    try {
      return this.jwtService.verify<JwtPayload>(refreshToken, {
        secret: this.refreshJwtSecret,
      });
    } catch {
      return null;
    }
  }

  verifyToken(token: string): JwtPayload {
    return this.jwtService.verify<JwtPayload>(token);
  }
}
