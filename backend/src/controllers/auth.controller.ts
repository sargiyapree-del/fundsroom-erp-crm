import type { Request, Response } from "express";
import { login } from "../services/auth.service";
import type { AuthenticatedRequest } from "../middleware/auth.middleware";

export async function loginController(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const body = req.body ?? {};

    const { email, password } = body;

    if (!email || !password) {
      res.status(400).json({
        message: "Email and password are required"
      });
      return;
    }

    const result = await login(email, password);

    res.status(200).json({
      message: "Login successful",
      ...result
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Login failed";

    if (
      message === "Invalid email or password" ||
      message === "User account is inactive"
    ) {
      res.status(401).json({
        message
      });
      return;
    }

    console.error("Login error:", error);

    res.status(500).json({
      message: "Internal server error"
    });
  }
}
export function getMe(
  req: AuthenticatedRequest,
  res: Response
): void {
  if (!req.user) {
    res.status(401).json({
      message: "Authentication required"
    });
    return;
  }

  res.status(200).json({
    message: "Authenticated user",
    user: req.user
  });
}