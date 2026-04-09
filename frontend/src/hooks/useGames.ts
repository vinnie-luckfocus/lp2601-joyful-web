import { useState, useEffect, useCallback } from 'react';
import api from '../utils/axios';
import type { Game, PublicGamesResponse } from './usePublicGames';

export interface UseGamesReturn {
  games: Game[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export const useGames = (): UseGamesReturn => {
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchGames = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get<PublicGamesResponse>('/public/games');

      if (response.data.success) {
        setGames(response.data.data);
      } else {
        throw new Error('Failed to fetch games');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while fetching games';
      setError(new Error(errorMessage));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGames();
  }, [fetchGames]);

  return {
    games,
    isLoading,
    error,
    refetch: fetchGames,
  };
};

export default useGames;
