"use client";

import React, { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text, Html, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { LatencyData } from '../lib/api/cloudflare-service';
import { CLOUD_PROVIDERS } from '../lib/constants';

interface MapProps {
  data: LatencyData[];
  selectedExchange: string | null;
  onExchangeSelect: (exchange: string | null) => void;
  showTooltips: boolean;
  view: '2d' | '3d';
  showRegions: boolean;
  searchQuery: string;
  latencyRange: { min: number; max: number };
}

// Earth component with texture
function Earth({ performanceMode = false }: { performanceMode?: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame(() => {
    if (meshRef.current && !performanceMode) {
      meshRef.current.rotation.y += 0.001;
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[100, performanceMode ? 32 : 64, performanceMode ? 32 : 64]} />
      <meshPhongMaterial 
        color="#1e40af" 
        transparent 
        opacity={0.3}
        wireframe={false}
      />
    </mesh>
  );
}

// Exchange marker component
function ExchangeMarker({ 
  exchange, 
  position, 
  latency, 
  cloud, 
  region, 
  isSelected, 
  onSelect, 
  showTooltip,
  latencyRange,
  performanceMode = false
}: {
  exchange: string;
  position: [number, number, number];
  latency: number;
  cloud: string;
  region: string;
  isSelected: boolean;
  onSelect: () => void;
  showTooltip: boolean;
  latencyRange: { min: number; max: number };
  performanceMode?: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  
  // Animate marker - reduced animation in performance mode
  useFrame((state) => {
    if (meshRef.current && !performanceMode && !isSelected) {
      // Only animate if not selected and not in performance mode
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 1) * 1; // Reduced animation
      meshRef.current.rotation.y += 0.01; // Reduced rotation speed
    }
  });

  // Get color based on latency and cloud provider
  const getMarkerColor = () => {
    const normalizedLatency = (latency - latencyRange.min) / (latencyRange.max - latencyRange.min);
    
    if (normalizedLatency < 0.3) return '#22c55e'; // Green for low latency
    if (normalizedLatency < 0.7) return '#eab308'; // Yellow for medium latency
    return '#ef4444'; // Red for high latency
  };

  const getCloudColor = () => {
    return CLOUD_PROVIDERS[cloud as keyof typeof CLOUD_PROVIDERS]?.color || '#6b7280';
  };

  const markerSize = isSelected ? 3 : hovered ? 2.5 : 2;
  const cloudProviderColor = getCloudColor();
  const latencyColor = getMarkerColor();

  return (
    <group position={position}>
      {/* Main marker */}
      <mesh
        ref={meshRef}
        onClick={onSelect}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[markerSize, 16, 16]} />
        <meshStandardMaterial 
          color={latencyColor}
          emissive={latencyColor}
          emissiveIntensity={0.2}
        />
      </mesh>
      
      {/* Cloud provider ring */}
      <mesh position={[0, 0, 0]}>
        <ringGeometry args={[markerSize + 1, markerSize + 1.5, 16]} />
        <meshBasicMaterial color={cloudProviderColor} transparent opacity={0.6} />
      </mesh>
      
      {/* Pulse effect for selected marker - only if not in performance mode */}
      {isSelected && !performanceMode && (
        <mesh>
          <sphereGeometry args={[markerSize + 3, 16, 16]} />
          <meshBasicMaterial color={latencyColor} transparent opacity={0.3} />
        </mesh>
      )}
      
      {/* Tooltip */}
      {showTooltip && (hovered || isSelected) && (
        <Html position={[0, markerSize + 5, 0]} center>
          <div className="bg-black/80 text-white p-3 rounded-lg text-sm whitespace-nowrap">
            <div className="font-bold">{exchange}</div>
            <div>Latency: {latency}ms</div>
            <div>Cloud: {cloud}</div>
            <div>Region: {region}</div>
          </div>
        </Html>
      )}
      
      {/* Exchange name label */}
      {(isSelected || hovered) && (
        <Text
          position={[0, markerSize + 8, 0]}
          fontSize={1.5}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          {exchange}
        </Text>
      )}
    </group>
  );
}

// Latency connection component
function LatencyConnection({ 
  from, 
  to, 
  latency, 
  latencyRange 
}: {
  from: [number, number, number];
  to: [number, number, number];
  latency: number;
  latencyRange: { min: number; max: number };
}) {
  const lineRef = useRef<THREE.Line>(null);
  
  // Get color based on latency
  const getConnectionColor = () => {
    const normalizedLatency = (latency - latencyRange.min) / (latencyRange.max - latencyRange.min);
    
    if (normalizedLatency < 0.3) return '#22c55e'; // Green for low latency
    if (normalizedLatency < 0.7) return '#eab308'; // Yellow for medium latency
    return '#ef4444'; // Red for high latency
  };

  const color = getConnectionColor();
  const points = [new THREE.Vector3(...from), new THREE.Vector3(...to)];
  const geometry = new THREE.BufferGeometry().setFromPoints(points);

  return (
    <primitive object={new THREE.Line(geometry, new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.6 }))} />
  );
}

