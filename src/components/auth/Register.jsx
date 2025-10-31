import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import authService from '../../api/authService'
import logger from '../../utils/logger'
import '../../styles/Register.css'
import registerImage from '../../assets/photo-1541348263662-e068662d82af.jpeg'

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phone: '',
    gender: 'MALE' // Default to male
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
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
  }

  const validateForm = () => {
    const newErrors = {}

    // Full name validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required'
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters'
    }

    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required'
    } else if (formData.username.trim().length < 3) {
      newErrors.username = 'Username must be at least 3 characters'
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'Username can only contain letters, numbers, and underscores'
    }

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid'
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    // Phone number validation (optional)
    if (formData.phoneNumber && !/^[0-9\s\-\+\(\)]{10,15}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Please enter a valid phone number'
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
      logger.log('Registration attempt with:', {
        ...formData,
        password: '[HIDDEN]',
        confirmPassword: '[HIDDEN]'
      })
      
      // Prepare data for API
      const apiData = {
        username: formData.username,
        password: formData.password,
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone || null,
        gender: formData.gender
      }
      
      // Call register API
      const result = await authService.register(apiData)
      
      if (result.success) {
        alert('Registration successful! You can now login.')
        navigate('/login')
      } else {
        setErrors({ general: result.message || 'Registration failed. Please try again.' })
      }
      
    } catch (error) {
      logger.error('Registration error:', error)
      setErrors({ general: 'Registration failed. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="register-page">
      <div className="register-container">
        {/* Left side - Image */}
        <div className="register-image-section">
          <img src={registerImage} alt="Electric Vehicle" className="register-bg-image" />
          <div className="register-image-overlay">
            <div className="register-image-content">
              <div className="logo-section">
                <h2>ElectricCare</h2>
                <p>Electric Vehicle Maintenance System</p>
              </div>
              <h1>Care for your car, confidence for your drive</h1>
              <p>Join us and experience premium service</p>
            </div>
          </div>
        </div>

        {/* Right side - Form */}
        <div className="register-form-section">
          <div className="register-form-header">
            <Link to="/" className="back-link">
              ← Back
            </Link>
            <Link to="/login" className="sign-in-btn-header">
              Sign in
            </Link>
          </div>

          <div className="register-form-container">
            <h1>Create Your Account!</h1>
            <p className="register-subtitle">Join ElectricCare today</p>

            {errors.general && (
              <div className="error-message general-error">
                {errors.general}
              </div>
            )}

            <form onSubmit={handleSubmit} className="register-form">
              <div className="form-group">
                <label htmlFor="fullName">Full Name</label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className={errors.fullName ? 'error' : ''}
                  placeholder="Enter your full name"
                  disabled={isLoading}
                  autoComplete="name"
                />
                {errors.fullName && (
                  <span className="error-message">{errors.fullName}</span>
                )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="username">Username</label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className={errors.username ? 'error' : ''}
                    placeholder="Choose a username"
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
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={errors.email ? 'error' : ''}
                    placeholder="Enter your email"
                    disabled={isLoading}
                    autoComplete="email"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck="false"
                  />
                  {errors.email && (
                    <span className="error-message">{errors.email}</span>
                  )}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="phone">Phone Number</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={errors.phone ? 'error' : ''}
                    placeholder="Enter phone number"
                    disabled={isLoading}
                    autoComplete="tel"
                  />
                  {errors.phone && (
                    <span className="error-message">{errors.phone}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="gender">Gender</label>
                  <select
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className={errors.gender ? 'error' : ''}
                    disabled={isLoading}
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                  {errors.gender && (
                    <span className="error-message">{errors.gender}</span>
                  )}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="password">Password</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={errors.password ? 'error' : ''}
                    placeholder="Create a password"
                    disabled={isLoading}
                    autoComplete="new-password"
                  />
                  {errors.password && (
                    <span className="error-message">{errors.password}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm Password</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={errors.confirmPassword ? 'error' : ''}
                    placeholder="Confirm password"
                    disabled={isLoading}
                    autoComplete="new-password"
                  />
                  {errors.confirmPassword && (
                    <span className="error-message">{errors.confirmPassword}</span>
                  )}
                </div>
              </div>

              <button 
                type="submit" 
                className="register-btn"
                disabled={isLoading}
              >
                {isLoading ? 'Creating Account...' : 'Register'}
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

            <div className="register-footer">
              <p>
                Already have an account? 
                <Link to="/login" className="login-link">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register