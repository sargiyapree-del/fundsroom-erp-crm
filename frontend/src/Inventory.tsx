import { useEffect, useState } from "react";
import type { FormEvent } from "react";

interface Product {
  id: string;
  product_name: string;
  sku: string;
  category: string;
  unit_price: number;
  current_stock: number;
  warehouse_location?: string;
}

interface StockMovement {
  id: string;
  product_id: string;
  quantity: number;
  movement_type: "IN" | "OUT";
  reason: string;
  created_by: string;
  created_at: string;
  product_name?: string;
  sku?: string;
}

function Inventory() {
  // ========================================
  // STATES
  // ========================================

  const [products, setProducts] =
    useState<Product[]>([]);

  const [selectedProduct, setSelectedProduct] =
    useState<Product | null>(null);

  const [movements, setMovements] =
    useState<StockMovement[]>([]);

  const [search, setSearch] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [movementLoading, setMovementLoading] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [showMovementForm, setShowMovementForm] =
    useState(false);

  const [movementType, setMovementType] =
    useState<"IN" | "OUT">("IN");

  const [quantity, setQuantity] =
    useState("");

  const [reason, setReason] =
    useState("");

  // ========================================
  // LOAD PRODUCTS
  // ========================================

  useEffect(() => {
    fetchProducts();
  }, []);

  // ========================================
  // FETCH PRODUCTS
  // ========================================

  async function fetchProducts() {
    try {
      setLoading(true);
      setError("");

      const token =
        localStorage.getItem("token");

      const response = await fetch(
        "http://localhost:5000/api/products",
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            "Failed to fetch products"
        );
        return;
      }

      setProducts(
        data.products || []
      );
    } catch (error) {
      console.error(
        "Fetch products error:",
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
  // FETCH STOCK MOVEMENTS
  // ========================================

  async function fetchMovements(
    productId: string
  ) {
    try {
      setMovementLoading(true);
      setError("");

      const token =
        localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:5000/api/inventory/products/${productId}/stock-movements`,
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            "Failed to fetch stock movements"
        );
        return;
      }

      setMovements(
        data.movements || []
      );
    } catch (error) {
      console.error(
        "Fetch movements error:",
        error
      );

      setError(
        "Unable to connect to server"
      );
    } finally {
      setMovementLoading(false);
    }
  }

  // ========================================
  // SELECT PRODUCT
  // ========================================

  function handleSelectProduct(
    product: Product
  ) {
    setSelectedProduct(product);
    setError("");
    fetchMovements(product.id);
  }

  // ========================================
  // OPEN MOVEMENT FORM
  // ========================================

  function openMovementForm(
    type: "IN" | "OUT"
  ) {
    if (!selectedProduct) {
      setError(
        "Please select a product first"
      );
      return;
    }

    setMovementType(type);
    setQuantity("");
    setReason("");
    setError("");
    setShowMovementForm(true);
  }

  // ========================================
  // CLOSE MOVEMENT FORM
  // ========================================

  function closeMovementForm() {
    if (saving) {
      return;
    }

    setShowMovementForm(false);
    setQuantity("");
    setReason("");
    setError("");
  }

  // ========================================
  // CREATE STOCK MOVEMENT
  // ========================================

  async function handleCreateMovement(
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    if (!selectedProduct) {
      setError(
        "Please select a product"
      );
      return;
    }

    const parsedQuantity =
      Number(quantity);

    if (
      !quantity ||
      !Number.isInteger(
        parsedQuantity
      ) ||
      parsedQuantity <= 0
    ) {
      setError(
        "Quantity must be a positive integer"
      );
      return;
    }

    if (!reason.trim()) {
      setError(
        "Reason is required"
      );
      return;
    }

    if (
      movementType === "OUT" &&
      parsedQuantity >
        Number(
          selectedProduct.current_stock
        )
    ) {
      setError(
        "Insufficient stock"
      );
      return;
    }

    try {
      setSaving(true);
      setError("");

      const token =
        localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:5000/api/inventory/products/${selectedProduct.id}/stock-movements`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`,
          },

          body: JSON.stringify({
            quantity:
              parsedQuantity,

            movementType,

            reason:
              reason.trim(),
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            "Failed to create stock movement"
        );
        return;
      }

      // Update selected product
      if (data.product) {
        setSelectedProduct(
          data.product
        );
      }

      // Close modal
      closeMovementForm();

      // Refresh products
      await fetchProducts();

      // Refresh movement history
      await fetchMovements(
        selectedProduct.id
      );
    } catch (error) {
      console.error(
        "Create movement error:",
        error
      );

      setError(
        "Unable to connect to server"
      );
    } finally {
      setSaving(false);
    }
  }

  // ========================================
  // SEARCH PRODUCTS
  // ========================================

  const filteredProducts =
    products.filter(
      (product) => {
        const value =
          search
            .trim()
            .toLowerCase();

        if (!value) {
          return true;
        }

        return (
          product.product_name
            .toLowerCase()
            .includes(value) ||
          product.sku
            .toLowerCase()
            .includes(value) ||
          product.category
            .toLowerCase()
            .includes(value)
        );
      }
    );

  // ========================================
  // FORMAT DATE
  // ========================================

  function formatDate(
    date: string
  ) {
    return new Date(
      date
    ).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  }

  function formatDateTime(
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
  // UI
  // ========================================

  return (
    <div className="page-container">

      {/* HEADER */}

      <div className="page-header">

        <div>

          <h1>
            Inventory
          </h1>

          <p>
            Manage stock movements
            and inventory
          </p>

        </div>

        <button
          className="secondary-button"
          onClick={
            fetchProducts
          }
        >
          Refresh
        </button>

      </div>


      {/* ERROR */}

      {error &&
        !showMovementForm && (
          <div className="error-message">
            {error}
          </div>
        )}


      {/* SEARCH */}

      <div className="search-section">

        <input
          type="text"
          placeholder="Search products by name, SKU or category..."
          value={search}
          onChange={(e) =>
            setSearch(
              e.target.value
            )
          }
        />

      </div>


      {/* PRODUCTS */}

      <div className="customers-card">

        <div className="panel-header">

          <div>

            <h2>
              Products
            </h2>

            <p>
              Select a product to
              manage its stock
            </p>

          </div>

        </div>


        {loading ? (
          <div className="empty-state">

            <h3>
              Loading products...
            </h3>

          </div>
        ) : filteredProducts.length ===
          0 ? (
          <div className="empty-state">

            <h3>
              No products found
            </h3>

            <p>
              Add products from the
              Products module first.
            </p>

          </div>
        ) : (
          <table>

            <thead>

              <tr>

                <th>
                  Product
                </th>

                <th>
                  SKU
                </th>

                <th>
                  Category
                </th>

                <th>
                  Current Stock
                </th>

                <th>
                  Warehouse
                </th>

                <th>
                  Action
                </th>

              </tr>

            </thead>


            <tbody>

              {filteredProducts.map(
                (product) => (

                  <tr
                    key={
                      product.id
                    }
                  >

                    <td>

                      <strong>
                        {
                          product.product_name
                        }
                      </strong>

                    </td>


                    <td>
                      {
                        product.sku
                      }
                    </td>


                    <td>
                      {
                        product.category
                      }
                    </td>


                    <td>

                      <span className="status-badge">
                        {
                          product.current_stock
                        }
                      </span>

                    </td>


                    <td>
                      {
                        product.warehouse_location ||
                        "-"
                      }
                    </td>


                    <td>

                      <button
                        className="action-button"
                        onClick={() =>
                          handleSelectProduct(
                            product
                          )
                        }
                      >
                        Manage Stock
                      </button>

                    </td>

                  </tr>

                )
              )}

            </tbody>

          </table>
        )}

      </div>


      {/* =====================================
          SELECTED PRODUCT
      ====================================== */}

      {selectedProduct && (

        <div className="customers-card">

          <div className="panel-header">

            <div>

              <h2>
                {
                  selectedProduct.product_name
                }
              </h2>

              <p>
                SKU:{" "}
                {
                  selectedProduct.sku
                }
              </p>

            </div>

            <div>

              <strong>
                Current Stock:{" "}
                {
                  selectedProduct.current_stock
                }
              </strong>

            </div>

          </div>


          {/* STOCK ACTIONS */}

          <div className="quick-actions">

            <button
              onClick={() =>
                openMovementForm(
                  "IN"
                )
              }
            >
              <span>
                ＋
              </span>

              Stock IN
            </button>


            <button
              onClick={() =>
                openMovementForm(
                  "OUT"
                )
              }
            >
              <span>
                −
              </span>

              Stock OUT
            </button>

          </div>


          {/* MOVEMENT HISTORY */}

          <div
            style={{
              marginTop:
                "30px",
            }}
          >

            <div className="panel-header">

              <div>

                <h2>
                  Stock Movement History
                </h2>

                <p>
                  All stock changes
                  for this product
                </p>

              </div>

            </div>


            {movementLoading ? (
              <div className="empty-state">

                <h3>
                  Loading movements...
                </h3>

              </div>
            ) : movements.length ===
              0 ? (
              <div className="empty-state">

                <h3>
                  No stock movements
                </h3>

                <p>
                  Stock IN and OUT
                  records will appear
                  here.
                </p>

              </div>
            ) : (
              <table>

                <thead>

                  <tr>

                    <th>
                      Date
                    </th>

                    <th>
                      Type
                    </th>

                    <th>
                      Quantity
                    </th>

                    <th>
                      Reason
                    </th>

                    <th>
                      Created By
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {movements.map(
                    (movement) => (

                      <tr
                        key={
                          movement.id
                        }
                      >

                        <td>
                          {formatDateTime(
                            movement.created_at
                          )}
                        </td>


                        <td>

                          <span className="status-badge">

                            {
                              movement.movement_type
                            }

                          </span>

                        </td>


                        <td>

                          {movement.movement_type ===
                          "IN"
                            ? "+"
                            : "-"}
                          {
                            movement.quantity
                          }

                        </td>


                        <td>
                          {
                            movement.reason
                          }
                        </td>


                        <td>
                          {
                            movement.created_by
                          }
                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>
            )}

          </div>

        </div>
      )}


      {/* =====================================
          STOCK MOVEMENT MODAL
      ====================================== */}

      {showMovementForm &&
        selectedProduct && (

          <div className="modal-overlay">

            <div className="customer-modal">

              <div className="modal-header">

                <div>

                  <h2>
                    {movementType ===
                    "IN"
                      ? "Stock IN"
                      : "Stock OUT"}
                  </h2>

                  <p>
                    {
                      selectedProduct.product_name
                    }
                  </p>

                </div>


                <button
                  className="close-button"
                  onClick={
                    closeMovementForm
                  }
                  disabled={
                    saving
                  }
                >
                  ×
                </button>

              </div>


              <form
                onSubmit={
                  handleCreateMovement
                }
              >

                <div className="form-grid">

                  {/* PRODUCT */}

                  <div className="form-group full-width">

                    <label>
                      Product
                    </label>

                    <input
                      type="text"
                      value={
                        selectedProduct.product_name
                      }
                      disabled
                    />

                  </div>


                  {/* CURRENT STOCK */}

                  <div className="form-group">

                    <label>
                      Current Stock
                    </label>

                    <input
                      type="number"
                      value={
                        selectedProduct.current_stock
                      }
                      disabled
                    />

                  </div>


                  {/* QUANTITY */}

                  <div className="form-group">

                    <label>
                      Quantity *
                    </label>

                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={
                        quantity
                      }
                      onChange={(e) =>
                        setQuantity(
                          e.target.value
                        )
                      }
                      placeholder="Enter quantity"
                    />

                  </div>


                  {/* REASON */}

                  <div className="form-group full-width">

                    <label>
                      Reason *
                    </label>

                    <textarea
                      value={
                        reason
                      }
                      onChange={(e) =>
                        setReason(
                          e.target.value
                        )
                      }
                      placeholder={
                        movementType ===
                        "IN"
                          ? "Example: New stock received"
                          : "Example: Product sold"
                      }
                      rows={4}
                    />

                  </div>

                </div>


                {/* ERROR */}

                {error && (
                  <div className="error-message">
                    {error}
                  </div>
                )}


                {/* ACTIONS */}

                <div className="modal-actions">

                  <button
                    type="button"
                    className="secondary-button"
                    onClick={
                      closeMovementForm
                    }
                    disabled={
                      saving
                    }
                  >
                    Cancel
                  </button>


                  <button
                    type="submit"
                    className="primary-button"
                    disabled={
                      saving
                    }
                  >
                    {saving
                      ? "Saving..."
                      : movementType ===
                        "IN"
                      ? "Add Stock"
                      : "Remove Stock"}
                  </button>

                </div>

              </form>

            </div>

          </div>
        )}

    </div>
  );
}

export default Inventory;