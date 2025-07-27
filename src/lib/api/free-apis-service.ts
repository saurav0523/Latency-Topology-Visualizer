import { LatencyData } from './cloudflare-service';
import { EXCHANGES } from '../constants';

const FREE_API_ENDPOINTS = {
  'httpbin': 'https://httpbin.org/delay/0',
  'jsonplaceholder': 'https://jsonplaceholder.typicode.com/posts/1',
  'randomuser': 'https://randomuser.me/api/',
  'dogapi': 'https://dog.ceo/api/breeds/image/random',
  'catapi': 'https://api.thecatapi.com/v1/images/search',
  'weather': 'https://api.open-meteo.com/v1/forecast?latitude=52.52&longitude=13.41&current=temperature_2m',
};


export interface FreeApiLatencyResult {
  endpoint: string;
  latency: number;
  status: 'success' | 'timeout' | 'error';
  timestamp: string;
}

export interface AlternativeLatencyData extends LatencyData {
  source: 'free-api' | 'monitoring-service' | 'exchange-api';
  reliability: number; 
}

class FreeApisService {
  async measureFreeApiLatency(): Promise<FreeApiLatencyResult[]> {
    const results: FreeApiLatencyResult[] = [];
    
    for (const [name, endpoint] of Object.entries(FREE_API_ENDPOINTS)) {
      try {
        const startTime = Date.now();
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
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
          
          console.log(`Free API latency measured for ${name}: ${latency}ms`);
        } else {
          throw new Error(`HTTP ${response.status}`);
        }
      } catch (error) {
        console.warn(`Failed to measure free API latency for ${name}:`, error);
        
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
  async generateAlternativeLatencyData(): Promise<AlternativeLatencyData[]> {
    const freeApiResults = await this.measureFreeApiLatency();
    const successfulResults = freeApiResults.filter(r => r.status === 'success');
    const avgLatency = successfulResults.length > 0 
      ? successfulResults.reduce((sum, r) => sum + r.latency, 0) / successfulResults.length 
      : 50; 

    return Object.values(EXCHANGES).map(exchange => {
      let baseLatency = avgLatency;
      baseLatency += this.getGeographicLatencyFactor(exchange.location);
      baseLatency += this.getCloudProviderLatencyFactor(exchange.cloud);
      const variation = (Math.random() - 0.5) * 20;
      const finalLatency = Math.max(1, Math.round(baseLatency + variation));
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

  private getGeographicLatencyFactor(location: { lat: number; lng: number }): number {
    const baseDistance = Math.sqrt(location.lat ** 2 + location.lng ** 2);
    return Math.min(30, baseDistance * 0.15); 
  }

  private getCloudProviderLatencyFactor(cloud: string): number {
    const cloudFactors = {
      'AWS': 0,    
      'GCP': 2,    
      'Azure': 3,    
      'DigitalOcean': 5, 
      'Vultr': 8,    
      'Linode': 6,   
    };
    
    return cloudFactors[cloud as keyof typeof cloudFactors] || 0;
  }


  async getInternetSpeedData(): Promise<{
    downloadSpeed: number;
    uploadSpeed: number;
    ping: number;
    timestamp: string;
  }> {

    const basePing = 15 + Math.random() * 25; 
    const downloadSpeed = 50 + Math.random() * 150;
    const uploadSpeed = 10 + Math.random() * 50;
    
    return {
      downloadSpeed: Math.round(downloadSpeed),
      uploadSpeed: Math.round(uploadSpeed),
      ping: Math.round(basePing),
      timestamp: new Date().toISOString(),
    };
  }

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
      averageLatency: 25 + Math.random() * 35, 
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

export const freeApisService = new FreeApisService();
export default freeApisService; 