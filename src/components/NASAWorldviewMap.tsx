import React, { useState } from 'react';
import { Calendar, MapPin, Satellite, Wind, Eye } from 'lucide-react';

interface NASAWorldviewMapProps {
  center: [number, number];
  zoom?: number;
  onLocationSelect?: (lat: number, lon: number) => void;
}

const NASAWorldviewMap: React.FC<NASAWorldviewMapProps> = ({ 
  center
}) => {
  const [mapLayer, setMapLayer] = useState<'satellite' | 'ozone' | 'aerosol' | 'no2'>('satellite');
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  // Generate NASA Worldview URL with proper authentication
  const getWorldviewUrl = () => {
    const baseUrl = 'https://worldview.earthdata.nasa.gov/snapshot';
    const bounds = `${center[1]-5},${center[0]-3},${center[1]+5},${center[0]+3}`;
    
    const layerConfigs = {
      satellite: `v=-180,-90,180,90&t=${selectedDate}&l=MODIS_Aqua_CorrectedReflectance_TrueColor,MODIS_Terra_CorrectedReflectance_TrueColor,Coastlines_15m&lg=false&s=${bounds}`,
      ozone: `v=-180,-90,180,90&t=${selectedDate}&l=OMPS_NPP_nmTO3_L3_Daily,MODIS_Aqua_CorrectedReflectance_TrueColor,Coastlines_15m&lg=false&s=${bounds}`,
      aerosol: `v=-180,-90,180,90&t=${selectedDate}&l=MODIS_Combined_MAIAC_L2G_AerosolOpticalDepth,MODIS_Aqua_CorrectedReflectance_TrueColor,Coastlines_15m&lg=false&s=${bounds}`,
      no2: `v=-180,-90,180,90&t=${selectedDate}&l=TROPOMI_NO2_L2,MODIS_Aqua_CorrectedReflectance_TrueColor,Coastlines_15m&lg=false&s=${bounds}`
    };

    return `${baseUrl}?${layerConfigs[mapLayer]}`;
  };

  // Note: getGIBSTileUrl available for future direct tile access if needed
  // const getGIBSTileUrl = (layer: string, z: number, x: number, y: number) => {
  //   return nasaApiService.getGIBSTileUrl(layer, selectedDate, z, x, y);
  // };

  // Get available dates (last 7 days)
  const getAvailableDates = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      dates.push(date.toISOString().split('T')[0]);
    }
    
    return dates;
  };

  const availableDates = getAvailableDates();

  return (
    <div className="relative w-full h-full bg-kraken-dark rounded-lg overflow-hidden border border-kraken-beige border-opacity-20">
      {/* NASA Worldview Embedded Map */}
      <div className="relative w-full h-full" style={{ zIndex: 1 }}>
        <iframe
          src={getWorldviewUrl()}
          className="w-full h-full border-0"
          title="NASA Worldview Air Quality Map"
          loading="lazy"
          allow="fullscreen"
          referrerPolicy="no-referrer-when-downgrade"
          style={{ position: 'relative', zIndex: 1 }}
        />
        
        {/* Current Location Marker Overlay */}
        <div 
          className="absolute transform -translate-x-1/2 -translate-y-full z-[1002] pointer-events-none"
          style={{
            left: '50%',
            top: '50%',
            zIndex: 1002
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
      <div className="absolute top-4 left-4 space-y-2 z-[1001]" style={{ zIndex: 1001 }}>
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

      {/* Date Selector */}
      <div className="absolute bottom-4 left-4 right-4 z-[1000]" style={{ zIndex: 1000 }}>
        <div className="bg-black bg-opacity-70 rounded-lg p-3 border border-kraken-beige border-opacity-30">
          <div className="flex items-center space-x-4">
            <Calendar className="w-5 h-5 text-kraken-beige" />
            <span className="text-white font-mono text-sm">Date:</span>
            <select
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-kraken-dark border border-kraken-beige border-opacity-20 rounded px-2 py-1 text-kraken-light font-mono text-sm"
            >
              {availableDates.map(date => (
                <option key={date} value={date}>{date}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* NASA Attribution */}
      <div className="absolute top-4 right-4 bg-black bg-opacity-70 rounded px-3 py-2 border border-kraken-beige border-opacity-30 z-[1000]" style={{ zIndex: 1000 }}>
        <div className="text-white font-mono text-xs">
          <div className="flex items-center space-x-2 mb-1">
            <div className="w-2 h-2 bg-red-400 rounded-full"></div>
            <span>NASA Worldview</span>
          </div>
          <div>Lat: {center[0].toFixed(4)}</div>
          <div>Lon: {center[1].toFixed(4)}</div>
        </div>
      </div>

      {/* Map Legend */}
      <div className="absolute bottom-20 right-4 bg-black bg-opacity-70 rounded p-3 border border-kraken-beige border-opacity-30 max-w-xs z-[1000]" style={{ zIndex: 1000 }}>
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

      {/* Interactive Instructions */}
      <div className="absolute bottom-4 right-4 bg-black bg-opacity-70 rounded p-2 border border-kraken-beige border-opacity-30 z-[999]" style={{ zIndex: 999 }}>
        <p className="text-white font-mono text-xs text-center">
          🛰️ Live NASA satellite data<br/>
          📅 Historical data available
        </p>
      </div>
    </div>
  );
};

export default NASAWorldviewMap;
