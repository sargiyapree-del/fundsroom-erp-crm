-- =====================================================
-- Fundsroom ERP + CRM
-- PostgreSQL Database Schema
-- =====================================================

-- =========================
-- ENUM TYPES
-- =========================

CREATE TYPE user_role AS ENUM (
    'ADMIN',
    'SALES',
    'WAREHOUSE',
    'ACCOUNTS'
);

CREATE TYPE customer_type AS ENUM (
    'RETAIL',
    'WHOLESALE',
    'DISTRIBUTOR'
);

CREATE TYPE customer_status AS ENUM (
    'LEAD',
    'ACTIVE',
    'INACTIVE'
);

CREATE TYPE stock_movement_type AS ENUM (
    'IN',
    'OUT'
);

CREATE TYPE challan_status AS ENUM (
    'DRAFT',
    'CONFIRMED',
    'CANCELLED'
);

-- =========================
-- USERS
-- =========================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name VARCHAR(100) NOT NULL,

    email VARCHAR(255) NOT NULL UNIQUE,

    password_hash TEXT NOT NULL,

    role user_role NOT NULL,

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =========================
-- CUSTOMERS
-- =========================

CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    customer_name VARCHAR(150) NOT NULL,

    mobile VARCHAR(20) NOT NULL,

    email VARCHAR(255),

    business_name VARCHAR(150),

    gst_number VARCHAR(20),

    customer_type customer_type NOT NULL,

    address TEXT NOT NULL,

    status customer_status NOT NULL DEFAULT 'LEAD',

    follow_up_date DATE,

    notes TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =========================
-- CUSTOMER FOLLOW-UPS
-- =========================

CREATE TABLE customer_followups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    customer_id UUID NOT NULL,

    follow_up_date DATE NOT NULL,

    notes TEXT NOT NULL,

    created_by UUID NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_followup_customer
        FOREIGN KEY (customer_id)
        REFERENCES customers(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_followup_created_by
        FOREIGN KEY (created_by)
        REFERENCES users(id)
        ON DELETE RESTRICT
);

-- =========================
-- PRODUCTS
-- =========================

CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    product_name VARCHAR(150) NOT NULL,

    sku VARCHAR(100) NOT NULL UNIQUE,

    category VARCHAR(100) NOT NULL,

    unit_price NUMERIC(12, 2) NOT NULL CHECK (unit_price >= 0),

    current_stock INTEGER NOT NULL DEFAULT 0 CHECK (current_stock >= 0),

    min_stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (min_stock_quantity >= 0),

    warehouse_location VARCHAR(150) NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =========================
-- STOCK MOVEMENTS
-- =========================

CREATE TABLE stock_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    product_id UUID NOT NULL,

    quantity INTEGER NOT NULL CHECK (quantity > 0),

    movement_type stock_movement_type NOT NULL,

    reason VARCHAR(255) NOT NULL,

    created_by UUID NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_stock_product
        FOREIGN KEY (product_id)
        REFERENCES products(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_stock_created_by
        FOREIGN KEY (created_by)
        REFERENCES users(id)
        ON DELETE RESTRICT
);

-- =========================
-- CHALLANS
-- =========================

CREATE TABLE challans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    challan_number VARCHAR(50) NOT NULL UNIQUE,

    customer_id UUID NOT NULL,

    total_quantity INTEGER NOT NULL DEFAULT 0 CHECK (total_quantity >= 0),

    status challan_status NOT NULL DEFAULT 'DRAFT',

    created_by UUID NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_challan_customer
        FOREIGN KEY (customer_id)
        REFERENCES customers(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_challan_created_by
        FOREIGN KEY (created_by)
        REFERENCES users(id)
        ON DELETE RESTRICT
);

-- =========================
-- CHALLAN ITEMS
-- =========================

CREATE TABLE challan_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    challan_id UUID NOT NULL,

    product_id UUID NOT NULL,

    product_name VARCHAR(150) NOT NULL,

    sku VARCHAR(100) NOT NULL,

    unit_price NUMERIC(12, 2) NOT NULL CHECK (unit_price >= 0),

    quantity INTEGER NOT NULL CHECK (quantity > 0),

    CONSTRAINT fk_challan_item_challan
        FOREIGN KEY (challan_id)
        REFERENCES challans(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_challan_item_product
        FOREIGN KEY (product_id)
        REFERENCES products(id)
        ON DELETE RESTRICT
);

-- =========================
-- INDEXES
-- =========================

CREATE INDEX idx_customers_name
    ON customers(customer_name);

CREATE INDEX idx_customers_mobile
    ON customers(mobile);

CREATE INDEX idx_customers_status
    ON customers(status);

CREATE INDEX idx_products_category
    ON products(category);

CREATE INDEX idx_stock_movements_product
    ON stock_movements(product_id);

CREATE INDEX idx_stock_movements_created_at
    ON stock_movements(created_at);

CREATE INDEX idx_challans_customer
    ON challans(customer_id);

CREATE INDEX idx_challans_status
    ON challans(status);

CREATE INDEX idx_challan_items_challan
    ON challan_items(challan_id);

CREATE INDEX idx_challan_items_product
    ON challan_items(product_id);