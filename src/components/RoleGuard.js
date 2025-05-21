import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ROUTES } from '../constants';
import { notificationInstance } from '../services/api';

const RoleGuard = ({ children, allowedRoles }) => {
  const { user } = useSelector(state => state.auth);

  // If user role is not in the allowed roles list, redirect to products page
  if (!user || !allowedRoles.includes(user.role)) {
    // Show notification about the access restriction
    notificationInstance.error({
      message: 'Access Denied',
      description: 'You do not have permission to access this page.',
      placement: 'topRight',
      duration: 4,
    });

    return <Navigate to={ROUTES.PRODUCTS} replace />;
  }

  return children;
};

export default RoleGuard;
