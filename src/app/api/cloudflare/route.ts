import { NextRequest, NextResponse } from 'next/server';
import { cloudflareApiService } from '../../../lib/api/cloudflare-service';
import { freeApisService } from '../../../lib/api/free-apis-service';

const CLOUDFLARE_API_TOKEN = process.env.NEXT_PUBLIC_CLOUDFLARE_API_TOKEN || 'o2yCCfR0HaFRLX5i827G9mcr6yIA8GUml2DPLcAI';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const endpoint = searchParams.get('endpoint') || 'verify';
    const useRealMeasurement = searchParams.get('real') === 'true';
    
    if (endpoint === 'verify') {
      // Only verify the token - this endpoint definitely exists
      const url = 'https://api.cloudflare.com/client/v4/user/tokens/verify';
      console.log(` Proxying token verification to: ${url}`);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.error(` Token verification failed: ${response.status} ${response.statusText}`);
        
        // Log the response body for debugging
        try {
          const errorData = await response.text();
          console.error(' Error Response Body:', errorData);
        } catch {
          console.error(' Could not read error response body');
        }
        
        return NextResponse.json(
          { error: `Token verification failed: ${response.status} - ${response.statusText}` },
          { status: response.status }
        );
      }

      const data = await response.json();
      console.log(` Token verification successful: ${response.status}`);
      return NextResponse.json(data);
    } else if (endpoint === 'latency') {
      // Enhanced latency endpoint with multiple data sources
      console.log(` Fetching latency data (real measurement: ${useRealMeasurement})`);
      
      try {
        let latencyData;
        
        if (useRealMeasurement) {
          // Try real measurement first
          console.log(' Attempting real latency measurement...');
          latencyData = await cloudflareApiService.getLatencyData(true);
        } else {
          // Use enhanced simulation
          console.log(' Using enhanced simulated data...');
          latencyData = await cloudflareApiService.getLatencyData(false);
        }
        
        return NextResponse.json({
          success: true,
          result: latencyData,
          source: useRealMeasurement ? 'real-measurement' : 'enhanced-simulation'
        });
      } catch (error) {
        console.warn(' Latency data fetch failed, using fallback:', error);
        
        // Fallback to basic simulation
        const fallbackData = cloudflareApiService.generateSimulatedLatencyData();
        return NextResponse.json({
          success: true,
          result: {
            meta: {
              dateRange: {
                startTime: new Date(Date.now() - 60000).toISOString(),
                endTime: new Date().toISOString(),
              },
              lastUpdated: new Date().toISOString(),
            },
            data: fallbackData.map(item => ({
              location: item.exchange,
              latency: item.latency,
              requests: Math.floor(Math.random() * 1000) + 100,
            })),
          },
          source: 'fallback-simulation'
        });
      }
    } else if (endpoint === 'free-apis') {
      // New endpoint for free API latency measurements
      console.log(' Measuring latency to free public APIs...');
      
      try {
        const freeApiResults = await freeApisService.measureFreeApiLatency();
        const alternativeData = await freeApisService.generateAlternativeLatencyData();
        
        return NextResponse.json({
          success: true,
          result: {
            freeApiResults,
            alternativeData,
            timestamp: new Date().toISOString(),
          },
          source: 'free-apis'
        });
      } catch (error) {
        console.error(' Free API measurement failed:', error);
        return NextResponse.json(
          { error: 'Free API measurement failed' },
          { status: 500 }
        );
      }
    } else if (endpoint === 'speed-test') {
      // Internet speed test data
      console.log(' Generating internet speed test data...');
      
      try {
        const speedData = await freeApisService.getInternetSpeedData();
        const globalStats = await freeApisService.getGlobalLatencyStats();
        
        return NextResponse.json({
          success: true,
          result: {
            speedTest: speedData,
            globalStats,
            timestamp: new Date().toISOString(),
          },
          source: 'speed-test'
        });
      } catch (error) {
        console.error(' Speed test data generation failed:', error);
        return NextResponse.json(
          { error: 'Speed test data generation failed' },
          { status: 500 }
        );
      }
    } else {
      // For other endpoints, return enhanced simulated data
      console.log(` Endpoint '${endpoint}' not implemented - returning enhanced simulated data`);
      
      const simulatedData = {
        success: true,
        result: {
          meta: {
            dateRange: {
              startTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
              endTime: new Date().toISOString(),
            },
            lastUpdated: new Date().toISOString(),
          },
          data: [],
          message: `Endpoint '${endpoint}' not implemented - using enhanced simulation`
        },
        source: 'enhanced-simulation'
      };
      
      return NextResponse.json(simulatedData);
    }
  } catch (error) {
    console.error(' Proxy Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 