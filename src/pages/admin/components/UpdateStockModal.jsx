import { useState } from 'react'
import sparePartService from '../../../api/sparePartService'
import '../../../styles/UpdateStockModal.css'

const UpdateStockModal = ({ sparePart, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    changeQuantity: '',
    reason: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [validationErrors, setValidationErrors] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: null
      }))
    }
  }

  const validateForm = () => {
    const errors = {}

    if (!formData.changeQuantity || formData.changeQuantity === '0') {
      errors.changeQuantity = 'Change quantity cannot be 0'
    }

    const newStock = (sparePart.quantityInStock || 0) + parseInt(formData.changeQuantity || 0)
    if (newStock < 0) {
      errors.changeQuantity = `Insufficient stock. Current: ${sparePart.quantityInStock}, Change: ${formData.changeQuantity}`
    }

    if (!formData.reason.trim()) {
      errors.reason = 'Reason is required'
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      setLoading(true)
      setError(null)

      const response = await sparePartService.updateSparePartStock(
        sparePart.id,
        parseInt(formData.changeQuantity),
        formData.reason.trim()
      )

      if (response.code === 1000) {
        onUpdate(response.result)
        onClose()
      } else {
        setError(response.message || 'Failed to update stock')
      }
    } catch (err) {
      console.error('Error updating stock:', err)
      setError(err.response?.data?.message || err.message || 'An error occurred while updating stock')
    } finally {
      setLoading(false)
    }
  }

  const handleOverlayClick = (e) => {
    if (e.target.className === 'modal-overlay') {
      onClose()
    }
  }

  const calculatedNewStock = (sparePart?.quantityInStock || 0) + parseInt(formData.changeQuantity || 0)

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content update-stock-modal">
        <div className="modal-header">
          <h2>Update Stock Quantity</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div className="error-alert">
                <span className="error-icon">⚠️</span>
                {error}
              </div>
            )}

            {/* Spare Part Info */}
            <div className="spare-part-info">
              <h3>{sparePart?.name}</h3>
              <p className="part-number">Part Number: {sparePart?.partNumber}</p>
              <div className="current-stock">
                <span className="label">Current Stock:</span>
                <span className="value">{sparePart?.quantityInStock || 0} units</span>
              </div>
            </div>

            <div className="form-grid">
              {/* Change Quantity */}
              <div className="form-group full-width">
                <label htmlFor="changeQuantity">
                  Change Quantity <span className="required">*</span>
                </label>
                <input
                  type="number"
                  id="changeQuantity"
                  name="changeQuantity"
                  value={formData.changeQuantity}
                  onChange={handleChange}
                  className={validationErrors.changeQuantity ? 'error' : ''}
                  placeholder="Enter positive number to add, negative to subtract"
                  step="1"
                />
                {validationErrors.changeQuantity && (
                  <span className="error-text">{validationErrors.changeQuantity}</span>
                )}
                <div className="input-help">
                  <span>💡 Examples: +10 to add 10 units, -5 to subtract 5 units</span>
                </div>
              </div>

              {/* New Stock Preview */}
              {formData.changeQuantity && !validationErrors.changeQuantity && (
                <div className="form-group full-width">
                  <div className={`stock-preview ${calculatedNewStock < sparePart?.minimumStockLevel ? 'warning' : 'success'}`}>
                    <div className="preview-item">
                      <span className="preview-label">Current:</span>
                      <span className="preview-value">{sparePart?.quantityInStock || 0}</span>
                    </div>
                    <div className="preview-arrow">→</div>
                    <div className="preview-item">
                      <span className="preview-label">New:</span>
                      <span className="preview-value">{calculatedNewStock}</span>
                    </div>
                    {calculatedNewStock < sparePart?.minimumStockLevel && (
                      <div className="preview-warning">
                        ⚠️ Below minimum stock level ({sparePart?.minimumStockLevel})
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Reason */}
              <div className="form-group full-width">
                <label htmlFor="reason">
                  Reason <span className="required">*</span>
                </label>
                <textarea
                  id="reason"
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  className={validationErrors.reason ? 'error' : ''}
                  placeholder="Enter reason for stock update (e.g., New shipment arrived, Damaged items removed, etc.)"
                  rows="4"
                />
                {validationErrors.reason && (
                  <span className="error-text">{validationErrors.reason}</span>
                )}
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-small"></span>
                  Updating...
                </>
              ) : (
                'Update Stock'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default UpdateStockModal
