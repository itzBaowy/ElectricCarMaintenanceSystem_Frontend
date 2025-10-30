import api from './apiConfig'
import logger from '../utils/logger'

const technicianService = {
  // Get all technicians
  getAllTechnicians: async () => {
    try {
      const response = await api.get('/api/technicians')
      
      if (response.data.code === 1000) {
        return {
          success: true,
          data: response.data.result,
          message: response.data.message
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Failed to get technicians',
          error: response.data
        }
      }
    } catch (error) {
      logger.error('Get technicians error:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to get technicians',
        error: error.response?.data || error.message
      }
    }
  },

  // Assign technician to appointment
  assignTechnicianToAppointment: async (appointmentId, technicianId) => {
    try {
      const response = await api.put(`/api/appointments/${appointmentId}/assign/${technicianId}`)
      
      if (response.data.code === 1000) {
        return {
          success: true,
          data: response.data.result,
          message: response.data.message || 'Technician assigned successfully'
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Failed to assign technician',
          error: response.data
        }
      }
    } catch (error) {
      logger.error('Assign technician error:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to assign technician',
        error: error.response?.data || error.message
      }
    }
  },

  // Get appointments assigned to a technician
  getTechnicianAppointments: async (technicianId) => {
    try {
      const response = await api.get(`/api/appointments/technician/${technicianId}`)
      
      if (response.data.code === 1000) {
        return {
          success: true,
          data: response.data.result,
          message: response.data.message
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Failed to get technician appointments',
          error: response.data
        }
      }
    } catch (error) {
      logger.error('Get technician appointments error:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to get technician appointments',
        error: error.response?.data || error.message
      }
    }
  },

  // Delete technician
  deleteTechnician: async (technicianId) => {
    try {
      const response = await api.delete(`/api/technicians/${technicianId}`)
      
      if (response.data.code === 1000) {
        return {
          success: true,
          data: response.data.result,
          message: response.data.message || 'Technician deleted successfully'
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Failed to delete technician',
          error: response.data
        }
      }
    } catch (error) {
      logger.error('Delete technician error:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete technician',
        error: error.response?.data || error.message
      }
    }
  }
}

export default technicianService
