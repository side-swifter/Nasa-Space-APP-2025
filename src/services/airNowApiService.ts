import axios from 'axios';

// AirNow API Configuration
const AIRNOW_API_KEY = import.meta.env.VITE_AIRNOW_API_KEY || 'A0E2958B-959E-43FA-84C1-D1D84C505942';
const AIRNOW_BASE_URL = 'https://www.airnowapi.org/aq';

// AirNow API Response Interfaces
export interface AirNowObservation {
  DateObserved: string;
  HourObserved: number;
  LocalTimeZone: string;
  ReportingArea: string;
  StateCode: string;
  Latitude: number;
  Longitude: number;
  ParameterName: string;
  AQI: number;
  Category: {
    Number: number;
    Name: string;
  };
}

export interface AirNowForecast {
  DateIssued: string;
  DateForecast: string;
  ReportingArea: string;
  StateCode: string;
  Latitude: number;
  Longitude: number;
  ParameterName: string;
  AQI: number;
  Category: {
    Number: number;
    Name: string;
  };
  ActionDay: boolean;
  Discussion: string;
}

export interface ProcessedAirQualityData {
  timestamp: string;
  aqi: number;
  pm25: number;
  pm10: number;
  no2: number;
  o3: number;
  so2: number;
  co: number;
  location: {
    lat: number;
    lon: number;
    name: string;
    reportingArea?: string;
    stateCode?: string;
  };
  category: {
    number: number;
    name: string;
    color: string;
    description: string;
  };
  rawData?: AirNowObservation[];
}

class AirNowApiService {
  private apiClient = axios.create({
    baseURL: AIRNOW_BASE_URL,
    timeout: 10000,
  });

  // Get current air quality observations by coordinates
  async getCurrentObservations(lat: number, lon: number, distance: number = 25): Promise<AirNowObservation[]> {
    try {
      const response = await this.apiClient.get('/observation/latLong/current/', {
        params: {
          format: 'application/json',
          latitude: lat,
          longitude: lon,
          distance: distance, // Distance in miles
          API_KEY: AIRNOW_API_KEY,
        },
      });

      return response.data || [];
    } catch (error) {
      console.error('Error fetching AirNow current observations:', error);
      throw new Error('Failed to fetch current air quality data from AirNow');
    }
  }

  // Get air quality forecast by coordinates
  async getForecast(lat: number, lon: number, date?: string, distance: number = 25): Promise<AirNowForecast[]> {
    try {
      const forecastDate = date || new Date().toISOString().split('T')[0];
      
      const response = await this.apiClient.get('/forecast/latLong/', {
        params: {
          format: 'application/json',
          latitude: lat,
          longitude: lon,
          date: forecastDate,
          distance: distance,
          API_KEY: AIRNOW_API_KEY,
        },
      });

      return response.data || [];
    } catch (error) {
      console.error('Error fetching AirNow forecast:', error);
      throw new Error('Failed to fetch air quality forecast from AirNow');
    }
  }

  // Get historical data (limited to recent dates)
  async getHistoricalData(lat: number, lon: number, date: string, distance: number = 25): Promise<AirNowObservation[]> {
    try {
      const response = await this.apiClient.get('/observation/latLong/historical/', {
        params: {
          format: 'application/json',
          latitude: lat,
          longitude: lon,
          date: date,
          distance: distance,
          API_KEY: AIRNOW_API_KEY,
        },
      });

      return response.data || [];
    } catch (error) {
      console.error('Error fetching AirNow historical data:', error);
      throw new Error('Failed to fetch historical air quality data from AirNow');
    }
  }

  // Process raw AirNow data into our standardized format
  processAirNowData(observations: AirNowObservation[], lat: number, lon: number): ProcessedAirQualityData | null {
    if (!observations || observations.length === 0) {
      return null;
    }

    // Group observations by parameter
    const parameterMap = new Map<string, AirNowObservation>();
    observations.forEach(obs => {
      parameterMap.set(obs.ParameterName.toLowerCase(), obs);
    });

    // Extract values for each pollutant
    const pm25Obs = parameterMap.get('pm2.5');
    const pm10Obs = parameterMap.get('pm10');
    const ozoneObs = parameterMap.get('ozone') || parameterMap.get('o3');
    const no2Obs = parameterMap.get('no2');
    const so2Obs = parameterMap.get('so2');
    const coObs = parameterMap.get('co');

    // Calculate overall AQI (use the highest AQI among all pollutants)
    const aqiValues = observations.map(obs => obs.AQI).filter(aqi => aqi > 0);
    const overallAQI = aqiValues.length > 0 ? Math.max(...aqiValues) : 0;

    // Get the most recent timestamp
    const latestObs = observations.reduce((latest, current) => {
      const currentTime = new Date(`${current.DateObserved}T${current.HourObserved.toString().padStart(2, '0')}:00:00`);
      const latestTime = new Date(`${latest.DateObserved}T${latest.HourObserved.toString().padStart(2, '0')}:00:00`);
      return currentTime > latestTime ? current : latest;
    });

    const timestamp = new Date(`${latestObs.DateObserved}T${latestObs.HourObserved.toString().padStart(2, '0')}:00:00`);

    // Convert AQI to concentration estimates (rough approximations)
    const pm25Value = pm25Obs ? this.aqiToPM25(pm25Obs.AQI) : 0;
    const pm10Value = pm10Obs ? this.aqiToPM10(pm10Obs.AQI) : 0;
    const o3Value = ozoneObs ? this.aqiToOzone(ozoneObs.AQI) : 0;
    const no2Value = no2Obs ? this.aqiToNO2(no2Obs.AQI) : 0;
    const so2Value = so2Obs ? this.aqiToSO2(so2Obs.AQI) : 0;
    const coValue = coObs ? this.aqiToCO(coObs.AQI) : 0;

    // Get category information
    const category = this.getAQICategory(overallAQI);

    return {
      timestamp: timestamp.toISOString(),
      aqi: overallAQI,
      pm25: pm25Value,
      pm10: pm10Value,
      no2: no2Value,
      o3: o3Value,
      so2: so2Value,
      co: coValue,
      location: {
        lat,
        lon,
        name: latestObs.ReportingArea || `${lat.toFixed(2)}, ${lon.toFixed(2)}`,
        reportingArea: latestObs.ReportingArea,
        stateCode: latestObs.StateCode,
      },
      category,
      rawData: observations,
    };
  }

