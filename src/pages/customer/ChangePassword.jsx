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
      newErrors.oldPassword = 'Vui lòng nhập mật khẩu hiện tại'
    }

    // New password validation
    if (!formData.newPassword) {
      newErrors.newPassword = 'Vui lòng nhập mật khẩu mới'
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'Mật khẩu mới phải có ít nhất 6 ký tự'
    } else if (formData.newPassword === formData.oldPassword) {
      newErrors.newPassword = 'Mật khẩu mới phải khác mật khẩu hiện tại'
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu mới'
    } else if (formData.confirmPassword !== formData.newPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp'
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
        alert('✅ Đổi mật khẩu thành công!')
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
        alert(`❌ Đổi mật khẩu thất bại: ${result.message}`)
        // If old password is wrong, highlight the field
        if (result.message.toLowerCase().includes('password') || 
            result.message.toLowerCase().includes('incorrect') ||
            result.message.toLowerCase().includes('wrong')) {
          setErrors({ oldPassword: 'Mật khẩu hiện tại không đúng' })
        }
      }
    } catch (error) {
      logger.error('Error changing password:', error)
      alert('❌ Có lỗi xảy ra khi đổi mật khẩu')
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
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content change-password-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Đổi Mật Khẩu</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="change-password-form">
          <div className="info-message">
            <span className="info-icon">ℹ️</span>
            <p>Mật khẩu mới phải có ít nhất 6 ký tự và khác với mật khẩu hiện tại</p>
          </div>

          {/* Old Password */}
          <div className="form-group">
            <label htmlFor="oldPassword">
              Mật khẩu hiện tại <span className="required">*</span>
            </label>
            <div className="password-input-wrapper">
              <input
                type={showOldPassword ? 'text' : 'password'}
                id="oldPassword"
                name="oldPassword"
                value={formData.oldPassword}
                onChange={handleChange}
                className={errors.oldPassword ? 'error' : ''}
                placeholder="Nhập mật khẩu hiện tại"
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
              Mật khẩu mới <span className="required">*</span>
            </label>
            <div className="password-input-wrapper">
              <input
                type={showNewPassword ? 'text' : 'password'}
                id="newPassword"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                className={errors.newPassword ? 'error' : ''}
                placeholder="Nhập mật khẩu mới"
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
                  {formData.newPassword.length < 6 ? '⚠️ Yếu' :
                   formData.newPassword.length < 10 ? '✓ Trung bình' : '✓✓ Mạnh'}
                </span>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="form-group">
            <label htmlFor="confirmPassword">
              Xác nhận mật khẩu mới <span className="required">*</span>
            </label>
            <div className="password-input-wrapper">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={errors.confirmPassword ? 'error' : ''}
                placeholder="Nhập lại mật khẩu mới"
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
              <span className="success-message">✓ Mật khẩu khớp</span>
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
              🔄 Xóa
            </button>
            <button 
              type="button" 
              onClick={onClose} 
              className="btn-secondary" 
              disabled={loading}
            >
              Hủy
            </button>
            <button 
              type="submit" 
              className="btn-primary" 
              disabled={loading}
            >
              {loading ? '⏳ Đang xử lý...' : '✓ Đổi mật khẩu'}
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
