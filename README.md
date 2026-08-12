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

These are test/demo accounts provided for evaluation.

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

Backend Request Flow
Client
  ↓
Route
  ↓
Authentication Middleware
  ↓
Authorization Middleware
  ↓
Controller
  ↓
Service
  ↓
Database

📂 Project Structure

fundsroom/
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   └── server.ts
│   │
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── assets/
│   │   ├── App.tsx
│   │   └── main.tsx
│   │
│   └── package.json
│
└── docs/
    └── API_DOCUMENTATION.md

👥 Roles & Permissions

The application supports four roles:

Module	ADMIN	SALES	WAREHOUSE	ACCOUNTS
Customers	Full	Manage/View	-	-
Follow-ups	Manage/View	Manage/View	-	-
Products	Full	-	View	-
Inventory	Manage	-	Manage	-
Challans	Full	Create/View/Update	View	View
Challan Items	Manage/View	Manage/View	View	View

🚀 Deployment

The application is deployed on an AWS EC2 instance running Amazon Linux.

Frontend

http://44.223.21.143:3000/

Backend API

http://44.223.21.143:5000/

The backend runs on port 5000.

The frontend is served on port 3000.

Environment variables are configured separately on the deployment server.

🔒 Security
JWT authentication for protected APIs
Role-based authorization
Password hashing using bcrypt
Environment variables for sensitive configuration
.env excluded from version control
Database credentials are not stored in source code
JWT secrets are not stored in source code
⚠️ Known Limitations
The system is designed as a mini ERP/CRM and does not cover every enterprise workflow.
Advanced reporting and analytics are limited.
Product image/file upload functionality is not included.
Production configuration may require environment-specific adjustments.
