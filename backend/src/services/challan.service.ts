import { pool } from "../config/database";

export interface CreateChallanItemData {
  productId: string;
  quantity: number;
}

export interface CreateChallanData {
  customerId: string;
  createdBy: string;
  items: CreateChallanItemData[];
}

export interface UpdateChallanData {
  status?: "DRAFT" | "CONFIRMED" | "CANCELLED";
  totalQuantity?: number;
  createdBy?: string;
}

export async function createChallan(data: CreateChallanData) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    if (!data.items || data.items.length === 0) {
      throw new Error("At least one product is required");
    }

    // Validate quantities first
    for (const item of data.items) {
      if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
        throw new Error("Quantity must be a positive integer");
      }
    }

    // Calculate total quantity
    const totalQuantity = data.items.reduce(
      (total, item) => total + item.quantity,
      0
    );

    // Generate challan number
    const challanNumber = `CH-${Date.now()}`;

    // Create challan
    const challanResult = await client.query(
      `
      INSERT INTO challans (
        challan_number,
        customer_id,
        total_quantity,
        created_by
      )
      VALUES ($1, $2, $3, $4)
      RETURNING *
      `,
      [
        challanNumber,
        data.customerId,
        totalQuantity,
        data.createdBy
      ]
    );

    const challan = challanResult.rows[0];

    // Create challan items
    for (const item of data.items) {
      const productResult = await client.query(
        `
        SELECT
          id,
          product_name,
          sku,
          unit_price
        FROM products
        WHERE id = $1
        `,
        [item.productId]
      );

      const product = productResult.rows[0];

      if (!product) {
        throw new Error("Product not found");
      }

      await client.query(
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
        `,
        [
          challan.id,
          product.id,
          product.product_name,
          product.sku,
          product.unit_price,
          item.quantity
        ]
      );
    }

    await client.query("COMMIT");

    return {
      ...challan,
      total_quantity: totalQuantity
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function getChallans() {
  const result = await pool.query(
    `
    SELECT *
    FROM challans
    ORDER BY created_at DESC
    `
  );

  return result.rows;
}

export async function getChallanById(challanId: string) {
  const challanResult = await pool.query(
    `
    SELECT *
    FROM challans
    WHERE id = $1
    `,
    [challanId]
  );

  const challan = challanResult.rows[0];

  if (!challan) {
    return null;
  }

  const itemsResult = await pool.query(
    `
    SELECT *
    FROM challan_items
    WHERE challan_id = $1
    ORDER BY id
    `,
    [challanId]
  );

  return {
    ...challan,
    items: itemsResult.rows
  };
}

export async function updateChallan(
  challanId: string,
  data: UpdateChallanData
) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Lock challan
    const challanResult = await client.query(
      `
      SELECT *
      FROM challans
      WHERE id = $1
      FOR UPDATE
      `,
      [challanId]
    );

    const challan = challanResult.rows[0];

    if (!challan) {
      throw new Error("Challan not found");
    }

    // Already confirmed
    if (
      data.status === "CONFIRMED" &&
      challan.status === "CONFIRMED"
    ) {
      throw new Error("Challan is already confirmed");
    }

    // Confirmed challan cannot change status
    if (
      challan.status === "CONFIRMED" &&
      data.status &&
      data.status !== "CONFIRMED"
    ) {
      throw new Error(
        "Confirmed challan status cannot be changed"
      );
    }

    // ==========================================
    // CONFIRM CHALLAN
    // ==========================================

    if (
      data.status === "CONFIRMED" &&
      challan.status !== "CONFIRMED"
    ) {
      if (!data.createdBy) {
        throw new Error("Created by is required");
      }

      // Get challan items
      const itemsResult = await client.query(
        `
        SELECT
          id,
          product_id,
          quantity,
          product_name,
          sku
        FROM challan_items
        WHERE challan_id = $1
        `,
        [challanId]
      );

      const items = itemsResult.rows;

      if (items.length === 0) {
        throw new Error("Challan has no items");
      }

      // ==========================================
      // CHECK STOCK FIRST
      // ==========================================

      for (const item of items) {
        const productResult = await client.query(
          `
          SELECT
            id,
            product_name,
            current_stock
          FROM products
          WHERE id = $1
          FOR UPDATE
          `,
          [item.product_id]
        );

        const product = productResult.rows[0];

        if (!product) {
          throw new Error(
            `Product not found: ${item.product_id}`
          );
        }

        if (product.current_stock < item.quantity) {
          throw new Error(
            `Insufficient stock for product: ${product.product_name}`
          );
        }
      }

      // ==========================================
      // DEDUCT STOCK + CREATE MOVEMENT
      // ==========================================

      for (const item of items) {
        // Deduct stock
        await client.query(
          `
          UPDATE products
          SET
            current_stock = current_stock - $1,
            updated_at = NOW()
          WHERE id = $2
          `,
          [
            item.quantity,
            item.product_id
          ]
        );

        // Create stock movement
        await client.query(
          `
          INSERT INTO stock_movements (
            product_id,
            quantity,
            movement_type,
            reason,
            created_by
          )
          VALUES ($1, $2, 'OUT', $3, $4)
          `,
          [
            item.product_id,
            item.quantity,
            `Sales Challan ${challan.challan_number}`,
            data.createdBy
          ]
        );
      }
    }

    // ==========================================
    // UPDATE CHALLAN
    // ==========================================

    const result = await client.query(
      `
      UPDATE challans
      SET
        status = COALESCE($1::challan_status, status),
        total_quantity = COALESCE($2, total_quantity),
        updated_at = NOW()
      WHERE id = $3
      RETURNING *
      `,
      [
        data.status ?? null,
        data.totalQuantity ?? null,
        challanId
      ]
    );

    await client.query("COMMIT");

    return result.rows[0] ?? null;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function deleteChallan(challanId: string) {
  const result = await pool.query(
    `
    DELETE FROM challans
    WHERE id = $1
    RETURNING id
    `,
    [challanId]
  );

  return result.rows[0] ?? null;
}