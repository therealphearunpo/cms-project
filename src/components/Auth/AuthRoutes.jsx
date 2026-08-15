import React from 'react';

import { AppRoutes } from '../../App';

/**
 * AuthRoutes renders the main routing tree (<AppRoutes />).
 * It must be rendered **inside** <AuthProvider> so that `useAuth`
 * has access to the context value.
 */
const AuthRoutes = () => {
  return <AppRoutes />;
};

export default AuthRoutes;
