import { Request, Response, NextFunction } from 'express';

interface CacheEntry {
  data: any;
  expiry: number;
}

// In-memory cache store
// For production, consider Redis for distributed caching
const cache = new Map<string, CacheEntry>();

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of cache.entries()) {
    if (entry.expiry < now) {
      cache.delete(key);
    }
  }
}, 5 * 60 * 1000);

/**
 * Caching middleware for GET requests
 * @param durationSeconds Cache duration in seconds
 */
export const cacheMiddleware = (durationSeconds: number = 300) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    const key = `cache:${req.originalUrl}`;
    const cached = cache.get(key);

    if (cached && cached.expiry > Date.now()) {
      res.setHeader('X-Cache', 'HIT');
      return res.json(cached.data);
    }

    // Store original json method
    const originalJson = res.json.bind(res);

    // Override json method to cache the response
    res.json = (data: any) => {
      cache.set(key, {
        data,
        expiry: Date.now() + (durationSeconds * 1000),
      });
      res.setHeader('X-Cache', 'MISS');
      return originalJson(data);
    };

    next();
  };
};

/**
 * Invalidate cache for a specific pattern
 * @param pattern URL pattern to invalidate (partial match)
 */
export const invalidateCache = (pattern: string) => {
  for (const key of cache.keys()) {
    if (key.includes(pattern)) {
      cache.delete(key);
    }
  }
};

/**
 * Clear all cache entries
 */
export const clearCache = () => {
  cache.clear();
};

// Pre-configured cache durations
export const shortCache = cacheMiddleware(60);      // 1 minute
export const mediumCache = cacheMiddleware(300);    // 5 minutes
export const longCache = cacheMiddleware(900);      // 15 minutes
