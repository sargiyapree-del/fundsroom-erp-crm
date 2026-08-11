import { Router } from "express";
import {
  loginController,
  getMe
} from "../controllers/auth.controller";
import {
  authenticate,
  authorize
} from "../middleware/auth.middleware";

const router = Router();

router.post("/login", loginController);

router.get("/me", authenticate, getMe);

// Temporary RBAC test route


export default router;