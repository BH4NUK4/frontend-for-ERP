# 📦 ERP Inventory & POS System (Electron + React + SQL Server)

A full-stack desktop application built for Inventory Management, Customer Tracking, and Point of Sale (POS) operations. Built with an Electron backend, a React frontend, and a Microsoft SQL Server database utilizing complex triggers, views, and stored procedures.

---

## 🛠️ Prerequisites

Before you can run this project on your machine, you must have the following software installed:

1. **[Node.js](https://nodejs.org/)** (v18 or higher recommended)
2. **[Microsoft SQL Server](https://www.microsoft.com/en-us/sql-server/sql-server-downloads)** (Developer or Express edition)
3. **[SQL Server Management Studio (SSMS)](https://learn.microsoft.com/en-us/sql/ssms/download-sql-server-management-studio-ssms)**

---

## 🗄️ Database Setup (Crucial Step)

Because this app connects directly to a local SQL Server, your local database must be configured correctly to accept the connection.

### 1. Build the Database

1. Open SSMS and connect to your local server.
2. Create a database manually `ERP_Inventory`
3. Run all the SQL queries within `ERPSystem.sql`(this will create all the necassery tables within db)

### Dependencies should install

run this
npm install --legacy-peer-deps
