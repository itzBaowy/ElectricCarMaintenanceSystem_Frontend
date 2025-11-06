import { useState, useEffect } from 'react'
import centerService from '../../../api/centerService'
import logger from '../../../utils/logger'
import '../../../styles/ServiceCenterManagement.css'

const ServiceCenterManagement = () => {
  const [centers, setCenters] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingCenter, setEditingCenter] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    description: '',
    openTime: '',
    closeTime: ''
  })

  useEffect(() => {
    loadCenters()
  }, [])

  const loadCenters = async () => {
    try {
      setLoading(true)
      const result = await centerService.getAllCenters()
      
      if (result.success) {
        setCenters(result.data)
      } else {
        alert(`Lỗi: ${result.message}`)
      }
    } catch (error) {
      logger.error('Error loading centers:', error)
      alert('Có lỗi khi tải danh sách trung tâm!')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = (center = null) => {
    if (center) {
      setEditingCenter(center)
      setFormData({
        name: center.name || '',
        address: center.address || '',
        phone: center.phone || '',
        email: center.email || '',
        description: center.description || '',
        openTime: center.openTime || '',
        closeTime: center.closeTime || ''
      })
    } else {
      setEditingCenter(null)
      setFormData({
        name: '',
        address: '',
        phone: '',
        email: '',
        description: '',
        openTime: '',
        closeTime: ''
      })
    }
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingCenter(null)
    setFormData({
      name: '',
      address: '',
      phone: '',
      email: '',
      description: '',
      openTime: '',
      closeTime: ''
    })
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.name || !formData.address || !formData.phone) {
      alert('Vui lòng điền đầy đủ thông tin bắt buộc!')
      return
    }

    try {
      let result
      if (editingCenter) {
        // Update existing center
        result = await centerService.updateCenter(editingCenter.id, formData)
      } else {
        // Create new center
        result = await centerService.createCenter(formData)
      }

      if (result.success) {
        alert(editingCenter ? 'Cập nhật trung tâm thành công!' : 'Thêm trung tâm mới thành công!')
        handleCloseModal()
        loadCenters()
      } else {
        alert(`Lỗi: ${result.message}`)
      }
    } catch (error) {
      logger.error('Error saving center:', error)
      alert('Có lỗi khi lưu thông tin trung tâm!')
    }
  }

  const handleDelete = async (center) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa trung tâm "${center.name}"?`)) {
      return
    }

    try {
      const result = await centerService.deleteCenter(center.id)
      
      if (result.success) {
        alert('Xóa trung tâm thành công!')
        loadCenters()
      } else {
        alert(`Lỗi: ${result.message}`)
      }
    } catch (error) {
      logger.error('Error deleting center:', error)
      alert('Có lỗi khi xóa trung tâm!')
    }
  }

  if (loading) {
    return <div className="loading">⏳ Đang tải...</div>
  }

  return (
    <div className="service-center-management">
      <div className="management-header">
        <div>
          <h2>🏢 Quản Lý Trung Tâm Dịch Vụ</h2>
          <p>Quản lý thông tin các trung tâm bảo dưỡng xe điện</p>
        </div>
        <button className="add-center-btn" onClick={() => handleOpenModal()}>
          ➕ Thêm Trung Tâm Mới
        </button>
      </div>

      <div className="centers-stats">
        <div className="stat-card">
          <div className="stat-icon">🏢</div>
          <div className="stat-info">
            <span className="stat-number">{centers.length}</span>
            <span className="stat-label">Tổng số trung tâm</span>
          </div>
        </div>
      </div>

      <div className="centers-grid">
        {centers.length === 0 ? (
          <div className="no-centers">
            <p>📭 Chưa có trung tâm nào. Hãy thêm trung tâm mới!</p>
          </div>
        ) : (
          centers.map(center => (
            <div key={center.id} className="center-card">
              <div className="center-header">
                <h3>{center.name}</h3>
                <div className="center-actions">
                  <button 
                    className="edit-btn"
                    onClick={() => handleOpenModal(center)}
                    title="Chỉnh sửa"
                  >
                    ✏️
                  </button>
                  <button 
                    className="delete-btn"
                    onClick={() => handleDelete(center)}
                    title="Xóa"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              <div className="center-info">
                <div className="info-row">
                  <span className="info-icon">📍</span>
                  <span>{center.address}</span>
                </div>
                <div className="info-row">
                  <span className="info-icon">📞</span>
                  <span>{center.phone}</span>
                </div>
                {center.email && (
                  <div className="info-row">
                    <span className="info-icon">✉️</span>
                    <span>{center.email}</span>
                  </div>
                )}
                {center.openTime && center.closeTime && (
                  <div className="info-row">
                    <span className="info-icon">🕒</span>
                    <span>{center.openTime} - {center.closeTime}</span>
                  </div>
                )}
                {center.description && (
                  <div className="center-description">
                    <p>{center.description}</p>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Add/Edit Center */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingCenter ? '✏️ Chỉnh Sửa Trung Tâm' : '➕ Thêm Trung Tâm Mới'}</h2>
              <button className="close-btn" onClick={handleCloseModal}>×</button>
            </div>

            <form className="modal-body" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Tên Trung Tâm *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="VinFast Service Center"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="address">Địa Chỉ *</label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="123 Đường ABC, Quận 1, TP.HCM"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="phone">Số Điện Thoại *</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="0123456789"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="center@example.com"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="openTime">Giờ Mở Cửa</label>
                  <input
                    type="time"
                    id="openTime"
                    name="openTime"
                    value={formData.openTime}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="closeTime">Giờ Đóng Cửa</label>
                  <input
                    type="time"
                    id="closeTime"
                    name="closeTime"
                    value={formData.closeTime}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="description">Mô Tả</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Mô tả về trung tâm dịch vụ..."
                  rows="4"
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="cancel-btn" onClick={handleCloseModal}>
                  Hủy
                </button>
                <button type="submit" className="submit-btn">
                  {editingCenter ? '💾 Cập Nhật' : '➕ Thêm Mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default ServiceCenterManagement
