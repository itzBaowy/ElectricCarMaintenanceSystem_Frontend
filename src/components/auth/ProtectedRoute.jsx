import { Navigate } from 'react-router-dom'
import { authService } from '../../api/authService'

const ProtectedRoute = ({ children, requireAuth = true }) => {
  const isAuthenticated = authService.isAuthenticated()

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
