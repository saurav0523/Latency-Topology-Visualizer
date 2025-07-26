"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

export interface LatencyHistoryPoint {
  time: string;
  latency: number;
}

interface LatencyHistoryConfig {
  maxDataPoints: number;
  updateInterval: number;
  cleanupInterval: number;
  memoryThreshold: number;
}

const DEFAULT_CONFIG: LatencyHistoryConfig = {
  maxDataPoints: 100, // Reduced from unlimited to prevent memory bloat
  updateInterval: 5000,
  cleanupInterval: 30000, // Clean up every 30 seconds
  memoryThreshold: 1000 // Maximum data points before aggressive cleanup
};

export function useLatencyHistory(
  exchange: string, 
  initialLatency: number,
  config: Partial<LatencyHistoryConfig> = {}
) {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  
  // Use refs to prevent unnecessary re-renders and memory leaks
  const dataRef = useRef<LatencyHistoryPoint[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const cleanupIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastUpdateRef = useRef<number>(Date.now());
  const memoryUsageRef = useRef<number>(0);
  
  // Memoized initial data generation to prevent recreation on every render
  const initialData = useMemo(() => {
    const now = Date.now();
    return Array.from({ length: Math.min(30, finalConfig.maxDataPoints) }, (_, i) => ({
      time: new Date(now - (29 - i) * 60 * 1000).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      latency: initialLatency + Math.round((Math.random() - 0.5) * 10),
    }));
  }, [initialLatency, finalConfig.maxDataPoints]);

  // Initialize data only once
  const [data, setData] = useState<LatencyHistoryPoint[]>(initialData);

  // Memory cleanup function
  const cleanupData = useCallback(() => {
    const currentData = dataRef.current;
    const now = Date.now();
    
    // Remove data points older than 1 hour
    const oneHourAgo = now - (60 * 60 * 1000);
    const filteredData = currentData.filter(point => {
      const pointTime = new Date(point.time).getTime();
      return pointTime > oneHourAgo;
    });

    // If still too many points, keep only the most recent ones
    if (filteredData.length > finalConfig.maxDataPoints) {
      const excess = filteredData.length - finalConfig.maxDataPoints;
      filteredData.splice(0, excess);
    }

    // Update memory usage tracking
    memoryUsageRef.current = filteredData.length;
    
    // Only update state if data actually changed
    if (filteredData.length !== currentData.length) {
      dataRef.current = filteredData;
      setData(filteredData);
      console.log(`🧹 Cleaned up latency history: ${currentData.length} -> ${filteredData.length} points`);
    }
  }, [finalConfig.maxDataPoints]);

  // Aggressive cleanup when memory usage is high
  const aggressiveCleanup = useCallback(() => {
    const currentData = dataRef.current;
    if (currentData.length > finalConfig.memoryThreshold) {
      // Keep only the most recent 50% of data points
      const keepCount = Math.floor(currentData.length * 0.5);
      const cleanedData = currentData.slice(-keepCount);
      
      dataRef.current = cleanedData;
      setData(cleanedData);
      memoryUsageRef.current = cleanedData.length;
      
      console.log(`🚨 Aggressive cleanup: ${currentData.length} -> ${cleanedData.length} points`);
    }
  }, [finalConfig.memoryThreshold]);

  // Optimized data update function
  const updateData = useCallback(() => {
    const now = Date.now();
    const currentData = dataRef.current;
    
    // Generate new latency with realistic variation
    const lastLatency = currentData.length > 0 ? currentData[currentData.length - 1].latency : initialLatency;
    const variation = Math.round((Math.random() - 0.5) * 8);
    const newLatency = Math.max(1, lastLatency + variation);
    
    const newPoint: LatencyHistoryPoint = {
      time: new Date(now).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      latency: newLatency,
    };

    // Add new point and maintain max data points
    const updatedData = [...currentData, newPoint];
    if (updatedData.length > finalConfig.maxDataPoints) {
      updatedData.shift(); // Remove oldest point
    }

    dataRef.current = updatedData;
    setData(updatedData);
    lastUpdateRef.current = now;
    memoryUsageRef.current = updatedData.length;

    // Check if aggressive cleanup is needed
    if (updatedData.length > finalConfig.memoryThreshold) {
      aggressiveCleanup();
    }
  }, [initialLatency, finalConfig.maxDataPoints, finalConfig.memoryThreshold, aggressiveCleanup]);

  // Setup intervals with proper cleanup
  useEffect(() => {
    // Clear any existing intervals
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (cleanupIntervalRef.current) {
      clearInterval(cleanupIntervalRef.current);
      cleanupIntervalRef.current = null;
    }

    // Initialize data ref
    dataRef.current = initialData;
    memoryUsageRef.current = initialData.length;

    // Set up data update interval
    intervalRef.current = setInterval(() => {
      updateData();
    }, finalConfig.updateInterval);

    // Set up cleanup interval
    cleanupIntervalRef.current = setInterval(() => {
      cleanupData();
    }, finalConfig.cleanupInterval);

    // Cleanup function
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (cleanupIntervalRef.current) {
        clearInterval(cleanupIntervalRef.current);
        cleanupIntervalRef.current = null;
      }
      
      // Clear data refs to prevent memory leaks
      dataRef.current = [];
      memoryUsageRef.current = 0;
    };
  }, [exchange, finalConfig.updateInterval, finalConfig.cleanupInterval, initialData, updateData, cleanupData]);

  // Reset data when exchange changes
  useEffect(() => {
    dataRef.current = initialData;
    setData(initialData);
    memoryUsageRef.current = initialData.length;
    lastUpdateRef.current = Date.now();
  }, [exchange, initialData]);

  // Memoized statistics to prevent unnecessary recalculations
  const stats = useMemo(() => {
    if (data.length === 0) return { min: 0, max: 0, average: 0, trend: 'stable' };
    
    const latencies = data.map(d => d.latency);
    const min = Math.min(...latencies);
    const max = Math.max(...latencies);
    const average = Math.round(latencies.reduce((sum, val) => sum + val, 0) / latencies.length);
    
    // Calculate trend
    const recent = latencies.slice(-5);
    const older = latencies.slice(-10, -5);
    const recentAvg = recent.reduce((sum, val) => sum + val, 0) / recent.length;
    const olderAvg = older.reduce((sum, val) => sum + val, 0) / older.length;
    
    let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
    if (recentAvg > olderAvg + 5) trend = 'increasing';
    else if (recentAvg < olderAvg - 5) trend = 'decreasing';
    
    return { min, max, average, trend };
  }, [data]);

  // Expose cleanup function for manual cleanup
  const manualCleanup = useCallback(() => {
    cleanupData();
  }, [cleanupData]);

  // Expose memory usage for monitoring
  const getMemoryUsage = useCallback(() => {
    return {
      dataPoints: memoryUsageRef.current,
      maxAllowed: finalConfig.maxDataPoints,
      memoryThreshold: finalConfig.memoryThreshold,
      lastUpdate: lastUpdateRef.current
    };
  }, [finalConfig.maxDataPoints, finalConfig.memoryThreshold]);

  return {
    data,
    stats,
    manualCleanup,
    getMemoryUsage,
    // Expose refs for advanced usage (use with caution)
    _refs: {
      dataRef,
      memoryUsageRef,
      lastUpdateRef
    }
  };
} 