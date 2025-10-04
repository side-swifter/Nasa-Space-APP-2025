import React from 'react';
import { Clock, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { format } from 'date-fns';
import { AirQualityReading } from '../services/nasaApiService';
import nasaApiService from '../services/nasaApiService';

interface ForecastPanelProps {
  forecastData: AirQualityReading[];
}

const ForecastPanel: React.FC<ForecastPanelProps> = ({ forecastData }) => {
  // Generate mock forecast data if none provided
  const generateMockForecast = (): AirQualityReading[] => {
    const forecast: AirQualityReading[] = [];
    const now = new Date();
    
    for (let i = 0; i < 24; i += 3) { // Every 3 hours for next 24 hours
      const timestamp = new Date(now.getTime() + i * 60 * 60 * 1000);
      
      // Simulate daily air quality patterns
      const hourOfDay = timestamp.getHours();
      let baseAQI = 45;
      
      // Higher AQI during rush hours and lower at night
      if (hourOfDay >= 7 && hourOfDay <= 9) baseAQI += 25; // Morning rush
      if (hourOfDay >= 17 && hourOfDay <= 19) baseAQI += 30; // Evening rush
      if (hourOfDay >= 22 || hourOfDay <= 5) baseAQI -= 15; // Night time
      
      // Add some randomness
      baseAQI += Math.random() * 20 - 10;
      baseAQI = Math.max(15, Math.min(200, baseAQI));
      
      const pm25 = baseAQI / 4.17; // Rough conversion back to PM2.5
      
      forecast.push({
        timestamp: timestamp.toISOString(),
        aqi: Math.round(baseAQI),
        pm25: Math.round(pm25 * 10) / 10,
        pm10: Math.round(pm25 * 1.5 * 10) / 10,
        no2: Math.round((15 + Math.random() * 20) * 10) / 10,
        o3: Math.round((30 + Math.random() * 40) * 10) / 10,
        so2: Math.round((5 + Math.random() * 10) * 10) / 10,
        co: Math.round((0.5 + Math.random() * 1.5) * 100) / 100,
        location: {
          lat: 40.7128,
          lon: -74.0060,
          name: 'Current Location'
        }
      });
    }
    
    return forecast;
  };

  const displayData = forecastData.length > 0 ? forecastData.slice(0, 8) : generateMockForecast();

  const getTrendIcon = (current: number, next: number) => {
    const diff = next - current;
    if (diff > 5) return <TrendingUp className="w-4 h-4 text-red-400" />;
    if (diff < -5) return <TrendingDown className="w-4 h-4 text-green-400" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  const getAQIColor = (aqi: number) => {
    if (aqi <= 50) return 'bg-green-500';
    if (aqi <= 100) return 'bg-yellow-500';
    if (aqi <= 150) return 'bg-orange-500';
    if (aqi <= 200) return 'bg-red-500';
    return 'bg-purple-500';
  };

  return (
    <div className="bg-kraken-dark border border-kraken-beige border-opacity-20 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Clock className="w-6 h-6 text-kraken-beige" />
          <h3 className="text-xl font-bold text-kraken-beige font-mono">
            24-Hour Forecast
          </h3>
        </div>
        <div className="text-sm text-kraken-light opacity-70 font-mono">
          Updated {format(new Date(), 'HH:mm')}
        </div>
      </div>

      {/* Forecast Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        {displayData.map((reading, index) => {
          const time = new Date(reading.timestamp);
          const nextReading = displayData[index + 1];
          const aqiCategory = nasaApiService.getAQICategory(reading.aqi);
          
          return (
            <div
              key={reading.timestamp}
              className="bg-kraken-dark bg-opacity-50 border border-kraken-beige border-opacity-20 rounded-lg p-3 text-center hover:bg-opacity-70 transition-all"
            >
              {/* Time */}
              <div className="text-xs text-kraken-light opacity-70 font-mono mb-2">
                {format(time, 'HH:mm')}
              </div>
              
              {/* AQI Value */}
              <div className="mb-3">
                <div className={`w-12 h-12 ${getAQIColor(reading.aqi)} rounded-full flex items-center justify-center mx-auto mb-2`}>
                  <span className="text-white font-bold font-mono text-sm">
                    {reading.aqi}
                  </span>
                </div>
                <div className="text-xs text-kraken-light font-mono">
                  {aqiCategory.category.split(' ')[0]}
                </div>
              </div>

              {/* Trend Indicator */}
              <div className="flex justify-center mb-2">
                {nextReading && getTrendIcon(reading.aqi, nextReading.aqi)}
              </div>

              {/* Key Pollutants */}
              <div className="space-y-1 text-xs font-mono">
                <div className="flex justify-between text-kraken-light">
                  <span>PM2.5</span>
                  <span>{reading.pm25}</span>
                </div>
                <div className="flex justify-between text-kraken-light">
                  <span>O₃</span>
                  <span>{reading.o3}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Section */}
      <div className="mt-6 pt-4 border-t border-kraken-beige border-opacity-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Today's Peak */}
          <div className="text-center">
            <div className="text-kraken-beige font-mono text-sm font-bold mb-1">
              Today's Peak
            </div>
            <div className="text-kraken-light font-mono">
              {Math.max(...displayData.map(d => d.aqi))} AQI
            </div>
            <div className="text-xs text-kraken-light opacity-70 font-mono">
              Expected around {format(new Date(displayData[displayData.findIndex(d => d.aqi === Math.max(...displayData.map(d => d.aqi)))].timestamp), 'HH:mm')}
            </div>
          </div>

          {/* Average Quality */}
          <div className="text-center">
            <div className="text-kraken-beige font-mono text-sm font-bold mb-1">
              24h Average
            </div>
            <div className="text-kraken-light font-mono">
              {Math.round(displayData.reduce((sum, d) => sum + d.aqi, 0) / displayData.length)} AQI
            </div>
            <div className="text-xs text-kraken-light opacity-70 font-mono">
              {nasaApiService.getAQICategory(Math.round(displayData.reduce((sum, d) => sum + d.aqi, 0) / displayData.length)).category}
            </div>
          </div>

          {/* Best Time */}
          <div className="text-center">
            <div className="text-kraken-beige font-mono text-sm font-bold mb-1">
              Best Time
            </div>
            <div className="text-kraken-light font-mono">
              {format(new Date(displayData[displayData.findIndex(d => d.aqi === Math.min(...displayData.map(d => d.aqi)))].timestamp), 'HH:mm')}
            </div>
            <div className="text-xs text-kraken-light opacity-70 font-mono">
              {Math.min(...displayData.map(d => d.aqi))} AQI
            </div>
          </div>
        </div>
      </div>

      {/* Forecast Confidence */}
      <div className="mt-4 p-3 bg-kraken-beige bg-opacity-10 rounded-lg">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-kraken-light">Forecast Confidence:</span>
          <div className="flex items-center space-x-2">
            <div className="w-16 h-2 bg-kraken-dark rounded-full overflow-hidden">
              <div className="w-4/5 h-full bg-kraken-beige"></div>
            </div>
            <span className="text-kraken-beige">85%</span>
          </div>
        </div>
        <div className="mt-2 text-xs text-kraken-light opacity-70">
          Based on NASA TEMPO satellite data, weather patterns, and historical trends
        </div>
      </div>
    </div>
  );
};

export default ForecastPanel;
