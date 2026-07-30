import { AuthRepository } from "../repositories/auth.repository.js";
import bcrypt from "bcrypt";
import { generateToken } from "../utils/jwt.js";
import { AppError } from "../utils/errors/app-error.js";
import type { CreateOrUpdateUserSchema } from "../dto/user/create-user.schema.js";

export class AuthService {
  private repository = new AuthRepository();
  // async register(name: string, email: string, password: string) {
  //   return await this.repository.register({
  //         ...data,
  //         status: data.status ?? ProjectStatus.ACTIVE,
  //       });
  // }
  async register(data: CreateOrUpdateUserSchema) {
    const passwordHash = await bcrypt.hash(data.password, 10);
    return this.repository.register({
      ...data,
      password: passwordHash,
    });
  }
  async login(email: string, password: string) {
    const user = await this.repository.findByEmail(email);
    if (!user) {
      throw new AppError(
        401,
        "INVALID_CREDENTIALS",
        "Invalid email or password",
      );
    }
    const isMatch = await bcrypt.compare(password, user.passwordHash);

    if (!isMatch) {
      throw new AppError(
        401,
        "INVALID_CREDENTIALS",
        "Invalid email or password",
      );
    }
    const token = generateToken(user.id);
    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    };
  }
  logout() {}
  me() {}
}
