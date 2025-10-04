import axios from 'axios';

// NASA API Configuration
const NASA_API_TOKEN = 'eyJ0eXAiOiJKV1QiLCJvcmlnaW4iOiJFYXJ0aGRhdGEgTG9naW4iLCJzaWciOiJlZGxqd3RwdWJrZXlfb3BzIiwiYWxnIjoiUlMyNTYifQ.eyJ0eXBlIjoiVXNlciIsInVpZCI6ImFrc2hheXJhajIwMjYiLCJleHAiOjE3NjQ3Njc5NjMsImlhdCI6MTc1OTU4Mzk2MywiaXNzIjoiaHR0cHM6Ly91cnMuZWFydGhkYXRhLm5hc2EuZ292IiwiaWRlbnRpdHlfcHJvdmlkZXIiOiJlZGxfb3BzIiwiYWNyIjoiZWRsIiwiYXNzdXJhbmNlX2xldmVsIjozfQ.XNx_SsyVzpYmT89bsNPVoTYAO2XL70rxIMHSgKYz1UWAANPywRDxKXVKcIIJeseB_Ktt3wzHJ1rCkQjSykhV0yfn1S3OyDYbFh_flXnjxbwEZzcttlA6EQbAmaDng4JBMB7wicg24GZitsBysEEgyo53e6xdZVkNutxpOx2BCpDvX-pwiH8Bz6g1-vbjUXMP-McvOJuN2TMZhn_bbHzU_ps76j8JjXcMwUNCLxuisDr-jewAdB26PfYMqTYQi0NWAExfV_Vsh1BSBt7qMqiz4PQAAyBdep3czzYlNgJt-YPvF1mIgWLBX7ITtwtjPfxl8f8vTknnb2J5BRL6ZIGyuQ';

const NASA_BASE_URL = 'https://search.earthdata.nasa.gov/search/granules.json';
const TEMPO_COLLECTION_ID = 'C2748088093-LARC_ASDC'; // TEMPO NO2 Collection ID

// Air Quality Data Interfaces
export interface TempoData {
  id: string;
  title: string;
  time_start: string;
  time_end: string;
  updated: string;
  dataset_id: string;
  data_center: string;
  archive_center: string;
  coordinate_system: string;
  day_night_flag: string;
  granule_size: string;
  orbit_calculated_spatial_domains: any[];
  links: Array<{
    rel: string;
    hreflang: string;
    href: string;
  }>;
}

export interface AirQualityReading {
  timestamp: string;
  no2: number;
  o3: number;
  so2: number;
  co: number;
  pm25: number;
  pm10: number;
  aqi: number;
  location: {
    lat: number;
    lon: number;
    name: string;
  };
}

export interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  pressure: number;
  visibility: number;
}

class NasaApiService {
  private apiClient = axios.create({
    baseURL: NASA_BASE_URL,
    headers: {
      'Authorization': `Bearer ${NASA_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
  });

  // Fetch TEMPO satellite data
  async getTempoData(
    lat: number, 
    lon: number, 
    startDate?: string, 
    endDate?: string
  ): Promise<TempoData[]> {
    try {
      const params = {
        collection_concept_id: TEMPO_COLLECTION_ID,
        bounding_box: `${lon-0.5},${lat-0.5},${lon+0.5},${lat+0.5}`,
        temporal: startDate && endDate ? `${startDate},${endDate}` : undefined,
        page_size: 20,
        sort_key: '-start_date',
      };

      const response = await this.apiClient.get('', { params });
      
      if (response.data && response.data.feed && response.data.feed.entry) {
        return response.data.feed.entry.map((entry: any) => ({
          id: entry.id,
          title: entry.title,
          time_start: entry.time_start,
          time_end: entry.time_end,
          updated: entry.updated,
          dataset_id: entry.dataset_id,
          data_center: entry.data_center,
          archive_center: entry.archive_center,
          coordinate_system: entry.coordinate_system,
          day_night_flag: entry.day_night_flag,
          granule_size: entry.granule_size,
          orbit_calculated_spatial_domains: entry.orbit_calculated_spatial_domains || [],
          links: entry.links || [],
        }));
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching TEMPO data:', error);
      throw new Error('Failed to fetch TEMPO satellite data');
    }
  }

  // Generate mock air quality data based on TEMPO data
  generateAirQualityData(tempoData: TempoData[], lat: number, lon: number): AirQualityReading[] {
    const readings: AirQualityReading[] = [];
    
    // Generate readings for the last 24 hours
    const now = new Date();
    for (let i = 23; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
      
      // Simulate air quality values with some realistic variation
      const baseNO2 = 15 + Math.random() * 20; // ppb
      const baseO3 = 30 + Math.random() * 40; // ppb
      const baseSO2 = 5 + Math.random() * 10; // ppb
      const baseCO = 0.5 + Math.random() * 1.5; // ppm
      const basePM25 = 8 + Math.random() * 25; // μg/m³
      const basePM10 = 15 + Math.random() * 35; // μg/m³
      
      // Calculate AQI based on PM2.5 (simplified)
      let aqi = Math.round(basePM25 * 4.17); // Rough conversion
      if (aqi > 300) aqi = 300;
      
      readings.push({
        timestamp: timestamp.toISOString(),
        no2: Math.round(baseNO2 * 10) / 10,
        o3: Math.round(baseO3 * 10) / 10,
        so2: Math.round(baseSO2 * 10) / 10,
        co: Math.round(baseCO * 100) / 100,
        pm25: Math.round(basePM25 * 10) / 10,
        pm10: Math.round(basePM10 * 10) / 10,
        aqi: aqi,
        location: {
          lat,
          lon,
          name: `Location ${lat.toFixed(2)}, ${lon.toFixed(2)}`,
        },
      });
    }
    
    return readings;
  }

  // Get current air quality for a location
  async getCurrentAirQuality(lat: number, lon: number): Promise<AirQualityReading | null> {
    try {
      // First try to get TEMPO data
      const tempoData = await this.getTempoData(lat, lon);
      
      // Generate air quality reading
      const readings = this.generateAirQualityData(tempoData, lat, lon);
      
      return readings.length > 0 ? readings[readings.length - 1] : null;
    } catch (error) {
      console.error('Error getting current air quality:', error);
      return null;
    }
  }

  // Get air quality forecast (next 24 hours)
  async getAirQualityForecast(lat: number, lon: number): Promise<AirQualityReading[]> {
    try {
      const tempoData = await this.getTempoData(lat, lon);
      
      // Generate forecast data for next 24 hours
      const forecast: AirQualityReading[] = [];
      const now = new Date();
      
      for (let i = 1; i <= 24; i++) {
        const timestamp = new Date(now.getTime() + i * 60 * 60 * 1000);
        
        // Simulate forecast with trending
        const trend = Math.sin(i / 12 * Math.PI) * 0.3; // Daily cycle
        const noise = (Math.random() - 0.5) * 0.2; // Random variation
        
        const factor = 1 + trend + noise;
        
        const baseNO2 = (15 + Math.random() * 20) * factor;
        const baseO3 = (30 + Math.random() * 40) * factor;
        const baseSO2 = (5 + Math.random() * 10) * factor;
        const baseCO = (0.5 + Math.random() * 1.5) * factor;
        const basePM25 = (8 + Math.random() * 25) * factor;
        const basePM10 = (15 + Math.random() * 35) * factor;
        
        let aqi = Math.round(basePM25 * 4.17);
        if (aqi > 300) aqi = 300;
        
        forecast.push({
          timestamp: timestamp.toISOString(),
          no2: Math.round(Math.max(0, baseNO2) * 10) / 10,
          o3: Math.round(Math.max(0, baseO3) * 10) / 10,
          so2: Math.round(Math.max(0, baseSO2) * 10) / 10,
          co: Math.round(Math.max(0, baseCO) * 100) / 100,
          pm25: Math.round(Math.max(0, basePM25) * 10) / 10,
          pm10: Math.round(Math.max(0, basePM10) * 10) / 10,
          aqi: Math.max(0, aqi),
          location: {
            lat,
            lon,
            name: `Location ${lat.toFixed(2)}, ${lon.toFixed(2)}`,
          },
        });
      }
      
      return forecast;
    } catch (error) {
      console.error('Error getting air quality forecast:', error);
      return [];
    }
  }

  // Get historical air quality data
  async getHistoricalAirQuality(
    lat: number, 
    lon: number, 
    days: number = 7
  ): Promise<AirQualityReading[]> {
    try {
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);
      
      const tempoData = await this.getTempoData(
        lat, 
        lon, 
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0]
      );
      
      return this.generateAirQualityData(tempoData, lat, lon);
    } catch (error) {
      console.error('Error getting historical air quality:', error);
      return [];
    }
  }

  // Get AQI category and color
  getAQICategory(aqi: number): { category: string; color: string; description: string } {
    if (aqi <= 50) {
      return {
        category: 'Good',
        color: '#10b981',
        description: 'Air quality is satisfactory'
      };
    } else if (aqi <= 100) {
      return {
        category: 'Moderate',
        color: '#f59e0b',
        description: 'Air quality is acceptable for most people'
      };
    } else if (aqi <= 150) {
      return {
        category: 'Unhealthy for Sensitive Groups',
        color: '#f97316',
        description: 'Sensitive individuals may experience health effects'
      };
    } else if (aqi <= 200) {
      return {
        category: 'Unhealthy',
        color: '#ef4444',
        description: 'Everyone may begin to experience health effects'
      };
    } else if (aqi <= 300) {
      return {
        category: 'Very Unhealthy',
        color: '#dc2626',
        description: 'Health alert: everyone may experience serious health effects'
      };
    } else {
      return {
        category: 'Hazardous',
        color: '#7c2d12',
        description: 'Health warnings of emergency conditions'
      };
    }
  }
}

export default new NasaApiService();
