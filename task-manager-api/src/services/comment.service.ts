import { CommentRepository } from "../repositories/comment.repository.js";

export class CommentService {
  constructor(private repository = new CommentRepository()) {}

  async getAllComments() {
    return await this.repository.findAll();
  }

  async getCommentById(id: number) {
    return await this.repository.findById(id);
  }

  async getCommentsByTaskId(taskId: number) {
    return await this.repository.findByTaskId(taskId);
  }

  async createComment(data: { taskId: number; authorId: number; body: string }) {
    return await this.repository.create(data);
  }

  async updateComment(id: number, data: { body?: string }) {
    return await this.repository.update(id, data);
  }

  async deleteComment(id: number) {
    return await this.repository.delete(id);
  }
}
