# Fundsroom ERP + CRM

A role-based ERP and CRM system built for managing customers, products, inventory, stock movements, sales challans and customer follow-ups.

The system provides JWT-based authentication and role-based access control for Admin, Sales, Warehouse and Accounts users.

---

## 🚀 Live Demo

### Frontend

http://44.223.21.143:3000/

### Backend API

http://44.223.21.143:5000/

---

## 🔐 Demo Credentials

### Admin

Email: `demo@fundsroom.com`

Password: `Admin@123`

Role: `ADMIN`

### Sales

Email: `sales@test.com`

Password: `Test@123`

Role: `SALES`

### Warehouse

Email: `warehouse@test.com`

Password: `Test@123`

Role: `WAREHOUSE`

### Accounts

Email: `accounts@test.com`

Password: `Test@123`

Role: `ACCOUNTS`

> These credentials are test/demo accounts provided for evaluation.

---

# 📌 Features

## Authentication & Authorization

- JWT-based authentication
- Role-based access control
- Protected API routes
- Four application roles:
  - ADMIN
  - SALES
  - WAREHOUSE
  - ACCOUNTS

## Customer Management

- Create customers
- View customer list
- Search and pagination
- View customer details
- Update customers
- Delete customers
- Customer follow-ups

## Product Management

- Create products
- View products
- View product details
- Update products
- Delete products
- Product stock management

## Inventory Management

- Stock movement tracking
- Stock IN/OUT operations
- Product stock updates
- Inventory history

## Challan Management

- Create challans
- View challans
- View challan details
- Update/confirm challans
- Delete challans
- Add challan items
- View challan items

---

# 🛠️ Technology Stack

## Frontend

- React
- TypeScript
- Vite
- HTML
- CSS

## Backend

- Node.js
- Express.js
- TypeScript
- REST API
- JWT
- bcrypt

## Database

- PostgreSQL
- Supabase

## Deployment

- AWS EC2
- Amazon Linux

---

# 🏗️ Architecture

The application follows a client-server architecture.

```text
                 React + TypeScript
                     Frontend
                         |
                         |
                     REST APIs
                         |
                         v
              Node.js + Express.js
                    TypeScript
                         |
             -----------------------
             |                     |
             v                     v
      Authentication          Business Logic
       JWT + RBAC             Validation
             |                     |
             -----------+-----------
                        |
                        v
                  PostgreSQL
                    Supabase
