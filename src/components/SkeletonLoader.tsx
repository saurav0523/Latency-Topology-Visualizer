import React, { useState, useEffect, useMemo } from 'react';

interface SkeletonCardProps {
  className?: string;
  variant?: 'default' | 'compact' | 'detailed';
  animationSpeed?: 'slow' | 'normal' | 'fast';
}

const SkeletonCard: React.FC<SkeletonCardProps> = ({ 
  className = '', 
  variant = 'default',
  animationSpeed = 'normal'
}) => {
  const animationClass = useMemo(() => {
    switch (animationSpeed) {
      case 'slow': return 'animate-pulse';
      case 'fast': return 'animate-pulse-fast';
      default: return 'animate-pulse';
    }
  }, [animationSpeed]);

  const variantClasses = useMemo(() => {
    switch (variant) {
      case 'compact':
        return 'p-4';
      case 'detailed':
        return 'p-8';
      default:
        return 'p-6';
    }
  }, [variant]);

  return (
    <div className={`bg-white/70 backdrop-blur-sm rounded-xl border border-gray-200/50 shadow-sm ${variantClasses} ${className}`}>
      <div className={animationClass}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1">
          <div className="h-6 bg-gray-200 rounded mb-2 w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="h-8 bg-gray-200 rounded-full w-16"></div>
      </div>

      <div className="space-y-2">
        <div className="h-2 bg-gray-200 rounded-full"></div>
        <div className="flex justify-between text-xs text-gray-400">
          <div className="h-3 bg-gray-200 rounded w-8"></div>
          <div className="h-3 bg-gray-200 rounded w-12"></div>
        </div>
      </div>

        {variant === 'detailed' && (
          <div className="mt-4 space-y-3">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        )}
    </div>
  </div>
);
};

interface SkeletonStatsProps {
  count?: number;
  variant?: 'default' | 'compact' | 'detailed';
  loadingStage?: 'initial' | 'data' | 'complete';
}

