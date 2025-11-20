import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, token } = useSelector(state => state.auth);
  
  console.log('ProtectedRoute - isAuthenticated:', isAuthenticated, 'has token:', !!token);
  
  // Simple check: user must be authenticated and have a token
  const isValidAuthenticated = isAuthenticated && !!token;
  console.log('ProtectedRoute - Final authentication status:', isValidAuthenticated);

  return isValidAuthenticated ? children : <Navigate to="/" replace />;
};

export default ProtectedRoute;