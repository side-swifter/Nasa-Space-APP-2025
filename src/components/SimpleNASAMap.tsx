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
}

type LayerType = 'satellite' | 'aerosol' | 'ozone' | 'no2';

const SimpleNASAMap: React.FC<SimpleNASAMapProps> = ({ center, zoom }) => {
  const [selectedLayer, setSelectedLayer] = useState<LayerType>('satellite');
  const selectedDate = (() => {
    // Use a date that's likely to have data (a few days ago)
    const date = new Date();
    date.setDate(date.getDate() - 3);
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
        name: 'OMPS_NPP_nmTO3_L3_Daily',
        matrix: 'GoogleMapsCompatible_Level6',
        format: 'png'
      },
      no2: {
        name: 'TROPOMI_NO2_L2',
        matrix: 'GoogleMapsCompatible_Level6',
        format: 'png'
      }
    };

    const config = layerConfigs[layer];
    return `${baseUrl}/${config.name}/default/${date}/${config.matrix}/{z}/{y}/{x}.${config.format}`;
  };


  const layerButtons = [
    { id: 'satellite' as LayerType, name: 'Satellite', icon: Satellite, color: 'bg-kraken-beige' },
    { id: 'ozone' as LayerType, name: 'Ozone', icon: Eye, color: 'bg-blue-600' },
    { id: 'aerosol' as LayerType, name: 'Aerosols', icon: Wind, color: 'bg-orange-600' },
    { id: 'no2' as LayerType, name: 'NO₂', icon: Wind, color: 'bg-purple-600' },
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
        {/* NASA GIBS Tile Layer */}
        <TileLayer
          key={`${selectedLayer}-${selectedDate}`}
          url={getGIBSTileUrl(selectedLayer, selectedDate)}
          attribution="NASA GIBS"
          maxZoom={selectedLayer === 'satellite' ? 9 : 6}
          minZoom={1}
          opacity={1}
          errorTileUrl="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
        />
        
        {/* Fallback base layer if GIBS fails */}
        {selectedLayer !== 'satellite' && (
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            opacity={0.3}
          />
        )}

        {/* Location marker */}
        <Marker position={center} icon={stationIcon}>
          <Popup>
            <div className="p-2">
              <h3 className="font-bold text-sm">Current Location</h3>
              <p className="text-xs">Lat: {center[0].toFixed(4)}</p>
              <p className="text-xs">Lon: {center[1].toFixed(4)}</p>
            </div>
          </Popup>
        </Marker>
      </MapContainer>

      {/* Layer Controls - Hidden but easily restorable */}
      {false && (
        <div className="absolute top-4 left-4 space-y-2 z-[1001]" style={{ zIndex: 1001 }}>
          {layerButtons.map((button) => (
            <button
              key={button.id}
              onClick={() => setSelectedLayer(button.id)}
              className={`block px-3 py-2 rounded font-mono text-xs transition-colors ${
                selectedLayer === button.id 
                  ? 'bg-kraken-beige text-kraken-dark' 
                  : `${button.color} bg-opacity-80 text-white hover:bg-opacity-100`
              }`}
            >
              <button.icon className="w-4 h-4 inline mr-1" />
              {button.name}
            </button>
          ))}
        </div>
      )}


      {/* Layer Info - Moved to touch right edge */}
      <div className="absolute bottom-4 right-0 bg-black bg-opacity-70 rounded-l px-3 py-2 border-l border-t border-b border-kraken-beige border-opacity-30 z-[1000]" style={{ zIndex: 1000 }}>
        <div className="text-white font-mono text-xs">
          <div className="flex items-center space-x-2 mb-1">
            <Layers className="w-4 h-4 text-kraken-beige" />
            <span className="font-bold">NASA GIBS</span>
          </div>
          <div>Layer: {layerButtons.find(b => b.id === selectedLayer)?.name}</div>
          <div>Date: {selectedDate}</div>
        </div>
      </div>
    </div>
  );
};

export default SimpleNASAMap;
