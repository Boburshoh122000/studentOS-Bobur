import { Router } from 'express';
import { z } from 'zod';
import prisma from '../config/database.js';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/role.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { AppError } from '../middleware/error.middleware.js';

const router = Router();

// All routes require admin authentication
router.use(authenticate, requireAdmin);

const SUPER_ADMIN_EMAIL = 'javohirturayev01@gmail.com';

function superAdminOnly(req: AuthenticatedRequest, res: any, next: any) {
  if (req.user?.email !== SUPER_ADMIN_EMAIL) {
    return res.status(403).json({ error: 'Super admin access required' });
  }
  next();
}

// =============================================================================
// Validation Schemas
// =============================================================================

const createRoleSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Role name must be at least 2 characters'),
    description: z.string().optional(),
    permissionIds: z.array(z.string()).optional(),
  }),
});

const updateRoleSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Role name must be at least 2 characters').optional(),
    description: z.string().optional(),
  }),
});

const updatePermissionsSchema = z.object({
  body: z.object({
    permissionIds: z.array(z.string()),
  }),
});

const assignRoleSchema = z.object({
  body: z.object({
    roleId: z.string(),
  }),
});

// =============================================================================
// Helper: Log admin actions
// =============================================================================

async function logAdminAction(
  req: AuthenticatedRequest,
  action: string,
  targetType: string,
  targetId: string | null,
  details?: Record<string, any>
) {
  await prisma.auditLog.create({
    data: {
      adminId: req.user!.id,
      action,
      targetType,
      targetId,
      details: details ? JSON.stringify(details) : null,
      ipAddress: req.ip || req.socket.remoteAddress,
      userAgent: req.headers['user-agent'],
    },
  });
}

// =============================================================================
// PERMISSIONS
// =============================================================================

// GET /api/admin/permissions - List all permissions (grouped by category)
router.get('/permissions', async (req: AuthenticatedRequest, res, next) => {
  try {
    const permissions = await prisma.permission.findMany({
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    });

    // Group by category
    const grouped: Record<string, typeof permissions> = {};
    for (const perm of permissions) {
      if (!grouped[perm.category]) {
        grouped[perm.category] = [];
      }
      grouped[perm.category].push(perm);
    }

    res.json({ permissions, grouped });
  } catch (error) {
    next(error);
  }
});

// =============================================================================
// ROLES
// =============================================================================

