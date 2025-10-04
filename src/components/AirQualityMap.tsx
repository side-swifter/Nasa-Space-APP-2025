import React from 'react';
import { MapPin } from 'lucide-react';
import { AirQualityReading } from '../services/nasaApiService';

interface AirQualityMapProps {
  center: [number, number];
  airQualityData: AirQualityReading | null;
  onLocationChange: (lat: number, lon: number) => void;
}

const AirQualityMap: React.FC<AirQualityMapProps> = ({ center, airQualityData, onLocationChange }) => {
  const handleLocationClick = () => {
    // Simulate clicking on different locations
    const newLat = center[0] + (Math.random() - 0.5) * 0.1;
    const newLon = center[1] + (Math.random() - 0.5) * 0.1;
    onLocationChange(newLat, newLon);
  };

  const getAQIColor = (aqi: number) => {
    if (aqi <= 50) return '#10b981';
    if (aqi <= 100) return '#f59e0b';
    if (aqi <= 150) return '#f97316';
    if (aqi <= 200) return '#ef4444';
    return '#7c2d12';
  };

  return (
    <div className="relative">
      {/* Placeholder Map */}
      <div 
        className="w-full h-96 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 rounded-lg relative overflow-hidden cursor-pointer"
        onClick={handleLocationClick}
      >
        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="grid grid-cols-8 grid-rows-6 h-full">
            {Array.from({ length: 48 }).map((_, i) => (
              <div key={i} className="border border-blue-400 border-opacity-30"></div>
            ))}
          </div>
        </div>

        {/* Location Marker */}
        <div 
          className="absolute transform -translate-x-1/2 -translate-y-1/2"
          style={{ 
            left: '50%', 
            top: '50%',
          }}
        >
          <div 
            className="w-8 h-8 rounded-full border-4 border-white flex items-center justify-center shadow-lg"
            style={{ backgroundColor: airQualityData ? getAQIColor(airQualityData.aqi) : '#6b7280' }}
          >
            <span className="text-white font-bold text-xs font-mono">
              {airQualityData?.aqi || '?'}
            </span>
          </div>
          <div className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-kraken-dark bg-opacity-90 rounded px-2 py-1 text-xs text-white font-mono whitespace-nowrap">
            AQI: {airQualityData?.aqi || 'Loading...'}
          </div>
        </div>

        {/* Additional Data Points */}
        {airQualityData && (
          <>
            <div className="absolute top-4 left-4 bg-kraken-dark bg-opacity-80 rounded-lg p-3 text-white font-mono text-xs">
              <div className="font-bold mb-2">Current Location</div>
              <div>Lat: {center[0].toFixed(4)}</div>
              <div>Lon: {center[1].toFixed(4)}</div>
            </div>

            <div className="absolute top-4 right-4 bg-kraken-dark bg-opacity-80 rounded-lg p-3 text-white font-mono text-xs">
              <div className="font-bold mb-2">Air Quality</div>
              <div>PM2.5: {airQualityData.pm25} μg/m³</div>
              <div>PM10: {airQualityData.pm10} μg/m³</div>
              <div>NO₂: {airQualityData.no2} ppb</div>
              <div>O₃: {airQualityData.o3} ppb</div>
            </div>
          </>
        )}

        {/* Click Instruction */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-kraken-beige bg-opacity-90 rounded-lg px-3 py-2 text-kraken-dark font-mono text-xs">
          <MapPin className="w-4 h-4 inline mr-1" />
          Click to change location
        </div>
      </div>
      
      {/* Map Legend */}
      <div className="absolute bottom-4 left-4 bg-kraken-dark bg-opacity-90 rounded-lg p-3 text-xs font-mono">
        <div className="font-bold text-kraken-beige mb-2">AQI Scale</div>
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-kraken-light">Good (0-50)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span className="text-kraken-light">Moderate (51-100)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
            <span className="text-kraken-light">Unhealthy (101-150)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-kraken-light">Very Unhealthy (151+)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AirQualityMap;
