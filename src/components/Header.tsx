import React from 'react';
import { Wind, Satellite, AlertTriangle } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="kraken-gradient shadow-lg">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          {/* Logo Section */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              {/* Kraken Octopus SVG Logo */}
              <img 
                src="/kraken-octopus.svg" 
                alt="Kraken Octopus Logo" 
                className="w-14 h-14 object-contain"
              />
              
              {/* Kraken Text */}
              <div className="text-3xl font-bold text-kraken-dark font-mono">
                KRAKEN
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <div className="flex items-center space-x-2 text-kraken-dark font-mono">
              <Satellite className="w-5 h-5" />
              <span className="font-medium">TEMPO Data</span>
            </div>
            <div className="flex items-center space-x-2 text-kraken-dark font-mono">
              <Wind className="w-5 h-5" />
              <span className="font-medium">Air Quality</span>
            </div>
            <div className="flex items-center space-x-2 text-kraken-dark font-mono">
              <AlertTriangle className="w-5 h-5" />
              <span className="font-medium">Alerts</span>
            </div>
          </nav>

          {/* Status Indicator */}
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-kraken-dark font-mono text-sm font-medium">
              LIVE DATA
            </span>
          </div>
        </div>

        {/* Subtitle */}
        <div className="mt-4">
          <p className="text-kraken-dark font-mono text-sm opacity-80">
            Real-time air quality forecasting powered by NASA TEMPO satellite data
          </p>
        </div>
      </div>
    </header>
  );
};

export default Header;
