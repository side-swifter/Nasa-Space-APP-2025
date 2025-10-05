import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Satellite, 
  MapPin, 
  TrendingUp, 
  TrendingDown,
  BarChart3,
  RefreshCw,
  Info
} from 'lucide-react';
import nasaLanceService, { ValidationResult, LanceDataPoint, GroundStationData } from '../services/nasaLanceService';

interface DataValidationPanelProps {
  lat: number;
  lon: number;
  parameter: string;
  onValidationComplete?: (results: ValidationResult[]) => void;
}

const DataValidationPanel: React.FC<DataValidationPanelProps> = ({
  lat,
  lon,
  parameter,
  onValidationComplete
}) => {
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [satelliteData, setSatelliteData] = useState<LanceDataPoint[]>([]);
  const [groundData, setGroundData] = useState<GroundStationData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedResult, setSelectedResult] = useState<ValidationResult | null>(null);

  useEffect(() => {
    if (lat && lon && parameter) {
      performValidation();
    }
  }, [lat, lon, parameter]);

  const performValidation = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('🔍 Starting data validation for:', { lat, lon, parameter });

      // Fetch satellite data from LANCE
      const satData = await nasaLanceService.getLanceData(lat, lon, parameter);
      setSatelliteData(satData);

      // Fetch ground station data
      const groundStationData = await nasaLanceService.getGroundStationData(lat, lon, 50, parameter);
      setGroundData(groundStationData);

      // Perform validation
      const results = await nasaLanceService.validateSatelliteData(satData, groundStationData, parameter);
      setValidationResults(results);
      
      onValidationComplete?.(results);
      
      console.log('✅ Validation complete:', results);
    } catch (err) {
      console.error('❌ Validation error:', err);
      setError(err instanceof Error ? err.message : 'Validation failed');
    } finally {
      setLoading(false);
    }
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high': return 'text-green-400 bg-green-900/20';
      case 'medium': return 'text-yellow-400 bg-yellow-900/20';
      case 'low': return 'text-red-400 bg-red-900/20';
      default: return 'text-gray-400 bg-gray-900/20';
    }
  };

  const getConfidenceIcon = (confidence: string) => {
    switch (confidence) {
      case 'high': return <CheckCircle className="w-4 h-4" />;
      case 'medium': return <AlertTriangle className="w-4 h-4" />;
      case 'low': return <XCircle className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  const getBiasIcon = (bias: number) => {
    if (Math.abs(bias) < 0.1) return <BarChart3 className="w-4 h-4 text-green-400" />;
    return bias > 0 ? <TrendingUp className="w-4 h-4 text-blue-400" /> : <TrendingDown className="w-4 h-4 text-orange-400" />;
  };

  const formatValue = (value: number, unit: string) => {
    if (unit === 'molecules/cm²') {
      return `${(value / 1e15).toFixed(2)}×10¹⁵ ${unit}`;
    }
    return `${value.toFixed(3)} ${unit}`;
  };

  const calculateOverallAccuracy = () => {
    if (validationResults.length === 0) return 0;
    const highConfidence = validationResults.filter(r => r.confidence === 'high').length;
    const mediumConfidence = validationResults.filter(r => r.confidence === 'medium').length;
    return ((highConfidence * 1 + mediumConfidence * 0.6) / validationResults.length) * 100;
  };

  return (
    <div className="bg-kraken-dark border border-kraken-beige border-opacity-20 rounded-lg p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            <Satellite className="w-5 h-5 text-kraken-beige" />
            <MapPin className="w-5 h-5 text-kraken-light" />
          </div>
          <h3 className="text-kraken-light font-mono text-lg">Data Validation</h3>
        </div>
        <button
          onClick={performValidation}
          disabled={loading}
          className="flex items-center space-x-1 px-3 py-1 bg-kraken-beige bg-opacity-20 hover:bg-opacity-30 rounded text-kraken-light font-mono text-sm transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center space-x-2 text-kraken-light">
            <RefreshCw className="w-5 h-5 animate-spin" />
            <span className="font-mono">Validating satellite data...</span>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-900/20 border border-red-500/30 rounded p-3 mb-4">
          <div className="flex items-center space-x-2 text-red-400">
            <XCircle className="w-4 h-4" />
            <span className="font-mono text-sm">{error}</span>
          </div>
        </div>
      )}

      {/* Summary Stats */}
      {!loading && validationResults.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-kraken-dark border border-kraken-beige border-opacity-10 rounded p-3">
            <div className="text-kraken-beige font-mono text-xs uppercase">Satellite Points</div>
            <div className="text-kraken-light font-mono text-lg">{satelliteData.length}</div>
          </div>
          <div className="bg-kraken-dark border border-kraken-beige border-opacity-10 rounded p-3">
            <div className="text-kraken-beige font-mono text-xs uppercase">Ground Stations</div>
            <div className="text-kraken-light font-mono text-lg">{groundData.length}</div>
          </div>
          <div className="bg-kraken-dark border border-kraken-beige border-opacity-10 rounded p-3">
            <div className="text-kraken-beige font-mono text-xs uppercase">Validated</div>
            <div className="text-kraken-light font-mono text-lg">
              {validationResults.filter(r => r.groundData).length}
            </div>
          </div>
          <div className="bg-kraken-dark border border-kraken-beige border-opacity-10 rounded p-3">
            <div className="text-kraken-beige font-mono text-xs uppercase">Accuracy</div>
            <div className="text-kraken-light font-mono text-lg">
              {calculateOverallAccuracy().toFixed(0)}%
            </div>
          </div>
        </div>
      )}

      {/* Validation Results */}
      {!loading && validationResults.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-kraken-beige font-mono text-sm uppercase mb-3">Validation Results</h4>
          
          {validationResults.map((result, index) => (
            <div
              key={index}
              className={`border border-kraken-beige border-opacity-20 rounded p-3 cursor-pointer transition-colors ${
                selectedResult === result ? 'bg-kraken-beige bg-opacity-10' : 'hover:bg-kraken-beige hover:bg-opacity-5'
              }`}
              onClick={() => setSelectedResult(selectedResult === result ? null : result)}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Satellite className="w-4 h-4 text-kraken-beige" />
                  <span className="text-kraken-light font-mono text-sm">
                    {result.satelliteData.instrument}
                  </span>
                  <span className="text-kraken-beige font-mono text-xs">
                    {new Date(result.satelliteData.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <div className={`flex items-center space-x-1 px-2 py-1 rounded text-xs font-mono ${getConfidenceColor(result.confidence)}`}>
                  {getConfidenceIcon(result.confidence)}
                  <span>{result.confidence}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-kraken-beige font-mono text-xs uppercase mb-1">Satellite Value</div>
                  <div className="text-kraken-light font-mono">
                    {formatValue(result.satelliteData.value, result.satelliteData.unit)}
                  </div>
                </div>
                <div>
                  <div className="text-kraken-beige font-mono text-xs uppercase mb-1">Ground Value</div>
                  <div className="text-kraken-light font-mono">
                    {result.groundData 
                      ? formatValue(result.groundData.parameters[parameter]?.value || 0, result.groundData.parameters[parameter]?.unit || '')
                      : 'No data'
                    }
                  </div>
                </div>
              </div>

              {result.groundData && (
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-kraken-beige border-opacity-10">
                  <div className="flex items-center space-x-4 text-xs">
                    <div className="flex items-center space-x-1">
                      <span className="text-kraken-beige font-mono">Correlation:</span>
                      <span className="text-kraken-light font-mono">{result.correlation.toFixed(3)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      {getBiasIcon(result.bias)}
                      <span className="text-kraken-beige font-mono">Bias:</span>
                      <span className="text-kraken-light font-mono">{result.bias.toFixed(3)}</span>
                    </div>
                  </div>
                  <div className="text-kraken-beige font-mono text-xs">
                    {result.groundData.network}
                  </div>
                </div>
              )}

              {/* Expanded Details */}
              {selectedResult === result && (
                <div className="mt-3 pt-3 border-t border-kraken-beige border-opacity-10">
                  <div className="space-y-2">
                    <div>
                      <div className="text-kraken-beige font-mono text-xs uppercase mb-1">Validation Notes</div>
                      <ul className="space-y-1">
                        {result.notes.map((note, noteIndex) => (
                          <li key={noteIndex} className="text-kraken-light font-mono text-xs flex items-start space-x-1">
                            <span className="text-kraken-beige">•</span>
                            <span>{note}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    {result.groundData && (
                      <div>
                        <div className="text-kraken-beige font-mono text-xs uppercase mb-1">Ground Station</div>
                        <div className="text-kraken-light font-mono text-xs">
                          <div>{result.groundData.name}</div>
                          <div>Lat: {result.groundData.lat.toFixed(4)}, Lon: {result.groundData.lon.toFixed(4)}</div>
                          <div>Network: {result.groundData.network}</div>
                        </div>
                      </div>
                    )}

                    <div>
                      <div className="text-kraken-beige font-mono text-xs uppercase mb-1">Statistics</div>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div>
                          <span className="text-kraken-beige font-mono">RMSE: </span>
                          <span className="text-kraken-light font-mono">{result.rmse.toFixed(3)}</span>
                        </div>
                        <div>
                          <span className="text-kraken-beige font-mono">Quality: </span>
                          <span className="text-kraken-light font-mono">{result.satelliteData.quality}</span>
                        </div>
                        <div>
                          <span className="text-kraken-beige font-mono">Distance: </span>
                          <span className="text-kraken-light font-mono">
                            {result.groundData ? '< 50km' : 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* No Data State */}
      {!loading && !error && validationResults.length === 0 && (
        <div className="text-center py-8">
          <div className="text-kraken-beige font-mono text-sm mb-2">No validation data available</div>
          <div className="text-kraken-light font-mono text-xs">
            Try selecting a different location or parameter
          </div>
        </div>
      )}
    </div>
  );
};

export default DataValidationPanel;
