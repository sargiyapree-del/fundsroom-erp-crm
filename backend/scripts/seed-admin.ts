import "dotenv/config";
import bcrypt from "bcryptjs";
import { pool } from "../src/config/database";

async function seedAdmin() {
  const name = "System Admin";
  const email = "admin@fundsroom.com";
  const password = "Admin@12345";

  try {
    const existingUser = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      console.log("Admin user already exists.");
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await pool.query(
      `
      INSERT INTO users
        (name, email, password_hash, role)
      VALUES
        ($1, $2, $3, 'ADMIN')
      `,
      [name, email, passwordHash]
    );

    console.log("Admin user created successfully.");
    console.log("Email:", email);
    console.log("Password:", password);
  } catch (error) {
    console.error("Failed to create admin user:", error);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

seedAdmin();