import type { Request, Response } from "express";

import {
  createChallan,
  getChallans,
  getChallanById,
  updateChallan,
  deleteChallan
} from "../services/challan.service";

export async function createChallanController(
  req: Request,
  res: Response
) {
  try {
    const { customerId, items } = req.body;

    const createdBy = (req as any).user.userId;

    if (!customerId) {
      return res.status(400).json({
        message: "Customer ID is required"
      });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        message: "At least one product is required"
      });
    }

    const challan = await createChallan({
      customerId,
      createdBy,
      items
    });

    return res.status(201).json({
      message: "Challan created successfully",
      challan
    });
  } catch (error) {
    console.error("Create challan error:", error);

    if (
      error instanceof Error &&
      (
        error.message === "At least one product is required" ||
        error.message === "Quantity must be a positive integer"
      )
    ) {
      return res.status(400).json({
        message: error.message
      });
    }

    if (
      error instanceof Error &&
      error.message === "Product not found"
    ) {
      return res.status(404).json({
        message: error.message
      });
    }

    return res.status(500).json({
      message: "Failed to create challan"
    });
  }
}

export async function getChallansController(
  req: Request,
  res: Response
) {
  try {
    const challans = await getChallans();

    return res.status(200).json({
      challans
    });
  } catch (error) {
    console.error("Get challans error:", error);

    return res.status(500).json({
      message: "Failed to fetch challans"
    });
  }
}

export async function getChallanByIdController(
  req: Request,
  res: Response
) {
  try {
    const { id } = req.params;

    const challanId = Array.isArray(id) ? id[0] : id;

    if (!challanId) {
      return res.status(400).json({
        message: "Challan ID is required"
      });
    }

    const challan = await getChallanById(challanId);

    if (!challan) {
      return res.status(404).json({
        message: "Challan not found"
      });
    }

    return res.status(200).json({
      challan
    });
  } catch (error) {
    console.error("Get challan error:", error);

    return res.status(500).json({
      message: "Failed to fetch challan"
    });
  }
}

export async function updateChallanController(
  req: Request,
  res: Response
) {
  try {
    const { id } = req.params;

    const challanId = Array.isArray(id) ? id[0] : id;

    const { status, totalQuantity } = req.body;

    const createdBy = (req as any).user.userId;

    if (!challanId) {
      return res.status(400).json({
        message: "Challan ID is required"
      });
    }

    const challan = await updateChallan(challanId, {
      status,
      totalQuantity,
      createdBy
    });

    if (!challan) {
      return res.status(404).json({
        message: "Challan not found"
      });
    }

    return res.status(200).json({
      message: "Challan updated successfully",
      challan
    });
  } catch (error) {
    console.error("Update challan error:", error);

    if (error instanceof Error) {
      if (
        error.message === "Challan not found" ||
        error.message === "Challan has no items"
      ) {
        return res.status(404).json({
          message: error.message
        });
      }

      if (
        error.message === "Created by is required" ||
        error.message === "Challan is already confirmed" ||
        error.message === "Confirmed challan status cannot be changed"
      ) {
        return res.status(400).json({
          message: error.message
        });
      }

      if (error.message.startsWith("Insufficient stock")) {
        return res.status(400).json({
          message: error.message
        });
      }

      if (error.message.startsWith("Product not found")) {
        return res.status(404).json({
          message: error.message
        });
      }
    }

    return res.status(500).json({
      message: "Failed to update challan"
    });
  }
}

export async function deleteChallanController(
  req: Request,
  res: Response
) {
  try {
    const { id } = req.params;

    const challanId = Array.isArray(id) ? id[0] : id;

    if (!challanId) {
      return res.status(400).json({
        message: "Challan ID is required"
      });
    }

    const challan = await deleteChallan(challanId);

    if (!challan) {
      return res.status(404).json({
        message: "Challan not found"
      });
    }

    return res.status(200).json({
      message: "Challan deleted successfully"
    });
  } catch (error) {
    console.error("Delete challan error:", error);

    return res.status(500).json({
      message: "Failed to delete challan"
    });
  }
}