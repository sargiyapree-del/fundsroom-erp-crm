import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "../config/database";
import type { AuthUser, JwtPayload } from "../types/auth";

interface LoginResult {
  token: string;
  user: AuthUser;
}

export async function login(
  email: string,
  password: string
): Promise<LoginResult> {
  const result = await pool.query(
    `
    SELECT
      id,
      name,
      email,
      password_hash,
      role,
      is_active
    FROM users
    WHERE email = $1
    LIMIT 1
    `,
    [email]
  );

  if (result.rows.length === 0) {
    throw new Error("Invalid email or password");
  }

  const user = result.rows[0];

  if (!user.is_active) {
    throw new Error("User account is inactive");
  }

  const passwordMatches = await bcrypt.compare(
    password,
    user.password_hash
  );

  if (!passwordMatches) {
    throw new Error("Invalid email or password");
  }

  const payload: JwtPayload = {
    userId: user.id,
    role: user.role
  };

  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }

  const token = jwt.sign(payload, secret, {
    expiresIn: "1d"
  });

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  };
}