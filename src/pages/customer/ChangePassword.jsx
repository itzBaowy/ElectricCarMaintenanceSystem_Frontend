import { useState } from 'react'
import PropTypes from 'prop-types'
import customerService from '../../api/customerService'
import logger from '../../utils/logger'
import '../../styles/ChangePassword.css'

const ChangePassword = ({ onClose, onPasswordChanged }) => {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState({})
  const [showOldPassword, setShowOldPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

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

    // Old password validation
    if (!formData.oldPassword) {
      newErrors.oldPassword = 'Please enter your current password'
    }

    // New password validation
    if (!formData.newPassword) {
      newErrors.newPassword = 'Please enter a new password'
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'New password must be at least 6 characters'
    } else if (formData.newPassword === formData.oldPassword) {
      newErrors.newPassword = 'New password must be different from current password'
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password'
    } else if (formData.confirmPassword !== formData.newPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
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
      const result = await customerService.changePassword({
        oldPassword: formData.oldPassword,
        newPassword: formData.newPassword
      })

      if (result.success) {
        alert('✅ Password changed successfully!')
        logger.log('Password changed successfully')
        
        // Reset form
        setFormData({
          oldPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
        
        // Call callback if provided
        if (onPasswordChanged) {
          onPasswordChanged()
        }
        
        // Close modal after short delay
        setTimeout(() => {
          onClose()
        }, 1000)
      } else {
        alert(`❌ Password change failed: ${result.message}`)
        // If old password is wrong, highlight the field
        if (result.message.toLowerCase().includes('password') || 
            result.message.toLowerCase().includes('incorrect') ||
            result.message.toLowerCase().includes('wrong')) {
          setErrors({ oldPassword: 'Current password is incorrect' })
        }
      }
    } catch (error) {
      logger.error('Error changing password:', error)
      alert('❌ An error occurred while changing password')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setFormData({
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
    })
    setErrors({})
  }

  return (
    <div className="modal-overlay" onClick={onClose} data-component="change-password">
      <div className="modal-content change-password-modal" onClick={(e) => e.stopPropagation()}>
        <div className="change-password-header-custom" style={{ backgroundColor: '#000000', color: '#ffffff' }}>
          <h2>Change Password</h2>
          <button className="change-password-close-btn" onClick={onClose} style={{ color: '#ffffff', borderColor: '#ffffff' }}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="change-password-form">
          <div className="info-message">
            <p>New password must be at least 6 characters and different from current password</p>
          </div>

          {/* Old Password */}
          <div className="form-group">
            <label htmlFor="oldPassword">
              Current Password <span className="required">*</span>
            </label>
            <div className="password-input-wrapper">
              <input
                type={showOldPassword ? 'text' : 'password'}
                id="oldPassword"
                name="oldPassword"
                value={formData.oldPassword}
                onChange={handleChange}
                className={errors.oldPassword ? 'error' : ''}
                placeholder="Enter current password"
                disabled={loading}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowOldPassword(!showOldPassword)}
                tabIndex="-1"
              >
                {showOldPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            {errors.oldPassword && (
              <span className="error-message">{errors.oldPassword}</span>
            )}
          </div>

          {/* New Password */}
          <div className="form-group">
            <label htmlFor="newPassword">
              New Password <span className="required">*</span>
            </label>
            <div className="password-input-wrapper">
              <input
                type={showNewPassword ? 'text' : 'password'}
                id="newPassword"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                className={errors.newPassword ? 'error' : ''}
                placeholder="Enter new password"
                disabled={loading}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowNewPassword(!showNewPassword)}
                tabIndex="-1"
              >
                {showNewPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            {errors.newPassword && (
              <span className="error-message">{errors.newPassword}</span>
            )}
            {formData.newPassword && formData.newPassword.length > 0 && (
              <div className="password-strength">
                <div className={`strength-bar ${
                  formData.newPassword.length < 6 ? 'weak' :
                  formData.newPassword.length < 10 ? 'medium' : 'strong'
                }`}>
                  <div className="strength-fill"></div>
                </div>
                <span className="strength-text">
                  {formData.newPassword.length < 6 ? 'Weak' :
                   formData.newPassword.length < 10 ? 'Medium' : 'Strong'}
                </span>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="form-group">
            <label htmlFor="confirmPassword">
              Confirm New Password <span className="required">*</span>
            </label>
            <div className="password-input-wrapper">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={errors.confirmPassword ? 'error' : ''}
                placeholder="Re-enter new password"
                disabled={loading}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                tabIndex="-1"
              >
                {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            {errors.confirmPassword && (
              <span className="error-message">{errors.confirmPassword}</span>
            )}
            {formData.confirmPassword && formData.newPassword && 
             formData.confirmPassword === formData.newPassword && (
              <span className="success-message">Passwords match</span>
            )}
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <button 
              type="button" 
              onClick={handleReset}
              className="btn-reset"
              disabled={loading}
            >
              Clear
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
              {loading ? 'Processing...' : 'Change Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

ChangePassword.propTypes = {
  onClose: PropTypes.func.isRequired,
  onPasswordChanged: PropTypes.func
}

export default ChangePassword
