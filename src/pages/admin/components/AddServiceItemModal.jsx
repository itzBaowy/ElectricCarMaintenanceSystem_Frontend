import { useState } from 'react'
import PropTypes from 'prop-types'
import serviceItemService from '../../../api/serviceItemService'
import '../../../styles/AddServiceItemModal.css'

const AddServiceItemModal = ({ onClose, onAdd }) => {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  })
  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Service name is required'
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Service name must be at least 3 characters'
    }

    // Description validation
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)
    try {
      const requestData = {
        name: formData.name.trim(),
        description: formData.description.trim()
      }

      const response = await serviceItemService.createServiceItem(requestData)

      if (response.code === 1000 && response.result) {
        alert(' Service item created successfully!')
        onAdd(response.result)
        onClose()
      } else {
        alert(` Failed to create service item: ${response.message}`)
      }
    } catch (error) {
      console.error('Error creating service item:', error)
      alert(' An error occurred while creating the service item')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setFormData({
      name: '',
      description: ''
    })
    setErrors({})
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content add-service-item-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2> Add New Service Item</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="service-item-form">
          {/* Service Name */}
          <div className="form-group">
            <label htmlFor="name">
              Service Name <span className="required">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={errors.name ? 'error' : ''}
              placeholder="Enter service name (e.g., Oil Change, Brake Inspection)"
              disabled={loading}
            />
            {errors.name && (
              <span className="error-message">{errors.name}</span>
            )}
          </div>

          {/* Description */}
          <div className="form-group">
            <label htmlFor="description">
              Description <span className="required">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className={errors.description ? 'error' : ''}
              placeholder="Enter detailed description of the service"
              rows="4"
              disabled={loading}
            />
            {errors.description && (
              <span className="error-message">{errors.description}</span>
            )}
            <span className="char-count">
              {formData.description.length} characters (min. 10)
            </span>
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <button
              type="button"
              onClick={handleReset}
              className="btn-reset"
              disabled={loading}
            >
              🔄 Reset
            </button>
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
              {loading ? ' Creating...' : '✓ Create Service Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

AddServiceItemModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  onAdd: PropTypes.func.isRequired
}

export default AddServiceItemModal
