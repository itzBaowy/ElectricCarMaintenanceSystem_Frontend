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
    district: '',
    city: '',
    phone: ''
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
        alert(`Error: ${result.message}`)
      }
    } catch (error) {
      logger.error('Error loading centers:', error)
      alert('Error loading service centers list!')
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
        district: center.district || '',
        city: center.city || '',
        phone: center.phone || ''
      })
    } else {
      setEditingCenter(null)
      setFormData({
        name: '',
        address: '',
        district: '',
        city: '',
        phone: ''
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
      district: '',
      city: '',
      phone: ''
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

    if (!formData.name || !formData.address || !formData.district || !formData.city || !formData.phone) {
      alert('Please fill in all required information!')
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
        alert(editingCenter ? 'Service center updated successfully!' : 'New service center added successfully!')
        handleCloseModal()
        loadCenters()
      } else {
        alert(`Lỗi: ${result.message}`)
      }
    } catch (error) {
      logger.error('Error saving center:', error)
      alert('Error saving service center information!')
    }
  }

  const handleDelete = async (center) => {
    if (!window.confirm(`Are you sure you want to delete service center "${center.name}"?`)) {
      return
    }

    try {
      const result = await centerService.deleteCenter(center.id)
      
      if (result.success) {
        alert('Service center deleted successfully!')
        loadCenters()
      } else {
        alert(`Lỗi: ${result.message}`)
      }
    } catch (error) {
      logger.error('Error deleting center:', error)
      alert('Error deleting service center!')
    }
  }

  if (loading) {
    return <div className="loading">⏳ Loading...</div>
  }

  return (
    <div className="service-center-management">
      <div className="management-header">
        <div>
          <h2>Service Center Management</h2>
          <p>Manage information of electric vehicle service centers</p>
        </div>
        <button className="add-center-btn" onClick={() => handleOpenModal()}>
           Add New Service Center
        </button>
      </div>

      <div className="centers-stats">
        <div className="stat-card">
          <div className="stat-icon" aria-hidden="true">
            {/* building SVG */}
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="3" width="18" height="18" rx="2" fill="white" opacity="0.08" />
              <path d="M7 7h2v2H7V7zm0 4h2v2H7v-2zm4-4h2v2h-2V7zm0 4h2v2h-2v-2z" fill="white" opacity="0.95" />
            </svg>
          </div>
          <div className="stat-info">
            <span className="stat-number">{centers.length}</span>
            <span className="stat-label">Total Service Centers</span>
          </div>
        </div>
      </div>

      <div className="centers-grid">
        {centers.length === 0 ? (
          <div className="no-centers">
              <p>No service centers yet. Add a new service center!</p>
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
                    title="Edit"
                    aria-label="Edit"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="#fff" opacity="0.95"/>
                    </svg>
                  </button>
                  <button 
                    className="delete-btn"
                    onClick={() => handleDelete(center)}
                    title="Delete"
                    aria-label="Delete"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M6 7h12v13a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V7z" fill="#fff" opacity="0.95"/>
                      <path d="M9 3h6v2H9V3z" fill="#fff" opacity="0.95"/>
                    </svg>
                  </button>
                </div>
              </div>

              <div className="center-info">
                <div className="info-row">
                  <span className="info-icon-plain" aria-hidden="true">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#111" opacity="0.95"/>
                      <circle cx="12" cy="9" r="2" fill="#111" />
                    </svg>
                  </span>
                  <span className="info-content">{center.address}</span>
                </div>
                {center.district && (
                  <div className="info-row">
                    <span className="info-icon-plain" aria-hidden="true">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3 11l9-7 9 7v8a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-8z" fill="#111" opacity="0.95"/>
                      </svg>
                    </span>
                    <span className="info-content">{center.district}</span>
                  </div>
                )}
                {center.city && (
                  <div className="info-row">
                    <span className="info-icon-plain" aria-hidden="true">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M4 22h16V8l-4-4H8L4 8v14z" fill="#111" opacity="0.95"/>
                        <path d="M7 10h2v2H7v-2zM11 10h2v2h-2v-2z" fill="#111" />
                      </svg>
                    </span>
                    <span className="info-content">{center.city}</span>
                  </div>
                )}
                <div className="info-row">
                  <span className="info-icon-plain" aria-hidden="true">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M6.6 10.8a15.05 15.05 0 006.6 6.6l2.2-2.2a1 1 0 011.1-.2c1.2.5 2.5.8 3.9.8a1 1 0 011 1V20a1 1 0 01-1 1C10.3 21 3 13.7 3 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.4.3 2.7.8 3.9a1 1 0 01-.2 1.1l-2.5 2.8z" fill="#111" opacity="0.95"/>
                    </svg>
                  </span>
                  <span className="info-content">{center.phone}</span>
                </div>
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
              <h2>{editingCenter ? ' Edit Service Center' : ' Add New Service Center'}</h2>
              <button className="close-btn" onClick={handleCloseModal}>×</button>
            </div>

            <form className="modal-body" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Service Center Name *</label>
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
                <label htmlFor="address">Address *</label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="166 Ly Thuong Kiet, Quarter 3, Hoc Mon Town"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="district">District *</label>
                  <input
                    type="text"
                    id="district"
                    name="district"
                    value={formData.district}
                    onChange={handleInputChange}
                    placeholder="Hoc Mon District"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="city">City *</label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="Ho Chi Minh City"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone Number *</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="0762718718"
                  required
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="cancel-btn" onClick={handleCloseModal}>
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  {editingCenter ? '💾 Update' : '➕ Add New'}
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
