import React from 'react';
import '../../styles/CustomerSidebar.css';

const CustomerSidebar = ({ active, onNavigate, onEditProfile, onChangePassword, onLogout, greeting }) => {
  return (
    <aside className={`customer-sidebar${active ? ' active' : ''}`}>  
      <div className="sidebar-title">Customer Dashboard</div>
      {greeting && <div className="sidebar-greeting">{greeting}</div>}
      <div className="sidebar-divider"></div>
      <nav>
        <ul>
          <li className="active" onClick={() => onNavigate('your-vehicle')}>Your Vehicle</li>
          <li onClick={() => onNavigate('invoice')}>Invoice</li>
          <li onClick={() => onNavigate('appointment')}>Appointment</li>
        </ul>
      </nav>
      <div className="sidebar-footer">
        <button className="sidebar-btn" onClick={onEditProfile}>Edit Profile</button>
        <button className="sidebar-btn" onClick={onChangePassword}>Change Password</button>
        <button className="sidebar-btn" onClick={onLogout}>Logout</button>
      </div>
    </aside>
  );
};

export default CustomerSidebar;
