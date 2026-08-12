import { useEffect, useState } from "react";
import "./Dashboard.css";

interface Customer {
  id: string;
  customer_name: string;
  mobile: string;
  business_name?: string;
}

interface Product {
  id: string;
  product_name: string;
  sku: string;
  category: string;
  current_stock: number;
  warehouse_location?: string;
}

interface Challan {
  id: string;
  challan_number: string;
  customer_id: string;
  total_quantity: number;
  status:
    | "DRAFT"
    | "CONFIRMED"
    | "CANCELLED";
  created_at: string;
}

function Dashboard() {
  const [customers, setCustomers] =
    useState<Customer[]>([]);

  const [totalCustomers, setTotalCustomers] =
    useState(0);

  const [products, setProducts] =
    useState<Product[]>([]);

  const [challans, setChallans] =
    useState<Challan[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  // ========================================
  // LOAD DASHBOARD
  // ========================================

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    try {
      setLoading(true);
      setError("");

      const token =
        localStorage.getItem("token");

      const headers = {
        Authorization:
          `Bearer ${token}`,
      };

      // Customers API is paginated.
      // We only need total count here.
      const [
        customersResponse,
        productsResponse,
        challansResponse,
      ] = await Promise.all([
        fetch(
          "http://localhost:5000/api/customers?page=1&limit=1",
          {
            headers,
          }
        ),

        fetch(
          "http://localhost:5000/api/products",
          {
            headers,
          }
        ),

        fetch(
          "http://localhost:5000/api/challans",
          {
            headers,
          }
        ),
      ]);

      const customersData =
        await customersResponse.json();

      const productsData =
        await productsResponse.json();

      const challansData =
        await challansResponse.json();

      if (
        !customersResponse.ok ||
        !productsResponse.ok ||
        !challansResponse.ok
      ) {
        setError(
          "Failed to load dashboard data"
        );

        return;
      }

      // ====================================
      // CUSTOMERS
      // ====================================

      setCustomers(
        customersData.customers || []
      );

      setTotalCustomers(
        customersData.pagination?.total || 0
      );

      // ====================================
      // PRODUCTS
      // ====================================

      setProducts(
        productsData.products || []
      );

      // ====================================
      // CHALLANS
      // ====================================

      setChallans(
        challansData.challans || []
      );
    } catch (error) {
      console.error(
        "Dashboard fetch error:",
        error
      );

      setError(
        "Unable to connect to server"
      );
    } finally {
      setLoading(false);
    }
  }

  // ========================================
  // LOW STOCK
  // ========================================

  const lowStockProducts =
    products.filter(
      (product) =>
        Number(product.current_stock) <= 10
    );

  // ========================================
  // RECENT CHALLANS
  // ========================================

  const recentChallans =
    [...challans]
      .sort(
        (a, b) =>
          new Date(
            b.created_at
          ).getTime() -
          new Date(
            a.created_at
          ).getTime()
      )
      .slice(0, 5);

  // ========================================
  // DATE FORMAT
  // ========================================

  function formatDate(
    date: string
  ) {
    return new Date(
      date
    ).toLocaleString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  }

  // ========================================
  // CUSTOMER NAME
  // ========================================

  function getCustomerName(
    customerId: string
  ) {
    const customer =
      customers.find(
        (item) =>
          item.id === customerId
      );

    if (!customer) {
      return "Unknown Customer";
    }

    return customer.business_name
      ? `${customer.customer_name} - ${customer.business_name}`
      : customer.customer_name;
  }

  // ========================================
  // NAVIGATION
  // ========================================

  function navigateTo(
    page: string
  ) {
    window.dispatchEvent(
      new CustomEvent(
        "navigate-to",
        {
          detail: page,
        }
      )
    );
  }

  // ========================================
  // UI
  // ========================================

  return (
    <main className="main">

      {/* ==================================
          HEADER
      ================================== */}

      <header className="topbar">

        <div>
          <h1>
            Dashboard
          </h1>

          <p>
            Welcome back, Admin
          </p>
        </div>

        <div className="topbar-right">

          <button className="notification">
            🔔
          </button>

          <div className="profile">

            <div className="avatar">
              A
            </div>

            <span>
              Admin
            </span>

          </div>

        </div>

      </header>


      {/* ==================================
          ERROR
      ================================== */}

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}


      {/* ==================================
          STATS
      ================================== */}

      <section className="stats-grid">

        {/* CUSTOMERS */}

        <div className="stat-card">

          <div className="stat-icon customers">
            ◉
          </div>

          <div>

            <p>
              Total Customers
            </p>

            <h2>
              {loading
                ? "..."
                : totalCustomers}
            </h2>

            <span className="muted">
              Registered customers
            </span>

          </div>

        </div>


        {/* PRODUCTS */}

        <div className="stat-card">

          <div className="stat-icon products">
            ▣
          </div>

          <div>

            <p>
              Total Products
            </p>

            <h2>
              {loading
                ? "..."
                : products.length}
            </h2>

            <span className="muted">
              Products in system
            </span>

          </div>

        </div>


        {/* LOW STOCK */}

        <div className="stat-card">

          <div className="stat-icon inventory">
            ◫
          </div>

          <div>

            <p>
              Low Stock Items
            </p>

            <h2>
              {loading
                ? "..."
                : lowStockProducts.length}
            </h2>

            <span className="muted">
              Need attention
            </span>

          </div>

        </div>


        {/* CHALLANS */}

        <div className="stat-card">

          <div className="stat-icon challans">
            ▤
          </div>

          <div>

            <p>
              Total Challans
            </p>

            <h2>
              {loading
                ? "..."
                : challans.length}
            </h2>

            <span className="muted">
              Generated challans
            </span>

          </div>

        </div>

      </section>


      {/* ==================================
          RECENT CHALLANS + LOW STOCK
      ================================== */}

      <section className="content-grid">

        {/* RECENT CHALLANS */}

        <div className="panel">

          <div className="panel-header">

            <div>

              <h2>
                Recent Challans
              </h2>

              <p>
                Latest sales challans
              </p>

            </div>

          </div>


          {loading ? (

            <div className="empty-state">
              Loading...
            </div>

          ) : recentChallans.length === 0 ? (

            <div className="empty-state">

              <div className="empty-icon">
                ▤
              </div>

              <h3>
                No challans yet
              </h3>

              <p>
                Created challans will
                appear here.
              </p>

            </div>

          ) : (

            <div className="dashboard-list">

              {recentChallans.map(
                (challan) => (

                  <div
                    className="dashboard-list-item"
                    key={
                      challan.id
                    }
                  >

                    <div>

                      <strong>
                        {
                          challan.challan_number
                        }
                      </strong>

                      <p>
                        {
                          getCustomerName(
                            challan.customer_id
                          )
                        }
                      </p>

                    </div>


                    <div>

                      <span className="status-badge">
                        {
                          challan.status
                        }
                      </span>

                      <small>
                        {
                          formatDate(
                            challan.created_at
                          )
                        }
                      </small>

                    </div>

                  </div>

                )
              )}

            </div>

          )}

        </div>


        {/* LOW STOCK */}

        <div className="panel">

          <div className="panel-header">

            <div>

              <h2>
                Low Stock
              </h2>

              <p>
                Products requiring
                attention
              </p>

            </div>

          </div>


          {loading ? (

            <div className="empty-state">
              Loading...
            </div>

          ) : lowStockProducts.length === 0 ? (

            <div className="empty-state">

              <div className="empty-icon">
                ◫
              </div>

              <h3>
                No low stock items
              </h3>

              <p>
                All products have
                sufficient stock.
              </p>

            </div>

          ) : (

            <div className="dashboard-list">

              {lowStockProducts
                .slice(0, 5)
                .map(
                  (product) => (

                    <div
                      className="dashboard-list-item"
                      key={
                        product.id
                      }
                    >

                      <div>

                        <strong>
                          {
                            product.product_name
                          }
                        </strong>

                        <p>
                          SKU:{" "}
                          {
                            product.sku
                          }
                        </p>

                      </div>

                      <div>

                        <strong>
                          {
                            product.current_stock
                          }
                        </strong>

                        <small>
                          units left
                        </small>

                      </div>

                    </div>

                  )
                )}

            </div>

          )}

        </div>

      </section>


      {/* ==================================
          QUICK ACTIONS
      ================================== */}

      <section className="panel quick-panel">

        <div className="panel-header">

          <div>

            <h2>
              Quick Actions
            </h2>

            <p>
              Frequently used operations
            </p>

          </div>

        </div>


        <div className="quick-actions">

          <button
            onClick={() =>
              navigateTo(
                "Customers"
              )
            }
          >
            <span>＋</span>
            Add Customer
          </button>


          <button
            onClick={() =>
              navigateTo(
                "Products"
              )
            }
          >
            <span>＋</span>
            Add Product
          </button>


          <button
            onClick={() =>
              navigateTo(
                "Challans"
              )
            }
          >
            <span>＋</span>
            Create Challan
          </button>


          <button
            onClick={() =>
              navigateTo(
                "Inventory"
              )
            }
          >
            <span>↻</span>
            Stock Movement
          </button>

        </div>

      </section>

    </main>
  );
}

export default Dashboard;