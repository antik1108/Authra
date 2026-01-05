import { CheckCircle2, Clock, Shield } from 'lucide-react';

function Hero() {
  return (
    <section className="bg-gradient-to-b from-light to-white py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-dark leading-tight mb-6">
            Seamless Parcel Tracking for{' '}
            <span className="text-[#C62828]">Universities, Workplaces, and Individuals</span>
          </h1>
          <p className="text-xl text-dark/70 mb-12 leading-relaxed">
            Experience effortless parcel management with real-time tracking, instant notifications,
            and secure QR verification. Never miss a delivery again.
          </p>

          <div className="flex flex-wrap justify-center gap-4 mb-16">
            <button className="bg-[#C62828] text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-[#B71C1C] transition-all transform hover:scale-105 shadow-lg hover:shadow-xl">
              Get Started Free
            </button>
            <button className="bg-white text-dark px-8 py-4 rounded-lg text-lg font-semibold hover:bg-light transition-all border-2 border-light">
              Learn More
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="flex items-center justify-center space-x-3 text-dark/80">
              <CheckCircle2 className="h-6 w-6 text-[#C62828] flex-shrink-0" />
              <span className="text-lg">100% Secure</span>
            </div>
            <div className="flex items-center justify-center space-x-3 text-dark/80">
              <Clock className="h-6 w-6 text-[#C62828] flex-shrink-0" />
              <span className="text-lg">Real-Time Updates</span>
            </div>
            <div className="flex items-center justify-center space-x-3 text-dark/80">
              <Shield className="h-6 w-6 text-[#C62828] flex-shrink-0" />
              <span className="text-lg">QR Verification</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;