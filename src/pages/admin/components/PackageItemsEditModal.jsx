import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import modelPackageItemService from '../../../api/modelPackageItemService'
import sparePartService from '../../../api/sparePartService'
import serviceItemService from '../../../api/serviceItemService'
import '../../../styles/PackageItemsEditModal.css'

const PackageItemsEditModal = ({ model, package: pkg, onClose, onSuccess }) => {
  const [items, setItems] = useState([])
  const [spareParts, setSpareParts] = useState([])
  const [serviceItems, setServiceItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [editedItems, setEditedItems] = useState({})
  const [showAddModal, setShowAddModal] = useState(false)
  const [newItem, setNewItem] = useState({
    serviceItemId: '',
    price: 0,
    actionType: 'CHECK',
    includedSparePartId: null,
    includedQuantity: 0
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError('')
      
      // Fetch package items, spare parts, and all service items
      const [itemsResult, partsResult, serviceItemsResult] = await Promise.all([
        modelPackageItemService.getByModelAndMilestone(model.id, pkg.milestoneKm || pkg.id),
        sparePartService.getSparePartsByModel(model.id),
        serviceItemService.getAllServiceItems(0, 1000) // Get all service items
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

      if (serviceItemsResult.code === 1000 && serviceItemsResult.result) {
        setServiceItems(serviceItemsResult.result.content || [])
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
        alert(' Updated successfully!')
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
          milestoneMonth: item.milestoneMonth || pkg.milestoneMonth,
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
        alert(` Successfully saved ${successCount} changes!`)
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

  const handleAddItem = async () => {
    if (!newItem.serviceItemId) {
      alert('Please select a service item')
      return
    }

    if (newItem.price <= 0) {
      alert('Price must be greater than 0')
      return
    }

    try {
      setSaving(true)
      
      const createData = {
        vehicleModelId: model.id,
        milestoneKm: pkg.milestoneKm,
        milestoneMonth: pkg.milestoneMonth,
        serviceItemId: parseInt(newItem.serviceItemId),
        price: parseFloat(newItem.price),
        actionType: newItem.actionType,
        includedSparePartId: newItem.includedSparePartId ? parseInt(newItem.includedSparePartId) : null,
        includedQuantity: newItem.includedQuantity ? parseInt(newItem.includedQuantity) : 0
      }

      const result = await modelPackageItemService.create(createData)

      if (result.success) {
        alert(' Service item added successfully!')
        setShowAddModal(false)
        setNewItem({
          serviceItemId: '',
          price: 0,
          actionType: 'CHECK',
          includedSparePartId: null,
          includedQuantity: 0
        })
        fetchData()
        if (onSuccess) onSuccess()
      } else {
        alert(result.message || 'Failed to add service item')
      }
    } catch (err) {
      alert('An error occurred while adding service item')
      console.error('Add error:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteItem = async (item) => {
    if (!window.confirm(`Are you sure you want to remove "${item.serviceItemName}" from this package?`)) {
      return
    }

    try {
      setSaving(true)
      
      const result = await modelPackageItemService.delete(item.id)

      if (result.success) {
        alert(' Service item removed successfully!')
        fetchData()
        if (onSuccess) onSuccess()
      } else {
        alert(result.message || 'Failed to remove service item')
      }
    } catch (err) {
      alert('An error occurred while removing service item')
      console.error('Delete error:', err)
    } finally {
      setSaving(false)
    }
  }

  const getAvailableServiceItems = () => {
    const usedServiceItemIds = items.map(item => item.serviceItemId)
    return serviceItems.filter(si => !usedServiceItemIds.includes(si.id))
  }

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
              <span className="error-icon"></span>
              <p>{error}</p>
              <button className="btn-retry" onClick={fetchData}>Retry</button>
            </div>
          ) : (
            <>
              {/* Summary */}
              <div className="items-summary">
                <span className="summary-item">
                   <strong>{items.length}</strong> items
                </span>
                {changedItemsCount > 0 && (
                  <span className="summary-item changed">
                     <strong>{changedItemsCount}</strong> changes
                  </span>
                )}
                <button 
                  className="btn-add-item"
                  onClick={() => setShowAddModal(true)}
                  disabled={saving}
                >
                   Add Service Item
                </button>
              </div>

              {/* Items Table */}
              <div className="items-table-container">
                <table className="items-table">
                  <thead>
                    <tr>
                      <th>Service Item</th>
                      <th>Type</th>
                      <th>Price (VND)</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.length === 0 ? (
                      <tr>
                        <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                          No service items yet. Click "Add Service Item" to get started.
                        </td>
                      </tr>
                    ) : (
                      items.map((item) => {
                        const currentActionType = getDisplayValue(item, 'actionType');
                        return (
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
                          {currentActionType === 'REPLACE' && item.includedSparePartName && (
                            <small className="item-spare-part">
                              🔧 {item.includedSparePartName} {item.includedQuantity ? `(x${item.includedQuantity})` : ''}
                            </small>
                          )}
                        </td>
                        <td>
                          <select
                            className="action-type-select"
                            value={currentActionType || ''}
                            onChange={(e) => {
                              handleFieldChange(item.id, 'actionType', e.target.value);
                              // Clear spare part fields when switching to CHECK
                              if (e.target.value === 'CHECK') {
                                handleFieldChange(item.id, 'includedSparePartId', null);
                                handleFieldChange(item.id, 'includedQuantity', 0);
                              }
                            }}
                            disabled={saving}
                          >
                            <option value="CHECK">Check</option>
                            <option value="REPLACE">Replace</option>
                          </select>
                          {currentActionType === 'REPLACE' && (
                            <div style={{ marginTop: '8px' }}>
                              <select
                                className="spare-part-select"
                                value={getDisplayValue(item, 'includedSparePartId') || ''}
                                onChange={(e) => handleFieldChange(item.id, 'includedSparePartId', e.target.value ? parseInt(e.target.value) : null)}
                                disabled={saving}
                                style={{ fontSize: '0.85em', marginBottom: '4px' }}
                              >
                                <option value="">-- Select Spare Part --</option>
                                {spareParts.map(part => (
                                  <option key={part.id} value={part.id}>
                                    {part.partNumber} - {part.name}
                                  </option>
                                ))}
                              </select>
                              <input
                                type="number"
                                className="quantity-input"
                                value={getDisplayValue(item, 'includedQuantity') || 0}
                                onChange={(e) => handleFieldChange(item.id, 'includedQuantity', e.target.value)}
                                disabled={saving}
                                min="0"
                                step="1"
                                placeholder="Qty"
                                style={{ fontSize: '0.85em' }}
                              />
                            </div>
                          )}
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
                          <button
                            className="btn-save-item"
                            onClick={() => handleSaveItem(item)}
                            disabled={!hasChanges(item.id) || saving}
                          >
                             Save
                          </button>
                          <button
                            className="btn-delete-item"
                            onClick={() => handleDeleteItem(item)}
                            disabled={saving}
                            title="Remove from package"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {/* Add Item Modal */}
        {showAddModal && (
          <div className="add-item-overlay">
            <div className="add-item-modal">
              <div className="add-item-header">
                <h4>Add Service Item</h4>
                <button 
                  className="close-btn-small"
                  onClick={() => setShowAddModal(false)}
                  disabled={saving}
                >
                  ✕
                </button>
              </div>
              
              <div className="add-item-body">
                <div className="form-group">
                  <label>Service Item *</label>
                  <select
                    value={newItem.serviceItemId}
                    onChange={(e) => setNewItem({ ...newItem, serviceItemId: e.target.value })}
                    disabled={saving}
                  >
                    <option value="">-- Select Service Item --</option>
                    {getAvailableServiceItems().map(si => (
                      <option key={si.id} value={si.id}>
                        {si.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Action Type *</label>
                  <select
                    value={newItem.actionType}
                    onChange={(e) => {
                      const newActionType = e.target.value;
                      setNewItem({ 
                        ...newItem, 
                        actionType: newActionType,
                        // Clear spare part fields when switching to CHECK
                        includedSparePartId: newActionType === 'CHECK' ? null : newItem.includedSparePartId,
                        includedQuantity: newActionType === 'CHECK' ? 0 : newItem.includedQuantity
                      });
                    }}
                    disabled={saving}
                  >
                    <option value="CHECK">Check</option>
                    <option value="REPLACE">Replace</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Price (VND) *</label>
                  <input
                    type="number"
                    value={newItem.price}
                    onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                    disabled={saving}
                    min="0"
                    step="1000"
                  />
                </div>

                {newItem.actionType === 'REPLACE' && (
                  <>
                    <div className="form-group">
                      <label>Spare Part (Optional)</label>
                      <select
                        value={newItem.includedSparePartId || ''}
                        onChange={(e) => setNewItem({ ...newItem, includedSparePartId: e.target.value ? e.target.value : null })}
                        disabled={saving}
                      >
                        <option value="">-- None --</option>
                        {spareParts.map(part => (
                          <option key={part.id} value={part.id}>
                            {part.partNumber} - {part.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Quantity</label>
                      <input
                        type="number"
                        value={newItem.includedQuantity}
                        onChange={(e) => setNewItem({ ...newItem, includedQuantity: e.target.value })}
                        disabled={saving}
                        min="0"
                        step="1"
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="add-item-footer">
                <button 
                  className="btn-cancel-add"
                  onClick={() => setShowAddModal(false)}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button 
                  className="btn-confirm-add"
                  onClick={handleAddItem}
                  disabled={saving}
                >
                  {saving ? 'Adding...' : ' Add'}
                </button>
              </div>
            </div>
          </div>
        )}

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
                   Save All ({changedItemsCount})
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
