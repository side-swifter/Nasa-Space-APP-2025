// NASA Mapping Service for TEMPO, GIBS, and other NASA datasets
export interface NASALayer {
  id: string;
  name: string;
  description: string;
  url: string;
  type: 'wms' | 'wmts' | 'geojson' | 'raster';
  opacity?: number;
  visible?: boolean;
  category: 'pollutants' | 'weather' | 'population' | 'disasters' | 'basemap';
}

export interface TEMPOData {
  no2: number;
  o3: number;
  aerosols: number;
  timestamp: string;
  lat: number;
  lon: number;
}

export interface DisasterEvent {
  id: string;
  type: 'wildfire' | 'flood' | 'hurricane' | 'earthquake' | 'tornado';
  date: string;
  severity: 'low' | 'moderate' | 'high' | 'extreme';
  location: {
    lat: number;
    lon: number;
    name: string;
  };
  description: string;
  damage?: string;
  casualties?: number;
}

export interface PopulationData {
  lat: number;
  lon: number;
  density: number; // people per km²
  totalPopulation: number;
}

class NASAMapService {
  private readonly gibsBaseUrl = 'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best';
  private readonly tempoBaseUrl = 'https://tempo.si.edu/api/v1';
  // AirNow API for future integration
  // private readonly airnowBaseUrl = 'https://www.airnowapi.org/aq';
  
  // NASA GIBS Layer Definitions
  getNASABasemaps(): NASALayer[] {
    return [
      {
        id: 'modis_terra_truecolor',
        name: 'MODIS True Color',
        description: 'Natural color satellite imagery',
        url: `${this.gibsBaseUrl}/MODIS_Terra_CorrectedReflectance_TrueColor/default/{time}/{tilematrixset}{max_zoom}/{z}/{y}/{x}.jpg`,
        type: 'wmts',
        category: 'basemap',
        visible: true
      },
      {
        id: 'modis_aqua_aerosol',
        name: 'MODIS Aerosol Optical Depth',
        description: 'Aerosol concentration in atmosphere',
        url: `${this.gibsBaseUrl}/MODIS_Aqua_Aerosol_Optical_Depth_3km/default/{time}/{tilematrixset}{max_zoom}/{z}/{y}/{x}.png`,
        type: 'wmts',
        category: 'pollutants',
        opacity: 0.7
      },
      {
        id: 'viirs_truecolor',
        name: 'VIIRS True Color',
        description: 'High resolution true color imagery',
        url: `${this.gibsBaseUrl}/VIIRS_SNPP_CorrectedReflectance_TrueColor/default/{time}/{tilematrixset}{max_zoom}/{z}/{y}/{x}.jpg`,
        type: 'wmts',
        category: 'basemap'
      }
    ];
  }

  // TEMPO Pollutant Layers
  getTEMPOLayers(): NASALayer[] {
    return [
      {
        id: 'tempo_no2',
        name: 'TEMPO NO₂',
        description: 'Nitrogen Dioxide from TEMPO satellite',
        url: `${this.tempoBaseUrl}/no2/tropospheric_column`,
        type: 'raster',
        category: 'pollutants',
        opacity: 0.8
      },
      {
        id: 'tempo_o3',
        name: 'TEMPO O₃',
        description: 'Ozone from TEMPO satellite',
        url: `${this.tempoBaseUrl}/o3/total_column`,
        type: 'raster',
        category: 'pollutants',
        opacity: 0.8
      },
      {
        id: 'tempo_aerosols',
        name: 'TEMPO Aerosols',
        description: 'Aerosol optical depth from TEMPO',
        url: `${this.tempoBaseUrl}/aerosols/optical_depth`,
        type: 'raster',
        category: 'pollutants',
        opacity: 0.8
      }
    ];
  }

  // Weather Layers (IMERG, MERRA-2)
  getWeatherLayers(): NASALayer[] {
    return [
      {
        id: 'imerg_precipitation',
        name: 'IMERG Precipitation',
        description: 'Real-time precipitation data',
        url: `${this.gibsBaseUrl}/GPM_3IMERGHH_06_precipitation/default/{time}/{tilematrixset}{max_zoom}/{z}/{y}/{x}.png`,
        type: 'wmts',
        category: 'weather',
        opacity: 0.6
      },
      {
        id: 'merra2_wind',
        name: 'MERRA-2 Wind Speed',
        description: 'Wind speed and direction',
        url: 'https://gmao.gsfc.nasa.gov/reanalysis/MERRA-2/data/wind',
        type: 'raster',
        category: 'weather',
        opacity: 0.7
      }
    ];
  }

  // Population Density Layer
  getPopulationLayers(): NASALayer[] {
    return [
      {
        id: 'sedac_population',
        name: 'Population Density',
        description: 'NASA SEDAC Gridded Population of the World',
        url: 'https://sedac.ciesin.columbia.edu/data/set/gpw-v4-population-density-rev11/data-download',
        type: 'raster',
        category: 'population',
        opacity: 0.5
      }
    ];
  }

