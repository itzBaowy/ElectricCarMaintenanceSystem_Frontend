import './Services.css'

const Services = () => {
  const services = [
    {
      icon: "🔋",
      title: "Battery Inspection",
      description: "Comprehensive battery system inspection and maintenance to ensure optimal performance and longevity."
    },
    {
      icon: "⚙️",
      title: "Electric Motor Maintenance",
      description: "Professional electric motor inspection and maintenance for smooth operation and energy efficiency."
    },
    {
      icon: "🔌",
      title: "Charging System",
      description: "Charging system inspection and repair to ensure safe and efficient charging capabilities."
    },
    {
      icon: "🛠️",
      title: "General Maintenance",
      description: "Comprehensive periodic inspection of all electric vehicle systems and components."
    },
    {
      icon: "🔍",
      title: "Diagnostic Services",
      description: "Advanced diagnostic services using modern equipment to identify and resolve system issues."
    },
    {
      icon: "📱",
      title: "Software Updates",
      description: "Software and firmware updates for all electronic systems in your electric vehicle."
    }
  ]

  const handleServiceClick = (serviceName) => {
    // TODO: Navigate to service details or booking page
    console.log(`${serviceName} service selected`)
  }

  return (
    <section id="services" className="services">
      <div className="container">
        <h2 className="section-title">Maintenance Services</h2>
        <p className="section-subtitle">
          We provide comprehensive professional electric vehicle maintenance services
        </p>
        
        <div className="services-grid">
          {services.map((service, index) => (
            <div 
              key={index} 
              className="service-card"
              onClick={() => handleServiceClick(service.title)}
            >
              <div className="service-icon">{service.icon}</div>
              <h3>{service.title}</h3>
              <p>{service.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Services