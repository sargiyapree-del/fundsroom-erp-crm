import { Router } from "express";

import {
  createChallanController,
  getChallansController,
  getChallanByIdController,
  updateChallanController,
  deleteChallanController
} from "../controllers/challan.controller";

import {
  createChallanItemController,
  getChallanItemsController
} from "../controllers/challan-item.controller";

import {
  authenticate,
  authorize
} from "../middleware/auth.middleware";

const router = Router();

// ==================== CHALLANS ====================

// Create challan
router.post(
  "/",
  authenticate,
  authorize("ADMIN", "SALES"),
  createChallanController
);

// View challans
router.get(
  "/",
  authenticate,
  authorize(
    "ADMIN",
    "SALES",
    "WAREHOUSE",
    "ACCOUNTS"
  ),
  getChallansController
);

// View single challan
router.get(
  "/:id",
  authenticate,
  authorize(
    "ADMIN",
    "SALES",
    "WAREHOUSE",
    "ACCOUNTS"
  ),
  getChallanByIdController
);

// Update / confirm challan
router.put(
  "/:id",
  authenticate,
  authorize("ADMIN", "SALES"),
  updateChallanController
);

// Delete challan
router.delete(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  deleteChallanController
);

// ==================== CHALLAN ITEMS ====================

// Add challan item
router.post(
  "/:challanId/items",
  authenticate,
  authorize("ADMIN", "SALES"),
  createChallanItemController
);

// View challan items
router.get(
  "/:challanId/items",
  authenticate,
  authorize(
    "ADMIN",
    "SALES",
    "WAREHOUSE",
    "ACCOUNTS"
  ),
  getChallanItemsController
);

export default router;