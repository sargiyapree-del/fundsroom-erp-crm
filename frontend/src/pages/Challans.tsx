import { useEffect, useState } from "react";

interface Customer {
  id: string;
  customer_name: string;
  business_name?: string;
}

interface Product {
  id: string;
  product_name: string;
  sku: string;
  unit_price: number;
  current_stock: number;
}

interface ChallanItem {
  productId: string;
  quantity: number;
}

interface Challan {
  id: string;
  challan_number: string;
  customer_id: string;
  total_quantity: number;
  status: "DRAFT" | "CONFIRMED" | "CANCELLED";
  created_by: string;
  created_at: string;
}

interface ChallanDetail extends Challan {
  items: {
    id: string;
    challan_id: string;
    product_id: string;
    product_name: string;
    sku: string;
    unit_price: number;
    quantity: number;
  }[];
}

function Challans() {
  // ========================================
  // STATES
  // ========================================

  const [challans, setChallans] =
    useState<Challan[]>([]);

  const [customers, setCustomers] =
    useState<Customer[]>([]);

  const [products, setProducts] =
    useState<Product[]>([]);

  const [selectedChallan, setSelectedChallan] =
    useState<ChallanDetail | null>(null);

  const [showForm, setShowForm] =
    useState(false);

  const [showDetails, setShowDetails] =
    useState(false);

  const [selectedCustomer, setSelectedCustomer] =
    useState("");

  const [selectedProduct, setSelectedProduct] =
    useState("");

  const [quantity, setQuantity] =
    useState("");

  const [items, setItems] =
    useState<ChallanItem[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  // ========================================
  // INITIAL LOAD
  // ========================================

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    await Promise.all([
      fetchChallans(),
      fetchCustomers(),
      fetchProducts()
    ]);
  }

  // ========================================
  // FETCH CHALLANS
  // ========================================

  async function fetchChallans() {
    try {
      setLoading(true);

      const token =
        localStorage.getItem("token");

      const response = await fetch(
        "http://localhost:5000/api/challans",
        {
          headers: {
            Authorization:
              `Bearer ${token}`
          }
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            "Failed to fetch challans"
        );
        return;
      }

      setChallans(
        data.challans || []
      );
    } catch (error) {
      console.error(
        "Fetch challans error:",
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
  // FETCH CUSTOMERS
  // ========================================

  async function fetchCustomers() {
    try {
      const token =
        localStorage.getItem("token");

      const response = await fetch(
        "http://localhost:5000/api/customers",
        {
          headers: {
            Authorization:
              `Bearer ${token}`
          }
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        return;
      }

      setCustomers(
        data.customers || []
      );
    } catch (error) {
      console.error(
        "Fetch customers error:",
        error
      );
    }
  }

  // ========================================
  // FETCH PRODUCTS
  // ========================================

  async function fetchProducts() {
    try {
      const token =
        localStorage.getItem("token");

      const response = await fetch(
        "http://localhost:5000/api/products",
        {
          headers: {
            Authorization:
              `Bearer ${token}`
          }
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
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
    }
  }

  // ========================================
  // ADD ITEM
  // ========================================

  function handleAddItem() {
    setError("");

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

    const product =
      products.find(
        (item) =>
          item.id === selectedProduct
      );

    if (!product) {
      setError(
        "Product not found"
      );
      return;
    }

    if (
      parsedQuantity >
      product.current_stock
    ) {
      setError(
        `Only ${product.current_stock} units available`
      );
      return;
    }

    const existingItem =
      items.find(
        (item) =>
          item.productId ===
          selectedProduct
      );

    if (existingItem) {
      setError(
        "Product is already added"
      );
      return;
    }

    setItems([
      ...items,
      {
        productId:
          selectedProduct,
        quantity:
          parsedQuantity
      }
    ]);

    setSelectedProduct("");
    setQuantity("");
  }

  // ========================================
  // REMOVE ITEM
  // ========================================

  function handleRemoveItem(
    productId: string
  ) {
    setItems(
      items.filter(
        (item) =>
          item.productId !==
          productId
      )
    );
  }

  // ========================================
  // CREATE CHALLAN
  // ========================================

  async function handleCreateChallan() {
    setError("");

    if (!selectedCustomer) {
      setError(
        "Please select a customer"
      );
      return;
    }

    if (items.length === 0) {
      setError(
        "Please add at least one product"
      );
      return;
    }

    try {
      setSaving(true);

      const token =
        localStorage.getItem("token");

      const response = await fetch(
        "http://localhost:5000/api/challans",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`
          },

          body: JSON.stringify({
            customerId:
              selectedCustomer,

            items
          })
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            "Failed to create challan"
        );
        return;
      }

      alert(
        "Challan created successfully"
      );

      resetForm();

      await fetchChallans();
    } catch (error) {
      console.error(
        "Create challan error:",
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
  // VIEW CHALLAN
  // ========================================

  async function handleViewChallan(
    challanId: string
  ) {
    try {
      setError("");

      const token =
        localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:5000/api/challans/${challanId}`,
        {
          headers: {
            Authorization:
              `Bearer ${token}`
          }
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            "Failed to fetch challan"
        );
        return;
      }

      setSelectedChallan(
        data.challan
      );

      setShowDetails(true);
    } catch (error) {
      console.error(
        "View challan error:",
        error
      );

      setError(
        "Unable to connect to server"
      );
    }
  }

  // ========================================
  // CONFIRM CHALLAN
  // ========================================

  async function handleConfirmChallan(
    challanId: string
  ) {
    const confirmed =
      window.confirm(
        "Are you sure you want to confirm this challan? Stock will be deducted."
      );

    if (!confirmed) {
      return;
    }

    try {
      setSaving(true);
      setError("");

      const token =
        localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:5000/api/challans/${challanId}`,
        {
          method: "PUT",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`
          },

          body: JSON.stringify({
            status:
              "CONFIRMED"
          })
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            "Failed to confirm challan"
        );
        return;
      }

      alert(
        "Challan confirmed successfully"
      );

      await fetchChallans();

      await fetchProducts();

      await handleViewChallan(
        challanId
      );
    } catch (error) {
      console.error(
        "Confirm challan error:",
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
  // DELETE CHALLAN
  // ========================================

  async function handleDeleteChallan(
    challanId: string
  ) {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this challan?"
      );

    if (!confirmed) {
      return;
    }

    try {
      setSaving(true);
      setError("");

      const token =
        localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:5000/api/challans/${challanId}`,
        {
          method: "DELETE",

          headers: {
            Authorization:
              `Bearer ${token}`
          }
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            "Failed to delete challan"
        );
        return;
      }

      alert(
        "Challan deleted successfully"
      );

      if (
        selectedChallan?.id ===
        challanId
      ) {
        setSelectedChallan(null);
        setShowDetails(false);
      }

      await fetchChallans();
    } catch (error) {
      console.error(
        "Delete challan error:",
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
  // RESET FORM
  // ========================================

  function resetForm() {
    setShowForm(false);
    setSelectedCustomer("");
    setSelectedProduct("");
    setQuantity("");
    setItems([]);
    setError("");
  }

  // ========================================
  // HELPERS
  // ========================================

  function getCustomerName(
    customerId: string
  ) {
    const customer =
      customers.find(
        (item) =>
          item.id ===
          customerId
      );

    if (!customer) {
      return "Unknown Customer";
    }

    return customer.business_name
      ? `${customer.customer_name} - ${customer.business_name}`
      : customer.customer_name;
  }

  function getProduct(
    productId: string
  ) {
    return products.find(
      (product) =>
        product.id ===
        productId
    );
  }

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
        minute: "2-digit"
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
            Challans
          </h1>

          <p>
            Create and manage
            sales challans
          </p>

        </div>

        <button
          className="primary-button"
          onClick={() =>
            setShowForm(true)
          }
        >
          + Create Challan
        </button>

      </div>


      {/* ERROR */}

      {error &&
        !showForm &&
        !showDetails && (
          <div className="error-message">
            {error}
          </div>
        )}


      {/* CHALLAN LIST */}

      <div className="customers-card">

        <div className="panel-header">

          <div>

            <h2>
              Challan History
            </h2>

            <p>
              All generated
              challans
            </p>

          </div>

          <button
            className="secondary-button"
            onClick={
              fetchChallans
            }
          >
            Refresh
          </button>

        </div>


        {loading ? (
          <div className="empty-state">

            <h3>
              Loading challans...
            </h3>

          </div>
        ) : challans.length ===
          0 ? (
          <div className="empty-state">

            <div className="empty-icon">
              ▤
            </div>

            <h3>
              No challans yet
            </h3>

            <p>
              Create your first
              challan.
            </p>

          </div>
        ) : (
          <table>

            <thead>

              <tr>

                <th>
                  Challan No.
                </th>

                <th>
                  Customer
                </th>

                <th>
                  Quantity
                </th>

                <th>
                  Status
                </th>

                <th>
                  Created
                </th>

                <th>
                  Actions
                </th>

              </tr>

            </thead>


            <tbody>

              {challans.map(
                (challan) => (

                  <tr
                    key={
                      challan.id
                    }
                  >

                    <td>

                      <strong>
                        {
                          challan.challan_number
                        }
                      </strong>

                    </td>


                    <td>
                      {
                        getCustomerName(
                          challan.customer_id
                        )
                      }
                    </td>


                    <td>
                      {
                        challan.total_quantity
                      }
                    </td>


                    <td>

                      <span className="status-badge">
                        {
                          challan.status
                        }
                      </span>

                    </td>


                    <td>
                      {
                        formatDate(
                          challan.created_at
                        )
                      }
                    </td>


                    <td>

                      <button
                        className="action-button"
                        onClick={() =>
                          handleViewChallan(
                            challan.id
                          )
                        }
                      >
                        View
                      </button>


                      {challan.status ===
                        "DRAFT" && (

                        <button
                          className="action-button"
                          onClick={() =>
                            handleConfirmChallan(
                              challan.id
                            )
                          }
                          disabled={
                            saving
                          }
                        >
                          Confirm
                        </button>

                      )}


                      <button
                        className="action-button"
                        onClick={() =>
                          handleDeleteChallan(
                            challan.id
                          )
                        }
                        disabled={
                          saving
                        }
                      >
                        Delete
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
          CREATE CHALLAN MODAL
      ====================================== */}

      {showForm && (

        <div className="modal-overlay">

          <div className="customer-modal">

            <div className="modal-header">

              <div>

                <h2>
                  Create Challan
                </h2>

                <p>
                  Add customer and
                  products
                </p>

              </div>


              <button
                className="close-button"
                onClick={
                  resetForm
                }
                disabled={
                  saving
                }
              >
                ×
              </button>

            </div>


            <div className="form-grid">

              {/* CUSTOMER */}

              <div className="form-group full-width">

                <label>
                  Customer *
                </label>

                <select
                  value={
                    selectedCustomer
                  }
                  onChange={(e) =>
                    setSelectedCustomer(
                      e.target.value
                    )
                  }
                >

                  <option value="">
                    Select customer
                  </option>

                  {customers.map(
                    (customer) => (

                      <option
                        key={
                          customer.id
                        }
                        value={
                          customer.id
                        }
                      >
                        {
                          customer.customer_name
                        }

                        {customer.business_name
                          ? ` - ${customer.business_name}`
                          : ""}
                      </option>

                    )
                  )}

                </select>

              </div>


              {/* PRODUCT */}

              <div className="form-group">

                <label>
                  Product *
                </label>

                <select
                  value={
                    selectedProduct
                  }
                  onChange={(e) =>
                    setSelectedProduct(
                      e.target.value
                    )
                  }
                >

                  <option value="">
                    Select product
                  </option>

                  {products.map(
                    (product) => (

                      <option
                        key={
                          product.id
                        }
                        value={
                          product.id
                        }
                      >
                        {
                          product.product_name
                        }{" "}
                        ({product.sku})
                      </option>

                    )
                  )}

                </select>

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


              {/* AVAILABLE STOCK */}

              {selectedProduct && (
                <div className="form-group full-width">

                  <small>

                    Available stock:{" "}

                    <strong>
                      {
                        getProduct(
                          selectedProduct
                        )?.current_stock ??
                        0
                      }
                    </strong>

                  </small>

                </div>
              )}


              {/* ADD ITEM */}

              <div className="form-group full-width">

                <button
                  type="button"
                  className="secondary-button"
                  onClick={
                    handleAddItem
                  }
                >
                  + Add Product
                </button>

              </div>

            </div>


            {/* ITEMS */}

            {items.length > 0 && (

              <div
                style={{
                  marginTop:
                    "20px"
                }}
              >

                <h3>
                  Challan Items
                </h3>


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
                        Quantity
                      </th>

                      <th>
                        Action
                      </th>

                    </tr>

                  </thead>


                  <tbody>

                    {items.map(
                      (item) => {

                        const product =
                          getProduct(
                            item.productId
                          );

                        return (

                          <tr
                            key={
                              item.productId
                            }
                          >

                            <td>
                              {
                                product?.product_name
                              }
                            </td>

                            <td>
                              {
                                product?.sku
                              }
                            </td>

                            <td>
                              {
                                item.quantity
                              }
                            </td>

                            <td>

                              <button
                                className="action-button"
                                onClick={() =>
                                  handleRemoveItem(
                                    item.productId
                                  )
                                }
                              >
                                Remove
                              </button>

                            </td>

                          </tr>

                        );
                      }
                    )}

                  </tbody>

                </table>


                <div
                  style={{
                    marginTop:
                      "15px"
                  }}
                >

                  <strong>
                    Total Quantity:{" "}
                    {items.reduce(
                      (
                        total,
                        item
                      ) =>
                        total +
                        item.quantity,
                      0
                    )}
                  </strong>

                </div>

              </div>

            )}


            {/* FORM ERROR */}

            {error && showForm && (
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
                  resetForm
                }
                disabled={
                  saving
                }
              >
                Cancel
              </button>


              <button
                type="button"
                className="primary-button"
                onClick={
                  handleCreateChallan
                }
                disabled={
                  saving
                }
              >
                {saving
                  ? "Creating..."
                  : "Create Challan"}
              </button>

            </div>

          </div>

        </div>
      )}


      {/* =====================================
          CHALLAN DETAILS MODAL
      ====================================== */}

      {showDetails &&
        selectedChallan && (

          <div className="modal-overlay">

            <div className="customer-modal">

              <div className="modal-header">

                <div>

                  <h2>
                    {
                      selectedChallan.challan_number
                    }
                  </h2>

                  <p>
                    {
                      getCustomerName(
                        selectedChallan.customer_id
                      )
                    }
                  </p>

                </div>


                <button
                  className="close-button"
                  onClick={() =>
                    setShowDetails(
                      false
                    )
                  }
                >
                  ×
                </button>

              </div>


              <div className="form-grid">

                <div className="detail-item">

                  <label>
                    Status
                  </label>

                  <span className="status-badge">
                    {
                      selectedChallan.status
                    }
                  </span>

                </div>


                <div className="detail-item">

                  <label>
                    Total Quantity
                  </label>

                  <strong>
                    {
                      selectedChallan.total_quantity
                    }
                  </strong>

                </div>

              </div>


              <div
                style={{
                  marginTop:
                    "25px"
                }}
              >

                <h3>
                  Products
                </h3>


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
                        Price
                      </th>

                      <th>
                        Quantity
                      </th>

                    </tr>

                  </thead>


                  <tbody>

                    {selectedChallan.items.map(
                      (item) => (

                        <tr
                          key={
                            item.id
                          }
                        >

                          <td>
                            {
                              item.product_name
                            }
                          </td>

                          <td>
                            {
                              item.sku
                            }
                          </td>

                          <td>
                            ₹
                            {
                              Number(
                                item.unit_price
                              ).toFixed(
                                2
                              )
                            }
                          </td>

                          <td>
                            {
                              item.quantity
                            }
                          </td>

                        </tr>

                      )
                    )}

                  </tbody>

                </table>

              </div>


              <div className="modal-actions">

                <button
                  className="secondary-button"
                  onClick={() =>
                    setShowDetails(
                      false
                    )
                  }
                >
                  Close
                </button>


                {selectedChallan.status ===
                  "DRAFT" && (

                  <button
                    className="primary-button"
                    onClick={() =>
                      handleConfirmChallan(
                        selectedChallan.id
                      )
                    }
                    disabled={
                      saving
                    }
                  >
                    {saving
                      ? "Confirming..."
                      : "Confirm Challan"}
                  </button>

                )}

              </div>

            </div>

          </div>

        )}

    </div>
  );
}

export default Challans;