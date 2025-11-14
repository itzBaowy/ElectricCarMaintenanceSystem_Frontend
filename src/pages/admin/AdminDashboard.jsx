import { useState } from "react";
import { useNavigate } from "react-router-dom";
import EmployeeManagement from "./components/EmployeeManagement";
import ServiceCenterManagement from "./components/ServiceCenterManagement";
import SparePartManagement from "./components/SparePartManagement";
import VehicleModelManagement from "./components/VehicleModelManagement";
import "../../styles/AdminDashboard.css";
import authService from "../../api/authService";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("employees");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      authService.logout();
    }
  };

  const menuItems = [
    {
      id: "employees",
      icon: "",
      label: "Employee Management",
      component: EmployeeManagement,
    },
    {
      id: "centers",
      icon: "",
      label: "Service Centers",
      component: ServiceCenterManagement,
    },
    {
      id: "spareParts",
      icon: "",
      label: "Spare Part Management",
      component: SparePartManagement,
    },
    {
      id: "vehicleModels",
      icon: "",
      label: "Vehicle Models",
      component: VehicleModelManagement,
    },
    { id: "reports", icon: "", label: "Reports", component: null },
    { id: "settings", icon: "", label: "Settings", component: null },
  ];

  const ActiveComponent = menuItems.find(
    (item) => item.id === activeTab
  )?.component;

  return (
    <div className="admin-dashboard">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <div className="admin-logo">
            <h3 style={{ color: '#fff' }}>ElectricCare Admin</h3>
            <p style={{ color: '#fff' }}>Administrator Panel</p>
          </div>
          <button
            className="sidebar-close"
            onClick={() => setSidebarOpen(false)}
          >
            ✕
          </button>
        </div>

        <nav className="sidebar-nav">
          <ul>
            {menuItems.map((item) => (
              <li key={item.id}>
                <button
                  className={`nav-item ${
                    activeTab === item.id ? "active" : ""
                  }`}
                  onClick={() => {
                    setActiveTab(item.id);
                    setSidebarOpen(false);
                  }}
                  disabled={!item.component}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-label">{item.label}</span>
                  {!item.component && <span className="coming-soon">Soon</span>}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <span className="nav-icon"></span>
            <span className="nav-label">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        {/* Top Header */}
        <header className="admin-header" style={{ background: 'linear-gradient(135deg, #26a69a 0%, #66bb6a 100%)', color: '#fff', padding: '2rem 2.5rem' }}>
          <div className="header-title">
            <h1 style={{ margin: 0, fontWeight: 700, fontSize: '2rem', color: '#fff' }}>{menuItems.find(item => item.id === activeTab)?.label || ''}</h1>
          </div>
        </header>

        {/* Content Area */}
        <div className="admin-content">
          {ActiveComponent ? (
            <ActiveComponent />
          ) : (
            <div className="coming-soon-content">
              <div className="coming-soon-icon">🚧</div>
              <h2>Coming Soon</h2>
              <p>This feature is currently under development.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
