import { useEffect, useState } from "react";
import "./App.css";
import Settings from "./pages/Settings";
import Products from "./pages/Products";
import Customers from "./pages/Customers";
import FollowUps from "./pages/FollowUps";
import CustomerDetail from "./pages/CustomerDetail";
import Login from "./pages/Login";
import Inventory from "./pages/Inventory";
import Challans from "./pages/Challans";
import Dashboard from "./pages/Dashboard";

import {
  Routes,
  Route,
} from "react-router-dom";

function App() {
  // ========================================
  // AUTHENTICATION
  // ========================================

  const [isAuthenticated, setIsAuthenticated] =
    useState(
      !!localStorage.getItem("token")
    );

  // ========================================
  // ACTIVE PAGE
  // ========================================

  const [activePage, setActivePage] =
    useState("Dashboard");

  // ========================================
  // DASHBOARD QUICK-ACTION NAVIGATION
  // ========================================

  useEffect(() => {
    function handleNavigation(
      event: Event
    ) {
      const customEvent =
        event as CustomEvent<string>;

      if (customEvent.detail) {
        setActivePage(
          customEvent.detail
        );
      }
    }

    window.addEventListener(
      "navigate-to",
      handleNavigation
    );

    return () => {
      window.removeEventListener(
        "navigate-to",
        handleNavigation
      );
    };
  }, []);

  // ========================================
  // MAIN MENU
  // ========================================

  const menuItems = [
    {
      name: "Dashboard",
      icon: "▦",
    },
    {
      name: "Customers",
      icon: "◉",
    },
    {
      name: "Products",
      icon: "▣",
    },
    {
      name: "Inventory",
      icon: "◫",
    },
    {
      name: "Challans",
      icon: "▤",
    },
  ];

  // ========================================
  // MANAGEMENT MENU
  // ========================================

  const managementItems = [
    {
      name: "Follow-ups",
      icon: "◌",
    },
    {
      name: "Settings",
      icon: "⚙",
    },
  ];

  // ========================================
  // LOGIN
  // ========================================

 function handleLogin() {
  setIsAuthenticated(true);
  setActivePage("Dashboard");
}

  // ========================================
  // LOGOUT
  // ========================================

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setIsAuthenticated(false);
    setActivePage("Dashboard");
  }

  // ========================================
  // TEMPORARY PAGE
  // ========================================

  function renderTemporaryPage() {
    return (
      <main className="main">

        <header className="topbar">

          <div>
            <h1>
              {activePage}
            </h1>

            <p>
              Fundsroom management system
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

        <section className="panel">

          <div className="empty-state">

            <h3>
              {activePage} module
            </h3>

            <p>
              This section will be
              implemented next.
            </p>

          </div>

        </section>

      </main>
    );
  }

  // ========================================
  // CURRENT PAGE
  // ========================================

  function renderPage() {

    // DASHBOARD
    if (
      activePage ===
      "Dashboard"
    ) {
      return <Dashboard />;
    }

    // CUSTOMERS
    if (
      activePage ===
      "Customers"
    ) {
      return (
        <main className="main">
          <Customers />
        </main>
      );
    }

    // PRODUCTS
    if (
      activePage ===
      "Products"
    ) {
      return (
        <main className="main">
          <Products />
        </main>
      );
    }

    // INVENTORY
    if (
      activePage ===
      "Inventory"
    ) {
      return (
        <main className="main">
          <Inventory />
        </main>
      );
    }
    //setting
if (activePage === "Settings") {
  return (
    <main className="main">
      <Settings />
    </main>
  );
}
    // CHALLANS
    if (
      activePage ===
      "Challans"
    ) {
      return (
        <main className="main">
          <Challans />
        </main>
      );
    }

    // FOLLOW-UPS
    if (
      activePage ===
      "Follow-ups"
    ) {
      return (
        <main className="main">
          <FollowUps />
        </main>
      );
    }

    // SETTINGS / OTHER
    return renderTemporaryPage();
  }

  // ========================================
  // SIDEBAR
  // ========================================

  function renderSidebar() {
    return (
      <aside className="sidebar">

        {/* LOGO */}

        <div className="logo">

          <div className="logo-mark">
            F
          </div>

          <span>
            Fundsroom
          </span>

        </div>


        {/* NAVIGATION */}

        <nav className="nav">

          {/* MAIN */}

          <p className="nav-title">
            MAIN
          </p>

          {menuItems.map(
            (item) => (

              <button
                key={item.name}
                className={`nav-item ${
                  activePage ===
                  item.name
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  setActivePage(
                    item.name
                  )
                }
              >

                <span>
                  {item.icon}
                </span>

                {item.name}

              </button>

            )
          )}


          {/* MANAGEMENT */}

          <p className="nav-title">
            MANAGEMENT
          </p>

          {managementItems.map(
            (item) => (

              <button
                key={item.name}
                className={`nav-item ${
                  activePage ===
                  item.name
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  setActivePage(
                    item.name
                  )
                }
              >

                <span>
                  {item.icon}
                </span>

                {item.name}

              </button>

            )
          )}


          {/* LOGOUT */}

          <button
            className="nav-item logout-button"
            onClick={
              handleLogout
            }
          >

            <span>
              ↪
            </span>

            Logout

          </button>

        </nav>


        {/* SIDEBAR USER */}

       <div className="sidebar-user">
  <div className="avatar">
    {JSON.parse(localStorage.getItem("user") || "{}")
      ?.name?.charAt(0)
      ?.toUpperCase() || "U"}
  </div>

  <div>
    <strong>
      {JSON.parse(localStorage.getItem("user") || "{}")
        ?.name || "User"}
    </strong>

    <small>
      {JSON.parse(localStorage.getItem("user") || "{}")
        ?.role || "User"}
    </small>
  </div>
</div>

      </aside>
    );
  }

  // ========================================
  // LOGIN SCREEN
  // ========================================

  if (!isAuthenticated) {
    return (
      <Login
        onLogin={
          handleLogin
        }
      />
    );
  }

  // ========================================
  // AUTHENTICATED APPLICATION
  // ========================================

  return (
    <Routes>

      {/* ==================================
          CUSTOMER DETAIL
      ================================== */}

      <Route
        path="/customers/:id"
        element={
          <div className="app">

            {renderSidebar()}

            <main className="main">
              <CustomerDetail />
            </main>

          </div>
        }
      />


      {/* ==================================
          NORMAL APPLICATION
      ================================== */}

      <Route
        path="*"
        element={
          <div className="app">

            {renderSidebar()}

            {renderPage()}

          </div>
        }
      />

    </Routes>
  );
}

export default App;