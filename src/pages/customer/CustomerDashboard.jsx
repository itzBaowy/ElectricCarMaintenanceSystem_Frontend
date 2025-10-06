import { useState, useEffect } from 'react'
import authService from '../../api/authService'
import vehicleService from '../../api/vehicleService'
import AddVehicle from './AddVehicle'
import '../../styles/CustomerDashboard.css'

const CustomerDashboard = () => {
  const [customer, setCustomer] = useState(null)
  const [vehicles, setVehicles] = useState([])
  const [vehicleModels, setVehicleModels] = useState([])
  const [recentAppointments, setRecentAppointments] = useState([])
  const [showAddVehicle, setShowAddVehicle] = useState(false)

  // Load customer data from auth service
  useEffect(() => {
    const loadCustomerData = async () => {
      try {
        // Get user info from token/localStorage
        const userResult = await authService.getUserProfile()
        
        if (userResult.success) {
          // Mock customer data based on user info - later replace with API call
          const mockCustomer = {
            id: userResult.data.userId || 1,
            fullName: userResult.data.fullName || userResult.data.username || 'Customer',
            username: userResult.data.username || 'customer',
            email: userResult.data.email || 'customer@example.com',
            phone: userResult.data.phone || '0123456789',
            joinDate: '2024-01-15'
          }
          setCustomer(mockCustomer)
        } else {
          // Fallback to default data
          const mockCustomer = {
            id: 1,
            fullName: 'Valued Customer',
            username: 'customer',
            email: 'customer@example.com',
            phone: '0123456789',
            joinDate: '2024-01-15'
          }
          setCustomer(mockCustomer)
        }
      } catch (error) {
        console.error('Error loading customer data:', error)
        // Fallback to default data
        const mockCustomer = {
          id: 1,
          fullName: 'Valued Customer',
          username: 'customer',
          email: 'customer@example.com',
          phone: '0123456789',
          joinDate: '2024-01-15'
        }
        setCustomer(mockCustomer)
      }
    }

    loadCustomerData()
    loadVehicleModels()
    loadVehicles()

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

  const loadVehicleModels = async () => {
    try {
      const result = await vehicleService.getAllVehicleModels()
      
      if (result.success) {
        setVehicleModels(result.data || [])
      } else {
        console.error('Failed to load vehicle models:', result.message)
        setVehicleModels([])
      }
    } catch (error) {
      console.error('Error loading vehicle models:', error)
      setVehicleModels([])
    }
  }

  const loadVehicles = async () => {
    try {
      const userResult = await authService.getUserProfile()
      const customerId = userResult.data?.userId

      if (customerId) {
        const result = await vehicleService.getVehiclesByCustomerId(customerId)
        
        if (result.success) {
          setVehicles(result.data || [])
        } else {
          console.error('Failed to load vehicles:', result.message)
          setVehicles([])
        }
      }
    } catch (error) {
      console.error('Error loading vehicles:', error)
      setVehicles([])
    }
  }

  // Helper function to get vehicle model by ID
  const getVehicleModel = (modelId) => {
    return vehicleModels.find(model => model.id === modelId)
  }

  const handleAddVehicle = () => {
    setShowAddVehicle(true)
  }

  const handleCloseAddVehicle = () => {
    setShowAddVehicle(false)
  }

  const handleVehicleAdded = (newVehicle) => {
    // Refresh vehicle list
    loadVehicles()
    setShowAddVehicle(false)
  }

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      authService.logout()
    }
  }

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
      {/* Navigation Header */}
      <div className="dashboard-nav">
        <div className="nav-content">
          <div className="nav-brand">
            <h2>⚡ ElectricCare</h2>
            <span>Customer Portal</span>
          </div>
          <div className="nav-actions">
            <span className="nav-user">Hello, {customer.fullName}</span>
            <button onClick={handleLogout} className="logout-btn">
              🚪 Logout
            </button>
          </div>
        </div>
      </div>

      {/* Welcome Header */}
      <div className="welcome-header">
        <div className="welcome-content">
          <div className="customer-info">
            <div className="customer-avatar">
              {customer.fullName.charAt(0).toUpperCase()}
            </div>
            <div className="customer-details">
              <h1>Welcome back, {customer.fullName}! 👋</h1>
              <p>Ready to take care of your electric vehicle today?</p>
              <div className="customer-meta">
                <span>Member since {new Date(customer.joinDate).getFullYear()}</span>
                <span>•</span>
                <span>Customer ID: #{customer.id}</span>
              </div>
            </div>
          </div>
          <div className="welcome-actions">
            <button className="quick-action-btn primary">
              📅 Book Service
            </button>
            <button className="quick-action-btn secondary" onClick={handleAddVehicle}>
              🚗 Add Vehicle
            </button>
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
            <button className="add-btn" onClick={handleAddVehicle}>+ Add Vehicle</button>
          </div>
          <div className="vehicles-grid">
            {vehicles.length === 0 ? (
              <div className="no-vehicles">
                <p>🚗 You haven't added any vehicles yet.</p>
                <button className="add-btn-large" onClick={handleAddVehicle}>
                  + Add Your First Vehicle
                </button>
              </div>
            ) : (
              vehicles.map(vehicle => {
                const model = getVehicleModel(vehicle.modelId)
                return (
                  <div key={vehicle.id} className="vehicle-card">
                    <div className="vehicle-header">
                      <h3>{model?.name || 'Unknown Model'}</h3>
                      <span className="vehicle-year">{model?.modelYear || 'N/A'}</span>
                    </div>
                    <div className="vehicle-details">
                      <div className="detail-item">
                        <span className="label">License Plate:</span>
                        <span className="value">{vehicle.licensePlate}</span>
                      </div>
                      <div className="detail-item">
                        <span className="label">VIN:</span>
                        <span className="value">{vehicle.vin}</span>
                      </div>
                      <div className="detail-item">
                        <span className="label">Mileage:</span>
                        <span className="value">{parseInt(vehicle.currentKm).toLocaleString()} km</span>
                      </div>
                      <div className="detail-item">
                        <span className="label">Basic Maintenance:</span>
                        <span className="value">{model?.basicMaintenance || 'N/A'} km</span>
                      </div>
                    </div>
                    <div className="vehicle-actions">
                      <button className="action-btn primary">Book Maintenance</button>
                      <button className="action-btn secondary">View Details</button>
                    </div>
                  </div>
                )
              })
            )}
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

      {/* Add Vehicle Modal */}
      {showAddVehicle && (
        <AddVehicle 
          onClose={handleCloseAddVehicle}
          onVehicleAdded={handleVehicleAdded}
        />
      )}
    </div>
  )
}

export default CustomerDashboard