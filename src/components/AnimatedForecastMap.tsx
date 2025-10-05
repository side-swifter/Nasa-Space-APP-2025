import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Clock, 
  Zap,
  Activity,
  Eye
} from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { ExtendedForecast, AIForecastResult } from '../services/aiForecastingService';

// Fix for default markers in React Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface AnimatedForecastMapProps {
  center: [number, number];
  zoom?: number;
  forecast: ExtendedForecast | null;
  onTimeChange?: (timestamp: string, forecastData: AIForecastResult) => void;
}

interface ForecastPoint {
  lat: number;
  lon: number;
  data: AIForecastResult;
  radius: number;
}

// Color mapping for AQI values
const getAQIColor = (aqi: number): string => {
  if (aqi <= 50) return '#10b981'; // Good - Green
  if (aqi <= 100) return '#f59e0b'; // Moderate - Yellow
  if (aqi <= 150) return '#f97316'; // Unhealthy for Sensitive - Orange
  if (aqi <= 200) return '#ef4444'; // Unhealthy - Red
  if (aqi <= 300) return '#dc2626'; // Very Unhealthy - Dark Red
  return '#7c2d12'; // Hazardous - Maroon
};

// Get AQI category name
const getAQICategory = (aqi: number): string => {
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Moderate';
  if (aqi <= 150) return 'Unhealthy for Sensitive';
  if (aqi <= 200) return 'Unhealthy';
  if (aqi <= 300) return 'Very Unhealthy';
  return 'Hazardous';
};

// Component to handle map updates
const MapUpdater: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, zoom);
  }, [map, center, zoom]);
  
  return null;
};

