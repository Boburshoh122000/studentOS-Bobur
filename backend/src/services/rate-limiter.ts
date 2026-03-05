import Redis from 'ioredis';
import { RateLimiterRedis, RateLimiterMemory, RateLimiterRes } from 'rate-limiter-flexible';
import { Request, Response, NextFunction } from 'express';

// Redis client - only connect if REDIS_URL is available
let redisClient: Redis | null = null;

if (process.env.REDIS_URL) {
  redisClient = new Redis(process.env.REDIS_URL, {
    enableOfflineQueue: false,
    maxRetriesPerRequest: 1,
  });

  redisClient.on('error', (err) => {
    console.error('Redis connection error:', err.message);
  });

  redisClient.on('connect', () => {
    console.log('✅ Redis connected for rate limiting');
  });
}

const MAX_ATTEMPTS = 3;
const BLOCK_DURATION_SECS = 30 * 60; // 30 minutes

// Login rate limiter configuration: 3 attempts per 30 minutes
const loginLimiterConfig = {
  points: MAX_ATTEMPTS,
  duration: BLOCK_DURATION_SECS,
  blockDuration: BLOCK_DURATION_SECS,
};

// Global API rate limiter configuration
const globalLimiterConfig = {
  points: 100, // 100 requests
  duration: 15 * 60, // per 15 minutes
};

// Create rate limiters with Redis or fallback to memory
let loginLimiter: RateLimiterRedis | RateLimiterMemory;
let emailLoginLimiter: RateLimiterRedis | RateLimiterMemory;
let globalLimiter: RateLimiterRedis | RateLimiterMemory;

if (redisClient) {
  loginLimiter = new RateLimiterRedis({
    storeClient: redisClient,
    keyPrefix: 'login_limit_ip',
    ...loginLimiterConfig,
  });

  emailLoginLimiter = new RateLimiterRedis({
    storeClient: redisClient,
    keyPrefix: 'login_limit_email',
    ...loginLimiterConfig,
  });

  globalLimiter = new RateLimiterRedis({
    storeClient: redisClient,
    keyPrefix: 'global_limit',
    ...globalLimiterConfig,
  });

  console.log('📊 Rate limiting: Using Redis');
} else {
  loginLimiter = new RateLimiterMemory(loginLimiterConfig);
  emailLoginLimiter = new RateLimiterMemory(loginLimiterConfig);
  globalLimiter = new RateLimiterMemory(globalLimiterConfig);
  console.log('📊 Rate limiting: Using in-memory (Redis not configured)');
}

// Helper to get client IP
const getIP = (req: Request): string => {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.ip || req.socket.remoteAddress || 'unknown';
};

// Check if an IP or email is currently blocked (without consuming a point)
const isBlocked = async (
  limiter: RateLimiterRedis | RateLimiterMemory,
  key: string
): Promise<{ blocked: boolean; retryAfterMinutes: number }> => {
  try {
    const res = await limiter.get(key);
    if (res && res.remainingPoints <= 0) {
      const retryAfterMinutes = Math.ceil(res.msBeforeNext / 60000);
      return { blocked: true, retryAfterMinutes };
    }
    return { blocked: false, retryAfterMinutes: 0 };
  } catch {
    return { blocked: false, retryAfterMinutes: 0 };
  }
};

// Login rate limiter middleware — checks block status without consuming
export const loginRateLimiter = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const ip = getIP(req);
  const email = (req.body.email as string | undefined)?.toLowerCase();

  try {
    const ipCheck = await isBlocked(loginLimiter, ip);
    if (ipCheck.blocked) {
      res.status(429).json({
        error: `Too many failed login attempts. Please try again in ${ipCheck.retryAfterMinutes} minute${ipCheck.retryAfterMinutes !== 1 ? 's' : ''}.`,
        blocked: true,
        retryAfterMinutes: ipCheck.retryAfterMinutes,
      });
      return;
    }

    if (email) {
      const emailCheck = await isBlocked(emailLoginLimiter, email);
      if (emailCheck.blocked) {
        res.status(429).json({
          error: `Too many failed login attempts for this account. Please try again in ${emailCheck.retryAfterMinutes} minute${emailCheck.retryAfterMinutes !== 1 ? 's' : ''}.`,
          blocked: true,
          retryAfterMinutes: emailCheck.retryAfterMinutes,
        });
        return;
      }
    }

    next();
  } catch (error) {
    // If rate limiter fails, allow the request (fail open)
    console.error('Rate limiter check error:', error);
    next();
  }
};

// Record a failed login attempt. Returns remaining attempts (0 = now blocked).
export const recordFailedAttempt = async (ip: string, email?: string): Promise<number> => {
  let remaining = MAX_ATTEMPTS - 1;

  try {
    const res = await loginLimiter.consume(ip);
    remaining = res.remainingPoints;
  } catch (error) {
    if (error instanceof RateLimiterRes) {
      remaining = 0;
    }
  }

  if (email) {
    try {
      await emailLoginLimiter.consume(email.toLowerCase());
    } catch {
      // email limiter blocked — IP remaining is what we report
    }
  }

  return remaining;
};

// Reset login attempts after a successful login
export const resetLoginAttempts = async (ip: string, email?: string): Promise<void> => {
  try {
    await loginLimiter.delete(ip);
  } catch (error) {
    console.error('Failed to reset IP login attempts:', error);
  }
  if (email) {
    try {
      await emailLoginLimiter.delete(email.toLowerCase());
    } catch (error) {
      console.error('Failed to reset email login attempts:', error);
    }
  }
};

// Global API rate limiter middleware
export const globalRateLimiter = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const ip = getIP(req);

  try {
    await globalLimiter.consume(ip);
    next();
  } catch (error) {
    if (error instanceof RateLimiterRes) {
      const retryAfter = Math.ceil(error.msBeforeNext / 1000);
      res.set('Retry-After', String(retryAfter));
      res.status(429).json({
        error: 'Too many requests. Please try again later.',
        retryAfter,
      });
    } else {
      // Fail open
      next();
    }
  }
};

export { redisClient };
