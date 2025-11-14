import api from './apiConfig'
import logger from '../utils/logger'

const invoiceService = {
  // Generate invoice for a completed appointment
  generateInvoice: async (appointmentId) => {
    try {
      const response = await api.post(`/api/invoices/generate/${appointmentId}`)
      
      if (response.data.code === 1000 || response.data.code === 0) {
        return {
          success: true,
          data: response.data.result,
          message: response.data.message || 'Invoice generated successfully'
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Failed to generate invoice',
          error: response.data
        }
      }
    } catch (error) {
      logger.error('Generate invoice error:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to generate invoice',
        error: error.response?.data || error.message
      }
    }
  },

  // Get invoice by ID
  getInvoiceById: async (invoiceId) => {
    try {
      const response = await api.get(`/api/invoices/${invoiceId}`)
      
      if (response.data.code === 1000 || response.data.code === 0) {
        return {
          success: true,
          data: response.data.result,
          message: response.data.message
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Failed to get invoice',
          error: response.data
        }
      }
    } catch (error) {
      logger.error('Get invoice error:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to get invoice',
        error: error.response?.data || error.message
      }
    }
  },

  // Get invoice by appointment ID
  getInvoiceByAppointmentId: async (appointmentId) => {
    try {
      const response = await api.get(`/api/invoices/appointment/${appointmentId}`)
      
      if (response.data.code === 1000 || response.data.code === 0) {
        return {
          success: true,
          data: response.data.result,
          message: response.data.message
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Invoice not found',
          error: response.data
        }
      }
    } catch (error) {
      logger.error('Get invoice by appointment error:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Invoice not found',
        error: error.response?.data || error.message
      }
    }
  },

  // Get my invoices (for logged in customer)
  getMyInvoices: async () => {
    try {
      const response = await api.get('/api/invoices/my-invoices')
      
      if (response.data.code === 1000 || response.data.code === 0) {
        return {
          success: true,
          data: response.data.result,
          message: response.data.message || 'My invoices fetched successfully'
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Failed to get invoices',
          error: response.data
        }
      }
    } catch (error) {
      logger.error('Get my invoices error:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to get invoices',
        error: error.response?.data || error.message
      }
    }
  },

  // Get all invoices (for staff/admin)
  getAllInvoices: async () => {
    try {
      const response = await api.get('/api/invoices')
      
      if (response.data.code === 1000 || response.data.code === 0) {
        return {
          success: true,
          data: response.data.result,
          message: response.data.message || 'Invoices fetched successfully'
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Failed to get invoices',
          error: response.data
        }
      }
    } catch (error) {
      logger.error('Get all invoices error:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to get invoices',
        error: error.response?.data || error.message
      }
    }
  }
}

export default invoiceService
