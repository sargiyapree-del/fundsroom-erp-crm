import { pool } from "../config/database";

export interface CreateStockMovementData {
  productId: string;
  quantity: number;
  movementType: "IN" | "OUT";
  reason: string;
  createdBy: string;
}

export async function createStockMovement(
  data: CreateStockMovementData
) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Check product exists
    const productResult = await client.query(
      `
      SELECT *
      FROM products
      WHERE id = $1
      FOR UPDATE
      `,
      [data.productId]
    );

    const product = productResult.rows[0];

    if (!product) {
      throw new Error("Product not found");
    }

    // Calculate new stock
    const newStock =
      data.movementType === "IN"
        ? product.current_stock + data.quantity
        : product.current_stock - data.quantity;

    // Prevent negative stock
    if (newStock < 0) {
      throw new Error("Insufficient stock");
    }

    // Update product stock
    await client.query(
      `
      UPDATE products
      SET
        current_stock = $1,
        updated_at = NOW()
      WHERE id = $2
      `,
      [newStock, data.productId]
    );

    // Create stock movement record
    const movementResult = await client.query(
      `
      INSERT INTO stock_movements (
        product_id,
        quantity,
        movement_type,
        reason,
        created_by
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
      `,
      [
        data.productId,
        data.quantity,
        data.movementType,
        data.reason,
        data.createdBy
      ]
    );

    await client.query("COMMIT");

    return {
      product: {
        ...product,
        current_stock: newStock
      },
      movement: movementResult.rows[0]
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function getStockMovements(productId: string) {
  const result = await pool.query(
    `
    SELECT
      sm.*,
      p.product_name,
      p.sku
    FROM stock_movements sm
    JOIN products p
      ON p.id = sm.product_id
    WHERE sm.product_id = $1
    ORDER BY sm.created_at DESC
    `,
    [productId]
  );

  return result.rows;
}