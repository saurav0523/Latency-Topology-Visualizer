import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { createSelector } from '@reduxjs/toolkit';

export interface APIState {
  connectionStatus: 'connected' | 'disconnected' | 'connecting' | 'error';
  lastApiCall: string | null; 
  apiCallsCount: number;
  rateLimitRemaining: number | null;
  rateLimitReset: string | null; 
  apiToken: string | null;
  apiTokenValid: boolean;
  lastTokenCheck: string | null; 
  endpoints: {
    [key: string]: {
      lastCall: string | null; 
      successCount: number;
      errorCount: number;
      averageResponseTime: number;
    };
  };
  cache: {
    [key: string]: {
      data: Record<string, unknown>;
      timestamp: string; 
      ttl: number;
    };
  };
}


const initialState: APIState = {
  connectionStatus: 'disconnected',
  lastApiCall: null,
  apiCallsCount: 0,
  rateLimitRemaining: null,
  rateLimitReset: null,
  apiToken: process.env.NEXT_PUBLIC_CLOUDFLARE_API_TOKEN || 'o2yCCfR0HaFRLX5i827G9mcr6yIA8GUml2DPLcAI',
  apiTokenValid: false,
  lastTokenCheck: null,
  endpoints: {
    'verify-token': {
      lastCall: null,
      successCount: 0,
      errorCount: 0,
      averageResponseTime: 0,
    },
    'latency-data': {
      lastCall: null,
      successCount: 0,
      errorCount: 0,
      averageResponseTime: 0,
    },
    'requests-data': {
      lastCall: null,
      successCount: 0,
      errorCount: 0,
      averageResponseTime: 0,
    },
  },
  cache: {},
};


const apiSlice = createSlice({
  name: 'api',
  initialState,
  reducers: {
    setConnectionStatus: (state, action: PayloadAction<'connected' | 'disconnected' | 'connecting' | 'error'>) => {
      state.connectionStatus = action.payload;
    },
    setLastApiCall: (state, action: PayloadAction<string>) => {
      state.lastApiCall = action.payload;
      state.apiCallsCount += 1;
    },
    setRateLimitInfo: (state, action: PayloadAction<{ remaining: number; reset: string }>) => {
      state.rateLimitRemaining = action.payload.remaining;
      state.rateLimitReset = action.payload.reset;
    },
    setApiToken: (state, action: PayloadAction<string>) => {
      state.apiToken = action.payload;
    },
    setApiTokenValid: (state, action: PayloadAction<boolean>) => {
      state.apiTokenValid = action.payload;
      state.lastTokenCheck = new Date().toISOString(); 
    },
    updateEndpointStats: (state, action: PayloadAction<{
      endpoint: string;
      success: boolean;
      responseTime: number;
    }>) => {
      const { endpoint, success, responseTime } = action.payload;
      if (!state.endpoints[endpoint]) {
        state.endpoints[endpoint] = {
          lastCall: null,
          successCount: 0,
          errorCount: 0,
          averageResponseTime: 0,
        };
      }
      
      const endpointStats = state.endpoints[endpoint];
      endpointStats.lastCall = new Date().toISOString();

      if (success) {
        endpointStats.successCount += 1;
      } else {
        endpointStats.errorCount += 1;
      }
      
      const totalCalls = endpointStats.successCount + endpointStats.errorCount;
      if (totalCalls > 0) {
        endpointStats.averageResponseTime = 
          ((endpointStats.averageResponseTime * (totalCalls - 1)) + responseTime) / totalCalls;
      }
    },
    setCacheData: (state, action: PayloadAction<{
      key: string;
      data: Record<string, unknown>;
      ttl: number;
    }>) => {
      const { key, data, ttl } = action.payload;
      state.cache[key] = {
        data,
        timestamp: new Date().toISOString(),
        ttl,
      };
    },
    clearCache: (state, action: PayloadAction<string>) => {
      delete state.cache[action.payload];
    },
    clearExpiredCache: (state) => {
      const now = new Date();
      Object.keys(state.cache).forEach(key => {
        const cacheEntry = state.cache[key];
        const cacheTime = new Date(cacheEntry.timestamp);
        if (now.getTime() - cacheTime.getTime() > cacheEntry.ttl) {
          delete state.cache[key];
        }
      });
    },
    resetApiStats: (state) => {
      state.apiCallsCount = 0;
      state.lastApiCall = null;
      state.rateLimitRemaining = null;
      state.rateLimitReset = null;
      Object.keys(state.endpoints).forEach(endpoint => {
        state.endpoints[endpoint] = {
          lastCall: null,
          successCount: 0,
          errorCount: 0,
          averageResponseTime: 0,
        };
      });
    },
  },
});

export const {
  setConnectionStatus,
  setLastApiCall,
  setRateLimitInfo,
  setApiToken,
  setApiTokenValid,
  updateEndpointStats,
  setCacheData,
  clearCache,
  clearExpiredCache,
  resetApiStats,
} = apiSlice.actions;

export default apiSlice.reducer;


export const selectConnectionStatus = (state: { api: APIState }) => state.api.connectionStatus;
export const selectLastApiCall = (state: { api: APIState }) => state.api.lastApiCall;
export const selectApiCallsCount = (state: { api: APIState }) => state.api.apiCallsCount;
export const selectRateLimitRemaining = (state: { api: APIState }) => state.api.rateLimitRemaining;
export const selectRateLimitReset = (state: { api: APIState }) => state.api.rateLimitReset;
export const selectApiToken = (state: { api: APIState }) => state.api.apiToken;
export const selectApiTokenValid = (state: { api: APIState }) => state.api.apiTokenValid;
export const selectLastTokenCheck = (state: { api: APIState }) => state.api.lastTokenCheck;
export const selectEndpoints = (state: { api: APIState }) => state.api.endpoints;
export const selectCache = (state: { api: APIState }) => state.api.cache;


export const selectApiHealth = createSelector(
  [selectEndpoints],
  (endpoints) => {
    const allEndpoints = Object.values(endpoints);
    const totalCalls = allEndpoints.reduce((sum, endpoint) => sum + endpoint.successCount + endpoint.errorCount, 0);
    const totalSuccess = allEndpoints.reduce((sum, endpoint) => sum + endpoint.successCount, 0);
    const totalErrors = allEndpoints.reduce((sum, endpoint) => sum + endpoint.errorCount, 0);
    const avgResponseTime = allEndpoints.reduce((sum, endpoint) => sum + endpoint.averageResponseTime, 0) / allEndpoints.length;
    
    return {
      totalCalls,
      totalSuccess,
      totalErrors,
      successRate: totalCalls > 0 ? (totalSuccess / totalCalls) * 100 : 0,
      avgResponseTime,
      health: totalCalls > 0 ? (totalSuccess / totalCalls) * 100 : 100,
    };
  }
);

export const selectCacheStats = createSelector(
  [selectCache],
  (cache) => {
    const cacheEntries = Object.keys(cache);
    const totalSize = cacheEntries.length;
    const now = new Date();
    const expiredEntries = cacheEntries.filter(key => {
      const cacheEntry = cache[key];
      const cacheTime = new Date(cacheEntry.timestamp);
      return now.getTime() - cacheTime.getTime() > cacheEntry.ttl;
    }).length;
    
    return {
      totalEntries: totalSize,
      expiredEntries,
      validEntries: totalSize - expiredEntries,
      hitRate: totalSize > 0 ? ((totalSize - expiredEntries) / totalSize) * 100 : 0,
    };
  }
); 