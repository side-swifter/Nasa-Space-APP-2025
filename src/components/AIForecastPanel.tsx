import React, { useState, useEffect } from 'react';
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Satellite,
  Activity,
  Zap,
  RefreshCw,
  Eye,
  BarChart3
} from 'lucide-react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import aiForecastingService, { ExtendedForecast } from '../services/aiForecastingService';

interface AIForecastPanelProps {
  lat: number;
  lon: number;
  onForecastGenerated?: (forecast: ExtendedForecast) => void;
}

const AIForecastPanel: React.FC<AIForecastPanelProps> = ({
  lat,
  lon,
  onForecastGenerated
}) => {
  const [forecast, setForecast] = useState<ExtendedForecast | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'hourly' | 'daily'>('hourly');
  const [selectedPollutant, setSelectedPollutant] = useState<'aqi' | 'pm25' | 'no2' | 'o3'>('aqi');
  const [viewMode, setViewMode] = useState<'chart' | 'factors' | 'insights'>('chart');

  useEffect(() => {
    if (lat && lon) {
      generateForecast();
    }
  }, [lat, lon]);

  const generateForecast = async () => {
    if (!aiForecastingService.isAvailable()) {
      setError('AI forecasting service is not available. Please check your API configuration.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('🤖 Generating AI forecast for:', { lat, lon });
      const result = await aiForecastingService.generateAIForecast(lat, lon, 48);
      setForecast(result);
      onForecastGenerated?.(result);
      console.log('✅ AI forecast generated successfully');
    } catch (err) {
      console.error('❌ Error generating AI forecast:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate AI forecast');
    } finally {
      setLoading(false);
    }
  };

  const formatChartData = () => {
    if (!forecast) return [];

    const data = selectedTimeframe === 'hourly' 
      ? forecast.hourly.slice(0, 24) 
      : forecast.daily;

    return data.map((point) => ({
      time: selectedTimeframe === 'hourly' 
        ? new Date(point.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : new Date(point.timestamp).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' }),
      aqi: point.aqi,
      pm25: point.pollutants.pm25.value,
      no2: point.pollutants.no2.value,
      o3: point.pollutants.o3.value,
      confidence: point.confidence * 100,
      timestamp: point.timestamp
    }));
  };

  const formatFactorsData = () => {
    if (!forecast || forecast.hourly.length === 0) return [];

    const avgFactors = forecast.hourly.slice(0, 12).reduce((acc, point) => {
      acc.weather += point.factors.weather;
      acc.satellite += point.factors.satellite;
      acc.seasonal += point.factors.seasonal;
      acc.traffic += point.factors.traffic;
      acc.industrial += point.factors.industrial;
      return acc;
    }, { weather: 0, satellite: 0, seasonal: 0, traffic: 0, industrial: 0 });

    const count = Math.min(12, forecast.hourly.length);
    
    return [
      { factor: 'Weather', value: (avgFactors.weather / count) * 100, fullMark: 100 },
      { factor: 'Satellite', value: (avgFactors.satellite / count) * 100, fullMark: 100 },
      { factor: 'Seasonal', value: (avgFactors.seasonal / count) * 100, fullMark: 100 },
      { factor: 'Traffic', value: (avgFactors.traffic / count) * 100, fullMark: 100 },
      { factor: 'Industrial', value: (avgFactors.industrial / count) * 100, fullMark: 100 }
    ];
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <TrendingUp className="w-4 h-4 text-red-400" />;
      case 'decreasing': return <TrendingDown className="w-4 h-4 text-green-400" />;
      default: return <Minus className="w-4 h-4 text-yellow-400" />;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-400';
    if (confidence >= 0.6) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getAQIColor = (aqi: number) => {
    if (aqi <= 50) return '#10b981';
    if (aqi <= 100) return '#f59e0b';
    if (aqi <= 150) return '#f97316';
    if (aqi <= 200) return '#ef4444';
    if (aqi <= 300) return '#dc2626';
    return '#7c2d12';
  };


  const chartData = formatChartData();
  const factorsData = formatFactorsData();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-kraken-dark border border-kraken-beige border-opacity-20 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1">
              <Brain className="w-6 h-6 text-kraken-beige" />
              <Satellite className="w-5 h-5 text-kraken-light" />
            </div>
            <div>
              <h2 className="text-kraken-light font-mono text-xl">AI-Enhanced Forecast</h2>
              <p className="text-kraken-beige font-mono text-sm">
                NASA Data + Machine Learning Predictions
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={generateForecast}
              disabled={loading}
              className="flex items-center space-x-1 px-3 py-1 bg-kraken-beige bg-opacity-20 hover:bg-opacity-30 rounded text-kraken-light font-mono text-sm transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Generate</span>
            </button>
          </div>
        </div>

        {/* AI Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${aiForecastingService.isAvailable() ? 'bg-green-400' : 'bg-red-400'}`}></div>
              <span className="text-kraken-light font-mono text-sm">
                AI Model: {aiForecastingService.isAvailable() ? 'Claude-3 Opus Active' : 'Unavailable'}
              </span>
            </div>
            {forecast && (
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-kraken-beige" />
                <span className="text-kraken-light font-mono text-sm">
                  Generated: {new Date().toLocaleTimeString()}
                </span>
              </div>
            )}
          </div>
          
          {forecast && (
            <div className="flex items-center space-x-2">
              <span className="text-kraken-beige font-mono text-sm">Overall Confidence:</span>
              <span className={`font-mono text-sm ${getConfidenceColor(forecast.hourly.reduce((sum, h) => sum + h.confidence, 0) / forecast.hourly.length)}`}>
                {((forecast.hourly.reduce((sum, h) => sum + h.confidence, 0) / forecast.hourly.length) * 100).toFixed(0)}%
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-kraken-dark border border-kraken-beige border-opacity-20 rounded-lg p-8">
          <div className="flex items-center justify-center space-x-3">
            <Brain className="w-6 h-6 text-kraken-beige animate-pulse" />
            <div className="text-kraken-light font-mono">
              <div className="text-lg mb-2">Generating AI Forecast...</div>
              <div className="text-sm opacity-70">
                Analyzing NASA TEMPO, AirNow, and LANCE data with AI models
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
          <div className="flex items-center space-x-2 text-red-400">
            <AlertTriangle className="w-5 h-5" />
            <div>
              <div className="font-mono text-sm font-bold">AI Forecast Error</div>
              <div className="font-mono text-xs mt-1">{error}</div>
            </div>
          </div>
        </div>
      )}

      {/* Forecast Results */}
      {!loading && !error && forecast && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-kraken-dark border border-kraken-beige border-opacity-20 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-kraken-beige font-mono text-xs uppercase">Peak AQI</span>
                <AlertTriangle className="w-4 h-4 text-orange-400" />
              </div>
              <div className="text-kraken-light font-mono text-2xl mb-1">
                {forecast.summary.peakAQI.value}
              </div>
              <div className="text-kraken-light font-mono text-xs opacity-70">
                {new Date(forecast.summary.peakAQI.timestamp).toLocaleDateString()}
              </div>
            </div>

            <div className="bg-kraken-dark border border-kraken-beige border-opacity-20 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-kraken-beige font-mono text-xs uppercase">Best Quality</span>
                <CheckCircle className="w-4 h-4 text-green-400" />
              </div>
              <div className="text-kraken-light font-mono text-2xl mb-1">
                {forecast.summary.bestAirQuality.value}
              </div>
              <div className="text-kraken-light font-mono text-xs opacity-70">
                {new Date(forecast.summary.bestAirQuality.timestamp).toLocaleDateString()}
              </div>
            </div>

            <div className="bg-kraken-dark border border-kraken-beige border-opacity-20 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-kraken-beige font-mono text-xs uppercase">Trend</span>
                {forecast.summary.overallTrend === 'improving' ? (
                  <TrendingDown className="w-4 h-4 text-green-400" />
                ) : forecast.summary.overallTrend === 'worsening' ? (
                  <TrendingUp className="w-4 h-4 text-red-400" />
                ) : (
                  <Minus className="w-4 h-4 text-yellow-400" />
                )}
              </div>
              <div className="text-kraken-light font-mono text-lg mb-1 capitalize">
                {forecast.summary.overallTrend}
              </div>
              <div className="text-kraken-light font-mono text-xs opacity-70">
                Next 48 hours
              </div>
            </div>

            <div className="bg-kraken-dark border border-kraken-beige border-opacity-20 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-kraken-beige font-mono text-xs uppercase">Data Sources</span>
                <Activity className="w-4 h-4 text-kraken-beige" />
              </div>
              <div className="text-kraken-light font-mono text-lg mb-1">
                {forecast.summary.majorFactors.length}
              </div>
              <div className="text-kraken-light font-mono text-xs opacity-70">
                NASA + AI Analysis
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-kraken-beige font-mono text-sm">Timeframe:</span>
                <div className="flex rounded border border-kraken-beige border-opacity-20 overflow-hidden">
                  {[
                    { key: 'hourly', label: 'Hourly' },
                    { key: 'daily', label: 'Daily' }
                  ].map(({ key, label }) => (
                    <button
                      key={key}
                      onClick={() => setSelectedTimeframe(key as any)}
                      className={`px-3 py-1 font-mono text-xs transition-colors ${
                        selectedTimeframe === key
                          ? 'bg-kraken-beige text-kraken-dark'
                          : 'text-kraken-light hover:bg-kraken-beige hover:bg-opacity-10'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-kraken-beige font-mono text-sm">Parameter:</span>
                <select
                  value={selectedPollutant}
                  onChange={(e) => setSelectedPollutant(e.target.value as any)}
                  className="bg-kraken-dark border border-kraken-beige border-opacity-20 rounded px-2 py-1 text-kraken-light font-mono text-sm"
                >
                  <option value="aqi">AQI</option>
                  <option value="pm25">PM2.5</option>
                  <option value="no2">NO₂</option>
                  <option value="o3">O₃</option>
                </select>
              </div>
            </div>

            <div className="flex rounded border border-kraken-beige border-opacity-20 overflow-hidden">
              {[
                { key: 'chart', label: 'Chart', icon: BarChart3 },
                { key: 'factors', label: 'Factors', icon: Activity },
                { key: 'insights', label: 'Insights', icon: Eye }
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

          {/* Chart View */}
          {viewMode === 'chart' && (
            <div className="bg-kraken-dark border border-kraken-beige border-opacity-20 rounded-lg p-6">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
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
                        `${typeof value === 'number' ? value.toFixed(1) : value}${name === 'confidence' ? '%' : ''}`,
                        name.toUpperCase()
                      ]}
                    />
                    <Area 
                      type="monotone" 
                      dataKey={selectedPollutant} 
                      stroke={getAQIColor(chartData[0]?.[selectedPollutant] || 50)}
                      fill={getAQIColor(chartData[0]?.[selectedPollutant] || 50)}
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="confidence" 
                      stroke="#f59e0b" 
                      strokeWidth={1}
                      strokeDasharray="5 5"
                      dot={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Factors View */}
          {viewMode === 'factors' && (
            <div className="bg-kraken-dark border border-kraken-beige border-opacity-20 rounded-lg p-6">
              <h3 className="text-kraken-light font-mono text-lg mb-4">Contributing Factors Analysis</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={factorsData}>
                    <PolarGrid stroke="#374151" />
                    <PolarAngleAxis 
                      dataKey="factor" 
                      tick={{ fill: '#9ca3af', fontSize: 12, fontFamily: 'monospace' }}
                    />
                    <PolarRadiusAxis 
                      angle={90} 
                      domain={[0, 100]}
                      tick={{ fill: '#9ca3af', fontSize: 10, fontFamily: 'monospace' }}
                    />
                    <Radar 
                      name="Influence" 
                      dataKey="value" 
                      stroke="#f59e0b" 
                      fill="#f59e0b" 
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Insights View */}
          {viewMode === 'insights' && (
            <div className="space-y-4">
              {/* Health Recommendations */}
              <div className="bg-kraken-dark border border-kraken-beige border-opacity-20 rounded-lg p-4">
                <h3 className="text-kraken-beige font-mono text-sm uppercase mb-3 flex items-center space-x-2">
                  <Zap className="w-4 h-4" />
                  <span>AI Health Recommendations</span>
                </h3>
                <div className="space-y-2">
                  {forecast.summary.healthRecommendations.map((rec, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                      <span className="text-kraken-light font-mono text-sm">{rec}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pollutant Trends */}
              <div className="bg-kraken-dark border border-kraken-beige border-opacity-20 rounded-lg p-4">
                <h3 className="text-kraken-beige font-mono text-sm uppercase mb-3">Pollutant Trend Analysis</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {Object.entries(forecast.hourly[0]?.pollutants || {}).map(([pollutant, data]) => (
                    <div key={pollutant} className="flex items-center justify-between p-2 bg-kraken-dark border border-kraken-beige border-opacity-10 rounded">
                      <div>
                        <div className="text-kraken-light font-mono text-sm font-bold">
                          {pollutant.toUpperCase()}
                        </div>
                        <div className="text-kraken-light font-mono text-xs opacity-70">
                          {data.value.toFixed(1)} {pollutant === 'pm25' || pollutant === 'pm10' ? 'μg/m³' : pollutant === 'co' ? 'ppm' : 'ppb'}
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        {getTrendIcon(data.trend)}
                        <span className={`font-mono text-xs ${getConfidenceColor(data.confidence)}`}>
                          {(data.confidence * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Major Factors */}
              <div className="bg-kraken-dark border border-kraken-beige border-opacity-20 rounded-lg p-4">
                <h3 className="text-kraken-beige font-mono text-sm uppercase mb-3">Key Influencing Factors</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {forecast.summary.majorFactors.map((factor, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-kraken-beige rounded-full"></div>
                      <span className="text-kraken-light font-mono text-sm">{factor}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AIForecastPanel;
