import { AuthUser } from "@repo/common/types/auth";
import { Request } from "express";

export interface HttpRequest extends Request {
  user: AuthUser;
}
