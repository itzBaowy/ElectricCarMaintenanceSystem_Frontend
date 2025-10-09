import logger from '../../utils/logger'
import '../../styles/Hero.css'

const Hero = () => {
  const handleBookingClick = () => {
    // TODO: Navigate to booking page
    logger.log('Booking clicked')
  }

  const handleLearnMoreClick = () => {
    // TODO: Scroll to services section or navigate to about page
    const servicesElement = document.getElementById('services')
    if (servicesElement) {
      servicesElement.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <section id="home" className="hero">
      <div className="hero-container">
        <div className="hero-content">
          <h1 className="hero-title">
            Smart Electric Vehicle 
            <span className="highlight"> Maintenance System</span>
          </h1>
          <p className="hero-description">
            Manage and maintain your electric vehicle efficiently with advanced technology. 
            Book appointments online, track vehicle status, and receive periodic maintenance notifications.
          </p>
          <div className="hero-buttons">
            <button 
              className="btn-primary"
              onClick={handleBookingClick}
            >
              Book Now
            </button>
            <button 
              className="btn-secondary"
              onClick={handleLearnMoreClick}
            >
              Learn More
            </button>
          </div>
        </div>
        <div className="hero-image">
          <div className="hero-placeholder">
            <div className="car-icon">🚗⚡</div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero