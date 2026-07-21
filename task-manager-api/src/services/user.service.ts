import { UserRepository } from "../repositories/user.repositoty.js";
import bcrypt from "bcrypt";
import { AppError } from "../utils/errors/app-error.js";

export class UserService {
  constructor(private repository = new UserRepository()) {}

  async getAllUsers() {
    return this.repository.findAll();
  }

  async getUserById(id: number) {
    const user = await this.repository.findById(id);

    if (!user) {
      throw new AppError(404, "USER_NOT_FOUND", "User not found");
    }

    return user;
  }

  async getUserByEmail(email: string) {
    const user = await this.repository.findByEmail(email);

    if (!user) {
      throw new AppError(404, "USER_NOT_FOUND", "User not found");
    }

    return user;
  }

  async createUser(data: {
    name: string;
    email: string;
    password: string;
    isActive?: boolean;
  }) {
    const passwordHash = await bcrypt.hash(data.password, 10);
    return this.repository.create({ ...data, password: passwordHash });
  }

  async updateUser(
    id: number,
    data: {
      name?: string;
      email?: string;
      password?: string;
      isActive?: boolean;
    }
  ) {
    if (data.password) {
      const passwordHash = await bcrypt.hash(data.password, 10);
      return this.repository.update(id, { ...data, password: passwordHash });
    }

    return this.repository.update(id, data);
  }

  async deleteUser(id: number) {
    return this.repository.delete(id);
  }
}
