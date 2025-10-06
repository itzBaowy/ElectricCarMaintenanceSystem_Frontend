import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../../components/layout/Header'
import Footer from '../../components/layout/Footer'
import '../../styles/Contact.css'

const Contact = () => {
  const navigate = useNavigate()
  const [feedback, setFeedback] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [submitStatus, setSubmitStatus] = useState(null)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFeedback(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Mock submission - in real app, this would call an API
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      console.log('Feedback submitted:', feedback)
      setSubmitStatus('success')
      
      // Reset form
      setFeedback({
        name: '',
        email: '',
        subject: '',
        message: ''
      })
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setSubmitStatus(null)
      }, 5000)
    } catch (error) {
      console.error('Error submitting feedback:', error)
      setSubmitStatus('error')
    }
  }

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
                <p>
                  www.electriccare.vn<br/>
                  <div className="social-links">
                    <a href="#facebook" aria-label="Facebook"><i className="fab fa-facebook"></i></a>
                    <a href="#instagram" aria-label="Instagram"><i className="fab fa-instagram"></i></a>
                    <a href="#linkedin" aria-label="LinkedIn"><i className="fab fa-linkedin"></i></a>
                  </div>
                </p>
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

        {/* Feedback Form Section */}
        <section className="feedback-section">
          <div className="container">
            <div className="section-header">
              <h2>Send Feedback</h2>
              <p>Please leave your information, we will contact you as soon as possible</p>
              <div className="section-divider"></div>
            </div>

            <div className="feedback-form-container">
              <form className="feedback-form" onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="name">
                      <i className="fas fa-user"></i> Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={feedback.name}
                      onChange={handleInputChange}
                      placeholder="Enter your full name"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="email">
                      <i className="fas fa-envelope"></i> Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={feedback.email}
                      onChange={handleInputChange}
                      placeholder="example@email.com"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="subject">
                    <i className="fas fa-tag"></i> Subject *
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={feedback.subject}
                    onChange={handleInputChange}
                    placeholder="Your feedback title"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="message">
                    <i className="fas fa-comment"></i> Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={feedback.message}
                    onChange={handleInputChange}
                    placeholder="Enter your feedback message..."
                    rows="6"
                    required
                  ></textarea>
                </div>

                <button type="submit" className="submit-btn">
                  <i className="fas fa-paper-plane"></i> Send Feedback
                </button>

                {submitStatus === 'success' && (
                  <div className="alert alert-success">
                    <i className="fas fa-check-circle"></i> Thank you! Your feedback has been sent successfully.
                  </div>
                )}

                {submitStatus === 'error' && (
                  <div className="alert alert-error">
                    <i className="fas fa-exclamation-circle"></i> An error occurred. Please try again later.
                  </div>
                )}
              </form>

              <div className="feedback-sidebar">
                <div className="sidebar-card">
                  <h3><i className="fas fa-question-circle"></i> Frequently Asked Questions</h3>
                  <ul>
                    <li><a href="#faq">How to schedule maintenance?</a></li>
                    <li><a href="#faq">What is the cost of electric vehicle maintenance?</a></li>
                    <li><a href="#faq">How long does maintenance take?</a></li>
                    <li><a href="#faq">Do you have roadside assistance service?</a></li>
                  </ul>
                </div>

                <div className="sidebar-card">
                  <h3><i className="fas fa-headset"></i> Emergency Support</h3>
                  <p>If you need urgent assistance, please contact:</p>
                  <div className="emergency-contact">
                    <div className="emergency-item">
                      <i className="fas fa-phone-volume"></i>
                      <strong>24/7 Hotline:</strong>
                      <span>1900-xxxx</span>
                    </div>
                    <div className="emergency-item">
                      <i className="fas fa-comments"></i>
                      <strong>Live Chat:</strong>
                      <button className="chat-btn">Start Chat</button>
                    </div>
                  </div>
                </div>
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