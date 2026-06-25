import type { Request, Response, NextFunction } from 'express';

export const requirePermission = (permission: string) => {
    return (req: Request, res: Response, next: NextFunction): any => {
        const user = (req as any).user;
        if (!user) {
            return res.status(401).json({ error: 'Unauthorized: No user session found' });
        }

        const permissions: string[] = user.permissions || [];
        if (permissions.includes(permission)) {
            return next();
        }

        console.warn(`[RBAC] Access denied for user ${user.id} (${user.email}). Missing permission: ${permission}`);
        return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    };
};
