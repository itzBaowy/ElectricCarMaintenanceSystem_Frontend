import React from 'react';
import '../../styles/CustomerSidebar.css';

const CustomerSidebar = ({ active, activeSection, onNavigate, onEditProfile, onChangePassword, onLogout, onSupportChat, greeting, unreadCount = 0 }) => {
  return (
    <aside className={`customer-sidebar${active ? ' active' : ''}`}>  
      <div className="sidebar-title">Customer Dashboard</div>
      {greeting && <div className="sidebar-greeting">{greeting}</div>}
      <div className="sidebar-divider"></div>
      <nav>
        <ul>
          <li className={activeSection === 'your-vehicle' ? 'active' : ''} onClick={() => onNavigate('your-vehicle')}>Your Vehicle</li>
          <li className={activeSection === 'invoice' ? 'active' : ''} onClick={() => onNavigate('invoice')}>Invoice</li>
          <li className={activeSection === 'appointment' ? 'active' : ''} onClick={() => onNavigate('appointment')}>Appointment</li>
        </ul>
      </nav>
      <div className="sidebar-footer">
        <button className="sidebar-btn chat-btn" onClick={onSupportChat}>
          💬 Support Chat
          {unreadCount > 0 && (
            <span className="notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
          )}
        </button>
        <button className="sidebar-btn" onClick={onEditProfile}>Edit Profile</button>
        <button className="sidebar-btn" onClick={onChangePassword}>Change Password</button>
        <button className="sidebar-btn" onClick={onLogout}>Logout</button>
      </div>
    </aside>
  );
};

export default CustomerSidebar;
