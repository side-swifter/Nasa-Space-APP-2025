import React, { useState, useEffect } from 'react';
import { X, MapPin, Search, Navigation, Globe } from 'lucide-react';
import locationService, { LocationInfo } from '../services/locationService';

interface LocationPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLocationSelect: (lat: number, lon: number) => void;
  currentLocation: { lat: number; lon: number };
}

const LocationPickerModal: React.FC<LocationPickerModalProps> = ({
  isOpen,
  onClose,
  onLocationSelect,
  currentLocation
}) => {
  const [searchInput, setSearchInput] = useState('');
  const [coordinateInput, setCoordinateInput] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<LocationInfo[]>([]);
  const [selectedLocation, setSelectedLocation] = useState(currentLocation);

  useEffect(() => {
    if (isOpen) {
      setSelectedLocation(currentLocation);
      setCoordinateInput(`${currentLocation.lat.toFixed(4)}, ${currentLocation.lon.toFixed(4)}`);
    }
  }, [isOpen, currentLocation]);

  if (!isOpen) return null;

  const handleSearch = async () => {
    if (!searchInput.trim()) return;
    
    setIsSearching(true);
    try {
      // Use Nominatim search API
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchInput)}&limit=5&addressdetails=1`
      );
      const results = await response.json();
      
      const locations: LocationInfo[] = results.map((result: any) => ({
        lat: parseFloat(result.lat),
        lon: parseFloat(result.lon),
        city: result.address?.city || result.address?.town || result.address?.village || 'Unknown',
        state: result.address?.state || result.address?.province || '',
        country: result.address?.country || 'Unknown',
        displayName: result.display_name
      }));
      
      setSearchResults(locations);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    }
    setIsSearching(false);
  };

  const handleCoordinateInput = () => {
    const coords = coordinateInput.split(',').map(s => s.trim());
    if (coords.length === 2) {
      const lat = parseFloat(coords[0]);
      const lon = parseFloat(coords[1]);
      
      if (!isNaN(lat) && !isNaN(lon) && lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) {
        const newLocation = { lat, lon };
        setSelectedLocation(newLocation);
      }
    }
  };

  const handleLocationClick = (location: LocationInfo) => {
    setSelectedLocation({ lat: location.lat, lon: location.lon });
    setCoordinateInput(`${location.lat.toFixed(4)}, ${location.lon.toFixed(4)}`);
    setSearchResults([]);
  };

  const handleCurrentLocation = async () => {
    try {
      const location = await locationService.getCurrentLocationInfo();
      const newLocation = { lat: location.lat, lon: location.lon };
      setSelectedLocation(newLocation);
      setCoordinateInput(`${location.lat.toFixed(4)}, ${location.lon.toFixed(4)}`);
    } catch (error) {
      console.error('Error getting current location:', error);
    }
  };

  const handleConfirm = () => {
    onLocationSelect(selectedLocation.lat, selectedLocation.lon);
    onClose();
  };

  // Popular cities for quick selection
  const popularCities = [
    { name: 'New York, USA', lat: 40.7128, lon: -74.0060 },
    { name: 'Los Angeles, USA', lat: 34.0522, lon: -118.2437 },
    { name: 'London, UK', lat: 51.5074, lon: -0.1278 },
    { name: 'Paris, France', lat: 48.8566, lon: 2.3522 },
    { name: 'Tokyo, Japan', lat: 35.6762, lon: 139.6503 },
    { name: 'Sydney, Australia', lat: -33.8688, lon: 151.2093 },
    { name: 'Beijing, China', lat: 39.9042, lon: 116.4074 },
    { name: 'Mumbai, India', lat: 19.0760, lon: 72.8777 }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-kraken-dark border border-kraken-beige border-opacity-30 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-kraken-beige border-opacity-20">
          <div className="flex items-center space-x-3">
            <Globe className="w-6 h-6 text-kraken-beige" />
            <h2 className="text-2xl font-bold text-kraken-light font-mono">Choose Location</h2>
          </div>
          <button
            onClick={onClose}
            className="text-kraken-light hover:text-kraken-beige transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex h-[600px]">
          {/* Left Panel - Controls */}
          <div className="w-1/3 p-6 border-r border-kraken-beige border-opacity-20 overflow-y-auto">
            {/* Search by Address */}
            <div className="mb-6">
              <h3 className="text-lg font-bold text-kraken-beige font-mono mb-3">Search by Address</h3>
              <div className="flex space-x-2 mb-3">
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Enter city, address, or landmark..."
                  className="flex-1 px-3 py-2 bg-kraken-dark border border-kraken-beige border-opacity-30 rounded text-kraken-light font-mono text-sm focus:outline-none focus:border-kraken-beige"
                />
                <button
                  onClick={handleSearch}
                  disabled={isSearching}
                  className="px-4 py-2 bg-kraken-beige bg-opacity-20 text-kraken-beige rounded font-mono text-sm hover:bg-opacity-30 transition-colors disabled:opacity-50"
                >
                  {isSearching ? '...' : <Search className="w-4 h-4" />}
                </button>
              </div>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="space-y-2 mb-4">
                  {searchResults.map((result, index) => (
                    <button
                      key={index}
                      onClick={() => handleLocationClick(result)}
                      className="w-full text-left p-3 bg-kraken-dark bg-opacity-50 rounded border border-kraken-beige border-opacity-20 hover:border-opacity-40 transition-colors"
                    >
                      <div className="flex items-start space-x-2">
                        <MapPin className="w-4 h-4 text-kraken-beige mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="text-kraken-light font-mono text-sm font-medium">
                            {result.city}, {result.country}
                          </div>
                          <div className="text-kraken-light opacity-60 font-mono text-xs mt-1 line-clamp-2">
                            {result.displayName}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Coordinates Input */}
            <div className="mb-6">
              <h3 className="text-lg font-bold text-kraken-beige font-mono mb-3">Enter Coordinates</h3>
              <div className="flex space-x-2 mb-2">
                <input
                  type="text"
                  value={coordinateInput}
                  onChange={(e) => setCoordinateInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleCoordinateInput()}
                  placeholder="40.7128, -74.0060"
                  className="flex-1 px-3 py-2 bg-kraken-dark border border-kraken-beige border-opacity-30 rounded text-kraken-light font-mono text-sm focus:outline-none focus:border-kraken-beige"
                />
                <button
                  onClick={handleCoordinateInput}
                  className="px-4 py-2 bg-kraken-beige bg-opacity-20 text-kraken-beige rounded font-mono text-sm hover:bg-opacity-30 transition-colors"
                >
                  Go
                </button>
              </div>
              <p className="text-kraken-light opacity-60 font-mono text-xs">
                Format: latitude, longitude
              </p>
            </div>

            {/* Current Location Button */}
            <div className="mb-6">
              <button
                onClick={handleCurrentLocation}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-kraken-beige bg-opacity-20 text-kraken-beige rounded font-mono text-sm hover:bg-opacity-30 transition-colors"
              >
                <Navigation className="w-4 h-4" />
                <span>Use My Current Location</span>
              </button>
            </div>

            {/* Popular Cities */}
            <div>
              <h3 className="text-lg font-bold text-kraken-beige font-mono mb-3">Popular Cities</h3>
              <div className="space-y-2">
                {popularCities.map((city, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSelectedLocation({ lat: city.lat, lon: city.lon });
                      setCoordinateInput(`${city.lat.toFixed(4)}, ${city.lon.toFixed(4)}`);
                    }}
                    className="w-full text-left p-2 bg-kraken-dark bg-opacity-50 rounded border border-kraken-beige border-opacity-20 hover:border-opacity-40 transition-colors"
                  >
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-3 h-3 text-kraken-beige" />
                      <span className="text-kraken-light font-mono text-sm">{city.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Panel - NASA Worldview Map */}
          <div className="flex-1 relative">
            <div className="w-full h-full relative overflow-hidden rounded-lg">
              {/* NASA Worldview Satellite Map */}
              <iframe
                src={`https://worldview.earthdata.nasa.gov/snapshot?v=-180,-90,180,90&t=2024-10-04&l=MODIS_Aqua_CorrectedReflectance_TrueColor,MODIS_Terra_CorrectedReflectance_TrueColor&lg=false&s=${selectedLocation.lon-10},${selectedLocation.lat-10},${selectedLocation.lon+10},${selectedLocation.lat+10}`}
                className="w-full h-full border-0"
                title="NASA Worldview Satellite Map"
                loading="lazy"
              />
              
              {/* Selected Location Marker Overlay */}
              <div 
                className="absolute transform -translate-x-1/2 -translate-y-full pointer-events-none z-10"
                style={{
                  left: `${((selectedLocation.lon + 180) / 360) * 100}%`,
                  top: `${((90 - selectedLocation.lat) / 180) * 100}%`
                }}
              >
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 bg-kraken-red rounded-full border-4 border-white shadow-lg animate-pulse flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-white" />
                  </div>
                  <div className="w-1 h-6 bg-kraken-red shadow-lg"></div>
                </div>
              </div>

              {/* NASA Worldview Attribution */}
              <div className="absolute top-4 left-4 bg-black bg-opacity-70 rounded px-3 py-2 border border-kraken-beige border-opacity-30">
                <div className="text-white font-mono text-xs">
                  <div className="flex items-center space-x-2 mb-1">
                    <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                    <span>NASA Worldview</span>
                  </div>
                  <div>Lat: {selectedLocation.lat.toFixed(4)}</div>
                  <div>Lon: {selectedLocation.lon.toFixed(4)}</div>
                </div>
              </div>

              {/* Air Quality Layer Toggle */}
              <div className="absolute top-4 right-4 space-y-2">
                <button
                  onClick={() => {
                    // Toggle to air quality view
                    const iframe = document.querySelector('iframe');
                    if (iframe) {
                      iframe.src = `https://worldview.earthdata.nasa.gov/snapshot?v=-180,-90,180,90&t=2024-10-04&l=OMPS_NPP_NMTO3_L3_Daily,MODIS_Aqua_CorrectedReflectance_TrueColor&lg=false&s=${selectedLocation.lon-10},${selectedLocation.lat-10},${selectedLocation.lon+10},${selectedLocation.lat+10}`;
                    }
                  }}
                  className="block px-3 py-2 bg-blue-600 bg-opacity-80 text-white rounded font-mono text-xs hover:bg-opacity-100 transition-colors"
                >
                  Ozone Layer
                </button>
                <button
                  onClick={() => {
                    // Toggle to aerosol view
                    const iframe = document.querySelector('iframe');
                    if (iframe) {
                      iframe.src = `https://worldview.earthdata.nasa.gov/snapshot?v=-180,-90,180,90&t=2024-10-04&l=MODIS_Combined_MAIAC_L2G_AerosolOpticalDepth,MODIS_Aqua_CorrectedReflectance_TrueColor&lg=false&s=${selectedLocation.lon-10},${selectedLocation.lat-10},${selectedLocation.lon+10},${selectedLocation.lat+10}`;
                    }
                  }}
                  className="block px-3 py-2 bg-orange-600 bg-opacity-80 text-white rounded font-mono text-xs hover:bg-opacity-100 transition-colors"
                >
                  Aerosols
                </button>
                <button
                  onClick={() => {
                    // Toggle back to true color
                    const iframe = document.querySelector('iframe');
                    if (iframe) {
                      iframe.src = `https://worldview.earthdata.nasa.gov/snapshot?v=-180,-90,180,90&t=2024-10-04&l=MODIS_Aqua_CorrectedReflectance_TrueColor,MODIS_Terra_CorrectedReflectance_TrueColor&lg=false&s=${selectedLocation.lon-10},${selectedLocation.lat-10},${selectedLocation.lon+10},${selectedLocation.lat+10}`;
                    }
                  }}
                  className="block px-3 py-2 bg-green-600 bg-opacity-80 text-white rounded font-mono text-xs hover:bg-opacity-100 transition-colors"
                >
                  Satellite
                </button>
              </div>

              {/* Loading Overlay */}
              <div className="absolute inset-0 bg-kraken-dark bg-opacity-50 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-kraken-beige mx-auto mb-2"></div>
                  <p className="text-kraken-light font-mono text-sm">Loading NASA satellite data...</p>
                </div>
              </div>

              {/* Map Instructions */}
              <div className="absolute bottom-4 left-4 right-4 bg-black bg-opacity-70 rounded px-3 py-2 border border-kraken-beige border-opacity-30">
                <p className="text-white font-mono text-xs text-center">
                  🛰️ Real NASA satellite imagery • Use buttons to view different atmospheric layers
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-kraken-beige border-opacity-20">
          <div className="flex items-center justify-between">
            <div className="text-kraken-light font-mono text-sm">
              Selected: {selectedLocation.lat.toFixed(4)}, {selectedLocation.lon.toFixed(4)}
            </div>
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-kraken-light font-mono text-sm hover:text-kraken-beige transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className="px-6 py-2 bg-kraken-beige bg-opacity-20 text-kraken-beige rounded font-mono text-sm hover:bg-opacity-30 transition-colors"
              >
                Select This Location
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationPickerModal;
