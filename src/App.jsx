import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './styles/App.css'
import LandingPage from './pages/LandingPage'
import Login from './components/auth/Login'

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          {/* TODO: Add more routes for register, forgot-password, etc. */}
        </Routes>
      </Router>
    </div>
  )
}

export default App
