import { useState, useEffect, useCallback } from 'react';
import api from '../utils/axios';

export interface TeamMember {
  id: number;
  name: string;
  jersey_number: number | null;
  position: string | null;
  role: string;
  avatar_url: string | null;
}

interface TeamMembersResponse {
  success: boolean;
  data: TeamMember[];
  error: string | null;
  meta: {
    count: number;
  };
}

export interface UseTeamMembersReturn {
  members: TeamMember[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export const useTeamMembers = (teamId: number): UseTeamMembersReturn => {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchMembers = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get<TeamMembersResponse>(`/teams/${teamId}/members`);

      if (response.data.success) {
        setMembers(response.data.data);
      } else {
        throw new Error(response.data.error || 'Failed to fetch members');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while fetching members';
      setError(new Error(errorMessage));
    } finally {
      setIsLoading(false);
    }
  }, [teamId]);

  useEffect(() => {
    if (teamId > 0) {
      fetchMembers();
    }
  }, [fetchMembers, teamId]);

  return { members, isLoading, error, refetch: fetchMembers };
};
