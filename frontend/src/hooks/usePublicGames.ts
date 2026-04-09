import { useState, useEffect, useCallback } from 'react';
import api from '../utils/axios';

export interface Game {
  id: number;
  scheduled_at: string;
  location: string;
  home_team_id: number;
  away_team_id: number;
  home_team_name: string;
  away_team_name: string;
  home_score: number | null;
  away_score: number | null;
  status: string;
}

export interface PublicGamesResponse {
  success: boolean;
  data: Game[];
  meta: {
    count: number;
    limit: number;
  };
}

export interface UsePublicGamesReturn {
  games: Game[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  lastUpdated: Date | null;
}

export const usePublicGames = (limit: number = 4): UsePublicGamesReturn => {
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchGames = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get<PublicGamesResponse>(`/public/games?limit=${limit}`);

      if (response.data.success) {
        setGames(response.data.data);
        setLastUpdated(new Date());
      } else {
        throw new Error('Failed to fetch games');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while fetching games';
      setError(new Error(errorMessage));
    } finally {
      setIsLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchGames();
  }, [fetchGames]);

  return {
    games,
    isLoading,
    error,
    refetch: fetchGames,
    lastUpdated,
  };
};

export default usePublicGames;
