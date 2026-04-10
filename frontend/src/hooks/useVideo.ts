import { useEffect, useState, useCallback } from 'react';
import api from '../utils/axios';

export interface VideoHighlight {
  id: number;
  title: string;
  description: string | null;
  start_time: number;
  end_time: number;
}

export interface VideoDetail {
  id: number;
  title: string;
  description: string | null;
  video_url: string;
  thumbnail_url: string | null;
  duration_seconds: number | null;
  status: string;
  game_id: number | null;
  game_date: string | null;
  home_team: string | null;
  away_team: string | null;
  highlights: VideoHighlight[];
}

interface UseVideoReturn {
  video: VideoDetail | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useVideo(videoId: number): UseVideoReturn {
  const [video, setVideo] = useState<VideoDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchVideo = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get(`/videos/${videoId}`);
      setVideo(response.data.data || null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch video'));
    } finally {
      setIsLoading(false);
    }
  }, [videoId]);

  useEffect(() => {
    if (!Number.isNaN(videoId) && videoId > 0) {
      fetchVideo();
    }
  }, [fetchVideo, videoId]);

  return {
    video,
    isLoading,
    error,
    refetch: fetchVideo,
  };
}
