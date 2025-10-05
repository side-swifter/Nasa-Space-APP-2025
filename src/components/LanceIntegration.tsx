import React, { useState, useEffect } from 'react';
import { 
  Satellite, 
  MapPin, 
  Settings, 
  Share2,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3
} from 'lucide-react';
import DataValidationPanel from './DataValidationPanel';
import LanceDataVisualization from './LanceDataVisualization';
import nasaLanceService, { ValidationResult, LanceLayerInfo } from '../services/nasaLanceService';

interface LanceIntegrationProps {
  lat: number;
  lon: number;
}

const LanceIntegration: React.FC<LanceIntegrationProps> = ({
  lat,
  lon
}) => {
  const [selectedParameter, setSelectedParameter] = useState<string>('aod');
  const [availableLayers, setAvailableLayers] = useState<LanceLayerInfo[]>([]);
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [activeTab, setActiveTab] = useState<'visualization' | 'validation' | 'settings'>('visualization');
  const [exportFormat, setExportFormat] = useState<'json' | 'csv'>('json');

  useEffect(() => {
    const layers = nasaLanceService.getAvailableLayers();
    setAvailableLayers(layers);
  }, []);

  const handleValidationComplete = (results: ValidationResult[]) => {
    setValidationResults(results);
  };


  const handleShareData = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'NASA LANCE Data',
          text: `Air quality data for ${selectedParameter} at ${lat.toFixed(4)}, ${lon.toFixed(4)}`,
          url: window.location.href
        });
      } catch (error) {
        console.log('Share cancelled or failed');
      }
    } else {
      // Fallback: copy to clipboard
      const shareText = `NASA LANCE Data - ${selectedParameter} at ${lat.toFixed(4)}, ${lon.toFixed(4)}\n${window.location.href}`;
      navigator.clipboard.writeText(shareText);
      alert('Link copied to clipboard!');
    }
  };

  const getValidationSummary = () => {
    if (validationResults.length === 0) return null;

    const highConfidence = validationResults.filter(r => r.confidence === 'high').length;
    const mediumConfidence = validationResults.filter(r => r.confidence === 'medium').length;
    const lowConfidence = validationResults.filter(r => r.confidence === 'low').length;
    const withGroundData = validationResults.filter(r => r.groundData).length;

    return {
      total: validationResults.length,
      validated: withGroundData,
      highConfidence,
      mediumConfidence,
      lowConfidence,
      accuracy: withGroundData > 0 ? ((highConfidence + mediumConfidence * 0.6) / withGroundData * 100) : 0
    };
  };

  const validationSummary = getValidationSummary();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-kraken-dark border border-kraken-beige border-opacity-20 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1">
              <Satellite className="w-6 h-6 text-kraken-beige" />
              <MapPin className="w-5 h-5 text-kraken-light" />
            </div>
            <div>
              <h2 className="text-kraken-light font-mono text-xl">NASA LANCE Integration</h2>
              <p className="text-kraken-beige font-mono text-sm">
                Near Real-Time Satellite Data Validation
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handleShareData}
              className="flex items-center space-x-1 px-3 py-1 bg-kraken-beige bg-opacity-20 hover:bg-opacity-30 rounded text-kraken-light font-mono text-sm transition-colors"
            >
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </button>
          </div>
        </div>

        {/* Location and Parameter Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-kraken-beige font-mono text-xs uppercase mb-1">
              Location
            </label>
            <div className="text-kraken-light font-mono text-sm">
              {lat.toFixed(4)}°, {lon.toFixed(4)}°
            </div>
          </div>
          
          <div>
            <label className="block text-kraken-beige font-mono text-xs uppercase mb-1">
              Parameter
            </label>
            <select
              value={selectedParameter}
              onChange={(e) => setSelectedParameter(e.target.value)}
              className="w-full bg-kraken-dark border border-kraken-beige border-opacity-20 rounded px-2 py-1 text-kraken-light font-mono text-sm"
            >
              <option value="aod">Aerosol Optical Depth</option>
              <option value="no2">Nitrogen Dioxide</option>
              <option value="o3">Ozone</option>
              <option value="co">Carbon Monoxide</option>
              <option value="fire">Active Fires</option>
            </select>
          </div>

          <div>
            <label className="block text-kraken-beige font-mono text-xs uppercase mb-1">
              Export Format
            </label>
            <select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value as 'json' | 'csv')}
              className="w-full bg-kraken-dark border border-kraken-beige border-opacity-20 rounded px-2 py-1 text-kraken-light font-mono text-sm"
            >
              <option value="json">JSON</option>
              <option value="csv">CSV</option>
            </select>
          </div>
        </div>

        {/* Validation Summary */}
        {validationSummary && (
          <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-kraken-dark border border-kraken-beige border-opacity-10 rounded p-2">
              <div className="text-kraken-beige font-mono text-xs uppercase">Total Points</div>
              <div className="text-kraken-light font-mono text-lg">{validationSummary.total}</div>
            </div>
            <div className="bg-kraken-dark border border-kraken-beige border-opacity-10 rounded p-2">
              <div className="text-kraken-beige font-mono text-xs uppercase">Validated</div>
              <div className="text-kraken-light font-mono text-lg">{validationSummary.validated}</div>
            </div>
            <div className="bg-kraken-dark border border-kraken-beige border-opacity-10 rounded p-2">
              <div className="text-kraken-beige font-mono text-xs uppercase">High Confidence</div>
              <div className="flex items-center space-x-1">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-kraken-light font-mono text-lg">{validationSummary.highConfidence}</span>
              </div>
            </div>
            <div className="bg-kraken-dark border border-kraken-beige border-opacity-10 rounded p-2">
              <div className="text-kraken-beige font-mono text-xs uppercase">Medium Confidence</div>
              <div className="flex items-center space-x-1">
                <AlertTriangle className="w-4 h-4 text-yellow-400" />
                <span className="text-kraken-light font-mono text-lg">{validationSummary.mediumConfidence}</span>
              </div>
            </div>
            <div className="bg-kraken-dark border border-kraken-beige border-opacity-10 rounded p-2">
              <div className="text-kraken-beige font-mono text-xs uppercase">Accuracy</div>
              <div className="text-kraken-light font-mono text-lg">{validationSummary.accuracy.toFixed(0)}%</div>
            </div>
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-kraken-dark border border-kraken-beige border-opacity-20 rounded-lg p-1">
        {[
          { key: 'visualization', label: 'Data Visualization', icon: BarChart3 },
          { key: 'validation', label: 'Validation', icon: CheckCircle },
          { key: 'settings', label: 'Settings', icon: Settings }
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key as any)}
            className={`flex items-center space-x-2 px-4 py-2 rounded font-mono text-sm transition-colors ${
              activeTab === key
                ? 'bg-kraken-beige text-kraken-dark'
                : 'text-kraken-light hover:bg-kraken-beige hover:bg-opacity-10'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'visualization' && (
          <LanceDataVisualization
            lat={lat}
            lon={lon}
            selectedParameter={selectedParameter}
            onParameterChange={setSelectedParameter}
          />
        )}

        {activeTab === 'validation' && (
          <DataValidationPanel
            lat={lat}
            lon={lon}
            parameter={selectedParameter}
            onValidationComplete={handleValidationComplete}
          />
        )}

        {activeTab === 'settings' && (
          <div className="bg-kraken-dark border border-kraken-beige border-opacity-20 rounded-lg p-4">
            <h3 className="text-kraken-light font-mono text-lg mb-4">LANCE Configuration</h3>
            
            <div className="space-y-6">
              {/* Available Layers */}
              <div>
                <h4 className="text-kraken-beige font-mono text-sm uppercase mb-3">Available LANCE Layers</h4>
                <div className="space-y-2">
                  {availableLayers.map((layer) => (
                    <div key={layer.id} className="bg-kraken-dark border border-kraken-beige border-opacity-10 rounded p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-kraken-light font-mono text-sm font-bold">{layer.name}</div>
                        <div className="flex items-center space-x-1 text-kraken-beige">
                          <Clock className="w-3 h-3" />
                          <span className="font-mono text-xs">{layer.latency}</span>
                        </div>
                      </div>
                      <div className="text-kraken-light font-mono text-xs mb-2">{layer.description}</div>
                      <div className="grid grid-cols-3 gap-4 text-xs">
                        <div>
                          <span className="text-kraken-beige font-mono">Instrument: </span>
                          <span className="text-kraken-light font-mono">{layer.instrument}</span>
                        </div>
                        <div>
                          <span className="text-kraken-beige font-mono">Resolution: </span>
                          <span className="text-kraken-light font-mono">{layer.resolution}</span>
                        </div>
                        <div>
                          <span className="text-kraken-beige font-mono">Coverage: </span>
                          <span className="text-kraken-light font-mono capitalize">{layer.coverage}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Data Sources */}
              <div>
                <h4 className="text-kraken-beige font-mono text-sm uppercase mb-3">Data Sources</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-kraken-dark border border-kraken-beige border-opacity-10 rounded p-3">
                    <div className="flex items-center space-x-2 mb-2">
                      <Satellite className="w-4 h-4 text-kraken-beige" />
                      <span className="text-kraken-light font-mono text-sm font-bold">Satellite Data</span>
                    </div>
                    <ul className="space-y-1 text-xs">
                      <li className="text-kraken-light font-mono">• NASA LANCE Near Real-Time</li>
                      <li className="text-kraken-light font-mono">• MODIS Terra & Aqua</li>
                      <li className="text-kraken-light font-mono">• VIIRS SNPP & NOAA-20</li>
                      <li className="text-kraken-light font-mono">• OMI & OMPS</li>
                      <li className="text-kraken-light font-mono">• AIRS & TEMPO</li>
                    </ul>
                  </div>
                  <div className="bg-kraken-dark border border-kraken-beige border-opacity-10 rounded p-3">
                    <div className="flex items-center space-x-2 mb-2">
                      <MapPin className="w-4 h-4 text-kraken-beige" />
                      <span className="text-kraken-light font-mono text-sm font-bold">Ground Stations</span>
                    </div>
                    <ul className="space-y-1 text-xs">
                      <li className="text-kraken-light font-mono">• EPA AirNow Network</li>
                      <li className="text-kraken-light font-mono">• State & Local Agencies</li>
                      <li className="text-kraken-light font-mono">• PurpleAir Sensors</li>
                      <li className="text-kraken-light font-mono">• International Networks</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* API Information */}
              <div>
                <h4 className="text-kraken-beige font-mono text-sm uppercase mb-3">API Endpoints</h4>
                <div className="bg-kraken-dark border border-kraken-beige border-opacity-10 rounded p-3">
                  <div className="space-y-2 text-xs font-mono">
                    <div>
                      <span className="text-kraken-beige">CMR Search: </span>
                      <span className="text-kraken-light">https://cmr.earthdata.nasa.gov/search/granules.json</span>
                    </div>
                    <div>
                      <span className="text-kraken-beige">GIBS WMTS: </span>
                      <span className="text-kraken-light">https://gibs.earthdata.nasa.gov/wmts/epsg3857/best</span>
                    </div>
                    <div>
                      <span className="text-kraken-beige">FIRMS: </span>
                      <span className="text-kraken-light">https://firms.modaps.eosdis.nasa.gov/api</span>
                    </div>
                    <div>
                      <span className="text-kraken-beige">Worldview: </span>
                      <span className="text-kraken-light">https://worldview.earthdata.nasa.gov/api/v1</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LanceIntegration;
