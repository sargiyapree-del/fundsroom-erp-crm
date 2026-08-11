import "dotenv/config";
import app from "./app";
import { pool } from "./config/database";

const PORT = 5000;

async function startServer() {
  try {
    await pool.query("SELECT NOW()");

    console.log("Database connected successfully");

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1);
  }
}

startServer();