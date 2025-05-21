import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import { ROUTES } from '../constants';

const AuthGuard = ({ children }) => {
  const { isAuthenticated } = useSelector(state => state.auth);
  const location = useLocation();

  // If not authenticated, redirect to login page
  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  return children;
};

export default AuthGuard;
