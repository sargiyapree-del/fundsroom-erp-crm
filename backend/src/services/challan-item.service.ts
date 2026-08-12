import { pool } from "../config/database";

export interface CreateChallanItemData {
  challanId: string;
  productId: string;
  quantity: number;
}

export async function createChallanItem(
  data: CreateChallanItemData
) {
  // Check challan exists
  const challanResult = await pool.query(
    `
    SELECT id
    FROM challans
    WHERE id = $1
    `,
    [data.challanId]
  );

  if (challanResult.rows.length === 0) {
    throw new Error("Challan not found");
  }

  // Get product details
  const productResult = await pool.query(
    `
    SELECT
      id,
      product_name,
      sku,
      selling_price
    FROM products
    WHERE id = $1
    `,
    [data.productId]
  );

  if (productResult.rows.length === 0) {
    throw new Error("Product not found");
  }

  const product = productResult.rows[0];

  // Insert challan item
  const result = await pool.query(
    `
    INSERT INTO challan_items (
      challan_id,
      product_id,
      product_name,
      sku,
      unit_price,
      quantity
    )
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
    `,
    [
      data.challanId,
      data.productId,
      product.product_name,
      product.sku,
      product.selling_price,
      data.quantity
    ]
  );

  // Update total quantity in challan
  await pool.query(
    `
    UPDATE challans
    SET
      total_quantity = (
        SELECT COALESCE(SUM(quantity), 0)
        FROM challan_items
        WHERE challan_id = $1
      ),
      updated_at = NOW()
    WHERE id = $1
    `,
    [data.challanId]
  );

  return result.rows[0];
}

export async function getChallanItems(challanId: string) {
  const result = await pool.query(
    `
    SELECT *
    FROM challan_items
    WHERE challan_id = $1
    ORDER BY id DESC
    `,
    [challanId]
  );

  return result.rows;
}