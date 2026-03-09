import { Router, Response, Request } from 'express';
import { z } from 'zod';
import jwt from 'jsonwebtoken';
import prisma from '../config/database.js';
import { validate } from '../middleware/validate.middleware.js';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.middleware.js';
import {
  hashPassword,
  comparePasswords,
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  revokeRefreshToken,
  revokeAllUserTokens,
} from '../services/auth.service.js';
import { AppError } from '../middleware/error.middleware.js';
import {
  loginRateLimiter,
  recordFailedAttempt,
  resetLoginAttempts,
} from '../services/rate-limiter.js';
import { sendEmail, emailTemplates } from '../services/email.service.js';
import { env } from '../config/env.js';

const router = Router();

// Cookie options for secure token storage
const isProduction = process.env.NODE_ENV === 'production';
const cookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? ('strict' as const) : ('lax' as const),
  path: '/',
};

// Helper to set auth cookies
const setAuthCookies = (res: Response, accessToken: string, refreshToken: string) => {
  res.cookie('accessToken', accessToken, {
    ...cookieOptions,
    maxAge: 15 * 60 * 1000, // 15 minutes
  });
  res.cookie('refreshToken', refreshToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

// Helper to clear auth cookies
const clearAuthCookies = (res: Response) => {
  res.clearCookie('accessToken', cookieOptions);
  res.clearCookie('refreshToken', cookieOptions);
};

// Validation schemas
const registerSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email'),
    password: z
      .string()
      .min(10, 'Password must be at least 10 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
    fullName: z.string().min(2, 'Name must be at least 2 characters'),
    otpCode: z.string().length(6).optional(),
  }),
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email'),
    password: z.string().min(1, 'Password is required'),
  }),
});

const onboardingSchema = z.object({
  body: z.object({
    role: z.enum(['student', 'educator', 'organization']),
    // Student fields
    university: z.string().optional(),
    universityId: z.number().int().positive().optional(),
    major: z.string().optional(),
    // Educator fields
    institution: z.string().optional(),
    institutionId: z.number().int().positive().optional(),
    department: z.string().optional(),
    // Organization fields
    companyName: z.string().optional(),
    industry: z.string().optional(),
    website: z.string().optional(),
  }),
});

// ─── OTP In-Memory Store ───────────────────────────────────────
// key: email → { code, expiresAt }
const otpStore = new Map<string, { code: string; expiresAt: number }>();
const OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes
const OTP_LENGTH = 6;

function generateOTP(): string {
  return Array.from({ length: OTP_LENGTH }, () => Math.floor(Math.random() * 10)).join('');
}

// Send OTP
const sendOtpSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email'),
  }),
});

