import express from "express";
import authRoutes from "./routes/auth.routes";

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Fundsroom ERP CRM API is running"
  });
});

app.use("/api/auth", authRoutes);

export default app;