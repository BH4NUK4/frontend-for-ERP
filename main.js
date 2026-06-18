const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const sql = require('mssql');
require('dotenv').config();

// UPDATE THIS WITH YOUR ACTUAL SQL SERVER CREDENTIALS
const dbConfig = {
    user: process.env.DB_USER, 
    password: process.env.DB_PASSWORD, 
    server: process.env.DB_SERVER, 
    port: 1433,
    database: process.env.DB_NAME,
    options: {
        encrypt: false, 
        trustServerCertificate: true 
    }
};

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true
        }
    });
    mainWindow.loadURL('http://localhost:5173'); 
}

app.whenReady().then(() => {
    createWindow();

    ipcMain.handle('get-inventory', async () => {
        try {
            await sql.connect(dbConfig);
            const result = await sql.query('SELECT * FROM v_InventoryStatus');
            return { success: true, data: result.recordset };
        } catch (err) {
            return { success: false, error: err.message };
        }
    });

    ipcMain.handle('register-customer', async (event, customerData) => {
        try {
            await sql.connect(dbConfig);
            const request = new sql.Request();
            request.input('Name', sql.VarChar(100), customerData.name);
            request.input('Contact', sql.VarChar(15), customerData.contact);
            request.input('Email', sql.VarChar(100), customerData.email);
            
            await request.execute('sp_RegisterNewCustomer');
            return { success: true };
        } catch (err) {
            return { success: false, error: err.message };
        }
    });

    // --- NEW: Fetch Customer Order Summary View ---
    ipcMain.handle('get-customer-summary', async () => {
        try {
            await sql.connect(dbConfig); // Make sure this matches your variable name
            const result = await sql.query('SELECT * FROM dbo.v_CustomerOrderSummary ORDER BY TotalRevenueGenerated DESC');
            return { success: true, data: result.recordset };
        } catch (err) {
            return { success: false, error: err.message };
        }
    });

    // --- NEW: Fetch Inventory by Category Function ---
    ipcMain.handle('get-inventory-by-category', async (event, categoryName) => {
        try {
            await sql.connect(dbConfig);
            const request = new sql.Request();
            request.input('CategoryName', sql.VarChar(50), categoryName);
            // Execute the table-valued function
            const result = await request.query('SELECT * FROM dbo.fn_GetProductsByCategory(@CategoryName)');
            return { success: true, data: result.recordset };
        } catch (err) {
            return { success: false, error: err.message };
        }
    });

    // --- 1. SUPPLIERS & CRITICAL STOCK ---
    ipcMain.handle('get-suppliers', async () => {
        try {
            await sql.connect(dbConfig);
            const result = await sql.query('SELECT * FROM dbo.SUPPLIERS');
            return { success: true, data: result.recordset };
        } catch (err) { return { success: false, error: err.message }; }
    });

    ipcMain.handle('get-critical-stock', async () => {
        try {
            await sql.connect(dbConfig);
            const result = await sql.query('SELECT * FROM dbo.v_InventoryStatus WHERE StockQuantity < 10');
            return { success: true, data: result.recordset };
        } catch (err) { return { success: false, error: err.message }; }
    });

    // --- 2. DEEP-DIVE ORDER HISTORY ---
    ipcMain.handle('get-customer-history', async (event, customerId) => {
        try {
            await sql.connect(dbConfig);
            const request = new sql.Request();
            request.input('CustID', sql.Int, customerId);
            // This query joins Orders, Details, and Products together
            const result = await request.query(`
                SELECT o.OrderDate, o.TotalAmount, p.ProductName, d.Quantity, d.LineTotal
                FROM dbo.ORDERS o
                JOIN dbo.ORDERDETAILS d ON o.OrderID = d.OrderID
                JOIN dbo.PRODUCTS p ON d.ProductID = p.ProductID
                WHERE o.CustomerID = @CustID
                ORDER BY o.OrderDate DESC
            `);
            return { success: true, data: result.recordset };
        } catch (err) { return { success: false, error: err.message }; }
    });

    // --- 3. POINT OF SALE (ORDER CREATION) ---
    ipcMain.handle('create-order', async (event, orderData) => {
        try {
            const pool = await sql.connect(dbConfig);
            const transaction = new sql.Transaction(pool);
            await transaction.begin(); // Start a safe transaction

            try {
                // Step A: Create the Order Header
                const headerReq = new sql.Request(transaction);
                headerReq.input('CustomerID', sql.Int, orderData.customerId);
                const headerRes = await headerReq.query(`
                    INSERT INTO dbo.ORDERS (CustomerID, OrderDate, TotalAmount)
                    OUTPUT INSERTED.OrderID
                    VALUES (@CustomerID, GETDATE(), 0);
                `);
                const newOrderId = headerRes.recordset[0].OrderID;

                // Step B: Insert the items (Your SQL Triggers will automatically deduct stock & calc totals!)
                for (const item of orderData.cart) {
                    const detailReq = new sql.Request(transaction);
                    detailReq.input('OrderID', sql.Int, newOrderId);
                    detailReq.input('ProductID', sql.Int, item.productId);
                    detailReq.input('Quantity', sql.Int, item.quantity);
                    detailReq.input('UnitPrice', sql.Decimal(18,2), item.price);
                    
                    await detailReq.query(`
                        INSERT INTO dbo.ORDERDETAILS (OrderID, ProductID, Quantity, UnitPrice)
                        VALUES (@OrderID, @ProductID, @Quantity, @UnitPrice)
                    `);
                }
                
                await transaction.commit(); // Save it all
                return { success: true };
            } catch (txErr) {
                await transaction.rollback(); // If something fails, undo everything
                throw txErr;
            }
        } catch (err) { return { success: false, error: err.message }; }
    });
});