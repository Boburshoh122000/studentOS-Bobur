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
import financeRoutes from './routes/finance.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import creditsRoutes from './routes/credits.routes.js';
import telegramRoutes from './routes/telegram.routes.js';
import learningPlanRoutes from './routes/learning-plan.routes.js';
import teamRoutes from './routes/team.routes.js';

const app = express();

// Trust proxy (required for Railway/Render/Heroku - behind a proxy)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests, please try again later.' },
});
app.use('/api/', limiter);

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
app.use('/api/finance', financeRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/credits', creditsRoutes);
app.use('/api/telegram', telegramRoutes);
app.use('/api/learning-plans', learningPlanRoutes);
app.use('/api/team', teamRoutes);

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
});

export default app;
