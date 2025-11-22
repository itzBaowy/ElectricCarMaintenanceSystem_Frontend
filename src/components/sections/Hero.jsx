import { useState } from 'react'
import '../../styles/Hero.css'
import carImage from '../../assets/ba4007af-a864-474d-860a-70fd92cc726d.png'
const Hero = ({ videoUrl: propVideoUrl, poster: propPoster }) => {
  const videoUrl = propVideoUrl || import.meta.env.VITE_HERO_VIDEO || '/hero-video.mp4'
  const poster = propPoster || carImage
  const [videoError, setVideoError] = useState(false)

  const handleLearnMoreClick = () => {
    // TODO: Scroll to services section or navigate to about page
    const servicesElement = document.getElementById('services')
    if (servicesElement) {
      servicesElement.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const milestones = [12000,24000,36000,48000,60000,72000,84000,96000,108000,120000]

  return (
    <section id="home" className="hero">
      <div className="hero-container">
        <div className="hero-content centered">
          <h1 className="hero-title" onClick={handleLearnMoreClick} style={{ cursor: 'pointer' }}>
            Maintenance System
          </h1>
          <p className="hero-description light">
            Expert electric vehicle maintenance, fast diagnostics, and transparent pricing — book online for fast, reliable service from certified technicians.
          </p>
          <div className="hero-image-center">
            {!videoError ? (
              <video
                className="hero-car-video"
                autoPlay
                muted
                loop
                playsInline
                onError={(e) => {
                  console.error('Hero video failed to load:', videoUrl, e)
                  setVideoError(true)
                }}
              >
                <source src={videoUrl} type="video/mp4" />
              </video>
            ) : (
              <img src={poster} alt="Hero poster" className="hero-car-image" />
            )}
          </div>
        </div>
      </div>

      <div className="booking-card">
        <h3 className="booking-card-title">Vehicle Maintenance Milestones</h3>
        <div className="booking-row">
          <div className="milestones">
            {milestones.map((m) => (
              <div key={m} className="milestone">{m.toLocaleString()}</div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero