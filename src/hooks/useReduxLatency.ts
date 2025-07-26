import { useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { cloudflareApiService } from '../lib/api/cloudflare-service';
import {
  fetchLatencyData,
  fetchHistoricalData,
  setSelectedExchange,
  setTimeRange,
  setRefreshInterval,
  setCacheEnabled,
  setError,
  selectLatencyData,
  selectHistoricalData,
  selectLoading,
  selectError,
  selectLastUpdated,
  selectSelectedExchange,
  selectTimeRange,
  selectRefreshInterval,
  selectCacheEnabled,
  selectExchangeByLatency,
  selectAverageLatency,
  selectExchangeCount,
  selectAutoRefresh,
  setAutoRefresh,
  clearError,
  updateExchangeLatency,
} from '../store/slices/latencySlice';
import {
  setConnectionStatus,
  setLastApiCall,
  setApiTokenValid,
  updateEndpointStats,
  selectConnectionStatus,
  selectApiHealth,
} from '../store/slices/apiSlice';
import {
  setIsClient,
  setLastUpdated,
  selectIsClient,
  selectLastUpdated as selectUILastUpdated,
} from '../store/slices/uiSlice';

export const useReduxLatency = () => {
  const dispatch = useAppDispatch();

  // Selectors
  const data = useAppSelector(selectLatencyData);
  const historicalData = useAppSelector(selectHistoricalData);
  const loading = useAppSelector(selectLoading);
  const error = useAppSelector(selectError);
  const lastUpdated = useAppSelector(selectLastUpdated);
  const selectedExchange = useAppSelector(selectSelectedExchange);
  const timeRange = useAppSelector(selectTimeRange);
  const refreshInterval = useAppSelector(selectRefreshInterval);
  const cacheEnabled = useAppSelector(selectCacheEnabled);
  const connectionStatus = useAppSelector(selectConnectionStatus);
  const apiHealth = useAppSelector(selectApiHealth);
  const isClient = useAppSelector(selectIsClient);
  const uiLastUpdated = useAppSelector(selectUILastUpdated);
  const autoRefresh = useAppSelector(selectAutoRefresh);

  // Computed selectors
  const exchangeByLatency = useAppSelector(selectExchangeByLatency);
  const averageLatency = useAppSelector(selectAverageLatency);
  const exchangeCount = useAppSelector(selectExchangeCount);

  // Debug logging removed for performance

  // Set client flag on mount
  useEffect(() => {
    dispatch(setIsClient(true));
  }, [dispatch]);

  // Fetch data function
  const fetchData = useCallback(async (useRealMeasurement: boolean = false) => {
    try {
      dispatch(setConnectionStatus('connecting'));
      dispatch(setError(null)); // Clear any previous errors
      const startTime = Date.now();
      
      // Use the proper Redux async thunk
      await dispatch(fetchLatencyData()).unwrap();
      
      const responseTime = Date.now() - startTime;
      dispatch(updateEndpointStats({
        endpoint: 'latency-data',
        success: true,
        responseTime,
      }));
      
      dispatch(setConnectionStatus('connected'));
      dispatch(setLastApiCall(new Date().toISOString()));
      dispatch(setLastUpdated(new Date().toISOString()));
      dispatch(setApiTokenValid(true));
      
    } catch (error) {
      
      dispatch(setConnectionStatus('error'));
      dispatch(updateEndpointStats({
        endpoint: 'latency-data',
        success: false,
        responseTime: 0,
      }));
      dispatch(setApiTokenValid(false));
      
      // Set error message
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch data';
      dispatch(setError(errorMessage));
    }
  }, [dispatch]);

  // Fetch historical data function
  const fetchHistoricalDataForExchange = useCallback(async (exchange: string, range: '1h' | '24h' | '7d' | '30d') => {
    try {
      const startTime = Date.now();
      
      await dispatch(fetchHistoricalData({ exchange, timeRange: range })).unwrap();
      
      const responseTime = Date.now() - startTime;
      dispatch(updateEndpointStats({
        endpoint: 'historical-data',
        success: true,
        responseTime,
      }));
      
    } catch (error) {
      dispatch(updateEndpointStats({
        endpoint: 'historical-data',
        success: false,
        responseTime: 0,
      }));
      
      // Set error message if not already set
      if (!error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch historical data';
        dispatch(setError(errorMessage));
      }
    }
  }, [dispatch]);

  // Actions
  const selectExchange = useCallback((exchange: string | null) => {
    dispatch(setSelectedExchange(exchange));
  }, [dispatch]);

  const changeTimeRange = useCallback((range: '1h' | '24h' | '7d' | '30d') => {
    dispatch(setTimeRange(range));
  }, [dispatch]);

  const updateRefreshInterval = useCallback((interval: number) => {
    dispatch(setRefreshInterval(interval));
  }, [dispatch]);

  const toggleAutoRefresh = useCallback((enabled: boolean) => {
    dispatch(setAutoRefresh(enabled));
  }, [dispatch]);

  const toggleCache = useCallback((enabled: boolean) => {
    dispatch(setCacheEnabled(enabled));
    // Also update the service cache setting
    cloudflareApiService.setCacheEnabled(enabled);
  }, [dispatch]);

  // Auto-refresh effect - simplified to not interfere with initial display
  useEffect(() => {
    if (!isClient) return;

    console.log('🔄 Auto-refresh effect triggered, isClient:', isClient);

    // Only set up interval if auto-refresh is enabled
    if (autoRefresh) {
      const interval = setInterval(() => {
        console.log('🔄 Auto-refresh interval triggered');
        
        // If cache is enabled, check if we have recent data before fetching
        if (cacheEnabled && data && data.length > 0) {
          const lastUpdate = lastUpdated ? new Date(lastUpdated).getTime() : 0;
          const now = Date.now();
          const timeSinceLastUpdate = now - lastUpdate;
          
          // If data is less than 30 seconds old, skip the fetch to avoid loading flicker
          if (timeSinceLastUpdate < 30000) {
            console.log('⏭️ Skipping auto-refresh - data is recent enough');
            return;
          }
        }
        
        fetchData();
      }, refreshInterval);

      return () => clearInterval(interval);
    }
  }, [isClient, fetchData, refreshInterval, autoRefresh, cacheEnabled, data, lastUpdated]); // Added cache and data dependencies

  // Fetch historical data when exchange or time range changes
  useEffect(() => {
    if (selectedExchange && isClient) {
      fetchHistoricalDataForExchange(selectedExchange, timeRange);
    }
  }, [selectedExchange, timeRange, fetchHistoricalDataForExchange, isClient]);

  return {
    // State
    data,
    historicalData,
    loading,
    error,
    lastUpdated,
    selectedExchange,
    timeRange,
    refreshInterval,
    cacheEnabled,
    connectionStatus,
    apiHealth,
    isClient,
    uiLastUpdated,
    autoRefresh,
    
    // Computed data
    exchangeByLatency,
    averageLatency,
    exchangeCount,
    
    // Actions
    fetchData,
    fetchHistoricalData: fetchHistoricalDataForExchange,
    selectExchange,
    changeTimeRange,
    updateRefreshInterval,
    toggleAutoRefresh,
    toggleCache,
  };
}; 