import { Router } from "express";

import {
  createCustomerController,
  getCustomersController,
  getCustomerByIdController,
  updateCustomerController,
  deleteCustomerController,
  createCustomerFollowUpController,
  getCustomerFollowUpsController
} from "../controllers/customer.controller";

import {
  authenticate,
  authorize
} from "../middleware/auth.middleware";

const router = Router();

// ==================== CUSTOMER FOLLOW-UPS ====================

router.post(
  "/:id/followups",
  authenticate,
  authorize("ADMIN", "SALES"),
  createCustomerFollowUpController
);

router.get(
  "/:id/followups",
  authenticate,
  authorize("ADMIN", "SALES"),
  getCustomerFollowUpsController
);

// ==================== CUSTOMERS ====================

router.post(
  "/",
  authenticate,
  authorize("ADMIN", "SALES"),
  createCustomerController
);

router.get(
  "/",
  authenticate,
  authorize("ADMIN", "SALES"),
  getCustomersController
);

router.get(
  "/:id",
  authenticate,
  authorize("ADMIN", "SALES"),
  getCustomerByIdController
);

router.put(
  "/:id",
  authenticate,
  authorize("ADMIN", "SALES"),
  updateCustomerController
);

router.delete(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  deleteCustomerController
);

export default router;