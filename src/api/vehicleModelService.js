import api from './apiConfig'
import logger from '../utils/logger'

const vehicleModelService = {
  /**
   * Get all vehicle models
   */
  getAllVehicleModels: async () => {
    try {
      logger.log('📡 Fetching all vehicle models...')
      const response = await api.get('/api/vehicleModel')
      logger.log('✅ Vehicle models fetched successfully:', response.data)
      return response.data
    } catch (error) {
      logger.error('❌ Error fetching vehicle models:', error)
      throw error
    }
  },

  /**
   * Get vehicle model by ID
   */
  getVehicleModelById: async (id) => {
    try {
      logger.log('📡 Fetching vehicle model:', id)
      const response = await api.get(`/api/vehicleModel/${id}`)
      logger.log('✅ Vehicle model fetched successfully:', response.data)
      return response.data
    } catch (error) {
      logger.error('❌ Error fetching vehicle model:', error)
      throw error
    }
  },

  /**
   * Create new vehicle model
   */
  createVehicleModel: async (modelData) => {
    try {
      logger.log('📡 Creating vehicle model:', modelData)
      // Try with /create endpoint first (common pattern in backend)
      const response = await api.post('/api/vehicleModel/create', modelData)
      logger.log('✅ Vehicle model created successfully:', response.data)
      return response.data
    } catch (error) {
      logger.error('❌ Error creating vehicle model:', error)
      throw error
    }
  },

  /**
   * Update vehicle model
   */
  updateVehicleModel: async (id, modelData) => {
    try {
      logger.log('📡 Updating vehicle model:', id, modelData)
      const response = await api.put(`/api/vehicleModel/${id}`, modelData)
      logger.log('✅ Vehicle model updated successfully:', response.data)
      return response.data
    } catch (error) {
      logger.error('❌ Error updating vehicle model:', error)
      throw error
    }
  },

  /**
   * Delete vehicle model
   */
  deleteVehicleModel: async (id) => {
    try {
      logger.log('📡 Deleting vehicle model:', id)
      const response = await api.delete(`/api/vehicleModel/${id}`)
      logger.log('✅ Vehicle model deleted successfully:', response.data)
      return response.data
    } catch (error) {
      logger.error('❌ Error deleting vehicle model:', error)
      throw error
    }
  }
}

export default vehicleModelService
