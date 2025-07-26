interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  keyGenerator?: (request: unknown) => string;
}

interface RateLimitState {
  requests: number;
  resetTime: number;
}

class RateLimiter {
  private limits: Map<string, RateLimitState> = new Map();
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
  }

  isAllowed(key: string = 'default'): boolean {
    const now = Date.now();
    const state = this.limits.get(key);

    if (!state || now > state.resetTime) {
      // Reset or create new state
      this.limits.set(key, {
        requests: 1,
        resetTime: now + this.config.windowMs,
      });
      return true;
    }

    if (state.requests >= this.config.maxRequests) {
      return false;
    }

    state.requests++;
    return true;
  }

  getRemaining(key: string = 'default'): number {
    const state = this.limits.get(key);
    if (!state) return this.config.maxRequests;
    return Math.max(0, this.config.maxRequests - state.requests);
  }

  getResetTime(key: string = 'default'): number {
    const state = this.limits.get(key);
    return state?.resetTime || Date.now();
  }
}

// Cache utility for API responses
class APICache {
  private cache: Map<string, { data: unknown; timestamp: number; ttl: number }> = new Map();

  set(key: string, data: unknown, ttl: number = 30000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  get(key: string): unknown | null {
    const item = this.cache.get(key);
    if (!item) return null;

    const now = Date.now();
    if (now - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

// Export instances
export const rateLimiter = new RateLimiter({
  maxRequests: 100,
  windowMs: 60000, // 1 minute
});

export const apiCache = new APICache();

// Utility function to check rate limit and cache
export const withRateLimitAndCache = async <T>(
  key: string,
  fn: () => Promise<T>,
  ttl: number = 30000
): Promise<T> => {
  // Check rate limit
  if (!rateLimiter.isAllowed(key)) {
    throw new Error(`Rate limit exceeded for ${key}. Try again later.`);
  }

  // Check cache first
  const cached = apiCache.get(key);
  if (cached) {
    console.log(`📦 Cache hit for ${key}`);
    return cached as T;
  }

  // Execute function and cache result
  console.log(`🚀 Executing ${key}`);
  const result = await fn();
  apiCache.set(key, result, ttl);
  
  return result;
}; 