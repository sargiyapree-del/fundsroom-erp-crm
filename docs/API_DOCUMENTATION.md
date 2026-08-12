\# Fundsroom ERP CRM - API Documentation



\## Base URL



http://localhost:5000/api



\## Authentication



Protected APIs require a JWT token.



Header:



Authorization: Bearer <JWT\_TOKEN>



\---



\# Authentication



\## Login



POST /auth/login



Authentication: Not required



\### Request Body



```json

{

&#x20; "email": "demo@fundsroom.com",

&#x20; "password": "Admin@123"

}

