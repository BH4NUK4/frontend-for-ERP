const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('dbApi', {
    // Inventory
    getInventory: () => ipcRenderer.invoke('get-inventory'),
    getInventoryByCategory: (category) => ipcRenderer.invoke('get-inventory-by-category', category),
    addProduct: (data) => ipcRenderer.invoke('add-product', data), // NEW
    
    // Customers
    registerCustomer: (data) => ipcRenderer.invoke('register-customer', data),
    getCustomerSummary: () => ipcRenderer.invoke('get-customer-summary'),
    getCustomerHistory: (id) => ipcRenderer.invoke('get-customer-history', id),
    
    // Suppliers
    getSuppliers: () => ipcRenderer.invoke('get-suppliers'),
    getCriticalStock: () => ipcRenderer.invoke('get-critical-stock'),
    addSupplier: (data) => ipcRenderer.invoke('add-supplier', data), // NEW
    
    // Orders
    createOrder: (data) => ipcRenderer.invoke('create-order', data),
    getRecentOrders: () => ipcRenderer.invoke('get-recent-orders') // NEW
});