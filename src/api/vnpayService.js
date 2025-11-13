import api from './apiConfig'
import logger from '../utils/logger'

const vnpayService = {
  // Create VNPay payment
  createPayment: async (invoiceId, bankCode) => {
    try {
      const response = await api.post('/api/vnpay/create', {
        inVoiceId: invoiceId,
        bankCode: bankCode
      })
      
      if (response.data.code === 1000 || response.data.code === 0) {
        return {
          success: true,
          data: response.data.result,
          message: response.data.message || 'Create payment successfully'
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Failed to create payment',
          error: response.data
        }
      }
    } catch (error) {
      logger.error('Create VNPay payment error:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to create payment',
        error: error.response?.data || error.message
      }
    }
  }
}

export default vnpayService
