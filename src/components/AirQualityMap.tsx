import React from 'react';
import SimpleNASAMap from './SimpleNASAMap';
import { AirQualityReading } from '../services/nasaApiService';

interface AirQualityMapProps {
  currentLocation: { lat: number; lon: number };
  onLocationChange?: (lat: number, lon: number) => void;
  currentAirQuality?: AirQualityReading | null;
}

const AirQualityMap: React.FC<AirQualityMapProps> = ({ 
  currentLocation,
  onLocationChange,
  currentAirQuality
}) => {
  return (
    <div className="relative w-full h-full">
      <SimpleNASAMap
        center={[currentLocation.lat, currentLocation.lon]}
        zoom={8}
        onLocationSelect={onLocationChange}
        currentAirQuality={currentAirQuality ? {
          aqi: currentAirQuality.aqi,
          pm25: currentAirQuality.pm25,
          pm10: currentAirQuality.pm10,
          no2: currentAirQuality.no2,
          o3: currentAirQuality.o3,
          so2: currentAirQuality.so2,
          co: currentAirQuality.co
        } : null}
      />
    </div>
  );
};

export default AirQualityMap;
