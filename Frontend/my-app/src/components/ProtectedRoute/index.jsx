import React from 'react';
import { useAuth } from '@clerk/clerk-react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) return null;

  return isSignedIn ? children : <Navigate to="/" replace />;
};

export default ProtectedRoute;
