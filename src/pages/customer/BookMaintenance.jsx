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
          alert('Xe chưa đến hạn bảo dưỡng')
        }
      } else {
        logger.error('Failed to load recommendations:', result.message)
        setRecommendations([])
        setSelectedRecommendation(null)
        alert(result.message || 'Xe chưa đến hạn bảo dưỡng')
      }
    } catch (error) {
      logger.error('Error loading recommendations:', error)
      setRecommendations([])
      setSelectedRecommendation(null)
      alert('Không thể tải đề xuất bảo dưỡng')
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
      alert('Vui lòng chọn trung tâm bảo dưỡng')
      return false
    }

    if (!selectedRecommendation) {
      alert('Không có gói bảo dưỡng được đề xuất cho xe này')
      return false
    }

    if (!appointmentDate) {
      alert('Vui lòng chọn ngày và giờ hẹn')
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
        alert('✅ Đặt lịch bảo dưỡng thành công! Trạng thái: PENDING')
        if (onAppointmentCreated) {
          onAppointmentCreated(result.data)
        }
        onClose()
      } else {
        alert(`❌ Đặt lịch thất bại: ${result.message}`)
      }
    } catch (error) {
      logger.error('Error creating appointment:', error)
      alert('❌ Có lỗi xảy ra khi đặt lịch bảo dưỡng')
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
        return '⚠️ Xe đã bỏ lỡ mốc bảo dưỡng (theo KM và thời gian)'
      case 'MISSED_MILESTONES_KM':
        return '⚠️ Xe đã bỏ lỡ mốc bảo dưỡng (theo KM)'
      case 'MISSED_MILESTONES_TIME':
        return '⚠️ Xe đã bỏ lỡ mốc bảo dưỡng (theo thời gian)'
      case 'DUE_BY_KM':
        return '🔧 Đến hạn bảo dưỡng theo KM'
      case 'DUE_BY_TIME':
        return '📅 Đến hạn bảo dưỡng theo thời gian'
      default:
        return '🔧 Đề xuất bảo dưỡng'
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content book-maintenance-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>📅 Đặt Lịch Bảo Dưỡng</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="book-maintenance-form">
          {/* Vehicle Information */}
          <div className="form-section">
            <h3>🚗 Thông Tin Xe</h3>
            <div className="vehicle-info-grid">
              <div className="form-group">
                <label>Dòng Xe</label>
                <input
                  type="text"
                  value={vehicleModel?.name || 'N/A'}
                  disabled
                  className="disabled-input"
                />
              </div>
              <div className="form-group">
                <label>Biển Số</label>
                <input
                  type="text"
                  value={vehicle?.licensePlate || 'N/A'}
                  disabled
                  className="disabled-input"
                />
              </div>
              <div className="form-group">
                <label>Số VIN</label>
                <input
                  type="text"
                  value={vehicle?.vin || 'N/A'}
                  disabled
                  className="disabled-input"
                />
              </div>
              <div className="form-group">
                <label>Số KM Hiện Tại</label>
                <input
                  type="text"
                  value={vehicle?.currentKm ? parseInt(vehicle.currentKm).toLocaleString() + ' km' : 'N/A'}
                  disabled
                  className="disabled-input"
                />
              </div>
              <div className="form-group">
                <label>Tháng/Năm Mua</label>
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
            <h3>🏢 Chọn Trung Tâm Bảo Dưỡng <span className="required">*</span></h3>
            <div className="centers-list">
              {centers.length === 0 ? (
                <p className="no-data">Không có trung tâm nào</p>
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
              <h3>🔧 Gói Bảo Dưỡng Đề Xuất</h3>
              
              {loadingRecommendations ? (
                <p className="loading-text">⏳ Đang tải đề xuất bảo dưỡng...</p>
              ) : recommendations.length === 0 ? (
                <p className="no-data">❌ Xe chưa đến hạn bảo dưỡng</p>
              ) : (
                <div className="recommendations-list">
                  {recommendations.map((rec, index) => (
                    <div key={index} className="recommendation-item">
                      <div className="recommendation-header">
                        <h4>📦 Gói bảo dưỡng mốc {rec.milestoneKm.toLocaleString()} km</h4>
                        <p className="recommendation-reason">{getReasonText(rec.reason)}</p>
                      </div>
                      
                      <div className="recommendation-details">
                        {rec.dueAtKm > 0 && (
                          <p className="due-info">🚗 Đến hạn sau: <strong>{rec.dueAtKm.toLocaleString()} km</strong></p>
                        )}
                        {rec.dueAtMonths > 0 && (
                          <p className="due-info">📅 Đến hạn sau: <strong>{rec.dueAtMonths} tháng</strong></p>
                        )}
                        <p className="estimated-total">💰 Tổng chi phí ước tính: <strong>{formatCurrency(rec.estimatedTotal)}</strong></p>
                        <p className="items-count">📋 Gồm <strong>{rec.items.length}</strong> hạng mục</p>
                      </div>

                      <button
                        type="button"
                        className="btn-view-details"
                        onClick={() => setShowItemsDetail(!showItemsDetail)}
                      >
                        {showItemsDetail ? '▼ Ẩn chi tiết' : '▶ Xem chi tiết các hạng mục'}
                      </button>

                      {showItemsDetail && (
                        <div className="items-detail">
                          <h5>Chi Tiết Các Hạng Mục Bảo Dưỡng:</h5>
                          <div className="items-grid">
                            {rec.items.map((item, idx) => (
                              <div key={idx} className="service-item-card">
                                <div className="item-header">
                                  <span className={`action-badge ${item.actionType.toLowerCase()}`}>
                                    {item.actionType === 'REPLACE' ? '🔄 Thay thế' : '🔍 Kiểm tra'}
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
              <h3>� Chọn Ngày & Giờ Hẹn <span className="required">*</span></h3>
              <div className="form-group">
                <label>Ngày và Giờ <span className="required">*</span></label>
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

          {/* Summary */}
          {selectedRecommendation && (
            <div className="form-section summary-section">
              <h3>📝 Tóm Tắt Đặt Lịch</h3>
              <div className="summary-content">
                <div className="summary-row">
                  <span className="summary-label">Trung tâm:</span>
                  <span className="summary-value">{selectedCenter?.name}</span>
                </div>
                <div className="summary-row">
                  <span className="summary-label">Xe:</span>
                  <span className="summary-value">{vehicle?.licensePlate} - {vehicleModel?.name}</span>
                </div>
                <div className="summary-row">
                  <span className="summary-label">Gói bảo dưỡng:</span>
                  <span className="summary-value">Mốc {selectedRecommendation.milestoneKm.toLocaleString()} km</span>
                </div>
                <div className="summary-row">
                  <span className="summary-label">Tổng chi phí:</span>
                  <span className="summary-value cost">{formatCurrency(selectedRecommendation.estimatedTotal)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn-secondary" disabled={loading}>
              ✕ Hủy
            </button>
            <button 
              type="submit" 
              className="btn-primary" 
              disabled={loading || !selectedCenter || !selectedRecommendation || !appointmentDate}
            >
              {loading ? '⏳ Đang xử lý...' : '✓ Xác Nhận Đặt Lịch'}
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
