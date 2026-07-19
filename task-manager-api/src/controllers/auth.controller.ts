import { AuthService } from "../services/auth.service.js";
import type { Request, Response } from "express";

const service = new AuthService()
export class AuthController {
  register(_req: Request, res: Response) {
    res.status(201).json({ message: "Register" });
  }
  async login(req: Request, res: Response) {
    const {email, password} =req.body
    const result = await service.login(email, password)
    res.json({
        success:true,
        data: result
    })
  }
  logout(_req: Request, res: Response) {
    res.status(200).json({ message: "Logout" });
  }
  me(_req: Request, res: Response) {
    res.status(200).json({ message: "Me" });
  }
}