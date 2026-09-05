import React, { createContext, useCallback, useContext, useEffect, useReducer } from 'react';

import { isFrontendOnly } from '../config/appMode';
import { ACCOUNT_ROLES, getRoleLabel, normalizeRole } from '../constants/roles';
import { authAPI } from '../services/api';
import { generateAvatarByGender, normalizeGender } from '../utils/avatar';

const AuthContext = createContext(null);
const ADMIN_CENTER_EMAILS = [
  'nim.cheyseth.2824@rupp.edu.kh',
  'thet.englang.2824@rupp.edu.kh',
  'po.phearun.2824@rupp.edu.kh',
];
export const DEMO_LOGIN_ACCOUNTS = [
  {
    label: 'Admin',
    email: 'admin@school.edu',
    password: 'Admin1234',
    user: {
      id: 'demo-admin',
      name: 'Admin Center',
      email: 'admin@school.edu',
      gender: 'male',
      role: ACCOUNT_ROLES.ADMIN,
    },
  },
];

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: true,
  error: null,
};

function authReducer(state, action) {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, loading: true, error: null };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        loading: false,
        isAuthenticated: true,
        user: action.payload,
        error: null,
      };
    case 'LOGIN_FAILURE':
      return { ...state, loading: false, error: action.payload };
    case 'LOGOUT':
      return { ...state, isAuthenticated: false, user: null, loading: false, error: null };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'UPDATE_PROFILE':
      return { ...state, user: action.payload };
    default:
      return state;
  }
}

function normalizeUser(user) {
  if (!user) return null;
  const normalizedEmail = String(user.email || '')
    .trim()
    .toLowerCase();
  const isAdminCenterMember = ADMIN_CENTER_EMAILS.includes(normalizedEmail);
  const normalizedRole = isAdminCenterMember ? ACCOUNT_ROLES.ADMIN : normalizeRole(user.role);
  const normalizedGender = normalizeGender(user.gender, 'male');

  return {
    ...user,
    email: normalizedEmail,
    isAdminCenterMember,
    gender: normalizedGender,
    role: normalizedRole,
    roleLabel: getRoleLabel(normalizedRole),
    avatar:
      user.avatar ||
      generateAvatarByGender(normalizedEmail || user.name || 'user', normalizedGender),
  };
}


function clearStoredAuth() {
  localStorage.removeItem('auth_user');
  localStorage.removeItem('auth_token');
}