export const SkeletonStats: React.FC<SkeletonStatsProps> = ({ 
  count = 5, 
  variant = 'default',
  loadingStage = 'initial'
}) => {
  const [currentStage, setCurrentStage] = useState(loadingStage);
  const [visibleCount, setVisibleCount] = useState(0);


  useEffect(() => {
    setCurrentStage(loadingStage);
    
    if (loadingStage === 'initial') {
      setVisibleCount(0);
    } else if (loadingStage === 'data') {
      const timer = setTimeout(() => setVisibleCount(Math.min(3, count)), 200);
      const timer2 = setTimeout(() => setVisibleCount(Math.min(5, count)), 400);
      const timer3 = setTimeout(() => setVisibleCount(count), 600);
      
      return () => {
        clearTimeout(timer);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    } else {
      setVisibleCount(count);
    }
  }, [loadingStage, count]);

  const gridClasses = useMemo(() => {
    switch (variant) {
      case 'compact':
        return 'grid-cols-2 md:grid-cols-4 lg:grid-cols-6';
      case 'detailed':
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
      default:
        return 'grid-cols-1 md:grid-cols-3 lg:grid-cols-5';
    }
  }, [variant]);

  if (currentStage === 'complete') {
    return null; 
  }

  return (
    <div className={`grid gap-6 ${gridClasses} mb-8`}>
      {Array.from({ length: visibleCount }).map((_, i) => (
        <SkeletonCard 
          key={i} 
          variant={variant}
          animationSpeed={i < 2 ? 'fast' : 'normal'}
          className={`transition-all duration-300 ${
            i < visibleCount ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        />
    ))}
  </div>
);
};

interface SkeletonMapProps {
  className?: string;
  loadingStage?: 'initial' | 'webgl' | 'data' | 'complete';
}

export const SkeletonMap: React.FC<SkeletonMapProps> = ({ 
  className = '', 
  loadingStage = 'initial' 
}) => {
  const [currentStage, setCurrentStage] = useState(loadingStage);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setCurrentStage(loadingStage);
    
    if (loadingStage === 'initial') {
      setProgress(0);
    } else if (loadingStage === 'webgl') {
      setProgress(30);
      const timer = setTimeout(() => setProgress(60), 500);
      return () => clearTimeout(timer);
    } else if (loadingStage === 'data') {
      setProgress(80);
      const timer = setTimeout(() => setProgress(100), 300);
      return () => clearTimeout(timer);
    } else {
      setProgress(100);
    }
  }, [loadingStage]);

  const getLoadingText = () => {
    switch (currentStage) {
      case 'initial': return 'Initializing...';
      case 'webgl': return 'Loading WebGL...';
      case 'data': return 'Loading data...';
      default: return 'Loading 3D Map...';
    }
  };

  if (currentStage === 'complete') {
    return null;
  }

  return (
  <div className={`bg-white/70 backdrop-blur-sm rounded-xl border border-gray-200/50 shadow-sm overflow-hidden ${className}`}>
    <div className="p-6 border-b border-gray-200/50">
      <div className="animate-pulse">
        <div className="h-6 bg-gray-200 rounded mb-2 w-48"></div>
        <div className="h-4 bg-gray-200 rounded w-32"></div>
      </div>
    </div>
    <div className="p-6">
      <div className="animate-pulse">
          <div className="h-64 bg-gray-200 rounded-lg mb-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-blue-500 bg-opacity-10 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-blue-800 font-medium">{getLoadingText()}</p>
                <div className="mt-2 w-48 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <p className="text-blue-600 text-sm mt-1">{progress}%</p>
              </div>
            </div>
          </div>
        <div className="flex space-x-4">
          <div className="h-4 bg-gray-200 rounded w-20"></div>
          <div className="h-4 bg-gray-200 rounded w-24"></div>
          <div className="h-4 bg-gray-200 rounded w-16"></div>
        </div>
      </div>
    </div>
  </div>
);
};

interface SkeletonChartProps {
  className?: string;
  loadingStage?: 'initial' | 'data' | 'rendering' | 'complete';
}

export const SkeletonChart: React.FC<SkeletonChartProps> = ({ 
  className = '', 
  loadingStage = 'initial' 
}) => {
  const [currentStage, setCurrentStage] = useState(loadingStage);
  const [dataPoints, setDataPoints] = useState(0);

  useEffect(() => {
    setCurrentStage(loadingStage);
    
    if (loadingStage === 'initial') {
      setDataPoints(0);
    } else if (loadingStage === 'data') {
      setDataPoints(5);
      const timer = setTimeout(() => setDataPoints(15), 300);
      return () => clearTimeout(timer);
    } else if (loadingStage === 'rendering') {
      setDataPoints(30);
    } else {
      setDataPoints(30);
    }
  }, [loadingStage]);

  const getLoadingText = () => {
    switch (currentStage) {
      case 'initial': return 'Preparing chart...';
      case 'data': return 'Loading data points...';
      case 'rendering': return 'Rendering chart...';
      default: return 'Loading chart...';
    }
  };

  if (currentStage === 'complete') {
    return null;
  }

  return (
  <div className={`bg-white/70 backdrop-blur-sm rounded-xl border border-gray-200/50 shadow-sm overflow-hidden ${className}`}>
    <div className="p-6 border-b border-gray-200/50">
      <div className="animate-pulse">
        <div className="h-6 bg-gray-200 rounded mb-2 w-40"></div>
        <div className="h-4 bg-gray-200 rounded w-28"></div>
      </div>
    </div>
    <div className="p-6">
      <div className="animate-pulse">
          <div className="h-64 bg-gray-200 rounded-lg mb-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto mb-3"></div>
                <p className="text-blue-800 font-medium text-sm">{getLoadingText()}</p>
                <p className="text-blue-600 text-xs mt-1">{dataPoints} data points loaded</p>
                <div className="flex items-end justify-center space-x-1 mt-4 h-16">
                  {Array.from({ length: Math.min(dataPoints, 10) }).map((_, i) => (
                    <div
                      key={i}
                      className="bg-blue-500 rounded-t transition-all duration-300"
                      style={{
                        width: '4px',
                        height: `${Math.random() * 40 + 10}px`,
                        animationDelay: `${i * 50}ms`
                      }}
                    ></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        <div className="flex justify-between">
          <div className="h-4 bg-gray-200 rounded w-16"></div>
          <div className="h-4 bg-gray-200 rounded w-20"></div>
          <div className="h-4 bg-gray-200 rounded w-14"></div>
        </div>
      </div>
    </div>
  </div>
);
};

interface SkeletonHeaderProps {
  className?: string;
  loadingStage?: 'initial' | 'content' | 'complete';
}

export const SkeletonHeader: React.FC<SkeletonHeaderProps> = ({ 
  className = '', 
  loadingStage = 'initial' 
}) => {
  const [currentStage, setCurrentStage] = useState(loadingStage);
  const [visibleElements, setVisibleElements] = useState(0);

  useEffect(() => {
    setCurrentStage(loadingStage);
    
    if (loadingStage === 'initial') {
      setVisibleElements(1);
    } else if (loadingStage === 'content') {
      const timer = setTimeout(() => setVisibleElements(3), 200);
      const timer2 = setTimeout(() => setVisibleElements(5), 400);
      return () => {
        clearTimeout(timer);
        clearTimeout(timer2);
      };
    } else {
      setVisibleElements(5);
    }
  }, [loadingStage]);

  if (currentStage === 'complete') {
    return null;
  }

  return (
  <div className={`bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-50 ${className}`}>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between h-16">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
            <div className={`h-6 bg-gray-200 rounded w-48 animate-pulse transition-opacity duration-300 ${
              visibleElements >= 1 ? 'opacity-100' : 'opacity-0'
            }`}></div>
        </div>
        <div className="flex items-center space-x-4">
            <div className={`flex items-center space-x-2 transition-opacity duration-300 ${
              visibleElements >= 2 ? 'opacity-100' : 'opacity-0'
            }`}>
            <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
            <div className="h-6 bg-gray-200 rounded-full w-24 animate-pulse"></div>
          </div>
            <div className={`flex items-center space-x-2 transition-opacity duration-300 ${
              visibleElements >= 3 ? 'opacity-100' : 'opacity-0'
            }`}>
            <div className="w-2 h-2 bg-gray-200 rounded-full animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
          </div>
            <div className={`flex items-center space-x-4 transition-opacity duration-300 ${
              visibleElements >= 4 ? 'opacity-100' : 'opacity-0'
            }`}>
            {Array.from({ length: 4 }).map((_, i) => (
                <div 
                  key={i} 
                  className="h-3 bg-gray-200 rounded w-12 animate-pulse"
                  style={{ animationDelay: `${i * 100}ms` }}
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface PerformanceMonitorProps {
  className?: string;
}

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({ className = '' }) => {
  const [fps, setFps] = useState(60);
  const [memoryUsage, setMemoryUsage] = useState(0);
  const [renderTime, setRenderTime] = useState(0);

  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    
    const measurePerformance = () => {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime - lastTime >= 1000) {
        setFps(Math.round((frameCount * 1000) / (currentTime - lastTime)));
        frameCount = 0;
        lastTime = currentTime;
      }
   
      const renderStart = performance.now();
      requestAnimationFrame(() => {
        const renderEnd = performance.now();
        setRenderTime(Math.round(renderEnd - renderStart));
      });
      
      requestAnimationFrame(measurePerformance);
    };
    
    requestAnimationFrame(measurePerformance);
  }, []);

  return (
    <div className={`fixed bottom-4 left-4 z-50 bg-black bg-opacity-75 text-white text-xs p-2 rounded ${className}`}>
      <div>FPS: {fps}</div>
      <div>Render: {renderTime}ms</div>
      <div>Memory: {memoryUsage}MB</div>
  </div>
);
};

export default SkeletonCard; 