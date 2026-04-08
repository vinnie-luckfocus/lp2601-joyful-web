/**
 * Auth Store Tests
 * Tests Zustand auth store functionality
 * Coverage: PRD01 - Authentication state management
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockPost = vi.fn();
const mockGet = vi.fn();

vi.mock('../../utils/axios', () => ({
  default: {
    post: (...args: any[]) => mockPost(...args),
    get: (...args: any[]) => mockGet(...args),
  },
}));

import { useAuthStore } from '../../stores/auth';

describe('Auth Store', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
    vi.clearAllMocks();
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
    mockPost.mockResolvedValue({
      data: { token: 'test-token', user: mockUser },
    });

    await useAuthStore.getState().login('admin', 'password');

    const state = useAuthStore.getState();
    expect(state.user).toEqual(mockUser);
    expect(state.isAuthenticated).toBe(true);
    expect(state.isLoading).toBe(false);
  });

  it('should handle login error', async () => {
    mockPost.mockRejectedValue({
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
  });

  it('should check auth with valid token', async () => {
    const mockUser = { id: 1, username: 'admin', name: 'Admin', role: 'admin' };
    mockGet.mockResolvedValue({ data: mockUser });

    const localStorageMock = window.localStorage as any;
    localStorageMock.getItem.mockReturnValue('valid-token');

    await useAuthStore.getState().checkAuth();

    const state = useAuthStore.getState();
    expect(state.user).toEqual(mockUser);
    expect(state.isAuthenticated).toBe(true);
  });

  it('should clear auth when token is invalid', async () => {
    mockGet.mockRejectedValue(new Error('Invalid token'));

    const localStorageMock = window.localStorage as any;
    localStorageMock.getItem.mockReturnValue('invalid-token');

    await useAuthStore.getState().checkAuth();

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });
});
