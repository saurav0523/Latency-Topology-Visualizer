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

export const rateLimiter = new RateLimiter({
  maxRequests: 100,
  windowMs: 60000, 
});

export const apiCache = new APICache();

export const withRateLimitAndCache = async <T>(
  key: string,
  fn: () => Promise<T>,
  ttl: number = 30000
): Promise<T> => {
  if (!rateLimiter.isAllowed(key)) {
    throw new Error(`Rate limit exceeded for ${key}. Try again later.`);
  }

  const cached = apiCache.get(key);
  if (cached) {
    console.log(`Cache hit for ${key}`);
    return cached as T;
  }

  console.log(`Executing ${key}`);
  const result = await fn();
  apiCache.set(key, result, ttl);
  
  return result;
}; 