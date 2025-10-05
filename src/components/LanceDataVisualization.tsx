import React, { useState, useEffect } from 'react';
import { 
  Satellite, 
  Clock, 
  MapPin, 
  TrendingUp, 
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Eye,
  BarChart3
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';
import nasaLanceService, { LanceDataPoint, GroundStationData, LanceLayerInfo } from '../services/nasaLanceService';

interface LanceDataVisualizationProps {
  lat: number;
  lon: number;
  selectedParameter: string;
  onParameterChange?: (parameter: string) => void;
}

const LanceDataVisualization: React.FC<LanceDataVisualizationProps> = ({
  lat,
  lon,
  selectedParameter,

}) => {
  const [lanceData, setLanceData] = useState<LanceDataPoint[]>([]);
  const [groundData, setGroundData] = useState<GroundStationData[]>([]);
  const [availableLayers, setAvailableLayers] = useState<LanceLayerInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'6h' | '24h' | '7d'>('24h');
  const [viewMode, setViewMode] = useState<'timeseries' | 'comparison' | 'spatial'>('timeseries');

  useEffect(() => {
    setAvailableLayers(nasaLanceService.getAvailableLayers());
  }, []);

  useEffect(() => {
    if (lat && lon && selectedParameter) {
      fetchLanceData();
    }
  }, [lat, lon, selectedParameter, selectedTimeRange]);

  const fetchLanceData = async () => {
    setLoading(true);
    setError(null);

    try {
      const endTime = new Date().toISOString();
      const startTime = new Date(Date.now() - getTimeRangeMs()).toISOString();

      // Fetch LANCE satellite data
      const satData = await nasaLanceService.getLanceData(
        lat, lon, selectedParameter, startTime, endTime
      );
      setLanceData(satData);

      // Fetch ground station data for comparison
      const groundStationData = await nasaLanceService.getGroundStationData(lat, lon, 100, selectedParameter);
      setGroundData(groundStationData);

      console.log('📊 LANCE data fetched:', { satData: satData.length, groundData: groundStationData.length });
    } catch (err) {
      console.error('❌ Error fetching LANCE data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const getTimeRangeMs = () => {
    switch (selectedTimeRange) {
      case '6h': return 6 * 60 * 60 * 1000;
      case '24h': return 24 * 60 * 60 * 1000;
      case '7d': return 7 * 24 * 60 * 60 * 1000;
      default: return 24 * 60 * 60 * 1000;
    }
  };

  const formatChartData = () => {
    return lanceData.map(point => ({
      time: new Date(point.timestamp).toLocaleTimeString(),
      timestamp: point.timestamp,
      satellite: point.value,
      instrument: point.instrument,
      quality: point.quality
    }));
  };

  const formatComparisonData = () => {
    const comparison = [];
    
    for (const satPoint of lanceData) {
      // Find corresponding ground data
      const nearestGround = groundData.find(ground => {
        const timeDiff = Math.abs(
          new Date(satPoint.timestamp).getTime() - new Date(ground.timestamp).getTime()
        );
        return timeDiff < 3600000 && ground.parameters[selectedParameter]; // Within 1 hour
      });

      if (nearestGround && nearestGround.parameters[selectedParameter]) {
        comparison.push({
          satellite: satPoint.value,
          ground: nearestGround.parameters[selectedParameter].value,
          time: new Date(satPoint.timestamp).toLocaleTimeString(),
          instrument: satPoint.instrument,
          station: nearestGround.name
        });
      }
    }

    return comparison;
  };

  const getParameterInfo = () => {
    return availableLayers.find(layer => 
      layer.parameter.toLowerCase().includes(selectedParameter.toLowerCase())
    );
  };

  const getDataQualityColor = (quality: string) => {
    switch (quality) {
      case 'good': return '#10b981';
      case 'moderate': return '#f59e0b';
      case 'poor': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getLatencyStatus = () => {
    if (lanceData.length === 0) return { status: 'no-data', color: 'text-gray-400', icon: AlertCircle };
    
    const latestData = lanceData[0];
    const dataAge = Date.now() - new Date(latestData.timestamp).getTime();
    const hoursOld = dataAge / (1000 * 60 * 60);

    if (hoursOld <= 3) {
      return { status: 'near-realtime', color: 'text-green-400', icon: CheckCircle };
    } else if (hoursOld <= 24) {
      return { status: 'recent', color: 'text-yellow-400', icon: Clock };
    } else {
      return { status: 'old', color: 'text-red-400', icon: AlertCircle };
    }
  };

  const latencyStatus = getLatencyStatus();
  const parameterInfo = getParameterInfo();
  const chartData = formatChartData();
  const comparisonData = formatComparisonData();

  return (
    <div className="bg-kraken-dark border border-kraken-beige border-opacity-20 rounded-lg p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Satellite className="w-5 h-5 text-kraken-beige" />
          <h3 className="text-kraken-light font-mono text-lg">LANCE Near Real-Time Data</h3>
          <div className={`flex items-center space-x-1 ${latencyStatus.color}`}>
            <latencyStatus.icon className="w-4 h-4" />
            <span className="font-mono text-xs capitalize">{latencyStatus.status.replace('-', ' ')}</span>
          </div>
        </div>
        <button
          onClick={fetchLanceData}
          disabled={loading}
          className="flex items-center space-x-1 px-3 py-1 bg-kraken-beige bg-opacity-20 hover:bg-opacity-30 rounded text-kraken-light font-mono text-sm transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Update</span>
        </button>
      </div>

      {/* Parameter Info */}
      {parameterInfo && (
        <div className="bg-kraken-dark border border-kraken-beige border-opacity-10 rounded p-3 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-kraken-beige font-mono text-xs uppercase">Instrument</div>
              <div className="text-kraken-light font-mono">{parameterInfo.instrument}</div>
            </div>
            <div>
              <div className="text-kraken-beige font-mono text-xs uppercase">Resolution</div>
              <div className="text-kraken-light font-mono">{parameterInfo.resolution}</div>
            </div>
            <div>
              <div className="text-kraken-beige font-mono text-xs uppercase">Latency</div>
              <div className="text-kraken-light font-mono">{parameterInfo.latency}</div>
            </div>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div className="flex items-center space-x-2">
          <span className="text-kraken-beige font-mono text-sm">Time Range:</span>
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value as any)}
            className="bg-kraken-dark border border-kraken-beige border-opacity-20 rounded px-2 py-1 text-kraken-light font-mono text-sm"
          >
            <option value="6h">Last 6 Hours</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-kraken-beige font-mono text-sm">View:</span>
          <div className="flex rounded border border-kraken-beige border-opacity-20 overflow-hidden">
            {[
              { key: 'timeseries', label: 'Time Series', icon: TrendingUp },
              { key: 'comparison', label: 'Comparison', icon: BarChart3 },
              { key: 'spatial', label: 'Spatial', icon: MapPin }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setViewMode(key as any)}
                className={`flex items-center space-x-1 px-3 py-1 font-mono text-xs transition-colors ${
                  viewMode === key 
                    ? 'bg-kraken-beige text-kraken-dark' 
                    : 'text-kraken-light hover:bg-kraken-beige hover:bg-opacity-10'
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center space-x-2 text-kraken-light">
            <RefreshCw className="w-5 h-5 animate-spin" />
            <span className="font-mono">Loading LANCE data...</span>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-900/20 border border-red-500/30 rounded p-3 mb-4">
          <div className="flex items-center space-x-2 text-red-400">
            <AlertCircle className="w-4 h-4" />
            <span className="font-mono text-sm">{error}</span>
          </div>
        </div>
      )}

      {/* Data Visualization */}
      {!loading && !error && lanceData.length > 0 && (
        <div className="space-y-4">
          {/* Time Series View */}
          {viewMode === 'timeseries' && (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="time" 
                    stroke="#9ca3af"
                    fontSize={12}
                    fontFamily="monospace"
                  />
                  <YAxis 
                    stroke="#9ca3af"
                    fontSize={12}
                    fontFamily="monospace"
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '4px',
                      fontFamily: 'monospace',
                      fontSize: '12px'
                    }}
                    formatter={(value: any, name: string) => [
                      `${value.toFixed(3)} ${lanceData[0]?.unit || ''}`,
                      name === 'satellite' ? 'Satellite' : name
                    ]}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="satellite" 
                    stroke="#f59e0b" 
                    strokeWidth={2}
                    dot={{ fill: '#f59e0b', strokeWidth: 2, r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Comparison View */}
          {viewMode === 'comparison' && comparisonData.length > 0 && (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart data={comparisonData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="ground"
                    name="Ground Station"
                    stroke="#9ca3af"
                    fontSize={12}
                    fontFamily="monospace"
                  />
                  <YAxis 
                    dataKey="satellite"
                    name="Satellite"
                    stroke="#9ca3af"
                    fontSize={12}
                    fontFamily="monospace"
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '4px',
                      fontFamily: 'monospace',
                      fontSize: '12px'
                    }}
                    formatter={(value: any, name: string) => [
                      `${value.toFixed(3)} ${lanceData[0]?.unit || ''}`,
                      name === 'satellite' ? 'Satellite' : 'Ground Station'
                    ]}
                  />
                  <Scatter fill="#f59e0b" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Data Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-kraken-dark border border-kraken-beige border-opacity-10 rounded p-3">
              <div className="text-kraken-beige font-mono text-xs uppercase">Latest Value</div>
              <div className="text-kraken-light font-mono text-lg">
                {lanceData[0]?.value.toFixed(3)} {lanceData[0]?.unit}
              </div>
            </div>
            <div className="bg-kraken-dark border border-kraken-beige border-opacity-10 rounded p-3">
              <div className="text-kraken-beige font-mono text-xs uppercase">Data Points</div>
              <div className="text-kraken-light font-mono text-lg">{lanceData.length}</div>
            </div>
            <div className="bg-kraken-dark border border-kraken-beige border-opacity-10 rounded p-3">
              <div className="text-kraken-beige font-mono text-xs uppercase">Ground Stations</div>
              <div className="text-kraken-light font-mono text-lg">{groundData.length}</div>
            </div>
            <div className="bg-kraken-dark border border-kraken-beige border-opacity-10 rounded p-3">
              <div className="text-kraken-beige font-mono text-xs uppercase">Data Quality</div>
              <div className="flex items-center space-x-1">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: getDataQualityColor(lanceData[0]?.quality || 'unknown') }}
                />
                <span className="text-kraken-light font-mono text-sm capitalize">
                  {lanceData[0]?.quality || 'Unknown'}
                </span>
              </div>
            </div>
          </div>

          {/* Recent Data Points */}
          <div>
            <h4 className="text-kraken-beige font-mono text-sm uppercase mb-3">Recent Measurements</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {lanceData.slice(0, 10).map((point, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-kraken-dark border border-kraken-beige border-opacity-10 rounded">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: getDataQualityColor(point.quality) }}
                    />
                    <span className="text-kraken-light font-mono text-sm">
                      {point.instrument}
                    </span>
                    <span className="text-kraken-beige font-mono text-xs">
                      {new Date(point.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <div className="text-kraken-light font-mono text-sm">
                    {point.value.toFixed(3)} {point.unit}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* No Data State */}
      {!loading && !error && lanceData.length === 0 && (
        <div className="text-center py-8">
          <Eye className="w-12 h-12 text-kraken-beige mx-auto mb-4 opacity-50" />
          <div className="text-kraken-beige font-mono text-sm mb-2">No LANCE data available</div>
          <div className="text-kraken-light font-mono text-xs">
            Data may not be available for this location and time range
          </div>
        </div>
      )}
    </div>
  );
};

export default LanceDataVisualization;
