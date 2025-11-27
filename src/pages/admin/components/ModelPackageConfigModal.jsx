import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import modelPackageItemService from '../../../api/modelPackageItemService'
import serviceItemService from '../../../api/serviceItemService'
import sparePartService from '../../../api/sparePartService'
import CloneConfigModal from './CloneConfigModal'
import PackageItemsEditModal from './PackageItemsEditModal'
import '../../../styles/ModelPackageConfigModal.css'

const ModelPackageConfigModal = ({ model, allModels, onClose, onConfigUpdated }) => {
  const [loading, setLoading] = useState(true)
  const [groupedPackages, setGroupedPackages] = useState({})
  const [showCloneModal, setShowCloneModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showAddMilestoneModal, setShowAddMilestoneModal] = useState(false)
  const [showEditMilestoneModal, setShowEditMilestoneModal] = useState(false)
  const [selectedPackage, setSelectedPackage] = useState(null)
  const [editingMilestone, setEditingMilestone] = useState(null)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [milestoneFormData, setMilestoneFormData] = useState({
    milestoneKm: '',
    milestoneMonth: '',
    serviceItemId: '',
    price: '',
    actionType: 'CHECK',
    includedSparePartId: '',
    includedQuantity: ''
  })
  const [serviceItems, setServiceItems] = useState([])
  const [spareParts, setSpareParts] = useState([])
  const [loadingItems, setLoadingItems] = useState(false)

  useEffect(() => {
    fetchModelPackages()
  }, [model.id])

  const fetchModelPackages = async () => {
    try {
      setLoading(true)
      setError('')
      const result = await modelPackageItemService.getByVehicleModel(model.id)
      
      if (result.success) {
        // Group by milestoneKm
        const grouped = {}
        result.data.forEach(item => {
          // Use milestoneKm as the key
          const milestoneKm = item.milestoneKm || 0
          const packageName = `Maintenance ${milestoneKm.toLocaleString('en-US')} km`
          
          if (!grouped[milestoneKm]) {
            grouped[milestoneKm] = {
              id: milestoneKm, // Using milestoneKm as ID
              name: packageName,
              milestoneKm: milestoneKm,
              milestoneMonth: item.milestoneMonth || 0, // Add milestoneMonth
              items: [],
              totalPrice: 0 // Will be fetched separately
            }
          }
          grouped[milestoneKm].items.push(item)
        })
        
        // Fetch total price for each milestone
        const milestones = Object.keys(grouped)
        await Promise.all(
          milestones.map(async (milestoneKm) => {
            const totalResult = await modelPackageItemService.getTotalByModelAndMilestone(
              model.id, 
              parseInt(milestoneKm)
            )
            if (totalResult.success) {
              grouped[milestoneKm].totalPrice = totalResult.data || 0
            }
          })
        )
        
        setGroupedPackages(grouped)
      } else {
        setError(result.message || 'Failed to load package configuration')
      }
    } catch (err) {
      setError('An error occurred while loading configuration')
      console.error('Error fetching model packages:', err)
    } finally {
      setLoading(false)
    }
  }



  const handleCloneConfig = () => {
    setShowCloneModal(true)
  }

  const handleCloneSuccess = () => {
    setShowCloneModal(false)
    fetchModelPackages()
    if (onConfigUpdated) onConfigUpdated()
  }

  const handleEditPackage = (pkg) => {
    setSelectedPackage(pkg)
    setShowEditModal(true)
  }

  const handleEditSuccess = () => {
    setShowEditModal(false)
    fetchModelPackages()
    if (onConfigUpdated) onConfigUpdated()
  }

  const handleEditMilestone = (pkg) => {
    setEditingMilestone(pkg)
    setMilestoneFormData({
      milestoneKm: pkg.milestoneKm.toString(),
      milestoneMonth: pkg.milestoneMonth.toString(),
      serviceItemId: '',
      price: '',
      actionType: 'CHECK',
      includedSparePartId: '',
      includedQuantity: ''
    })
    setShowEditMilestoneModal(true)
  }

  const handleSubmitMilestoneEdit = async (e) => {
    e.preventDefault()
    
    // Validation
    if (!milestoneFormData.milestoneKm || parseInt(milestoneFormData.milestoneKm) <= 0) {
      alert('Please enter a valid milestone km (greater than 0)')
      return
    }
    if (!milestoneFormData.milestoneMonth || parseInt(milestoneFormData.milestoneMonth) <= 0) {
      alert('Please enter a valid milestone month (greater than 0)')
      return
    }
    
    const newMilestoneKm = parseInt(milestoneFormData.milestoneKm)
    const oldMilestoneKm = editingMilestone.milestoneKm
    
    // Check if new milestone already exists (and it's not the same milestone)
    if (newMilestoneKm !== oldMilestoneKm && groupedPackages[newMilestoneKm]) {
      alert(`Milestone ${newMilestoneKm} km already exists`)
      return
    }
    
    try {
      setSaving(true)
      
      // Update all items in this milestone
      const items = editingMilestone.items
      let successCount = 0
      let errorCount = 0
      
      for (const item of items) {
        const updateData = {
          vehicleModelId: model.id,
          milestoneKm: parseInt(milestoneFormData.milestoneKm),
          milestoneMonth: parseInt(milestoneFormData.milestoneMonth),
          serviceItemId: item.serviceItemId,
          price: item.price,
          actionType: item.actionType,
          includedSparePartId: item.includedSparePartId,
          includedQuantity: item.includedQuantity
        }
        
        const result = await modelPackageItemService.update(item.id, updateData)
        
        if (result.success) {
          successCount++
        } else {
          errorCount++
        }
      }
      
      if (errorCount === 0) {
        alert(`✅ Milestone updated successfully! (${successCount} items updated)`)
        setShowEditMilestoneModal(false)
        setEditingMilestone(null)
        fetchModelPackages()
        if (onConfigUpdated) onConfigUpdated()
      } else {
        alert(`Updated ${successCount} items, ${errorCount} errors occurred`)
        fetchModelPackages()
      }
    } catch (err) {
      alert('An error occurred while updating milestone')
      console.error('Error updating milestone:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleAddMilestone = async () => {
    setMilestoneFormData({
      milestoneKm: '',
      milestoneMonth: '',
      serviceItemId: '',
      price: '',
      actionType: 'CHECK',
      includedSparePartId: '',
      includedQuantity: ''
    })
    
    // Load service items and spare parts
    setLoadingItems(true)
    try {
      const [serviceItemsResponse, sparePartsResponse] = await Promise.all([
        serviceItemService.getAllServiceItems(0, 1000),
        sparePartService.getAllSpareParts(0, 1000)
      ])
      
      if (serviceItemsResponse.code === 1000) {
        setServiceItems(serviceItemsResponse.result.content || [])
      }
      if (sparePartsResponse.code === 1000) {
        setSpareParts(sparePartsResponse.result.content || [])
      }
    } catch (err) {
      console.error('Error loading items:', err)
    } finally {
      setLoadingItems(false)
    }
    
    setShowAddMilestoneModal(true)
  }

  const handleSubmitMilestone = async (e) => {
    e.preventDefault()
    
    // Validation
    if (!milestoneFormData.milestoneKm || parseInt(milestoneFormData.milestoneKm) <= 0) {
      alert('Please enter a valid milestone km (greater than 0)')
      return
    }
    if (!milestoneFormData.milestoneMonth || parseInt(milestoneFormData.milestoneMonth) <= 0) {
      alert('Please enter a valid milestone month (greater than 0)')
      return
    }
    if (!milestoneFormData.serviceItemId) {
      alert('Please select a service item')
      return
    }
    if (!milestoneFormData.price || parseFloat(milestoneFormData.price) <= 0) {
      alert('Price must be greater than 0')
      return
    }
    
    const milestoneKm = parseInt(milestoneFormData.milestoneKm)
    
    // Check if milestone already exists
    if (groupedPackages[milestoneKm]) {
      alert(`Milestone ${milestoneKm} km already exists`)
      return
    }
    
    try {
      setSaving(true)
      
      const createData = {
        vehicleModelId: model.id,
        milestoneKm: parseInt(milestoneFormData.milestoneKm),
        milestoneMonth: parseInt(milestoneFormData.milestoneMonth),
        serviceItemId: parseInt(milestoneFormData.serviceItemId),
        price: parseFloat(milestoneFormData.price),
        actionType: milestoneFormData.actionType,
        includedSparePartId: milestoneFormData.includedSparePartId ? parseInt(milestoneFormData.includedSparePartId) : null,
        includedQuantity: milestoneFormData.includedQuantity ? parseInt(milestoneFormData.includedQuantity) : 0
      }
      
      const result = await modelPackageItemService.create(createData)
      
      if (result.success) {
        alert('✅ Maintenance milestone created successfully!')
        setShowAddMilestoneModal(false)
        setMilestoneFormData({
          milestoneKm: '',
          milestoneMonth: '',
          serviceItemId: '',
          price: '',
          actionType: 'CHECK',
          includedSparePartId: '',
          includedQuantity: ''
        })
        fetchModelPackages()
        if (onConfigUpdated) onConfigUpdated()
      } else {
        alert(result.message || 'Failed to create milestone')
      }
    } catch (err) {
      alert('An error occurred while creating milestone')
      console.error('Error creating milestone:', err)
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

  const calculatePackageTotal = (pkg) => {
    // Use totalPrice from API if available, otherwise calculate manually
    if (pkg.totalPrice !== undefined) {
      return pkg.totalPrice
    }
    return pkg.items.reduce((sum, item) => sum + (item.price || 0), 0)
  }

  const packageArray = Object.values(groupedPackages).sort((a, b) => a.milestoneKm - b.milestoneKm)
  const hasNoConfig = packageArray.length === 0

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content package-config-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3>Service Package Configuration</h3>
            <p className="modal-subtitle">{model.name} ({model.modelYear})</p>
          </div>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading configuration...</p>
            </div>
          ) : error ? (
            <div className="error-state">
              <span className="error-icon"></span>
              <p>{error}</p>
              <button className="btn-retry" onClick={fetchModelPackages}>
                Retry
              </button>
            </div>
          ) : (
            <>
              {/* Action Buttons */}
              <div className="config-actions">
                <button 
                  className="btn-add-milestone"
                  onClick={handleAddMilestone}
                >
                   Add Milestone
                </button>
                {/* <button 
                  className="btn-clone"
                  onClick={handleCloneConfig}
                >
                   Clone from another model
                </button> */}
                <div className="config-stats">
                  <span className="stat-badge">
                    {packageArray.length} maintenance milestones
                  </span>
                  <span className="stat-badge">
                    {packageArray.reduce((sum, pkg) => sum + pkg.items.length, 0)} items
                  </span>
                </div>
              </div>

              {/* Empty State */}
              {hasNoConfig ? (
                <div className="empty-state">
                  <div className="empty-icon"></div>
                  <h4>No configuration yet</h4>
                  <p>This model doesn't have any service package configuration.</p>
                  <p>Click "Clone from another model" to get started.</p>
                </div>
              ) : (
                <div className="packages-list">
                  {packageArray.map((pkg) => (
                    <div key={pkg.id} className="package-card">
                      <div className="package-header">
                        <div className="package-info">
                          <h4>{pkg.name}</h4>
                          <span className="milestone-badge">
                            {pkg.milestoneKm.toLocaleString('vi-VN')} km
                          </span>
                          <span className="milestone-badge milestone-month-badge">
                            {pkg.milestoneMonth} months
                          </span>
                        </div>
                        <div className="package-actions">
                          <span className="package-total">
                            {formatCurrency(calculatePackageTotal(pkg))}
                          </span>
                          <button
                            className="btn-edit-milestone"
                            onClick={() => handleEditMilestone(pkg)}
                            title="Edit milestone km and month"
                          >
                             Edit Milestone
                          </button>
                          <button
                            className="btn-edit-package"
                            onClick={() => handleEditPackage(pkg)}
                            title="Edit service items"
                          >
                             Edit Items
                          </button>
                        </div>
                      </div>
                      <div className="package-summary">
                        <span className="items-count">
                           {pkg.items.length} items
                        </span>
                        <span className="items-preview">
                          {pkg.items.slice(0, 3).map(item => item.serviceItemName).join(', ')}
                          {pkg.items.length > 3 && '...'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-close" onClick={onClose}>
            Close
          </button>
        </div>
      </div>

      {/* Clone Config Modal */}
      {showCloneModal && (
        <CloneConfigModal
          targetModel={model}
          allModels={allModels.filter(m => m.id !== model.id)}
          onClose={() => setShowCloneModal(false)}
          onSuccess={handleCloneSuccess}
        />
      )}

      {/* Edit Package Items Modal */}
      {showEditModal && selectedPackage && (
        <PackageItemsEditModal
          model={model}
          package={selectedPackage}
          onClose={() => setShowEditModal(false)}
          onSuccess={handleEditSuccess}
        />
      )}

      {/* Edit Milestone Modal */}
      {showEditMilestoneModal && editingMilestone && (
        <div className="modal-overlay" onClick={() => setShowEditMilestoneModal(false)}>
          <div className="modal-content milestone-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Milestone</h3>
              <button className="close-btn" onClick={() => setShowEditMilestoneModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmitMilestoneEdit} className="milestone-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Milestone KM *</label>
                  <input
                    type="number"
                    value={milestoneFormData.milestoneKm}
                    onChange={(e) => setMilestoneFormData({ ...milestoneFormData, milestoneKm: e.target.value })}
                    required
                    placeholder="e.g., 5000"
                    min="1"
                    disabled={saving}
                  />
                  <small>Kilometer milestone</small>
                </div>
                <div className="form-group">
                  <label>Milestone Month *</label>
                  <input
                    type="number"
                    value={milestoneFormData.milestoneMonth}
                    onChange={(e) => setMilestoneFormData({ ...milestoneFormData, milestoneMonth: e.target.value })}
                    required
                    placeholder="e.g., 6"
                    min="1"
                    disabled={saving}
                  />
                  <small>Month milestone</small>
                </div>
              </div>

              <div className="form-info-box">
                <p><strong>Note:</strong> This will update the milestone for all {editingMilestone.items.length} service item(s) in this package.</p>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setShowEditMilestoneModal(false)}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-submit" disabled={saving}>
                  {saving ? 'Updating...' : 'Update Milestone'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Milestone Modal */}
      {showAddMilestoneModal && (
        <div className="modal-overlay" onClick={() => setShowAddMilestoneModal(false)}>
          <div className="modal-content milestone-modal large-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add Maintenance Milestone</h3>
              <button className="close-btn" onClick={() => setShowAddMilestoneModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmitMilestone} className="milestone-form">
              {loadingItems ? (
                <div className="loading-state">
                  <div className="spinner"></div>
                  <p>Loading service items...</p>
                </div>
              ) : (
                <>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Milestone KM *</label>
                      <input
                        type="number"
                        value={milestoneFormData.milestoneKm}
                        onChange={(e) => setMilestoneFormData({ ...milestoneFormData, milestoneKm: e.target.value })}
                        required
                        placeholder="e.g., 5000"
                        min="1"
                      />
                      <small>Kilometer milestone</small>
                    </div>
                    <div className="form-group">
                      <label>Milestone Month *</label>
                      <input
                        type="number"
                        value={milestoneFormData.milestoneMonth}
                        onChange={(e) => setMilestoneFormData({ ...milestoneFormData, milestoneMonth: e.target.value })}
                        required
                        placeholder="e.g., 6"
                        min="1"
                      />
                      <small>Month milestone</small>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Service Item *</label>
                    <select
                      value={milestoneFormData.serviceItemId}
                      onChange={(e) => setMilestoneFormData({ ...milestoneFormData, serviceItemId: e.target.value })}
                      required
                    >
                      <option value="">-- Select Service Item --</option>
                      {serviceItems.map(item => (
                        <option key={item.id} value={item.id}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                    <small>Choose the service to be performed</small>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Price *</label>
                      <input
                        type="number"
                        step="0.01"
                        value={milestoneFormData.price}
                        onChange={(e) => setMilestoneFormData({ ...milestoneFormData, price: e.target.value })}
                        required
                        placeholder="e.g., 100000"
                        min="0.01"
                      />
                      <small>Service price (VND)</small>
                    </div>
                    <div className="form-group">
                      <label>Action Type *</label>
                      <select
                        value={milestoneFormData.actionType}
                        onChange={(e) => {
                          const newActionType = e.target.value;
                          setMilestoneFormData({ 
                            ...milestoneFormData, 
                            actionType: newActionType,
                            // Clear spare part fields when switching to CHECK
                            includedSparePartId: newActionType === 'CHECK' ? '' : milestoneFormData.includedSparePartId,
                            includedQuantity: newActionType === 'CHECK' ? '' : milestoneFormData.includedQuantity
                          });
                        }}
                        required
                        disabled={saving}
                      >
                        <option value="CHECK">Check</option>
                        <option value="REPLACE">Replace</option>
                      </select>
                      <small>Type of maintenance action</small>
                    </div>
                  </div>

                  {milestoneFormData.actionType === 'REPLACE' && (
                    <>
                      <div className="form-section-divider">
                        <span>Spare Part (Optional for REPLACE)</span>
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label>Included Spare Part</label>
                          <select
                            value={milestoneFormData.includedSparePartId}
                            onChange={(e) => setMilestoneFormData({ ...milestoneFormData, includedSparePartId: e.target.value })}
                            disabled={saving}
                          >
                            <option value="">-- None --</option>
                            {spareParts.map(part => (
                              <option key={part.id} value={part.id}>
                                {part.partNumber} - {part.name} (Stock: {part.stockQuantity})
                              </option>
                            ))}
                          </select>
                          <small>Optional spare part included in service</small>
                        </div>
                        <div className="form-group">
                          <label>Included Quantity</label>
                          <input
                            type="number"
                            value={milestoneFormData.includedQuantity}
                            onChange={(e) => setMilestoneFormData({ ...milestoneFormData, includedQuantity: e.target.value })}
                            placeholder="0"
                            min="0"
                            disabled={saving || !milestoneFormData.includedSparePartId}
                          />
                          <small>Quantity of spare part</small>
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}

              <div className="form-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setShowAddMilestoneModal(false)}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-submit" disabled={loadingItems || saving}>
                  {saving ? 'Creating...' : 'Create Milestone'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

ModelPackageConfigModal.propTypes = {
  model: PropTypes.object.isRequired,
  allModels: PropTypes.array.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfigUpdated: PropTypes.func
}

export default ModelPackageConfigModal
