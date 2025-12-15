import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { NotificationsGateway } from "./notifications.gateway";
import { NotificationsController } from "./notifications.controller";

@Module({
  imports: [AuthModule],
  controllers: [NotificationsController],
  providers: [NotificationsGateway],
})
export class NotificationsModule {}