router.post('/send-otp', validate(sendOtpSchema), async (req, res, next) => {
  try {
    const { email } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(409).json({ error: 'An account with this email already exists' });
      return;
    }

    // Rate-limit: if an OTP was sent < 60s ago, reject
    const existing = otpStore.get(email);
    if (existing && existing.expiresAt - OTP_EXPIRY_MS + 60_000 > Date.now()) {
      res.status(429).json({ error: 'Please wait before requesting another code' });
      return;
    }

    const code = generateOTP();
    otpStore.set(email, { code, expiresAt: Date.now() + OTP_EXPIRY_MS });

    // Send via email
    await sendEmail({
      to: email,
      subject: `${code} — Your StudentOS Verification Code`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; text-align: center;">
          <h1 style="color: #2D4DE0; font-size: 24px;">Verify your email</h1>
          <p style="color: #555; font-size: 16px;">Enter this code to complete your sign-up:</p>
          <div style="background: #f5f5f5; border-radius: 12px; padding: 24px; margin: 24px 0;">
            <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #1e293b;">${code}</span>
          </div>
          <p style="color: #999; font-size: 13px;">This code expires in 10 minutes.</p>
        </div>
      `,
      text: `Your StudentOS verification code is: ${code}`,
    });

    res.json({ message: 'Verification code sent' });
  } catch (error) {
    next(error);
  }
});

// Verify OTP (standalone check — no account creation)
const verifyOtpSchema = z.object({
  body: z.object({
    email: z.string().email(),
    code: z.string().length(OTP_LENGTH),
  }),
});

router.post('/verify-otp', validate(verifyOtpSchema), async (req, res, next) => {
  try {
    const { email, code } = req.body;
    const entry = otpStore.get(email);

    if (!entry || entry.code !== code) {
      res.status(400).json({ error: 'Invalid verification code' });
      return;
    }

    if (Date.now() > entry.expiresAt) {
      otpStore.delete(email);
      res.status(400).json({ error: 'Code has expired. Please request a new one.' });
      return;
    }

    // Don't delete yet — register route will also verify and delete
    res.json({ verified: true });
  } catch (error) {
    next(error);
  }
});

// Register (now requires OTP)
router.post('/register', validate(registerSchema), async (req, res, next) => {
  try {
    const { email, password, fullName, otpCode } = req.body;

    // Verify OTP if provided
    if (otpCode) {
      const entry = otpStore.get(email);
      if (!entry || entry.code !== otpCode || Date.now() > entry.expiresAt) {
        res.status(400).json({ error: 'Invalid or expired verification code' });
        return;
      }
      otpStore.delete(email); // OTP used — clean up
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new AppError(409, 'User already exists');
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user with student profile
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role: 'STUDENT',
        emailVerified: !!otpCode, // Verified if OTP was provided and passed
        creditBalance: 10, // Welcome bonus
        studentProfile: {
          create: {
            fullName,
          },
        },
      },
      include: {
        studentProfile: true,
      },
    });

    // Generate tokens
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });
    const refreshToken = await generateRefreshToken(user.id);

    // Send welcome email (fire-and-forget, don't block the response)
    const welcomeTemplate = emailTemplates.welcomeEmail(fullName);
    sendEmail({ to: email, ...welcomeTemplate }).catch((err) =>
      console.error('Failed to send welcome email:', err)
    );

    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        profile: user.studentProfile,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    next(error);
  }
});

// Helper to extract client IP from request
function getClientIP(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') return forwarded.split(',')[0].trim();
  return req.ip || req.socket.remoteAddress || 'unknown';
}

// Login - with brute force protection
router.post('/login', loginRateLimiter, validate(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const ip = getClientIP(req);

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        studentProfile: true,
        employerProfile: true,
      },
    });

    // Credentials invalid (user not found or no password)
    if (!user || !user.passwordHash) {
      const remaining = await recordFailedAttempt(ip, email);
      if (remaining <= 0) {
        res.status(429).json({
          error: 'Too many failed login attempts. Please try again in 30 minutes.',
          blocked: true,
          retryAfterMinutes: 30,
        });
      } else {
        res.status(401).json({
          error: 'Invalid credentials',
          remaining_attempts: remaining,
        });
      }
      return;
    }

    // Check if user is active
    if (!user.isActive) {
      throw new AppError(403, 'Your account has been deactivated. Please contact support.');
    }

    // Verify password
    const isValid = await comparePasswords(password, user.passwordHash);
    if (!isValid) {
      const remaining = await recordFailedAttempt(ip, email);
      if (remaining <= 0) {
        res.status(429).json({
          error: 'Too many failed login attempts. Please try again in 30 minutes.',
          blocked: true,
          retryAfterMinutes: 30,
        });
      } else {
        res.status(401).json({
          error: 'Invalid credentials',
          remaining_attempts: remaining,
        });
      }
      return;
    }

    // Success — reset failed attempts counter
    await resetLoginAttempts(ip, email);

    // Block unverified users — resend a fresh OTP automatically
    if (!user.emailVerified) {
      const code = generateOTP();
      otpStore.set(email, { code, expiresAt: Date.now() + OTP_EXPIRY_MS });
      sendEmail({
        to: email,
        subject: `${code} — Your StudentOS Verification Code`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; text-align: center;">
            <h1 style="color: #2D4DE0; font-size: 24px;">Verify your email</h1>
            <p style="color: #555; font-size: 16px;">Enter this code to complete your sign-up:</p>
            <div style="background: #f5f5f5; border-radius: 12px; padding: 24px; margin: 24px 0;">
              <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #1e293b;">${code}</span>
            </div>
            <p style="color: #999; font-size: 13px;">This code expires in 10 minutes.</p>
          </div>
        `,
        text: `Your StudentOS verification code is: ${code}`,
      }).catch((err) => console.error('Failed to resend verification email:', err));

      res.status(403).json({
        error: 'email_not_verified',
        message: 'Email not verified. A new code has been sent to your email.',
        email: user.email,
      });
      return;
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Generate tokens
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });
    const refreshToken = await generateRefreshToken(user.id);

    // Set httpOnly cookies for secure token storage
    setAuthCookies(res, accessToken, refreshToken);

    // Also return tokens in response for backward compatibility
    res.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        profile: user.studentProfile || user.employerProfile,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    next(error);
  }
});

