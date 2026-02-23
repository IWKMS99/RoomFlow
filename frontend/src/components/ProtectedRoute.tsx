import React from 'react';
import {Navigate, Outlet, useLocation} from 'react-router-dom';
import {useAuth} from '../context/useAuth';

const ProtectedRoute: React.FC = () => {
    const location = useLocation();
    const {isAuthenticated, isLoading} = useAuth();

    if (isLoading) {
        return <div>Проверка авторизации...</div>;
    }

    if (isAuthenticated) {
        return <Outlet/>;
    }

    return <Navigate to="/login" replace state={{from: location}}/>;
};

export default ProtectedRoute;
