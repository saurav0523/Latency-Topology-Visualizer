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
  

  const shouldReRender = useMemo(() => {
    const currentData = props.data || [];
    const prevData = prevDataRef.current;
    
  
    if (Math.abs(currentData.length - prevData.length) > 2) {
      prevDataRef.current = currentData;
      return true;
    }
    
  
    if (currentData.length === 0 && prevData.length > 0) {
      return false;
    }
   
    if (currentData.length > 0 && prevData.length === 0) {
      prevDataRef.current = currentData;
      return true;
    }

    const currentExchanges = currentData.map(d => d.exchange).sort();
    const prevExchanges = prevData.map(d => d.exchange).sort();
    
    if (JSON.stringify(currentExchanges) !== JSON.stringify(prevExchanges)) {
      prevDataRef.current = currentData;
      return true;
    }
    
    return false;
  }, [props.data]);

  const stableData = shouldReRender ? props.data : (prevDataRef.current.length > 0 ? prevDataRef.current : props.data);
  
  return (
    <LatencyMap 
      {...props}
      data={stableData}
    />
  );
} 