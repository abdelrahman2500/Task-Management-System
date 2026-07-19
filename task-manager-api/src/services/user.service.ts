import { UserRepository } from "../repositories/user.repositoty.js";
import bcrypt from "bcrypt";

export class UserService {
  constructor(private repository = new UserRepository()) {}

  async getAllUsers() {
    return await this.repository.findAll();
  }

  async getUserById(id: number) {
    return await this.repository.findById(id);
  }

  async getUserByEmail(email: string) {
    return await this.repository.findByEmail(email);
  }

  async createUser(data: {
    name: string;
    email: string;
    password: string;
    isActive?: boolean;
  }) {
    const passwordHash = await bcrypt.hash(data.password, 10);
    return await this.repository.create({...data, password: passwordHash});
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
      return await this.repository.update(id, {...data, password: passwordHash});
    }
    return await this.repository.update(id, data);
  }

  async deleteUser(id: number) {
    return await this.repository.delete(id);
  }
}