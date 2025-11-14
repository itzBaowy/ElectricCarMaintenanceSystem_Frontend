import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import customerService from '../../api/customerService'
import logger from '../../utils/logger'
import '../../styles/EditProfile.css'

const EditProfile = ({ onClose, onProfileUpdated }) => {
  const [loading, setLoading] = useState(false)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    gender: 'MALE'
  })
  const [errors, setErrors] = useState({})
  const [originalData, setOriginalData] = useState(null)

  useEffect(() => {
    loadMyInfo()
  }, [])

  const loadMyInfo = async () => {
    setLoadingProfile(true)
    try {
      const result = await customerService.getMyInfo()
      
      if (result.success && result.data) {
        const profileData = {
          fullName: result.data.fullName || '',
          email: result.data.email || '',
          phone: result.data.phone || '',
          gender: result.data.gender || 'MALE'
        }
        setFormData(profileData)
        setOriginalData(profileData)
        logger.log('Profile loaded:', profileData)
      } else {
        alert('Unable to load user information')
      }
    } catch (error) {
      logger.error('Error loading profile:', error)
      alert('An error occurred while loading information')
    } finally {
      setLoadingProfile(false)
    }
  }

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

    // Full name validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required'
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters'
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format'
    }

    // Phone validation
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    } else if (!/^[0-9]{10,11}$/.test(formData.phone)) {
      newErrors.phone = 'Phone number must be 10-11 digits'
    }

    // Gender validation
    if (!formData.gender) {
      newErrors.gender = 'Please select gender'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const hasChanges = () => {
    if (!originalData) return false
    return JSON.stringify(formData) !== JSON.stringify(originalData)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    if (!hasChanges()) {
      alert('No changes to save')
      return
    }

    setLoading(true)
    try {
      const result = await customerService.updateMyInfo(formData)

      if (result.success) {
        alert('✅ Profile updated successfully!')
        logger.log('Profile updated:', result.data)
        
        // Update original data
        setOriginalData(formData)
        
        // Call callback if provided
        if (onProfileUpdated) {
          onProfileUpdated(result.data)
        }
        
        // Close modal after short delay
        setTimeout(() => {
          onClose()
        }, 1000)
      } else {
        alert(`❌ Update failed: ${result.message}`)
      }
    } catch (error) {
      logger.error('Error updating profile:', error)
      alert('❌ An error occurred while updating profile')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    if (originalData) {
      setFormData(originalData)
      setErrors({})
    }
  }

  if (loadingProfile) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content edit-profile-modal" onClick={(e) => e.stopPropagation()}>
          <div className="loading-container">
            <p>⏳ Loading information...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content edit-profile-modal" onClick={(e) => e.stopPropagation()}>
        <div className="edit-profile-header-custom" data-component="edit-profile" style={{ backgroundColor: '#000000', color: '#ffffff', backgroundImage: 'none' }}>
          <h2 style={{ color: '#ffffff', margin: 0 }}>Edit Profile</h2>
          <button className="edit-profile-close-btn" onClick={onClose} style={{ color: '#ffffff', borderColor: '#ffffff', backgroundColor: 'transparent' }}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="edit-profile-form">
          {/* Full Name */}
          <div className="form-group">
            <label htmlFor="fullName">
              Full Name <span className="required">*</span>
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className={errors.fullName ? 'error' : ''}
              placeholder="Enter full name"
              disabled={loading}
            />
            {errors.fullName && (
              <span className="error-message">{errors.fullName}</span>
            )}
          </div>

          {/* Email */}
          <div className="form-group">
            <label htmlFor="email">
              Email <span className="required">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? 'error' : ''}
              placeholder="example@email.com"
              disabled={loading}
            />
            {errors.email && (
              <span className="error-message">{errors.email}</span>
            )}
          </div>

          {/* Phone */}
          <div className="form-group">
            <label htmlFor="phone">
              Phone Number <span className="required">*</span>
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={errors.phone ? 'error' : ''}
              placeholder="0123456789"
              disabled={loading}
            />
            {errors.phone && (
              <span className="error-message">{errors.phone}</span>
            )}
          </div>

          {/* Gender */}
          <div className="form-group">
            <label htmlFor="gender">
              Gender <span className="required">*</span>
            </label>
            <select
              id="gender"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className={errors.gender ? 'error' : ''}
              disabled={loading}
            >
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
            </select>
            {errors.gender && (
              <span className="error-message">{errors.gender}</span>
            )}
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <button 
              type="button" 
              onClick={handleReset}
              className="btn-reset"
              disabled={loading || !hasChanges()}
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
              disabled={loading || !hasChanges()}
            >
              {loading ? '⏳ Saving...' : '✓ Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

EditProfile.propTypes = {
  onClose: PropTypes.func.isRequired,
  onProfileUpdated: PropTypes.func
}

export default EditProfile
