import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction): void => {
  console.error('Error:', err);

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: err.message,
    });
    return;
  }

  // Prisma errors
  if (err.name === 'PrismaClientKnownRequestError') {
    const prismaError = err as any;
    if (prismaError.code === 'P2002') {
      res.status(409).json({ error: 'A record with this value already exists' });
      return;
    }
    if (prismaError.code === 'P2025') {
      res.status(404).json({ error: 'Record not found' });
      return;
    }
  }

  // AI service errors — always pass the message through with correct status
  const msg = err.message || '';
  if (msg.includes('AI_RATE_LIMIT')) {
    res.status(429).json({ error: msg });
    return;
  }
  if (msg.includes('AI_CONFIG_ERROR')) {
    res.status(503).json({ error: msg });
    return;
  }
  if (msg.includes('AI_SAFETY_BLOCK')) {
    res.status(451).json({ error: msg });
    return;
  }

  // Default error — show message in dev, generic in production
  res.status(500).json({
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
  });
};
