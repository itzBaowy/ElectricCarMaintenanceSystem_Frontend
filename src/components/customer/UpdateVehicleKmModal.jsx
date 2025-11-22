import { useState } from 'react'
import PropTypes from 'prop-types'
import vehicleService from '../../api/vehicleService'
import logger from '../../utils/logger'
import '../../styles/UpdateVehicleKmModal.css'

const UpdateVehicleKmModal = ({ vehicle, onClose, onSuccess }) => {
  const [currentKm, setCurrentKm] = useState(vehicle?.currentKm || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Validation
    const kmValue = parseInt(currentKm)
    if (isNaN(kmValue) || kmValue < 0) {
      setError('Please enter a valid kilometer value')
      return
    }

    if (kmValue < parseInt(vehicle.currentKm)) {
      setError('New kilometer value cannot be less than current value')
      return
    }

    setLoading(true)
    try {
      const result = await vehicleService.updateCurrentKm(vehicle.id, kmValue)
      
      if (result.success) {
        alert('✅ Vehicle kilometer updated successfully!')
        if (onSuccess) {
          onSuccess(result.data)
        }
        onClose()
      } else {
        setError(result.message || 'Failed to update kilometer')
      }
    } catch (error) {
      logger.error('Error updating vehicle KM:', error)
      setError('An error occurred while updating kilometer')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content update-km-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🚗 Update Vehicle Kilometer</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="update-km-form">
          <div className="vehicle-info-display">
            <h3>{vehicle?.licensePlate}</h3>
            <p>Current KM: {parseInt(vehicle?.currentKm || 0).toLocaleString()} km</p>
          </div>

          <div className="form-group">
            <label htmlFor="currentKm">
              New Current Kilometer <span className="required">*</span>
            </label>
            <input
              type="number"
              id="currentKm"
              value={currentKm}
              onChange={(e) => setCurrentKm(e.target.value)}
              min={parseInt(vehicle?.currentKm || 0)}
              step="1"
              required
              placeholder="Enter new kilometer reading"
              className="km-input"
            />
            <small className="input-hint">
              Enter the current odometer reading of your vehicle
            </small>
          </div>

          {error && (
            <div className="error-message">
              ⚠️ {error}
            </div>
          )}

          <div className="info-box">
            <p>
              <strong>📌 Important:</strong> Please ensure the kilometer reading is accurate. 
              This information will be used for maintenance scheduling and service recommendations.
            </p>
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              onClick={onClose} 
              className="btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn-primary"
              disabled={loading}
            >
              {loading ? '⏳ Updating...' : '✓ Update Kilometer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

UpdateVehicleKmModal.propTypes = {
  vehicle: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func
}

export default UpdateVehicleKmModal
