import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRole }) => {
    const { user } = useAuth();

    if (!user) {
        // Redirect to login if not authenticated
        return <Navigate to="/login" replace />;
    }

    if (allowedRole && user.role !== allowedRole) {
        // Redirect to login if user role doesn't match
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;
