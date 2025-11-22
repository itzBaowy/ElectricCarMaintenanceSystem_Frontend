import Header from '../components/layout/Header'
import Hero from '../components/sections/Hero'
import Services from '../components/sections/Services'
import Features from '../components/sections/Features'
import ImageCarousel from '../components/sections/ImageCarousel'
import Footer from '../components/layout/Footer'

const LandingPage = () => {
  return (
    <>
      <Header />
      <Hero />
      <Services />
      <ImageCarousel />
      <Features />
      <Footer />
    </>
  )
}

export default LandingPage