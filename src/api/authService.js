import api from './apiConfig'

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
    console.error('Error decoding token:', error)
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
      console.error('Registration error:', error)
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
      console.error('Login error:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed',
        error: error.response?.data || error.message
      }
    }
  },

  // Logout user
  logout: () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('isAuthenticated')
    localStorage.removeItem('currentUser')
    window.location.href = '/login'
  },

  // Get current user from localStorage
  getCurrentUser: () => {
    try {
      const user = localStorage.getItem('currentUser')
      return user ? JSON.parse(user) : null
    } catch (error) {
      console.error('Error getting current user:', error)
      return null
    }
  },

  getAccessToken : () => {
    return localStorage.getItem('accessToken')
  },

  getRefreshToken : () => {
    return localStorage.getItem('refreshToken')
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    const accessToken = localStorage.getItem('accessToken')
    const isAuth = localStorage.getItem('isAuthenticated')
    return !!(accessToken && isAuth === 'true')
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
          role: tokenPayload.role,
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
      console.error('Get profile error:', error)
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
      console.error('Get customer profile error:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to get customer profile',
        error: error.response?.data || error.message
      }
    }
  }

  
}

export default authService