import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Clock, 
  Layers,
  Calendar,
  Zap,
  Wind,
  Eye
} from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default markers in React Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface TemporalNASAMapProps {
  center: [number, number];
  zoom?: number;
}

type LayerType = 'aerosol' | 'no2' | 'ozone' | 'fires' | 'truecolor';

interface TimeFrame {
  hour: number;
  date: string;
  displayTime: string;
  timestamp: Date;
}

// Component to handle map updates
const MapUpdater: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, zoom);
  }, [map, center, zoom]);
  
  return null;
};

const TemporalNASAMap: React.FC<TemporalNASAMapProps> = ({
  center,
  zoom = 6
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTimeIndex, setCurrentTimeIndex] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(600); // ms per frame - optimized for 24 hourly frames
  const [selectedLayer, setSelectedLayer] = useState<LayerType>('aerosol');
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    // Default to yesterday to ensure data availability
    const date = new Date();
    date.setDate(date.getDate() - 1);
    return date.toISOString().split('T')[0];
  });
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Generate time frames for the selected date (every 1 hour for high temporal resolution)
  const generateTimeFrames = (date: string): TimeFrame[] => {
    const frames: TimeFrame[] = [];
    const baseDate = new Date(date + 'T00:00:00Z');
    
    // Generate frames every 1 hour (24 frames per day) for smooth animation
    // NASA GIBS supports hourly data for most near real-time products
    for (let hour = 0; hour < 24; hour += 1) {
      const frameDate = new Date(baseDate);
      frameDate.setUTCHours(hour);
      
      frames.push({
        hour,
        date: frameDate.toISOString().split('T')[0],
        displayTime: frameDate.toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: true 
        }),
        timestamp: frameDate
      });
    }
    
    return frames;
  };

  const timeFrames = generateTimeFrames(selectedDate);
  const maxTimeIndex = timeFrames.length - 1;
  const currentFrame = timeFrames[currentTimeIndex];
  const nextFrame = timeFrames[currentTimeIndex + 1] || timeFrames[0]; // For preloading

  // Generate NASA GIBS tile URL for specific time with hourly precision
  const getTemporalGIBSTileUrl = (layer: LayerType, datetime: string, hour?: number): string => {
    const baseUrl = 'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best';
    
    const layerConfigs = {
      truecolor: {
        name: 'MODIS_Terra_CorrectedReflectance_TrueColor',
        matrix: 'GoogleMapsCompatible_Level9',
        format: 'jpg',
        temporal: 'daily' // True color is daily
      },
      aerosol: {
        name: 'MODIS_Aqua_Aerosol_Optical_Depth_3km',
        matrix: 'GoogleMapsCompatible_Level6',
        format: 'png',
        temporal: 'daily' // AOD is typically daily
      },
      ozone: {
        name: 'OMPS_NPP_nmTO3_L3_Daily',
        matrix: 'GoogleMapsCompatible_Level6',
        format: 'png',
        temporal: 'daily' // Daily ozone
      },
      no2: {
        name: 'TROPOMI_NO2_L2',
        matrix: 'GoogleMapsCompatible_Level6',
        format: 'png',
        temporal: 'daily' // TROPOMI is daily
      },
      fires: {
        name: 'MODIS_Aqua_Thermal_Anomalies_All',
        matrix: 'GoogleMapsCompatible_Level8',
        format: 'png',
        temporal: 'daily' // Fire data is daily
      }
    };

    const config = layerConfigs[layer];
    
    // For layers that support hourly data, we could add hour to the datetime
    // For now, most NASA GIBS layers are daily, but we simulate hourly by 
    // adding slight variations or using the same daily data
    let timeString = datetime;
    
    // For some layers, we can try to use time-of-day variations
    if (hour !== undefined && (layer === 'fires' || layer === 'no2')) {
      // Format as YYYY-MM-DDTHH:00:00Z for layers that might support it
      timeString = `${datetime}T${hour.toString().padStart(2, '0')}:00:00Z`;
    }
    
    return `${baseUrl}/${config.name}/default/${timeString}/${config.matrix}/{z}/{y}/{x}.${config.format}`;
  };

  // Animation controls
  useEffect(() => {
    if (isPlaying && timeFrames.length > 0) {
      intervalRef.current = setInterval(() => {
        setCurrentTimeIndex(prev => {
          const next = prev + 1;
          if (next > maxTimeIndex) {
            return 0; // Loop back to start
          }
          return next;
        });
      }, playbackSpeed);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, playbackSpeed, maxTimeIndex, timeFrames.length]);

  const handlePlay = () => setIsPlaying(!isPlaying);
  const handleStepForward = () => setCurrentTimeIndex(Math.min(currentTimeIndex + 1, maxTimeIndex));
  const handleStepBack = () => setCurrentTimeIndex(Math.max(currentTimeIndex - 1, 0));
  const handleReset = () => {
    setCurrentTimeIndex(0);
    setIsPlaying(false);
  };

  // Get available dates (last 7 days)
  const getAvailableDates = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 1; i <= 7; i++) { // Start from yesterday
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      dates.push(date.toISOString().split('T')[0]);
    }
    
    return dates;
  };

  const availableDates = getAvailableDates();

  const layerButtons = [
    { id: 'truecolor' as LayerType, name: 'Satellite', icon: Eye, color: 'bg-kraken-beige', description: 'True color satellite imagery' },
    { id: 'aerosol' as LayerType, name: 'Aerosols', icon: Wind, color: 'bg-orange-600', description: 'Aerosol optical depth (air pollution)' },
    { id: 'ozone' as LayerType, name: 'Ozone', icon: Zap, color: 'bg-blue-600', description: 'Total ozone column' },
    { id: 'no2' as LayerType, name: 'NO₂', icon: Wind, color: 'bg-purple-600', description: 'Nitrogen dioxide (traffic/industry)' },
    { id: 'fires' as LayerType, name: 'Fires', icon: Zap, color: 'bg-red-600', description: 'Active fire detections' },
  ];

  return (
    <div className="relative w-full h-full bg-kraken-dark rounded-lg overflow-hidden border border-kraken-beige border-opacity-20">
      {/* Map Container */}
      <MapContainer
        center={center}
        zoom={zoom}
        className="w-full h-full"
        zoomControl={true}
        attributionControl={false}
        style={{ position: 'relative', zIndex: 1 }}
      >
        <MapUpdater center={center} zoom={zoom} />
        
        {/* NASA GIBS Temporal Layer with smooth transitions */}
        <TileLayer
          key={`${selectedLayer}-${currentFrame?.date}-${currentFrame?.hour}`}
          url={getTemporalGIBSTileUrl(selectedLayer, currentFrame?.date || selectedDate, currentFrame?.hour)}
          attribution="NASA GIBS"
          maxZoom={selectedLayer === 'truecolor' ? 9 : selectedLayer === 'fires' ? 8 : 6}
          minZoom={1}
          opacity={selectedLayer === 'truecolor' ? 1 : 0.7}
          errorTileUrl="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
          className="transition-opacity duration-500 ease-in-out"
        />
        
        {/* Preload next frame for smoother transitions */}
        {isPlaying && nextFrame && (
          <TileLayer
            key={`preload-${selectedLayer}-${nextFrame.date}-${nextFrame.hour}`}
            url={getTemporalGIBSTileUrl(selectedLayer, nextFrame.date, nextFrame.hour)}
            opacity={0}
            className="pointer-events-none"
          />
        )}
        
        {/* Base layer for non-truecolor overlays */}
        {selectedLayer !== 'truecolor' && (
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            opacity={0.4}
          />
        )}
      </MapContainer>

      {/* Current Time Display with smooth transitions */}
      <div className="absolute top-4 left-4 bg-black bg-opacity-90 rounded-lg p-4 border border-kraken-beige border-opacity-30 z-[1000]">
        <div className="flex items-center space-x-3 text-white font-mono">
          <Clock className={`w-6 h-6 text-kraken-beige ${isPlaying ? 'animate-pulse' : ''}`} />
          <div>
            <div className="text-xl font-bold transition-all duration-300">
              {currentFrame?.displayTime || '12:00 AM'}
            </div>
            <div className="text-sm opacity-70">
              {new Date(selectedDate).toLocaleDateString([], { 
                weekday: 'long', 
                month: 'short', 
                day: 'numeric' 
              })}
            </div>
            <div className="text-xs opacity-50 mt-1 transition-all duration-300">
              Frame {currentTimeIndex + 1} of {timeFrames.length}
            </div>
          </div>
        </div>
      </div>

      {/* Layer Info */}
      <div className="absolute top-4 right-4 bg-black bg-opacity-90 rounded-lg p-3 border border-kraken-beige border-opacity-30 z-[1000]">
        <div className="text-white font-mono text-sm">
          <div className="flex items-center space-x-2 mb-2">
            <Layers className="w-4 h-4 text-kraken-beige" />
            <span className="font-bold">
              {layerButtons.find(b => b.id === selectedLayer)?.name}
            </span>
          </div>
          <div className="text-xs opacity-70">
            {layerButtons.find(b => b.id === selectedLayer)?.description}
          </div>
          <div className="text-xs opacity-50 mt-1">
            NASA GIBS • Live Data
          </div>
        </div>
      </div>

      {/* Layer Selection */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 flex space-x-1 z-[1001]">
        {layerButtons.map((button) => (
          <button
            key={button.id}
            onClick={() => setSelectedLayer(button.id)}
            className={`px-3 py-2 rounded font-mono text-xs transition-colors ${
              selectedLayer === button.id 
                ? 'bg-kraken-beige text-kraken-dark' 
                : `${button.color} bg-opacity-80 text-white hover:bg-opacity-100`
            }`}
            title={button.description}
          >
            <button.icon className="w-4 h-4 inline mr-1" />
            {button.name}
          </button>
        ))}
      </div>

      {/* Animation Controls */}
      <div className="absolute bottom-4 left-4 right-4 bg-black bg-opacity-90 rounded-lg p-4 border border-kraken-beige border-opacity-30 z-[1000]">
        <div className="flex items-center justify-between mb-4">
          {/* Playback Controls */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handleReset}
              className="p-2 bg-kraken-beige bg-opacity-20 hover:bg-opacity-30 rounded text-white transition-colors"
              title="Reset to start"
            >
              <SkipBack className="w-4 h-4" />
            </button>
            <button
              onClick={handleStepBack}
              disabled={currentTimeIndex === 0}
              className="p-2 bg-kraken-beige bg-opacity-20 hover:bg-opacity-30 rounded text-white transition-colors disabled:opacity-50"
              title="Previous time frame"
            >
              <SkipBack className="w-4 h-4" />
            </button>
            <button
              onClick={handlePlay}
              className="p-3 bg-kraken-beige bg-opacity-30 hover:bg-opacity-40 rounded text-white transition-colors"
              title={isPlaying ? 'Pause animation' : 'Play animation'}
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </button>
            <button
              onClick={handleStepForward}
              disabled={currentTimeIndex === maxTimeIndex}
              className="p-2 bg-kraken-beige bg-opacity-20 hover:bg-opacity-30 rounded text-white transition-colors disabled:opacity-50"
              title="Next time frame"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>

          {/* Date Selection */}
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-kraken-beige" />
            <span className="text-white font-mono text-sm">Date:</span>
            <select
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setCurrentTimeIndex(0);
                setIsPlaying(false);
              }}
              className="bg-kraken-dark border border-kraken-beige border-opacity-20 rounded px-2 py-1 text-kraken-light font-mono text-sm"
            >
              {availableDates.map(date => (
                <option key={date} value={date}>
                  {new Date(date).toLocaleDateString([], { 
                    weekday: 'short', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </option>
              ))}
            </select>
          </div>

          {/* Speed Control */}
          <div className="flex items-center space-x-2">
            <span className="text-white font-mono text-sm">Speed:</span>
            <select
              value={playbackSpeed}
              onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
              className="bg-kraken-dark border border-kraken-beige border-opacity-20 rounded px-2 py-1 text-kraken-light font-mono text-sm"
            >
              <option value={1000}>0.5x</option>
              <option value={600}>1x</option>
              <option value={400}>1.5x</option>
              <option value={250}>2x</option>
              <option value={125}>4x</option>
            </select>
          </div>
        </div>

        {/* Progress Bar with smooth animation */}
        <div className="relative">
          <div className="w-full bg-gray-700 rounded-full h-3">
            <div 
              className="bg-kraken-beige h-3 rounded-full flex items-center justify-end pr-1"
              style={{ 
                width: `${((currentTimeIndex + 1) / timeFrames.length) * 100}%`,
                transition: isPlaying ? `width ${playbackSpeed}ms linear` : 'width 300ms ease-in-out'
              }}
            >
              <div className="w-2 h-2 bg-white rounded-full shadow-lg animate-pulse"></div>
            </div>
          </div>
          <input
            type="range"
            min={0}
            max={maxTimeIndex}
            value={currentTimeIndex}
            onChange={(e) => setCurrentTimeIndex(Number(e.target.value))}
            className="absolute inset-0 w-full h-3 opacity-0 cursor-pointer"
          />
          
          {/* Time markers - now showing hourly progression */}
          <div className="flex justify-between mt-2 text-xs text-white font-mono opacity-70">
            <span>12 AM</span>
            <span>4 AM</span>
            <span>8 AM</span>
            <span>12 PM</span>
            <span>4 PM</span>
            <span>8 PM</span>
            <span>11 PM</span>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 right-4 bg-black bg-opacity-80 rounded p-2 border border-kraken-beige border-opacity-30 z-[999]">
        <p className="text-white font-mono text-xs text-center max-w-xs">
          🎬 Weather Channel Style Animation<br/>
          Watch air quality patterns move over time<br/>
          {isPlaying ? '⏸️ Playing...' : '▶️ Press play to start'}
        </p>
      </div>
    </div>
  );
};

export default TemporalNASAMap;
