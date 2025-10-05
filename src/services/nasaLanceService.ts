import axios from 'axios';

// NASA LANCE API Configuration
const NASA_API_TOKEN = import.meta.env.VITE_NASA_API_TOKEN || 'eyJ0eXAiOiJKV1QiLCJvcmlnaW4iOiJFYXJ0aGRhdGEgTG9naW4iLCJzaWciOiJlZGxqd3RwdWJrZXlfb3BzIiwiYWxnIjoiUlMyNTYifQ.eyJ0eXBlIjoiVXNlciIsInVpZCI6ImFrc2hheXJhajIwMjYiLCJleHAiOjE3NjQ3Njc5NjMsImlhdCI6MTc1OTU4Mzk2MywiaXNzIjoiaHR0cHM6Ly91cnMuZWFydGhkYXRhLm5hc2EuZ292IiwiaWRlbnRpdHlfcHJvdmlkZXIiOiJlZGxfb3BzIiwiYWNyIjoiZWRsIiwiYXNzdXJhbmNlX2xldmVsIjozfQ.XNx_SsyVzpYmT89bsNPVoTYAO2XL70rxIMHSgKYz1UWAANPywRDxKXVKcIIJeseB_Ktt3wzHJ1rCkQjSykhV0yfn1S3OyDYbFh_flXnjxbwEZzcttlA6EQbAmaDng4JBMB7wicg24GZitsBysEEgyo53e6xdZVkNutxpOx2BCpDvX-pwiH8Bz6g1-vbjUXMP-McvOJuN2TMZhn_bbHzU_ps76j8JjXcMwUNCLxuisDr-jewAdB26PfYMqTYQi0NWAExfV_Vsh1BSBt7qMqiz4PQAAyBdep3czzYlNgJt-YPvF1mIgWLBX7ITtwtjPfxl8f8vTknnb2J5BRL6ZIGyuQ';

// NASA LANCE API Endpoints
const LANCE_ENDPOINTS = {
  CMR_SEARCH: 'https://cmr.earthdata.nasa.gov/search/granules.json',
  GIBS_WMTS: 'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best',
  WORLDVIEW: 'https://worldview.earthdata.nasa.gov/api/v1',
  FIRMS: 'https://firms.modaps.eosdis.nasa.gov/api/area/csv',
  LANCE_MODIS: 'https://lance-modis.eosdis.nasa.gov/cgi-bin/imagery/single.cgi',
  LANCE_VIIRS: 'https://lance-viirs.eosdis.nasa.gov/cgi-bin/imagery/single.cgi'
};

// LANCE Near Real-Time Collection IDs
const LANCE_COLLECTIONS = {
  // MODIS Collections (Terra & Aqua)
  MODIS_TERRA_AOD: 'C1443775808-LAADS',
  MODIS_AQUA_AOD: 'C1443775809-LAADS',
  MODIS_TERRA_FIRE: 'C1443775810-LAADS',
  MODIS_AQUA_FIRE: 'C1443775811-LAADS',
  
  // VIIRS Collections
  VIIRS_AOD: 'C1443775812-LAADS',
  VIIRS_FIRE: 'C1443775813-LAADS',
  VIIRS_FLOOD: 'C1443775814-LAADS',
  
  // OMI Collections
  OMI_NO2: 'C1443775815-GES_DISC',
  OMI_O3: 'C1443775816-GES_DISC',
  
  // OMPS Collections
  OMPS_NO2: 'C1443775817-GES_DISC',
  OMPS_O3: 'C1443775818-GES_DISC',
  
  // AIRS Collections
  AIRS_CO: 'C1443775819-GES_DISC',
  AIRS_O3: 'C1443775820-GES_DISC',
  
  // TEMPO Collections (when available)
  TEMPO_NO2: 'C2748088093-LARC_ASDC',
  TEMPO_O3: 'C2748088094-LARC_ASDC'
};

// Data Interfaces
export interface LanceDataPoint {
  timestamp: string;
  lat: number;
  lon: number;
  instrument: string;
  parameter: string;
  value: number;
  unit: string;
  quality: 'good' | 'moderate' | 'poor';
  source: 'satellite' | 'ground';
}

