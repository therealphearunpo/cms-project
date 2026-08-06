import React from 'react';

import { Routes, Route, Navigate } from 'react-router-dom';

import { AppRoutes } from '../../App';
import { isFrontendOnly } from '../../config/appMode.js';
import { useAuth } from '../../context/AuthContext.jsx';
import LoginPage from '../Auth/LoginPage.jsx';

/**
 * AuthRoutes renders the appropriate routing tree based on the
 * demo‑only mode and authentication state.
 * It must be rendered **inside** <AuthProvider> so that `useAuth`
 * has access to the context value.
 */
const AuthRoutes = () => {
  const { isAuthenticated } = useAuth();
  const demoOnly = isFrontendOnly();

  if (demoOnly && !isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return <AppRoutes />;
};

export default AuthRoutes;
