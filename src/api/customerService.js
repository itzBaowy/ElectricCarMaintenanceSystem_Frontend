import api from './apiConfig'
import logger from '../utils/logger'

export const customerService = {
  // Get all customers (admin only)
  getAllCustomers: async () => {
    try {
      const response = await api.get('/api/customers')
      
      // Handle backend response format: {code, message, result}
      if (response.data.code === 1000) {
        return {
          success: true,
          data: response.data.result,
          message: response.data.message || 'Customers fetched successfully'
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Failed to fetch customers',
          error: response.data
        }
      }
    } catch (error) {
      logger.error('Get customers error:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch customers',
        error: error.response?.data || error.message
      }
    }
  },

  // Get customer by ID
  getCustomerById: async (id) => {
    try {
      const response = await api.get(`/api/customers/${id}`)
      return {
        success: true,
        data: response.data,
        message: 'Customer fetched successfully'
      }
    } catch (error) {
      logger.error('Get customer error:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch customer',
        error: error.response?.data || error.message
      }
    }
  },

  // Update customer
  updateCustomer: async (id, customerData) => {
    try {
      const response = await api.put(`/api/customers/${id}`, customerData)
      return {
        success: true,
        data: response.data,
        message: 'Customer updated successfully'
      }
    } catch (error) {
      logger.error('Update customer error:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update customer',
        error: error.response?.data || error.message
      }
    }
  },

  // Delete customer
  deleteCustomer: async (id) => {
    try {
      const response = await api.delete(`/api/customers/${id}`)
      return {
        success: true,
        data: response.data,
        message: 'Customer deleted successfully'
      }
    } catch (error) {
      logger.error('Delete customer error:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete customer',
        error: error.response?.data || error.message
      }
    }
  },

  // Update my info (current logged-in customer)
  updateMyInfo: async (customerData) => {
    try {
      const response = await api.put('/api/customers/my-info', customerData)
      
      if (response.data.code === 1000) {
        return {
          success: true,
          data: response.data.result,
          message: response.data.message || 'Customer info updated successfully'
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Failed to update customer info',
          error: response.data
        }
      }
    } catch (error) {
      logger.error('Update my info error:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update customer info',
        error: error.response?.data || error.message
      }
    }
  },

  // Get my info (current logged-in customer)
  getMyInfo: async () => {
    try {
      const response = await api.get('/api/customers/my-info')
      
      if (response.data.code === 1000) {
        return {
          success: true,
          data: response.data.result,
          message: response.data.message || 'Customer info fetched successfully'
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Failed to fetch customer info',
          error: response.data
        }
      }
    } catch (error) {
      logger.error('Get my info error:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch customer info',
        error: error.response?.data || error.message
      }
    }
  },

  // Change password (current logged-in customer)
  changePassword: async (passwordData) => {
    try {
      const response = await api.put('/api/customers/change-password', passwordData)
      
      if (response.data.code === 1000) {
        return {
          success: true,
          message: response.data.message || 'Password updated successfully'
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Failed to change password',
          error: response.data
        }
      }
    } catch (error) {
      logger.error('Change password error:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to change password',
        error: error.response?.data || error.message
      }
    }
  }
}

export default customerService