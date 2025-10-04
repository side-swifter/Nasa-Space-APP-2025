import React, { useState } from 'react';
import { MapPin, Satellite, Eye, Wind } from 'lucide-react';

interface AirQualityMapProps {
  currentLocation: { lat: number; lon: number };
  onLocationChange?: (lat: number, lon: number) => void;
}

const AirQualityMap: React.FC<AirQualityMapProps> = ({ 
  currentLocation
}) => {
  const [mapLayer, setMapLayer] = useState<'satellite' | 'ozone' | 'aerosol' | 'no2'>('satellite');

  const getMapUrl = () => {
    const baseUrl = 'https://worldview.earthdata.nasa.gov/snapshot';
    const bounds = `${currentLocation.lon-15},${currentLocation.lat-10},${currentLocation.lon+15},${currentLocation.lat+10}`;
    const date = '2024-10-04';
    
    const layerConfigs = {
      satellite: `v=-180,-90,180,90&t=${date}&l=MODIS_Aqua_CorrectedReflectance_TrueColor,MODIS_Terra_CorrectedReflectance_TrueColor&lg=false&s=${bounds}`,
      ozone: `v=-180,-90,180,90&t=${date}&l=OMPS_NPP_nmTO3_L3_Daily,MODIS_Aqua_CorrectedReflectance_TrueColor&lg=false&s=${bounds}`,
      aerosol: `v=-180,-90,180,90&t=${date}&l=MODIS_Combined_MAIAC_L2G_AerosolOpticalDepth,MODIS_Aqua_CorrectedReflectance_TrueColor&lg=false&s=${bounds}`,
      no2: `v=-180,-90,180,90&t=${date}&l=TROPOMI_NO2_L2,MODIS_Aqua_CorrectedReflectance_TrueColor&lg=false&s=${bounds}`
    };

    return `${baseUrl}?${layerConfigs[mapLayer]}`;
  };


  return (
    <div className="relative w-full h-96 bg-kraken-dark rounded-lg overflow-hidden border border-kraken-beige border-opacity-20">
      {/* NASA Worldview Map */}
      <div className="relative w-full h-full">
        <iframe
          src={getMapUrl()}
          className="w-full h-full border-0"
          title="NASA Worldview Air Quality Map"
          loading="lazy"
        />
        
        {/* Current Location Marker Overlay */}
        <div 
          className="absolute transform -translate-x-1/2 -translate-y-full z-20 pointer-events-none"
          style={{
            left: `${((currentLocation.lon + 180) / 360) * 100}%`,
            top: `${((90 - currentLocation.lat) / 180) * 100}%`
          }}
        >
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 bg-kraken-red rounded-full border-4 border-white shadow-lg animate-pulse flex items-center justify-center">
              <MapPin className="w-4 h-4 text-white" />
            </div>
            <div className="w-1 h-6 bg-kraken-red shadow-lg"></div>
          </div>
        </div>
      </div>

      {/* Layer Controls */}
      <div className="absolute top-4 right-4 space-y-2">
        <button
          onClick={() => setMapLayer('satellite')}
          className={`block px-3 py-2 rounded font-mono text-xs transition-colors ${
            mapLayer === 'satellite' 
              ? 'bg-kraken-beige text-kraken-dark' 
              : 'bg-black bg-opacity-70 text-white hover:bg-opacity-90'
          }`}
        >
          <Satellite className="w-4 h-4 inline mr-1" />
          Satellite
        </button>
        <button
          onClick={() => setMapLayer('ozone')}
          className={`block px-3 py-2 rounded font-mono text-xs transition-colors ${
            mapLayer === 'ozone' 
              ? 'bg-kraken-beige text-kraken-dark' 
              : 'bg-blue-600 bg-opacity-80 text-white hover:bg-opacity-100'
          }`}
        >
          <Eye className="w-4 h-4 inline mr-1" />
          Ozone
        </button>
        <button
          onClick={() => setMapLayer('aerosol')}
          className={`block px-3 py-2 rounded font-mono text-xs transition-colors ${
            mapLayer === 'aerosol' 
              ? 'bg-kraken-beige text-kraken-dark' 
              : 'bg-orange-600 bg-opacity-80 text-white hover:bg-opacity-100'
          }`}
        >
          <Wind className="w-4 h-4 inline mr-1" />
          Aerosols
        </button>
        <button
          onClick={() => setMapLayer('no2')}
          className={`block px-3 py-2 rounded font-mono text-xs transition-colors ${
            mapLayer === 'no2' 
              ? 'bg-kraken-beige text-kraken-dark' 
              : 'bg-purple-600 bg-opacity-80 text-white hover:bg-opacity-100'
          }`}
        >
          <Wind className="w-4 h-4 inline mr-1" />
          NO₂
        </button>
      </div>

      {/* NASA Attribution */}
      <div className="absolute top-4 left-4 bg-black bg-opacity-70 rounded px-3 py-2 border border-kraken-beige border-opacity-30">
        <div className="text-white font-mono text-xs">
          <div className="flex items-center space-x-2 mb-1">
            <div className="w-2 h-2 bg-red-400 rounded-full"></div>
            <span>NASA Worldview</span>
          </div>
          <div>Lat: {currentLocation.lat.toFixed(4)}</div>
          <div>Lon: {currentLocation.lon.toFixed(4)}</div>
        </div>
      </div>

      {/* Map Legend */}
      <div className="absolute bottom-4 left-4 bg-black bg-opacity-70 rounded p-3 border border-kraken-beige border-opacity-30">
        <h4 className="text-white font-mono text-xs font-bold mb-2">
          {mapLayer === 'satellite' && '🛰️ True Color Satellite'}
          {mapLayer === 'ozone' && '🌍 Ozone Column (DU)'}
          {mapLayer === 'aerosol' && '💨 Aerosol Optical Depth'}
          {mapLayer === 'no2' && '🏭 Nitrogen Dioxide'}
        </h4>
        <div className="text-white font-mono text-xs">
          {mapLayer === 'satellite' && 'Real satellite imagery from MODIS'}
          {mapLayer === 'ozone' && 'Ozone layer thickness measurement'}
          {mapLayer === 'aerosol' && 'Particle pollution in atmosphere'}
          {mapLayer === 'no2' && 'Traffic & industrial emissions'}
        </div>
      </div>

      {/* Click Instructions */}
      <div className="absolute bottom-4 right-4 bg-black bg-opacity-70 rounded p-2 border border-kraken-beige border-opacity-30">
        <p className="text-white font-mono text-xs text-center">
          🛰️ Live NASA satellite data
        </p>
      </div>
    </div>
  );
};

export default AirQualityMap;
