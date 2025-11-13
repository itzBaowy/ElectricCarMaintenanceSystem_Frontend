import api from './apiConfig'
import logger from '../utils/logger'

const sparePartService = {
  // Get all spare parts with pagination support
  getAllSpareParts: async (page = 0, size = 1000) => {
    try {
      const response = await api.get('/api/spareParts', {
        params: {
          page,
          size
        }
      })
      logger.log('✅ Spare parts fetched successfully:', response.data)
      return response.data
    } catch (error) {
      logger.error('❌ Error fetching spare parts:', error)
      throw error
    }
  },

  // Get spare part by ID
  getSparePartById: async (id) => {
    try {
      const response = await api.get(`/api/spareParts/${id}`)
      logger.log('✅ Spare part fetched successfully:', response.data)
      return response.data
    } catch (error) {
      logger.error('❌ Error fetching spare part:', error)
      throw error
    }
  },

  // Create spare part (for future use)
  createSparePart: async (sparePartData) => {
    try {
      const response = await api.post('/api/spareParts/create', sparePartData)
      logger.log('✅ Spare part created successfully:', response.data)
      return response.data
    } catch (error) {
      logger.error('❌ Error creating spare part:', error)
      throw error
    }
  },

  // Update spare part (for future use)
  updateSparePart: async (id, sparePartData) => {
    try {
      const response = await api.put(`/api/spareParts/${id}`, sparePartData)
      logger.log('✅ Spare part updated successfully:', response.data)
      return response.data
    } catch (error) {
      logger.error('❌ Error updating spare part:', error)
      throw error
    }
  },

  // Update spare part stock
  updateSparePartStock: async (id, changeQuantity, reason) => {
    try {
      const response = await api.patch(`/api/spareParts/${id}/stock`, {
        changeQuantity,
        reason
      })
      logger.log('✅ Spare part stock updated successfully:', response.data)
      return response.data
    } catch (error) {
      logger.error('❌ Error updating spare part stock:', error)
      throw error
    }
  },

  // Delete spare part (for future use)
  deleteSparePart: async (id) => {
    try {
      const response = await api.delete(`/api/spareParts/${id}`)
      logger.log('✅ Spare part deleted successfully:', response.data)
      return response.data
    } catch (error) {
      logger.error('❌ Error deleting spare part:', error)
      throw error
    }
  }
}

export default sparePartService