function readStoredUser() {
  try {
    const raw = localStorage.getItem('auth_user');
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (_error) {
    return null;
  }
}

function mergeStoredProfile(user) {
  if (!user) return null;

  const storedUser = readStoredUser();
  if (!storedUser) return user;

  const storedId = String(storedUser.id || '').trim();
  const nextId = String(user.id || '').trim();
  const storedEmail = String(storedUser.email || '')
    .trim()
    .toLowerCase();
  const nextEmail = String(user.email || '')
    .trim()
    .toLowerCase();
  const isSameUser =
    (storedId && nextId && storedId === nextId) ||
    (storedEmail && nextEmail && storedEmail === nextEmail);

  if (!isSameUser) return user;

  return {
    ...user,
    avatar: storedUser.avatar || user.avatar,
    phone: storedUser.phone || user.phone,
    dateOfBirth: storedUser.dateOfBirth || user.dateOfBirth,
  };
}

function isLocalHost() {
  if (typeof window === 'undefined') return false;
  return ['localhost', '127.0.0.1'].includes(window.location.hostname);
}

function canUseLocalDemoAuth() {
  return isFrontendOnly() || process.env.NODE_ENV === 'test' || isLocalHost();
}

function shouldUseDemoAuthFirst() {
  return isFrontendOnly() || process.env.NODE_ENV === 'test';
}

function isNetworkError(error) {
  return (
    !error?.response ||
    /network error|failed to fetch|econnrefused/i.test(String(error?.message || ''))
  );
}

async function loginWithDemoAccount(email, password) {
  const account = DEMO_LOGIN_ACCOUNTS.find(
    (item) => item.email === email && item.password === password
  );

  if (!account) {
    throw new Error('Invalid email or password');
  }

  return {
    data: {
      token: `demo-token-${account.user.id}`,
      user: account.user,
    },
  };
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const login = useCallback(async (email, password) => {
    dispatch({ type: 'LOGIN_START' });
    try {
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      const normalizedEmail = String(email).trim().toLowerCase();
      const rawPassword = String(password);
      let response;

      if (shouldUseDemoAuthFirst()) {
        response = await loginWithDemoAccount(normalizedEmail, rawPassword);
      } else {
        try {
          response = await authAPI.login({ email: normalizedEmail, password: rawPassword });
        } catch (apiError) {
          if (!canUseLocalDemoAuth() || !isNetworkError(apiError)) {
            throw apiError;
          }
          response = await loginWithDemoAccount(normalizedEmail, rawPassword);
        }
      }

      const token = response?.data?.token;
      const user = normalizeUser(mergeStoredProfile(response?.data?.user));

      if (!token || !user) {
        throw new Error('Login response is missing required user data');
      }

      localStorage.setItem('auth_token', token);
      localStorage.setItem('auth_user', JSON.stringify(user));
      dispatch({ type: 'LOGIN_SUCCESS', payload: user });
      return { success: true, role: user.role };
    } catch (error) {
      clearStoredAuth();
      const message =
        error?.response?.data?.message || error?.message || 'Login failed';
      dispatch({ type: 'LOGIN_FAILURE', payload: message });
      return { success: false, error: message };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authAPI.logout();
    } catch (_error) {
      // Local logout should still complete if the API is unavailable.
    }

    clearStoredAuth();
    dispatch({ type: 'LOGOUT' });
  }, []);

  const checkAuth = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        dispatch({ type: 'SET_LOADING', payload: false });
        return;
      }


      try {
        const response = await authAPI.me();
        const user = normalizeUser(mergeStoredProfile(response?.data?.user));

        if (!user) {
          throw new Error('Authenticated user payload is missing');
        }

        localStorage.setItem('auth_user', JSON.stringify(user));
        dispatch({ type: 'LOGIN_SUCCESS', payload: user });
      } catch (apiError) {
        const storedUser = readStoredUser();
        if (storedUser) {
          dispatch({ type: 'LOGIN_SUCCESS', payload: normalizeUser(storedUser) });
        } else {
          clearStoredAuth();
          dispatch({ type: 'LOGOUT' });
        }
      }
    } catch (_error) {
      clearStoredAuth();
      dispatch({ type: 'LOGOUT' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const updateProfile = useCallback(
    async (updates) => {
      if (!state.user) {
        return { success: false, error: 'No authenticated user found.' };
      }

      const currentRole = normalizeRole(state.user.role);
      const nextUser = {
        ...state.user,
        ...updates,
        role: currentRole,
        roleLabel: getRoleLabel(currentRole),
        isAdminCenterMember: currentRole === ACCOUNT_ROLES.ADMIN,
      };

      nextUser.gender = normalizeGender(
        nextUser.gender,
        normalizeGender(state.user.gender, 'male')
      );
      if (!nextUser.avatar) {
        const avatarSeed = nextUser.email || nextUser.name || 'user';
        nextUser.avatar = generateAvatarByGender(avatarSeed, nextUser.gender);
      }

      dispatch({ type: 'UPDATE_PROFILE', payload: nextUser });
      try {
        localStorage.setItem('auth_user', JSON.stringify(nextUser));
        return { success: true, user: nextUser };
      } catch (_error) {
        return {
          success: true,
          user: nextUser,
          warning:
            'Profile updated for this session. Storage is full, so it may not persist after refresh.',
        };
      }
    },
    [state.user]
  );

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <AuthContext.Provider value={{ ...state, login, logout, checkAuth, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
