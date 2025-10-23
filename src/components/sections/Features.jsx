import '../../styles/Features.css'

const Features = () => {
  const pricingTiers = [
    {
      name: "Basic",
      price: "20.00$",
      description: "Keep your car in top shape with our reliable maintenance packages.",
      icon: "🔧"
    },
    {
      name: "Medium",
      price: "20.00$",
      description: "Keep your car in top shape with our reliable maintenance packages.",
      icon: "⚙️"
    },
    {
      name: "High",
      price: "20.00$",
      description: "Keep your car in top shape with our reliable maintenance packages.",
      icon: "🔩"
    }
  ]

  const handleMoreInfo = (tierName) => {
    console.log(`${tierName} tier More Info clicked`)
  }

  return (
    <section id="features" className="features">
      <div className="container">
        <h2 className="section-title">Service</h2>
        <div className="section-underline"></div>
        
        <div className="car-display">
          <div className="car-placeholder">
            <i className="fas fa-car"></i>
          </div>
        </div>

        <div className="features-grid">
          {pricingTiers.map((tier, index) => (
            <div 
              key={index} 
              className="feature-item"
            >
              <div className="feature-content">
                <h3>{tier.name}</h3>
                <p>{tier.description}</p>
                <div className="feature-price">{tier.price}</div>
                <button 
                  className="feature-btn"
                  onClick={() => handleMoreInfo(tier.name)}
                >
                  More info
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Features