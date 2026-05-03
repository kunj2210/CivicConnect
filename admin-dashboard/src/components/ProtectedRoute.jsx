import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, loading } = useAuth();

    if (loading) return null;

    if (!user) return <Navigate to="/login" replace />;

    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    const userRole = (user.role || '').toLowerCase();
    
    const hasAccess = roles.some(role => role.toLowerCase() === userRole);

    if (allowedRoles && !hasAccess) {
        console.warn(`[ProtectedRoute] Access Denied. User role: ${userRole}, Required: ${roles}`);
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;
