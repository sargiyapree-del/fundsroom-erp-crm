import { pool } from "../config/database";

export interface CreateCustomerData {
  customerName: string;
  mobile: string;
  email?: string;
  businessName?: string;
  gstNumber?: string;
  customerType: "RETAIL" | "WHOLESALE" | "DISTRIBUTOR";
  address: string;
  status?: "LEAD" | "ACTIVE" | "INACTIVE";
  followUpDate?: string;
  notes?: string;
}

export interface UpdateCustomerData {
  customerName?: string;
  mobile?: string;
  email?: string;
  businessName?: string;
  gstNumber?: string;
  customerType?: "RETAIL" | "WHOLESALE" | "DISTRIBUTOR";
  address?: string;
  status?: "LEAD" | "ACTIVE" | "INACTIVE";
  followUpDate?: string;
  notes?: string;
}

export async function createCustomer(
  data: CreateCustomerData
) {
  const result = await pool.query(
    `
    INSERT INTO customers (
      customer_name,
      mobile,
      email,
      business_name,
      gst_number,
      customer_type,
      address,
      status,
      follow_up_date,
      notes
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING *
    `,
    [
      data.customerName,
      data.mobile,
      data.email ?? null,
      data.businessName ?? null,
      data.gstNumber ?? null,
      data.customerType,
      data.address,
      data.status ?? "LEAD",
      data.followUpDate ?? null,
      data.notes ?? null
    ]
  );

  return result.rows[0];
}

export async function getCustomers(
  search?: string,
  page = 1,
  limit = 10
) {
  const offset = (page - 1) * limit;

  const searchValue = search
    ? `%${search}%`
    : null;

  const result = await pool.query(
    `
    SELECT *
    FROM customers
    WHERE
      $1::text IS NULL
      OR customer_name ILIKE $1
      OR mobile ILIKE $1
      OR business_name ILIKE $1
      OR email ILIKE $1
    ORDER BY created_at DESC
    LIMIT $2
    OFFSET $3
    `,
    [searchValue, limit, offset]
  );

  const countResult = await pool.query(
    `
    SELECT COUNT(*)::int AS total
    FROM customers
    WHERE
      $1::text IS NULL
      OR customer_name ILIKE $1
      OR mobile ILIKE $1
      OR business_name ILIKE $1
      OR email ILIKE $1
    `,
    [searchValue]
  );

  return {
    customers: result.rows,
    pagination: {
      page,
      limit,
      total: countResult.rows[0].total,
      totalPages: Math.ceil(
        countResult.rows[0].total / limit
      )
    }
  };
}

export async function getCustomerById(
  customerId: string
) {
  const result = await pool.query(
    `
    SELECT *
    FROM customers
    WHERE id = $1
    `,
    [customerId]
  );

  return result.rows[0] ?? null;
}

export async function updateCustomer(
  customerId: string,
  data: UpdateCustomerData
) {
  const result = await pool.query(
    `
    UPDATE customers
    SET
      customer_name = COALESCE($1, customer_name),
      mobile = COALESCE($2, mobile),
      email = COALESCE($3, email),
      business_name = COALESCE($4, business_name),
      gst_number = COALESCE($5, gst_number),
      customer_type = COALESCE($6, customer_type),
      address = COALESCE($7, address),
      status = COALESCE($8, status),
      follow_up_date = COALESCE($9, follow_up_date),
      notes = COALESCE($10, notes),
      updated_at = NOW()
    WHERE id = $11
    RETURNING *
    `,
    [
      data.customerName ?? null,
      data.mobile ?? null,
      data.email ?? null,
      data.businessName ?? null,
      data.gstNumber ?? null,
      data.customerType ?? null,
      data.address ?? null,
      data.status ?? null,
      data.followUpDate ?? null,
      data.notes ?? null,
      customerId
    ]
  );

  return result.rows[0] ?? null;
}

export async function deleteCustomer(
  customerId: string
) {
  const result = await pool.query(
    `
    DELETE FROM customers
    WHERE id = $1
    RETURNING id
    `,
    [customerId]
  );

  return result.rows[0] ?? null;
}


// ================================
// CUSTOMER FOLLOW-UP
// ================================

export interface CreateCustomerFollowUpData {
  customerId: string;
  followUpDate: string;
  notes?: string;
  createdBy: string;
}

export async function createCustomerFollowUp(
  data: CreateCustomerFollowUpData
) {
  const result = await pool.query(
    `
    INSERT INTO customer_followups (
      customer_id,
      follow_up_date,
      notes,
      created_by
    )
    VALUES ($1, $2, $3, $4)
    RETURNING *
    `,
    [
      data.customerId,
      data.followUpDate,
      data.notes ?? null,
      data.createdBy
    ]
  );

  return result.rows[0];
}
export async function getCustomerFollowUps(
  customerId: string
) {
  const result = await pool.query(
    `
    SELECT *
    FROM customer_followups
    WHERE customer_id = $1
    ORDER BY follow_up_date DESC
    `,
    [customerId]
  );

  return result.rows;
}