import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

function PrivateRoute({ children }) {
  const { token, loading } = useAuth();

  if (loading) {
    return <p style={{ padding: '2rem', textAlign: 'center' }}>Restoring your session...</p>;
  }

  return token ? children : <Navigate to="/login" replace />;
}

export default PrivateRoute;
