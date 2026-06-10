# Spare Parts & Vehicle Management POS System - Requirements Document

## 1. Project Overview
This system is designed to digitize the operations of a retail shop specializing in vehicle spare parts, tractors, and harvesting machinery. The goal is to move from manual paper-based logging to a modern, offline-capable digital Point of Sale (POS) system.

---

## 2. Business Requirements

### 2.1 Inventory Management
* **Spare Parts Categorization:** Ability to log items by name, category (e.g., Engine, Body, Hydraulics), and rack location for quick retrieval.
* **High-Value Assets:** Separate tracking for Vehicles/Tractors including Chassis Numbers, Engine Numbers, and Model years.
* **Pricing Strategy:** Support for Cost Price vs. Selling Price to monitor profit margins.
* **Low Stock Alerts:** Automated notifications when a specific spare part falls below a predefined threshold.

### 2.2 Sales & Billing
* **Fast Checkout:** A search-and-add interface to quickly build a customer invoice.
* **Discounting:** Ability to apply flat or percentage-based discounts at the item level or total bill level.
* **Payment Modes:** Tracking for Cash, Card, and Credit (Customer Debts).

### 2.3 Reporting & Analytics
* **Daily Summaries:** Total sales and total profit generated per day.
* **Stock Valuation:** A report showing the total value of current inventory.
* **Best Sellers:** Identification of high-turnover parts to optimize ordering.

---

## 3. Technical Requirements

### 3.1 The Tech Stack
* **Frontend:** HTML5 & Tailwind CSS (for a modern, responsive UI).
* **Logic:** Vanilla JavaScript (ES6+).
* **Database:** **Dexie.js** (A wrapper for IndexedDB). This allows the system to run entirely in the browser without needing an internet connection or a separate server.

### 3.2 Database Schema (Dexie.js Stores)
The database will consist of the following tables:
* `products`: `++id, name, category, chassisNumber, sku`
* `inventory`: `id, costPrice, sellPrice, stockQuantity, minStockLevel`
* `sales`: `++id, timestamp, totalAmount, discount, paymentMethod`
* `saleItems`: `++id, saleId, productId, quantity, unitPrice`

### 3.3 Key System Features
1.  **Dashboard:** A visual overview of daily sales and low-stock warnings.
2.  **Inventory Manager:** A CRUD (Create, Read, Update, Delete) interface to manage stock.
3.  **POS Interface:** A "Cart" system that updates the database in real-time.
4.  **Data Portability:** An "Export to JSON/CSV" feature to backup data manually since it resides in the browser.

---

## 4. Implementation Instructions

### Step 1: UI Structure
Use **Tailwind CSS** to create a sidebar navigation (Dashboard, Inventory, POS, Reports) and a clean, wide workspace.

### Step 2: Database Initialization
Initialize Dexie in your main JavaScript file:
```javascript
const db = new Dexie("AutoPartsDB");
db.version(1).stores({
    products: "++id, name, category, sku",
    sales: "++id, timestamp",
    inventory: "++id, productId"
});