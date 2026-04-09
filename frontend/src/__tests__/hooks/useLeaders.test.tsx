import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useLeaders, type LeaderCategory } from '../../hooks/useLeaders';

describe('useLeaders', () => {
  const mockLeaders = [
    {
      user_id: 1,
      player_name: 'Player One',
      jersey_number: 10,
      team_name: 'Team A',
      value: 0.333,
      category: 'batting_average',
    },
    {
      user_id: 2,
      player_name: 'Player Two',
      jersey_number: 20,
      team_name: 'Team B',
      value: 0.300,
      category: 'batting_average',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should fetch leaders on mount', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: mockLeaders,
        meta: { count: 2, category: 'batting_average', limit: 10 },
      }),
    });

    const { result } = renderHook(() => useLeaders('batting_average'));

    expect(result.current.isLoading).toBe(true);
    expect(result.current.leaders).toEqual([]);
    expect(result.current.error).toBeNull();

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.leaders).toEqual(mockLeaders);
    expect(result.current.error).toBeNull();
  });

  it('should fetch with correct category', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: mockLeaders,
        meta: { count: 2, category: 'home_runs', limit: 10 },
      }),
    });

    renderHook(() => useLeaders('home_runs'));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('category=home_runs')
      );
    });
  });

  it('should fetch with correct limit', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: mockLeaders,
        meta: { count: 2, category: 'batting_average', limit: 5 },
      }),
    });

    renderHook(() => useLeaders('batting_average', 5));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('limit=5')
      );
    });
  });

  it('should handle fetch error', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error('Network error')
    );

    const { result } = renderHook(() => useLeaders('batting_average'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe('Network error');
    expect(result.current.leaders).toEqual([]);
  });

  it('should handle HTTP error response', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    const { result } = renderHook(() => useLeaders('batting_average'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toContain('500');
  });

  it('should handle unsuccessful API response', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: false,
        data: [],
        meta: {},
      }),
    });

    const { result } = renderHook(() => useLeaders('batting_average'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe('API returned unsuccessful response');
  });

  it('should refetch when refetch is called', async () => {
    (global.fetch as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: mockLeaders,
          meta: { count: 2, category: 'batting_average', limit: 10 },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: [...mockLeaders, { ...mockLeaders[0], user_id: 3 }],
          meta: { count: 3, category: 'batting_average', limit: 10 },
        }),
      });

    const { result } = renderHook(() => useLeaders('batting_average'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.leaders).toHaveLength(2);

    act(() => {
      result.current.refetch();
    });

    await waitFor(() => {
      expect(result.current.leaders).toHaveLength(3);
    });

    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it('should refetch when category changes', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: mockLeaders,
        meta: { count: 2, category: 'batting_average', limit: 10 },
      }),
    });

    const { result, rerender } = renderHook(
      ({ category }: { category: LeaderCategory }) => useLeaders(category),
      { initialProps: { category: 'batting_average' } }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(global.fetch).toHaveBeenCalledTimes(1);

    rerender({ category: 'home_runs' });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });
  });

  it('should handle all category types', async () => {
    const categories: LeaderCategory[] = ['batting_average', 'hits', 'home_runs', 'rbis'];

    for (const category of categories) {
      vi.clearAllMocks();
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: mockLeaders,
          meta: { count: 2, category, limit: 10 },
        }),
      });

      const { result } = renderHook(() => useLeaders(category));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining(`category=${category}`)
      );
    }
  });
});
