import { useNavigate } from 'react-router-dom'
import Header from '../../components/layout/Header'
import Footer from '../../components/layout/Footer'
import '../../styles/Contact.css'

const Contact = () => {
  const navigate = useNavigate()

  return (
    <div className="contact-page">
      <Header />
      
      <main className="contact-main">
        {/* Hero Section */}
        <section className="contact-hero">
          <div className="contact-hero-content">
            <h1>Contact Us</h1>
            <p>We are always ready to listen and support you</p>
          </div>
        </section>

        {/* Company Information Section */}
        <section className="company-info-section">
          <div className="container">
            <div className="section-header">
              <h2>Company Information</h2>
              <div className="section-divider"></div>
            </div>
            
            <div className="company-info-grid">
              <div className="company-info-card">
                <div className="info-icon">
                  <i className="fas fa-building"></i>
                </div>
                <h3>ElectricCare Co., Ltd.</h3>
                <p>Vietnam's leading electric vehicle maintenance system</p>
              </div>

              <div className="company-info-card">
                <div className="info-icon">
                  <i className="fas fa-map-marker-alt"></i>
                </div>
                <h3>Address</h3>
                <p>123 Le Loi Street, District 1<br/>Ho Chi Minh City, Vietnam</p>
              </div>

              <div className="company-info-card">
                <div className="info-icon">
                  <i className="fas fa-phone"></i>
                </div>
                <h3>Phone</h3>
                <p>Hotline: 1900-xxxx<br/>Tel: (028) 1234-5678</p>
              </div>

              <div className="company-info-card">
                <div className="info-icon">
                  <i className="fas fa-envelope"></i>
                </div>
                <h3>Email</h3>
                <p>info@electriccare.vn<br/>support@electriccare.vn</p>
              </div>

              <div className="company-info-card">
                <div className="info-icon">
                  <i className="fas fa-clock"></i>
                </div>
                <h3>Working Hours</h3>
                <p>Monday - Friday: 8:00 AM - 6:00 PM<br/>Saturday: 8:00 AM - 12:00 PM<br/>Sunday: Closed</p>
              </div>

              <div className="company-info-card">
                <div className="info-icon">
                  <i className="fas fa-globe"></i>
                </div>
                <h3>Website & Social Media</h3>
                <p>www.electriccare.vn</p>
                <div className="social-links">
                  <a href="#facebook" aria-label="Facebook"><i className="fab fa-facebook"></i></a>
                  <a href="#instagram" aria-label="Instagram"><i className="fab fa-instagram"></i></a>
                  <a href="#linkedin" aria-label="LinkedIn"><i className="fab fa-linkedin"></i></a>
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="additional-info">
              <div className="info-box">
                <h4>Tax Code</h4>
                <p>0123456789</p>
              </div>
              <div className="info-box">
                <h4>Business License</h4>
                <p>No: 0123456789 issued by HCMC Department of Planning and Investment on 01/01/2020</p>
              </div>
              <div className="info-box">
                <h4>Legal Representative</h4>
                <p>Nguyen Van A - Director</p>
              </div>
            </div>
          </div>
        </section>

        {/* Map Section (Optional) */}
        <section className="map-section">
          <div className="container">
            <div className="section-header">
              <h2>Our Location</h2>
              <div className="section-divider"></div>
            </div>
            <div className="map-container">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.6306489493305!2d106.69252991533415!3d10.762622192330832!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f1c06f4e1dd%3A0x43900f1d4539a3d!2zVHLGsOG7nW5nIMSQ4bqhaSBo4buNYyBLaG9hIGjhu41jIFThu7Egbmhpw6puIC0gxJDhuqFpIGjhu41jIFF14buRYyBnaWEgVFAuSENN!5e0!3m2!1svi!2s!4v1633024800000!5m2!1svi!2s"
                width="100%"
                height="450"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                title="Company Location"
              ></iframe>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

export default Contact