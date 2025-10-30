import api from './apiConfig'
import logger from '../utils/logger'

const centerService = {
  // Get all maintenance centers
  getAllCenters: async () => {
    try {
      const response = await api.get('/api/service-centers')
      
      if (response.data.code === 1000) {
        // API returns result.content array
        const centers = response.data.result?.content || []
        return {
          success: true,
          data: centers,
          message: response.data.message || 'Centers loaded successfully'
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Failed to get centers',
          error: response.data
        }
      }
    } catch (error) {
      logger.error('Get centers error:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to get centers',
        error: error.response?.data || error.message
      }
    }
  },

  // Get center by ID
  getCenterById: async (centerId) => {
    try {
      const response = await api.get(`/api/service-centers/${centerId}`)
      
      if (response.data.code === 1000) {
        return {
          success: true,
          data: response.data.result,
          message: response.data.message
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Failed to get center',
          error: response.data
        }
      }
    } catch (error) {
      logger.error('Get center error:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to get center',
        error: error.response?.data || error.message
      }
    }
  }
}

export default centerService
