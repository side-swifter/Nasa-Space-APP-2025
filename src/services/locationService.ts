// Location service to handle geolocation and reverse geocoding

export interface LocationInfo {
  lat: number;
  lon: number;
  city: string;
  state: string;
  country: string;
  displayName: string;
}

class LocationService {
  // Get user's current position
  async getCurrentPosition(): Promise<{ lat: number; lon: number }> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
        },
        (error) => {
          // Fallback to NYC coordinates if location access is denied
          console.warn('Geolocation error:', error);
          resolve({
            lat: 40.7128,
            lon: -74.0060,
          });
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes
        }
      );
    });
  }

  // Reverse geocoding using Nominatim (OpenStreetMap)
  async reverseGeocode(lat: number, lon: number): Promise<LocationInfo> {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10&addressdetails=1`
      );
      
      if (!response.ok) {
        throw new Error('Geocoding failed');
      }
      
      const data = await response.json();
      
      // Extract location information
      const address = data.address || {};
      const city = address.city || address.town || address.village || address.municipality || 'Unknown City';
      const state = address.state || address.province || address.region || '';
      const country = address.country || 'Unknown Country';
      
      // Create display name
      let displayName = city;
      if (state && country === 'United States') {
        displayName = `${city}, ${state}`;
      } else if (state) {
        displayName = `${city}, ${state}`;
      } else if (country !== 'Unknown Country') {
        displayName = `${city}, ${country}`;
      }
      
      return {
        lat,
        lon,
        city,
        state,
        country,
        displayName,
      };
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      
      // Return fallback location info
      return {
        lat,
        lon,
        city: 'Unknown City',
        state: '',
        country: 'Unknown',
        displayName: `${lat.toFixed(4)}, ${lon.toFixed(4)}`,
      };
    }
  }

  // Get complete location information
  async getCurrentLocationInfo(): Promise<LocationInfo> {
    try {
      const position = await this.getCurrentPosition();
      const locationInfo = await this.reverseGeocode(position.lat, position.lon);
      return locationInfo;
    } catch (error) {
      console.error('Error getting location info:', error);
      
      // Return default NYC location
      return {
        lat: 40.7128,
        lon: -74.0060,
        city: 'New York',
        state: 'NY',
        country: 'United States',
        displayName: 'New York, NY',
      };
    }
  }

  // Format coordinates for display
  formatCoordinates(lat: number, lon: number): string {
    const latDir = lat >= 0 ? 'N' : 'S';
    const lonDir = lon >= 0 ? 'E' : 'W';
    
    return `${Math.abs(lat).toFixed(4)}°${latDir}, ${Math.abs(lon).toFixed(4)}°${lonDir}`;
  }

  // Calculate distance between two points (Haversine formula)
  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    return distance;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}

export default new LocationService();
