import type { Request, Response } from "express";

import {
  createChallanItem,
  getChallanItems
} from "../services/challan-item.service";

export async function createChallanItemController(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const challanId = Array.isArray(req.params.challanId)
      ? req.params.challanId[0]
      : req.params.challanId;

    const { productId, quantity } = req.body ?? {};

    if (!challanId) {
      res.status(400).json({
        message: "Challan ID is required"
      });
      return;
    }

    if (!productId) {
      res.status(400).json({
        message: "Product ID is required"
      });
      return;
    }

    if (
      !Number.isInteger(quantity) ||
      quantity <= 0
    ) {
      res.status(400).json({
        message: "Quantity must be a positive integer"
      });
      return;
    }

    const item = await createChallanItem({
      challanId,
      productId,
      quantity
    });

    res.status(201).json({
      message: "Challan item created successfully",
      item
    });
  } catch (error) {
    console.error("Create challan item error:", error);

    if (
      error instanceof Error &&
      error.message === "Challan not found"
    ) {
      res.status(404).json({
        message: "Challan not found"
      });
      return;
    }

    if (
      error instanceof Error &&
      error.message === "Product not found"
    ) {
      res.status(404).json({
        message: "Product not found"
      });
      return;
    }

    res.status(500).json({
      message: "Failed to create challan item"
    });
  }
}

export async function getChallanItemsController(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const challanId = Array.isArray(req.params.challanId)
      ? req.params.challanId[0]
      : req.params.challanId;

    if (!challanId) {
      res.status(400).json({
        message: "Challan ID is required"
      });
      return;
    }

    const items = await getChallanItems(challanId);

    res.status(200).json({
      challanId,
      items
    });
  } catch (error) {
    console.error("Get challan items error:", error);

    res.status(500).json({
      message: "Failed to fetch challan items"
    });
  }
}