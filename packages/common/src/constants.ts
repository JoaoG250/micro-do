export const RABBITMQ_CLIENTS = {
  AUTH_SERVICE: "AUTH_SERVICE",
} as const;

export const RABBITMQ_QUEUES = {
  AUTH_QUEUE: "auth_queue",
} as const;

export const RPC_AUTH_PATTERNS = {
  VALIDATE_USER: "auth.validate_user",
  CREATE_USER: "auth.create_user",
} as const;

export const REFRESH_TOKEN_COOKIE_NAME = "jungle-do.refresh-token";
