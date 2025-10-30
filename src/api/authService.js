import api from './apiConfig'
import logger from '../utils/logger'

// Helper function to decode JWT token
const decodeToken = (token) => {
  try {
    if (!token) return null
    
    // JWT has 3 parts separated by dots
    const base64Url = token.split('.')[1]
    if (!base64Url) return null
    
    // Decode base64
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    
    return JSON.parse(jsonPayload)
  } catch (error) {
    logger.error('Error decoding token:', error)
    return null
  }
}

export const authService = {
  // Register new customer
  register: async (userData) => {
    try {
      const response = await api.post('/api/customers/register', userData)
      
      // Handle backend response format: {code, message, result}
      if (response.data.code === 1000) {
        return {
          success: true,
          data: response.data.result,
          message: response.data.message || 'Registration successful'
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Registration failed',
          error: response.data
        }
      }
    } catch (error) {
      logger.error('Registration error:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed',
        error: error.response?.data || error.message
      }
    }
  },

  // Login user
  login: async (credentials) => {
    try {
      const response = await api.post('/api/auth/login', credentials)
      
      // Handle backend response format: {code, message, result}
      if (response.data.code === 1000 && response.data.result) {
        const { accessToken, refreshToken } = response.data.result
        
        if (accessToken) {
          localStorage.setItem('accessToken', accessToken)
          localStorage.setItem('refreshToken', refreshToken)
          localStorage.setItem('isAuthenticated', 'true')
          
          // Decode token to get user info and store it
          const tokenPayload = decodeToken(accessToken)
          if (tokenPayload) {
            const userInfo = {
              userId: tokenPayload.userId,
              username: tokenPayload.sub,
              role: tokenPayload.role
            }
            localStorage.setItem('currentUser', JSON.stringify(userInfo))
          }
        }
        
        return {
          success: true,
          data: response.data.result,
          message: response.data.message || 'Login successful'
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Login failed',
          error: response.data
        }
      }
    } catch (error) {
      logger.error('Login error:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed',
        error: error.response?.data || error.message
      }
    }
  },

  // Logout user
  logout: () => {
    authService.clearSession()
    window.location.href = '/login'
  },

  // Get current user from localStorage
  getCurrentUser: () => {
    try {
      const user = localStorage.getItem('currentUser')
      return user ? JSON.parse(user) : null
    } catch (error) {
      logger.error('Error getting current user:', error)
      return null
    }
  },

  getAccessToken : () => {
    return localStorage.getItem('accessToken')
  },

  getRefreshToken : () => {
    return localStorage.getItem('refreshToken')
  },

  // Check if token is expired
  isTokenExpired: () => {
    const accessToken = localStorage.getItem('accessToken')
    if (!accessToken) return true

    try {
      const tokenPayload = decodeToken(accessToken)
      if (!tokenPayload || !tokenPayload.exp) return true

      // currentTime in seconds
      const currentTime = Date.now() / 1000
      return tokenPayload.exp < currentTime
    } catch (error) {
      logger.error('Error checking token expiration:', error)
      return true
    }
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    const accessToken = localStorage.getItem('accessToken')
    const isAuth = localStorage.getItem('isAuthenticated')
    
    if (!accessToken || isAuth !== 'true') return false
    
    // Check if token is expired
    if (authService.isTokenExpired()) {
      // Clear expired session
      authService.clearSession()
      return false
    }
    
    return true
  },

  // Get current user from localStorage
  getCurrentUser: () => {
    try {
      const userStr = localStorage.getItem('currentUser')
      if (!userStr) return null
      return JSON.parse(userStr)
    } catch (error) {
      logger.error('Error getting current user:', error)
      return null
    }
  },

  // Clear session data
  clearSession: () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('isAuthenticated')
    localStorage.removeItem('currentUser')
  },

  // Get user profile from API
  getUserProfile: async () => {
    try {
      // Get token from localStorage and decode it
      const accessToken = localStorage.getItem('accessToken')
      
      if (!accessToken) {
        return {
          success: false,
          message: 'No access token found. Please login again.',
          error: 'No token'
        }
      }
      
      // Decode token to get user info
      const tokenPayload = decodeToken(accessToken)
      
      if (tokenPayload) {
        // Store user info in localStorage for quick access
        const userInfo = {
          userId: tokenPayload.userId,
          username: tokenPayload.sub,
          role: tokenPayload.scope,
          exp: tokenPayload.exp
        }
        
        localStorage.setItem('currentUser', JSON.stringify(userInfo))
        
        return {
          success: true,
          data: userInfo,
          message: 'User profile retrieved from token'
        }
      } else {
        return {
          success: false,
          message: 'Invalid token format',
          error: 'Token decode failed'
        }
      }
    } catch (error) {
      logger.error('Get profile error:', error)
      return {
        success: false,
        message: 'Failed to get user profile',
        error: error.message
      }
    }
  },

  // Get customer profile by ID from API
  getCustomerProfile: async (customerId) => {
    try {
      const response = await api.get(`/api/customers/${customerId}`)
      
      if (response.data.code === 1000) {
        // Store user info in localStorage
        localStorage.setItem('currentUser', JSON.stringify(response.data.result))
        return {
          success: true,
          data: response.data.result,
          message: response.data.message || 'Customer profile retrieved successfully'
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Failed to get customer profile',
          error: response.data
        }
      }
    } catch (error) {
      logger.error('Get customer profile error:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to get customer profile',
        error: error.response?.data || error.message
      }
    }
  },

  // Refresh access token using refresh token
  refreshAccessToken: async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken')
      
      if (!refreshToken) {
        return {
          success: false,
          message: 'No refresh token found',
          error: 'No refresh token'
        }
      }

      const response = await api.post('/api/auth/refresh', {
        refreshToken: refreshToken
      })
      
      if (response.data.code === 1000 && response.data.result) {
        const { accessToken, refreshToken: newRefreshToken } = response.data.result
        
        if (accessToken) {
          // Update tokens in localStorage
          localStorage.setItem('accessToken', accessToken)
          if (newRefreshToken) {
            localStorage.setItem('refreshToken', newRefreshToken)
          }
          
          // Decode and update user info
          const tokenPayload = decodeToken(accessToken)
          if (tokenPayload) {
            const userInfo = {
              userId: tokenPayload.userId,
              username: tokenPayload.sub,
              role: tokenPayload.role
            }
            localStorage.setItem('currentUser', JSON.stringify(userInfo))
          }
          
          logger.log('Access token refreshed successfully')
          return {
            success: true,
            data: response.data.result,
            message: 'Token refreshed successfully'
          }
        }
      }
      
      return {
        success: false,
        message: response.data.message || 'Failed to refresh token',
        error: response.data
      }
    } catch (error) {
      logger.error('Refresh token error:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to refresh token',
        error: error.response?.data || error.message
      }
    }
  }
}

export default authService