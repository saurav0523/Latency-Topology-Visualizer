import axios, { AxiosInstance, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_CONFIG = {
  baseURL: 'https://api.cloudflare.com/client/v4',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
};

const axiosInstance: AxiosInstance = axios.create(API_CONFIG);


axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = process.env.NEXT_PUBLIC_CLOUDFLARE_API_TOKEN || 'o2yCCfR0HaFRLX5i827G9mcr6yIA8GUml2DPLcAI';
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error: AxiosError) => {
    console.error(' Request Error:', error);
    return Promise.reject(error);
  }
);


axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error: AxiosError) => {
    console.error('Full Error Object:', error);
  
    if (error.response) {
      console.error('API Error Response:', {
        status: error.response.status,
        statusText: error.response.statusText,
        url: error.config?.url,
        data: error.response.data,
        message: error.message,
        code: error.code,
      });
    } else if (error.request) {

      console.error('Network Error:', {
        message: error.message,
        url: error.config?.url,
        code: error.code,
        request: error.request ? 'Request object exists' : 'No request object',
      });
    } else {
      console.error(' Request Setup Error:', {
        message: error.message,
        url: error.config?.url,
        code: error.code,
        stack: error.stack,
      });
    }

    console.error('Error Message:', error.message);
    console.error('Error Code:', error.code);

    return Promise.reject(error);
  }
);

export default axiosInstance; 