// Cloud region visualization
function CloudRegion({ 
  region, 
  exchanges, 
  cloud, 
  showRegions 
}: {
  region: string;
  exchanges: LatencyData[];
  cloud: string;
  showRegions: boolean;
}) {
  if (!showRegions || exchanges.length === 0) return null;

  const center = exchanges.reduce(
    (acc, exchange) => [
      acc[0] + exchange.location.lng,
      acc[1] + exchange.location.lat,
      0
    ],
    [0, 0, 0]
  ).map(coord => coord / exchanges.length) as [number, number, number];

  const radius = Math.max(5, exchanges.length * 2);
  const cloudColor = CLOUD_PROVIDERS[cloud as keyof typeof CLOUD_PROVIDERS]?.color || '#6b7280';

  return (
    <group position={center}>
      <mesh>
        <sphereGeometry args={[radius, 16, 16]} />
        <meshBasicMaterial color={cloudColor} transparent opacity={0.1} wireframe />
      </mesh>
      <Text
        position={[0, radius + 2, 0]}
        fontSize={1}
        color={cloudColor}
        anchorX="center"
        anchorY="middle"
      >
        {region} ({exchanges.length})
      </Text>
    </group>
  );
}

// Main 3D scene component
function LatencyScene({ 
  data, 
  selectedExchange, 
  onExchangeSelect, 
  showTooltips, 
  showRegions, 
  searchQuery, 
  latencyRange, 
  performanceMode 
}: MapProps & { performanceMode: boolean }) {
  const { camera } = useThree();
  
  // Filter data based on search query and latency range - with debouncing
  const filteredData = useMemo(() => {
    // If data is empty, return empty array to prevent blinking
    if (!data || data.length === 0) {
      return [];
    }
    
    return data.filter(exchange => {
      const matchesSearch = searchQuery === '' || 
        exchange.exchange.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exchange.region.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesLatency = exchange.latency >= latencyRange.min && 
        exchange.latency <= latencyRange.max;
      
      return matchesSearch && matchesLatency;
    });
  }, [data, searchQuery, latencyRange]);

  // Group exchanges by region for cloud region visualization
  const exchangesByRegion = useMemo(() => {
    const grouped: { [key: string]: LatencyData[] } = {};
    filteredData.forEach(exchange => {
      const key = `${exchange.cloud}-${exchange.region}`;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(exchange);
    });
    return grouped;
  }, [filteredData]);

  // Convert lat/lng to 3D position - memoized to prevent recalculation
  const getPosition = useCallback((lat: number, lng: number): [number, number, number] => {
    const radius = 102; // Slightly larger than Earth radius
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);
    
    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const z = radius * Math.sin(phi) * Math.sin(theta);
    const y = radius * Math.cos(phi);
    
    return [x, y, z];
  }, []);

  // Auto-rotate camera - optimized for performance and reduced frequency
  useEffect(() => {
    if (performanceMode) return; // Disable auto-rotation in performance mode
    
    const interval = setInterval(() => {
      if (camera && !selectedExchange) {
        camera.position.x = Math.cos(Date.now() * 0.00005) * 300; // Reduced speed
        camera.position.z = Math.sin(Date.now() * 0.00005) * 300;
        camera.lookAt(0, 0, 0);
      }
    }, 32); // Reduced frequency from 16ms to 32ms

    return () => clearInterval(interval);
  }, [camera, selectedExchange, performanceMode]);

  // Don't render if no data to prevent blinking
  if (!filteredData || filteredData.length === 0) {
    return (
      <>
        <Earth performanceMode={performanceMode} />
        <Stars 
          radius={300} 
          depth={50} 
          count={performanceMode ? 1000 : 5000} 
          factor={4} 
          saturation={0} 
          fade 
        />
        <ambientLight intensity={0.3} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
      </>
    );
  }

  return (
    <>
      {/* Earth */}
      <Earth performanceMode={performanceMode} />
      
      {/* Stars background - reduced count for performance */}
      <Stars 
        radius={300} 
        depth={50} 
        count={performanceMode ? 1000 : 5000} 
        factor={4} 
        saturation={0} 
        fade 
      />
      
      {/* Ambient light */}
      <ambientLight intensity={0.3} />
      
      {/* Directional light */}
      <directionalLight position={[10, 10, 5]} intensity={1} />
      
      {/* Exchange markers - limit number in performance mode */}
      {(performanceMode ? filteredData.slice(0, 20) : filteredData).map((exchange) => {
        const position = getPosition(exchange.location.lat, exchange.location.lng);
        const isSelected = selectedExchange === exchange.exchange;
        
        return (
          <ExchangeMarker
            key={exchange.exchange}
            exchange={exchange.exchange}
            position={position}
            latency={exchange.latency}
            cloud={exchange.cloud}
            region={exchange.region}
            isSelected={isSelected}
            onSelect={() => onExchangeSelect(isSelected ? null : exchange.exchange)}
            showTooltip={showTooltips && !performanceMode}
            latencyRange={latencyRange}
            performanceMode={performanceMode}
          />
        );
      })}
      
      {/* Cloud regions - only show in non-performance mode */}
      {!performanceMode && Object.entries(exchangesByRegion).map(([key, exchanges]) => {
        const [cloud, region] = key.split('-');
        return (
          <CloudRegion
            key={key}
            region={region}
            exchanges={exchanges}
            cloud={cloud}
            showRegions={showRegions}
          />
        );
      })}
      
      {/* Latency connections (show connections from selected exchange) */}
      {selectedExchange && filteredData.length > 1 && (
        <>
          {filteredData
            .filter(exchange => exchange.exchange !== selectedExchange)
            .slice(0, 5) // Limit to 5 connections for performance
            .map((exchange) => {
              const fromPosition = getPosition(
                filteredData.find(e => e.exchange === selectedExchange)!.location.lat,
                filteredData.find(e => e.exchange === selectedExchange)!.location.lng
              );
              const toPosition = getPosition(exchange.location.lat, exchange.location.lng);
              
              return (
                <LatencyConnection
                  key={`${selectedExchange}-${exchange.exchange}`}
                  from={fromPosition}
                  to={toPosition}
                  latency={exchange.latency}
                  latencyRange={latencyRange}
                />
              );
            })}
        </>
      )}
    </>
  );
}

