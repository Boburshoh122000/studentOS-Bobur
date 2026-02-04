import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.middleware.js';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

// Simple in-memory rate limiter
// For production, consider using Redis or a dedicated rate limiting service
const ipStore: RateLimitStore = {};
const userStore: RateLimitStore = {};

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const key in ipStore) {
    if (ipStore[key].resetTime < now) {
      delete ipStore[key];
    }
  }
  for (const key in userStore) {
    if (userStore[key].resetTime < now) {
      delete userStore[key];
    }
  }
}, 5 * 60 * 1000);

interface RateLimitOptions {
  windowMs: number;        // Time window in milliseconds
  maxRequests: number;     // Max requests per window
  keyGenerator?: (req: Request) => string;
  message?: string;
}

/**
 * Creates a rate limiting middleware
 * @param options Rate limiting configuration
 */
export const rateLimit = (options: RateLimitOptions) => {
  const {
    windowMs = 60 * 1000,  // Default: 1 minute
    maxRequests = 10,       // Default: 10 requests per minute
    keyGenerator = (req: Request) => {
      // Use user ID if authenticated, otherwise IP
      const authReq = req as AuthenticatedRequest;
      if (authReq.user?.id) {
        return `user:${authReq.user.id}`;
      }
      return `ip:${req.ip || req.socket.remoteAddress || 'unknown'}`;
    },
    message = 'Too many requests, please try again later.',
  } = options;

  return (req: Request, res: Response, next: NextFunction) => {
    const key = keyGenerator(req);
    const now = Date.now();
    const store = key.startsWith('user:') ? userStore : ipStore;

    if (!store[key] || store[key].resetTime < now) {
      // Create new window
      store[key] = {
        count: 1,
        resetTime: now + windowMs,
      };
    } else {
      // Increment count in current window
      store[key].count++;
    }

    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - store[key].count));
    res.setHeader('X-RateLimit-Reset', Math.ceil(store[key].resetTime / 1000));

    if (store[key].count > maxRequests) {
      const retryAfter = Math.ceil((store[key].resetTime - now) / 1000);
      res.setHeader('Retry-After', retryAfter);
      res.status(429).json({
        error: message,
        retryAfter,
      });
      return;
    }

    next();
  };
};

/**
 * Pre-configured rate limiter for AI endpoints
 * More restrictive: 10 requests per minute per user
 */
export const aiRateLimit = rateLimit({
  windowMs: 60 * 1000,    // 1 minute
  maxRequests: 10,        // 10 requests per minute
  message: 'AI request limit exceeded. Please wait before making more AI requests.',
});

/**
 * Less restrictive rate limiter for general API endpoints
 * 100 requests per minute per user
 */
export const generalRateLimit = rateLimit({
  windowMs: 60 * 1000,    // 1 minute
  maxRequests: 100,       // 100 requests per minute
  message: 'Request limit exceeded. Please slow down.',
});
