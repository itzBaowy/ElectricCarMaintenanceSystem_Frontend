import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import EmployeeManagement from './components/EmployeeManagement'
import ScheduleManagement from './components/ScheduleManagement'
import './AdminDashboard.css'

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('employees')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const navigate = useNavigate()

  const handleLogout = () => {
    // Clear any stored admin session
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminUser')
    navigate('/login')
  }

  const menuItems = [
    { id: 'employees', icon: '👥', label: 'Employee Management', component: EmployeeManagement },
    { id: 'schedule', icon: '📅', label: 'Schedule Management', component: ScheduleManagement },
    { id: 'reports', icon: '📊', label: 'Reports', component: null },
    { id: 'settings', icon: '⚙️', label: 'Settings', component: null }
  ]

  const ActiveComponent = menuItems.find(item => item.id === activeTab)?.component

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
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="admin-logo">
            <h3>ElectricCare Admin</h3>
            <p>Administrator Panel</p>
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
            {menuItems.map(item => (
              <li key={item.id}>
                <button
                  className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                  onClick={() => {
                    setActiveTab(item.id)
                    setSidebarOpen(false)
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
            <span className="nav-icon">🚪</span>
            <span className="nav-label">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        {/* Top Header */}
        <header className="admin-header">
          <button 
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(true)}
          >
            ☰
          </button>
          
          <div className="header-title">
            <h1>{menuItems.find(item => item.id === activeTab)?.label}</h1>
          </div>

          <div className="header-actions">
            <div className="admin-profile">
              <span className="admin-name">Admin User</span>
              <div className="admin-avatar">A</div>
            </div>
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
  )
}

export default AdminDashboard