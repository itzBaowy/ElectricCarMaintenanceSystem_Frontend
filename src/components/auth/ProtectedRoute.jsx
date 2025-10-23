import { Navigate } from 'react-router-dom'
import { authService } from '../../api/authService'
import { useEffect, useState } from 'react'

const ProtectedRoute = ({ children, requireAuth = true }) => {
  const [isChecking, setIsChecking] = useState(true)
  const isAuthenticated = authService.isAuthenticated()

  useEffect(() => {
    // Check if token exists but is expired
    const accessToken = authService.getAccessToken()
    if (accessToken && authService.isTokenExpired()) {
      // Show alert and clear session
      alert('Session has expired. Please log in again.')
      authService.clearSession()
    }
    setIsChecking(false)
  }, [])

  if (isChecking) {
    // Show loading while checking authentication
    return <div>Checking Login Session.....</div>
  }

  if (requireAuth && !isAuthenticated) {
    // redirect to login if not authenticated
    return <Navigate to="/login" replace />
  }

  if (!requireAuth && isAuthenticated) {
    // redirect to customer if already authenticated
    return <Navigate to="/customer" replace />
  }

  return children
}

export default ProtectedRoute
