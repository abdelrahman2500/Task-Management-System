import type { User } from "@prisma/client";

export interface AuthRepositoryInterface {
  findByEmail(email: string): Promise<User | null>;
  findById(id: number): Promise<User | null>;
}
