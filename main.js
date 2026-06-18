const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const sql = require('mssql');
require('dotenv').config();

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

    // --- INVENTORY ---
    ipcMain.handle('get-inventory', async () => {
        try {
            await sql.connect(dbConfig);
            const result = await sql.query('SELECT * FROM dbo.v_InventoryStatus');
            return { success: true, data: result.recordset };
        } catch (err) { return { success: false, error: err.message }; }
    });

    // BUG FIX: Query the view directly so Supplier columns match perfectly
    ipcMain.handle('get-inventory-by-category', async (event, categoryName) => {
        try {
            await sql.connect(dbConfig);
            const request = new sql.Request();
            request.input('CatName', sql.VarChar(50), categoryName);
            const result = await request.query('SELECT * FROM dbo.v_InventoryStatus WHERE Category = @CatName');
            return { success: true, data: result.recordset };
        } catch (err) { return { success: false, error: err.message }; }
    });

    // BUG FIX: Changed 'Price' to 'UnitPrice' and forced a SupplierID
    ipcMain.handle('add-product', async (event, prodData) => {
        try {
            await sql.connect(dbConfig);
            const request = new sql.Request();
            request.input('Name', sql.VarChar(100), prodData.name);
            request.input('Category', sql.VarChar(50), prodData.category);
            request.input('UnitPrice', sql.Decimal(10,2), prodData.price); 
            request.input('Stock', sql.Int, prodData.stock);
            request.input('SupplierID', sql.Int, prodData.supplierId); 
            
            await request.query('INSERT INTO dbo.PRODUCTS (ProductName, Category, UnitPrice, StockQuantity, SupplierID) VALUES (@Name, @Category, @UnitPrice, @Stock, @SupplierID)');
            return { success: true };
        } catch (err) { return { success: false, error: err.message }; }
    });

    // --- CUSTOMERS ---
    ipcMain.handle('register-customer', async (event, customerData) => {
        try {
            await sql.connect(dbConfig);
            const request = new sql.Request();
            request.input('Name', sql.VarChar(100), customerData.name);
            request.input('Contact', sql.VarChar(15), customerData.contact);
            request.input('Email', sql.VarChar(100), customerData.email);
            await request.execute('sp_RegisterNewCustomer');
            return { success: true };
        } catch (err) { return { success: false, error: err.message }; }
    });

    ipcMain.handle('get-customer-summary', async () => {
        try {
            await sql.connect(dbConfig); 
            const result = await sql.query('SELECT * FROM dbo.v_CustomerOrderSummary ORDER BY TotalRevenueGenerated DESC');
            return { success: true, data: result.recordset };
        } catch (err) { return { success: false, error: err.message }; }
    });

    // BUG FIX: Grab 'SubTotal' directly from the ORDERDETAILS table
    ipcMain.handle('get-customer-history', async (event, customerId) => {
        try {
            await sql.connect(dbConfig);
            const request = new sql.Request();
            request.input('CustID', sql.Int, customerId);
            const result = await request.query(`
                SELECT o.OrderDate, o.TotalAmount, p.ProductName, d.Quantity, d.SubTotal AS LineTotal
                FROM dbo.ORDERS o
                JOIN dbo.ORDERDETAILS d ON o.OrderID = d.OrderID
                JOIN dbo.PRODUCTS p ON d.ProductID = p.ProductID
                WHERE o.CustomerID = @CustID
                ORDER BY o.OrderDate DESC
            `);
            return { success: true, data: result.recordset };
        } catch (err) { return { success: false, error: err.message }; }
    });

    // --- SUPPLIERS ---
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

    ipcMain.handle('add-supplier', async (event, supData) => {
        try {
            await sql.connect(dbConfig);
            const request = new sql.Request();
            request.input('Name', sql.VarChar(100), supData.name);
            request.input('Contact', sql.VarChar(15), supData.contact);
            request.input('Email', sql.VarChar(100), supData.email);
            await request.query('INSERT INTO dbo.SUPPLIERS (SupplierName, ContactNumber, Email) VALUES (@Name, @Contact, @Email)');
            return { success: true };
        } catch (err) { return { success: false, error: err.message }; }
    });

    // --- ORDERS & POS ---
    ipcMain.handle('get-recent-orders', async () => {
        try {
            await sql.connect(dbConfig);
            const result = await sql.query(`
                SELECT TOP 20 o.OrderID, c.CustomerName, o.OrderDate, o.TotalAmount 
                FROM dbo.ORDERS o 
                JOIN dbo.CUSTOMERS c ON o.CustomerID = c.CustomerID 
                ORDER BY o.OrderDate DESC
            `);
            return { success: true, data: result.recordset };
        } catch (err) { return { success: false, error: err.message }; }
    });

    // BUG FIX: Calculate SubTotal and insert it (Removed invalid Price column)
    ipcMain.handle('create-order', async (event, orderData) => {
        try {
            const pool = await sql.connect(dbConfig);
            const transaction = new sql.Transaction(pool);
            await transaction.begin();

            try {
                const headerReq = new sql.Request(transaction);
                headerReq.input('CustomerID', sql.Int, orderData.customerId);
                const headerRes = await headerReq.query(`
                    INSERT INTO dbo.ORDERS (CustomerID, OrderDate, TotalAmount)
                    OUTPUT INSERTED.OrderID
                    VALUES (@CustomerID, GETDATE(), 0);
                `);
                const newOrderId = headerRes.recordset[0].OrderID;

                for (const item of orderData.cart) {
                    const detailReq = new sql.Request(transaction);
                    detailReq.input('OrderID', sql.Int, newOrderId);
                    detailReq.input('ProductID', sql.Int, item.productId);
                    detailReq.input('Quantity', sql.Int, item.quantity);
                    
                    // The App does the math here, just like your SQL function would!
                    const subTotal = item.quantity * item.price;
                    detailReq.input('SubTotal', sql.Decimal(10,2), subTotal);
                    
                    await detailReq.query(`
                        INSERT INTO dbo.ORDERDETAILS (OrderID, ProductID, Quantity, SubTotal)
                        VALUES (@OrderID, @ProductID, @Quantity, @SubTotal)
                    `);
                }
                
                await transaction.commit(); 
                return { success: true };
            } catch (txErr) {
                await transaction.rollback(); 
                throw txErr;
            }
        } catch (err) { return { success: false, error: err.message }; }
    });
});