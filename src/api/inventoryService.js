import api from './apiConfig'
import logger from '../utils/logger'

const inventoryService = {
  // Get inventory by service center ID
  getInventoryByCenterId: async (centerId) => {
    try {
      const response = await api.get(`/api/inventories/center/${centerId}`)
      logger.log('✅ Inventory fetched successfully:', response.data)
      return response.data
    } catch (error) {
      logger.error('❌ Error fetching inventory:', error)
      throw error
    }
  },

  // Update inventory stock for a spare part
  updateInventoryStock: async (sparePartId, stockData) => {
    try {
      const response = await api.post(`/api/inventories/spare-part/${sparePartId}/stock`, stockData)
      logger.log('✅ Inventory stock updated successfully:', response.data)
      return response.data
    } catch (error) {
      logger.error('❌ Error updating inventory stock:', error)
      throw error
    }
  }
}

export default inventoryService
