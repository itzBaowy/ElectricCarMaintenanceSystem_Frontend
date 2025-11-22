import React from 'react'
import '../../styles/ImageCarousel.css'
import img1 from '../../assets/imageCarousel.png'
import img2 from '../../assets/imageCarousel2.png'
import img3 from '../../assets/istockphoto-1347150429-612x612.jpg'

const cards = [
  { title: 'OIL & FLUIDS SERVICES', img: img1 },
  { title: 'WHEEL BALANCING SERVICE', img: img2 },
  { title: 'OVERHAUL SERVICES', img: img3 }
]

const ImageCarousel = () => {
  return (
    <section className="services-collection">
      <div className="services-collection-inner">
        <div className="services-collection-header">
          <div className="meta"><span className="meta-icon" aria-hidden></span>WHAT WE OFFER</div>
          <h3 className="collection-title">EXPLORE OUR SERVICES</h3>
        </div>

        <div className="services-cards">
          {cards.map((c, i) => (
            <div className="service-card" key={i}>
              <div className="service-card-image">
                <img src={c.img} alt={c.title} />
              </div>
              <div className="service-card-caption">{c.title}</div>
            </div>
          ))}
        </div>

        <div className="services-actions">
          <button className="btn-outline">LOGIN FOR MORE SERVICE</button>
        </div>
      </div>
    </section>
  )
}

export default ImageCarousel
