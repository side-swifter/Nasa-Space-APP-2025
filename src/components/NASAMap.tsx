import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { 
  Layers, 
  Calendar,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import L from 'leaflet';
import nasaMapService from '../services/nasaMapService';

// Import types
type NASALayer = {
  id: string;
  name: string;
  description: string;
  url: string;
  type: 'wms' | 'wmts' | 'geojson' | 'raster';
  opacity?: number;
  visible?: boolean;
  category: 'pollutants' | 'weather' | 'population' | 'disasters' | 'basemap';
};

// Removed DisasterEvent type - not using disaster functionality
import 'leaflet/dist/leaflet.css';

// Fix for default markers in React Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface NASAMapProps {
  center: [number, number];
  zoom: number;
  onLocationSelect?: (lat: number, lon: number) => void;
}

interface LayerState {
  [key: string]: boolean;
}

// Removed MapDrawerData interface - not using drawer functionality

const NASAMap: React.FC<NASAMapProps> = ({ center, zoom, onLocationSelect }) => {
  const [activeLayers, setActiveLayers] = useState<LayerState>({
    modis_terra_truecolor: true,  // Show NASA satellite imagery by default
    modis_aqua_aerosol: false,
    viirs_truecolor: false,
    tempo_no2: false,
    tempo_o3: false,
    imerg_precipitation: false,
    sedac_population: false
  });
  
  // Use a date that's likely to have MODIS data (a few days ago)
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const date = new Date();
    date.setDate(date.getDate() - 3); // 3 days ago to ensure data availability
    return nasaMapService.formatDateForGIBS(date);
  });
  
  const [availableDates] = useState<string[]>(
    nasaMapService.getAvailableTEMPODates()
  );
  
  const [isLayerPanelOpen, setIsLayerPanelOpen] = useState(false);

  // Simple map click handler - no API calls
  const MapEventHandler = () => {
    useMapEvents({
      click: (e) => {
        const { lat, lng } = e.latlng;
        console.log('📍 Map clicked:', { lat, lng });
        onLocationSelect?.(lat, lng);
      }
    });
    
    return null;
  };

  // Custom tile layer for NASA GIBS
  const NASAGIBSLayer: React.FC<{ layer: NASALayer; date: string }> = ({ layer, date }) => {
    if (!activeLayers[layer.id]) return null;
    
    // Proper NASA GIBS URL format based on documentation
    let gibsUrl = '';
    let maxZoom = 9;
    
    if (layer.id === 'modis_terra_truecolor') {
      gibsUrl = `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_CorrectedReflectance_TrueColor/default/${date}/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg`;
      maxZoom = 9;
    } else if (layer.id === 'modis_aqua_aerosol') {
      gibsUrl = `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Aqua_Aerosol_Optical_Depth_3km/default/${date}/GoogleMapsCompatible_Level6/{z}/{y}/{x}.png`;
      maxZoom = 6;
    } else if (layer.id === 'viirs_truecolor') {
      gibsUrl = `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/VIIRS_SNPP_CorrectedReflectance_TrueColor/default/${date}/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg`;
      maxZoom = 9;
    } else if (layer.id === 'tempo_no2') {
      // TEMPO NO2 layer (if available)
      gibsUrl = `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/TROPOMI_NO2_L2/default/${date}/GoogleMapsCompatible_Level6/{z}/{y}/{x}.png`;
      maxZoom = 6;
    } else if (layer.id === 'tempo_o3') {
      // Ozone layer
      gibsUrl = `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/OMPS_NPP_nmTO3_L3_Daily/default/${date}/GoogleMapsCompatible_Level6/{z}/{y}/{x}.png`;
      maxZoom = 6;
    } else {
      // Fallback to OpenStreetMap for unsupported layers
      gibsUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
      maxZoom = 18;
    }
    
    return (
      <TileLayer
        key={`${layer.id}-${date}`}
        url={gibsUrl}
        opacity={layer.opacity || 1}
        attribution={layer.id.includes('modis') || layer.id.includes('viirs') || layer.id.includes('tempo') ? "NASA GIBS" : "OpenStreetMap"}
        maxZoom={maxZoom}
        minZoom={1}
      />
    );
  };

  // Toggle layer visibility
  const toggleLayer = (layerId: string) => {
    setActiveLayers(prev => ({
      ...prev,
      [layerId]: !prev[layerId]
    }));
  };

  // Get all available layers
  const allLayers = [
    ...nasaMapService.getNASABasemaps(),
    ...nasaMapService.getTEMPOLayers(),
    ...nasaMapService.getWeatherLayers(),
    ...nasaMapService.getPopulationLayers()
  ];

  // Group layers by category
  const layersByCategory = allLayers.reduce((acc, layer) => {
    if (!acc[layer.category]) acc[layer.category] = [];
    acc[layer.category].push(layer);
    return acc;
  }, {} as Record<string, NASALayer[]>);

  // Removed createDisasterIcon - not using disaster markers

  return (
    <div className="relative w-full h-full">
      {/* Map Container */}
      <MapContainer
        center={center}
        zoom={zoom}
        className="w-full h-full z-0"
        zoomControl={false}
      >
        {/* Base layer - either NASA GIBS or OpenStreetMap */}
        {activeLayers['modis_terra_truecolor'] ? (
          <NASAGIBSLayer 
            key="base-layer"
            layer={{
              id: 'modis_terra_truecolor',
              name: 'MODIS True Color',
              description: 'NASA MODIS True Color Satellite Imagery',
              url: '',
              type: 'wmts' as const,
              category: 'basemap' as const,
              opacity: 1
            }} 
            date={selectedDate} 
          />
        ) : (
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            opacity={0.8}
          />
        )}
        
        {/* NASA GIBS Base Layers */}
        {allLayers
          .filter(layer => layer.category === 'basemap' && activeLayers[layer.id])
          .map(layer => (
            <NASAGIBSLayer key={layer.id} layer={layer} date={selectedDate} />
          ))}
        
        {/* Pollutant Overlays */}
        {allLayers
          .filter(layer => layer.category === 'pollutants' && activeLayers[layer.id])
          .map(layer => (
            <NASAGIBSLayer key={layer.id} layer={layer} date={selectedDate} />
          ))}
        
        {/* Weather Overlays */}
        {allLayers
          .filter(layer => layer.category === 'weather' && activeLayers[layer.id])
          .map(layer => (
            <NASAGIBSLayer key={layer.id} layer={layer} date={selectedDate} />
          ))}

        {/* Mock Ground Stations for demonstration */}
        <Marker position={[center[0] + 0.1, center[1] + 0.1]}>
          <Popup>
            <div className="p-2">
              <h3 className="font-bold text-sm">Air Quality Station 1</h3>
              <p className="text-xs">AQI: 85</p>
              <p className="text-xs">PM2.5: 22.3 μg/m³</p>
              <p className="text-xs">NO₂: 18.7 ppb</p>
            </div>
          </Popup>
        </Marker>
        
        <Marker position={[center[0] - 0.1, center[1] - 0.1]}>
          <Popup>
            <div className="p-2">
              <h3 className="font-bold text-sm">Air Quality Station 2</h3>
              <p className="text-xs">AQI: 92</p>
              <p className="text-xs">PM2.5: 28.1 μg/m³</p>
              <p className="text-xs">NO₂: 24.5 ppb</p>
            </div>
          </Popup>
        </Marker>

        {/* Removed disaster markers - no API data */}

        <MapEventHandler />
      </MapContainer>

      {/* Layer Control Panel */}
      <div className="absolute top-4 right-4 z-10">
        <div className="bg-kraken-dark border border-kraken-beige border-opacity-20 rounded-lg shadow-lg">
          <button
            onClick={() => setIsLayerPanelOpen(!isLayerPanelOpen)}
            className="flex items-center space-x-2 p-3 text-kraken-light hover:text-kraken-beige transition-colors"
          >
            <Layers className="w-5 h-5" />
            <span className="font-mono text-sm">Layers</span>
            {isLayerPanelOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          
          {isLayerPanelOpen && (
            <div className="border-t border-kraken-beige border-opacity-20 p-3 max-h-96 overflow-y-auto">
              {Object.entries(layersByCategory).map(([category, layers]) => (
                <div key={category} className="mb-4">
                  <h4 className="text-kraken-beige font-mono text-xs uppercase mb-2">
                    {category}
                  </h4>
                  {layers.map(layer => (
                    <label key={layer.id} className="flex items-center space-x-2 mb-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={activeLayers[layer.id] || false}
                        onChange={() => toggleLayer(layer.id)}
                        className="rounded border-kraken-beige"
                      />
                      <span className="text-kraken-light font-mono text-xs">{layer.name}</span>
                    </label>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Time Slider */}
      <div className="absolute bottom-20 left-4 right-4 z-10">
        <div className="bg-kraken-dark border border-kraken-beige border-opacity-20 rounded-lg p-3">
          <div className="flex items-center space-x-4">
            <Calendar className="w-5 h-5 text-kraken-beige" />
            <span className="text-kraken-light font-mono text-sm">Date:</span>
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

      {/* Simple Legend */}
      <div className="absolute top-4 left-4 z-10">
        <div className="bg-kraken-dark border border-kraken-beige border-opacity-20 rounded-lg p-3">
          <h4 className="text-kraken-beige font-mono text-sm mb-2">Legend</h4>
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-kraken-light font-mono text-xs">Ground Stations</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NASAMap;
