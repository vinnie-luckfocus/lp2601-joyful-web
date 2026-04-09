import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useGames } from '../useGames';
import api from '../../utils/axios';

// Mock axios
vi.mock('../../utils/axios', () => ({
  default: {
    get: vi.fn(),
  },
}));

describe('useGames', () => {
  const mockGamesResponse = {
    success: true,
    data: [
      {
        id: 1,
        scheduled_at: '2024-05-10T14:00:00Z',
        location: '芬威球场',
        home_team_id: 1,
        away_team_id: 2,
        home_team_name: '红袜队',
        away_team_name: '洋基队',
        home_score: null,
        away_score: null,
        status: 'scheduled',
      },
      {
        id: 2,
        scheduled_at: '2024-05-15T19:00:00Z',
        location: '道奇体育场',
        home_team_id: 3,
        away_team_id: 4,
        home_team_name: '道奇队',
        away_team_name: '巨人队',
        home_score: 5,
        away_score: 3,
        status: 'completed',
      },
    ],
    meta: {
      count: 2,
      limit: 20,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should fetch games successfully', async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: mockGamesResponse });

    const { result } = renderHook(() => useGames());

    // Initial state
    expect(result.current.isLoading).toBe(true);
    expect(result.current.games).toEqual([]);
    expect(result.current.error).toBeNull();

    // Wait for data to load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.games).toHaveLength(2);
    expect(result.current.games[0].id).toBe(1);
    expect(result.current.games[1].home_team_name).toBe('道奇队');
    expect(result.current.error).toBeNull();
    expect(api.get).toHaveBeenCalledWith('/public/games');
  });

  it('should handle loading state', async () => {
    vi.mocked(api.get).mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve({ data: mockGamesResponse }), 100);
        })
    );

    const { result } = renderHook(() => useGames());

    expect(result.current.isLoading).toBe(true);
    expect(result.current.games).toEqual([]);
    expect(result.current.error).toBeNull();

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.games).toHaveLength(2);
  });

  it('should handle API errors', async () => {
    const errorMessage = 'Network error';
    vi.mocked(api.get).mockRejectedValueOnce(new Error(errorMessage));

    const { result } = renderHook(() => useGames());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe(errorMessage);
    expect(result.current.games).toEqual([]);
  });

  it('should handle non-success API response', async () => {
    vi.mocked(api.get).mockResolvedValueOnce({
      data: {
        success: false,
        data: [],
        meta: { count: 0, limit: 20 },
      },
    });

    const { result } = renderHook(() => useGames());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe('Failed to fetch games');
    expect(result.current.games).toEqual([]);
  });

  it('should refetch when refetch is called', async () => {
    const updatedResponse = {
      success: true,
      data: [
        ...mockGamesResponse.data,
        {
          id: 3,
          scheduled_at: '2024-05-20T18:00:00Z',
          location: '瑞格利球场',
          home_team_id: 5,
          away_team_id: 6,
          home_team_name: '小熊队',
          away_team_name: '红雀队',
          home_score: null,
          away_score: null,
          status: 'scheduled',
        },
      ],
      meta: { count: 3, limit: 20 },
    };

    vi.mocked(api.get)
      .mockResolvedValueOnce({ data: mockGamesResponse })
      .mockResolvedValueOnce({ data: updatedResponse });

    const { result } = renderHook(() => useGames());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.games).toHaveLength(2);

    result.current.refetch();

    await waitFor(() => {
      expect(result.current.games).toHaveLength(3);
    });

    expect(api.get).toHaveBeenCalledTimes(2);
  });

  it('should handle empty response', async () => {
    vi.mocked(api.get).mockResolvedValueOnce({
      data: {
        success: true,
        data: [],
        meta: { count: 0, limit: 20 },
      },
    });

    const { result } = renderHook(() => useGames());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.games).toEqual([]);
    expect(result.current.error).toBeNull();
  });
});
