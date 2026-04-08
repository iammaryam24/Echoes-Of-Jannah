import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import LoadingSpinner from './LoadingSpinner';

export default function ProtectedRoute({ children, requireAuth = true }) {
  const { userId, loading } = useUser();

  if (loading) {
    return <LoadingSpinner fullScreen message="Verifying your spiritual journey..." />;
  }

  if (requireAuth && !userId) {
    return <Navigate to="/" replace />;
  }

  return children;
}