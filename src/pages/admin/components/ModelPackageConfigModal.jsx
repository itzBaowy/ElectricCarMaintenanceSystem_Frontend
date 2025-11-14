import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import modelPackageItemService from '../../../api/modelPackageItemService'
import CloneConfigModal from './CloneConfigModal'
import PackageItemsEditModal from './PackageItemsEditModal'
import '../../../styles/ModelPackageConfigModal.css'

const ModelPackageConfigModal = ({ model, allModels, onClose, onConfigUpdated }) => {
  const [loading, setLoading] = useState(true)
  const [packages, setPackages] = useState([])
  const [groupedPackages, setGroupedPackages] = useState({})
  const [showCloneModal, setShowCloneModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedPackage, setSelectedPackage] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchModelPackages()
    fetchAllPackages()
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

  const fetchAllPackages = async () => {
    try {
      const result = await modelPackageItemService.getAllServicePackages()
      if (result.success) {
        setPackages(result.data || [])
      }
    } catch (err) {
      console.error('Error fetching all packages:', err)
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
                  className="btn-clone"
                  onClick={handleCloneConfig}
                >
                   Clone from another model
                </button>
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
