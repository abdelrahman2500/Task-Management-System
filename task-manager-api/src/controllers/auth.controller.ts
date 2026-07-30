import type { CreateOrUpdateUserSchema } from "../dto/user/create-user.schema.js";
import { AuthService } from "../services/auth.service.js";
import type { Request, Response } from "express";

const service = new AuthService();
export class AuthController {
  async register(
    req: Request<{}, {}, CreateOrUpdateUserSchema>,
    res: Response,
  ) {
    const { name, email, password } = req.body;
    const user = await service.register({
      name,
      email,
      password,
    });
    return res.status(201).json({ success: true });
  }

  async login(req: Request, res: Response) {
    const { email, password } = req.body;
    const result = await service.login(email, password);
    return res.json({
      success: true,
      data: result,
    });
  }
  logout(_req: Request, res: Response) {
    res.status(200).json({ message: "Logout" });
  }
  me(_req: Request, res: Response) {
    res.status(200).json({ message: "Me" });
  }
}
