import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import authService from '../../api/authService'
import '../../styles/ForgotPassword.css'

const ForgotPassword = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')

    if (!email.trim()) {
      setError('Please enter your email address')
      return
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address')
      return
    }

    try {
      setLoading(true)
      const result = await authService.forgotPassword(email.trim())

      if (result.success) {
        setMessage(result.message || 'Password reset link has been sent to your email.')
        setEmail('')
        setTimeout(() => {
          navigate('/login')
        }, 3000)
      } else {
        setError(result.message || 'Failed to send password reset link')
      }
    } catch (err) {
      console.error('Forgot password error:', err)
      setError('An error occurred. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-card">
        <h2>Forgot Password</h2>
        <p className="forgot-password-description">
          Enter your email address and we'll send you a link to reset your password.
        </p>

        <form onSubmit={handleSubmit} className="forgot-password-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              disabled={loading}
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}
          {message && <div className="success-message">{message}</div>}

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>

          <div className="back-to-login">
            <button type="button" onClick={() => navigate('/login')} className="back-link">
              ← Back to Login
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ForgotPassword
