import { useAuth } from '../context/AuthContext';

/**
 * RoleGuard — fine-grained in-page permission rendering.
 *
 * Usage (permission-based):
 *   <RoleGuard permission="report:assign">
 *     <AssignButton />
 *   </RoleGuard>
 *
 * Usage (role-based):
 *   <RoleGuard roles={['admin', 'super_admin']}>
 *     <DeleteButton />
 *   </RoleGuard>
 *
 * Usage (with fallback):
 *   <RoleGuard permission="report:delete" fallback={<span title="No permission">🔒</span>}>
 *     <DeleteButton />
 *   </RoleGuard>
 *
 * Props:
 *   permission  — check user has this permission key (uses can() from AuthContext)
 *   roles       — check user role is in this list (string or string[])
 *   fallback    — element to render when access is denied (default: null)
 *   children    — the protected content
 */
const RoleGuard = ({ permission, roles, fallback = null, children }) => {
    const { user, can } = useAuth();

    if (!user) return fallback;

    // Permission-based check
    if (permission !== undefined) {
        return can(permission) ? children : fallback;
    }

    // Role-based check
    if (roles !== undefined) {
        const allowedRoles = Array.isArray(roles) ? roles : [roles];
        const userRole = (user.role || '').toLowerCase();
        const hasAccess = allowedRoles.some(r => r.toLowerCase() === userRole);
        return hasAccess ? children : fallback;
    }

    // No guard specified — render children
    return children;
};

export default RoleGuard;
