import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './styles/App.css'
import LandingPage from './pages/LandingPage'
import Login from './components/auth/Login'
import Register from './components/auth/Register'

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          {/* TODO: Add more routes for forgot-password, etc. */}
        </Routes>
      </Router>
    </div>
  )
}

export default App
