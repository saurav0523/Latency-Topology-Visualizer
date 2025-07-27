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
  maxDataPoints: 100, 
  updateInterval: 5000,
  cleanupInterval: 30000,
  memoryThreshold: 1000
};

export function useLatencyHistory(
  exchange: string, 
  initialLatency: number,
  config: Partial<LatencyHistoryConfig> = {}
) {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const dataRef = useRef<LatencyHistoryPoint[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const cleanupIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastUpdateRef = useRef<number>(Date.now());
  const memoryUsageRef = useRef<number>(0);
  

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

  
  const [data, setData] = useState<LatencyHistoryPoint[]>(initialData);


  const cleanupData = useCallback(() => {
    const currentData = dataRef.current;
    const now = Date.now();
    
    const oneHourAgo = now - (60 * 60 * 1000);
    const filteredData = currentData.filter(point => {
      const pointTime = new Date(point.time).getTime();
      return pointTime > oneHourAgo;
    });

  
    if (filteredData.length > finalConfig.maxDataPoints) {
      const excess = filteredData.length - finalConfig.maxDataPoints;
      filteredData.splice(0, excess);
    }

 
    memoryUsageRef.current = filteredData.length;
    
 
    if (filteredData.length !== currentData.length) {
      dataRef.current = filteredData;
      setData(filteredData);
    }
  }, [finalConfig.maxDataPoints]);

  const aggressiveCleanup = useCallback(() => {
    const currentData = dataRef.current;
    if (currentData.length > finalConfig.memoryThreshold) {
      const keepCount = Math.floor(currentData.length * 0.5);
      const cleanedData = currentData.slice(-keepCount);
      
      dataRef.current = cleanedData;
      setData(cleanedData);
      memoryUsageRef.current = cleanedData.length;
    }
  }, [finalConfig.memoryThreshold]);

  const updateData = useCallback(() => {
    const now = Date.now();
    const currentData = dataRef.current;
    
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

    const updatedData = [...currentData, newPoint];
    if (updatedData.length > finalConfig.maxDataPoints) {
      updatedData.shift(); 
    }

    dataRef.current = updatedData;
    setData(updatedData);
    lastUpdateRef.current = now;
    memoryUsageRef.current = updatedData.length;

    if (updatedData.length > finalConfig.memoryThreshold) {
      aggressiveCleanup();
    }
  }, [initialLatency, finalConfig.maxDataPoints, finalConfig.memoryThreshold, aggressiveCleanup]);

  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (cleanupIntervalRef.current) {
      clearInterval(cleanupIntervalRef.current);
      cleanupIntervalRef.current = null;
    }
    dataRef.current = initialData;
    memoryUsageRef.current = initialData.length;

    intervalRef.current = setInterval(() => {
      updateData();
    }, finalConfig.updateInterval);

    cleanupIntervalRef.current = setInterval(() => {
      cleanupData();
    }, finalConfig.cleanupInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (cleanupIntervalRef.current) {
        clearInterval(cleanupIntervalRef.current);
        cleanupIntervalRef.current = null;
      }
      dataRef.current = [];
      memoryUsageRef.current = 0;
    };
  }, [exchange, finalConfig.updateInterval, finalConfig.cleanupInterval, initialData, updateData, cleanupData]);

  useEffect(() => {
    dataRef.current = initialData;
    setData(initialData);
    memoryUsageRef.current = initialData.length;
    lastUpdateRef.current = Date.now();
  }, [exchange, initialData]);
  const stats = useMemo(() => {
    if (data.length === 0) return { min: 0, max: 0, average: 0, trend: 'stable' };
    
    const latencies = data.map(d => d.latency);
    const min = Math.min(...latencies);
    const max = Math.max(...latencies);
    const average = Math.round(latencies.reduce((sum, val) => sum + val, 0) / latencies.length);
    const recent = latencies.slice(-5);
    const older = latencies.slice(-10, -5);
    const recentAvg = recent.reduce((sum, val) => sum + val, 0) / recent.length;
    const olderAvg = older.reduce((sum, val) => sum + val, 0) / older.length;
    
    let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
    if (recentAvg > olderAvg + 5) trend = 'increasing';
    else if (recentAvg < olderAvg - 5) trend = 'decreasing';
    
    return { min, max, average, trend };
  }, [data]);
  const manualCleanup = useCallback(() => {
    cleanupData();
  }, [cleanupData]);
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
    _refs: {
      dataRef,
      memoryUsageRef,
      lastUpdateRef
    }
  };
} 