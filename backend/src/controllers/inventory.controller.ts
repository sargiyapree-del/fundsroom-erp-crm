import type { Request, Response } from "express";
import {
  createStockMovement,
  getStockMovements
} from "../services/inventory.service";

export async function createStockMovementController(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const productId = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;

    const { quantity, movementType, reason } = req.body ?? {};

    const user = (req as Request & {
      user?: { userId: string };
    }).user;

    if (!productId) {
      res.status(400).json({
        message: "Product ID is required"
      });
      return;
    }

    if (!quantity || !Number.isInteger(quantity) || quantity <= 0) {
      res.status(400).json({
        message: "Quantity must be a positive integer"
      });
      return;
    }

    if (movementType !== "IN" && movementType !== "OUT") {
      res.status(400).json({
        message: "Movement type must be IN or OUT"
      });
      return;
    }

    if (!reason || typeof reason !== "string") {
      res.status(400).json({
        message: "Reason is required"
      });
      return;
    }

    if (!user?.userId) {
      res.status(401).json({
        message: "Authenticated user not found"
      });
      return;
    }

    const result = await createStockMovement({
      productId,
      quantity,
      movementType,
      reason,
      createdBy: user.userId
    });

    res.status(201).json({
      message: "Stock movement created successfully",
      ...result
    });
  } catch (error) {
    console.error("Create stock movement error:", error);

    if (
      error instanceof Error &&
      error.message === "Product not found"
    ) {
      res.status(404).json({
        message: "Product not found"
      });
      return;
    }

    if (
      error instanceof Error &&
      error.message === "Insufficient stock"
    ) {
      res.status(400).json({
        message: "Insufficient stock"
      });
      return;
    }

    res.status(500).json({
      message: "Failed to create stock movement"
    });
  }
}

export async function getStockMovementsController(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const productId = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;

    if (!productId) {
      res.status(400).json({
        message: "Product ID is required"
      });
      return;
    }

    const movements = await getStockMovements(productId);

    res.status(200).json({
      productId,
      movements
    });
  } catch (error) {
    console.error("Get stock movements error:", error);

    res.status(500).json({
      message: "Failed to fetch stock movements"
    });
  }
}