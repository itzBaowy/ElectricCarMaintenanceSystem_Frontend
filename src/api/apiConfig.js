import axios from 'axios'
import logger from '../utils/logger'

// Base URL for the API from environment variables
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

// Log API URL in development only
logger.log('🔗 API Base URL:', BASE_URL)

// Create axios instance with default config
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
})

// Flag to prevent multiple refresh attempts
let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for global error handling and token refresh
api.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    const originalRequest = error.config

    // If error is 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            return api(originalRequest)
          })
          .catch(err => {
            return Promise.reject(err)
          })
      }

      originalRequest._retry = true
      isRefreshing = true

      const refreshToken = localStorage.getItem('refreshToken')

      if (!refreshToken) {
        // No refresh token, redirect to login
        isRefreshing = false
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('isAuthenticated')
        localStorage.removeItem('currentUser')
        window.location.href = '/login'
        return Promise.reject(error)
      }

      try {
        // Try to refresh the token
        const response = await axios.post(`${BASE_URL}/api/auth/refresh`, {
          refreshToken: refreshToken
        })

        if (response.data.code === 1000 && response.data.result) {
          const { accessToken, refreshToken: newRefreshToken } = response.data.result

          // Update tokens
          localStorage.setItem('accessToken', accessToken)
          if (newRefreshToken) {
            localStorage.setItem('refreshToken', newRefreshToken)
          }

          // Update authorization header
          api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`
          originalRequest.headers.Authorization = `Bearer ${accessToken}`

          // Process queued requests
          processQueue(null, accessToken)

          logger.log('✅ Token refreshed successfully')
          isRefreshing = false

          // Retry original request
          return api(originalRequest)
        } else {
          throw new Error('Token refresh failed')
        }
      } catch (refreshError) {
        // Refresh failed, clear session and redirect
        processQueue(refreshError, null)
        isRefreshing = false
        
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('isAuthenticated')
        localStorage.removeItem('currentUser')
        
        logger.error('❌ Token refresh failed, redirecting to login')
        window.location.href = '/login'
        
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export default api
export { BASE_URL }