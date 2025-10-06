import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import '../../styles/Header.css'

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const handleNavClick = (sectionId) => {
    // If we're not on the home page, navigate to home first
    if (location.pathname !== '/') {
      navigate('/', { replace: true })
      // Wait for navigation and then scroll
      setTimeout(() => {
        const element = document.getElementById(sectionId)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' })
        }
      }, 100)
    } else {
      // If we're on home page, just scroll
      const element = document.getElementById(sectionId)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      }
    }
    setIsMenuOpen(false) // Close mobile menu after clicking
  }

  const handleAuthClick = (action) => {
    if (action === 'login') {
      navigate('/login')
    } else if (action === 'register') {
      // TODO: Navigate to register page when created
      navigate('/register')
    }
    setIsMenuOpen(false) // Close mobile menu after clicking
  }

  return (
    <header className="header">
      <nav className="navbar">
        <div className="nav-container">
          <div className="nav-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
            <h2>ElectricCare</h2>
            <span className="logo-subtitle">Electric Vehicle Maintenance System</span>
          </div>
          
          <div className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
            <a 
              href="#home" 
              className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
              onClick={(e) => {
                e.preventDefault()
                if (location.pathname === '/') {
                  handleNavClick('home')
                } else {
                  navigate('/')
                }
              }}
            >
              Home
            </a>
            <a 
              href="#services" 
              className="nav-link"
              onClick={(e) => {
                e.preventDefault()
                handleNavClick('services')
              }}
            >
              Services
            </a>
            <a 
              href="#features" 
              className="nav-link"
              onClick={(e) => {
                e.preventDefault()
                handleNavClick('features')
              }}
            >
              Features
            </a>
            <a 
              href="#about" 
              className="nav-link"
              onClick={(e) => {
                e.preventDefault()
                handleNavClick('about')
              }}
            >
              About Us
            </a>
            <a 
              href="#contact" 
              className={`nav-link ${location.pathname === '/contact' ? 'active' : ''}`}
              onClick={(e) => {
                e.preventDefault()
                navigate('/contact')
                setIsMenuOpen(false)
              }}
            >
              Contact
            </a>
            {/* Mobile Auth Buttons */}
            <div className="mobile-auth-buttons">
              <button 
                className="mobile-btn-login"
                onClick={() => handleAuthClick('login')}
              >
                Login
              </button>
              <button 
                className="mobile-btn-register"
                onClick={() => handleAuthClick('register')}
              >
                Register
              </button>
            </div>
          </div>

          <div className="nav-buttons">
            <button 
              className="btn-login"
              onClick={() => handleAuthClick('login')}
            >
              Login
            </button>
            <button 
              className="btn-register"
              onClick={() => handleAuthClick('register')}
            >
              Register
            </button>
          </div>

          <div className="hamburger" onClick={toggleMenu}>
            <span className="bar"></span>
            <span className="bar"></span>
            <span className="bar"></span>
          </div>
        </div>
      </nav>
    </header>
  )
}

export default Header