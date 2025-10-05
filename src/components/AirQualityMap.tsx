import React, { useState } from 'react';
import { ToggleLeft, ToggleRight } from 'lucide-react';
import NASAWorldviewMap from './NASAWorldviewMap';
import SimpleNASAMap from './SimpleNASAMap';

interface AirQualityMapProps {
  currentLocation: { lat: number; lon: number };
  onLocationChange?: (lat: number, lon: number) => void;
}

const AirQualityMap: React.FC<AirQualityMapProps> = ({ 
  currentLocation,
  onLocationChange
}) => {
  const [useInteractiveMap, setUseInteractiveMap] = useState(true); // Default to interactive NASA map

  return (
    <div className="relative w-full h-full">
      {/* Map Type Toggle */}
      <div className="absolute top-2 left-2 z-30 bg-kraken-dark bg-opacity-90 rounded-lg p-2 border border-kraken-beige border-opacity-20">
        <button
          onClick={() => setUseInteractiveMap(!useInteractiveMap)}
          className="flex items-center space-x-2 text-kraken-light hover:text-kraken-beige transition-colors"
          title={useInteractiveMap ? "Switch to NASA Worldview" : "Switch to Interactive Map"}
        >
          {useInteractiveMap ? (
            <>
              <ToggleRight className="w-4 h-4" />
              <span className="font-mono text-xs">Interactive</span>
            </>
          ) : (
            <>
              <ToggleLeft className="w-4 h-4" />
              <span className="font-mono text-xs">Worldview</span>
            </>
          )}
        </button>
      </div>

      {/* Render appropriate map */}
      {useInteractiveMap ? (
        <SimpleNASAMap
          center={[currentLocation.lat, currentLocation.lon]}
          zoom={8}
          onLocationSelect={onLocationChange}
        />
      ) : (
        <NASAWorldviewMap
          center={[currentLocation.lat, currentLocation.lon]}
          zoom={8}
          onLocationSelect={onLocationChange}
        />
      )}
    </div>
  );
};

export default AirQualityMap;
