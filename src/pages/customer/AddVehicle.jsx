import { useState, useEffect } from 'react'
import vehicleService from '../../api/vehicleService'
import authService from '../../api/authService'
import logger from '../../utils/logger'
import '../../styles/AddVehicle.css'

const AddVehicle = ({ onClose, onVehicleAdded }) => {
  const [formData, setFormData] = useState({
    licensePlate: '',
    vin: '',
    currentKm: '',
    purchaseYear: '',
    modelId: ''
  })
  const [vehicleModels, setVehicleModels] = useState([])
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingModels, setIsLoadingModels] = useState(true)

  // Load vehicle models on component mount
  useEffect(() => {
    loadVehicleModels()
  }, [])

  const loadVehicleModels = async () => {
    try {
      setIsLoadingModels(true)
      const result = await vehicleService.getAllVehicleModels()
      
      if (result.success) {
        setVehicleModels(result.data || [])
      } else {
        logger.error('Failed to load vehicle models:', result.message)
        setErrors({ general: 'Failed to load vehicle models. Please try again.' })
      }
    } catch (error) {
      logger.error('Error loading vehicle models:', error)
      setErrors({ general: 'Failed to load vehicle models. Please try again.' })
    } finally {
      setIsLoadingModels(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    // License plate validation
    if (!formData.licensePlate) {
      newErrors.licensePlate = 'License plate is required'
    } else if (!/^[0-9]{2}[A-Z]{1,2}-[0-9]{4,5}$/.test(formData.licensePlate)) {
      newErrors.licensePlate = 'Invalid format. Example: 57AB-12345 or 30A-1234'
    }

    // VIN validation
    if (!formData.vin) {
      newErrors.vin = 'VIN (Vehicle Identification Number) is required'
    } else if (formData.vin.length !== 17) {
      newErrors.vin = 'VIN must be exactly 17 characters'
    } else if (!/^[A-HJ-NPR-Z0-9]{17}$/i.test(formData.vin)) {
      newErrors.vin = 'Invalid VIN format (no I, O, Q allowed)'
    }

    // Current KM validation
    if (!formData.currentKm) {
      newErrors.currentKm = 'Current mileage is required'
    } else if (isNaN(formData.currentKm) || parseInt(formData.currentKm) < 0) {
      newErrors.currentKm = 'Mileage must be a positive number'
    }

    // Purchase year validation (YYYY-MM format)
    if (!formData.purchaseYear) {
      newErrors.purchaseYear = 'Purchase year and month are required'
    } else {
      // Check if format is YYYY-MM
      if (!/^\d{4}-\d{2}$/.test(formData.purchaseYear)) {
        newErrors.purchaseYear = 'Invalid format. Must be YYYY-MM'
      } else {
        // Check if not in the future
        const [year, month] = formData.purchaseYear.split('-').map(Number)
        const selectedDate = new Date(year, month - 1) // month is 0-indexed
        const currentDate = new Date()
        const currentYearMonth = new Date(currentDate.getFullYear(), currentDate.getMonth())
        
        if (selectedDate > currentYearMonth) {
          newErrors.purchaseYear = 'Purchase date cannot be in the future'
        }
      }
    }

    // Model ID validation
    if (!formData.modelId) {
      newErrors.modelId = 'Vehicle model is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    
    try {
      // Get customer ID from auth service
      const userProfile = await authService.getUserProfile()
      const customerId = userProfile.data?.userId

      if (!customerId) {
        setErrors({ general: 'Unable to identify customer. Please login again.' })
        setIsLoading(false)
        return
      }

      // Prepare vehicle data
      const vehicleData = {
        licensePlate: formData.licensePlate.toUpperCase(),
        vin: formData.vin.toUpperCase(),
        currentKm: parseInt(formData.currentKm),
        purchaseYear: formData.purchaseYear,
        modelId: parseInt(formData.modelId),
        customerId: customerId
      }

      logger.log('Creating vehicle with data:', vehicleData)

      // Call API to create vehicle
      const result = await vehicleService.createVehicle(vehicleData)

      if (result.success) {
        logger.log('Vehicle created successfully:', result.data)
        
        // Call callback function to refresh vehicle list
        if (onVehicleAdded) {
          onVehicleAdded(result.data)
        }
        
        // Close modal
        if (onClose) {
          onClose()
        }
      } else {
        setErrors({ general: result.message || 'Failed to add vehicle' })
      }
    } catch (error) {
      logger.error('Error adding vehicle:', error)
      setErrors({ general: 'Failed to add vehicle. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🚗 Add New Vehicle</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="add-vehicle-form">
          {errors.general && (
            <div className="error-message general-error">
              {errors.general}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="licensePlate">
              License Plate <span className="required">*</span>
            </label>
            <input
              type="text"
              id="licensePlate"
              name="licensePlate"
              value={formData.licensePlate}
              onChange={handleChange}
              className={errors.licensePlate ? 'error' : ''}
              placeholder="Example: 57AB-12345"
              disabled={isLoading}
              maxLength={10}
            />
            {errors.licensePlate && (
              <span className="error-message">{errors.licensePlate}</span>
            )}
            <span className="field-hint">Format: 57AB-12345 or 30A-1234</span>
          </div>

          <div className="form-group">
            <label htmlFor="vin">
              VIN (Vehicle Identification Number) <span className="required">*</span>
            </label>
            <input
              type="text"
              id="vin"
              name="vin"
              value={formData.vin}
              onChange={handleChange}
              className={errors.vin ? 'error' : ''}
              placeholder="17-character VIN"
              disabled={isLoading}
              maxLength={17}
            />
            {errors.vin && (
              <span className="error-message">{errors.vin}</span>
            )}
            <span className="field-hint">17 characters, no I, O, or Q allowed</span>
          </div>

          <div className="form-group">
            <label htmlFor="currentKm">
              Current Mileage (km) <span className="required">*</span>
            </label>
            <input
              type="number"
              id="currentKm"
              name="currentKm"
              value={formData.currentKm}
              onChange={handleChange}
              className={errors.currentKm ? 'error' : ''}
              placeholder="Current odometer reading"
              disabled={isLoading}
              min="0"
            />
            {errors.currentKm && (
              <span className="error-message">{errors.currentKm}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="purchaseYear">
              Purchase Year & Month <span className="required">*</span>
            </label>
            <input
              type="month"
              id="purchaseYear"
              name="purchaseYear"
              value={formData.purchaseYear}
              onChange={handleChange}
              className={errors.purchaseYear ? 'error' : ''}
              disabled={isLoading}
              max={`${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`}
            />
            {errors.purchaseYear && (
              <span className="error-message">{errors.purchaseYear}</span>
            )}
            <span className="field-hint">Month and year when the vehicle was purchased (e.g., 2025-11)</span>
          </div>

          <div className="form-group">
            <label htmlFor="modelId">
              Vehicle Model <span className="required">*</span>
            </label>
            {isLoadingModels ? (
              <div className="loading-models">Loading models...</div>
            ) : (
              <select
                id="modelId"
                name="modelId"
                value={formData.modelId}
                onChange={handleChange}
                className={errors.modelId ? 'error' : ''}
                disabled={isLoading}
              >
                <option value="">Select a vehicle model</option>
                {vehicleModels.map(model => (
                  <option key={model.id} value={model.id}>
                    {model.name} ({model.modelYear})
                  </option>
                ))}
              </select>
            )}
            {errors.modelId && (
              <span className="error-message">{errors.modelId}</span>
            )}
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              className="btn-cancel"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn-submit"
              disabled={isLoading || isLoadingModels}
            >
              {isLoading ? 'Adding...' : 'Add Vehicle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddVehicle
