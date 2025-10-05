import airNowApiService, { ProcessedAirQualityData } from './airNowApiService';
import nasaApiService, { AirQualityReading, TempoData } from './nasaApiService';

/**
 * Combined Air Quality Service
 * Integrates real data from AirNow API and NASA TEMPO satellite data
 */
class RealAirQualityService {
  
  // Get comprehensive current air quality data
  async getCurrentAirQuality(lat: number, lon: number): Promise<AirQualityReading | null> {
    try {
      console.log('🌍 Fetching real air quality data for:', { lat, lon });
      
      // Try to get AirNow data first (more reliable for ground-level measurements)
      let airNowData: ProcessedAirQualityData | null = null;
      
      if (airNowApiService.isConfigured()) {
        try {
          console.log('📡 Fetching AirNow observations...');
          const observations = await airNowApiService.getCurrentObservations(lat, lon);
          airNowData = airNowApiService.processAirNowData(observations, lat, lon);
          
          if (airNowData) {
            console.log('✅ AirNow data retrieved successfully:', airNowData);
          } else {
            console.log('⚠️ No AirNow data available for this location');
          }
        } catch (error) {
          console.warn('❌ AirNow API error:', error);
        }
      }

      // Get NASA TEMPO satellite data for additional context
      let tempoData: TempoData[] = [];
      try {
        console.log('🛰️ Fetching NASA TEMPO satellite data...');
        tempoData = await nasaApiService.getTempoData(lat, lon);
        console.log(`📊 Retrieved ${tempoData.length} TEMPO data points`);
      } catch (error) {
        console.warn('❌ NASA TEMPO API error:', error);
      }

      // If we have AirNow data, use it as primary source
      if (airNowData) {
        return {
          timestamp: airNowData.timestamp,
          aqi: airNowData.aqi,
          pm25: airNowData.pm25,
          pm10: airNowData.pm10,
          no2: airNowData.no2,
          o3: airNowData.o3,
          so2: airNowData.so2,
          co: airNowData.co,
          location: {
            lat: airNowData.location.lat,
            lon: airNowData.location.lon,
            name: airNowData.location.name,
          }
        };
      }

      // Fallback to NASA data if available
      if (tempoData.length > 0) {
        console.log('🔄 Using NASA TEMPO data as fallback');
        const mockReadings = nasaApiService.generateAirQualityData(tempoData, lat, lon);
        return mockReadings.length > 0 ? mockReadings[mockReadings.length - 1] : null;
      }

      // If no real data available, return null
      console.log('❌ No real air quality data available for this location');
      return null;

    } catch (error) {
      console.error('❌ Error fetching real air quality data:', error);
      return null;
    }
  }

  // Get air quality forecast
  async getAirQualityForecast(lat: number, lon: number): Promise<AirQualityReading[]> {
    try {
      console.log('🔮 Fetching air quality forecast for:', { lat, lon });
      
      // Try AirNow forecast first
      if (airNowApiService.isConfigured()) {
        try {
          const forecasts = await airNowApiService.getMultiDayForecast(lat, lon, 3);
          
          if (forecasts.length > 0) {
            console.log(`✅ Retrieved ${forecasts.length} forecast points from AirNow`);
            
            // Convert AirNow forecasts to our format
            const processedForecasts: AirQualityReading[] = forecasts.map(forecast => {
              return {
                timestamp: new Date(forecast.DateForecast).toISOString(),
                aqi: forecast.AQI,
                pm25: airNowApiService['aqiToPM25'](forecast.AQI), // Access private method
                pm10: 0, // Not available in forecast
                no2: 0,  // Not available in forecast
                o3: forecast.ParameterName.toLowerCase() === 'ozone' ? airNowApiService['aqiToOzone'](forecast.AQI) : 0,
                so2: 0,  // Not available in forecast
                co: 0,   // Not available in forecast
                location: {
                  lat: forecast.Latitude,
                  lon: forecast.Longitude,
                  name: forecast.ReportingArea || `${lat.toFixed(2)}, ${lon.toFixed(2)}`,
                }
              };
            });
            
            return processedForecasts;
          }
        } catch (error) {
          console.warn('❌ AirNow forecast error:', error);
        }
      }

      // Fallback to NASA-based forecast
      console.log('🔄 Using NASA-based forecast as fallback');
      return await nasaApiService.getAirQualityForecast(lat, lon);

    } catch (error) {
      console.error('❌ Error fetching air quality forecast:', error);
      return [];
    }
  }

  // Get historical air quality data
  async getHistoricalAirQuality(lat: number, lon: number, days: number = 7): Promise<AirQualityReading[]> {
    try {
      console.log('📈 Fetching historical air quality data for:', { lat, lon, days });
      
      // Try AirNow historical data
      if (airNowApiService.isConfigured()) {
        try {
          const historicalData: AirQualityReading[] = [];
          const today = new Date();
          
          // AirNow historical API has limited range, try last few days
          for (let i = 1; i <= Math.min(days, 7); i++) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            const dateString = date.toISOString().split('T')[0];
            
            try {
              const dayData = await airNowApiService.getHistoricalData(lat, lon, dateString);
              const processed = airNowApiService.processAirNowData(dayData, lat, lon);
              
              if (processed) {
                historicalData.push({
                  timestamp: processed.timestamp,
                  aqi: processed.aqi,
                  pm25: processed.pm25,
                  pm10: processed.pm10,
                  no2: processed.no2,
                  o3: processed.o3,
                  so2: processed.so2,
                  co: processed.co,
                  location: {
                    lat: processed.location.lat,
                    lon: processed.location.lon,
                    name: processed.location.name,
                  }
                });
              }
            } catch (dayError) {
              console.warn(`Failed to get historical data for ${dateString}:`, dayError);
            }
          }
          
          if (historicalData.length > 0) {
            console.log(`✅ Retrieved ${historicalData.length} historical data points from AirNow`);
            return historicalData.reverse(); // Chronological order
          }
        } catch (error) {
          console.warn('❌ AirNow historical data error:', error);
        }
      }

      // Fallback to NASA-based historical data
      console.log('🔄 Using NASA-based historical data as fallback');
      return await nasaApiService.getHistoricalAirQuality(lat, lon, days);

    } catch (error) {
      console.error('❌ Error fetching historical air quality data:', error);
      return [];
    }
  }

  // Check if real APIs are configured
  isRealDataAvailable(): boolean {
    return airNowApiService.isConfigured();
  }

  // Get data source information
  getDataSources(): { name: string; available: boolean; description: string }[] {
    return [
      {
        name: 'AirNow API',
        available: airNowApiService.isConfigured(),
        description: 'EPA\'s real-time air quality monitoring network with ground-based sensors'
      },
      {
        name: 'NASA TEMPO',
        available: true, // Always available with token
        description: 'Satellite-based atmospheric composition measurements from geostationary orbit'
      }
    ];
  }

  // Get AQI category (delegate to AirNow service for consistency)
  getAQICategory(aqi: number) {
    return airNowApiService.getAQICategory(aqi);
  }
}

export default new RealAirQualityService();
