import React from 'react';
import '../../styles/CustomerSidebar.css';

const CustomerSidebar = ({ active, onNavigate }) => {
  return (
    <aside className={`customer-sidebar${active ? ' active' : ''}`}>  
      <div className="sidebar-title">ElectricCare Admin</div>
      <div className="sidebar-subtitle">Administrator Panel</div>
      <nav>
        <ul>
          <li className="active" onClick={() => onNavigate('financial-reports')}>Financial Reports</li>
          <li onClick={() => onNavigate('customer')}>Customer</li>
          <li onClick={() => onNavigate('employees')}>Employees</li>
          <li onClick={() => onNavigate('service-centers')}>Service Centers</li>
          <li onClick={() => onNavigate('service-items')}>Service Items</li>
          <li onClick={() => onNavigate('spare-parts')}>Spare Parts</li>
          <li onClick={() => onNavigate('vehicle-models')}>Vehicle Models</li>
          <li onClick={() => onNavigate('vehicles')}>Vehicles</li>
          <li onClick={() => onNavigate('maintenance-records')}>Maintenance Records</li>
        </ul>
      </nav>
      <div className="sidebar-footer">
        <button className="logout-btn">Logout</button>
      </div>
    </aside>
  );
};

export default CustomerSidebar;
