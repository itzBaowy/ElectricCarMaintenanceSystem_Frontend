import { Navigate } from 'react-router-dom'
import { authService } from '../../api/authService'

// Component để bảo vệ các route yêu cầu đăng nhập
const ProtectedRoute = ({ children, requireAuth = true }) => {
  const isAuthenticated = authService.isAuthenticated()

  if (requireAuth && !isAuthenticated) {
    // Yêu cầu đăng nhập nhưng chưa đăng nhập -> redirect to login
    return <Navigate to="/login" replace />
  }

  if (!requireAuth && isAuthenticated) {
    // Không yêu cầu đăng nhập (như trang home) nhưng đã đăng nhập -> redirect to customer
    return <Navigate to="/customer" replace />
  }

  return children
}

export default ProtectedRoute
