import { useState } from 'react'
import PropTypes from 'prop-types'
import vehicleService from '../../api/vehicleService'
import logger from '../../utils/logger'
import '../../styles/UpdateVehicleKmModal.css'

const UpdateVehicleKmModal = ({ vehicle, onClose, onUpdate }) => {
  const [newKm, setNewKm] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validation
    const kmValue = parseInt(newKm)
    if (isNaN(kmValue) || kmValue < 0) {
      alert('Please enter a valid odometer reading (positive number)')
      return
    }

    if (vehicle?.currentKm && kmValue < parseInt(vehicle.currentKm)) {
      const confirm = window.confirm(
        `Warning: New odometer reading (${kmValue.toLocaleString()} km) is less than current recorded value (${parseInt(vehicle.currentKm).toLocaleString()} km).\n\nAre you sure you want to continue?`
      )
      if (!confirm) return
    }

    setLoading(true)
    try {
      const result = await vehicleService.updateCurrentKm(vehicle.id, kmValue)
      
      if (result.success) {
        alert('✅ Vehicle odometer updated successfully!')
        if (onUpdate) {
          onUpdate(result.data)
        }
        onClose()
      } else {
        alert(`❌ Update failed: ${result.message}`)
      }
    } catch (error) {
      logger.error('Error updating vehicle km:', error)
      alert('❌ An error occurred while updating odometer')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content update-km-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🔧 Update Vehicle Odometer</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="update-km-form">
          <div className="vehicle-info-section">
            <h3>Vehicle Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>License Plate:</label>
                <span>{vehicle?.licensePlate || 'N/A'}</span>
              </div>
              <div className="info-item">
                <label>VIN:</label>
                <span>{vehicle?.vin || 'N/A'}</span>
              </div>
              <div className="info-item">
                <label>Current Recorded Mileage:</label>
                <span className="current-km">
                  {vehicle?.currentKm ? parseInt(vehicle.currentKm).toLocaleString() + ' km' : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          <div className="form-section">
            <div className="form-group">
              <label htmlFor="newKm">
                New Odometer Reading <span className="required">*</span>
              </label>
              <input
                type="number"
                id="newKm"
                value={newKm}
                onChange={(e) => setNewKm(e.target.value)}
                placeholder="Enter odometer reading from vehicle (e.g., 25100)"
                className="km-input"
                min="0"
                required
                autoFocus
              />
              <small className="input-hint">
                💡 Enter the actual odometer reading from the vehicle's dashboard
              </small>
            </div>

            {newKm && !isNaN(parseInt(newKm)) && vehicle?.currentKm && (
              <div className="km-comparison">
                <div className="comparison-row">
                  <span className="label">Current:</span>
                  <span className="value">{parseInt(vehicle.currentKm).toLocaleString()} km</span>
                </div>
                <div className="comparison-row">
                  <span className="label">New:</span>
                  <span className="value">{parseInt(newKm).toLocaleString()} km</span>
                </div>
                <div className="comparison-row difference">
                  <span className="label">Difference:</span>
                  <span className={`value ${parseInt(newKm) >= parseInt(vehicle.currentKm) ? 'positive' : 'negative'}`}>
                    {parseInt(newKm) >= parseInt(vehicle.currentKm) ? '+' : ''}
                    {(parseInt(newKm) - parseInt(vehicle.currentKm)).toLocaleString()} km
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="info-message">
            <p>
              ℹ️ <strong>Important:</strong> This will update the vehicle's odometer reading in the system. 
              Make sure to verify the actual reading from the vehicle's dashboard.
            </p>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn-secondary" disabled={loading}>
              ✕ Cancel
            </button>
            <button 
              type="submit" 
              className="btn-primary" 
              disabled={loading || !newKm}
            >
              {loading ? '⏳ Updating...' : '✓ Update Odometer'}
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
  onUpdate: PropTypes.func
}

export default UpdateVehicleKmModal
