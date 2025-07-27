"use client";

import React, { useState } from 'react';
import { CLOUD_PROVIDERS } from '../lib/constants';

interface ControlsPanelProps {
  selectedCloudProvider: string | null;
  setSelectedCloudProvider: (provider: string | null) => void;
  showTooltips: boolean;
  setShowTooltips: (show: boolean) => void;
  mapView: '2d' | '3d';
  setMapView: (view: '2d' | '3d') => void;
  chartType: 'line' | 'bar' | 'area';
  setChartType: (type: 'line' | 'bar' | 'area') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  latencyRange: { min: number; max: number };
  setLatencyRange: (range: { min: number; max: number }) => void;
  showRealTime: boolean;
  setShowRealTime: (show: boolean) => void;
  showHistorical: boolean;
  setShowHistorical: (show: boolean) => void;
  showRegions: boolean;
  setShowRegions: (show: boolean) => void;
  showExportPanel: boolean;
  setShowExportPanel: (show: boolean) => void;
  useRealMeasurement: boolean;
  handleDataSourceToggle: () => void;
  autoRefresh: boolean;
  toggleAutoRefresh: (enabled: boolean) => void;
  refreshInterval: number;
  updateRefreshInterval: (interval: number) => void;
  timeRange: '1h' | '24h' | '7d' | '30d';
  changeTimeRange: (range: '1h' | '24h' | '7d' | '30d') => void;
  cacheEnabled: boolean;
  toggleCache: (enabled: boolean) => void;
  isMobile: boolean;
}

export default function ControlsPanel({
  selectedCloudProvider,
  setSelectedCloudProvider,
  showTooltips,
  setShowTooltips,
  mapView,
  setMapView,
  chartType,
  setChartType,
  searchQuery,
  setSearchQuery,
  latencyRange,
  setLatencyRange,
  showRealTime,
  setShowRealTime,
  showHistorical,
  setShowHistorical,
  showRegions,
  setShowRegions,
  showExportPanel,
  setShowExportPanel,
  useRealMeasurement,
  handleDataSourceToggle,
  autoRefresh,
  toggleAutoRefresh,
  refreshInterval,
  updateRefreshInterval,
  timeRange,
  changeTimeRange,
  cacheEnabled,
  toggleCache,
  isMobile
}: ControlsPanelProps) {
  const [isExpanded, setIsExpanded] = useState(!isMobile);

  return (
    <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50 shadow-sm p-3 sm:p-4 lg:p-6 mb-4 sm:mb-6">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Controls</h3>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1 sm:p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <svg className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {isExpanded && (
        <div className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                Search Exchanges
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or region..."
                className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                Cloud Provider
              </label>
              <select
                value={selectedCloudProvider || ''}
                onChange={(e) => setSelectedCloudProvider(e.target.value || null)}
                className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Providers</option>
                {Object.entries(CLOUD_PROVIDERS).map(([key, provider]) => (
                  <option key={key} value={key}>
                    {provider.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                Latency Range: {latencyRange.min}-{latencyRange.max}ms
              </label>
              <div className="space-y-1 sm:space-y-2">
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={latencyRange.min}
                  onChange={(e) => setLatencyRange({ ...latencyRange, min: parseInt(e.target.value) })}
                  className="w-full h-2 sm:h-3"
                />
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={latencyRange.max}
                  onChange={(e) => setLatencyRange({ ...latencyRange, max: parseInt(e.target.value) })}
                  className="w-full h-2 sm:h-3"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Map View
              </label>
              <div className="flex rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden">
                <button
                  onClick={() => setMapView('2d')}
                  className={`flex-1 px-3 py-2 text-sm font-medium transition-colors ${
                    mapView === '2d'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                  }`}
                >
                  2D
                </button>
                <button
                  onClick={() => setMapView('3d')}
                  className={`flex-1 px-3 py-2 text-sm font-medium transition-colors ${
                    mapView === '3d'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                  }`}
                >
                  3D
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Chart Type
              </label>
              <select
                value={chartType}
                onChange={(e) => setChartType(e.target.value as 'line' | 'bar' | 'area')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="line">Line</option>
                <option value="bar">Bar</option>
                <option value="area">Area</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Time Range
              </label>
              <select
                value={timeRange}
                onChange={(e) => changeTimeRange(e.target.value as '1h' | '24h' | '7d' | '30d')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="1h">1 Hour</option>
                <option value="24h">24 Hours</option>
                <option value="7d">7 Days</option>
                <option value="30d">30 Days</option>
              </select>
            </div>


            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Refresh: {refreshInterval / 1000}s
              </label>
              <select
                value={refreshInterval}
                onChange={(e) => updateRefreshInterval(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={5000}>5 seconds</option>
                <option value={10000}>10 seconds</option>
                <option value={30000}>30 seconds</option>
                <option value={60000}>1 minute</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="tooltips"
                checked={showTooltips}
                onChange={(e) => setShowTooltips(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="tooltips" className="text-sm text-gray-700 dark:text-gray-300">
                Tooltips
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="realtime"
                checked={showRealTime}
                onChange={(e) => setShowRealTime(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="realtime" className="text-sm text-gray-700 dark:text-gray-300">
                Real-time
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="historical"
                checked={showHistorical}
                onChange={(e) => setShowHistorical(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="historical" className="text-sm text-gray-700 dark:text-gray-300">
                Historical
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="regions"
                checked={showRegions}
                onChange={(e) => setShowRegions(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="regions" className="text-sm text-gray-700 dark:text-gray-300">
                Regions
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="autorefresh"
                checked={autoRefresh}
                onChange={(e) => toggleAutoRefresh(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="autorefresh" className="text-sm text-gray-700 dark:text-gray-300">
                Auto Refresh
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="cache"
                checked={cacheEnabled}
                onChange={(e) => toggleCache(e.target.checked)}
                className="rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <label htmlFor="cache" className="text-sm text-gray-700 dark:text-gray-300">
                API Cache
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="realsource"
                checked={useRealMeasurement}
                onChange={handleDataSourceToggle}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="realsource" className="text-sm text-gray-700 dark:text-gray-300">
                Real APIs
              </label>
            </div>
          </div>


          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setShowExportPanel(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
            >
              Export Data
            </button>
            
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCloudProvider(null);
                setLatencyRange({ min: 0, max: 200 });
              }}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
            >
              Reset Filters
            </button>
            
            <button
              onClick={() => {
                setShowTooltips(true);
                setShowRealTime(true);
                setShowHistorical(true);
                setShowRegions(true);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              Show All
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 