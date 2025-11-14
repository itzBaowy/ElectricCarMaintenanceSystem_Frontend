import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import modelPackageItemService from '../../../api/modelPackageItemService'
import sparePartService from '../../../api/sparePartService'
import '../../../styles/PackageItemsEditModal.css'

const PackageItemsEditModal = ({ model, package: pkg, onClose, onSuccess }) => {
  const [items, setItems] = useState([])
  const [spareParts, setSpareParts] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [editedItems, setEditedItems] = useState({})

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError('')
      
      // Fetch package items and spare parts for this model
      const [itemsResult, partsResult] = await Promise.all([
        modelPackageItemService.getByModelAndMilestone(model.id, pkg.milestoneKm || pkg.id),
        sparePartService.getSparePartsByModel(model.id)
      ])

      if (itemsResult.success) {
        setItems(itemsResult.data || [])
      } else {
        setError('Failed to load package items')
      }

      if (partsResult.code === 1000 && partsResult.result) {
        // If result is array, use it directly; if paginated, use content
        setSpareParts(Array.isArray(partsResult.result) ? partsResult.result : partsResult.result.content || [])
      }
    } catch (err) {
      setError('An error occurred while loading data')
      console.error('Error fetching data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleFieldChange = (itemId, field, value) => {
    setEditedItems(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        [field]: value
      }
    }))
  }

  const handleSaveItem = async (item) => {
    const changes = editedItems[item.id]
    if (!changes) {
      alert('Không có thay đổi nào để lưu')
      return
    }

    try {
      setSaving(true)
      
      const updateData = {
        price: changes.price !== undefined ? parseFloat(changes.price) : item.price,
        includedSparePartId: changes.includedSparePartId !== undefined ? changes.includedSparePartId : item.includedSparePartId,
        includedQuantity: changes.includedQuantity !== undefined ? parseInt(changes.includedQuantity, 10) : item.includedQuantity
      }

      const result = await modelPackageItemService.update(item.id, updateData)

      if (result.success) {
        alert('✅ Cập nhật thành công!')
        // Update local state
        setItems(prevItems => 
          prevItems.map(i => 
            i.id === item.id 
              ? { ...i, ...updateData }
              : i
          )
        )
        // Clear edited state for this item
        setEditedItems(prev => {
          const newState = { ...prev }
          delete newState[item.id]
          return newState
        })
      } else {
        alert(result.message || 'Failed to update item')
      }
    } catch (err) {
      alert('An error occurred while updating item')
      console.error('Update error:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleSaveAll = async () => {
    const changedItemIds = Object.keys(editedItems)
    if (changedItemIds.length === 0) {
      alert('Không có thay đổi nào để lưu')
      return
    }

    if (!window.confirm(`Bạn có chắc chắn muốn lưu ${changedItemIds.length} thay đổi?`)) {
      return
    }

    try {
      setSaving(true)
      let successCount = 0
      let errorCount = 0

      for (const itemId of changedItemIds) {
        const item = items.find(i => i.id === parseInt(itemId))
        const changes = editedItems[itemId]

        const updateData = {
          price: changes.price !== undefined ? parseFloat(changes.price) : item.price,
          includedSparePartId: changes.includedSparePartId !== undefined ? changes.includedSparePartId : item.includedSparePartId,
          includedQuantity: changes.includedQuantity !== undefined ? parseInt(changes.includedQuantity, 10) : item.includedQuantity
        }

        const result = await modelPackageItemService.update(parseInt(itemId), updateData)
        
        if (result.success) {
          successCount++
        } else {
          errorCount++
        }
      }

      if (errorCount === 0) {
        alert(`✅ Đã lưu thành công ${successCount} thay đổi!`)
        setEditedItems({})
        fetchData()
        if (onSuccess) onSuccess()
      } else {
        alert(`Đã lưu ${successCount} thay đổi, ${errorCount} lỗi`)
        fetchData()
      }
    } catch (err) {
      alert('An error occurred while saving changes')
      console.error('Save all error:', err)
    } finally {
      setSaving(false)
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  const getDisplayValue = (item, field) => {
    return editedItems[item.id]?.[field] !== undefined 
      ? editedItems[item.id][field] 
      : item[field]
  }

  const hasChanges = (itemId) => {
    return editedItems[itemId] !== undefined
  }

  const changedItemsCount = Object.keys(editedItems).length

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content package-items-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3>Chỉnh sửa Hạng mục - {pkg.name}</h3>
            <p className="modal-subtitle">
              {model.name} ({model.modelYear}) - {pkg.milestoneKm.toLocaleString('vi-VN')} km
            </p>
          </div>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Đang tải hạng mục...</p>
            </div>
          ) : error ? (
            <div className="error-state">
              <span className="error-icon">⚠️</span>
              <p>{error}</p>
              <button className="btn-retry" onClick={fetchData}>Thử lại</button>
            </div>
          ) : (
            <>
              {/* Summary */}
              <div className="items-summary">
                <span className="summary-item">
                  📋 <strong>{items.length}</strong> hạng mục
                </span>
                {changedItemsCount > 0 && (
                  <span className="summary-item changed">
                    ✏️ <strong>{changedItemsCount}</strong> thay đổi
                  </span>
                )}
              </div>

              {/* Items Table */}
              <div className="items-table-container">
                <table className="items-table">
                  <thead>
                    <tr>
                      <th>Hạng mục</th>
                      <th>Loại</th>
                      <th>Giá (VNĐ)</th>
                      <th>Phụ tùng</th>
                      <th>Số lượng</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr 
                        key={item.id} 
                        className={hasChanges(item.id) ? 'changed-row' : ''}
                      >
                        <td>
                          <div className="item-name">
                            {item.serviceItemName || 'N/A'}
                            {hasChanges(item.id) && (
                              <span className="changed-indicator">●</span>
                            )}
                          </div>
                          {item.includedSparePartName && (
                            <small className="item-spare-part">
                              🔧 {item.includedSparePartName} {item.includedQuantity ? `(x${item.includedQuantity})` : ''}
                            </small>
                          )}
                        </td>
                        <td>
                          <span className={`action-badge ${item.actionType?.toLowerCase()}`}>
                            {item.actionType === 'REPLACE' ? 'Thay' : 'Kiểm tra'}
                          </span>
                        </td>
                        <td>
                          <input
                            type="number"
                            className="price-input"
                            value={getDisplayValue(item, 'price')}
                            onChange={(e) => handleFieldChange(item.id, 'price', e.target.value)}
                            disabled={saving}
                            min="0"
                            step="1000"
                          />
                        </td>
                        <td>
                          <select
                            className="spare-part-select"
                            value={getDisplayValue(item, 'includedSparePartId') || ''}
                            onChange={(e) => handleFieldChange(item.id, 'includedSparePartId', e.target.value ? parseInt(e.target.value) : null)}
                            disabled={saving}
                          >
                            <option value="">-- Không có --</option>
                            {spareParts.map(part => (
                              <option key={part.id} value={part.id}>
                                {part.partNumber} - {part.name}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <input
                            type="number"
                            className="quantity-input"
                            value={getDisplayValue(item, 'includedQuantity') || 0}
                            onChange={(e) => handleFieldChange(item.id, 'includedQuantity', e.target.value)}
                            disabled={saving}
                            min="0"
                            step="1"
                          />
                        </td>
                        <td>
                          <button
                            className="btn-save-item"
                            onClick={() => handleSaveItem(item)}
                            disabled={!hasChanges(item.id) || saving}
                          >
                            💾 Lưu
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        <div className="modal-footer">
          <button 
            className="btn-cancel" 
            onClick={onClose}
            disabled={saving}
          >
            Đóng
          </button>
          {changedItemsCount > 0 && (
            <button 
              className="btn-save-all" 
              onClick={handleSaveAll}
              disabled={saving}
            >
              {saving ? (
                <>
                  <span className="spinner-small"></span>
                  Đang lưu...
                </>
              ) : (
                <>
                  💾 Lưu tất cả ({changedItemsCount})
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

PackageItemsEditModal.propTypes = {
  model: PropTypes.object.isRequired,
  package: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func
}

export default PackageItemsEditModal
