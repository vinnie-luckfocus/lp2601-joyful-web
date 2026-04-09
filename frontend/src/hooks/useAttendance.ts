import { useState, useEffect, useCallback } from 'react';
import api from '../utils/axios';
import { useAuthStore } from '../stores/auth';

export type AttendanceStatus = 'confirmed' | 'declined' | null;

export interface AttendeeUser {
  id: string;
  username: string;
  name: string;
}

export interface Attendance {
  gameId: number;
  status: AttendanceStatus;
  confirmedCount: number;
  confirmed?: AttendeeUser[];
  declined?: AttendeeUser[];
  pending?: AttendeeUser[];
}

export interface UseAttendanceReturn {
  attendance: Attendance | null;
  isLoading: boolean;
  error: Error | null;
  updateAttendance: (status: 'confirmed' | 'declined') => Promise<void>;
  refetch: () => Promise<void>;
}

export const useAttendance = (gameId: number): UseAttendanceReturn => {
  const [attendance, setAttendance] = useState<Attendance | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuthStore();

  const fetchAttendance = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get<{
        success: boolean;
        data?: {
          confirmed: AttendeeUser[];
          declined: AttendeeUser[];
          pending: AttendeeUser[];
        };
      }>(`/games/${gameId}/attendance`);

      if (response.data.success && response.data.data) {
        const { confirmed, declined, pending } = response.data.data;
        const confirmedCount = confirmed.length;
        const myUserId = user?.id?.toString();
        const status = confirmed.some((u) => u.id === myUserId)
          ? 'confirmed'
          : declined.some((u) => u.id === myUserId)
          ? 'declined'
          : null;

        setAttendance({
          gameId,
          status,
          confirmedCount,
          confirmed,
          declined,
          pending,
        });
      } else {
        throw new Error('Failed to fetch attendance');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while fetching attendance';
      setError(new Error(errorMessage));
    } finally {
      setIsLoading(false);
    }
  }, [gameId, user?.id]);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  const updateAttendance = useCallback(
    async (status: 'confirmed' | 'declined') => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError(new Error('Not authenticated'));
        return;
      }

      const previousAttendance = attendance;

      // Optimistic update
      setAttendance((prev) => {
        if (!prev) {
          return {
            gameId,
            status,
            confirmedCount: status === 'confirmed' ? 1 : 0,
          };
        }

        const confirmedDelta =
          status === 'confirmed' && prev.status !== 'confirmed'
            ? 1
            : status !== 'confirmed' && prev.status === 'confirmed'
            ? -1
            : 0;

        return {
          ...prev,
          status,
          confirmedCount: Math.max(0, prev.confirmedCount + confirmedDelta),
        };
      });

      try {
        const response = await api.post<{
          success: boolean;
          data?: { gameId: number; status: AttendanceStatus };
        }>(`/games/${gameId}/attend`, { status });

        if (response.data.success && response.data.data) {
          // Keep optimistic state; refetch to sync lists
          await fetchAttendance();
        } else {
          throw new Error('Failed to update attendance');
        }
      } catch (err) {
        // Revert on error
        if (previousAttendance !== undefined) {
          setAttendance(previousAttendance);
        }
        const axiosError = err as { response?: { data?: { error?: string } } };
        const message = axiosError.response?.data?.error || (err instanceof Error ? err.message : 'An error occurred while updating attendance');
        throw new Error(message);
      }
    },
    [gameId, attendance]
  );

  return {
    attendance,
    isLoading,
    error,
    updateAttendance,
    refetch: fetchAttendance,
  };
};

export default useAttendance;
