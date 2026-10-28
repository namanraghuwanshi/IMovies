// Protected Route Component
// Restricts route access to authenticated users and optionally admins only
import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading, isAdmin } = useContext(AuthContext);
  const location = useLocation();

  // Show spinner while checking auth session
  if (loading) {
    return <LoadingSpinner text="Checking authentication..." />;
  }

  // If user is not logged in, redirect to login page preserving the target location
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If route is restricted to admins only and user is not an admin, redirect to home
  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
