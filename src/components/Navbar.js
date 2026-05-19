import React, { useState } from "react";
import { FaSignOutAlt, FaUserCircle, FaBars, FaSearch, FaBell } from "react-icons/fa";
import { Dropdown } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

const Navbar = ({ loggedInUser, onLogout, onSidebarToggle }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleLogout = () => {
    onLogout();
  };

  const handleSidebarToggle = () => {
    const newState = !isSidebarOpen;
    setIsSidebarOpen(newState);
    onSidebarToggle(newState);
  };

  const getInitials = (name) => {
    if (!name) return "?";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  return (
    <header className="navbar-side">
      <div className="navbar-inner">

        {/* Toggle Button */}
        <button
          id="sidebar-toggle-btn"
          className="navbar-toggle-btn"
          onClick={handleSidebarToggle}
          title={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          <FaBars />
        </button>

        {/* Search */}
        <div className="navbar-search">
          <span className="navbar-search-icon"><FaSearch /></span>
          <input
            type="search"
            placeholder="Search tasks, users..."
            id="navbar-search-input"
          />
        </div>

        {/* Right Actions */}
        <div className="navbar-right">

          {/* Notification Bell */}
          <button
            className="navbar-toggle-btn"
            title="Notifications"
            style={{ position: "relative" }}
          >
            <FaBell />
          </button>

          {/* Profile Dropdown */}
          <Dropdown align="end">
            <Dropdown.Toggle
              as="div"
              id="dropdown-profile"
              className="user-profile-btn"
              style={{ cursor: "pointer" }}
            >
              <div className="user-avatar">
                {loggedInUser?.Image ? (
                  <img
                    src={`https://tms-backend-server.onrender.com/uploads/${loggedInUser.Image}`}
                    alt={loggedInUser.UserName}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.style.display = "none";
                    }}
                  />
                ) : (
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>
                    {getInitials(loggedInUser?.username)}
                  </span>
                )}
              </div>
              <div className="user-info">
                <strong>{loggedInUser?.username || "Guest"}</strong>
                <small>
                  {loggedInUser?.role || "Unknown"}
                  {loggedInUser?.department ? ` · ${loggedInUser.department}` : ""}
                </small>
              </div>
            </Dropdown.Toggle>

            <Dropdown.Menu className="mt-2">
              <div style={{
                padding: "10px 14px 8px",
                borderBottom: "1px solid #f1f5f9",
                marginBottom: 4
              }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>
                  {loggedInUser?.username || "Guest"}
                </div>
                <div style={{ fontSize: 11.5, color: "#64748b" }}>
                  {loggedInUser?.role} {loggedInUser?.department ? `• ${loggedInUser.department}` : ""}
                </div>
              </div>
              <Dropdown.Item
                id="logout-btn"
                onClick={handleLogout}
                style={{ color: "#ef4444" }}
              >
                <FaSignOutAlt className="me-2" />
                Sign Out
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>

        </div>
      </div>
    </header>
  );
};

export default Navbar;

//correct with 103
