import type { Comment } from "@prisma/client";

export interface CreateCommentRepositoryData {
  taskId: number;
  authorId: number;
  body: string;
}

export interface UpdateCommentRepositoryData {
  body?: string;
}

export interface CommentRepositoryInterface {
  findAll(): Promise<Comment[]>;
  findById(id: number): Promise<Comment | null>;
  findByTaskId(taskId: number): Promise<Comment[]>;
  create(data: CreateCommentRepositoryData): Promise<Comment>;
  update(id: number, data: UpdateCommentRepositoryData): Promise<Comment>;
  delete(id: number): Promise<Comment>;
}
