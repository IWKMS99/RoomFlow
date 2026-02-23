import React from 'react';
import {Navigate, Outlet} from 'react-router-dom';
import {useAuth} from '../context/useAuth';

const GuestOnlyRoute: React.FC = () => {
  const {isAuthenticated, isLoading} = useAuth();

  if (isLoading) {
    return <div>Проверка авторизации...</div>;
  }

  if (isAuthenticated) {
    return <Navigate to="/schedule" replace />;
  }

  return <Outlet />;
};

export default GuestOnlyRoute;
