import React, { useState } from 'react';
import DataInfoModal from './DataInfoModal';

interface MetricCardProps {
  title: string;
  value: number;
  unit: string;
  icon: React.ReactNode;
  color: string;
  trend?: 'up' | 'down' | 'stable';
  dataType?: 'pm25' | 'pm10' | 'no2' | 'o3' | 'so2' | 'co' | 'aqi';
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, unit, icon, color, trend, dataType }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getTrendIndicator = () => {
    if (trend === undefined) return null;
    
    switch (trend) {
      case 'up':
        return (
          <div className="flex items-center text-red-400 text-xs font-mono">
            <span>↗</span>
            <span className="ml-1">Rising</span>
          </div>
        );
      case 'down':
        return (
          <div className="flex items-center text-green-400 text-xs font-mono">
            <span>↘</span>
            <span className="ml-1">Falling</span>
          </div>
        );
      case 'stable':
        return (
          <div className="flex items-center text-gray-400 text-xs font-mono">
            <span>→</span>
            <span className="ml-1">Stable</span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <div 
        className="metric-card cursor-pointer hover:bg-kraken-beige hover:bg-opacity-5 transition-colors rounded-lg p-1 -m-1"
        onClick={() => dataType && setIsModalOpen(true)}
      >
        <div className="flex items-center justify-between mb-3">
          <div className={`${color} flex items-center space-x-2`}>
            {icon}
            <span className="font-mono text-sm font-medium text-kraken-light">
              {title}
            </span>
          </div>
          {getTrendIndicator()}
        </div>
        
        <div className="flex items-baseline space-x-2">
          <span className="text-2xl font-bold text-kraken-beige font-mono">
            {value.toFixed(1)}
          </span>
          <span className="text-sm text-kraken-light opacity-70 font-mono">
            {unit}
          </span>
        </div>
        
        {/* Health Impact Indicator */}
        <div className="mt-3 pt-3 border-t border-kraken-beige border-opacity-20">
          <div className="text-xs font-mono text-kraken-light opacity-70">
            {getHealthImpact(title, value)}
          </div>
        </div>

        {/* Click hint */}
        {dataType && (
          <div className="mt-2 text-xs font-mono text-kraken-light opacity-50 text-center">
            Click for details
          </div>
        )}
      </div>

      {/* Modal */}
      {dataType && (
        <DataInfoModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={title}
          value={value}
          unit={unit}
          type={dataType}
          icon={icon}
          color={color}
        />
      )}
    </>
  );
};

const getHealthImpact = (pollutant: string, value: number): string => {
  switch (pollutant) {
    case 'NO₂':
      if (value <= 53) return 'Good';
      if (value <= 100) return 'Moderate';
      if (value <= 360) return 'Unhealthy for Sensitive';
      return 'Unhealthy';
      
    case 'O₃':
      if (value <= 54) return 'Good';
      if (value <= 70) return 'Moderate';
      if (value <= 85) return 'Unhealthy for Sensitive';
      return 'Unhealthy';
      
    case 'PM2.5':
      if (value <= 12) return 'Good';
      if (value <= 35.4) return 'Moderate';
      if (value <= 55.4) return 'Unhealthy for Sensitive';
      return 'Unhealthy';
      
    case 'PM10':
      if (value <= 54) return 'Good';
      if (value <= 154) return 'Moderate';
      if (value <= 254) return 'Unhealthy for Sensitive';
      return 'Unhealthy';
      
    default:
      return 'Unknown';
  }
};

export default MetricCard;
