import React, { useState, useEffect } from 'react';
import { Home, User, Bell, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface HeaderProps {
  onBackToHome?: () => void;
  locationInfo?: {
    displayName?: string;
  } | null;
}

const Header: React.FC<HeaderProps> = ({ onBackToHome, locationInfo }) => {
  const { user, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (isDropdownOpen && !target.closest('.profile-dropdown')) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);
  return (
    <header className="kraken-gradient shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Left: Kraken Logo and Text */}
          <div className="flex items-center space-x-4">
            {/* Home Button */}
            {onBackToHome && (
              <button
                onClick={onBackToHome}
                className="flex items-center space-x-2 px-3 py-2 bg-kraken-dark bg-opacity-20 text-kraken-dark rounded-lg font-mono text-sm hover:bg-opacity-30 transition-colors"
              >
                <Home className="w-4 h-4" />
                <span>Home</span>
              </button>
            )}
            
            <div className="flex items-center space-x-3">
              {/* Kraken Octopus SVG Logo */}
              <img 
                src="/kraken-octopus.svg" 
                alt="Kraken Octopus Logo" 
                className="w-12 h-12 object-contain"
              />
              
              {/* Kraken Text and Location */}
              <div>
                <div className="text-xl font-bold text-kraken-dark font-mono">
                  Kraken Air Quality Monitor
                </div>
                <div className="text-sm text-kraken-dark opacity-70 font-mono">
                  {locationInfo?.displayName || 'Loading Location...'}
                </div>
              </div>
            </div>
          </div>

          {/* Center: Live Data Indicator */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
              <span className="text-kraken-dark font-mono text-sm font-medium">Live Data</span>
            </div>
            <div className="text-xs text-kraken-dark opacity-50 font-mono">
              {new Date().toLocaleTimeString()}
            </div>
          </div>

          {/* Right: User Profile Dropdown */}
          <div className="relative profile-dropdown">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center space-x-2 px-3 py-2 bg-kraken-dark bg-opacity-10 hover:bg-opacity-20 rounded-lg transition-colors"
            >
              <span className="text-kraken-dark font-mono text-sm font-medium">
                Hi, {user?.name || 'User'}
              </span>
              <div className="flex items-center justify-center w-8 h-8 bg-kraken-dark bg-opacity-20 rounded-full">
                <User className="w-4 h-4 text-kraken-dark" />
              </div>
              <ChevronDown className={`w-4 h-4 text-kraken-dark transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <div className="py-1">
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      // Add notifications functionality here
                    }}
                    className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <Bell className="w-4 h-4" />
                    <span>Notifications</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      logout();
                    }}
                    className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
