import api from './apiConfig'
import logger from '../utils/logger'

const centerService = {
  // Get all maintenance centers with pagination
  getAllCenters: async (page = 0, size = 15) => {
    try {
      const response = await api.get('/api/service-centers', {
        params: { page, size }
      })
      
      if (response.data.code === 1000) {
        // API returns result with content and pagination info
        return {
          success: true,
          data: response.data.result?.content || [],
          pagination: {
            totalElements: response.data.result?.totalElements || 0,
            totalPages: response.data.result?.totalPages || 0,
            currentPage: response.data.result?.number || 0,
            pageSize: response.data.result?.size || size,
            first: response.data.result?.first || false,
            last: response.data.result?.last || false
          },
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
  },

  // Create new service center
  createCenter: async (centerData) => {
    try {
      const response = await api.post('/api/service-centers', centerData)
      
      if (response.data.code === 1000) {
        return {
          success: true,
          data: response.data.result,
          message: response.data.message || 'Center created successfully'
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Failed to create center',
          error: response.data
        }
      }
    } catch (error) {
      logger.error('Create center error:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to create center',
        error: error.response?.data || error.message
      }
    }
  },

  // Update service center
  updateCenter: async (centerId, centerData) => {
    try {
      const response = await api.put(`/api/service-centers/${centerId}`, centerData)
      
      if (response.data.code === 1000) {
        return {
          success: true,
          data: response.data.result,
          message: response.data.message || 'Center updated successfully'
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Failed to update center',
          error: response.data
        }
      }
    } catch (error) {
      logger.error('Update center error:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update center',
        error: error.response?.data || error.message
      }
    }
  },

  // Delete service center
  deleteCenter: async (centerId) => {
    try {
      const response = await api.delete(`/api/service-centers/${centerId}`)
      
      if (response.data.code === 1000) {
        return {
          success: true,
          message: response.data.message || 'Center deleted successfully'
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Failed to delete center',
          error: response.data
        }
      }
    } catch (error) {
      logger.error('Delete center error:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete center',
        error: error.response?.data || error.message
      }
    }
  },

  // Update service center status
  updateCenterStatus: async (centerId, isActive) => {
    try {
      const response = await api.patch(`/api/service-centers/${centerId}/status`, { isActive })
      
      if (response.data.code === 1000) {
        return {
          success: true,
          data: response.data.result,
          message: response.data.message || 'Center status updated successfully'
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Failed to update center status',
          error: response.data
        }
      }
    } catch (error) {
      logger.error('Update center status error:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update center status',
        error: error.response?.data || error.message
      }
    }
  }
}

export default centerService
