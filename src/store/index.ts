import { configureStore } from '@reduxjs/toolkit';
import latencyReducer from './slices/latencySlice';
import uiReducer from './slices/uiSlice';
import apiReducer from './slices/apiSlice';

export const store = configureStore({
  reducer: {
    latency: latencyReducer,
    ui: uiReducer,
    api: apiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types for serialization checks
        ignoredActions: [
          'latency/setLastUpdated',
          'ui/setLastUpdated',
          'api/setLastApiCall',
          'api/setRateLimitInfo',
          'api/setApiTokenValid',
          'api/updateEndpointStats',
          'api/setCacheData',
          'latency/fetchLatencyData/fulfilled',
          'latency/fetchHistoricalData/fulfilled'
        ],
        // Ignore these field paths in all actions
        ignoredActionPaths: [
          'payload.timestamp',
          'payload.lastUpdated',
          'payload.lastCall',
          'payload.reset',
          'payload.lastTokenCheck',
          'payload.timestamp'
        ],
        // Ignore these paths in the state
        ignoredPaths: [
          'latency.lastUpdated',
          'ui.lastUpdated',
          'api.lastApiCall',
          'api.rateLimitReset',
          'api.lastTokenCheck',
          'api.endpoints',
          'api.cache'
        ],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 