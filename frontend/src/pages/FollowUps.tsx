import { useEffect, useState } from "react";

interface Customer {
  id: string;
  customer_name: string;
  mobile: string;
  business_name?: string;
}

interface FollowUp {
  id: string;
  customer_id: string;
  follow_up_date: string;
  notes?: string;
  created_by: string;
  customer_name?: string;
}

function FollowUps() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);

  const [showForm, setShowForm] = useState(false);

  const [selectedCustomer, setSelectedCustomer] =
    useState("");

  const [followUpDate, setFollowUpDate] =
    useState("");

  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(false);

  // ========================================
  // LOAD CUSTOMERS WHEN PAGE OPENS
  // ========================================

  useEffect(() => {
    fetchCustomers();
  }, []);

  // ========================================
  // LOAD FOLLOW-UPS AFTER CUSTOMERS LOAD
  // ========================================

  useEffect(() => {
    if (customers.length > 0) {
      fetchFollowUps();
    }
  }, [customers]);

  // ========================================
  // FETCH CUSTOMERS
  // ========================================

  async function fetchCustomers() {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        "http://localhost:5000/api/customers",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error(data.message);
        return;
      }

      setCustomers(data.customers || []);
    } catch (error) {
      console.error(
        "Failed to fetch customers:",
        error
      );
    }
  }

  // ========================================
  // FETCH FOLLOW-UPS
  // ========================================

  async function fetchFollowUps() {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const allFollowUps: FollowUp[] = [];

      for (const customer of customers) {
        const response = await fetch(
          `http://localhost:5000/api/customers/${customer.id}/followups`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          console.error(
            `Failed to fetch follow-ups for ${customer.customer_name}:`,
            data.message
          );

          continue;
        }

        allFollowUps.push(
          ...(data.followUps || []).map(
            (followUp: FollowUp) => ({
              ...followUp,
              customer_name:
                customer.customer_name,
            })
          )
        );
      }

      setFollowUps(allFollowUps);
    } catch (error) {
      console.error(
        "Failed to fetch follow-ups:",
        error
      );
    } finally {
      setLoading(false);
    }
  }

  // ========================================
  // CREATE FOLLOW-UP
  // ========================================

  async function handleCreateFollowUp() {
    if (!selectedCustomer) {
      alert("Please select a customer");
      return;
    }

    if (!followUpDate) {
      alert("Please select a follow-up date");
      return;
    }

    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:5000/api/customers/${selectedCustomer}/followups`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            followUpDate,
            notes,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.message ||
            "Failed to create follow-up"
        );

        return;
      }

      alert("Follow-up created successfully");

      setSelectedCustomer("");
      setFollowUpDate("");
      setNotes("");

      setShowForm(false);

      // Refresh follow-ups
      await fetchFollowUps();
    } catch (error) {
      console.error(
        "Create follow-up error:",
        error
      );

      alert("Unable to connect to server");
    } finally {
      setLoading(false);
    }
  }

  // ========================================
  // UI
  // ========================================

  return (
    <div className="page-container">

      {/* PAGE HEADER */}

      <div className="page-header">

        <div>
          <h1>Follow-ups</h1>

          <p>
            Manage customer follow-ups and reminders
          </p>
        </div>

        <button
          className="primary-button"
          onClick={() => setShowForm(true)}
        >
          + Add Follow-up
        </button>

      </div>


      {/* =====================================
          ADD FOLLOW-UP MODAL
      ====================================== */}

      {showForm && (
        <div className="modal-overlay">

          <div className="customer-modal">

            <div className="modal-header">

              <div>
                <h2>Add Follow-up</h2>

                <p>
                  Schedule a follow-up for a customer
                </p>
              </div>

              <button
                className="close-button"
                onClick={() =>
                  setShowForm(false)
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
                  value={selectedCustomer}
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
                        key={customer.id}
                        value={customer.id}
                      >
                        {customer.customer_name}

                        {customer.business_name
                          ? ` - ${customer.business_name}`
                          : ""}
                      </option>
                    )
                  )}

                </select>

              </div>


              {/* DATE */}

              <div className="form-group">

                <label>
                  Follow-up Date *
                </label>

                <input
                  type="date"
                  value={followUpDate}
                  onChange={(e) =>
                    setFollowUpDate(
                      e.target.value
                    )
                  }
                />

              </div>


              {/* NOTES */}

              <div className="form-group full-width">

                <label>
                  Notes
                </label>

                <textarea
                  value={notes}
                  onChange={(e) =>
                    setNotes(e.target.value)
                  }
                  placeholder="Enter follow-up notes..."
                  rows={4}
                />

              </div>

            </div>


            {/* ACTIONS */}

            <div className="modal-actions">

              <button
                type="button"
                className="secondary-button"
                onClick={() =>
                  setShowForm(false)
                }
                disabled={loading}
              >
                Cancel
              </button>

              <button
                type="button"
                className="primary-button"
                onClick={handleCreateFollowUp}
                disabled={loading}
              >
                {loading
                  ? "Creating..."
                  : "Create Follow-up"}
              </button>

            </div>

          </div>

        </div>
      )}


      {/* =====================================
          FOLLOW-UP LIST
      ====================================== */}

      <div className="customers-card">

        {loading && followUps.length === 0 ? (
          <div className="empty-state">
            Loading follow-ups...
          </div>
        ) : followUps.length === 0 ? (
          <div className="empty-state">

            <h3>
              No follow-ups yet
            </h3>

            <p>
              Create a follow-up for a customer
              to see it here.
            </p>

          </div>
        ) : (
          <table>

            <thead>

              <tr>
                <th>Customer</th>
                <th>Follow-up Date</th>
                <th>Notes</th>
              </tr>

            </thead>

            <tbody>

              {followUps.map(
                (followUp) => (
                  <tr key={followUp.id}>

                    <td>
                      <strong>
                        {followUp.customer_name ||
                          "Unknown Customer"}
                      </strong>
                    </td>

                    <td>
                      {new Date(
                        followUp.follow_up_date
                      ).toLocaleDateString(
                        "en-IN"
                      )}
                    </td>

                    <td>
                      {followUp.notes || "-"}
                    </td>

                  </tr>
                )
              )}

            </tbody>

          </table>
        )}

      </div>

    </div>
  );
}

export default FollowUps;