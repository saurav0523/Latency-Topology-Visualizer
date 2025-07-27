import axiosInstance from './axios-instance';
import { API_ENDPOINTS } from './endpoints';
import { EXCHANGES } from '../constants';


export interface CloudflareResponse<T = Record<string, unknown>> {
  success: boolean;
  result: T;
  errors?: string[];
  messages?: string[];
}

export interface LatencyData {
  exchange: string;
  location: { lat: number; lng: number };
  cloud: string;
  region: string;
  latency: number;
  timestamp: string;
}

export interface TokenVerificationResponse {
  id: string;
  status: string;
  not_before: string;
  expires_on: string;
  issued_on: string;
  modified_on: string;
}

export interface RadarLatencyResponse {
  meta: {
    dateRange: {
      startTime: string;
      endTime: string;
    };
    lastUpdated: string;
  };
  data: Array<{
    location: string;
    latency: number;
    requests: number;
  }>;
}

export interface RequestsDataResponse {
  meta: {
    dateRange: {
      startTime: string;
      endTime: string;
    };
    lastUpdated: string;
  };
  data: Array<{
    requests: number;
    timestamp: string;
  }>;
}


class CloudflareApiService {
  private cache: Map<string, { data: unknown; timestamp: number; ttl: number }> = new Map();
  private cacheEnabled: boolean = true;
  private cacheHits: number = 0;
  private cacheMisses: number = 0;

  private getCacheKey(endpoint: string, params?: Record<string, unknown>): string {
    const paramString = params ? JSON.stringify(params) : '';
    return `${endpoint}${paramString}`;
  }

  private getFromCache<T>(key: string): T | null {
    if (!this.cacheEnabled) return null;
    
    const item = this.cache.get(key);
    if (!item) {
      this.cacheMisses++;
      return null;
    }

    const now = Date.now();
    if (now - item.timestamp > item.ttl) {
      this.cache.delete(key);
      this.cacheMisses++;
      return null;
    }

    this.cacheHits++;
    console.log(`Cache hit for ${key}`);
    return item.data as T;
  }

  private setCache<T>(key: string, data: T, ttl: number = 30000): void {
    if (!this.cacheEnabled) return;
    
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
    console.log(`Cached data for ${key} (TTL: ${ttl}ms)`);
  }

  public setCacheEnabled(enabled: boolean): void {
    this.cacheEnabled = enabled;
    if (!enabled) {
      this.cache.clear();
      this.cacheHits = 0;
      this.cacheMisses = 0;
      console.log('Cache disabled and cleared');
    } else {
      console.log('Cache enabled');
    }
  }

  public getCacheStats(): { size: number; hitRate: number } {
    const totalRequests = this.cacheHits + this.cacheMisses;
    if (totalRequests === 0) {
      return { size: this.cache.size, hitRate: 0 };
    }
    return {
      size: this.cache.size,
      hitRate: (this.cacheHits / totalRequests) * 100,
    };
  }

