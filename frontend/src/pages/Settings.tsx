import { useEffect, useState } from "react";

interface User {
  userId?: string;
  id?: string;
  email?: string;
  role?: string;
  name?: string;
}

function Settings() {
  const [user, setUser] =
    useState<User | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  async function fetchCurrentUser() {
    try {
      setLoading(true);
      setError("");

      const token =
        localStorage.getItem("token");

      if (!token) {
        setError(
          "Authentication token not found"
        );
        return;
      }

      const response = await fetch(
        "http://localhost:5000/api/auth/me",
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
            "Failed to fetch user"
        );
        return;
      }

      setUser(data.user);
    } catch (error) {
      console.error(
        "Fetch current user error:",
        error
      );

      setError(
        "Unable to connect to server"
      );
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.location.reload();
  }

  return (
    <div className="page-container">

      {/* =========================
          HEADER
      ========================= */}

      <div className="page-header">

        <div>
          <h1>
            Settings
          </h1>

          <p>
            Manage your account
            and session
          </p>
        </div>

      </div>


      {/* =========================
          ACCOUNT INFORMATION
      ========================= */}

      <div className="customers-card">

        <div className="panel-header">

          <div>
            <h2>
              Account Information
            </h2>

            <p>
              Information about your
              logged-in account
            </p>
          </div>

        </div>


        {/* LOADING */}

        {loading && (
          <div className="empty-state">
            Loading account
            information...
          </div>
        )}


        {/* ERROR */}

        {!loading && error && (
          <div className="empty-state">

            <h3>
              Unable to load account
            </h3>

            <p>
              {error}
            </p>

            <button
              className="primary-button"
              onClick={
                fetchCurrentUser
              }
            >
              Try Again
            </button>

          </div>
        )}


        {/* USER DATA */}

        {!loading &&
          !error &&
          user && (

            <div className="customer-details">

              {/* USER ID */}

              <div className="detail-item">

                <label>
                  User ID
                </label>

                <strong>
                  {user.userId ||
                    user.id ||
                    "-"}
                </strong>

              </div>


              {/* EMAIL */}

              <div className="detail-item">

                <label>
                  Email
                </label>

                <span>
                  {user.email || "-"}
                </span>

              </div>


              {/* ROLE */}

              <div className="detail-item">

                <label>
                  Role
                </label>

                <span className="status-badge">
                  {user.role ||
                    "ADMIN"}
                </span>

              </div>


              {/* NAME */}

              <div className="detail-item">

                <label>
                  Name
                </label>

                <span>
                  {user.name ||
                    "Admin"}
                </span>

              </div>

            </div>

          )}

      </div>


      {/* =========================
          SESSION
      ========================= */}

      <div className="customers-card">

        <div className="panel-header">

          <div>
            <h2>
              Session
            </h2>

            <p>
              Manage your current
              login session
            </p>
          </div>

        </div>


        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            alignItems: "center",
            gap: "20px",
            paddingTop: "20px",
          }}
        >

          <div>

            <strong>
              Current Session
            </strong>

            <p className="muted">
              You are currently
              logged in as Admin.
            </p>

          </div>


          <button
            className="secondary-button"
            onClick={
              handleLogout
            }
          >
            Logout
          </button>

        </div>

      </div>

    </div>
  );
}

export default Settings;