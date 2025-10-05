import React from 'react';
import { Satellite, Globe, Heart, ExternalLink, Presentation } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const navigate = useNavigate();

  return (
    <footer className="bg-kraken-dark border-t border-kraken-beige border-opacity-20 mt-12">
      <div className="container mx-auto px-4 py-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Kraken Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <img 
                src="/kraken-octopus.svg" 
                alt="Kraken Logo" 
                className="w-8 h-8 object-contain"
              />
              <h3 className="text-xl font-bold text-kraken-beige font-mono">KRAKEN</h3>
            </div>
            <p className="text-kraken-light opacity-80 font-mono text-sm mb-4 max-w-md">
              Advanced air quality forecasting powered by NASA TEMPO satellite data. 
              Helping communities make informed decisions about air pollution exposure.
            </p>
            <div className="flex items-center space-x-4 text-xs font-mono">
              <div className="flex items-center space-x-1">
                <Satellite className="w-4 h-4 text-kraken-beige" />
                <span className="text-kraken-light">NASA TEMPO Data</span>
              </div>
              <div className="flex items-center space-x-1">
                <Globe className="w-4 h-4 text-kraken-beige" />
                <span className="text-kraken-light">Global Coverage</span>
              </div>
            </div>
          </div>

          {/* Data Sources */}
          <div>
            <h4 className="text-kraken-beige font-mono font-bold mb-3">Data Sources</h4>
            <ul className="space-y-2 text-sm font-mono">
              <li>
                <a 
                  href="https://tempo.si.edu/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-kraken-light hover:text-kraken-beige transition-colors flex items-center space-x-1"
                >
                  <span>NASA TEMPO</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a 
                  href="https://openaq.org/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-kraken-light hover:text-kraken-beige transition-colors flex items-center space-x-1"
                >
                  <span>OpenAQ Network</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a 
                  href="https://www.pandonia-global-network.org/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-kraken-light hover:text-kraken-beige transition-colors flex items-center space-x-1"
                >
                  <span>Pandora Network</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a 
                  href="https://harmony.earthdata.nasa.gov/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-kraken-light hover:text-kraken-beige transition-colors flex items-center space-x-1"
                >
                  <span>NASA Harmony</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <span className="text-kraken-light">Ground Stations</span>
              </li>
            </ul>
          </div>

          {/* About */}
          <div>
            <h4 className="text-kraken-beige font-mono font-bold mb-3">About</h4>
            <ul className="space-y-2 text-sm font-mono">
              <li>
                <a 
                  href="https://www.spaceappschallenge.org/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-kraken-light hover:text-kraken-beige transition-colors flex items-center space-x-1"
                >
                  <span>NASA Space Apps</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <span className="text-kraken-light">Air Quality Index</span>
              </li>
              <li>
                <span className="text-kraken-light">Health Guidelines</span>
              </li>
              <li>
                <span className="text-kraken-light">Privacy Policy</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-kraken-beige border-opacity-20 pt-6">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            {/* Copyright */}
            <div className="text-kraken-light opacity-70 font-mono text-sm">
              © {currentYear} Kraken Air Quality. Built for NASA Space Apps Challenge 2025.
            </div>

            {/* Made with love */}
            <div className="flex items-center space-x-2 text-kraken-light opacity-70 font-mono text-sm">
              <span>Made with</span>
              <Heart className="w-4 h-4 text-kraken-red fill-current" />
              <span>for cleaner air</span>
            </div>

            {/* Presentation Button & Tech Stack */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/presentation')}
                className="flex items-center space-x-2 px-4 py-2 bg-kraken-beige/10 border border-kraken-beige/30 rounded-lg hover:bg-kraken-beige/20 hover:border-kraken-beige/50 transition-all duration-300 group"
              >
                <Presentation className="w-4 h-4 text-kraken-beige group-hover:scale-110 transition-transform" />
                <span className="text-kraken-beige font-mono text-sm">Judge Presentation</span>
              </button>
              <div className="text-kraken-light opacity-70 font-mono text-xs">
                React • TypeScript • NASA APIs • Tailwind CSS
              </div>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-6 pt-4 border-t border-kraken-beige border-opacity-10">
          <p className="text-kraken-light opacity-60 font-mono text-xs text-center max-w-4xl mx-auto">
            <strong>Disclaimer:</strong> This application is developed for educational and research purposes as part of the NASA Space Apps Challenge. 
            Air quality data should be used as a reference only. For official air quality information and health advisories, 
            please consult your local environmental protection agency and health authorities.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