  // Mock TEMPO data (replace with real API calls)
  async getTEMPOData(lat: number, lon: number, date: string): Promise<TEMPOData> {
    // Simulate API call - replace with actual TEMPO API
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          no2: Math.random() * 50 + 10, // 10-60 ppb
          o3: Math.random() * 100 + 20, // 20-120 ppb
          aerosols: Math.random() * 0.5 + 0.1, // 0.1-0.6 AOD
          timestamp: date,
          lat,
          lon
        });
      }, 500);
    });
  }

  // Mock AirNow ground stations
  async getAirNowStations(bbox: [number, number, number, number]): Promise<any[]> {
    // Simulate ground station data
    const stations = [];
    const [minLat, minLon, maxLat, maxLon] = bbox;
    
    for (let i = 0; i < 10; i++) {
      stations.push({
        id: `station_${i}`,
        name: `Air Quality Station ${i + 1}`,
        lat: minLat + Math.random() * (maxLat - minLat),
        lon: minLon + Math.random() * (maxLon - minLon),
        aqi: Math.floor(Math.random() * 200),
        pm25: Math.random() * 50,
        no2: Math.random() * 40,
        o3: Math.random() * 80
      });
    }
    
    return stations;
  }

  // Historical disaster data
  getHistoricalDisasters(): DisasterEvent[] {
    return [
      {
        id: 'wildfire_2023_001',
        type: 'wildfire',
        date: '2023-08-15',
        severity: 'high',
        location: { lat: 34.0522, lon: -118.2437, name: 'Los Angeles, CA' },
        description: 'Major wildfire affecting air quality',
        damage: '$50M estimated'
      },
      {
        id: 'hurricane_2023_002',
        type: 'hurricane',
        date: '2023-09-10',
        severity: 'extreme',
        location: { lat: 25.7617, lon: -80.1918, name: 'Miami, FL' },
        description: 'Category 4 hurricane with flooding',
        casualties: 12
      },
      {
        id: 'flood_2023_003',
        type: 'flood',
        date: '2023-07-20',
        severity: 'moderate',
        location: { lat: 39.7392, lon: -104.9903, name: 'Denver, CO' },
        description: 'Flash flooding from severe storms'
      }
    ];
  }

  // Population exposure calculation
  async calculatePopulationExposure(
    _lat: number, 
    _lon: number, 
    _radius: number, 
    aqi: number
  ): Promise<{
    totalPopulation: number;
    exposedPopulation: number;
    riskLevel: 'low' | 'moderate' | 'high' | 'very_high';
  }> {
    // Simulate population calculation - in real implementation would use lat/lon/radius
    const basePopulation = Math.floor(Math.random() * 1000000 + 100000);
    const exposureMultiplier = aqi > 150 ? 1.0 : aqi > 100 ? 0.7 : aqi > 50 ? 0.3 : 0.1;
    
    return {
      totalPopulation: basePopulation,
      exposedPopulation: Math.floor(basePopulation * exposureMultiplier),
      riskLevel: aqi > 200 ? 'very_high' : aqi > 150 ? 'high' : aqi > 100 ? 'moderate' : 'low'
    };
  }

  // Generate GIBS tile URL for specific date
  generateGIBSTileUrl(layerId: string, date: string, z: number, x: number, y: number): string {
    const layer = this.getNASABasemaps().find(l => l.id === layerId);
    if (!layer) return '';
    
    return layer.url
      .replace('{time}', date)
      .replace('{tilematrixset}', 'GoogleMapsCompatible_Level')
      .replace('{max_zoom}', '9')
      .replace('{z}', z.toString())
      .replace('{x}', x.toString())
      .replace('{y}', y.toString());
  }

  // Get disaster icon based on type
  getDisasterIcon(type: DisasterEvent['type']): string {
    const icons = {
      wildfire: '🔥',
      flood: '🌊',
      hurricane: '🌀',
      earthquake: '🌍',
      tornado: '🌪️'
    };
    return icons[type] || '⚠️';
  }

  // Get severity color
  getSeverityColor(severity: DisasterEvent['severity']): string {
    const colors = {
      low: '#22c55e',      // green
      moderate: '#f59e0b',  // yellow
      high: '#ef4444',      // red
      extreme: '#7c2d12'    // dark red
    };
    return colors[severity];
  }

  // Format date for GIBS API
  formatDateForGIBS(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  // Get available dates for TEMPO data
  getAvailableTEMPODates(): string[] {
    const dates = [];
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      dates.push(this.formatDateForGIBS(date));
    }
    
    return dates;
  }
}

const nasaMapService = new NASAMapService();
export default nasaMapService;
