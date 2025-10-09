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

// Response interceptor for global error handling
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('accessToken')
      localStorage.removeItem('currentUser')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
export { BASE_URL }