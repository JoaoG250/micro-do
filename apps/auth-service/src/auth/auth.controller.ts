import { Controller } from "@nestjs/common";
import { MessagePattern, Payload } from "@nestjs/microservices";
import { AuthService } from "./auth.service";
import { RPC_AUTH_PATTERNS } from "@repo/common/constants";
import {
  CreateUserRpcDto,
  ValidateUserRpcDto,
  SearchUsersRpcDto,
} from "@repo/common/dto/auth-rpc";

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern(RPC_AUTH_PATTERNS.VALIDATE_USER)
  async validateUser(@Payload() data: ValidateUserRpcDto) {
    return this.authService.validateUser(data.email, data.pass);
  }

  @MessagePattern(RPC_AUTH_PATTERNS.CREATE_USER)
  async createUser(@Payload() data: CreateUserRpcDto) {
    return this.authService.createUser(data.username, data.email, data.pass);
  }

  @MessagePattern(RPC_AUTH_PATTERNS.SEARCH_USERS)
  async searchUsers(@Payload() data: SearchUsersRpcDto) {
    return this.authService.searchUsers(data.search);
  }
}
