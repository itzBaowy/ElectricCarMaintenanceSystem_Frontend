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
        alert('Không thể tải thông tin người dùng')
      }
    } catch (error) {
      logger.error('Error loading profile:', error)
      alert('Có lỗi xảy ra khi tải thông tin')
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
      newErrors.fullName = 'Họ tên không được để trống'
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Họ tên phải có ít nhất 2 ký tự'
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email không được để trống'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ'
    }

    // Phone validation
    if (!formData.phone.trim()) {
      newErrors.phone = 'Số điện thoại không được để trống'
    } else if (!/^[0-9]{10,11}$/.test(formData.phone)) {
      newErrors.phone = 'Số điện thoại phải có 10-11 chữ số'
    }

    // Gender validation
    if (!formData.gender) {
      newErrors.gender = 'Vui lòng chọn giới tính'
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
      alert('Không có thay đổi nào để lưu')
      return
    }

    setLoading(true)
    try {
      const result = await customerService.updateMyInfo(formData)

      if (result.success) {
        alert('✅ Cập nhật thông tin thành công!')
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
        alert(`❌ Cập nhật thất bại: ${result.message}`)
      }
    } catch (error) {
      logger.error('Error updating profile:', error)
      alert('❌ Có lỗi xảy ra khi cập nhật thông tin')
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
            <p>⏳ Đang tải thông tin...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content edit-profile-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>✏️ Chỉnh Sửa Thông Tin</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="edit-profile-form">
          {/* Full Name */}
          <div className="form-group">
            <label htmlFor="fullName">
              Họ và Tên <span className="required">*</span>
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className={errors.fullName ? 'error' : ''}
              placeholder="Nhập họ và tên"
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
              Số Điện Thoại <span className="required">*</span>
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
              Giới Tính <span className="required">*</span>
            </label>
            <select
              id="gender"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className={errors.gender ? 'error' : ''}
              disabled={loading}
            >
              <option value="MALE">Nam</option>
              <option value="FEMALE">Nữ</option>
              <option value="OTHER">Khác</option>
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
              🔄 Khôi phục
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
              disabled={loading || !hasChanges()}
            >
              {loading ? '⏳ Đang lưu...' : '✓ Lưu thay đổi'}
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
