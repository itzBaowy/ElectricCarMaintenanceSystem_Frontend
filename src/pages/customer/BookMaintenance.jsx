import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import appointmentService from '../../api/appointmentService'
import maintenanceService from '../../api/maintenanceService'
import centerService from '../../api/centerService'
import logger from '../../utils/logger'
import '../../styles/BookMaintenance.css'

const BookMaintenance = ({ vehicle, vehicleModel, onClose, onAppointmentCreated }) => {
  const [loading, setLoading] = useState(false)
  const [loadingRecommendations, setLoadingRecommendations] = useState(false)
  const [centers, setCenters] = useState([])
  const [selectedCenter, setSelectedCenter] = useState(null)
  const [recommendations, setRecommendations] = useState([])
  const [selectedRecommendation, setSelectedRecommendation] = useState(null)
  const [showItemsDetail, setShowItemsDetail] = useState(false)
  const [appointmentDate, setAppointmentDate] = useState('')
  const [agreedToTerms, setAgreedToTerms] = useState(false)

  // Load centers when component mounts
  useEffect(() => {
    loadCenters()
  }, [])

  // Load recommendations when center is selected
  useEffect(() => {
    if (selectedCenter && vehicle?.id) {
      loadMaintenanceRecommendations()
    }
  }, [selectedCenter, vehicle])

  const loadCenters = async () => {
    try {
      const result = await centerService.getAllCenters()
      if (result.success) {
        const centerList = Array.isArray(result.data) ? result.data : []
        setCenters(centerList)
        logger.log('Centers loaded:', centerList)
      } else {
        logger.error('Failed to load centers:', result.message)
        setCenters([])
      }
    } catch (error) {
      logger.error('Error loading centers:', error)
      setCenters([])
    }
  }

  const loadMaintenanceRecommendations = async () => {
    setLoadingRecommendations(true)
    try {
      const result = await maintenanceService.getMaintenanceRecommendations(vehicle.id)
      
      if (result.success) {
        const recommendationList = Array.isArray(result.data) ? result.data : []
        setRecommendations(recommendationList)
        logger.log('Maintenance recommendations loaded:', recommendationList)
        
        // Auto-select first recommendation if available
        if (recommendationList.length > 0) {
          setSelectedRecommendation(recommendationList[0])
        } else {
          setSelectedRecommendation(null)
          alert('Vehicle is not due for maintenance')
        }
      } else {
        logger.error('Failed to load recommendations:', result.message)
        setRecommendations([])
        setSelectedRecommendation(null)
        alert(result.message || 'Vehicle is not due for maintenance')
      }
    } catch (error) {
      logger.error('Error loading recommendations:', error)
      setRecommendations([])
      setSelectedRecommendation(null)
      alert('Unable to load maintenance recommendations')
    } finally {
      setLoadingRecommendations(false)
    }
  }

  const handleCenterSelect = (center) => {
    setSelectedCenter(center)
    // Reset recommendations when changing center
    setRecommendations([])
    setSelectedRecommendation(null)
    setShowItemsDetail(false)
  }

  const validateForm = () => {
    if (!selectedCenter) {
      alert('Please select a maintenance center')
      return false
    }

    if (!selectedRecommendation) {
      alert('No maintenance package recommended for this vehicle')
      return false
    }

    if (!appointmentDate) {
      alert('Please select appointment date and time')
      return false
    }

    if (!agreedToTerms) {
      alert('Please agree to the terms and responsibility declaration')
      return false
    }

    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)
    try {
      // Format datetime: "YYYY-MM-DD HH:mm" (remove T and seconds)
      const formattedDate = appointmentDate.replace('T', ' ')
      
      // Prepare appointment data according to new API format
      const appointmentData = {
        appointmentDate: formattedDate,
        vehicleId: parseInt(vehicle.id),
        centerId: selectedCenter.id
      }

      logger.log('Submitting appointment data:', appointmentData)
      const result = await appointmentService.createAppointment(appointmentData)
      
      if (result.success) {
        alert('✅ Maintenance appointment created successfully! Status: PENDING')
        if (onAppointmentCreated) {
          onAppointmentCreated(result.data)
        }
        onClose()
      } else {
        alert(`❌ Appointment failed: ${result.message}`)
      }
    } catch (error) {
      logger.error('Error creating appointment:', error)
      alert('❌ An error occurred while creating appointment')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  // Get minimum datetime (current time + 1 hour)
  const getMinDateTime = () => {
    const now = new Date()
    now.setHours(now.getHours() + 1)
    return now.toISOString().slice(0, 16)
  }

  const getReasonText = (reason) => {
    switch (reason) {
      case 'MISSED_MILESTONES_KM_TIME':
        return '⚠️ Vehicle missed maintenance milestone (by KM and time)'
      case 'MISSED_MILESTONES_KM':
        return '⚠️ Vehicle missed maintenance milestone (by KM)'
      case 'MISSED_MILESTONES_TIME':
        return '⚠️ Vehicle missed maintenance milestone (by time)'
      case 'DUE_BY_KM':
        return '🔧 Due for maintenance by KM'
      case 'DUE_BY_TIME':
        return '📅 Due for maintenance by time'
      default:
        return '🔧 Recommended maintenance'
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content book-maintenance-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>📅 Book Maintenance Appointment</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="book-maintenance-form">
          {/* Vehicle Information */}
          <div className="form-section">
            <h3>🚗 Vehicle Information</h3>
            <div className="vehicle-info-grid">
              <div className="form-group">
                <label>Model</label>
                <input
                  type="text"
                  value={vehicleModel?.name || 'N/A'}
                  disabled
                  className="disabled-input"
                />
              </div>
              <div className="form-group">
                <label>License Plate</label>
                <input
                  type="text"
                  value={vehicle?.licensePlate || 'N/A'}
                  disabled
                  className="disabled-input"
                />
              </div>
              <div className="form-group">
                <label>VIN Number</label>
                <input
                  type="text"
                  value={vehicle?.vin || 'N/A'}
                  disabled
                  className="disabled-input"
                />
              </div>
              <div className="form-group">
                <label>Current Mileage</label>
                <input
                  type="text"
                  value={vehicle?.currentKm ? parseInt(vehicle.currentKm).toLocaleString() + ' km' : 'N/A'}
                  disabled
                  className="disabled-input"
                />
              </div>
              <div className="form-group">
                <label>Purchase Date (Month/Year)</label>
                <input
                  type="text"
                  value={vehicle?.purchaseYear || 'N/A'}
                  disabled
                  className="disabled-input"
                />
              </div>
            </div>
          </div>

          {/* Center Selection */}
          <div className="form-section">
            <h3>🏢 Select Maintenance Center <span className="required">*</span></h3>
            <div className="centers-list">
              {centers.length === 0 ? (
                <p className="no-data">No centers available</p>
              ) : (
                centers.map(center => (
                  <label
                    key={center.id}
                    className={`center-item ${selectedCenter?.id === center.id ? 'selected' : ''}`}
                  >
                    <input
                      type="radio"
                      name="center"
                      value={center.id}
                      checked={selectedCenter?.id === center.id}
                      onChange={() => handleCenterSelect(center)}
                    />
                    <div className="center-info">
                      <h4>{center.name}</h4>
                      <p className="center-address">📍 {center.address}</p>
                      {center.district && <p className="center-district">{center.district}</p>}
                    </div>
                  </label>
                ))
              )}
            </div>
          </div>

          {/* Maintenance Recommendations */}
          {selectedCenter && (
            <div className="form-section">
              <h3>🔧 Recommended Maintenance Package</h3>
              
              {loadingRecommendations ? (
                <p className="loading-text">⏳ Loading maintenance recommendations...</p>
              ) : recommendations.length === 0 ? (
                <p className="no-data">❌ Vehicle is not due for maintenance</p>
              ) : (
                <div className="recommendations-list">
                  {recommendations.map((rec, index) => (
                    <div key={index} className="recommendation-item">
                      <div className="recommendation-header">
                        <h4>📦 Maintenance package at {rec.milestoneKm.toLocaleString()} km milestone</h4>
                        <p className="recommendation-reason">{getReasonText(rec.reason)}</p>
                      </div>
                      
                      <div className="recommendation-details">
                        {rec.dueAtKm > 0 && (
                          <p className="due-info">🚗 Due in: <strong>{rec.dueAtKm.toLocaleString()} km</strong></p>
                        )}
                        {rec.dueAtMonths > 0 && (
                          <p className="due-info">📅 Due in: <strong>{rec.dueAtMonths} months</strong></p>
                        )}
                        <p className="estimated-total">💰 Estimated total cost: <strong>{formatCurrency(rec.estimatedTotal)}</strong></p>
                        <p className="items-count">📋 Includes <strong>{rec.items.length}</strong> service items</p>
                      </div>

                      <button
                        type="button"
                        className="btn-view-details"
                        onClick={() => setShowItemsDetail(!showItemsDetail)}
                      >
                        {showItemsDetail ? '▼ Hide details' : '▶ View service items'}
                      </button>

                      {showItemsDetail && (
                        <div className="items-detail">
                          <h5>Service Items Details:</h5>
                          <div className="items-grid">
                            {rec.items.map((item, idx) => (
                              <div key={idx} className="service-item-card">
                                <div className="item-header">
                                  <span className={`action-badge ${item.actionType.toLowerCase()}`}>
                                    {item.actionType === 'REPLACE' ? '🔄 Replace' : '🔍 Check'}
                                  </span>
                                  <span className="item-price">{formatCurrency(item.price)}</span>
                                </div>
                                <h6>{item.serviceItem.name}</h6>
                                <p className="item-description">{item.serviceItem.description}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Appointment Date */}
          {selectedRecommendation && (
            <div className="form-section">
              <h3>🗓️ Select Date & Time <span className="required">*</span></h3>
              <div className="form-group">
                <label>Date and Time <span className="required">*</span></label>
                <input
                  type="datetime-local"
                  value={appointmentDate}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                  min={getMinDateTime()}
                  required
                  className="datetime-input"
                />
              </div>
            </div>
          )}

          {/* Agreement Checkbox */}
          {selectedRecommendation && (
            <div className="form-section agreement-section">
              <div className="agreement-box">
                <label className="agreement-label">
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="agreement-checkbox"
                  />
                  <span className="agreement-text">
                    <strong>I agree</strong> and take full responsibility for any inaccurate information provided 
                    regarding my vehicle details, mileage, and maintenance history. I understand that providing 
                    incorrect information may affect the service quality and warranty coverage.
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* Summary */}
          {selectedRecommendation && (
            <div className="form-section summary-section">
              <h3>📝 Appointment Summary</h3>
              <div className="summary-content">
                <div className="summary-row">
                  <span className="summary-label">Center:</span>
                  <span className="summary-value">{selectedCenter?.name}</span>
                </div>
                <div className="summary-row">
                  <span className="summary-label">Vehicle:</span>
                  <span className="summary-value">{vehicle?.licensePlate} - {vehicleModel?.name}</span>
                </div>
                <div className="summary-row">
                  <span className="summary-label">Maintenance package:</span>
                  <span className="summary-value">Milestone {selectedRecommendation.milestoneKm.toLocaleString()} km</span>
                </div>
                <div className="summary-row">
                  <span className="summary-label">Total cost:</span>
                  <span className="summary-value cost">{formatCurrency(selectedRecommendation.estimatedTotal)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn-secondary" disabled={loading}>
              ✕ Cancel
            </button>
            <button 
              type="submit" 
              className="btn-primary" 
              disabled={loading || !selectedCenter || !selectedRecommendation || !appointmentDate || !agreedToTerms}
            >
              {loading ? '⏳ Processing...' : '✓ Confirm Appointment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

BookMaintenance.propTypes = {
  vehicle: PropTypes.object.isRequired,
  vehicleModel: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  onAppointmentCreated: PropTypes.func
}

export default BookMaintenance
