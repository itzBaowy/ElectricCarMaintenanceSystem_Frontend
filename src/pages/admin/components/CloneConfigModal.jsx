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
      setError('Vui lòng chọn mẫu xe nguồn')
      return
    }

    const confirmMsg = `Bạn có chắc chắn muốn sao chép cấu hình từ "${
      allModels.find(m => m.id === parseInt(selectedSourceModel))?.name
    }" sang "${targetModel.name}"?\n\nCảnh báo: Điều này sẽ xóa toàn bộ cấu hình hiện tại (nếu có) của ${targetModel.name}.`

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
        alert('✅ Sao chép cấu hình thành công!')
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
          <h3>Sao chép Cấu hình</h3>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <div className="clone-info">
            <div className="clone-direction">
              <div className="model-box source">
                <label>Từ mẫu xe:</label>
                <select
                  value={selectedSourceModel}
                  onChange={(e) => {
                    setSelectedSourceModel(e.target.value)
                    setError('')
                  }}
                  className="model-select"
                  disabled={loading}
                >
                  <option value="">-- Chọn mẫu xe nguồn --</option>
                  {allModels.map(model => (
                    <option key={model.id} value={model.id}>
                      {model.name} ({model.modelYear})
                    </option>
                  ))}
                </select>
              </div>

              <div className="arrow-icon">→</div>

              <div className="model-box target">
                <label>Sang mẫu xe:</label>
                <div className="target-model">
                  {targetModel.name} ({targetModel.modelYear})
                </div>
              </div>
            </div>
          </div>

          <div className="clone-warning">
            <span className="warning-icon">⚠️</span>
            <div className="warning-text">
              <strong>Lưu ý:</strong>
              <ul>
                <li>Toàn bộ cấu hình hiện tại của <strong>{targetModel.name}</strong> sẽ bị xóa</li>
                <li>Tất cả các mốc bảo dưỡng và hạng mục sẽ được sao chép từ mẫu nguồn</li>
                <li>Sau khi sao chép, bạn có thể chỉnh sửa giá và phụ tùng cho từng hạng mục</li>
              </ul>
            </div>
          </div>

          {error && (
            <div className="error-message">
              <span className="error-icon">❌</span>
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
            Hủy
          </button>
          <button 
            className="btn-clone" 
            onClick={handleClone}
            disabled={loading || !selectedSourceModel}
          >
            {loading ? (
              <>
                <span className="spinner-small"></span>
                Đang sao chép...
              </>
            ) : (
              <>
                📋 Xác nhận sao chép
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
