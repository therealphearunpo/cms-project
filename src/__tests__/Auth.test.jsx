import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import LoginPage from '../components/Auth/LoginPage';
import { AuthProvider, useAuth } from '../context/AuthContext';

function TestAuthComponent() {
  const { login, isAuthenticated, user, loading, error } = useAuth();
  return (
    <div>
      <div data-testid="loading">{loading ? 'loading' : 'idle'}</div>
      <div data-testid="auth">{isAuthenticated ? 'authenticated' : 'unauthenticated'}</div>
      <div data-testid="user-role">{user ? user.role : 'none'}</div>
      <div data-testid="error">{error || 'no-error'}</div>
      <button onClick={() => login('admin@school.edu', 'Admin1234')} data-testid="login-admin">
        Login Admin
      </button>
      <button onClick={() => login('wrong@school.edu', 'wrongpass')} data-testid="login-wrong">
        Login Wrong
      </button>
    </div>
  );
}

const renderLoginPage = () => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <LoginPage />
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Authentication Flow', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders login page with email, password fields and sign in button', async () => {
    renderLoginPage();
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Sign In/i })).not.toBeDisabled();
    });
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
  });

  it('allows user to click demo account button to fill credentials', async () => {
    renderLoginPage();
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Sign In/i })).not.toBeDisabled();
    });
    const adminDemoBtn = screen.getByRole('button', { name: /admin : admin@school\.edu/i });
    fireEvent.click(adminDemoBtn);
    expect(screen.getByLabelText(/Email/i)).toHaveValue('admin@school.edu');
    expect(screen.getByLabelText('Password')).toHaveValue('Admin1234');
  });

  it('successfully logs in admin user with correct demo credentials', async () => {
    render(
      <AuthProvider>
        <TestAuthComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('idle');
    });
    expect(screen.getByTestId('auth')).toHaveTextContent('unauthenticated');

    fireEvent.click(screen.getByTestId('login-admin'));

    await waitFor(() => {
      expect(screen.getByTestId('auth')).toHaveTextContent('authenticated');
      expect(screen.getByTestId('user-role')).toHaveTextContent('admin');
    });
  });

  it('shows error on invalid demo login credentials', async () => {
    render(
      <AuthProvider>
        <TestAuthComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('idle');
    });

    fireEvent.click(screen.getByTestId('login-wrong'));

    await waitFor(() => {
      expect(screen.getByTestId('auth')).toHaveTextContent('unauthenticated');
      expect(screen.getByTestId('error')).toHaveTextContent('Invalid email or password');
    });
  });
});
