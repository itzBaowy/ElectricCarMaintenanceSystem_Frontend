import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
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
  const [requestAdditionalService, setRequestAdditionalService] = useState(false)
  const [upgradeItems, setUpgradeItems] = useState([]) // [{ serviceItemId, newActionType, notes }]

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
    setRequestAdditionalService(false)
    setUpgradeItems([])
  }

  const handleToggleUpgradeItem = (serviceItemId) => {
    const existingIndex = upgradeItems.findIndex(item => item.serviceItemId === serviceItemId)
    
    if (existingIndex >= 0) {
      // Remove item
      setUpgradeItems(upgradeItems.filter(item => item.serviceItemId !== serviceItemId))
    } else {
      // Add item with default values
      setUpgradeItems([...upgradeItems, {
        serviceItemId: serviceItemId,
        newActionType: 'REPLACE',
        notes: ''
      }])
    }
  }

  const handleUpdateUpgradeItemNote = (serviceItemId, notes) => {
    setUpgradeItems(upgradeItems.map(item => 
      item.serviceItemId === serviceItemId 
        ? { ...item, notes } 
        : item
    ))
  }

  const handleCompleteService = async () => {
    if (!selectedAppointment) return

    // If additional service is requested and items are selected
    if (requestAdditionalService && upgradeItems.length > 0) {
      // Validate that all selected items have notes
      const missingNotes = upgradeItems.some(item => !item.notes || item.notes.trim() === '')
      if (missingNotes) {
        alert('Vui lòng nhập ghi chú cho tất cả các dịch vụ cần thay thế!')
        return
      }

      if (!window.confirm(`Bạn có chắc chắn muốn yêu cầu thêm ${upgradeItems.length} dịch vụ thay thế?`)) {
        return
      }

      setUpdateLoading(true)
      try {
        const result = await appointmentService.requestServiceItemUpgrades(
          selectedAppointment.id,
          upgradeItems
        )

        if (result.success) {
          alert('Yêu cầu dịch vụ thêm đã được gửi! Đang chờ khách hàng xác nhận.')
          setShowDetailModal(false)
          setRequestAdditionalService(false)
          setUpgradeItems([])
          fetchAppointments(currentUser.userId)
        } else {
          alert(`Lỗi: ${result.message}`)
        }
      } catch (error) {
        logger.error('Error requesting upgrades:', error)
        alert('Có lỗi khi gửi yêu cầu dịch vụ thêm!')
      } finally {
        setUpdateLoading(false)
      }
    } else {
      // Normal completion without additional services
      if (!window.confirm('Xác nhận hoàn thành dịch vụ?')) {
        return
      }

      setUpdateLoading(true)
      try {
        const result = await appointmentService.updateAppointmentStatus(
          selectedAppointment.id,
          'COMPLETED'
        )

        if (result.success) {
          alert('Dịch vụ đã hoàn thành!')
          setShowDetailModal(false)
          fetchAppointments(currentUser.userId)
        } else {
          alert(`Lỗi: ${result.message}`)
        }
      } catch (error) {
        logger.error('Error completing service:', error)
        alert('Có lỗi khi hoàn thành dịch vụ!')
      } finally {
        setUpdateLoading(false)
      }
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
      'CUSTOMER_APPROVED': 'status-badge-confirmed',
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
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <span className="logo-icon"></span>
            <span className="logo-text">Technician Dashboard</span>
          </div>
        </div>
        
        <div className="sidebar-welcome">
          <p className="welcome-message">
            Welcome {currentUser?.fullName || currentUser?.username || 'Technician'}, Have a productive and successful day at work
          </p>
        </div>

        <nav className="sidebar-nav">
          <a href="#" className="nav-item active">
            <span className="nav-icon"></span>
            <span className="nav-text">Dashboard</span>
          </a>
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
           
            <span className="nav-text">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="main-content">
        <div className="dashboard-container">

        {/* Welcome Message */}
        <div className="page-welcome">
          <h2>Welcome {currentUser?.fullName || currentUser?.username || 'Technician'}, Have a productive and successful day at work</h2>
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
                <option value="CUSTOMER_APPROVED">Customer Approved</option>
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
                      {formatCurrency(selectedAppointment.estimatedCost)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Service Items List */}
              {selectedAppointment.serviceItems && selectedAppointment.serviceItems.length > 0 && (
                <div className="detail-section">
                  <h3>Danh Sách Dịch Vụ</h3>
                  
                  {/* Additional Service Option */}
                  {(selectedAppointment.status === 'CONFIRMED') && (
                    <div className="additional-service-option">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={requestAdditionalService}
                          onChange={(e) => {
                            setRequestAdditionalService(e.target.checked)
                            if (!e.target.checked) {
                              setUpgradeItems([])
                            }
                          }}
                        />
                        <span>Yêu cầu dịch vụ thêm (cần thay thế linh kiện)</span>
                      </label>
                    </div>
                  )}

                  <div className="service-items-list">
                    {selectedAppointment.serviceItems.map((item, index) => {
                      const serviceItem = item.serviceItem
                      const isSelected = upgradeItems.some(u => u.serviceItemId === serviceItem.id)
                      const upgradeItem = upgradeItems.find(u => u.serviceItemId === serviceItem.id)
                      
                      return (
                        <div key={index} className={`service-item-card ${isSelected ? 'selected' : ''}`}>
                          <div className="service-item-header">
                            {requestAdditionalService && item.actionType === 'CHECK' && (
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleToggleUpgradeItem(serviceItem.id)}
                                className="service-item-checkbox"
                              />
                            )}
                            <div className="service-item-info">
                              <h4>{serviceItem.name}</h4>
                              <p className="service-description">{serviceItem.description}</p>
                            </div>
                            <div className="service-item-meta">
                              <span className={`action-type-badge ${item.actionType.toLowerCase()}`}>
                                {item.actionType}
                              </span>
                              <span className="service-price">{formatCurrency(item.price)}</span>
                            </div>
                          </div>
                          
                          {/* Notes input when item is selected */}
                          {isSelected && (
                            <div className="service-item-notes">
                              <label>Ghi chú nguyên nhân cần thay thế: *</label>
                              <textarea
                                placeholder="Ví dụ: Má phanh trước mòn quá giới hạn..."
                                value={upgradeItem?.notes || ''}
                                onChange={(e) => handleUpdateUpgradeItemNote(serviceItem.id, e.target.value)}
                                rows="2"
                                required
                              />
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                  
                  {requestAdditionalService && upgradeItems.length > 0 && (
                    <div className="upgrade-summary">
                      <strong>Đã chọn {upgradeItems.length} dịch vụ cần thay thế</strong>
                    </div>
                  )}
                </div>
              )}

              {selectedAppointment.notes && (
                <div className="detail-section">
                  <h3>Notes</h3>
                  <p className="notes-content">{selectedAppointment.notes}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="detail-actions">
                {(selectedAppointment.status === 'CONFIRMED' || selectedAppointment.status === 'CUSTOMER_APPROVED') && (
                  <button
                    onClick={handleCompleteService}
                    className="btn-action btn-complete"
                    disabled={updateLoading}
                  >
                    {updateLoading ? 'Đang xử lý...' : 
                      requestAdditionalService && upgradeItems.length > 0 
                        ? '✅ Gửi yêu cầu dịch vụ thêm' 
                        : '✅ Hoàn thành dịch vụ'}
                  </button>
                )}

                <button
                  onClick={() => {
                    setShowDetailModal(false)
                    setRequestAdditionalService(false)
                    setUpgradeItems([])
                  }}
                  className="btn-action btn-cancel"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  )
}

export default TechnicianDashboard
