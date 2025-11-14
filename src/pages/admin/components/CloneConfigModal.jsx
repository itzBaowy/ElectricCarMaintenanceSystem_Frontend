import { useState } from 'react'
import PropTypes from 'prop-types'
import modelPackageItemService from '../../../api/modelPackageItemService'
import '../../../styles/CloneConfigModal.css'

const CloneConfigModal = ({ targetModel, allModels, onClose, onSuccess }) => {
  const [selectedSourceModel, setSelectedSourceModel] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleClone = async () => {
    if (!selectedSourceModel) {
      setError('Please select a source model')
      return
    }

    const confirmMsg = `Are you sure you want to copy configuration from "${
      allModels.find(m => m.id === parseInt(selectedSourceModel))?.name
    }" to "${targetModel.name}"?\n\nWarning: This will delete all current configurations (if any) of ${targetModel.name}.`

    if (!window.confirm(confirmMsg)) {
      return
    }

    try {
      setLoading(true)
      setError('')
      
      const result = await modelPackageItemService.cloneFromModel(
        parseInt(selectedSourceModel),
        targetModel.id
      )

      if (result.success) {
        alert(' Configuration cloned successfully!')
        onSuccess()
      } else {
        setError(result.message || 'Failed to clone configuration')
      }
    } catch (err) {
      setError('An error occurred while cloning configuration')
      console.error('Clone error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay clone-modal-overlay" onClick={onClose}>
      <div className="modal-content clone-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Clone Configuration</h3>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <div className="clone-info">
            <div className="clone-direction">
              <div className="model-box source">
                <label>From model:</label>
                <select
                  value={selectedSourceModel}
                  onChange={(e) => {
                    setSelectedSourceModel(e.target.value)
                    setError('')
                  }}
                  className="model-select"
                  disabled={loading}
                >
                  <option value="">-- Select source model --</option>
                  {allModels.map(model => (
                    <option key={model.id} value={model.id}>
                      {model.name} ({model.modelYear})
                    </option>
                  ))}
                </select>
              </div>

              <div className="arrow-icon">→</div>

              <div className="model-box target">
                <label>To model:</label>
                <div className="target-model">
                  {targetModel.name} ({targetModel.modelYear})
                </div>
              </div>
            </div>
          </div>

          <div className="clone-warning">
            <span className="warning-icon"></span>
            <div className="warning-text">
              <strong>Note:</strong>
              <ul>
                <li>All current configurations of <strong>{targetModel.name}</strong> will be deleted</li>
                <li>All maintenance milestones and items will be copied from the source model</li>
                <li>After cloning, you can edit the price and spare parts for each item</li>
              </ul>
            </div>
          </div>

          {error && (
            <div className="error-message">
              <span className="error-icon"></span>
              <span>{error}</span>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button 
            className="btn-cancel" 
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button 
            className="btn-clone" 
            onClick={handleClone}
            disabled={loading || !selectedSourceModel}
          >
            {loading ? (
              <>
                <span className="spinner-small"></span>
                Cloning...
              </>
            ) : (
              <>
                 Confirm Clone
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

CloneConfigModal.propTypes = {
  targetModel: PropTypes.object.isRequired,
  allModels: PropTypes.array.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired
}

export default CloneConfigModal
