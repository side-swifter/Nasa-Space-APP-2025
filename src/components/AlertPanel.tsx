import React from 'react';
import { AlertTriangle, Info, CheckCircle, XCircle } from 'lucide-react';
import { AirQualityReading } from '../services/nasaApiService';

interface AlertPanelProps {
  currentAirQuality: AirQualityReading | null;
}

interface Alert {
  id: string;
  type: 'info' | 'warning' | 'danger' | 'success';
  title: string;
  message: string;
  timestamp: string;
}

const AlertPanel: React.FC<AlertPanelProps> = ({ currentAirQuality }) => {
  // Generate mock alerts based on air quality data
  const generateAlerts = (): Alert[] => {
    const alerts: Alert[] = [];
    const now = new Date();

    if (!currentAirQuality) {
      return [{
        id: '1',
        type: 'info',
        title: 'No Data Available',
        message: 'Air quality data is currently unavailable for your location.',
        timestamp: now.toISOString(),
      }];
    }

    // AQI-based alerts
    if (currentAirQuality.aqi > 150) {
      alerts.push({
        id: '1',
        type: 'danger',
        title: 'Unhealthy Air Quality Alert',
        message: 'Air quality is unhealthy. Limit outdoor activities and consider wearing a mask.',
        timestamp: now.toISOString(),
      });
    } else if (currentAirQuality.aqi > 100) {
      alerts.push({
        id: '2',
        type: 'warning',
        title: 'Sensitive Groups Advisory',
        message: 'Air quality may affect sensitive individuals. Consider reducing outdoor activities.',
        timestamp: now.toISOString(),
      });
    } else if (currentAirQuality.aqi <= 50) {
      alerts.push({
        id: '3',
        type: 'success',
        title: 'Good Air Quality',
        message: 'Air quality is good. Perfect conditions for outdoor activities.',
        timestamp: now.toISOString(),
      });
    }

    // PM2.5 specific alerts
    if (currentAirQuality.pm25 > 35) {
      alerts.push({
        id: '4',
        type: 'warning',
        title: 'High PM2.5 Levels',
        message: `PM2.5 levels are elevated at ${currentAirQuality.pm25} μg/m³. Consider indoor activities.`,
        timestamp: now.toISOString(),
      });
    }

    // Ozone alerts
    if (currentAirQuality.o3 > 70) {
      alerts.push({
        id: '5',
        type: 'warning',
        title: 'Elevated Ozone Levels',
        message: 'Ground-level ozone is high. Avoid outdoor exercise during peak hours.',
        timestamp: now.toISOString(),
      });
    }

    // Add some general info alerts
    alerts.push({
      id: '6',
      type: 'info',
      title: 'Data Source Update',
      message: 'Air quality data updated from NASA TEMPO satellite and ground stations.',
      timestamp: new Date(now.getTime() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
    });

    return alerts.slice(0, 4); // Limit to 4 alerts
  };

  const alerts = generateAlerts();

  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'danger':
        return <XCircle className="w-5 h-5 text-red-400" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'info':
      default:
        return <Info className="w-5 h-5 text-blue-400" />;
    }
  };

  const getAlertBorderColor = (type: Alert['type']) => {
    switch (type) {
      case 'danger':
        return 'border-red-400';
      case 'warning':
        return 'border-yellow-400';
      case 'success':
        return 'border-green-400';
      case 'info':
      default:
        return 'border-blue-400';
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="bg-kraken-dark border border-kraken-beige border-opacity-20 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-kraken-beige font-mono">
          Health Alerts & Notifications
        </h3>
        <div className="text-sm text-kraken-light opacity-70 font-mono">
          {alerts.length} active
        </div>
      </div>

      <div className="space-y-3">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`border-l-4 ${getAlertBorderColor(alert.type)} bg-kraken-dark bg-opacity-50 p-3 rounded-r-lg`}
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-0.5">
                {getAlertIcon(alert.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-sm font-medium text-kraken-light font-mono">
                    {alert.title}
                  </h4>
                  <span className="text-xs text-kraken-light opacity-60 font-mono">
                    {formatTime(alert.timestamp)}
                  </span>
                </div>
                <p className="text-sm text-kraken-light opacity-80 font-mono">
                  {alert.message}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Health Recommendations */}
      <div className="mt-6 pt-4 border-t border-kraken-beige border-opacity-20">
        <h4 className="text-sm font-bold text-kraken-beige font-mono mb-3">
          Health Recommendations
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
          <div className="flex items-center space-x-2 text-kraken-light">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span>Check air quality before outdoor activities</span>
          </div>
          <div className="flex items-center space-x-2 text-kraken-light">
            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            <span>Use air purifiers indoors when AQI {'>'}100</span>
          </div>
          <div className="flex items-center space-x-2 text-kraken-light">
            <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
            <span>Wear N95 masks when AQI {'>'} 150</span>
          </div>
          <div className="flex items-center space-x-2 text-kraken-light">
            <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
            <span>Stay hydrated and avoid strenuous exercise</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertPanel;
