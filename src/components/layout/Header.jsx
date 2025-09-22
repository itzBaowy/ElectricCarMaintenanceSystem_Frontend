import { useState } from 'react'
import './Header.css'

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

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
    // TODO: Implement authentication logic
    console.log(`${action} clicked`)
  }

  return (
    <header className="header">
      <nav className="navbar">
        <div className="nav-container">
          <div className="nav-logo">
            <h2>ElectricCare</h2>
            <span className="logo-subtitle">Hệ thống bảo dưỡng xe điện</span>
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
              Trang chủ
            </a>
            <a 
              href="#services" 
              className="nav-link"
              onClick={(e) => {
                e.preventDefault()
                handleNavClick('services')
              }}
            >
              Dịch vụ
            </a>
            <a 
              href="#features" 
              className="nav-link"
              onClick={(e) => {
                e.preventDefault()
                handleNavClick('features')
              }}
            >
              Tính năng
            </a>
            <a 
              href="#about" 
              className="nav-link"
              onClick={(e) => {
                e.preventDefault()
                handleNavClick('about')
              }}
            >
              Về chúng tôi
            </a>
            <a 
              href="#contact" 
              className="nav-link"
              onClick={(e) => {
                e.preventDefault()
                handleNavClick('contact')
              }}
            >
              Liên hệ
            </a>
          </div>

          <div className="nav-buttons">
            <button 
              className="btn-login"
              onClick={() => handleAuthClick('login')}
            >
              Đăng nhập
            </button>
            <button 
              className="btn-register"
              onClick={() => handleAuthClick('register')}
            >
              Đăng ký
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