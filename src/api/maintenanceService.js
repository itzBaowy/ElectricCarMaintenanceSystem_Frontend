import api from './apiConfig'
import logger from '../utils/logger'

const maintenanceService = {
  // Get maintenance recommendations for a vehicle
  // currentOdo: optional parameter - customer-reported odometer reading
  getMaintenanceRecommendations: async (vehicleId, currentOdo = null) => {
    try {
      // Build URL with optional currentOdo query parameter
      let url = `/api/maintenance/recommendations/${vehicleId}`
      if (currentOdo !== null && currentOdo > 0) {
        url += `?currentOdo=${currentOdo}`
      }
      
      const response = await api.get(url)
      
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
