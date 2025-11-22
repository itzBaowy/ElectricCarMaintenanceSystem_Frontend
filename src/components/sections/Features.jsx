import React from 'react'
import '../../styles/Features.css'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import MailOutlineIcon from '@mui/icons-material/MailOutline'
import PhoneIcon from '@mui/icons-material/Phone'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { useState } from 'react'

const Features = () => {
  const [openIndices, setOpenIndices] = useState([])
    return (
      <>
      <section className="features-section">
      <div className="features-container">
        <div className="features-left">
          <div className="features-left-inner">
            <div className="features-meta"><span className="meta-icon" aria-hidden></span>MAKE APPOINTMENT</div>
            <h2 className="features-title">TRUST OUR SERVICE TO GET YOU BACK ON THE ROAD!</h2>
            <p className="features-desc">
              We provide fast, reliable electric vehicle maintenance with certified technicians, advanced diagnostics,
              and transparent pricing. Book an appointment or contact us for bespoke service tailored to your EV.
            </p>

            <ul className="contact-list">
              <li>
                <LocationOnIcon className="contact-icon" />
                <div>
                  <div className="contact-label">LOCATION</div>
                  <div className="contact-value">Lot E2a-7, D1 Street, Saigon Hi-Tech Park, Long Thanh My Ward, Thu Duc City, Ho Chi Minh City, Vietnam</div>
                </div>
              </li>
              <li>
                <MailOutlineIcon className="contact-icon" />
                <div>
                  <div className="contact-label">EMAIL</div>
                  <div className="contact-value">electriccare@example.com</div>
                </div>
              </li>
              <li>
                <PhoneIcon className="contact-icon" />
                <div>
                  <div className="contact-label">PHONE</div>
                  <div className="contact-value">62 123 4567 890</div>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="features-right">
          <div
            className="contact-card"
            style={{ backgroundImage: `url(https://i.pinimg.com/736x/86/fa/7a/86fa7af7ddd428ae1c2f1e813114dce0.jpg)` }}
            role="img"
            aria-label="How can we help"
          />
        </div>
      </div>
    </section>
      {/* FAQ Section */}
      <section className="faq-section">
        <div className="faq-inner">
          <div className="faq-header">
            <div className="meta"><span className="meta-icon" aria-hidden></span>FAQS</div>
            <h3 className="faq-title">FREQUENTLY ASKED QUESTIONS</h3>
          </div>

          <div className="faq-grid">
            {[
              { q: 'HOW OFTEN SHOULD I GET AN OIL CHANGE?', a: 'We recommend checking your manufacturer guidelines; typically every 5,000–10,000 km depending on oil type and driving conditions.' },
              { q: 'WHEN SHOULD I CHECK FLUID LEVELS', a: 'Check fluid levels every month or before long trips. Top up or service as needed.' },
              { q: 'WHEN SHOULD I CHANGE THE OIL', a: 'Change oil at manufacturer-recommended intervals or when analysis shows degradation.' },
              { q: 'WHEN SHOULD I REPLACE MY BRAKE PADS?', a: 'Brake pads typically need replacement every 30,000–70,000 km depending on driving habits and pad compound.' },
              { q: 'WHEN SHOULD I REPLACE BATTERY?', a: 'EV batteries vary; consult your manufacturer. Many batteries are warrantied for 8 years or more.' },
              { q: 'WHEN SHOULD I GET A TIRE ROTATION?', a: 'Rotate tires every 8,000–12,000 km to ensure even wear and extend tire life.' }
            ].map((item, i) => (
              <div
                key={i}
                className={`faq-card ${openIndices.includes(i) ? 'open' : ''}`}
                onClick={() => {
                  const exists = openIndices.includes(i)
                  setOpenIndices(exists ? openIndices.filter(x => x !== i) : [...openIndices, i])
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') {
                  const exists = openIndices.includes(i)
                  setOpenIndices(exists ? openIndices.filter(x => x !== i) : [...openIndices, i])
                } }}
              >
                <div className="faq-question">
                  <div className="faq-q-text">{item.q}</div>
                  <div className="faq-toggle"><ExpandMoreIcon className={`expand-icon ${openIndices.includes(i) ? 'rotated' : ''}`} /></div>
                </div>

                <div className="faq-answer" aria-hidden={!openIndices.includes(i)}>
                  <p>{item.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

export default Features
