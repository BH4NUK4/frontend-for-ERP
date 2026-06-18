const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('dbApi', {
    getInventory: () => ipcRenderer.invoke('get-inventory'),
    registerCustomer: (data) => ipcRenderer.invoke('register-customer', data),
    getCustomerSummary: () => ipcRenderer.invoke('get-customer-summary'),
    getInventoryByCategory: (category) => ipcRenderer.invoke('get-inventory-by-category', category),
    
    // --- NEW ENDPOINTS ---
    getSuppliers: () => ipcRenderer.invoke('get-suppliers'),
    getCriticalStock: () => ipcRenderer.invoke('get-critical-stock'),
    getCustomerHistory: (id) => ipcRenderer.invoke('get-customer-history', id),
    createOrder: (data) => ipcRenderer.invoke('create-order', data)
});