\# Fundsroom ERP + CRM

\## API Documentation \& Project Documentation



\## 1. Project Overview



Fundsroom ERP + CRM is a role-based business management system designed for a wholesale/distribution business.



The system helps internal teams manage:



\- Customers

\- Customer follow-ups

\- Products

\- Inventory

\- Stock movements

\- Sales challans

\- Challan items

\- Role-based access



The application uses JWT-based authentication and role-based authorization for Admin, Sales, Warehouse and Accounts users.



\---



\# 2. Live Deployment



\## Frontend



http://44.223.21.143:3000/



\## Backend API



http://44.223.21.143:5000/



\---



\# 3. Demo Login Credentials



These credentials are provided for testing the deployed application.



\## Admin



Email: demo@fundsroom.com  

Password: Admin@123  

Role: ADMIN



\## Sales



Email: sales@test.com  

Password: Test@123  

Role: SALES



\## Warehouse



Email: warehouse@test.com  

Password: Test@123  

Role: WAREHOUSE



\## Accounts



Email: accounts@test.com  

Password: Test@123  

Role: ACCOUNTS



\---



\# 4. Technology Stack



\## Frontend



\- React

\- TypeScript

\- Vite

\- HTML

\- CSS



\## Backend



\- Node.js

\- TypeScript

\- Express.js

\- REST APIs

\- JWT Authentication

\- bcrypt password hashing



\## Database



\- PostgreSQL

\- Supabase



\## Deployment



\- AWS EC2

\- Amazon Linux



\---



\# 5. Authentication APIs



\## Login



POST `/api/auth/login`



Authentication: Not required.



\### Live Endpoint



http://44.223.21.143:5000/api/auth/login



\### Request Body



```json

{

&#x20; "email": "demo@fundsroom.com",

&#x20; "password": "Admin@123"

}



\---



\# 6. Customer APIs



\## Create Customer



POST `/api/customers`



Roles:



\- ADMIN

\- SALES



\### Request Body



```json

{

&#x20; "customerName": "ABC Traders",

&#x20; "mobile": "9876543210",

&#x20; "email": "abc@example.com",

&#x20; "businessName": "ABC Traders",

&#x20; "gstNumber": "24ABCDE1234F1Z5",

&#x20; "customerType": "WHOLESALE",

&#x20; "address": "Ahmedabad, Gujarat",

&#x20; "status": "ACTIVE",

&#x20; "followUpDate": "2026-08-20",

&#x20; "notes": "Important customer"

}



7\. Product APIs

Create Product



POST /api/products



Role:



ADMIN

Request Body

{

&#x20; "productName": "Premium Product",

&#x20; "sku": "PRD-001",

&#x20; "category": "Electronics",

&#x20; "unitPrice": 1500,

&#x20; "currentStock": 100,

&#x20; "minStockQuantity": 10,

&#x20; "warehouseLocation": "Warehouse A"

}



Required fields:



productName

sku

category

unitPrice

Get Products



GET /api/products



Roles:



ADMIN

WAREHOUSE

Get Product By ID



GET /api/products/:id



Roles:



ADMIN

WAREHOUSE

Update Product



PUT /api/products/:id



Role:



ADMIN

Delete Product



DELETE /api/products/:id



Role:



ADMIN

Update Product Stock



PATCH /api/products/:id/stock



Roles:



ADMIN

WAREHOUSE

Request Body

{

&#x20; "quantity": 25

}



Positive values increase stock.



Negative values decrease stock.



Stock cannot become negative.



8\. Inventory APIs

Create Stock Movement



POST /api/inventory/products/:id/stock-movements



Authentication: Required.



Request Body

{

&#x20; "quantity": 25,

&#x20; "movementType": "IN",

&#x20; "reason": "New stock received"

}



Movement types:



IN

OUT

Get Stock Movements



GET /api/inventory/products/:id/stock-movements



Authentication: Required.





9\. Challan APIs

Create Challan



POST /api/challans



Roles:



ADMIN

SALES

Request Body

{

&#x20; "customerId": "CUSTOMER\_ID",

&#x20; "items": \[

&#x20;   {

&#x20;     "productId": "PRODUCT\_ID",

&#x20;     "quantity": 5

&#x20;   }

&#x20; ]

}

Get Challans



GET /api/challans



Roles:



ADMIN

SALES

WAREHOUSE

ACCOUNTS

Get Challan By ID



GET /api/challans/:id



Roles:



ADMIN

SALES

WAREHOUSE

ACCOUNTS

Update Challan



PUT /api/challans/:id



Roles:



ADMIN

SALES

Delete Challan



DELETE /api/challans/:id



Role:



ADMIN

Add Challan Item



POST /api/challans/:challanId/items



Roles:



ADMIN

SALES

Request Body

{

&#x20; "productId": "PRODUCT\_ID",

&#x20; "quantity": 5

}

Get Challan Items



GET /api/challans/:challanId/items



Roles:



ADMIN

SALES

WAREHOUSE

ACCOUNTS



10\. Role-Based Access Control



The application supports four roles:



ADMIN

SALES

WAREHOUSE

ACCOUNTS



Protected APIs require JWT authentication.



Role permissions are enforced using backend authorization middleware.



Role Access Summary

Module	ADMIN	SALES	WAREHOUSE	ACCOUNTS

Customers	Full	Manage/View	-	-

Customer Follow-ups	Manage/View	Manage/View	-	-

Products	Full	-	View	-

Inventory	Manage	-	Manage	-

Challans	Full	Create/View/Update	View	View

Challan Items	Manage/View	Manage/View	View	View



11\. HTTP Status Codes

Status Code	Description

200	Successful request

201	Resource created

400	Bad request

401	Unauthorized

403	Forbidden

404	Resource not found

500	Internal server error



12\. API Authentication



Protected APIs require the JWT token returned after login.



Authorization Header

Authorization: Bearer <JWT\_TOKEN>

Example

GET http://44.223.21.143:5000/api/products



Header:



Authorization: Bearer <JWT\_TOKEN>







13\. Architecture



The application follows a client-server architecture.



&#x20;                   React + TypeScript

&#x20;                        Frontend

&#x20;                           |

&#x20;                           |

&#x20;                       REST APIs

&#x20;                           |

&#x20;                           v

&#x20;                Node.js + Express

&#x20;                   + TypeScript

&#x20;                           |

&#x20;              -------------------------

&#x20;              |                       |

&#x20;              v                       v

&#x20;       JWT Authentication       Business Logic

&#x20;       Role Authorization        Validation

&#x20;              |                       |

&#x20;              -----------+-------------

&#x20;                         |

&#x20;                         v

&#x20;                   PostgreSQL

&#x20;                     Supabase





16\. Project Structure

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

&#x20;   └── API\_DOCUMENTATION.md



23\. Demo Video



A complete screen recording demonstrating the application flow is provided as part of the submission.



The demonstration includes:



Login

Dashboard

Customer management

Product management

Inventory

Challans

Follow-ups

Role-based access

API testing

