export const PRIORITY = {
  LOW: "LOW",
  MEDIUM: "MEDIUM",
  HIGH: "HIGH",
  URGENT: "URGENT",
} as const;

export type Priority = (typeof PRIORITY)[keyof typeof PRIORITY];

export const STATUS = {
  TODO: "TODO",
  IN_PROGRESS: "IN_PROGRESS",
  REVIEW: "REVIEW",
  DONE: "DONE",
} as const;

export type Status = (typeof STATUS)[keyof typeof STATUS];

export const NOTIFICATION_TYPE = {
  TASK_ASSIGNED: "TASK_ASSIGNED",
  TASK_UPDATED: "TASK_UPDATED",
  COMMENT_CREATED: "COMMENT_CREATED",
} as const;

export type NotificationType =
  (typeof NOTIFICATION_TYPE)[keyof typeof NOTIFICATION_TYPE];

export const WEBSOCKET_EVENTS = {
  TASK_CREATED: "task:created",
  TASK_UPDATED: "task:updated",
  COMMENT_NEW: "comment:new",
} as const;

export const REFRESH_TOKEN_COOKIE_NAME = "micro-do.refresh-token";
