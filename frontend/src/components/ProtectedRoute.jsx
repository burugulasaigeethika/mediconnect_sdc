import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    const { isAuthenticated, user, loading } = useAuth();

    // Show loading state while checking auth
    if (loading) {
        return (
            <div className="auth-container">
                <div className="loading">Checking authentication...</div>
            </div>
        );
    }

    // If not authenticated, redirect to login
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // If allowedRoles is specified and user role is not in allowedRoles, redirect to appropriate dashboard
    if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
        console.log('ProtectedRoute: Role check failed', {
            allowedRoles,
            userRole: user?.role,
            user: user
        });

        const roleDashboardMap = {
            patient: '/dashboard',
            doctor: '/dashboard/doctor',
            pharmacist: '/dashboard/pharmacist',
            admin: '/dashboard/admin'
        };

        const dashboardPath = roleDashboardMap[user?.role] || '/';
        console.log('ProtectedRoute: Redirecting to', dashboardPath);
        return <Navigate to={dashboardPath} replace />;
    }

    console.log('ProtectedRoute: Access granted', {
        allowedRoles,
        userRole: user?.role
    });

    // If everything is fine, render the children
    return children;
};

export default ProtectedRoute;