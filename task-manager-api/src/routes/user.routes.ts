import { Router } from "express";
import { UserController } from "../controllers/user.controller.js";

const router = Router();
const controller = new UserController();

router.get("/", controller.getAllUsers);
router.post("/", controller.createUser);
router.get("/:userId", controller.getUserById);
router.patch("/:userId", controller.updateUser);
router.delete("/:userId", controller.deleteUser);

export default router;
