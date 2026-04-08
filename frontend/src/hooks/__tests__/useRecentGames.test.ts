import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useRecentGames, type RecentGamesResponse } from '../useRecentGames';
import api from '../../utils/axios';

// Mock axios
vi.mock('../../utils/axios', () => ({
  default: {
    get: vi.fn(),
  },
}));

describe('useRecentGames', () => {
  const mockGamesResponse: RecentGamesResponse = {
    data: [
      {
        id: 'game-1',
        homeTeam: { id: 'team-1', name: '红袜队', score: 5 },
        awayTeam: { id: 'team-2', name: '洋基队', score: 3 },
        matchDate: '2024-04-08T14:00:00Z',
        venue: '芬威球场',
        status: 'completed',
        highlights: [
          { type: 'hr', player: '张三', count: 2, description: '本垒打 x2' },
        ],
        lastUpdated: '2024-04-08T16:00:00Z',
      },
      {
        id: 'game-2',
        homeTeam: { id: 'team-3', name: '道奇队', score: 7 },
        awayTeam: { id: 'team-4', name: '巨人队', score: 2 },
        matchDate: '2024-04-07T20:00:00Z',
        venue: '道奇体育场',
        status: 'completed',
        highlights: [
          { type: 'rbi', player: '李四', count: 4, description: '打点 x4' },
        ],
        lastUpdated: '2024-04-07T22:00:00Z',
      },
    ],
    meta: {
      total: 2,
      lastUpdated: '2024-04-08T16:00:00Z',
    },
  };

  // Local storage mock store
  let localStorageStore: Record<string, string> = {};

  beforeEach(() => {
    vi.clearAllMocks();
    localStorageStore = {};

    // Mock localStorage with working implementation
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation((key: string) => {
      return localStorageStore[key] || null;
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation((key: string, value: string) => {
      localStorageStore[key] = value;
    });
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation((key: string) => {
      delete localStorageStore[key];
    });
    vi.spyOn(Storage.prototype, 'clear').mockImplementation(() => {
      localStorageStore = {};
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should fetch games successfully', async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: mockGamesResponse });

    const { result } = renderHook(() => useRecentGames(3));

    // Initial state
    expect(result.current.isLoading).toBe(true);
    expect(result.current.games).toEqual([]);
    expect(result.current.error).toBeNull();

    // Wait for data to load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.games).toHaveLength(2);
    expect(result.current.games[0].id).toBe('game-1');
    expect(result.current.error).toBeNull();
    expect(result.current.lastUpdated).toBeInstanceOf(Date);
  });

  it('should use cached data when available and not expired', async () => {
    // Set up cache using the mocked setItem
    const cachedData = {
      games: mockGamesResponse.data,
      timestamp: Date.now(),
      lastUpdated: '2024-04-08T16:00:00Z',
    };
    localStorageStore['recentGamesCache'] = JSON.stringify(cachedData);

    const { result } = renderHook(() => useRecentGames(3));

    // Should use cached data immediately
    await waitFor(() => {
      expect(result.current.games).toHaveLength(2);
    });

    // API should not be called
    expect(api.get).not.toHaveBeenCalled();
    expect(result.current.isLoading).toBe(false);
  });

  it('should fetch from API when cache is expired', async () => {
    // Set up expired cache
    const expiredCache = {
      games: mockGamesResponse.data,
      timestamp: Date.now() - 6 * 60 * 1000, // 6 minutes ago
      lastUpdated: '2024-04-08T16:00:00Z',
    };
    localStorageStore['recentGamesCache'] = JSON.stringify(expiredCache);

    vi.mocked(api.get).mockResolvedValueOnce({ data: mockGamesResponse });

    const { result } = renderHook(() => useRecentGames(3));

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/public/recent-games?limit=3');
    });

    expect(result.current.games).toHaveLength(2);
  });

  it('should handle API errors', async () => {
    const errorMessage = 'Network error';
    vi.mocked(api.get).mockRejectedValueOnce(new Error(errorMessage));

    const { result } = renderHook(() => useRecentGames(3));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe(errorMessage);
    expect(result.current.games).toEqual([]);
  });

  it('should use cached data on error if available', async () => {
    // Set up valid cache
    const cachedData = {
      games: mockGamesResponse.data,
      timestamp: Date.now(),
      lastUpdated: '2024-04-08T16:00:00Z',
    };
    localStorageStore['recentGamesCache'] = JSON.stringify(cachedData);

    vi.mocked(api.get).mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useRecentGames(3));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Should still have cached data despite error
    expect(result.current.games).toHaveLength(2);
    expect(result.current.error).toBeInstanceOf(Error);
  });

  it('should refetch when refetch is called', async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: mockGamesResponse });

    const { result } = renderHook(() => useRecentGames(3));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Reset mock for refetch
    vi.mocked(api.get).mockResolvedValueOnce({
      data: {
        ...mockGamesResponse,
        data: [
          ...mockGamesResponse.data,
          {
            id: 'game-3',
            homeTeam: { id: 'team-5', name: '小熊队', score: 4 },
            awayTeam: { id: 'team-6', name: '红雀队', score: 3 },
            matchDate: '2024-04-06T18:00:00Z',
            venue: '瑞格利球场',
            status: 'completed',
            highlights: [],
            lastUpdated: '2024-04-06T20:00:00Z',
          },
        ],
      },
    });

    // Call refetch
    result.current.refetch();

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledTimes(2);
    });

    expect(result.current.games).toHaveLength(3);
  });

  it('should respect limit parameter', async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: mockGamesResponse });

    renderHook(() => useRecentGames(5));

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/public/recent-games?limit=5');
    });
  });

  it('should handle empty response', async () => {
    vi.mocked(api.get).mockResolvedValueOnce({
      data: {
        data: [],
        meta: {
          total: 0,
          lastUpdated: '2024-04-08T16:00:00Z',
        },
      },
    });

    const { result } = renderHook(() => useRecentGames(3));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.games).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('should handle malformed API response gracefully', async () => {
    vi.mocked(api.get).mockResolvedValueOnce({
      data: {
        meta: {
          total: 0,
          lastUpdated: '2024-04-08T16:00:00Z',
        },
      },
    });

    const { result } = renderHook(() => useRecentGames(3));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.games).toEqual([]);
  });
});
