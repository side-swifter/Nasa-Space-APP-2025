import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Layers, Satellite, Wind, Eye } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default markers in React Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface SimpleNASAMapProps {
  center: [number, number];
  zoom: number;
  onLocationSelect?: (lat: number, lon: number) => void;
  currentAirQuality?: {
    aqi: number;
    pm25: number;
    pm10: number;
    no2: number;
    o3: number;
    so2: number;
    co: number;
  } | null;
}

type LayerType = 'satellite' | 'aerosol' | 'ozone' | 'no2';

const SimpleNASAMap: React.FC<SimpleNASAMapProps> = ({ center, zoom, currentAirQuality }) => {
  const [enabledLayers, setEnabledLayers] = useState<Set<LayerType>>(new Set(['satellite', 'aerosol']));
  const selectedDate = (() => {
    // Use a date that's likely to have data (yesterday for better data availability)
    const date = new Date();
    date.setDate(date.getDate() - 1);
    return date.toISOString().split('T')[0];
  })();

  // Custom beige marker icon to match app theme
  const stationIcon = L.divIcon({
    className: 'kraken-station-icon',
    html: `
      <div style="
        width: 18px;
        height: 18px;
        background: #e5bf99; /* kraken-beige */
        border: 3px solid #ffffff;
        border-radius: 50%;
        box-shadow: 0 0 6px rgba(0,0,0,0.45);
      "></div>
    `,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
    popupAnchor: [0, -10]
  });

  // Generate proper GIBS tile URLs based on NASA documentation
  const getGIBSTileUrl = (layer: LayerType, date: string): string => {
    const baseUrl = 'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best';
    
    const layerConfigs = {
      satellite: {
        name: 'MODIS_Terra_CorrectedReflectance_TrueColor',
        matrix: 'GoogleMapsCompatible_Level9',
        format: 'jpg'
      },
      aerosol: {
        name: 'MODIS_Aqua_Aerosol_Optical_Depth_3km',
        matrix: 'GoogleMapsCompatible_Level6',
        format: 'png'
      },
      ozone: {
        name: 'OMI_Aura_NO2_Tropo_Column',
        matrix: 'GoogleMapsCompatible_Level6',
        format: 'png'
      },
      no2: {
        name: 'OMI_Aura_NO2_Tropo_Column',
        matrix: 'GoogleMapsCompatible_Level6',
        format: 'png'
      }
    };

    const config = layerConfigs[layer];
    return `${baseUrl}/${config.name}/default/${date}/${config.matrix}/{z}/{y}/{x}.${config.format}`;
  };


  const toggleLayer = (layerId: LayerType) => {
    if (layerId === 'satellite') return; // Always keep satellite as base
    
    const newEnabledLayers = new Set(enabledLayers);
    if (newEnabledLayers.has(layerId)) {
      newEnabledLayers.delete(layerId);
    } else {
      newEnabledLayers.add(layerId);
    }
    setEnabledLayers(newEnabledLayers);
  };

  const layerButtons = [
    { id: 'satellite' as LayerType, name: 'Satellite', icon: Satellite, color: 'bg-kraken-beige', description: 'NASA satellite overlay (zoom ≤9)', overlayColor: 'transparent' },
    { id: 'ozone' as LayerType, name: 'Ozone (O₃)', icon: Eye, color: 'bg-blue-600', description: 'Total column ozone from OMI', overlayColor: 'rgba(59, 130, 246, 0.4)' },
    { id: 'aerosol' as LayerType, name: 'Aerosols/PM2.5', icon: Wind, color: 'bg-orange-600', description: 'Aerosol optical depth (PM indicator)', overlayColor: 'rgba(249, 115, 22, 0.4)' },
    { id: 'no2' as LayerType, name: 'NO₂', icon: Wind, color: 'bg-purple-600', description: 'Tropospheric NO₂ column', overlayColor: 'rgba(147, 51, 234, 0.4)' },
  ];

  return (
    <div className="relative w-full h-full bg-kraken-dark rounded-lg overflow-hidden border border-kraken-beige border-opacity-20">
      {/* Map Container */}
      <MapContainer
        center={center}
        zoom={zoom}
        className="w-full h-full"
        zoomControl={true}
        attributionControl={true}
        style={{ position: 'relative', zIndex: 1 }}
      >
        {/* OpenStreetMap Base Layer - Always available */}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          maxZoom={18}
          minZoom={1}
          opacity={1.0}
        />
        
        {/* NASA Satellite Layer - Limited zoom */}
        {enabledLayers.has('satellite') && (
          <TileLayer
            key={`satellite-${selectedDate}`}
            url={getGIBSTileUrl('satellite', selectedDate)}
            attribution="NASA GIBS"
            maxZoom={9}
            minZoom={1}
            opacity={0.7}
            tileSize={256}
            zoomOffset={0}
            errorTileUrl="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
          />
        )}
        
        {/* Pollution Data Overlays - Consistent zoom levels */}
        {enabledLayers.has('ozone') && (
          <TileLayer
            key={`ozone-${selectedDate}`}
            url={getGIBSTileUrl('ozone', selectedDate)}
            attribution="NASA GIBS - Ozone"
            maxZoom={6}
            minZoom={1}
            opacity={0.5}
            className="pollution-overlay ozone-overlay"
            tileSize={256}
            zoomOffset={0}
          />
        )}
        
        {enabledLayers.has('aerosol') && (
          <TileLayer
            key={`aerosol-${selectedDate}`}
            url={getGIBSTileUrl('aerosol', selectedDate)}
            attribution="NASA GIBS - Aerosols"
            maxZoom={6}
            minZoom={1}
            opacity={0.8}
            className="pollution-overlay aerosol-overlay"
            tileSize={256}
            zoomOffset={0}
          />
        )}
        
        {enabledLayers.has('no2') && (
          <TileLayer
            key={`no2-${selectedDate}`}
            url={getGIBSTileUrl('no2', selectedDate)}
            attribution="NASA GIBS - NO₂"
            maxZoom={6}
            minZoom={1}
            opacity={0.5}
            className="pollution-overlay no2-overlay"
            tileSize={256}
            zoomOffset={0}
          />
        )}

        {/* Location marker with air quality data */}
        <Marker position={center} icon={stationIcon}>
          <Popup>
            <div className="p-3 min-w-[200px]">
              <h3 className="font-bold text-sm mb-2">Current Location</h3>
              <p className="text-xs mb-1">Lat: {center[0].toFixed(4)}</p>
              <p className="text-xs mb-2">Lon: {center[1].toFixed(4)}</p>
              
              {currentAirQuality && (
                <div className="border-t pt-2 mt-2">
                  <h4 className="font-semibold text-xs mb-1">Air Quality Data</h4>
                  <div className="grid grid-cols-2 gap-1 text-xs">
                    <div>AQI: <strong>{currentAirQuality.aqi}</strong></div>
                    <div>PM2.5: <strong>{currentAirQuality.pm25.toFixed(1)}</strong></div>
                    <div>PM10: <strong>{currentAirQuality.pm10.toFixed(1)}</strong></div>
                    <div>NO₂: <strong>{currentAirQuality.no2.toFixed(1)}</strong></div>
                    <div>O₃: <strong>{currentAirQuality.o3.toFixed(1)}</strong></div>
                    <div>SO₂: <strong>{currentAirQuality.so2.toFixed(1)}</strong></div>
                  </div>
                </div>
              )}
            </div>
          </Popup>
        </Marker>
      </MapContainer>

      {/* Layer Controls - Compact Top Right */}
      {true && (
        <div className="absolute top-4 right-4 space-y-1 z-[1001]" style={{ zIndex: 1001 }}>
          <div className="bg-black bg-opacity-80 rounded-lg p-2 border border-kraken-beige border-opacity-30 max-w-[200px]">
            <h3 className="text-white font-mono text-xs font-bold mb-1 flex items-center">
              <Layers className="w-3 h-3 mr-1 text-kraken-beige" />
              Layers
            </h3>
            <div className="space-y-1">
              {layerButtons.map((button) => {
                const isEnabled = enabledLayers.has(button.id);
                const isSatellite = button.id === 'satellite';
                
                return (
                  <button
                    key={button.id}
                    onClick={() => !isSatellite && toggleLayer(button.id)}
                    disabled={isSatellite}
                    className={`block w-full px-2 py-1 rounded font-mono text-xs transition-colors text-left ${
                      isSatellite 
                        ? 'bg-kraken-beige text-kraken-dark cursor-default' 
                        : isEnabled
                          ? `${button.color} bg-opacity-100 text-white border border-white`
                          : `${button.color} bg-opacity-40 text-white hover:bg-opacity-60 border border-transparent`
                    }`}
                    title={isSatellite ? 'Base layer (always on)' : `${button.description} - Click to toggle`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <button.icon className="w-3 h-3 mr-1 flex-shrink-0" />
                        <div className="font-semibold">{button.name}</div>
                      </div>
                      {!isSatellite && (
                        <div className={`w-2 h-2 rounded-full border ${
                          isEnabled ? 'bg-white border-white' : 'border-white bg-transparent'
                        }`} />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
            
            {/* Current readings for all enabled layers */}
            {currentAirQuality && Array.from(enabledLayers).some(layer => layer !== 'satellite') && (
              <div className="mt-3 pt-2 border-t border-kraken-beige border-opacity-30">
                <div className="text-white font-mono text-xs">
                  <div className="font-semibold mb-1">Current Readings:</div>
                  <div className="space-y-1">
                    {enabledLayers.has('ozone') && (
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                        <span>O₃: <span className="text-kraken-beige">{currentAirQuality.o3.toFixed(1)} ppb</span></span>
                      </div>
                    )}
                    {enabledLayers.has('aerosol') && (
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
                        <span>PM2.5: <span className="text-kraken-beige">{currentAirQuality.pm25.toFixed(1)} μg/m³</span></span>
                      </div>
                    )}
                    {enabledLayers.has('no2') && (
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                        <span>NO₂: <span className="text-kraken-beige">{currentAirQuality.no2.toFixed(1)} ppb</span></span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}


      {/* Layer Info - Shows active overlays */}
      <div className="absolute bottom-4 right-0 bg-black bg-opacity-70 rounded-l px-3 py-2 border-l border-t border-b border-kraken-beige border-opacity-30 z-[1000]" style={{ zIndex: 1000 }}>
        <div className="text-white font-mono text-xs">
          <div className="flex items-center space-x-2 mb-1">
            <Layers className="w-4 h-4 text-kraken-beige" />
            <span className="font-bold">NASA GIBS</span>
          </div>
          <div>Active Overlays: {Array.from(enabledLayers).filter(l => l !== 'satellite').length || 'None'}</div>
          <div>Date: {selectedDate}</div>
        </div>
      </div>
    </div>
  );
};

export default SimpleNASAMap;
