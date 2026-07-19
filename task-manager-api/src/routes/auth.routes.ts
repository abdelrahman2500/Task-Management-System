import { Router } from "express";
import { AuthController } from "../controllers/auth.controller.js";

const router = Router();
const controller = new AuthController();

router.post("/register", (_req, res) => {});
router.post("/login", (req, res) =>
    controller.login(req, res)
);
router.post("/logout", () => {});
router.get("/me", () => {});

export default router;