// GET /api/admin/roles - List all roles with permissions
router.get('/roles', async (req: AuthenticatedRequest, res, next) => {
  try {
    const roles = await prisma.adminRole.findMany({
      include: {
        permissions: {
          include: { permission: true },
        },
        _count: { select: { userRoles: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    // Transform the data for easier frontend consumption
    const transformedRoles = roles.map((role) => ({
      id: role.id,
      name: role.name,
      description: role.description,
      isSystem: role.isSystem,
      userCount: role._count.userRoles,
      permissions: role.permissions.map((rp) => rp.permission),
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
    }));

    res.json(transformedRoles);
  } catch (error) {
    next(error);
  }
});

// GET /api/admin/roles/:id - Get single role with permissions
router.get('/roles/:id', async (req: AuthenticatedRequest, res, next) => {
  try {
    const roleId = req.params.id as string;
    const role = await prisma.adminRole.findUnique({
      where: { id: roleId },
      include: {
        permissions: {
          include: { permission: true },
        },
        userRoles: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                studentProfile: { select: { fullName: true } },
              },
            },
          },
        },
      },
    });

    if (!role) {
      throw new AppError(404, 'Role not found');
    }

    res.json({
      ...role,
      permissions: role.permissions.map((rp) => rp.permission),
      users: role.userRoles.map((ur) => ({
        id: ur.user.id,
        email: ur.user.email,
        fullName: ur.user.studentProfile?.fullName,
      })),
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/admin/roles - Create new role
router.post('/roles', validate(createRoleSchema), async (req: AuthenticatedRequest, res, next) => {
  try {
    const { name, description, permissionIds } = req.body;

    // Check if role name already exists
    const existing = await prisma.adminRole.findUnique({ where: { name } });
    if (existing) {
      throw new AppError(400, 'A role with this name already exists');
    }

    const role = await prisma.adminRole.create({
      data: {
        name,
        description,
        permissions: permissionIds
          ? {
              create: permissionIds.map((permId: string) => ({
                permissionId: permId,
              })),
            }
          : undefined,
      },
      include: {
        permissions: { include: { permission: true } },
      },
    });

    await logAdminAction(req, 'CREATE_ROLE', 'ROLE', role.id, { name });

    res.status(201).json({
      ...role,
      permissions: role.permissions.map((rp) => rp.permission),
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/admin/roles/:id - Update role name/description
router.patch(
  '/roles/:id',
  validate(updateRoleSchema),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const { name, description } = req.body;
      const roleId = req.params.id as string;

      const existingRole = await prisma.adminRole.findUnique({ where: { id: roleId } });
      if (!existingRole) {
        throw new AppError(404, 'Role not found');
      }

      // Check for duplicate name if updating name
      if (name && name !== existingRole.name) {
        const duplicateName = await prisma.adminRole.findUnique({ where: { name } });
        if (duplicateName) {
          throw new AppError(400, 'A role with this name already exists');
        }
      }

      const role = await prisma.adminRole.update({
        where: { id: roleId },
        data: { name, description },
      });

      await logAdminAction(req, 'UPDATE_ROLE', 'ROLE', roleId, { name, description });

      res.json(role);
    } catch (error) {
      next(error);
    }
  }
);

// PUT /api/admin/roles/:id/permissions - Set all permissions for a role
router.put(
  '/roles/:id/permissions',
  validate(updatePermissionsSchema),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const { permissionIds } = req.body;
      const roleId = req.params.id as string;

      const role = await prisma.adminRole.findUnique({ where: { id: roleId } });
      if (!role) {
        throw new AppError(404, 'Role not found');
      }

      // Delete existing permissions and add new ones in a transaction
      await prisma.$transaction([
        prisma.rolePermission.deleteMany({ where: { roleId } }),
        ...permissionIds.map((permId: string) =>
          prisma.rolePermission.create({
            data: { roleId, permissionId: permId },
          })
        ),
      ]);

      // Fetch updated role
      const updatedRole = await prisma.adminRole.findUnique({
        where: { id: roleId },
        include: {
          permissions: { include: { permission: true } },
        },
      });

      await logAdminAction(req, 'UPDATE_ROLE_PERMISSIONS', 'ROLE', roleId, {
        permissionCount: permissionIds.length,
      });

      res.json({
        ...updatedRole,
        permissions: updatedRole?.permissions.map((rp) => rp.permission),
      });
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /api/admin/roles/:id - Delete role (if not system role)
router.delete('/roles/:id', async (req: AuthenticatedRequest, res, next) => {
  try {
    const roleId = req.params.id as string;

    const role = await prisma.adminRole.findUnique({ where: { id: roleId } });
    if (!role) {
      throw new AppError(404, 'Role not found');
    }

    if (role.isSystem) {
      throw new AppError(400, 'Cannot delete system roles');
    }

    // Check if role is assigned to any users
    const assignedUsers = await prisma.userAdminRole.count({ where: { roleId } });
    if (assignedUsers > 0) {
      throw new AppError(
        400,
        `Cannot delete role: ${assignedUsers} user(s) are still assigned to this role`
      );
    }

    await prisma.adminRole.delete({ where: { id: roleId } });

    await logAdminAction(req, 'DELETE_ROLE', 'ROLE', roleId, { name: role.name });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// =============================================================================
// ADMIN USERS
// =============================================================================

// GET /api/admin/roles/users - Get all admin users with their roles
router.get('/roles/users', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { search, page = '1', limit = '20' } = req.query as any;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));

    const where: any = {
      role: 'ADMIN', // Only fetch admin users
    };

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { studentProfile: { fullName: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          isActive: true,
          lastLoginAt: true,
          createdAt: true,
          studentProfile: {
            select: { fullName: true, avatarUrl: true },
          },
          adminRoles: {
            include: {
              role: {
                select: { id: true, name: true },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
      }),
      prisma.user.count({ where }),
    ]);

    // Transform data
    const transformedUsers = users.map((user) => ({
      id: user.id,
      email: user.email,
      fullName: user.studentProfile?.fullName || 'Unknown',
      avatarUrl: user.studentProfile?.avatarUrl,
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      roles: user.adminRoles.map((ar) => ar.role),
    }));

    res.json({
      users: transformedUsers,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/admin/users/search - Search non-admin users (superAdminOnly)
router.get('/users/search', superAdminOnly, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { q } = req.query as any;
    if (!q || q.trim().length < 2) {
      return res.json({ users: [] });
    }

    const users = await prisma.user.findMany({
      where: {
        role: { not: 'ADMIN' },
        OR: [
          { email: { contains: q.trim(), mode: 'insensitive' } },
          { studentProfile: { fullName: { contains: q.trim(), mode: 'insensitive' } } },
        ],
      },
      select: {
        id: true,
        email: true,
        role: true,
        studentProfile: { select: { fullName: true, avatarUrl: true } },
      },
      take: 10,
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      users: users.map((u) => ({
        id: u.id,
        email: u.email,
        role: u.role,
        fullName: u.studentProfile?.fullName || 'Unknown',
        avatarUrl: u.studentProfile?.avatarUrl,
      })),
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/admin/users/:userId/assign-admin - Promote user to ADMIN (superAdminOnly)
router.post(
  '/users/:userId/assign-admin',
  superAdminOnly,
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const userId = req.params.userId as string;

      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        throw new AppError(404, 'User not found');
      }
      if (user.role === 'ADMIN') {
        throw new AppError(400, 'User is already an admin');
      }

      await prisma.user.update({ where: { id: userId }, data: { role: 'ADMIN' } });

      await logAdminAction(req, 'ASSIGN_ADMIN', 'USER', userId, { email: user.email });

      res.json({ message: 'User promoted to admin successfully' });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/admin/users/:userId/remove-admin - Demote admin to STUDENT (superAdminOnly)
router.post(
  '/users/:userId/remove-admin',
  superAdminOnly,
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const userId = req.params.userId as string;

      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        throw new AppError(404, 'User not found');
      }
      if (user.email === SUPER_ADMIN_EMAIL) {
        throw new AppError(400, 'Cannot remove super admin access');
      }
      if (user.role !== 'ADMIN') {
        throw new AppError(400, 'User is not an admin');
      }

      await prisma.$transaction([
        prisma.userAdminRole.deleteMany({ where: { userId } }),
        prisma.user.update({ where: { id: userId }, data: { role: 'STUDENT' } }),
      ]);

      await logAdminAction(req, 'REMOVE_ADMIN', 'USER', userId, { email: user.email });

      res.json({ message: 'Admin access removed successfully' });
    } catch (error) {
      next(error);
    }
  }
);

// PATCH /api/admin/users/:id/role - Assign/change role for an admin user
router.patch(
  '/users/:id/role',
  validate(assignRoleSchema),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const { roleId } = req.body;
      const userId = req.params.id as string;

      // Verify user exists and is an admin
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { adminRoles: true },
      });

      if (!user) {
        throw new AppError(404, 'User not found');
      }

      if (user.role !== 'ADMIN') {
        throw new AppError(400, 'Can only assign admin roles to admin users');
      }

      // Prevent self-demotion for the current admin
      if (userId === req.user!.id) {
        // Check if new role has system.roles permission
        const newRole = await prisma.adminRole.findUnique({
          where: { id: roleId },
          include: { permissions: { include: { permission: true } } },
        });

        const hasRolesPermission = newRole?.permissions.some(
          (rp) => rp.permission.slug === 'system.roles'
        );

        if (!hasRolesPermission) {
          throw new AppError(400, 'Cannot remove your own role management permission');
        }
      }

      // Verify role exists
      const role = await prisma.adminRole.findUnique({ where: { id: roleId } });
      if (!role) {
        throw new AppError(404, 'Role not found');
      }

      // Remove existing roles and assign new one
      await prisma.$transaction([
        prisma.userAdminRole.deleteMany({ where: { userId } }),
        prisma.userAdminRole.create({
          data: { userId, roleId },
        }),
      ]);

      await logAdminAction(req, 'ASSIGN_ROLE', 'USER', userId, { roleId, roleName: role.name });

      res.json({ message: 'Role assigned successfully', roleId, roleName: role.name });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
