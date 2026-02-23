import React from 'react';
import {Navigate, Outlet} from 'react-router-dom';
import {useAuth} from '../context/useAuth';

interface RoleProtectedRouteProps {
    allowedRoles: string[];
}

const RoleProtectedRoute: React.FC<RoleProtectedRouteProps> = ({allowedRoles}) => {
    const {isAuthenticated, isLoading, user} = useAuth();

    if (isLoading) {
        return <div>Проверка авторизации...</div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace/>;
    }

    const userRoles = user?.roles ?? [];
    const hasAllowedRole = allowedRoles.some(role => userRoles.includes(role));
    if (!hasAllowedRole) {
        return <Navigate to="/schedule" replace/>;
    }

    return <Outlet/>;
};

export default RoleProtectedRoute;
