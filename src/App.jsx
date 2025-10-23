import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './styles/App.css'
import LandingPage from './pages/LandingPage'
import Login from './components/auth/Login'
import Register from './components/auth/Register'
import ProtectedRoute from './components/auth/ProtectedRoute'
import AdminDashboard from './pages/admin/AdminDashboard'
import CustomerDashboard from './pages/customer/CustomerDashboard'
import Contact from './pages/customer/Contact'

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route 
            path="/" 
            element={
              <ProtectedRoute requireAuth={false}>
                <LandingPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/login" 
            element={
              <ProtectedRoute requireAuth={false}>
                <Login />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/register" 
            element={
              <ProtectedRoute requireAuth={false}>
                <Register />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute requireAuth={true}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/customer" 
            element={
              <ProtectedRoute requireAuth={true}>
                <CustomerDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/contact" 
            element={
              <ProtectedRoute requireAuth={true}>
                <Contact />
              </ProtectedRoute>
            } 
          />
          
          {/* TODO: Add more routes for forgot-password, etc. */}
        </Routes>
      </Router>
    </div>
  )
}

export default App
