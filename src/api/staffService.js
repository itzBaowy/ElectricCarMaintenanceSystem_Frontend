import api from './apiConfig'
import logger from '../utils/logger'

const staffService = {
  // Get all staff members
  getAllStaff: async () => {
    try {
      const response = await api.get('/api/staffs')
      
      if (response.data.code === 1000) {
        return {
          success: true,
          data: response.data.result,
          message: response.data.message
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Failed to get staff members',
          error: response.data
        }
      }
    } catch (error) {
      logger.error('Get staff error:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to get staff members',
        error: error.response?.data || error.message
      }
    }
  },

  // Update staff member
  updateStaff: async (staffId, staffData) => {
    try {
      const response = await api.put(`/api/staffs/${staffId}`, staffData)
      
      if (response.data.code === 1000) {
        return {
          success: true,
          data: response.data.result,
          message: response.data.message || 'Staff updated successfully'
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Failed to update staff',
          error: response.data
        }
      }
    } catch (error) {
      logger.error('Update staff error:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update staff',
        error: error.response?.data || error.message
      }
    }
  },

  // Delete staff member
  deleteStaff: async (staffId) => {
    try {
      const response = await api.delete(`/api/staffs/${staffId}`)
      
      if (response.data.code === 1000) {
        return {
          success: true,
          data: response.data.result,
          message: response.data.message || 'Staff deleted successfully'
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Failed to delete staff',
          error: response.data
        }
      }
    } catch (error) {
      logger.error('Delete staff error:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete staff',
        error: error.response?.data || error.message
      }
    }
  }
}

export default staffService
