import { pool } from "../config/database";

export interface CreateProductData {
  productName: string;
  sku: string;
  category: string;
  unitPrice: number;
  currentStock?: number;
  minStockQuantity?: number;
  warehouseLocation: string;
}

export interface UpdateProductData {
  productName?: string;
  sku?: string;
  category?: string;
  unitPrice?: number;
  currentStock?: number;
  minStockQuantity?: number;
  warehouseLocation?: string;
}

export async function createProduct(data: CreateProductData) {
  const result = await pool.query(
    `
    INSERT INTO products (
      product_name,
      sku,
      category,
      unit_price,
      current_stock,
      min_stock_quantity,
      warehouse_location
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *
    `,
    [
      data.productName,
      data.sku,
      data.category,
      data.unitPrice,
      data.currentStock ?? 0,
      data.minStockQuantity ?? 0,
      data.warehouseLocation
    ]
  );

  return result.rows[0];
}

export async function getProducts() {
  const result = await pool.query(
    `
    SELECT *
    FROM products
    ORDER BY created_at DESC
    `
  );

  return result.rows;
}

export async function getProductById(productId: string) {
  const result = await pool.query(
    `
    SELECT *
    FROM products
    WHERE id = $1
    `,
    [productId]
  );

  return result.rows[0] ?? null;
}

export async function updateProduct(
  productId: string,
  data: UpdateProductData
) {
  const result = await pool.query(
    `
    UPDATE products
    SET
      product_name = COALESCE($1, product_name),
      sku = COALESCE($2, sku),
      category = COALESCE($3, category),
      unit_price = COALESCE($4, unit_price),
      current_stock = COALESCE($5, current_stock),
      min_stock_quantity = COALESCE($6, min_stock_quantity),
      warehouse_location = COALESCE($7, warehouse_location),
      updated_at = NOW()
    WHERE id = $8
    RETURNING *
    `,
    [
      data.productName ?? null,
      data.sku ?? null,
      data.category ?? null,
      data.unitPrice ?? null,
      data.currentStock ?? null,
      data.minStockQuantity ?? null,
      data.warehouseLocation ?? null,
      productId
    ]
  );

  return result.rows[0] ?? null;
}

export async function deleteProduct(productId: string) {
  const result = await pool.query(
    `
    DELETE FROM products
    WHERE id = $1
    RETURNING id
    `,
    [productId]
  );

  return result.rows[0] ?? null;
}
export async function updateProductStock(
  productId: string,
  quantity: number
) {
  const result = await pool.query(
    `
    UPDATE products
    SET
      current_stock = current_stock + $1,
      updated_at = NOW()
    WHERE id = $2
    RETURNING *
    `,
    [quantity, productId]
  );

  return result.rows[0] ?? null;
}