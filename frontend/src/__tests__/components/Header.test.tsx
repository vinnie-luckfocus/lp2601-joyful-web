/**
 * Header Component Tests
 * Tests header layout and user info display
 * Coverage: PRD01 - Admin layout requirements
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Header } from '../../components/Layout/Header';

const mockLogout = vi.fn();
const mockUseAuthStore = vi.fn(() => ({
  user: { name: 'Test Admin', role: 'admin' },
  logout: mockLogout,
}));

vi.mock('../../stores/auth', () => ({
  useAuthStore: () => mockUseAuthStore(),
}));

describe('Header Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render dashboard title', () => {
    render(<Header />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('should display user name', () => {
    render(<Header />);
    expect(screen.getByText('Test Admin')).toBeInTheDocument();
  });

  it('should have logout button', () => {
    render(<Header />);
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

  it('should call logout when logout button clicked', () => {
    render(<Header />);

    const logoutButton = screen.getByText('Logout').parentElement;
    fireEvent.click(logoutButton!);

    expect(mockLogout).toHaveBeenCalled();
  });

  it('should have MLB Navy user icon background', () => {
    render(<Header />);

    const userIcon = screen.getByText('Test Admin').previousElementSibling;
    expect(userIcon).toHaveClass('bg-mlb-navy');
  });

  it('should have sticky positioning', () => {
    render(<Header />);

    const header = screen.getByText('Dashboard').parentElement?.parentElement;
    expect(header).toHaveClass('sticky', 'top-0');
  });

  it('should show default name when user is null', () => {
    mockUseAuthStore.mockReturnValueOnce({
      user: null,
      logout: mockLogout,
    });

    render(<Header />);
    expect(screen.getByText('Admin User')).toBeInTheDocument();
  });
});
