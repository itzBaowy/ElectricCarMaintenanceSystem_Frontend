import api from './apiConfig'

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
        const { token, user } = response.data.result
        
        if (token) {
          localStorage.setItem('authToken', token)
          localStorage.setItem('currentUser', JSON.stringify(user))
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
    localStorage.removeItem('authToken')
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

  // Check if user is authenticated
  isAuthenticated: () => {
    const token = localStorage.getItem('authToken')
    const user = localStorage.getItem('currentUser')
    return !!(token && user)
  }
}

export default authService