// Refresh token
router.post('/refresh', async (req, res, next) => {
  try {
    // Try body first, then cookie
    const refreshToken = req.body.refreshToken || req.cookies?.refreshToken;

    if (!refreshToken) {
      throw new AppError(400, 'Refresh token required');
    }

    const userId = await verifyRefreshToken(refreshToken);
    if (!userId) {
      throw new AppError(401, 'Invalid or expired refresh token');
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError(401, 'User not found');
    }

    // Revoke old token
    await revokeRefreshToken(refreshToken);

    // Generate new tokens
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });
    const newRefreshToken = await generateRefreshToken(user.id);

    // Set httpOnly cookies
    setAuthCookies(res, accessToken, newRefreshToken);

    res.json({
      accessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    next(error);
  }
});

// Logout
router.post('/logout', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    // Try body first, then cookie
    const refreshToken = req.body.refreshToken || req.cookies?.refreshToken;

    if (refreshToken) {
      await revokeRefreshToken(refreshToken);
    }

    // Clear httpOnly cookies
    clearAuthCookies(res);

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
});

// Logout all devices
router.post('/logout-all', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    await revokeAllUserTokens(req.user!.id);
    res.json({ message: 'Logged out from all devices' });
  } catch (error) {
    next(error);
  }
});

// Get current user
router.get('/me', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: {
        studentProfile: true,
        employerProfile: true,
      },
    });

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    res.json({
      id: user.id,
      email: user.email,
      role: user.role,
      profile: user.studentProfile || user.employerProfile,
    });
  } catch (error) {
    next(error);
  }
});

// Complete onboarding (Step 2) - Role Selection & Profile Setup
router.post(
  '/onboarding',
  authenticate,
  validate(onboardingSchema),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const {
        role,
        university,
        universityId,
        major,
        institution,
        institutionId,
        department,
        companyName,
        industry,
        website,
      } = req.body;
      const userId = req.user!.id;

      let userRole: string;
      let redirectTo: string;

      if (role === 'student') {
        userRole = 'STUDENT';
        redirectTo = '/app';
        await prisma.studentProfile.update({
          where: { userId },
          data: {
            university: university || null,
            universityId: universityId || null,
            major: major || null,
          },
        });
      } else if (role === 'educator') {
        userRole = 'EDUCATOR';
        redirectTo = '/app';
        await prisma.studentProfile.update({
          where: { userId },
          data: {
            university: institution || null,
            universityId: institutionId || null,
            major: department || null,
          },
        });
      } else {
        // Organization -> create employer profile (pending verification)
        userRole = 'EMPLOYER';
        redirectTo = '/verification-pending';

        if (!companyName) {
          res.status(400).json({ error: 'Company name is required for organizations' });
          return;
        }

        // Check if employer profile already exists
        const existing = await prisma.employerProfile.findUnique({ where: { userId } });
        if (!existing) {
          await prisma.employerProfile.create({
            data: {
              userId,
              companyName,
              industry: industry || null,
              website: website || null,
              verificationStatus: 'pending',
            },
          });
        }
      }

      // Update user role
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { role: userRole as any },
        include: { studentProfile: true, employerProfile: true },
      });

      // Generate new tokens with updated role
      const accessToken = generateAccessToken({
        userId: updatedUser.id,
        email: updatedUser.email,
        role: updatedUser.role,
      });
      const refreshToken = await generateRefreshToken(updatedUser.id);
      setAuthCookies(res, accessToken, refreshToken);

      res.json({
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          role: updatedUser.role,
          profile: updatedUser.studentProfile || updatedUser.employerProfile,
        },
        accessToken,
        refreshToken,
        redirectTo,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Change password schema
const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(10, 'Password must be at least 10 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  }),
});

