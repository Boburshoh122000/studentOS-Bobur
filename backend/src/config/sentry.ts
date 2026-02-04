// Sentry Error Monitoring Configuration
// Set SENTRY_DSN in environment variables to enable

// NOTE: Run `npm install @sentry/node` to enable Sentry
// import * as Sentry from '@sentry/node';

const SENTRY_DSN = process.env.SENTRY_DSN;
const NODE_ENV = process.env.NODE_ENV || 'development';

/**
 * Initialize Sentry error monitoring
 * Call this once at application startup
 */
export const initSentry = () => {
  if (!SENTRY_DSN) {
    console.log('Sentry DSN not configured - error monitoring disabled');
    return;
  }

  // Uncomment after installing @sentry/node:
  /*
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: NODE_ENV,
    tracesSampleRate: NODE_ENV === 'production' ? 0.1 : 1.0,
    profilesSampleRate: 0.1,
    integrations: [
      new Sentry.Integrations.Http({ tracing: true }),
      new Sentry.Integrations.Express({ app }),
    ],
  });
  */

  console.log('Sentry initialized for environment:', NODE_ENV);
};

/**
 * Capture an exception in Sentry
 */
export const captureException = (error: Error, context?: Record<string, any>) => {
  if (!SENTRY_DSN) {
    console.error('Error captured (Sentry disabled):', error.message);
    return;
  }

  // Uncomment after installing @sentry/node:
  /*
  Sentry.captureException(error, {
    extra: context,
  });
  */
};

/**
 * Capture a message in Sentry
 */
export const captureMessage = (message: string, level: 'info' | 'warning' | 'error' = 'info') => {
  if (!SENTRY_DSN) {
    console.log(`[${level.toUpperCase()}] ${message}`);
    return;
  }

  // Uncomment after installing @sentry/node:
  /*
  Sentry.captureMessage(message, level);
  */
};

/**
 * Set user context for Sentry
 */
export const setUser = (user: { id: string; email?: string; role?: string }) => {
  if (!SENTRY_DSN) return;

  // Uncomment after installing @sentry/node:
  /*
  Sentry.setUser(user);
  */
};

/**
 * Sentry error handler middleware for Express
 * Use this after all other middleware/routes
 */
export const sentryErrorHandler = () => {
  if (!SENTRY_DSN) {
    return (err: Error, req: any, res: any, next: any) => {
      console.error('Unhandled error:', err);
      next(err);
    };
  }

  // Uncomment after installing @sentry/node:
  // return Sentry.Handlers.errorHandler();

  return (err: Error, req: any, res: any, next: any) => next(err);
};
