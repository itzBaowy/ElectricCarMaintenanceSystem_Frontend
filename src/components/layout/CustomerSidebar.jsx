import React from 'react';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import ReceiptIcon from '@mui/icons-material/Receipt';
import EventNoteIcon from '@mui/icons-material/EventNote';
import ChatIcon from '@mui/icons-material/Chat';
import PersonIcon from '@mui/icons-material/Person';
import LockIcon from '@mui/icons-material/Lock';
import LogoutIcon from '@mui/icons-material/Logout';
import '../../styles/CustomerSidebar.css';

const CustomerSidebar = ({ active, activeSection, onNavigate, onEditProfile, onChangePassword, onLogout, onSupportChat, greeting, unreadCount = 0 }) => {
  return (
    <aside className={`customer-sidebar${active ? ' active' : ''}`}>  
      <div className="sidebar-title">Customer Dashboard</div>
      {greeting && <div className="sidebar-greeting">{greeting}</div>}
      <div className="sidebar-divider"></div>
      <nav>
        <ul>
          <li className={activeSection === 'your-vehicle' ? 'active' : ''} onClick={() => onNavigate('your-vehicle')}>
            <DirectionsCarIcon style={{ marginRight: '10px', fontSize: '20px' }} />
            My Vehicles
          </li>
          <li className={activeSection === 'invoice' ? 'active' : ''} onClick={() => onNavigate('invoice')}>
            <ReceiptIcon style={{ marginRight: '10px', fontSize: '20px' }} />
            My Invoices
          </li>
          <li className={activeSection === 'appointment' ? 'active' : ''} onClick={() => onNavigate('appointment')}>
            <EventNoteIcon style={{ marginRight: '10px', fontSize: '20px' }} />
            My Appointments
          </li>
        </ul>
      </nav>
      <div className="sidebar-footer">
        <button className="sidebar-btn chat-btn" onClick={onSupportChat}>
          <ChatIcon style={{ marginRight: '8px', fontSize: '18px' }} />
          Support Chat
          {unreadCount > 0 && (
            <span className="notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
          )}
        </button>
        <button className="sidebar-btn" onClick={onEditProfile}>
          <PersonIcon style={{ marginRight: '8px', fontSize: '18px' }} />
          Edit Profile
        </button>
        <button className="sidebar-btn" onClick={onChangePassword}>
          <LockIcon style={{ marginRight: '8px', fontSize: '18px' }} />
          Change Password
        </button>
        <button className="sidebar-btn" onClick={onLogout}>
          <LogoutIcon style={{ marginRight: '8px', fontSize: '18px' }} />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default CustomerSidebar;
