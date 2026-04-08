/**
 * Login Component Tests
 * Tests login form validation and submission
 * Coverage: PRD01 - Login functionality
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Login from '../../../frontend/src/pages/Login';

// Mock the auth store
vi.mock('../../../frontend/src/stores/auth', () => ({
  useAuthStore: vi.fn(() => ({
    login: vi.fn().mockResolvedValue(undefined),
    isLoading: false,
    error: null,
  })),
}));

describe('Login Component', () => {
  it('should render login form', () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    expect(screen.getByText('Admin Login')).toBeInTheDocument();
    expect(screen.getByLabelText('Username')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument();
  });

  it('should show validation error for short username', async () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    const usernameInput = screen.getByLabelText('Username');
    fireEvent.change(usernameInput, { target: { value: 'ab' } });

    const submitButton = screen.getByRole('button', { name: /Sign In/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Username must be at least 3 characters')).toBeInTheDocument();
    });
  });

  it('should show validation error for short password', async () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    const usernameInput = screen.getByLabelText('Username');
    fireEvent.change(usernameInput, { target: { value: 'validuser' } });

    const passwordInput = screen.getByLabelText('Password');
    fireEvent.change(passwordInput, { target: { value: 'short' } });

    const submitButton = screen.getByRole('button', { name: /Sign In/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Password must be at least 6 characters')).toBeInTheDocument();
    });
  });

  it('should disable submit button when loading', () => {
    const { useAuthStore } = require('../../../frontend/src/stores/auth');
    useAuthStore.mockReturnValue({
      login: vi.fn(),
      isLoading: true,
      error: null,
    });

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    const submitButton = screen.getByRole('button', { name: /Signing in/i });
    expect(submitButton).toBeDisabled();
  });

  it('should display error message from store', () => {
    const { useAuthStore } = require('../../../frontend/src/stores/auth');
    useAuthStore.mockReturnValue({
      login: vi.fn(),
      isLoading: false,
      error: 'Invalid credentials',
    });

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
  });

  it('should apply MLB Navy theme to logo', () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    const logoContainer = screen.getByText('Admin Login').parentElement?.previousElementSibling;
    expect(logoContainer).toHaveClass('bg-mlb-navy');
  });
});
