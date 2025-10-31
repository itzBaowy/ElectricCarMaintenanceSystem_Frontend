import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import '../../styles/AllAppointments.css'

const AllAppointments = ({ appointments, onClose, onViewDetail }) => {
  const [filteredAppointments, setFilteredAppointments] = useState(appointments)
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('date-desc') // date-desc, date-asc, cost-desc, cost-asc

  useEffect(() => {
    let filtered = [...appointments]

    // Apply status filter
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(apt => apt.status === statusFilter)
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(apt => 
        apt.vehicleModel?.toLowerCase().includes(query) ||
        apt.vehicleLicensePlate?.toLowerCase().includes(query) ||
        apt.servicePackageName?.toLowerCase().includes(query) ||
        apt.technicianName?.toLowerCase().includes(query) ||
        apt.id?.toString().includes(query)
      )
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date-desc':
          return new Date(b.appointmentDate) - new Date(a.appointmentDate)
        case 'date-asc':
          return new Date(a.appointmentDate) - new Date(b.appointmentDate)
        case 'cost-desc':
          return (b.estimatedCost || 0) - (a.estimatedCost || 0)
        case 'cost-asc':
          return (a.estimatedCost || 0) - (b.estimatedCost || 0)
        default:
          return 0
      }
    })

    setFilteredAppointments(filtered)
  }, [appointments, statusFilter, searchQuery, sortBy])

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  const formatDateTime = (dateString) => {
    const date = new Date(dateString)
    return {
      date: date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      }),
      time: date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true
      })
    }
  }

  const getStatusBadge = (status) => {
    const statusMap = {
      PENDING: { text: 'Pending', class: 'pending', icon: '🟡' },
      CONFIRMED: { text: 'Confirmed', class: 'confirmed', icon: '✅' },
      COMPLETED: { text: 'Completed', class: 'completed', icon: '🟢' },
      CANCELLED: { text: 'Cancelled', class: 'cancelled', icon: '❌' }
    }
    return statusMap[status] || statusMap.PENDING
  }

  const getStatusCount = (status) => {
    if (status === 'ALL') return appointments.length
    return appointments.filter(apt => apt.status === status).length
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content all-appointments-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>All Appointments</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="all-appointments-content">
          {/* Filters Section */}
          <div className="filters-section">
            {/* Search Bar */}
            <div className="search-bar">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search by vehicle, service, technician, or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              {searchQuery && (
                <button 
                  className="clear-search"
                  onClick={() => setSearchQuery('')}
                >
                  ✕
                </button>
              )}
            </div>

            {/* Status Filter Tabs */}
            <div className="status-tabs">
              <button
                className={`status-tab ${statusFilter === 'ALL' ? 'active' : ''}`}
                onClick={() => setStatusFilter('ALL')}
              >
                All ({getStatusCount('ALL')})
              </button>
              <button
                className={`status-tab ${statusFilter === 'PENDING' ? 'active' : ''}`}
                onClick={() => setStatusFilter('PENDING')}
              >
                🟡 Pending ({getStatusCount('PENDING')})
              </button>
              <button
                className={`status-tab ${statusFilter === 'CONFIRMED' ? 'active' : ''}`}
                onClick={() => setStatusFilter('CONFIRMED')}
              >
                ✅ Confirmed ({getStatusCount('CONFIRMED')})
              </button>
              <button
                className={`status-tab ${statusFilter === 'COMPLETED' ? 'active' : ''}`}
                onClick={() => setStatusFilter('COMPLETED')}
              >
                🟢 Completed ({getStatusCount('COMPLETED')})
              </button>
              <button
                className={`status-tab ${statusFilter === 'CANCELLED' ? 'active' : ''}`}
                onClick={() => setStatusFilter('CANCELLED')}
              >
                ❌ Cancelled ({getStatusCount('CANCELLED')})
              </button>
            </div>

            {/* Sort Options */}
            <div className="sort-section">
              <label>Sort by:</label>
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="sort-select"
              >
                <option value="date-desc">Newest First</option>
                <option value="date-asc">Oldest First</option>
                <option value="cost-desc">Highest Cost</option>
                <option value="cost-asc">Lowest Cost</option>
              </select>
            </div>
          </div>

          {/* Results Info */}
          <div className="results-info">
            <span>Showing {filteredAppointments.length} of {appointments.length} appointments</span>
          </div>

          {/* Appointments List */}
          <div className="appointments-grid">
            {filteredAppointments.length === 0 ? (
              <div className="no-results">
                <p>📭 No appointments found</p>
                <p>Try adjusting your filters or search criteria</p>
              </div>
            ) : (
              filteredAppointments.map(appointment => {
                const statusInfo = getStatusBadge(appointment.status)
                const { date, time } = formatDateTime(appointment.appointmentDate)
                
                return (
                  <div 
                    key={appointment.id} 
                    className="appointment-item"
                    onClick={() => onViewDetail(appointment)}
                  >
                    <div className="appointment-header-row">
                      <div className="appointment-id">
                        <span className="id-label">ID:</span>
                        <span className="id-value">#{appointment.id}</span>
                      </div>
                      <span className={`status-badge ${statusInfo.class}`}>
                        {statusInfo.icon} {statusInfo.text}
                      </span>
                    </div>

                    <div className="appointment-datetime">
                      <span className="datetime-icon">📅</span>
                      <div className="datetime-info">
                        <span className="date">{date}</span>
                        <span className="time">{time}</span>
                      </div>
                    </div>

                    <div className="appointment-vehicle">
                      <span className="vehicle-icon">🚗</span>
                      <div className="vehicle-info">
                        <span className="vehicle-model">{appointment.vehicleModel}</span>
                        <span className="vehicle-plate">{appointment.vehicleLicensePlate}</span>
                      </div>
                    </div>

                    {appointment.servicePackageName && (
                      <div className="appointment-service">
                        <span className="service-icon">📦</span>
                        <span className="service-name">{appointment.servicePackageName}</span>
                        {appointment.serviceItems && appointment.serviceItems.length > 0 && (
                          <span className="additional-services">
                            + {appointment.serviceItems.length} service(s)
                          </span>
                        )}
                      </div>
                    )}

                    {!appointment.servicePackageName && appointment.serviceItems && appointment.serviceItems.length > 0 && (
                      <div className="appointment-service">
                        <span className="service-icon">🔧</span>
                        <span className="service-name">
                          {appointment.serviceItems.length} Individual Service(s)
                        </span>
                      </div>
                    )}

                    <div className="appointment-technician">
                      <span className="technician-icon">👨‍🔧</span>
                      <span className="technician-name">
                        {appointment.technicianName || 'Not assigned yet'}
                      </span>
                    </div>

                    <div className="appointment-cost">
                      <span className="cost-label">Estimated Cost:</span>
                      <span className="cost-value">{formatCurrency(appointment.estimatedCost)}</span>
                    </div>

                    <div className="view-detail-hint">
                      Click to view details →
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        <div className="modal-footer">
          <div className="footer-info">
            Total Appointments: {appointments.length}
          </div>
          <button className="btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  )
}

AllAppointments.propTypes = {
  appointments: PropTypes.array.isRequired,
  onClose: PropTypes.func.isRequired,
  onViewDetail: PropTypes.func.isRequired
}

export default AllAppointments
