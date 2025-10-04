import React, { useState, useEffect } from 'react';
import { MapPin, TrendingUp, AlertCircle, Thermometer, Wind, Eye, Droplets } from 'lucide-react';
import AirQualityMap from '../components/AirQualityMap';
import AirQualityChart from '../components/AirQualityChart';
import MetricCard from '../components/MetricCard';
import AlertPanel from '../components/AlertPanel';
import ForecastPanel from '../components/ForecastPanel';
import nasaApiService, { AirQualityReading } from '../services/nasaApiService';
import locationService, { LocationInfo } from '../services/locationService';

const Dashboard: React.FC = () => {
  const [currentLocation, setCurrentLocation] = useState({ lat: 40.7128, lon: -74.0060 }); // Default to NYC
  const [locationInfo, setLocationInfo] = useState<LocationInfo | null>(null);
  const [currentAirQuality, setCurrentAirQuality] = useState<AirQualityReading | null>(null);
  const [historicalData, setHistoricalData] = useState<AirQualityReading[]>([]);
  const [forecastData, setForecastData] = useState<AirQualityReading[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get user's location with city name
    const getUserLocation = async () => {
      try {
        console.log('🔍 Getting user location...');
        const location = await locationService.getCurrentLocationInfo();
        console.log('📍 Location found:', location);
        setLocationInfo(location);
        setCurrentLocation({
          lat: location.lat,
          lon: location.lon,
        });
      } catch (error) {
        console.warn('Location service error:', error);
        // Keep default location (NYC) and set basic info
        setLocationInfo({
          lat: 40.7128,
          lon: -74.0060,
          city: 'New York',
          state: 'NY',
          country: 'United States',
          displayName: 'New York, NY',
        });
      }
    };

    getUserLocation();
  }, []);

  useEffect(() => {
    const generateMockData = () => {
      setLoading(true);
      setError(null);
      
      // Simulate API delay
      setTimeout(() => {
        try {
          // Generate mock current air quality
          const mockCurrent: AirQualityReading = {
            timestamp: new Date().toISOString(),
            aqi: 65,
            pm25: 15.2,
            pm10: 22.8,
            no2: 18.5,
            o3: 45.3,
            so2: 7.1,
            co: 0.8,
            location: {
              lat: currentLocation.lat,
              lon: currentLocation.lon,
              name: `Location ${currentLocation.lat.toFixed(2)}, ${currentLocation.lon.toFixed(2)}`
            }
          };
          setCurrentAirQuality(mockCurrent);

          // Generate mock historical data (last 7 days)
          const mockHistorical: AirQualityReading[] = [];
          const now = new Date();
          for (let i = 167; i >= 0; i--) { // 7 days * 24 hours
            const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
            const baseAQI = 50 + Math.sin(i / 24 * Math.PI) * 20 + Math.random() * 30;
            const pm25 = baseAQI / 4.17;
            
            mockHistorical.push({
              timestamp: timestamp.toISOString(),
              aqi: Math.round(Math.max(15, Math.min(150, baseAQI))),
              pm25: Math.round(Math.max(5, pm25) * 10) / 10,
              pm10: Math.round(Math.max(8, pm25 * 1.5) * 10) / 10,
              no2: Math.round((15 + Math.random() * 20) * 10) / 10,
              o3: Math.round((30 + Math.random() * 40) * 10) / 10,
              so2: Math.round((5 + Math.random() * 10) * 10) / 10,
              co: Math.round((0.5 + Math.random() * 1.5) * 100) / 100,
              location: mockCurrent.location
            });
          }
          setHistoricalData(mockHistorical);

          // Generate mock forecast data (next 24 hours)
          const mockForecast: AirQualityReading[] = [];
          for (let i = 1; i <= 24; i++) {
            const timestamp = new Date(now.getTime() + i * 60 * 60 * 1000);
            const baseAQI = 60 + Math.sin(i / 12 * Math.PI) * 15 + Math.random() * 20;
            const pm25 = baseAQI / 4.17;
            
            mockForecast.push({
              timestamp: timestamp.toISOString(),
              aqi: Math.round(Math.max(20, Math.min(120, baseAQI))),
              pm25: Math.round(Math.max(5, pm25) * 10) / 10,
              pm10: Math.round(Math.max(8, pm25 * 1.5) * 10) / 10,
              no2: Math.round((15 + Math.random() * 20) * 10) / 10,
              o3: Math.round((30 + Math.random() * 40) * 10) / 10,
              so2: Math.round((5 + Math.random() * 10) * 10) / 10,
              co: Math.round((0.5 + Math.random() * 1.5) * 100) / 100,
              location: mockCurrent.location
            });
          }
          setForecastData(mockForecast);

        } catch (err) {
          setError('Failed to generate mock data. Please try again.');
          console.error('Error generating mock data:', err);
        } finally {
          setLoading(false);
        }
      }, 1000); // 1 second delay to simulate loading
    };

    generateMockData();
  }, [currentLocation]);

  const handleLocationChange = async (lat: number, lon: number) => {
    setCurrentLocation({ lat, lon });
    
    // Update location info for the new coordinates
    try {
      const newLocationInfo = await locationService.reverseGeocode(lat, lon);
      setLocationInfo(newLocationInfo);
    } catch (error) {
      console.warn('Failed to get location info for new coordinates:', error);
      // Update with basic coordinate info
      setLocationInfo({
        lat,
        lon,
        city: 'Unknown City',
        state: '',
        country: 'Unknown',
        displayName: `${lat.toFixed(4)}, ${lon.toFixed(4)}`,
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-kraken-beige mx-auto mb-4"></div>
          <p className="text-kraken-light font-mono">Loading air quality data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-kraken-red mx-auto mb-4" />
          <p className="text-kraken-light font-mono mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-kraken-red text-white rounded-lg font-mono hover:bg-opacity-80 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const aqiCategory = currentAirQuality 
    ? nasaApiService.getAQICategory(currentAirQuality.aqi)
    : { category: 'Unknown', color: '#6b7280', description: 'No data available' };

  return (
    <div className="space-y-6">
      {/* Location Header */}
      <div className="bg-kraken-dark border border-kraken-beige border-opacity-30 rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center justify-center w-16 h-16 bg-kraken-beige bg-opacity-20 rounded-full">
              <MapPin className="w-8 h-8 text-kraken-beige" />
            </div>
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <MapPin className="w-5 h-5 text-kraken-beige" />
                <h1 className="text-2xl font-bold text-kraken-light font-mono">
                  {locationInfo?.displayName || 'Loading Location...'}
                </h1>
              </div>
              <div className="flex items-center space-x-4 text-sm text-kraken-light opacity-70 font-mono">
                <span>
                  📍 {locationService.formatCoordinates(currentLocation.lat, currentLocation.lon)}
                </span>
                {locationInfo?.country && (
                  <span>🌍 {locationInfo.country}</span>
                )}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-kraken-light opacity-70 font-mono mb-1">
              Last Updated
            </div>
            <div className="text-kraken-beige font-mono text-lg font-bold">
              {new Date().toLocaleTimeString()}
            </div>
            <div className="text-xs text-kraken-light opacity-50 font-mono mt-1">
              Live NASA TEMPO Data
            </div>
          </div>
        </div>
        
        {/* Location Status */}
        <div className="mt-4 pt-4 border-t border-kraken-beige border-opacity-20">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6 text-xs font-mono">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-kraken-light">Location Services Active</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                <span className="text-kraken-light">Satellite Data Connected</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                <span className="text-kraken-light">Real-time Updates</span>
              </div>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="px-3 py-1 bg-kraken-beige bg-opacity-20 text-kraken-beige rounded font-mono text-xs hover:bg-opacity-30 transition-colors"
            >
              Refresh Location
            </button>
          </div>
        </div>
      </div>

      {/* Current AQI Banner */}
      {currentAirQuality && (
        <div 
          className="rounded-lg p-6 text-white font-mono"
          style={{ backgroundColor: aqiCategory.color }}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold mb-2">
                AQI {currentAirQuality.aqi}
              </div>
              <div className="text-xl mb-1">{aqiCategory.category}</div>
              <div className="opacity-90">{aqiCategory.description}</div>
            </div>
            <div className="text-right">
              <TrendingUp className="w-8 h-8 mb-2" />
              <div className="text-sm opacity-90">
                PM2.5: {currentAirQuality.pm25} μg/m³
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Alert Panel */}
      <AlertPanel currentAirQuality={currentAirQuality} />

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="NO₂"
          value={currentAirQuality?.no2 || 0}
          unit="ppb"
          icon={<Wind className="w-5 h-5" />}
          color="text-blue-400"
        />
        <MetricCard
          title="O₃"
          value={currentAirQuality?.o3 || 0}
          unit="ppb"
          icon={<Eye className="w-5 h-5" />}
          color="text-green-400"
        />
        <MetricCard
          title="PM2.5"
          value={currentAirQuality?.pm25 || 0}
          unit="μg/m³"
          icon={<Droplets className="w-5 h-5" />}
          color="text-purple-400"
        />
        <MetricCard
          title="PM10"
          value={currentAirQuality?.pm10 || 0}
          unit="μg/m³"
          icon={<Thermometer className="w-5 h-5" />}
          color="text-orange-400"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Map */}
        <div className="chart-container">
          <h3 className="text-lg font-bold text-kraken-light mb-4 font-mono">
            Air Quality Map
          </h3>
          <AirQualityMap 
            currentLocation={currentLocation}
            onLocationChange={handleLocationChange}
          />
        </div>

        {/* Historical Chart */}
        <div className="chart-container">
          <h3 className="text-lg font-bold text-kraken-light mb-4 font-mono">
            Historical Trends (7 Days)
          </h3>
          <AirQualityChart data={historicalData} />
        </div>
      </div>

      {/* Forecast Panel */}
      <ForecastPanel forecastData={forecastData} />

      {/* Data Sources */}
      <div className="bg-kraken-dark border border-kraken-beige border-opacity-20 rounded-lg p-4">
        <h4 className="text-kraken-beige font-mono font-bold mb-2">Data Sources</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-kraken-light font-mono">
          <div>
            <strong>NASA TEMPO:</strong> Satellite-based atmospheric measurements
          </div>
          <div>
            <strong>Ground Stations:</strong> Real-time air quality monitoring
          </div>
          <div>
            <strong>Weather Data:</strong> Meteorological conditions affecting air quality
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
