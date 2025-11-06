import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../../components/layout/Header'
import Footer from '../../components/layout/Footer'
import technicianService from '../../api/technicianService'
import appointmentService from '../../api/appointmentService'
import authService from '../../api/authService'
import logger from '../../utils/logger'
import '../../styles/TechnicianDashboard.css'

const TechnicianDashboard = () => {
  const navigate = useNavigate()
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('CONFIRMED')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [updateLoading, setUpdateLoading] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)

  useEffect(() => {
    initializeUser()
  }, [])

  const initializeUser = async () => {
    const user = authService.getCurrentUser()
    if (user && user.userId) {
      setCurrentUser(user)
      fetchAppointments(user.userId)
    } else {
      logger.error('No user found')
      navigate('/login')
    }
  }

  const fetchAppointments = async (technicianId) => {
    setLoading(true)
    try {
      const result = await technicianService.getTechnicianAppointments(technicianId)

      if (result.success) {
        const appointmentsData = result.data || []
        setAppointments(appointmentsData)
        logger.log('Fetched technician appointments:', appointmentsData)
      } else {
        logger.error('Failed to fetch appointments:', result.message)
        setAppointments([])
      }
    } catch (error) {
      logger.error('Error fetching appointments:', error)
      setAppointments([])
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetails = (appointment) => {
    setSelectedAppointment(appointment)
    setShowDetailModal(true)
  }

  const handleStatusUpdate = async (appointmentId, newStatus) => {
    if (!window.confirm(`Are you sure you want to update status to ${newStatus}?`)) {
      return
    }

    setUpdateLoading(true)
    try {
      const result = await appointmentService.updateAppointmentStatus(appointmentId, newStatus)

      if (result.success) {
        alert('Status updated successfully!')
        setShowDetailModal(false)
        fetchAppointments(currentUser.userId)
      } else {
        alert(`Error: ${result.message}`)
      }
    } catch (error) {
      logger.error('Error updating status:', error)
      alert('An error occurred while updating status!')
    } finally {
      setUpdateLoading(false)
    }
  }

  const handleLogout = () => {
    authService.clearSession()
    navigate('/login')
  }

  // Filter appointments
  const filteredAppointments = appointments.filter(apt => {
    const matchesStatus = filterStatus === 'ALL' || apt.status === filterStatus
    const matchesSearch = searchTerm === '' || 
      apt.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.vehicleLicensePlate?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.id?.toString().includes(searchTerm)
    
    return matchesStatus && matchesSearch
  })

  const getStatusBadgeClass = (status) => {
    const statusClasses = {
      'PENDING': 'status-badge-pending',
      'CONFIRMED': 'status-badge-confirmed',
      'COMPLETED': 'status-badge-completed',
      'CANCELLED': 'status-badge-cancelled'
    }
    return statusClasses[status] || 'status-badge-default'
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const formatTimeFromDate = (dateString) => {
    if (!dateString) return 'N/A'
    // Extract time from ISO format "2025-11-01T14:36:00"
    const timePart = dateString.split('T')[1]
    return timePart.substring(0, 5) // HH:mm (14:36)
  }

  const formatCurrency = (amount) => {
    if (!amount) return '0 VND'
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  return (
    <div className="technician-dashboard">
      
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>Technician Dashboard</h1>
          <div className="header-actions">
            <span className="welcome-text">Welcome {currentUser?.username || 'Technician'}, Have a productive and successful day at work</span>
            <button onClick={handleLogout} className="btn-logout">
              Logout
            </button>
          </div>
        </div>

        {/* Statistics */}
        <div className="stats-section">
          <div className="stats-header">
            <h2>Appointment Statistics</h2>
          </div>
          <div className="stats-container">
            <div className="stat-card">
              <h3>TOTAL ASSIGNED</h3>
              <p className="stat-number">{appointments.length}</p>
            </div>
            <div className="stat-card">
              <h3>PENDING</h3>
              <p className="stat-number pending">
                {appointments.filter(a => a.status === 'PENDING').length}
              </p>
            </div>
            <div className="stat-card">
              <h3>CONFIRMED</h3>
              <p className="stat-number confirmed">
                {appointments.filter(a => a.status === 'CONFIRMED').length}
              </p>
            </div>
            <div className="stat-card">
              <h3>COMPLETED</h3>
              <p className="stat-number completed">
                {appointments.filter(a => a.status === 'COMPLETED').length}
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="filters-section">
          <div className="filters-header">
            <h2>Filter & Search Appointments</h2>
          </div>
          <div className="filters-container">
            <div className="filter-group">
              <label>Filter by Status:</label>
              <select 
                value={filterStatus} 
                onChange={(e) => setFilterStatus(e.target.value)}
                className="filter-select"
              >
                <option value="ALL">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            <div className="search-group">
              <label>Search:</label>
              <input
                type="text"
                placeholder="Search by customer name, license plate..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
          </div>
        </div>

        {/* Appointments Table */}
        <div className="appointments-section">
          <h2>My Assigned Appointments</h2>
          
          {loading ? (
            <div className="loading-message">Loading appointments...</div>
          ) : filteredAppointments.length === 0 ? (
            <div className="empty-message">
              No appointments found matching your criteria.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="appointments-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Customer</th>
                    <th>Vehicle</th>
                    <th>Service</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Status</th>
                    <th>Price</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAppointments.map((appointment) => (
                    <tr key={appointment.id}>
                      <td>{appointment.id}</td>
                      <td>{appointment.customerName || 'N/A'}</td>
                      <td>
                        <div className="vehicle-info">
                          <div>{appointment.vehicleLicensePlate}</div>
                          <small>{appointment.vehicleModel}</small>
                        </div>
                      </td>
                      <td>{appointment.servicePackageName}</td>
                      <td>{formatDate(appointment.appointmentDate)}</td>
                      <td>{formatTimeFromDate(appointment.appointmentDate)}</td>
                      <td>
                        <span className={`status-badge ${getStatusBadgeClass(appointment.status)}`}>
                          {appointment.status || 'UNKNOWN'}
                        </span>
                      </td>
                      <td>{formatCurrency(appointment.totalPrice)}</td>
                      <td>
                        <button
                          onClick={() => handleViewDetails(appointment)}
                          className="btn-view"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedAppointment && (
        <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Appointment Details</h2>
              <button 
                className="modal-close"
                onClick={() => setShowDetailModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="detail-section">
                <h3>Appointment Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Appointment ID:</label>
                    <span>{selectedAppointment.id}</span>
                  </div>
                  <div className="detail-item">
                    <label>Status:</label>
                    <span className={`status-badge ${getStatusBadgeClass(selectedAppointment.status)}`}>
                      {selectedAppointment.status}
                    </span>
                  </div>
                  <div className="detail-item">
                    <label>Date:</label>
                    <span>{formatDate(selectedAppointment.appointmentDate)}</span>
                  </div>
                  <div className="detail-item">
                    <label>Time:</label>
                    <span>{formatTimeFromDate(selectedAppointment.appointmentDate)}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3>Customer Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Name:</label>
                    <span>{selectedAppointment.customerName || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Phone:</label>
                    <span>{selectedAppointment.customerPhone || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3>Vehicle Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>License Plate:</label>
                    <span>{selectedAppointment.vehicleLicensePlate || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Model:</label>
                    <span>{selectedAppointment.vehicleModel}</span>
                  </div>
                  <div className="detail-item">
                    <label>Brand:</label>
                    <span>Vinfast</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3>Service Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Service Package:</label>
                    <span>{selectedAppointment.servicePackageName || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Total Price:</label>
                    <span className="price-highlight">
                      {formatCurrency(selectedAppointment.totalPrice)}
                    </span>
                  </div>
                </div>
              </div>

              {selectedAppointment.notes && (
                <div className="detail-section">
                  <h3>Notes</h3>
                  <p className="notes-content">{selectedAppointment.notes}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="detail-actions">
                {selectedAppointment.status === 'CONFIRMED' && (
                  <button
                    onClick={() => handleStatusUpdate(selectedAppointment.id, 'COMPLETED')}
                    className="btn-action btn-complete"
                    disabled={updateLoading}
                  >
                    {updateLoading ? 'Updating...' : 'Complete Service'}
                  </button>
                )}

                <button
                  onClick={() => setShowDetailModal(false)}
                  className="btn-action btn-cancel"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}

export default TechnicianDashboard
