import React, { useEffect, useState } from 'react';

import { HiEye, HiEyeOff } from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';

import { isFrontendOnly } from '../../config/appMode';
import { getRoleHomePath } from '../../constants/roles';
import { useAuth } from '../../context/AuthContext';
import demoUsers from '../../data/demoUsers.json';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login, loading, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const isDemoMode = isFrontendOnly();
  const hiddenDemoEmails = new Set([
    'po.phearun.2824@rupp.edu.kh',
    'nim.cheyseth.2824@rupp.edu.kh',
    'thet.englang.2824@rupp.edu.kh',
  ]);
  const demoAccounts = isDemoMode
    ? demoUsers
        .filter((item) => !hiddenDemoEmails.has(item.email))
        .map((item) => ({ email: item.email, password: item.password, role: item.role }))
    : [];

  useEffect(() => {
    if (isAuthenticated) {
      navigate(getRoleHomePath(user?.role), { replace: true });
    }
  }, [isAuthenticated, navigate, user?.role]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const result = await login(email, password);
    if (result.success) {
      navigate(getRoleHomePath(result.role));
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f0e8] px-4 py-8 flex items-center justify-center">
      <div className="relative w-full max-w-md rounded-[28px] border border-[#dbcda9] bg-[#fffdf9] p-8 shadow-[0_24px_60px_rgba(15,47,99,0.10)]">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#102d5f] text-white font-bold text-sm shadow-sm">
            HS
          </div>
          <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.3em] text-[var(--moeys-gold)]">
            Official School Workspace
          </p>
          <h1 className="mt-2 text-2xl font-extrabold text-[#102d5f]">High School Portal</h1>
          <p className="mt-1 text-sm text-slate-500">School Class Management System</p>
        </div>

        <div id="login-help-text" className="mt-6 rounded-2xl border border-[#e5d9b8] bg-[#faf6ee] px-4 py-3 text-xs leading-6 text-slate-700">
          Admin, Teacher, and Student account type is detected automatically from your email.
        </div>

        {isDemoMode && (
          <div className="mt-4 rounded-2xl border border-[#e5d9b8] bg-[#ffffff] px-4 py-3 text-xs text-slate-700">
            <p className="font-semibold text-slate-800">Demo accounts</p>
            <ul className="mt-2 space-y-2">
              {demoAccounts.map((account) => (
                <li key={account.email}>
                  <span className="font-semibold text-[#102d5f]">{account.role}</span>: {account.email} / {account.password}
                </li>
              ))}
            </ul>
          </div>
        )}

        {error && (
          <div aria-live="polite" className="mt-4 bg-[#fff1f1] text-[#b42318] p-3 rounded-xl border border-[#f3c6c6] text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-700">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="username"
              aria-describedby="login-help-text"
              aria-invalid={Boolean(error)}
              autoCapitalize="off"
              autoCorrect="off"
              inputMode="email"
              spellCheck={false}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-[#d8ccaf] bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-[#102d5f] focus:ring-2 focus:ring-[#dbe5fb]"
              placeholder="name@school.edu"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-700">Password</label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-[#d8ccaf] bg-white px-3 py-2.5 pr-10 text-sm text-slate-800 outline-none transition focus:border-[#102d5f] focus:ring-2 focus:ring-[#dbe5fb]"
                placeholder="Enter password"
                required
              />
              <button
                type="button"
                title={showPassword ? 'Hide password' : 'Show password'}
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-500 hover:text-slate-700"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <HiEyeOff className="w-5 h-5" /> : <HiEye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[#102d5f] py-2.5 text-sm font-semibold text-white transition hover:bg-[#0d2347] disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Sign In'}
          </button>
        </form>

        <p className="mt-6 text-center text-[11px] uppercase tracking-[0.24em] text-slate-500">
          Public High School System - Cambodia
        </p>
      </div>
    </div>
  );
}
