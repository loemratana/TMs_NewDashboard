import React, { useState, useEffect } from "react";
import {
  FaStore,
  FaCogs,
  FaThLarge,
  FaBook,
  FaUserTie,
  FaKey,
  FaUsers,
} from "react-icons/fa";
import { FaGear } from "react-icons/fa6";
import SubMenu from '../widgets/Submenu';
import axios from 'axios';

const Sidebar = ({ onMenuClick, loggedInUser, isVisible }) => {
  const [activeItem, setActiveItem] = useState(null);
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleMenuClick = (itemName) => {
    setActiveItem(itemName);
    onMenuClick(itemName);
  };

  const normalizeDepartmentName = (name) => {
    return name?.toLowerCase?.()?.trim() || '';
  };

  const getDepartmentSubmenu = () => {
    const role = (loggedInUser?.role || "").toLowerCase().trim();
    const isAdmin = role === "admin";
    const isManager = role === "manager";
    const isSupervisor = role === "supervisor";

    if (isAdmin) {
      return departments;
    } else if (isManager || isSupervisor) {
      return departments.filter(dept => {
        if (!dept?.name || !loggedInUser?.department) {
          return false;
        }
        return normalizeDepartmentName(dept.name) ===
          normalizeDepartmentName(loggedInUser.department);
      });
    }
    return [];
  };

  const fetchDepartments = async () => {
    try {
      const response = await axios.get("https://tms-backend-server.onrender.com/api/users");
      const allUsers = response.data;
      const departmentMap = new Map();

      allUsers.forEach(user => {
        if (!user?.Department) return;

        const normalizedDept = normalizeDepartmentName(user.Department);
        if (!normalizedDept) return;

        if (!departmentMap.has(normalizedDept)) {
          departmentMap.set(normalizedDept, {
            displayName: user.Department,
            users: [],
            manager: null,
            supervisor: null
          });
        }

        const deptInfo = departmentMap.get(normalizedDept);
        deptInfo.users.push(user);

        if (user.Roles === "Manager") {
          deptInfo.manager = user;
        } else if (user.Roles === "Supervisor") {
          deptInfo.supervisor = user;
        }
      });

      const uniqueDepts = Array.from(departmentMap.values()).map(dept => ({
        name: dept.displayName,
        text: `Department ${dept.displayName}`,
        onClick: () => handleMenuClick(`permissions_${dept.displayName}`),
        manager: dept.manager?.UserName || "Not Assigned",
        supervisor: dept.supervisor?.UserName || "Not Assigned",
        users: dept.users.map(user => ({
          id: user.UserID,
          name: user.UserName,
          role: user.Roles,
          image: user.Image
        }))
      }));

      uniqueDepts.sort((a, b) => a.name.localeCompare(b.name));
      setDepartments(uniqueDepts);
    } catch (err) {
      console.error("Error fetching departments:", err);
      setDepartments([]);
    }
  };

  const renderMenuItems = () => {
    const role = (loggedInUser?.role || "").toLowerCase().trim();
    const isAdmin = role === "admin";
    const isManager = role === "manager";
    const isSupervisor = role === "supervisor";

    return (
      <ul className="mt-2">
        {isAdmin && (
          <SubMenu
            icon={<FaUsers className="fs-5" />}
            title="Manage User"
            onClick={() => handleMenuClick("manageUser")}
            active={activeItem === "manageUser"}
            subItems={[
              { text: "User List", onClick: () => handleMenuClick("userList") },
              { text: "Manager List", onClick: () => handleMenuClick("managerList") }
            ]}
          />
        )}

        <SubMenu
          icon={<FaKey className="fs-5" />}
          title="Permissions"
          onClick={() => handleMenuClick("permissions")}
          active={activeItem === "permissions"}
          subItems={getDepartmentSubmenu()}
        />

        {(isAdmin || isManager || isSupervisor) && (
          <>
            <SubMenu
              icon={<FaStore className="fs-5" />}
              title="Manage Task"
              // onClick={() => handleMenuClick("manageTask")}
              // active={activeItem === "manageTask"}
              subItems={[
                { text: "Assign Tasks", onClick: () => handleMenuClick("manageTask") },
                { text: "Your Tasks", onClick: () => handleMenuClick("viewTasks") },
              ]}
            />
            <SubMenu
              icon={<FaBook className="fs-5" />}
              title="Comment"
              onClick={() => handleMenuClick("comment")}
              active={activeItem === "comment"}
              subItems={[
                { text: "View Comments", onClick: () => handleMenuClick("viewComments") },
                { text: "Manage Comments", onClick: () => handleMenuClick("manageComments") }
              ]}
            />
            <SubMenu
              icon={<FaThLarge className="fs-5" />}
              title="Attachment"
              onClick={() => handleMenuClick("attachment")}
              active={activeItem === "attachment"}
              subItems={[
                { text: "View Files", onClick: () => handleMenuClick("viewFiles") },
                { text: "Upload Files", onClick: () => handleMenuClick("uploadFiles") }
              ]}
            />
            <SubMenu
              icon={<FaCogs className="fs-5" />}
              title="Activities Log"
              onClick={() => handleMenuClick("activitiesLog")}
              active={activeItem === "activitiesLog"}
              subItems={[
                { text: "User Activities", onClick: () => handleMenuClick("userActivities") },
                { text: "System Logs", onClick: () => handleMenuClick("systemLogs") }
              ]}
            />
            <SubMenu
              icon={<FaGear className="fs-5" />}
              title="Settings"
              onClick={() => handleMenuClick("settings")}
              active={activeItem === "settings"}
              subItems={[
                { text: "System Settings", onClick: () => handleMenuClick("systemSettings") },
                { text: "User Settings", onClick: () => handleMenuClick("userSettings") }
              ]}
            />
          </>
        )}
      </ul>
    );
  };

  return (
    <div className={`sidebar ${isVisible ? '' : 'hidden'}`}>
      <div className="logo py-3 d-flex border-bottom align-items-center gap-2">
        <div className="d-flex align-items-center justify-content-center">
          <FaUserTie className="fs-2 text-white" />
          <h4 className="fw-bold mt-3 ms-3 text-white">ADMIN TMS</h4>
        </div>
      </div>
      {renderMenuItems()}
    </div>
  );
};

export default Sidebar;

//Correct 205
