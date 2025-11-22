import api from './apiConfig'
import logger from '../utils/logger'

const reportService = {
  // Get financial report for a date range
  getFinancialReport: async (startDate, endDate) => {
    try {
      const response = await api.get('/api/reports/financial', {
        params: {
          startDate,
          endDate
        }
      })

      if (response.data.code === 1000) {
        return {
          success: true,
          data: response.data.result,
          message: response.data.message || 'Financial report fetched successfully'
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Failed to fetch financial report',
          error: response.data
        }
      }
    } catch (error) {
      logger.error('Get financial report error:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch financial report',
        error: error.response?.data || error.message
      }
    }
  },

  // Get revenue by year (monthly breakdown)
  getRevenueByYear: async (year) => {
    try {
      const response = await api.get('/api/reports/revenue-by-year', {
        params: { year }
      })

      if (response.data.code === 1000) {
        return {
          success: true,
          data: response.data.result,
          message: response.data.message || 'Revenue by year fetched successfully'
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Failed to fetch revenue by year',
          error: response.data
        }
      }
    } catch (error) {
      logger.error('Get revenue by year error:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch revenue by year',
        error: error.response?.data || error.message
      }
    }
  }
}

export default reportService
