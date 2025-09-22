import './Hero.css'

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
            Hệ thống bảo dưỡng xe điện 
            <span className="highlight"> thông minh</span>
          </h1>
          <p className="hero-description">
            Quản lý và bảo dưỡng xe điện của bạn một cách hiệu quả với công nghệ tiên tiến. 
            Đặt lịch online, theo dõi tình trạng xe và nhận thông báo bảo dưỡng định kỳ.
          </p>
          <div className="hero-buttons">
            <button 
              className="btn-primary"
              onClick={handleBookingClick}
            >
              Đặt lịch ngay
            </button>
            <button 
              className="btn-secondary"
              onClick={handleLearnMoreClick}
            >
              Tìm hiểu thêm
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