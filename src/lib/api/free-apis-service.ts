import { LatencyData } from './cloudflare-service';
import { EXCHANGES } from '../constants';

// Free API endpoints for latency measurement
const FREE_API_ENDPOINTS = {
  // Public APIs that don't require authentication
  'httpbin': 'https://httpbin.org/delay/0',
  'jsonplaceholder': 'https://jsonplaceholder.typicode.com/posts/1',
  'randomuser': 'https://randomuser.me/api/',
  'dogapi': 'https://dog.ceo/api/breeds/image/random',
  'catapi': 'https://api.thecatapi.com/v1/images/search',
  'weather': 'https://api.open-meteo.com/v1/forecast?latitude=52.52&longitude=13.41&current=temperature_2m',
};

// Alternative monitoring services (free tiers)
const MONITORING_ENDPOINTS = {
  'uptimerobot': 'https://api.uptimerobot.com/v2/getMonitors', // Requires API key
  'statuscake': 'https://api.statuscake.com/v1/tests', // Requires API key
  'pingdom': 'https://api.pingdom.com/api/3.1/checks', // Requires API key
};

export interface FreeApiLatencyResult {
  endpoint: string;
  latency: number;
  status: 'success' | 'timeout' | 'error';
  timestamp: string;
}

export interface AlternativeLatencyData extends LatencyData {
  source: 'free-api' | 'monitoring-service' | 'exchange-api';
  reliability: number; // 0-1 score
}

class FreeApisService {
  // Measure latency to free public APIs
  async measureFreeApiLatency(): Promise<FreeApiLatencyResult[]> {
    const results: FreeApiLatencyResult[] = [];
    
    for (const [name, endpoint] of Object.entries(FREE_API_ENDPOINTS)) {
      try {
        const startTime = Date.now();
        
        // Use a timeout to prevent hanging requests
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
        
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
            endpoint: name,
            latency: latency,
            status: 'success',
            timestamp: new Date().toISOString()
          });
          
          console.log(`✅ Free API latency measured for ${name}: ${latency}ms`);
        } else {
          throw new Error(`HTTP ${response.status}`);
        }
      } catch (error) {
        console.warn(`⚠️ Failed to measure free API latency for ${name}:`, error);
        
        results.push({
          endpoint: name,
          latency: 0,
          status: error instanceof Error && error.name === 'AbortError' ? 'timeout' : 'error',
          timestamp: new Date().toISOString()
        });
      }
    }
    
    return results;
  }

  // Generate alternative latency data based on free API measurements
  async generateAlternativeLatencyData(): Promise<AlternativeLatencyData[]> {
    const freeApiResults = await this.measureFreeApiLatency();
    
    // Calculate average latency from successful measurements
    const successfulResults = freeApiResults.filter(r => r.status === 'success');
    const avgLatency = successfulResults.length > 0 
      ? successfulResults.reduce((sum, r) => sum + r.latency, 0) / successfulResults.length 
      : 50; // Fallback average
    
    // Generate exchange-specific data with geographic and infrastructure factors
    return Object.values(EXCHANGES).map(exchange => {
      // Base latency influenced by free API measurements
      let baseLatency = avgLatency;
      
      // Add geographic distance factor
      baseLatency += this.getGeographicLatencyFactor(exchange.location);
      
      // Add cloud provider factor
      baseLatency += this.getCloudProviderLatencyFactor(exchange.cloud);
      
      // Add realistic variation
      const variation = (Math.random() - 0.5) * 20;
      const finalLatency = Math.max(1, Math.round(baseLatency + variation));
      
      // Calculate reliability based on successful API calls
      const reliability = successfulResults.length / freeApiResults.length;
      
      return {
        exchange: exchange.name,
        location: exchange.location,
        cloud: exchange.cloud,
        region: exchange.region,
        latency: finalLatency,
        timestamp: new Date().toISOString(),
        source: 'free-api' as const,
        reliability: reliability,
      };
    });
  }

  // Get latency factor based on geographic distance
  private getGeographicLatencyFactor(location: { lat: number; lng: number }): number {
    // Simplified distance calculation
    const baseDistance = Math.sqrt(location.lat ** 2 + location.lng ** 2);
    return Math.min(30, baseDistance * 0.15); // Max 30ms additional latency
  }

  // Get latency factor based on cloud provider
  private getCloudProviderLatencyFactor(cloud: string): number {
    const cloudFactors = {
      'AWS': 0,      // Baseline
      'GCP': 2,      // Slightly higher
      'Azure': 3,    // Slightly higher
      'DigitalOcean': 5, // Higher
      'Vultr': 8,    // Higher
      'Linode': 6,   // Higher
    };
    
    return cloudFactors[cloud as keyof typeof cloudFactors] || 0;
  }

  // Get public internet speed test data (simulated)
  async getInternetSpeedData(): Promise<{
    downloadSpeed: number;
    uploadSpeed: number;
    ping: number;
    timestamp: string;
  }> {
    // Simulate internet speed test results
    const basePing = 15 + Math.random() * 25; // 15-40ms
    const downloadSpeed = 50 + Math.random() * 150; // 50-200 Mbps
    const uploadSpeed = 10 + Math.random() * 50; // 10-60 Mbps
    
    return {
      downloadSpeed: Math.round(downloadSpeed),
      uploadSpeed: Math.round(uploadSpeed),
      ping: Math.round(basePing),
      timestamp: new Date().toISOString(),
    };
  }

  // Get global latency statistics (simulated)
  async getGlobalLatencyStats(): Promise<{
    averageLatency: number;
    minLatency: number;
    maxLatency: number;
    regions: Array<{
      region: string;
      averageLatency: number;
      exchangeCount: number;
    }>;
  }> {
    const regions = [
      { region: 'North America', exchanges: ['Coinbase', 'Kraken'] },
      { region: 'Europe', exchanges: ['Binance', 'OKX'] },
      { region: 'Asia Pacific', exchanges: ['Bybit', 'KuCoin'] },
    ];
    
    const regionStats = regions.map(r => ({
      region: r.region,
      averageLatency: 25 + Math.random() * 35, // 25-60ms
      exchangeCount: r.exchanges.length,
    }));
    
    const allLatencies = regionStats.map(r => r.averageLatency);
    
    return {
      averageLatency: Math.round(allLatencies.reduce((a, b) => a + b, 0) / allLatencies.length),
      minLatency: Math.round(Math.min(...allLatencies)),
      maxLatency: Math.round(Math.max(...allLatencies)),
      regions: regionStats.map(r => ({
        ...r,
        averageLatency: Math.round(r.averageLatency),
      })),
    };
  }
}

// Export singleton instance
export const freeApisService = new FreeApisService();
export default freeApisService; 