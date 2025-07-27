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

  const exchangeByLatency = useAppSelector(selectExchangeByLatency);
  const averageLatency = useAppSelector(selectAverageLatency);
  const exchangeCount = useAppSelector(selectExchangeCount);


  useEffect(() => {
    dispatch(setIsClient(true));
  }, [dispatch]);

  const fetchData = useCallback(async (useRealMeasurement: boolean = false) => {
    try {
      dispatch(setConnectionStatus('connecting'));
      dispatch(setError(null)); 
      const startTime = Date.now();
      
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
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch data';
      dispatch(setError(errorMessage));
    }
  }, [dispatch]);


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
      if (!error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch historical data';
        dispatch(setError(errorMessage));
      }
    }
  }, [dispatch]);

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
    cloudflareApiService.setCacheEnabled(enabled);
  }, [dispatch]);

  useEffect(() => {
    if (!isClient) return;
    console.log('Auto-refresh effect triggered, isClient:', isClient);
    if (autoRefresh) {
      const interval = setInterval(() => {
        if (cacheEnabled && data && data.length > 0) {
          const lastUpdate = lastUpdated ? new Date(lastUpdated).getTime() : 0;
          const now = Date.now();
          const timeSinceLastUpdate = now - lastUpdate;
          if (timeSinceLastUpdate < 30000) {
            console.log('⏭️ Skipping auto-refresh - data is recent enough');
            return;
          }
        }
        
        fetchData();
      }, refreshInterval);

      return () => clearInterval(interval);
    }
  }, [isClient, fetchData, refreshInterval, autoRefresh, cacheEnabled, data, lastUpdated]); 
  useEffect(() => {
    if (selectedExchange && isClient) {
      fetchHistoricalDataForExchange(selectedExchange, timeRange);
    }
  }, [selectedExchange, timeRange, fetchHistoricalDataForExchange, isClient]);

  return {
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
    exchangeByLatency,
    averageLatency,
    exchangeCount,
    fetchData,
    fetchHistoricalData: fetchHistoricalDataForExchange,
    selectExchange,
    changeTimeRange,
    updateRefreshInterval,
    toggleAutoRefresh,
    toggleCache,
  };
}; 