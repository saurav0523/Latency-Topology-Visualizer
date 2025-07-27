export interface APIHealthMetrics {
  endpoint: string;
  uptime: number;
  responseTime: number;
  errorRate: number;
  successCount: number;
  errorCount: number;
  lastCheck: Date;
  lastSuccess?: Date;
  lastError?: Date;
}

export interface HealthReport {
  overallHealth: 'excellent' | 'good' | 'poor' | 'critical';
  averageResponseTime: number;
  totalRequests: number;
  successRate: number;
  endpoints: APIHealthMetrics[];
  lastUpdated: Date;
}

class APIHealthMonitor {
  private metrics: Map<string, APIHealthMetrics> = new Map();
  private startTime: number = Date.now();

  recordRequest(endpoint: string, responseTime: number, success: boolean): void {
    const now = new Date();
    const existing = this.metrics.get(endpoint) || {
      endpoint,
      uptime: 0,
      responseTime: 0,
      errorRate: 0,
      successCount: 0,
      errorCount: 0,
      lastCheck: now,
    };
    existing.lastCheck = now;
    existing.responseTime = (existing.responseTime + responseTime) / 2; 

    if (success) {
      existing.successCount++;
      existing.lastSuccess = now;
    } else {
      existing.errorCount++;
      existing.lastError = now;
    }
    const totalRequests = existing.successCount + existing.errorCount;
    existing.errorRate = totalRequests > 0 ? (existing.errorCount / totalRequests) * 100 : 0;

    const totalTime = Date.now() - this.startTime;
    const downtime = existing.lastError ? Date.now() - existing.lastError.getTime() : 0;
    existing.uptime = totalTime > 0 ? ((totalTime - downtime) / totalTime) * 100 : 100;

    this.metrics.set(endpoint, existing);
  }

  getHealthReport(): HealthReport {
    const endpoints = Array.from(this.metrics.values());
    const totalRequests = endpoints.reduce((sum, e) => sum + e.successCount + e.errorCount, 0);
    const totalErrors = endpoints.reduce((sum, e) => sum + e.errorCount, 0);
    const averageResponseTime = endpoints.length > 0 
      ? endpoints.reduce((sum, e) => sum + e.responseTime, 0) / endpoints.length 
      : 0;
    const successRate = totalRequests > 0 ? ((totalRequests - totalErrors) / totalRequests) * 100 : 100;

    let overallHealth: HealthReport['overallHealth'] = 'excellent';
    if (successRate < 95) overallHealth = 'good';
    if (successRate < 90) overallHealth = 'poor';
    if (successRate < 80) overallHealth = 'critical';

    return {
      overallHealth,
      averageResponseTime,
      totalRequests,
      successRate,
      endpoints,
      lastUpdated: new Date(),
    };
  }

  getEndpointHealth(endpoint: string): APIHealthMetrics | null {
    return this.metrics.get(endpoint) || null;
  }

  reset(): void {
    this.metrics.clear();
    this.startTime = Date.now();
  }

  getAlerts(): string[] {
    const alerts: string[] = [];
    const report = this.getHealthReport();

    if (report.successRate < 90) {
      alerts.push(`Low success rate: ${report.successRate.toFixed(1)}%`);
    }

    if (report.averageResponseTime > 5000) {
      alerts.push(`Slow response time: ${report.averageResponseTime.toFixed(0)}ms`);
    }

    report.endpoints.forEach(endpoint => {
      if (endpoint.errorRate > 20) {
        alerts.push(`High error rate for ${endpoint.endpoint}: ${endpoint.errorRate.toFixed(1)}%`);
      }
    });

    return alerts;
  }
}


export const healthMonitor = new APIHealthMonitor();

export const withHealthMonitoring = async <T>(
  endpoint: string,
  fn: () => Promise<T>
): Promise<T> => {
  const startTime = Date.now();
  let success = false;

  try {
    const result = await fn();
    success = true;
    return result;
  } finally {
    const responseTime = Date.now() - startTime;
    healthMonitor.recordRequest(endpoint, responseTime, success);
  }
}; 