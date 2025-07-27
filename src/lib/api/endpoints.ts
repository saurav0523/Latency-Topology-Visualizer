
export const API_ENDPOINTS = {
  AUTH: {
    VERIFY_TOKEN: '/user/tokens/verify',
  },
  
  RADAR: {
    BASE: '/radar',
    HTTP_LATENCY: '/radar/http/latency',
    HTTP_REQUESTS: '/radar/http/requests',
    HTTP_REQUESTS_LOCATIONS: '/radar/http/requests/locations',
    HTTP_REQUESTS_BROWSERS: '/radar/http/requests/browsers',
    HTTP_REQUESTS_DEVICES: '/radar/http/requests/devices',
    HTTP_REQUESTS_OS: '/radar/http/requests/os',
  },
  
  ANALYTICS: {
    BASE: '/analytics',
    HTTP_REQUESTS: '/analytics/http/requests',
    HTTP_REQUESTS_BY_COUNTRY: '/analytics/http/requests/by_country',
  },
  
  ZONES: {
    BASE: '/zones',
    LIST: '/zones',
    DETAILS: (zoneId: string) => `/zones/${zoneId}`,
  },
} as const;


export const buildApiUrl = (endpoint: string): string => {
  return endpoint.startsWith('http') ? endpoint : endpoint;
};


export type ApiEndpoint = typeof API_ENDPOINTS; 