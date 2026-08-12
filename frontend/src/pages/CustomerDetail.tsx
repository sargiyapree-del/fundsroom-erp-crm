import { useEffect, useState } from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";

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

interface FollowUp {
  id: string;
  customer_id: string;
  follow_up_date: string;
  notes?: string;
  created_by: string;
}

function CustomerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [customer, setCustomer] =
    useState<Customer | null>(null);

  const [followUps, setFollowUps] =
    useState<FollowUp[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [followUpsLoading, setFollowUpsLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [followUpsError, setFollowUpsError] =
    useState("");

  // ========================================
  // FETCH CUSTOMER
  // ========================================

  async function fetchCustomer() {
    try {
      setLoading(true);
      setError("");

      const token =
        localStorage.getItem("token");

      if (!id) {
        setError(
          "Customer ID is missing"
        );
        return;
      }

      const response = await fetch(
        `http://localhost:5000/api/customers/${id}`,
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
            "Failed to fetch customer"
        );
        return;
      }

      setCustomer(
        data.customer
      );
    } catch (error) {
      console.error(
        "Failed to fetch customer:",
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
  // FETCH FOLLOW-UPS
  // ========================================

  async function fetchFollowUps() {
    try {
      setFollowUpsLoading(true);
      setFollowUpsError("");

      const token =
        localStorage.getItem("token");

      if (!id) {
        setFollowUpsError(
          "Customer ID is missing"
        );
        return;
      }

      const response = await fetch(
        `http://localhost:5000/api/customers/${id}/followups`,
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
        setFollowUpsError(
          data.message ||
            "Failed to fetch follow-ups"
        );
        return;
      }

      setFollowUps(
        data.followUps || []
      );
    } catch (error) {
      console.error(
        "Failed to fetch follow-ups:",
        error
      );

      setFollowUpsError(
        "Unable to connect to server"
      );
    } finally {
      setFollowUpsLoading(false);
    }
  }

  // ========================================
  // LOAD DATA
  // ========================================

  useEffect(() => {
    if (id) {
      fetchCustomer();
      fetchFollowUps();
    } else {
      setLoading(false);
      setError(
        "Customer ID is missing"
      );
    }
  }, [id]);

  // ========================================
  // FORMAT DATE
  // ========================================

  function formatDate(
    date?: string
  ) {
    if (!date) {
      return "-";
    }

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

  // ========================================
  // UI
  // ========================================

  return (
    <div className="page-container">

      {/* ==================================
          HEADER
      ================================== */}

      <div className="page-header">

        <div>

          <h1>
            Customer Details
          </h1>

          <p>
            View customer information
          </p>

        </div>

        <button
          className="secondary-button"
          onClick={() =>
            navigate("/customers")
          }
        >
          ← Back to Customers
        </button>

      </div>


      {/* ==================================
          CUSTOMER INFORMATION
      ================================== */}

      <div className="customers-card">

        {loading && (
          <div className="empty-state">

            <h3>
              Loading customer...
            </h3>

            <p>
              Please wait while we
              fetch customer information.
            </p>

          </div>
        )}


        {!loading &&
          error && (
            <div className="empty-state">

              <h3>
                Unable to load customer
              </h3>

              <p>
                {error}
              </p>

              <button
                className="primary-button"
                onClick={
                  fetchCustomer
                }
              >
                Try Again
              </button>

            </div>
          )}


        {!loading &&
          !error &&
          !customer && (
            <div className="empty-state">

              <h3>
                Customer not found
              </h3>

              <p>
                The requested customer
                does not exist.
              </p>

            </div>
          )}


        {!loading &&
          !error &&
          customer && (
            <div>

              <h2>
                Customer Information
              </h2>

              <div className="customer-details">

                {/* NAME */}

                <div className="detail-item">

                  <label>
                    Customer Name
                  </label>

                  <strong>
                    {customer.customer_name}
                  </strong>

                </div>


                {/* MOBILE */}

                <div className="detail-item">

                  <label>
                    Mobile
                  </label>

                  <span>
                    {customer.mobile}
                  </span>

                </div>


                {/* EMAIL */}

                <div className="detail-item">

                  <label>
                    Email
                  </label>

                  <span>
                    {customer.email ||
                      "-"}
                  </span>

                </div>


                {/* BUSINESS */}

                <div className="detail-item">

                  <label>
                    Business Name
                  </label>

                  <span>
                    {customer.business_name ||
                      "-"}
                  </span>

                </div>


                {/* GST */}

                <div className="detail-item">

                  <label>
                    GST Number
                  </label>

                  <span>
                    {customer.gst_number ||
                      "-"}
                  </span>

                </div>


                {/* TYPE */}

                <div className="detail-item">

                  <label>
                    Customer Type
                  </label>

                  <span>
                    {customer.customer_type}
                  </span>

                </div>


                {/* STATUS */}

                <div className="detail-item">

                  <label>
                    Status
                  </label>

                  <span className="status-badge">
                    {customer.status}
                  </span>

                </div>


                {/* FOLLOW-UP DATE */}

                <div className="detail-item">

                  <label>
                    Follow-up Date
                  </label>

                  <span>
                    {formatDate(
                      customer.follow_up_date
                    )}
                  </span>

                </div>


                {/* ADDRESS */}

                <div className="detail-item full-width">

                  <label>
                    Address
                  </label>

                  <span>
                    {customer.address}
                  </span>

                </div>


                {/* NOTES */}

                <div className="detail-item full-width">

                  <label>
                    Notes
                  </label>

                  <span>
                    {customer.notes ||
                      "-"}
                  </span>

                </div>

              </div>

            </div>
          )}

      </div>


      {/* ==================================
          FOLLOW-UP HISTORY
      ================================== */}

      {!loading &&
        customer && (
          <div className="customers-card">

            <div className="panel-header">

              <div>

                <h2>
                  Follow-up History
                </h2>

                <p>
                  Previous customer
                  follow-ups
                </p>

              </div>

              <button
                className="secondary-button"
                onClick={
                  fetchFollowUps
                }
                disabled={
                  followUpsLoading
                }
              >
                {followUpsLoading
                  ? "Refreshing..."
                  : "Refresh"}
              </button>

            </div>


            {/* FOLLOW-UP ERROR */}

            {followUpsError && (
              <div className="error-message">
                {followUpsError}
              </div>
            )}


            {/* LOADING */}

            {followUpsLoading &&
              followUps.length === 0 && (
                <div className="empty-state">

                  <h3>
                    Loading follow-ups...
                  </h3>

                </div>
              )}


            {/* EMPTY */}

            {!followUpsLoading &&
              !followUpsError &&
              followUps.length === 0 && (
                <div className="empty-state">

                  <h3>
                    No follow-ups yet
                  </h3>

                  <p>
                    Follow-ups created
                    for this customer
                    will appear here.
                  </p>

                </div>
              )}


            {/* FOLLOW-UP TABLE */}

            {followUps.length > 0 && (
              <table>

                <thead>

                  <tr>

                    <th>
                      Follow-up Date
                    </th>

                    <th>
                      Notes
                    </th>

                    <th>
                      Created By
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {followUps.map(
                    (followUp) => (

                      <tr
                        key={
                          followUp.id
                        }
                      >

                        <td>
                          {formatDate(
                            followUp.follow_up_date
                          )}
                        </td>

                        <td>
                          {followUp.notes ||
                            "-"}
                        </td>

                        <td>
                          {followUp.created_by}
                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>
            )}

          </div>
        )}

    </div>
  );
}

export default CustomerDetail;