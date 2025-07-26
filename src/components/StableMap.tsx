import React, { useMemo, useRef } from 'react';
import LatencyMap from './Map';
import { LatencyData } from '../lib/api/cloudflare-service';

interface StableMapProps {
  data: LatencyData[];
  selectedExchange: string | null;
  onExchangeSelect: (exchange: string | null) => void;
  showTooltips: boolean;
  view: '2d' | '3d';
  showRegions: boolean;
  searchQuery: string;
  latencyRange: { min: number; max: number };
}

export default function StableMap(props: StableMapProps) {
  const prevDataRef = useRef<LatencyData[]>([]);
  
  // Only re-render if data actually changed significantly
  const shouldReRender = useMemo(() => {
    const currentData = props.data || [];
    const prevData = prevDataRef.current;
    
    // If data length changed significantly, re-render
    if (Math.abs(currentData.length - prevData.length) > 2) {
      prevDataRef.current = currentData;
      return true;
    }
    
    // If data is empty and we had data before, don't re-render
    if (currentData.length === 0 && prevData.length > 0) {
      return false;
    }
    
    // If we have data now and didn't before, re-render
    if (currentData.length > 0 && prevData.length === 0) {
      prevDataRef.current = currentData;
      return true;
    }
    
    // Check if exchange data changed significantly
    const currentExchanges = currentData.map(d => d.exchange).sort();
    const prevExchanges = prevData.map(d => d.exchange).sort();
    
    if (JSON.stringify(currentExchanges) !== JSON.stringify(prevExchanges)) {
      prevDataRef.current = currentData;
      return true;
    }
    
    return false;
  }, [props.data]);
  
  // If we shouldn't re-render and we have previous data, use the previous data
  const stableData = shouldReRender ? props.data : (prevDataRef.current.length > 0 ? prevDataRef.current : props.data);
  
  return (
    <LatencyMap 
      {...props}
      data={stableData}
    />
  );
} 