// Change password
router.post(
  '/change-password',
  authenticate,
  validate(changePasswordSchema),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const { currentPassword, newPassword } = req.body;

      // Get user with password
      const user = await prisma.user.findUnique({
        where: { id: req.user!.id },
      });

      if (!user || !user.passwordHash) {
        throw new AppError(404, 'User not found');
      }

      // Verify current password
      const isValid = await comparePasswords(currentPassword, user.passwordHash);
      if (!isValid) {
        throw new AppError(401, 'Current password is incorrect');
      }

      // Hash new password
      const newPasswordHash = await hashPassword(newPassword);

      // Update password
      await prisma.user.update({
        where: { id: req.user!.id },
        data: { passwordHash: newPasswordHash },
      });

      // Revoke all refresh tokens for security
      await revokeAllUserTokens(req.user!.id);

      res.json({ message: 'Password updated successfully. Please log in again.' });
    } catch (error) {
      next(error);
    }
  }
);

// Update email schema
const updateEmailSchema = z.object({
  body: z.object({
    newEmail: z.string().email('Invalid email'),
    password: z.string().min(1, 'Password is required to confirm email change'),
  }),
});

// Update email
router.post(
  '/update-email',
  authenticate,
  validate(updateEmailSchema),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const { newEmail, password } = req.body;

      // Get user with password
      const user = await prisma.user.findUnique({
        where: { id: req.user!.id },
      });

      if (!user || !user.passwordHash) {
        throw new AppError(404, 'User not found');
      }

      // Verify password
      const isValid = await comparePasswords(password, user.passwordHash);
      if (!isValid) {
        throw new AppError(401, 'Password is incorrect');
      }

      // Check if email already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: newEmail },
      });

      if (existingUser) {
        throw new AppError(409, 'Email is already in use');
      }

      // Update email
      await prisma.user.update({
        where: { id: req.user!.id },
        data: { email: newEmail },
      });

      res.json({ message: 'Email updated successfully' });
    } catch (error) {
      next(error);
    }
  }
);

// Google OAuth Callback schema
const googleCallbackSchema = z.object({
  body: z.object({
    supabaseAccessToken: z.string().min(1, 'Supabase access token is required'),
    email: z.string().email('Invalid email'),
    fullName: z.string().optional(),
    avatarUrl: z.string().optional(),
    providerId: z.string().optional(),
  }),
});

// Google OAuth Callback - Exchange Supabase OAuth for our JWT tokens
router.post('/google-callback', validate(googleCallbackSchema), async (req, res, next) => {
  try {
    const { email, fullName, avatarUrl, providerId } = req.body;

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { email },
      include: {
        studentProfile: true,
        employerProfile: true,
      },
    });

    let isNewUser = false;

    if (!user) {
      // Create new user (OAuth users don't have a password)
      isNewUser = true;
      user = await prisma.user.create({
        data: {
          email,
          role: 'STUDENT',
          emailVerified: true, // OAuth emails are already verified
          creditBalance: 10, // Welcome bonus
          studentProfile: {
            create: {
              fullName: fullName || email.split('@')[0],
              avatarUrl: avatarUrl || null,
            },
          },
        },
        include: {
          studentProfile: true,
          employerProfile: true,
        },
      });

      // Send welcome email for new OAuth users (fire-and-forget)
      const welcomeTemplate = emailTemplates.welcomeEmail(fullName || email.split('@')[0]);
      sendEmail({ to: email, ...welcomeTemplate }).catch((err) =>
        console.error('Failed to send welcome email:', err)
      );
    } else {
      // Update existing user's last login and potentially avatar
      await prisma.user.update({
        where: { id: user.id },
        data: {
          lastLoginAt: new Date(),
          emailVerified: true,
        },
      });

      // Update avatar if provided and user has a student profile
      if (avatarUrl && user.studentProfile && !user.studentProfile.avatarUrl) {
        await prisma.studentProfile.update({
          where: { userId: user.id },
          data: { avatarUrl },
        });
        user.studentProfile.avatarUrl = avatarUrl;
      }
    }

    // Check if user is active
    if (!user.isActive) {
      throw new AppError(403, 'Your account has been deactivated. Please contact support.');
    }

    // Generate tokens
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });
    const refreshToken = await generateRefreshToken(user.id);

    // Set httpOnly cookies
    setAuthCookies(res, accessToken, refreshToken);

    res.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        profile: user.studentProfile || user.employerProfile,
      },
      accessToken,
      refreshToken,
      isNewUser,
    });
  } catch (error) {
    next(error);
  }
});

