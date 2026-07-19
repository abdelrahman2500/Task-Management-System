export interface CreateCommentDto {
  taskId: number;
  authorId: number;
  body: string;
}

export interface UpdateCommentDto {
  body: string;
}
