import axios, { AxiosInstance, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';

// API Configuration
const API_CONFIG = {
  baseURL: 'https://api.cloudflare.com/client/v4',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
};

// Create axios instance
const axiosInstance: AxiosInstance = axios.create(API_CONFIG);

// Request interceptor
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Add authorization header if token exists
    const token = process.env.NEXT_PUBLIC_CLOUDFLARE_API_TOKEN || 'o2yCCfR0HaFRLX5i827G9mcr6yIA8GUml2DPLcAI';
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error: AxiosError) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error: AxiosError) => {
    // Log the full error object for debugging
    console.error('❌ Full Error Object:', error);
    
    // Handle different types of errors
    if (error.response) {
      // Server responded with error status
      console.error('❌ API Error Response:', {
        status: error.response.status,
        statusText: error.response.statusText,
        url: error.config?.url,
        data: error.response.data,
        message: error.message,
        code: error.code,
      });
    } else if (error.request) {
      // Request was made but no response received
      console.error('❌ Network Error:', {
        message: error.message,
        url: error.config?.url,
        code: error.code,
        request: error.request ? 'Request object exists' : 'No request object',
      });
    } else {
      // Something else happened
      console.error('❌ Request Setup Error:', {
        message: error.message,
        url: error.config?.url,
        code: error.code,
        stack: error.stack,
      });
    }
    
    // Also log the error message directly
    console.error('❌ Error Message:', error.message);
    console.error('❌ Error Code:', error.code);
    
    return Promise.reject(error);
  }
);

export default axiosInstance; 