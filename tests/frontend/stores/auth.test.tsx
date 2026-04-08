/**
 * Auth Store Tests
 * Tests Zustand auth store functionality
 * Coverage: PRD01 - Authentication state management
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAuthStore } from '../../../frontend/src/stores/auth';
import api from '../../../frontend/src/utils/axios';

// Mock axios
vi.mock('../../../frontend/src/utils/axios', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

describe('Auth Store', () => {
  beforeEach(() => {
    // Reset store state
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
    localStorage.clear();
  });

  it('should have initial state', () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('should login successfully', async () => {
    const mockUser = { id: 1, username: 'admin', name: 'Admin', role: 'admin' };
    const mockToken = 'test-token';

    (api.post as any).mockResolvedValue({
      data: { token: mockToken, user: mockUser },
    });

    await useAuthStore.getState().login('admin', 'password');

    const state = useAuthStore.getState();
    expect(state.user).toEqual(mockUser);
    expect(state.isAuthenticated).toBe(true);
    expect(state.isLoading).toBe(false);
    expect(localStorage.setItem).toHaveBeenCalledWith('token', mockToken);
  });

  it('should handle login error', async () => {
    (api.post as any).mockRejectedValue({
      response: { data: { error: 'Invalid credentials' } },
    });

    try {
      await useAuthStore.getState().login('admin', 'wrongpass');
    } catch {
      // Expected to throw
    }

    const state = useAuthStore.getState();
    expect(state.error).toBe('Invalid credentials');
    expect(state.isAuthenticated).toBe(false);
    expect(state.isLoading).toBe(false);
  });

  it('should logout and clear state', () => {
    useAuthStore.setState({
      user: { id: 1, username: 'admin', name: 'Admin', role: 'admin' },
      isAuthenticated: true,
    });

    useAuthStore.getState().logout();

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(localStorage.removeItem).toHaveBeenCalledWith('token');
  });

  it('should check auth with valid token', async () => {
    const mockUser = { id: 1, username: 'admin', name: 'Admin', role: 'admin' };
    (api.get as any).mockResolvedValue({ data: mockUser });
    (localStorage.getItem as any).mockReturnValue('valid-token');

    await useAuthStore.getState().checkAuth();

    const state = useAuthStore.getState();
    expect(state.user).toEqual(mockUser);
    expect(state.isAuthenticated).toBe(true);
  });

  it('should clear auth when token is invalid', async () => {
    (api.get as any).mockRejectedValue(new Error('Invalid token'));
    (localStorage.getItem as any).mockReturnValue('invalid-token');

    await useAuthStore.getState().checkAuth();

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(localStorage.removeItem).toHaveBeenCalledWith('token');
  });
});
