import type { Request, Response } from "express";
import { UserService } from "../services/user.service.js";
import type { CreateUserDto, UpdateUserDto } from "../dto/user.dto.js";
import { createOrUpdateUserSchema } from "../dto/user/create-user.schema.js";

const service = new UserService();

export class UserController {
  async getAllUsers(_: Request, res: Response) {
    try {
      const users = await service.getAllUsers();
      return res.json({ success: true, data: users });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  async getUserById(req: Request, res: Response) {
    try {
      const userId = parseInt(req.params.userId as string, 10);
      if (isNaN(userId)) {
        return res.status(400).json({ success: false, error: "Invalid user ID" });
      }
      const user = await service.getUserById(userId);
      if (!user) {
        return res.status(404).json({ success: false, error: "User not found" });
      }
      return res.json({ success: true, data: user });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  async createUser(req: Request<{}, {}, CreateUserDto>, res: Response) {
    try {
      const { name, email, password, isActive } = req.body;

      if (!name) {
        return res.status(400).json({ success: false, error: "Name is required" });
      }
      if (!email) {
        return res.status(400).json({ success: false, error: "Email is required" });
      }
      if (!password) {
        return res.status(400).json({ success: false, error: "password is required" });
      }

      const body = createOrUpdateUserSchema.parse(req.body);
      const user = await service.createUser(body);
      return res.status(201).json({ success: true, data: user });
    } catch (error: any) {
      if (error.code === "P2002") {
        return res.status(409).json({ success: false, error: "Email already in use" });
      }
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  async updateUser(req: Request<{ userId: string }, {}, UpdateUserDto>, res: Response) {
    try {
      const userId = parseInt(req.params.userId, 10);
      if (isNaN(userId)) {
        return res.status(400).json({ success: false, error: "Invalid user ID" });
      }

      const body = createOrUpdateUserSchema.parse(req.body);
      const user = await service.updateUser(userId, body);
      return res.json({ success: true, data: user });
    } catch (error: any) {
      if (error.code === "P2002") {
        return res.status(409).json({ success: false, error: "Email already in use" });
      }
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  async deleteUser(req: Request, res: Response) {
    try {
      const userId = parseInt(req.params.userId as string, 10);
      if (isNaN(userId)) {
        return res.status(400).json({ success: false, error: "Invalid user ID" });
      }
      await service.deleteUser(userId);
      return res.json({ success: true, message: "User deleted successfully" });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }
}