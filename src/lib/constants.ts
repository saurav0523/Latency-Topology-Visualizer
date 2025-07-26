// Application Constants
export const APP_CONFIG = {
  name: 'Latency Topology Visualizer',
  version: '1.0.0',
  description: 'Real-time network performance monitoring across cloud providers',
} as const;

// API Configuration
export const API_CONFIG = {
  baseURL: 'https://api.cloudflare.com/client/v4',
  timeout: 10000,
  refreshInterval: 30000, // 30 seconds
  cacheDuration: 30000, // 30 seconds
} as const;

// Cloud Provider Configuration
export const CLOUD_PROVIDERS = {
  AWS: {
    name: 'Amazon Web Services',
    color: '#2563eb',
    icon: '☁️',
  },
  GCP: {
    name: 'Google Cloud Platform',
    color: '#22c55e',
    icon: '☁️',
  },
  Azure: {
    name: 'Microsoft Azure',
    color: '#ef4444',
    icon: '☁️',
  },
} as const;

// Exchange Configuration
export const EXCHANGES = {
  BINANCE: {
    name: 'Binance',
    location: { lat: 1.3521, lng: 103.8198 }, // Singapore
    cloud: 'AWS',
    region: 'Asia Pacific',
    baseLatency: 25
  },
  OKX: {
    name: 'OKX',
    location: { lat: 22.3193, lng: 114.1694 }, // Hong Kong
    cloud: 'AWS',
    region: 'Asia Pacific',
    baseLatency: 30
  },
  COINBASE: {
    name: 'Coinbase',
    location: { lat: 37.7749, lng: -122.4194 }, // San Francisco
    cloud: 'AWS',
    region: 'US West',
    baseLatency: 20
  },
  KRAKEN: {
    name: 'Kraken',
    location: { lat: 47.6062, lng: -122.3321 }, // Seattle
    cloud: 'GCP',
    region: 'US West',
    baseLatency: 22
  },
  BYBIT: {
    name: 'Bybit',
    location: { lat: 1.3521, lng: 103.8198 }, // Singapore
    cloud: 'Azure',
    region: 'Asia Pacific',
    baseLatency: 28
  },
  DERIBIT: {
    name: 'Deribit',
    location: { lat: 52.3676, lng: 4.9041 }, // Amsterdam
    cloud: 'AWS',
    region: 'Europe',
    baseLatency: 35
  },
  FTX: {
    name: 'FTX',
    location: { lat: 25.7617, lng: -80.1918 }, // Miami
    cloud: 'GCP',
    region: 'US East',
    baseLatency: 18
  },
  KUCOIN: {
    name: 'KuCoin',
    location: { lat: 1.3521, lng: 103.8198 }, // Singapore
    cloud: 'Azure',
    region: 'Asia Pacific',
    baseLatency: 32
  },
  GATE_IO: {
    name: 'Gate.io',
    location: { lat: 39.9042, lng: 116.4074 }, // Beijing
    cloud: 'AWS',
    region: 'Asia Pacific',
    baseLatency: 40
  },
  HUOBI: {
    name: 'Huobi',
    location: { lat: 39.9042, lng: 116.4074 }, // Beijing
    cloud: 'GCP',
    region: 'Asia Pacific',
    baseLatency: 38
  }
};

// Latency Thresholds
export const LATENCY_THRESHOLDS = {
  excellent: 20, // ms
  good: 50, // ms
  poor: 100, // ms
} as const;

// UI Configuration
export const UI_CONFIG = {
  chartHeight: 300,
  mapHeight: 384, // 24rem
  refreshInterval: 30000,
  animationDuration: 300,
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  API_FAILED: 'Failed to fetch latency data',
  TOKEN_INVALID: 'API token verification failed',
  NETWORK_ERROR: 'Network connection error',
  TIMEOUT: 'Request timeout',
  UNKNOWN: 'An unknown error occurred',
} as const;

// Status Messages
export const STATUS_MESSAGES = {
  LOADING: 'Loading...',
  LIVE_MONITORING: 'Live Monitoring',
  ERROR: 'Error',
  USING_FALLBACK: 'Using fallback data',
} as const; 