// Delete account (soft-delete: deactivate + revoke tokens)
router.delete('/account', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.id;

    // Soft-delete: deactivate the account
    await prisma.user.update({
      where: { id: userId },
      data: { isActive: false },
    });

    // Revoke all refresh tokens
    await revokeAllUserTokens(userId);

    // Clear auth cookies
    clearAuthCookies(res);

    res.json({ message: 'Account deleted successfully.' });
  } catch (error) {
    next(error);
  }
});

// ─── Forgot Password ───────────────────────────────────────────
router.post('/forgot-password', async (req: Request, res: Response, next) => {
  try {
    const { email } = req.body;
    if (!email || typeof email !== 'string') {
      res.status(400).json({ error: 'Email is required' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      select: { id: true, email: true, passwordHash: true },
    });

    // Always return same message to prevent email enumeration
    const genericMsg = 'If this email is registered, you will receive a reset link shortly.';

    if (!user || !user.passwordHash) {
      res.json({ message: genericMsg });
      return;
    }

    // Sign token with JWT_SECRET + current passwordHash — auto-invalidates after password change
    const secret = env.JWT_SECRET + user.passwordHash;
    const token = jwt.sign({ sub: user.id, email: user.email, purpose: 'password_reset' }, secret, {
      expiresIn: '1h',
    });

    const resetLink = `${env.FRONTEND_URL}/reset-password?token=${token}`;
    sendEmail({ to: user.email, ...emailTemplates.passwordReset(resetLink) }).catch((err) =>
      console.error('[forgot-password] Email send failed:', err)
    );

    res.json({ message: genericMsg });
  } catch (error) {
    next(error);
  }
});

// ─── Reset Password ─────────────────────────────────────────────
const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(1),
    password: z
      .string()
      .min(10, 'Password must be at least 10 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  }),
});

router.post(
  '/reset-password',
  validate(resetPasswordSchema),
  async (req: Request, res: Response, next) => {
    try {
      const { token, password } = req.body;

      // Decode without verification first to extract userId
      let payload: any;
      try {
        payload = jwt.decode(token);
      } catch {
        res.status(400).json({ error: 'Invalid or expired reset link.' });
        return;
      }

      if (!payload?.sub || payload.purpose !== 'password_reset') {
        res.status(400).json({ error: 'Invalid or expired reset link.' });
        return;
      }

      const user = await prisma.user.findUnique({
        where: { id: payload.sub },
        select: { id: true, passwordHash: true },
      });

      if (!user || !user.passwordHash) {
        res.status(400).json({ error: 'Invalid or expired reset link.' });
        return;
      }

      // Verify with user-specific secret — fails if already used or expired
      const secret = env.JWT_SECRET + user.passwordHash;
      try {
        jwt.verify(token, secret);
      } catch {
        res.status(400).json({ error: 'Invalid or expired reset link. Please request a new one.' });
        return;
      }

      const newHash = await hashPassword(password);
      await prisma.user.update({ where: { id: user.id }, data: { passwordHash: newHash } });

      // Revoke all sessions so existing tokens are invalidated
      await revokeAllUserTokens(user.id);

      res.json({ message: 'Password reset successfully. Please sign in with your new password.' });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
