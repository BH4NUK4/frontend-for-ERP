import React, { useState, useEffect } from "react";

export default function App() {
  const [activeTab, setActiveTab] = useState("pos");
  const [inventory, setInventory] = useState([]);
  const [customerSummary, setCustomerSummary] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState("All");

  // Custom Toast Notification State
  const [toast, setToast] = useState(null);

  // Forms
  const [customerForm, setCustomerForm] = useState({
    name: "",
    contact: "",
    email: "",
  });
  const [productForm, setProductForm] = useState({
    name: "",
    category: "Electronics",
    price: "",
    stock: "",
    supplierId: "",
  });
  const [supplierForm, setSupplierForm] = useState({
    name: "",
    contact: "",
    email: "",
  });

  // Data States
  const [suppliers, setSuppliers] = useState([]);
  const [criticalStock, setCriticalStock] = useState([]);
  const [orderHistory, setOrderHistory] = useState([]);
  const [viewingHistoryFor, setViewingHistoryFor] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);

  // POS States
  const [cart, setCart] = useState([]);
  const [posCustomer, setPosCustomer] = useState("");
  const [posProduct, setPosProduct] = useState("");
  const [posQty, setPosQty] = useState(1);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = () => {
    fetchInventory("All");
    fetchCustomerSummary();
    fetchSuppliersData();
    fetchRecentOrders();
  };

  // --- NOTIFICATION HELPER ---
  const showToast = (message, isError = false) => {
    setToast({ message, isError });
    setTimeout(() => {
      setToast(null);
    }, 3000); // Disappears after 3 seconds
  };

  // --- FETCHERS ---
  const fetchInventory = async (category) => {
    const res =
      category === "All"
        ? await window.dbApi.getInventory()
        : await window.dbApi.getInventoryByCategory(category);
    if (res.success) setInventory(res.data);
  };

  const fetchCustomerSummary = async () => {
    const res = await window.dbApi.getCustomerSummary();
    if (res.success) setCustomerSummary(res.data);
  };

  const fetchSuppliersData = async () => {
    const supRes = await window.dbApi.getSuppliers();
    const critRes = await window.dbApi.getCriticalStock();
    if (supRes.success) setSuppliers(supRes.data);
    if (critRes.success) setCriticalStock(critRes.data);
  };

  const fetchRecentOrders = async () => {
    const res = await window.dbApi.getRecentOrders();
    if (res.success) setRecentOrders(res.data);
  };

  const fetchHistory = async (customer) => {
    const res = await window.dbApi.getCustomerHistory(customer.CustomerID);
    if (res.success) {
      setOrderHistory(res.data);
      setViewingHistoryFor(customer.CustomerName);
    } else {
      showToast("Error fetching history: " + res.error, true);
    }
  };

  // --- SUBMIT HANDLERS (Alerts removed!) ---
  const handleRegisterCustomer = async (e) => {
    e.preventDefault();
    const res = await window.dbApi.registerCustomer(customerForm);
    if (res.success) {
      showToast("Customer added successfully!");
      setCustomerForm({ name: "", contact: "", email: "" });
      fetchCustomerSummary();
    } else showToast("Error: " + res.error, true);
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    const res = await window.dbApi.addProduct(productForm);
    if (res.success) {
      showToast("Product added successfully!");
      setProductForm({
        name: "",
        category: "Electronics",
        price: "",
        stock: "",
        supplierId: "",
      });
      fetchInventory("All");
    } else showToast("Error: " + res.error, true);
  };

  const handleAddSupplier = async (e) => {
    e.preventDefault();
    const res = await window.dbApi.addSupplier(supplierForm);
    if (res.success) {
      showToast("Supplier added successfully!");
      setSupplierForm({ name: "", contact: "", email: "" });
      fetchSuppliersData();
    } else showToast("Error: " + res.error, true);
  };

  const handleCheckout = async () => {
    if (!posCustomer || cart.length === 0)
      return showToast("Select customer and add items!", true);
    const res = await window.dbApi.createOrder({
      customerId: posCustomer,
      cart,
    });
    if (res.success) {
      showToast("Order Processed Successfully!");
      setCart([]);
      setPosCustomer("");
      fetchAllData();
    } else showToast("Error: " + res.error, true);
  };

  const addToCart = () => {
    if (!posProduct) return showToast("Select a product!", true);
    const product = inventory.find(
      (p) => p.ProductID.toString() === posProduct,
    );
    if (product.StockQuantity < posQty)
      return showToast("Not enough stock!", true);

    const newItem = {
      productId: product.ProductID,
      name: product.ProductName,
      price: product.UnitPrice,
      quantity: posQty,
    };
    setCart([...cart, newItem]);
    setPosProduct("");
    setPosQty(1);
  };

  const cartTotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  // --- CSS STYLES ---
  const formStyle = {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
    marginBottom: "30px",
    padding: "20px",
    backgroundColor: "white",
    borderRadius: "8px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  };
  const inputStyle = {
    padding: "8px",
    flex: "1 1 150px",
    border: "1px solid #ccc",
    borderRadius: "4px",
    minWidth: "150px",
  };
  const btnStyle = {
    padding: "8px 16px",
    backgroundColor: "#198754",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    minWidth: "120px",
  };
  const tableHeaderStyle = { backgroundColor: "#e9ecef", textAlign: "left" };

  return (
    <div
      style={{
        fontFamily: "system-ui",
        display: "flex",
        height: "100vh",
        backgroundColor: "#f4f6f8",
      }}
    >
      {/* --- TOAST NOTIFICATION UI --- */}
      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: "30px",
            right: "30px",
            backgroundColor: toast.isError ? "#dc3545" : "#198754",
            color: "white",
            padding: "15px 25px",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            zIndex: 1000,
            fontWeight: "500",
            transition: "all 0.3s ease",
          }}
        >
          {toast.message}
        </div>
      )}

      {/* SIDEBAR */}
      <div
        style={{
          width: "220px",
          backgroundColor: "#212529",
          color: "white",
          padding: "20px",
        }}
      >
        <h2>ERP System</h2>
        <ul
          style={{
            listStyle: "none",
            padding: 0,
            marginTop: "20px",
            cursor: "pointer",
          }}
        >
          {["pos", "inventory", "customers", "suppliers", "orders"].map(
            (tab) => (
              <li
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: "10px",
                  backgroundColor: activeTab === tab ? "#0d6efd" : "",
                  borderRadius: "4px",
                  marginBottom: "5px",
                  transition: "0.2s",
                }}
              >
                {tab === "pos"
                  ? "🛒 Point of Sale"
                  : tab === "inventory"
                    ? "📦 Inventory"
                    : tab === "customers"
                      ? "👥 Customers"
                      : tab === "suppliers"
                        ? "🚚 Suppliers"
                        : "📊 Recent Orders"}
              </li>
            ),
          )}
        </ul>
      </div>

      {/* MAIN CONTENT */}
      <div style={{ flex: 1, padding: "30px", overflowY: "auto" }}>
        {/* --- POS TAB --- */}
        {activeTab === "pos" && (
          <section>
            <h2>Create New Order</h2>
            <div style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
              <select
                value={posCustomer}
                onChange={(e) => setPosCustomer(e.target.value)}
                style={{
                  padding: "10px",
                  flex: 1,
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                }}
              >
                <option value="">-- Select Customer --</option>
                {customerSummary.map((c) => (
                  <option key={c.CustomerID} value={c.CustomerID}>
                    {c.CustomerName}
                  </option>
                ))}
              </select>
            </div>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "10px",
                marginBottom: "20px",
                padding: "15px",
                backgroundColor: "white",
                borderRadius: "8px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              }}
            >
              <select
                value={posProduct}
                onChange={(e) => setPosProduct(e.target.value)}
                style={{
                  padding: "10px",
                  flex: "2 1 200px",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                }}
              >
                <option value="">-- Select Product --</option>
                {inventory.map((p) => (
                  <option key={p.ProductID} value={p.ProductID}>
                    {p.ProductName} (Stock: {p.StockQuantity} | LKR{" "}
                    {p.UnitPrice})
                  </option>
                ))}
              </select>
              <input
                type="number"
                min="1"
                value={posQty}
                onChange={(e) => setPosQty(parseInt(e.target.value))}
                style={{
                  padding: "10px",
                  width: "80px",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                }}
              />
              <button
                onClick={addToCart}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#0dcaf0",
                  color: "black",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                Add to Cart
              </button>
            </div>
            <h3>Shopping Cart</h3>
            <table
              style={{
                width: "100%",
                backgroundColor: "white",
                borderCollapse: "collapse",
                marginBottom: "20px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              }}
            >
              <tbody>
                {cart.map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: "1px solid #eee" }}>
                    <td style={{ padding: "15px" }}>{item.name}</td>
                    <td style={{ padding: "15px" }}>Qty: {item.quantity}</td>
                    <td style={{ padding: "15px", fontWeight: "bold" }}>
                      LKR {item.price * item.quantity}
                    </td>
                  </tr>
                ))}
                {cart.length === 0 && (
                  <tr>
                    <td
                      colSpan="3"
                      style={{
                        padding: "20px",
                        textAlign: "center",
                        color: "#888",
                      }}
                    >
                      Cart is empty
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                backgroundColor: "white",
                padding: "20px",
                borderRadius: "8px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              }}
            >
              <h3 style={{ margin: 0 }}>Total: LKR {cartTotal}</h3>
              <button
                onClick={handleCheckout}
                style={{ ...btnStyle, padding: "12px 30px", fontSize: "16px" }}
              >
                Checkout Order
              </button>
            </div>
          </section>
        )}

        {/* --- INVENTORY TAB --- */}
        {activeTab === "inventory" && (
          <section>
            <h2>Inventory Management</h2>
            <form onSubmit={handleAddProduct} style={formStyle}>
              <input
                type="text"
                placeholder="Product Name"
                required
                style={inputStyle}
                value={productForm.name}
                onChange={(e) =>
                  setProductForm({ ...productForm, name: e.target.value })
                }
              />
              <select
                style={inputStyle}
                value={productForm.category}
                onChange={(e) =>
                  setProductForm({ ...productForm, category: e.target.value })
                }
              >
                <option value="Electronics">Electronics</option>
                <option value="Home Appliances">Home Appliances</option>
              </select>
              <select
                style={inputStyle}
                value={productForm.supplierId}
                onChange={(e) =>
                  setProductForm({ ...productForm, supplierId: e.target.value })
                }
                required
              >
                <option value="">-- Select Supplier --</option>
                {suppliers.map((s) => (
                  <option key={s.SupplierID} value={s.SupplierID}>
                    {s.SupplierName}
                  </option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Price (LKR)"
                required
                style={inputStyle}
                value={productForm.price}
                onChange={(e) =>
                  setProductForm({ ...productForm, price: e.target.value })
                }
              />
              <input
                type="number"
                placeholder="Stock Qty"
                required
                style={inputStyle}
                value={productForm.stock}
                onChange={(e) =>
                  setProductForm({ ...productForm, stock: e.target.value })
                }
              />
              <button type="submit" style={btnStyle}>
                Add Product
              </button>
            </form>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "15px",
                alignItems: "center",
              }}
            >
              <h3 style={{ margin: 0 }}>Current Stock</h3>
              <select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  fetchInventory(e.target.value);
                }}
                style={{
                  padding: "8px",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                }}
              >
                <option value="All">All Categories</option>
                <option value="Electronics">Electronics</option>
                <option value="Home Appliances">Home Appliances</option>
              </select>
            </div>
            <table
              style={{
                width: "100%",
                backgroundColor: "white",
                borderCollapse: "collapse",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              }}
            >
              <thead>
                <tr style={tableHeaderStyle}>
                  <th style={{ padding: "12px" }}>Product</th>
                  <th style={{ padding: "12px" }}>Price</th>
                  <th style={{ padding: "12px" }}>Stock</th>
                </tr>
              </thead>
              <tbody>
                {inventory.map((item) => (
                  <tr
                    key={item.ProductID}
                    style={{ borderBottom: "1px solid #dee2e6" }}
                  >
                    <td style={{ padding: "12px" }}>{item.ProductName}</td>
                    <td style={{ padding: "12px" }}>{item.UnitPrice}</td>
                    <td
                      style={{
                        padding: "12px",
                        color: item.StockQuantity < 10 ? "red" : "green",
                        fontWeight: "bold",
                      }}
                    >
                      {item.StockQuantity}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {/* --- CUSTOMERS TAB --- */}
        {activeTab === "customers" && (
          <section>
            <h2>Customer Management</h2>
            <form onSubmit={handleRegisterCustomer} style={formStyle}>
              <input
                type="text"
                placeholder="Name"
                required
                style={inputStyle}
                value={customerForm.name}
                onChange={(e) =>
                  setCustomerForm({ ...customerForm, name: e.target.value })
                }
              />
              <input
                type="text"
                placeholder="Contact (Unique)"
                required
                style={inputStyle}
                value={customerForm.contact}
                onChange={(e) =>
                  setCustomerForm({ ...customerForm, contact: e.target.value })
                }
              />
              <input
                type="email"
                placeholder="Email"
                style={inputStyle}
                value={customerForm.email}
                onChange={(e) =>
                  setCustomerForm({ ...customerForm, email: e.target.value })
                }
              />
              <button type="submit" style={btnStyle}>
                Add Customer
              </button>
            </form>

            {viewingHistoryFor ? (
              <div
                style={{
                  padding: "20px",
                  backgroundColor: "white",
                  borderRadius: "8px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "20px",
                  }}
                >
                  <h3 style={{ margin: 0 }}>
                    Order History: {viewingHistoryFor}
                  </h3>
                  <button
                    onClick={() => setViewingHistoryFor(null)}
                    style={{
                      padding: "8px 16px",
                      cursor: "pointer",
                      backgroundColor: "#6c757d",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                    }}
                  >
                    ← Back to Summary
                  </button>
                </div>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={tableHeaderStyle}>
                      <th style={{ padding: "12px" }}>Date</th>
                      <th style={{ padding: "12px" }}>Product</th>
                      <th style={{ padding: "12px" }}>Qty</th>
                      <th style={{ padding: "12px" }}>Total (LKR)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderHistory.length === 0 && (
                      <tr>
                        <td
                          colSpan="4"
                          style={{ padding: "20px", textAlign: "center" }}
                        >
                          No orders found for this customer.
                        </td>
                      </tr>
                    )}
                    {orderHistory.map((hist, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid #ddd" }}>
                        <td style={{ padding: "12px" }}>
                          {new Date(hist.OrderDate).toLocaleDateString()}
                        </td>
                        <td style={{ padding: "12px" }}>{hist.ProductName}</td>
                        <td style={{ padding: "12px" }}>{hist.Quantity}</td>
                        <td style={{ padding: "12px", fontWeight: "bold" }}>
                          {hist.LineTotal}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <table
                style={{
                  width: "100%",
                  backgroundColor: "white",
                  borderCollapse: "collapse",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                }}
              >
                <thead>
                  <tr style={tableHeaderStyle}>
                    <th style={{ padding: "12px" }}>Name</th>
                    <th style={{ padding: "12px" }}>Total Revenue</th>
                    <th style={{ padding: "12px" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {customerSummary.map((cust) => (
                    <tr
                      key={cust.CustomerID}
                      style={{ borderBottom: "1px solid #dee2e6" }}
                    >
                      <td style={{ padding: "12px" }}>{cust.CustomerName}</td>
                      <td
                        style={{
                          padding: "12px",
                          fontWeight: "bold",
                          color: "#198754",
                        }}
                      >
                        {cust.TotalRevenueGenerated}
                      </td>
                      <td style={{ padding: "12px" }}>
                        <button
                          onClick={() => fetchHistory(cust)}
                          style={{
                            padding: "6px 12px",
                            backgroundColor: "#0d6efd",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                          }}
                        >
                          View History
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        )}

        {/* --- SUPPLIERS TAB --- */}
        {activeTab === "suppliers" && (
          <section>
            <h2>Supplier Directory</h2>
            <form onSubmit={handleAddSupplier} style={formStyle}>
              <input
                type="text"
                placeholder="Supplier Name"
                required
                style={inputStyle}
                value={supplierForm.name}
                onChange={(e) =>
                  setSupplierForm({ ...supplierForm, name: e.target.value })
                }
              />
              <input
                type="text"
                placeholder="Contact"
                required
                style={inputStyle}
                value={supplierForm.contact}
                onChange={(e) =>
                  setSupplierForm({ ...supplierForm, contact: e.target.value })
                }
              />
              <input
                type="email"
                placeholder="Email"
                style={inputStyle}
                value={supplierForm.email}
                onChange={(e) =>
                  setSupplierForm({ ...supplierForm, email: e.target.value })
                }
              />
              <button type="submit" style={btnStyle}>
                Add Supplier
              </button>
            </form>

            {criticalStock.length > 0 && (
              <table
                style={{
                  width: "100%",
                  backgroundColor: "#fff3cd",
                  borderCollapse: "collapse",
                  marginBottom: "30px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                }}
              >
                <tbody>
                  {criticalStock.map((item) => (
                    <tr key={item.ProductID}>
                      <td
                        style={{
                          padding: "15px",
                          color: "#856404",
                          fontWeight: "bold",
                          borderLeft: "5px solid #ffeeba",
                        }}
                      >
                        🚨 Low Stock: {item.ProductName} (Only{" "}
                        {item.StockQuantity} left!)
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            <table
              style={{
                width: "100%",
                backgroundColor: "white",
                borderCollapse: "collapse",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              }}
            >
              <thead>
                <tr style={tableHeaderStyle}>
                  <th style={{ padding: "12px" }}>Supplier</th>
                  <th style={{ padding: "12px" }}>Contact</th>
                  <th style={{ padding: "12px" }}>Email</th>
                </tr>
              </thead>
              <tbody>
                {suppliers.map((sup) => (
                  <tr
                    key={sup.SupplierID}
                    style={{ borderBottom: "1px solid #dee2e6" }}
                  >
                    <td style={{ padding: "12px", fontWeight: "500" }}>
                      {sup.SupplierName}
                    </td>
                    <td style={{ padding: "12px" }}>{sup.ContactNumber}</td>
                    <td style={{ padding: "12px" }}>
                      <a
                        href={`mailto:${sup.Email}`}
                        style={{ color: "#0d6efd", textDecoration: "none" }}
                      >
                        {sup.Email}
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {/* --- RECENT ORDERS TAB --- */}
        {activeTab === "orders" && (
          <section>
            <h2>Recent Orders (Top 20)</h2>
            <table
              style={{
                width: "100%",
                backgroundColor: "white",
                borderCollapse: "collapse",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              }}
            >
              <thead>
                <tr style={tableHeaderStyle}>
                  <th style={{ padding: "12px" }}>Order ID</th>
                  <th style={{ padding: "12px" }}>Date & Time</th>
                  <th style={{ padding: "12px" }}>Customer</th>
                  <th style={{ padding: "12px" }}>Total Amount (LKR)</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((ord) => (
                  <tr
                    key={ord.OrderID}
                    style={{ borderBottom: "1px solid #dee2e6" }}
                  >
                    <td style={{ padding: "12px", color: "#6c757d" }}>
                      #{ord.OrderID}
                    </td>
                    <td style={{ padding: "12px" }}>
                      {new Date(ord.OrderDate).toLocaleString()}
                    </td>
                    <td style={{ padding: "12px", fontWeight: "500" }}>
                      {ord.CustomerName}
                    </td>
                    <td
                      style={{
                        padding: "12px",
                        fontWeight: "bold",
                        color: "#198754",
                      }}
                    >
                      {ord.TotalAmount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}
      </div>
    </div>
  );
}
