import { Router } from "express";

import {
  createProductController,
  getProductsController,
  getProductByIdController,
  updateProductController,
  deleteProductController,
  updateProductStockController
} from "../controllers/product.controller";

import {
  authenticate,
  authorize
} from "../middleware/auth.middleware";

const router = Router();

// ==================== STOCK ====================

router.patch(
  "/:id/stock",
  authenticate,
  authorize("ADMIN", "WAREHOUSE"),
  updateProductStockController
);

// ==================== PRODUCTS ====================

router.post(
  "/",
  authenticate,
  authorize("ADMIN"),
  createProductController
);

router.get(
  "/",
  authenticate,
  authorize("ADMIN", "WAREHOUSE"),
  getProductsController
);

router.get(
  "/:id",
  authenticate,
  authorize("ADMIN", "WAREHOUSE"),
  getProductByIdController
);

router.put(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  updateProductController
);

router.delete(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  deleteProductController
);

export default router;