  async verifyToken(): Promise<TokenVerificationResponse> {
    const cacheKey = this.getCacheKey('verify-token');
 
    const cached = this.getFromCache<TokenVerificationResponse>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      console.log('Verifying Cloudflare API token via proxy...');

      const response = await fetch('/api/cloudflare?endpoint=verify', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success) {
        const result = data.result;
  
        this.setCache(cacheKey, result, 300000);
        
        return result;
      } else {
        const errorMessage = data.errors?.join(', ') || 'Token verification failed';
        throw new Error(errorMessage);
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error('Token verification error:', error.message);
        
        if (error.message.includes('401') || error.message.includes('403')) {
          throw new Error('Invalid API token. Please check your Cloudflare token.');
        }
        
        throw new Error(`Token verification failed: ${error.message}`);
      } else {
        console.error('Token verification error:', error);
        throw new Error('Token verification failed: Unknown error');
      }
    }
  }

  // Measure real latency to exchange APIs
  async measureRealLatency(): Promise<LatencyData[]> {
    const exchangeEndpoints = {
      'Binance': 'https://api.binance.com/api/v3/ping',
      'OKX': 'https://www.okx.com/api/v5/public/time',
      'Coinbase': 'https://api.coinbase.com/v2/time',
      'Kraken': 'https://api.kraken.com/0/public/Time',
      'Bybit': 'https://api.bybit.com/v5/market/time',
    };

    const results: LatencyData[] = [];
    
    for (const [exchangeName, endpoint] of Object.entries(exchangeEndpoints)) {
      try {
        const exchange = Object.values(EXCHANGES).find(e => e.name === exchangeName);
        if (!exchange) continue;

        const startTime = Date.now();
        
        // Use a timeout to prevent hanging requests
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
        
        const response = await fetch(endpoint, {
          method: 'GET',
          signal: controller.signal,
          headers: {
            'User-Agent': 'Latency-Visualizer/1.0',
          },
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          const endTime = Date.now();
          const latency = endTime - startTime;
          
          results.push({
            exchange: exchange.name,
            location: exchange.location,
            cloud: exchange.cloud,
            region: exchange.region,
            latency: latency,
            timestamp: new Date().toISOString()
          });
          
          console.log(`✅ Real latency measured for ${exchangeName}: ${latency}ms`);
        } else {
          throw new Error(`HTTP ${response.status}`);
        }
      } catch (error) {
        console.warn(`⚠️ Failed to measure real latency for ${exchangeName}:`, error);
        
        // Fallback to simulated data for this exchange
        const exchange = Object.values(EXCHANGES).find(e => e.name === exchangeName);
        if (exchange) {
          results.push({
            exchange: exchange.name,
            location: exchange.location,
            cloud: exchange.cloud,
            region: exchange.region,
            latency: exchange.baseLatency + Math.round((Math.random() - 0.5) * 10),
            timestamp: new Date().toISOString()
          });
        }
      }
    }
    
    return results;
  }

  // Enhanced getLatencyData with real measurement option
  async getLatencyData(useRealMeasurement: boolean = false): Promise<RadarLatencyResponse> {
    const cacheKey = this.getCacheKey('latency-data', { useRealMeasurement });
    
    // Check cache first
    const cached = this.getFromCache<RadarLatencyResponse>(cacheKey);
    if (cached) {
      return cached;
    }

    let result: RadarLatencyResponse;
    
    if (useRealMeasurement) {
      try {
        console.log('🔍 Measuring real latency to exchange APIs...');
        const realData = await this.measureRealLatency();
        
        // Transform real data to Radar format
        result = {
          meta: {
            dateRange: {
              startTime: new Date(Date.now() - 60000).toISOString(),
              endTime: new Date().toISOString(),
            },
            lastUpdated: new Date().toISOString(),
          },
          data: realData.map(item => ({
            location: item.exchange,
            latency: item.latency,
            requests: 1,
          })),
        };
      } catch (error) {
        console.warn('⚠️ Real measurement failed, falling back to simulation:', error);
        result = this.getSimulatedRadarData();
      }
    } else {
      // Use simulated data
      result = this.getSimulatedRadarData();
    }
    
    // Cache the result for 30 seconds
    this.setCache(cacheKey, result, 30000);
    
    return result;
  }

  // Fetch requests data
  async getRequestsData(): Promise<RequestsDataResponse> {
    const cacheKey = this.getCacheKey('requests-data');
    
    // Check cache first
    const cached = this.getFromCache<RequestsDataResponse>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      console.log('🔍 Fetching requests data via proxy...');
      
      // Use Next.js API proxy to bypass CORS
      const response = await fetch('/api/cloudflare?endpoint=requests', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success) {
        console.log('✅ Requests data fetched successfully');
        const result = data.result;
        
        // Cache the result for 60 seconds
        this.setCache(cacheKey, result, 60000);
        
        return result;
      } else {
        const errorMessage = data.errors?.join(', ') || 'Failed to fetch requests data';
        throw new Error(errorMessage);
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error('❌ Requests data fetch error:', error.message);
        throw new Error(`Failed to fetch requests data: ${error.message}`);
      } else {
        console.error('❌ Requests data fetch error:', error);
        throw new Error('Failed to fetch requests data: Unknown error');
      }
    }
  }

  // Fetch location-based requests data
  async getLocationRequestsData(): Promise<RequestsDataResponse> {
    try {
      const response = await axiosInstance.get<CloudflareResponse<RequestsDataResponse>>(
        API_ENDPOINTS.RADAR.HTTP_REQUESTS_LOCATIONS
      );
      
      if (response.data.success) {
        console.log('✅ Location requests data fetched successfully');
        return response.data.result;
      } else {
        const errorMessage = response.data.errors?.join(', ') || 'Failed to fetch location requests data';
        throw new Error(errorMessage);
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error('❌ Location requests data fetch error:', error.message);
        throw new Error(`Failed to fetch location requests data: ${error.message}`);
      } else {
        console.error('❌ Location requests data fetch error:', error);
        throw new Error('Failed to fetch location requests data: Unknown error');
      }
    }
  }

  // Transform Cloudflare data to our format
  transformToLatencyData(): LatencyData[] {
    // This would transform actual Cloudflare data to our format
    // For now, return simulated data that matches the structure
    return this.generateSimulatedLatencyData();
  }

  // Generate simulated data for fallback with realistic patterns
  generateSimulatedLatencyData(): LatencyData[] {
    const now = new Date();
    const hour = now.getHours();
    const dayOfWeek = now.getDay();
    
    // Time-based latency patterns (higher during peak hours)
    const timeMultiplier = this.getTimeBasedMultiplier(hour, dayOfWeek);
    
    // Network congestion simulation
    const congestionFactor = this.getCongestionFactor();
    
    return Object.values(EXCHANGES).map(exchange => {
      // Base latency with geographic realism
      let baseLatency = exchange.baseLatency;
      
      // Add geographic distance factor
      baseLatency += this.getGeographicLatencyFactor(exchange.location);
      
      // Apply time-based patterns
      baseLatency *= timeMultiplier;
      
      // Apply network congestion
      baseLatency *= congestionFactor;
      
      // Add realistic jitter (±5-15ms)
      const jitter = (Math.random() - 0.5) * 20;
      
      // Add occasional spikes (1% chance of 50-100ms spike)
      const spike = Math.random() < 0.01 ? Math.random() * 50 + 50 : 0;
      
      const finalLatency = Math.max(1, Math.round(baseLatency + jitter + spike));
      
      return {
        exchange: exchange.name,
        location: exchange.location,
        cloud: exchange.cloud,
        region: exchange.region,
        latency: finalLatency,
        timestamp: now.toISOString()
      };
    });
  }

  // Time-based latency multiplier (higher during peak hours)
  private getTimeBasedMultiplier(hour: number, dayOfWeek: number): number {
    // Weekend vs weekday patterns
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    
    if (isWeekend) {
      // Weekend: lower traffic, better performance
      return 0.9 + (Math.random() * 0.1); // 0.9-1.0
    } else {
      // Weekday patterns
      if (hour >= 9 && hour <= 11) {
        // Morning peak: 1.2-1.4x
        return 1.2 + (Math.random() * 0.2);
      } else if (hour >= 14 && hour <= 16) {
        // Afternoon peak: 1.1-1.3x
        return 1.1 + (Math.random() * 0.2);
      } else if (hour >= 19 && hour <= 22) {
        // Evening peak: 1.3-1.5x
        return 1.3 + (Math.random() * 0.2);
      } else if (hour >= 23 || hour <= 6) {
        // Night: 0.8-1.0x
        return 0.8 + (Math.random() * 0.2);
      } else {
        // Normal hours: 1.0-1.1x
        return 1.0 + (Math.random() * 0.1);
      }
    }
  }

  // Network congestion simulation
  private getCongestionFactor(): number {
    // Simulate occasional network congestion
    const congestionChance = Math.random();
    
    if (congestionChance < 0.05) {
      // 5% chance of severe congestion (1.5-2.0x)
      return 1.5 + (Math.random() * 0.5);
    } else if (congestionChance < 0.15) {
      // 10% chance of moderate congestion (1.2-1.4x)
      return 1.2 + (Math.random() * 0.2);
    } else if (congestionChance < 0.30) {
      // 15% chance of light congestion (1.05-1.15x)
      return 1.05 + (Math.random() * 0.1);
    } else {
      // 70% chance of normal conditions (0.95-1.05x)
      return 0.95 + (Math.random() * 0.1);
    }
  }

  // Geographic latency factor based on distance
  private getGeographicLatencyFactor(location: { lat: number; lng: number }): number {
    // Simulate distance-based latency (further = higher latency)
    // This is a simplified model - in reality, it depends on routing, infrastructure, etc.
    const baseDistance = Math.sqrt(location.lat ** 2 + location.lng ** 2);
    return Math.min(20, baseDistance * 0.1); // Max 20ms additional latency
  }

  // Generate simulated Radar data
  private getSimulatedRadarData(): RadarLatencyResponse {
    const simulatedData = this.generateSimulatedLatencyData();
    
    return {
      meta: {
        dateRange: {
          startTime: new Date(Date.now() - 60000).toISOString(),
          endTime: new Date().toISOString(),
        },
        lastUpdated: new Date().toISOString(),
      },
      data: simulatedData.map(item => ({
        location: item.exchange,
        latency: item.latency,
        requests: Math.floor(Math.random() * 1000) + 100, // Random request count
      })),
    };
  }
}

// Export singleton instance
export const cloudflareApiService = new CloudflareApiService();
export default cloudflareApiService; 