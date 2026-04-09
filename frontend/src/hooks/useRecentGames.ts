import { useEffect, useState } from 'react';
import api from '../utils/axios';

export interface Highlight {
  type: 'hr' | 'rbi' | string;
  player: string;
  count: number;
  description: string;
}

export interface Team {
  id: string;
  name: string;
  logo?: string;
  score: number;
}

export interface RecentGame {
  id: string;
  homeTeam: Team;
  awayTeam: Team;
  matchDate: string;
  venue: string;
  status: 'completed' | 'in_progress' | 'scheduled';
  highlights: Highlight[];
  lastUpdated: string;
}

export interface RecentGamesResponse {
  data: RecentGame[];
  meta: {
    total: number;
    lastUpdated: string;
  };
}

export interface UseRecentGamesReturn {
  games: RecentGame[];
  isLoading: boolean;
  error: Error | null;
  lastUpdated: Date | null;
  refetch: () => void;
}

const CACHE_KEY = 'recentGamesCache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface CacheData {
  games: RecentGame[];
  timestamp: number;
  lastUpdated: string;
}

const getCachedData = (): CacheData | null => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const parsed: CacheData = JSON.parse(cached);
    const now = Date.now();

    if (now - parsed.timestamp > CACHE_DURATION) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
};

const setCachedData = (games: RecentGame[], lastUpdated: string): void => {
  try {
    const cacheData: CacheData = {
      games,
      timestamp: Date.now(),
      lastUpdated,
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
  } catch {
    // Ignore cache errors
  }
};

export const useRecentGames = (limit: number = 3): UseRecentGamesReturn => {
  const [games, setGames] = useState<RecentGame[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchGames = async (skipCache: boolean = false) => {
    setIsLoading(true);
    setError(null);

    try {
      // Check cache first
      if (!skipCache) {
        const cached = getCachedData();
        if (cached) {
          setGames(cached.games);
          setLastUpdated(new Date(cached.lastUpdated));
          setIsLoading(false);
          return;
        }
      }

      const response = await api.get<RecentGamesResponse>(
        `/public/recent-games?limit=${limit}`
      );

      const gamesData = response.data.data || [];
      const lastUpdatedStr =
        response.data.meta?.lastUpdated || new Date().toISOString();

      setGames(gamesData);
      setLastUpdated(new Date(lastUpdatedStr));
      setCachedData(gamesData, lastUpdatedStr);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : '加载最近战报失败';
      setError(new Error(errorMessage));

      // Try to use cached data on error
      const cached = getCachedData();
      if (cached) {
        setGames(cached.games);
        setLastUpdated(new Date(cached.lastUpdated));
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGames();
  }, [limit]);

  const refetch = () => {
    fetchGames(true);
  };

  return {
    games,
    isLoading,
    error,
    lastUpdated,
    refetch,
  };
};

export default useRecentGames;
