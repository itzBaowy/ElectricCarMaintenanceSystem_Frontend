import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../../components/layout/Header'
import Footer from '../../components/layout/Footer'
import appointmentService from '../../api/appointmentService'
import technicianService from '../../api/technicianService'
import logger from '../../utils/logger'
import '../../styles/StaffDashboard.css'
import authService from '../../api/authService'

const StaffDashboard = () => {
  const navigate = useNavigate()
  const [appointments, setAppointments] = useState([])
  const [technicians, setTechnicians] = useState([])
  const [loading, setLoading] = useState(true)
  const [assignLoading, setAssignLoading] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [selectedTechnician, setSelectedTechnician] = useState('')
  const [filterStatus, setFilterStatus] = useState('ALL')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [appointmentsResult, techniciansResult] = await Promise.all([
        appointmentService.getAllAppointments(),
        technicianService.getAllTechnicians()
      ])

      if (appointmentsResult.success) {
        const appointmentsData = appointmentsResult.data || []
        // Debug: Log first appointment to check structure
        if (appointmentsData.length > 0) {
          logger.log('Sample appointment data:', appointmentsData[0])
        }
        setAppointments(appointmentsData)
      } else {
        logger.error('Failed to fetch appointments:', appointmentsResult.message)
      }

      if (techniciansResult.success) {
        setTechnicians(techniciansResult.data || [])
      } else {
        logger.error('Failed to fetch technicians:', techniciansResult.message)
      }
    } catch (error) {
      logger.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAssignClick = (appointment) => {
    logger.log('Selected appointment:', appointment)
    setSelectedAppointment(appointment)
    setSelectedTechnician('')
    setShowAssignModal(true)
  }

  const handleAssignSubmit = async () => {
    if (!selectedTechnician) {
      alert('Please select a technician!')
      return
    }

    // Get appointment ID - try different possible field names
    const appointmentId = selectedAppointment.appointmentId || 
                         selectedAppointment.id || 
                         selectedAppointment.appointmentID

    if (!appointmentId) {
      logger.error('Appointment ID not found:', selectedAppointment)
      alert('Error: Cannot find appointment ID')
      return
    }

    logger.log('Assigning technician:', { appointmentId, technicianId: selectedTechnician })

    setAssignLoading(true)
    try {
      const result = await technicianService.assignTechnicianToAppointment(
        appointmentId,
        selectedTechnician
      )

      if (result.success) {
        alert('Technician assigned successfully!')
        setShowAssignModal(false)
        fetchData() // Reload data
      } else {
        alert(`Error: ${result.message}`)
      }
    } catch (error) {
      logger.error('Error assigning technician:', error)
      alert('An error occurred while assigning technician!')
    } finally {
      setAssignLoading(false)
    }
  }

  const formatTimeFromDate = (dateString) => {
    if (!dateString) return 'N/A'
    // Extract time from ISO format "2025-11-01T14:36:00"
    const timePart = dateString.split('T')[1]
    return timePart.substring(0, 5) // HH:mm (14:36)
  }

  const getStatusBadgeClass = (status) => {
    const statusMap = {
      PENDING: 'status-pending',
      CONFIRMED: 'status-confirmed',
      COMPLETED: 'status-completed',
      CANCELLED: 'status-cancelled'
    }
    return statusMap[status] || 'status-default'
  }

  const getStatusText = (status) => {
    const statusTextMap = {
      PENDING: 'Pending',
      CONFIRMED: 'Confirmed',
      COMPLETED: 'Completed',
      CANCELLED: 'Cancelled'
    }
    return statusTextMap[status] || status
  }

  const filteredAppointments = appointments.filter(appointment => {
    const matchesStatus = filterStatus === 'ALL' || appointment.status === filterStatus
    const appointmentId = appointment.appointmentId || appointment.id || appointment.appointmentID
    const matchesSearch = 
      appointment.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.vehiclePlate?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointmentId?.toString().includes(searchTerm)
    return matchesStatus && matchesSearch
  })

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
        authService.logout()
    }
  }

  if (loading) {
    return (
      <div className="staff-dashboard">
        <Header />
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading data...</p>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="staff-dashboard">
      <div className="staff-container">
        <div className="staff-header">
          <div className="header-content">
            <h1>🔧 Appointment Management</h1>
            <p>Manage and assign technicians to appointments</p>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>

        {/* Filters */}
        <div className="filters-section">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search by customer name, vehicle plate, ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="status-filters">
            <button 
              className={`filter-btn ${filterStatus === 'ALL' ? 'active' : ''}`}
              onClick={() => setFilterStatus('ALL')}
            >
              All ({appointments.length})
            </button>
            <button 
              className={`filter-btn ${filterStatus === 'PENDING' ? 'active' : ''}`}
              onClick={() => setFilterStatus('PENDING')}
            >
              Pending ({appointments.filter(a => a.status === 'PENDING').length})
            </button>
            <button 
              className={`filter-btn ${filterStatus === 'CONFIRMED' ? 'active' : ''}`}
              onClick={() => setFilterStatus('CONFIRMED')}
            >
              Confirmed ({appointments.filter(a => a.status === 'CONFIRMED').length})
            </button>
            <button 
              className={`filter-btn ${filterStatus === 'COMPLETED' ? 'active' : ''}`}
              onClick={() => setFilterStatus('COMPLETED')}
            >
              Completed ({appointments.filter(a => a.status === 'COMPLETED').length})
            </button>
            <button 
              className={`filter-btn ${filterStatus === 'CANCELLED' ? 'active' : ''}`}
              onClick={() => setFilterStatus('CANCELLED')}
            >
              Cancelled ({appointments.filter(a => a.status === 'CANCELLED').length})
            </button>
          </div>
        </div>

        {/* Appointments Table */}
        <div className="appointments-table-container">
          {filteredAppointments.length === 0 ? (
            <div className="no-data">
              <p>No appointments found</p>
            </div>
          ) : (
            <table className="appointments-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Customer</th>
                  <th>License Plate</th>
                  <th>Model</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Service</th>
                  <th>Status</th>
                  <th>Technician</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAppointments.map((appointment) => {
                  const appointmentId = appointment.appointmentId || appointment.id || appointment.appointmentID
                  return (
                    <tr key={appointmentId}>
                      <td>#{appointmentId}</td>
                      <td>{appointment.customerName || 'N/A'}</td>  
                      <td>{appointment.vehicleLicensePlate || 'N/A'}</td>
                      <td>{appointment.vehicleModel || 'N/A'}</td>
                      <td>{new Date(appointment.appointmentDate).toLocaleDateString('vi-VN')}</td>
                      <td>{formatTimeFromDate(appointment.appointmentDate)}</td>
                      <td>
                        <div className="service-info">
                          {appointment.servicePackageName || 'Individual Service'}
                        </div>
                      </td>
                      <td>
                        <span className={`status-badge ${getStatusBadgeClass(appointment.status)}`}>
                          {getStatusText(appointment.status)}
                        </span>
                      </td>
                      <td>
                        {appointment.technicianName ? (
                          <div className="technician-assigned">
                            <span className="tech-icon">👨‍🔧</span>
                            {appointment.technicianName}
                          </div>
                        ) : (
                          <span className="no-technician">Not assigned</span>
                        )}
                      </td>
                      <td>
                        <button
                          className="assign-btn"
                          onClick={() => handleAssignClick(appointment)}
                          disabled={appointment.status === 'COMPLETED' || appointment.status === 'CANCELLED'}
                        >
                          {appointment.technicianName ? 'Reassign' : 'Assign'}
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Statistics */}
        <div className="statistics-section">
          <div className="stat-card">
            <div className="stat-icon">📋</div>
            <div className="stat-info">
              <h3>{appointments.length}</h3>
              <p>Total Appointments</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⏳</div>
            <div className="stat-info">
              <h3>{appointments.filter(a => a.status === 'PENDING').length}</h3>
              <p>Pending</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-info">
              <h3>{appointments.filter(a => a.status === 'CONFIRMED').length}</h3>
              <p>Confirmed</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">👨‍🔧</div>
            <div className="stat-info">
              <h3>{technicians.length}</h3>
              <p>Technicians</p>
            </div>
          </div>
        </div>
      </div>

      {/* Assign Modal */}
      {showAssignModal && (
        <div className="modal-overlay" onClick={() => setShowAssignModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Assign Technician</h2>
              <button className="close-btn" onClick={() => setShowAssignModal(false)}>
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="appointment-info">
                <h3>Appointment Information</h3>
                <p><strong>ID:</strong> #{selectedAppointment?.appointmentId || selectedAppointment?.id || selectedAppointment?.appointmentID}</p>
                <p><strong>Customer:</strong> {selectedAppointment?.customerName}</p>
                <p><strong>License Plate:</strong> {selectedAppointment?.vehicleLicensePlate || selectedAppointment?.vehiclePlate}</p>
                <p><strong>Model:</strong> {selectedAppointment?.vehicleModel || 'N/A'}</p>
                <p><strong>Date:</strong> {new Date(selectedAppointment?.appointmentDate).toLocaleDateString('en-US')}</p>
                <p><strong>Time:</strong> {formatTimeFromDate(selectedAppointment?.appointmentDate)}</p>
                {selectedAppointment?.technicianName && (
                  <p><strong>Current Technician:</strong> {selectedAppointment.technicianName}</p>
                )}
              </div>

              <div className="technician-select">
                <label htmlFor="technician">Select Technician:</label>
                <select
                  id="technician"
                  value={selectedTechnician}
                  onChange={(e) => setSelectedTechnician(e.target.value)}
                >
                  <option value="">-- Select technician --</option>
                  {technicians.map((tech) => {
                    const techId = tech.technicianId || tech.id || tech.technicianID
                    return (
                      <option key={techId} value={techId}>
                        {tech.fullName}
                      </option>
                    )
                  })}
                </select>
              </div>
            </div>

            <div className="modal-footer">
              <button 
                className="cancel-btn" 
                onClick={() => setShowAssignModal(false)}
                disabled={assignLoading}
              >
                Cancel
              </button>
              <button 
                className="submit-btn" 
                onClick={handleAssignSubmit}
                disabled={assignLoading || !selectedTechnician}
              >
                {assignLoading ? 'Processing...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}

export default StaffDashboard
