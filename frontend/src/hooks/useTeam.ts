import { useState, useEffect, useCallback } from 'react';
import api from '../utils/axios';

export interface TeamRecord {
  wins: number;
  losses: number;
  win_rate: number;
}

export interface Team {
  id: number;
  name: string;
  logo_url: string | null;
  description: string | null;
  division: string | null;
  captain_id: number | null;
  captain_name: string | null;
  captain_avatar_url: string | null;
  record: TeamRecord;
}

interface TeamResponse {
  success: boolean;
  data: Team;
  error: string | null;
}

export interface UseTeamReturn {
  team: Team | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export const useTeam = (teamId: number): UseTeamReturn => {
  const [team, setTeam] = useState<Team | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTeam = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get<TeamResponse>(`/teams/${teamId}`);

      if (response.data.success) {
        setTeam(response.data.data);
      } else {
        throw new Error(response.data.error || 'Failed to fetch team');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while fetching team';
      setError(new Error(errorMessage));
    } finally {
      setIsLoading(false);
    }
  }, [teamId]);

  useEffect(() => {
    if (teamId > 0) {
      fetchTeam();
    }
  }, [fetchTeam, teamId]);

  return { team, isLoading, error, refetch: fetchTeam };
};
