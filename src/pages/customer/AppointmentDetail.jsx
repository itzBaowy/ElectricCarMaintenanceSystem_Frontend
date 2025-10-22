import { useState } from 'react'
import PropTypes from 'prop-types'
import '../../styles/AppointmentDetail.css'

const AppointmentDetail = ({ appointment, onClose }) => {
  if (!appointment) return null

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
        weekday: 'long',
        year: 'numeric', 
        month: 'long', 
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
      PENDING: { text: 'Pending', class: 'pending', icon: '🟡', description: 'Waiting for confirmation' },
      CONFIRMED: { text: 'Confirmed', class: 'confirmed', icon: '✅', description: 'Appointment confirmed' },
      COMPLETED: { text: 'Completed', class: 'completed', icon: '🟢', description: 'Service completed' },
      CANCELLED: { text: 'Cancelled', class: 'cancelled', icon: '❌', description: 'Appointment cancelled' }
    }
    return statusMap[status] || statusMap.PENDING
  }

  const { date, time } = formatDateTime(appointment.appointmentDate)
  const statusInfo = getStatusBadge(appointment.status)

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content appointment-detail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>📋 Appointment Details</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="appointment-detail-content">
          {/* Status Section */}
          <div className="detail-section status-section">
            <div className={`status-banner ${statusInfo.class}`}>
              <span className="status-icon">{statusInfo.icon}</span>
              <div className="status-info">
                <h3>{statusInfo.text}</h3>
                <p>{statusInfo.description}</p>
              </div>
            </div>
          </div>

          {/* Appointment Info */}
          <div className="detail-section">
            <h3 className="section-title">📅 Appointment Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Appointment ID:</span>
                <span className="info-value">#{appointment.id}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Date:</span>
                <span className="info-value">{date}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Time:</span>
                <span className="info-value">{time}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Created:</span>
                <span className="info-value">
                  {new Date(appointment.createdAt).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Vehicle Info */}
          <div className="detail-section">
            <h3 className="section-title">🚗 Vehicle Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Model:</span>
                <span className="info-value">{appointment.vehicleModel}</span>
              </div>
              <div className="info-item">
                <span className="info-label">License Plate:</span>
                <span className="info-value">{appointment.vehicleLicensePlate}</span>
              </div>
            </div>
          </div>

          {/* Customer Info */}
          <div className="detail-section">
            <h3 className="section-title">👤 Customer Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Name:</span>
                <span className="info-value">{appointment.customerName}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Phone:</span>
                <span className="info-value">{appointment.customerPhone}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Email:</span>
                <span className="info-value">{appointment.customerEmail}</span>
              </div>
            </div>
          </div>

          {/* Technician Info */}
          <div className="detail-section">
            <h3 className="section-title">👨‍🔧 Technician Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Technician:</span>
                <span className="info-value">
                  {appointment.technicianName || (
                    <span className="not-assigned">Not assigned yet</span>
                  )}
                </span>
              </div>
              {appointment.technicianSpecialization && (
                <div className="info-item">
                  <span className="info-label">Specialization:</span>
                  <span className="info-value">{appointment.technicianSpecialization}</span>
                </div>
              )}
            </div>
          </div>

          {/* Services Info */}
          <div className="detail-section">
            <h3 className="section-title">🔧 Services</h3>
            <div className="services-list">
              {appointment.servicePackageName && (
                <div className="service-item package">
                  <div className="service-icon">📦</div>
                  <div className="service-info">
                    <h4>{appointment.servicePackageName}</h4>
                    <p className="service-type">Service Package</p>
                  </div>
                </div>
              )}
              
              {appointment.serviceItems && appointment.serviceItems.length > 0 && (
                <>
                  <h4 className="subsection-title">Additional Services:</h4>
                  {appointment.serviceItems.map((item, index) => (
                    <div key={index} className="service-item individual">
                      <div className="service-icon">🔧</div>
                      <div className="service-info">
                        <h4>{item.name}</h4>
                        <p className="service-type">Individual Service</p>
                      </div>
                      <div className='cost-value'>{formatCurrency(item.price)}</div>
                    </div>
                  ))}
                </>
              )}
              
              {!appointment.servicePackageName && (!appointment.serviceItems || appointment.serviceItems.length === 0) && (
                <p className="no-services">No services specified</p>
              )}
            </div>
          </div>

          {/* Cost Info */}
          <div className="detail-section cost-section">
            <div className="cost-summary">
              <span className="cost-label">Estimated Cost:</span>
              <span className="cost-value">{formatCurrency(appointment.estimatedCost)}</span>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  )
}

AppointmentDetail.propTypes = {
  appointment: PropTypes.object,
  onClose: PropTypes.func.isRequired
}

export default AppointmentDetail
