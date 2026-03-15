import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { env } from './config/env.js';
import { errorHandler } from './middleware/error.middleware.js';

// Routes
import employerRoutes from './routes/employer.routes.js';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import scholarshipRoutes from './routes/scholarship.routes.js';
import jobRoutes from './routes/job.routes.js';
import applicationRoutes from './routes/application.routes.js';
import habitRoutes from './routes/habit.routes.js';
import blogRoutes from './routes/blog.routes.js';
import communityRoutes from './routes/community.routes.js';
import adminRoutes from './routes/admin.routes.js';
import rolesRoutes from './routes/roles.routes.js';
import toolsRoutes from './routes/tools.routes.js';
import aiRoutes from './routes/ai.routes.js';
import aiGeneratorRoutes from './routes/ai-generator.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import creditsRoutes from './routes/credits.routes.js';
import telegramRoutes from './routes/telegram.routes.js';
import learningPlanRoutes from './routes/learning-plan.routes.js';
import teamRoutes from './routes/team.routes.js';
import universityRoutes from './routes/university.routes.js';
import scholarshipScraperRoutes from './routes/scholarship-scraper.routes.js';
import { startScholarshipCron } from './services/scholarship-cron.js';

const app = express();

// Trust proxy (required for Railway/Render/Heroku - behind a proxy)
app.set('trust proxy', 1);

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          'https://cdn.tailwindcss.com',
          'https://cdn.jsdelivr.net',
        ],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
        connectSrc: [
          "'self'",
          'https://studentos.up.railway.app',
          'https://ahgbbkdhaejzpydhcjgq.supabase.co',
        ],
        frameSrc: ["'none'"],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
      },
    },
    crossOriginEmbedderPolicy: false,
    hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
  })
);
app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 86400,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests, please try again later.' },
});
// Exclude Telegram webhook from rate limiting (Telegram sends server-to-server requests at high frequency)
app.use('/api/', (req, res, next) => {
  if (req.path.startsWith('/telegram/webhook')) return next();
  return limiter(req, res, next);
});

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/scholarships', scholarshipRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/habits', habitRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin', rolesRoutes);
app.use('/api/admin', toolsRoutes);
app.use('/api/employer', employerRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/ai-generator', aiGeneratorRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/credits', creditsRoutes);
app.use('/api/telegram', telegramRoutes);
app.use('/api/learning-plans', learningPlanRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/universities', universityRoutes);
app.use('/api/admin/scholarships', scholarshipScraperRoutes);

// Error handling
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

const PORT = parseInt(env.PORT, 10);
const HOST = '0.0.0.0'; // Required for Railway - must listen on all interfaces

app.listen(PORT, HOST, () => {
  console.log(`🚀 Server running on http://${HOST}:${PORT}`);
  console.log(`📝 Environment: ${env.NODE_ENV}`);

  // Auto-register Telegram webhook when both token and backend URL are set
  if (env.TELEGRAM_BOT_TOKEN && env.BACKEND_URL) {
    const webhookUrl = `${env.BACKEND_URL}/api/telegram/webhook`;
    fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/setWebhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: webhookUrl }),
    })
      .then((r) => r.json())
      .then((data: any) => {
        if (data.ok) {
          console.log(`✅ Telegram webhook registered: ${webhookUrl}`);
        } else {
          console.warn('⚠️  Telegram webhook registration failed:', data.description);
        }
      })
      .catch((err) => console.warn('⚠️  Telegram webhook registration error:', err.message));
  }

  startScholarshipCron();
});

export default app;
