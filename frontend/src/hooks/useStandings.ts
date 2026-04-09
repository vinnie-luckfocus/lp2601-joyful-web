import { useState, useEffect, useCallback } from 'react';
import api from '../utils/axios';

export interface Standing {
  id: number;
  name: string;
  division: string | null;
  wins: number;
  losses: number;
  win_percentage: number;
}

export interface StandingsResponse {
  success: boolean;
  data: Standing[];
  meta: {
    count: number;
  };
}

export interface UseStandingsReturn {
  standings: Standing[];
  isLoading: boolean;
  error: Error | null;
  lastUpdated: Date | null;
  refetch: () => Promise<void>;
}

export function useStandings(): UseStandingsReturn {
  const [standings, setStandings] = useState<Standing[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchStandings = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get<StandingsResponse>('/public/standings');

      if (response.data.success) {
        // Add rank to each standing based on array position (already sorted by API)
        const standingsWithRank = response.data.data.map((standing, index) => ({
          ...standing,
          rank: index + 1,
        }));
        setStandings(standingsWithRank);
        setLastUpdated(new Date());
      } else {
        throw new Error('Failed to fetch standings');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(new Error(errorMessage));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStandings();
  }, [fetchStandings]);

  return {
    standings,
    isLoading,
    error,
    lastUpdated,
    refetch: fetchStandings,
  };
}

export default useStandings;
