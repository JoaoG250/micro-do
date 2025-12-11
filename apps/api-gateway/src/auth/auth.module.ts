import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { JwtStrategy } from "./jwt.strategy";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { RABBITMQ_CLIENTS, RABBITMQ_QUEUES } from "@repo/common/constants";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { ConfigKeys } from "src/config.schema";

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>(ConfigKeys.JWT_SECRET),
        signOptions: {
          expiresIn: configService.get<number>(ConfigKeys.JWT_EXPIRATION_TIME),
        },
      }),
      inject: [ConfigService],
    }),
    ClientsModule.registerAsync([
      {
        name: RABBITMQ_CLIENTS.AUTH_SERVICE,
        imports: [ConfigModule],
        useFactory: async (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.get<string>(ConfigKeys.RABBITMQ_URL)],
            queue: RABBITMQ_QUEUES.AUTH_QUEUE,
            queueOptions: {
              durable: false,
            },
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
