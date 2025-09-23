import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Header.css'

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const navigate = useNavigate()

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const handleNavClick = (sectionId) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
    setIsMenuOpen(false) // Close mobile menu after clicking
  }

  const handleAuthClick = (action) => {
    if (action === 'login') {
      navigate('/login')
    } else if (action === 'register') {
      // TODO: Navigate to register page when created
      alert('Register functionality will be available soon!')
    }
    setIsMenuOpen(false) // Close mobile menu after clicking
  }

  return (
    <header className="header">
      <nav className="navbar">
        <div className="nav-container">
          <div className="nav-logo">
            <h2>ElectricCare</h2>
            <span className="logo-subtitle">Electric Vehicle Maintenance System</span>
          </div>
          
          <div className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
            <a 
              href="#home" 
              className="nav-link" 
              onClick={(e) => {
                e.preventDefault()
                handleNavClick('home')
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
              className="nav-link"
              onClick={(e) => {
                e.preventDefault()
                handleNavClick('contact')
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