import { useState, useEffect, useCallback } from 'react';
import api from '../utils/axios';

export interface LineupPlayer {
  batting_order: number;
  user_id: string;
  name: string;
  position: string;
  jersey_number: string;
}

export interface Tactics {
  general_notes: string | null;
  signals: Record<string, string>;
  defense_strategy: string | null;
}

export interface LineupData {
  game_id: number;
  lineup: LineupPlayer[];
  tactics: Tactics;
}

export interface UseLineupReturn {
  data: LineupData | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export const useLineup = (gameId: string | undefined): UseLineupReturn => {
  const [data, setData] = useState<LineupData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchLineup = useCallback(async () => {
    if (!gameId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get<{ success: boolean; data: LineupData }>(
        `/games/${gameId}/lineup`
      );

      if (response.data.success) {
        setData(response.data.data);
      } else {
        throw new Error('Failed to fetch lineup');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred while fetching lineup';
      setError(new Error(message));
    } finally {
      setIsLoading(false);
    }
  }, [gameId]);

  useEffect(() => {
    fetchLineup();
  }, [fetchLineup]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchLineup,
  };
};

export default useLineup;
