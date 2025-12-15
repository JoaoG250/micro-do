import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WsException,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { Injectable } from "@nestjs/common";

@Injectable()
@WebSocketGateway({ cors: { origin: "*" } })
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);

    client.onAny((event) => {
      if (event !== "join") {
        client.emit("exception", { status: "error", message: "Forbidden" });
      }
    });
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage("join")
  async handleJoinRoom(
    @MessageBody() userId: string,
    @ConnectedSocket() client: Socket,
  ) {
    const roomName = this.getUserRoom(userId);
    const roomSize = this.server.sockets.adapter.rooms.get(roomName)?.size || 0;

    if (roomSize >= 3) {
      throw new WsException("Forbidden");
    }

    await client.join(roomName);
    console.log(`Client ${client.id} joined room ${roomName}`);
  }

  private getUserRoom(userId: string) {
    return `user_${userId}`;
  }

  notifyUser(userId: string, event: string, payload: any) {
    this.server.to(this.getUserRoom(userId)).emit(event, payload);
  }
}
