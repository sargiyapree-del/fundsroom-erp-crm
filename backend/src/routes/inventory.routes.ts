import { Router } from "express";

import {
  createStockMovementController,
  getStockMovementsController
} from "../controllers/inventory.controller";

import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.post(
  "/products/:id/stock-movements",
  authenticate,
  createStockMovementController
);

router.get(
  "/products/:id/stock-movements",
  authenticate,
  getStockMovementsController
);

export default router;