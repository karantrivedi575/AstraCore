import { Navigate } from 'react-router-dom';

const isTokenExpired = (token) => {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.exp * 1000 < Date.now();
    } catch {
        return true; 
    }
};

const ProtectedRoute = ({ children, requireAdmin = false }) => {
    const userString = localStorage.getItem('user');
    
    if (!userString) {
        return <Navigate to="/login" replace />;
    }

    try {
        const user = JSON.parse(userString);
        
        if (!user.token || isTokenExpired(user.token)) {
            localStorage.removeItem('user');
            return <Navigate to="/login" replace />;
        }

        if (requireAdmin && user.role !== 'ADMIN') {
            return <Navigate to="/" replace />; 
        }

        return children;
    } catch (e) {
        localStorage.removeItem('user');
        return <Navigate to="/login" replace />;
    }
};

export default ProtectedRoute;