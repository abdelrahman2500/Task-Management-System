import type { Request } from "express";

export interface AuthPayload {
  userId: number;
  email: string;
}

export interface AuthRequest extends Request {
  user?: AuthPayload;
}

export interface PaginationQuery {
  limit?: string;
  cursor?: string;
}

export interface PaginationResult<T> {
  data: T[];
  page: {
    nextCursor: string | null;
    hasMore: boolean;
  };
}
