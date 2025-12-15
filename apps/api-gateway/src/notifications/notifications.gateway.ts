import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { Injectable } from "@nestjs/common";
import { AuthService } from "../auth/auth.service";

@Injectable()
@WebSocketGateway({ cors: { origin: "*" } })
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(private readonly authService: AuthService) {}

  async handleConnection(client: Socket) {
    console.log(`Client connecting: ${client.id}`);

    const token = this.extractToken(client);
    if (!token) {
      console.log(`Client ${client.id} - No token provided`);
      client.disconnect();
      return;
    }

    try {
      const payload = this.authService.verifyToken(token);
      const userId = payload.sub;
      const roomName = this.getUserRoom(userId);

      const roomSize =
        this.server.sockets.adapter.rooms.get(roomName)?.size || 0;
      if (roomSize >= 3) {
        console.log(
          `Client ${client.id} - Connection limit reached for user ${userId}`,
        );
        client.emit("exception", {
          status: "error",
          message: "Connection limit reached",
        });
        client.disconnect();
        return;
      }

      await client.join(roomName);
      console.log(`Client ${client.id} joined room ${roomName}`);

      client.onAny((event) => {
        if (event !== "join") {
          client.emit("exception", { status: "error", message: "Forbidden" });
        }
      });
    } catch (error) {
      console.log(`Client ${client.id} - Invalid token`, error);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  private extractToken(client: Socket): string | undefined {
    const authHeader = client.handshake.headers.authorization;
    if (authHeader && authHeader.split(" ")[0] === "Bearer") {
      return authHeader.split(" ")[1];
    }
    const tokenQuery = client.handshake.query.token;
    if (typeof tokenQuery === "string") {
      return tokenQuery;
    }
    return undefined;
  }

  private getUserRoom(userId: string) {
    return `user_${userId}`;
  }

  notifyUser(userId: string, event: string, payload: any) {
    this.server.to(this.getUserRoom(userId)).emit(event, payload);
  }
}
