import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import authService from '../../api/authService'
import '../../styles/ResetPassword.css'

const ResetPassword = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [token, setToken] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    // Get token from URL params
    const tokenParam = searchParams.get('token')
    if (tokenParam) {
      setToken(tokenParam)
    } else {
      setError('Invalid or missing reset token')
    }
  }, [searchParams])

  const validatePassword = (password) => {
    if (password.length < 8) {
      return 'Password must be at least 8 characters long'
    }
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')

    // Validation
    if (!token) {
      setError('Invalid or missing reset token')
      return
    }

    if (!newPassword.trim() || !confirmPassword.trim()) {
      setError('Please fill in all fields')
      return
    }

    const passwordError = validatePassword(newPassword)
    if (passwordError) {
      setError(passwordError)
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    try {
      setLoading(true)
      const result = await authService.resetPassword({
        token,
        newPassword: newPassword.trim(),
        confirmPassword: confirmPassword.trim()
      })

      if (result.success) {
        setMessage(result.message || 'Password reset successfully! Redirecting to login...')
        setNewPassword('')
        setConfirmPassword('')
        setTimeout(() => {
          navigate('/login')
        }, 3000)
      } else {
        setError(result.message || 'Failed to reset password')
      }
    } catch (err) {
      console.error('Reset password error:', err)
      setError('An error occurred. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="reset-password-container">
      <div className="reset-password-card">
        <h2>Reset Password</h2>
        <p className="reset-password-description">
          Enter your new password below to reset your account password.
        </p>

        <form onSubmit={handleSubmit} className="reset-password-form">
          <div className="form-group">
            <label htmlFor="newPassword">New Password</label>
            <input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              disabled={loading || !token}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              disabled={loading || !token}
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}
          {message && <div className="success-message">{message}</div>}

          <button type="submit" className="submit-btn" disabled={loading || !token}>
            {loading ? 'Resetting...' : 'Reset Password'}
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

export default ResetPassword
