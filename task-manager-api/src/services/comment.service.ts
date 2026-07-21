import { CommentRepository } from "../repositories/comment.repository.js";
import { AppError } from "../utils/errors/app-error.js";

export class CommentService {
  constructor(private repository = new CommentRepository()) {}

  async getAllComments() {
    return this.repository.findAll();
  }

  async getCommentById(id: number) {
    const comment = await this.repository.findById(id);

    if (!comment) {
      throw new AppError(404, "COMMENT_NOT_FOUND", "Comment not found");
    }

    return comment;
  }

  async getCommentsByTaskId(taskId: number) {
    return this.repository.findByTaskId(taskId);
  }

  async createComment(data: { taskId: number; authorId: number; body: string }) {
    return await this.repository.create(data);
  }

  async updateComment(id: number, data: { body?: string }) {
    return await this.repository.update(id, data);
  }

  async deleteComment(id: number) {
    return this.repository.delete(id);
  }
}