// 2D Map fallback component
function Map2D({ 
  data, 
  selectedExchange, 
  onExchangeSelect, 
  showTooltips, 
  searchQuery, 
  latencyRange 
}: MapProps) {
  const [hoveredExchange, setHoveredExchange] = useState<string | null>(null);

  const filteredData = useMemo(() => {
    return data.filter(exchange => {
      const matchesSearch = searchQuery === '' || 
        exchange.exchange.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exchange.region.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesLatency = exchange.latency >= latencyRange.min && 
        exchange.latency <= latencyRange.max;
      
      return matchesSearch && matchesLatency;
    });
  }, [data, searchQuery, latencyRange]);

  const getMarkerColor = (latency: number) => {
    const normalizedLatency = (latency - latencyRange.min) / (latencyRange.max - latencyRange.min);
    if (normalizedLatency < 0.3) return '#22c55e';
    if (normalizedLatency < 0.7) return '#eab308';
    return '#ef4444';
  };

  const getCloudColor = (cloud: string) => {
    return CLOUD_PROVIDERS[cloud as keyof typeof CLOUD_PROVIDERS]?.color || '#6b7280';
  };

  return (
    <div className="w-full h-96 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-900 rounded-lg relative overflow-hidden">
      {/* World map background */}
      <div className="absolute inset-0 opacity-20">
        <svg viewBox="0 0 1000 500" className="w-full h-full">
          <path d="M100,200 Q300,150 500,200 T900,200" stroke="#1e40af" strokeWidth="2" fill="none"/>
          <path d="M100,300 Q300,250 500,300 T900,300" stroke="#1e40af" strokeWidth="2" fill="none"/>
          <circle cx="200" cy="150" r="3" fill="#1e40af"/>
          <circle cx="400" cy="180" r="3" fill="#1e40af"/>
          <circle cx="600" cy="220" r="3" fill="#1e40af"/>
          <circle cx="800" cy="160" r="3" fill="#1e40af"/>
        </svg>
      </div>

      {/* Exchange markers */}
      {filteredData.map((exchange) => {
        // Simple 2D positioning based on lat/lng
        const x = ((exchange.location.lng + 180) / 360) * 100;
        const y = ((90 - exchange.location.lat) / 180) * 100;
        const isSelected = selectedExchange === exchange.exchange;
        const isHovered = hoveredExchange === exchange.exchange;

        return (
          <div
            key={exchange.exchange}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-200"
            style={{
              left: `${x}%`,
              top: `${y}%`,
              zIndex: isSelected ? 10 : isHovered ? 5 : 1
            }}
            onClick={() => onExchangeSelect(isSelected ? null : exchange.exchange)}
            onMouseEnter={() => setHoveredExchange(exchange.exchange)}
            onMouseLeave={() => setHoveredExchange(null)}
          >
            {/* Marker */}
            <div
              className={`w-4 h-4 rounded-full border-2 border-white shadow-lg transition-all duration-200 ${
                isSelected ? 'scale-150' : isHovered ? 'scale-125' : 'scale-100'
              }`}
              style={{
                backgroundColor: getMarkerColor(exchange.latency),
                borderColor: getCloudColor(exchange.cloud)
              }}
            />
            
            {/* Tooltip */}
            {showTooltips && (isHovered || isSelected) && (
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-black/90 text-white text-xs rounded-lg whitespace-nowrap z-20">
                <div className="font-bold">{exchange.exchange}</div>
                <div>{exchange.latency}ms</div>
                <div>{exchange.region}</div>
                <div>{exchange.cloud}</div>
              </div>
            )}
          </div>
        );
              })}

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white/90 dark:bg-gray-800/90 p-3 rounded-lg text-sm">
        <div className="font-bold mb-2">Latency Colors:</div>
        <div className="flex items-center space-x-2 mb-1">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span>Low</span>
        </div>
        <div className="flex items-center space-x-2 mb-1">
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <span>Medium</span>
        </div>
        <div className="flex items-center space-x-2 mb-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <span>High</span>
        </div>
      </div>

      {/* Stats */}
      <div className="absolute top-4 right-4 bg-white/90 dark:bg-gray-800/90 p-3 rounded-lg text-sm">
        <div className="font-bold mb-1">Active Exchanges</div>
        <div className="text-2xl font-bold">{filteredData.length}</div>
      </div>
    </div>
  );
}

