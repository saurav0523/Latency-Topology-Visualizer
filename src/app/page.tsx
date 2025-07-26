"use client";

import React, { useState, useEffect, useMemo } from "react";
import LatencyMap from "../components/Map";
import LatencyChart from "../components/LatencyChart";
import ControlsPanel from "../components/ControlsPanel";
import ExportPanel from "../components/ExportPanel";
import ThemeToggle from "../components/ThemeToggle";
import SkeletonLoader from "../components/SkeletonLoader";
import CacheStatus from "../components/CacheStatus";
import StableMap from "../components/StableMap";
import { useReduxLatency } from "../hooks/useReduxLatency";
import { useLatencyHistory } from "../hooks/useLatencyHistory";
import { performanceMonitor } from "../lib/api/performance-monitor";
import { useAppDispatch } from "../store/hooks";
import { generateTestData } from "../store/slices/latencySlice";

export default function Home() {
  const dispatch = useAppDispatch();
  const [useRealMeasurement, setUseRealMeasurement] = useState(false);
  const [selectedCloudProvider, setSelectedCloudProvider] = useState<string | null>(null);
  const [showTooltips, setShowTooltips] = useState(true);
  const [mapView, setMapView] = useState<'2d' | '3d'>('3d');
  const [chartType, setChartType] = useState<'line' | 'bar' | 'area'>('line');
  
  // Enhanced controls for GoQuant requirements
  const [searchQuery, setSearchQuery] = useState('');
  const [latencyRange, setLatencyRange] = useState({ min: 0, max: 200 });
  const [showRealTime, setShowRealTime] = useState(true);
  const [showHistorical, setShowHistorical] = useState(true);
  const [showRegions, setShowRegions] = useState(true);
  const [showExportPanel, setShowExportPanel] = useState(false);

  // Simplified loading states - removed complex skeleton logic
  const [showPerformanceMonitor, setShowPerformanceMonitor] = useState(false);

  // Mobile detection for responsive design
  const [isMobile, setIsMobile] = useState(false);

  // Debug logging removed for performance

  useEffect(() => {
    const checkMobile = () => {
      try {
        setIsMobile(window.innerWidth < 768);
              } catch (error) {
          setIsMobile(false);
        }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Performance monitoring setup
  useEffect(() => {
    try {
      performanceMonitor.startMonitoring();
      
      if (process.env.NODE_ENV === 'development') {
        setShowPerformanceMonitor(true);
      }
    } catch (error) {
      // Silent error handling
    }

    return () => {
      try {
        performanceMonitor.stopMonitoring();
      } catch (error) {
        // Silent error handling
      }
    };
  }, []);

  // Use Redux-based latency hook for real-time data
  const {
    data: latencyData,
    loading,
    error,
    lastUpdated,
    isClient,
    selectedExchange,
    averageLatency,
    exchangeCount,
    apiHealth,
    connectionStatus,
    refreshInterval,
    timeRange,
    autoRefresh,
    cacheEnabled,
    fetchData,
    selectExchange,
    changeTimeRange,
    updateRefreshInterval,
    toggleAutoRefresh,
    toggleCache,
  } = useReduxLatency();

  // Generate test data immediately on mount
  useEffect(() => {
    if (isClient) {
      dispatch(generateTestData());
    }
  }, [isClient, dispatch]);

  // Show chart for selected exchange
  const exchange = selectedExchange 
    ? latencyData?.find(e => e.exchange === selectedExchange) 
    : latencyData?.[0];
  
  const exchangeForChart = exchange || { exchange: "Loading...", latency: 0 };
  const history = useLatencyHistory(exchangeForChart.exchange, exchangeForChart.latency);
  
  // Handle data source toggle
  const handleDataSourceToggle = () => {
    const newUseRealMeasurement = !useRealMeasurement;
    setUseRealMeasurement(newUseRealMeasurement);
    if (fetchData) {
      setTimeout(() => fetchData(newUseRealMeasurement), 100);
    }
  };

  // Filter exchanges based on selected cloud provider
  const filteredExchanges = selectedCloudProvider 
    ? (latencyData?.filter(e => e.cloud === selectedCloudProvider) || [])
    : (latencyData || []);

  // Ensure map always has data to display, even during loading
  const mapData = useMemo(() => {
    return filteredExchanges.length > 0 ? filteredExchanges : latencyData || [];
  }, [filteredExchanges, latencyData]);

  // Safety check for SSR - show minimal loading
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-blue-800 dark:text-blue-200">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Latency Topology Visualizer</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Real-time exchange performance monitoring</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Connection Status */}
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${
                  connectionStatus === 'connected' ? 'bg-green-500' :
                  connectionStatus === 'connecting' ? 'bg-yellow-500' :
                  'bg-red-500'
                }`}></div>
                <span className="text-sm text-gray-600 dark:text-gray-300 capitalize">
                  {connectionStatus || 'disconnected'}
                </span>
              </div>
              
              {/* Cache Status */}
              <CacheStatus cacheEnabled={cacheEnabled} lastUpdated={lastUpdated} />
              
              {/* Performance Toggle */}
              <button
                onClick={() => setShowPerformanceMonitor(!showPerformanceMonitor)}
                className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                {showPerformanceMonitor ? 'Hide' : 'Show'} Performance
              </button>
              
              {/* Test Data Button */}
                              <button
                  onClick={() => {
                    dispatch(generateTestData());
                  }}
                className="px-3 py-1 text-sm bg-green-100 dark:bg-green-700 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-200 dark:hover:bg-green-600 transition-colors"
              >
                Generate Test Data
              </button>
              
              {/* Theme Toggle */}
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="text-red-800 dark:text-red-200 font-medium">Connection Error</span>
            </div>
            <p className="text-red-700 dark:text-red-300 text-sm mt-1">{error}</p>
          </div>
        )}

        {/* Loading indicator only when actually loading and no data */}
        {loading && (!latencyData || latencyData.length === 0) && (
          <div className="mb-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 dark:border-blue-400"></div>
              <span className="text-blue-800 dark:text-blue-200 font-medium">
                Loading exchange data...
              </span>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50 shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Exchanges</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{exchangeCount}</p>
              </div>
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50 shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Latency</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{averageLatency}ms</p>
              </div>
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50 shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Refresh Rate</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{refreshInterval / 1000}s</p>
              </div>
              <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50 shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">API Health</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {apiHealth?.health >= 90 ? '🟢' : 
                   apiHealth?.health >= 70 ? '🟡' : 
                   apiHealth?.health >= 50 ? '🟠' : '🔴'}
                </p>
              </div>
              <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-orange-600 dark:text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50 shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Last Updated</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {lastUpdated ? new Date(lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--'}
                </p>
              </div>
              <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Controls Panel */}
        <ControlsPanel
          selectedCloudProvider={selectedCloudProvider}
          setSelectedCloudProvider={setSelectedCloudProvider}
          showTooltips={showTooltips}
          setShowTooltips={setShowTooltips}
          mapView={mapView}
          setMapView={setMapView}
          chartType={chartType}
          setChartType={setChartType}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          latencyRange={latencyRange}
          setLatencyRange={setLatencyRange}
          showRealTime={showRealTime}
          setShowRealTime={setShowRealTime}
          showHistorical={showHistorical}
          setShowHistorical={setShowHistorical}
          showRegions={showRegions}
          setShowRegions={setShowRegions}
          showExportPanel={showExportPanel}
          setShowExportPanel={setShowExportPanel}
          useRealMeasurement={useRealMeasurement}
          handleDataSourceToggle={handleDataSourceToggle}
          autoRefresh={autoRefresh}
          toggleAutoRefresh={toggleAutoRefresh}
          refreshInterval={refreshInterval}
          updateRefreshInterval={updateRefreshInterval}
          timeRange={timeRange}
          changeTimeRange={changeTimeRange}
          cacheEnabled={cacheEnabled}
          toggleCache={toggleCache}
          isMobile={isMobile}
        />

        <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'}`}>
          {/* Global Latency Map */}
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Global Latency Map</h2>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">View:</span>
                <div className="flex rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden">
                  <button
                    onClick={() => setMapView('2d')}
                    className={`px-3 py-1 text-sm font-medium transition-colors ${
                      mapView === '2d'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                    }`}
                  >
                    2D
                  </button>
                  <button
                    onClick={() => setMapView('3d')}
                    className={`px-3 py-1 text-sm font-medium transition-colors ${
                      mapView === '3d'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                    }`}
                  >
                    3D
                  </button>
                </div>
              </div>
            </div>
            <StableMap 
              data={mapData} 
              selectedExchange={selectedExchange}
              onExchangeSelect={selectExchange}
              showTooltips={showTooltips}
              view={mapView}
              showRegions={showRegions}
              searchQuery={searchQuery}
              latencyRange={latencyRange}
            />
          </div>
          {/* Latency Trends Chart */}
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Latency Trends</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {selectedExchange ? `${selectedExchange} performance over time` : 'Select an exchange to view trends'}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">Chart:</span>
                <select
                  value={chartType}
                  onChange={(e) => setChartType(e.target.value as 'line' | 'bar' | 'area')}
                  className="px-2 py-1 rounded border border-gray-300 dark:border-gray-600 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="line" className="text-gray-900 dark:text-white">Line</option>
                  <option value="bar" className="text-gray-900 dark:text-white">Bar</option>
                  <option value="area" className="text-gray-900 dark:text-white">Area</option>
                </select>
              </div>
            </div>
            <LatencyChart 
              data={history.data} 
              exchange={exchangeForChart.exchange} 
              chartType={chartType}
            />
          </div>
        </div>

        {/* Export Panel */}
        {showExportPanel && (
          <ExportPanel
            isOpen={showExportPanel}
            onClose={() => setShowExportPanel(false)}
            data={latencyData}
          />
        )}
      </main>

      {/* Performance Monitor */}
      {showPerformanceMonitor && (
        <div className="fixed bottom-4 right-4 z-50 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 max-w-sm">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Performance Monitor</h3>
          <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
            <div>FPS: {performanceMonitor?.getCurrentMetrics?.()?.fps || 0}</div>
            <div>Memory: {performanceMonitor?.getCurrentMetrics?.()?.memoryUsage || 0}MB</div>
            <div>Render: {performanceMonitor?.getCurrentMetrics?.()?.renderTime || 0}ms</div>
          </div>
        </div>
      )}
    </div>
  );
}
