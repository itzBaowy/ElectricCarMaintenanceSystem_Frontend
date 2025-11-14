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
      alert('No changes to save')
      return
    }

    try {
      setSaving(true)
      
      const updateData = {
        vehicleModelId: item.vehicleModelId || model.id,
        milestoneKm: item.milestoneKm || pkg.milestoneKm,
        serviceItemId: item.serviceItemId,
        price: changes.price !== undefined ? parseFloat(changes.price) : item.price,
        actionType: changes.actionType !== undefined ? changes.actionType : item.actionType,
        includedSparePartId: changes.includedSparePartId !== undefined ? changes.includedSparePartId : item.includedSparePartId,
        includedQuantity: changes.includedQuantity !== undefined ? parseInt(changes.includedQuantity, 10) : item.includedQuantity
      }

      const result = await modelPackageItemService.update(item.id, updateData)

      if (result.success) {
        alert('✅ Updated successfully!')
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
      alert('No changes to save')
      return
    }

    if (!window.confirm(`Are you sure you want to save ${changedItemIds.length} changes?`)) {
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
          vehicleModelId: item.vehicleModelId || model.id,
          milestoneKm: item.milestoneKm || pkg.milestoneKm,
          serviceItemId: item.serviceItemId,
          price: changes.price !== undefined ? parseFloat(changes.price) : item.price,
          actionType: changes.actionType !== undefined ? changes.actionType : item.actionType,
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
        alert(`✅ Successfully saved ${successCount} changes!`)
        setEditedItems({})
        fetchData()
        if (onSuccess) onSuccess()
      } else {
        alert(`Saved ${successCount} changes, ${errorCount} errors`)
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
            <h3>Edit Service Items - {pkg.name}</h3>
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
              <p>Loading items...</p>
            </div>
          ) : error ? (
            <div className="error-state">
              <span className="error-icon">⚠️</span>
              <p>{error}</p>
              <button className="btn-retry" onClick={fetchData}>Retry</button>
            </div>
          ) : (
            <>
              {/* Summary */}
              <div className="items-summary">
                <span className="summary-item">
                  📋 <strong>{items.length}</strong> items
                </span>
                {changedItemsCount > 0 && (
                  <span className="summary-item changed">
                    ✏️ <strong>{changedItemsCount}</strong> changes
                  </span>
                )}
              </div>

              {/* Items Table */}
              <div className="items-table-container">
                <table className="items-table">
                  <thead>
                    <tr>
                      <th>Service Item</th>
                      <th>Type</th>
                      <th>Price (VND)</th>
                      <th>Spare Part</th>
                      <th>Quantity</th>
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
                          <select
                            className="action-type-select"
                            value={getDisplayValue(item, 'actionType') || ''}
                            onChange={(e) => handleFieldChange(item.id, 'actionType', e.target.value)}
                            disabled={saving}
                          >
                            <option value="CHECK">Check</option>
                            <option value="REPLACE">Replace</option>
                          </select>
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
                            <option value="">-- None --</option>
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
                            💾 Save
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
            Close
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
                  Saving...
                </>
              ) : (
                <>
                  💾 Save All ({changedItemsCount})
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
