import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import appointmentService from '../../api/appointmentService'
import logger from '../../utils/logger'
import '../../styles/BookMaintenance.css'

const BookMaintenance = ({ vehicle, vehicleModel, onClose, onAppointmentCreated }) => {
  const [loading, setLoading] = useState(false)
  const [serviceType, setServiceType] = useState('') // 'package', 'individual', 'both'
  const [servicePackages, setServicePackages] = useState([])
  const [individualServices, setIndividualServices] = useState([])
  const [packageServices, setPackageServices] = useState([]) // Services included in selected package
  const [selectedPackage, setSelectedPackage] = useState(null)
  const [selectedServices, setSelectedServices] = useState([])
  const [appointmentDate, setAppointmentDate] = useState('')
  const [estimatedCost, setEstimatedCost] = useState(0)

  useEffect(() => {
    loadServicePackages()
    if (vehicle?.modelId) {
      loadIndividualServices(vehicle.modelId)
    }
  }, [vehicle])

  useEffect(() => {
    calculateEstimatedCost()
  }, [selectedPackage, selectedServices])

  const loadServicePackages = async () => {
    try {
      const result = await appointmentService.getAllServicePackages()
      if (result.success) {
        // API returns result.content array
        const packages = Array.isArray(result.data?.content) ? result.data.content : []
        setServicePackages(packages)
        logger.log('Service packages loaded:', packages)
      } else {
        logger.error('Failed to load service packages:', result.message)
        setServicePackages([])
      }
    } catch (error) {
      logger.error('Error loading service packages:', error)
      setServicePackages([])
    }
  }

  const loadIndividualServices = async (modelId) => {
    try {
      const result = await appointmentService.getIndividualServicesByVehicleModel(modelId)
      if (result.success) {
        // Ensure result.data is an array
        const services = Array.isArray(result.data) ? result.data : []
        setIndividualServices(services)
        logger.log('Individual services loaded:', services)
      } else {
        logger.error('Failed to load individual services:', result.message)
        setIndividualServices([])
      }
    } catch (error) {
      logger.error('Error loading individual services:', error)
      setIndividualServices([])
    }
  }

  const calculateEstimatedCost = () => {
    let total = 0
    
    // Add package price
    if (selectedPackage && (serviceType === 'package' || serviceType === 'both')) {
      total += selectedPackage.price || 0
    }
    
    // Add individual service prices
    if ((serviceType === 'individual' || serviceType === 'both') && 
        Array.isArray(selectedServices) && selectedServices.length > 0 &&
        Array.isArray(individualServices)) {
      selectedServices.forEach(serviceItemId => {
        const service = individualServices.find(s => s.serviceItemId === serviceItemId)
        if (service) {
          total += service.price || 0
        }
      })
    }
    
    setEstimatedCost(total)
  }

  const handleServiceTypeChange = (type) => {
    setServiceType(type)
    
    // Reset selections based on type
    if (type === 'package') {
      setSelectedServices([])
      setPackageServices([])
    } else if (type === 'individual') {
      setSelectedPackage(null)
      setPackageServices([])
    }
  }

  const handlePackageSelect = async (pkg) => {
    setSelectedPackage(pkg)
    
    // Load services in this package to filter them out from individual services
    if (serviceType === 'both' && vehicle?.modelId) {
      await loadPackageServices(vehicle.modelId, pkg.id)
    } else {
      setPackageServices([])
    }
  }

  const loadPackageServices = async (vehicleModelId, packageId) => {
    try {
      const result = await appointmentService.getModelPackageItemsByVehicleModelAndPackage(vehicleModelId, packageId)
      if (result.success) {
        const services = Array.isArray(result.data) ? result.data : []
        setPackageServices(services)
        logger.log('Package services loaded:', services)
      } else {
        logger.error('Failed to load package services:', result.message)
        setPackageServices([])
      }
    } catch (error) {
      logger.error('Error loading package services:', error)
      setPackageServices([])
    }
  }

  const handleServiceToggle = (serviceItemId) => {
    setSelectedServices(prev => {
      if (prev.includes(serviceItemId)) {
        return prev.filter(id => id !== serviceItemId)
      } else {
        return [...prev, serviceItemId]
      }
    })
  }

  const validateForm = () => {
    if (!appointmentDate) {
      alert('Please select appointment date and time')
      return false
    }

    if (!serviceType) {
      alert('Please select service type')
      return false
    }

    if ((serviceType === 'package' || serviceType === 'both') && !selectedPackage) {
      alert('Please select a service package')
      return false
    }

    if (serviceType === 'individual' && selectedServices.length === 0) {
      alert('Please select at least one individual service')
      return false
    }

    // For "both" mode, check if there are available services to select
    if (serviceType === 'both' && selectedServices.length === 0) {
      const availableServices = individualServices.filter(service => 
        !packageServices.some(ps => ps.serviceItemId === service.serviceItemId)
      )
      
      // Only require selection if there are services available
      if (availableServices.length > 0) {
        alert('Please select at least one individual service or switch to "Package Only" mode')
        return false
      }
      // If no services available (all included in package), it's OK to proceed without selection
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
      
      // Prepare appointment data
      const appointmentData = {
        appointmentDate: formattedDate,
        vehicleId: parseInt(vehicle.id), // Convert to number
        servicePackageId: (serviceType === 'package' || serviceType === 'both') ? selectedPackage?.id : null,
        serviceItemIds: (serviceType === 'individual' || serviceType === 'both') ? selectedServices : []
      }

      // Remove null fields
      if (!appointmentData.servicePackageId) {
        delete appointmentData.servicePackageId
      }
      if (appointmentData.serviceItemIds.length === 0) {
        delete appointmentData.serviceItemIds
      }

      logger.log('Submitting appointment data:', appointmentData)
      const result = await appointmentService.createAppointment(appointmentData)
      
      if (result.success) {
        alert('Appointment booked successfully!')
        onAppointmentCreated(result.data)
        onClose()
      } else {
        alert(`Failed to book appointment: ${result.message}`)
      }
    } catch (error) {
      logger.error('Error creating appointment:', error)
      alert('An error occurred while booking appointment')
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
            </div>
          </div>

          {/* Appointment Date */}
          <div className="form-section">
            <h3>📅 Appointment Date & Time</h3>
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

          {/* Service Type Selection */}
          <div className="form-section">
            <h3>🔧 Service Type <span className="required">*</span></h3>
            <div className="service-type-options">
              <label className={`service-type-option ${serviceType === 'package' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="serviceType"
                  value="package"
                  checked={serviceType === 'package'}
                  onChange={() => handleServiceTypeChange('package')}
                />
                <span className="option-icon">📦</span>
                <span className="option-text">Package Only</span>
              </label>
              
              <label className={`service-type-option ${serviceType === 'individual' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="serviceType"
                  value="individual"
                  checked={serviceType === 'individual'}
                  onChange={() => handleServiceTypeChange('individual')}
                />
                <span className="option-icon">🔧</span>
                <span className="option-text">Individual Services Only</span>
              </label>
              
              <label className={`service-type-option ${serviceType === 'both' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="serviceType"
                  value="both"
                  checked={serviceType === 'both'}
                  onChange={() => handleServiceTypeChange('both')}
                />
                <span className="option-icon">🎁</span>
                <span className="option-text">Package + Individual Services</span>
              </label>
            </div>
          </div>

          {/* Service Package Selection */}
          {(serviceType === 'package' || serviceType === 'both') && (
            <div className="form-section">
              <h3>📦 Select Service Package <span className="required">*</span></h3>
              <div className="service-packages-list">
                {!Array.isArray(servicePackages) || servicePackages.length === 0 ? (
                  <p className="no-data">No service packages available</p>
                ) : (
                  servicePackages.map(pkg => (
                    <label
                      key={pkg.id}
                      className={`service-package-item ${selectedPackage?.id === pkg.id ? 'selected' : ''}`}
                    >
                      <input
                        type="radio"
                        name="servicePackage"
                        value={pkg.id}
                        checked={selectedPackage?.id === pkg.id}
                        onChange={() => handlePackageSelect(pkg)}
                      />
                      <div className="package-info">
                        <h4>{pkg.name}</h4>
                        <p className="package-description">{pkg.description}</p>
                        {pkg.price && <p className="package-price">{formatCurrency(pkg.price)}</p>}
                      </div>
                    </label>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Individual Services Selection */}
          {(serviceType === 'individual' || serviceType === 'both') && (
            <div className="form-section">
              <h3>🔧 Select Individual Services <span className="required">*</span></h3>
              {serviceType === 'both' && selectedPackage && (
                <p className="info-text">💡 Services already included in the package are hidden</p>
              )}
              <div className="individual-services-list">
                {(() => {
                  if (!Array.isArray(individualServices) || individualServices.length === 0) {
                    return <p className="no-data">No individual services available for this vehicle model</p>
                  }
                  
                  // Filter out services already in package (for "both" mode)
                  const availableServices = individualServices.filter(service => {
                    if (serviceType === 'both' && packageServices.length > 0) {
                      return !packageServices.some(ps => ps.serviceItemId === service.serviceItemId)
                    }
                    return true
                  })
                  
                  if (availableServices.length === 0) {
                    return <p className="no-data">✓ All available services are already included in the selected package</p>
                  }
                  
                  return availableServices.map(service => (
                    <label
                      key={service.id}
                      className={`individual-service-item ${selectedServices.includes(service.serviceItemId) ? 'selected' : ''}`}
                    >
                      <input
                        type="checkbox"
                        value={service.serviceItemId}
                        checked={selectedServices.includes(service.serviceItemId)}
                        onChange={() => handleServiceToggle(service.serviceItemId)}
                      />
                      <div className="service-info">
                        <h4>{service.serviceItemName}</h4>
                        {service.price && <p className="service-price">{formatCurrency(service.price)}</p>}
                      </div>
                    </label>
                  ))
                })()}
              </div>
            </div>
          )}

          {/* Estimated Cost */}
          {serviceType && (
            <div className="form-section estimated-cost-section">
              <div className="estimated-cost">
                <span>Estimated Total Cost:</span>
                <span className="cost-amount">{formatCurrency(estimatedCost)}</span>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn-secondary" disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Processing...' : '✓ Confirm Booking'}
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
