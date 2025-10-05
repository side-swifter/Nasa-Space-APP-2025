import React, { useState, useEffect } from 'react';
import { Map,AlertCircle, Thermometer, Wind, Eye, Droplets, Brain, Clock } from 'lucide-react';
import AirQualityMap from '../components/AirQualityMap';
import AirQualityChart from '../components/AirQualityChart';
import MetricCard from '../components/MetricCard';
import AlertPanel from '../components/AlertPanel';
import ForecastPanel from '../components/ForecastPanel';
import AIForecastPanel from '../components/AIForecastPanel';
import AnimatedForecastMap from '../components/AnimatedForecastMap';
import TemporalNASAMap from '../components/TemporalNASAMap';
import nasaApiService, { AirQualityReading } from '../services/nasaApiService';
import realAirQualityService from '../services/realAirQualityService';
import locationService from '../services/locationService';
import { ExtendedForecast, AIForecastResult } from '../services/aiForecastingService';

const Dashboard: React.FC = () => {
  const [currentLocation, setCurrentLocation] = useState({ lat: 40.7128, lon: -74.0060 }); // Default to NYC
  const [currentAirQuality, setCurrentAirQuality] = useState<AirQualityReading | null>(null);
  const [historicalData, setHistoricalData] = useState<AirQualityReading[]>([]);
  const [forecastData, setForecastData] = useState<AirQualityReading[]>([]);
  const [aiForecast, setAiForecast] = useState<ExtendedForecast | null>(null);
  const [currentForecastTime, setCurrentForecastTime] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'forecast' | 'ai-forecast' | 'temporal'>('overview');

  useEffect(() => {
    // Get user's location with city name
    const getUserLocation = async () => {
      try {
        console.log('🔍 Getting user location...');
        const location = await locationService.getCurrentLocationInfo();
        console.log('📍 Location found:', location);
        setCurrentLocation({
          lat: location.lat,
          lon: location.lon,
        });
      } catch (error) {
        console.warn('Location service error:', error);
        // Keep default location (NYC)
      }
    };

    getUserLocation();
  }, []);

  useEffect(() => {
    const fetchRealAirQualityData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log('🌍 Fetching real air quality data for location:', currentLocation);
        
        // Fetch current air quality data
        const current = await realAirQualityService.getCurrentAirQuality(
          currentLocation.lat, 
          currentLocation.lon
        );
        
        if (current) {
          setCurrentAirQuality(current);
          console.log('✅ Current air quality data loaded:', current);
        } else {
          console.log('⚠️ No current air quality data available, using fallback');
          // Fallback to NASA mock data if no real data available
          const fallbackCurrent = await nasaApiService.getCurrentAirQuality(
            currentLocation.lat, 
            currentLocation.lon
          );
          setCurrentAirQuality(fallbackCurrent);
        }

        // Fetch historical data
        console.log('📈 Fetching historical air quality data...');
        const historical = await realAirQualityService.getHistoricalAirQuality(
          currentLocation.lat, 
          currentLocation.lon, 
          7
        );
        
        if (historical.length > 0) {
          setHistoricalData(historical);
          console.log(`✅ Historical data loaded: ${historical.length} points`);
        } else {
          // Fallback to NASA mock historical data
          const fallbackHistorical = await nasaApiService.getHistoricalAirQuality(
            currentLocation.lat, 
            currentLocation.lon, 
            7
          );
          setHistoricalData(fallbackHistorical);
          console.log('⚠️ Using fallback historical data');
        }

        // Fetch forecast data
        console.log('🔮 Fetching air quality forecast...');
        const forecast = await realAirQualityService.getAirQualityForecast(
          currentLocation.lat, 
          currentLocation.lon
        );
        
        if (forecast.length > 0) {
          setForecastData(forecast);
          console.log(`✅ Forecast data loaded: ${forecast.length} points`);
        } else {
          // Fallback to NASA mock forecast data
          const fallbackForecast = await nasaApiService.getAirQualityForecast(
            currentLocation.lat, 
            currentLocation.lon
          );
          setForecastData(fallbackForecast);
          console.log('⚠️ Using fallback forecast data');
        }

      } catch (err) {
        console.error('❌ Error fetching air quality data:', err);
        setError('Failed to load air quality data. Please check your internet connection and try again.');
        
        // Try fallback to NASA service as last resort
        try {
          console.log('🔄 Attempting fallback to NASA service...');
          const fallbackCurrent = await nasaApiService.getCurrentAirQuality(
            currentLocation.lat, 
            currentLocation.lon
          );
          setCurrentAirQuality(fallbackCurrent);
          setError(null); // Clear error if fallback works
        } catch (fallbackErr) {
          console.error('❌ Fallback also failed:', fallbackErr);
        }
      } finally {
        setLoading(false);
      }
    };

    // Fetch data when location changes
    if (currentLocation.lat !== 0 || currentLocation.lon !== 0) {
      fetchRealAirQualityData();
    }
  }, [currentLocation]); // Depend on currentLocation to refetch when location changes

  const handleLocationChange = async (lat: number, lon: number) => {
    setCurrentLocation({ lat, lon });
    
    // Update location info for the new coordinates
    try {
      await locationService.reverseGeocode(lat, lon);
    } catch (error) {
      console.warn('Failed to get location info for new coordinates:', error);
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
    ? realAirQualityService.getAQICategory(currentAirQuality.aqi)
    : { name: 'Unknown', color: '#6b7280', description: 'No data available' };

  return (
    <div className="space-y-8">

      {/* Enhanced AQI Hero Section - Kraken Theme */}
      {currentAirQuality && (
        <div className="relative bg-kraken-dark rounded-2xl p-8 border-2 border-kraken-beige border-opacity-40 shadow-2xl overflow-hidden">
          {/* Subtle background pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-kraken-beige/5 via-transparent to-kraken-red/5"></div>
          
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            {/* Main AQI Display */}
            <div className="lg:col-span-1 flex flex-col justify-center text-center h-full">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-kraken-beige font-mono mb-2 tracking-wider">
                  AIR QUALITY INDEX
                </h2>
                <div className="h-px bg-gradient-to-r from-transparent via-kraken-beige to-transparent opacity-50"></div>
              </div>
              
              {/* AQI Number Display - No Circle */}
              <div className="flex flex-col items-center justify-center">
                <div 
                  className="text-6xl font-bold font-mono mb-4"
                  style={{ color: aqiCategory.color }}
                >
                  {currentAirQuality.aqi}
                </div>
                
                {/* Category Label */}
                <div 
                  className="text-lg font-mono font-bold mb-2 tracking-wide"
                  style={{ color: aqiCategory.color }}
                >
                  {aqiCategory.name.toUpperCase()}
                </div>
                <div className="text-xs text-kraken-light opacity-80 font-mono max-w-xs mx-auto leading-relaxed mb-4">
                  {aqiCategory.description}
                </div>
              </div>
              
              <div className="text-xs text-kraken-beige opacity-70 font-mono">
                Updated: {new Date(currentAirQuality.timestamp).toLocaleTimeString()}
              </div>
            </div>

            {/* Key Pollutants Grid */}
            <div className="lg:col-span-2">
              <div className="mb-4">
                <h3 className="text-lg font-bold text-kraken-beige font-mono tracking-wider">POLLUTANT LEVELS</h3>
                <div className="h-px bg-gradient-to-r from-kraken-beige via-kraken-beige/50 to-transparent mt-2"></div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-kraken-dark border border-kraken-beige border-opacity-30 rounded-xl p-4 text-center hover:border-opacity-50 transition-all duration-300">
                  <div className="text-2xl font-bold text-kraken-beige font-mono mb-1">
                    {currentAirQuality.pm25.toFixed(1)}
                  </div>
                  <div className="text-sm text-kraken-light font-mono opacity-90">PM2.5</div>
                  <div className="text-xs text-kraken-light opacity-60 font-mono">μg/m³</div>
                  <div className="text-xs text-kraken-beige opacity-70 font-mono mt-1">Fine Particles</div>
                </div>
                
                <div className="bg-kraken-dark border border-kraken-beige border-opacity-30 rounded-xl p-4 text-center hover:border-opacity-50 transition-all duration-300">
                  <div className="text-2xl font-bold text-kraken-beige font-mono mb-1">
                    {currentAirQuality.pm10.toFixed(1)}
                  </div>
                  <div className="text-sm text-kraken-light font-mono opacity-90">PM10</div>
                  <div className="text-xs text-kraken-light opacity-60 font-mono">μg/m³</div>
                  <div className="text-xs text-kraken-beige opacity-70 font-mono mt-1">Coarse Particles</div>
                </div>
                
                <div className="bg-kraken-dark border border-kraken-beige border-opacity-30 rounded-xl p-4 text-center hover:border-opacity-50 transition-all duration-300">
                  <div className="text-2xl font-bold text-kraken-beige font-mono mb-1">
                    {currentAirQuality.no2.toFixed(1)}
                  </div>
                  <div className="text-sm text-kraken-light font-mono opacity-90">NO₂</div>
                  <div className="text-xs text-kraken-light opacity-60 font-mono">ppb</div>
                  <div className="text-xs text-kraken-beige opacity-70 font-mono mt-1">Nitrogen Dioxide</div>
                </div>
                
                <div className="bg-kraken-dark border border-kraken-beige border-opacity-30 rounded-xl p-4 text-center hover:border-opacity-50 transition-all duration-300">
                  <div className="text-2xl font-bold text-kraken-beige font-mono mb-1">
                    {currentAirQuality.o3.toFixed(1)}
                  </div>
                  <div className="text-sm text-kraken-light font-mono opacity-90">O₃</div>
                  <div className="text-xs text-kraken-light opacity-60 font-mono">ppb</div>
                  <div className="text-xs text-kraken-beige opacity-70 font-mono mt-1">Ground Ozone</div>
                </div>
              </div>
              
              {/* NASA TEMPO Badge */}
              <div className="mt-4 flex items-center justify-center">
                <div className="bg-kraken-beige bg-opacity-10 border border-kraken-beige border-opacity-30 rounded-full px-4 py-2 flex items-center space-x-2">
                  <div className="w-2 h-2 bg-kraken-beige rounded-full animate-pulse"></div>
                  <span className="text-xs text-kraken-beige font-mono font-bold tracking-wider">LIVE NASA TEMPO DATA</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Alert Panel with AI Insights */}
      <AlertPanel 
        currentAirQuality={currentAirQuality} 
        forecastData={forecastData}
      />

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-kraken-dark border border-kraken-beige border-opacity-20 rounded-lg p-1">
        {[
          { key: 'overview', label: 'Overview', icon: Map },
          { key: 'temporal', label: 'Time-Lapse Map', icon: Clock },
          { key: 'forecast', label: 'Standard Forecast', icon: Eye },
          { key: 'ai-forecast', label: 'AI Forecast', icon: Brain }
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key as any)}
            className={`flex items-center space-x-2 px-3 py-2 rounded font-mono text-sm transition-colors ${
              activeTab === key
                ? 'bg-kraken-beige text-kraken-dark'
                : 'text-kraken-light hover:bg-kraken-beige hover:bg-opacity-10'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <>
          {/* Large Interactive Map Section */}
          <div className="bg-kraken-dark rounded-xl border border-kraken-beige border-opacity-20 shadow-lg overflow-hidden">
            <div className="p-6 border-b border-kraken-beige border-opacity-20 bg-gradient-to-r from-kraken-dark to-kraken-dark/80">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-kraken-light font-mono mb-2">NASA Air Quality Map</h3>
                  <p className="text-kraken-light opacity-70 font-mono text-sm">
                    Live satellite data • Interactive layers • Real-time monitoring
                  </p>
                </div>
                <div className="text-right">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-kraken-beige bg-opacity-20">
                    <Map className="w-8 h-8 text-kraken-beige" />
                  </div>
                </div>
              </div>
            </div>
            <div className="p-0">
              <div className="h-[600px]">
                <AirQualityMap 
                  currentLocation={currentLocation}
                  onLocationChange={handleLocationChange}
                />
              </div>
            </div>
          </div>

          {/* Secondary Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Historical Chart - Takes up 3 columns */}
            <div className="lg:col-span-3 bg-kraken-dark rounded-xl border border-kraken-beige border-opacity-20 shadow-lg">
              <div className="p-6 border-b border-kraken-beige border-opacity-20">
                <h3 className="text-xl font-bold text-kraken-light font-mono">Historical Trends (7 Days)</h3>
                <p className="text-kraken-light opacity-70 font-mono text-sm mt-1">
                  Track air quality changes over time
                </p>
              </div>
              <div className="p-6">
                <AirQualityChart data={historicalData} />
              </div>
            </div>

            {/* Compact Metrics - Takes up 1 column */}
            <div className="space-y-4">
              <MetricCard
                title="NO₂"
                value={currentAirQuality?.no2 || 0}
                unit="ppb"
                icon={<Wind className="w-5 h-5" />}
                color="text-blue-400"
                dataType="no2"
              />
              <MetricCard
                title="O₃"
                value={currentAirQuality?.o3 || 0}
                unit="ppb"
                icon={<Eye className="w-5 h-5" />}
                color="text-green-400"
                dataType="o3"
              />
              <MetricCard
                title="SO₂"
                value={currentAirQuality?.so2 || 0}
                unit="ppb"
                icon={<Droplets className="w-5 h-5" />}
                color="text-purple-400"
                dataType="so2"
              />
              <MetricCard
                title="CO"
                value={currentAirQuality?.co || 0}
                unit="ppm"
                icon={<Thermometer className="w-5 h-5" />}
                color="text-orange-400"
                dataType="co"
              />
            </div>
          </div>
        </>
      )}

      {activeTab === 'temporal' && (
        <div className="bg-kraken-dark border border-kraken-beige border-opacity-20 rounded-lg overflow-hidden">
          <div className="p-4 border-b border-kraken-beige border-opacity-20">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-kraken-light font-mono">Weather Channel Style Time-Lapse</h3>
                <p className="text-kraken-light opacity-70 font-mono text-sm mt-1">
                  Watch air quality patterns move across time • NASA satellite data • Multiple layers
                </p>
              </div>
              <div className="text-right">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-kraken-beige bg-opacity-20">
                  <Clock className="w-6 h-6 text-kraken-beige" />
                </div>
              </div>
            </div>
          </div>
          <div className="h-[700px]">
            <TemporalNASAMap
              center={[currentLocation.lat, currentLocation.lon]}
              zoom={6}
            />
          </div>
        </div>
      )}

      {activeTab === 'forecast' && (
        <ForecastPanel forecastData={forecastData} />
      )}

      {activeTab === 'ai-forecast' && (
        <div className="space-y-6">
          {/* AI Forecast Panel */}
          <AIForecastPanel
            lat={currentLocation.lat}
            lon={currentLocation.lon}
            onForecastGenerated={(forecast) => {
              console.log('🤖 AI forecast generated:', forecast);
              setAiForecast(forecast);
            }}
          />
          
          {/* Animated Forecast Map */}
          {aiForecast && (
            <div className="bg-kraken-dark border border-kraken-beige border-opacity-20 rounded-lg overflow-hidden">
              <div className="p-4 border-b border-kraken-beige border-opacity-20">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-kraken-light font-mono">Animated Forecast Visualization</h3>
                    <p className="text-kraken-light opacity-70 font-mono text-sm mt-1">
                      Watch air quality changes over time • Color-coded predictions • Interactive playback
                    </p>
                  </div>
                  {currentForecastTime && (
                    <div className="text-right">
                      <div className="text-kraken-beige font-mono text-sm">
                        Current: {new Date(currentForecastTime).toLocaleString()}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="h-[600px]">
                <AnimatedForecastMap
                  center={[currentLocation.lat, currentLocation.lon]}
                  zoom={10}
                  forecast={aiForecast}
                  onTimeChange={(timestamp: string, forecastData: AIForecastResult) => {
                    setCurrentForecastTime(timestamp);
                    console.log('🕒 Forecast time changed:', timestamp, forecastData);
                  }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Data Sources */}
      <div className="bg-kraken-dark border border-kraken-beige border-opacity-20 rounded-lg p-6">
        <h4 className="text-kraken-beige font-mono font-bold mb-4 text-lg">Real-Time Data Sources</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-kraken-light font-mono">
          {realAirQualityService.getDataSources().map((source, index) => (
            <div key={index} className="flex items-start space-x-3">
              <div className={`w-2 h-2 rounded-full mt-2 ${source.available ? 'bg-green-400' : 'bg-red-400'}`}></div>
              <div>
                <strong className="text-kraken-beige">{source.name}:</strong> {source.description}
                <div className={`text-xs mt-1 ${source.available ? 'text-green-400' : 'text-red-400'}`}>
                  {source.available ? '✓ Active' : '✗ Unavailable'}
                </div>
              </div>
            </div>
          ))}
          
          {/* NASA LANCE Sources */}
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 rounded-full mt-2 bg-green-400"></div>
            <div>
              <strong className="text-kraken-beige">NASA LANCE:</strong> Near real-time satellite data (3hr latency)
              <div className="text-xs mt-1 text-green-400">✓ Active</div>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 rounded-full mt-2 bg-green-400"></div>
            <div>
              <strong className="text-kraken-beige">Ground Validation:</strong> Cross-validation with ground stations
              <div className="text-xs mt-1 text-green-400">✓ Active</div>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 rounded-full mt-2 bg-green-400"></div>
            <div>
              <strong className="text-kraken-beige">AI Forecasting:</strong> Claude-3 Opus enhanced predictions
              <div className="text-xs mt-1 text-green-400">✓ Active</div>
            </div>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-kraken-beige border-opacity-20">
          <p className="text-xs text-kraken-light opacity-70 font-mono">
            Data is fetched in real-time from EPA's AirNow network, NASA's TEMPO satellite, and NASA LANCE near real-time systems. 
            The LANCE tab provides satellite-ground validation and cross-checking capabilities.
            The AI Forecast tab uses Claude-3 Opus to analyze multiple NASA data sources for enhanced predictions.
            Fallback data is provided when real-time sources are unavailable.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
