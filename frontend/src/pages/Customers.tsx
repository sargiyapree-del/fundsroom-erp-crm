import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type {
  ChangeEvent,
  FormEvent,
} from "react";

interface Customer {
  id: string;
  customer_name: string;
  mobile: string;
  email?: string;
  business_name?: string;
  gst_number?: string;
  customer_type:
    | "RETAIL"
    | "WHOLESALE"
    | "DISTRIBUTOR";
  address: string;
  status:
    | "LEAD"
    | "ACTIVE"
    | "INACTIVE";
  follow_up_date?: string;
  notes?: string;
}

interface CustomerForm {
  customerName: string;
  mobile: string;
  email: string;
  businessName: string;
  gstNumber: string;
  customerType:
    | "RETAIL"
    | "WHOLESALE"
    | "DISTRIBUTOR";
  address: string;
  status:
    | "LEAD"
    | "ACTIVE"
    | "INACTIVE";
  followUpDate: string;
  notes: string;
}

const initialForm: CustomerForm = {
  customerName: "",
  mobile: "",
  email: "",
  businessName: "",
  gstNumber: "",
  customerType: "RETAIL",
  address: "",
  status: "LEAD",
  followUpDate: "",
  notes: "",
};

function Customers() {
  const navigate = useNavigate();

  // ========================================
  // CUSTOMER DATA
  // ========================================

  const [customers, setCustomers] =
    useState<Customer[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [search, setSearch] =
    useState("");

  // ========================================
  // PAGINATION
  // ========================================

  const [page, setPage] =
    useState(1);

  const [limit] = useState(10);

  const [total, setTotal] =
    useState(0);

  const [totalPages, setTotalPages] =
    useState(1);

  // ========================================
  // ADD / EDIT
  // ========================================

  const [showForm, setShowForm] =
    useState(false);

  const [editingCustomer, setEditingCustomer] =
    useState<Customer | null>(null);

  // ========================================
  // DELETE
  // ========================================

  const [deleting, setDeleting] =
    useState(false);

  // ========================================
  // FORM
  // ========================================

  const [form, setForm] =
    useState<CustomerForm>(initialForm);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  // ========================================
  // LOAD CUSTOMERS
  // ========================================

  useEffect(() => {
    fetchCustomers();
  }, [page]);

  // ========================================
  // FETCH CUSTOMERS
  // ========================================

  async function fetchCustomers(
    requestedPage: number = page,
    requestedSearch: string = search
  ) {
    try {
      setLoading(true);
      setError("");

      const token =
        localStorage.getItem("token");

      const url =
        `http://localhost:5000/api/customers` +
        `?search=${encodeURIComponent(
          requestedSearch
        )}` +
        `&page=${requestedPage}` +
        `&limit=${limit}`;

      const response = await fetch(
        url,
        {
          method: "GET",
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
            "Failed to fetch customers"
        );
        return;
      }

      setCustomers(
        data.customers || []
      );

      setTotal(
        data.pagination?.total || 0
      );

      setTotalPages(
        data.pagination?.totalPages || 1
      );
    } catch (error) {
      console.error(
        "Failed to fetch customers:",
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
  // SEARCH
  // ========================================

  function handleSearch() {
    if (page === 1) {
      fetchCustomers(1, search);
    } else {
      setPage(1);
    }
  }

  // ========================================
  // FORM INPUT
  // ========================================

  function handleInputChange(
    e: ChangeEvent<
      HTMLInputElement |
        HTMLTextAreaElement |
        HTMLSelectElement
    >
  ) {
    const {
      name,
      value,
    } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  // ========================================
  // OPEN ADD CUSTOMER
  // ========================================

  function openAddCustomer() {
    setEditingCustomer(null);
    setForm(initialForm);
    setError("");
    setShowForm(true);
  }

  // ========================================
  // OPEN EDIT CUSTOMER
  // ========================================

  function openEditCustomer(
    customer: Customer
  ) {
    setEditingCustomer(customer);

    setForm({
      customerName:
        customer.customer_name || "",

      mobile:
        customer.mobile || "",

      email:
        customer.email || "",

      businessName:
        customer.business_name || "",

      gstNumber:
        customer.gst_number || "",

      customerType:
        customer.customer_type ||
        "RETAIL",

      address:
        customer.address || "",

      status:
        customer.status || "LEAD",

      followUpDate:
        customer.follow_up_date
          ? customer.follow_up_date.substring(
              0,
              10
            )
          : "",

      notes:
        customer.notes || "",
    });

    setError("");
    setShowForm(true);
  }

  // ========================================
  // CLOSE ADD / EDIT MODAL
  // ========================================

  function closeForm() {
    if (saving) {
      return;
    }

    setShowForm(false);
    setEditingCustomer(null);
    setForm(initialForm);
    setError("");
  }

  // ========================================
  // CREATE / UPDATE CUSTOMER
  // ========================================

  async function handleSubmit(
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setError("");

    if (!form.customerName.trim()) {
      setError(
        "Customer name is required"
      );
      return;
    }

    if (!form.mobile.trim()) {
      setError(
        "Mobile number is required"
      );
      return;
    }

    if (!form.address.trim()) {
      setError(
        "Address is required"
      );
      return;
    }

    try {
      setSaving(true);

      const token =
        localStorage.getItem("token");

      const isEditing =
        !!editingCustomer;

      const url = isEditing
        ? `http://localhost:5000/api/customers/${editingCustomer.id}`
        : "http://localhost:5000/api/customers";

      const method = isEditing
        ? "PUT"
        : "POST";

      const response = await fetch(
        url,
        {
          method,

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`,
          },

          body: JSON.stringify({
            customerName:
              form.customerName,

            mobile:
              form.mobile,

            email:
              form.email || undefined,

            businessName:
              form.businessName ||
              undefined,

            gstNumber:
              form.gstNumber ||
              undefined,

            customerType:
              form.customerType,

            address:
              form.address,

            status:
              form.status,

            followUpDate:
              form.followUpDate ||
              undefined,

            notes:
              form.notes ||
              undefined,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            `Failed to ${
              isEditing
                ? "update"
                : "create"
            } customer`
        );
        return;
      }

      setShowForm(false);
      setEditingCustomer(null);
      setForm(initialForm);

      await fetchCustomers(
        page,
        search
      );
    } catch (error) {
      console.error(
        isEditing
          ? "Update customer error:"
          : "Create customer error:",
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
  // VIEW CUSTOMER
  // ========================================

  function handleViewCustomer(
    customer: Customer
  ) {
    navigate(
      `/customers/${customer.id}`
    );
  }

  // ========================================
  // DELETE CUSTOMER
  // ========================================

  async function handleDeleteCustomer(
    customer: Customer
  ) {
    const confirmed =
      window.confirm(
        `Are you sure you want to delete ${customer.customer_name}?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setDeleting(true);
      setError("");

      const token =
        localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:5000/api/customers/${customer.id}`,
        {
          method: "DELETE",

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
            "Failed to delete customer"
        );
        return;
      }

      /*
       * If the current page becomes empty
       * after deleting the last customer,
       * move to the previous page.
       */
      if (
        customers.length === 1 &&
        page > 1
      ) {
        setPage(
          (previous) =>
            previous - 1
        );
      } else {
        await fetchCustomers(
          page,
          search
        );
      }
    } catch (error) {
      console.error(
        "Delete customer error:",
        error
      );

      setError(
        "Unable to connect to server"
      );
    } finally {
      setDeleting(false);
    }
  }

  // ========================================
  // PAGINATION
  // ========================================

  function handlePreviousPage() {
    if (page > 1) {
      setPage(
        (previous) =>
          previous - 1
      );
    }
  }

  function handleNextPage() {
    if (page < totalPages) {
      setPage(
        (previous) =>
          previous + 1
      );
    }
  }

  // ========================================
  // UI
  // ========================================

  return (
    <div className="page-container">

      {/* =====================================
          HEADER
      ====================================== */}

      <div className="page-header">

        <div>
          <h1>
            Customers
          </h1>

          <p>
            Manage your customers
            and follow-ups
          </p>
        </div>

        <button
          className="primary-button"
          onClick={
            openAddCustomer
          }
        >
          + Add Customer
        </button>

      </div>


      {/* =====================================
          SEARCH
      ====================================== */}

      <div className="search-section">

        <input
          type="text"
          placeholder="Search customers..."
          value={search}

          onChange={(e) => {
            setSearch(
              e.target.value
            );
          }}

          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSearch();
            }
          }}
        />

        <button
          onClick={
            handleSearch
          }
        >
          Search
        </button>

      </div>


      {/* =====================================
          CUSTOMER COUNT
      ====================================== */}

      {!loading &&
        !error &&
        total > 0 && (
          <p
            className="muted"
            style={{
              margin:
                "12px 0",
            }}
          >
            Showing{" "}
            {customers.length}{" "}
            of{" "}
            {total} customers
          </p>
        )}


      {/* =====================================
          ERROR
      ====================================== */}

      {error &&
        !showForm && (
          <div className="error-message">
            {error}
          </div>
        )}


      {/* =====================================
          CUSTOMER TABLE
      ====================================== */}

      <div className="customers-card">

        {loading ? (
          <div className="empty-state">

            <h3>
              Loading customers...
            </h3>

          </div>

        ) : customers.length === 0 ? (

          <div className="empty-state">

            <h3>
              No customers found
            </h3>

            <p>
              {search
                ? "Try a different search."
                : "Add your first customer to get started."}
            </p>

          </div>

        ) : (

          <table>

            <thead>

              <tr>

                <th>
                  Customer
                </th>

                <th>
                  Mobile
                </th>

                <th>
                  Business
                </th>

                <th>
                  Type
                </th>

                <th>
                  Status
                </th>

                <th>
                  Actions
                </th>

              </tr>

            </thead>


            <tbody>

              {customers.map(
                (customer) => (

                  <tr
                    key={
                      customer.id
                    }
                  >

                    <td>

                      <strong>
                        {
                          customer.customer_name
                        }
                      </strong>

                    </td>


                    <td>
                      {
                        customer.mobile
                      }
                    </td>


                    <td>
                      {
                        customer.business_name ||
                        "-"
                      }
                    </td>


                    <td>
                      {
                        customer.customer_type
                      }
                    </td>


                    <td>

                      <span className="status-badge">
                        {
                          customer.status
                        }
                      </span>

                    </td>


                    <td>

                      {/* VIEW */}

                      <button
                        className="action-button"
                        onClick={() =>
                          handleViewCustomer(
                            customer
                          )
                        }
                      >
                        View
                      </button>


                      {/* EDIT */}

                      <button
                        className="action-button"
                        onClick={() =>
                          openEditCustomer(
                            customer
                          )
                        }
                      >
                        Edit
                      </button>


                      {/* DELETE */}

                      <button
                        className="action-button delete-button"
                        onClick={() =>
                          handleDeleteCustomer(
                            customer
                          )
                        }
                        disabled={
                          deleting
                        }
                      >
                        {deleting
                          ? "Deleting..."
                          : "Delete"}
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
          PAGINATION
      ====================================== */}

      {!loading &&
        totalPages > 1 && (

          <div
            className="pagination"
            style={{
              display:
                "flex",
              justifyContent:
                "center",
              alignItems:
                "center",
              gap: "16px",
              marginTop:
                "20px",
              marginBottom:
                "20px",
            }}
          >

            <button
              className="secondary-button"
              disabled={
                page === 1
              }
              onClick={
                handlePreviousPage
              }
            >
              ← Previous
            </button>


            <span>
              Page{" "}
              <strong>
                {page}
              </strong>{" "}
              of{" "}
              <strong>
                {totalPages}
              </strong>
            </span>


            <button
              className="secondary-button"
              disabled={
                page ===
                totalPages
              }
              onClick={
                handleNextPage
              }
            >
              Next →
            </button>

          </div>

        )}


      {/* =====================================
          ADD / EDIT CUSTOMER MODAL
      ====================================== */}

      {showForm && (

        <div className="modal-overlay">

          <div className="customer-modal">

            {/* MODAL HEADER */}

            <div className="modal-header">

              <div>

                <h2>
                  {editingCustomer
                    ? "Edit Customer"
                    : "Add Customer"}
                </h2>

                <p>
                  {editingCustomer
                    ? "Update customer information"
                    : "Enter customer information"}
                </p>

              </div>


              <button
                className="close-button"
                onClick={
                  closeForm
                }
                disabled={
                  saving
                }
              >
                ×
              </button>

            </div>


            {/* FORM */}

            <form
              onSubmit={
                handleSubmit
              }
            >

              <div className="form-grid">

                {/* CUSTOMER NAME */}

                <div className="form-group">

                  <label>
                    Customer Name *
                  </label>

                  <input
                    type="text"
                    name="customerName"
                    value={
                      form.customerName
                    }
                    onChange={
                      handleInputChange
                    }
                    placeholder="Enter customer name"
                  />

                </div>


                {/* MOBILE */}

                <div className="form-group">

                  <label>
                    Mobile *
                  </label>

                  <input
                    type="text"
                    name="mobile"
                    value={
                      form.mobile
                    }
                    onChange={
                      handleInputChange
                    }
                    placeholder="Enter mobile number"
                  />

                </div>


                {/* EMAIL */}

                <div className="form-group">

                  <label>
                    Email
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={
                      form.email
                    }
                    onChange={
                      handleInputChange
                    }
                    placeholder="Enter email"
                  />

                </div>


                {/* BUSINESS */}

                <div className="form-group">

                  <label>
                    Business Name
                  </label>

                  <input
                    type="text"
                    name="businessName"
                    value={
                      form.businessName
                    }
                    onChange={
                      handleInputChange
                    }
                    placeholder="Enter business name"
                  />

                </div>


                {/* GST */}

                <div className="form-group">

                  <label>
                    GST Number
                  </label>

                  <input
                    type="text"
                    name="gstNumber"
                    value={
                      form.gstNumber
                    }
                    onChange={
                      handleInputChange
                    }
                    placeholder="Enter GST number"
                  />

                </div>


                {/* CUSTOMER TYPE */}

                <div className="form-group">

                  <label>
                    Customer Type *
                  </label>

                  <select
                    name="customerType"
                    value={
                      form.customerType
                    }
                    onChange={
                      handleInputChange
                    }
                  >

                    <option value="RETAIL">
                      Retail
                    </option>

                    <option value="WHOLESALE">
                      Wholesale
                    </option>

                    <option value="DISTRIBUTOR">
                      Distributor
                    </option>

                  </select>

                </div>


                {/* STATUS */}

                <div className="form-group">

                  <label>
                    Status
                  </label>

                  <select
                    name="status"
                    value={
                      form.status
                    }
                    onChange={
                      handleInputChange
                    }
                  >

                    <option value="LEAD">
                      Lead
                    </option>

                    <option value="ACTIVE">
                      Active
                    </option>

                    <option value="INACTIVE">
                      Inactive
                    </option>

                  </select>

                </div>


                {/* FOLLOW-UP */}

                <div className="form-group">

                  <label>
                    Follow-up Date
                  </label>

                  <input
                    type="date"
                    name="followUpDate"
                    value={
                      form.followUpDate
                    }
                    onChange={
                      handleInputChange
                    }
                  />

                </div>


                {/* ADDRESS */}

                <div className="form-group full-width">

                  <label>
                    Address *
                  </label>

                  <textarea
                    name="address"
                    value={
                      form.address
                    }
                    onChange={
                      handleInputChange
                    }
                    placeholder="Enter customer address"
                    rows={3}
                  />

                </div>


                {/* NOTES */}

                <div className="form-group full-width">

                  <label>
                    Notes
                  </label>

                  <textarea
                    name="notes"
                    value={
                      form.notes
                    }
                    onChange={
                      handleInputChange
                    }
                    placeholder="Additional notes"
                    rows={3}
                  />

                </div>

              </div>


              {/* FORM ERROR */}

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
                    closeForm
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
                    : editingCustomer
                    ? "Update Customer"
                    : "Create Customer"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}

export default Customers;