import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './styles/App.css'
import LandingPage from './pages/LandingPage'
import Login from './components/auth/Login'
import Register from './components/auth/Register'
import AdminDashboard from './pages/admin/AdminDashboard'
import CustomerDashboard from './pages/customer/CustomerDashboard'
import Contact from './pages/customer/Contact'

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/customer" element={<CustomerDashboard />} />
          <Route path="/contact" element={<Contact />} />
          {/* TODO: Add more routes for forgot-password, etc. */}
        </Routes>
      </Router>
    </div>
  )
}

export default App
