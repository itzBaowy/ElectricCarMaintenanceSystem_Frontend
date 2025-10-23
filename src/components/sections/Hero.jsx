import '../../styles/Hero.css'
import carImage from '../../assets/ba4007af-a864-474d-860a-70fd92cc726d.png'
import image1 from '../../assets/download (1).jpeg'
import image2 from '../../assets/download.jpeg'
import image3 from '../../assets/images.jpeg'
import image4 from '../../assets/istockphoto-1347150429-612x612.jpg'

const Hero = () => {
  const handleBookingClick = () => {
    // TODO: Navigate to booking page
    console.log('Booking clicked')
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
          <div className="hero-image-wrapper">
            <div className="hero-car-container">
              <div className="hero-car-background"></div>
              <img src={carImage} alt="Electric Vehicle" className="hero-car-image" />
            </div>
            <div className="hero-image-grid">
              <div className="hero-image-box">
                <img src={image1} alt="Service 1" />
              </div>
              <div className="hero-image-box">
                <img src={image2} alt="Service 2" />
              </div>
              <div className="hero-image-box">
                <img src={image3} alt="Service 3" />
              </div>
              <div className="hero-image-box">
                <img src={image4} alt="Service 4" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero