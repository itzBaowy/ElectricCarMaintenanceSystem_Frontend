import api from './apiConfig'
import logger from '../utils/logger'

const vehicleService = {
  // ===== VEHICLE APIs =====
  
  // Create new vehicle
  createVehicle: async (vehicleData) => {
    try {
      const response = await api.post('/api/vehicles/create', vehicleData)
      
      if (response.data.code === 1000) {
        return {
          success: true,
          data: response.data.result,
          message: response.data.message || 'Vehicle created successfully'
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Failed to create vehicle',
          error: response.data
        }
      }
    } catch (error) {
      logger.error('Create vehicle error:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to create vehicle',
        error: error.response?.data || error.message
      }
    }
  },

  // Get vehicle by ID
  getVehicleById: async (vehicleId) => {
    try {
      const response = await api.get(`/api/vehicles/${vehicleId}`)
      
      if (response.data.code === 1000) {
        return {
          success: true,
          data: response.data.result,
          message: response.data.message
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Failed to get vehicle',
          error: response.data
        }
      }
    } catch (error) {
      logger.error('Get vehicle error:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to get vehicle',
        error: error.response?.data || error.message
      }
    }
  },

  // Get vehicles by customer ID
  getVehiclesByCustomerId: async (customerId) => {
    try {
      const response = await api.get(`/api/vehicles/customer/${customerId}`)
      
      if (response.data.code === 1000) {
        return {
          success: true,
          data: response.data.result,
          message: response.data.message
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Failed to get vehicles',
          error: response.data
        }
      }
    } catch (error) {
      logger.error('Get vehicles error:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to get vehicles',
        error: error.response?.data || error.message
      }
    }
  },

  // Get all vehicles
  getAllVehicles: async (page = 0, size = 10) => {
    try {
      const response = await api.get('/api/vehicles', {
        params: { page, size }
      })
      
      if (response.data.code === 1000) {
        return {
          success: true,
          data: response.data.result,
          message: response.data.message
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Failed to get vehicles',
          error: response.data
        }
      }
    } catch (error) {
      logger.error('Get all vehicles error:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to get vehicles',
        error: error.response?.data || error.message
      }
    }
  },

  // Update vehicle
  updateVehicle: async (vehicleId, vehicleData) => {
    try {
      const response = await api.put(`/api/vehicles/${vehicleId}`, vehicleData)
      
      if (response.data.code === 1000) {
        return {
          success: true,
          data: response.data.result,
          message: response.data.message || 'Vehicle updated successfully'
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Failed to update vehicle',
          error: response.data
        }
      }
    } catch (error) {
      logger.error('Update vehicle error:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update vehicle',
        error: error.response?.data || error.message
      }
    }
  },

  // Update vehicle current KM only
  updateCurrentKm: async (vehicleId, currentKm) => {
    try {
      const response = await api.put(`/api/vehicles/${vehicleId}`, {
        currentKm: currentKm
      })
      
      if (response.data.code === 1000) {
        return {
          success: true,
          data: response.data.result,
          message: response.data.message || 'Current KM updated successfully'
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Failed to update current KM',
          error: response.data
        }
      }
    } catch (error) {
      logger.error('Update current KM error:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update current KM',
        error: error.response?.data || error.message
      }
    }
  },

  // Delete vehicle
  deleteVehicle: async (vehicleId) => {
    try {
      const response = await api.delete(`/api/vehicles/${vehicleId}`)
      
      if (response.data.code === 1000) {
        return {
          success: true,
          data: response.data.result,
          message: response.data.message || 'Vehicle deleted successfully'
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Failed to delete vehicle',
          error: response.data
        }
      }
    } catch (error) {
      logger.error('Delete vehicle error:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete vehicle',
        error: error.response?.data || error.message
      }
    }
  },

  // ===== VEHICLE MODEL APIs =====

  // Create new vehicle model
  createVehicleModel: async (modelData) => {
    try {
      const response = await api.post('/api/vehicleModel/create', modelData)
      
      if (response.data.code === 1000) {
        return {
          success: true,
          data: response.data.result,
          message: response.data.message || 'Vehicle model created successfully'
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Failed to create vehicle model',
          error: response.data
        }
      }
    } catch (error) {
      logger.error('Create vehicle model error:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to create vehicle model',
        error: error.response?.data || error.message
      }
    }
  },

  // Get vehicle model by ID
  getVehicleModelById: async (modelId) => {
    try {
      const response = await api.get(`/api/vehiclemodel/${modelId}`)
      
      if (response.data.code === 1000) {
        return {
          success: true,
          data: response.data.result,
          message: response.data.message
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Failed to get vehicle model',
          error: response.data
        }
      }
    } catch (error) {
      logger.error('Get vehicle model error:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to get vehicle model',
        error: error.response?.data || error.message
      }
    }
  },

  // Get all vehicle models
  getAllVehicleModels: async () => {
    try {
      const response = await api.get('/api/vehicleModel')
      
      if (response.data.code === 1000) {
        return {
          success: true,
          data: response.data.result,
          message: response.data.message
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Failed to get vehicle models',
          error: response.data
        }
      }
    } catch (error) {
      logger.error('Get all vehicle models error:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to get vehicle models',
        error: error.response?.data || error.message
      }
    }
  },

  // Search vehicle models by keyword
  searchVehicleModels: async (keyword) => {
    try {
      const response = await api.get('/api/vehicleModel/search', {
        params: { keyword }
      })
      
      if (response.data.code === 1000) {
        return {
          success: true,
          data: response.data.result,
          message: response.data.message
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Failed to search vehicle models',
          error: response.data
        }
      }
    } catch (error) {
      console.error('Search vehicle models error:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to search vehicle models',
        error: error.response?.data || error.message
      }
    }
  },

  // Update vehicle model
  updateVehicleModel: async (modelId, modelData) => {
    try {
      const response = await api.put(`/api/vehicleModel/${modelId}`, modelData)
      
      if (response.data.code === 1000) {
        return {
          success: true,
          data: response.data.result,
          message: response.data.message || 'Vehicle model updated successfully'
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Failed to update vehicle model',
          error: response.data
        }
      }
    } catch (error) {
      console.error('Update vehicle model error:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update vehicle model',
        error: error.response?.data || error.message
      }
    }
  },

  // Delete vehicle model
  deleteVehicleModel: async (modelId) => {
    try {
      const response = await api.delete(`/api/vehicleModel/${modelId}`)
      
      if (response.data.code === 1000) {
        return {
          success: true,
          data: response.data.result,
          message: response.data.message || 'Vehicle model deleted successfully'
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Failed to delete vehicle model',
          error: response.data
        }
      }
    } catch (error) {
      console.error('Delete vehicle model error:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete vehicle model',
        error: error.response?.data || error.message
      }
    }
  }
}

export default vehicleService
