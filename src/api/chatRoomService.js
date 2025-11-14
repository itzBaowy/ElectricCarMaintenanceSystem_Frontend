import api from './apiConfig'
import logger from '../utils/logger'

const chatRoomService = {
  // ===== CHAT ROOM APIs =====
  
  // Create new chat room (customer)
  createChatRoom: async (roomData) => {
    try {
      // roomData format: { name }
      const response = await api.post('/api/chat-rooms/create', roomData)
      
      if (response.data.code === 1000) {
        return {
          success: true,
          data: response.data.result,
          message: response.data.message || 'Chat room created successfully'
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Failed to create chat room',
          error: response.data
        }
      }
    } catch (error) {
      logger.error('Create chat room error:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to create chat room',
        error: error.response?.data || error.message
      }
    }
  },

  // Get my chat rooms (customer & staff)
  getMyChatRooms: async () => {
    try {
      const response = await api.get('/api/chat-rooms/my-room')
      
      if (response.data.code === 1000) {
        return {
          success: true,
          data: response.data.result,
          message: response.data.message
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Failed to get chat rooms',
          error: response.data
        }
      }
    } catch (error) {
      logger.error('Get my chat rooms error:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to get chat rooms',
        error: error.response?.data || error.message
      }
    }
  },

  // Get pending chat rooms (staff only)
  getPendingChatRooms: async () => {
    try {
      const response = await api.get('/api/chat-rooms/pending')
      
      if (response.data.code === 1000) {
        return {
          success: true,
          data: response.data.result,
          message: response.data.message
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Failed to get pending chat rooms',
          error: response.data
        }
      }
    } catch (error) {
      logger.error('Get pending chat rooms error:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to get pending chat rooms',
        error: error.response?.data || error.message
      }
    }
  },

  // Join chat room (staff)
  joinChatRoom: async (roomId) => {
    try {
      const response = await api.post(`/api/chat-rooms/${roomId}/join`)
      
      if (response.data.code === 1000) {
        return {
          success: true,
          data: response.data.result,
          message: response.data.message || 'Joined chat room successfully'
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Failed to join chat room',
          error: response.data
        }
      }
    } catch (error) {
      logger.error('Join chat room error:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to join chat room',
        error: error.response?.data || error.message
      }
    }
  },

  // Close chat room (customer & staff)
  closeChatRoom: async (roomId) => {
    try {
      const response = await api.post(`/api/chat-rooms/${roomId}/close`)
      
      if (response.data.code === 1000) {
        return {
          success: true,
          data: response.data.result,
          message: response.data.message || 'Chat room closed successfully'
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Failed to close chat room',
          error: response.data
        }
      }
    } catch (error) {
      logger.error('Close chat room error:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to close chat room',
        error: error.response?.data || error.message
      }
    }
  },

  // Get chat room messages (customer & staff)
  getChatRoomMessages: async (roomId) => {
    try {
      const response = await api.get(`/api/chat-rooms/${roomId}/message`)
      
      if (response.data.code === 1000) {
        return {
          success: true,
          data: response.data.result,
          message: response.data.message
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Failed to get chat messages',
          error: response.data
        }
      }
    } catch (error) {
      logger.error('Get chat room messages error:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to get chat messages',
        error: error.response?.data || error.message
      }
    }
  }
}

export default chatRoomService
