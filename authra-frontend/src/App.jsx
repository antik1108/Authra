import Header from './components/Header';
import Hero from './components/Hero';
import Footer from './components/Footer';
import Features from './components/Features';
import UserTypeOption from './components/UserTypeOption';


function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <Hero />
      <Features />
      <UserTypeOption />
      <Footer />
    </div>
  )
}

export default App
