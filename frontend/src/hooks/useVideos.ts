import { useEffect, useState, useCallback } from 'react';
import api from '../utils/axios';

export interface VideoItem {
  id: number;
  title: string;
  description: string | null;
  video_url: string;
  thumbnail_url: string | null;
  duration_seconds: number | null;
  status: string;
  game_date: string | null;
  home_team: string | null;
  away_team: string | null;
  highlights_count: number;
}

interface UseVideosReturn {
  videos: VideoItem[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useVideos(): UseVideosReturn {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchVideos = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get('/videos?limit=20&offset=0');
      setVideos(response.data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch videos'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  return {
    videos,
    isLoading,
    error,
    refetch: fetchVideos,
  };
}
