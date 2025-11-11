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
  }
}

export default vehicleModelService
