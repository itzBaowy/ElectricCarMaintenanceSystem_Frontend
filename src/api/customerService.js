import api from './apiConfig'

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
      console.error('Get customers error:', error)
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
      console.error('Get customer error:', error)
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
      console.error('Update customer error:', error)
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
      console.error('Delete customer error:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete customer',
        error: error.response?.data || error.message
      }
    }
  }
}

export default customerService