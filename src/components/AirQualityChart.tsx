import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { format } from 'date-fns';
import { AirQualityReading } from '../services/nasaApiService';

interface AirQualityChartProps {
  data: AirQualityReading[];
}

const AirQualityChart: React.FC<AirQualityChartProps> = ({ data }) => {
  // Transform data for the chart
  const chartData = data.map(reading => ({
    time: format(new Date(reading.timestamp), 'MM/dd HH:mm'),
    fullTime: reading.timestamp,
    AQI: reading.aqi,
    'PM2.5': reading.pm25,
    'PM10': reading.pm10,
    'NO₂': reading.no2,
    'O₃': reading.o3,
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-kraken-dark border border-kraken-beige border-opacity-30 rounded-lg p-3 shadow-lg">
          <p className="text-kraken-beige font-mono text-sm font-bold mb-2">
            {format(new Date(payload[0]?.payload?.fullTime || ''), 'MMM dd, yyyy HH:mm')}
          </p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-kraken-light font-mono text-xs">
              <span style={{ color: entry.color }}>●</span>
              {` ${entry.dataKey}: ${entry.value}${
                entry.dataKey === 'AQI' ? '' : 
                entry.dataKey.includes('PM') ? ' μg/m³' : ' ppb'
              }`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-kraken-light font-mono">
        No historical data available
      </div>
    );
  }

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(229, 191, 153, 0.2)" />
          <XAxis 
            dataKey="time" 
            stroke="#e5bf99"
            fontSize={10}
            fontFamily="JetBrains Mono"
          />
          <YAxis 
            stroke="#e5bf99"
            fontSize={10}
            fontFamily="JetBrains Mono"
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{ 
              color: '#e5bf99', 
              fontFamily: 'JetBrains Mono',
              fontSize: '12px'
            }}
          />
          <Line
            type="monotone"
            dataKey="AQI"
            stroke="#cd4634"
            strokeWidth={2}
            dot={{ fill: '#cd4634', strokeWidth: 2, r: 3 }}
            activeDot={{ r: 5, stroke: '#cd4634', strokeWidth: 2 }}
          />
          <Line
            type="monotone"
            dataKey="PM2.5"
            stroke="#10b981"
            strokeWidth={2}
            dot={{ fill: '#10b981', strokeWidth: 2, r: 3 }}
            activeDot={{ r: 5, stroke: '#10b981', strokeWidth: 2 }}
          />
          <Line
            type="monotone"
            dataKey="PM10"
            stroke="#f59e0b"
            strokeWidth={2}
            dot={{ fill: '#f59e0b', strokeWidth: 2, r: 3 }}
            activeDot={{ r: 5, stroke: '#f59e0b', strokeWidth: 2 }}
          />
          <Line
            type="monotone"
            dataKey="NO₂"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ fill: '#3b82f6', strokeWidth: 2, r: 3 }}
            activeDot={{ r: 5, stroke: '#3b82f6', strokeWidth: 2 }}
          />
          <Line
            type="monotone"
            dataKey="O₃"
            stroke="#8b5cf6"
            strokeWidth={2}
            dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 3 }}
            activeDot={{ r: 5, stroke: '#8b5cf6', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AirQualityChart;
