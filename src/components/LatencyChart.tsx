"use client";

import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
  Cell
} from 'recharts';

interface LatencyChartProps {
  data: Array<{ time: string; latency: number }>;
  exchange: string;
  chartType: 'line' | 'bar' | 'area';
}

export default function LatencyChart({ data, exchange, chartType }: LatencyChartProps) {
  // Process data for better visualization
  const processedData = useMemo(() => {
    if (!data || data.length === 0) {
      // Generate sample data if no data available
      const now = Date.now();
      return Array.from({ length: 24 }, (_, i) => ({
        time: new Date(now - (24 - i) * 60 * 60 * 1000).toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        latency: Math.floor(20 + Math.random() * 30 + Math.sin(i * 0.5) * 5)
      }));
    }
    return data;
  }, [data]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (!processedData || processedData.length === 0) return null;
    
    const latencies = processedData.map(d => d.latency);
    const min = Math.min(...latencies);
    const max = Math.max(...latencies);
    const avg = latencies.reduce((sum, val) => sum + val, 0) / latencies.length;
    
    return { min, max, avg };
  }, [processedData]);

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="text-gray-600 dark:text-gray-400">{`Time: ${label}`}</p>
          <p className="text-blue-600 dark:text-blue-400 font-semibold">
            {`Latency: ${payload[0].value}ms`}
          </p>
        </div>
      );
    }
    return null;
  };

  // Get color based on latency value
  const getLatencyColor = (latency: number) => {
    if (latency < 30) return '#22c55e'; // Green for low latency
    if (latency < 60) return '#eab308'; // Yellow for medium latency
    return '#ef4444'; // Red for high latency
  };

  // Render chart based on type
  const renderChart = () => {
    const commonProps = {
      data: processedData,
      margin: { top: 20, right: 30, left: 20, bottom: 5 }
    };

    switch (chartType) {
      case 'line':
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="time" 
              stroke="#9ca3af"
              fontSize={12}
              tick={{ fill: '#9ca3af' }}
            />
            <YAxis 
              stroke="#9ca3af"
              fontSize={12}
              tick={{ fill: '#9ca3af' }}
              label={{ value: 'Latency (ms)', angle: -90, position: 'insideLeft', fill: '#9ca3af' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="latency" 
              stroke="#3b82f6" 
              strokeWidth={2}
              dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
            />
          </LineChart>
        );
      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="time" 
              stroke="#9ca3af"
              fontSize={12}
              tick={{ fill: '#9ca3af' }}
            />
            <YAxis 
              stroke="#9ca3af"
              fontSize={12}
              tick={{ fill: '#9ca3af' }}
              label={{ value: 'Latency (ms)', angle: -90, position: 'insideLeft', fill: '#9ca3af' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="latency" 
              fill="#3b82f6"
              radius={[4, 4, 0, 0]}
            >
              {processedData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getLatencyColor(entry.latency)} />
              ))}
            </Bar>
          </BarChart>
        );
      case 'area':
        return (
          <AreaChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="time" 
              stroke="#9ca3af"
              fontSize={12}
              tick={{ fill: '#9ca3af' }}
            />
            <YAxis 
              stroke="#9ca3af"
              fontSize={12}
              tick={{ fill: '#9ca3af' }}
              label={{ value: 'Latency (ms)', angle: -90, position: 'insideLeft', fill: '#9ca3af' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey="latency" 
              stroke="#3b82f6" 
              fill="#3b82f6"
              fillOpacity={0.3}
              strokeWidth={2}
            />
          </AreaChart>
        );
      default:
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="time" 
              stroke="#9ca3af"
              fontSize={12}
              tick={{ fill: '#9ca3af' }}
            />
            <YAxis 
              stroke="#9ca3af"
              fontSize={12}
              tick={{ fill: '#9ca3af' }}
              label={{ value: 'Latency (ms)', angle: -90, position: 'insideLeft', fill: '#9ca3af' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="latency" 
              stroke="#3b82f6" 
              strokeWidth={2}
              dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
            />
          </LineChart>
        );
    }
  };

  return (
    <div className="w-full h-full space-y-4">
      {/* Chart Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {exchange} Latency Trends
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Historical performance data over time
          </p>
        </div>
        
        {/* Statistics */}
        {stats && (
          <div className="flex space-x-4 text-sm">
            <div className="text-center">
              <div className="text-green-600 dark:text-green-400 font-semibold">
                {stats.min}ms
              </div>
              <div className="text-gray-500 dark:text-gray-400">Min</div>
            </div>
            <div className="text-center">
              <div className="text-yellow-600 dark:text-yellow-400 font-semibold">
                {stats.avg.toFixed(1)}ms
              </div>
              <div className="text-gray-500 dark:text-gray-400">Avg</div>
            </div>
            <div className="text-center">
              <div className="text-red-600 dark:text-red-400 font-semibold">
                {stats.max}ms
              </div>
              <div className="text-gray-500 dark:text-gray-400">Max</div>
            </div>
          </div>
        )}
      </div>

      {/* Chart */}
      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>

      {/* Chart Legend */}
      <div className="flex items-center justify-center space-x-6 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="text-gray-600 dark:text-gray-400">Low (&lt;30ms)</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <span className="text-gray-600 dark:text-gray-400">Medium (30-60ms)</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <span className="text-gray-600 dark:text-gray-400">High (&gt;60ms)</span>
        </div>
      </div>

      {/* Data Summary */}
      {processedData.length > 0 && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
            Data Summary
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-500 dark:text-gray-400">Data Points:</span>
              <span className="ml-2 font-semibold text-gray-900 dark:text-white">
                {processedData.length}
              </span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Time Range:</span>
              <span className="ml-2 font-semibold text-gray-900 dark:text-white">
                {processedData[0]?.time} - {processedData[processedData.length - 1]?.time}
              </span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Chart Type:</span>
              <span className="ml-2 font-semibold text-gray-900 dark:text-white capitalize">
                {chartType}
              </span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Exchange:</span>
              <span className="ml-2 font-semibold text-gray-900 dark:text-white">
                {exchange}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 