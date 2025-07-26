import React from 'react';
import { cloudflareApiService } from '../lib/api/cloudflare-service';

interface CacheStatusProps {
  cacheEnabled: boolean;
  lastUpdated?: string | null;
}

export default function CacheStatus({ cacheEnabled, lastUpdated }: CacheStatusProps) {
  const [cacheStats, setCacheStats] = React.useState({ size: 0, hitRate: 0 });
  const [dataAge, setDataAge] = React.useState<number>(0);

  React.useEffect(() => {
    const updateStats = () => {
      const stats = cloudflareApiService.getCacheStats();
      setCacheStats(stats);
      
      // Calculate data age
      if (lastUpdated) {
        const lastUpdate = new Date(lastUpdated).getTime();
        const now = Date.now();
        setDataAge(now - lastUpdate);
      }
    };

    // Update stats every 2 seconds
    const interval = setInterval(updateStats, 2000);
    updateStats(); // Initial update

    return () => clearInterval(interval);
  }, [cacheEnabled, lastUpdated]);

  if (!cacheEnabled) {
    return (
      <div className="flex items-center space-x-2 text-sm">
        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
        <span className="text-gray-600 dark:text-gray-400">Cache: Disabled</span>
      </div>
    );
  }

  const isRecent = dataAge < 30000; // Less than 30 seconds
  const ageText = dataAge < 60000 ? `${Math.round(dataAge / 1000)}s` : `${Math.round(dataAge / 60000)}m`;

  return (
    <div className="flex items-center space-x-2 text-sm">
      <div className={`w-2 h-2 rounded-full ${isRecent ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
      <span className="text-gray-600 dark:text-gray-400">
        Cache: {cacheStats.size} items ({cacheStats.hitRate.toFixed(1)}% hit, {ageText} old)
      </span>
    </div>
  );
} 