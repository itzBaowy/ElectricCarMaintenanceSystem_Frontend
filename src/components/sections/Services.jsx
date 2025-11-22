import React from 'react'
import '../../styles/Services.css'
import mainImage from '../../assets/serviceImg.png'
import smallImage from '../../assets/serviceImg2.png'

const Services = () => {
	return (
		<section id="services" className="services-section">
			<div className="services-container">
				<div className="services-left">
					<img src={mainImage} alt="Service Main" className="services-main-image" />
				</div>
				<div className="services-right">
					<div className="services-text">
						<div className="services-meta"><span className="meta-icon" aria-hidden></span>WHO WE ARE</div>
						<h2 className="services-title">CAR SERVICE REPAIRS AND MAINTENANCE CERTIFIED</h2>
						<p className="services-desc">
							We are a dedicated team of certified technicians and automotive professionals specializing in electric vehicle
							maintenance and repair. Combining advanced diagnostic tools with transparent service processes, we deliver
							reliable, efficient care that keeps your EV safe and performing at its best — on schedule and within budget.
						</p>
					</div>

					<div className="services-small-wrap">
						<img src={smallImage} alt="Service Small" className="services-small-image" />
					</div>
				</div>
			</div>
		</section>
	)
}

export default Services
