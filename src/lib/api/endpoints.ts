// API Endpoints Configuration
export const API_ENDPOINTS = {
  // Authentication & Verification
  AUTH: {
    VERIFY_TOKEN: '/user/tokens/verify',
  },
  
  // Radar API Endpoints
  RADAR: {
    BASE: '/radar',
    HTTP_LATENCY: '/radar/http/latency',
    HTTP_REQUESTS: '/radar/http/requests',
    HTTP_REQUESTS_LOCATIONS: '/radar/http/requests/locations',
    HTTP_REQUESTS_BROWSERS: '/radar/http/requests/browsers',
    HTTP_REQUESTS_DEVICES: '/radar/http/requests/devices',
    HTTP_REQUESTS_OS: '/radar/http/requests/os',
  },
  
  // Analytics Endpoints
  ANALYTICS: {
    BASE: '/analytics',
    HTTP_REQUESTS: '/analytics/http/requests',
    HTTP_REQUESTS_BY_COUNTRY: '/analytics/http/requests/by_country',
  },
  
  // Zone Endpoints (if you have domains)
  ZONES: {
    BASE: '/zones',
    LIST: '/zones',
    DETAILS: (zoneId: string) => `/zones/${zoneId}`,
  },
} as const;

// Helper function to build full URLs
export const buildApiUrl = (endpoint: string): string => {
  return endpoint.startsWith('http') ? endpoint : endpoint;
};

// Type for endpoint keys
export type ApiEndpoint = typeof API_ENDPOINTS; 