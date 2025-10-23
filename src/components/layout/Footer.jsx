import logger from '../../utils/logger'
import '../../styles/Footer.css'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  const handleSocialClick = (platform) => {
    // TODO: Navigate to social media links
    logger.log(`${platform} social link clicked`)
  }

  const handleLinkClick = (link) => {
    // TODO: Navigate to internal pages or sections
    logger.log(`${link} link clicked`)
  }

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>ElectricCare</h3>
            <p>
              Vietnam's leading electric vehicle maintenance system with advanced technology 
              and professional services.
            </p>
            <div className="social-links">
              <a 
                href="#" 
                className="social-link"
                onClick={(e) => {
                  e.preventDefault()
                  handleSocialClick('Facebook')
                }}
              >
                📘
              </a>
              <a 
                href="#" 
                className="social-link"
                onClick={(e) => {
                  e.preventDefault()
                  handleSocialClick('Instagram')
                }}
              >
                📷
              </a>
              <a 
                href="#" 
                className="social-link"
                onClick={(e) => {
                  e.preventDefault()
                  handleSocialClick('Twitter')
                }}
              >
                🐦
              </a>
              <a 
                href="#" 
                className="social-link"
                onClick={(e) => {
                  e.preventDefault()
                  handleSocialClick('Phone')
                }}
              >
                📞
              </a>
            </div>
          </div>
          
          <div className="footer-section">
            <h4>Services</h4>
            <ul>
              <li>
                <a 
                  href="#services"
                  onClick={() => handleLinkClick('Battery Inspection')}
                >
                  Battery Inspection
                </a>
              </li>
              <li>
                <a 
                  href="#services"
                  onClick={() => handleLinkClick('Motor Maintenance')}
                >
                  Motor Maintenance
                </a>
              </li>
              <li>
                <a 
                  href="#services"
                  onClick={() => handleLinkClick('Charging System')}
                >
                  Charging System
                </a>
              </li>
              <li>
                <a 
                  href="#services"
                  onClick={() => handleLinkClick('Diagnostic Services')}
                >
                  Diagnostic Services
                </a>
              </li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4>About Us</h4>
            <ul>
              <li>
                <a 
                  href="#about"
                  onClick={() => handleLinkClick('About')}
                >
                  About
                </a>
              </li>
              <li>
                <a 
                  href="#features"
                  onClick={() => handleLinkClick('Features')}
                >
                  Features
                </a>
              </li>
              <li>
                <a 
                  href="#contact"
                  onClick={() => handleLinkClick('Contact')}
                >
                  Contact
                </a>
              </li>
              <li>
                <a 
                  href="#"
                  onClick={() => handleLinkClick('Privacy Policy')}
                >
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4>Contact</h4>
            <div className="contact-info">
              <p>📍 123 ABC Street, XYZ District, Ho Chi Minh City</p>
              <p>📞 Hotline: 1900-XXX-XXX</p>
              <p>✉️ Email: info@electriccare.vn</p>
              <p>🕒 Working Hours: 8:00 - 18:00 (Mon-Sat)</p>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; {currentYear} ElectricCare. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer