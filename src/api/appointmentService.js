import api from './apiConfig'
import logger from '../utils/logger'

const appointmentService = {
  // ===== APPOINTMENT APIs =====
  
  // Create new appointment (customer) - New flow with center selection
  createAppointment: async (appointmentData) => {
    try {
      // appointmentData format: { appointmentDate, vehicleId, centerId }
      const response = await api.post('/api/appointments/customer', appointmentData)
      
      if (response.data.code === 1000) {
        return {
          success: true,
          data: response.data.result,
          message: response.data.message || 'Appointment created successfully'
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Failed to create appointment',
          error: response.data
        }
      }
    } catch (error) {
      logger.error('Create appointment error:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to create appointment',
        error: error.response?.data || error.message
      }
    }
  },

  // Get all appointments (admin/staff only)
  getAllAppointments: async () => {
    try {
      const response = await api.get('/api/appointments')
      
      if (response.data.code === 1000) {
        return {
          success: true,
          data: response.data.result,
          message: response.data.message
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Failed to get appointments',
          error: response.data
        }
      }
    } catch (error) {
      logger.error('Get appointments error:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to get appointments',
        error: error.response?.data || error.message
      }
    }
  },

  // Get appointments by customer ID
  getAppointmentsByCustomerId: async (customerId) => {
    try {
      const response = await api.get(`/api/appointments/customer/${customerId}`)
      
      if (response.data.code === 1000) {
        return {
          success: true,
          data: response.data.result,
          message: response.data.message
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Failed to get customer appointments',
          error: response.data
        }
      }
    } catch (error) {
      logger.error('Get customer appointments error:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to get customer appointments',
        error: error.response?.data || error.message
      }
    }
  },

  // Get appointment by ID
  getAppointmentById: async (appointmentId) => {
    try {
      const response = await api.get(`/api/appointments/${appointmentId}`)
      
      if (response.data.code === 1000) {
        return {
          success: true,
          data: response.data.result,
          message: response.data.message
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Failed to get appointment',
          error: response.data
        }
      }
    } catch (error) {
      logger.error('Get appointment error:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to get appointment',
        error: error.response?.data || error.message
      }
    }
  },

  // ===== SERVICE PACKAGE APIs =====
  
  // Get all service packages
  getAllServicePackages: async () => {
    try {
      const response = await api.get('/api/servicePackage')
      
      if (response.data.code === 1000) {
        return {
          success: true,
          data: response.data.result,
          message: response.data.message
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Failed to get service packages',
          error: response.data
        }
      }
    } catch (error) {
      logger.error('Get service packages error:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to get service packages',
        error: error.response?.data || error.message
      }
    }
  },

  // ===== MODEL PACKAGE ITEMS APIs =====
  
  // Get all model package items
  getAllModelPackageItems: async () => {
    try {
      const response = await api.get('/api/model-package-items')
      
      if (response.data.code === 1000) {
        return {
          success: true,
          data: response.data.result,
          message: response.data.message
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Failed to get model package items',
          error: response.data
        }
      }
    } catch (error) {
      logger.error('Get model package items error:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to get model package items',
        error: error.response?.data || error.message
      }
    }
  },

  // Get model package items by vehicle model ID
  getModelPackageItemsByVehicleModel: async (vehicleModelId) => {
    try {
      const response = await api.get(`/api/model-package-items/vehicle-model/${vehicleModelId}`)
      
      if (response.data.code === 1000) {
        return {
          success: true,
          data: response.data.result,
          message: response.data.message
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Failed to get model package items',
          error: response.data
        }
      }
    } catch (error) {
      logger.error('Get model package items by vehicle model error:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to get model package items',
        error: error.response?.data || error.message
      }
    }
  },

  // Get model package items by service package ID
  getModelPackageItemsByServicePackage: async (servicePackageId) => {
    try {
      const response = await api.get(`/api/model-package-items/service-package/${servicePackageId}`)
      
      if (response.data.code === 1000) {
        return {
          success: true,
          data: response.data.result,
          message: response.data.message
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Failed to get model package items',
          error: response.data
        }
      }
    } catch (error) {
      logger.error('Get model package items by service package error:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to get model package items',
        error: error.response?.data || error.message
      }
    }
  },

  // Get model package items by vehicle model and service package
  getModelPackageItemsByVehicleModelAndPackage: async (vehicleModelId, servicePackageId) => {
    try {
      const response = await api.get(`/api/model-package-items/vehicle-model/${vehicleModelId}/package/${servicePackageId}`)
      
      if (response.data.code === 1000) {
        return {
          success: true,
          data: response.data.result,
          message: response.data.message
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Failed to get model package items',
          error: response.data
        }
      }
    } catch (error) {
      logger.error('Get model package items by vehicle model and package error:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to get model package items',
        error: error.response?.data || error.message
      }
    }
  },

  // Get individual services by vehicle model ID
  getIndividualServicesByVehicleModel: async (vehicleModelId) => {
    try {
      const response = await api.get(`/api/model-package-items/vehicle-model/${vehicleModelId}/individual-services`)
      
      if (response.data.code === 1000) {
        return {
          success: true,
          data: response.data.result,
          message: response.data.message
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Failed to get individual services',
          error: response.data
        }
      }
    } catch (error) {
      logger.error('Get individual services by vehicle model error:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to get individual services',
        error: error.response?.data || error.message
      }
    }
  },

  // Cancel appointment (customer)
  cancelAppointment: async (appointmentId) => {
    try {
      const response = await api.put(`/api/appointments/cancel/${appointmentId}`)
      
      if (response.data.code === 1000) {
        return {
          success: true,
          data: response.data.result,
          message: response.data.message || 'Appointment cancelled successfully'
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Failed to cancel appointment',
          error: response.data
        }
      }
    } catch (error) {
      logger.error('Cancel appointment error:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to cancel appointment',
        error: error.response?.data || error.message
      }
    }
  },

  // Update appointment status (admin/staff only)
  updateAppointmentStatus: async (appointmentId, status) => {
    try {
      const response = await api.put(`/api/appointments/setStatus/${appointmentId}`, status)
      
      if (response.data.code === 1000) {
        return {
          success: true,
          data: response.data.result,
          message: response.data.message || 'Appointment updated successfully'
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Failed to update appointment',
          error: response.data
        }
      }
    } catch (error) {
      logger.error('Update appointment error:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update appointment',
        error: error.response?.data || error.message
      }
    }
  },

  // Get package price by vehicle model and service package
  getPackagePriceByModelAndPackage: async (vehicleModelId, servicePackageId) => {
    try {
      const response = await api.get(`/api/model-package-items/total/model/${vehicleModelId}/package/${servicePackageId}`)
      
      if (response.data.code === 1000) {
        return {
          success: true,
          data: response.data.result, // Price as number
          message: response.data.message
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Failed to get package price',
          error: response.data
        }
      }
    } catch (error) {
      logger.error('Get package price error:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to get package price',
        error: error.response?.data || error.message
      }
    }
  }
}

export default appointmentService
