import api from './apiConfig'
import logger from '../utils/logger'

const modelPackageItemService = {
  /**
   * Get all model package items
   */
  getAll: async () => {
    try {
      logger.log('📡 Fetching all model package items')
      const response = await api.get('/api/model-package-items')
      
      if (response.data.code === 1000) {
        logger.log('✅ All model package items fetched successfully')
        return {
          success: true,
          data: response.data.result,
          message: response.data.message
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Failed to get model package items'
        }
      }
    } catch (error) {
      logger.error('❌ Error fetching model package items:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to get model package items',
        error: error.response?.data || error.message
      }
    }
  },

  /**
   * Get model package item by ID
   */
  getById: async (id) => {
    try {
      logger.log('📡 Fetching model package item:', id)
      const response = await api.get(`/api/model-package-items/${id}`)
      
      if (response.data.code === 1000) {
        logger.log('✅ Model package item fetched successfully')
        return {
          success: true,
          data: response.data.result,
          message: response.data.message
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Failed to get model package item'
        }
      }
    } catch (error) {
      logger.error('❌ Error fetching model package item:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to get model package item',
        error: error.response?.data || error.message
      }
    }
  },

  /**
   * Get all model package items by vehicle model ID
   */
  getByVehicleModel: async (vehicleModelId) => {
    try {
      logger.log('📡 Fetching model package items for vehicle model:', vehicleModelId)
      const response = await api.get(`/api/model-package-items/vehicle-model/${vehicleModelId}`)
      
      if (response.data.code === 1000) {
        logger.log('✅ Model package items fetched successfully:', response.data.result)
        return {
          success: true,
          data: response.data.result,
          message: response.data.message
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Failed to get model package items'
        }
      }
    } catch (error) {
      logger.error('❌ Error fetching model package items:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to get model package items',
        error: error.response?.data || error.message
      }
    }
  },

  /**
   * Get model package items by vehicle model and milestone
   */
  getByModelAndMilestone: async (vehicleModelId, milestoneKm) => {
    try {
      logger.log('📡 Fetching items for model:', vehicleModelId, 'milestone:', milestoneKm)
      const response = await api.get(`/api/model-package-items/vehicle-model/${vehicleModelId}/milestone/${milestoneKm}`)
      
      if (response.data.code === 1000) {
        logger.log('✅ Milestone items fetched successfully:', response.data.result)
        return {
          success: true,
          data: response.data.result,
          message: response.data.message
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Failed to get milestone items'
        }
      }
    } catch (error) {
      logger.error('❌ Error fetching milestone items:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to get milestone items',
        error: error.response?.data || error.message
      }
    }
  },

  /**
   * Get total price by vehicle model and milestone
   */
  getTotalByModelAndMilestone: async (vehicleModelId, milestoneKm) => {
    try {
      logger.log('📡 Fetching total for model:', vehicleModelId, 'milestone:', milestoneKm)
      const response = await api.get(`/api/model-package-items/total/model/${vehicleModelId}/milestone/${milestoneKm}`)
      
      if (response.data.code === 1000) {
        logger.log('✅ Total price fetched successfully:', response.data.result)
        return {
          success: true,
          data: response.data.result, // Should be a number
          message: response.data.message
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Failed to get total price'
        }
      }
    } catch (error) {
      logger.error('❌ Error fetching total price:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to get total price',
        error: error.response?.data || error.message
      }
    }
  },

  /**
   * Clone configuration from one model to another
   */
  cloneFromModel: async (sourceModelId, targetModelId) => {
    try {
      logger.log('📡 Cloning config from model', sourceModelId, 'to model', targetModelId)
      const response = await api.post(`/api/model-package-items/clone-from-model/${sourceModelId}/to-model/${targetModelId}`)
      
      if (response.data.code === 1000) {
        logger.log('✅ Configuration cloned successfully')
        return {
          success: true,
          data: response.data.result,
          message: response.data.message || 'Configuration cloned successfully'
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Failed to clone configuration'
        }
      }
    } catch (error) {
      logger.error('❌ Error cloning configuration:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to clone configuration',
        error: error.response?.data || error.message
      }
    }
  },

  /**
   * Create a new model package item
   */
  create: async (itemData) => {
    try {
      logger.log('📡 Creating model package item:', itemData)
      const response = await api.post('/api/model-package-items', itemData)
      
      if (response.data.code === 1000) {
        logger.log('✅ Model package item created successfully')
        return {
          success: true,
          data: response.data.result,
          message: response.data.message || 'Item created successfully'
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Failed to create item'
        }
      }
    } catch (error) {
      logger.error('❌ Error creating model package item:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to create item',
        error: error.response?.data || error.message
      }
    }
  },

  /**
   * Update an existing model package item
   */
  update: async (itemId, itemData) => {
    try {
      logger.log('📡 Updating model package item:', itemId, itemData)
      const response = await api.put(`/api/model-package-items/${itemId}`, itemData)
      
      if (response.data.code === 1000) {
        logger.log('✅ Model package item updated successfully')
        return {
          success: true,
          data: response.data.result,
          message: response.data.message || 'Item updated successfully'
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Failed to update item'
        }
      }
    } catch (error) {
      logger.error('❌ Error updating model package item:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update item',
        error: error.response?.data || error.message
      }
    }
  },

  /**
   * Delete a model package item
   */
  delete: async (itemId) => {
    try {
      logger.log('📡 Deleting model package item:', itemId)
      const response = await api.delete(`/api/model-package-items/${itemId}`)
      
      if (response.data.code === 1000) {
        logger.log('✅ Model package item deleted successfully')
        return {
          success: true,
          message: response.data.message || 'Item deleted successfully'
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Failed to delete item'
        }
      }
    } catch (error) {
      logger.error('❌ Error deleting model package item:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete item',
        error: error.response?.data || error.message
      }
    }
  },

  // ===== DEPRECATED - Kept for backward compatibility =====
  /**
   * @deprecated Use getByModelAndMilestone instead
   */
  getByModelAndPackage: async (vehicleModelId, servicePackageId) => {
    logger.warn('⚠️ getByModelAndPackage is deprecated. Use getByModelAndMilestone instead.')
    // Try to use the milestone-based API if servicePackageId is actually a milestoneKm
    return modelPackageItemService.getByModelAndMilestone(vehicleModelId, servicePackageId)
  }
}

export default modelPackageItemService
