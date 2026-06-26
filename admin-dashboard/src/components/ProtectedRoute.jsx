import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/** Maps a role to its default landing page */
const getRoleHome = (role) => {
    const r = (role || '').toLowerCase();
    if (r === 'super_admin') return '/superadmin/dashboard';
    if (r === 'admin') return '/admin/dashboard';
    if (r === 'hq_staff') return '/admin/dashboard';
    if (r === 'mayor') return '/mayor/dashboard';
    if (r === 'councilor') return '/councilor/dashboard';
    if (r === 'dept_head' || r === 'authority') return '/authority/dashboard';
    if (r === 'field_officer' || r === 'staff') return '/staff/dashboard';
    return '/login';
};

const ProtectedRoute = ({ children, allowedRoles, requiredPermission }) => {
    const { user, loading, can } = useAuth();

    if (loading) return null;

    if (!user) return <Navigate to="/login" replace />;

    if (requiredPermission && !can(requiredPermission)) {
        console.warn(`[ProtectedRoute] Access Denied. Missing permission: ${requiredPermission}`);
        return <Navigate to={getRoleHome(user.role)} replace />;
    }

    if (allowedRoles) {
        const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
        const userRole = (user.role || '').toLowerCase();

        const hasAccess = roles.some(role => role.toLowerCase() === userRole);

        if (!hasAccess) {
            console.warn(`[ProtectedRoute] Access Denied. User role: ${userRole}, Required: ${roles}`);
            return <Navigate to={getRoleHome(userRole)} replace />;
        }
    }

    return children;
};

export default ProtectedRoute;

