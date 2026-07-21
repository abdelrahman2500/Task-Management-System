import type { User } from "@prisma/client";

export interface CreateUserRepositoryData {
  name: string;
  email: string;
  password: string;
  isActive?: boolean;
}

export interface UpdateUserRepositoryData {
  name?: string;
  email?: string;
  password?: string;
  isActive?: boolean;
}

export interface UserRepositoryInterface {
  findAll(): Promise<User[]>;
  findById(id: number): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(
    data: CreateUserRepositoryData,
  ): Promise<Pick<User, "id" | "name" | "email" | "createdAt">>;
  update(id: number, data: UpdateUserRepositoryData): Promise<User>;
  delete(id: number): Promise<User>;
}