const AnimatedForecastMap: React.FC<AnimatedForecastMapProps> = ({
  center,
  zoom = 10,
  forecast,
  onTimeChange
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTimeIndex, setCurrentTimeIndex] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1000); // ms per frame
  const [selectedParameter, setSelectedParameter] = useState<'aqi' | 'pm25' | 'no2' | 'o3'>('aqi');
  const [showGrid, setShowGrid] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const hourlyData = forecast?.hourly || [];
  const maxTimeIndex = hourlyData.length - 1;

  // Generate forecast points in a grid around the center location
  const generateForecastGrid = (centerData: AIForecastResult): ForecastPoint[] => {
    const points: ForecastPoint[] = [];
    const gridSize = 5; // 5x5 grid
    const spread = 0.05; // degrees
    
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        const latOffset = (i - Math.floor(gridSize / 2)) * spread;
        const lonOffset = (j - Math.floor(gridSize / 2)) * spread;
        
        // Add some variation to make it more realistic
        const variation = 0.8 + Math.random() * 0.4; // 0.8 to 1.2 multiplier
        const aqiVariation = Math.round(centerData.aqi * variation);
        
        const point: ForecastPoint = {
          lat: center[0] + latOffset,
          lon: center[1] + lonOffset,
          data: {
            ...centerData,
            aqi: Math.max(10, aqiVariation),
            pollutants: {
              ...centerData.pollutants,
              pm25: { ...centerData.pollutants.pm25, value: centerData.pollutants.pm25.value * variation },
              no2: { ...centerData.pollutants.no2, value: centerData.pollutants.no2.value * variation },
              o3: { ...centerData.pollutants.o3, value: centerData.pollutants.o3.value * variation }
            }
          },
          radius: 8 + (aqiVariation / 50) * 5 // Radius based on AQI
        };
        
        points.push(point);
      }
    }
    
    return points;
  };

  const currentForecastData = hourlyData[currentTimeIndex];
  const forecastPoints = currentForecastData ? generateForecastGrid(currentForecastData) : [];

  // Animation controls
  useEffect(() => {
    if (isPlaying && hourlyData.length > 0) {
      intervalRef.current = setInterval(() => {
        setCurrentTimeIndex(prev => {
          const next = prev + 1;
          if (next > maxTimeIndex) {
            setIsPlaying(false);
            return 0; // Loop back to start
          }
          return next;
        });
      }, playbackSpeed);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, playbackSpeed, maxTimeIndex, hourlyData.length]);

  // Notify parent of time changes
  useEffect(() => {
    if (currentForecastData && onTimeChange) {
      onTimeChange(currentForecastData.timestamp, currentForecastData);
    }
  }, [currentTimeIndex, currentForecastData, onTimeChange]);

  const handlePlay = () => setIsPlaying(!isPlaying);
  const handleStepForward = () => setCurrentTimeIndex(Math.min(currentTimeIndex + 1, maxTimeIndex));
  const handleStepBack = () => setCurrentTimeIndex(Math.max(currentTimeIndex - 1, 0));
  const handleReset = () => {
    setCurrentTimeIndex(0);
    setIsPlaying(false);
  };

  const getParameterValue = (point: ForecastPoint): number => {
    switch (selectedParameter) {
      case 'aqi': return point.data.aqi;
      case 'pm25': return point.data.pollutants.pm25.value;
      case 'no2': return point.data.pollutants.no2.value;
      case 'o3': return point.data.pollutants.o3.value;
      default: return point.data.aqi;
    }
  };

  const getParameterColor = (point: ForecastPoint): string => {
    const value = getParameterValue(point);
    
    if (selectedParameter === 'aqi') {
      return getAQIColor(value);
    }
    
    // Color mapping for other parameters
    const normalizedValue = Math.min(value / 100, 1); // Normalize to 0-1
    const hue = (1 - normalizedValue) * 120; // Green to Red
    return `hsl(${hue}, 70%, 50%)`;
  };

  if (!forecast || hourlyData.length === 0) {
    return (
      <div className="relative w-full h-full bg-kraken-dark rounded-lg overflow-hidden border border-kraken-beige border-opacity-20 flex items-center justify-center">
        <div className="text-center">
          <Activity className="w-12 h-12 text-kraken-beige mx-auto mb-4 opacity-50" />
          <div className="text-kraken-beige font-mono text-sm mb-2">No forecast data available</div>
          <div className="text-kraken-light font-mono text-xs">
            Generate an AI forecast to see animated predictions
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-kraken-dark rounded-lg overflow-hidden border border-kraken-beige border-opacity-20">
      {/* Map Container */}
      <MapContainer
        center={center}
        zoom={zoom}
        className="w-full h-full"
        zoomControl={true}
        attributionControl={false}
        style={{ position: 'relative', zIndex: 1 }}
      >
        <MapUpdater center={center} zoom={zoom} />
        
        {/* Base Tile Layer */}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          opacity={0.6}
        />

        {/* Forecast Points */}
        {showGrid && forecastPoints.map((point, index) => (
          <CircleMarker
            key={index}
            center={[point.lat, point.lon]}
            radius={point.radius}
            fillColor={getParameterColor(point)}
            color={getParameterColor(point)}
            weight={2}
            opacity={0.8}
            fillOpacity={0.6}
          >
            <Popup>
              <div className="p-2 font-mono text-sm">
                <div className="font-bold mb-2">
                  {new Date(point.data.timestamp).toLocaleString()}
                </div>
                <div className="space-y-1">
                  <div>AQI: <span className="font-bold">{point.data.aqi}</span> ({getAQICategory(point.data.aqi)})</div>
                  <div>PM2.5: {point.data.pollutants.pm25.value.toFixed(1)} μg/m³</div>
                  <div>NO₂: {point.data.pollutants.no2.value.toFixed(1)} ppb</div>
                  <div>O₃: {point.data.pollutants.o3.value.toFixed(1)} ppb</div>
                  <div>Confidence: {(point.data.confidence * 100).toFixed(0)}%</div>
                </div>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>

      {/* Time Display */}
      <div className="absolute top-4 left-4 bg-black bg-opacity-80 rounded-lg p-3 border border-kraken-beige border-opacity-30 z-[1000]">
        <div className="flex items-center space-x-2 text-white font-mono">
          <Clock className="w-5 h-5 text-kraken-beige" />
          <div>
            <div className="text-sm font-bold">
              {currentForecastData ? new Date(currentForecastData.timestamp).toLocaleString() : 'No Data'}
            </div>
            <div className="text-xs opacity-70">
              Hour {currentTimeIndex + 1} of {hourlyData.length}
            </div>
          </div>
        </div>
      </div>

      {/* Current Values Display */}
      {currentForecastData && (
        <div className="absolute top-4 right-4 bg-black bg-opacity-80 rounded-lg p-3 border border-kraken-beige border-opacity-30 z-[1000]">
          <div className="text-white font-mono text-sm">
            <div className="flex items-center space-x-2 mb-2">
              <div 
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: getAQIColor(currentForecastData.aqi) }}
              />
              <span className="font-bold">AQI: {currentForecastData.aqi}</span>
            </div>
            <div className="text-xs space-y-1 opacity-90">
              <div>PM2.5: {currentForecastData.pollutants.pm25.value.toFixed(1)} μg/m³</div>
              <div>NO₂: {currentForecastData.pollutants.no2.value.toFixed(1)} ppb</div>
              <div>O₃: {currentForecastData.pollutants.o3.value.toFixed(1)} ppb</div>
              <div>Confidence: {(currentForecastData.confidence * 100).toFixed(0)}%</div>
            </div>
          </div>
        </div>
      )}

      {/* Animation Controls */}
      <div className="absolute bottom-4 left-4 right-4 bg-black bg-opacity-80 rounded-lg p-4 border border-kraken-beige border-opacity-30 z-[1000]">
        <div className="flex items-center justify-between mb-3">
          {/* Playback Controls */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handleReset}
              className="p-2 bg-kraken-beige bg-opacity-20 hover:bg-opacity-30 rounded text-white transition-colors"
              title="Reset to start"
            >
              <SkipBack className="w-4 h-4" />
            </button>
            <button
              onClick={handleStepBack}
              disabled={currentTimeIndex === 0}
              className="p-2 bg-kraken-beige bg-opacity-20 hover:bg-opacity-30 rounded text-white transition-colors disabled:opacity-50"
              title="Step back"
            >
              <SkipBack className="w-4 h-4" />
            </button>
            <button
              onClick={handlePlay}
              className="p-2 bg-kraken-beige bg-opacity-30 hover:bg-opacity-40 rounded text-white transition-colors"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </button>
            <button
              onClick={handleStepForward}
              disabled={currentTimeIndex === maxTimeIndex}
              className="p-2 bg-kraken-beige bg-opacity-20 hover:bg-opacity-30 rounded text-white transition-colors disabled:opacity-50"
              title="Step forward"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>

          {/* Parameter Selection */}
          <div className="flex items-center space-x-2">
            <span className="text-white font-mono text-sm">Parameter:</span>
            <select
              value={selectedParameter}
              onChange={(e) => setSelectedParameter(e.target.value as any)}
              className="bg-kraken-dark border border-kraken-beige border-opacity-20 rounded px-2 py-1 text-kraken-light font-mono text-sm"
            >
              <option value="aqi">AQI</option>
              <option value="pm25">PM2.5</option>
              <option value="no2">NO₂</option>
              <option value="o3">O₃</option>
            </select>
          </div>

          {/* Speed Control */}
          <div className="flex items-center space-x-2">
            <span className="text-white font-mono text-sm">Speed:</span>
            <select
              value={playbackSpeed}
              onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
              className="bg-kraken-dark border border-kraken-beige border-opacity-20 rounded px-2 py-1 text-kraken-light font-mono text-sm"
            >
              <option value={2000}>0.5x</option>
              <option value={1000}>1x</option>
              <option value={500}>2x</option>
              <option value={250}>4x</option>
            </select>
          </div>

          {/* Grid Toggle */}
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`flex items-center space-x-1 px-3 py-1 rounded font-mono text-sm transition-colors ${
              showGrid 
                ? 'bg-kraken-beige text-kraken-dark' 
                : 'bg-kraken-beige bg-opacity-20 text-white hover:bg-opacity-30'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>Grid</span>
          </button>
        </div>

        {/* Progress Bar */}
        <div className="relative">
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-kraken-beige h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentTimeIndex + 1) / hourlyData.length) * 100}%` }}
            />
          </div>
          <input
            type="range"
            min={0}
            max={maxTimeIndex}
            value={currentTimeIndex}
            onChange={(e) => setCurrentTimeIndex(Number(e.target.value))}
            className="absolute inset-0 w-full h-2 opacity-0 cursor-pointer"
          />
        </div>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-black bg-opacity-80 rounded-lg p-3 border border-kraken-beige border-opacity-30 z-[999]">
        <div className="text-white font-mono text-xs">
          <div className="font-bold mb-2 flex items-center space-x-1">
            <Zap className="w-3 h-3" />
            <span>AQI Scale</span>
          </div>
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#10b981' }}></div>
              <span>0-50 Good</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#f59e0b' }}></div>
              <span>51-100 Moderate</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#f97316' }}></div>
              <span>101-150 Unhealthy</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#ef4444' }}></div>
              <span>151+ Very Unhealthy</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimatedForecastMap;