  // Convert AQI back to PM2.5 concentration (μg/m³)
  private aqiToPM25(aqi: number): number {
    if (aqi <= 50) return aqi * 12 / 50;
    if (aqi <= 100) return 12 + (aqi - 50) * 23.4 / 50;
    if (aqi <= 150) return 35.4 + (aqi - 100) * 20 / 50;
    if (aqi <= 200) return 55.4 + (aqi - 150) * 94.6 / 50;
    if (aqi <= 300) return 150 + (aqi - 200) * 100 / 100;
    return 250 + (aqi - 300) * 250 / 200;
  }

  // Convert AQI back to PM10 concentration (μg/m³)
  private aqiToPM10(aqi: number): number {
    if (aqi <= 50) return aqi * 54 / 50;
    if (aqi <= 100) return 54 + (aqi - 50) * 100 / 50;
    if (aqi <= 150) return 154 + (aqi - 100) * 100 / 50;
    if (aqi <= 200) return 254 + (aqi - 150) * 146 / 50;
    if (aqi <= 300) return 354 + (aqi - 200) * 246 / 100;
    return 424 + (aqi - 300) * 176 / 200;
  }

  // Convert AQI back to Ozone concentration (ppb)
  private aqiToOzone(aqi: number): number {
    if (aqi <= 50) return aqi * 54 / 50;
    if (aqi <= 100) return 54 + (aqi - 50) * 16 / 50;
    if (aqi <= 150) return 70 + (aqi - 100) * 15 / 50;
    if (aqi <= 200) return 85 + (aqi - 150) * 20 / 50;
    return 105 + (aqi - 200) * 95 / 100;
  }

  // Convert AQI back to NO2 concentration (ppb) - rough estimate
  private aqiToNO2(aqi: number): number {
    // NO2 AQI calculation is complex, this is a rough approximation
    return aqi * 0.5; // Very rough conversion
  }

  // Convert AQI back to SO2 concentration (ppb) - rough estimate
  private aqiToSO2(aqi: number): number {
    // SO2 AQI calculation varies by time period, this is a rough approximation
    return aqi * 0.3; // Very rough conversion
  }

  // Convert AQI back to CO concentration (ppm) - rough estimate
  private aqiToCO(aqi: number): number {
    // CO AQI calculation is complex, this is a rough approximation
    return aqi * 0.01; // Very rough conversion
  }

  // Get AQI category information
  getAQICategory(aqi: number): { number: number; name: string; color: string; description: string } {
    if (aqi <= 50) {
      return {
        number: 1,
        name: 'Good',
        color: '#00e400',
        description: 'Air quality is satisfactory, and air pollution poses little or no risk.'
      };
    } else if (aqi <= 100) {
      return {
        number: 2,
        name: 'Moderate',
        color: '#ffff00',
        description: 'Air quality is acceptable. However, there may be a risk for some people, particularly those who are unusually sensitive to air pollution.'
      };
    } else if (aqi <= 150) {
      return {
        number: 3,
        name: 'Unhealthy for Sensitive Groups',
        color: '#ff7e00',
        description: 'Members of sensitive groups may experience health effects. The general public is less likely to be affected.'
      };
    } else if (aqi <= 200) {
      return {
        number: 4,
        name: 'Unhealthy',
        color: '#ff0000',
        description: 'Some members of the general public may experience health effects; members of sensitive groups may experience more serious health effects.'
      };
    } else if (aqi <= 300) {
      return {
        number: 5,
        name: 'Very Unhealthy',
        color: '#8f3f97',
        description: 'Health alert: The risk of health effects is increased for everyone.'
      };
    } else {
      return {
        number: 6,
        name: 'Hazardous',
        color: '#7e0023',
        description: 'Health warning of emergency conditions: everyone is more likely to be affected.'
      };
    }
  }

  // Get multiple days of forecast data
  async getMultiDayForecast(lat: number, lon: number, days: number = 3): Promise<AirNowForecast[]> {
    const forecasts: AirNowForecast[] = [];
    const today = new Date();

    for (let i = 0; i < days; i++) {
      const forecastDate = new Date(today);
      forecastDate.setDate(today.getDate() + i);
      const dateString = forecastDate.toISOString().split('T')[0];

      try {
        const dayForecast = await this.getForecast(lat, lon, dateString);
        forecasts.push(...dayForecast);
      } catch (error) {
        console.warn(`Failed to get forecast for ${dateString}:`, error);
      }
    }

    return forecasts;
  }

  // Check if API key is configured
  isConfigured(): boolean {
    return !!AIRNOW_API_KEY && AIRNOW_API_KEY !== 'your-airnow-api-key-here';
  }
}

export default new AirNowApiService();
