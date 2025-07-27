/* eslint-disable @typescript-eslint/no-unused-vars */
import { createSlice, createAsyncThunk, createSelector, PayloadAction } from '@reduxjs/toolkit';
import { cloudflareApiService, LatencyData } from '../../lib/api/cloudflare-service';
import { LATENCY_THRESHOLDS } from '../../lib/constants';


export interface LatencyState {
  data: LatencyData[];
  historicalData: { [exchange: string]: { time: string; latency: number }[] };
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
  selectedExchange: string | null;
  timeRange: '1h' | '24h' | '7d' | '30d';
  refreshInterval: number;
  cacheEnabled: boolean;
  autoRefresh: boolean;
}


const initialState: LatencyState = {
  data: [
    {
      exchange: "Binance",
      location: { lat: 1.3521, lng: 103.8198 },
      cloud: "AWS",
      region: "Asia Pacific",
      latency: 25,
      timestamp: new Date().toISOString()
    },
    {
      exchange: "OKX",
      location: { lat: 22.3193, lng: 114.1694 },
      cloud: "AWS",
      region: "Asia Pacific",
      latency: 30,
      timestamp: new Date().toISOString()
    },
    {
      exchange: "Coinbase",
      location: { lat: 37.7749, lng: -122.4194 },
      cloud: "AWS",
      region: "US West",
      latency: 20,
      timestamp: new Date().toISOString()
    },
    {
      exchange: "Kraken",
      location: { lat: 47.6062, lng: -122.3321 },
      cloud: "Google Cloud",
      region: "US West",
      latency: 35,
      timestamp: new Date().toISOString()
    },
    {
      exchange: "Bitfinex",
      location: { lat: 40.7128, lng: -74.0060 },
      cloud: "AWS",
      region: "US East",
      latency: 28,
      timestamp: new Date().toISOString()
    },
    {
      exchange: "KuCoin",
      location: { lat: 39.9042, lng: 116.4074 },
      cloud: "Alibaba Cloud",
      region: "Asia Pacific",
      latency: 45,
      timestamp: new Date().toISOString()
    },
    {
      exchange: "Bybit",
      location: { lat: 1.3521, lng: 103.8198 },
      cloud: "AWS",
      region: "Asia Pacific",
      latency: 32,
      timestamp: new Date().toISOString()
    },
    {
      exchange: "Gate.io",
      location: { lat: 22.3193, lng: 114.1694 },
      cloud: "Google Cloud",
      region: "Asia Pacific",
      latency: 38,
      timestamp: new Date().toISOString()
    }
  ],
  historicalData: {},
  loading: false, 
  error: null,
  lastUpdated: new Date().toISOString(),
  selectedExchange: null,
  timeRange: '24h',
  refreshInterval: 10000,
  cacheEnabled: true,
  autoRefresh: true,
};


export const fetchLatencyData = createAsyncThunk(
  'latency/fetchData',
  async (_, { rejectWithValue, getState }) => {
    try {
      console.log('🔄 fetchLatencyData async thunk started');
      

      const state = getState() as { latency: LatencyState };
      if (state.latency.cacheEnabled && state.latency.data && state.latency.data.length > 0) {
        const lastUpdate = state.latency.lastUpdated ? new Date(state.latency.lastUpdated).getTime() : 0;
        const now = Date.now();
        const timeSinceLastUpdate = now - lastUpdate;
        
        if (timeSinceLastUpdate < 30000) {
          console.log(' Returning cached data - no loading state needed');
          return state.latency.data;
        }
      }
      

      try {
        await cloudflareApiService.verifyToken();
        console.log(' Token verification successful');
      } catch (error) {
        console.log(' Token verification failed, using simulated data');
        const simulatedData = cloudflareApiService.generateSimulatedLatencyData();
        console.log(' Generated simulated data:', simulatedData.length, 'items');
        return simulatedData;
      }

      try {
        const radarData = await cloudflareApiService.getLatencyData();
        console.log(' API data fetched successfully');
        return cloudflareApiService.transformToLatencyData();
      } catch (error) {
        console.log(' API fetch failed, using simulated data');
        const simulatedData = cloudflareApiService.generateSimulatedLatencyData();
        console.log(' Generated simulated data:', simulatedData.length, 'items');
        return simulatedData;
      }
    } catch (error) {
      console.error(' Data fetch error:', error);
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch data');
    }
  }
);

export const generateTestData = createAsyncThunk(
  'latency/generateTestData',
  async (_, { rejectWithValue }) => {
    try {
      console.log('Generating test data...');
      const testData = cloudflareApiService.generateSimulatedLatencyData();
      console.log('Test data generated:', testData.length, 'items');
      return testData;
    } catch (error) {
      console.error('Test data generation error:', error);
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to generate test data');
    }
  }
);

export const fetchHistoricalData = createAsyncThunk(
  'latency/fetchHistoricalData',
  async ({ exchange, timeRange }: { exchange: string; timeRange: '1h' | '24h' | '7d' | '30d' }, { rejectWithValue }) => {
    try {
      const now = Date.now();
      const dataPoints = timeRange === '1h' ? 60 : 
                        timeRange === '24h' ? 1440 : 
                        timeRange === '7d' ? 10080 : 43200;
      
      const interval = timeRange === '1h' ? 60 * 1000 :
                      timeRange === '24h' ? 60 * 1000 :
                      timeRange === '7d' ? 10 * 60 * 1000 : 60 * 60 * 1000;

      const historicalData = Array.from({ length: dataPoints }, (_, i) => {
        const timestamp = now - (dataPoints - i) * interval;
        const baseLatency = 20 + Math.random() * 30;
        const variation = Math.sin(i * 0.1) * 5 + (Math.random() - 0.5) * 3;
        
        return {
          time: new Date(timestamp).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          latency: Math.max(1, Math.round(baseLatency + variation))
        };
      });

      return { exchange, data: historicalData };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch historical data');
    }
  }
);


