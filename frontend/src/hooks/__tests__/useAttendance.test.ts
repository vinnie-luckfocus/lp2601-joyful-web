import { renderHook, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useAttendance } from '../useAttendance';
import api from '../../utils/axios';

// Mock axios
vi.mock('../../utils/axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

// Mock auth store
vi.mock('../../stores/auth', () => ({
  useAuthStore: () => ({
    user: { id: 1, name: '张三', username: 'zhangsan' },
  }),
}));

describe('useAttendance', () => {
  const mockAttendanceResponse = {
    success: true,
    data: {
      confirmed: [
        { id: '1', username: 'zhangsan', name: '张三' },
        { id: '2', username: 'lisi', name: '李四' },
      ],
      declined: [{ id: '3', username: 'wangwu', name: '王五' }],
      pending: [{ id: '4', username: 'zhaoliu', name: '赵六' }],
    },
  };

  const mockUpdateResponse = {
    success: true,
    data: { gameId: 1, status: 'confirmed' as const },
  };

  let localStorageStore: Record<string, string> = {};

  beforeEach(() => {
    vi.clearAllMocks();
    localStorageStore = { token: 'mock-token' };

    (localStorage.getItem as ReturnType<typeof vi.fn>).mockImplementation((key: string) => {
      return localStorageStore[key] || null;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should fetch attendance successfully', async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: mockAttendanceResponse });

    const { result } = renderHook(() => useAttendance(1));

    expect(result.current.isLoading).toBe(true);
    expect(result.current.attendance).toBeNull();
    expect(result.current.error).toBeNull();

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.attendance).not.toBeNull();
    expect(result.current.attendance?.gameId).toBe(1);
    expect(result.current.attendance?.status).toBe('confirmed');
    expect(result.current.attendance?.confirmedCount).toBe(2);
    expect(result.current.attendance?.confirmed).toHaveLength(2);
    expect(result.current.attendance?.declined).toHaveLength(1);
    expect(result.current.attendance?.pending).toHaveLength(1);
    expect(api.get).toHaveBeenCalledWith('/games/1/attendance');
  });

  it('should set status to null when user is not in confirmed or declined', async () => {
    const responseWithOtherUser = {
      success: true,
      data: {
        confirmed: [{ id: '2', username: 'lisi', name: '李四' }],
        declined: [{ id: '3', username: 'wangwu', name: '王五' }],
        pending: [{ id: '1', username: 'zhangsan', name: '张三' }],
      },
    };

    vi.mocked(api.get).mockResolvedValueOnce({ data: responseWithOtherUser });

    const { result } = renderHook(() => useAttendance(1));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.attendance?.status).toBeNull();
    expect(result.current.attendance?.confirmedCount).toBe(1);
  });

  it('should handle missing token', async () => {
    localStorageStore = {};

    const { result } = renderHook(() => useAttendance(1));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.attendance).toBeNull();
    expect(api.get).not.toHaveBeenCalled();
  });

  it('should handle API errors on fetch', async () => {
    const errorMessage = 'Network error';
    vi.mocked(api.get).mockRejectedValueOnce(new Error(errorMessage));

    const { result } = renderHook(() => useAttendance(1));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe(errorMessage);
    expect(result.current.attendance).toBeNull();
  });

  it('should perform optimistic update on successful mutation', async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: mockAttendanceResponse });
    vi.mocked(api.post).mockResolvedValueOnce({ data: mockUpdateResponse });

    const { result } = renderHook(() => useAttendance(1));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.attendance?.status).toBe('confirmed');
    expect(result.current.attendance?.confirmedCount).toBe(2);

    // Change from confirmed to declined
    result.current.updateAttendance('declined');

    // Optimistic update should be immediate (before await)
    await waitFor(() => {
      expect(result.current.attendance?.status).toBe('declined');
    });

    // confirmedCount should have decremented optimistically
    expect(result.current.attendance?.confirmedCount).toBe(1);

    // Wait for API call to complete and refetch
    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/games/1/attend', { status: 'declined' });
    });
  });

  it('should rollback on mutation error', async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: mockAttendanceResponse });
    vi.mocked(api.post).mockRejectedValueOnce(new Error('Update failed'));

    const { result } = renderHook(() => useAttendance(1));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const originalStatus = result.current.attendance?.status;
    const originalCount = result.current.attendance?.confirmedCount;

    expect(originalStatus).toBe('confirmed');
    expect(originalCount).toBe(2);

    await expect(result.current.updateAttendance('declined')).rejects.toThrow('Update failed');

    await waitFor(() => {
      expect(result.current.attendance?.status).toBe('confirmed');
    });

    // Should rollback to original state
    expect(result.current.attendance?.confirmedCount).toBe(2);
  });

  it('should handle optimistic update when starting from null attendance', async () => {
    localStorageStore = { token: 'mock-token' };

    vi.mocked(api.get).mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          confirmed: [],
          declined: [],
          pending: [{ id: '1', username: 'zhangsan', name: '张三' }],
        },
      },
    });
    vi.mocked(api.post).mockResolvedValueOnce({
      data: { success: true, data: { gameId: 1, status: 'confirmed' as const } },
    });

    const { result } = renderHook(() => useAttendance(1));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.attendance?.status).toBeNull();
    expect(result.current.attendance?.confirmedCount).toBe(0);

    result.current.updateAttendance('confirmed');

    await waitFor(() => {
      expect(result.current.attendance?.status).toBe('confirmed');
    });

    expect(result.current.attendance?.confirmedCount).toBe(1);
  });

  it('should handle mutation when not authenticated', async () => {
    localStorageStore = {};

    const { result } = renderHook(() => useAttendance(1));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.updateAttendance('confirmed');
    });

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe('Not authenticated');
    expect(api.post).not.toHaveBeenCalled();
  });

  it('should not change count when switching to same status', async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: mockAttendanceResponse });
    vi.mocked(api.post).mockResolvedValueOnce({ data: mockUpdateResponse });

    const { result } = renderHook(() => useAttendance(1));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    result.current.updateAttendance('confirmed');

    await waitFor(() => {
      expect(result.current.attendance?.status).toBe('confirmed');
    });

    // Count should stay the same since status didn't change
    expect(result.current.attendance?.confirmedCount).toBe(2);
  });
});
