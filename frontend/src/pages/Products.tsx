import { useEffect, useState } from "react";
import type {
  ChangeEvent,
  FormEvent,
} from "react";


interface Product {
  id: string;
  product_name: string;
  sku: string;
  category: string;
  unit_price: number;
  current_stock: number;
  min_stock_quantity: number;
  warehouse_location?: string;
}

interface ProductForm {
  productName: string;
  sku: string;
  category: string;
  unitPrice: string;
  currentStock: string;
  minStockQuantity: string;
  warehouseLocation: string;
}

const initialForm: ProductForm  = {
    
  productName: "",
  sku: "",
  category: "",
  unitPrice: "",
  currentStock: "0",
  minStockQuantity: "0",
  warehouseLocation: "",
};

function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] =
    useState<Product | null>(null);

  const [form, setForm] =
    useState<ProductForm>(initialForm);

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const [showStockForm, setShowStockForm] =
    useState(false);

  const [stockProduct, setStockProduct] =
    useState<Product | null>(null);

  const [stockQuantity, setStockQuantity] =
    useState("");

  const [updatingStock, setUpdatingStock] =
    useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const response = await fetch(
        "http://localhost:5000/api/products",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message || "Failed to fetch products"
        );
        return;
      }

      setProducts(data.products || []);
    } catch (error) {
      console.error(
        "Failed to fetch products:",
        error
      );

      setError("Unable to connect to server");
    } finally {
      setLoading(false);
    }
  }

  function getFilteredProducts() {
    const value = search.trim().toLowerCase();

    if (!value) {
      return products;
    }

    return products.filter(
      (product) =>
        product.product_name
          .toLowerCase()
          .includes(value) ||
        product.sku
          .toLowerCase()
          .includes(value) ||
        product.category
          .toLowerCase()
          .includes(value) ||
        (
          product.warehouse_location || ""
        )
          .toLowerCase()
          .includes(value)
    );
  }

  function handleInputChange(
    e: ChangeEvent<HTMLInputElement>
  ) {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function openAddProduct() {
    setEditingProduct(null);
    setForm(initialForm);
    setError("");
    setShowForm(true);
  }

  function openEditProduct(product: Product) {
  setEditingProduct(product);

  setForm({
    productName: product.product_name,
    sku: product.sku,
    category: product.category,
    unitPrice: String(product.unit_price),
    currentStock: String(product.current_stock),
    minStockQuantity: String(
      product.min_stock_quantity || 0
    ),
    warehouseLocation:
      product.warehouse_location || "",
  });

  setError("");
  setShowForm(true);
}
  

  function closeForm() {
    if (saving) return;

    setShowForm(false);
    setEditingProduct(null);
    setForm(initialForm);
    setError("");
  }

  async function handleSubmit(
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    if (
      !form.productName.trim() ||
      !form.sku.trim() ||
      !form.category.trim() ||
      !form.unitPrice
    ) {
      setError(
        "Product name, SKU, category and unit price are required"
      );
      return;
    }

    try {
      setSaving(true);
      setError("");

      const token = localStorage.getItem("token");

     const payload = {
  productName: form.productName.trim(),
  sku: form.sku.trim(),
  category: form.category.trim(),
  unitPrice: Number(form.unitPrice),
  currentStock: Number(form.currentStock || 0),
  minStockQuantity: Number(
    form.minStockQuantity || 0
  ),
  warehouseLocation:
    form.warehouseLocation.trim(),
};

      const url = editingProduct
        ? `http://localhost:5000/api/products/${editingProduct.id}`
        : "http://localhost:5000/api/products";

      const method = editingProduct ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            `Failed to ${
              editingProduct ? "update" : "create"
            } product`
        );
        return;
      }

      closeForm();
      await fetchProducts();
    } catch (error) {
      console.error(
        "Save product error:",
        error
      );

      setError("Unable to connect to server");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteProduct(
    product: Product
  ) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${product.product_name}"?`
    );

    if (!confirmed) return;

    try {
      setDeleting(true);
      setError("");

      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:5000/api/products/${product.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message || "Failed to delete product"
        );
        return;
      }

      await fetchProducts();
    } catch (error) {
      console.error(
        "Delete product error:",
        error
      );

      setError("Unable to connect to server");
    } finally {
      setDeleting(false);
    }
  }

  function openStockUpdate(product: Product) {
    setStockProduct(product);
    setStockQuantity("");
    setError("");
    setShowStockForm(true);
  }

  function closeStockUpdate() {
    if (updatingStock) return;

    setShowStockForm(false);
    setStockProduct(null);
    setStockQuantity("");
    setError("");
  }

  async function handleStockUpdate(
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    if (!stockProduct) return;

    const quantity = Number(stockQuantity);

    if (
      !Number.isInteger(quantity) ||
      quantity === 0
    ) {
      setError(
        "Enter a valid non-zero whole number"
      );
      return;
    }

    if (
      stockProduct.current_stock + quantity <
      0
    ) {
      setError("Insufficient stock");
      return;
    }

    try {
      setUpdatingStock(true);
      setError("");

      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:5000/api/inventory/${stockProduct.id}/stock`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            quantity,
            reason:
              quantity > 0
                ? "Manual stock IN"
                : "Manual stock OUT",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            "Failed to update stock"
        );
        return;
      }

      closeStockUpdate();
      await fetchProducts();
    } catch (error) {
      console.error(
        "Stock update error:",
        error
      );

      setError("Unable to connect to server");
    } finally {
      setUpdatingStock(false);
    }
  }

  const filteredProducts =
    getFilteredProducts();

  const totalStock = products.reduce(
    (total, product) =>
      total + Number(product.current_stock || 0),
    0
  );

  const lowStock = products.filter(
    (product) =>
      Number(product.current_stock) > 0 &&
      Number(product.current_stock) <=
        Number(product.min_stock_quantity || 0)
  ).length;

  const outOfStock = products.filter(
    (product) =>
      Number(product.current_stock) <= 0
  ).length;

  return (
    <div className="products-page">

      {/* HEADER */}
      <div className="products-header">
        <div>
        

          <div className="products-title-row">
            <h1>Products</h1>

           
          </div>

          <p>
            Manage your product catalogue,
            pricing and stock levels.
          </p>
        </div>

        <button
          className="products-primary-btn"
          onClick={openAddProduct}
        >
          <span className="products-btn-plus">
            +
          </span>
          Add Product
        </button>
      </div>

      {/* SEARCH */}
      <div className="products-toolbar">
        <div className="products-search">
          <span className="products-search-icon">
            ⌕
          </span>

          <input
            type="text"
            placeholder="Search by product name, SKU, category or warehouse..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

          {search && (
            <button
              className="products-search-clear"
              onClick={() => setSearch("")}
            >
              ×
            </button>
          )}
        </div>

        <button
          className="products-refresh-btn"
          onClick={fetchProducts}
          disabled={loading}
        >
          <span
            className={
              loading ? "products-spin" : ""
            }
          >
            ↻
          </span>

          Refresh
        </button>
      </div>

      {/* ERROR */}
      {error &&
        !showForm &&
        !showStockForm && (
          <div className="products-alert products-alert-error">
            <span>!</span>
            <div>{error}</div>
          </div>
        )}

      {/* STATS */}
      <div className="products-stats">

        <div className="products-stat-card">
          <div className="products-stat-icon products-stat-purple">
            ▣
          </div>

          <div>
            <span>Total Products</span>
            <strong>{products.length}</strong>
            <small>Active products</small>
          </div>
        </div>

        <div className="products-stat-card">
          <div className="products-stat-icon products-stat-blue">
            ◫
          </div>

          <div>
            <span>Total Stock</span>
            <strong>{totalStock}</strong>
            <small>Units available</small>
          </div>
        </div>

        <div className="products-stat-card">
          <div className="products-stat-icon products-stat-orange">
            △
          </div>

          <div>
            <span>Low Stock</span>
            <strong>{lowStock}</strong>
            <small>Needs attention</small>
          </div>
        </div>

        <div className="products-stat-card">
          <div className="products-stat-icon products-stat-red">
            ○
          </div>

          <div>
            <span>Out of Stock</span>
            <strong>{outOfStock}</strong>
            <small>Unavailable</small>
          </div>
        </div>

      </div>

    {/* PRODUCT CATALOGUE */}
<section className="products-panel">

  <div className="products-panel-head">
    <div>
      <div className="products-catalogue-title-row">
        <h2>Product Catalogue</h2>

        <span className="products-catalogue-count">
          {filteredProducts.length}
        </span>
      </div>

      <p>
        {filteredProducts.length} of {products.length} products
        {search ? ` matching "${search}"` : ""}
      </p>
    </div>

    <div className="products-panel-meta">
      <span className="products-live-dot" />
      Live inventory
    </div>
  </div>

  {loading ? (
    <div className="products-empty">
      <div className="products-loader" />

      <h3>Loading products</h3>

      <p>
        Fetching the latest inventory data...
      </p>
    </div>
  ) : filteredProducts.length === 0 ? (
    <div className="products-empty">

      <div className="products-empty-icon">
        ⌕
      </div>

      <h3>No products found</h3>

      <p>
        {search
          ? "Try a different search term."
          : "Add your first product to get started."}
      </p>

      {!search && (
        <button
          className="products-primary-btn products-empty-btn"
          onClick={openAddProduct}
        >
          + Add Product
        </button>
      )}

    </div>
  ) : (
    <div className="products-table-wrap">

      <table className="products-table">

        <thead>
          <tr>
            <th>PRODUCT</th>
            <th>SKU</th>
            <th>CATEGORY</th>
            <th>UNIT PRICE</th>
            <th>STOCK</th>
            <th>WAREHOUSE</th>
            <th>ACTIONS</th>
          </tr>
        </thead>

        <tbody>
          {filteredProducts.map((product) => {

            const stock = Number(
              product.current_stock || 0
            );

            const minStock = Number(
              product.min_stock_quantity || 0
            );

            const stockState =
              stock <= 0
                ? "out"
                : stock <= minStock
                  ? "low"
                  : "good";

            return (
              <tr key={product.id}>

                {/* PRODUCT */}
                <td>
                  <div className="products-name-cell">

                    <div className="products-product-icon">
                      P
                    </div>

                    <div className="products-product-info">
                      <strong>
                        {product.product_name}
                      </strong>

                      <span>
                        Product
                      </span>
                    </div>

                  </div>
                </td>

                {/* SKU */}
                <td>
                  <span className="products-sku">
                    {product.sku}
                  </span>
                </td>

                {/* CATEGORY */}
                <td>
                  <span className="products-category">
                    {product.category}
                  </span>
                </td>

                {/* PRICE */}
                <td>
                  <strong className="products-price">
                    ₹
                    {Number(
                      product.unit_price || 0
                    ).toFixed(2)}
                  </strong>
                </td>

                {/* STOCK */}
                <td>
                  <div className="products-stock-cell">

                    <strong>
                      {stock}
                    </strong>

                    <span
                      className={`products-stock-badge ${stockState}`}
                    >
                      {stock <= 0
                        ? "Out of stock"
                        : stock <= minStock
                          ? "Low stock"
                          : "In stock"}
                    </span>

                  </div>
                </td>

                {/* WAREHOUSE */}
                <td>
                  <div className="products-warehouse">

                    <span className="products-warehouse-icon">
                      ⌂
                    </span>

                    <span>
                      {product.warehouse_location ||
                        "Not assigned"}
                    </span>

                  </div>
                </td>

                {/* ACTIONS */}
                <td>
                  <div className="products-actions">

                    <button
                      className="products-action-btn"
                      onClick={() =>
                        openEditProduct(product)
                      }
                    >
                      Edit
                    </button>

                    <button
                      className="products-action-btn products-stock-btn"
                      onClick={() =>
                        openStockUpdate(product)
                      }
                    >
                      Stock
                    </button>

                    <button
                      className="products-action-btn products-delete-btn"
                      onClick={() =>
                        handleDeleteProduct(product)
                      }
                      disabled={deleting}
                    >
                      {deleting
                        ? "..."
                        : "Delete"}
                    </button>

                  </div>
                </td>

              </tr>
            );
          })}
        </tbody>

      </table>

    </div>
  )}

</section>

      {/* ADD / EDIT MODAL */}
      {showForm && (
        <div className="products-modal-overlay">

          <div className="products-modal">

            <div className="products-modal-head">

              <div>
                <span className="products-modal-kicker">
                  {editingProduct
                    ? "PRODUCT SETTINGS"
                    : "NEW PRODUCT"}
                </span>

                <h2>
                  {editingProduct
                    ? "Edit Product"
                    : "Add Product"}
                </h2>

                <p>
                  {editingProduct
                    ? "Update product information and inventory details."
                    : "Add a product to your catalogue and start tracking stock."}
                </p>
              </div>

              <button
                className="products-close-btn"
                onClick={closeForm}
                disabled={saving}
              >
                ×
              </button>

            </div>

            <form onSubmit={handleSubmit}>

              <div className="products-form-grid">

                <div className="products-form-group products-form-full">

                  <label>
                    Product Name *
                  </label>

                  <input
                    type="text"
                    name="productName"
                    value={form.productName}
                    onChange={handleInputChange}
                    placeholder="e.g. Tata Salt 1kg"
                  />

                </div>

                <div className="products-form-group">

                  <label>SKU *</label>

                  <input
                    type="text"
                    name="sku"
                    value={form.sku}
                    onChange={handleInputChange}
                    placeholder="e.g. SALT001"
                  />

                </div>

                <div className="products-form-group">

                  <label>Category *</label>

                  <input
                    type="text"
                    name="category"
                    value={form.category}
                    onChange={handleInputChange}
                    placeholder="e.g. Grocery"
                  />

                </div>

                <div className="products-form-group">

                  <label>
                    Unit Price *
                  </label>

                  <div className="products-input-prefix">

                    <span>₹</span>

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      name="unitPrice"
                      value={form.unitPrice}
                      onChange={handleInputChange}
                      placeholder="0.00"
                    />

                  </div>
                </div>

                <div className="products-form-group">

                  <label>
                    Current Stock
                  </label>

                  <input
                    type="number"
                    min="0"
                    name="currentStock"
                    value={form.currentStock}
                    onChange={handleInputChange}
                    placeholder="0"
                  />

                </div>
                <div className="products-form-group">
  <label>Minimum Stock</label>

  <input
    type="number"
    min="0"
    step="1"
    name="minStockQuantity"
    value={form.minStockQuantity}
    onChange={handleInputChange}
    placeholder="e.g. 10"
  />

  <small>
    Alert when stock reaches this level.
  </small>
</div>

                <div className="products-form-group products-form-full">

                  <label>
                    Warehouse Location
                  </label>

                  <input
                    type="text"
                    name="warehouseLocation"
                    value={form.warehouseLocation}
                    onChange={handleInputChange}
                    placeholder="e.g. Main Warehouse"
                  />

                </div>

              </div>

              {error && (
                <div className="products-alert products-alert-error products-modal-alert">
                  <span>!</span>
                  <div>{error}</div>
                </div>
              )}

              <div className="products-modal-actions">

                <button
                  type="button"
                  className="products-secondary-btn"
                  onClick={closeForm}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="products-primary-btn"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingProduct
                      ? "Save Changes"
                      : "Create Product"}
                </button>

              </div>

            </form>
          </div>
        </div>
      )}

      {/* STOCK MODAL */}
      {showStockForm &&
        stockProduct && (
          <div className="products-modal-overlay">

            <div className="products-modal products-stock-modal">

              <div className="products-modal-head">

                <div>
                  <span className="products-modal-kicker">
                    INVENTORY
                  </span>

                  <h2>
                    Update Stock
                  </h2>

                  <p>
                    {stockProduct.product_name}
                  </p>
                </div>

                <button
                  className="products-close-btn"
                  onClick={closeStockUpdate}
                  disabled={updatingStock}
                >
                  ×
                </button>

              </div>

              <form onSubmit={handleStockUpdate}>

                <div className="products-stock-summary">

                  <span>
                    Current stock
                  </span>

                  <strong>
                    {
                      stockProduct.current_stock
                    }
                  </strong>

                </div>

                <div className="products-form-group">

                  <label>
                    Quantity
                  </label>

                  <input
                    type="number"
                    step="1"
                    value={stockQuantity}
                    onChange={(e) =>
                      setStockQuantity(
                        e.target.value
                      )
                    }
                    placeholder="Example: 10 or -5"
                    autoFocus
                  />

                  <small>
                    Positive quantity adds
                    stock. Negative quantity
                    removes stock.
                  </small>

                </div>

                {error && (
                  <div className="products-alert products-alert-error products-modal-alert">
                    <span>!</span>
                    <div>{error}</div>
                  </div>
                )}

                <div className="products-modal-actions">

                  <button
                    type="button"
                    className="products-secondary-btn"
                    onClick={closeStockUpdate}
                    disabled={updatingStock}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="products-primary-btn"
                    disabled={updatingStock}
                  >
                    {updatingStock
                      ? "Updating..."
                      : "Update Stock"}
                  </button>

                </div>

              </form>

            </div>
          </div>
        )}

    </div>
  );
}

export default Products;