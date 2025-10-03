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
            <h1>Liên Hệ Với Chúng Tôi</h1>
            <p>Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn</p>
          </div>
        </section>

        {/* Company Information Section */}
        <section className="company-info-section">
          <div className="container">
            <div className="section-header">
              <h2>Thông Tin Doanh Nghiệp</h2>
              <div className="section-divider"></div>
            </div>
            
            <div className="company-info-grid">
              <div className="company-info-card">
                <div className="info-icon">
                  <i className="fas fa-building"></i>
                </div>
                <h3>Công Ty TNHH ElectricCare</h3>
                <p>Hệ thống bảo dưỡng xe điện hàng đầu Việt Nam</p>
              </div>

              <div className="company-info-card">
                <div className="info-icon">
                  <i className="fas fa-map-marker-alt"></i>
                </div>
                <h3>Địa Chỉ</h3>
                <p>123 Đường Lê Lợi, Quận 1<br/>Thành phố Hồ Chí Minh, Việt Nam</p>
              </div>

              <div className="company-info-card">
                <div className="info-icon">
                  <i className="fas fa-phone"></i>
                </div>
                <h3>Điện Thoại</h3>
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
                <h3>Giờ Làm Việc</h3>
                <p>Thứ 2 - Thứ 6: 8:00 - 18:00<br/>Thứ 7: 8:00 - 12:00<br/>Chủ Nhật: Nghỉ</p>
              </div>

              <div className="company-info-card">
                <div className="info-icon">
                  <i className="fas fa-globe"></i>
                </div>
                <h3>Website & Mạng Xã Hội</h3>
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
                <h4>Mã Số Thuế</h4>
                <p>0123456789</p>
              </div>
              <div className="info-box">
                <h4>Giấy Phép Kinh Doanh</h4>
                <p>Số: 0123456789 do Sở KH&ĐT TP.HCM cấp ngày 01/01/2020</p>
              </div>
              <div className="info-box">
                <h4>Người Đại Diện</h4>
                <p>Nguyễn Văn A - Giám Đốc</p>
              </div>
            </div>
          </div>
        </section>

        {/* Feedback Form Section */}
        <section className="feedback-section">
          <div className="container">
            <div className="section-header">
              <h2>Gửi Phản Hồi</h2>
              <p>Vui lòng để lại thông tin, chúng tôi sẽ liên hệ với bạn sớm nhất</p>
              <div className="section-divider"></div>
            </div>

            <div className="feedback-form-container">
              <form className="feedback-form" onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="name">
                      <i className="fas fa-user"></i> Họ và Tên *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={feedback.name}
                      onChange={handleInputChange}
                      placeholder="Nhập họ và tên của bạn"
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
                    <i className="fas fa-tag"></i> Chủ Đề *
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={feedback.subject}
                    onChange={handleInputChange}
                    placeholder="Tiêu đề phản hồi của bạn"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="message">
                    <i className="fas fa-comment"></i> Nội Dung *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={feedback.message}
                    onChange={handleInputChange}
                    placeholder="Nhập nội dung phản hồi của bạn..."
                    rows="6"
                    required
                  ></textarea>
                </div>

                <button type="submit" className="submit-btn">
                  <i className="fas fa-paper-plane"></i> Gửi Phản Hồi
                </button>

                {submitStatus === 'success' && (
                  <div className="alert alert-success">
                    <i className="fas fa-check-circle"></i> Cảm ơn bạn! Phản hồi của bạn đã được gửi thành công.
                  </div>
                )}

                {submitStatus === 'error' && (
                  <div className="alert alert-error">
                    <i className="fas fa-exclamation-circle"></i> Có lỗi xảy ra. Vui lòng thử lại sau.
                  </div>
                )}
              </form>

              <div className="feedback-sidebar">
                <div className="sidebar-card">
                  <h3><i className="fas fa-question-circle"></i> Câu Hỏi Thường Gặp</h3>
                  <ul>
                    <li><a href="#faq">Làm thế nào để đặt lịch bảo dưỡng?</a></li>
                    <li><a href="#faq">Chi phí bảo dưỡng xe điện là bao nhiêu?</a></li>
                    <li><a href="#faq">Thời gian bảo dưỡng mất bao lâu?</a></li>
                    <li><a href="#faq">Có dịch vụ cứu hộ không?</a></li>
                  </ul>
                </div>

                <div className="sidebar-card">
                  <h3><i className="fas fa-headset"></i> Hỗ Trợ Khẩn Cấp</h3>
                  <p>Nếu bạn cần hỗ trợ gấp, vui lòng liên hệ:</p>
                  <div className="emergency-contact">
                    <div className="emergency-item">
                      <i className="fas fa-phone-volume"></i>
                      <strong>Hotline 24/7:</strong>
                      <span>1900-xxxx</span>
                    </div>
                    <div className="emergency-item">
                      <i className="fas fa-comments"></i>
                      <strong>Live Chat:</strong>
                      <button className="chat-btn">Bắt đầu chat</button>
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
              <h2>Vị Trí Của Chúng Tôi</h2>
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