const latencySlice = createSlice({
  name: 'latency',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setLastUpdated: (state, action: PayloadAction<Date>) => {
      state.lastUpdated = action.payload.toISOString();
    },
    setSelectedExchange: (state, action: PayloadAction<string | null>) => {
      state.selectedExchange = action.payload;
    },
    setTimeRange: (state, action: PayloadAction<'1h' | '24h' | '7d' | '30d'>) => {
      state.timeRange = action.payload;
    },
    setRefreshInterval: (state, action: PayloadAction<number>) => {
      state.refreshInterval = action.payload;
    },
    setCacheEnabled: (state, action: PayloadAction<boolean>) => {
      state.cacheEnabled = action.payload;
    },
    setAutoRefresh: (state, action: PayloadAction<boolean>) => {
      state.autoRefresh = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    updateExchangeLatency: (state, action: PayloadAction<{ exchange: string; latency: number }>) => {
      const { exchange, latency } = action.payload;
      const exchangeData = state.data.find(item => item.exchange === exchange);
      if (exchangeData) {
        exchangeData.latency = latency;
        exchangeData.timestamp = new Date().toISOString();
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLatencyData.pending, (state) => {
        console.log('fetchLatencyData.pending');
        if (!state.data || state.data.length === 0) {
          state.loading = true;
        }
        state.error = null;
      })
      .addCase(fetchLatencyData.fulfilled, (state, action) => {
        console.log('fetchLatencyData.fulfilled with', action.payload.length, 'items');
        state.loading = false;
        state.data = action.payload;
        state.lastUpdated = new Date().toISOString();
        state.error = null;
      })
      .addCase(fetchLatencyData.rejected, (state, action) => {
        console.log('fetchLatencyData.rejected:', action.payload);
        state.loading = false;
        state.error = action.payload as string || 'Failed to fetch data';
      })
      .addCase(generateTestData.pending, (state) => {
        console.log('🔄 generateTestData.pending');
        state.loading = true;
        state.error = null;
      })
      .addCase(generateTestData.fulfilled, (state, action) => {
        console.log('generateTestData.fulfilled with', action.payload.length, 'items');
        state.loading = false;
        state.data = action.payload;
        state.lastUpdated = new Date().toISOString();
        state.error = null;
      })
      .addCase(generateTestData.rejected, (state, action) => {
        console.log(' generateTestData.rejected:', action.payload);
        state.loading = false;
        state.error = action.payload as string || 'Failed to generate test data';
      })
      .addCase(fetchHistoricalData.fulfilled, (state, action) => {
        const { exchange, data } = action.payload;
        state.historicalData[exchange] = data;
      })
      .addCase(fetchHistoricalData.rejected, (state, action) => {
        state.error = action.payload as string || 'Failed to fetch historical data';
      });
  },
});

export const {
  setLoading,
  setError,
  setLastUpdated,
  setSelectedExchange,
  setTimeRange,
  setRefreshInterval,
  setCacheEnabled,
  setAutoRefresh,
  clearError,
  updateExchangeLatency,
} = latencySlice.actions;

export const selectLatencyData = (state: { latency: LatencyState }) => state.latency.data;
export const selectHistoricalData = (state: { latency: LatencyState }) => state.latency.historicalData;
export const selectLoading = (state: { latency: LatencyState }) => state.latency.loading;
export const selectError = (state: { latency: LatencyState }) => state.latency.error;
export const selectLastUpdated = (state: { latency: LatencyState }) => state.latency.lastUpdated;
export const selectSelectedExchange = (state: { latency: LatencyState }) => state.latency.selectedExchange;
export const selectTimeRange = (state: { latency: LatencyState }) => state.latency.timeRange;
export const selectRefreshInterval = (state: { latency: LatencyState }) => state.latency.refreshInterval;
export const selectCacheEnabled = (state: { latency: LatencyState }) => state.latency.cacheEnabled;
export const selectAutoRefresh = (state: { latency: LatencyState }) => state.latency.autoRefresh;

export const selectExchangeByLatency = createSelector(
  [(state: { latency: LatencyState }) => state.latency.data],
  (data) => {
    const latencyData = data || [];

    if (!latencyData || latencyData.length === 0) {
      return {
        excellent: [],
        good: [],
        poor: [],
      };
    }
    
    return {
      excellent: latencyData.filter(item => item.latency < LATENCY_THRESHOLDS.excellent),
      good: latencyData.filter(item => item.latency >= LATENCY_THRESHOLDS.excellent && item.latency < LATENCY_THRESHOLDS.good),
      poor: latencyData.filter(item => item.latency >= LATENCY_THRESHOLDS.good),
    };
  }
);

export const selectAverageLatency = createSelector(
  [(state: { latency: LatencyState }) => state.latency.data],
  (data) => {
    const latencyData = data || [];
    if (latencyData.length === 0) return 0;
    return latencyData.reduce((sum, item) => sum + item.latency, 0) / latencyData.length;
  }
);

export const selectExchangeCount = createSelector(
  [(state: { latency: LatencyState }) => state.latency.data],
  (data) => (data || []).length
);

export default latencySlice.reducer; 