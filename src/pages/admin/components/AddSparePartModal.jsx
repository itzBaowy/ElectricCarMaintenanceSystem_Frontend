import { useState } from 'react'
import sparePartService from '../../../api/sparePartService'
import '../../../styles/AddSparePartModal.css'

const AddSparePartModal = ({ onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    partNumber: '',
    name: '',
    unitPrice: ''
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

    if (!formData.partNumber.trim()) {
      errors.partNumber = 'Part number is required'
    }

    if (!formData.name.trim()) {
      errors.name = 'Name is required'
    }

    if (!formData.unitPrice || formData.unitPrice <= 0) {
      errors.unitPrice = 'Unit price must be greater than 0'
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

      const createData = {
        partNumber: formData.partNumber.trim(),
        name: formData.name.trim(),
        unitPrice: parseFloat(formData.unitPrice)
      }

      const response = await sparePartService.createSparePart(createData)

      if (response.code === 1000) {
        onAdd(response.result)
        onClose()
      } else {
        setError(response.message || 'Failed to create spare part')
      }
    } catch (err) {
      console.error('Error creating spare part:', err)
      setError(err.response?.data?.message || err.message || 'An error occurred while creating')
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
          <h2>Add New Spare Part</h2>
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
            </div>

            <div className="form-note">
              <span className="note-icon"></span>
              <span className="note-text">
                All fields are required.
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
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-small"></span>
                  Creating...
                </>
              ) : (
                ' Create Spare Part'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddSparePartModal
