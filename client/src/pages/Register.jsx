import React from 'react';
import { Navigate } from 'react-router-dom';

function Register() {
  return <Navigate to="/login?mode=signup" replace />;
}

export default Register;
