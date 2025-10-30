import api from './apiConfig'
import logger from '../utils/logger'

const maintenanceService = {
  // Get maintenance recommendations for a vehicle
  getMaintenanceRecommendations: async (vehicleId) => {
    try {
      const response = await api.get(`/api/maintenance/recommendations/${vehicleId}`)
      
      if (response.data.code === 1000) {
        return {
          success: true,
          data: response.data.result, // Array of recommendations
          message: response.data.message || 'Recommendations loaded successfully'
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Failed to get recommendations',
          error: response.data
        }
      }
    } catch (error) {
      logger.error('Get maintenance recommendations error:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to get recommendations',
        error: error.response?.data || error.message
      }
    }
  }
}

export default maintenanceService
