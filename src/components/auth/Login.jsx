import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import authService from '../../api/authService'
import '../../styles/Login.css'

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
    // Clear success message when user starts typing
    if (successMessage) {
      setSuccessMessage('')
    }
  }

  const validateForm = () => {
    const newErrors = {}

    // Username validation
    if (!formData.username) {
      newErrors.username = 'Username is required'
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters'
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    
    try {
      console.log('Login attempt with:', formData)
      
      // Call the real API using authService
      const result = await authService.login({
        username: formData.username,
        password: formData.password
      })
      
      if (result.success) {
        // Login successful
        setSuccessMessage(result.message || 'Login successful! Redirecting...')
        console.log('Message: ',result.message)

        // Log tokens from localStorage
        const accessToken = authService.getAccessToken()
        const refreshToken = authService.getRefreshToken()  
        console.log('📦 Stored Access Token:', accessToken)
        console.log('📦 Stored Refresh Token:', refreshToken)
        
        // Clear any previous errors
        setErrors({})
        
        // Get user profile to determine role and redirect accordingly
        const profileResult = await authService.getUserProfile()
        
        if (profileResult.success) {
          const user = profileResult.data
          console.log('User profile:', user)
          
          // Small delay to show success message
          setTimeout(() => {
            // Redirect based on user role
            if (user.role === 'ADMIN') {
              navigate('/admin')
            } else if (user.role === 'CUSTOMER') {
              navigate('/customer')
            } else {
              navigate('/admin') // Default for staff, technician
            }
          }, 1000)
        } else {
          // If can't get profile, redirect to a default dashboard
          setTimeout(() => {
            navigate('/customer')
          }, 1000)
        }
      } else {
        // Login failed
        setErrors({ general: result.message || 'Invalid username or password' })
        setSuccessMessage('')
      }
      
    } catch (error) {
      console.error('Login error:', error)
      setErrors({ general: 'Login failed. Please try again.' })
      setSuccessMessage('')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <Link to="/" className="back-link">
            ← Back to Home
          </Link>
          <div className="logo">
            <h2>ElectricCare</h2>
            <p>Electric Vehicle Maintenance System</p>
          </div>
        </div>

        <div className="login-form-container">
          <h1>Welcome Back</h1>
          <p className="login-subtitle">Sign in to your account</p>

          {successMessage && (
            <div className="success-message">
              {successMessage}
            </div>
          )}

          {errors.general && (
            <div className="error-message general-error">
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className={errors.username ? 'error' : ''}
                placeholder="Enter your username"
                disabled={isLoading}
                autoComplete="username"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck="false"
              />
              {errors.username && (
                <span className="error-message">{errors.username}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={errors.password ? 'error' : ''}
                placeholder="Enter your password"
                disabled={isLoading}
                autoComplete="current-password"
              />
              {errors.password && (
                <span className="error-message">{errors.password}</span>
              )}
            </div>

            <div className="form-options">
              <label className="checkbox-container">
                <input type="checkbox" tabIndex="-1" />
                <span className="checkmark"></span>
                Remember me
              </label>
              <Link to="/forgot-password" className="forgot-link" tabIndex="-1">
                Forgot Password?
              </Link>
            </div>

            <button 
              type="submit" 
              className="login-btn"
              disabled={isLoading}
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div className="login-footer">
            <p>
              Don't have an account? 
              <Link to="/register" className="register-link">
                Sign up here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login