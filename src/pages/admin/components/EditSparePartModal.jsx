import { useState, useEffect } from 'react'
import sparePartService from '../../../api/sparePartService'
import '../../../styles/EditSparePartModal.css'

const EditSparePartModal = ({ sparePart, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    partNumber: '',
    name: '',
    unitPrice: '',
    quantityInStock: '',
    minimumStockLevel: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [validationErrors, setValidationErrors] = useState({})

  useEffect(() => {
    if (sparePart) {
      setFormData({
        partNumber: sparePart.partNumber || '',
        name: sparePart.name || '',
        unitPrice: sparePart.unitPrice || '',
        quantityInStock: sparePart.quantityInStock || '',
        minimumStockLevel: sparePart.minimumStockLevel || ''
      })
    }
  }, [sparePart])

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

    if (!formData.partNumber.trim()) {
      errors.partNumber = 'Part number is required'
    }

    if (!formData.name.trim()) {
      errors.name = 'Name is required'
    }

    if (!formData.unitPrice || formData.unitPrice <= 0) {
      errors.unitPrice = 'Unit price must be greater than 0'
    }

    if (!formData.quantityInStock || formData.quantityInStock < 0) {
      errors.quantityInStock = 'Quantity must be 0 or greater'
    }

    if (!formData.minimumStockLevel || formData.minimumStockLevel < 0) {
      errors.minimumStockLevel = 'Minimum stock level must be 0 or greater'
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

      const updateData = {
        partNumber: formData.partNumber.trim(),
        name: formData.name.trim(),
        unitPrice: parseFloat(formData.unitPrice),
        quantityInStock: parseInt(formData.quantityInStock),
        minimumStockLevel: parseInt(formData.minimumStockLevel)
      }

      const response = await sparePartService.updateSparePart(sparePart.id, updateData)

      if (response.code === 1000) {
        onUpdate(response.result)
        onClose()
      } else {
        setError(response.message || 'Failed to update spare part')
      }
    } catch (err) {
      console.error('Error updating spare part:', err)
      setError(err.response?.data?.message || err.message || 'An error occurred while updating')
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
      <div className="modal-content edit-spare-part-modal">
        <div className="modal-header">
          <h2>Edit Spare Part</h2>
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

            <div className="form-grid">
              {/* Part Number */}
              <div className="form-group">
                <label htmlFor="partNumber">
                  Part Number <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="partNumber"
                  name="partNumber"
                  value={formData.partNumber}
                  onChange={handleChange}
                  className={validationErrors.partNumber ? 'error' : ''}
                  placeholder="e.g., FLT-VF3"
                />
                {validationErrors.partNumber && (
                  <span className="error-text">{validationErrors.partNumber}</span>
                )}
              </div>

              {/* Name */}
              <div className="form-group full-width">
                <label htmlFor="name">
                  Name <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={validationErrors.name ? 'error' : ''}
                  placeholder="e.g., Cabin air filter VF 3"
                />
                {validationErrors.name && (
                  <span className="error-text">{validationErrors.name}</span>
                )}
              </div>

              {/* Unit Price */}
              <div className="form-group">
                <label htmlFor="unitPrice">
                  Unit Price (VND) <span className="required">*</span>
                </label>
                <input
                  type="number"
                  id="unitPrice"
                  name="unitPrice"
                  value={formData.unitPrice}
                  onChange={handleChange}
                  className={validationErrors.unitPrice ? 'error' : ''}
                  placeholder="0"
                  min="0"
                  step="1000"
                />
                {validationErrors.unitPrice && (
                  <span className="error-text">{validationErrors.unitPrice}</span>
                )}
              </div>

              {/* Quantity In Stock */}
              <div className="form-group">
                <label htmlFor="quantityInStock">
                  Quantity in Stock <span className="required">*</span>
                </label>
                <input
                  type="number"
                  id="quantityInStock"
                  name="quantityInStock"
                  value={formData.quantityInStock}
                  onChange={handleChange}
                  className={validationErrors.quantityInStock ? 'error' : ''}
                  placeholder="0"
                  min="0"
                />
                {validationErrors.quantityInStock && (
                  <span className="error-text">{validationErrors.quantityInStock}</span>
                )}
              </div>

              {/* Minimum Stock Level */}
              <div className="form-group">
                <label htmlFor="minimumStockLevel">
                  Minimum Stock Level <span className="required">*</span>
                </label>
                <input
                  type="number"
                  id="minimumStockLevel"
                  name="minimumStockLevel"
                  value={formData.minimumStockLevel}
                  onChange={handleChange}
                  className={validationErrors.minimumStockLevel ? 'error' : ''}
                  placeholder="0"
                  min="0"
                />
                {validationErrors.minimumStockLevel && (
                  <span className="error-text">{validationErrors.minimumStockLevel}</span>
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
                'Update Spare Part'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditSparePartModal
