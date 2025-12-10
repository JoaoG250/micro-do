import { Injectable, Inject, OnModuleInit } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { firstValueFrom } from "rxjs";
import { JwtService } from "@nestjs/jwt";
import { User } from "@repo/db";
import { RABBITMQ_CLIENTS } from "@repo/common/constants";
import { JwtPayload } from "@repo/common/types/auth";

@Injectable()
export class AuthService implements OnModuleInit {
  constructor(
    @Inject(RABBITMQ_CLIENTS.AUTH_SERVICE) private client: ClientProxy,
    private jwtService: JwtService,
  ) {}

  async onModuleInit() {
    await this.client.connect();
  }

  async validateUser(email: string, pass: string): Promise<User | null> {
    return firstValueFrom(
      this.client.send<User | null>("auth.validate_user", { email, pass }),
    );
  }

  async createUser(
    username: string,
    email: string,
    pass: string,
  ): Promise<User> {
    return firstValueFrom(
      this.client.send<User>("auth.create_user", { username, email, pass }),
    );
  }

  async login(user: User) {
    const payload: JwtPayload = {
      email: user.email,
      sub: user.id,
      name: user.username,
    };
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }
}
