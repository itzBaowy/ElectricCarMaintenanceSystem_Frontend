import api from './apiConfig'
import logger from '../utils/logger'

const serviceItemService = {
  /**
   * Get all service items with pagination
   * @param {number} page - Page number (0-indexed)
   * @param {number} size - Page size
   * @returns {Promise} Response with paginated service items
   */
  getAllServiceItems: async (page = 0, size = 10) => {
    try {
      const response = await api.get('/api/serviceItem', {
        params: { page, size }
      })
      logger.log('Get all service items response:', response.data)
      return response.data
    } catch (error) {
      logger.error('Error getting service items:', error)
      throw error
    }
  },

  /**
   * Create a new service item
   * @param {Object} serviceItemData - Service item data
   * @returns {Promise} Response with created service item
   */
  createServiceItem: async (serviceItemData) => {
    try {
      const response = await api.post('/api/serviceItem/create', serviceItemData)
      logger.log('Create service item response:', response.data)
      return response.data
    } catch (error) {
      logger.error('Error creating service item:', error)
      throw error
    }
  },

  /**
   * Update an existing service item
   * @param {number} id - Service item ID
   * @param {Object} serviceItemData - Updated service item data
   * @returns {Promise} Response with updated service item
   */
  updateServiceItem: async (id, serviceItemData) => {
    try {
      const response = await api.put(`/api/serviceItem/${id}`, serviceItemData)
      logger.log('Update service item response:', response.data)
      return response.data
    } catch (error) {
      logger.error('Error updating service item:', error)
      throw error
    }
  },

  /**
   * Delete a service item
   * @param {number} id - Service item ID
   * @returns {Promise} Response
   */
  deleteServiceItem: async (id) => {
    try {
      const response = await api.delete(`/api/serviceItem/${id}`)
      logger.log('Delete service item response:', response.data)
      return response.data
    } catch (error) {
      logger.error('Error deleting service item:', error)
      throw error
    }
  },

  /**
   * Update service item status
   * @param {number} id - Service item ID
   * @param {boolean} isActive - Active status
   * @returns {Promise} Response
   */
  updateServiceItemStatus: async (id, isActive) => {
    try {
      const response = await api.patch(`/api/serviceItem/${id}/status`, { isActive })
      logger.log('Update service item status response:', response.data)
      return response.data
    } catch (error) {
      logger.error('Error updating service item status:', error)
      throw error
    }
  }
}

export default serviceItemService
