import { Router } from 'express';
import prisma from '../config/database.js';
import { authenticate, optionalAuth, AuthenticatedRequest } from '../middleware/auth.middleware.js';

const router = Router();

// Get all posts
router.get('/', optionalAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { page = '1', limit = '20' } = req.query as any;

    const [posts, total] = await Promise.all([
      prisma.communityPost.findMany({
        include: {
          user: {
            select: {
              id: true,
              studentProfile: { select: { fullName: true, avatarUrl: true } },
            },
          },
          _count: { select: { comments: true, likes: true } },
          likes: req.user ? { where: { userId: req.user.id }, take: 1 } : false,
        },
        orderBy: { createdAt: 'desc' },
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit),
      }),
      prisma.communityPost.count(),
    ]);

    res.json({
      posts: posts.map((p) => ({
        id: p.id,
        content: p.content,
        imageUrl: p.imageUrl,
        createdAt: p.createdAt,
        author: {
          id: p.user.id,
          name: p.user.studentProfile?.fullName || 'User',
          avatar: p.user.studentProfile?.avatarUrl,
        },
        commentCount: p._count.comments,
        likeCount: p._count.likes,
        isLiked: Array.isArray(p.likes) && p.likes.length > 0,
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

// Create post
router.post('/', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { content, imageUrl } = req.body;

    const post = await prisma.communityPost.create({
      data: {
        content,
        imageUrl,
        userId: req.user!.id,
      },
      include: {
        user: {
          select: {
            studentProfile: { select: { fullName: true, avatarUrl: true } },
          },
        },
      },
    });

    res.status(201).json(post);
  } catch (error) {
    next(error);
  }
});

// Get single post with comments
router.get('/:id', optionalAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const post = await prisma.communityPost.findUnique({
      where: { id: req.params.id as string },
      include: {
        user: {
          select: {
            id: true,
            studentProfile: { select: { fullName: true, avatarUrl: true } },
          },
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                studentProfile: { select: { fullName: true, avatarUrl: true } },
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
        _count: { select: { likes: true } },
      },
    });

    if (!post) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    res.json(post);
  } catch (error) {
    next(error);
  }
});

// Delete post
router.delete('/:id', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const post = await prisma.communityPost.findUnique({
      where: { id: req.params.id as string },
    });

    if (!post || post.userId !== req.user!.id) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    await prisma.communityPost.delete({ where: { id: req.params.id as string } });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// Like post
router.post('/:id/like', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    await prisma.like.create({
      data: {
        postId: req.params.id as string,
        userId: req.user!.id,
      },
    });
    res.status(201).json({ liked: true });
  } catch (error: any) {
    if (error.code === 'P2002') {
      res.status(409).json({ error: 'Already liked' });
      return;
    }
    next(error);
  }
});

// Unlike post
router.delete('/:id/like', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    await prisma.like.delete({
      where: {
        postId_userId: {
          postId: req.params.id as string,
          userId: req.user!.id,
        },
      },
    });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// Add comment
router.post('/:id/comments', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { content } = req.body;

    const comment = await prisma.comment.create({
      data: {
        postId: req.params.id as string,
        userId: req.user!.id,
        content,
      },
      include: {
        user: {
          select: {
            studentProfile: { select: { fullName: true, avatarUrl: true } },
          },
        },
      },
    });

    res.status(201).json(comment);
  } catch (error) {
    next(error);
  }
});

// Delete comment
router.delete('/comments/:id', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const comment = await prisma.comment.findUnique({
      where: { id: req.params.id as string },
    });

    if (!comment || comment.userId !== req.user!.id) {
      res.status(404).json({ error: 'Comment not found' });
      return;
    }

    await prisma.comment.delete({ where: { id: req.params.id as string } });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
