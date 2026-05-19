import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import ManageUser from "./pages/manageUser";
import ManageTask from "./pages/manageTask";
import DepartmentView from "./widgets/DepartmentView";
import Login from "./authentication/login";
import "./App.css";

const App = () => {
  const [activeComponent, setActiveComponent] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return !!localStorage.getItem("token");
  });
  const [loggedInUser, setLoggedInUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);

  const handleMenuClick = (component) => {
    setActiveComponent(component);
  };

  const handleLogin = (user) => {
    setIsLoggedIn(true);
    setLoggedInUser(user);
    console.log("Logged In User in App.js:", user);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setLoggedInUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  const renderActiveComponent = () => {
    if (activeComponent?.startsWith('permissions_')) {
      const department = activeComponent.split('_')[1];
      return <DepartmentView department={department} loggedInUser={loggedInUser} />;
    }

    switch (activeComponent) {
      case "manageUser":
        return <ManageUser loggedInUser={loggedInUser} />;
      case "userList":
        return <ManageUser loggedInUser={loggedInUser} filter="users" />;
      case "managerList":
        return <ManageUser loggedInUser={loggedInUser} filter="managers" />;
      case "manageTask":
        return <ManageTask loggedInUser={loggedInUser} view="assign" />;
      case "viewTasks":
        return <ManageTask loggedInUser={loggedInUser} view="yours" />;
      case "createTask":
        return <ManageTask loggedInUser={loggedInUser} view="create" />;
      case "taskHistory":
        return <ManageTask loggedInUser={loggedInUser} view="history" />;
      default:
        return null;
    }
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={
            isLoggedIn ? (
              <Navigate to="/dashboard" />
            ) : (
              <Login onLogin={handleLogin} />
            )
          }
        />
        <Route
          path="/dashboard"
          element={
            isLoggedIn ? (
              <div className="dashboard">
                <Sidebar
                  onMenuClick={handleMenuClick}
                  loggedInUser={loggedInUser}
                  isVisible={isSidebarVisible}
                />
                <div className={`main-content ${isSidebarVisible ? '' : 'full-width'}`}>
                  <Navbar
                    onLogout={handleLogout}
                    loggedInUser={loggedInUser}
                    onSidebarToggle={() => setIsSidebarVisible(!isSidebarVisible)}
                  />
                  <div className="content-area">{renderActiveComponent()}</div>
                </div>
              </div>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
};

export default App;

//Correct with 104
