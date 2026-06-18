import React, { useState, useEffect } from "react";

export default function App() {
  const [activeTab, setActiveTab] = useState("pos"); // Default to POS now!
  const [inventory, setInventory] = useState([]);
  const [customerSummary, setCustomerSummary] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [customerForm, setCustomerForm] = useState({
    name: "",
    contact: "",
    email: "",
  });

  // New States for Suppliers & History
  const [suppliers, setSuppliers] = useState([]);
  const [criticalStock, setCriticalStock] = useState([]);
  const [orderHistory, setOrderHistory] = useState([]);
  const [viewingHistoryFor, setViewingHistoryFor] = useState(null);

  // New States for Point of Sale
  const [cart, setCart] = useState([]);
  const [posCustomer, setPosCustomer] = useState("");
  const [posProduct, setPosProduct] = useState("");
  const [posQty, setPosQty] = useState(1);

  useEffect(() => {
    fetchInventory("All");
    fetchCustomerSummary();
    fetchSuppliersData();
  }, []);

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

  const fetchHistory = async (customer) => {
    const res = await window.dbApi.getCustomerHistory(customer.CustomerID);
    if (res.success) {
      setOrderHistory(res.data);
      setViewingHistoryFor(customer.CustomerName);
    }
  };

  // --- POS CART LOGIC ---
  const addToCart = () => {
    if (!posProduct) return alert("Select a product!");
    const product = inventory.find(
      (p) => p.ProductID.toString() === posProduct,
    );
    if (product.StockQuantity < posQty) return alert("Not enough stock!");

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

  const handleCheckout = async () => {
    if (!posCustomer || cart.length === 0)
      return alert("Select a customer and add items!");

    const res = await window.dbApi.createOrder({
      customerId: posCustomer,
      cart,
    });
    if (res.success) {
      alert(
        "Order Processed Successfully! Database triggers have updated your stock.",
      );
      setCart([]);
      setPosCustomer("");
      fetchInventory("All"); // Refresh stock
      fetchCustomerSummary(); // Refresh revenue
      fetchSuppliersData(); // Check if anything hit critical stock
    } else {
      alert("Error: " + res.error);
    }
  };

  const cartTotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  return (
    <div
      style={{
        fontFamily: "system-ui",
        display: "flex",
        height: "100vh",
        backgroundColor: "#f4f6f8",
      }}
    >
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
          {["pos", "inventory", "customers", "suppliers"].map((tab) => (
            <li
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: "10px",
                backgroundColor: activeTab === tab ? "#0d6efd" : "",
                borderRadius: "4px",
                marginBottom: "5px",
              }}
            >
              {tab === "pos"
                ? "🛒 Point of Sale"
                : tab === "inventory"
                  ? "📦 Inventory"
                  : tab === "customers"
                    ? "👥 Customers"
                    : "🚚 Suppliers"}
            </li>
          ))}
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
                style={{ padding: "10px", flex: 1 }}
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
                gap: "10px",
                marginBottom: "20px",
                padding: "15px",
                backgroundColor: "white",
                borderRadius: "8px",
              }}
            >
              <select
                value={posProduct}
                onChange={(e) => setPosProduct(e.target.value)}
                style={{ padding: "10px", flex: 2 }}
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
                style={{ padding: "10px", width: "80px" }}
              />
              <button
                onClick={addToCart}
                style={{
                  padding: "10px",
                  backgroundColor: "#0dcaf0",
                  border: "none",
                  borderRadius: "4px",
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
              }}
            >
              <tbody>
                {cart.map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: "1px solid #ddd" }}>
                    <td style={{ padding: "10px" }}>{item.name}</td>
                    <td style={{ padding: "10px" }}>Qty: {item.quantity}</td>
                    <td style={{ padding: "10px" }}>
                      LKR {item.price * item.quantity}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <h3>Total: LKR {cartTotal}</h3>
              <button
                onClick={handleCheckout}
                style={{
                  padding: "15px 30px",
                  backgroundColor: "#198754",
                  color: "white",
                  fontSize: "16px",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Checkout Order
              </button>
            </div>
          </section>
        )}

        {/* --- INVENTORY TAB --- */}
        {activeTab === "inventory" && (
          <section>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "20px",
              }}
            >
              <h2>Inventory</h2>
              <select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  fetchInventory(e.target.value);
                }}
                style={{ padding: "8px" }}
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
              }}
            >
              <thead>
                <tr style={{ backgroundColor: "#e9ecef", textAlign: "left" }}>
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

        {/* --- CUSTOMERS TAB (WITH HISTORY VIEW) --- */}
        {activeTab === "customers" && (
          <section>
            <h2>Customers</h2>
            {viewingHistoryFor ? (
              <div style={{ padding: "20px", backgroundColor: "white" }}>
                <h3>Order History: {viewingHistoryFor}</h3>
                <button
                  onClick={() => setViewingHistoryFor(null)}
                  style={{ marginBottom: "10px" }}
                >
                  Back to Summary
                </button>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr
                      style={{ backgroundColor: "#e9ecef", textAlign: "left" }}
                    >
                      <th style={{ padding: "8px" }}>Date</th>
                      <th style={{ padding: "8px" }}>Product</th>
                      <th style={{ padding: "8px" }}>Qty</th>
                      <th style={{ padding: "8px" }}>Total (LKR)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderHistory.map((hist, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid #ddd" }}>
                        <td style={{ padding: "8px" }}>
                          {new Date(hist.OrderDate).toLocaleDateString()}
                        </td>
                        <td style={{ padding: "8px" }}>{hist.ProductName}</td>
                        <td style={{ padding: "8px" }}>{hist.Quantity}</td>
                        <td style={{ padding: "8px" }}>{hist.LineTotal}</td>
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
                }}
              >
                <thead>
                  <tr style={{ backgroundColor: "#e9ecef", textAlign: "left" }}>
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
                      <td style={{ padding: "12px", fontWeight: "bold" }}>
                        {cust.TotalRevenueGenerated}
                      </td>
                      <td style={{ padding: "12px" }}>
                        <button onClick={() => fetchHistory(cust)}>
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
            <h2 style={{ color: "red" }}>🚨 Critical Stock Alerts</h2>
            <table
              style={{
                width: "100%",
                backgroundColor: "#fff3cd",
                borderCollapse: "collapse",
                marginBottom: "30px",
              }}
            >
              <tbody>
                {criticalStock.map((item) => (
                  <tr key={item.ProductID}>
                    <td
                      style={{
                        padding: "12px",
                        color: "red",
                        fontWeight: "bold",
                      }}
                    >
                      Low Stock: {item.ProductName} (Only {item.StockQuantity}{" "}
                      left!)
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <h2>Supplier Directory</h2>
            <table
              style={{
                width: "100%",
                backgroundColor: "white",
                borderCollapse: "collapse",
              }}
            >
              <thead>
                <tr style={{ backgroundColor: "#e9ecef", textAlign: "left" }}>
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
                    <td style={{ padding: "12px" }}>{sup.SupplierName}</td>
                    <td style={{ padding: "12px" }}>{sup.ContactNumber}</td>
                    <td style={{ padding: "12px" }}>
                      <a href={`mailto:${sup.Email}`}>{sup.Email}</a>
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