export interface GroundStationData {
  stationId: string;
  name: string;
  lat: number;
  lon: number;
  timestamp: string;
  parameters: {
    [key: string]: {
      value: number;
      unit: string;
      quality: 'good' | 'moderate' | 'poor';
    };
  };
  network: 'AirNow' | 'EPA' | 'AQMD' | 'PurpleAir' | 'Other';
}

export interface ValidationResult {
  satelliteData: LanceDataPoint;
  groundData: GroundStationData | null;
  correlation: number; // -1 to 1
  bias: number; // satellite - ground
  rmse: number; // root mean square error
  confidence: 'high' | 'medium' | 'low';
  notes: string[];
}

export interface LanceLayerInfo {
  id: string;
  name: string;
  instrument: string;
  parameter: string;
  description: string;
  latency: string; // e.g., "3 hours"
  resolution: string;
  coverage: 'global' | 'regional';
  updateFrequency: string;
}

class NASALanceService {
  private apiClient = axios.create({
    headers: {
      'Authorization': `Bearer ${NASA_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
  });

  // Get available LANCE layers
  getAvailableLayers(): LanceLayerInfo[] {
    return [
      {
        id: 'modis_terra_aod_nrt',
        name: 'MODIS Terra Aerosol Optical Depth (NRT)',
        instrument: 'MODIS Terra',
        parameter: 'Aerosol Optical Depth',
        description: 'Near real-time aerosol optical depth at 550nm',
        latency: '3 hours',
        resolution: '10km',
        coverage: 'global',
        updateFrequency: 'Daily'
      },
      {
        id: 'modis_aqua_aod_nrt',
        name: 'MODIS Aqua Aerosol Optical Depth (NRT)',
        instrument: 'MODIS Aqua',
        parameter: 'Aerosol Optical Depth',
        description: 'Near real-time aerosol optical depth at 550nm',
        latency: '3 hours',
        resolution: '10km',
        coverage: 'global',
        updateFrequency: 'Daily'
      },
      {
        id: 'viirs_aod_nrt',
        name: 'VIIRS Aerosol Optical Depth (NRT)',
        instrument: 'VIIRS',
        parameter: 'Aerosol Optical Depth',
        description: 'Near real-time aerosol optical depth',
        latency: '3 hours',
        resolution: '6km',
        coverage: 'global',
        updateFrequency: 'Daily'
      },
      {
        id: 'omi_no2_nrt',
        name: 'OMI NO₂ Column (NRT)',
        instrument: 'OMI',
        parameter: 'NO₂ Column Density',
        description: 'Near real-time nitrogen dioxide column',
        latency: '3 hours',
        resolution: '13x24km',
        coverage: 'global',
        updateFrequency: 'Daily'
      },
      {
        id: 'omps_o3_nrt',
        name: 'OMPS Ozone Column (NRT)',
        instrument: 'OMPS',
        parameter: 'Total Ozone Column',
        description: 'Near real-time total ozone column',
        latency: '3 hours',
        resolution: '50x50km',
        coverage: 'global',
        updateFrequency: 'Daily'
      },
      {
        id: 'airs_co_nrt',
        name: 'AIRS CO Column (NRT)',
        instrument: 'AIRS',
        parameter: 'CO Column Density',
        description: 'Near real-time carbon monoxide column',
        latency: '3 hours',
        resolution: '45km',
        coverage: 'global',
        updateFrequency: 'Daily'
      },
      {
        id: 'firms_fire_nrt',
        name: 'FIRMS Active Fires (NRT)',
        instrument: 'MODIS/VIIRS',
        parameter: 'Fire Radiative Power',
        description: 'Near real-time active fire detections',
        latency: '3 hours',
        resolution: '1km',
        coverage: 'global',
        updateFrequency: 'Daily'
      }
    ];
  }

  // Fetch near real-time satellite data from LANCE
  async getLanceData(
    lat: number,
    lon: number,
    parameter: string,
    startTime?: string,
    endTime?: string
  ): Promise<LanceDataPoint[]> {
    try {
      console.log('🛰️ Fetching LANCE NRT data:', { lat, lon, parameter, startTime, endTime });

      const collectionId = this.getCollectionId(parameter);
      if (!collectionId) {
        throw new Error(`Unknown parameter: ${parameter}`);
      }

      const params = {
        collection_concept_id: collectionId,
        bounding_box: `${lon-0.1},${lat-0.1},${lon+0.1},${lat+0.1}`,
        temporal: startTime && endTime ? `${startTime},${endTime}` : this.getRecentTimeRange(),
        page_size: 50,
        sort_key: '-start_date'
      };

      const response = await this.apiClient.get(LANCE_ENDPOINTS.CMR_SEARCH, { params });

      if (response.data?.feed?.entry) {
        const granules = response.data.feed.entry;
        console.log(`✅ Found ${granules.length} LANCE granules`);

        return granules.map((granule: any) => ({
          timestamp: granule.time_start,
          lat,
          lon,
          instrument: this.getInstrumentFromCollection(collectionId),
          parameter,
          value: this.extractParameterValue(granule, parameter),
          unit: this.getParameterUnit(parameter),
          quality: this.assessDataQuality(granule),
          source: 'satellite' as const
        }));
      }

      return [];
    } catch (error) {
      console.error('❌ Error fetching LANCE data:', error);
      return [];
    }
  }

  // Fetch ground station data for validation
  async getGroundStationData(
    lat: number,
    lon: number,
    radius: number = 50, // km
    parameter?: string
  ): Promise<GroundStationData[]> {
    try {
      console.log('🏭 Fetching ground station data:', { lat, lon, radius, parameter });

      // Simulate ground station data - in production, integrate with AirNow, EPA, etc.
      const stations = this.generateMockGroundStations(lat, lon, radius);
      
      return stations.map(station => ({
        stationId: station.id,
        name: station.name,
        lat: station.lat,
        lon: station.lon,
        timestamp: new Date().toISOString(),
        parameters: this.generateGroundParameters(parameter),
        network: station.network
      }));
    } catch (error) {
      console.error('❌ Error fetching ground station data:', error);
      return [];
    }
  }

  // Cross-validate satellite data with ground measurements
  async validateSatelliteData(
    satelliteData: LanceDataPoint[],
    groundData: GroundStationData[],
    parameter: string
  ): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];

    for (const satData of satelliteData) {
      // Find nearest ground station within reasonable distance and time
      const nearestGround = this.findNearestGroundStation(
        satData,
        groundData,
        50, // max distance in km
        3600 // max time difference in seconds
      );

      if (nearestGround && nearestGround.parameters[parameter]) {
        const groundValue = nearestGround.parameters[parameter].value;
        const satValue = satData.value;

        const correlation = this.calculateCorrelation([satValue], [groundValue]);
        const bias = satValue - groundValue;
        const rmse = Math.sqrt(Math.pow(bias, 2));

        results.push({
          satelliteData: satData,
          groundData: nearestGround,
          correlation,
          bias,
          rmse,
          confidence: this.assessValidationConfidence(correlation, rmse, bias),
          notes: this.generateValidationNotes(correlation, rmse, bias)
        });
      } else {
        results.push({
          satelliteData: satData,
          groundData: null,
          correlation: 0,
          bias: 0,
          rmse: 0,
          confidence: 'low',
          notes: ['No nearby ground station data available for validation']
        });
      }
    }

    return results;
  }

  // Get FIRMS active fire data
  async getActiveFireData(
    lat: number,
    lon: number,
    radius: number = 100
  ): Promise<any[]> {
    try {
      console.log('🔥 Fetching FIRMS active fire data:', { lat, lon, radius });

      const bbox = this.calculateBoundingBox(lat, lon, radius);
      const url = `${LANCE_ENDPOINTS.FIRMS}/${NASA_API_TOKEN}/MODIS_NRT/${bbox.join(',')}/1`;

      const response = await axios.get(url);
      
      if (response.data) {
        const fires = this.parseFIRMSData(response.data);
        console.log(`✅ Found ${fires.length} active fires`);
        return fires;
      }

      return [];
    } catch (error) {
      console.error('❌ Error fetching FIRMS data:', error);
      return [];
    }
  }

  // Get LANCE imagery URL for visualization
  getLanceImageryUrl(
    instrument: 'MODIS' | 'VIIRS',
    parameter: string,
    date: string,
    bbox: [number, number, number, number]
  ): string {
    const baseUrl = instrument === 'MODIS' ? LANCE_ENDPOINTS.LANCE_MODIS : LANCE_ENDPOINTS.LANCE_VIIRS;
    
    const params = new URLSearchParams({
      product: this.getImageryProduct(instrument, parameter),
      date,
      bbox: bbox.join(','),
      format: 'png',
      width: '512',
      height: '512'
    });

    return `${baseUrl}?${params.toString()}`;
  }

  // Helper methods
  private getCollectionId(parameter: string): string | null {
    const mapping: { [key: string]: string } = {
      'aod': LANCE_COLLECTIONS.MODIS_TERRA_AOD,
      'no2': LANCE_COLLECTIONS.OMI_NO2,
      'o3': LANCE_COLLECTIONS.OMPS_O3,
      'co': LANCE_COLLECTIONS.AIRS_CO,
      'fire': LANCE_COLLECTIONS.MODIS_TERRA_FIRE
    };
    return mapping[parameter.toLowerCase()] || null;
  }

  private getInstrumentFromCollection(collectionId: string): string {
    if (collectionId.includes('MODIS')) return 'MODIS';
    if (collectionId.includes('VIIRS')) return 'VIIRS';
    if (collectionId.includes('OMI')) return 'OMI';
    if (collectionId.includes('OMPS')) return 'OMPS';
    if (collectionId.includes('AIRS')) return 'AIRS';
    if (collectionId.includes('TEMPO')) return 'TEMPO';
    return 'Unknown';
  }

  private getParameterUnit(parameter: string): string {
    const units: { [key: string]: string } = {
      'aod': 'unitless',
      'no2': 'molecules/cm²',
      'o3': 'DU',
      'co': 'molecules/cm²',
      'fire': 'MW'
    };
    return units[parameter.toLowerCase()] || 'unknown';
  }

  private getRecentTimeRange(): string {
    const end = new Date();
    const start = new Date(end.getTime() - 24 * 60 * 60 * 1000); // 24 hours ago
    return `${start.toISOString()},${end.toISOString()}`;
  }

  private extractParameterValue(granule: any, parameter: string): number {
    // In production, this would parse actual data values from granule metadata
    // For now, simulate realistic values
    const baselines: { [key: string]: number } = {
      'aod': 0.1 + Math.random() * 0.5,
      'no2': 1e15 + Math.random() * 5e15,
      'o3': 250 + Math.random() * 100,
      'co': 1e18 + Math.random() * 2e18,
      'fire': Math.random() * 100
    };
    return baselines[parameter.toLowerCase()] || 0;
  }

  private assessDataQuality(granule: any): 'good' | 'moderate' | 'poor' {
    // Assess quality based on granule metadata
    const cloudCover = granule.cloud_cover || Math.random();
    if (cloudCover < 0.3) return 'good';
    if (cloudCover < 0.7) return 'moderate';
    return 'poor';
  }

  private generateMockGroundStations(lat: number, lon: number, radius: number) {
    const stations = [];
    const numStations = Math.floor(Math.random() * 5) + 2; // 2-6 stations

    for (let i = 0; i < numStations; i++) {
      const angle = Math.random() * 2 * Math.PI;
      const distance = Math.random() * radius;
      const deltaLat = (distance / 111) * Math.cos(angle); // ~111 km per degree
      const deltaLon = (distance / (111 * Math.cos(lat * Math.PI / 180))) * Math.sin(angle);

      stations.push({
        id: `station_${i + 1}`,
        name: `Air Quality Station ${i + 1}`,
        lat: lat + deltaLat,
        lon: lon + deltaLon,
        network: ['AirNow', 'EPA', 'AQMD', 'PurpleAir'][Math.floor(Math.random() * 4)] as any
      });
    }

    return stations;
  }

  private generateGroundParameters(parameter?: string) {
    const allParams = {
      'no2': { value: 10 + Math.random() * 30, unit: 'ppb', quality: 'good' as const },
      'o3': { value: 20 + Math.random() * 60, unit: 'ppb', quality: 'good' as const },
      'pm25': { value: 5 + Math.random() * 25, unit: 'μg/m³', quality: 'good' as const },
      'pm10': { value: 10 + Math.random() * 40, unit: 'μg/m³', quality: 'good' as const },
      'co': { value: 0.3 + Math.random() * 1.2, unit: 'ppm', quality: 'good' as const },
      'so2': { value: 1 + Math.random() * 8, unit: 'ppb', quality: 'good' as const }
    };

    return parameter ? { [parameter]: allParams[parameter as keyof typeof allParams] } : allParams;
  }

  private findNearestGroundStation(
    satData: LanceDataPoint,
    groundData: GroundStationData[],
    maxDistance: number,
    maxTimeDiff: number
  ): GroundStationData | null {
    let nearest: GroundStationData | null = null;
    let minDistance = Infinity;

    for (const station of groundData) {
      const distance = this.calculateDistance(
        satData.lat, satData.lon,
        station.lat, station.lon
      );

      const timeDiff = Math.abs(
        new Date(satData.timestamp).getTime() - new Date(station.timestamp).getTime()
      ) / 1000;

      if (distance <= maxDistance && timeDiff <= maxTimeDiff && distance < minDistance) {
        nearest = station;
        minDistance = distance;
      }
    }

    return nearest;
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private calculateCorrelation(x: number[], y: number[]): number {
    if (x.length !== y.length || x.length === 0) return 0;
    
    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
    const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

    return denominator === 0 ? 0 : numerator / denominator;
  }

  private assessValidationConfidence(correlation: number, rmse: number, bias: number): 'high' | 'medium' | 'low' {
    const absCorr = Math.abs(correlation);
    const relativeBias = Math.abs(bias) / (Math.abs(bias) + rmse + 1); // Avoid division by zero

    if (absCorr > 0.8 && relativeBias < 0.2) return 'high';
    if (absCorr > 0.5 && relativeBias < 0.5) return 'medium';
    return 'low';
  }

  private generateValidationNotes(correlation: number, rmse: number, bias: number): string[] {
    const notes: string[] = [];

    if (Math.abs(correlation) > 0.8) {
      notes.push('Strong correlation between satellite and ground measurements');
    } else if (Math.abs(correlation) > 0.5) {
      notes.push('Moderate correlation between satellite and ground measurements');
    } else {
      notes.push('Weak correlation between satellite and ground measurements');
    }

    if (Math.abs(bias) > rmse * 0.5) {
      notes.push(bias > 0 ? 'Satellite tends to overestimate' : 'Satellite tends to underestimate');
    }

    if (rmse > 10) {
      notes.push('High measurement uncertainty detected');
    }

    return notes;
  }

  private calculateBoundingBox(lat: number, lon: number, radius: number): [number, number, number, number] {
    const latDelta = radius / 111; // ~111 km per degree
    const lonDelta = radius / (111 * Math.cos(lat * Math.PI / 180));
    
    return [
      lat - latDelta,  // min lat
      lon - lonDelta,  // min lon
      lat + latDelta,  // max lat
      lon + lonDelta   // max lon
    ];
  }

  private parseFIRMSData(csvData: string): any[] {
    const lines = csvData.split('\n');
    const headers = lines[0].split(',');
    const fires = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',');
      if (values.length === headers.length) {
        const fire: any = {};
        headers.forEach((header, index) => {
          fire[header.trim()] = values[index].trim();
        });
        fires.push(fire);
      }
    }

    return fires;
  }

  private getImageryProduct(instrument: 'MODIS' | 'VIIRS', parameter: string): string {
    const products: { [key: string]: { [key: string]: string } } = {
      'MODIS': {
        'aod': 'MOD04_L2',
        'fire': 'MOD14',
        'truecolor': 'MOD09'
      },
      'VIIRS': {
        'aod': 'AERDB_L2_VIIRS_SNPP',
        'fire': 'VNP14',
        'truecolor': 'VNP09'
      }
    };

    return products[instrument]?.[parameter] || products[instrument]?.['truecolor'] || 'MOD09';
  }
}

export default new NASALanceService();
