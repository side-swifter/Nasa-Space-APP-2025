import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  ArrowRight,
  Satellite,
  MapPin,
  TrendingUp,
  Shield,
  Globe,
  Eye,
  Wind,
  Droplets,
  Thermometer,
  Activity
} from 'lucide-react';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [currentSlide, setCurrentSlide] = useState(0);

  const features = [
    {
      icon: <Satellite className="w-8 h-8" />,
      title: "NASA TEMPO Integration",
      description: "Real-time satellite atmospheric data from NASA's cutting-edge TEMPO mission"
    },
    {
      icon: <MapPin className="w-8 h-8" />,
      title: "Global Coverage",
      description: "Monitor air quality anywhere in the world with precise location tracking"
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "24-Hour Forecasting",
      description: "Predictive air quality modeling for better planning and health decisions"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Health Recommendations",
      description: "Personalized guidance based on current air quality conditions"
    }
  ];

  const pollutants = [
    { icon: <Droplets className="w-6 h-6" />, name: "PM2.5", color: "text-purple-400" },
    { icon: <Thermometer className="w-6 h-6" />, name: "PM10", color: "text-orange-400" },
    { icon: <Wind className="w-6 h-6" />, name: "NO₂", color: "text-blue-400" },
    { icon: <Eye className="w-6 h-6" />, name: "O₃", color: "text-green-400" },
    { icon: <Activity className="w-6 h-6" />, name: "SO₂", color: "text-yellow-400" },
    { icon: <Globe className="w-6 h-6" />, name: "CO", color: "text-red-400" }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % features.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [features.length]);

  return (
    <div className="min-h-screen bg-kraken-dark text-kraken-light overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-32 h-32 bg-kraken-beige rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-32 w-24 h-24 bg-kraken-red rounded-full animate-bounce"></div>
        <div className="absolute bottom-32 left-1/4 w-40 h-40 bg-kraken-beige rounded-full animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-28 h-28 bg-kraken-red rounded-full animate-bounce"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 p-6">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img
              src="/kraken-octopus.svg"
              alt="Kraken Logo"
              className="w-12 h-12 object-contain"
            />
            <div className="text-2xl font-bold text-kraken-beige font-mono">KRAKEN</div>
          </div>

          {/* Conditional Header Buttons */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <button
                onClick={() => navigate('/dashboard')}
                className="px-6 py-2 bg-kraken-beige bg-opacity-20 text-kraken-beige rounded-lg font-mono text-sm hover:bg-opacity-30 transition-colors border border-kraken-beige border-opacity-30"
              >
                Launch Dashboard
              </button>
            ) : (
              <>
                <button
                  onClick={() => navigate('/login')}
                  className="px-6 py-2 bg-kraken-dark bg-opacity-50 text-kraken-light rounded-lg font-mono text-sm hover:bg-opacity-70 transition-colors border border-kraken-beige border-opacity-20"
                >
                  Login
                </button>
                <button
                  onClick={() => navigate('/signup')}
                  className="px-6 py-2 bg-kraken-beige bg-opacity-20 text-kraken-beige rounded-lg font-mono text-sm hover:bg-opacity-30 transition-colors border border-kraken-beige border-opacity-30"
                >
                  Get Started
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 container mx-auto px-6 py-20">
        <div className="text-center max-w-4xl mx-auto">
          {/* Main Logo */}
          <div className="mb-8">
            <img
              src="/main-krak.svg"
              alt="Kraken Octopus"
              className="w-76 h-76 mx-auto object-contain animate-pulse"
            />
          </div>

          {/* Subtitle */}
          <p className="text-2xl md:text-3xl text-kraken-light font-mono mb-4 opacity-90">
            Air Quality Forecasting Platform
          </p>

          {/* NASA Badge */}
          <div className="inline-flex items-center space-x-2 bg-kraken-red bg-opacity-20 px-4 py-2 rounded-full border border-kraken-red border-opacity-30 mb-8">
            <Satellite className="w-5 h-5 text-kraken-red" />
            <span className="text-kraken-red font-mono text-sm font-bold">Powered by NASA TEMPO</span>
          </div>

          {/* Description */}
          <p className="text-lg text-kraken-light font-mono max-w-2xl mx-auto mb-12 leading-relaxed opacity-80">
            Real-time air quality monitoring and forecasting using NASA's cutting-edge satellite technology.
            Make informed decisions about your health and outdoor activities with professional-grade atmospheric data.
          </p>

          {/* CTA Button */}
          <button
            onClick={() => navigate('/signup')}
            className="group inline-flex items-center space-x-3 bg-kraken-beige text-kraken-dark px-8 py-4 rounded-lg font-mono text-lg font-bold hover:bg-opacity-90 transition-all transform hover:scale-105 shadow-lg"
          >
            <span>Get Started with Kraken</span>
            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      {/* Features Carousel */}
      <section className="relative z-10 container mx-auto px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-kraken-beige font-mono text-center mb-12">
            Professional Air Quality Intelligence
          </h2>

          <div className="relative h-64 overflow-hidden rounded-lg border border-kraken-beige border-opacity-20">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-transform duration-1000 ease-in-out ${
                  index === currentSlide ? 'translate-x-0' :
                  index < currentSlide ? '-translate-x-full' : 'translate-x-full'
                }`}
              >
                <div className="h-full bg-kraken-dark bg-opacity-50 flex items-center justify-center p-8">
                  <div className="text-center">
                    <div className="text-kraken-beige mb-4 flex justify-center">
                      {feature.icon}
                    </div>
                    <h3 className="text-2xl font-bold text-kraken-light font-mono mb-4">
                      {feature.title}
                    </h3>
                    <p className="text-kraken-light font-mono opacity-80 max-w-md">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Slide Indicators */}
          <div className="flex justify-center space-x-2 mt-6">
            {features.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentSlide ? 'bg-kraken-beige' : 'bg-kraken-beige bg-opacity-30'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Pollutants Grid */}
      <section className="relative z-10 container mx-auto px-6 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-kraken-beige font-mono mb-4">
            Monitor Key Air Pollutants
          </h2>
          <p className="text-kraken-light font-mono opacity-80 mb-12">
            Track the pollutants that matter most for your health and environment
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {pollutants.map((pollutant, index) => (
              <div
                key={index}
                className="bg-kraken-dark bg-opacity-50 border border-kraken-beige border-opacity-20 rounded-lg p-6 hover:border-opacity-40 transition-colors group"
              >
                <div className={`${pollutant.color} mb-3 flex justify-center group-hover:scale-110 transition-transform`}>
                  {pollutant.icon}
                </div>
                <div className="text-kraken-light font-mono font-bold">
                  {pollutant.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 container mx-auto px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="bg-kraken-dark bg-opacity-50 border border-kraken-beige border-opacity-20 rounded-lg p-8">
              <div className="text-4xl font-bold text-kraken-beige font-mono mb-2">24/7</div>
              <div className="text-kraken-light font-mono">Real-time Monitoring</div>
            </div>
            <div className="bg-kraken-dark bg-opacity-50 border border-kraken-beige border-opacity-20 rounded-lg p-8">
              <div className="text-4xl font-bold text-kraken-beige font-mono mb-2">Global</div>
              <div className="text-kraken-light font-mono">Worldwide Coverage</div>
            </div>
            <div className="bg-kraken-dark bg-opacity-50 border border-kraken-beige border-opacity-20 rounded-lg p-8">
              <div className="text-4xl font-bold text-kraken-beige font-mono mb-2">NASA</div>
              <div className="text-kraken-light font-mono">Satellite Technology</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <footer className="relative z-10 container mx-auto px-6 py-16 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-kraken-beige font-mono mb-4">
            Ready to Breathe Easier?
          </h2>
          <p className="text-kraken-light font-mono opacity-80 mb-8">
            Start monitoring air quality in your area with professional NASA satellite data
          </p>
          <button
            onClick={() => navigate('/signup')}
            className="group inline-flex items-center space-x-3 bg-kraken-red text-white px-8 py-4 rounded-lg font-mono text-lg font-bold hover:bg-opacity-90 transition-all transform hover:scale-105 shadow-lg"
          >
            <span>Launch Kraken Dashboard</span>
            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Copyright */}
        <div className="mt-16 pt-8 border-t border-kraken-beige border-opacity-20">
          <p className="text-kraken-light font-mono text-sm opacity-60">
            © 2025 Kraken Air Quality Platform • Built for NASA Space Apps Challenge • Powered by NASA TEMPO
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
