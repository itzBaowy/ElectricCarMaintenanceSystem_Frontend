import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import modelPackageItemService from '../../../api/modelPackageItemService'
import CloneConfigModal from './CloneConfigModal'
import PackageItemsEditModal from './PackageItemsEditModal'
import '../../../styles/ModelPackageConfigModal.css'

const ModelPackageConfigModal = ({ model, allModels, onClose, onConfigUpdated }) => {
  const [loading, setLoading] = useState(true)
  const [groupedPackages, setGroupedPackages] = useState({})
  const [showCloneModal, setShowCloneModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showAddMilestoneModal, setShowAddMilestoneModal] = useState(false)
  const [selectedPackage, setSelectedPackage] = useState(null)
  const [error, setError] = useState('')
  const [milestoneFormData, setMilestoneFormData] = useState({
    milestoneKm: '',
    milestoneMonth: ''
  })

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

  const handleAddMilestone = () => {
    setMilestoneFormData({ milestoneKm: '', milestoneMonth: '' })
    setShowAddMilestoneModal(true)
  }

  const handleSubmitMilestone = async (e) => {
    e.preventDefault()
    
    const milestoneKm = parseInt(milestoneFormData.milestoneKm)
    const milestoneMonth = parseInt(milestoneFormData.milestoneMonth)
    
    // Validation
    if (!milestoneKm || milestoneKm <= 0) {
      alert('Please enter a valid milestone km (greater than 0)')
      return
    }
    if (!milestoneMonth || milestoneMonth <= 0) {
      alert('Please enter a valid milestone month (greater than 0)')
      return
    }
    
    // Check if milestone already exists
    if (groupedPackages[milestoneKm]) {
      alert(`Milestone ${milestoneKm} km already exists`)
      return
    }
    
    try {
      const requestData = {
        vehicleModelId: model.id,
        milestoneKm: milestoneKm,
        milestoneMonth: milestoneMonth
      }
      
      const result = await modelPackageItemService.create(requestData)
      
      if (result.success) {
        alert('Maintenance milestone created successfully!')
        setShowAddMilestoneModal(false)
        fetchModelPackages()
        if (onConfigUpdated) onConfigUpdated()
      } else {
        alert(result.message || 'Failed to create milestone')
      }
    } catch (err) {
      alert('An error occurred while creating milestone')
      console.error('Error creating milestone:', err)
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
                        </div>
                        <div className="package-actions">
                          <span className="package-total">
                            {formatCurrency(calculatePackageTotal(pkg))}
                          </span>
                          <button
                            className="btn-edit-package"
                            onClick={() => handleEditPackage(pkg)}
                          >
                             Edit
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

      {/* Add Milestone Modal */}
      {showAddMilestoneModal && (
        <div className="modal-overlay" onClick={() => setShowAddMilestoneModal(false)}>
          <div className="modal-content milestone-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add Maintenance Milestone</h3>
              <button className="close-btn" onClick={() => setShowAddMilestoneModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmitMilestone} className="milestone-form">
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
                <small>Enter the kilometer milestone for this maintenance</small>
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
                <small>Enter the month milestone for this maintenance</small>
              </div>
              <div className="form-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setShowAddMilestoneModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  Create Milestone
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
