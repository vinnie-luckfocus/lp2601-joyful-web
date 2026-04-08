/**
 * Login Component Tests
 * Tests login form validation and submission
 * Coverage: PRD01 - Login functionality
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Login from '../../pages/Login';

const mockLogin = vi.fn();
const mockUseAuthStore = vi.fn(() => ({
  login: mockLogin,
  isLoading: false,
  error: null,
}));

vi.mock('../../stores/auth', () => ({
  useAuthStore: () => mockUseAuthStore(),
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

  it('should have input fields with correct attributes', () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    const usernameInput = screen.getByLabelText('Username') as HTMLInputElement;
    const passwordInput = screen.getByLabelText('Password') as HTMLInputElement;

    expect(usernameInput.type).toBe('text');
    expect(usernameInput.required).toBe(true);
    expect(passwordInput.type).toBe('password');
    expect(passwordInput.required).toBe(true);
  });

  it('should disable submit button when loading', () => {
    mockUseAuthStore.mockReturnValueOnce({
      login: mockLogin,
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
    mockUseAuthStore.mockReturnValueOnce({
      login: mockLogin,
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

    // Find the logo container by class
    const logoDiv = document.querySelector('.bg-mlb-navy');
    expect(logoDiv).toBeInTheDocument();
  });

  it('should update username input value', () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    const usernameInput = screen.getByLabelText('Username') as HTMLInputElement;
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    expect(usernameInput.value).toBe('testuser');
  });
});
