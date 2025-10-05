import React from 'react';
import SimpleNASAMap from './SimpleNASAMap';

interface AirQualityMapProps {
  currentLocation: { lat: number; lon: number };
  onLocationChange?: (lat: number, lon: number) => void;
}

const AirQualityMap: React.FC<AirQualityMapProps> = ({ 
  currentLocation,
  onLocationChange
}) => {
  return (
    <div className="relative w-full h-full">
      <SimpleNASAMap
        center={[currentLocation.lat, currentLocation.lon]}
        zoom={8}
        onLocationSelect={onLocationChange}
      />
    </div>
  );
};

export default AirQualityMap;
