import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { usePublicGames } from '../../hooks/usePublicGames';
import api from '../../utils/axios';

vi.mock('../../utils/axios', () => ({
  default: {
    get: vi.fn(),
  },
}));

describe('usePublicGames', () => {
  const mockGames = [
    {
      id: 1,
      scheduled_at: '2024-01-15T14:00:00Z',
      location: ' Yankee Stadium',
      home_team_id: 1,
      away_team_id: 2,
      home_team_name: 'Yankees',
      away_team_name: 'Red Sox',
      home_score: null,
      away_score: null,
      status: 'scheduled',
    },
    {
      id: 2,
      scheduled_at: '2024-01-16T19:00:00Z',
      location: 'Fenway Park',
      home_team_id: 2,
      away_team_id: 1,
      home_team_name: 'Red Sox',
      away_team_name: 'Yankees',
      home_score: 5,
      away_score: 3,
      status: 'completed',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch games successfully', async () => {
    vi.mocked(api.get).mockResolvedValueOnce({
      data: {
        success: true,
        data: mockGames,
        meta: { count: 2, limit: 4 },
      },
    });

    const { result } = renderHook(() => usePublicGames(4));

    expect(result.current.isLoading).toBe(true);
    expect(result.current.games).toEqual([]);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.games).toEqual(mockGames);
    expect(result.current.error).toBeNull();
    expect(result.current.lastUpdated).toBeInstanceOf(Date);
    expect(api.get).toHaveBeenCalledWith('/public/games?limit=4');
  });

  it('should use default limit of 4', async () => {
    vi.mocked(api.get).mockResolvedValueOnce({
      data: {
        success: true,
        data: mockGames,
        meta: { count: 2, limit: 4 },
      },
    });

    const { result } = renderHook(() => usePublicGames());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(api.get).toHaveBeenCalledWith('/public/games?limit=4');
  });

  it('should handle custom limit', async () => {
    vi.mocked(api.get).mockResolvedValueOnce({
      data: {
        success: true,
        data: mockGames,
        meta: { count: 2, limit: 2 },
      },
    });

    const { result } = renderHook(() => usePublicGames(2));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(api.get).toHaveBeenCalledWith('/public/games?limit=2');
  });

  it('should handle API error', async () => {
    const errorMessage = 'Network error';
    vi.mocked(api.get).mockRejectedValueOnce(new Error(errorMessage));

    const { result } = renderHook(() => usePublicGames(4));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.games).toEqual([]);
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe(errorMessage);
    expect(result.current.lastUpdated).toBeNull();
  });

  it('should handle non-success response', async () => {
    vi.mocked(api.get).mockResolvedValueOnce({
      data: {
        success: false,
        data: [],
        meta: { count: 0, limit: 4 },
      },
    });

    const { result } = renderHook(() => usePublicGames(4));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe('Failed to fetch games');
  });

  it('should refetch games when refetch is called', async () => {
    vi.mocked(api.get)
      .mockResolvedValueOnce({
        data: {
          success: true,
          data: mockGames,
          meta: { count: 2, limit: 4 },
        },
      })
      .mockResolvedValueOnce({
        data: {
          success: true,
          data: [...mockGames, { ...mockGames[0], id: 3 }],
          meta: { count: 3, limit: 4 },
        },
      });

    const { result } = renderHook(() => usePublicGames(4));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.games).toHaveLength(2);

    await result.current.refetch();

    await waitFor(() => {
      expect(result.current.games).toHaveLength(3);
    });

    expect(api.get).toHaveBeenCalledTimes(2);
  });

  it('should handle error with non-Error object', async () => {
    vi.mocked(api.get).mockRejectedValueOnce('String error');

    const { result } = renderHook(() => usePublicGames(4));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe('An error occurred while fetching games');
  });
});
