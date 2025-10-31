import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import authService from '../../api/authService'
import logger from '../../utils/logger'
import '../../styles/Login.css'
import loginImage from '../../assets/photo-1541348263662-e068662d82af.jpeg'

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
      logger.log('Login attempt with:', formData)
      
      // Call the real API using authService
      const result = await authService.login({
        username: formData.username,
        password: formData.password
      })
      
      if (result.success) {
        // Login successful
        setSuccessMessage(result.message || 'Login successful! Redirecting...')
        logger.log('Message: ',result.message)

        // Log tokens from localStorage
        const accessToken = authService.getAccessToken()
        const refreshToken = authService.getRefreshToken()  
        logger.log('📦 Stored Access Token:', accessToken)
        logger.log('📦 Stored Refresh Token:', refreshToken)
        
        // Clear any previous errors
        setErrors({})
        
        // Get user profile to determine role and redirect accordingly
        const profileResult = await authService.getUserProfile()
        
        if (profileResult.success) {
          const user = profileResult.data
          logger.log('User profile:', user)
          
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
        {/* Left side - Image */}
        <div className="login-image-section">
          <img src={loginImage} alt="Electric Vehicle" className="login-bg-image" />
          <div className="login-image-overlay">
            <div className="login-image-content">
              <div className="logo-section">
                <h2>ElectricCare</h2>
                <p>Electric Vehicle Maintenance System</p>
              </div>
              <h1>Care for your car, confidence for your drive</h1>
              <p>Schedule visit in just a few clicks</p>
            </div>
          </div>
        </div>

        {/* Right side - Form */}
        <div className="login-form-section">
          <div className="login-form-header">
            <Link to="/" className="back-link">
              ← Back
            </Link>
            <button className="sign-in-btn-header">Sign in</button>
          </div>

          <div className="login-form-container">
            <h1>Welcome Back to ElectricCare!</h1>
            <p className="login-subtitle">Sign in your account</p>

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
                <label htmlFor="username">Your Email</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className={errors.username ? 'error' : ''}
                  placeholder="info.madhu786@gmail.com"
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
                  placeholder="••••••••"
                  disabled={isLoading}
                  autoComplete="current-password"
                />
                {errors.password && (
                  <span className="error-message">{errors.password}</span>
                )}
              </div>

              <div className="form-options">
                <label className="checkbox-container">
                  <input type="checkbox" />
                  Remember Me
                </label>
                <Link to="/forgot-password" className="forgot-link">
                  Forgot Password?
                </Link>
              </div>

              <button 
                type="submit" 
                className="login-btn"
                disabled={isLoading}
              >
                {isLoading ? 'Logging in...' : 'Login'}
              </button>

              <div className="divider">
                <span>or</span>
              </div>

              <div className="social-login">
                <button type="button" className="social-btn google-btn">
                  <span className="social-icon">G</span>
                  Continue with Google
                </button>
                <button type="button" className="social-btn facebook-btn">
                  <span className="social-icon">f</span>
                  Continue with Facebook
                </button>
              </div>
            </form>

            <div className="login-footer">
              <p>
                Don't have any account? 
                <Link to="/register" className="register-link">
                  Register
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login