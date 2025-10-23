import { Navigate } from 'react-router-dom'
import { authService } from '../../api/authService'
import { useEffect, useState } from 'react'

const ProtectedRoute = ({ children, requireAuth = true, allowedRoles = [] }) => {
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
    // Get user info to redirect to correct dashboard
    const currentUser = authService.getCurrentUser()
    if (currentUser && currentUser.role) {
      const roleMap = {
        'ADMIN': '/admin',
        'CUSTOMER': '/customer',
        'STAFF': '/staff',
        'TECHNICIAN': '/technician'
      }
      return <Navigate to={roleMap[currentUser.role] || '/customer'} replace />
    }
    return <Navigate to="/customer" replace />
  }

  // Check role-based access if allowedRoles is specified
  if (requireAuth && allowedRoles.length > 0) {
    const currentUser = authService.getCurrentUser()
    
    if (!currentUser || !currentUser.role) {
      // If we can't get user role, clear session and redirect to login
      authService.clearSession()
      return <Navigate to="/login" replace />
    }

    // Check if user's role is in the allowed roles list
    if (!allowedRoles.includes(currentUser.role)) {
      // Redirect to appropriate dashboard based on user's role
      const roleMap = {
        'ADMIN': '/admin',
        'CUSTOMER': '/customer',
        'STAFF': '/staff',
        'TECHNICIAN': '/technician'
      }
      
      alert(`Access denied. You don't have permission to access this page.`)
      return <Navigate to={roleMap[currentUser.role] || '/customer'} replace />
    }
  }

  return children
}

export default ProtectedRoute
