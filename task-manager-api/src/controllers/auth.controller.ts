import { AuthService } from "../services/auth.service.js";
import type { Request, Response } from "express";
import type { LoginInput, RegisterInput } from "../schemas/auth.schema.js";
import { AppError } from "../utils/errors/app-error.js";
import type { SafeUser } from "../repositories/auth.repository.js";

const service = new AuthService();

export class AuthController {
  async register(
    req: Request<object, unknown, RegisterInput>,
    res: Response,
  ): Promise<Response> {
    const user: SafeUser = await service.register({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
    });
    return res.status(201).json({
      success: true,
      data: { user },
    });
  }

  async login(
    req: Request<object, unknown, LoginInput>,
    res: Response,
  ): Promise<Response> {
    const result = await service.login({
      email: req.body.email,
      password: req.body.password,
    });
    return res.status(200).json({
      success: true,
      data: result,
    });
  }

  logout(_req: Request, res: Response): Response {
    return res.status(200).json({
      success: true,
      message:
        "Logged out. Stateless JWT cannot be revoked server-side. Please discard the access token on the client. It will remain valid until its natural expiry.",
    });
  }

  async me(req: Request, res: Response): Promise<Response> {
    if (!req.user) {
      throw new AppError(401, "UNAUTHORIZED", "Authentication is required.");
    }
    return res.status(200).json({
      success: true,
      data: { user: req.user },
    });
  }
}
