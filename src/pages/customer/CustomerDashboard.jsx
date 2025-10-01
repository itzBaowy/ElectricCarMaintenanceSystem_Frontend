import { useState, useEffect } from 'react'
import '../../styles/CustomerDashboard.css'

const CustomerDashboard = () => {
  const [customer, setCustomer] = useState(null)
  const [vehicles, setVehicles] = useState([])
  const [recentAppointments, setRecentAppointments] = useState([])

  // Mock customer data
  useEffect(() => {
    const mockCustomer = {
      id: 1,
      fullName: 'Nguyen Van A',
      username: 'nguyenvana',
      email: 'nguyenvana@example.com',
      phone: '0123456789',
      joinDate: '2024-01-15'
    }
    setCustomer(mockCustomer)

    // Mock vehicles data
    const mockVehicles = [
      {
        id: 1,
        make: 'Tesla',
        model: 'Model 3',
        year: 2022,
        licensePlate: '30A-12345',
        batteryCapacity: 75,
        mileage: 25000,
        lastMaintenance: '2024-08-15',
        nextMaintenance: '2024-11-15',
        status: 'active'
      },
      {
        id: 2,
        make: 'VinFast',
        model: 'VF8',
        year: 2023,
        licensePlate: '30B-67890',
        batteryCapacity: 90,
        mileage: 15000,
        lastMaintenance: '2024-09-01',
        nextMaintenance: '2024-12-01',
        status: 'active'
      }
    ]
    setVehicles(mockVehicles)

    // Mock recent appointments
    const mockAppointments = [
      {
        id: 1,
        vehicleId: 1,
        serviceName: 'Battery Health Check',
        date: '2024-10-05',
        time: '09:00',
        status: 'confirmed',
        technician: 'John Doe',
        estimatedDuration: 60,
        price: 500000
      },
      {
        id: 2,
        vehicleId: 2,
        serviceName: 'Brake System Inspection',
        date: '2024-09-28',
        time: '14:00',
        status: 'completed',
        technician: 'Jane Smith',
        estimatedDuration: 90,
        price: 750000
      },
      {
        id: 3,
        vehicleId: 1,
        serviceName: 'Tire Rotation',
        date: '2024-09-20',
        time: '10:30',
        status: 'completed',
        technician: 'Mike Johnson',
        estimatedDuration: 45,
        price: 300000
      }
    ]
    setRecentAppointments(mockAppointments)
  }, [])

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  const getStatusBadge = (status) => {
    const statusMap = {
      confirmed: { text: 'Confirmed', class: 'confirmed', icon: '✅' },
      completed: { text: 'Completed', class: 'completed', icon: '🟢' },
      pending: { text: 'Pending', class: 'pending', icon: '🟡' },
      cancelled: { text: 'Cancelled', class: 'cancelled', icon: '❌' }
    }
    return statusMap[status] || statusMap.pending
  }

  if (!customer) {
    return <div className="loading">Loading...</div>
  }

  return (
    <div className="customer-dashboard">
      {/* Welcome Header */}
      <div className="welcome-header">
        <div className="welcome-content">
          <div className="customer-info">
            <div className="customer-avatar">
              {customer.fullName.charAt(0)}
            </div>
            <div className="customer-details">
              <h1>Welcome, {customer.fullName}! 👋</h1>
              <p>Have a great day with your electric vehicle</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="quick-stats">
        <div className="stat-card">
          <div className="stat-icon">🚗</div>
          <div className="stat-info">
            <span className="stat-number">{vehicles.length}</span>
            <span className="stat-label">Your Vehicles</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🔧</div>
          <div className="stat-info">
            <span className="stat-number">{recentAppointments.filter(a => a.status === 'confirmed').length}</span>
            <span className="stat-label">Upcoming Appointments</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-info">
            <span className="stat-number">{recentAppointments.filter(a => a.status === 'completed').length}</span>
            <span className="stat-label">Completed Services</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="dashboard-content">
        {/* Vehicles Section */}
        <div className="section">
          <div className="section-header">
            <h2>🚗 Your Electric Vehicles</h2>
            <button className="add-btn">+ Add Vehicle</button>
          </div>
          <div className="vehicles-grid">
            {vehicles.map(vehicle => (
              <div key={vehicle.id} className="vehicle-card">
                <div className="vehicle-header">
                  <h3>{vehicle.make} {vehicle.model}</h3>
                  <span className="vehicle-year">{vehicle.year}</span>
                </div>
                <div className="vehicle-details">
                  <div className="detail-item">
                    <span className="label">License Plate:</span>
                    <span className="value">{vehicle.licensePlate}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Battery:</span>
                    <span className="value">{vehicle.batteryCapacity} kWh</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Mileage:</span>
                    <span className="value">{vehicle.mileage.toLocaleString()} km</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Next Maintenance:</span>
                    <span className="value next-maintenance">{vehicle.nextMaintenance}</span>
                  </div>
                </div>
                <div className="vehicle-actions">
                  <button className="action-btn primary">Book Maintenance</button>
                  <button className="action-btn secondary">View Details</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Appointments */}
        <div className="section">
          <div className="section-header">
            <h2>📋 Recent Appointments</h2>
            <button className="view-all-btn">View All</button>
          </div>
          <div className="appointments-list">
            {recentAppointments.map(appointment => {
              const vehicle = vehicles.find(v => v.id === appointment.vehicleId)
              const statusInfo = getStatusBadge(appointment.status)
              
              return (
                <div key={appointment.id} className="appointment-card">
                  <div className="appointment-date">
                    <span className="date">{appointment.date}</span>
                    <span className="time">{appointment.time}</span>
                  </div>
                  <div className="appointment-details">
                    <h4>{appointment.serviceName}</h4>
                    <p>🚗 {vehicle?.make} {vehicle?.model} - {vehicle?.licensePlate}</p>
                    <p>👨‍🔧 Technician: {appointment.technician}</p>
                    <p>⏱️ Duration: {appointment.estimatedDuration} minutes</p>
                  </div>
                  <div className="appointment-status">
                    <span className={`status-badge ${statusInfo.class}`}>
                      {statusInfo.icon} {statusInfo.text}
                    </span>
                    <span className="price">{formatCurrency(appointment.price)}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CustomerDashboard