import './styles/App.css'
import Header from './components/layout/Header'
import Hero from './components/sections/Hero'
import Services from './components/sections/Services'
import Features from './components/sections/Features'
import Footer from './components/layout/Footer'

function App() {
  return (
    <div className="App">
      <Header />
      <Hero />
      <Services />
      <Features />
      <Footer />
    </div>
  )
}

export default App
