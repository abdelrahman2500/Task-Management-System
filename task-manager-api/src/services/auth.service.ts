import { AuthRepository, type SafeUser } from "../repositories/auth.repository.js";
import bcrypt from "bcrypt";
import { generateToken } from "../utils/jwt.js";
import { AppError } from "../utils/errors/app-error.js";
import type { LoginInput, RegisterInput } from "../schemas/auth.schema.js";

const BCRYPT_ROUNDS = 12;
const INVALID_CREDENTIALS_MESSAGE = "Invalid email or password.";

export interface LoginResult {
  token: string;
  user: SafeUser;
}

export class AuthService {
  private readonly repository = new AuthRepository();

  async register(data: RegisterInput): Promise<SafeUser> {
    const normalizedEmail = data.email.trim().toLowerCase();
    const trimmedName = data.name.trim();

    const existingUser = await this.repository.findByEmail(normalizedEmail);
    if (existingUser) {
      throw new AppError(
        409,
        "EMAIL_ALREADY_EXISTS",
        "An account with this email already exists.",
      );
    }

    const passwordHash = await bcrypt.hash(data.password, BCRYPT_ROUNDS);
    return this.repository.create({
      name: trimmedName,
      email: normalizedEmail,
      passwordHash,
    });
  }

  async login({ email, password }: LoginInput): Promise<LoginResult> {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await this.repository.findByEmail(normalizedEmail);

    let passwordValid = false;
    if (user) {
      try {
        passwordValid = await bcrypt.compare(password, user.passwordHash);
      } catch {
        passwordValid = false;
      }
    } else {
      await bcrypt.hash(password, BCRYPT_ROUNDS).catch(() => {});
    }

    if (!user || !passwordValid) {
      throw new AppError(401, "INVALID_CREDENTIALS", INVALID_CREDENTIALS_MESSAGE);
    }

    if (!user.isActive) {
      throw new AppError(401, "ACCOUNT_INACTIVE", INVALID_CREDENTIALS_MESSAGE);
    }

    const token = generateToken(user.id);
    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        isActive: user.isActive,
      },
    };
  }

  async getCurrentUser(userId: number): Promise<SafeUser> {
    const user = await this.repository.findSafeById(userId);
    if (!user || !user.isActive) {
      throw new AppError(401, "UNAUTHORIZED", "Authentication is required.");
    }
    return user;
  }
}
