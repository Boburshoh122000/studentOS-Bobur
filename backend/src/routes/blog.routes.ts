import { Router } from 'express';
import prisma from '../config/database.js';
import { authenticate, optionalAuth, AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/role.middleware.js';

const router = Router();

// Get all published posts
router.get('/', optionalAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { tag, page = '1', limit = '10' } = req.query as any;

    const where: any = { status: 'PUBLISHED' };
    if (tag) where.tags = { has: tag };

    const [posts, total] = await Promise.all([
      prisma.blogPost.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              studentProfile: { select: { fullName: true, avatarUrl: true } },
            },
          },
        },
        orderBy: { publishedAt: 'desc' },
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit),
      }),
      prisma.blogPost.count({ where }),
    ]);

    res.json({
      posts: posts.map((p) => ({
        ...p,
        author: {
          id: p.author.id,
          name: p.author.studentProfile?.fullName || 'Admin',
          avatar: p.author.studentProfile?.avatarUrl,
        },
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
});

// Get single post by slug
router.get('/:slug', optionalAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const post = await prisma.blogPost.findUnique({
      where: { slug: req.params.slug as string },
      include: {
        author: {
          select: {
            id: true,
            studentProfile: { select: { fullName: true, avatarUrl: true } },
          },
        },
      },
    });

    if (!post) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    res.json({
      ...post,
      author: {
        id: post.author.id,
        name: post.author.studentProfile?.fullName || 'Admin',
        avatar: post.author.studentProfile?.avatarUrl,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Admin: Get all posts (including drafts)
router.get('/admin/list', authenticate, requireAdmin, async (req: AuthenticatedRequest, res, next) => {
  try {
    const posts = await prisma.blogPost.findMany({
      include: {
        author: {
          select: {
            studentProfile: { select: { fullName: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(posts);
  } catch (error) {
    next(error);
  }
});

// Admin: Create post
router.post('/', authenticate, requireAdmin, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { title, content, excerpt, coverImageUrl, tags, status } = req.body;

    // Generate slug with collision handling
    let slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    
    // Check for existing slug and make unique if needed
    const existing = await prisma.blogPost.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Date.now()}`;
    }

    const post = await prisma.blogPost.create({
      data: {
        title,
        slug,
        content,
        excerpt,
        coverImageUrl,
        tags: tags || [],
        status: status || 'DRAFT',
        authorId: req.user!.id,
        publishedAt: status === 'PUBLISHED' ? new Date() : null,
      },
    });

    res.status(201).json(post);
  } catch (error) {
    next(error);
  }
});

// Admin: Update post
router.patch('/:id', authenticate, requireAdmin, async (req: AuthenticatedRequest, res, next) => {
  try {
    const data: any = { ...req.body };

    // Update publishedAt if publishing for first time
    if (data.status === 'PUBLISHED') {
      const existing = await prisma.blogPost.findUnique({ where: { id: req.params.id as string } });
      if (existing && !existing.publishedAt) {
        data.publishedAt = new Date();
      }
    }

    const post = await prisma.blogPost.update({
      where: { id: req.params.id as string },
      data,
    });

    res.json(post);
  } catch (error) {
    next(error);
  }
});

// Admin: Delete post
router.delete('/:id', authenticate, requireAdmin, async (req: AuthenticatedRequest, res, next) => {
  try {
    await prisma.blogPost.delete({ where: { id: req.params.id as string } });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
