import './Features.css'

const Features = () => {
  const features = [
    {
      icon: "📅",
      title: "Online Booking",
      description: "Easily book maintenance appointments through our website or mobile app, saving you time."
    },
    {
      icon: "📊",
      title: "Progress Tracking",
      description: "Track real-time progress of your vehicle maintenance through our intelligent system."
    },
    {
      icon: "🔔",
      title: "Automatic Notifications",
      description: "Receive automatic notifications when it's time for periodic maintenance."
    },
    {
      icon: "📋",
      title: "Maintenance History",
      description: "Complete maintenance history storage to help you manage your vehicle efficiently."
    },
    {
      icon: "💰",
      title: "Transparent Pricing",
      description: "Detailed and transparent pricing before performing any service."
    },
    {
      icon: "🎯",
      title: "Professional Consultation",
      description: "Experienced technician team providing consultation and 24/7 support."
    }
  ]

  const handleFeatureClick = (featureName) => {
    // TODO: Show feature details or navigate to relevant page
    console.log(`${featureName} feature clicked`)
  }

  return (
    <section id="features" className="features">
      <div className="container">
        <h2 className="section-title">Outstanding Features</h2>
        <p className="section-subtitle">
          Experience modern service with intelligent features
        </p>
        
        <div className="features-grid">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="feature-item"
              onClick={() => handleFeatureClick(feature.title)}
            >
              <div className="feature-icon">{feature.icon}</div>
              <div className="feature-content">
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Features