// Main Map component
export default function LatencyMap(props: MapProps) {
  const [mounted, setMounted] = useState(false);
  const [performanceMode, setPerformanceMode] = useState(false);
  const [use2D, setUse2D] = useState(false);
  const [canvasKey, setCanvasKey] = useState(0); // Add key to prevent unnecessary Canvas recreation

  useEffect(() => {
    setMounted(true);
    
    // Detect low-end devices and enable performance mode
    const isLowEndDevice = () => {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl') as WebGLRenderingContext | null;
      if (!gl) return true;
      
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) as string;
        return renderer.includes('Intel') || renderer.includes('Mali') || renderer.includes('Adreno');
      }
      
      return navigator.hardwareConcurrency < 4 || window.innerWidth < 1024;
    };
    
    if (isLowEndDevice()) {
      setPerformanceMode(true);
      setUse2D(true); // Force 2D for very low-end devices
    }
  }, []);

  // Use 2D mode if explicitly requested or if performance mode is enabled
  const shouldUse2D = props.view === '2d' || use2D;

  // Only recreate Canvas if view mode changes
  useEffect(() => {
    if (mounted) {
      setCanvasKey(prev => prev + 1);
    }
  }, [props.view, mounted]);

  if (!mounted) {
    return (
      <div className="w-full h-96 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
        <div className="text-gray-500">Loading Map...</div>
      </div>
    );
  }

  // Use 2D map for better performance
  if (shouldUse2D) {
    return <Map2D {...props} />;
  }

  return (
    <div className="w-full h-96 relative">
      <Canvas
        key={canvasKey} // Use key to prevent unnecessary recreation
        camera={{ position: [0, 0, 300], fov: 60 }}
        style={{ background: 'linear-gradient(to bottom, #0f172a, #1e293b)' }}
        gl={{
          antialias: !performanceMode,
          powerPreference: "high-performance",
          alpha: false,
          depth: true,
          stencil: false,
          preserveDrawingBuffer: false,
        }}
        frameloop={performanceMode ? "demand" : "always"}
        dpr={performanceMode ? 1 : window.devicePixelRatio}
        performance={{ min: 0.5 }}
      >
        <LatencyScene {...props} performanceMode={performanceMode} />
        <OrbitControls 
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          maxDistance={500}
          minDistance={150}
          autoRotate={!props.selectedExchange && !performanceMode}
          autoRotateSpeed={0.5}
          enableDamping={!performanceMode}
          dampingFactor={0.05}
        />
      </Canvas>
      
      {/* Performance mode indicator */}
      {performanceMode && (
        <div className="absolute top-4 left-4 bg-yellow-500/90 text-black p-2 rounded-lg text-xs font-bold">
          Performance Mode
        </div>
      )}
      
      {/* 2D Fallback Button */}
      <button
        onClick={() => setUse2D(!use2D)}
        className="absolute top-4 left-4 bg-blue-500/90 text-white p-2 rounded-lg text-xs font-bold hover:bg-blue-600/90 transition-colors"
      >
        Switch to {use2D ? '3D' : '2D'}
      </button>
      
      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-black/80 text-white p-3 rounded-lg text-sm">
        <div className="font-bold mb-2">Latency Colors:</div>
        <div className="flex items-center space-x-2 mb-1">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span>Low (&lt;{Math.round(props.latencyRange.min + (props.latencyRange.max - props.latencyRange.min) * 0.3)}ms)</span>
        </div>
        <div className="flex items-center space-x-2 mb-1">
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <span>Medium</span>
        </div>
        <div className="flex items-center space-x-2 mb-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <span>High (&gt;{Math.round(props.latencyRange.min + (props.latencyRange.max - props.latencyRange.min) * 0.7)}ms)</span>
        </div>
        <div className="font-bold mb-2">Cloud Providers:</div>
        {Object.entries(CLOUD_PROVIDERS).map(([key, provider]) => (
          <div key={key} className="flex items-center space-x-2 mb-1">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: provider.color }}
            ></div>
            <span>{provider.name}</span>
          </div>
        ))}
      </div>
      
      {/* Stats overlay */}
      <div className="absolute top-4 right-4 bg-black/80 text-white p-3 rounded-lg text-sm">
        <div className="font-bold mb-1">Active Exchanges</div>
        <div className="text-2xl font-bold">{props.data.length}</div>
        <div className="text-xs text-gray-300">
          Showing {props.data.filter(d => 
            d.exchange.toLowerCase().includes(props.searchQuery.toLowerCase()) ||
            d.region.toLowerCase().includes(props.searchQuery.toLowerCase())
          ).length} filtered
        </div>
      </div>
    </div>
  );
} 