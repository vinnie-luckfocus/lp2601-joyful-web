import { useState, useEffect, useCallback } from 'react';
import api from '../utils/axios';

export type AttendanceStatus = 'confirmed' | 'declined' | null;

export interface Attendance {
  gameId: number;
  status: AttendanceStatus;
  confirmedCount: number;
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

  const fetchAttendance = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get<{ success: boolean; data?: { status: AttendanceStatus; confirmedCount: number } }>(
        `/games/${gameId}/attendance`
      );

      if (response.data.success && response.data.data) {
        setAttendance({
          gameId,
          status: response.data.data.status,
          confirmedCount: response.data.data.confirmedCount,
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
  }, [gameId]);

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
        const response = await api.post<{ success: boolean; data?: { status: AttendanceStatus; confirmedCount: number } }>(
          `/games/${gameId}/attend`,
          { status }
        );

        if (response.data.success && response.data.data) {
          setAttendance({
            gameId,
            status: response.data.data.status,
            confirmedCount: response.data.data.confirmedCount,
          });
        } else {
          throw new Error('Failed to update attendance');
        }
      } catch (err) {
        // Revert on error
        if (previousAttendance !== undefined) {
          setAttendance(previousAttendance);
        }
        const errorMessage = err instanceof Error ? err.message : 'An error occurred while updating attendance';
        setError(new Error(errorMessage));
        throw err;
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
