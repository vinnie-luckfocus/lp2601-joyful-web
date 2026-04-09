import { useState, useEffect, useCallback } from 'react';
import api from '../utils/axios';

export interface PlayerStatsData {
  user: {
    name: string;
    team: string | null;
    jersey_number: number | null;
    position: string | null;
  };
  cumulative: {
    games: number;
    at_bats: number;
    hits: number;
    batting_avg: number;
    singles: number;
    doubles: number;
    triples: number;
    hr: number;
    rbi: number;
    runs: number;
    walks: number;
    strikeouts: number;
  };
  recent_5_games: { game_id: number; batting_avg: number }[];
  milestones: {
    hits_to_100: number | null;
  };
}

export interface UseStatsReturn {
  stats: PlayerStatsData | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export const useStats = (): UseStatsReturn => {
  const [stats, setStats] = useState<PlayerStatsData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get<{ success: boolean; data: PlayerStatsData }>('/stats/me');

      if (response.data.success) {
        setStats(response.data.data);
      } else {
        throw new Error('Failed to fetch stats');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred while fetching stats';
      setError(new Error(message));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    isLoading,
    error,
    refetch: fetchStats,
  };
};

export default useStats;
