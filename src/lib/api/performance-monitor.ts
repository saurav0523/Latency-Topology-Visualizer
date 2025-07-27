/* eslint-disable @typescript-eslint/no-unused-vars */
export interface PerformanceMetrics {
  fps: number;
  memoryUsage: number;
  renderTime: number;
  loadTime: number;
  apiResponseTime: number;
  webglInfo: WebGLInfo;
  deviceInfo: DeviceInfo;
  timestamp: number;
}

export interface WebGLInfo {
  vendor: string;
  renderer: string;
  version: string;
  maxTextureSize: number;
  maxViewportDims: number[];
  extensions: string[];
  memoryInfo?: {
    totalMemory: number;
    usedMemory: number;
    availableMemory: number;
  };
}

export interface DeviceInfo {
  userAgent: string;
  platform: string;
  cores: number;
  memory: number;
  connection: string;
  isMobile: boolean;
}

export interface PerformanceAlert {
  type: 'warning' | 'error' | 'info';
  message: string;
  timestamp: number;
  severity: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private alerts: PerformanceAlert[] = [];
  private startTime: number = Date.now();
  private frameCount: number = 0;
  private lastFrameTime: number = 0;
  private fpsHistory: number[] = [];
  private memoryHistory: number[] = [];
  private renderTimeHistory: number[] = [];
  private maxHistoryLength: number = 100;
  private isMonitoring: boolean = false;
  private monitoringInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.initializeDeviceInfo();
  }

  private initializeDeviceInfo(): void {
    if (typeof window !== 'undefined') {
      const deviceInfo: DeviceInfo = {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        cores: navigator.hardwareConcurrency || 1,
        memory: (navigator as Navigator & { deviceMemory?: number }).deviceMemory || 0,
        connection: (navigator as Navigator & { connection?: { effectiveType?: string } }).connection?.effectiveType || 'unknown',
        isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      };
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      
      if (gl) {
        const webglContext = gl as WebGLRenderingContext;
        const webglInfo: WebGLInfo = {
          vendor: webglContext.getParameter(webglContext.VENDOR) || 'Unknown',
          renderer: webglContext.getParameter(webglContext.RENDERER) || 'Unknown',
          version: webglContext.getParameter(webglContext.VERSION) || 'Unknown',
          maxTextureSize: webglContext.getParameter(webglContext.MAX_TEXTURE_SIZE) || 0,
          maxViewportDims: webglContext.getParameter(webglContext.MAX_VIEWPORT_DIMS) || [0, 0],
          extensions: webglContext.getSupportedExtensions() || []
        };
        try {
          const memoryInfo = (webglContext as WebGLRenderingContext & { getMemoryInfo?: () => { totalMemory: number; usedMemory: number; availableMemory: number } }).getMemoryInfo?.();
          if (memoryInfo) {
            webglInfo.memoryInfo = memoryInfo;
          }
        } catch (error) {
          console.warn('WebGL memory info not available');
        }

        console.log('WebGL Info:', webglInfo);
        console.log('Device Info:', deviceInfo);
      }
    }
  }

  startMonitoring(): void {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    this.startTime = Date.now();
    this.monitoringInterval = setInterval(() => {
      this.updateMetrics();
    }, 100);

    console.log('Performance monitoring started');
  }

  stopMonitoring(): void {
    if (!this.isMonitoring) return;
    
    this.isMonitoring = false;
    
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    console.log('Performance monitoring stopped');
  }

  private updateMetrics(): void {
    const now = Date.now();
    const deltaTime = now - this.lastFrameTime;
    
    if (deltaTime > 0) {
      const currentFps = 1000 / deltaTime;
      this.fpsHistory.push(currentFps);
      if (this.fpsHistory.length > this.maxHistoryLength) {
        this.fpsHistory.shift();
      }
    }

    this.lastFrameTime = now;
    this.frameCount++;
    const averageFps = this.fpsHistory.length > 0 
      ? this.fpsHistory.reduce((sum, fps) => sum + fps, 0) / this.fpsHistory.length 
      : 0;

    const estimatedMemory = this.estimateMemoryUsage();

    const metrics: PerformanceMetrics = {
      fps: Math.round(averageFps),
      memoryUsage: estimatedMemory,
      renderTime: this.getAverageRenderTime(),
      loadTime: now - this.startTime,
      apiResponseTime: this.getAverageApiResponseTime(),
      webglInfo: this.getWebGLInfo(),
      deviceInfo: this.getDeviceInfo(),
      timestamp: now
    };

    this.metrics.push(metrics);

    if (this.metrics.length > this.maxHistoryLength) {
      this.metrics.shift();
    }
    this.checkPerformanceAlerts(metrics);
  }

  private estimateMemoryUsage(): number {
    if (typeof window !== 'undefined' && (performance as Performance & { memory?: { usedJSHeapSize: number } }).memory) {
      const memory = (performance as Performance & { memory: { usedJSHeapSize: number } }).memory;
      return Math.round(memory.usedJSHeapSize / 1024 / 1024);
    }
    return 0;
  }

  private getAverageRenderTime(): number {
    if (this.renderTimeHistory.length === 0) return 0;
    return Math.round(
      this.renderTimeHistory.reduce((sum, time) => sum + time, 0) / this.renderTimeHistory.length
    );
  }

  private getAverageApiResponseTime(): number {
    return 0;
  }

  private getWebGLInfo(): WebGLInfo {
    if (typeof window !== 'undefined') {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      
      if (gl) {
        const webglContext = gl as WebGLRenderingContext;
        return {
          vendor: webglContext.getParameter(webglContext.VENDOR) || 'Unknown',
          renderer: webglContext.getParameter(webglContext.RENDERER) || 'Unknown',
          version: webglContext.getParameter(webglContext.VERSION) || 'Unknown',
          maxTextureSize: webglContext.getParameter(webglContext.MAX_TEXTURE_SIZE) || 0,
          maxViewportDims: webglContext.getParameter(webglContext.MAX_VIEWPORT_DIMS) || [0, 0],
          extensions: webglContext.getSupportedExtensions() || []
        };
      }
    }
    
    return {
      vendor: 'Unknown',
      renderer: 'Unknown',
      version: 'Unknown',
      maxTextureSize: 0,
      maxViewportDims: [0, 0],
      extensions: []
    };
  }

  private getDeviceInfo(): DeviceInfo {
    if (typeof window !== 'undefined') {
      return {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        cores: navigator.hardwareConcurrency || 1,
        memory: (navigator as Navigator & { deviceMemory?: number }).deviceMemory || 0,
        connection: (navigator as Navigator & { connection?: { effectiveType?: string } }).connection?.effectiveType || 'unknown',
        isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      };
    }
    
    return {
      userAgent: 'Unknown',
      platform: 'Unknown',
      cores: 1,
      memory: 0,
      connection: 'unknown',
      isMobile: false
    };
  }

  private checkPerformanceAlerts(metrics: PerformanceMetrics): void {
    const alerts: PerformanceAlert[] = [];
    if (metrics.fps < 15) {
      alerts.push({
        type: 'warning',
        message: `Low FPS detected: ${metrics.fps}`,
        timestamp: Date.now(),
        severity: metrics.fps < 10 ? 3 : metrics.fps < 12 ? 2 : 1
      });
    }

    if (metrics.memoryUsage > 200) {
      alerts.push({
        type: 'warning',
        message: `High memory usage: ${metrics.memoryUsage}MB`,
        timestamp: Date.now(),
        severity: metrics.memoryUsage > 500 ? 3 : 2
      });
    }

    if (metrics.renderTime > 33) {
      alerts.push({
        type: 'warning',
        message: `Slow render time: ${metrics.renderTime}ms`,
        timestamp: Date.now(),
        severity: metrics.renderTime > 50 ? 3 : 2
      });
    }


    this.alerts.push(...alerts);
    
    if (this.alerts.length > 50) {
      this.alerts = this.alerts.slice(-50);
    }

    const criticalAlerts = alerts.filter(alert => alert.severity >= 3);
    if (criticalAlerts.length > 0) {
      const lastAlert = this.alerts[this.alerts.length - 2];
      if (!lastAlert || Date.now() - lastAlert.timestamp > 5000) { 
        criticalAlerts.forEach(alert => {
          console.warn(`Critical Performance Alert: ${alert.message}`);
        });
      }
    }
  }

  recordRenderTime(renderTime: number): void {
    this.renderTimeHistory.push(renderTime);
    
    if (this.renderTimeHistory.length > this.maxHistoryLength) {
      this.renderTimeHistory.shift();
    }
  }

  recordApiResponseTime(responseTime: number): void {
  }

  getCurrentMetrics(): PerformanceMetrics | null {
    return this.metrics.length > 0 ? this.metrics[this.metrics.length - 1] : null;
  }

  getMetricsHistory(): PerformanceMetrics[] {
    return [...this.metrics];
  }

  getAlerts(): PerformanceAlert[] {
    return [...this.alerts];
  }

  getPerformanceReport(): {
    current: PerformanceMetrics | null;
    average: {
      fps: number;
      memoryUsage: number;
      renderTime: number;
    };
    alerts: PerformanceAlert[];
    recommendations: string[];
  } {
    const current = this.getCurrentMetrics();
    
    if (!current || this.metrics.length === 0) {
      return {
        current: null,
        average: { fps: 0, memoryUsage: 0, renderTime: 0 },
        alerts: this.getAlerts(),
        recommendations: []
      };
    }

    const average = {
      fps: Math.round(
        this.metrics.reduce((sum, m) => sum + m.fps, 0) / this.metrics.length
      ),
      memoryUsage: Math.round(
        this.metrics.reduce((sum, m) => sum + m.memoryUsage, 0) / this.metrics.length
      ),
      renderTime: Math.round(
        this.metrics.reduce((sum, m) => sum + m.renderTime, 0) / this.metrics.length
      )
    };

    const recommendations: string[] = [];
    
    if (average.fps < 30) {
      recommendations.push('Consider reducing WebGL complexity or enabling LOD (Level of Detail)');
    }
    
    if (average.memoryUsage > 100) {
      recommendations.push('Implement memory cleanup and object pooling');
    }
    
    if (average.renderTime > 16) {
      recommendations.push('Optimize render pipeline and reduce draw calls');
    }

    return {
      current,
      average,
      alerts: this.getAlerts(),
      recommendations
    };
  }

  clearHistory(): void {
    this.metrics = [];
    this.alerts = [];
    this.fpsHistory = [];
    this.memoryHistory = [];
    this.renderTimeHistory = [];
    console.log('Performance history cleared');
  }

  isMonitoringActive(): boolean {
    return this.isMonitoring;
  }
}


export const performanceMonitor = new PerformanceMonitor();

if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  setTimeout(() => {
    performanceMonitor.startMonitoring();
  }, 1000);
} 