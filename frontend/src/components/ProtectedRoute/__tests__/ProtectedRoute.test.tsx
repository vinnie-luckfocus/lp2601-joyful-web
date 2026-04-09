import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../index';

const mockCheckAuth = vi.fn();

let authState = {
  isAuthenticated: false,
  isLoading: true,
};

const mockUseAuthStore = vi.fn(() => ({
  ...authState,
  checkAuth: mockCheckAuth,
}));

vi.mock('../../../stores/auth', () => ({
  useAuthStore: (...args: unknown[]) => mockUseAuthStore(...args),
}));

const renderProtectedRoute = () => {
  return render(
    <MemoryRouter initialEntries={['/protected']}>
      <Routes>
        <Route path="/login" element={<div data-testid="login-page">Login Page</div>} />
        <Route element={<ProtectedRoute />}>
          <Route path="/protected" element={<div data-testid="protected-content">Protected Content</div>} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
};

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authState = { isAuthenticated: false, isLoading: true };
  });

  it('renders a spinner while auth is initializing', () => {
    renderProtectedRoute();
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    expect(screen.queryByTestId('login-page')).not.toBeInTheDocument();
  });

  it('redirects to login after loading completes when not authenticated', async () => {
    const { rerender } = renderProtectedRoute();

    // Simulate checkAuth completing by updating state and rerendering
    authState = { isAuthenticated: false, isLoading: false };
    rerender(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route path="/login" element={<div data-testid="login-page">Login Page</div>} />
          <Route element={<ProtectedRoute />}>
            <Route path="/protected" element={<div data-testid="protected-content">Protected Content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('login-page')).toBeInTheDocument();
    });

    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    expect(document.querySelector('.animate-spin')).not.toBeInTheDocument();
  });

  it('renders protected content after loading completes when authenticated', async () => {
    const { rerender } = renderProtectedRoute();

    authState = { isAuthenticated: true, isLoading: false };
    rerender(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route path="/login" element={<div data-testid="login-page">Login Page</div>} />
          <Route element={<ProtectedRoute />}>
            <Route path="/protected" element={<div data-testid="protected-content">Protected Content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    });

    expect(screen.queryByTestId('login-page')).not.toBeInTheDocument();
    expect(document.querySelector('.animate-spin')).not.toBeInTheDocument();
  });

  it('calls checkAuth on mount', () => {
    renderProtectedRoute();
    expect(mockCheckAuth).toHaveBeenCalledTimes(1);
  });

  it('does not redirect before checkAuth resolves', () => {
    mockCheckAuth.mockImplementation(() => new Promise(() => {}));

    renderProtectedRoute();

    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
    expect(screen.queryByTestId('login-page')).not.toBeInTheDocument();
  });
});
