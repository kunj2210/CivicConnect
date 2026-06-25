import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles, requiredPermission }) => {
    const { user, loading, can } = useAuth();

    if (loading) return null;

    if (!user) return <Navigate to="/login" replace />;

    if (requiredPermission && !can(requiredPermission)) {
        console.warn(`[ProtectedRoute] Access Denied. Missing permission: ${requiredPermission}`);
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles) {
        const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
        const userRole = (user.role || '').toLowerCase();
        
        const hasAccess = roles.some(role => role.toLowerCase() === userRole);

        if (!hasAccess) {
            console.warn(`[ProtectedRoute] Access Denied. User role: ${userRole}, Required: ${roles}`);
            return <Navigate to="/login" replace />;
        }
    }

    return children;
};

export default ProtectedRoute;
