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
      <div className="footer-bottom">
        <div className="container">
          <p>&copy; {currentYear} ElectricCare. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer