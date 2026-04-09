import { useState, useEffect, useCallback } from 'react';

export type LeaderCategory = 'batting_average' | 'hits' | 'home_runs' | 'rbis';

export interface Leader {
  user_id: number;
  player_name: string;
  jersey_number: number | null;
  team_name: string | null;
  value: number;
  category: string;
}

export interface LeadersResponse {
  success: boolean;
  data: Leader[];
  meta: {
    count: number;
    category: string;
    limit: number;
  };
}

export interface UseLeadersState {
  leaders: Leader[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const useLeaders = (category: LeaderCategory, limit: number = 10): UseLeadersState => {
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [refreshKey, setRefreshKey] = useState<number>(0);

  const refetch = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchLeaders = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `${API_BASE_URL}/public/leaders?category=${category}&limit=${limit}`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result: LeadersResponse = await response.json();

        if (!result.success) {
          throw new Error('API returned unsuccessful response');
        }

        if (isMounted) {
          setLeaders(result.data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Unknown error occurred'));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchLeaders();

    return () => {
      isMounted = false;
    };
  }, [category, limit, refreshKey]);

  return {
    leaders,
    isLoading,
    error,
    refetch,
  };
};

export default useLeaders;
