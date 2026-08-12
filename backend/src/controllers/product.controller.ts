import type { Request, Response } from "express";

import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  updateProductStock
} from "../services/product.service";

export async function createProductController(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const {
      productName,
      sku,
      category,
      unitPrice,
      currentStock,
      minStockQuantity,
      warehouseLocation
    } = req.body ?? {};

    if (
      !productName ||
      !sku ||
      !category ||
      unitPrice === undefined
    ) {
      res.status(400).json({
        message:
          "Product name, SKU, category and unit price are required"
      });
      return;
    }

    if (Number(unitPrice) < 0) {
      res.status(400).json({
        message: "Unit price cannot be negative"
      });
      return;
    }

    if (
      currentStock !== undefined &&
      Number(currentStock) < 0
    ) {
      res.status(400).json({
        message: "Current stock cannot be negative"
      });
      return;
    }

    if (
      minStockQuantity !== undefined &&
      (
        !Number.isInteger(Number(minStockQuantity)) ||
        Number(minStockQuantity) < 0
      )
    ) {
      res.status(400).json({
        message:
          "Minimum stock quantity must be a non-negative integer"
      });
      return;
    }

    const product = await createProduct({
      productName,
      sku,
      category,
      unitPrice: Number(unitPrice),
      currentStock:
        currentStock !== undefined
          ? Number(currentStock)
          : 0,
      minStockQuantity:
        minStockQuantity !== undefined
          ? Number(minStockQuantity)
          : 0,
      warehouseLocation
    });

    res.status(201).json({
      message: "Product created successfully",
      product
    });
  } catch (error) {
    console.error(
      "Create product error:",
      error
    );

    res.status(500).json({
      message: "Failed to create product"
    });
  }
}

export async function getProductsController(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const products = await getProducts();

    res.status(200).json({
      products
    });
  } catch (error) {
    console.error("Get products error:", error);

    res.status(500).json({
      message: "Failed to fetch products"
    });
  }
}

export async function getProductByIdController(
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

    const product = await getProductById(productId);

    if (!product) {
      res.status(404).json({
        message: "Product not found"
      });
      return;
    }

    res.status(200).json({
      product
    });
  } catch (error) {
    console.error("Get product error:", error);

    res.status(500).json({
      message: "Failed to fetch product"
    });
  }
}

export async function updateProductController(
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

    const {
      minStockQuantity
    } = req.body ?? {};

    if (
      minStockQuantity !== undefined &&
      (
        !Number.isInteger(
          Number(minStockQuantity)
        ) ||
        Number(minStockQuantity) < 0
      )
    ) {
      res.status(400).json({
        message:
          "Minimum stock quantity must be a non-negative integer"
      });
      return;
    }

    const product = await updateProduct(
      productId,
      {
        ...req.body,
        unitPrice:
          req.body.unitPrice !== undefined
            ? Number(req.body.unitPrice)
            : undefined,
        currentStock:
          req.body.currentStock !== undefined
            ? Number(req.body.currentStock)
            : undefined,
        minStockQuantity:
          minStockQuantity !== undefined
            ? Number(minStockQuantity)
            : undefined
      }
    );

    if (!product) {
      res.status(404).json({
        message: "Product not found"
      });
      return;
    }

    res.status(200).json({
      message: "Product updated successfully",
      product
    });
  } catch (error) {
    console.error(
      "Update product error:",
      error
    );

    res.status(500).json({
      message: "Failed to update product"
    });
  }
}

export async function deleteProductController(
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

    const deletedProduct =
      await deleteProduct(productId);

    if (!deletedProduct) {
      res.status(404).json({
        message: "Product not found"
      });
      return;
    }

    res.status(200).json({
      message: "Product deleted successfully"
    });
  } catch (error) {
    console.error("Delete product error:", error);

    res.status(500).json({
      message: "Failed to delete product"
    });
  }
}
export async function updateProductStockController(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const productId = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;

    const { quantity } = req.body ?? {};

    if (!productId) {
      res.status(400).json({
        message: "Product ID is required"
      });
      return;
    }

    if (typeof quantity !== "number" || quantity === 0) {
      res.status(400).json({
        message: "Quantity must be a non-zero number"
      });
      return;
    }

    const product = await updateProductStock(
      productId,
      quantity
    );

    if (!product) {
      res.status(404).json({
        message: "Product not found"
      });
      return;
    }

    if (product.current_stock < 0) {
      res.status(400).json({
        message: "Stock cannot be negative"
      });
      return;
    }

    res.status(200).json({
      message: "Product stock updated successfully",
      product
    });
  } catch (error) {
    console.error("Update product stock error:", error);

    res.status(500).json({
      message: "Failed to update product stock"
    });
  }
}