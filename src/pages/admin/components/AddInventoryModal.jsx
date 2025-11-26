import { useState, useEffect } from 'react'
import inventoryService from '../../../api/inventoryService'
import sparePartService from '../../../api/sparePartService'
import '../../../styles/AddSparePartModal.css'

const AddInventoryModal = ({ serviceCenterId, serviceCenterName, onClose, onAdd }) => {
  const [spareParts, setSpareParts] = useState([])
  const [formData, setFormData] = useState({
    sparePartId: '',
    changeQuantity: '',
    minStock: '',
    reason: 'Add spare part to service center inventory'
  })
  const [loading, setLoading] = useState(false)
  const [loadingSpareParts, setLoadingSpareParts] = useState(true)
  const [error, setError] = useState(null)
  const [validationErrors, setValidationErrors] = useState({})
  const [selectedSparePart, setSelectedSparePart] = useState(null)

  useEffect(() => {
    fetchSpareParts()
  }, [])

  const fetchSpareParts = async () => {
    try {
      setLoadingSpareParts(true)
      const response = await sparePartService.getAllSpareParts(0, 1000)
      
      if (response.code === 1000 && response.result) {
        const activeParts = response.result.content?.filter(part => part.active) || []
        setSpareParts(activeParts)
      } else {
        setError('Failed to fetch spare parts')
      }
    } catch (err) {
      console.error('Error fetching spare parts:', err)
      setError('An error occurred while fetching spare parts')
    } finally {
      setLoadingSpareParts(false)
    }
  }

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

  const handleSparePartChange = (e) => {
    const sparePartId = e.target.value
    const sparePart = spareParts.find(part => part.id === parseInt(sparePartId))
    
    setFormData(prev => ({
      ...prev,
      sparePartId: sparePartId
    }))
    setSelectedSparePart(sparePart)
    
    // Clear validation error
    if (validationErrors.sparePartId) {
      setValidationErrors(prev => ({
        ...prev,
        sparePartId: null
      }))
    }
  }

  const validateForm = () => {
    const errors = {}

    if (!formData.sparePartId) {
      errors.sparePartId = 'Please select a spare part'
    }

    if (!formData.changeQuantity || formData.changeQuantity <= 0) {
      errors.changeQuantity = 'Quantity must be greater than 0'
    }

    if (formData.minStock === '' || formData.minStock < 0) {
      errors.minStock = 'Minimum stock level must be 0 or greater'
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

      const requestData = {
        changeQuantity: parseInt(formData.changeQuantity),
        reason: formData.reason.trim(),
        serviceCenterId: parseInt(serviceCenterId),
        minStock: parseInt(formData.minStock)
      }

      const response = await inventoryService.updateInventoryStock(
        parseInt(formData.sparePartId),
        requestData
      )

      if (response.code === 1000 || response.code === 0) {
        onAdd(response.result)
        onClose()
      } else {
        setError(response.message || 'Failed to add spare part to inventory')
      }
    } catch (err) {
      console.error('Error adding spare part to inventory:', err)
      setError(err.response?.data?.message || err.message || 'An error occurred while adding spare part')
    } finally {
      setLoading(false)
    }
  }

  const handleOverlayClick = (e) => {
    if (e.target.className === 'modal-overlay') {
      onClose()
    }
  }

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content add-spare-part-modal">
        <div className="modal-header">
          <h2>Add Spare Part to Inventory</h2>
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

            {/* Service Center Info */}
            <div className="info-section">
              <div className="info-label">Service Center:</div>
              <div className="info-value">{serviceCenterName}</div>
            </div>

            <div className="form-grid">
              {/* Spare Part Selection */}
              <div className="form-group full-width">
                <label htmlFor="sparePartId">
                  Spare Part <span className="required">*</span>
                </label>
                {loadingSpareParts ? (
                  <div className="loading-select">
                    <span className="spinner-small"></span>
                    Loading spare parts...
                  </div>
                ) : (
                  <>
                    <select
                      id="sparePartId"
                      name="sparePartId"
                      value={formData.sparePartId}
                      onChange={handleSparePartChange}
                      className={validationErrors.sparePartId ? 'error' : ''}
                    >
                      <option value="">Select a spare part</option>
                      {spareParts.map((part) => (
                        <option key={part.id} value={part.id}>
                          {part.partNumber} - {part.name}
                        </option>
                      ))}
                    </select>
                    {validationErrors.sparePartId && (
                      <span className="error-text">{validationErrors.sparePartId}</span>
                    )}
                  </>
                )}
              </div>

              {/* Selected Spare Part Info */}
              {selectedSparePart && (
                <div className="form-group full-width">
                  <div className="selected-part-info">
                    <div className="part-detail">
                      <span className="detail-label">Part Number:</span>
                      <span className="detail-value">{selectedSparePart.partNumber}</span>
                    </div>
                    <div className="part-detail">
                      <span className="detail-label">Name:</span>
                      <span className="detail-value">{selectedSparePart.name}</span>
                    </div>
                    <div className="part-detail">
                      <span className="detail-label">Unit Price:</span>
                      <span className="detail-value">
                        {new Intl.NumberFormat('vi-VN', {
                          style: 'currency',
                          currency: 'VND'
                        }).format(selectedSparePart.unitPrice)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Initial Quantity */}
              <div className="form-group">
                <label htmlFor="changeQuantity">
                  Initial Quantity <span className="required">*</span>
                </label>
                <input
                  type="number"
                  id="changeQuantity"
                  name="changeQuantity"
                  value={formData.changeQuantity}
                  onChange={handleChange}
                  className={validationErrors.changeQuantity ? 'error' : ''}
                  placeholder="Enter initial stock quantity"
                  min="1"
                  step="1"
                />
                {validationErrors.changeQuantity && (
                  <span className="error-text">{validationErrors.changeQuantity}</span>
                )}
                <div className="input-help">
                  <span>💡 Number of units to add to this service center</span>
                </div>
              </div>

              {/* Minimum Stock Level */}
              <div className="form-group">
                <label htmlFor="minStock">
                  Minimum Stock Level <span className="required">*</span>
                </label>
                <input
                  type="number"
                  id="minStock"
                  name="minStock"
                  value={formData.minStock}
                  onChange={handleChange}
                  className={validationErrors.minStock ? 'error' : ''}
                  placeholder="Set minimum stock threshold"
                  min="0"
                  step="1"
                />
                {validationErrors.minStock && (
                  <span className="error-text">{validationErrors.minStock}</span>
                )}
                <div className="input-help">
                  <span>🔔 Alert threshold for low stock warnings</span>
                </div>
              </div>

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
                  placeholder="Enter reason for adding this spare part"
                  rows="3"
                />
                {validationErrors.reason && (
                  <span className="error-text">{validationErrors.reason}</span>
                )}
              </div>
            </div>

            <div className="form-note">
              <span className="note-icon">ℹ️</span>
              <span className="note-text">
                This will add the selected spare part to the service center's inventory with the specified quantity.
              </span>
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
              disabled={loading || loadingSpareParts}
            >
              {loading ? (
                <>
                  <span className="spinner-small"></span>
                  Adding...
                </>
              ) : (
                '📦 Add to Inventory'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddInventoryModal
